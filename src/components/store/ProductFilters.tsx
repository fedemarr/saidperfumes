"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatPrice, BRANDS_BY_CATEGORY } from "@/lib/utils";

const GENDERS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "UNISEX", label: "Unisex" },
];

function FilterContent({
  getParam,
  toggle,
  priceRange,
  setPriceRange,
  applyPrice,
  clearAll,
  hasFilters,
}: {
  getParam: (k: string) => string[];
  toggle: (k: string, v: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  applyPrice: () => void;
  clearAll: () => void;
  hasFilters: boolean;
}) {
  return (
    <div className="space-y-7">
      {hasFilters && (
        <button onClick={clearAll} className="text-xs text-gold hover:underline">
          Limpiar filtros
        </button>
      )}

      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-white mb-3">Género</h3>
        <div className="space-y-2">
          {GENDERS.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`gen-${value}`}
                checked={getParam("gender").includes(value)}
                onCheckedChange={() => toggle("gender", value)}
              />
              <Label htmlFor={`gen-${value}`} className="text-muted-foreground font-normal cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {BRANDS_BY_CATEGORY.map(({ label, value, brands }) => (
        <div key={value}>
          <button
            onClick={() => toggle("category", value)}
            className={`w-full flex items-center justify-between mb-2 ${getParam("category").includes(value) ? "text-gold" : "text-white"}`}
          >
            <h3 className="text-xs font-semibold tracking-widest uppercase">{label}</h3>
            <Checkbox
              checked={getParam("category").includes(value)}
              onCheckedChange={() => toggle("category", value)}
              className="pointer-events-none"
            />
          </button>
          <div className="space-y-1.5 pl-1">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={getParam("brand").includes(brand)}
                  onCheckedChange={() => toggle("brand", brand)}
                />
                <Label htmlFor={`brand-${brand}`} className="text-muted-foreground font-normal cursor-pointer text-xs">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-white mb-3">Precio</h3>
        <Slider
          min={0}
          max={500000}
          step={5000}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground mb-3">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
        <Button size="sm" variant="outline" className="w-full" onClick={applyPrice}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getParam = (key: string) => searchParams.getAll(key);

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.getAll(key);
    if (existing.includes(value)) {
      params.delete(key);
      existing.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
    params.set("page", "1");
    router.push(`/productos?${params.toString()}`);
  }

  function applyPrice() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("priceMin", String(priceRange[0]));
    params.set("priceMax", String(priceRange[1]));
    params.set("page", "1");
    router.push(`/productos?${params.toString()}`);
    setDrawerOpen(false);
  }

  function clearAll() {
    router.push("/productos");
    setDrawerOpen(false);
  }

  const hasFilters = searchParams.toString().length > 0;
  const activeCount = getParam("gender").length + getParam("brand").length + getParam("category").length;

  const props = { getParam, toggle, priceRange, setPriceRange, applyPrice, clearAll, hasFilters };

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 border border-border px-4 py-2 text-sm text-white hover:border-gold transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-card border-r border-border z-50 md:hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold tracking-widest uppercase">Filtros</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FilterContent {...props} />
            </div>
            <div className="px-5 py-4 border-t border-border">
              <Button className="w-full" onClick={() => setDrawerOpen(false)}>
                Ver resultados
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <FilterContent {...props} />
      </aside>
    </>
  );
}
