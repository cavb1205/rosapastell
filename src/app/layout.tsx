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
import { CartDrawer } from "@/components/cart/CartDrawer";
import { RegisterModal } from "@/components/auth/RegisterModal";
import { CartToastContainer } from "@/components/ui/CartToast";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSerif.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect a orígenes externos para reducir latencia */}
        <link rel="preconnect" href="https://www.rosapastell.com" />
        <link rel="preconnect" href="https://i0.wp.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CartDrawer />
          <RegisterModal />
          <CartToastContainer />
          <Analytics />
        </AuthProvider>
        <GoogleAnalytics gaId="G-DLZ93LHGPN" />
      </body>
    </html>
  );
}
