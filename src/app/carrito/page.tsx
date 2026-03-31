import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: `Carrito | ${SITE_NAME}`,
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-heading text-3xl text-warm-900 mb-8">Tu Carrito</h1>
      <CartPageClient />
    </div>
  );
}
