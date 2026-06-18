<?php
/**
 * Plugin Name: Rosa Pastell — Pausa de Tienda
 * Description: Interruptor para pausar las compras (modo catálogo) en el frontend headless de Next.js. Expone el estado vía REST y revalida el sitio al instante.
 * Version:     1.0.0
 * Author:      Rosa Pastell
 *
 * INSTALACIÓN
 * -----------
 * 1. Sube este archivo a:  wp-content/mu-plugins/rosapastell-store-pause.php
 *    (si la carpeta "mu-plugins" no existe, créala — los "must-use plugins"
 *     se activan solos y no se pueden desactivar por error).
 * 2. Configura las dos constantes de abajo. Lo más seguro es definirlas en
 *    wp-config.php; si no, edita los valores por defecto en este archivo.
 *    RP_REVALIDATE_SECRET debe ser EXACTAMENTE el mismo valor que la variable
 *    WOOCOMMERCE_WEBHOOK_SECRET de Vercel (la que valida /api/revalidate).
 * 3. El interruptor aparece en:  WooCommerce → Ajustes → General  (al final).
 * 4. Puedes desactivar el viejo plugin de Addify: ya no se usa en el frontend nuevo.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/* -------------------------------------------------------------------------
 * 0. Configuración (wp-config.php tiene prioridad si define las constantes)
 * ---------------------------------------------------------------------- */
if ( ! defined( 'RP_FRONTEND_URL' ) ) {
    define( 'RP_FRONTEND_URL', 'https://www.rosapastell.com' );
}
if ( ! defined( 'RP_REVALIDATE_SECRET' ) ) {
    define( 'RP_REVALIDATE_SECRET', '__RP_REVALIDATE_SECRET__' );
}

/* -------------------------------------------------------------------------
 * 1. Campos de ajustes en WooCommerce → Ajustes → General
 * ---------------------------------------------------------------------- */
add_filter( 'woocommerce_general_settings', function ( $settings ) {
    $pause_fields = array(
        array(
            'title' => 'Pausa de tienda (nueva colección)',
            'type'  => 'title',
            'desc'  => 'Cuando está activa, el sitio muestra los productos pero deshabilita la compra en toda la tienda. Útil mientras subes una colección nueva, para que todos los mayoristas arranquen al mismo tiempo.',
            'id'    => 'rp_store_pause_section',
        ),
        array(
            'title'   => 'Pausar compras',
            'desc'    => 'Deshabilitar "Agregar al carrito" y el checkout en todo el sitio',
            'id'      => 'rp_store_paused',
            'type'    => 'checkbox',
            'default' => 'no',
        ),
        array(
            'title'    => 'Mensaje',
            'desc_tip' => 'Se muestra a los clientes mientras la tienda está en pausa.',
            'id'       => 'rp_store_pause_message',
            'type'     => 'text',
            'default'  => 'Próximamente — estamos preparando la nueva colección ✨',
            'css'      => 'min-width:420px;',
        ),
        array(
            'type' => 'sectionend',
            'id'   => 'rp_store_pause_section',
        ),
    );

    return array_merge( $settings, $pause_fields );
} );

/* -------------------------------------------------------------------------
 * 2. Endpoint REST público que lee el frontend
 *    GET /wp-json/rosapastell/v1/store-status
 * ---------------------------------------------------------------------- */
add_action( 'rest_api_init', function () {
    register_rest_route(
        'rosapastell/v1',
        '/store-status',
        array(
            'methods'             => 'GET',
            'permission_callback' => '__return_true', // público (solo lectura)
            'callback'            => function () {
                return array(
                    'paused'  => get_option( 'rp_store_paused' ) === 'yes',
                    'message' => (string) get_option( 'rp_store_pause_message', '' ),
                );
            },
        )
    );
} );

/* -------------------------------------------------------------------------
 * 3. Revalidación instantánea: al cambiar el interruptor, avisar al frontend
 * ---------------------------------------------------------------------- */
function rp_ping_store_status_revalidate() {
    if ( ! defined( 'RP_FRONTEND_URL' ) || ! defined( 'RP_REVALIDATE_SECRET' )
        || RP_REVALIDATE_SECRET === '__RP_REVALIDATE_SECRET__' ) {
        return; // sin secret configurado: el frontend igual se actualiza por ISR (~60s)
    }

    $url = rtrim( RP_FRONTEND_URL, '/' ) . '/api/revalidate?secret=' . rawurlencode( RP_REVALIDATE_SECRET );

    wp_remote_post(
        $url,
        array(
            'timeout'  => 5,
            'blocking' => false, // no bloquear el guardado de ajustes
            'headers'  => array( 'Content-Type' => 'application/json' ),
            'body'     => wp_json_encode( array( 'event' => 'store-status' ) ),
        )
    );
}

// Dispara tanto al crear la opción (primera vez) como al actualizarla.
add_action( 'add_option_rp_store_paused', 'rp_ping_store_status_revalidate' );
add_action( 'update_option_rp_store_paused', 'rp_ping_store_status_revalidate' );
add_action( 'add_option_rp_store_pause_message', 'rp_ping_store_status_revalidate' );
add_action( 'update_option_rp_store_pause_message', 'rp_ping_store_status_revalidate' );
