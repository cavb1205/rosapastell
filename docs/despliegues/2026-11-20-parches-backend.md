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

- Queda pendiente un reinicio del sistema por kernel y libc, que requiere
  una ventana coordinada.
- No se aplicaron otras actualizaciones sin carácter de seguridad: Jetpack,
  Checkout Field Editor y JWT Auth. Tampoco PDF Invoices 6.0, que es una
  versión mayor y requiere prueba previa.
- Siguen abiertos los pendientes de la auditoría anterior: correcciones ESM
  de ImageMagick y servicios PHP 7.2/7.4 sin uso.

## Reversión

Existe un respaldo privado del core y de los plugins anteriores en el VPS. Si
fuera necesario revertir el código, restaurar solo esos archivos en modo
mantenimiento. No restaurar la base de datos sobre pedidos posteriores. La
migración 11.2.2 solo elimina objetos PHP de atributos por defecto, que
WooCommerce no admite. Volver a PHP 8.4.27 reabriría vulnerabilidades
críticas: preferir corregir hacia adelante.
