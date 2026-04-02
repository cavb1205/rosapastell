import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.rosapastell.com",
      },
      {
        protocol: "https",
        hostname: "rosapastell.com",
      },
      {
        protocol: "https",
        hostname: "i0.wp.com",
      },
    ],
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
