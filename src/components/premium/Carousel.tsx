"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    image: "/images/hero-1.jpg",
    badge: "Nueva Colección 2026",
    headline: ["Estilo que", "define tu"],
    headlineItalic: "esencia",
    sub: "Descubre nuestra colección exclusiva de camisetas premium. Diseños únicos, calidad excepcional.",
    cta: { label: "Explorar Colección", href: "/catalogo" },
    ctaSecondary: { label: "Nuestra Historia", href: "/nosotros" },
    align: "center" as const,
  },
  {
    id: 2,
    image: "/images/hero-2.jpg",
    badge: "Colección Polo",
    headline: ["Elegancia", "en cada"],
    headlineItalic: "detalle",
    sub: "Polos premium confeccionados con los mejores materiales. Para cada ocasión, para cada momento.",
    cta: { label: "Ver Polos", href: "/catalogo" },
    ctaSecondary: { label: "Ver todo", href: "/catalogo" },
    align: "left" as const,
  },
  {
    id: 3,
    image: "/images/hero-3.jpg",
    badge: "Sport & Active",
    headline: ["Muévete con"],
    headlineItalic: "actitud",
    sub: "Colección deportiva diseñada para quienes no se detienen. Alto rendimiento, máximo estilo.",
    cta: { label: "Ver Deportiva", href: "/catalogo" },
    ctaSecondary: { label: "Nuestra Historia", href: "/nosotros" },
    align: "right" as const,
  },
]

export function Carousel() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)

  // Use refs to avoid recreating callbacks and restarting interval
  const currentRef = useRef(current)
  const isTransitioningRef = useRef(isTransitioning)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { currentRef.current = current }, [current])
  useEffect(() => { isTransitioningRef.current = isTransitioning }, [isTransitioning])

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioningRef.current) return
      setIsTransitioning(true)
      setProgress(0)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setCurrent(index)
        setIsTransitioning(false)
        timeoutRef.current = null
      }, 500)
    },
    []
  )

  const next = useCallback(() => {
    goTo((currentRef.current + 1) % slides.length)
  }, [goTo])

  const prev = useCallback(() => {
    goTo((currentRef.current - 1 + slides.length) % slides.length)
  }, [goTo])

  // Auto advance - stable interval, only depends on goTo/next refs
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          next()
          return 0
        }
        return p + 100 / 50 // 5 seconds total, 100ms interval
      })
    }, 100)
    return () => {
      clearInterval(interval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [next])

  const slide = slides[current]
  const alignClass =
    slide.align === "left"
      ? "items-start text-left"
      : slide.align === "right"
      ? "items-end text-right"
      : "items-center text-center"

  return (
    <section className="relative min-h-screen overflow-hidden bg-foreground">
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt={s.headline.join(" ") + " " + s.headlineItalic}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
      ))}

      {/* Content */}
      <div
        className={`relative z-10 min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 pt-24 pb-32`}
      >
        <div className={`flex flex-col ${alignClass} max-w-3xl ${slide.align === "right" ? "ml-auto" : slide.align === "center" ? "mx-auto" : ""}`}>
          {/* Badge */}
          {/* <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm mb-8 border border-white/20 bg-white/10 transition-all duration-700 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
          >
            <span className="text-sm font-medium text-white">{slide.badge}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </div> */}

          {/* Headline */}
          <h1
            className={`font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.95] tracking-tight text-white text-balance transition-all duration-700 delay-100 ${isTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}`}
          >
            {slide.headline.map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
            <span className="italic">{slide.headlineItalic}</span>
          </h1>

          {/* Subtitle */}
          {/* <p
            className={`text-base md:text-lg text-white/70 max-w-lg mt-6 mb-10 text-pretty transition-all duration-700 delay-200 ${isTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}`}
          >
            {slide.sub}
          </p> */}

          {/* CTAs */}
          {/* <div
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${isTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"} ${slide.align === "center" ? "justify-center" : slide.align === "right" ? "justify-end" : ""}`}
          >
            <Link href={slide.cta.href}>
              <Button
                size="lg"
                className="rounded-full px-8 h-12 text-base font-medium bg-white text-foreground hover:bg-white/90"
              >
                {slide.cta.label}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href={slide.ctaSecondary.href}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base font-medium border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white"
              >
                {slide.ctaSecondary.label}
              </Button>
            </Link>
          </div> */}

          {/* Trust Indicators */}
          {/* <div
            className={`flex items-center gap-2 mt-10 transition-all duration-700 delay-[400ms] ${isTransitioning ? "opacity-0" : "opacity-100"} ${slide.align === "center" ? "justify-center" : slide.align === "right" ? "justify-end" : ""}`}
          >
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-white/70 ml-2">+2,500 clientes satisfechos</span>
          </div> */}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Slide siguiente"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Slide indicators with progress */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className="relative h-[3px] rounded-full bg-white/30 overflow-hidden transition-all duration-300"
            style={{ width: i === current ? 48 : 24 }}
          >
            {i === current && (
              <span
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-none"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-10 right-6 sm:right-12 z-20 text-white/50 text-sm font-mono tabular-nums">
        {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  )
}
