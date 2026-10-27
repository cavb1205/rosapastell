<?php
// Standalone checks: no WordPress, database, document, HTTP or email.
define('ABSPATH', __DIR__);
$filters = [];
function add_filter($hook, $callback, $priority = 10, $args = 1) {
    global $filters;
    $filters[] = [$hook, $callback, $priority];
}
function check($condition, $message) {
    if (!$condition) { throw new RuntimeException($message); }
}
function update_option(...$args) { throw new RuntimeException('Must not mutate options'); }
function wcpdf_get_document(...$args) { throw new RuntimeException('Must not create documents'); }
$remote_before = ini_get('allow_url_fopen');
require $argv[1];
check($filters === [['wpo_wcpdf_filesystem_method', 'rp_pdf_local_filesystem_method', PHP_INT_MAX]], 'Only the PDF filesystem filter may be registered');
foreach (['wp', 'php', 'ftpext', null] as $method) {
    check(rp_pdf_local_filesystem_method($method) === 'php', 'Always select the supported PDF-only PHP method');
}
check(!defined('FS_METHOD'), 'Must not change the global WordPress filesystem method');
check(ini_get('allow_url_fopen') === $remote_before, 'Must not change remote access');
echo json_encode(['passed'=>true,'pdf_only'=>true,'no_global_filesystem_change'=>true,'no_document_created'=>true])."\n";
