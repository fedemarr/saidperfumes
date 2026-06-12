import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL ?? "";

  let config: PoolConfig;

  if (url && url.includes(":6543")) {
    // Supabase pooler: pg truncates usernames with dots when parsing URLs,
    // so we parse manually and pass explicit options.
    const parsed = new URL(url);
    config = {
      host: parsed.hostname,
      port: 6543,
      database: parsed.pathname.slice(1),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: false,
      max: 1,
    };
  } else {
    config = {
      connectionString: url || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
      ssl: url.includes("supabase") ? { rejectUnauthorized: false } : false,
      max: 1,
    };
  }

  const pool = new Pool(config);
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
