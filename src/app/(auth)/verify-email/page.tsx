import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <Result error="El enlace no es válido." />;
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return <Result error="El enlace no es válido o ya fue utilizado." />;
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return <Result error="El enlace expiró. Registrate de nuevo para recibir uno nuevo." />;
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return <Result success />;
}

function Result({ success, error }: { success?: boolean; error?: string }) {
  return (
    <div className="text-center space-y-4">
      {success ? (
        <>
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-serif font-bold text-gold">¡Cuenta confirmada!</h1>
          <p className="text-muted-foreground">Tu cuenta fue verificada exitosamente. Ya podés iniciar sesión.</p>
          <Link
            href="/login"
            className="inline-block mt-4 px-8 py-3 bg-gold text-black font-bold text-sm tracking-widest uppercase hover:bg-gold/90 transition-colors"
          >
            Iniciar sesión
          </Link>
        </>
      ) : (
        <>
          <div className="text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-serif font-bold text-white">Enlace inválido</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link
            href="/register"
            className="inline-block mt-4 px-8 py-3 border border-gold text-gold font-bold text-sm tracking-widest uppercase hover:bg-gold hover:text-black transition-colors"
          >
            Crear cuenta
          </Link>
        </>
      )}
    </div>
  );
}
