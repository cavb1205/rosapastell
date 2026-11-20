# Parches de seguridad del backend: 20 de noviembre de 2026

## Versiones aplicadas

| Componente | Antes | Después | Motivo |
| --- | --- | --- | --- |
| WordPress | 7.1.3 | 7.1.5 | Versiones de seguridad 7.1.4 (28-oct) y 7.1.5 (18-nov), con correcciones de ejecución remota de código. |
| WooCommerce | 11.2.1 | 11.2.2 | Versión de seguridad: autenticación de claves de la REST API, Store API y otras áreas. Se eligió la línea 11.2.x para no incorporar las funciones nuevas de 11.3. |
| User Role Editor | 4.66.2 | 4.67.1 | Escalada de privilegios mediante `promote_users`. |
| Smush | 4.3.5 | 4.3.7 | Endurecimiento de endpoints AJAX. |
| PHP 8.4 (FPM) | 8.4.27 | 8.4.28 | Versión de seguridad del 19-nov. También se actualizaron los paquetes heredados 7.2 y 7.4. |

El sitio bloquea a propósito las actualizaciones automáticas y la edición de
archivos desde WordPress. Por eso el core y los plugins solo se actualizan
con una intervención manual como esta. Los paquetes del sistema sí se
actualizan solos.

## Procedimiento

1. Se descargaron los paquetes oficiales y se verificó cada archivo contra
   los checksums publicados por WordPress.org. Antes del cambio se comprobó
   también que el core y los tres plugins instalados coincidían exactamente
   con sus versiones oficiales, sin archivos modificados ni agregados.
2. Se revisaron los cambios que podían afectar al frontend headless. La
   versión de base de datos del core no cambia (61833). WooCommerce reordena
   la autenticación por claves y agrega una migración que limpia objetos
   serializados en los atributos por defecto.
3. Se preparó todo fuera del sitio, conservando propietario, permisos y ACL
   de producción. Se tomó un respaldo cifrado completo justo antes del cambio.
4. El cambio se hizo en modo mantenimiento, que duró 3,4 segundos. El código
   anterior quedó conservado para revertir. La migración de WooCommerce corrió
   sola con el cron en menos de un minuto y la base quedó en 11.2.2.
5. PHP se actualizó sin reinicios automáticos y se validaron las
   configuraciones de FPM con el binario nuevo. Rosa recargó en caliente,
   sin cambiar el PID, y Licores reinició. En ambas tiendas se confirmó que
   el binario en ejecución es la versión 8.4.28.

## Verificación

- Las lecturas autenticadas con las claves del frontend funcionan e incluyen
  los metadatos de precios mayoristas. Una clave inválida devuelve 401 y una
  consulta de pedidos sin autenticación también.
- El prechequeo de stock de `www.rosapastell.com` funciona: consulta
  WooCommerce en vivo con esas claves.
- JWT responde con normalidad a credenciales y tokens inválidos.
- Estado de tienda: `paused:false`. Las reservas de stock siguen en 30 min.
- Respondieron correctamente la portada, una ficha y una categoría del
  frontend, además de la portada y el POS de Licores.
- No se crearon pedidos, reservas, cobros ni correos. No hubo ensayo de carga.

## Pendientes

- PDF Invoices 6.0 sigue pendiente, por decisión. Es una reescritura completa
  publicada el 16-nov y elimina las traducciones incluidas en favor de los
  paquetes de idioma de WordPress.org, que aquí no se instalan solos. Además
  genera las facturas automáticas del checkout. 5.16.6 conserva los
  endurecimientos de 5.16.5/5.16.6. Probarla aparte cuando haya una 6.0.x.
- Sigue abierto el pendiente de la auditoría anterior: correcciones ESM de
  ImageMagick (requiere Ubuntu Pro).

## Reinicio del sistema (16:19 UTC)

Se reinició el VPS para cargar el kernel 6.8.0-149 y la libc nueva. Antes se
comprobó que todos los servicios estuvieran habilitados para arrancar, que SSH
volviera por `ssh.socket` y que el respaldo programado de las 16:16 hubiera
terminado bien (16:18:26). Rosa volvió en unos 30 segundos.

**Licores no arrancó.** Sus servicios PHP y web declaran inaccesibles, dentro
de su aislamiento de systemd, dos rutas en `/run` de bases QA/trabajo ya
detenidas. `/run` se vacía al reiniciar, y systemd no arranca una unidad si
falta una ruta obligatoria de `InaccessiblePaths=`. Estuvo caído unos 5
minutos (502). Se recrearon esas rutas vacías y solo para root, y se agregó
`ops/rosapastell/licores-isolation-paths.tmpfiles.conf` para que existan en
cada arranque. Las unidades de Licores no se modificaron y el aislamiento
sigue igual.

Después del reinicio: kernel 6.8.0-149, sin reinicio pendiente, 0 unidades
fallidas, PHP 8.4.28 en ambas tiendas, cron y temporizadores de respaldo
activos, firewall activo y certificado vigente. En `www` funcionan la
portada, una ficha, una categoría, el prechequeo de stock y el estado de la
tienda. Licores y su POS responden 200.

## PHP 7.2 y 7.4 apagados (16:25 UTC)

Antes de apagarlos se confirmó que no tenían uso. El nginx cargado solo envía
PHP al socket de Rosa; Licores usa su propio nginx aislado. La única mención
a esas versiones está en el sitio `default`, que no se carga. Ningún servicio
depende de ellos, no había conexiones activas y desde el arranque solo
consumieron la CPU del propio inicio.

Se detuvieron, deshabilitaron y enmascararon `php7.2-fpm` y `php7.4-fpm`,
igual que `php8.4-fpm` genérico. Los paquetes siguen instalados y reciben
actualizaciones; la unidad base de Rosa menciona el binario 7.4, aunque un
override lo reemplaza por 8.4. `nginx -t` es correcto, no hay unidades
fallidas, y Rosa y Licores responden con normalidad.

Para revertir: `systemctl unmask php7.2-fpm php7.4-fpm` y luego
`systemctl enable --now` de ambos.

## Plugins restantes y Jetpack (16:46 UTC)

| Plugin | Antes | Después |
| --- | --- | --- |
| Jetpack | 16.3.1 | 16.4 |
| Checkout Field Editor | 2.2.0 | 2.2.1 |
| JWT Authentication | 1.5.0 | 1.5.1 |

Se usó el mismo método: checksums oficiales para lo instalado y lo nuevo
(solo difieren `readme.txt` y `CHANGELOG.md` de Jetpack, también en el zip
oficial), permisos de producción, respaldo cifrado previo (16:46:24) y
reemplazo por renombrado. El modo mantenimiento duró 0,016 s.

Jetpack 16.4 movió la minigráfica de la barra de administración de
`admin_head` a un nodo de `admin_bar_menu`. Su imagen la pide el backend a
WordPress.com, y la política de salida lo bloquea. Por eso se publicó primero
el MU-plugin `rosapastell-admin-performance` 0.2.0 (commit `3c3ab30`, con
SHA-256 instalado igual al del repositorio), que retira ambos callbacks.
Se comprobó con el `WP_Hook` real y luego con Jetpack 16.4 en producción,
armando la barra en memoria para un administrador. Sin el MU-plugin Jetpack
agregaría la gráfica; con él no aparece, y el enlace a Stats se conserva.

Verificación:
- Versiones activas correctas; WooCommerce sin migraciones pendientes;
  `paused:false` y reserva de stock en 30 min.
- Sin errores PHP desde el cambio.
- JWT (token y validación), `/users/me`, el prechequeo de stock con las
  claves del frontend, el bloqueo de `/wp/v2/users` y de `wc/v3` anónimo, y
  las páginas de `www` (incluidas checkout e ingreso) responden igual.
- No se crearon pedidos ni facturas. El editor de campos no participa en la
  creación de pedidos del frontend, que usa `wc/v3`.

## Acción programada fallida

La única acción fallida de Action Scheduler es del 21-ago-2026, anterior a la
migración. Intentó actualizar el índice de atributos del producto 63450, que
ya había sido borrado. Se comprobó que no quedan filas de ese producto ni
filas huérfanas en ese índice. Es un registro histórico inofensivo: se
conserva sin escribir en la base.

## Reversión

Existe un respaldo privado del core y de los plugins anteriores en el VPS. Si
fuera necesario revertir el código, restaurar solo esos archivos en modo
mantenimiento. No restaurar la base de datos sobre pedidos posteriores. La
migración 11.2.2 solo elimina objetos PHP de atributos por defecto, que
WooCommerce no admite. Volver a PHP 8.4.27 reabriría vulnerabilidades
críticas: preferir corregir hacia adelante.
