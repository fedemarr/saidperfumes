import { readdirSync, statSync, writeFileSync } from "fs";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_DIR = join(__dirname, "../public/imgs");
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

const lines = images
  .filter(img => img.brand !== null) // skip root-level files without brand folder
  .map(img => {
    const url = img.url.replace(/'/g, "''");
    const brand = img.brand.replace(/'/g, "''");
    const name = img.name.replace(/'/g, "''");

    return `UPDATE "Product" SET images = ARRAY['${url}'], "updatedAt" = NOW()` +
      ` WHERE UPPER(TRIM(brand)) = '${brand}'` +
      ` AND (UPPER(TRIM(name)) = '${name}' OR UPPER(TRIM(name)) LIKE '${name}%' OR '${name}' LIKE UPPER(TRIM(name)) || '%');`;
  });

const sql = lines.join("\n");
writeFileSync(join(__dirname, "update-images.sql"), sql, "utf8");
console.log(`Generated ${lines.length} UPDATE statements → scripts/update-images.sql`);
