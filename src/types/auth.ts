export interface WPUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  isWholesale: boolean;
}

export interface AuthState {
  user: WPUser | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: WPUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Roles de WordPress que se consideran mayoristas
export const WHOLESALE_ROLES = [
  "wholesale_customer",
  "mayorista",
  "wholesale",
  "b2b_customer",
] as const;
