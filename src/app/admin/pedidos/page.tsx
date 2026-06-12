"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderWithItems, OrderStatus } from "@/types";

const ALL_STATUSES: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PAID", label: "Pagado" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  CONFIRMED: "text-blue-400",
  PAID: "text-green-400",
  SHIPPED: "text-purple-400",
  DELIVERED: "text-success",
  CANCELLED: "text-destructive",
};

const TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  PENDING: [{ label: "Confirmar", next: "CONFIRMED" }, { label: "Cancelar", next: "CANCELLED" }],
  CONFIRMED: [{ label: "Marcar pagado", next: "PAID" }, { label: "Cancelar", next: "CANCELLED" }],
  PAID: [{ label: "Marcar enviado", next: "SHIPPED" }],
  SHIPPED: [{ label: "Marcar entregado", next: "DELIVERED" }],
};

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load(status?: string) {
    setLoading(true);
    const url = `/api/admin/orders${status && status !== "ALL" ? `?status=${status}` : ""}`;
    const data = await fetch(url).then((r) => r.json());
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => { load(filter); }, [filter]);

  async function changeStatus(orderId: string, next: string, trackingCode?: string) {
    setUpdating(orderId);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: next, trackingCode }),
    });
    setUpdating(null);
    load(filter);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">Pedidos</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay pedidos.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border border-border">
              {/* Header row */}
              <button
                className="w-full flex flex-col md:flex-row md:items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <span className="text-gold font-mono text-sm">#{order.orderNumber}</span>
                <span className="text-sm text-white flex-1">{order.user.name ?? order.user.email}</span>
                <span className="text-sm">{new Date(order.createdAt).toLocaleDateString("es-AR")}</span>
                <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                <span className={`text-xs font-bold uppercase ${STATUS_COLORS[order.status] ?? "text-white"}`}>
                  {order.status}
                </span>
              </button>

              {/* Expanded detail */}
              {expanded === order.id && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Cliente</p>
                      <p>{order.user.name}</p>
                      <p className="text-muted-foreground">{order.user.email}</p>
                      {order.user.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Envío</p>
                      <p>{(order.shippingAddress as { street: string }).street}</p>
                      <p className="text-muted-foreground">
                        {(order.shippingAddress as { city: string; province: string; zip: string }).city},{" "}
                        {(order.shippingAddress as { province: string }).province}{" "}
                        ({(order.shippingAddress as { zip: string }).zip})
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Productos</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.product.brand} — {item.product.name} x{item.quantity}</span>
                          <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
                        <span>Total</span>
                        <span className="text-gold">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {order.paymentProof && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Comprobante</p>
                      <a href={order.paymentProof} target="_blank" rel="noopener noreferrer"
                        className="text-gold text-sm hover:underline">Ver comprobante</a>
                    </div>
                  )}

                  {/* Action buttons */}
                  {TRANSITIONS[order.status] && (
                    <div className="flex gap-2 flex-wrap">
                      {TRANSITIONS[order.status].map(({ label, next }) => (
                        <Button
                          key={next}
                          size="sm"
                          variant={next === "CANCELLED" ? "destructive" : "default"}
                          disabled={updating === order.id}
                          onClick={() => changeStatus(order.id, next)}
                        >
                          {updating === order.id ? "..." : label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
