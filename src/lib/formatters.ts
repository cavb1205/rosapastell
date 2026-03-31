export function formatPrice(price: string | number): string {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

export function formatWhatsAppMessage(
  orderId: string,
  items: { name: string; size: string; quantity: number; price: number }[],
  total: number,
  customer: { name: string; city: string; address: string }
): string {
  const itemLines = items
    .map(
      (item) =>
        `- ${item.name} (Talla ${item.size}) x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    )
    .join("\n");

  return encodeURIComponent(
    `Hola Rosa Pastell! Acabo de realizar mi pedido #${orderId}.\n\n` +
      `Resumen:\n${itemLines}\n\n` +
      `Total: ${formatPrice(total)}\n\n` +
      `Nombre: ${customer.name}\n` +
      `Ciudad: ${customer.city}\n` +
      `Dirección: ${customer.address}\n\n` +
      `Adjunto comprobante de pago.`
  );
}
