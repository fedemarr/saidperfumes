"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OlfactivePyramid } from "./OlfactivePyramid";
import type { ProductWithNotes } from "@/types";

export function OlfactivePyramidSection({ products }: { products: ProductWithNotes[] }) {
  const eligible = products.filter(
    (p) => p.notes.top.length + p.notes.heart.length + p.notes.base.length > 0
  );
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (eligible.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % eligible.length);
    }, 30000);
    return () => clearInterval(timer);
  }, [eligible.length]);

  if (!mounted || eligible.length === 0) return null;

  const product = eligible[index];

  return (
    <section className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-heading">Pirámide Olfativa</h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center gap-10 max-w-3xl mx-auto"
          >
            <Link href={`/productos/${product.slug}`} className="flex-shrink-0 group">
              <div className="relative w-44 h-44 md:w-56 md:h-56 bg-card border border-border overflow-hidden group-hover:border-gold transition-colors duration-300">
                <Image
                  src={product.images[0] ?? "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gold uppercase tracking-wider">{product.brand}</p>
                <p className="text-sm font-semibold text-white mt-0.5 leading-snug line-clamp-2">
                  {product.name}
                </p>
              </div>
            </Link>

            <div className="flex-1 w-full">
              <OlfactivePyramid notes={product.notes} />
            </div>
          </motion.div>
        </AnimatePresence>

        {eligible.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {eligible.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i === index ? "bg-gold" : "bg-border hover:bg-gold/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
