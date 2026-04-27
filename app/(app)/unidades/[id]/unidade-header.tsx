"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Save, X } from "lucide-react";
import { StatusBadge, PrioridadeBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/client";
import type { Unidade } from "@/lib/types";

export function UnidadeHeader({
  unidade,
  pct,
}: {
  unidade: Unidade;
  pct: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome_franqueado: unidade.nome_franqueado || "",
    telefone_franqueado: unidade.telefone_franqueado || "",
    prioridade: unidade.prioridade,
    responsavel_interno: unidade.responsavel_interno || "",
    observacoes: unidade.observacoes || "",
  });

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("unidades")
      .update({
        nome_franqueado: form.nome_franqueado || null,
        telefone_franqueado: form.telefone_franqueado || null,
        prioridade: form.prioridade,
        responsavel_interno: form.responsavel_interno || null,
        observacoes: form.observacoes || null,
      })
      .eq("id", unidade.id);
    setSaving(false);

    if (!error) {
      setEditing(false);
      router.refresh();
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  }

  if (!editing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#1B2A4A]">{unidade.nome_unidade}</h1>
                <StatusBadge status={unidade.status_geral} />
                <PrioridadeBadge prioridade={unidade.prioridade} />
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>
                  <strong>{pct}%</strong> concluído
                </span>
                {unidade.responsavel_interno && (
                  <span>
                    Responsável: <strong>{unidade.responsavel_interno}</strong>
                  </span>
                )}
              </div>
              {unidade.observacoes && (
                <p className="text-sm text-slate-700 max-w-3xl bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                  📝 {unidade.observacoes}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1B2A4A]">Editar {unidade.nome_unidade}</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" /> Salvar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome_franqueado">Nome do Franqueado</Label>
            <Input
              id="nome_franqueado"
              value={form.nome_franqueado}
              onChange={(e) => setForm({ ...form, nome_franqueado: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefone_franqueado">Telefone do Franqueado</Label>
            <Input
              id="telefone_franqueado"
              value={form.telefone_franqueado}
              onChange={(e) => setForm({ ...form, telefone_franqueado: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Prioridade</Label>
            <Select
              value={form.prioridade}
              onValueChange={(v) => setForm({ ...form, prioridade: v as Unidade["prioridade"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="responsavel_interno">Responsável Interno</Label>
            <Input
              id="responsavel_interno"
              value={form.responsavel_interno}
              onChange={(e) => setForm({ ...form, responsavel_interno: e.target.value })}
              placeholder="Quem do seu time tá tocando"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            rows={3}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Notas internas sobre essa unidade..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
