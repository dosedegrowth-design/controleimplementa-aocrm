import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ETAPA_LABELS } from "@/lib/utils";
import {
  TrendingUp,
  Clock,
  Award,
  AlertTriangle,
  BarChart3,
  Users,
  GaugeCircle,
} from "lucide-react";
import { KPICard } from "@/components/kpi-card";
import { PageHero, HeroKPI } from "@/components/page-hero";
import { SectionHeader } from "@/components/section-header";
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

  const bloqueiosPorEtapa: Record<string, number> = {};
  for (const e of etapas) {
    if (e.status === "pendente" || e.status === "bloqueado") {
      bloqueiosPorEtapa[e.etapa] = (bloqueiosPorEtapa[e.etapa] || 0) + 1;
    }
  }
  const bottleneck = Object.entries(bloqueiosPorEtapa).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const porResponsavel: Record<string, { total: number; concluidas: number }> = {};
  for (const u of unidades) {
    const r = u.responsavel_interno || "Sem responsável";
    porResponsavel[r] ??= { total: 0, concluidas: 0 };
    porResponsavel[r].total++;
    if (u.status_geral === "concluido") porResponsavel[r].concluidas++;
  }

  const totalUnidades = unidades.length;
  const concluidas = unidades.filter((u) => u.status_geral === "concluido").length;
  const taxaConclusao =
    totalUnidades > 0 ? Math.round((concluidas / totalUnidades) * 100) : 0;
  const tempoMedioGeral = (() => {
    const finalizadas = unidades.filter((u) => u.status_geral === "concluido");
    if (finalizadas.length === 0) return 0;
    const total = finalizadas.reduce((acc, u) => {
      const horas =
        (new Date(u.atualizado_em).getTime() -
          new Date(u.submitted_at).getTime()) /
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
    <>
      <PageHero
        eyebrow="Análise"
        title="Relatórios"
        subtitle="Tempos médios, gargalos e performance da equipe de implantação"
        icon={<BarChart3 className="h-5 w-5" />}
        kpis={
          <>
            <HeroKPI
              label="Conclusão"
              value={`${taxaConclusao}%`}
              icon={<Award className="h-3.5 w-3.5" />}
              accent="success"
            />
            <HeroKPI
              label="Tempo médio"
              value={formatHoras(tempoMedioGeral)}
              icon={<Clock className="h-3.5 w-3.5" />}
            />
            <HeroKPI
              label="Gargalo"
              value={
                bottleneck
                  ? `${bottleneck[1]} unid.`
                  : "—"
              }
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              accent={bottleneck ? "danger" : "default"}
            />
          </>
        }
      />

      <div>
        <SectionHeader
          icon={<GaugeCircle className="h-4 w-4" />}
          title="Indicadores gerais"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="Total unidades" value={totalUnidades} icon={TrendingUp} accent="navy" delay={0} />
          <KPICard
            label="Taxa de conclusão"
            value={`${taxaConclusao}%`}
            icon={Award}
            accent="success"
            delay={0.05}
          />
          <KPICard
            label="Tempo médio total"
            value={formatHoras(tempoMedioGeral)}
            icon={Clock}
            accent="info"
            delay={0.1}
          />
          <KPICard
            label="Maior gargalo"
            value={bottleneck ? ETAPA_LABELS[bottleneck[0]] || bottleneck[0] : "—"}
            icon={AlertTriangle}
            accent="warn"
            hint={bottleneck ? `${bottleneck[1]} unid. travadas` : undefined}
            delay={0.15}
            highlight={!!bottleneck}
          />
        </div>
      </div>

      <div>
        <SectionHeader
          icon={<Clock className="h-4 w-4" />}
          title="Tempo médio por etapa"
          subtitle="Do cadastro até a conclusão da etapa"
        />
        <Card>
          <CardContent className="!p-0 overflow-x-auto">
            <table className="spv-table">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th className="!text-right">Tempo médio</th>
                  <th className="!text-right">Amostras</th>
                  <th>Distribuição</th>
                </tr>
              </thead>
              <tbody>
                {mediaPorEtapa.map((m) => {
                  const max = Math.max(...mediaPorEtapa.map((x) => x.media), 1);
                  const pct = (m.media / max) * 100;
                  return (
                    <tr key={m.etapa}>
                      <td className="font-medium text-slate-800">
                        {ETAPA_LABELS[m.etapa] || m.etapa}
                      </td>
                      <td className="text-right text-slate-700">
                        {formatHoras(m.media)}
                      </td>
                      <td className="text-right text-xs text-slate-500">
                        {m.amostras}
                      </td>
                      <td>
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
      </div>

      <div>
        <SectionHeader
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Etapas com mais unidades travadas"
        />
        <Card>
          <CardContent>
            {Object.keys(bloqueiosPorEtapa).length === 0 ? (
              <p className="text-sm text-slate-500 py-2">Nenhuma etapa travada.</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(bloqueiosPorEtapa)
                  .sort((a, b) => b[1] - a[1])
                  .map(([etapa, qtd]) => {
                    const max = Math.max(...Object.values(bloqueiosPorEtapa), 1);
                    return (
                      <div
                        key={etapa}
                        className="flex items-center gap-3"
                      >
                        <div className="w-44 text-sm font-medium text-slate-800 truncate">
                          {ETAPA_LABELS[etapa] || etapa}
                        </div>
                        <div className="h-6 flex-1 max-w-md overflow-hidden rounded bg-slate-100">
                          <div
                            className="h-full bg-amber-500 flex items-center justify-end pr-2 text-xs font-medium text-white tabular-nums"
                            style={{ width: `${(qtd / max) * 100}%` }}
                          >
                            {qtd > 0 && qtd}
                          </div>
                        </div>
                        <span className="text-sm text-slate-600 w-20 text-right tabular-nums">
                          {qtd} unid.
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <SectionHeader
          icon={<Users className="h-4 w-4" />}
          title="Performance por responsável"
        />
        <Card>
          <CardContent className="!p-0 overflow-x-auto">
            <table className="spv-table">
              <thead>
                <tr>
                  <th>Responsável</th>
                  <th className="!text-right">Total</th>
                  <th className="!text-right">Concluídas</th>
                  <th className="!text-right">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(porResponsavel)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([resp, { total, concluidas }]) => (
                    <tr key={resp}>
                      <td className="font-medium text-slate-800">{resp}</td>
                      <td className="text-right">{total}</td>
                      <td className="text-right">{concluidas}</td>
                      <td className="text-right font-semibold">
                        {total > 0 ? Math.round((concluidas / total) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
