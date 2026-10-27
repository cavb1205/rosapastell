# Configuración operativa reproducible de Rosa

Estos archivos representan la instrumentación privada y el ejecutor cron del
VPS productivo. No son una configuración completa del servidor ni incluyen
secretos, respaldos, certificados, formularios o registros reales.

## Correspondencia

| Archivo del repositorio | Aplicación |
| --- | --- |
| `observability-nginx.conf` | `/etc/rosapastell-production/observability-nginx.conf`, incluido una vez desde el bloque `http` de `/etc/nginx/nginx.conf` |
| `nginx-server-observability.inc` | Directivas equivalentes integradas en `/etc/rosapastell-production/api-routes.conf`, solo HTTPS de Rosa |
| `nginx-fastcgi-observability.inc` | Parámetros integrados dentro del `location` PHP de ese mismo archivo |
| `php-fpm-observability.inc` | Directivas equivalentes dentro de `[rosa-stage]` en `/etc/rosa-stage/php-fpm.conf` |
| `observability.logrotate` | `/etc/logrotate.d/rosapastell-observability` |
| `production-cron.php` | `/etc/rosa-stage/production-cron.php`; lo ejecuta el temporizador existente, no una ruta pública |

Los `.inc` documentan fragmentos: no añadir includes a ciegas si las directivas
ya están integradas. Conservar las rutas, el socket, permisos y controles de
seguridad del pool original. No reemplazar todo Nginx/FPM por estos fragmentos.

## Privacidad y límites conservados

- El formato Nginx solo registra etiquetas cerradas, tiempo, HTTP y bytes.
  `$request_uri` se usa para elegir una etiqueta; nunca se escribe su valor.
- FPM registra tiempo, CPU y pico de memoria de la petición, no PSS total.
- El estado FPM se consulta por Unix socket y sin `full`. La ruta pública
  `/__rosa_fpm_status` debe devolver 404. No crear un endpoint de estado público.
- La carpeta de tiempos Nginx es `root:www-data` 0710 para que el trabajador
  pueda recorrerla al reabrir logs sin listar su contenido. Archivos 0640,
  `www-data:adm`. Log FPM 0640, `rp_rosa_stage:rp_rosa_stage`, en su carpeta
  privada existente. No colocar logs en el document root.
- Rotación diaria, siete históricos, compresión diferida; `maxsize 10M` se
  evalúa al ejecutar logrotate, no es un límite instantáneo de disco.
- No cambiar `pm.max_children=6`, memoria PHP de 256M ni techo del servicio
  de 1400M como parte de esta instrumentación. No tocar el pool de Licores.

## Cron

El wrapper conserva HTTPS, host, puerto, URI, validación del entorno/base y
la llamada nativa a `wp-cron.php`. Define `SCRIPT_NAME` antes de cargar
WordPress porque el núcleo lo consulta durante el arranque. No añade tareas,
no cambia horarios ni borra eventos. No ejecutarlo manualmente como prueba:
la siguiente ejecución normal del temporizador sirve para validar el cambio.

## Aplicación segura

1. Verificar commit/push, correspondencia con el host y hashes actuales.
2. Guardar respaldo privado de cada archivo antes de cambiarlo. Conservar
   secretos exclusivamente en el servidor y en respaldos cifrados.
3. Integrar solo las directivas necesarias, sin duplicarlas ni quitar guardas.
4. Validar `nginx -t`, FPM como el usuario del servicio, `php8.4 -l` del cron
   y `logrotate --debug /etc/logrotate.conf` según lo modificado.
5. Para Nginx/FPM, recarga gradual y verificación de escritura, rotación y
   bloqueo público del estado. Cambiar solo el wrapper cron no requiere
   reiniciar PHP ni ejecutar manualmente WordPress.
6. Confirmar la siguiente ejecución programada, ausencia del aviso y salud
   HTTP de la tienda. No crear pedidos ni restaurar bases para estas pruebas.

Para revertir, revisar cambios posteriores y restaurar únicamente los archivos
de esta intervención; no revertir inventario, pedidos, base o credenciales.

## Plugin de precios

El código en `wordpress/rosapastell-role-pricing.php` se contrastó con el activo
el 27/10: SHA-256
`7b9c07e81bd8d13cb226d29a6c0021b13af17d641b0542918519a9700edb684a`.
Se versiona sin cambiarlo ni reinstalarlo. Los metadatos de precios permanecen
en WordPress; no están ni deben estar en estos archivos operativos.

## Minigráfica administrativa de Jetpack

`wordpress/rosapastell-admin-performance.php` es un MU-plugin independiente:
retira únicamente el callback `Admin_Bar::maybe_add_chart` de `admin_head`
antes de que genere solicitudes automáticas. No desactiva Jetpack ni módulos,
no cambia sus opciones, no toca el CDN o la página principal de estadísticas,
y no modifica la política de salida del servidor. Si la clase no está cargada,
no hace nada. Debe revisarse al actualizar Jetpack, pues depende de ese callback.

Instalar solo después de validar y subir su commit en
`wp-content/mu-plugins/rosapastell-admin-performance.php`. No sobrescribir los
MU-plugins de stock, pausa o seguridad. Revertir retirando únicamente este
archivo a un respaldo privado, sin modificar datos. Las pestañas del admin
abiertas antes del cambio pueden seguir solicitando la gráfica hasta recargar.
No equivale a habilitar ni reparar el servicio remoto de estadísticas.
