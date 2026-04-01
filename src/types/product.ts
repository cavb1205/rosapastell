export interface WooImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  image: WooImage | null;
  count: number;
}

export interface WooAttribute {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable" | "grouped" | "external";
  status: "publish" | "draft" | "pending" | "private";
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  categories: Pick<WooCategory, "id" | "name" | "slug">[];
  images: WooImage[];
  attributes: WooAttribute[];
  variations: number[];
  related_ids: number[];
  date_created: string;
  date_modified: string;
  permalink: string;
  // Precios mayoristas — parseados de _role_based_price en meta_data
  wholesalePrice: number | null;
  wholesaleSalePrice: number | null;
}

export interface WooVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  attributes: {
    id: number;
    name: string;
    slug: string;
    option: string;
  }[];
  image: WooImage;
  // Precios mayoristas — parseados de _role_based_price en meta_data
  wholesalePrice: number | null;
  wholesaleSalePrice: number | null;
}

export interface WooPaginatedResponse<T> {
  data: T[];
  totalPages: number;
  total: number;
}
