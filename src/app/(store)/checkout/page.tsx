"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronRight } from "lucide-react";
import { shippingSchema, type ShippingInput } from "@/lib/validations/order";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, PROVINCES, getCardPrice } from "@/lib/utils";

type Step = 1 | 2 | 3;
type PaymentMethod = "TRANSFERENCIA" | "TARJETA";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFERENCIA");
  const [shippingData, setShippingData] = useState<ShippingInput | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ShippingInput>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: session?.user.name ?? "",
      email: session?.user.email ?? "",
    },
  });

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif font-bold mb-4">Tu carrito está vacío</h1>
        <Button asChild><Link href="/productos">Ver productos</Link></Button>
      </div>
    );
  }

  const transferTotal = items.reduce((s, i) => s + (i.priceTransfer ?? i.price) * i.quantity, 0);
  const cardTotal = items.reduce((s, i) => s + getCardPrice(i.priceTransfer ?? i.price) * i.quantity, 0);
  const total = paymentMethod === "TRANSFERENCIA" ? transferTotal : cardTotal;
  const discount = paymentMethod === "TRANSFERENCIA" ? cardTotal - transferTotal : 0;

  async function onShippingSubmit(data: ShippingInput) {
    setShippingData(data);
    setStep(2);
  }

  async function placeOrder() {
    if (!shippingData) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping: shippingData,
          paymentMethod,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error al crear la orden"); return; }
      setOrderNumber(json.orderNumber);
      clearCart();
      if (paymentMethod === "TARJETA" && json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        setStep(3);
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const STEPS = ["Envío", "Pago", "Confirmación"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step > i + 1 ? "bg-gold text-black" : step === i + 1 ? "bg-gold text-black" : "bg-muted text-muted-foreground"
            }`}>
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${step === i + 1 ? "text-white" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {/* Left: steps */}
        <div className="md:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-5">
              <h2 className="text-xl font-serif font-bold mb-6">Datos de envío</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre completo</Label>
                  <Input className="mt-1" placeholder="María García" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label>Email</Label>
                  <Input className="mt-1" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input className="mt-1" placeholder="1123445567" {...register("phone")} />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input className="mt-1" placeholder="Av. Corrientes 1234, Piso 2" {...register("street")} />
                  {errors.street && <p className="text-xs text-destructive mt-1">{errors.street.message}</p>}
                </div>
                <div>
                  <Label>Ciudad</Label>
                  <Input className="mt-1" placeholder="Buenos Aires" {...register("city")} />
                  {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Select value={watch("province") || undefined} onValueChange={(v) => setValue("province", v, { shouldValidate: true })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccioná tu provincia" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                      {PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.province && <p className="text-xs text-destructive mt-1">{errors.province.message}</p>}
                </div>
                <div>
                  <Label>Código postal</Label>
                  <Input className="mt-1" placeholder="1043" {...register("zip")} />
                  {errors.zip && <p className="text-xs text-destructive mt-1">{errors.zip.message}</p>}
                </div>
              </div>
              <Button type="submit" className="mt-4">Continuar al pago</Button>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-bold mb-6">Método de pago</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("TRANSFERENCIA")}
                  className={`p-5 border-2 text-left transition-colors ${
                    paymentMethod === "TRANSFERENCIA" ? "border-gold" : "border-border hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">Transferencia bancaria</span>
                    {paymentMethod === "TRANSFERENCIA" && <Check className="h-4 w-4 text-gold" />}
                  </div>
                  <span className="text-xs text-gold font-bold">Precio especial</span>
                  <p className="text-xs text-muted-foreground mt-1">CBU / Alias / Mercado Pago</p>
                </button>

                <button
                  onClick={() => setPaymentMethod("TARJETA")}
                  className={`p-5 border-2 text-left transition-colors ${
                    paymentMethod === "TARJETA" ? "border-gold" : "border-border hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">Tarjeta de crédito</span>
                    {paymentMethod === "TARJETA" && <Check className="h-4 w-4 text-gold" />}
                  </div>
                  <span className="text-xs text-gold font-bold">3 cuotas sin interés</span>
                  <p className="text-xs text-muted-foreground mt-1">Visa, Mastercard y más</p>
                </button>
              </div>

              {paymentMethod === "TRANSFERENCIA" && (
                <div className="bg-card border border-gold/30 p-5 space-y-2">
                  <p className="text-sm font-semibold text-gold mb-3">Datos bancarios</p>
                  <p className="text-sm text-white">CBU: <span className="font-mono">{process.env.NEXT_PUBLIC_BANK_CBU ?? "0000000000000000000000"}</span></p>
                  <p className="text-sm text-white">Alias: <span className="font-mono">{process.env.NEXT_PUBLIC_BANK_ALIAS ?? "said.perfumes"}</span></p>
                  <p className="text-sm text-white">Titular: {process.env.NEXT_PUBLIC_BANK_HOLDER ?? "SAID S.R.L."}</p>
                  <p className="text-sm text-gold font-semibold mt-2">Monto a transferir: {formatPrice(total)}</p>
                  {session && <p className="text-xs text-muted-foreground mt-2">Una vez generada la orden, subí el comprobante desde Mis Pedidos.</p>}
                </div>
              )}

              {paymentMethod === "TARJETA" && (
                <div className="bg-card border border-gold/30 p-5">
                  <p className="text-sm font-semibold text-gold mb-2">Pago con MercadoPago</p>
                  <p className="text-sm text-muted-foreground">Al confirmar serás redirigido a MercadoPago para completar el pago con tu tarjeta en 3 cuotas sin interés.</p>
                  <p className="text-sm text-gold font-semibold mt-2">Total: {formatPrice(total)}</p>
                </div>
              )}

{error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Volver</Button>
                <Button onClick={placeOrder} disabled={submitting}>
                  {submitting ? "Procesando..." : paymentMethod === "TARJETA" ? "Pagar con MercadoPago" : "Confirmar pedido"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="text-center py-10 space-y-5">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-serif font-bold">¡Pedido confirmado!</h2>
              <p className="text-muted-foreground">
                Tu orden <span className="text-gold font-semibold">#{orderNumber}</span> fue recibida.
              </p>
              <p className="text-sm text-muted-foreground">
                Revisá tu email — te enviamos los detalles del pedido.
              </p>
              {paymentMethod === "TRANSFERENCIA" && session && (
                <p className="text-sm text-gold">Recordá subir el comprobante desde Mis Pedidos.</p>
              )}
              <div className="flex gap-3 justify-center mt-6">
                {session && (
                  <Button asChild><Link href="/mis-pedidos">Ver mis pedidos</Link></Button>
                )}
                <Button variant="outline" asChild><Link href="/productos">Seguir comprando</Link></Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: order summary */}
        {step < 3 && (
          <div className="bg-card border border-border p-5 h-fit space-y-4">
            <h3 className="font-semibold tracking-wide uppercase text-sm">Resumen</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative w-12 h-12 bg-muted flex-shrink-0">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <p className="text-xs text-gold flex-shrink-0">
                    {formatPrice((paymentMethod === "TRANSFERENCIA" ? (item.priceTransfer ?? item.price) : getCardPrice(item.priceTransfer ?? item.price)) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              {paymentMethod === "TRANSFERENCIA" && discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Descuento transferencia</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-border pt-2">
                <span>Total</span>
                <span className="text-gold">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
