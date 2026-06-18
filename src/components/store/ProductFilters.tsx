"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

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
  }

  function clearAll() {
    router.push("/productos");
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-8">
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
            className={`w-full flex items-center justify-between mb-2 group ${getParam("category").includes(value) ? "text-gold" : "text-white"}`}
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
    </aside>
  );
}
