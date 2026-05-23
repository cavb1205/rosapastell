import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Dominio actual de WordPress (producción)
      { protocol: "https", hostname: "www.rosapastell.com" },
      { protocol: "https", hostname: "rosapastell.com" },
      // Subdominio API tras migración DNS
      { protocol: "https", hostname: "api.rosapastell.com" },
      // CDN Jetpack/WordPress.com para imágenes
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.wompi.co https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://www.rosapastell.com https://api.rosapastell.com https://i0.wp.com https://i1.wp.com https://i2.wp.com https://www.google-analytics.com",
              "font-src 'self' data:",
              "connect-src 'self' https://api.rosapastell.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://checkout.wompi.co https://vitals.vercel-insights.com",
              "frame-src 'self' https://checkout.wompi.co",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // ── Productos ─────────────────────────────────────────────────────────
      // WordPress: /shop/{categoria}/{slug}/  →  /producto/{slug}
      {
        source: "/shop/:category/:slug",
        destination: "/producto/:slug",
        permanent: true,
      },
      // WordPress: /shop/{slug}/  (sin categoría en la URL)
      {
        source: "/shop/:slug",
        destination: "/producto/:slug",
        permanent: true,
      },
      // WordPress inglés: /product/{slug}/
      {
        source: "/product/:slug",
        destination: "/producto/:slug",
        permanent: true,
      },

      // ── Categorías ────────────────────────────────────────────────────────
      // WordPress: /categoria-producto/{slug}/
      {
        source: "/categoria-producto/:slug",
        destination: "/categorias/:slug",
        permanent: true,
      },
      // WordPress: /categoria-producto/{slug}/page/{n}/
      {
        source: "/categoria-producto/:slug/page/:page",
        destination: "/categorias/:slug?page=:page",
        permanent: true,
      },
      // WordPress inglés: /product-category/{slug}/
      {
        source: "/product-category/:slug",
        destination: "/categorias/:slug",
        permanent: true,
      },

      // ── Tienda general ────────────────────────────────────────────────────
      // WordPress: /shop/  →  /colecciones
      {
        source: "/shop",
        destination: "/colecciones",
        permanent: true,
      },
      // WordPress: /tienda/
      {
        source: "/tienda",
        destination: "/colecciones",
        permanent: true,
      },

      // ── Páginas de cuenta ─────────────────────────────────────────────────
      {
        source: "/cart",
        destination: "/carrito",
        permanent: true,
      },
      {
        source: "/my-account",
        destination: "/cuenta",
        permanent: true,
      },
      {
        source: "/my-account/:path*",
        destination: "/cuenta",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
