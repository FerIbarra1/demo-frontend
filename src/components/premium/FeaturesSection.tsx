"use client";

import { Truck, Shield, RefreshCw, Clock, Package, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Truck,
    title: "Envío Gratis",
    description: "En pedidos superiores a $50. Entrega en 24-48h.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Shield,
    title: "Pago Seguro",
    description: "Transacciones 100% protegidas con encriptación SSL.",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: RefreshCw,
    title: "Devoluciones Fáciles",
    description: "30 días para cambios y devoluciones sin complicaciones.",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Clock,
    title: "Atención 24/7",
    description: "Soporte al cliente disponible todos los días.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Package,
    title: "Empaque Premium",
    description: "Cada pedido viene en caja de regalo lista para sorprender.",
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    icon: Award,
    title: "Calidad Garantizada",
    description: "Materiales de primera calidad con garantía de 1 año.",
    color: "bg-teal-500/10 text-teal-600",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
            Por qué elegirnos
          </p>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium">
            La experiencia Demo
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 lg:p-8 rounded-2xl bg-background border border-border/50 hover:border-border hover:shadow-soft-lg transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110",
                  feature.color
                )}
              >
                <feature.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-lg mb-2 group-hover:text-foreground transition-colors">
                {feature.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
