import { z } from "zod";

export const shippingSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre completo"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
  street: z.string().min(5, "Ingresá tu dirección completa"),
  city: z.string().min(2, "Ingresá tu ciudad"),
  province: z.string().min(2, "Seleccioná tu provincia"),
  zip: z.string().min(4, "Código postal inválido"),
});

export const checkoutSchema = z.object({
  shipping: shippingSchema,
  paymentMethod: z.enum(["TRANSFERENCIA", "TARJETA"]),
  notes: z.string().optional(),
});

export type ShippingInput = z.infer<typeof shippingSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
