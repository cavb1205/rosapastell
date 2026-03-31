export const SITE_NAME = "Rosa Pastell";
export const SITE_DESCRIPTION =
  "Pijamas para mujer en Colombia. Envíos a todo el país. Más de 10 años vistiendo tus sueños.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rosapastell.com";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573156082381";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const SIZES = ["XS", "S", "M", "L", "XL", "Única"] as const;

export const COLOMBIAN_DEPARTMENTS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
] as const;

export const SORT_OPTIONS = [
  { value: "popularity", label: "Más populares" },
  { value: "date", label: "Más recientes" },
  { value: "price", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/colecciones", label: "Colecciones" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/como-comprar", label: "Cómo Comprar" },
] as const;

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/rosapastell",
  instagram: "https://www.instagram.com/rosapastell",
} as const;
