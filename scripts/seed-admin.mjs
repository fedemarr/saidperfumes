import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: "postgresql://postgres:Loscedros10@db.bibduvmzsitfkvtsotjz.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

const email = "mpabluk@gmail.com";
const password = "Admin1234!";
const name = "Admin SAID";

const hashed = await bcrypt.hash(password, 12);

const { rows } = await pool.query(`SELECT id FROM "User" WHERE email = $1`, [email]);

if (rows.length > 0) {
  await pool.query(
    `UPDATE "User" SET role = 'ADMIN', "emailVerified" = NOW(), password = $1 WHERE email = $2`,
    [hashed, email]
  );
  console.log("✓ Usuario existente actualizado a ADMIN");
} else {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO "User" (id, email, name, password, role, "emailVerified", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'ADMIN', NOW(), NOW(), NOW())`,
    [id, email, name, hashed]
  );
  console.log("✅ Usuario admin creado");
}

console.log(`   Email:    ${email}`);
console.log(`   Password: ${password}`);
console.log("   ⚠️  Cambiá la contraseña desde Mi cuenta después del primer login");

await pool.end();
