"use client";

import { useState } from "react";
import Link from "next/link";
// Instagram icon from lucide-react is not available — using inline SVG
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setEmail("");
  }

  return (
    <footer className="bg-black border-t border-border mt-20">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center gap-6">
          <div className="md:w-1/3">
            <h3 className="text-2xl font-serif font-bold text-white">Newsletter</h3>
          </div>
          <div className="md:w-1/3 text-center">
            <p className="text-muted-foreground text-sm">Registrate y recibí nuestras ofertas.</p>
          </div>
          <form onSubmit={handleNewsletter} className="md:w-1/3 flex gap-2 w-full">
            {sent ? (
              <p className="text-gold text-sm">¡Gracias por suscribirte!</p>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="Ingresá tu email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="outline" size="sm">
                  Enviar
                </Button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-white mb-4">Categorías</h4>
          <ul className="space-y-2">
            {[{ href: "/", label: "Inicio" }, { href: "/productos", label: "Productos" }, { href: "/productos?category=ARABE", label: "Árabes" }, { href: "/contacto", label: "Contacto" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-white mb-4">Contactános</h4>
          <ul className="space-y-2">
            <li className="text-sm text-muted-foreground">5491162337973</li>
            <li className="text-sm text-muted-foreground">1162337973</li>
            <li>
              <a href="mailto:saidperfumes@gmail.com" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                saidperfumes@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-white mb-4">Seguinos</h4>
          <a
            href="https://instagram.com/saidperfumes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-gold transition-colors"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-white mb-4">Mi cuenta</h4>
          <ul className="space-y-2">
            {[{ href: "/login", label: "Iniciar sesión" }, { href: "/register", label: "Crear cuenta" }, { href: "/mis-pedidos", label: "Mis pedidos" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Payment logos */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">Medios de pago</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["VISA", "MC", "AMEX", "NARANJA", "CABAL", "PAGOFÁCIL", "RAPIPAGO"].map((p) => (
              <span key={p} className="px-2 py-1 border border-border text-[9px] text-muted-foreground uppercase tracking-wider">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border bg-black/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SAID Perfumes. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/defensa-al-consumidor" className="text-xs text-muted-foreground hover:text-gold transition-colors">
              Defensa del consumidor
            </Link>
            <Link href="/arrepentimiento" className="text-xs text-muted-foreground hover:text-gold transition-colors">
              Botón de arrepentimiento
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
