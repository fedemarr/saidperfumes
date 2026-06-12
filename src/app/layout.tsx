import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SAID Perfumes — Perfumes Árabes y de Diseñador",
  description:
    "Descubrí nuestra colección de más de 250 perfumes árabes y de diseñador. Envíos a todo el país, cuotas sin interés.",
  keywords: "perfumes arabes, perfumes diseñador, lattafa, armaf, afnan, rasasi",
  openGraph: {
    title: "SAID Perfumes",
    description: "Más de 250 perfumes árabes y de diseñador",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
