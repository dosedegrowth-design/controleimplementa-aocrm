"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncButton } from "@/components/sync-button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { SyncLog } from "@/lib/types";

const STATUS_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  concluido: { icon: CheckCircle2, color: "text-emerald-600" },
  concluido_com_erros: { icon: AlertCircle, color: "text-amber-600" },
  erro: { icon: XCircle, color: "text-red-600" },
  em_andamento: { icon: AlertCircle, color: "text-blue-600" },
};

export function SyncStatus({ logs }: { logs: SyncLog[] }) {
  const ultimo = logs[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Sincronização Sheets → Banco</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Roda automaticamente a cada 5 minutos via cron
            </p>
          </div>
          <SyncButton />
        </div>
      </CardHeader>
      <CardContent>
        {!ultimo ? (
          <div className="text-sm text-slate-500 italic">
            Nenhuma sincronização registrada ainda. Clique em "Sincronizar agora".
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs uppercase font-medium text-slate-500">
              Últimas {logs.length} execuções
            </div>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
              {logs.map((log) => {
                const meta = STATUS_ICONS[log.status] || STATUS_ICONS.em_andamento;
                const Icon = meta.icon;
                return (
                  <div key={log.id} className="p-3 flex items-start gap-3 hover:bg-slate-50">
                    <Icon className={`h-4 w-4 mt-0.5 ${meta.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <Badge variant="outline">{log.status}</Badge>
                        <span className="text-slate-600">
                          {log.unidades_inseridas} novas, {log.unidades_atualizadas} atualizadas, {log.agentes_inseridos} agentes
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {formatDateTime(log.iniciado_em)}
                        {log.linhas_lidas > 0 && ` · ${log.linhas_lidas} linhas lidas`}
                      </div>
                      {log.erros && log.erros.length > 0 && (
                        <div className="mt-1 text-xs text-red-700 bg-red-50 rounded p-1.5 border border-red-200">
                          {log.erros.slice(0, 3).map((e, i) => (
                            <div key={i}>{e}</div>
                          ))}
                          {log.erros.length > 3 && (
                            <div className="text-red-500">
                              + {log.erros.length - 3} erros
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
