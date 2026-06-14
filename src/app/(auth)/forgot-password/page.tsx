"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setServerError(json.error); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-serif font-bold mb-4">Revisá tu email</h1>
        <p className="text-muted-foreground">Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.</p>
        <Link href="/login" className="block mt-8 text-gold hover:underline text-sm">Volver al login</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-serif font-bold mb-2">Olvidé mi contraseña</h1>
      <p className="text-muted-foreground text-sm mb-8">Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="ej.: tuemail@email.com" className="mt-1" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar enlace"}
        </Button>
      </form>

      <Link href="/login" className="block text-center mt-6 text-sm text-muted-foreground hover:text-gold transition-colors">
        Volver al login
      </Link>
    </div>
  );
}
