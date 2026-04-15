"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success("¡Bienvenido a la comunidad Demo!");

    // Reset after delay
    setTimeout(() => {
      setIsSuccess(false);
      setEmail("");
    }, 3000);
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-8">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>

        {/* Heading */}
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-balance mb-6">
          Únete a nuestra comunidad de estilo
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Suscríbete y obtén un <strong>15% de descuento</strong> en tu primera
          compra, además de acceso exclusivo a nuevas colecciones y ofertas
          especiales.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
        >
          <div className="relative flex-1 w-full">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSuccess}
              className="w-full px-6 py-4 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all disabled:opacity-70 text-center sm:text-left"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || isSuccess}
            className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-medium btn-shine whitespace-nowrap"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                ¡Listo!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Suscribirse
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Trust text */}
        <p className="text-xs text-muted-foreground mt-4">
          No enviamos spam. Puedes darte de baja en cualquier momento.
        </p>
      </div>
    </section>
  );
}
