"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
});
type ProfileInput = z.infer<typeof profileSchema>;

export default function MiCuentaPage() {
  const { data: session, update } = useSession();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: session?.user.name ?? "" },
  });

  async function onSubmit(data: ProfileInput) {
    setError("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) { setError("Error al guardar"); return; }
    await update({ name: data.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-8">Mi cuenta</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold tracking-widest uppercase mb-4">Datos personales</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input className="mt-1" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input value={session?.user.email ?? ""} disabled className="mt-1 opacity-60" />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input className="mt-1" placeholder="1123445567" {...register("phone")} />
            </div>

            <h3 className="text-sm font-semibold tracking-widest uppercase pt-2">Dirección guardada</h3>
            <div>
              <Label>Calle y número</Label>
              <Input className="mt-1" {...register("street")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ciudad</Label>
                <Input className="mt-1" {...register("city")} />
              </div>
              <div>
                <Label>CP</Label>
                <Input className="mt-1" {...register("zip")} />
              </div>
            </div>
            <div>
              <Label>Provincia</Label>
              <Input className="mt-1" {...register("province")} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {saved && <p className="text-sm text-success">¡Cambios guardados!</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-widest uppercase mb-4">Cambiar contraseña</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Para cambiar tu contraseña, usá el flujo de{" "}
            <a href="/forgot-password" className="text-gold hover:underline">recuperar contraseña</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
