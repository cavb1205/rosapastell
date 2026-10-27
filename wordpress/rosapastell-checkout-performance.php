<?php
/**
 * Plugin Name: Rosa Pastell — Trabajo diferido y tiempos de checkout
 * Description: Usa la cola nativa de WooCommerce y registra tiempos privados sin alterar pedidos o inventario.
 * Version: 0.1.0
 * Requires PHP: 8.4
 */
defined('ABSPATH') || exit;

function rp_defer_native_transactional_work($defer) {
    if ($defer) { return $defer; }
    if (!defined('WC_VERSION') || version_compare(WC_VERSION, '10.8.0', '<') || !class_exists('Automattic\\WooCommerce\\Internal\\Email\\DeferredEmailQueue')) {
        return $defer;
    }
    // Core queues the existing callbacks; it retains a synchronous fallback for
    // unsupported arguments. No custom delivery, invoice or stock code here.
    return true;
}
add_filter('woocommerce_defer_transactional_emails', 'rp_defer_native_transactional_work', PHP_INT_MAX);

if (!defined('RP_CHECKOUT_TIMING_LOG')) {
    define('RP_CHECKOUT_TIMING_LOG', '/var/log/rosa-stage/checkout-timing.jsonl');
}

final class RP_Checkout_Timing {
    private static ?array $state = null;

    public static function begin($response, $handler, $request) {
        global $wpdb;
        if (self::$state !== null || $request->get_method() !== 'POST' || $request->get_route() !== '/wc/v3/rp-checkout/orders') { return $response; }
        $items = $request->get_param('line_items');
        self::$state = [
            'request' => $request, 'start' => hrtime(true),
            'queries' => (int) ($wpdb->num_queries ?? 0),
            'lines' => is_array($items) ? count($items) : 0,
            'prepared_ms' => null, 'inserted_ms' => null,
            'save_depth' => 0, 'save_start' => 0, 'save_ns' => 0, 'saves' => 0,
        ];
        return $response;
    }

    private static function elapsed(): float {
        return round((hrtime(true) - self::$state['start']) / 1000000, 3);
    }

    public static function prepared($order, $request, $creating) {
        if (self::$state !== null && self::$state['request'] === $request && self::$state['prepared_ms'] === null) {
            self::$state['prepared_ms'] = self::elapsed();
        }
        return $order;
    }

    public static function before_save($order, $store = null) {
        if (self::$state !== null && self::$state['save_depth']++ === 0) { self::$state['save_start'] = hrtime(true); }
    }

    public static function after_save($order, $store = null) {
        if (self::$state !== null && self::$state['save_depth'] > 0 && --self::$state['save_depth'] === 0) {
            self::$state['save_ns'] += hrtime(true) - self::$state['save_start'];
            self::$state['saves']++;
        }
    }

    public static function inserted($order, $request, $creating) {
        if (self::$state !== null && self::$state['request'] === $request) { self::$state['inserted_ms'] = self::elapsed(); }
    }

    public static function finish($response, $handler, $request) {
        global $wpdb;
        if (self::$state === null || self::$state['request'] !== $request) { return $response; }
        $elapsed = self::elapsed();
        $state = self::$state;
        self::$state = null;
        // Observability is never allowed to change the checkout response.
        try {
            $status = 0;
            if (is_wp_error($response)) {
                $data = $response->get_error_data();
                $status = is_array($data) ? (int) ($data['status'] ?? 0) : 0;
            } elseif (is_object($response) && method_exists($response, 'get_status')) {
                $status = (int) $response->get_status();
            }
            $record = [
                'ts' => gmdate('c'), 'pid' => getmypid(), 'status' => $status,
                'lines' => $state['lines'], 'callback_ms' => $elapsed,
                'prepared_ms' => $state['prepared_ms'], 'inserted_ms' => $state['inserted_ms'],
                'order_save_ms' => round($state['save_ns'] / 1000000, 3),
                'order_saves' => $state['saves'],
                'db_queries' => max(0, (int) ($wpdb->num_queries ?? 0) - $state['queries']),
            ];
            $json = json_encode($record, JSON_UNESCAPED_SLASHES);
            if (is_string($json)) { @error_log($json."\n", 3, RP_CHECKOUT_TIMING_LOG); }
        } catch (Throwable $ignored) { /* Do not interrupt or replace a purchase. */ }
        return $response;
    }
}

add_filter('rest_request_before_callbacks', ['RP_Checkout_Timing', 'begin'], PHP_INT_MIN, 3);
add_filter('woocommerce_rest_pre_insert_shop_order_object', ['RP_Checkout_Timing', 'prepared'], PHP_INT_MIN, 3);
add_action('woocommerce_before_order_object_save', ['RP_Checkout_Timing', 'before_save'], PHP_INT_MIN, 2);
add_action('woocommerce_after_order_object_save', ['RP_Checkout_Timing', 'after_save'], PHP_INT_MAX, 2);
add_action('woocommerce_rest_insert_shop_order_object', ['RP_Checkout_Timing', 'inserted'], PHP_INT_MAX, 3);
add_filter('rest_request_after_callbacks', ['RP_Checkout_Timing', 'finish'], PHP_INT_MAX, 3);
