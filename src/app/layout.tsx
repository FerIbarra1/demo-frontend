import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "@/components/ui/sonner";
import { StoreGuard } from "@/components/premium";

/* ============================================
   FONT CONFIGURATION - Premium Typography
   ============================================ */

// Inter - Modern sans-serif for UI elements
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

// Playfair Display - Elegant serif for headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

/* ============================================
   METADATA - SEO Optimized
   ============================================ */
export const metadata: Metadata = {
  title: {
    default: "Demo | Tienda de Camisetas Premium",
    template: "%s | Demo",
  },
  description:
    "Descubre nuestro catálogo exclusivo de camisetas premium. Diseños únicos, calidad excepcional, estilo que define tu esencia.",
  keywords: [
    "camisetas premium",
    "ropa de calidad",
    "moda sostenible",
    "tienda online",
    "estilo único",
  ],
  authors: [{ name: "Demo Shop" }],
  creator: "Demo Shop",
  publisher: "Demo Shop",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://demo-shop.com",
    siteName: "Demo Shop",
    title: "Demo | Tienda de Camisetas Premium",
    description:
      "Descubre nuestro catálogo exclusivo de camisetas premium. Diseños únicos, calidad excepcional.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Demo Shop - Camisetas Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo | Tienda de Camisetas Premium",
    description:
      "Descubre nuestro catálogo exclusivo de camisetas premium. Diseños únicos, calidad excepcional.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-16x16.png", sizes: "16x16" },
      { url: "/icons/icon-32x32.png", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/icon-180x180.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Demo Shop",
  },
  category: "ecommerce",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
  colorScheme: "light dark",
};

/* ============================================
   ROOT LAYOUT
   ============================================ */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <StoreGuard>
            {children}
          </StoreGuard>
        </Providers>
        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            className: "font-sans",
          }}
        />
      </body>
    </html>
  );
}
