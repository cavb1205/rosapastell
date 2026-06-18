import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";

// NEXT_PUBLIC_SITE_URL se configura en Vercel solo para el entorno "Production"
// (con el dominio real). En Preview no se define → cae a VERCEL_URL (la URL del deployment).
const metadataBaseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_URL
  ? new URL(`https://${process.env.VERCEL_URL}`)
  : new URL(SITE_URL);
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { StoreStatusProvider } from "@/components/StoreStatusProvider";
import { getStoreStatus } from "@/lib/woocommerce";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { RegisterModal } from "@/components/auth/RegisterModal";
import { CartToastContainer } from "@/components/ui/CartToast";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: `${SITE_NAME} | Pijamas para Mujer en Colombia`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Pijamas para Mujer en Colombia`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: "@rosapastell_",
    title: `${SITE_NAME} | Pijamas para Mujer en Colombia`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "vIAQF1Z6BY0ZIpmsqXvsP0VwszuOn5nsDDNcV2vZ49I",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
    languages: { "es-CO": SITE_URL },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeStatus = await getStoreStatus();

  return (
    <html
      lang="es-CO"
      className={`${dmSerif.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect al CDN de imágenes (LCP en producto/categoría sale de aquí) */}
        <link rel="preconnect" href="https://i0.wp.com" crossOrigin="anonymous" />
        {/* API server-side: solo adelantamos el DNS */}
        <link rel="dns-prefetch" href="https://api.rosapastell.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <StoreStatusProvider value={storeStatus}>
          <AuthProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-burgundy-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              Saltar al contenido principal
            </a>
            <SiteHeader />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
            <CartDrawer />
            <RegisterModal />
            <CartToastContainer />
            <Analytics />
          </AuthProvider>
        </StoreStatusProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DLZ93LHGPN"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-DLZ93LHGPN');`}
        </Script>
      </body>
    </html>
  );
}
