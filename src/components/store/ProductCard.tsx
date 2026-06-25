"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, getCardPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProductWithNotes } from "@/types";

interface ProductCardProps {
  product: ProductWithNotes;
}

const GLOW = { color: "#C9A84C", textShadow: "0 0 7px #C9A84Caa" } as const;

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const transferPrice = product.priceTransfer ?? product.price;
  const cardPrice = getCardPrice(transferPrice);
  const discountPct =
    product.priceTransfer && product.priceTransfer < product.price
      ? Math.round((1 - product.priceTransfer / product.price) * 100)
      : 0;

  function handleAddToCart(e: React.MouseEvent) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/productos/${product.slug}`} className="group block">
        <div className="relative bg-card border border-border overflow-hidden">
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {discountPct > 0 && <Badge>{discountPct}% OFF</Badge>}
            {product.freeShipping && <Badge variant="outline">Envío gratis</Badge>}
          </div>

          {/* Image + hover button */}
          <div className="relative aspect-square overflow-hidden bg-[#0D0D0D]">
            <Image
              src={product.images[0] ?? "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-gold text-black text-xs font-bold tracking-widest uppercase py-3 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300"
            >
              <ShoppingBag className="h-4 w-4" />
              Agregar
            </button>
          </div>

          {/* Info */}
          <div className="p-3 border-t border-border">
            <p className="text-[10px] text-gold uppercase tracking-wider mb-0.5">{product.brand}</p>
            <p className="text-sm text-white font-medium line-clamp-2 leading-snug">{product.name}</p>
            <div className="mt-2 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-gold">{formatPrice(transferPrice)}</span>
                {discountPct > 0 && (
                  <span className="text-[9px] bg-gold text-black font-bold px-1.5 py-0.5">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                <span className="font-bold text-[11px]" style={GLOW}>E</span>
                fectivo / trans
                <span className="font-bold text-[11px]" style={GLOW}>F</span>
                erencia
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatPrice(cardPrice)} — 3 cuotas sin interés
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
