<?php
/**
 * Plugin Name: Rosa Pastell — Rendimiento administrativo
 * Description: Evita la minigráfica remota de Jetpack que no está disponible bajo la política de salida del backend.
 * Version: 0.1.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) { exit; }

function rp_admin_performance_disable_remote_chart() {
    $class = 'Automattic\\Jetpack\\Stats_Admin\\Admin_Bar';
    if (!class_exists($class, false)) { return; }
    // Remove only the automatic chart in wp-admin. Keep the CDN, main Stats
    // dashboard, chart request handler, modules and outbound policy unchanged.
    remove_action('admin_head', [$class, 'maybe_add_chart'], 100);
}
add_action('admin_head', 'rp_admin_performance_disable_remote_chart', 0);
