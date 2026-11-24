<?php
defined('ABSPATH') || exit;
// Existing customer mail is delivered by Next.js/Resend. No new local MTA.
add_filter('pre_wp_mail', '__return_false', PHP_INT_MAX);
add_filter('automatic_updater_disabled', '__return_true', PHP_INT_MAX);
// WooCommerce mobile app ("site credentials" login): application passwords only for
// administrators. Core already limits them to HTTPS; each device gets its own
// revocable password (Users > Profile). XML-RPC stays blocked in Nginx.
add_filter('wp_is_application_passwords_available_for_user', function($available, $user) {
    return $available && $user instanceof WP_User && user_can($user, 'manage_options');
}, PHP_INT_MAX, 2);
add_filter('jetpack_is_staging_site', '__return_true', PHP_INT_MAX);
// Headless store: do not expose a second, unguarded native checkout route.
add_filter('rest_pre_dispatch',function($result,$server,$request) {
    if (str_starts_with($request->get_route(),'/wc/store/')) return new WP_Error('rp_headless_checkout','Checkout available only on the storefront.',['status'=>403]);
    return $result;
},1,3);
add_action('woocommerce_before_checkout_process',function(){ wc_add_notice('Finaliza la compra en www.rosapastell.com.','error'); },1);
add_filter('http_request_args', function($args) { $args['sslverify']=true;$args['reject_unsafe_urls']=true;$args['timeout']=min(30,$args['timeout'] ?? 15);return $args; }, PHP_INT_MAX);
add_filter('pre_http_request', function($pre,$args,$url) {
    $host=strtolower((string)wp_parse_url($url,PHP_URL_HOST));
    $allowed=['www.rosapastell.com','rosapastell.com','api.rosapastell.com','api.wordpress.org','downloads.wordpress.org','api.woocommerce.com'];
    if (!in_array($host,$allowed,true) || strtolower((string)wp_parse_url($url,PHP_URL_SCHEME))!=='https') return new WP_Error('rp_outbound_blocked','Outbound destination is not approved.');
    return $pre;
},PHP_INT_MAX,3);
