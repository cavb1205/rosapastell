<?php
// Standalone checks: no WordPress, database, HTTP or email.
define('ABSPATH', __DIR__);
$filters = [];
$caps = [];
$current_user = 0;
function add_filter($hook, $callback, $priority = 10, $args = 1) {
    global $filters;
    $filters[] = [$hook, $callback, $priority, $args];
}
function current_user_can($cap) { global $caps; return in_array($cap, $caps, true); }
function is_user_logged_in() { global $current_user; return $current_user > 0; }
function get_current_user_id() { global $current_user; return $current_user; }
function rest_authorization_required_code() { return is_user_logged_in() ? 403 : 401; }
function update_option(...$args) { throw new RuntimeException('Must not mutate options'); }
class WP_Error {
    public $code; public $data;
    public function __construct($code, $message, $data) { $this->code = $code; $this->data = $data; }
}
class FakeRequest {
    private $route;
    public function __construct($route) { $this->route = $route; }
    public function get_route() { return $this->route; }
}
function check($condition, $message) {
    if (!$condition) { throw new RuntimeException($message); }
}
function as_user($id, array $user_caps) { global $current_user, $caps; $current_user = $id; $caps = $user_caps; }
function guard($route) { return rp_user_privacy_rest_guard(null, null, new FakeRequest($route)); }
function blocked($r) { return $r instanceof WP_Error && $r->code === 'rest_user_cannot_view'; }

require $argv[1];

check($filters === [
    ['rest_pre_dispatch', 'rp_user_privacy_rest_guard', 10, 3],
    ['oembed_response_data', 'rp_user_privacy_oembed', PHP_INT_MAX, 1],
], 'Only the REST guard and the oEmbed filter may be registered');

// Anonymous visitor: listing and lookup by ID are blocked, including case and slash variants.
as_user(0, []);
foreach (['/wp/v2/users', '/wp/v2/users/', '/wp/v2/users/1', '/wp/v2/Users', '/WP/V2/USERS/51'] as $route) {
    $r = guard($route);
    check(blocked($r) && $r->data['status'] === 401, "Anonymous must be blocked on $route");
}
// /users/me and unrelated routes are left to WordPress (JWT login/profile rely on it).
foreach (['/wp/v2/users/me', '/wp/v2/posts', '/wc/v3/customers', '/jwt-auth/v1/token', '/rosapastell/v1/store-status', '/wp/v2/users-extra'] as $route) {
    check(guard($route) === null, "Must not interfere with $route");
}
// Signed-in customer: may read only their own ID.
as_user(75, ['read']);
check(blocked(guard('/wp/v2/users')) && guard('/wp/v2/users')->data['status'] === 403, 'Customer must not list users');
check(blocked(guard('/wp/v2/users/1')), 'Customer must not read other accounts');
check(guard('/wp/v2/users/75') === null, 'Customer may read their own record');
check(guard('/wp/v2/users/me') === null, 'Customer keeps /users/me');
// Editors/authors (author dropdowns) and admins/shop managers keep access.
foreach ([['edit_posts'], ['list_users'], ['list_users', 'edit_posts']] as $c) {
    as_user(1, $c);
    check(guard('/wp/v2/users') === null && guard('/wp/v2/users/51') === null, 'Privileged users keep access');
}
// An earlier handler's answer is never replaced.
as_user(0, []);
check(rp_user_privacy_rest_guard('earlier', null, new FakeRequest('/wp/v2/users')) === 'earlier', 'Must keep prior results');

// oEmbed: author fields removed, everything else kept.
$o = rp_user_privacy_oembed(['version' => '1.0', 'title' => 'Inicio', 'author_name' => 'x', 'author_url' => 'https://example.invalid/author/x', 'html' => '<p>']);
check(!isset($o['author_name']) && !isset($o['author_url']), 'oEmbed must drop author fields');
check($o['title'] === 'Inicio' && $o['html'] === '<p>' && $o['version'] === '1.0', 'oEmbed must keep other fields');
check(rp_user_privacy_oembed(false) === false, 'Non-array oEmbed data passes through');

echo json_encode(['passed' => true, 'anonymous_blocked' => true, 'users_me_kept' => true, 'own_record_kept' => true, 'editors_kept' => true, 'oembed_author_removed' => true]) . "\n";
