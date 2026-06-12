import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductWithNotes } from "@/types";

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const raw = await prisma.product.findUnique({ where: { id: params.id } });
  if (!raw) notFound();

  const product: ProductWithNotes = {
    ...raw,
    price: Number(raw.price),
    priceCash: raw.priceCash ? Number(raw.priceCash) : null,
    priceTransfer: raw.priceTransfer ? Number(raw.priceTransfer) : null,
    notes: (raw.notes as unknown) as ProductWithNotes["notes"],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold">Editar producto</h1>
      <ProductForm product={product} />
    </div>
  );
}
