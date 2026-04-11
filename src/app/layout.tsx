import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Demo - Tienda de Camisetas",
  description: "Sistema de gestión de tienda de camisetas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link
          href="https://fonts.cdnfonts.com/css/neue-montreal"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-neue-montreal" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
