import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/kpi-card";
import { FunilEtapas } from "@/components/funil-etapas";
import { SyncButton } from "@/components/sync-button";
import { StatusBadge, PrioridadeBadge } from "@/components/status-badge";
import { Building2, CheckCircle2, Clock, AlertOctagon } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import type { FunilEtapa, UnidadeResumo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VisaoGeralPage() {
  const supabase = await createClient();

  const [unidadesRes, funilRes, recentesRes] = await Promise.all([
    supabase.from("v_unidades_resumo").select("*"),
    supabase.from("v_funil_etapas").select("*"),
    supabase
      .from("v_unidades_resumo")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(8),
  ]);

  const unidades = (unidadesRes.data || []) as UnidadeResumo[];
  const funil = (funilRes.data || []) as FunilEtapa[];
  const recentes = (recentesRes.data || []) as UnidadeResumo[];

  const total = unidades.length;
  const concluidas = unidades.filter((u) => u.status_geral === "concluido").length;
  const pendentes = unidades.filter((u) => u.status_geral === "pendente").length;
  const emAndamento = unidades.filter((u) => u.status_geral === "em_andamento").length;
  const bloqueadas = unidades.filter((u) => u.status_geral === "bloqueado").length;
  const pctConcluido = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Visão Geral</h1>
          <p className="text-sm text-slate-600">
            Acompanhamento de implantação de CRM por unidade
          </p>
        </div>
        <SyncButton />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total de unidades"
          value={total}
          icon={Building2}
          accent="default"
          hint={`${pctConcluido}% concluído`}
        />
        <KPICard
          label="Em andamento"
          value={emAndamento}
          icon={Clock}
          accent="warn"
        />
        <KPICard
          label="Concluídas"
          value={concluidas}
          icon={CheckCircle2}
          accent="success"
        />
        <KPICard
          label="Bloqueadas"
          value={bloqueadas}
          icon={AlertOctagon}
          accent="danger"
          hint={pendentes > 0 ? `${pendentes} aguardando início` : undefined}
        />
      </div>

      {/* Funil */}
      <FunilEtapas data={funil} />

      {/* Lista recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Últimas unidades cadastradas</CardTitle>
            <Link
              href="/unidades"
              className="text-sm font-medium text-[#1B2A4A] hover:underline"
            >
              Ver todas →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentes.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhuma unidade cadastrada ainda. Use o botão "Sincronizar agora" pra puxar do formulário.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Unidade</th>
                    <th className="px-6 py-3 text-left font-medium">Franqueado</th>
                    <th className="px-6 py-3 text-left font-medium">Etapas</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Prioridade</th>
                    <th className="px-6 py-3 text-left font-medium">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/unidades/${u.id}`}
                          className="font-medium text-[#1B2A4A] hover:underline"
                        >
                          {u.nome_unidade}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {u.nome_franqueado || "—"}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {u.etapas_concluidas}/{u.etapas_total}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={u.status_geral} />
                      </td>
                      <td className="px-6 py-3">
                        <PrioridadeBadge prioridade={u.prioridade} />
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500">
                        {timeAgo(u.submitted_at)}
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
