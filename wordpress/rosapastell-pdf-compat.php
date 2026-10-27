<?php
/**
 * Plugin Name: Rosa Pastell — Archivos locales PDF
 * Description: Usa el método PHP soportado por PDF Invoices sin cambiar el método global de WordPress ni abrir acceso remoto.
 * Version: 0.1.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) { exit; }

function rp_pdf_local_filesystem_method($method) {
    // The PDF plugin supports PHP functions for its writable temporary folders.
    // Do not change FS_METHOD, permissions, allow_url_fopen or stored settings.
    return 'php';
}
add_filter('wpo_wcpdf_filesystem_method', 'rp_pdf_local_filesystem_method', PHP_INT_MAX);
