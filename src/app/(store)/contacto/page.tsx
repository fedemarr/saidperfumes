"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

const contactSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  message: z.string().min(10, "El mensaje es muy corto"),
});
type ContactInput = z.infer<typeof contactSchema>;

export default function ContactoPage() {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(_data: ContactInput) {
    if (!turnstileToken) { setServerError("Completá la verificación"); return; }
    setServerError("");
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <a href="/" className="hover:text-gold">Inicio</a>
        <span>·</span>
        <span className="text-white">Contacto</span>
      </div>

      <h1 className="text-3xl font-serif font-bold mb-10">Contacto</h1>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-gold flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">WhatsApp</p>
              <a href="https://wa.me/5491162337973" target="_blank" rel="noopener noreferrer"
                className="text-white hover:text-gold transition-colors">
                +54 9 11 6233 7973
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gold flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Teléfono</p>
              <a href="tel:+541162337973" className="text-white hover:text-gold transition-colors">
                11 6233 7973
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gold flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Email</p>
              <a href="mailto:saidperfumes@gmail.com" className="text-gold hover:underline">
                saidperfumes@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        {sent ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">¡Mensaje enviado!</h2>
            <p className="text-muted-foreground text-sm">Nos pondremos en contacto a la brevedad.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="ej.: María Pérez" className="mt-1" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ej.: tuemail@email.com" className="mt-1" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Teléfono <span className="text-muted-foreground">(opcional)</span></Label>
              <Input id="phone" placeholder="ej.: 1123445567" className="mt-1" {...register("phone")} />
            </div>
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea id="message" placeholder="ej.: Tu mensaje" className="mt-1" {...register("message")} />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
            </div>

            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
            />

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" disabled={isSubmitting || !turnstileToken}>
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
