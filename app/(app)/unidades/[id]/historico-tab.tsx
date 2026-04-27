import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, STATUS_LABELS } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { HistoricoEtapa } from "@/lib/types";

export function HistoricoTab({ historico }: { historico: HistoricoEtapa[] }) {
  if (historico.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-slate-500">
          Sem histórico ainda.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {historico.map((h) => (
            <div key={h.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    {h.acao === "mudanca_status" ? "Mudança de status" : h.acao}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    {h.status_anterior && (
                      <span>{STATUS_LABELS[h.status_anterior] || h.status_anterior}</span>
                    )}
                    <ArrowRight className="h-3 w-3" />
                    {h.status_novo && (
                      <span className="font-medium text-slate-800">
                        {STATUS_LABELS[h.status_novo] || h.status_novo}
                      </span>
                    )}
                    {h.mudado_por && (
                      <span className="text-slate-400">por {h.mudado_por}</span>
                    )}
                  </div>
                  {h.nota && (
                    <p className="text-xs text-slate-500 mt-1">{h.nota}</p>
                  )}
                </div>
                <time className="text-xs text-slate-400 whitespace-nowrap">
                  {formatDateTime(h.mudado_em)}
                </time>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
