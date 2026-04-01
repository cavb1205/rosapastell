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
            gap: "32px",
          }}
        >
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#D4A0A0",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "5px",
                color: "#8B3B5E",
                fontFamily: "Arial, sans-serif",
              }}
            >
              ROSA PASTELL
            </div>
          </div>

          {/* Main heading — no <br>, separate divs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
            <div
              style={{
                fontSize: "74px",
                fontWeight: "400",
                color: "#3D2B2B",
                lineHeight: "1.1",
                fontFamily: "Georgia, serif",
              }}
            >
              Pijamas para
            </div>
            <div
              style={{
                fontSize: "74px",
                fontWeight: "400",
                color: "#8B3B5E",
                lineHeight: "1.1",
                fontFamily: "Georgia, serif",
              }}
            >
              Mujer
            </div>
          </div>

          {/* Tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontSize: "21px",
                color: "#8B6B6B",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Más de 10 años vistiendo tus sueños.
            </div>
            <div
              style={{
                fontSize: "21px",
                color: "#8B6B6B",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Envíos a toda Colombia 🇨🇴
            </div>
          </div>

          {/* URL pill */}
          <div style={{ display: "flex" }}>
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

        {/* Right — decorative panel */}
        <div
          style={{
            width: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#8B3B5E",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circle top-right */}
          <div
            style={{
              position: "absolute",
              top: "-90px",
              right: "-90px",
              width: "340px",
              height: "340px",
              borderRadius: "50%",
              background: "#7A2E50",
              display: "flex",
            }}
          />
          {/* Decorative circle bottom-left */}
          <div
            style={{
              position: "absolute",
              bottom: "-70px",
              left: "-70px",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              background: "#9E4B6B",
              display: "flex",
            }}
          />

          {/* Center mark */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {/* Petal circle */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#D4A0A0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#FFF5F0",
                  display: "flex",
                }}
              />
            </div>

            {/* Brand name — separate divs instead of <br> */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0px",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  color: "white",
                  fontFamily: "Georgia, serif",
                  letterSpacing: "2px",
                }}
              >
                Rosa
              </div>
              <div
                style={{
                  fontSize: "32px",
                  color: "white",
                  fontFamily: "Georgia, serif",
                  letterSpacing: "2px",
                }}
              >
                Pastell
              </div>
            </div>

            {/* Divider */}
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
                fontSize: "12px",
                color: "#F8C5C5",
                letterSpacing: "4px",
                fontFamily: "Arial, sans-serif",
              }}
            >
              COLOMBIA
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
