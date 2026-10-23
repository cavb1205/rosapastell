# Checkout con reserva de inventario

Implementación para el backend modernizado (PHP 8.4, WooCommerce 11.2 y MySQL 8.4). Instalar `rosapastell-stock-guard.php` como MU-plugin **junto con** el frontend compatible. No desplegar este frontend contra el backend antiguo: no existe fallback al endpoint sin reservas.

## Comportamiento

- Wompi: pedido pendiente con reserva nativa verificada antes de responder éxito. La reserva usa `woocommerce_hold_stock_minutes` (30 minutos en esta tienda).
- Transferencia/WhatsApp: pedido `on-hold` con descuento de inventario confirmado, no una reserva temporal. Mayoristas siempre siguen esta ruta; el servidor decide rol, método y precios.
- Un bloqueo por propietario real del stock serializa operaciones, agrega líneas duplicadas y variaciones que comparten stock del padre. La reserva nativa también protege frente a otros consumidores de reservas de WooCommerce.
- Las lecturas incompletas, configuración de reservas deshabilitada y errores de persistencia impiden confirmar el pedido. No corregir una sobreventa después de informar éxito.
- Cada intento lleva una clave de idempotencia. Repetir la misma clave y payload recupera el pedido activo sin descontar ni notificar dos veces. Cambiar el payload con esa clave se rechaza. La clave del navegador se conserva durante el intento en la página; no constituye recuperación universal entre dispositivos o tras recargarla.
- Firma Wompi: importe, moneda y expiración se obtienen del pedido y de su reserva; requiere cookie HttpOnly del checkout.
- El webhook verifica la firma y consulta la transacción directamente en Wompi antes de usar su referencia. `WOMPI_PRIVATE_KEY` debe configurarse como variable sensible de servidor, solo Production, con la llave `prv_prod_…` de la cuenta correcta. Nunca usar `NEXT_PUBLIC_` para esa llave. Sin ella el webhook falla cerrado y solicita reintento.
- Los eventos aprobados se procesan bajo bloqueo del pedido; confirmar/repetir un pago no descuenta dos veces. Un rechazo antiguo no revierte una aprobación.
- Una aprobación tardía intenta asignar stock disponible; si ya no existe, guarda `rp-stock-review` (“Pago aprobado — revisar inventario”), visible en administración. No descuenta en negativo ni confirma despacho ni emite reembolso automático. Requiere gestión humana del pago; no es una garantía de que una reserva pueda mantenerse indefinidamente durante un pago asíncrono.
- La pantalla final consulta el pedido sin caché y verifica su cookie. Solo `processing/completed` con fecha de pago muestra compra confirmada. Pendiente, error y revisión no muestran éxito. El correo de creación Wompi indica que aún está pendiente de pago.

## Despliegue y reversión

### Operación temporal solo por transferencia (autorizada el 23 de octubre)

Mantener `NEXT_PUBLIC_WOMPI_ENABLED=false` en Vercel Production y `rp_wompi_enabled=no` (o ausente) en WordPress. Se conservan las llaves existentes. El checkout de todos los clientes usa transferencia/WhatsApp con stock descontado; las APIs de creación Wompi y firma/readiness rechazan nuevas operaciones. La página directa de Wompi informa que está temporalmente deshabilitado.

Esto permite el corte sin `WOMPI_PRIVATE_KEY`, pero no resuelve eventos antiguos pendientes: comprobar los pedidos en tránsito antes de congelar. El webhook no debe devolver éxito a un pago que no verificó/aplicó. Para reactivar Wompi hacen falta la llave privada, ambas opciones habilitadas, despliegue y verificación de nuevo; no basta conservar la llave pública.

1. Conservar backups cifrados y comprobar la llave privada de Wompi configurada, sin extraerla al chat ni al repositorio.
2. Durante el corte coordinado, mantener compras pausadas y conservar el MU-plugin al sincronizar los datos finales.
3. Publicar backend y frontend compatibles; comprobar creación/reserva, roles, firma, webhook, confirmación y liberación antes de reabrir.
4. Revisar pedidos/pagos en tránsito antes de cualquier reversión. Nunca restaurar una base antigua sobre pedidos recientes ni retirar este guard mientras el frontend lo usa.

## Validación

`node --test tests/*.test.cjs` valida lecturas que fallan cerradas, agregación de stock, consulta Wompi y texto del correo. Las pruebas de integración privadas recorren Next.js → WooCommerce con usuarios, claves, productos y pedidos ficticios. Los pagos se simulan fuera del código productivo; no se ejecutan cobros, reembolsos, correos ni mensajes reales. Las evidencias de la migración se conservan en el respaldo privado, no en el repositorio.

Antes de producción queda configurar la llave privada y verificar el entorno definitivo. Las pruebas no certifican carga máxima de un lanzamiento, liquidaciones reales del proveedor ni cambios simultáneos de inventario hechos por otros sistemas/administradores fuera del flujo protegido. Backorders explícitamente permitidos siguen siendo una política del producto, no se cambian silenciosamente.

Referencia oficial de consulta de pagos: https://docs.wompi.co/docs/colombia/seguimiento-de-transacciones/
