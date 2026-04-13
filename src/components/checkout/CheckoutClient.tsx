"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tag, X, Loader2, CheckCircle2, LogIn, AlertCircle } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/formatters";
import { COLOMBIAN_DEPARTMENTS } from "@/lib/constants";
import { useHydration } from "@/hooks/useHydration";
import Link from "next/link";
import type { CreateOrderPayload, WooCoupon } from "@/types/order";

const schema = z.object({
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono requerido"),
  department: z.string().min(1, "Selecciona tu departamento"),
  city: z.string().min(2, "Ciudad requerida"),
  address: z.string().min(5, "Dirección requerida"),
  paymentMethod: z.literal("whatsapp"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type AppliedCoupon = Pick<WooCoupon, "code" | "discount_type" | "amount" | "minimum_amount">;

function calcDiscount(coupon: AppliedCoupon, subtotal: number): number {
  const amount = parseFloat(coupon.amount);
  if (coupon.discount_type === "percent") return (subtotal * amount) / 100;
  if (coupon.discount_type === "fixed_cart") return Math.min(amount, subtotal);
  return 0;
}

export function CheckoutClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stockError, setStockError] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // Cupón
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const { items, getTotal, clearCart } = useCartStore();
  const { user, isLoading: authLoading } = useAuthStore();
  const hydrated = useHydration();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: "whatsapp" },
  });

  const watchedCity = watch("city") ?? "";
  const isIbague = watchedCity.trim().toLowerCase().replace(/[áàä]/g, "a") === "ibague";
  const shippingType: "local" | "national" | null =
    watchedCity.trim().length >= 2 ? (isIbague ? "local" : "national") : null;

  const subtotal = getTotal();
  const discount = appliedCoupon ? calcDiscount(appliedCoupon, subtotal) : 0;
  const total = subtotal - discount;

  // Pre-llenado desde el perfil
  useEffect(() => {
    if (!user || prefilled) return;

    fetch("/api/cuenta/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((customer) => {
        if (!customer) return;
        const s = customer.shipping;
        const b = customer.billing;

        reset({
          paymentMethod: "whatsapp",
          firstName: s?.first_name || b?.first_name || "",
          lastName: s?.last_name || b?.last_name || "",
          email: b?.email || user.email || "",
          phone: b?.phone || s?.phone || "",
          department: s?.state || b?.state || "",
          city: s?.city || b?.city || "",
          address: s?.address_1 || b?.address_1 || "",
        });
        setPrefilled(true);
      })
      .catch(() => {});
  }, [user, prefilled, reset]);

  // Aplicar cupón
  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);

    try {
      const res = await fetch(`/api/checkout/coupon?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || "Cupón no válido");
        return;
      }

      // Validar monto mínimo
      if (data.minimum_amount && parseFloat(data.minimum_amount) > subtotal) {
        setCouponError(
          `Este cupón requiere un mínimo de ${formatPrice(parseFloat(data.minimum_amount))}`
        );
        return;
      }

      setAppliedCoupon(data);
      setCouponInput("");
    } catch {
      setCouponError("Error al validar el cupón");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    setStockError(false);

    try {
      const orderPayload: CreateOrderPayload = {
        payment_method: "whatsapp",
        payment_method_title: "Transferencia / WhatsApp",
        set_paid: false,
        status: "on-hold",
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
        ...(appliedCoupon && { coupon_lines: [{ code: appliedCoupon.code }] }),
        customer_note: data.notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderPayload,
          _emailMeta: {
            items: items.map((i) => ({
              name: i.name,
              size: i.size,
              quantity: i.quantity,
              price: i.price,
              image: i.image,
            })),
            subtotal,
            discount: discount > 0 ? discount : undefined,
            couponCode: appliedCoupon?.code,
            total,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.stockError) {
          setStockError(true);
          setError("Uno o más productos se agotaron justo antes de confirmar tu pedido.");
        } else {
          setError("Ocurrió un error al procesar tu pedido. Por favor intenta de nuevo.");
        }
        return;
      }

      const order = await res.json();
      clearCart();

      const itemLines = items
        .map(
          (i) =>
            `- ${i.name} (Talla ${i.size}) x${i.quantity} - ${formatPrice(i.price * i.quantity)}`
        )
        .join("\n");

      const couponLine = appliedCoupon
        ? `\nCupón aplicado: ${appliedCoupon.code} (-${formatPrice(discount)})`
        : "";

      const msg = encodeURIComponent(
        `Hola Rosa Pastell! Mi pedido #${order.number}.\n\n${itemLines}${couponLine}\n\nTotal: ${formatPrice(total)}\n\nNombre: ${data.firstName} ${data.lastName}\nCiudad: ${data.city}\nDirección: ${data.address}\n\nAdjunto comprobante.`
      );

      const guestParams = !user
        ? `&guestEmail=${encodeURIComponent(data.email)}&guestName=${encodeURIComponent(data.firstName)}&guestLastName=${encodeURIComponent(data.lastName)}`
        : "";
      router.push(`/checkout/whatsapp?order=${order.number}&msg=${msg}${guestParams}`);
    } catch {
      setError("Ocurrió un error de conexión. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-warm-100 rounded-xl" />;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-warm-500 mb-4">Tu carrito está vacío.</p>
        <Link
          href="/colecciones"
          className="inline-flex rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Ver Colecciones
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Formulario ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Banner de login para invitados */}
          {!authLoading && !user && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-warm-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <LogIn className="h-4 w-4 text-rose-400 shrink-0" />
                <p className="text-sm text-warm-700">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href={`/cuenta/ingresar?redirect=/checkout`}
                    className="font-semibold text-burgundy-500 hover:text-burgundy-700 underline underline-offset-2 transition-colors"
                  >
                    Inicia sesión
                  </Link>{" "}
                  para autocompletar tus datos.
                </p>
              </div>
              <Link
                href={`/cuenta/registro?redirect=/checkout`}
                className="shrink-0 text-xs font-semibold text-warm-400 hover:text-warm-600 transition-colors whitespace-nowrap"
              >
                Crear cuenta
              </Link>
            </div>
          )}

          {/* Aviso pre-llenado */}
          {prefilled && (
            <div className="flex items-center gap-3 rounded-xl bg-sage-50 border border-sage-200 px-5 py-3.5">
              <CheckCircle2 className="h-4 w-4 text-sage-500 shrink-0" />
              <p className="text-sm text-sage-700">
                Datos pre-llenados desde tu perfil. Revisa y ajusta si es necesario.
              </p>
            </div>
          )}

          {/* Información de envío */}
          <section className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
            <div className="px-7 py-5 bg-warm-50 border-b border-warm-100">
              <h2 className="font-heading text-xl text-warm-900">Información de Envío</h2>
            </div>
            <div className="px-7 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Info de envío */}
          {shippingType && (
            <div className={`flex gap-3 rounded-xl border px-5 py-4 ${
              shippingType === "local"
                ? "bg-sage-50 border-sage-200"
                : "bg-blue-50 border-blue-200"
            }`}>
              <span className="text-xl shrink-0">
                {shippingType === "local" ? "🛵" : "📦"}
              </span>
              <div>
                {shippingType === "local" ? (
                  <>
                    <p className="text-sm font-semibold text-sage-800">Envío local — Ibagué</p>
                    <p className="text-sm text-sage-700 mt-0.5">
                      Entregamos en tu dirección dentro de Ibagué. El costo del envío lo pagas al recibir tu pedido.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-blue-800">Envío nacional — Transportadora Envía</p>
                    <p className="text-sm text-blue-700 mt-0.5">
                      Tu pedido llega a cualquier ciudad de Colombia vía Envía. El flete lo pagas directamente a la transportadora al recibir.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Método de pago — campo oculto, siempre whatsapp */}
          <input type="hidden" {...register("paymentMethod")} value="whatsapp" />
        </div>

        {/* ── Resumen del pedido ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 bg-warm-50 border-b border-warm-100">
              <h2 className="font-heading text-xl text-warm-900">Tu Pedido</h2>
            </div>

            {/* Productos */}
            <div className="px-6 py-4 space-y-3 border-b border-warm-100">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variationId}`}
                  className="flex gap-3 items-center"
                >
                  <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-cream-100">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-warm-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-warm-400">T: {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-warm-800 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Cupón */}
            <div className="px-6 py-4 border-b border-warm-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-sage-50 border border-sage-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-sage-500" />
                    <span className="text-sm font-semibold text-sage-700 uppercase">
                      {appliedCoupon.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-sage-400 hover:text-sage-700 transition-colors"
                    aria-label="Quitar cupón"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Código de cupón"
                      className="flex-1 rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-warm-800 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="flex items-center gap-1.5 rounded-xl bg-warm-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-warm-900 disabled:opacity-40 transition-all"
                    >
                      {couponLoading
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Tag className="h-3.5 w-3.5" />}
                      Aplicar
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="px-6 py-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-warm-500">Subtotal</span>
                <span className="text-warm-800">{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-sage-600">
                    Descuento{" "}
                    {appliedCoupon.discount_type === "percent" &&
                      `(${appliedCoupon.amount}%)`}
                  </span>
                  <span className="text-sage-600 font-medium">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="h-px bg-warm-100" />
              <div className="flex justify-between font-bold text-warm-900 text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Error y botón */}
            <div className="px-6 pb-6 space-y-3">
              {error && (
                <div className="flex gap-3 items-start bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="text-sm text-red-600">{error}</p>
                    {stockError && (
                      <Link
                        href="/carrito"
                        className="inline-block text-xs font-semibold text-red-600 underline underline-offset-2 hover:text-red-800 transition-colors"
                      >
                        Revisar carrito →
                      </Link>
                    )}
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-burgundy-500 px-6 py-4 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Procesando..." : "Confirmar Pedido"}
              </button>
            </div>
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
      <label className="block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3.5 text-sm text-warm-800 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:bg-white transition-all ${
    hasError
      ? "border-red-300 focus:border-red-300"
      : "border-warm-300 hover:border-warm-400 focus:border-rose-300"
  }`;
}
