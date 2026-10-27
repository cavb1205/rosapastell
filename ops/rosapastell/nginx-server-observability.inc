# Include only in the public Rosa HTTPS server, not the Licores server.
# Keep the previous access log explicitly: server access_log overrides inheritance.
access_log /var/log/nginx/rosa-stage-access.log;
access_log /var/log/rosapastell-observability/nginx-timing.jsonl rosa_perf;
location = /__rosa_fpm_status { return 404; }
