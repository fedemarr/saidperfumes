"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import type { ProductWithNotes } from "@/types";

export default function AdminProductosPage() {
  const [products, setProducts] = useState<ProductWithNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load(q = search, p = page) {
    setLoading(true);
    const url = `/api/admin/products?search=${encodeURIComponent(q)}&page=${p}`;
    const data = await fetch(url).then((r) => r.json());
    setProducts(data.products ?? []);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  async function toggleField(id: string, field: "isActive" | "isFeatured", value: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">Productos</h1>
        <Button asChild>
          <Link href="/admin/productos/nuevo"><Plus className="h-4 w-4 mr-2" />Nuevo producto</Link>
        </Button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(search, 1); }} className="flex gap-2">
        <Input
          placeholder="Buscar por nombre o marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
      </form>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <>
          <div className="bg-card border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground">Producto</th>
                  <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Marca</th>
                  <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Precio</th>
                  <th className="text-center p-3 text-xs uppercase tracking-wider text-muted-foreground">Stock</th>
                  <th className="text-center p-3 text-xs uppercase tracking-wider text-muted-foreground">Activo</th>
                  <th className="text-center p-3 text-xs uppercase tracking-wider text-muted-foreground">Dest.</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-muted flex-shrink-0">
                          <Image src={p.images?.[0] ?? "/placeholder.jpg"} alt={p.name} fill className="object-contain p-1" />
                        </div>
                        <span className="text-white line-clamp-1 max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{p.brand}</td>
                    <td className="p-3 hidden md:table-cell">{formatPrice(p.price)}</td>
                    <td className="p-3 text-center">
                      <span className={p.stock < 5 ? "text-yellow-400 font-bold" : "text-white"}>{p.stock}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={p.isActive} onCheckedChange={(v) => toggleField(p.id, "isActive", v)} />
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={p.isFeatured} onCheckedChange={(v) => toggleField(p.id, "isFeatured", v)} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button asChild size="icon" variant="ghost">
                          <Link href={`/admin/productos/${p.id}`}><Edit2 className="h-4 w-4" /></Link>
                        </Button>
                        <button
                          onClick={() => deleteProduct(p.id, p.name)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm border transition-colors ${p === page ? "border-gold bg-gold text-black" : "border-border hover:border-gold text-white"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
