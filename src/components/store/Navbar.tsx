"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, ShoppingBag, X, Menu } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { CartSidebar } from "./CartSidebar";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, openCart } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/productos?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSearchOpen(false);
      setMobileOpen(false);
    }
  }

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Productos" },
    { href: "/contacto", label: "Contacto" },
  ];

  return (
    <>
      <header className={cn("sticky top-0 z-30 bg-black transition-shadow", scrolled && "shadow-lg shadow-black/50")}>
        {/* Top bar */}
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center gap-3">

            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
              <div className="flex items-center border border-border h-9 px-3 gap-2 w-full focus-within:border-gold transition-colors">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar"
                  className="bg-transparent text-sm text-white placeholder:text-muted-foreground flex-1 outline-none"
                />
                <button type="submit" className="text-muted-foreground hover:text-white transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Mobile: hamburger on the left */}
            <button onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); }} className="md:hidden text-white p-1">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo — centered */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="flex flex-col items-center">
                <span className="font-serif text-2xl font-bold tracking-[0.3em] text-white uppercase">SAID</span>
                <span className="text-[9px] tracking-[0.5em] text-gold uppercase">Perfumes</span>
              </Link>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2 md:gap-3 md:flex-1 md:justify-end">
              {/* Mobile search icon */}
              <button onClick={() => { setSearchOpen(!searchOpen); setMobileOpen(false); }} className="md:hidden text-white hover:text-gold transition-colors p-1">
                <Search className="h-5 w-5" />
              </button>

              <div className="relative">
                <button onClick={() => setUserOpen(!userOpen)} className="text-white hover:text-gold transition-colors p-1">
                  <User className="h-5 w-5" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border shadow-xl z-50">
                    {session ? (
                      <>
                        <Link href="/mi-cuenta" onClick={() => setUserOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-muted transition-colors border-b border-border">
                          Mi cuenta
                        </Link>
                        <Link href="/mis-pedidos" onClick={() => setUserOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-muted transition-colors border-b border-border">
                          Mis pedidos
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Link href="/admin" onClick={() => setUserOpen(false)} className="block px-4 py-3 text-sm text-gold hover:bg-muted transition-colors border-b border-border">
                            Panel Admin
                          </Link>
                        )}
                        <button onClick={() => { signOut(); setUserOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors">
                          Cerrar sesión
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setUserOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-muted transition-colors border-b border-border">
                          Iniciar sesión
                        </Link>
                        <Link href="/register" onClick={() => setUserOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-muted transition-colors">
                          Crear cuenta
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button onClick={openCart} className="relative text-white hover:text-gold transition-colors p-1">
                <ShoppingBag className="h-5 w-5" />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 py-3">
            <form onSubmit={handleSearch} className="flex items-center border border-border h-10 px-3 gap-2 focus-within:border-gold transition-colors">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar perfumes..."
                className="bg-transparent text-sm text-white placeholder:text-muted-foreground flex-1 outline-none"
              />
              <button type="submit" className="text-muted-foreground hover:text-white transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Desktop nav links */}
        <nav className="hidden md:block border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex justify-center gap-8 h-11 items-center">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/80 hover:text-white tracking-widest uppercase transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden border-b border-border bg-card">
            <ul className="px-4 py-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm text-white tracking-widest uppercase border-b border-border last:border-0"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {session ? (
                <>
                  <li><Link href="/mi-cuenta" onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-muted-foreground border-b border-border">Mi cuenta</Link></li>
                  <li><Link href="/mis-pedidos" onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-muted-foreground border-b border-border">Mis pedidos</Link></li>
                  {session.user.role === "ADMIN" && (
                    <li><Link href="/admin" onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-gold">Panel Admin</Link></li>
                  )}
                </>
              ) : (
                <>
                  <li><Link href="/login" onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-muted-foreground border-b border-border">Iniciar sesión</Link></li>
                  <li><Link href="/register" onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-muted-foreground">Crear cuenta</Link></li>
                </>
              )}
            </ul>
          </nav>
        )}
      </header>

      <CartSidebar />

      {(userOpen || mobileOpen) && (
        <div className="fixed inset-0 z-20" onClick={() => { setUserOpen(false); }} />
      )}
    </>
  );
}
