export interface OrderLineItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
  name?: string;
  price?: string;
}

export interface OrderShipping {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  state: string;
  country: string;
  phone: string;
}

export interface OrderBilling {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_1: string;
  city: string;
  state: string;
  country: string;
}

export interface CreateOrderPayload {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  status: "pending" | "on-hold" | "processing";
  billing: OrderBilling;
  shipping: OrderShipping;
  line_items: OrderLineItem[];
  customer_note?: string;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  subtotal?: string;
  shipping_total: string;
  discount_total: string;
  currency: string;
  date_created: string;
  date_modified: string;
  customer_id: number;
  customer_note: string;
  payment_method: string;
  payment_method_title: string;
  billing: OrderBilling;
  shipping: OrderShipping;
  line_items: {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    price: number;
    subtotal: string;
    total: string;
    image: { src: string };
    meta_data: { key: string; display_key: string; display_value: string }[];
  }[];
}
