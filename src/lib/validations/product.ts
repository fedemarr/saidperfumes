import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido").regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().min(10, "Descripción requerida"),
  brand: z.string().min(1, "Marca requerida"),
  category: z.enum(["ARABE", "DESIGNER", "NICHE", "NATIONAL"]),
  gender: z.enum(["MASCULINO", "FEMENINO", "UNISEX"]),
  occasion: z.array(z.string()),
  notes: z.object({
    top: z.array(z.string()),
    heart: z.array(z.string()),
    base: z.array(z.string()),
  }),
  images: z.array(z.string()).min(1, "Al menos una imagen"),
  price: z.number().positive("Precio requerido"),
  priceCash: z.number().positive().nullable().optional(),
  priceTransfer: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  freeShipping: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;
