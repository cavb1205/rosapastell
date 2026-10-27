<?php
// Local diagnostic only: keep outside the web root, never invoke an order route.
$_SERVER['HTTPS']='on';$_SERVER['HTTP_HOST']='api.rosapastell.com';
$_SERVER['SCRIPT_NAME']='/__rp_local_check';$_SERVER['REQUEST_URI']='/__rp_local_check';
require '/srv/rosapastell-stage/rosa/site/wp-load.php';
if (wp_get_environment_type()!=='production' || DB_HOST!=='localhost:/run/rosa-cutover/84/mysqld.sock') { throw new RuntimeException('Not the production backend'); }
header('Content-Type: application/json');
echo json_encode([
    'queue_class_available'=>class_exists('Automattic\\WooCommerce\\Internal\\Email\\DeferredEmailQueue'),
    'native_deferral_enabled'=>(bool)apply_filters('woocommerce_defer_transactional_emails',false),
    'queued_status_callback'=>has_action('woocommerce_order_status_pending_to_on-hold',['WC_Emails','queue_transactional_email'])!==false,
    'inline_status_callback'=>has_action('woocommerce_order_status_pending_to_on-hold',['WC_Emails','send_transactional_email'])!==false,
    'native_mail_still_blocked'=>has_filter('pre_wp_mail','__return_false')!==false,
    'pdf_method'=>apply_filters('wpo_wcpdf_filesystem_method','wp'),
    'remote_fopen_enabled'=>(bool)ini_get('allow_url_fopen'),
]);
