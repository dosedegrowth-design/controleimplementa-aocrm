"use client";

import { useState, useMemo } from "react";
import { KPICard } from "@/components/kpi-card";
import { SyncButton } from "@/components/sync-button";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { UnidadesTable } from "@/components/dashboard/unidades-table";
import { UnidadeDrawer } from "@/components/dashboard/unidade-drawer";
import { PageHero, HeroKPI } from "@/components/page-hero";
import { SectionHeader } from "@/components/section-header";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertOctagon,
  UserX,
  AlertTriangle,
  LayoutDashboard,
  Activity,
  Table as TableIcon,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { UnidadeResumo, FunilEtapa, EtapaOnboarding } from "@/lib/types";

interface DashboardClientProps {
  unidades: UnidadeResumo[];
  funil: FunilEtapa[];
  etapas: EtapaOnboarding[];
}

export function DashboardClient({
  unidades,
  funil: _funil,
  etapas,
}: DashboardClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = unidades.length;
    const concluidas = unidades.filter(
      (u) => u.status_geral === "concluido",
    ).length;
    const pendentes = unidades.filter(
      (u) => u.status_geral === "pendente",
    ).length;
    const emAndamento = unidades.filter(
      (u) => u.status_geral === "em_andamento",
    ).length;
    const bloqueadas = unidades.filter(
      (u) => u.status_geral === "bloqueado",
    ).length;
    const semResp = unidades.filter((u) => !u.responsavel_interno).length;
    const urgentes = unidades.filter((u) => u.prioridade === "urgente").length;
    const comAlerta = unidades.filter((u) => u.alerta_ativo).length;
    const pctConcluido = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return {
      total,
      concluidas,
      pendentes,
      emAndamento,
      bloqueadas,
      semResp,
      urgentes,
      comAlerta,
      pctConcluido,
    };
  }, [unidades]);

  // Alertas
  const alertas: { tipo: "danger" | "warn" | "info"; texto: string }[] = [];
  if (stats.bloqueadas > 0) {
    alertas.push({
      tipo: "danger",
      texto: `${stats.bloqueadas} bloqueada${stats.bloqueadas > 1 ? "s" : ""}`,
    });
  }
  if (stats.comAlerta > 0) {
    alertas.push({
      tipo: "warn",
      texto: `${stats.comAlerta} com alerta ativo`,
    });
  }
  if (stats.urgentes > 0) {
    alertas.push({
      tipo: "warn",
      texto: `${stats.urgentes} marcada${stats.urgentes > 1 ? "s" : ""} como urgente`,
    });
  }
  if (stats.semResp > 0) {
    alertas.push({
      tipo: "warn",
      texto: `${stats.semResp} sem responsável`,
    });
  }

  return (
    <>
      <PageHero
        eyebrow="CRM Onboarding"
        title="Centro de Controle"
        subtitle={`Implantação de CRM por unidade · ${stats.total} unidades · ${stats.pctConcluido}% concluído`}
        icon={<LayoutDashboard className="h-5 w-5" />}
        actions={<SyncButton />}
        kpis={
          <>
            <HeroKPI
              label="Total"
              value={stats.total}
              icon={<Building2 className="h-3.5 w-3.5" />}
            />
            <HeroKPI
              label="Em andamento"
              value={stats.emAndamento}
              icon={<Clock className="h-3.5 w-3.5" />}
            />
            <HeroKPI
              label={`Concluídas · ${stats.pctConcluido}%`}
              value={stats.concluidas}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              accent="success"
            />
          </>
        }
        bottom={
          alertas.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70">
                Alertas:
              </span>
              {alertas.map((a, i) => (
                <span
                  key={i}
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    a.tipo === "danger"
                      ? "bg-red-500/20 text-red-100 border border-red-300/30"
                      : "bg-amber-500/20 text-amber-100 border border-amber-300/30"
                  }`}
                >
                  {a.texto}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>Nenhum alerta crítico no momento.</span>
            </div>
          )
        }
      />

      {/* KPIs detalhados */}
      <div>
        <SectionHeader
          icon={<TrendingUp className="h-4 w-4" />}
          title="Indicadores"
          subtitle="Visão consolidada da rede"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label="Total"
            value={stats.total}
            icon={Building2}
            accent="navy"
            delay={0}
          />
          <KPICard
            label="Em andamento"
            value={stats.emAndamento}
            icon={Clock}
            accent="warn"
            delay={0.05}
          />
          <KPICard
            label="Concluídas"
            value={stats.concluidas}
            icon={CheckCircle2}
            accent="success"
            hint={`${stats.pctConcluido}%`}
            delay={0.1}
          />
          <KPICard
            label="Bloqueadas"
            value={stats.bloqueadas}
            icon={AlertOctagon}
            accent="danger"
            delay={0.15}
            highlight={stats.bloqueadas > 0}
          />
          <KPICard
            label="Com alerta"
            value={stats.comAlerta}
            icon={AlertTriangle}
            accent={stats.comAlerta > 0 ? "warn" : "default"}
            delay={0.2}
          />
          <KPICard
            label="Sem responsável"
            value={stats.semResp}
            icon={UserX}
            accent={stats.semResp > 0 ? "warn" : "default"}
            delay={0.25}
          />
        </div>
      </div>

      {/* KANBAN */}
      <div>
        <SectionHeader
          icon={<Activity className="h-4 w-4" />}
          title="Kanban por etapa"
          subtitle="Posição atual de cada unidade no funil de implantação"
        />
        <KanbanBoard
          unidades={unidades}
          etapas={etapas}
          onSelectUnidade={setSelectedId}
        />
      </div>

      {/* TABELA */}
      <div>
        <SectionHeader
          icon={<TableIcon className="h-4 w-4" />}
          title="Lista detalhada"
          subtitle="Filtrável e ordenável · clique numa linha pra editar"
        />
        <UnidadesTable
          unidades={unidades}
          etapas={etapas}
          onSelectUnidade={setSelectedId}
        />
      </div>

      <UnidadeDrawer
        unidadeId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
