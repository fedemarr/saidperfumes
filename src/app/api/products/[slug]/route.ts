import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductWithNotes } from "@/types";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
  });

  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      brand: product.brand,
      id: { not: product.id },
    },
    take: 8,
  });

  type ProductRow = NonNullable<typeof product>;
  function mapProduct(p: ProductRow) {
    return {
      ...p,
      price: Number(p.price),
      priceCash: p.priceCash ? Number(p.priceCash) : null,
      priceTransfer: p.priceTransfer ? Number(p.priceTransfer) : null,
      notes: (p.notes as unknown) as ProductWithNotes["notes"],
    };
  }

  return NextResponse.json({
    product: mapProduct(product),
    related: related.map(mapProduct),
  });
}
