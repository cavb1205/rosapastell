import type { WooProduct, WooVariation, WooAttribute } from "@/types/product";
import type { CartVariantAttribute } from "@/types/cart";

/**
 * Capa genérica de variaciones. El catálogo maneja productos con uno o varios
 * ejes de variación (las pijamas solo "Talla"; las prendas deportivas
 * "Talla" + "Color"). WooCommerce genera una variación por cada combinación de
 * opciones, así que para resolver UNA variación hay que elegir una opción en
 * cada eje.
 *
 * El emparejamiento se hace por NOMBRE de atributo en minúsculas (no por id):
 * los atributos custom de WooCommerce tienen id 0 y no son únicos.
 */

const norm = (s: string) => s.trim().toLowerCase();

/** Ejes de variación del producto (atributos con variation:true), ordenados. */
export function getVariationAxes(product: WooProduct): WooAttribute[] {
  return product.attributes
    .filter((a) => a.variation)
    .sort((a, b) => a.position - b.position);
}

/** Opción que una variación tiene para un eje dado (por nombre), o null. */
export function getVariationOption(
  variation: WooVariation,
  axisName: string
): string | null {
  const attr = variation.attributes.find((a) => norm(a.name) === norm(axisName));
  return attr?.option ?? null;
}

/** ¿Esta variación corresponde a la talla? (eje "talla") */
export function getSizeFromVariation(variation: WooVariation | null): string {
  if (!variation) return "Única";
  return getVariationOption(variation, "talla") ?? "Única";
}

/**
 * Resuelve la variación que coincide con TODAS las opciones seleccionadas.
 * `selection` está indexado por nombre de eje en minúsculas. Devuelve null
 * mientras falte elegir algún eje.
 */
export function findVariation(
  axes: WooAttribute[],
  variations: WooVariation[],
  selection: Record<string, string>
): WooVariation | null {
  if (axes.length === 0) return variations[0] ?? null;
  if (axes.some((axis) => !selection[norm(axis.name)])) return null;

  return (
    variations.find((v) =>
      axes.every(
        (axis) => getVariationOption(v, axis.name) === selection[norm(axis.name)]
      )
    ) ?? null
  );
}

/**
 * ¿La opción `option` del eje `axisName` está disponible dadas las otras
 * selecciones actuales? Disponible = existe al menos una variación en stock con
 * esa opción que respete las elecciones hechas en los demás ejes.
 */
export function isOptionAvailable(
  axes: WooAttribute[],
  variations: WooVariation[],
  selection: Record<string, string>,
  axisName: string,
  option: string
): boolean {
  const others = axes.filter((a) => norm(a.name) !== norm(axisName));

  return variations.some((v) => {
    if (v.stock_status === "outofstock") return false;
    if (getVariationOption(v, axisName) !== option) return false;
    return others.every((axis) => {
      const chosen = selection[norm(axis.name)];
      return !chosen || getVariationOption(v, axis.name) === chosen;
    });
  });
}

/** Atributos de la variación seleccionada, ordenados por eje, para el carrito. */
export function buildCartAttributes(
  axes: WooAttribute[],
  variation: WooVariation
): CartVariantAttribute[] {
  return axes
    .map((axis) => {
      const option = getVariationOption(variation, axis.name);
      return option ? { name: axis.name, option } : null;
    })
    .filter((a): a is CartVariantAttribute => a !== null);
}

/** Texto legible de la variante: "Talla: M · Color: Negro". */
export function variantText(
  attributes: CartVariantAttribute[] | undefined,
  fallbackSize?: string
): string {
  if (attributes && attributes.length > 0) {
    return attributes.map((a) => `${a.name}: ${a.option}`).join(" · ");
  }
  return fallbackSize ? `Talla: ${fallbackSize}` : "";
}

/** Versión compacta solo con las opciones: "M · Negro" (para resúmenes). */
export function variantSummary(
  attributes: CartVariantAttribute[] | undefined,
  fallbackSize?: string
): string {
  if (attributes && attributes.length > 0) {
    return attributes.map((a) => a.option).join(" · ");
  }
  return fallbackSize ?? "";
}

/** ¿El producto tiene un eje de variación llamado "color"? */
export function hasColorAxis(product: WooProduct): boolean {
  return product.attributes.some((a) => a.variation && norm(a.name) === "color");
}

/** Opciones del eje "color" del producto (para los listados). */
export function getColorOptions(product: WooProduct): string[] {
  const axis = product.attributes.find(
    (a) => a.variation && norm(a.name) === "color"
  );
  return axis?.options ?? [];
}
