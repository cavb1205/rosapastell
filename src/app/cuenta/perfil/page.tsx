import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Crown } from "lucide-react";
import { getUserFromCookie } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import { LogoutButton } from "@/components/cuenta/LogoutButton";
import { PersonalDataForm } from "@/components/cuenta/PersonalDataForm";
import { AddressForm } from "@/components/cuenta/AddressForm";
import { PasswordForm } from "@/components/cuenta/PasswordForm";
import type { WooCustomer } from "@/types/customer";

export const metadata: Metadata = {
  title: `Mi Perfil | ${SITE_NAME}`,
  robots: { index: false },
};

async function fetchCustomer(userId: number): Promise<WooCustomer | null> {
  const WP_URL = process.env.WOOCOMMERCE_URL!;
  const CK = process.env.WOOCOMMERCE_CONSUMER_KEY!;
  const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET!;
  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/customers/${userId}?consumer_key=${CK}&consumer_secret=${CS}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PerfilPage() {
  const user = await getUserFromCookie();
  if (!user) redirect("/cuenta/ingresar");

  const customer = await fetchCustomer(user.id);

  const emptyAddress = {
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "CO",
    phone: "",
    email: "",
  };

  const billing = customer?.billing ?? emptyAddress;
  const shipping = customer?.shipping ?? emptyAddress;

  return (
    <div className="min-h-screen bg-warm-50">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-burgundy-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-burgundy-700 opacity-40" />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-rose-900 opacity-20" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(212,160,160,0.5) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/cuenta"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-rose-300/60 hover:text-rose-300 transition-colors mb-4"
          >
            ← Mi cuenta
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-300/60 mb-2">
                Configuración
              </p>
              <h1 className="font-heading text-4xl text-white">Mi Perfil</h1>
              <p className="mt-1.5 text-rose-200/60 text-sm">{user.email}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              {user.isWholesale && (
                <span className="flex items-center gap-1.5 rounded-full bg-burgundy-700 border border-burgundy-500 px-3 py-1.5 text-xs font-semibold text-rose-200">
                  <Crown className="h-3.5 w-3.5" />
                  Mayorista
                </span>
              )}
              <LogoutButton variant="dark" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* Datos personales */}
        <PersonalDataForm
          firstName={customer?.first_name ?? user.name.split(" ")[0]}
          lastName={customer?.last_name ?? user.name.split(" ").slice(1).join(" ")}
          email={user.email}
          phone={billing.phone ?? ""}
        />

        {/* Dirección de envío */}
        <AddressForm type="shipping" address={shipping} />

        {/* Dirección de facturación */}
        <AddressForm type="billing" address={billing} />

        {/* Contraseña */}
        <PasswordForm />

        {/* Volver */}
        <div className="text-center pt-2 pb-4">
          <Link
            href="/cuenta"
            className="inline-flex items-center gap-1.5 text-sm text-warm-400 hover:text-burgundy-500 transition-colors"
          >
            ← Volver a mi cuenta
          </Link>
        </div>

      </div>
    </div>
  );
}
