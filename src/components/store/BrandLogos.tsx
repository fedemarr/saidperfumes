"use client";

import { useState } from "react";
import Link from "next/link";

const TABS = ["ÁRABE", "DISEÑADOR", "NICHO"] as const;
type Tab = (typeof TABS)[number];

const BRANDS: Record<Tab, { name: string; href: string }[]> = {
  ÁRABE: [
    { name: "AFNAN", href: "/productos?brand=AFNAN" },
    { name: "AL HARAMAIN", href: "/productos?brand=AL HARAMAIN" },
    { name: "AL WATANIAH", href: "/productos?brand=AL WATANIAH" },
    { name: "LATTAFA", href: "/productos?brand=LATTAFA" },
    { name: "RASASI", href: "/productos?brand=RASASI" },
    { name: "RAYHAAN", href: "/productos?brand=RAYHAAN" },
    { name: "BHARARA", href: "/productos?brand=BHARARA" },
  ],
  DISEÑADOR: [
    { name: "ARMAF", href: "/productos?brand=ARMAF" },
    { name: "EMPER", href: "/productos?brand=EMPER" },
    { name: "FRENCH AVENUE", href: "/productos?brand=FRENCH AVENUE" },
    { name: "GIORGIO", href: "/productos?brand=GIORGIO" },
    { name: "JEAN PAUL GAULTIER", href: "/productos?brand=JEAN PAUL GAULTIER" },
  ],
  NICHO: [
    { name: "MAISON ALHAMBRA", href: "/productos?brand=MAISON ALHAMBRA" },
    { name: "XERJOFF", href: "/productos?brand=XERJOFF" },
    { name: "DHERRERA", href: "/productos?brand=DHERRERA" },
  ],
};

export function BrandLogos() {
  const [activeTab, setActiveTab] = useState<Tab>("ÁRABE");

  return (
    <section className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-heading">Marcas</h2>

        <div className="flex justify-center gap-8 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs tracking-widest uppercase font-medium transition-colors pb-2 border-b-2 ${
                activeTab === tab
                  ? "text-gold border-gold"
                  : "text-muted-foreground border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {BRANDS[activeTab].map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              className="group flex items-center justify-center"
            >
              <span className="font-serif text-lg md:text-2xl font-bold tracking-widest text-gold/60 group-hover:text-gold transition-colors duration-300 uppercase">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
