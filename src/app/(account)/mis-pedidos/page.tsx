"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderWithItems } from "@/types";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "success" | "destructive" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  CONFIRMED: { label: "Confirmado", variant: "outline" },
  PAID: { label: "Pagado", variant: "success" },
  SHIPPED: { label: "En camino", variant: "default" },
  DELIVERED: { label: "Entregado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

export default function MisPedidosPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  async function uploadProof(orderId: string, file: File) {
    setUploading(orderId);
    const form = new FormData();
    form.append("file", file);
    form.append("orderId", orderId);
    await fetch("/api/orders/upload-proof", { method: "POST", body: form });
    setUploading(null);
    // Refresh
    const updated = await fetch("/api/orders").then((r) => r.json());
    setOrders(updated);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-serif font-bold mb-8">Mis pedidos</h1>
        {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Todavía no realizaste ningún pedido.</p>
          <Button asChild><Link href="/productos">Ver productos</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] ?? { label: order.status, variant: "secondary" as const };
            return (
              <div key={order.id} className="bg-card border border-border p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Orden</p>
                    <p className="font-semibold text-gold">#{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="text-sm">{new Date(order.createdAt).toLocaleDateString("es-AR")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Método</p>
                    <p className="text-sm">{order.paymentMethod === "TRANSFERENCIA" ? "Transferencia" : "Tarjeta"}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs border ${
                    status.variant === "success" ? "border-green-700 text-green-400" :
                    status.variant === "destructive" ? "border-red-700 text-red-400" :
                    status.variant === "outline" ? "border-border text-muted-foreground" :
                    "border-gold/50 text-gold"
                  }`}>{status.label}</span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 flex-shrink-0">
                      <div className="relative w-12 h-12 bg-muted">
                        <Image
                          src={item.product.images?.[0] ?? "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-white line-clamp-1 max-w-[100px]">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.paymentMethod === "TRANSFERENCIA" && order.status === "PENDING" && !order.paymentProof && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Subí el comprobante de pago para que confirmemos tu orden:</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadProof(order.id, file);
                        }}
                      />
                      <Button size="sm" variant="outline" disabled={uploading === order.id} asChild>
                        <span>{uploading === order.id ? "Subiendo..." : "Subir comprobante"}</span>
                      </Button>
                    </label>
                  </div>
                )}

                {order.paymentProof && (
                  <p className="text-xs text-success mt-3">✓ Comprobante recibido — en revisión</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
