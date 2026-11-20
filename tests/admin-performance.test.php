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
check($registered === [
    ['admin_head', 'rp_admin_performance_disable_remote_chart', 0],
    ['admin_bar_menu', 'rp_admin_performance_disable_remote_chart', 0],
], 'Only the two early hooks (before Jetpack priority 100) may be registered');
rp_admin_performance_disable_remote_chart();
check($removed === [], 'No-op when Jetpack Stats class is absent');
class SyntheticJetpackAdminBar {}
class_alias('SyntheticJetpackAdminBar', 'Automattic\\Jetpack\\Stats_Admin\\Admin_Bar');
rp_admin_performance_disable_remote_chart();
$class = 'Automattic\\Jetpack\\Stats_Admin\\Admin_Bar';
check($removed === [
    ['admin_head', [$class, 'maybe_add_chart'], 100],
    ['admin_bar_menu', [$class, 'maybe_add_chart_node'], 100],
], 'Remove only the chart callbacks (Jetpack <=16.3 and >=16.4); preserve all other Jetpack behavior');
foreach ($removed as $r) {
    check(!in_array($r[1][1], ['add_site_menu_link', 'maybe_serve_chart', 'serve_chart', 'init'], true), 'Must keep the Stats link and chart handler');
}
echo json_encode(['passed' => true, 'absent_class_noop' => true, 'only_chart_removed' => true, 'jetpack_16_3_and_16_4' => true])."\n";
