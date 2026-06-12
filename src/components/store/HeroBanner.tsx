"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Percent, CreditCard, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 1,
    bg: "/images/hero-1.jpg",
    headline: "SAID PERFUMES",
    sub: "Más de 250 perfumes en stock",
  },
  {
    id: 2,
    bg: "/images/hero-2.jpg",
    headline: "NUEVA COLECCIÓN",
    sub: "Perfumes árabes y de diseñador",
  },
];

const BADGES = [
  { icon: Percent, text: "20% OFF", sub: "por transferencia" },
  { icon: CreditCard, text: "Hasta 6 cuotas", sub: "sin interés" },
  { icon: Truck, text: "Envío gratis", sub: "superando $150.000" },
  { icon: Package, text: "Más de 250", sub: "perfumes en stock" },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Main hero */}
      <div className="relative h-[50vh] md:h-[65vh] bg-[#0a0a0a] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 z-10" />

            {/* Try to load image, fallback to gradient */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-black via-[#1a1200] to-black"
              style={{
                backgroundImage: `url(${SLIDES[current].bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-4">
              <div className="w-8 h-px bg-gold mx-auto mb-4" />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-[0.3em] uppercase text-white mb-2">
              {SLIDES[current].headline}
            </h1>
            <p className="text-sm md:text-base tracking-[0.3em] text-gold uppercase mb-8">
              {SLIDES[current].sub}
            </p>
            <Button asChild size="lg">
              <Link href="/productos">Ver colección</Link>
            </Button>
          </motion.div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/20 flex items-center justify-center hover:border-gold transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/20 flex items-center justify-center hover:border-gold transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-6 h-0.5 transition-colors ${i === current ? "bg-gold" : "bg-white/30"}`}
            />
          ))}
        </div>
      </div>

      {/* Badges bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {BADGES.map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3 px-5 py-4 border-r border-border last:border-0 odd:border-b md:border-b-0">
                <Icon className="h-5 w-5 text-gold flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wide">{text}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
