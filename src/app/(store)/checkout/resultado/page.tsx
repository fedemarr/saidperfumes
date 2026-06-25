"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function ResultadoContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const order = params.get("order");

  if (status === "approved") {
    return (
      <div className="text-center py-16 space-y-5">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
        <h1 className="text-2xl font-serif font-bold text-white">¡Pago aprobado!</h1>
        {order && <p className="text-gold font-semibold">Orden #{order}</p>}
        <p className="text-muted-foreground">Tu pago fue procesado correctamente. Te enviamos un email con los detalles.</p>
        <div className="flex gap-3 justify-center">
          <Button asChild><Link href="/mis-pedidos">Ver mis pedidos</Link></Button>
          <Button asChild variant="outline"><Link href="/productos">Seguir comprando</Link></Button>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="text-center py-16 space-y-5">
        <Clock className="h-16 w-16 text-yellow-400 mx-auto" />
        <h1 className="text-2xl font-serif font-bold text-white">Pago pendiente</h1>
        {order && <p className="text-gold font-semibold">Orden #{order}</p>}
        <p className="text-muted-foreground">Tu pago está siendo procesado. Te avisamos cuando se confirme.</p>
        <Button asChild><Link href="/mis-pedidos">Ver mis pedidos</Link></Button>
      </div>
    );
  }

  return (
    <div className="text-center py-16 space-y-5">
      <XCircle className="h-16 w-16 text-red-400 mx-auto" />
      <h1 className="text-2xl font-serif font-bold text-white">El pago no se completó</h1>
      {order && <p className="text-muted-foreground">Orden #{order}</p>}
      <p className="text-muted-foreground">Podés intentarlo de nuevo o elegir otro método de pago.</p>
      <div className="flex gap-3 justify-center">
        <Button asChild><Link href="/checkout">Volver al checkout</Link></Button>
        <Button asChild variant="outline"><Link href="/productos">Ver productos</Link></Button>
      </div>
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Suspense>
        <ResultadoContent />
      </Suspense>
    </div>
  );
}
