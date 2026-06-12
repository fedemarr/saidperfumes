import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/store/HeroBanner";
import { TrustBanner } from "@/components/store/TrustBanner";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { BrandLogos } from "@/components/store/BrandLogos";
import { WeeklyBestCarousel } from "@/components/store/WeeklyBestCarousel";
import { OlfactivePyramid } from "@/components/store/OlfactivePyramid";
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
  let featured: ProductWithNotes[] = [];
  let newest: ProductWithNotes[] = [];
  let winter: ProductWithNotes[] = [];
  let weeklyBest: ProductWithNotes[] = [];
  let pyramidProduct: ProductWithNotes | null = null;

  try {
    const all = await getProducts();
    featured = all.filter((p) => p.isFeatured).slice(0, 10);
    newest = all.slice(0, 8);
    winter = all.filter((p) =>
      p.occasion.some((o) => ["Invierno", "Otoño", "Noche"].includes(o))
    ).slice(0, 8);
    weeklyBest = all.filter((p) => p.isFeatured).slice(0, 12).length >= 4
      ? all.filter((p) => p.isFeatured).slice(0, 12)
      : all.slice(0, 12);
    pyramidProduct = featured[0] ?? newest[0] ?? null;
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

      {pyramidProduct && (
        <section className="py-12 border-t border-border">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="section-heading">Pirámide Olfativa</h2>
            <div className="flex flex-col md:flex-row items-center gap-10 max-w-2xl mx-auto">
              <div className="flex-1 w-full">
                <OlfactivePyramid notes={pyramidProduct.notes} />
              </div>
              <div className="md:w-56 text-center md:text-left">
                <p className="text-xs text-gold uppercase tracking-wider mb-1">{pyramidProduct.brand}</p>
                <p className="text-lg font-semibold text-white">{pyramidProduct.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Cada perfume tiene notas de salida, corazón y fondo que se desarrollan sobre la piel.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <WeeklyBestCarousel products={weeklyBest} />

      <BrandLogos />
    </div>
  );
}
