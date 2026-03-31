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
      {
        source: "/categoria-producto/:slug",
        destination: "/categorias/:slug",
        permanent: true,
      },
      {
        source: "/categoria-producto/:slug/page/:page",
        destination: "/categorias/:slug?page=:page",
        permanent: true,
      },
      {
        source: "/shop/:category/:slug",
        destination: "/producto/:slug",
        permanent: true,
      },
      {
        source: "/product/:slug",
        destination: "/producto/:slug",
        permanent: true,
      },
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
    ];
  },
};

export default nextConfig;
