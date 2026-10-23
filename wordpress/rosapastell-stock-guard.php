<?php
/**
 * Plugin Name: Rosa Pastell — Checkout con inventario reservado
 * Description: Endpoints privados WooCommerce para reservar, confirmar y liberar inventario.
 * Version: 0.1.1
 * Requires PHP: 8.4
 *
 * Instalar como MU-plugin en el backend modernizado ANTES del frontend compatible.
 * No hay fallback a crear pedidos sin reserva. No ejecuta cobros ni reembolsos.
 */
defined('ABSPATH') || exit;

final class RP_Stock_Guard {
    public const MAX_CART_LINES = 200;
    private static $locks = [];
    private static $status_locks = [];
    public static $internal = false;

    public static function lock($key) {
        global $wpdb;
        $name = 'rp-stock-' . sha1(DB_NAME . ':' . get_current_blog_id() . ':' . $key);
        if (isset(self::$locks[$name])) { self::$locks[$name]++; return $name; }
        if ('1' !== (string) $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 8)', $name))) {
            throw new RuntimeException('No se pudo asegurar el inventario. Intenta nuevamente.');
        }
        self::$locks[$name] = 1;
        return $name;
    }

    public static function unlock($name) {
        global $wpdb;
        if (!isset(self::$locks[$name])) return;
        if (--self::$locks[$name] > 0) return;
        unset(self::$locks[$name]);
        $wpdb->get_var($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $name));
    }

    public static function products($items) {
        if (!is_array($items) || !$items) throw new InvalidArgumentException('Carrito vacío o inválido.');
        if (count($items) > self::MAX_CART_LINES) throw new InvalidArgumentException('El pedido admite hasta 200 combinaciones de producto, talla y color.');
        $products = []; $required = [];
        foreach ($items as $item) {
            $parent = (int) ($item['product_id'] ?? 0);
            $variation = (int) ($item['variation_id'] ?? 0);
            $quantity = $item['quantity'] ?? 0;
            if (!is_int($quantity) || $quantity < 1 || $quantity > 99 || $parent < 1 || $variation < 0) throw new InvalidArgumentException('Cantidad o producto inválido.');
            $product = wc_get_product($variation ?: $parent);
            if (!$product || ($variation && (!$product->is_type('variation') || $product->get_parent_id() !== $parent)) || (!$variation && $product->is_type(['variable','variation']))) {
                throw new InvalidArgumentException('La variación no pertenece al producto indicado.');
            }
            if ('publish' !== $product->get_status() || !$product->is_in_stock()) throw new WC_Data_Exception('rp_insufficient_stock', 'El producto ya no está disponible.', 409);
            $products[$product->get_id()] = $product;
            if ($product->managing_stock() && !$product->backorders_allowed()) {
                $id = $product->get_stock_managed_by_id();
                $required[$id] = ($required[$id] ?? 0) + $quantity;
            }
        }
        ksort($required, SORT_NUMERIC);
        return [$products, $required];
    }

    public static function stock($id) {
        global $wpdb;
        $value = $wpdb->get_var(WC_Data_Store::load('product')->get_query_for_stock($id));
        if ($wpdb->last_error || !is_numeric($value)) throw new RuntimeException('No se pudo leer el inventario.');
        return (float) $value;
    }

    public static function available($required, $exclude = 0) {
        global $wpdb;
        $helper = new Automattic\WooCommerce\Checkout\Helpers\ReserveStock();
        foreach ($required as $id => $quantity) {
            $held = $helper->get_reserved_stock(wc_get_product($id), $exclude);
            if ($wpdb->last_error) throw new RuntimeException('No se pudieron leer las reservas.');
            if (self::stock($id) - $held < $quantity) throw new WC_Data_Exception('rp_insufficient_stock', 'No quedan unidades suficientes para confirmar este pedido.', 409);
        }
    }

    public static function reserve($order, $required) {
        global $wpdb;
        $minutes = (int) get_option('woocommerce_hold_stock_minutes', 0);
        if ($minutes <= 0 || 'yes' !== get_option('woocommerce_manage_stock')) throw new RuntimeException('La reserva de inventario no está configurada.');
        self::available($required, $order->get_id());
        wc_reserve_stock_for_order($order);
        // Fail closed even if a third-party filter silently disables core reservations.
        foreach ($required as $id => $quantity) {
            $held = $wpdb->get_var($wpdb->prepare("SELECT stock_quantity FROM {$wpdb->prefix}wc_reserved_stock WHERE order_id=%d AND product_id=%d AND expires>NOW()", $order->get_id(), $id));
            if ($wpdb->last_error || !is_numeric($held) || (float) $held !== (float) $quantity) throw new RuntimeException('No se confirmó la reserva de inventario.');
        }
    }

    public static function reduce($order, $required, $status, $transaction = '') {
        global $wpdb;
        $before = [];
        foreach ($required as $id => $quantity) $before[$id] = self::stock($id);
        if (false === $wpdb->query('START TRANSACTION')) throw new RuntimeException('Inventario temporalmente no disponible.');
        try {
            wc_maybe_reduce_stock_levels($order->get_id());
            foreach ($required as $id => $quantity) {
                if (self::stock($id) !== $before[$id] - $quantity) throw new RuntimeException('No se confirmó el descuento de inventario.');
            }
            if (!$order->get_data_store()->get_stock_reduced($order->get_id())) throw new RuntimeException('No se confirmó el estado del inventario.');
            // Pending reservation remains visible until stock is deducted; never expose a gap.
            wc_release_stock_for_order($order);
            if ($transaction) {
                $order->set_transaction_id($transaction);
                $order->set_date_paid(time());
            }
            $order->set_status($status);
            $order->save();
            if (false === $wpdb->query('COMMIT')) throw new RuntimeException('No se pudo confirmar el inventario.');
        } catch (Throwable $e) {
            $wpdb->query('ROLLBACK');
            wp_cache_delete($order->get_id(), 'post_meta');
            foreach ($required as $id => $_) wp_cache_delete($id, 'post_meta');
            throw $e;
        }
    }

    public static function required_for_order($order) {
        $items = [];
        foreach ($order->get_items() as $item) $items[] = ['product_id'=>$item->get_product_id(), 'variation_id'=>$item->get_variation_id(), 'quantity'=>(int) $item->get_quantity()];
        return self::products($items)[1];
    }

    public static function error($e) {
        if (wp_get_environment_type() === 'staging') error_log('RP inventory diagnostic: ' . get_class($e) . ': ' . $e->getMessage());
        $stock = $e instanceof Automattic\WooCommerce\Checkout\Helpers\ReserveStockException || ($e instanceof WC_Data_Exception && 'rp_insufficient_stock' === $e->getErrorCode());
        return new WP_Error($stock ? 'rp_insufficient_stock' : 'rp_inventory_unavailable', $stock ? 'Uno o más productos ya no tienen unidades disponibles.' : 'No se pudo asegurar el inventario. No se confirmó el pedido; intenta nuevamente.', ['status'=>$stock ? 409 : ($e instanceof InvalidArgumentException ? 400 : 503)]);
    }

    public static function readiness($request) {
        global $wpdb;
        if ('yes' !== get_option('rp_wompi_enabled', 'no')) return new WP_Error('rp_wompi_disabled', 'Los pagos en línea están temporalmente deshabilitados.', ['status'=>403]);
        $lock = self::lock('order:' . (int) $request['id']);
        try {
            $order = wc_get_order((int) $request['id']);
            if (!$order || !hash_equals($order->get_order_key(), (string) $request['order_key'])) return new WP_Error('rp_invalid_payment', 'Pago no autorizado.', ['status'=>403]);
            if ('wompi' !== $order->get_payment_method() || 'pending' !== $order->get_status() || !$order->get_meta('_rp_stock_guard')) return new WP_Error('rp_payment_not_pending', 'El pedido no está pendiente de pago.', ['status'=>409]);
            $required = self::required_for_order($order);
            $created = $order->get_date_created();
            $minutes = (int) get_option('woocommerce_hold_stock_minutes', 0);
            if (!$created || $minutes <= 0) throw new RuntimeException('La reserva no está configurada.');
            $expiry = $created->getTimestamp() + $minutes * 60;
            foreach ($required as $id => $quantity) {
                $row = $wpdb->get_row($wpdb->prepare("SELECT stock_quantity,UNIX_TIMESTAMP(expires) AS expires FROM {$wpdb->prefix}wc_reserved_stock WHERE order_id=%d AND product_id=%d AND expires>NOW()", $order->get_id(), $id));
                if ($wpdb->last_error) throw new RuntimeException('Reservation read failed');
                if (!$row || (float) $row->stock_quantity !== (float) $quantity) return new WP_Error('rp_reservation_expired', 'La reserva venció. Regresa al carrito para verificar disponibilidad.', ['status'=>409]);
                $expiry = min($expiry, (int) $row->expires);
            }
            if ($expiry <= time() + 15) return new WP_Error('rp_reservation_expired', 'La reserva está por vencer. Verifica nuevamente tu carrito.', ['status'=>409]);
            return ['amount_in_cents'=>(int) round((float) $order->get_total() * 100), 'currency'=>$order->get_currency(), 'expiration_time'=>gmdate('Y-m-d\TH:i:s\Z', $expiry)];
        } catch (Throwable $e) { return self::error($e); }
        finally { self::unlock($lock); }
    }

    public static function payment($request) {
        $locks = []; self::$internal = true;
        try {
            $locks[] = self::lock('order:' . (int) $request['id']);
            $order = wc_get_order((int) $request['id']);
            if (!$order || 'wompi' !== $order->get_payment_method()) return new WP_Error('rp_invalid_payment', 'Pedido no válido para Wompi.', ['status'=>409]);
            $event = $request->get_json_params();
            if (!is_array($event) || !in_array($event['status'] ?? '', ['APPROVED','DECLINED','VOIDED','ERROR'], true) || !is_string($event['transaction_id'] ?? null) || !preg_match('/^[a-zA-Z0-9_-]{1,150}$/', $event['transaction_id']) || !is_int($event['amount_in_cents'] ?? null) || $event['amount_in_cents'] !== (int) round((float) $order->get_total() * 100) || ($event['currency'] ?? '') !== $order->get_currency()) return new WP_Error('rp_invalid_payment', 'El pago no coincide con el pedido.', ['status'=>409]);
            // Persistent state, not process memory: duplicates cannot reduce/restore twice.
            if ('APPROVED' === $order->get_meta('_rp_wompi_status')) return ['ok'=>true, 'review'=>(bool) $order->get_meta('_rp_payment_stock_review')];
            if ($order->is_paid()) return ['ok'=>true, 'already_paid'=>true];
            $required = [];
            if ('APPROVED' === $event['status']) {
                try {
                    if (!$order->has_status('pending')) throw new WC_Data_Exception('rp_insufficient_stock', 'La reserva ya no está activa.', 409);
                    $required = self::required_for_order($order);
                    foreach ($required as $id => $_) $locks[] = self::lock('product:' . $id);
                    if (!$order->get_data_store()->get_stock_reduced($order->get_id())) {
                        self::reserve($order, $required);
                        self::reduce($order, $required, 'processing', $event['transaction_id']);
                    } else {
                        $order->set_transaction_id($event['transaction_id']);$order->set_date_paid(time());$order->set_status('processing');$order->save();
                    }
                } catch (Automattic\WooCommerce\Checkout\Helpers\ReserveStockException | WC_Data_Exception $e) {
                    wc_release_stock_for_order($order);
                    $order->update_meta_data('_rp_payment_stock_review', 'yes');
                    $order->set_status('rp-stock-review');
                    $order->add_order_note('Wompi aprobó el pago pero no se pudo asignar inventario. Revisar el pago antes de despachar; no se descontó stock ni se emitió reembolso automático.');
                }
            } else {
                $order->set_status('VOIDED' === $event['status'] ? 'cancelled' : 'failed');
                $order->save();wc_release_stock_for_order($order);
            }
            $order->update_meta_data('_rp_wompi_status', $event['status']);
            $order->update_meta_data('_rp_wompi_transaction', $event['transaction_id']);
            $order->save();
            return ['ok'=>true, 'review'=>(bool) $order->get_meta('_rp_payment_stock_review')];
        } catch (Throwable $e) { return self::error($e); }
        finally { self::$internal = false; foreach (array_reverse($locks) as $lock) self::unlock($lock); }
    }

    public static function before_status_save($order) {
        global $wpdb;
        if (!$order instanceof WC_Order || !$order->get_id() || !$order->get_meta('_rp_stock_guard') || !isset($order->get_changes()['status'])) return;
        $id = $order->get_id();
        if (isset(self::$status_locks[$id])) return;
        $lock = self::lock('order:' . $id);
        try {
            wp_cache_delete($id, 'post_meta');
            if (!self::$internal && in_array($order->get_status(), ['processing','completed','on-hold'], true) && !$order->get_data_store()->get_stock_reduced($id)) {
                throw new WC_Data_Exception('rp_inventory_unavailable', 'Este pedido necesita confirmar su reserva mediante el flujo seguro de pago.', 409);
            }
            if (defined('DOING_CRON') && DOING_CRON && $order->has_status('cancelled')) {
                $hpos = Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();
                $actual = $hpos ? $wpdb->get_var($wpdb->prepare("SELECT status FROM {$wpdb->prefix}wc_orders WHERE id=%d", $id)) : $wpdb->get_var($wpdb->prepare("SELECT post_status FROM {$wpdb->posts} WHERE ID=%d", $id));
                if (in_array($actual, ['wc-processing','wc-completed','wc-rp-stock-review'], true)) throw new WC_Data_Exception('rp_stale_cancellation', 'El estado del pedido cambió; no cancelar un pago confirmado.', 409);
            }
            self::$status_locks[$id] = $lock;
        } catch (Throwable $e) { self::unlock($lock);throw $e; }
    }
    public static function after_status_save($id) {
        if (!isset(self::$status_locks[$id])) return;
        $lock = self::$status_locks[$id];unset(self::$status_locks[$id]);self::unlock($lock);
    }
}

add_action('woocommerce_before_order_object_save', ['RP_Stock_Guard','before_status_save'], 1);
add_action('woocommerce_order_status_changed', ['RP_Stock_Guard','after_status_save'], PHP_INT_MAX);

add_action('init', function () {
    // Match core order visibility: public=false, but included in admin/REST
    // "all statuses" queries. Otherwise a paid review order could be hidden.
    register_post_status('wc-rp-stock-review', ['label'=>'Pago aprobado — revisar inventario', 'public'=>false, 'show_in_admin_all_list'=>true, 'show_in_admin_status_list'=>true, 'exclude_from_search'=>false, 'label_count'=>_n_noop('Pago en revisión <span class="count">(%s)</span>', 'Pagos en revisión <span class="count">(%s)</span>')]);
});
add_filter('wc_order_statuses', function ($statuses) { $statuses['wc-rp-stock-review']='Pago aprobado — revisar inventario';return $statuses; });

add_action('rest_api_init', function () {
    if (!class_exists('WC_REST_Orders_Controller')) return;
    class RP_Reserved_Orders_Controller extends WC_REST_Orders_Controller {
        private $checkout_key = '';
        private $checkout_hash = '';
        public function create_item($request) {
            global $wpdb;
            $key = $request->get_header('x-rp-checkout-key');
            if (!preg_match('/^[A-Za-z0-9-]{16,100}$/', $key)) return new WP_Error('rp_invalid_checkout_key', 'Identificador de compra inválido.', ['status'=>400]);
            $this->checkout_key = hash('sha256', $key);
            $this->checkout_hash = hash('sha256', wp_json_encode($request->get_json_params()));
            $lock = null;
            try {
                $lock = RP_Stock_Guard::lock('checkout:' . $this->checkout_key);
                $hpos = Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();
                $table = $hpos ? $wpdb->prefix . 'wc_orders_meta' : $wpdb->postmeta;
                $column = $hpos ? 'order_id' : 'post_id';
                $id = $wpdb->get_var($wpdb->prepare("SELECT $column FROM $table WHERE meta_key='_rp_checkout_key_hash' AND meta_value=%s LIMIT 1", $this->checkout_key));
                if ($wpdb->last_error) throw new RuntimeException('No se pudo verificar el intento de compra.');
                if ($id) {
                    $order = wc_get_order((int) $id);
                    if (!$order || !hash_equals($order->get_meta('_rp_checkout_payload_hash'), $this->checkout_hash) || !$order->has_status(['pending','on-hold'])) return new WP_Error('rp_checkout_conflict', 'Este intento ya fue utilizado. Verifica el pedido antes de comprar nuevamente.', ['status'=>409]);
                    if ($order->has_status('pending')) {
                        $check = new WP_REST_Request('POST');$check->set_param('id', $order->get_id());$check->set_param('order_key', $order->get_order_key());
                        $ready = RP_Stock_Guard::readiness($check);
                        if (is_wp_error($ready)) return $ready;
                    }
                    $request->set_param('context', 'edit');
                    $response = $this->prepare_object_for_response($order, $request);
                    $data = $response->get_data();$data['rp_checkout_replayed'] = true;$response->set_data($data);$response->set_status(201);
                    return $response;
                }
                return parent::create_item($request);
            } catch (Throwable $e) { return RP_Stock_Guard::error($e); }
            finally { if ($lock) RP_Stock_Guard::unlock($lock); }
        }
        protected function prepare_object_for_database($request, $creating = false) {
            $order = parent::prepare_object_for_database($request, $creating);
            if (!is_wp_error($order)) {
                $order->update_meta_data('_rp_stock_guard', '1');
                $order->update_meta_data('_rp_checkout_key_hash', $this->checkout_key);
                $order->update_meta_data('_rp_checkout_payload_hash', $this->checkout_hash);
            }
            return $order;
        }
        protected function save_object($request, $creating = false) {
            $locks = []; $order = null; RP_Stock_Guard::$internal = true;
            try {
                if (get_option('rp_store_paused') === 'yes') return new WP_Error('rp_store_paused', 'Las compras están temporalmente pausadas.', ['status'=>403]);
                if ('wompi' === $request['payment_method'] && 'yes' !== get_option('rp_wompi_enabled', 'no')) return new WP_Error('rp_wompi_disabled', 'Los pagos en línea están temporalmente deshabilitados.', ['status'=>403]);
                if (!$creating || !in_array($request['payment_method'], ['wompi','whatsapp'], true) || $request['set_paid'] !== false) throw new InvalidArgumentException('Método de pago no válido.');
                $final = $request['payment_method'] === 'whatsapp' ? 'on-hold' : 'pending';
                [, $required] = RP_Stock_Guard::products($request['line_items']);
                foreach ($required as $id => $_) $locks[] = RP_Stock_Guard::lock('product:' . $id);
                RP_Stock_Guard::available($required);
                $request->set_param('status', 'pending');
                $order = parent::save_object($request, true);
                if (is_wp_error($order)) return $order;
                RP_Stock_Guard::reserve($order, $required);
                if ($final === 'on-hold') RP_Stock_Guard::reduce($order, $required, $final);
                return $order;
            } catch (Throwable $e) {
                if ($order instanceof WC_Order && $order->get_id()) {
                    // Failed attempts are visible to admin but never reported as successful.
                    $fresh = wc_get_order($order->get_id());
                    $fresh->update_meta_data('_rp_autocancel_oversold', 'yes');
                    $fresh->update_status('cancelled', 'No se pudo asegurar inventario en el checkout.');
                    wc_release_stock_for_order($fresh);
                }
                return RP_Stock_Guard::error($e);
            } finally { RP_Stock_Guard::$internal = false; foreach (array_reverse($locks) as $lock) RP_Stock_Guard::unlock($lock); }
        }
    }
    $controller = new RP_Reserved_Orders_Controller();
    register_rest_route('wc/v3', '/rp-checkout/orders', ['methods'=>'POST','callback'=>[$controller,'create_item'],'permission_callback'=>[$controller,'create_item_permissions_check'],'args'=>$controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE)]);
    register_rest_route('wc/v3', '/rp-checkout/orders/(?P<id>\d+)/payment', ['methods'=>'POST','callback'=>['RP_Stock_Guard','payment'],'permission_callback'=>[$controller,'create_item_permissions_check']]);
    register_rest_route('wc/v3', '/rp-checkout/orders/(?P<id>\d+)/readiness', ['methods'=>'POST','callback'=>['RP_Stock_Guard','readiness'],'permission_callback'=>[$controller,'create_item_permissions_check']]);
}, 20);
