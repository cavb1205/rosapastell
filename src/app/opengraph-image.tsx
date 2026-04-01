import { ImageResponse } from "next/og";

export const alt = "Rosa Pastell — Pijamas para Mujer en Colombia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        {/* Left — content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 64px",
          }}
        >
          {/* Brand mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            {/* Simple petal mark */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#D4A0A0",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "#8B3B5E",
                fontFamily: "Georgia, serif",
              }}
            >
              Rosa Pastell
            </span>
          </div>

          {/* Main heading */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "400",
              color: "#3D2B2B",
              lineHeight: "1.1",
              marginBottom: "24px",
              fontFamily: "Georgia, serif",
            }}
          >
            Pijamas para
            <br />
            <span style={{ color: "#8B3B5E" }}>Mujer</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "22px",
              color: "#8B6B6B",
              lineHeight: "1.5",
              marginBottom: "40px",
            }}
          >
            Más de 10 años vistiendo tus sueños.
            <br />
            Envíos a toda Colombia 🇨🇴
          </div>

          {/* CTA pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                background: "#8B3B5E",
                color: "white",
                padding: "12px 28px",
                borderRadius: "999px",
                fontSize: "16px",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              rosapastell.com
            </div>
          </div>
        </div>

        {/* Right — decorative */}
        <div
          style={{
            width: "420px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            background: "#8B3B5E",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "340px",
              height: "340px",
              borderRadius: "50%",
              background: "#7A2E50",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "-60px",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              background: "#9E4B6B",
              display: "flex",
            }}
          />

          {/* Center text */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#D4A0A0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#FFF5F0",
                  display: "flex",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "32px",
                color: "white",
                fontFamily: "Georgia, serif",
                textAlign: "center",
                letterSpacing: "2px",
              }}
            >
              Rosa
              <br />
              Pastell
            </div>
            <div
              style={{
                width: "40px",
                height: "2px",
                background: "#D4A0A0",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: "13px",
                color: "#F8C5C5",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Colombia
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
