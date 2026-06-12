"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: string | null;
  phone: string | null;
  _count: { orders: number };
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await fetch("/api/admin/users").then((r) => r.json());
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleRole(userId: string, currentRole: string) {
    setUpdating(userId);
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setUpdating(null);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold">Usuarios</h1>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground">Usuario</th>
                <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="text-center p-3 text-xs uppercase tracking-wider text-muted-foreground">Pedidos</th>
                <th className="text-center p-3 text-xs uppercase tracking-wider text-muted-foreground">Verificado</th>
                <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground">Registro</th>
                <th className="text-center p-3 text-xs uppercase tracking-wider text-muted-foreground">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-white">{u.name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3 text-center">{u._count.orders}</td>
                  <td className="p-3 text-center">
                    {u.emailVerified
                      ? <span className="text-success text-xs">✓</span>
                      : <span className="text-muted-foreground text-xs">✗</span>}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(u.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant={u.role === "ADMIN" ? "default" : "outline"}
                      disabled={updating === u.id}
                      onClick={() => toggleRole(u.id, u.role)}
                      className="text-xs"
                    >
                      {u.role === "ADMIN" ? "Admin" : "User"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
