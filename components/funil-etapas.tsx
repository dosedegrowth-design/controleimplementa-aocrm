"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ETAPA_LABELS } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { FunilEtapa } from "@/lib/types";

const ETAPA_ORDEM: string[] = [
  "painel_criado",
  "grupo_whatsapp",
  "acessos_enviados",
  "conexao_whatsapp",
  "treinamento",
  "grupo_suporte_ativo",
];

export function FunilEtapas({ data }: { data: FunilEtapa[] }) {
  // Ordena conforme ordem do checklist
  const sorted = ETAPA_ORDEM.map((key) =>
    data.find((d) => d.etapa === key) ?? {
      etapa: key as FunilEtapa["etapa"],
      pendentes: 0,
      em_andamento: 0,
      concluidas: 0,
      bloqueadas: 0,
      total: 0,
    },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Onboarding</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((e) => {
            const naoConcluidas =
              e.total - e.concluidas;
            return (
              <Link
                key={e.etapa}
                href={`/unidades?etapa=${e.etapa}&status=pendente`}
                className="group block rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-[#1B2A4A] hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                      {ETAPA_LABELS[e.etapa] || e.etapa}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-[#1B2A4A]">
                        {e.concluidas}
                      </span>
                      <span className="text-sm text-slate-500">
                        / {e.total}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                  {e.bloqueadas > 0 && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700 font-medium">
                      {e.bloqueadas} bloq.
                    </span>
                  )}
                  {e.em_andamento > 0 && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700 font-medium">
                      {e.em_andamento} em andam.
                    </span>
                  )}
                  {e.pendentes > 0 && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 font-medium">
                      {e.pendentes} pend.
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${e.total > 0 ? (e.concluidas / e.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
