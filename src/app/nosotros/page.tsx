"use client";

import Link from "next/link";
import { ArrowRight, Users, Lightbulb, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/premium";

const values = [
  {
    icon: Heart,
    title: "Pasión por la Calidad",
    description:
      "Cada camiseta es cuidadosamente seleccionada para garantizar los mejores materiales y acabados.",
  },
  {
    icon: Users,
    title: "Comunidad",
    description:
      "Creemos en construir una comunidad de personas que comparten nuestros valores y visión.",
  },
  {
    icon: Lightbulb,
    title: "Innovación",
    description:
      "Constantemente exploramos nuevos diseños, materiales sostenibles y tecnologías.",
  },
  {
    icon: Award,
    title: "Excelencia",
    description:
      "Nuestro compromiso es ofrecer la mejor experiencia de compra y satisfacción al cliente.",
  },
];

const team = [
  {
    name: "María García",
    role: "Fundadora & CEO",
    description:
      "Con 10 años de experiencia en moda, María lidera la visión de Demo Shop.",
  },
  {
    name: "Carlos López",
    role: "Director de Diseño",
    description:
      "Diseñador gráfico apasionado por crear prendas únicas y significativas.",
  },
  {
    name: "Ana Martínez",
    role: "Directora de Operaciones",
    description:
      "Asegura que cada pedido sea procesado con precisión y cuidado.",
  },
  {
    name: "David Ruiz",
    role: "Gestor de Comunidad",
    description:
      "Conecta con nuestros clientes y construye relaciones duraderas.",
  },
];

const timeline = [
  {
    year: "2020",
    title: "El Comienzo",
    description:
      "Fundamos Demo Shop con la visión de crear camisetas de calidad premium accesibles.",
  },
  {
    year: "2021",
    title: "Primer Catálogo",
    description:
      "Lanzamos nuestro catálogo de 50 diseños exclusivos que se vendieron en 2 meses.",
  },
  {
    year: "2022",
    title: "Expansión",
    description: "Alcanzamos 10,000 clientes satisfechos en toda la región.",
  },
  {
    year: "2023",
    title: "Sostenibilidad",
    description:
      "Implementamos materiales 100% sostenibles en todas nuestras colecciones.",
  },
  {
    year: "2024",
    title: "Nuevas Fronteras",
    description:
      "Expandimos a nuevos mercados y lanzamos línea de moda urbana premium.",
  },
  {
    year: "2025",
    title: "Hoy",
    description:
      "Somos la marca de camisetas más confiable con 50,000+ clientes felices.",
  },
];

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary rounded-full opacity-10 blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-muted rounded-full">
            <p className="text-sm font-medium text-foreground">
              Nuestra Historia
            </p>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            Pasión por Crear Prendas Extraordinarias
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto leading-relaxed">
            Demo Shop nace de la convicción de que la moda debe ser accesible,
            sostenible y significativa. Creemos que cada camiseta cuenta una
            historia.
          </p>

          <Link href="/catalogo">
            <Button size="lg" className="rounded-full px-8">
              Explorar Catálogo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 py-20 sm:py-32 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
                Nuestra Misión
              </h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                En Demo Shop, nos dedicamos a crear camisetas de calidad premium
                que inspiren confianza y reflejen la personalidad de quien las
                usa.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Nuestro objetivo es ofrecer una experiencia de compra
                excepcional, desde el diseño hasta la entrega, respaldada por un
                equipo apasionado y comprometido.
              </p>
              <div className="flex gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Calidad Garantizada
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Materiales premium en cada prenda
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Sostenible</p>
                    <p className="text-sm text-muted-foreground">
                      Comprometidos con el planeta
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-br from-accent to-secondary opacity-20 rounded-2xl blur-xl" />
              <div className="relative h-96 bg-linear-to-br from-accent/20 to-secondary/20 rounded-2xl border border-border flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 text-accent mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Comunidad de 50,000+ clientes felices
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-20 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Nuestros Valores
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estos principios guían cada decisión que tomamos en Demo Shop
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="border-border hover:border-accent/50 transition-all"
                >
                  <CardContent className="pt-8">
                    <Icon className="h-8 w-8 text-accent mb-4" />
                    <h3 className="font-serif text-xl font-bold mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="px-4 py-20 sm:py-32 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Nuestro Viaje
            </h2>
            <p className="text-lg text-muted-foreground">
              Un recuento de los hitos que nos han traído aquí
            </p>
          </div>

          <div className="space-y-8">
            {timeline.map((event, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-accent border-4 border-background relative z-10" />
                  {index !== timeline.length - 1 && (
                    <div className="w-0.5 h-20 bg-linear-to-b from-accent to-accent/20 mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-sm font-semibold text-accent mb-1">
                    {event.year}
                  </p>
                  <h3 className="font-serif text-xl font-bold mb-2 text-foreground">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-20 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Las personas apasionadas detrás de Demo Shop
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card
                key={index}
                className="overflow-hidden border-border hover:border-accent/50 transition-all"
              >
                <CardContent className="p-6">
                  <div className="h-32 bg-linear-to-br from-accent/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-accent opacity-50" />
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-1 text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-accent font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-20 sm:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary rounded-full opacity-10 blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
            Únete a Nuestra Comunidad
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Descubre por qué miles de personas eligen Demo Shop para sus
            camisetas favoritas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tienda">
              <Button size="lg" className="rounded-full px-8">
                Ver Catálogo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contacto">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Contáctanos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-serif text-lg font-bold mb-4">Demo Shop</p>
              <p className="text-sm text-muted-foreground">
                Camisetas premium para personas extraordinarias.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Tienda</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/tienda"
                    className="hover:text-accent transition-colors"
                  >
                    Colecciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tienda"
                    className="hover:text-accent transition-colors"
                  >
                    Ofertas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tienda"
                    className="hover:text-accent transition-colors"
                  >
                    Nuevos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Empresa</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/nosotros"
                    className="hover:text-accent transition-colors"
                  >
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="hover:text-accent transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-accent transition-colors"
                  >
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-accent transition-colors"
                  >
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Demo Shop. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
