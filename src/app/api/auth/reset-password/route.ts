import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = resetPasswordSchema.parse(body);

    const record = await prisma.verificationToken.findUnique({ where: { token: data.token } });
    if (!record || record.type !== "password_reset" || record.expires < new Date()) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(data.password, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    });

    await prisma.verificationToken.delete({ where: { token: data.token } });

    return NextResponse.json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Error de validación" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
