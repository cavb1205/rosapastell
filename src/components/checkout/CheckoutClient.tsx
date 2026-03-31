"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/formatters";
import { COLOMBIAN_DEPARTMENTS, WHATSAPP_NUMBER } from "@/lib/constants";
import { useHydration } from "@/hooks/useHydration";
import Link from "next/link";
import type { CreateOrderPayload } from "@/types/order";

const schema = z.object({
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono requerido"),
  department: z.string().min(1, "Selecciona tu departamento"),
  city: z.string().min(2, "Ciudad requerida"),
  address: z.string().min(5, "Dirección requerida"),
  paymentMethod: z.enum(["wompi", "whatsapp"]),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CheckoutClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { items, getTotal, clearCart } = useCartStore();
  const hydrated = useHydration();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: "whatsapp" },
  });

  const paymentMethod = watch("paymentMethod");
  const total = getTotal();

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-warm-100 rounded-xl" />;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-warm-500 mb-4">Tu carrito está vacío.</p>
        <Link
          href="/categorias/pijama-victoria"
          className="inline-flex rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");

    try {
      const orderPayload: CreateOrderPayload = {
        payment_method: data.paymentMethod,
        payment_method_title:
          data.paymentMethod === "wompi"
            ? "Pago en línea (Wompi)"
            : "Transferencia / WhatsApp",
        set_paid: false,
        status: data.paymentMethod === "wompi" ? "pending" : "on-hold",
        billing: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address_1: data.address,
          city: data.city,
          state: data.department,
          country: "CO",
        },
        shipping: {
          first_name: data.firstName,
          last_name: data.lastName,
          address_1: data.address,
          city: data.city,
          state: data.department,
          country: "CO",
          phone: data.phone,
        },
        line_items: items.map((item) => ({
          product_id: item.productId,
          variation_id: item.variationId,
          quantity: item.quantity,
        })),
        customer_note: data.notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error("Error al crear la orden");

      const order = await res.json();
      clearCart();

      if (data.paymentMethod === "whatsapp") {
        const itemLines = items
          .map(
            (i) =>
              `- ${i.name} (Talla ${i.size}) x${i.quantity} - ${formatPrice(i.price * i.quantity)}`
          )
          .join("\n");

        const msg = encodeURIComponent(
          `Hola Rosa Pastell! Mi pedido #${order.number}.\n\n${itemLines}\n\nTotal: ${formatPrice(total)}\n\nNombre: ${data.firstName} ${data.lastName}\nCiudad: ${data.city}\nDirección: ${data.address}\n\nAdjunto comprobante.`
        );

        router.push(
          `/checkout/whatsapp?order=${order.number}&msg=${msg}`
        );
      } else {
        router.push(`/checkout/pago?order_id=${order.id}&total=${total}`);
      }
    } catch {
      setError("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping info */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-heading text-xl text-warm-900 mb-5">
              Información de Envío
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre" error={errors.firstName?.message}>
                <input {...register("firstName")} placeholder="Tu nombre" className={inputClass(!!errors.firstName)} />
              </Field>
              <Field label="Apellido" error={errors.lastName?.message}>
                <input {...register("lastName")} placeholder="Tu apellido" className={inputClass(!!errors.lastName)} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input {...register("email")} type="email" placeholder="tu@email.com" className={inputClass(!!errors.email)} />
              </Field>
              <Field label="Teléfono / WhatsApp" error={errors.phone?.message}>
                <input {...register("phone")} placeholder="+57 300 000 0000" className={inputClass(!!errors.phone)} />
              </Field>
              <Field label="Departamento" error={errors.department?.message}>
                <select {...register("department")} className={inputClass(!!errors.department)}>
                  <option value="">Selecciona...</option>
                  {COLOMBIAN_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Ciudad" error={errors.city?.message}>
                <input {...register("city")} placeholder="Tu ciudad" className={inputClass(!!errors.city)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Dirección" error={errors.address?.message}>
                  <input {...register("address")} placeholder="Calle, número, barrio..." className={inputClass(!!errors.address)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Notas adicionales (opcional)">
                  <textarea {...register("notes")} rows={2} placeholder="Instrucciones de entrega..." className={inputClass(false)} />
                </Field>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-heading text-xl text-warm-900 mb-5">
              Método de Pago
            </h2>
            <div className="space-y-3">
              <label className={`flex gap-4 items-start p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === "whatsapp" ? "border-burgundy-400 bg-burgundy-50" : "border-warm-100 hover:border-warm-200"}`}>
                <input
                  type="radio"
                  value="whatsapp"
                  {...register("paymentMethod")}
                  className="mt-1 accent-burgundy-500"
                />
                <div>
                  <p className="font-semibold text-warm-800">Transferencia / WhatsApp</p>
                  <p className="text-sm text-warm-500 mt-0.5">
                    Paga por transferencia bancaria o Nequi y envía tu comprobante por WhatsApp.
                  </p>
                </div>
              </label>
              <label className={`flex gap-4 items-start p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === "wompi" ? "border-burgundy-400 bg-burgundy-50" : "border-warm-100 hover:border-warm-200"}`}>
                <input
                  type="radio"
                  value="wompi"
                  {...register("paymentMethod")}
                  className="mt-1 accent-burgundy-500"
                />
                <div>
                  <p className="font-semibold text-warm-800">Pago en línea</p>
                  <p className="text-sm text-warm-500 mt-0.5">
                    Tarjeta de crédito/débito, PSE, Nequi o Bancolombia a través de Wompi.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-heading text-xl text-warm-900 mb-4">
              Tu Pedido
            </h2>
            <div className="space-y-3 border-b border-warm-100 pb-4 mb-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variationId}`}
                  className="flex gap-3"
                >
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-cream-100">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-warm-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-warm-400">T: {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-warm-800 flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-warm-900 text-lg mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-3 bg-red-50 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-burgundy-500 px-6 py-4 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Confirmar Pedido"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-warm-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3.5 py-2.5 text-sm text-warm-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 transition-colors ${
    hasError ? "border-red-300" : "border-warm-200 hover:border-warm-300"
  }`;
}
