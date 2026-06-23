import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(128),
});

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(30).optional().default(""),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

export const reviewSchema = z.object({
  product_id: z.number().int().positive(),
  review: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5),
  reviewer: z.string().min(1).max(100),
  reviewer_email: z.string().email().max(255),
});

export const passwordSchema = z.object({
  password: z.string().min(8).max(128),
});

const addressSchema = z.object({
  first_name: z.string().max(100),
  last_name: z.string().max(100),
  address_1: z.string().max(255),
  city: z.string().max(100),
  state: z.string().max(100),
  country: z.string().max(2),
  phone: z.string().max(30).optional(),
}).partial();

export const profileUpdateSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  billing: addressSchema.optional(),
  shipping: addressSchema.optional(),
}).strict();

const lineItemSchema = z.object({
  product_id: z.number().int().positive(),
  variation_id: z.number().int().optional(),
  quantity: z.number().int().min(1).max(99),
});

export const orderSchema = z.object({
  payment_method: z.string().min(1).max(50),
  payment_method_title: z.string().max(100),
  set_paid: z.boolean(),
  status: z.enum(["pending", "on-hold", "processing"]),
  billing: z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone: z.string().min(1).max(30),
    address_1: z.string().min(1).max(255),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    country: z.string().max(2),
  }),
  shipping: z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    address_1: z.string().min(1).max(255),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    country: z.string().max(2),
    phone: z.string().max(30).default(""),
  }),
  line_items: z.array(lineItemSchema).min(1),
  coupon_lines: z.array(z.object({ code: z.string().max(50) })).optional(),
  customer_note: z.string().max(500).optional(),
  _emailMeta: z.object({
    items: z.array(z.object({
      name: z.string(),
      size: z.string(),
      variant: z.string().optional(),
      quantity: z.number(),
      price: z.number(),
      image: z.string().optional(),
    })),
    subtotal: z.number(),
    discount: z.number().optional(),
    couponCode: z.string().optional(),
    total: z.number(),
  }).optional(),
});
