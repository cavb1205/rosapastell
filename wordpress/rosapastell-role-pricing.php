<?php
/**
 * Plugin Name: Rosa Pastell — Precios por rol
 * Description: Editor protegido y compatibilidad con los precios por rol existentes, sin migrar sus valores.
 * Version: 0.1.1
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * WC requires at least: 7.7
 * Text Domain: rosapastell-role-pricing
 */
if (!defined('ABSPATH')) { exit; }

final class RP_Role_Pricing {
    const VERSION = '0.1.1';
    const META = '_role_based_price';
    const ENABLED = '_enable_role_based_price';
    private static $price_revisions = [];

    public static function boot() {
        if (!function_exists('wc_get_product')) { return; }
        if (function_exists('wc_rbp_get_product_price')) {
            add_action('admin_notices', [__CLASS__, 'conflict_notice']);
            return;
        }
        foreach (['product', 'product_variation'] as $type) {
            add_filter('woocommerce_'.$type.'_get_regular_price', [__CLASS__, 'regular'], 99, 2);
            add_filter('woocommerce_'.$type.'_get_sale_price', [__CLASS__, 'sale'], 99, 2);
            add_filter('woocommerce_'.$type.'_get_price', [__CLASS__, 'price'], 99, 2);
        }
        add_filter('woocommerce_variation_prices_price', [__CLASS__, 'price'], 99, 2);
        add_filter('woocommerce_variation_prices_regular_price', [__CLASS__, 'regular'], 99, 2);
        add_filter('woocommerce_variation_prices_sale_price', [__CLASS__, 'sale'], 99, 2);
        add_filter('woocommerce_get_variation_prices_hash', [__CLASS__, 'price_hash'], 99, 3);
        add_action('add_meta_boxes_product', [__CLASS__, 'add_box']);
        add_action('woocommerce_process_product_meta', [__CLASS__, 'save'], 30);
        add_action('woocommerce_product_after_variable_attributes', [__CLASS__, 'variation_fields'], 30, 3);
        add_action('woocommerce_save_product_variation', [__CLASS__, 'save'], 30);
        foreach (['added_post_meta','updated_post_meta','deleted_post_meta'] as $hook) {
            add_action($hook, [__CLASS__, 'invalidate'], 10, 4);
        }
    }

    public static function role() {
        $roles = wp_get_current_user()->roles;
        return $roles ? (string) reset($roles) : 'logedout';
    }

    public static function allowed_roles() {
        $roles = get_option('rp_role_pricing_allowed_roles', ['mayorista','customer','logedout']);
        return is_array($roles) ? array_values(array_filter($roles, 'is_string')) : [];
    }

    public static function enabled($id) {
        return in_array(get_post_meta($id, self::ENABLED, true), ['1','true',1,true], true);
    }

    /** Resolve one legacy component. Never writes base prices or converts metadata. */
    public static function component($base, $product, $key) {
        if (!$product instanceof WC_Product || $product->is_type('variable') || !self::enabled($product->get_id())) { return $base; }
        $role = self::role();
        if (!in_array($role, self::allowed_roles(), true)) { return $base; }
        $all = get_post_meta($product->get_id(), self::META, true);
        if (!is_array($all) || !isset($all[$role]) || !is_array($all[$role])) { return $base; }
        $row = $all[$role];
        $other = $key === 'regular_price' ? 'selling_price' : 'regular_price';
        $has = isset($row[$key]) && is_scalar($row[$key]);
        $has_other = isset($row[$other]) && is_scalar($row[$other]);
        // Legacy explicit zero in either component means zero, not an absent price.
        if (($has && ($row[$key] === 0 || $row[$key] === '0')) || ($has_other && ($row[$other] === 0 || $row[$other] === '0'))) { return '0'; }
        if ($has && $row[$key] !== '') { return wc_format_decimal($row[$key]); }
        if ($has_other && $row[$other] !== '') { return wc_format_decimal($row[$other]); }
        return $base;
    }

    public static function regular($price, $product) { return self::component($price, $product, 'regular_price'); }
    public static function sale($price, $product) { return self::component($price, $product, 'selling_price'); }
    public static function price($price, $product) {
        if (!$product instanceof WC_Product || $product->is_type('variable')) { return $price; }
        // Preserve the installed plugin's effective-price rule during this replacement.
        $sale = self::sale($product->get_sale_price('edit'), $product);
        return wc_format_decimal($sale !== '' && (float)$sale > 0 ? $sale : self::regular($price, $product));
    }

    public static function price_hash($hash, $product, $display) {
        // WooCommerce also keeps an object-local price array. Deleting its transient
        // alone does not evict that array after an edit in the same request.
        $revision = self::$price_revisions[$product->get_id()] ?? 0;
        $hash['rp_role_pricing'] = [self::VERSION, self::role(), self::allowed_roles(), $revision];
        return $hash;
    }

    public static function invalidate($meta_id, $id, $key, $value) {
        if (!in_array($key, [self::META,self::ENABLED], true) || !in_array(get_post_type($id), ['product','product_variation'], true)) { return; }
        $parent = wp_get_post_parent_id($id);
        $product_id = $parent ?: $id;
        self::$price_revisions[$product_id] = (self::$price_revisions[$product_id] ?? 0) + 1;
        wc_delete_product_transients($product_id);
    }

    public static function add_box() {
        add_meta_box('rp-role-pricing', 'Rosa Pastell — Precios por rol', [__CLASS__, 'box'], 'product', 'normal', 'default');
    }
    public static function box($post) { self::fields((int)$post->ID); }
    public static function variation_fields($loop, $data, $variation) { self::fields((int)$variation->ID); }

    public static function fields($id) {
        if (!current_user_can('edit_post', $id)) { return; }
        $prices = get_post_meta($id, self::META, true);
        $prices = is_array($prices) ? $prices : [];
        $roles = array_unique(array_merge(['mayorista'], array_keys($prices)));
        $names = wp_roles()->get_names();
        wp_nonce_field('rp-role-pricing:'.$id, 'rp_role_pricing_nonce['.$id.']', false);
        echo '<div class="rp-role-pricing"><p><label><input type="checkbox" name="rp_role_enabled['.esc_attr($id).']" value="1" '.checked(self::enabled($id), true, false).'> Aplicar precios por rol en WooCommerce</label></p>';
        echo '<p class="description">En blanco conserva el comportamiento base. Cada variación se edita por separado. Los valores existentes no se convierten.</p>';
        foreach ($roles as $role) {
            if (!is_string($role) || !preg_match('/^[a-zA-Z0-9_-]{1,64}$/D', $role)) { continue; }
            $label = $role === 'logedout' ? 'Visitante' : (isset($names[$role]) ? $names[$role] : $role);
            echo '<details'.($role === 'mayorista' ? ' open' : '').'><summary>'.esc_html($label).'</summary>';
            foreach (['regular_price'=>'Precio normal','selling_price'=>'Precio de venta'] as $key=>$title) {
                $value = isset($prices[$role][$key]) && is_scalar($prices[$role][$key]) ? (string)$prices[$role][$key] : '';
                $field = 'rp_role_prices['.$id.']['.$role.']['.$key.']';
                echo '<p><label>'.esc_html($title).' <input type="text" inputmode="decimal" class="short wc_input_price" name="'.esc_attr($field).'" value="'.esc_attr($value).'" autocomplete="off"></label></p>';
            }
            echo '</details>';
        }
        echo '<input type="hidden" name="rp_role_complete['.esc_attr($id).']" value="1"></div>';
    }

    /** Atomic validation: any malformed field prevents all pricing writes for this item. */
    public static function validate_prices($posted, $existing) {
        if (!is_array($posted) || !is_array($existing) || count($posted) > 100) { return new WP_Error('rp_price_shape', 'Formato de precios inválido.'); }
        $result = $existing;
        foreach ($posted as $role=>$entry) {
            if (!is_string($role) || !preg_match('/^[a-zA-Z0-9_-]{1,64}$/D', $role) || (!isset(wp_roles()->roles[$role]) && $role !== 'logedout' && !array_key_exists($role,$existing)) || !is_array($entry)) { return new WP_Error('rp_price_role', 'Rol inválido.'); }
            $old = isset($existing[$role]) && is_array($existing[$role]) ? $existing[$role] : [];
            foreach ($entry as $key=>$value) {
                if (!in_array($key,['regular_price','selling_price'],true) || !is_string($value) || strlen($value)>32) { return new WP_Error('rp_price_field', 'Campo de precio inválido.'); }
                $value = trim($value);
                if ($value !== '' && !preg_match('/^[0-9]+(?:[.,][0-9]+)?$/D',$value)) { return new WP_Error('rp_price_value', 'Usa un importe positivo o cero, sin separador de miles.'); }
                // Do not normalize untouched legacy text merely by submitting the editor.
                $old[$key] = isset($old[$key]) && (string)$old[$key] === $value ? $old[$key] : ($value === '' ? '' : wc_format_decimal(str_replace(',','.',$value)));
            }
            $result[$role] = $old;
        }
        return $result;
    }

    public static function save($id) {
        $id = absint($id);
        if (!in_array(get_post_type($id), ['product','product_variation'], true) || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($id) || wp_is_post_autosave($id)) { return; }
        if (!current_user_can('edit_post',$id)) { return; }
        $nonces = isset($_POST['rp_role_pricing_nonce']) && is_array($_POST['rp_role_pricing_nonce']) ? wp_unslash($_POST['rp_role_pricing_nonce']) : [];
        if (!isset($nonces[$id]) || !is_string($nonces[$id]) || !wp_verify_nonce($nonces[$id],'rp-role-pricing:'.$id)) { return; }
        if (!isset($_POST['rp_role_complete']) || !is_array($_POST['rp_role_complete']) || !isset($_POST['rp_role_complete'][$id]) || $_POST['rp_role_complete'][$id] !== '1') { return; }
        $posted = isset($_POST['rp_role_prices']) && is_array($_POST['rp_role_prices']) ? wp_unslash($_POST['rp_role_prices']) : [];
        if (!isset($posted[$id])) { return; } // Unrendered or truncated form must not erase prices.
        $existing = get_post_meta($id,self::META,true);
        if ($existing !== '' && !is_array($existing)) { self::error('Formato heredado inesperado; no se guardaron precios.'); return; }
        $result = self::validate_prices($posted[$id], is_array($existing) ? $existing : []);
        if (is_wp_error($result)) { self::error($result->get_error_message()); return; }
        if (isset($_POST['rp_role_enabled']) && (!is_array($_POST['rp_role_enabled']) || (isset($_POST['rp_role_enabled'][$id]) && $_POST['rp_role_enabled'][$id] !== '1'))) { self::error('Estado de precios inválido.'); return; }
        $enabled = isset($_POST['rp_role_enabled']) && is_array($_POST['rp_role_enabled']) && isset($_POST['rp_role_enabled'][$id]) && $_POST['rp_role_enabled'][$id] === '1';
        if ($result !== $existing && update_post_meta($id,self::META,$result) === false) { self::error('No se pudieron guardar los precios. Recarga y verifica antes de continuar.'); return; }
        if ($enabled !== self::enabled($id)) { update_post_meta($id,self::ENABLED,$enabled ? '1' : '0'); }
    }

    private static function error($message) {
        if (class_exists('WC_Admin_Meta_Boxes')) { WC_Admin_Meta_Boxes::add_error($message); }
    }

    public static function conflict_notice() {
        if (current_user_can('manage_woocommerce')) {
            echo '<div class="notice notice-error"><p>Rosa Pastell: el plugin antiguo de precios sigue activo. El reemplazo no aplicará filtros duplicados; completa el cambio controlado antes de continuar.</p></div>';
        }
    }
}
add_action('plugins_loaded', ['RP_Role_Pricing','boot'], 20);
