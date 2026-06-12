import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  const isSupabase = url.includes("supabase");
  // Pooler (port 6543) doesn't support SSL the same way — skip SSL for pooler connections
  const isPooler = url.includes(":6543");
  const pool = new Pool({
    connectionString: url,
    max: 1, // limit connections in serverless
    ssl: isSupabase && !isPooler ? { rejectUnauthorized: false } : isSupabase ? false : false,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
