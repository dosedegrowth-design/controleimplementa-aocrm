import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ETAPA_LABELS } from "@/lib/utils";
import { TrendingUp, Clock, Award, AlertTriangle } from "lucide-react";
import { KPICard } from "@/components/kpi-card";
import type { EtapaOnboarding, Unidade } from "@/lib/types";

export const dynamic = "force-dynamic";

const ETAPA_ORDEM = [
  "painel_criado",
  "grupo_whatsapp",
  "acessos_enviados",
  "conexao_whatsapp",
  "treinamento",
  "grupo_suporte_ativo",
];

export default async function RelatoriosPage() {
  const supabase = await createClient();

  const [unidadesRes, etapasRes] = await Promise.all([
    supabase.from("unidades").select("*"),
    supabase.from("etapas_onboarding").select("*"),
  ]);

  const unidades = (unidadesRes.data || []) as Unidade[];
  const etapas = (etapasRes.data || []) as EtapaOnboarding[];

  // Tempo médio até concluir cada etapa
  const tempoPorEtapa: Record<string, number[]> = {};
  for (const etapa of etapas) {
    if (etapa.status === "concluido" && etapa.concluido_em) {
      const unidade = unidades.find((u) => u.id === etapa.unidade_id);
      if (!unidade) continue;
      const horas =
        (new Date(etapa.concluido_em).getTime() -
          new Date(unidade.submitted_at).getTime()) /
        1000 /
        3600;
      if (horas > 0) {
        tempoPorEtapa[etapa.etapa] ??= [];
        tempoPorEtapa[etapa.etapa].push(horas);
      }
    }
  }

  const mediaPorEtapa = ETAPA_ORDEM.map((key) => {
    const arr = tempoPorEtapa[key] || [];
    const media = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return { etapa: key, media, amostras: arr.length };
  });

  // Bottleneck = etapa com mais unidades em "pendente" ou "bloqueado"
  const bloqueiosPorEtapa: Record<string, number> = {};
  for (const e of etapas) {
    if (e.status === "pendente" || e.status === "bloqueado") {
      bloqueiosPorEtapa[e.etapa] = (bloqueiosPorEtapa[e.etapa] || 0) + 1;
    }
  }
  const bottleneck = Object.entries(bloqueiosPorEtapa).sort(
    (a, b) => b[1] - a[1],
  )[0];

  // Performance por responsável
  const porResponsavel: Record<string, { total: number; concluidas: number }> = {};
  for (const u of unidades) {
    const r = u.responsavel_interno || "Sem responsável";
    porResponsavel[r] ??= { total: 0, concluidas: 0 };
    porResponsavel[r].total++;
    if (u.status_geral === "concluido") porResponsavel[r].concluidas++;
  }

  // KPIs
  const totalUnidades = unidades.length;
  const concluidas = unidades.filter((u) => u.status_geral === "concluido").length;
  const tempoMedioGeral = (() => {
    const finalizadas = unidades.filter((u) => u.status_geral === "concluido");
    if (finalizadas.length === 0) return 0;
    const total = finalizadas.reduce((acc, u) => {
      const horas =
        (new Date(u.atualizado_em).getTime() - new Date(u.submitted_at).getTime()) /
        1000 /
        3600;
      return acc + Math.max(0, horas);
    }, 0);
    return total / finalizadas.length;
  })();

  function formatHoras(h: number): string {
    if (h === 0) return "—";
    if (h < 24) return `${h.toFixed(1)}h`;
    return `${(h / 24).toFixed(1)}d`;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Relatórios</h1>
        <p className="text-sm text-slate-600">
          Tempos médios, gargalos e performance da equipe
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total unidades" value={totalUnidades} icon={TrendingUp} />
        <KPICard
          label="Taxa de conclusão"
          value={`${totalUnidades > 0 ? Math.round((concluidas / totalUnidades) * 100) : 0}%`}
          icon={Award}
          accent="success"
        />
        <KPICard
          label="Tempo médio total"
          value={formatHoras(tempoMedioGeral)}
          icon={Clock}
        />
        <KPICard
          label="Maior gargalo"
          value={bottleneck ? ETAPA_LABELS[bottleneck[0]] || bottleneck[0] : "—"}
          icon={AlertTriangle}
          accent="warn"
          hint={bottleneck ? `${bottleneck[1]} unid. travadas` : undefined}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tempo médio por etapa (do cadastro até conclusão)</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Etapa</th>
                <th className="px-4 py-3 text-right font-medium">Tempo médio</th>
                <th className="px-4 py-3 text-right font-medium">Amostras</th>
                <th className="px-4 py-3 text-left font-medium">Visualização</th>
              </tr>
            </thead>
            <tbody>
              {mediaPorEtapa.map((m) => {
                const max = Math.max(...mediaPorEtapa.map((x) => x.media), 1);
                const pct = (m.media / max) * 100;
                return (
                  <tr key={m.etapa} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {ETAPA_LABELS[m.etapa] || m.etapa}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {formatHoras(m.media)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {m.amostras}
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 max-w-md">
                        <div
                          className="h-full bg-[#1B2A4A] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etapas com mais unidades travadas</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(bloqueiosPorEtapa).length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma etapa travada.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(bloqueiosPorEtapa)
                .sort((a, b) => b[1] - a[1])
                .map(([etapa, qtd]) => {
                  const max = Math.max(...Object.values(bloqueiosPorEtapa), 1);
                  return (
                    <div key={etapa} className="flex items-center gap-3">
                      <div className="w-48 text-sm font-medium text-slate-800">
                        {ETAPA_LABELS[etapa] || etapa}
                      </div>
                      <div className="h-6 flex-1 max-w-md overflow-hidden rounded bg-slate-100">
                        <div
                          className="h-full bg-amber-500 flex items-center justify-end pr-2 text-xs font-medium text-white"
                          style={{ width: `${(qtd / max) * 100}%` }}
                        >
                          {qtd > 0 && qtd}
                        </div>
                      </div>
                      <span className="text-sm text-slate-600 w-16 text-right">
                        {qtd} unid.
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance por responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Responsável</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Concluídas</th>
                <th className="px-4 py-3 text-right font-medium">Taxa</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(porResponsavel)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([resp, { total, concluidas }]) => (
                  <tr key={resp} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{resp}</td>
                    <td className="px-4 py-3 text-right">{total}</td>
                    <td className="px-4 py-3 text-right">{concluidas}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1">
                        {total > 0 ? Math.round((concluidas / total) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
