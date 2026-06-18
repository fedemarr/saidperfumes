"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { slugify, BRANDS, OCCASIONS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductWithNotes } from "@/types";

interface ProductFormProps {
  product?: ProductWithNotes;
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); }
    setInput("");
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" size="sm" onClick={add}>+</Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {value.map((tag) => (
          <span key={tag} className="px-2 py-0.5 border border-border text-xs flex items-center gap-1">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="text-muted-foreground hover:text-white">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          ...product,
          price: product.price,
          priceCash: product.priceCash ?? undefined,
          priceTransfer: product.priceTransfer ?? undefined,
          notes: product.notes,
        }
      : {
          isActive: true,
          isFeatured: false,
          freeShipping: false,
          stock: 0,
          occasion: [],
          notes: { top: [], heart: [], base: [] },
          images: [],
          category: "ARABE",
          gender: "UNISEX",
        },
  });

  async function uploadImage(file: File, currentImages: string[], onChange: (v: string[]) => void) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error ?? "Error al subir imagen"); return; }
      onChange([...currentImages, json.url]);
    } catch {
      setServerError("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ProductInput) {
    setServerError("");
    const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setServerError(json.error ?? "Error"); return; }
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input className="mt-1" {...register("name")}
            onChange={(e) => {
              register("name").onChange(e);
              if (!isEdit) setValue("slug", slugify(e.target.value));
            }} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Slug</Label>
          <Input className="mt-1" {...register("slug")} />
          {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea className="mt-1" rows={4} {...register("description")} />
        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Marca</Label>
          <Controller name="brand" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          )} />
        </div>
        <div>
          <Label>Categoría</Label>
          <Controller name="category" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["ARABE", "DESIGNER", "NICHE", "NATIONAL"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </div>
        <div>
          <Label>Género</Label>
          <Controller name="gender" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["MASCULINO", "FEMENINO", "UNISEX"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Precio base (ARS)</Label>
          <Input className="mt-1" type="number" {...register("price", { valueAsNumber: true })} />
          {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label>Precio efectivo</Label>
          <Input className="mt-1" type="number" {...register("priceCash", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Precio transferencia</Label>
          <Input className="mt-1" type="number" {...register("priceTransfer", { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <Label>Stock</Label>
        <Input className="mt-1 w-24" type="number" {...register("stock", { valueAsNumber: true })} />
      </div>

      <div>
        <Label className="mb-2 block">Ocasiones</Label>
        <Controller name="occasion" control={control} render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => field.onChange(field.value.includes(occ) ? field.value.filter((o) => o !== occ) : [...field.value, occ])}
                className={`px-3 py-1 text-xs border transition-colors ${field.value.includes(occ) ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/50"}`}
              >
                {occ}
              </button>
            ))}
          </div>
        )} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase">Notas olfativas</h3>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Salida (Top)</Label>
          <Controller name="notes.top" control={control} render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} placeholder="ej.: lavanda" />
          )} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Corazón (Heart)</Label>
          <Controller name="notes.heart" control={control} render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} placeholder="ej.: rosa" />
          )} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Fondo (Base)</Label>
          <Controller name="notes.base" control={control} render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} placeholder="ej.: ámbar" />
          )} />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Imágenes del producto</Label>
        <Controller name="images" control={control} render={({ field }) => (
          <div className="space-y-3">
            {/* Thumbnails */}
            {field.value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {field.value.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 border border-border group">
                    <Image src={url} alt="" fill className="object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => field.onChange(field.value.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Subiendo..." : "Subir imagen"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, field.value, field.onChange);
                  e.target.value = "";
                }}
              />
              <span className="text-xs text-muted-foreground self-center">o pegá una URL:</span>
            </div>

            {/* URL input fallback */}
            <TagInput value={[]} onChange={(newUrls) => field.onChange([...field.value, ...newUrls])} placeholder="https://..." />
          </div>
        )} />
        {errors.images && <p className="text-xs text-destructive mt-1">{errors.images.message}</p>}
      </div>

      <div className="flex flex-wrap gap-6">
        <Controller name="isActive" control={control} render={({ field }) => (
          <div className="flex items-center gap-2">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>Activo</Label>
          </div>
        )} />
        <Controller name="isFeatured" control={control} render={({ field }) => (
          <div className="flex items-center gap-2">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>Destacado</Label>
          </div>
        )} />
        <Controller name="freeShipping" control={control} render={({ field }) => (
          <div className="flex items-center gap-2">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>Envío gratis</Label>
          </div>
        )} />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
