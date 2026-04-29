"use client";

import { useState, useMemo } from "react";
import { KPICard } from "@/components/kpi-card";
import { SyncButton } from "@/components/sync-button";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { UnidadesTable } from "@/components/dashboard/unidades-table";
import { UnidadeDrawer } from "@/components/dashboard/unidade-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle2, Clock, AlertOctagon, UserX, AlertTriangle } from "lucide-react";
import type { UnidadeResumo, FunilEtapa, EtapaOnboarding } from "@/lib/types";

interface DashboardClientProps {
  unidades: UnidadeResumo[];
  funil: FunilEtapa[];
  etapas: EtapaOnboarding[];
}

export function DashboardClient({ unidades, funil: _funil, etapas }: DashboardClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = unidades.length;
    const concluidas = unidades.filter((u) => u.status_geral === "concluido").length;
    const pendentes = unidades.filter((u) => u.status_geral === "pendente").length;
    const emAndamento = unidades.filter((u) => u.status_geral === "em_andamento").length;
    const bloqueadas = unidades.filter((u) => u.status_geral === "bloqueado").length;
    const semResp = unidades.filter((u) => !u.responsavel_interno).length;
    const urgentes = unidades.filter((u) => u.prioridade === "urgente").length;
    const comAlerta = unidades.filter((u) => u.alerta_ativo).length;
    const pctConcluido = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { total, concluidas, pendentes, emAndamento, bloqueadas, semResp, urgentes, comAlerta, pctConcluido };
  }, [unidades]);

  // Alertas
  const alertas: { tipo: "danger" | "warn" | "info"; texto: string }[] = [];
  if (stats.bloqueadas > 0) {
    alertas.push({ tipo: "danger", texto: `${stats.bloqueadas} unidade${stats.bloqueadas > 1 ? "s" : ""} bloqueada${stats.bloqueadas > 1 ? "s" : ""}` });
  }
  if (stats.comAlerta > 0) {
    alertas.push({ tipo: "warn", texto: `${stats.comAlerta} unidade${stats.comAlerta > 1 ? "s" : ""} com alerta ativo` });
  }
  if (stats.urgentes > 0) {
    alertas.push({ tipo: "warn", texto: `${stats.urgentes} unidade${stats.urgentes > 1 ? "s" : ""} marcada${stats.urgentes > 1 ? "s" : ""} como urgente` });
  }
  if (stats.semResp > 0) {
    alertas.push({ tipo: "warn", texto: `${stats.semResp} unidade${stats.semResp > 1 ? "s" : ""} sem responsável definido` });
  }

  return (
    <div className="space-y-5 max-w-[1800px]">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Centro de Controle</h1>
          <p className="text-sm text-slate-600">
            Implantação de CRM por unidade · {stats.total} unidades · {stats.pctConcluido}% concluído
          </p>
        </div>
        <SyncButton />
      </div>

      {/* ALERTAS */}
      {alertas.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs uppercase font-bold text-slate-500">⚠ Alertas:</span>
              {alertas.map((a, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.tipo === "danger"
                      ? "bg-red-100 text-red-700"
                      : a.tipo === "warn"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {a.texto}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Total" value={stats.total} icon={Building2} accent="default" />
        <KPICard label="Em andamento" value={stats.emAndamento} icon={Clock} accent="warn" />
        <KPICard label="Concluídas" value={stats.concluidas} icon={CheckCircle2} accent="success" hint={`${stats.pctConcluido}%`} />
        <KPICard label="Bloqueadas" value={stats.bloqueadas} icon={AlertOctagon} accent="danger" />
        <KPICard label="Com alerta" value={stats.comAlerta} icon={AlertTriangle} accent={stats.comAlerta > 0 ? "warn" : "default"} />
        <KPICard label="Sem responsável" value={stats.semResp} icon={UserX} accent={stats.semResp > 0 ? "warn" : "default"} />
      </div>

      {/* KANBAN — Visualização principal */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">📊 Kanban por Etapa</h2>
          <p className="text-xs text-slate-500">Cards mostram a etapa atual de cada unidade</p>
        </div>
        <KanbanBoard
          unidades={unidades}
          etapas={etapas}
          onSelectUnidade={setSelectedId}
        />
      </div>

      {/* TABELA DETALHADA */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">📋 Lista detalhada</h2>
          <p className="text-xs text-slate-500">Filtrável e ordenável · Click numa linha pra editar</p>
        </div>
        <UnidadesTable
          unidades={unidades}
          etapas={etapas}
          onSelectUnidade={setSelectedId}
        />
      </div>

      {/* DRAWER LATERAL — só renderiza quando há unidade selecionada */}
      <UnidadeDrawer
        unidadeId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
