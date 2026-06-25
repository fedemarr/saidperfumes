"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import type { ProductWithNotes } from "@/types";

interface WeeklyBestCarouselProps {
  products: ProductWithNotes[];
}

export function WeeklyBestCarousel({ products }: WeeklyBestCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  }

  function handleAddToCart(e: React.MouseEvent, product: ProductWithNotes) {
    e.preventDefault();
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0] ?? "",
      price: product.price,
      priceTransfer: product.priceTransfer,
      slug: product.slug,
    });
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 border-t border-border bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span className="text-xs text-gold uppercase tracking-[0.2em] font-medium">
                Selección especial
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Lo mejor de la semana
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 bg-card border border-border flex items-center justify-center hover:border-gold transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 bg-card border border-border flex items-center justify-center hover:border-gold transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {products.map((product, i) => {
            const transferPrice = product.priceTransfer ?? product.price * 0.8;
            const discountPct = Math.round((1 - transferPrice / product.price) * 100);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex-none w-64 md:w-72"
                style={{ scrollSnapAlign: "start" }}
              >
                <Link href={`/productos/${product.slug}`} className="group block">
                  <div className="relative bg-card border border-border overflow-hidden">
                    {/* Gold top accent */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent z-10" />

                    {/* Discount badge */}
                    {discountPct > 0 && (
                      <div className="absolute top-3 right-3 z-10 bg-gold text-black text-[10px] font-bold px-2 py-0.5 tracking-wider">
                        {discountPct}% OFF
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#0D0D0D]">
                      <Image
                        src={product.images[0] ?? "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 288px"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      {/* Add to cart */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-gold text-black text-xs font-bold tracking-widest uppercase py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Agregar al carrito
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4 border-t border-border">
                      <p className="text-[10px] text-gold uppercase tracking-[0.15em] mb-1">
                        {product.brand}
                      </p>
                      <p className="text-sm text-white font-semibold line-clamp-2 leading-snug mb-3">
                        {product.name}
                      </p>
                      <div className="flex items-end justify-between">
                        <div>
                          {product.priceTransfer && product.priceTransfer < product.price && (
                            <p className="text-xs text-muted-foreground line-through leading-none mb-0.5">
                              {formatPrice(product.price)}
                            </p>
                          )}
                          <p className="text-lg font-bold text-white leading-none">
                            {formatPrice(transferPrice)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            con transferencia
                          </p>
                        </div>
                        {product.freeShipping && (
                          <span className="text-[9px] text-gold border border-gold/40 px-1.5 py-0.5 tracking-wider uppercase">
                            Envío gratis
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/productos"
            className="inline-block border border-gold text-gold text-xs font-bold tracking-[0.2em] uppercase px-8 py-3 hover:bg-gold hover:text-black transition-colors duration-300"
          >
            Ver todos los perfumes
          </Link>
        </div>
      </div>
    </section>
  );
}
