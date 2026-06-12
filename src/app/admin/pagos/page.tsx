"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderWithItems } from "@/types";

export default function AdminPagosPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await fetch("/api/admin/orders?status=PENDING").then((r) => r.json());
    // Only transfer pending orders
    setOrders((data.orders ?? []).filter((o: OrderWithItems) => o.paymentMethod === "TRANSFERENCIA"));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function confirm(orderId: string) {
    setUpdating(orderId);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: "PAID" }),
    });
    setUpdating(null);
    load();
  }

  async function reject(orderId: string) {
    setUpdating(orderId);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: "CANCELLED" }),
    });
    setUpdating(null);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold">Confirmación de pagos</h1>
      <p className="text-sm text-muted-foreground">Órdenes por transferencia esperando confirmación.</p>

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No hay pagos pendientes de confirmación. 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border border-border p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-gold font-mono">#{order.orderNumber}</p>
                  <p className="text-sm text-white">{order.user.name ?? order.user.email}</p>
                  <p className="text-xs text-muted-foreground">{order.user.email}</p>
                  <p className="text-lg font-bold text-white">{formatPrice(order.total)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3">
                  {order.paymentProof ? (
                    <a
                      href={order.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gold border border-gold px-3 py-1.5 hover:bg-gold hover:text-black transition-colors"
                    >
                      Ver comprobante
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Sin comprobante aún</p>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => confirm(order.id)} disabled={updating === order.id}>
                      {updating === order.id ? "..." : "Confirmar pago"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => reject(order.id)} disabled={updating === order.id}>
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
