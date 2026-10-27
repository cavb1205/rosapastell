/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node configuration checks. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = name => fs.readFileSync(`ops/rosapastell/${name}`, 'utf8');

test('cron defines SCRIPT_NAME before bootstrapping WordPress and retains the production guard', () => {
  const code = read('production-cron.php');
  const scriptName = code.indexOf("$_SERVER['SCRIPT_NAME']='/wp-cron.php';");
  assert.ok(scriptName >= 0);
  assert.ok(scriptName < code.indexOf("require '/srv/rosapastell-stage/rosa/site/wp-load.php';"));
  assert.match(code, /wp_get_environment_type\(\)!=='production'/);
  assert.match(code, /DB_HOST!=='localhost:\/run\/rosa-cutover\/84\/mysqld.sock'/);
  assert.match(code, /require ABSPATH\.'wp-cron.php';/);
  assert.doesNotMatch(code, /wp_schedule|wp_clear_scheduled|wp_unschedule|update_option|delete_option/);
});

test('observability logs only controlled labels and performance values', () => {
  const config = read('observability-nginx.conf');
  const format = config.slice(config.indexOf('log_format '));
  assert.match(config, /map \$request_uri \$rosa_perf_route/);
  assert.match(config, /default other;/);
  assert.doesNotMatch(format, /\$(?:request_uri|uri|args|arg_|remote_|http_|cookie_|request_body)/);
  const fpm = read('php-fpm-observability.inc');
  assert.doesNotMatch(fpm.split('access.format =')[1].split('\n')[0], /%[qrRu]|HTTP_|COOKIE|AUTHORIZATION|REQUEST_URI/);
  assert.match(fpm, /pm.status_listen = \/run\/rosa-stage-php\/fpm-status.sock/);
  assert.match(read('nginx-server-observability.inc'), /location = \/__rosa_fpm_status \{ return 404; \}/);
});

test('log rotation preserves private permissions and reopens instead of restarting services', () => {
  const config = read('observability.logrotate');
  assert.equal((config.match(/rotate 7/g) || []).length, 3);
  assert.match(config, /create 0640 www-data adm/);
  assert.match(config, /create 0640 rp_rosa_stage rp_rosa_stage/);
  assert.match(config, /nginx -s reopen/);
  assert.match(config, /--signal=USR1 rosa-stage-php.service/);
  assert.doesNotMatch(config, /restart|reload|copytruncate/);
});
