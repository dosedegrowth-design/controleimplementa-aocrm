"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Usuario, Role } from "@/lib/types";

export function GerenciarUsuarios({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    email: "",
    nome: "",
    role: "viewer" as Role,
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function adicionarUsuario() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Erro ao criar usuário");
        return;
      }
      setNovoUsuario({ email: "", nome: "", role: "viewer", senha: "" });
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function alterarRole(id: string, role: Role) {
    await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.refresh();
  }

  async function alterarAtivo(id: string, ativo: boolean) {
    await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo }),
    });
    router.refresh();
  }

  async function deletarUsuario(id: string) {
    if (!confirm("Remover este usuário?")) return;
    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>Gerenciar usuários</CardTitle>
            <CardDescription>
              Admins editam dados; Viewers só leem. Super Admin tem acesso total.
            </CardDescription>
          </div>
          {!adding && (
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Novo usuário
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <div className="border border-slate-200 rounded-md p-4 space-y-3 bg-slate-50">
            <h4 className="font-medium text-slate-800">Novo usuário</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Senha temporária *</Label>
                <Input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Perfil</Label>
                <Select
                  value={novoUsuario.role}
                  onValueChange={(v) => setNovoUsuario({ ...novoUsuario, role: v as Role })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (edita tudo)</SelectItem>
                    <SelectItem value="viewer">Viewer (só lê)</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-700 bg-red-50 rounded p-2 border border-red-200">
                {error}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button size="sm" onClick={adicionarUsuario} disabled={loading}>
                {loading ? "Criando..." : "Criar usuário"}
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-left font-medium">Nome</th>
                <th className="px-4 py-2 text-left font-medium">Perfil</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Cadastrado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">{u.email}</td>
                  <td className="px-4 py-2 text-slate-600">{u.nome || "—"}</td>
                  <td className="px-4 py-2">
                    <Select
                      value={u.role}
                      onValueChange={(v) => alterarRole(u.id, v as Role)}
                      disabled={u.role === "super_admin"}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={u.ativo ? "concluido" : "default"}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {formatDate(u.criado_em)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title={u.ativo ? "Desativar" : "Reativar"}
                        onClick={() => alterarAtivo(u.id, !u.ativo)}
                      >
                        {u.ativo ? (
                          <UserX className="h-4 w-4 text-amber-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                        )}
                      </Button>
                      {u.role !== "super_admin" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deletarUsuario(u.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
