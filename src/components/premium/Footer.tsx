"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, Globe, Mail, MessageCircle, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  shop: {
    title: "Tienda",
    links: [
      { label: "Novedades", href: "/catalogo?sort=newest" },
      { label: "Más vendidos", href: "/catalogo?sort=bestsellers" },
      { label: "Colecciones", href: "/colecciones" },
      { label: "Ofertas", href: "/catalogo?sale=true" },
    ],
  },
  company: {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "/nosotros" },
      { label: "Contacto", href: "/contacto" },
      { label: "Blog", href: "/blog" },
      { label: "Trabaja con nosotros", href: "/careers" },
    ],
  },
  support: {
    title: "Ayuda",
    links: [
      { label: "Envíos", href: "/envios" },
      { label: "Devoluciones", href: "/devoluciones" },
      { label: "Guía de tallas", href: "/tallas" },
      { label: "FAQ", href: "/faq" },
    ],
  },
};

const socialLinks = [
  { icon: Globe, href: "https://instagram.com", label: "Instagram" },
  { icon: MessageCircle, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "https://facebook.com", label: "Facebook" },
  { icon: Video, href: "https://youtube.com", label: "Youtube" },
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/PTM-Logo.png"
                alt="Punto Textil Mayoreo"
                width={500}
                height={500}
                className="h-20 w-auto md:h-30 object-contain object-center transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "bg-background border border-border",
                    "text-muted-foreground hover:text-foreground hover:border-foreground transition-colors",
                  )}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-medium mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Punto Textil Mayoreo. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacidad"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Términos
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
