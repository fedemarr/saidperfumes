import { Truck, CreditCard, MessageCircle, Phone } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Envíos a TODO el país",
    desc: "Despachamos todos los días",
  },
  {
    icon: CreditCard,
    title: "Pagá en cuotas sin interés",
    desc: "¡Con CUALQUIER tarjeta!",
  },
  {
    icon: MessageCircle,
    title: "Testimonios de clientes",
    desc: "Clickeá para ver opiniones",
  },
  {
    icon: Phone,
    title: "Asesoramiento personalizado",
    desc: "Te ayudamos a encontrar tu perfume",
  },
];

export function TrustBanner() {
  return (
    <div className="bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 px-4 py-5">
              <Icon className="h-6 w-6 text-gold flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white leading-tight">{title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
