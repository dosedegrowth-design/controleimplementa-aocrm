"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PrioridadeBadge } from "@/components/status-badge";
import { Search, X, Phone, User, Users, Hash, AlertOctagon, CheckCircle2, Clock, Circle, MinusCircle } from "lucide-react";
import { ETAPA_LABELS, formatDate, timeAgo } from "@/lib/utils";
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
  grupo_whatsapp: "Grupo",
  acessos_enviados: "Acessos",
  conexao_whatsapp: "Conexão",
  treinamento: "Treina",
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

interface UnidadesTableProps {
  unidades: UnidadeResumo[];
  etapas: EtapaOnboarding[];
  onSelectUnidade: (id: string) => void;
}

export function UnidadesTable({ unidades, etapas, onSelectUnidade }: UnidadesTableProps) {
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>("all");
  const [responsavelFilter, setResponsavelFilter] = useState<string>("all");

  const etapasByUnidade = useMemo(() => {
    const map = new Map<string, Map<EtapaKey, EtapaOnboarding>>();
    for (const e of etapas) {
      if (!map.has(e.unidade_id)) map.set(e.unidade_id, new Map());
      map.get(e.unidade_id)!.set(e.etapa, e);
    }
    return map;
  }, [etapas]);

  // Lista de responsáveis únicos pra dropdown
  const responsaveis = useMemo(() => {
    const set = new Set<string>();
    for (const u of unidades) {
      if (u.responsavel_interno) set.add(u.responsavel_interno);
    }
    return Array.from(set).sort();
  }, [unidades]);

  const filtered = useMemo(() => {
    return unidades.filter((u) => {
      if (busca && !u.nome_unidade.toLowerCase().includes(busca.toLowerCase())) {
        if (!u.nome_franqueado?.toLowerCase().includes(busca.toLowerCase())) return false;
      }
      if (statusFilter !== "all" && u.status_geral !== statusFilter) return false;
      if (prioridadeFilter !== "all" && u.prioridade !== prioridadeFilter) return false;
      if (responsavelFilter !== "all") {
        if (responsavelFilter === "__sem__" && u.responsavel_interno) return false;
        if (responsavelFilter !== "__sem__" && u.responsavel_interno !== responsavelFilter) return false;
      }
      return true;
    });
  }, [unidades, busca, statusFilter, prioridadeFilter, responsavelFilter]);

  const hasFilters = busca !== "" || statusFilter !== "all" || prioridadeFilter !== "all" || responsavelFilter !== "all";

  return (
    <Card>
      <CardContent className="p-0">
        {/* Filtros */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por unidade ou franqueado..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-9 bg-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger className="w-[150px] h-9 bg-white"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas prioridades</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
              <SelectTrigger className="w-[160px] h-9 bg-white"><SelectValue placeholder="Responsável" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos responsáveis</SelectItem>
                <SelectItem value="__sem__">Sem responsável</SelectItem>
                {responsaveis.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusca("");
                  setStatusFilter("all");
                  setPrioridadeFilter("all");
                  setResponsavelFilter("all");
                }}
              >
                <X className="h-3 w-3" /> Limpar
              </Button>
            )}

            <span className="ml-auto text-xs text-slate-500">
              {filtered.length} de {unidades.length}
            </span>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">Unidade</th>
                <th className="px-4 py-2.5 text-left font-semibold">Franqueado</th>
                <th className="px-4 py-2.5 text-left font-semibold">Telefone</th>
                <th className="px-4 py-2.5 text-left font-semibold">Núms CRM</th>
                <th className="px-4 py-2.5 text-center font-semibold" colSpan={6}>Etapas (Painel · Grupo · Acessos · Conexão · Treina · Suporte)</th>
                <th className="px-4 py-2.5 text-center font-semibold">Progresso</th>
                <th className="px-4 py-2.5 text-center font-semibold">Agentes</th>
                <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                <th className="px-4 py-2.5 text-left font-semibold">Prior.</th>
                <th className="px-4 py-2.5 text-left font-semibold">Resp.</th>
                <th className="px-4 py-2.5 text-left font-semibold">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-sm text-slate-500">
                    Nenhuma unidade com esses filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const pct = u.etapas_total > 0
                    ? Math.round((u.etapas_concluidas / u.etapas_total) * 100)
                    : 0;
                  const etapasU = etapasByUnidade.get(u.id);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => onSelectUnidade(u.id)}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 font-semibold text-[#1B2A4A]">
                        {u.nome_unidade}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">
                        {u.nome_franqueado || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                        {u.telefone_franqueado || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 max-w-[160px]">
                        {u.numeros_crm && u.numeros_crm.length > 0 ? (
                          <div className="text-xs truncate" title={u.numeros_crm.join(", ")}>
                            {u.numeros_crm.length === 1 ? u.numeros_crm[0] : `${u.numeros_crm.length} nums`}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      {/* 6 ícones de etapas */}
                      {ETAPA_ORDEM.map((key) => {
                        const e = etapasU?.get(key);
                        const status = e?.status || "pendente";
                        const Icon = STATUS_ICON[status as keyof typeof STATUS_ICON] || Circle;
                        const color = STATUS_COLOR[status as keyof typeof STATUS_COLOR] || STATUS_COLOR.pendente;
                        return (
                          <td
                            key={key}
                            className="px-1 py-2.5 text-center"
                            title={`${ETAPA_LABELS[key]}: ${status}`}
                          >
                            <Icon className={`h-4 w-4 inline ${color}`} />
                          </td>
                        );
                      })}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5 min-w-[100px]">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 tabular-nums whitespace-nowrap font-medium">
                            {u.etapas_concluidas}/{u.etapas_total}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-xs text-slate-600 tabular-nums">
                        {u.agentes_com_acesso}/{u.qtd_agentes}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={u.status_geral} />
                      </td>
                      <td className="px-4 py-2.5">
                        <PrioridadeBadge prioridade={u.prioridade} />
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">
                        {u.responsavel_interno || <span className="text-amber-600 italic font-medium">sem resp.</span>}
                      </td>
                      <td className="px-4 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">
                        {timeAgo(u.submitted_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
