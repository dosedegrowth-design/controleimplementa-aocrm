import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, PrioridadeBadge } from "@/components/status-badge";
import { SyncButton } from "@/components/sync-button";
import { UnidadesFilter } from "./unidades-filter";
import Link from "next/link";
import { Phone, User } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { UnidadeResumo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function UnidadesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    prioridade?: string;
    q?: string;
    etapa?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("v_unidades_resumo")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (params.status) query = query.eq("status_geral", params.status);
  if (params.prioridade) query = query.eq("prioridade", params.prioridade);
  if (params.q) query = query.ilike("nome_unidade", `%${params.q}%`);

  const { data: unidades = [] } = await query;
  let lista = (unidades || []) as UnidadeResumo[];

  // Filtro por etapa pendente (precisa join)
  if (params.etapa) {
    const { data: etapasData } = await supabase
      .from("etapas_onboarding")
      .select("unidade_id")
      .eq("etapa", params.etapa)
      .neq("status", "concluido");
    const ids = new Set((etapasData || []).map((e) => e.unidade_id));
    lista = lista.filter((u) => ids.has(u.id));
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Unidades</h1>
          <p className="text-sm text-slate-600">
            {lista.length} unidade{lista.length !== 1 && "s"} encontrada{lista.length !== 1 && "s"}
          </p>
        </div>
        <SyncButton />
      </div>

      <UnidadesFilter />

      <Card>
        <CardContent className="p-0">
          {lista.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhuma unidade encontrada com os filtros atuais.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Unidade</th>
                    <th className="px-6 py-3 text-left font-medium">Franqueado</th>
                    <th className="px-6 py-3 text-left font-medium">Telefone</th>
                    <th className="px-6 py-3 text-left font-medium">Progresso</th>
                    <th className="px-6 py-3 text-left font-medium">Agentes</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Prioridade</th>
                    <th className="px-6 py-3 text-left font-medium">Resp.</th>
                    <th className="px-6 py-3 text-left font-medium">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((u) => {
                    const pct =
                      u.etapas_total > 0
                        ? Math.round((u.etapas_concluidas / u.etapas_total) * 100)
                        : 0;
                    return (
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
                          {u.nome_franqueado ? (
                            <span className="inline-flex items-center gap-1.5">
                              <User className="h-3 w-3 text-slate-400" />
                              {u.nome_franqueado}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">não informado</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-slate-600 whitespace-nowrap">
                          {u.telefone_franqueado ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {u.telefone_franqueado}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {u.etapas_concluidas}/{u.etapas_total}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-600">
                          {u.agentes_com_acesso}/{u.qtd_agentes}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={u.status_geral} />
                        </td>
                        <td className="px-6 py-3">
                          <PrioridadeBadge prioridade={u.prioridade} />
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-600">
                          {u.responsavel_interno || "—"}
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-500">
                          {timeAgo(u.atualizado_em)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
