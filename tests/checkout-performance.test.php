<?php
// Uses synthetic requests/orders and optionally the installed core queue class.
// Does not bootstrap WordPress, connect to a database, send email or create PDF.
define('ABSPATH', __DIR__);
define('WC_VERSION', '11.2.1');
$log = tempnam(sys_get_temp_dir(), 'rp-checkout-timing-');
define('RP_CHECKOUT_TIMING_LOG', $log);
$hooks = [];
function add_filter($hook, $callback, $priority = 10, $args = 1) { global $hooks; $hooks[] = [$hook, $callback, $priority, $args]; }
function add_action(...$args) { add_filter(...$args); }
function is_wp_error($value) { return $value instanceof SyntheticError; }
function check($condition, $message) { if (!$condition) { throw new RuntimeException($message); } }
class SyntheticError { public function get_error_data() { return ['status'=>409]; } }
class SyntheticResponse { public function get_status() { return 201; } }
class SyntheticRequest {
    public function __construct(private string $route = '/wc/v3/rp-checkout/orders', private string $method = 'POST') {}
    public function get_method() { return $this->method; }
    public function get_route() { return $this->route; }
    public function get_param($key) { return $key === 'line_items' ? [['name'=>'PRIVATE PRODUCT','quantity'=>1],['quantity'=>2]] : null; }
}
class WC_Order { public function __construct(private int $id) {} public function get_id() { return $this->id; } }
class WC_Product {}
class WC_Payment_Gateway {}
class SyntheticQueue {
    public array $jobs = [];
    public function add($hook, $args, $group) { $this->jobs[] = [$hook,$args,$group]; }
}
class SyntheticWoo {
    public SyntheticQueue $queue;
    public function __construct() { $this->queue = new SyntheticQueue(); }
    public function queue() { return $this->queue; }
    public function call_function($name, $id) { check($name === 'wc_get_order', 'Only restore a synthetic order'); return new WC_Order((int)$id); }
}
class WC_Emails {
    public static array $processed = [];
    public static function send_queued_transactional_email($filter, $args) { self::$processed[] = [$filter,$args]; }
}
$woo = new SyntheticWoo();
function WC() { global $woo; return $woo; }
$wpdb = (object) ['num_queries'=>10];
require $argv[1];
check(rp_defer_native_transactional_work(false) === false, 'Preserve behavior when native queue class is unavailable');
check(rp_defer_native_transactional_work(true) === true, 'Preserve already-enabled deferral');
if (isset($argv[2])) {
    require $argv[2];
    check(rp_defer_native_transactional_work(false) === true, 'Enable the supported native queue');
    $queue = new Automattic\WooCommerce\Internal\Email\DeferredEmailQueue();
    $queue->init();
    check($queue->push('woocommerce_order_status_pending_to_on-hold', [42,new WC_Order(42)]), 'Core accepts a supported order reference');
    check(WC_Emails::$processed === [], 'No inline email/document work');
    check(!$queue->push('synthetic', [new stdClass()]), 'Unsupported arguments retain the core synchronous fallback');
    $queue->dispatch();
    $queue->dispatch();
    check(count($woo->queue->jobs) === 1, 'One persistent job; repeated dispatch does not duplicate it');
    [$hook,$args,$group] = $woo->queue->jobs[0];
    check($hook === 'woocommerce_send_queued_transactional_email' && $group === 'woocommerce-emails', 'Use the native hook and group');
    $queue->send_queued_transactional_email(...$args);
    check(count(WC_Emails::$processed) === 1 && WC_Emails::$processed[0][1][1]->get_id() === 42, 'Worker restores the order and runs the existing callback');
    $queue->send_queued_transactional_email(null, []);
    check(count(WC_Emails::$processed) === 1, 'Invalid worker input is ignored');
}
$request = new SyntheticRequest();
$response = new SyntheticResponse();
check(RP_Checkout_Timing::begin($response, [], new SyntheticRequest('/wc/v3/products', 'GET')) === $response, 'Unrelated route unchanged');
check(filesize($log) === 0, 'No unrelated-route logging');
RP_Checkout_Timing::begin($response, [], $request);
check(RP_Checkout_Timing::prepared($response, $request, true) === $response, 'Order filter preserves the object');
RP_Checkout_Timing::before_save($response);
RP_Checkout_Timing::before_save($response);
RP_Checkout_Timing::after_save($response);
RP_Checkout_Timing::after_save($response);
RP_Checkout_Timing::inserted($response, $request, true);
$wpdb->num_queries = 18;
check(RP_Checkout_Timing::finish($response, [], $request) === $response, 'Exact response identity preserved');
$text = file_get_contents($log);
$row = json_decode(trim($text), true, flags: JSON_THROW_ON_ERROR);
check(array_keys($row) === ['ts','pid','status','lines','callback_ms','prepared_ms','inserted_ms','order_save_ms','order_saves','db_queries'], 'Only bounded approved fields');
check($row['status'] === 201 && $row['lines'] === 2 && $row['order_saves'] === 1 && $row['db_queries'] === 8, 'Correct aggregates without double-counting nested saves');
check(!str_contains($text, 'PRIVATE PRODUCT') && !str_contains($text, 'quantity'), 'No request or item content logged');
RP_Checkout_Timing::begin(null, [], $request);
$error = new SyntheticError();
check(RP_Checkout_Timing::finish($error, [], $request) === $error, 'Stock/error response is never replaced');
unlink($log);
mkdir($log, 0700);
RP_Checkout_Timing::begin(null, [], $request);
check(RP_Checkout_Timing::finish($response, [], $request) === $response, 'Logging failure cannot fail checkout');
rmdir($log);
echo json_encode(['passed'=>true,'native_queue_tested'=>isset($argv[2]),'no_real_order'=>true,'no_email_or_document'=>true,'response_preserved'=>true,'private_timing_only'=>true])."\n";
