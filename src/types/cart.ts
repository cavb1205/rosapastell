export interface CartVariantAttribute {
  name: string;
  option: string;
}

export interface CartItem {
  productId: number;
  variationId?: number;
  name: string;
  price: number;
  /** Talla (o "Única"). Se conserva por compatibilidad y para mostrar la talla. */
  size: string;
  /** Atributos de la variación elegida (Talla, Color, …) para mostrar al cliente. */
  attributes?: CartVariantAttribute[];
  quantity: number;
  image: string;
  slug: string;
  stockQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variationId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variationId?: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  openDrawer: () => void;
  closeDrawer: () => void;
}
