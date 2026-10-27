# Rosa Pastell — Precios por rol

Registro de versionado del 27/10/2026: el archivo local coincide con el plugin
activo por SHA-256
`7b9c07e81bd8d13cb226d29a6c0021b13af17d641b0542918519a9700edb684a`.
Se incorpora al repositorio sin reinstalarlo ni modificar sus datos. La sección
de despliegue por etapas de abajo conserva el procedimiento de transición;
no significa que el plugin siga pendiente de activar.

`rosapastell-role-pricing.php` reemplaza el plugin cerrado `woocommerce-role-based-price`. Es un plugin normal, instalado en `wp-content/plugins/rosapastell-role-pricing/`; no es el MU-plugin de pausa de tienda.

## Contrato conservado

- Lee `_role_based_price[rol][regular_price|selling_price]` y `_enable_role_based_price`; no migra, normaliza ni borra registros al activarse.
- Conserva reglas de `mayorista`, `customer`, `logedout` y otros roles ya guardados. El primer rol del usuario se usa en WooCommerce como hacía el plugin anterior; no modifica roles de usuarios.
- Preserva la regla efectiva del legado: cero explícito no significa campo vacío; si solo hay un componente se utiliza como alternativa del otro. No cambia calendarios de ofertas ni reglas de promociones durante el reemplazo.
- Las variaciones se editan independientemente; el precio del padre variable no se aplica implícitamente a todas las combinaciones.
- No crea una API pública para precios. La API WooCommerce autenticada conserva sus metadatos. El lector Next.js existente no se modifica.
- La opción `rp_role_pricing_allowed_roles` se fija a los roles permitidos por el plugin anterior durante la transición. En una instalación nueva el valor por defecto es `mayorista`, `customer`, `logedout`.

## Edición y protección

Editor nativo en la ficha de producto y en cada variación. Guardado con permiso `edit_post` sobre ese producto, nonce ligado al ID, y marcador final para rechazar formularios truncados. Solo admite los dos campos de importe conocidos; valida toda la entrada antes de escribir. Las reglas no enviadas y campos heredados adicionales se conservan. No modifica `_price`, `_regular_price`, `_sale_price`, stock, pedidos ni usuarios.

La caché de variaciones incluye el rol; cambios de metadatos invalidan la caché del producto padre. La versión 0.1.1 agrega una revisión local por producto para invalidar también el array en memoria de WooCommerce tras editar dentro de la misma petición; no escribe contadores en la base ni deshabilita la caché del catálogo. Si el plugin antiguo está activo, el nuevo no registra filtros dobles y muestra un aviso al administrador. No ejecutar ambos como configuración final.

El checkbox conserva el alcance del flag legado en WooCommerce. La aplicación Next.js lee metadatos directamente y ya manejaba ese flag/roles por su propia lógica; no se ha cambiado esa política en este plugin. La validación del checkout completo debe comprobar ambos recorridos antes del corte.

## Despliegue por etapas

1. Guardar punto de reversión cifrado de código/configuración y base, con comprobación de restaurabilidad.
2. Capturar precios de referencia y huella de metadatos; instalar este archivo sin activar.
3. En la copia aislada: conservar roles permitidos, desactivar el plugin antiguo sin desinstalar datos y activar este plugin. Nunca hacerlo primero en producción.
4. Comparar los precios y metadatos antes/después; ejecutar pruebas de permisos, caché por rol, variaciones y stock. Ante una diferencia no aprobada, detener la promoción y volver al punto de reversión.
5. Tras validar, retirar el código antiguo a una cuarentena privada recuperable fuera del document root. No borrar metadatos ni datos de clientes.

Barcodes y POS se excluyeron de esta migración por decisión del propietario. No hay dependencias de YITH en el reemplazo y sus datos históricos no se borran.

La versión 0.1.0 se validó inicialmente en WordPress 6.0.17/WooCommerce 7.7.2/PHP 7.4 con backports. La 0.1.1 pasó 49 pruebas del módulo sobre WordPress 7.1.3/WooCommerce 11.2.1/PHP 7.4, incluidos ambos algoritmos de hash y lectura tras editar. Son pruebas del clon privado. Antes de producción: repetir con PHP soportado, validar UI administrativa y el flujo Next.js/JWT/WhatsApp/Wompi sandbox, y mantener el módulo bajo revisión en futuras actualizaciones de WooCommerce.
