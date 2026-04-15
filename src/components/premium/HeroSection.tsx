"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary orb */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] bg-accent/20 rounded-full blur-3xl" />

        {/* Secondary orb */}
        <div className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] bg-secondary rounded-full blur-3xl" />

        {/* Tertiary orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-muted/50 rounded-full blur-3xl" />
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 noise-overlay opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Announcement Badge */}
        <div>
          <Link href="/colecciones">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm hover:bg-secondary transition-colors cursor-pointer mb-8"
            >
              <span className="text-sm font-medium">Nuevo Catálogo 2026</span>
              <ArrowRight className="w-4 h-4" />
            </Badge>
          </Link>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.95] tracking-tight text-balance mb-6">
          Estilo que define
          <br />
          <span className="italic">tu esencia</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
          Descubre nuestro catálogo exclusivo de camisetas premium. Diseños
          únicos, calidad excepcional, hechos para quienes valoran lo auténtico.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/catalogo">
            <Button
              size="lg"
              className="rounded-full px-8 h-14 text-base font-medium btn-shine group"
            >
              Explorar Catálogo
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link href="/nosotros">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-14 text-base font-medium hover:bg-secondary transition-colors"
            >
              Nuestra Historia
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 fill-amber-400 text-amber-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              4.9 · 2,500+ reseñas
            </span>
          </div>

          <div className="hidden sm:block w-px h-4 bg-border" />

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              +10,000 clientes felices
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Scroll
        </span>
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
