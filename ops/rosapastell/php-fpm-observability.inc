; Append inside the existing [rosa-stage] pool, without replacing its hardening.
; No URI, query string, headers, cookies, IP or customer values are recorded.
access.log = /var/log/rosa-stage/fpm-performance.log
access.format = "%{%Y-%m-%dT%H:%M:%S%z}t method=%{RP_PERF_METHOD}e route=%{RP_PERF_ROUTE}e status=%s duration_us=%{microseconds}d memory_bytes=%{bytes}M cpu_pct=%{total}C pid=%p"
pm.status_path = /__rosa_fpm_status
pm.status_listen = /run/rosa-stage-php/fpm-status.sock
