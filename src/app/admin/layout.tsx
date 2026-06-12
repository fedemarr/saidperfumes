import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, CreditCard, Package, Users, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-[0.2em] text-white uppercase">SAID</span>
            <span className="text-[9px] tracking-[0.4em] text-gold uppercase">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-white hover:bg-muted transition-colors rounded-sm"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
            Salir
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
