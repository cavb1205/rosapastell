export interface CartItem {
  productId: number;
  variationId?: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  slug: string;
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
