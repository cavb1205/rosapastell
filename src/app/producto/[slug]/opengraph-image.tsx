import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/woocommerce";
import { formatPrice } from "@/lib/formatters";

export const alt = "Producto — Rosa Pastell";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  const productName = product?.name ?? "Pijama Rosa Pastell";
  const price = product?.price ? formatPrice(product.price) : "";
  const category = product?.categories?.[0]?.name ?? "";
  const imageUrl = product?.images?.[0]?.src ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FFF5F0",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Left — product info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 56px",
          }}
        >
          {/* Top: brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#D4A0A0",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                letterSpacing: "5px",
                textTransform: "uppercase",
                color: "#8B3B5E",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Rosa Pastell
            </span>
          </div>

          {/* Middle: product name + category */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {category ? (
              <span
                style={{
                  fontSize: "14px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "#B07070",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {category}
              </span>
            ) : null}

            <div
              style={{
                fontSize: productName.length > 30 ? "44px" : "56px",
                fontWeight: "400",
                color: "#3D2B2B",
                lineHeight: "1.15",
                fontFamily: "Georgia, serif",
              }}
            >
              {productName}
            </div>

            {price ? (
              <div
                style={{
                  fontSize: "32px",
                  color: "#8B3B5E",
                  fontWeight: "700",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {price}
              </div>
            ) : null}
          </div>

          {/* Bottom: shipping badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#F5EBE8",
              padding: "10px 20px",
              borderRadius: "999px",
              width: "fit-content",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: "#7A5050",
                fontFamily: "Arial, sans-serif",
              }}
            >
              🚚 Envíos a toda Colombia
            </span>
          </div>
        </div>

        {/* Right — product image */}
        <div
          style={{
            width: "480px",
            display: "flex",
            alignItems: "stretch",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={productName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#E8D8D8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "80px",
                  color: "#C4A0A0",
                  fontFamily: "Georgia, serif",
                }}
              >
                RP
              </div>
            </div>
          )}

          {/* Overlay gradient at the left edge */}
          <div
            style={{
              position: "absolute",
              inset: "0",
              background: "linear-gradient(to right, #FFF5F0 0%, transparent 30%)",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
