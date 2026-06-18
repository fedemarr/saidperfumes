"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingBag, Users, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Ingresos del mes", value: formatPrice(stats?.totalRevenue ?? 0), icon: DollarSign, color: "text-gold" },
    { label: "Órdenes del mes", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-white" },
    { label: "Nuevos usuarios", value: stats?.newUsers ?? 0, icon: Users, color: "text-white" },
    { label: "Órdenes pendientes", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-serif font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {stats?.revenueChart && stats.revenueChart.length > 0 && (
        <div className="bg-card border border-border p-5">
          <h2 className="text-sm font-semibold tracking-widest uppercase mb-5">Ingresos — últimos 30 días</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.revenueChart}>
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: "#666", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: 0 }}
                labelStyle={{ color: "#fff" }}
                formatter={(v) => [formatPrice(Number(v)), "Ingresos"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" fill="url(#gold)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-widest uppercase">Últimas órdenes</h2>
            <Link href="/admin/pedidos" className="text-xs text-gold hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-gold">#{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{o.user?.name ?? o.guestName ?? o.user?.email ?? o.guestEmail ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(o.total)}</p>
                  <Badge variant="secondary" className="text-[10px]">{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-widest uppercase">Stock bajo</h2>
            <Link href="/admin/productos" className="text-xs text-gold hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {stats?.lowStockProducts.length === 0 && (
              <p className="text-xs text-muted-foreground">Todo en orden 👍</p>
            )}
            {stats?.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-white line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <span className={`text-sm font-bold ${p.stock === 0 ? "text-destructive" : "text-yellow-400"}`}>
                  {p.stock} u.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
