import type { ZodError } from "zod";
import { MAX_CART_LINES, MAX_ITEM_QUANTITY } from "./checkout-limits";

const labels: Record<string, string> = {
  first_name: "nombre", last_name: "apellido", email: "correo electrónico",
  phone: "teléfono", address_1: "dirección", city: "ciudad", state: "departamento", country: "país",
};

/** Solo describe campos; nunca refleja datos personales ni el cuerpo recibido. */
export function orderValidationMessage(error: ZodError): string {
  const issue = error.issues[0];
  const [section, index, field] = issue?.path ?? [];
  if (section === "line_items") {
    if (typeof index !== "number") {
      return issue.code === "too_big"
        ? `El pedido admite hasta ${MAX_CART_LINES} combinaciones de producto, talla y color. Tu carrito se conserva.`
        : "Tu carrito está vacío o no se pudo leer. Revísalo antes de confirmar.";
    }
    return field === "quantity"
      ? `Revisa la cantidad del artículo ${index + 1}: debe ser un número entero entre 1 y ${MAX_ITEM_QUANTITY}.`
      : `Revisa la referencia o variación del artículo ${index + 1} del carrito. No se confirmó el pedido.`;
  }
  if (section === "billing" || section === "shipping") {
    const label = labels[String(index)] ?? "datos de envío";
    if (issue.code === "too_big" && "maximum" in issue) {
      return `El campo ${label} admite máximo ${issue.maximum} caracteres.`;
    }
    return `Revisa el campo ${label}: está incompleto o tiene un formato inválido.`;
  }
  if (section === "customer_note") return "Las observaciones admiten máximo 500 caracteres. Acórtalas sin borrar tu carrito.";
  if (section === "_emailMeta") return "No pudimos leer los datos de uno de los artículos del carrito. Revísalos antes de confirmar; tu carrito se conserva.";
  if (section === "payment_method" || section === "payment_method_title") return "Selecciona nuevamente el método de pago antes de confirmar.";
  return "No pudimos leer los datos del pedido. Revisa el formulario; tu carrito se conserva y no se confirmó el pedido.";
}
