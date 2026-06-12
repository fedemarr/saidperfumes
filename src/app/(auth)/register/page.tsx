"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, turnstileToken }),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Error al crear la cuenta");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-6">✉️</div>
        <h1 className="text-2xl font-serif font-bold mb-4">¡Revisá tu email!</h1>
        <p className="text-muted-foreground">
          Te enviamos un enlace de verificación. Hacé click en el link para activar tu cuenta.
        </p>
        <Button className="mt-8" onClick={() => router.push("/login")}>
          Ir al login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-serif font-bold mb-8">Crear cuenta</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" placeholder="ej.: María García" className="mt-1" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="ej.: tuemail@email.com" className="mt-1" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type={showPass ? "text" : "password"}
            placeholder="Repetí tu contraseña"
            className="mt-1"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <TurnstileWidget
          onVerify={(t) => { setTurnstileToken(t); setValue("turnstileToken", t); }}
          onExpire={() => { setTurnstileToken(""); setValue("turnstileToken", ""); }}
        />

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-white hover:text-gold transition-colors">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
