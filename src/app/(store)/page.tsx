import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/store/HeroBanner";
import { TrustBanner } from "@/components/store/TrustBanner";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { BrandLogos } from "@/components/store/BrandLogos";
import { WeeklyBestCarousel } from "@/components/store/WeeklyBestCarousel";
import { OlfactivePyramidSection } from "@/components/store/OlfactivePyramidSection";
import type { ProductWithNotes } from "@/types";

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    priceCash: p.priceCash ? Number(p.priceCash) : null,
    priceTransfer: p.priceTransfer ? Number(p.priceTransfer) : null,
    notes: (p.notes as unknown) as ProductWithNotes["notes"],
  })) as ProductWithNotes[];
}

export default async function HomePage() {
  let all: ProductWithNotes[] = [];
  let featured: ProductWithNotes[] = [];
  let newest: ProductWithNotes[] = [];
  let winter: ProductWithNotes[] = [];
  let weeklyBest: ProductWithNotes[] = [];

  try {
    all = await getProducts();
    featured = all.filter((p) => p.isFeatured).slice(0, 10);
    newest = all.slice(0, 8);
    winter = all.filter((p) =>
      p.occasion.some((o) => ["Invierno", "Otoño", "Noche"].includes(o))
    ).slice(0, 8);
    weeklyBest = all.filter((p) => p.isFeatured).slice(0, 12).length >= 4
      ? all.filter((p) => p.isFeatured).slice(0, 12)
      : all.slice(0, 12);
  } catch {
    // DB not connected yet — render shell
  }

  return (
    <div>
      <HeroBanner />
      <TrustBanner />

      <ProductCarousel title="Destacados" products={featured} />
      <ProductCarousel title="Novedades" products={newest} />
      <ProductCarousel title="Tendencias para el Invierno" products={winter} />

      <OlfactivePyramidSection products={all} />

      <WeeklyBestCarousel products={weeklyBest} />

      <BrandLogos />
    </div>
  );
}
