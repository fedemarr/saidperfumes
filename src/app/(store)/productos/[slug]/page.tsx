"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OlfactivePyramid } from "@/components/store/OlfactivePyramid";
import { ProductCard } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, getCardPrice } from "@/lib/utils";
import type { ProductWithNotes } from "@/types";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductWithNotes | null>(null);
  const [related, setRelated] = useState<ProductWithNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) return;
        const data = await res.json();
        setProduct(data.product);
        setRelated(data.related ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0] ?? "",
      price: product.price,
      priceTransfer: product.priceTransfer,
      slug: product.slug,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          <Skeleton className="w-full md:w-1/2 aspect-square" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Producto no encontrado.</p>
        <Link href="/productos" className="text-gold hover:underline mt-4 block">Ver todos los productos</Link>
      </div>
    );
  }

  const transferPrice = product.priceTransfer ?? product.price;
  const cardPrice = getCardPrice(transferPrice);
  const genderLabel = product.gender === "MASCULINO" ? "Para él" : product.gender === "FEMENINO" ? "Para ella" : "Unisex";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-gold">Inicio</Link>
        <span>·</span>
        <Link href="/productos" className="hover:text-gold">Productos</Link>
        <span>·</span>
        <span className="text-white truncate max-w-xs">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Gallery */}
        <div className="lg:w-1/2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square bg-card border border-border overflow-hidden"
          >
            <Image
              src={product.images[activeImage] ?? "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-contain p-8"
              priority
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 border-2 flex-shrink-0 transition-colors ${
                    i === activeImage ? "border-gold" : "border-border hover:border-gold/50"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:flex-1 space-y-5">
          <div>
            <p className="text-xs text-gold uppercase tracking-[0.2em] mb-1">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">{product.name}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{genderLabel}</Badge>
            {product.freeShipping && <Badge variant="outline">Envío gratis</Badge>}
            {product.priceTransfer && product.priceTransfer < product.price && (
              <Badge>{Math.round((1 - product.priceTransfer / product.price) * 100)}% OFF efectivo/transferencia</Badge>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gold">{formatPrice(transferPrice)}</p>
              {product.priceTransfer && product.priceTransfer < product.price && (
                <span className="text-xs bg-gold text-black font-bold px-2 py-0.5">
                  {Math.round((1 - product.priceTransfer / product.price) * 100)}% OFF
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Con{" "}
              <span className="font-bold" style={{ color: "#C9A84C", textShadow: "0 0 7px #C9A84Caa" }}>E</span>
              fectivo / trans
              <span className="font-bold" style={{ color: "#C9A84C", textShadow: "0 0 7px #C9A84Caa" }}>F</span>
              erencia
            </p>
            <p className="text-lg font-semibold text-white mt-2">{formatPrice(cardPrice)}</p>
            <p className="text-sm text-muted-foreground">3 cuotas sin interés con tarjeta</p>
          </div>

          {product.freeShipping && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Truck className="h-4 w-4" />
              <span>Envío gratis a todo el país</span>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Cantidad</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-border flex items-center justify-center hover:border-gold transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-border flex items-center justify-center hover:border-gold transition-colors"
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">{product.stock} disponibles</span>
            </div>
          </div>

          <Button
            className="w-full md:w-auto px-10"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {added ? "¡Agregado!" : product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
          </Button>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Occasions */}
          {product.occasion.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-widest text-white mb-2">Ocasiones</p>
              <div className="flex flex-wrap gap-2">
                {product.occasion.map((occ) => (
                  <span key={occ} className="text-xs px-3 py-1 border border-border text-muted-foreground">
                    {occ}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Olfactive Pyramid */}
      {(product.notes.top.length > 0 || product.notes.heart.length > 0 || product.notes.base.length > 0) && (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-serif font-bold text-white mb-8">Pirámide Olfativa</h2>
          <div className="max-w-md">
            <OlfactivePyramid notes={product.notes} />
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-serif font-bold text-white mb-8">También te puede gustar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
