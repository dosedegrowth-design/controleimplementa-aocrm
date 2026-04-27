"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PrioridadeBadge } from "@/components/status-badge";
import { Loader2, Save, Pencil, X, ArrowRight, Mail, Trash2, Plus, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ETAPA_LABELS,
  STATUS_LABELS,
  formatDateTime,
  timeAgo,
} from "@/lib/utils";
import type {
  Unidade,
  Agente,
  EtapaOnboarding,
  SubEtapa,
  HistoricoEtapa,
  StatusEtapa,
} from "@/lib/types";
import Link from "next/link";

interface UnidadeDrawerProps {
  unidadeId: string | null;
  onClose: () => void;
}

interface FullUnidadeData {
  unidade: Unidade;
  etapas: EtapaOnboarding[];
  subEtapas: SubEtapa[];
  agentes: Agente[];
  historico: HistoricoEtapa[];
}

export function UnidadeDrawer({ unidadeId, onClose }: UnidadeDrawerProps) {
  const [data, setData] = useState<FullUnidadeData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const open = !!unidadeId;

  useEffect(() => {
    if (!unidadeId) {
      setData(null);
      return;
    }
    setLoading(true);
    (async () => {
      const [uRes, eRes, sRes, aRes, hRes] = await Promise.all([
        supabase.from("unidades").select("*").eq("id", unidadeId).maybeSingle(),
        supabase.from("etapas_onboarding").select("*").eq("unidade_id", unidadeId).order("ordem"),
        supabase.from("sub_etapas").select("*, etapa:etapas_onboarding!inner(unidade_id)").eq("etapa.unidade_id", unidadeId).order("ordem"),
        supabase.from("agentes").select("*").eq("unidade_id", unidadeId).order("criado_em"),
        supabase.from("historico_etapas").select("*").eq("unidade_id", unidadeId).order("mudado_em", { ascending: false }).limit(30),
      ]);
      const subEtapasRaw = (sRes.data || []) as (SubEtapa & { etapa?: unknown })[];
      const subEtapas: SubEtapa[] = subEtapasRaw.map(({ etapa: _ignore, ...rest }) => rest as SubEtapa);
      if (uRes.data) {
        setData({
          unidade: uRes.data as Unidade,
          etapas: (eRes.data || []) as EtapaOnboarding[],
          subEtapas,
          agentes: (aRes.data || []) as Agente[],
          historico: (hRes.data || []) as HistoricoEtapa[],
        });
      }
      setLoading(false);
    })();
  }, [unidadeId, supabase]);

  function reload() {
    if (unidadeId) {
      const id = unidadeId;
      // refresh data
      (async () => {
        const [uRes, eRes, sRes, aRes, hRes] = await Promise.all([
          supabase.from("unidades").select("*").eq("id", id).maybeSingle(),
          supabase.from("etapas_onboarding").select("*").eq("unidade_id", id).order("ordem"),
          supabase.from("sub_etapas").select("*, etapa:etapas_onboarding!inner(unidade_id)").eq("etapa.unidade_id", id).order("ordem"),
          supabase.from("agentes").select("*").eq("unidade_id", id).order("criado_em"),
          supabase.from("historico_etapas").select("*").eq("unidade_id", id).order("mudado_em", { ascending: false }).limit(30),
        ]);
        const subEtapasRaw = (sRes.data || []) as (SubEtapa & { etapa?: unknown })[];
        const subEtapas: SubEtapa[] = subEtapasRaw.map(({ etapa: _ignore, ...rest }) => rest as SubEtapa);
        if (uRes.data) {
          setData({
            unidade: uRes.data as Unidade,
            etapas: (eRes.data || []) as EtapaOnboarding[],
            subEtapas,
            agentes: (aRes.data || []) as Agente[],
            historico: (hRes.data || []) as HistoricoEtapa[],
          });
        }
      })();
      router.refresh();
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="overflow-y-auto p-0">
        {loading && !data && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {data && (
          <DrawerContent data={data} onReload={reload} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerContent({ data, onReload }: { data: FullUnidadeData; onReload: () => void }) {
  const { unidade, etapas, subEtapas, agentes, historico } = data;
  const concluidas = etapas.filter((e) => e.status === "concluido").length;
  const pct = etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0;

  return (
    <>
      <SheetHeader>
        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-xl truncate">{unidade.nome_unidade}</SheetTitle>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusBadge status={unidade.status_geral} />
              <PrioridadeBadge prioridade={unidade.prioridade} />
              <span className="text-xs text-slate-500">
                {pct}% concluído ({concluidas}/{etapas.length})
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </SheetHeader>

      <div className="p-6">
        <Tabs defaultValue="checklist">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="agentes">Agentes ({agentes.length})</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="space-y-3 mt-4">
            <ChecklistTab unidadeId={unidade.id} etapas={etapas} subEtapas={subEtapas} onReload={onReload} />
          </TabsContent>

          <TabsContent value="dados" className="mt-4">
            <DadosTab unidade={unidade} onReload={onReload} />
          </TabsContent>

          <TabsContent value="agentes" className="mt-4">
            <AgentesTabInline unidadeId={unidade.id} agentes={agentes} onReload={onReload} />
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <HistoricoTabInline historico={historico} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ============ CHECKLIST ============
function ChecklistTab({
  unidadeId: _unidadeId,
  etapas,
  subEtapas,
  onReload,
}: {
  unidadeId: string;
  etapas: EtapaOnboarding[];
  subEtapas: SubEtapa[];
  onReload: () => void;
}) {
  const supabase = createClient();

  async function quickToggle(etapa: EtapaOnboarding, novoStatus: StatusEtapa) {
    await supabase
      .from("etapas_onboarding")
      .update({
        status: novoStatus,
        concluido_por: novoStatus === "concluido" ? "usuário" : null,
      })
      .eq("id", etapa.id);
    onReload();
  }

  async function toggleSub(sub: SubEtapa, etapa: EtapaOnboarding) {
    const novo = !sub.concluido;
    await supabase
      .from("sub_etapas")
      .update({
        concluido: novo,
        concluido_em: novo ? new Date().toISOString() : null,
      })
      .eq("id", sub.id);

    // Auto-update etapa pai
    const subsDoEtapa = subEtapas.filter((s) => s.etapa_id === etapa.id);
    const allDone = subsDoEtapa.every((s) =>
      s.id === sub.id ? novo : s.concluido,
    );
    const novoStatusEtapa: StatusEtapa = allDone ? "concluido" : "em_andamento";
    await supabase
      .from("etapas_onboarding")
      .update({
        status: novoStatusEtapa,
        concluido_por: allDone ? "auto-checklist" : null,
      })
      .eq("id", etapa.id);
    onReload();
  }

  return (
    <div className="space-y-2">
      {etapas.map((etapa) => {
        const subs = subEtapas.filter((s) => s.etapa_id === etapa.id);
        return (
          <Card key={etapa.id}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-slate-400 font-medium">
                      {etapa.ordem}.
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {ETAPA_LABELS[etapa.etapa]}
                    </h4>
                  </div>

                  {/* Quick action buttons */}
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <QuickStatusButton
                      label="Pendente"
                      active={etapa.status === "pendente"}
                      color="slate"
                      onClick={() => quickToggle(etapa, "pendente")}
                    />
                    <QuickStatusButton
                      label="Em andamento"
                      active={etapa.status === "em_andamento"}
                      color="blue"
                      onClick={() => quickToggle(etapa, "em_andamento")}
                    />
                    <QuickStatusButton
                      label="Concluído"
                      active={etapa.status === "concluido"}
                      color="emerald"
                      onClick={() => quickToggle(etapa, "concluido")}
                    />
                    <QuickStatusButton
                      label="Bloqueado"
                      active={etapa.status === "bloqueado"}
                      color="red"
                      onClick={() => quickToggle(etapa, "bloqueado")}
                    />
                  </div>

                  {etapa.concluido_em && (
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      ✓ {formatDateTime(etapa.concluido_em)}
                    </p>
                  )}

                  {/* Sub-etapas */}
                  {subs.length > 0 && (
                    <div className="mt-3 space-y-1.5 pl-2 border-l-2 border-slate-100">
                      {subs.map((sub) => (
                        <label
                          key={sub.id}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <Checkbox
                            checked={sub.concluido}
                            onCheckedChange={() => toggleSub(sub, etapa)}
                          />
                          <span
                            className={`text-xs ${
                              sub.concluido ? "line-through text-slate-400" : "text-slate-700 group-hover:text-slate-900"
                            }`}
                          >
                            {sub.rotulo}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function QuickStatusButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: "slate" | "blue" | "emerald" | "red";
  onClick: () => void;
}) {
  const colorMap = {
    slate: active ? "bg-slate-200 text-slate-800 border-slate-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50",
    blue: active ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-white text-slate-500 border-slate-200 hover:bg-blue-50",
    emerald: active ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50",
    red: active ? "bg-red-100 text-red-800 border-red-300" : "bg-white text-slate-500 border-slate-200 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-colors ${colorMap[color]}`}
    >
      {label}
    </button>
  );
}

// ============ DADOS TAB ============
function DadosTab({ unidade, onReload }: { unidade: Unidade; onReload: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome_franqueado: unidade.nome_franqueado || "",
    telefone_franqueado: unidade.telefone_franqueado || "",
    prioridade: unidade.prioridade,
    responsavel_interno: unidade.responsavel_interno || "",
    observacoes: unidade.observacoes || "",
  });
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    await supabase.from("unidades").update({
      nome_franqueado: form.nome_franqueado || null,
      telefone_franqueado: form.telefone_franqueado || null,
      prioridade: form.prioridade,
      responsavel_interno: form.responsavel_interno || null,
      observacoes: form.observacoes || null,
    }).eq("id", unidade.id);
    setSaving(false);
    setEditing(false);
    onReload();
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <Card>
          <CardContent className="p-4 space-y-3">
            <DataRow label="Franqueado" value={unidade.nome_franqueado} />
            <DataRow label="Telefone" value={unidade.telefone_franqueado} />
            <DataRow label="Números CRM" value={unidade.numeros_crm.join(", ") || "—"} />
            <DataRow label="Responsável interno" value={unidade.responsavel_interno} />
            <DataRow label="Cadastrado em" value={formatDateTime(unidade.submitted_at)} />
            {unidade.observacoes && (
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-slate-700 mt-2">
                📝 {unidade.observacoes}
              </div>
            )}
          </CardContent>
        </Card>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="w-full">
          <Pencil className="h-3.5 w-3.5" /> Editar dados
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nome do Franqueado</Label>
          <Input value={form.nome_franqueado} onChange={(e) => setForm({ ...form, nome_franqueado: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telefone</Label>
          <Input value={form.telefone_franqueado} onChange={(e) => setForm({ ...form, telefone_franqueado: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Prioridade</Label>
          <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v as Unidade["prioridade"] })}>
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
          <Label className="text-xs">Responsável Interno</Label>
          <Input value={form.responsavel_interno} onChange={(e) => setForm({ ...form, responsavel_interno: e.target.value })} placeholder="Quem do time tá tocando" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Observações</Label>
          <Textarea rows={3} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Notas internas..." />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
            <X className="h-4 w-4" /> Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="text-xs uppercase font-medium text-slate-500 w-32 shrink-0">{label}</span>
      <span className="text-slate-800 break-all">
        {value || <span className="text-slate-400 italic">—</span>}
      </span>
    </div>
  );
}

// ============ AGENTES ============
function AgentesTabInline({ unidadeId, agentes, onReload }: { unidadeId: string; agentes: Agente[]; onReload: () => void }) {
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [novo, setNovo] = useState({ nome: "", email: "", perfil: "agente" });

  async function toggle(a: Agente, field: "criado_no_crm" | "acesso_enviado") {
    const novo = !a[field];
    const update: Record<string, unknown> = { [field]: novo };
    if (field === "acesso_enviado") update.data_envio_acesso = novo ? new Date().toISOString() : null;
    await supabase.from("agentes").update(update).eq("id", a.id);
    onReload();
  }

  async function deletar(id: string) {
    if (!confirm("Remover este agente?")) return;
    await supabase.from("agentes").delete().eq("id", id);
    onReload();
  }

  async function adicionar() {
    if (!novo.nome && !novo.email) return;
    await supabase.from("agentes").insert({
      unidade_id: unidadeId,
      nome: novo.nome || null,
      email: novo.email || null,
      perfil: novo.perfil,
      origem: "manual",
    });
    setNovo({ nome: "", email: "", perfil: "agente" });
    setAdding(false);
    onReload();
  }

  return (
    <div className="space-y-2">
      {agentes.length === 0 && !adding && (
        <Card><CardContent className="p-4 text-center text-sm text-slate-500">Sem agentes cadastrados.</CardContent></Card>
      )}
      {agentes.map((a) => (
        <Card key={a.id}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{a.nome || <span className="italic text-slate-400">sem nome</span>}</p>
                {a.email && <a href={`mailto:${a.email}`} className="text-xs text-[#1B2A4A] hover:underline inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {a.email}</a>}
                <p className="text-[10px] uppercase text-slate-400 font-medium mt-0.5">{a.perfil}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deletar(a.id)} className="h-6 w-6">
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox checked={a.criado_no_crm} onCheckedChange={() => toggle(a, "criado_no_crm")} />
                <span className="text-xs text-slate-700">Criado no CRM</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox checked={a.acesso_enviado} onCheckedChange={() => toggle(a, "acesso_enviado")} />
                <span className="text-xs text-slate-700">Acesso enviado</span>
              </label>
            </div>
          </CardContent>
        </Card>
      ))}

      {adding ? (
        <Card>
          <CardContent className="p-3 space-y-2">
            <Input placeholder="Nome" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            <Input placeholder="Email" type="email" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} />
            <Select value={novo.perfil} onValueChange={(v) => setNovo({ ...novo, perfil: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="agente">Agente</SelectItem>
                <SelectItem value="digitador">Digitador</SelectItem>
                <SelectItem value="proprietario">Proprietário</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancelar</Button>
              <Button size="sm" onClick={adicionar}>Adicionar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" /> Adicionar agente
        </Button>
      )}
    </div>
  );
}

// ============ HISTÓRICO ============
function HistoricoTabInline({ historico }: { historico: HistoricoEtapa[] }) {
  if (historico.length === 0) {
    return <Card><CardContent className="p-4 text-center text-sm text-slate-500">Sem histórico ainda.</CardContent></Card>;
  }
  return (
    <Card>
      <CardContent className="p-0 divide-y divide-slate-100">
        {historico.map((h) => (
          <div key={h.id} className="p-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              {h.status_anterior && <span className="text-slate-500">{STATUS_LABELS[h.status_anterior] || h.status_anterior}</span>}
              {h.status_anterior && <ArrowRight className="h-3 w-3 text-slate-400" />}
              {h.status_novo && <span className="font-medium">{STATUS_LABELS[h.status_novo] || h.status_novo}</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(h.mudado_em)} · {h.mudado_por || "—"}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
