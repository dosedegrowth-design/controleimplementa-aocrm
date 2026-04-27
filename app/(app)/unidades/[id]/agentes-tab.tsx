"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Agente } from "@/lib/types";

const PERFIL_LABELS: Record<string, string> = {
  administrador: "Administrador",
  agente: "Agente",
  digitador: "Digitador",
  proprietario: "Proprietário",
  outro: "Outro",
};

export function AgentesTab({
  unidadeId,
  agentes,
}: {
  unidadeId: string;
  agentes: Agente[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [novoAgente, setNovoAgente] = useState({
    nome: "",
    email: "",
    perfil: "agente",
  });

  async function toggleField(agente: Agente, field: "criado_no_crm" | "acesso_enviado") {
    const newValue = !agente[field];
    const update: Record<string, unknown> = { [field]: newValue };
    if (field === "acesso_enviado") {
      update.data_envio_acesso = newValue ? new Date().toISOString() : null;
    }
    await supabase.from("agentes").update(update).eq("id", agente.id);
    router.refresh();
  }

  async function deletarAgente(id: string) {
    if (!confirm("Remover este agente?")) return;
    await supabase.from("agentes").delete().eq("id", id);
    router.refresh();
  }

  async function adicionarAgente() {
    if (!novoAgente.nome && !novoAgente.email) return;
    await supabase.from("agentes").insert({
      unidade_id: unidadeId,
      nome: novoAgente.nome || null,
      email: novoAgente.email || null,
      perfil: novoAgente.perfil,
      origem: "manual",
    });
    setNovoAgente({ nome: "", email: "", perfil: "agente" });
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {agentes.length} agente{agentes.length !== 1 && "s"} cadastrado{agentes.length !== 1 && "s"}
        </p>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Adicionar agente
          </Button>
        )}
      </div>

      {adding && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium text-slate-800">Novo agente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={novoAgente.nome}
                  onChange={(e) => setNovoAgente({ ...novoAgente, nome: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={novoAgente.email}
                  onChange={(e) => setNovoAgente({ ...novoAgente, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Perfil</Label>
                <Select
                  value={novoAgente.perfil}
                  onValueChange={(v) => setNovoAgente({ ...novoAgente, perfil: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="agente">Agente</SelectItem>
                    <SelectItem value="digitador">Digitador</SelectItem>
                    <SelectItem value="proprietario">Proprietário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={adicionarAgente}>
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {agentes.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhum agente cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Nome</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Perfil</th>
                    <th className="px-4 py-3 text-center font-medium">Criado no CRM</th>
                    <th className="px-4 py-3 text-center font-medium">Acesso enviado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {agentes.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {a.nome || <span className="text-slate-400 italic font-normal">sem nome</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.email ? (
                          <a href={`mailto:${a.email}`} className="text-[#1B2A4A] hover:underline inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {a.email}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {PERFIL_LABELS[a.perfil] || a.perfil}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={a.criado_no_crm}
                          onCheckedChange={() => toggleField(a, "criado_no_crm")}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={a.acesso_enviado}
                          onCheckedChange={() => toggleField(a, "acesso_enviado")}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deletarAgente(a.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
