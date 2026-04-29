"use client";

import { useMemo } from "react";
import { ETAPA_LABELS, formatDate, timeAgo } from "@/lib/utils";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Circle,
  MinusCircle,
  Phone,
  Hash,
  User,
  Users,
  Calendar,
  UserCog,
} from "lucide-react";
import type { UnidadeResumo, EtapaOnboarding, EtapaKey } from "@/lib/types";

const ETAPA_ORDEM: EtapaKey[] = [
  "painel_criado",
  "grupo_whatsapp",
  "acessos_enviados",
  "conexao_whatsapp",
  "treinamento",
  "grupo_suporte_ativo",
];

const ETAPA_SHORT: Record<EtapaKey, string> = {
  painel_criado: "Painel",
  grupo_whatsapp: "Grupo WA",
  acessos_enviados: "Acessos",
  conexao_whatsapp: "Conexão",
  treinamento: "Treina.",
  grupo_suporte_ativo: "Suporte",
};

const STATUS_ICON = {
  pendente: Circle,
  em_andamento: Clock,
  concluido: CheckCircle2,
  bloqueado: AlertOctagon,
  nao_aplicavel: MinusCircle,
};

const STATUS_COLOR = {
  pendente: "text-slate-300",
  em_andamento: "text-blue-500",
  concluido: "text-emerald-500",
  bloqueado: "text-red-500",
  nao_aplicavel: "text-slate-200",
};

interface KanbanBoardProps {
  unidades: UnidadeResumo[];
  etapas: EtapaOnboarding[];
  onSelectUnidade: (id: string) => void;
}

export function KanbanBoard({ unidades, etapas, onSelectUnidade }: KanbanBoardProps) {
  const etapasByUnidade = useMemo(() => {
    const map = new Map<string, Map<EtapaKey, EtapaOnboarding>>();
    for (const e of etapas) {
      if (!map.has(e.unidade_id)) map.set(e.unidade_id, new Map());
      map.get(e.unidade_id)!.set(e.etapa, e);
    }
    return map;
  }, [etapas]);

  // Agrupa unidades por etapa atual (primeira não concluída)
  const colunas = useMemo(() => {
    const cols: Record<EtapaKey, UnidadeResumo[]> = {
      painel_criado: [],
      grupo_whatsapp: [],
      acessos_enviados: [],
      conexao_whatsapp: [],
      treinamento: [],
      grupo_suporte_ativo: [],
    };

    for (const u of unidades) {
      const etapasU = etapasByUnidade.get(u.id);
      if (!etapasU) continue;
      let etapaAtual: EtapaKey = "painel_criado";
      for (const key of ETAPA_ORDEM) {
        const e = etapasU.get(key);
        if (!e || e.status !== "concluido") {
          etapaAtual = key;
          break;
        }
        etapaAtual = key;
      }
      cols[etapaAtual].push(u);
    }

    // Ordenar dentro de cada coluna: urgente > alta > normal > baixa, depois por data
    const prioridadeOrder: Record<string, number> = { urgente: 0, alta: 1, normal: 2, baixa: 3 };
    for (const key of ETAPA_ORDEM) {
      cols[key].sort((a, b) => {
        const p = (prioridadeOrder[a.prioridade] ?? 9) - (prioridadeOrder[b.prioridade] ?? 9);
        if (p !== 0) return p;
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      });
    }

    return cols;
  }, [unidades, etapasByUnidade]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {ETAPA_ORDEM.map((key) => {
        const lista = colunas[key];
        const bloqueadasCount = lista.filter((u) => {
          const e = etapasByUnidade.get(u.id);
          return e && Array.from(e.values()).some((x) => x.status === "bloqueado");
        }).length;

        return (
          <div key={key} className="flex flex-col bg-slate-50 rounded-lg border border-slate-200 overflow-hidden h-[640px]">
            {/* Header fixo */}
            <div className="px-3 py-2 bg-[#1B2A4A] text-white flex items-center justify-between shrink-0">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 truncate">
                  {ETAPA_LABELS[key]}
                </span>
                <span className="text-[10px] opacity-60">
                  {bloqueadasCount > 0 && (
                    <span className="text-red-300 font-bold">{bloqueadasCount} bloq · </span>
                  )}
                  {lista.length} unid.
                </span>
              </div>
              <span className="bg-[#E31E24] text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                {lista.length}
              </span>
            </div>

            {/* Lista com scroll interno isolado */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 kanban-column-scroll">
              {lista.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6 italic border border-dashed border-slate-300 rounded bg-white">
                  vazio
                </div>
              ) : (
                lista.map((u) => (
                  <UnidadeKanbanCard
                    key={u.id}
                    unidade={u}
                    etapas={etapasByUnidade.get(u.id)}
                    onClick={() => onSelectUnidade(u.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface UnidadeKanbanCardProps {
  unidade: UnidadeResumo;
  etapas?: Map<EtapaKey, EtapaOnboarding>;
  onClick: () => void;
}

function UnidadeKanbanCard({ unidade, etapas, onClick }: UnidadeKanbanCardProps) {
  const pct = unidade.etapas_total > 0
    ? Math.round((unidade.etapas_concluidas / unidade.etapas_total) * 100)
    : 0;

  const temBloqueio = etapas
    ? Array.from(etapas.values()).some((e) => e.status === "bloqueado")
    : false;

  // Borda lateral colorida pela prioridade
  const borderColor = {
    urgente: "border-l-red-600 border-l-4",
    alta: "border-l-orange-500 border-l-4",
    normal: "border-l-slate-200 border-l-4",
    baixa: "border-l-slate-100 border-l-4",
  }[unidade.prioridade];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border border-slate-200 rounded-md p-3 hover:border-[#1B2A4A] hover:shadow-md transition-all ${borderColor} ${
        unidade.alerta_ativo ? "ring-2 ring-amber-400 ring-offset-1" : ""
      }`}
    >
      {/* Header: Nome + Tags */}
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 flex-1">
          {unidade.nome_unidade}
        </h4>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {temBloqueio && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
              <AlertOctagon className="h-2.5 w-2.5" />
              BLOQ
            </span>
          )}
        </div>
      </div>

      {/* SELO DE ALERTA — destaque amarelo */}
      {unidade.alerta_ativo && (
        <div className="mb-2 bg-amber-50 border border-amber-300 rounded p-1.5 -mx-0.5">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold uppercase text-amber-700 leading-tight">
                ⚠ Alerta
              </div>
              {unidade.alerta_motivo && (
                <p className="text-[10px] text-amber-900 leading-snug line-clamp-2 mt-0.5">
                  {unidade.alerta_motivo}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prioridade + status header */}
      {(unidade.prioridade === "urgente" || unidade.prioridade === "alta") && (
        <div className="mb-2">
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
            unidade.prioridade === "urgente" ? "bg-red-600 text-white" : "bg-orange-100 text-orange-800"
          }`}>
            {unidade.prioridade === "urgente" ? "🔥 Urgente" : "Alta"}
          </span>
        </div>
      )}

      {/* Info da unidade */}
      <div className="space-y-1 mb-2.5 text-[11px]">
        {unidade.nome_franqueado && (
          <div className="flex items-center gap-1.5 text-slate-700 truncate">
            <User className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{unidade.nome_franqueado}</span>
          </div>
        )}
        {unidade.telefone_franqueado && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{unidade.telefone_franqueado}</span>
          </div>
        )}
        {unidade.numeros_crm && unidade.numeros_crm.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Hash className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">
              {unidade.numeros_crm.length === 1
                ? unidade.numeros_crm[0]
                : `${unidade.numeros_crm.length} números`}
            </span>
          </div>
        )}
        {unidade.qtd_agentes > 0 && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Users className="h-3 w-3 text-slate-400 shrink-0" />
            <span>
              {unidade.agentes_com_acesso}/{unidade.qtd_agentes} agentes c/ acesso
            </span>
          </div>
        )}
        {unidade.responsavel_interno && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <UserCog className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{unidade.responsavel_interno}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-slate-500 pt-0.5 border-t border-slate-50">
          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-600">{formatDate(unidade.submitted_at)}</span>
          <span className="text-slate-400 text-[10px]">· {timeAgo(unidade.submitted_at)}</span>
        </div>
      </div>

      {/* Mini status das 6 etapas */}
      <div className="border-t border-slate-100 pt-2">
        <div className="flex items-center justify-between gap-1 mb-1">
          {ETAPA_ORDEM.map((key) => {
            const e = etapas?.get(key);
            const status = e?.status || "pendente";
            const Icon = STATUS_ICON[status as keyof typeof STATUS_ICON] || Circle;
            const color = STATUS_COLOR[status as keyof typeof STATUS_COLOR] || STATUS_COLOR.pendente;
            return (
              <div
                key={key}
                title={`${ETAPA_SHORT[key]}: ${status}`}
                className="flex flex-col items-center"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
            );
          })}
        </div>

        {/* Progresso */}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-600 font-bold tabular-nums">
            {unidade.etapas_concluidas}/{unidade.etapas_total}
          </span>
        </div>
      </div>
    </button>
  );
}
