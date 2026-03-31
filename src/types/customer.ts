export interface WooAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: WooAddress & { email: string };
  shipping: WooAddress;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  billing?: Partial<WooAddress & { email: string }>;
  shipping?: Partial<WooAddress>;
}
