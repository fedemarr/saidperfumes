"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Brand = {
  id: string | null;
  name: string;
  category: string;
  createdAt: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  ARABE: "Árabe",
  DESIGNER: "Diseñador",
  NICHE: "Nicho",
  NATIONAL: "Nacional",
};

export default function MarcasPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("ARABE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/brands");
    const data = await res.json();
    setBrands(data.brands ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addBrand() {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), category: newCategory }),
    });
    if (res.ok) {
      setNewName("");
      await load();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error al guardar");
    }
    setSaving(false);
  }

  async function deleteBrand(id: string) {
    if (!confirm("¿Eliminar esta marca?")) return;
    await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Tag className="h-6 w-6 text-gold" />
        <h1 className="text-2xl font-serif font-bold">Marcas</h1>
      </div>

      {/* Add brand */}
      <div className="bg-card border border-border p-5 mb-8 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white">Nueva marca</h2>
        <div className="flex gap-3">
          <Input
            placeholder="Nombre de la marca"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addBrand(); }}
            className="flex-1"
          />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addBrand} disabled={saving || !newName.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Brand list */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : brands.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay marcas registradas.</p>
      ) : (
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand.name} className="flex items-center justify-between bg-card border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{brand.name}</p>
                <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[brand.category] ?? brand.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {!brand.id && (
                  <span className="text-[10px] border border-border px-2 py-0.5 text-muted-foreground">
                    En uso
                  </span>
                )}
                {brand.id && (
                  <button
                    onClick={() => deleteBrand(brand.id!)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
