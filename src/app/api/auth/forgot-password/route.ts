import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ message: "Si el email existe, recibirás un enlace." });
    }

    await prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: "password_reset" },
    });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: "password_reset",
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(user.email, user.name ?? "", token);

    return NextResponse.json({ message: "Si el email existe, recibirás un enlace." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Error de validación" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
