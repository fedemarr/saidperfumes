import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [dbBrands, productBrands] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      select: { brand: true, category: true },
      where: { deletedAt: null },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  const dbBrandNames = new Set(dbBrands.map((b) => b.name));
  const extra = productBrands
    .filter((p) => !dbBrandNames.has(p.brand))
    .map((p) => ({ id: null, name: p.brand, category: p.category, createdAt: null }));

  return NextResponse.json({ brands: [...dbBrands, ...extra] });
}

const brandSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.enum(["ARABE", "DESIGNER", "NICHE", "NATIONAL"]).default("ARABE"),
});

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const data = brandSchema.parse(body);

  const brand = await prisma.brand.upsert({
    where: { name: data.name },
    update: { category: data.category },
    create: data,
  });

  return NextResponse.json(brand, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  await prisma.brand.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
