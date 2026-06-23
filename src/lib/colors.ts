/**
 * Mapa de nombres de color (como los nombra el cliente en WooCommerce) a un hex
 * para pintar el puntito/swatch. Es solo presentación: si un color no está en el
 * mapa, el componente muestra un swatch neutro. Mantener en minúsculas y sin
 * tildes (la búsqueda normaliza la entrada).
 */
const COLOR_HEX: Record<string, string> = {
  "palo de rosa": "#D9A7A7",
  rosa: "#F89BBB",
  "rosa pastel": "#F7C5D4",
  fucsia: "#D6336C",
  rojo: "#D7263D",
  vinotinto: "#7B1E3A",
  "azul bebe": "#A7C7E7",
  azul: "#2D6CDF",
  "azul rey": "#1E3A8A",
  celeste: "#9BD3E8",
  verde: "#4CAF50",
  "verde militar": "#5A6B3B",
  "verde menta": "#A8E6CF",
  amarillo: "#F6C744",
  mostaza: "#D4A017",
  naranja: "#F2792B",
  cafe: "#6F4E37",
  marron: "#6F4E37",
  beige: "#E8D8C3",
  crema: "#F3E9DC",
  blanco: "#FFFFFF",
  negro: "#1A1A1A",
  gris: "#9CA3AF",
  "gris claro": "#D1D5DB",
  morado: "#7C3AED",
  lila: "#C3A6E0",
  durazno: "#FFD7B5",
  coral: "#FF7F6B",
  turquesa: "#40C4B7",
};

const normalize = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita tildes y diacríticos

/** Hex para un nombre de color, o null si no se reconoce. */
export function colorToHex(name: string): string | null {
  return COLOR_HEX[normalize(name)] ?? null;
}

/** El swatch necesita borde visible cuando el color es muy claro/blanco. */
export function colorNeedsBorder(hex: string | null): boolean {
  if (!hex) return true;
  const h = hex.replace("#", "");
  if (h.length !== 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // Luminancia percibida — claros necesitan borde para no perderse en el fondo
  return 0.299 * r + 0.587 * g + 0.114 * b > 220;
}
