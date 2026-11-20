<?php
/**
 * Plugin Name: Rosa Pastell — Privacidad de usuarios
 * Description: Impide enumerar cuentas por la REST API (listado y consulta por ID) y por oEmbed a quien no puede editar contenido. Conserva /wp/v2/users/me, el admin y el editor.
 * Version: 0.1.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) { exit; }

/**
 * Guards /wp/v2/users and /wp/v2/users/<id>. WordPress matches REST routes
 * case-insensitively, so the guard does too. /wp/v2/users/me is not matched:
 * the frontend uses it with JWT for login, profile and password changes.
 * Embedded authors (?_embed) are dispatched through the same route and are
 * covered as well.
 */
function rp_user_privacy_rest_guard($result, $server, $request) {
    if (null !== $result) {
        return $result; // Another handler already answered.
    }
    if (!preg_match('#^/wp/v2/users(?:/(\d+))?/?$#i', (string) $request->get_route(), $match)) {
        return $result;
    }
    // Admins, shop managers, editors and authors keep the editor's author lists.
    if (current_user_can('list_users') || current_user_can('edit_posts')) {
        return $result;
    }
    // A signed-in customer may still read their own record by ID.
    if (isset($match[1]) && is_user_logged_in() && (int) $match[1] === get_current_user_id()) {
        return $result;
    }
    return new WP_Error(
        'rest_user_cannot_view',
        'Sorry, you are not allowed to view users.',
        ['status' => rest_authorization_required_code()]
    );
}
add_filter('rest_pre_dispatch', 'rp_user_privacy_rest_guard', 10, 3);

/** oEmbed responses otherwise publish the author's display name and author URL (with the login slug). */
function rp_user_privacy_oembed($data) {
    if (is_array($data)) {
        unset($data['author_name'], $data['author_url']);
    }
    return $data;
}
add_filter('oembed_response_data', 'rp_user_privacy_oembed', PHP_INT_MAX);
