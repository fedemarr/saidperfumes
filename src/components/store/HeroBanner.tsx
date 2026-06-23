"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Percent, CreditCard, Truck, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  { id: 1, bg: "/banner1.png" },
  { id: 2, bg: "/banner2.png" },
];

const BADGES = [
  { icon: Percent, text: "20% OFF", sub: "por transferencia" },
  { icon: CreditCard, text: "3 cuotas", sub: "sin interés" },
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
      <div className="relative w-full overflow-hidden bg-black aspect-[12/5] md:aspect-[1440/600]">
        <Link href="/productos" className="absolute inset-0 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image
                src={SLIDES[current].bg}
                alt={`Banner ${current + 1}`}
                fill
                className="object-contain md:object-cover md:object-center"
                priority={current === 0}
              />
            </motion.div>
          </AnimatePresence>
        </Link>

        {/* Arrows */}
        <button
          onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/30 bg-black/30 flex items-center justify-center hover:border-gold hover:bg-black/50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/30 bg-black/30 flex items-center justify-center hover:border-gold hover:bg-black/50 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-6 h-0.5 transition-colors ${i === current ? "bg-gold" : "bg-white/40"}`}
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
