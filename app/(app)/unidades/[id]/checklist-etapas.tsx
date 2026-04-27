"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Circle, Clock, AlertOctagon, MinusCircle, Pencil, X } from "lucide-react";
import { ETAPA_LABELS, formatDateTime, STATUS_LABELS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { EtapaOnboarding, SubEtapa, StatusEtapa } from "@/lib/types";

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pendente: Circle,
  em_andamento: Clock,
  concluido: CheckCircle2,
  bloqueado: AlertOctagon,
  nao_aplicavel: MinusCircle,
};

const STATUS_COLOR: Record<string, string> = {
  pendente: "text-slate-400",
  em_andamento: "text-blue-600",
  concluido: "text-emerald-600",
  bloqueado: "text-red-600",
  nao_aplicavel: "text-slate-300",
};

export function ChecklistEtapas({
  unidadeId,
  etapas,
  subEtapas,
}: {
  unidadeId: string;
  etapas: EtapaOnboarding[];
  subEtapas: SubEtapa[];
}) {
  return (
    <div className="space-y-3">
      {etapas.map((etapa) => (
        <EtapaCard
          key={etapa.id}
          etapa={etapa}
          subEtapas={subEtapas.filter((s) => s.etapa_id === etapa.id)}
        />
      ))}
    </div>
  );
}

function EtapaCard({
  etapa,
  subEtapas,
}: {
  etapa: EtapaOnboarding;
  subEtapas: SubEtapa[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    status: etapa.status,
    observacao: etapa.observacao || "",
  });

  const Icon = STATUS_ICON[etapa.status] || Circle;
  const color = STATUS_COLOR[etapa.status] || "text-slate-400";

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("etapas_onboarding")
      .update({
        status: form.status,
        observacao: form.observacao || null,
        concluido_por: form.status === "concluido" ? "usuário" : null,
      })
      .eq("id", etapa.id);
    setSaving(false);

    if (!error) {
      setEditing(false);
      router.refresh();
    } else {
      alert("Erro: " + error.message);
    }
  }

  async function toggleSubEtapa(sub: SubEtapa) {
    const { error } = await supabase
      .from("sub_etapas")
      .update({
        concluido: !sub.concluido,
        concluido_em: !sub.concluido ? new Date().toISOString() : null,
      })
      .eq("id", sub.id);

    if (!error) {
      // Auto-detecta: todas sub-etapas concluídas → marca etapa como concluído
      // Se desmarcou alguma → volta pra em_andamento
      const allDone = subEtapas.every((s) =>
        s.id === sub.id ? !sub.concluido : s.concluido,
      );
      const novoStatus: StatusEtapa = allDone
        ? "concluido"
        : "em_andamento";

      await supabase
        .from("etapas_onboarding")
        .update({
          status: novoStatus,
          concluido_por: allDone ? "auto-checklist" : null,
        })
        .eq("id", etapa.id);

      router.refresh();
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Icon className={`h-6 w-6 mt-0.5 ${color}`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-[#1B2A4A]">
                    {etapa.ordem}. {ETAPA_LABELS[etapa.etapa] || etapa.etapa}
                  </h3>
                  <Badge variant={etapa.status as "pendente" | "em_andamento" | "concluido" | "bloqueado"}>
                    {STATUS_LABELS[etapa.status]}
                  </Badge>
                </div>
                {etapa.concluido_em && (
                  <p className="text-xs text-slate-500 mt-1">
                    Concluído em {formatDateTime(etapa.concluido_em)}
                    {etapa.concluido_por && ` por ${etapa.concluido_por}`}
                  </p>
                )}
                {etapa.observacao && !editing && (
                  <p className="text-sm text-slate-700 mt-2 bg-slate-50 rounded p-2 border border-slate-200">
                    {etapa.observacao}
                  </p>
                )}
              </div>

              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sub-etapas (Grupo WhatsApp) */}
            {subEtapas.length > 0 && (
              <div className="mt-3 space-y-2 ml-1">
                {subEtapas.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded"
                  >
                    <Checkbox
                      checked={sub.concluido}
                      onCheckedChange={() => toggleSubEtapa(sub)}
                    />
                    <div className="flex-1">
                      <span
                        className={`text-sm ${
                          sub.concluido
                            ? "line-through text-slate-400"
                            : "text-slate-700"
                        }`}
                      >
                        {sub.rotulo}
                      </span>
                      {sub.concluido_em && (
                        <span className="text-xs text-slate-400 ml-2">
                          ({formatDateTime(sub.concluido_em)})
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Modo edição */}
            {editing && (
              <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                <div className="flex gap-3 items-center">
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({ ...form, status: v as StatusEtapa })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      <SelectItem value="nao_aplicavel">Não aplicável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  rows={2}
                  placeholder="Observação (opcional)"
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    <X className="h-4 w-4" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
