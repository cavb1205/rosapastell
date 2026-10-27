<?php
// Standalone: no WordPress, database, HTTP, email or production bootstrap.
define('ABSPATH', __DIR__);
$registered = [];
$removed = [];
function add_action($hook, $callback, $priority = 10, $args = 1) {
    global $registered;
    $registered[] = [$hook, $callback, $priority];
}
function remove_action($hook, $callback, $priority = 10) {
    global $removed;
    $removed[] = [$hook, $callback, $priority];
    return true;
}
function check($condition, $message) {
    if (!$condition) { throw new RuntimeException($message); }
}
require $argv[1];
check($registered === [['admin_head', 'rp_admin_performance_disable_remote_chart', 0]], 'Only one early admin hook may be registered');
rp_admin_performance_disable_remote_chart();
check($removed === [], 'No-op when Jetpack Stats class is absent');
class SyntheticJetpackAdminBar {}
class_alias('SyntheticJetpackAdminBar', 'Automattic\\Jetpack\\Stats_Admin\\Admin_Bar');
rp_admin_performance_disable_remote_chart();
check($removed === [['admin_head', ['Automattic\\Jetpack\\Stats_Admin\\Admin_Bar', 'maybe_add_chart'], 100]], 'Remove only the chart callback; preserve all other Jetpack behavior');
echo json_encode(['passed' => true, 'absent_class_noop' => true, 'only_admin_chart_removed' => true])."\n";
