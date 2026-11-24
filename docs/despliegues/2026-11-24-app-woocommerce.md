# 24-nov-2026: acceso de la app móvil de WooCommerce

## Problema

Desde la migración al VPS nuevo, la app de WooCommerce no mostraba datos. Los
registros (que llegan hasta el 10-nov) muestran a diario solicitudes del proxy
de WordPress.com, y ninguna recibió respuesta útil:

- WordPress.com llama al sitio por `http`, recibe 301 a HTTPS y luego la raíz
  `/` respondía 302 a `www` incluso con `?rest_route=`. Así las consultas de la
  app terminaban en el frontend.
- Por esa misma redirección, la consulta `connect/site-info` de WordPress.com,
  que usa la app al ingresar una dirección, respondía `isWordPress: false`
  y `urlAfterRedirects: https://www.rosapastell.com`.
- Las contraseñas de aplicación estaban desactivadas en todo el sitio y XML-RPC
  está bloqueado, así que tampoco existía la vía directa.

La ruta por WordPress.com no se restauró: requiere quitar el modo staging de
Jetpack y abrir la salida hacia WordPress.com. Además, su firma no valida tras
pasar de `http` a HTTPS.

## Cambio

Commit `27cd4a1`:

- `ops/rosapastell/api-routes.conf`: con `?rest_route=`, la raíz pasa a
  WordPress. Sin él, sirve una página mínima con `noindex`, el enlace de
  descubrimiento REST y un reenvío a `www`. Se repiten los encabezados de
  seguridad del servidor.
- `wordpress/000-production-policy.php`: contraseñas de aplicación solo para
  administradores (el núcleo las limita a HTTPS). Sin cambios en la salida
  HTTP, el correo local, el modo staging de Jetpack ni el checkout nativo.
- `tests/production-policy.test.php`: prueba aislada, ejecutada con PHP 8.4
  del VPS, con un control negativo.

Ambos archivos productivos no estaban versionados. Se agregaron tal como
estaban en el servidor y luego se modificaron en el mismo commit.

## Aplicación

24-nov 16:49 UTC, con respaldo previo de ambos archivos en el VPS, `nginx -t`
correcto y recarga de nginx y del pool PHP de Rosa. Los SHA-256 instalados
coinciden con el repositorio. La recarga del pool cortó 3 solicitudes en
curso (dos listados de productos del frontend y una del admin) en ese mismo
segundo; no hubo más errores. El push activó un despliegue de Vercel
(`dpl_CojAWBbeczJtXZtKJVv8w4FXe5Ta`, Ready) sin cambios de frontend.

## Comprobaciones

- `/` responde 200 con `Link: rel="https://api.w.org/"`, `X-Robots-Tag: noindex`
  y los encabezados de seguridad.
- `/?rest_route=/` y `/wp-json/` responden el índice REST con
  `application-passwords`.
- WordPress.com `connect/site-info` responde `isWordPress: true` y
  `urlAfterRedirects: https://api.rosapastell.com`.
- Siguen igual:
  - `xmlrpc.php` responde 403.
  - La Store API responde 403, también vía `?rest_route=`.
  - La lista anónima de usuarios responde 401.
- `www` (`/`, `/checkout`, `/colecciones`) responde 200.
- En el servidor:
  - Los tres administradores pueden crear contraseñas de aplicación; un
    cliente de muestra no puede.
  - Un administrador conserva una contraseña de aplicación de la app iOS
    creada el 13-oct-2025, que vuelve a ser válida.

Falta confirmar el inicio de sesión en la app real ("Iniciar sesión con
credenciales del sitio").

## Reversión

Restaurar los dos archivos respaldados en el VPS
(`/var/backups/rosapastell-updates/20261124T164915Z-app-access/`), ejecutar
`nginx -t`, recargar nginx y `rosa-stage-php`. Para retirar solo el acceso
de un dispositivo, revocar su contraseña en Usuarios → Perfil.
