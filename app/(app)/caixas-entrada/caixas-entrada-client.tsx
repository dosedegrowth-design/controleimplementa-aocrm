"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Cloud,
  RefreshCw,
  Phone,
  Search,
  X,
  Clock,
  Activity,
  ExternalLink,
  Loader2,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface InboxStatus {
  chatwoot_account_id: number;
  inbox_id: number | null;
  account_nome: string;
  inbox_nome: string | null;
  telefone: string | null;
  provider: string | null;
  connection_status: string | null;
  verificado_em: string | null;
  status_anterior: string | null;
  mudou: boolean | null;
  mensagem_erro: string | null;
}

interface ChatwootAccount {
  chatwoot_account_id: number;
  nome: string;
  inbox_id: number | null;
  inbox_nome: string | null;
  telefone: string | null;
  provider: string | null;
  ultima_sync: string | null;
}

interface QuedaRecente {
  id: string;
  chatwoot_account_id: number;
  inbox_id: number;
  connection_status: string;
  status_anterior: string | null;
  verificado_em: string;
  mensagem_erro: string | null;
}

type Categoria = "online" | "offline" | "cloud" | "erro" | "sem_status" | "sem_inbox";

interface InboxAgrupada {
  chatwoot_account_id: number;
  inbox_id: number | null;
  nome: string;
  inbox_nome: string | null;
  telefone: string | null;
  provider: string | null;
  connection_status: string | null;
  verificado_em: string | null;
  mensagem_erro: string | null;
  categoria: Categoria;
}

export function CaixasEntradaClient({
  accounts,
  statuses,
  quedas,
}: {
  accounts: ChatwootAccount[];
  statuses: InboxStatus[];
  quedas: QuedaRecente[];
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const statusMap = useMemo(() => {
    const m = new Map<string, InboxStatus>();
    for (const s of statuses) m.set(`${s.chatwoot_account_id}-${s.inbox_id}`, s);
    return m;
  }, [statuses]);

  // Categoriza cada account
  const categorizadas: InboxAgrupada[] = useMemo(() => {
    return accounts.map((a) => {
      const status = a.inbox_id !== null ? statusMap.get(`${a.chatwoot_account_id}-${a.inbox_id}`) : undefined;

      let categoria: Categoria = "sem_status";
      if (a.inbox_id === null) categoria = "sem_inbox";
      else if (a.provider === "whatsapp_cloud") categoria = "cloud";
      else if (status?.connection_status === "open") categoria = "online";
      else if (status?.connection_status === "close") categoria = "offline";
      else if (status?.connection_status === "error") categoria = "erro";

      return {
        chatwoot_account_id: a.chatwoot_account_id,
        inbox_id: a.inbox_id,
        nome: a.nome,
        inbox_nome: a.inbox_nome,
        telefone: a.telefone,
        provider: a.provider,
        connection_status: status?.connection_status || null,
        verificado_em: status?.verificado_em || null,
        mensagem_erro: status?.mensagem_erro || null,
        categoria,
      };
    });
  }, [accounts, statusMap]);

  // Aplica filtro de busca a cada categoria
  const filtradas = useMemo(() => {
    if (!busca) return categorizadas;
    const b = busca.toLowerCase();
    return categorizadas.filter((i) => {
      return (
        i.nome.toLowerCase().includes(b) ||
        (i.telefone || "").toLowerCase().includes(b)
      );
    });
  }, [categorizadas, busca]);

  // Agrupa por categoria
  const grupos = useMemo(() => {
    return {
      online: filtradas.filter((i) => i.categoria === "online"),
      offline: filtradas.filter((i) => i.categoria === "offline"),
      cloud: filtradas.filter((i) => i.categoria === "cloud"),
      erro: filtradas.filter((i) => i.categoria === "erro"),
      sem_status: filtradas.filter((i) => i.categoria === "sem_status"),
      sem_inbox: filtradas.filter((i) => i.categoria === "sem_inbox"),
    };
  }, [filtradas]);

  // Stats globais (não dependem de busca)
  const stats = useMemo(() => {
    return {
      online: categorizadas.filter((i) => i.categoria === "online").length,
      offline: categorizadas.filter((i) => i.categoria === "offline").length,
      cloud: categorizadas.filter((i) => i.categoria === "cloud").length,
      erro: categorizadas.filter((i) => i.categoria === "erro").length,
      semStatus: categorizadas.filter((i) => i.categoria === "sem_status").length,
      semInbox: categorizadas.filter((i) => i.categoria === "sem_inbox").length,
    };
  }, [categorizadas]);

  const totalAtendendo = stats.online + stats.cloud;
  const totalProblemas = stats.offline + stats.erro;
  const totalMonitoradas = stats.online + stats.offline;
  const pctSaude = totalMonitoradas > 0 ? Math.round((stats.online / totalMonitoradas) * 100) : 0;

  async function verificarAgora() {
    setVerificando(true);
    setResultado(null);
    try {
      const r = await fetch("/api/chatwoot/inboxes/status", { method: "POST" });
      const data = await r.json();
      if (r.ok) {
        setResultado(`${data.online} ON · ${data.offline} OFF · ${data.cloud_na} N/A · ${data.erros?.length || 0} erros`);
        router.refresh();
      } else {
        setResultado(`Erro: ${data.error || "desconhecido"}`);
      }
    } catch (err) {
      setResultado(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setVerificando(false);
    }
  }

  return (
    <div className="space-y-5 max-w-[1800px]">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Caixas de Entrada</h1>
          <p className="text-sm text-slate-600">
            {totalAtendendo} atendendo agora ·{" "}
            {totalProblemas > 0 ? (
              <span className="text-red-600 font-medium">{totalProblemas} com problema</span>
            ) : (
              <span className="text-emerald-600 font-medium">tudo certo</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {resultado && <span className="text-xs text-slate-600">{resultado}</span>}
          <Button onClick={verificarAgora} disabled={verificando} size="sm">
            {verificando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {verificando ? "Verificando..." : "Verificar agora"}
          </Button>
        </div>
      </div>

      {/* DASHBOARD PRINCIPAL — 3 cards grandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Saúde geral */}
        <Card className={`${pctSaude >= 80 ? "border-emerald-300 bg-emerald-50" : pctSaude >= 50 ? "border-amber-300 bg-amber-50" : "border-red-300 bg-red-50"}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                pctSaude >= 80 ? "text-emerald-700" : pctSaude >= 50 ? "text-amber-700" : "text-red-700"
              }`}>
                Saúde Geral
              </span>
              {pctSaude >= 80 ? (
                <Wifi className="h-4 w-4 text-emerald-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${
                pctSaude >= 80 ? "text-emerald-700" : pctSaude >= 50 ? "text-amber-700" : "text-red-700"
              }`}>
                {pctSaude}%
              </span>
              <span className="text-xs text-slate-600">conectadas</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/60">
              <div
                className={`h-full transition-all ${
                  pctSaude >= 80 ? "bg-emerald-500" : pctSaude >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${pctSaude}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {stats.online} de {totalMonitoradas} caixas WAHA online
            </p>
          </CardContent>
        </Card>

        {/* Atendendo agora */}
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Atendendo agora
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold text-[#1B2A4A]">{totalAtendendo}</span>
              <span className="text-xs text-slate-500">unidades</span>
            </div>
            <div className="space-y-1 mt-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-700 font-medium">{stats.online} WAHA online</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Cloud className="h-3 w-3 text-blue-500" />
                <span className="text-slate-700">{stats.cloud} Cloud (Meta)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problemas */}
        <Card className={totalProblemas > 0 ? "border-red-200 bg-red-50/40" : ""}>
          <CardContent className="p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Precisam atenção
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-4xl font-bold ${totalProblemas > 0 ? "text-red-600" : "text-slate-400"}`}>
                {totalProblemas + stats.semStatus + stats.semInbox}
              </span>
              <span className="text-xs text-slate-500">unidades</span>
            </div>
            <div className="space-y-1 mt-3">
              {stats.offline > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-red-700 font-medium">{stats.offline} desconectada{stats.offline > 1 ? "s" : ""}</span>
                </div>
              )}
              {stats.erro > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-red-700">{stats.erro} com erro</span>
                </div>
              )}
              {stats.semStatus > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <HelpCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-amber-700">{stats.semStatus} sem verificação</span>
                </div>
              )}
              {stats.semInbox > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  <span className="text-amber-700">{stats.semInbox} sem inbox criada</span>
                </div>
              )}
              {totalProblemas === 0 && stats.semStatus === 0 && stats.semInbox === 0 && (
                <div className="text-xs text-emerald-600 font-medium">
                  ✓ Nenhum problema detectado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar unidade ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        {busca && (
          <Button variant="ghost" size="sm" onClick={() => setBusca("")}>
            <X className="h-3 w-3" /> Limpar
          </Button>
        )}
        <span className="ml-auto text-xs text-slate-500">
          {filtradas.length} de {accounts.length}
        </span>
      </div>

      {/* SEÇÕES SEPARADAS POR CATEGORIA */}
      <div className="space-y-4">
        {/* DESCONECTADAS — primeiro (mais urgente) */}
        {grupos.offline.length > 0 && (
          <SecaoCategoria
            titulo="Desconectadas"
            count={grupos.offline.length}
            cor="red"
            descricao="WhatsApp caiu — não estão atendendo no momento"
            icone={<WifiOff className="h-5 w-5" />}
            inboxes={grupos.offline}
          />
        )}

        {/* ERROS */}
        {grupos.erro.length > 0 && (
          <SecaoCategoria
            titulo="Com Erro"
            count={grupos.erro.length}
            cor="red"
            descricao="Inbox deletada ou session_name não configurado — precisa investigar"
            icone={<XCircle className="h-5 w-5" />}
            inboxes={grupos.erro}
          />
        )}

        {/* SEM STATUS — não verificadas */}
        {grupos.sem_status.length > 0 && (
          <SecaoCategoria
            titulo="Sem verificação"
            count={grupos.sem_status.length}
            cor="amber"
            descricao='Nunca foram verificadas — clica em "Verificar agora" no topo'
            icone={<HelpCircle className="h-5 w-5" />}
            inboxes={grupos.sem_status}
            colapsavel
          />
        )}

        {/* SEM INBOX */}
        {grupos.sem_inbox.length > 0 && (
          <SecaoCategoria
            titulo="Accounts sem inbox criada"
            count={grupos.sem_inbox.length}
            cor="amber"
            descricao="Account existe no Chatwoot mas falta criar a inbox WhatsApp"
            icone={<AlertTriangle className="h-5 w-5" />}
            inboxes={grupos.sem_inbox}
            colapsavel
          />
        )}

        {/* CONECTADAS — por último */}
        {grupos.online.length > 0 && (
          <SecaoCategoria
            titulo="Conectadas"
            count={grupos.online.length}
            cor="green"
            descricao="WhatsApp ativo e atendendo normalmente"
            icone={<CheckCircle2 className="h-5 w-5" />}
            inboxes={grupos.online}
            colapsavel
          />
        )}

        {/* CLOUD */}
        {grupos.cloud.length > 0 && (
          <SecaoCategoria
            titulo="WhatsApp Cloud (Meta)"
            count={grupos.cloud.length}
            cor="blue"
            descricao="Gerenciadas pela Meta — não dá pra monitorar status via API"
            icone={<Cloud className="h-5 w-5" />}
            inboxes={grupos.cloud}
            colapsavel
          />
        )}

        {filtradas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-sm text-slate-500">
              Nenhuma caixa encontrada com &ldquo;{busca}&rdquo;
            </CardContent>
          </Card>
        )}
      </div>

      {/* HISTÓRICO 24H */}
      {quedas.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-600" />
              <h2 className="text-base font-bold text-[#1B2A4A]">
                Mudanças nas últimas 24h
              </h2>
              <span className="text-xs text-slate-500">({quedas.length})</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {quedas.map((q) => {
                const acc = accounts.find((a) =>
                  a.chatwoot_account_id === q.chatwoot_account_id && a.inbox_id === q.inbox_id
                );
                const isQueda = q.status_anterior === "open" && q.connection_status === "close";
                const isVolta = q.status_anterior === "close" && q.connection_status === "open";
                return (
                  <div key={q.id} className="p-3 hover:bg-slate-50 text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${
                        isQueda ? "bg-red-500" : isVolta ? "bg-emerald-500" : "bg-slate-300"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {acc?.nome.replace("SPV - ", "") || `Account ${q.chatwoot_account_id}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isQueda && "🔴 Caiu"}
                          {isVolta && "🟢 Voltou"}
                          {!isQueda && !isVolta && `${q.status_anterior} → ${q.connection_status}`}
                          {q.mensagem_erro && ` · ${q.mensagem_erro}`}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {timeAgo(q.verificado_em)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ SEÇÃO POR CATEGORIA ============
function SecaoCategoria({
  titulo,
  count,
  cor,
  descricao,
  icone,
  inboxes,
  colapsavel = false,
}: {
  titulo: string;
  count: number;
  cor: "red" | "amber" | "green" | "blue";
  descricao: string;
  icone: React.ReactNode;
  inboxes: InboxAgrupada[];
  colapsavel?: boolean;
}) {
  const [expandido, setExpandido] = useState(!colapsavel);

  const corMap = {
    red: {
      header: "bg-red-50 border-red-200",
      title: "text-red-800",
      desc: "text-red-600",
      icon: "text-red-600",
      badge: "bg-red-600 text-white",
    },
    amber: {
      header: "bg-amber-50 border-amber-200",
      title: "text-amber-800",
      desc: "text-amber-700",
      icon: "text-amber-600",
      badge: "bg-amber-500 text-white",
    },
    green: {
      header: "bg-emerald-50 border-emerald-200",
      title: "text-emerald-800",
      desc: "text-emerald-700",
      icon: "text-emerald-600",
      badge: "bg-emerald-600 text-white",
    },
    blue: {
      header: "bg-blue-50 border-blue-200",
      title: "text-blue-800",
      desc: "text-blue-700",
      icon: "text-blue-600",
      badge: "bg-blue-600 text-white",
    },
  }[cor];

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => colapsavel && setExpandido(!expandido)}
        disabled={!colapsavel}
        className={`w-full px-4 py-3 flex items-center gap-3 border-b ${corMap.header} ${colapsavel ? "hover:opacity-80 cursor-pointer" : "cursor-default"} transition-opacity`}
      >
        <div className={corMap.icon}>{icone}</div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-bold ${corMap.title}`}>{titulo}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${corMap.badge}`}>
              {count}
            </span>
          </div>
          <p className={`text-xs ${corMap.desc}`}>{descricao}</p>
        </div>
        {colapsavel && (
          expandido
            ? <ChevronDown className={`h-4 w-4 ${corMap.icon}`} />
            : <ChevronRight className={`h-4 w-4 ${corMap.icon}`} />
        )}
      </button>

      {/* Cards */}
      {expandido && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-3 bg-slate-50">
          {inboxes.map((i) => (
            <InboxCard key={`${i.chatwoot_account_id}-${i.inbox_id}`} inbox={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ CARD INDIVIDUAL ============
function InboxCard({ inbox }: { inbox: InboxAgrupada }) {
  const isOnline = inbox.categoria === "online";
  const isOffline = inbox.categoria === "offline";
  const isCloud = inbox.categoria === "cloud";
  const isErro = inbox.categoria === "erro";
  const isSemStatus = inbox.categoria === "sem_status";
  const isSemInbox = inbox.categoria === "sem_inbox";

  const corBorda = isOnline
    ? "border-emerald-300"
    : isOffline
      ? "border-red-300"
      : isErro
        ? "border-red-300"
        : isCloud
          ? "border-blue-200"
          : "border-amber-300";

  const corStatusDot = isOnline
    ? "bg-emerald-500"
    : isOffline
      ? "bg-red-500 animate-pulse"
      : isErro
        ? "bg-red-500"
        : isCloud
          ? "bg-blue-400"
          : "bg-amber-400";

  return (
    <div className={`bg-white rounded-md border ${corBorda} p-3 ${isOffline ? "ring-1 ring-red-200" : ""}`}>
      {/* Linha 1: status + nome */}
      <div className="flex items-start gap-2 mb-1.5">
        <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1 ${corStatusDot}`} />
        <h4 className="text-sm font-bold text-slate-900 leading-tight flex-1 truncate">
          {inbox.nome.replace("SPV - ", "")}
        </h4>
      </div>

      {/* Linha 2: telefone */}
      {inbox.telefone ? (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-1.5 ml-4">
          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{inbox.telefone}</span>
        </div>
      ) : isSemInbox ? (
        <div className="text-[11px] text-amber-700 mb-1.5 ml-4 italic">
          Sem inbox configurada
        </div>
      ) : null}

      {/* Linha 3: meta info */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 ml-4">
        <span>
          {inbox.provider === "waha"
            ? "WAHA"
            : inbox.provider === "whatsapp_cloud"
              ? "Cloud"
              : "—"}
          {" · "}
          #{inbox.chatwoot_account_id}
          {inbox.inbox_id !== null && ` / ${inbox.inbox_id}`}
        </span>
        {inbox.verificado_em && (
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(inbox.verificado_em)}
          </span>
        )}
      </div>

      {/* Erro detalhado */}
      {(isOffline || isErro) && inbox.mensagem_erro && (
        <div className="mt-2 ml-4 bg-red-50 border border-red-200 rounded px-2 py-1 text-[10px] text-red-700">
          {inbox.mensagem_erro}
        </div>
      )}

      {/* Sem status hint */}
      {isSemStatus && (
        <div className="mt-2 ml-4 text-[10px] text-amber-700 italic">
          Nunca verificada
        </div>
      )}

      {/* Link Chatwoot */}
      {(isOffline || isErro) && inbox.inbox_id && (
        <a
          href={`https://crmsupervisao.com/app/accounts/${inbox.chatwoot_account_id}/settings/inboxes/${inbox.inbox_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 ml-4 inline-flex items-center gap-1 text-[10px] text-[#1B2A4A] hover:underline"
        >
          Abrir no Chatwoot <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
    </div>
  );
}
