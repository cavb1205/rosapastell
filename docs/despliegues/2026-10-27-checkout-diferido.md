# Trabajo nativo diferido y medición del checkout — 27/10/2026

## Decisión autorizada

El propietario autorizó conservar facturas automáticas pero prepararlas en
segundo plano, aceptando que puedan aparecer unos minutos después del pedido.
Se usa la cola transaccional nativa de WooCommerce, que incluye los adjuntos
PDF cuando corresponden. Se aplica solo al backend de Rosa, no al POS de Licores.
También difiere la preparación de otros correos transaccionales nativos de Woo;
no habilita su entrega, que conserva el bloqueo existente. Resend no cambia.

La ruta de confirmación, reserva/descuento de stock, estados, idempotencia y
numeración de documentos siguen a cargo de sus implementaciones originales.
No se eliminan documentos ni se crea una cola propia. El filtro requiere
WooCommerce con `DeferredEmailQueue` soportada y preserva el comportamiento
anterior si no está disponible. Core conserva su fallback síncrono para
argumentos no representables y su procesamiento de tareas ya programadas
incluso si posteriormente se retira este filtro.

No es prueba de que PDF causara una compra histórica lenta: las fechas de
creación de esos documentos resultaron posteriores al checkout. Se considera
una mejora preventiva de separación de trabajo y se mide antes de prometer
una reducción de tiempos.

## Medición privada sin modificar respuestas

`wordpress/rosapastell-checkout-performance.php` incluye un observador que
solo se activa en POST `/wc/v3/rp-checkout/orders`. Sus filtros devuelven los
mismos objetos/respuestas. No llama a funciones de stock, pedidos o documentos.

Por petición guarda en un archivo privado:

- Fecha, PID, HTTP, cantidad de líneas y cantidad de consultas, sin SQL.
- Duración del callback REST y tiempos relativos a preparación/inserción.
- Tiempo agregado de guardados exteriores de pedido y número de guardados.

Los tiempos son inclusivos y relativos: no sumarlos como fases independientes.
No contienen ID/clave de pedido, usuario, IP, correo, dirección, cantidades
por producto, nombres, SKU, precios, parámetros o mensajes de error. Un fallo
del registro no debe sustituir ni impedir la respuesta de compra.

Log: `/var/log/rosa-stage/checkout-timing.jsonl`, 0640 del usuario PHP de Rosa,
fuera del sitio web. Se añade a la rotación privada existente: diaria, siete
históricos, compresión diferida. El escritor abre el archivo en cada append;
no requiere señal/reinicio para rotarlo. No subir telemetría al repositorio.

## Verificación sin efectos comerciales

- Prueba PHP con peticiones/pedidos sintéticos y la clase de cola instalada,
  sin bootstrap WordPress, base, correo o PDF. Comprueba encolado, despacho
  repetido sin duplicados, restauración de referencia y fallback de core.
- Prueba del observador: rutas ajenas ignoradas, respuesta/error preservados,
  campos limitados, guardados anidados sin doble conteo y fallo de log inocuo.
- `ops/rosapastell/verify-checkout-performance.php` es una sonda local fuera
  del document root. Solo consulta wiring de callbacks/configuración, sin
  disparar cambios de estado o encolar trabajos. No publicarla como endpoint.
- Las compras reales siguientes, no pedidos de prueba en producción, aportan
  la medición de tiempos. Hasta entonces no prometer capacidad ni latencia.

## Despliegue y reversión

Subir commit antes de instalar el MU-plugin. Respaldar el rotador anterior,
comprobar hashes, validar PHP/logrotate y preparar el log con permisos privados.
No reiniciar PHP ni ejecutar manualmente la cola contra pedidos reales como
prueba. Confirmar callbacks y el temporizador normal del cron.

Para revertir, mover solo este MU-plugin a un respaldo privado, conservar
registros y permitir que core procese sus tareas ya encoladas. No borrar la
cola, restaurar bases o reenviar pedidos. El parche PDF de archivos es
independiente; no retirar las guardas de inventario o pausa.

Referencia primaria: [WC_Emails](https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce/includes/class-wc-emails.php).
