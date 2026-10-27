# Compatibilidad de archivos PDF — 27/10/2026

## Diagnóstico

La clase de archivos del plugin instalado usa PHP como valor predeterminado
cuando no hay opción guardada. Su pantalla de diagnóstico usa otro fallback,
WordPress, y puede mostrar FTP aunque la escritura PDF use PHP. Las carpetas
temporales PDF observadas eran escribibles; no se debe cambiar el método
global de WordPress para corregir esa discrepancia de diagnóstico.

`wordpress/rosapastell-pdf-compat.php` selecciona explícitamente `php` mediante
el filtro soportado `wpo_wcpdf_filesystem_method`. Alinea la configuración de
ejecución y el diagnóstico solo para PDF. No actualiza opciones, permisos,
numeración, documentos o preferencias de envío. No cambia `FS_METHOD`,
`allow_url_fopen`, conexiones salientes ni el método del resto de WordPress.

El aviso de `allow_url_fopen` desactivado se conserva: no se falsifica el
resultado del chequeo ni se habilitan recursos remotos para ocultarlo.
La ausencia de ese aviso no es criterio para afirmar que una factura es válida.

## Validación y aplicación

Prueba PHP aislada en `tests/pdf-compat.test.php`: solo registra el filtro
PDF y no define el método global, no escribe opciones ni crea documentos.
Validar también sintaxis con PHP 8.4. Instalar como MU-plugin solo después
de commit/push, con comprobación de hash y respaldo de la intervención.
No reiniciar servicios ni tocar las guardas de inventario, pausa o precios.

Verificar en el estado autenticado del plugin que el método PDF sea `php`,
las carpetas sigan escribibles y `allow_url_fopen` siga desactivado. Esta
comprobación no emite facturas ni valida por sí sola todo el documento final.

## Relación con la compra lenta

Se observaron documentos creados como adjuntos de correos nativos asociados
a pedidos grandes. El contraste posterior de fechas mostró que su creación
fue posterior a las peticiones lentas: no debe atribuirse esa demora concreta
a los PDF. El bloqueo de entrega mediante `pre_wp_mail` es posterior a preparar
adjuntos/HTML, por lo que no elimina ese trabajo cuando se dispara. Se necesita
medición por etapas para atribuir el tiempo, no solo correlación entre pedidos.

Mover ese trabajo a segundo plano cambia cuándo está disponible la factura
y necesita una decisión explícita. El propietario lo autorizó después para
la cola nativa de WooCommerce. Es una intervención independiente del método
de archivos: ver `2026-10-27-checkout-diferido.md`. No cambia Resend ni permite
afirmar que la demora histórica quedó resuelta sin medir compras posteriores.

Referencia del proveedor: [código de PDF Invoices](https://github.com/wpovernight/woocommerce-pdf-invoices-packing-slips).

## Aplicación verificada

Código `42042ad75e1c524c25fd5754be5fedd821d0c99c`, subido antes de instalar
el 27/10 a las 23:05:44 UTC. SHA-256 del MU-plugin:
`0df08276b09c4695ca79f3f6a362736629b85d38a1f1680b89faf65b9a7fbc5f`.
La pantalla autenticada mostró `php`, carpetas escribibles y acceso remoto
todavía desactivado. El aviso de acceso remoto permanece visible, sin falsear
el resultado. No se reiniciaron servicios ni se generaron documentos.
