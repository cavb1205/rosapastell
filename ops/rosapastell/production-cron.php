<?php
$_SERVER['HTTPS']='on';$_SERVER['HTTP_HOST']='api.rosapastell.com';$_SERVER['SERVER_PORT']='443';$_SERVER['REQUEST_URI']='/wp-cron.php';
$_SERVER['SCRIPT_NAME']='/wp-cron.php';
require '/srv/rosapastell-stage/rosa/site/wp-load.php';
if (wp_get_environment_type()!=='production' || DB_HOST!=='localhost:/run/rosa-cutover/84/mysqld.sock') throw new Exception('Not the production database');
// Direct local execution; public wp-cron.php stays blocked in Nginx.
require ABSPATH.'wp-cron.php';
