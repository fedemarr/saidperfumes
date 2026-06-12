"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-lg font-semibold tracking-widest uppercase">Tu carrito</h2>
              <button onClick={closeCart} className="text-muted-foreground hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <ShoppingBag className="h-16 w-16 opacity-20" />
                <p className="text-sm tracking-wide">Tu carrito está vacío</p>
                <Button variant="outline" size="sm" onClick={closeCart} asChild>
                  <Link href="/productos">Ver productos</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 py-4 border-b border-border">
                      <div className="relative w-20 h-20 bg-muted flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gold uppercase tracking-wider truncate">{item.brand}</p>
                        <p className="text-sm text-white font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gold mt-1">
                          {formatPrice((item.priceTransfer ?? item.price) * item.quantity)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 border border-border flex items-center justify-center hover:border-gold transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 border border-border flex items-center justify-center hover:border-gold transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="ml-auto text-muted-foreground hover:text-white transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5 border-t border-border space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Precio con transferencia</span>
                    <span className="text-gold font-semibold text-base">{formatPrice(subtotal())}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envío calculado en el checkout
                  </p>
                  <Button className="w-full" asChild onClick={closeCart}>
                    <Link href="/checkout">Ir al checkout</Link>
                  </Button>
                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={closeCart}>
                    Seguir comprando
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
