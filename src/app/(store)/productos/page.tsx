import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductFilters } from "@/components/store/ProductFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import type { ProductWithNotes } from "@/types";
import type { Category, Gender } from "@prisma/client";

interface PageProps {
  searchParams: {
    search?: string;
    category?: string | string[];
    gender?: string | string[];
    brand?: string | string[];
    priceMin?: string;
    priceMax?: string;
    sortBy?: string;
    page?: string;
  };
}

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

async function getProducts(searchParams: PageProps["searchParams"]) {
  const page = Number(searchParams.page ?? 1);
  const limit = 24;
  const skip = (page - 1) * limit;

  const categories = toArray(searchParams.category) as Category[];
  const genders = toArray(searchParams.gender) as Gender[];
  const brands = toArray(searchParams.brand);

  const where: Record<string, unknown> = { isActive: true };
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { brand: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }
  if (categories.length) where.category = { in: categories };
  if (genders.length) where.gender = { in: genders };
  if (brands.length) where.brand = { in: brands };
  if (searchParams.priceMin || searchParams.priceMax) {
    where.price = {
      ...(searchParams.priceMin && { gte: Number(searchParams.priceMin) }),
      ...(searchParams.priceMax && { lte: Number(searchParams.priceMax) }),
    };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (searchParams.sortBy === "price_asc") orderBy = { price: "asc" };
  if (searchParams.sortBy === "price_desc") orderBy = { price: "desc" };
  if (searchParams.sortBy === "featured") orderBy = { isFeatured: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      priceCash: p.priceCash ? Number(p.priceCash) : null,
      priceTransfer: p.priceTransfer ? Number(p.priceTransfer) : null,
      notes: (p.notes as unknown) as ProductWithNotes["notes"],
    })) as ProductWithNotes[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  let data = { products: [] as ProductWithNotes[], total: 0, page: 1, totalPages: 0 };

  try {
    data = await getProducts(searchParams);
  } catch {
    // DB not connected yet
  }

  const { products, total, page, totalPages } = data;

  const sortOptions = [
    { value: "newest", label: "Más nuevos" },
    { value: "featured", label: "Más vendidos" },
    { value: "price_asc", label: "Precio: menor a mayor" },
    { value: "price_desc", label: "Precio: mayor a menor" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
        <span>·</span>
        <span className="text-white">Productos</span>
      </div>

      <h1 className="text-3xl font-serif font-bold mb-8">Productos</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <ProductFilters />

        <div className="flex-1">
          {/* Sort + count */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <p className="text-sm text-muted-foreground">{total} productos</p>
            <Select defaultValue={searchParams.sortBy ?? "newest"}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>No se encontraron productos.</p>
              <Link href="/productos" className="text-gold hover:underline mt-4 block text-sm">
                Ver todos los productos
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/productos?${new URLSearchParams({ ...searchParams as Record<string, string>, page: String(p) })}`}
                      className={`w-9 h-9 flex items-center justify-center text-sm border transition-colors ${
                        p === page
                          ? "border-gold bg-gold text-black"
                          : "border-border text-white hover:border-gold"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
