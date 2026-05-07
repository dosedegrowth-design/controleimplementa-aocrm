"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  AlertOctagon,
  Clock,
  WifiOff,
  Bell,
  ExternalLink,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface InboxOffline {
  chatwoot_account_id: number;
  inbox_id: number;
  account_nome: string;
  telefone: string | null;
  connection_status: string;
  verificado_em: string | null;
}

interface UnidadeAlerta {
  id: string;
  nome_unidade: string;
  alerta_motivo: string | null;
  alerta_criado_em: string | null;
  prioridade: string;
}

interface UnidadeBloqueada {
  id: string;
  nome_unidade: string;
  observacoes: string | null;
  prioridade: string;
}

interface ParadaLonga {
  id: string;
  nome_unidade: string;
  status_geral: string;
  submitted_at: string;
  prioridade: string;
}

interface AlertasData {
  geradoEm: string;
  inboxesOffline: InboxOffline[];
  unidadesAlerta: UnidadeAlerta[];
  unidadesBloqueadas: UnidadeBloqueada[];
  paradasLongas: ParadaLonga[];
  total: number;
}

const STORAGE_KEY = "alertas_visto_hash";

function gerarHash(data: AlertasData): string {
  // Hash simples — soma os IDs/contadores. Se mudar qualquer item, hash muda.
  const items = [
    ...data.inboxesOffline.map((i) => `i:${i.chatwoot_account_id}-${i.inbox_id}`),
    ...data.unidadesAlerta.map((u) => `a:${u.id}`),
    ...data.unidadesBloqueadas.map((u) => `b:${u.id}`),
    ...data.paradasLongas.map((u) => `p:${u.id}`),
  ];
  return items.sort().join("|");
}

export function AlertasProvider() {
  const [data, setData] = useState<AlertasData | null>(null);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/alertas", { cache: "no-store" });
        if (!r.ok) return;
        const json: AlertasData = await r.json();
        if (cancelled) return;
        setData(json);

        if (json.total === 0) return;

        // Mostra pop-up só se o conjunto de alertas mudou desde a última vez
        const hashAtual = gerarHash(json);
        const ultimoHash = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (hashAtual !== ultimoHash) {
          setAberto(true);
        }
      } catch {
        // silencia erros — alertas são best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function marcarComoVisto() {
    if (!data) return;
    const hash = gerarHash(data);
    localStorage.setItem(STORAGE_KEY, hash);
    setAberto(false);
  }

  function fechar() {
    setAberto(false);
  }

  if (!data) return null;

  const { inboxesOffline, unidadesAlerta, unidadesBloqueadas, paradasLongas, total } = data;

  return (
    <>
      {/* Badge flutuante (sempre visível se tem alertas) */}
      {total > 0 && (
        <button
          onClick={() => setAberto(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-white shadow-lg hover:bg-red-700 transition-colors"
          title="Ver alertas"
        >
          <Bell className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-bold">{total}</span>
          <span className="text-xs hidden sm:inline">
            alerta{total > 1 ? "s" : ""}
          </span>
        </button>
      )}

      {/* Modal de alertas */}
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Alertas que precisam de atenção</DialogTitle>
                <DialogDescription>
                  {total} {total === 1 ? "item" : "itens"} aguardando sua ação
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* INBOXES OFFLINE — CRÍTICO */}
            {inboxesOffline.length > 0 && (
              <SecaoAlerta
                titulo="WhatsApp Desconectado"
                count={inboxesOffline.length}
                cor="red"
                icone={<WifiOff className="h-4 w-4" />}
                descricao="Caixas de entrada offline — clientes podem não estar sendo atendidos"
              >
                <div className="space-y-2">
                  {inboxesOffline.map((i) => (
                    <Card key={`${i.chatwoot_account_id}-${i.inbox_id}`} className="border-red-200">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {i.account_nome.replace("SPV - ", "")}
                            </p>
                            <p className="text-xs text-slate-500">
                              {i.telefone} · há {timeAgo(i.verificado_em)}
                            </p>
                          </div>
                          <Link
                            href="/caixas-entrada"
                            onClick={fechar}
                            className="text-xs text-[#1B2A4A] hover:underline shrink-0"
                          >
                            Ver →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-2">
                  <Link href="/caixas-entrada" onClick={fechar}>
                    <Button variant="outline" size="sm" className="w-full">
                      Abrir página de Caixas de Entrada
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </SecaoAlerta>
            )}

            {/* ALERTAS MANUAIS */}
            {unidadesAlerta.length > 0 && (
              <SecaoAlerta
                titulo="Alertas manuais"
                count={unidadesAlerta.length}
                cor="amber"
                icone={<AlertTriangle className="h-4 w-4" />}
                descricao="Unidades marcadas com alerta pelo time"
              >
                <div className="space-y-2">
                  {unidadesAlerta.map((u) => (
                    <Card key={u.id} className="border-amber-200">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {u.nome_unidade}
                            </p>
                            {u.alerta_motivo && (
                              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                {u.alerta_motivo}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              há {timeAgo(u.alerta_criado_em)}
                            </p>
                          </div>
                          <Link
                            href={`/?unidade=${u.id}`}
                            onClick={fechar}
                            className="text-xs text-[#1B2A4A] hover:underline shrink-0"
                          >
                            Abrir →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </SecaoAlerta>
            )}

            {/* BLOQUEADAS */}
            {unidadesBloqueadas.length > 0 && (
              <SecaoAlerta
                titulo="Unidades bloqueadas"
                count={unidadesBloqueadas.length}
                cor="red"
                icone={<AlertOctagon className="h-4 w-4" />}
                descricao="Implantação travada em alguma etapa"
              >
                <div className="space-y-1">
                  {unidadesBloqueadas.map((u) => (
                    <div key={u.id} className="flex items-center gap-2 text-sm py-1">
                      <AlertOctagon className="h-3 w-3 text-red-500 shrink-0" />
                      <span className="font-medium text-slate-800 truncate flex-1">
                        {u.nome_unidade}
                      </span>
                      <Link
                        href={`/?unidade=${u.id}`}
                        onClick={fechar}
                        className="text-xs text-[#1B2A4A] hover:underline shrink-0"
                      >
                        Abrir →
                      </Link>
                    </div>
                  ))}
                </div>
              </SecaoAlerta>
            )}

            {/* PARADAS LONGAS */}
            {paradasLongas.length > 0 && (
              <SecaoAlerta
                titulo="Pendentes há mais de 14 dias"
                count={paradasLongas.length}
                cor="slate"
                icone={<Clock className="h-4 w-4" />}
                descricao="Implantações que ainda não foram concluídas"
              >
                <div className="space-y-1">
                  {paradasLongas.slice(0, 8).map((u) => (
                    <div key={u.id} className="flex items-center gap-2 text-sm py-1">
                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 truncate flex-1">
                        {u.nome_unidade}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        há {timeAgo(u.submitted_at)}
                      </span>
                      <Link
                        href={`/?unidade=${u.id}`}
                        onClick={fechar}
                        className="text-xs text-[#1B2A4A] hover:underline shrink-0"
                      >
                        Abrir →
                      </Link>
                    </div>
                  ))}
                  {paradasLongas.length > 8 && (
                    <p className="text-[10px] text-slate-400 italic pl-5 pt-1">
                      + {paradasLongas.length - 8} outras...
                    </p>
                  )}
                </div>
              </SecaoAlerta>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" size="sm" onClick={fechar}>
              Lembrar depois
            </Button>
            <Button size="sm" onClick={marcarComoVisto}>
              Marcar como visto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SecaoAlerta({
  titulo,
  count,
  cor,
  icone,
  descricao,
  children,
}: {
  titulo: string;
  count: number;
  cor: "red" | "amber" | "slate";
  icone: React.ReactNode;
  descricao: string;
  children: React.ReactNode;
}) {
  const corMap = {
    red: "text-red-700 bg-red-50 border-red-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    slate: "text-slate-700 bg-slate-50 border-slate-200",
  };
  return (
    <div>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${corMap[cor]} mb-2`}>
        {icone}
        <h3 className="text-sm font-bold flex-1">{titulo}</h3>
        <span className="text-xs font-bold">{count}</span>
      </div>
      <p className="text-[11px] text-slate-500 mb-2 px-1">{descricao}</p>
      {children}
    </div>
  );
}
