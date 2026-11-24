<?php
// Standalone: no WordPress, database, HTTP, email or production bootstrap.
// Run: php tests/production-policy.test.php wordpress/000-production-policy.php
define('ABSPATH', __DIR__);
$filters = [];
function add_filter($hook, $callback, $priority = 10, $args = 1) {
    global $filters;
    $filters[$hook][] = [$callback, $priority, $args];
}
function add_action($hook, $callback, $priority = 10, $args = 1) { add_filter($hook, $callback, $priority, $args); }
function apply($hook, ...$values) {
    global $filters;
    $value = $values[0];
    foreach ($filters[$hook] ?? [] as [$cb, , $n]) {
        $values[0] = $value;
        $value = $cb(...array_slice($values, 0, $n));
    }
    return $value;
}
function __return_false() { return false; }
function __return_true() { return true; }
function wp_parse_url($url, $component = -1) { return parse_url($url, $component); }
class WP_Error { public function __construct(public $code = '', public $message = '', public $data = []) {} }
class WP_User { public function __construct(public array $caps = []) {} }
function user_can($user, $cap) { return in_array($cap, $user->caps, true); }
function check($condition, $message) {
    if (!$condition) { throw new RuntimeException($message); }
}
require $argv[1];

$admin = new WP_User(['manage_options', 'list_users']);
$manager = new WP_User(['manage_woocommerce', 'edit_posts']);
$customer = new WP_User(['read']);

check(!isset($filters['wp_is_application_passwords_available']), 'Site-wide availability must follow core (HTTPS only), not be forced');
check(apply('wp_is_application_passwords_available_for_user', true, $admin) === true, 'Administrators can create application passwords');
check(apply('wp_is_application_passwords_available_for_user', true, $manager) === false, 'Non-administrators cannot');
check(apply('wp_is_application_passwords_available_for_user', true, $customer) === false, 'Customers cannot');
check(apply('wp_is_application_passwords_available_for_user', false, $admin) === false, 'Never re-enable what core disabled (e.g. no HTTPS)');
check(apply('wp_is_application_passwords_available_for_user', true, null) === false, 'Unknown user is denied');

// The rest of the policy is unchanged.
check(apply('pre_wp_mail', null) === false, 'Local mail stays disabled');
check(apply('jetpack_is_staging_site', false) === true, 'Jetpack stays in staging mode');
check(apply('pre_http_request', false, [], 'https://public-api.wordpress.com/') instanceof WP_Error, 'Outbound to WordPress.com stays blocked');
check(apply('pre_http_request', false, [], 'https://api.wordpress.org/') === false, 'Approved outbound host still allowed');

echo json_encode(['passed' => true, 'app_passwords' => 'administrators_only', 'outbound_policy_unchanged' => true])."\n";
