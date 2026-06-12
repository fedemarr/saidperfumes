import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const email = "mpabluk@gmail.com";
  const password = "Admin1234!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Ya existe el usuario: ${email}`);
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", emailVerified: new Date() },
    });
    console.log("✓ Rol actualizado a ADMIN");
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      name: "Admin SAID",
      password: hashed,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Usuario admin creado:");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Cambiá la contraseña después del primer login");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
