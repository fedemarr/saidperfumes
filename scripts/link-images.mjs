import { Pool } from "pg";
import { readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

const pool = new Pool({
  connectionString: "postgresql://postgres:Loscedros10@db.bibduvmzsitfkvtsotjz.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

// Walk public/imgs and build map: normalize(brand + name) -> public URL
const BASE_DIR = new URL("../public/imgs", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const BASE_URL = "/imgs";

function normalize(str) {
  return str.toUpperCase().trim().replace(/\s+/g, " ");
}

function walkDir(dir, brand = null) {
  const entries = readdirSync(dir);
  const results = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkDir(full, normalize(entry)));
    } else if ([".jpg", ".jpeg", ".png", ".webp"].includes(extname(entry).toLowerCase())) {
      const name = normalize(basename(entry, extname(entry)));
      const relPath = full.replace(BASE_DIR, "").replace(/\\/g, "/");
      results.push({ brand, name, url: BASE_URL + relPath });
    }
  }
  return results;
}

const images = walkDir(BASE_DIR);
console.log(`Found ${images.length} images`);

// Fetch all products
const { rows: products } = await pool.query(`SELECT id, brand, name FROM "Product"`);
console.log(`Found ${products.length} products in DB`);

let updated = 0;
let notFound = 0;

for (const img of images) {
  // Try exact match: brand + name
  const match = products.find(p => {
    const pb = normalize(p.brand);
    const pn = normalize(p.name);
    return pb === img.brand && pn === img.name;
  }) ?? products.find(p => {
    // Partial: product name starts with image name
    const pb = normalize(p.brand);
    const pn = normalize(p.name);
    return pb === img.brand && pn.startsWith(img.name);
  }) ?? products.find(p => {
    // Partial: image name starts with product name
    const pb = normalize(p.brand);
    const pn = normalize(p.name);
    return pb === img.brand && img.name.startsWith(pn);
  });

  if (match) {
    await pool.query(
      `UPDATE "Product" SET images = $1, "updatedAt" = NOW() WHERE id = $2`,
      [JSON.stringify([img.url]), match.id]
    );
    console.log(`✓  ${img.brand} / ${img.name} → ${match.name}`);
    updated++;
  } else {
    console.log(`✗  No match: ${img.brand} / ${img.name}`);
    notFound++;
  }
}

console.log(`\n✅ Updated: ${updated} | Not matched: ${notFound}`);
await pool.end();
