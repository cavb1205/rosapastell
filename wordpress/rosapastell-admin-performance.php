<?php
/**
 * Plugin Name: Rosa Pastell — Rendimiento administrativo
 * Description: Evita la minigráfica remota de Jetpack que no está disponible bajo la política de salida del backend.
 * Version: 0.2.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) { exit; }

function rp_admin_performance_disable_remote_chart() {
    $class = 'Automattic\\Jetpack\\Stats_Admin\\Admin_Bar';
    if (!class_exists($class, false)) { return; }
    // Remove only the automatic admin-bar chart. Keep the CDN, main Stats
    // dashboard, chart request handler, Stats menu link, modules and outbound
    // policy unchanged.
    // Jetpack <= 16.3 printed the chart from admin_head.
    remove_action('admin_head', [$class, 'maybe_add_chart'], 100);
    // Jetpack >= 16.4 adds it as an admin-bar node whose image is fetched
    // through the backend from WordPress.com (blocked by the egress policy).
    remove_action('admin_bar_menu', [$class, 'maybe_add_chart_node'], 100);
}
// Both run before Jetpack's priority-100 callbacks on the same hooks.
add_action('admin_head', 'rp_admin_performance_disable_remote_chart', 0);
add_action('admin_bar_menu', 'rp_admin_performance_disable_remote_chart', 0);
