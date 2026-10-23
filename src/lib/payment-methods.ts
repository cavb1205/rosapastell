// Explicit opt-in: keeping Wompi keys configured must not enable new payments.
export function isWompiCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_WOMPI_ENABLED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY) &&
    !process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.includes("xxx");
}
