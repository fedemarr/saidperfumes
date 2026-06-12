import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { ProductWithNotes } from "@/types";

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  gender: z.string().optional(),
  brand: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  sortBy: z.enum(["featured", "price_asc", "price_desc", "newest", "bestseller"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
  featured: z.coerce.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = { isActive: true };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { brand: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params.category) {
      const cats = params.category.split(",");
      where.category = { in: cats };
    }
    if (params.gender) {
      const genders = params.gender.split(",");
      where.gender = { in: genders };
    }
    if (params.brand) {
      const brands = params.brand.split(",");
      where.brand = { in: brands };
    }
    if (params.priceMin !== undefined || params.priceMax !== undefined) {
      where.price = {};
      if (params.priceMin !== undefined) (where.price as Record<string, unknown>).gte = params.priceMin;
      if (params.priceMax !== undefined) (where.price as Record<string, unknown>).lte = params.priceMax;
    }
    if (params.featured) {
      where.isFeatured = true;
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (params.sortBy === "price_asc") orderBy = { price: "asc" };
    if (params.sortBy === "price_desc") orderBy = { price: "desc" };
    if (params.sortBy === "featured") orderBy = { isFeatured: "desc" };

    const skip = (params.page - 1) * params.limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: params.limit }),
      prisma.product.count({ where }),
    ]);

    const mapped = products.map((p) => ({
      ...p,
      price: Number(p.price),
      priceCash: p.priceCash ? Number(p.priceCash) : null,
      priceTransfer: p.priceTransfer ? Number(p.priceTransfer) : null,
      notes: (p.notes as unknown) as ProductWithNotes["notes"],
    })) as unknown as ProductWithNotes[];

    return NextResponse.json({
      products: mapped,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
