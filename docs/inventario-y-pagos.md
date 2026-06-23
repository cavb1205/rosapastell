# Inventario y pagos — estrategia anti-sobreventa

Documento operativo. Explica cómo evitamos vender productos sin stock (crítico
en lanzamientos de colección) y cómo se rutean los pagos. **Parte de esto vive en
el código y parte en la configuración de WooCommerce: ambas son necesarias.**

## El problema

La REST API de WooCommerce **no valida stock al crear pedidos**: si se le pide
crear una orden de un ítem agotado, la crea igual y deja el inventario en
negativo (visto en producción: variación `#62048` quedó en `0 → -1`). Además, el
frontend muestra stock cacheado (ISR + carrito en `localStorage`), así que un
cliente puede intentar comprar algo que ya se agotó.

## Defensa en capas

| Capa | Qué cubre | Dónde |
|------|-----------|-------|
| 1. Pre-chequeo de stock | Cliente con página/carrito cacheado | `src/lib/stock.ts` → `findInsufficientStock`, llamado en `POST /api/orders` antes de crear el pedido |
| 2. Guarda post-creación | Carrera de concurrencia por la última unidad (flujo WhatsApp/`on-hold`, que descuenta stock al crearse) | `src/lib/stock.ts` → `findOversold`, en `POST /api/orders` tras `createOrder` |
| 3. Aviso temprano | UX: avisar antes de llenar el formulario | `POST /api/checkout/stock` + banner en `CheckoutClient` |
| 4. Reserva de inventario | Ventana de pago de Wompi (`pending` no descuenta stock) | **WooCommerce** (no código) |

### Detalles

- **Todas las funciones de `lib/stock.ts` son fail-open**: si no se puede
  verificar un ítem (red caída, etc.) no bloquean, para no congelar ventas por un
  fallo transitorio del backend. Respetan `backorders_allowed` (si el dueño
  permite backorders en un producto, no se bloquea).
- **Capa 2 (post-creación):** si tras crear el pedido el stock quedó negativo, el
  pedido perdió la carrera → se **cancela** vía `updateOrder` (WooCommerce
  restaura el stock) y se devuelve `stockError` (HTTP 409). La cancelación se
  marca con la meta `_rp_autocancel_oversold = yes` para que el webhook
  `POST /api/webhooks/woocommerce` **no envíe** el email de "pedido cancelado"
  (sería confuso tras el mensaje de "agotado").
- El checkout muestra el mensaje de agotado + link "Revisar carrito" tanto para
  el 400 (pre-chequeo) como para el 409 (post-creación).

## Pagos

- **Wompi** (tarjeta / PSE / Nequi): EN PRODUCCIÓN. Se muestra **solo a clientes
  retail** — condición `!isWholesale && WOMPI_ENABLED` en `CheckoutClient`. El
  pedido se crea como `pending` y el cliente va al widget de pago; el webhook
  `POST /api/webhooks/wompi` lo pasa a `processing` (APPROVED) y ahí WooCommerce
  descuenta el stock.
- **WhatsApp / transferencia**: el pedido se crea como `on-hold` (descuenta stock
  al crearse) y el cliente recibe los datos de pago por WhatsApp. **Todos los
  pedidos mayoristas pasan por aquí** (no ven Wompi).

## Configuración requerida en WooCommerce

Estos ajustes son parte de la defensa y **deben mantenerse**:

1. **Ajustes → Productos → Inventario → "Reservar inventario (minutos)" = 30**
   (activo). Mantiene el stock reservado para pedidos Wompi `pending` sin pagar y
   los auto-cancela a los 30 min. Sin esto, varios clientes podrían pagar la misma
   última unidad (las capas 1 y 2 del código no ven la ventana de pago de Wompi).
2. **Backorders = "No permitir"** en los productos (sobre todo de lanzamiento), si
   no se quiere vender sin stock. La capa de código respeta este ajuste.
3. Tras cualquier sobreventa histórica, **corregir el stock negativo** que haya
   quedado (p. ej. `#62048` quedó en `-1`).
