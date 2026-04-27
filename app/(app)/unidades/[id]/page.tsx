import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, PrioridadeBadge } from "@/components/status-badge";
import { ChecklistEtapas } from "./checklist-etapas";
import { AgentesTab } from "./agentes-tab";
import { HistoricoTab } from "./historico-tab";
import { UnidadeHeader } from "./unidade-header";
import { Phone, User, Hash, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import type { Unidade, Agente, EtapaOnboarding, SubEtapa, HistoricoEtapa } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function UnidadeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [uRes, eRes, sRes, aRes, hRes] = await Promise.all([
    supabase.from("unidades").select("*").eq("id", id).maybeSingle(),
    supabase.from("etapas_onboarding").select("*").eq("unidade_id", id).order("ordem"),
    supabase.from("sub_etapas").select("*, etapa:etapas_onboarding!inner(unidade_id)").eq("etapa.unidade_id", id).order("ordem"),
    supabase.from("agentes").select("*").eq("unidade_id", id).order("criado_em"),
    supabase
      .from("historico_etapas")
      .select("*")
      .eq("unidade_id", id)
      .order("mudado_em", { ascending: false })
      .limit(50),
  ]);

  const unidade = uRes.data as Unidade | null;
  if (!unidade) notFound();

  const etapas = (eRes.data || []) as EtapaOnboarding[];

  // Filtra sub_etapas que vieram do join
  const subEtapasRaw = (sRes.data || []) as (SubEtapa & { etapa?: unknown })[];
  const subEtapas: SubEtapa[] = subEtapasRaw.map(({ etapa: _ignore, ...rest }) => rest as SubEtapa);

  const agentes = (aRes.data || []) as Agente[];
  const historico = (hRes.data || []) as HistoricoEtapa[];

  const concluidas = etapas.filter((e) => e.status === "concluido").length;
  const pct = etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <Link
        href="/unidades"
        className="text-sm text-slate-600 hover:text-[#1B2A4A] hover:underline"
      >
        ← Voltar para unidades
      </Link>

      <UnidadeHeader unidade={unidade} pct={pct} />

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs uppercase font-medium text-slate-500">
              <User className="h-3 w-3" />
              Franqueado
            </div>
            <div className="mt-1 text-sm font-medium text-slate-800">
              {unidade.nome_franqueado || (
                <span className="text-slate-400 italic font-normal">Não informado</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs uppercase font-medium text-slate-500">
              <Phone className="h-3 w-3" />
              Telefone Franqueado
            </div>
            <div className="mt-1 text-sm font-medium text-slate-800">
              {unidade.telefone_franqueado || (
                <span className="text-slate-400 italic font-normal">Não informado</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs uppercase font-medium text-slate-500">
              <Hash className="h-3 w-3" />
              Números CRM
            </div>
            <div className="mt-1 text-sm font-medium text-slate-800 break-all">
              {unidade.numeros_crm.length > 0
                ? unidade.numeros_crm.join(", ")
                : <span className="text-slate-400 italic font-normal">Nenhum</span>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs uppercase font-medium text-slate-500">
              <Calendar className="h-3 w-3" />
              Cadastrado em
            </div>
            <div className="mt-1 text-sm font-medium text-slate-800">
              {formatDateTime(unidade.submitted_at)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checklist">
        <TabsList>
          <TabsTrigger value="checklist">Checklist ({concluidas}/{etapas.length})</TabsTrigger>
          <TabsTrigger value="agentes">Agentes ({agentes.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico ({historico.length})</TabsTrigger>
          <TabsTrigger value="dados">Dados originais</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <ChecklistEtapas
            unidadeId={unidade.id}
            etapas={etapas}
            subEtapas={subEtapas}
          />
        </TabsContent>

        <TabsContent value="agentes">
          <AgentesTab unidadeId={unidade.id} agentes={agentes} />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoTab historico={historico} />
        </TabsContent>

        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle>Dados originais do formulário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong className="text-slate-500 text-xs uppercase">Nome da unidade:</strong>
                <p className="text-slate-800">{unidade.nome_unidade}</p>
              </div>
              <div>
                <strong className="text-slate-500 text-xs uppercase">Nome do franqueado:</strong>
                <p className="text-slate-800">{unidade.nome_franqueado || "—"}</p>
              </div>
              <div>
                <strong className="text-slate-500 text-xs uppercase">Telefone franqueado:</strong>
                <p className="text-slate-800">{unidade.telefone_franqueado || "—"}</p>
              </div>
              <div>
                <strong className="text-slate-500 text-xs uppercase">Números CRM:</strong>
                <p className="text-slate-800">{unidade.numeros_crm.join(", ") || "—"}</p>
              </div>
              <div>
                <strong className="text-slate-500 text-xs uppercase">Dados do agente (texto bruto):</strong>
                <pre className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200">
                  {unidade.dados_agentes_raw || "—"}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
