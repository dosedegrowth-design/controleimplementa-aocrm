"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KPICard } from "@/components/kpi-card";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Cloud,
  RefreshCw,
  Phone,
  Search,
  X,
  Clock,
  Activity,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatDateTime, timeAgo } from "@/lib/utils";

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
  const [filtroStatus, setFiltroStatus] = useState<string>("all");
  const [filtroProvider, setFiltroProvider] = useState<string>("all");
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  // Mapa de status por (account_id, inbox_id)
  const statusMap = useMemo(() => {
    const m = new Map<string, InboxStatus>();
    for (const s of statuses) {
      m.set(`${s.chatwoot_account_id}-${s.inbox_id}`, s);
    }
    return m;
  }, [statuses]);

  // Lista de inboxes (derivada das accounts)
  const inboxes = useMemo(() => {
    return accounts
      .filter((a) => a.inbox_id !== null)
      .map((a) => {
        const status = statusMap.get(`${a.chatwoot_account_id}-${a.inbox_id}`);
        return {
          ...a,
          connection_status: status?.connection_status || null,
          verificado_em: status?.verificado_em || null,
          mensagem_erro: status?.mensagem_erro || null,
        };
      });
  }, [accounts, statusMap]);

  // Stats
  const stats = useMemo(() => {
    const total = inboxes.length;
    let online = 0;
    let offline = 0;
    let cloud = 0;
    let semStatus = 0;
    for (const i of inboxes) {
      if (i.provider === "whatsapp_cloud") cloud++;
      else if (i.connection_status === "open") online++;
      else if (i.connection_status === "close") offline++;
      else semStatus++;
    }
    const semInbox = accounts.filter((a) => a.inbox_id === null).length;
    return { total, online, offline, cloud, semStatus, semInbox };
  }, [inboxes, accounts]);

  // Filtros
  const inboxesFiltradas = useMemo(() => {
    return inboxes.filter((i) => {
      if (busca) {
        const b = busca.toLowerCase();
        const matchNome = i.nome.toLowerCase().includes(b);
        const matchTel = (i.telefone || "").toLowerCase().includes(b);
        if (!matchNome && !matchTel) return false;
      }
      if (filtroStatus !== "all") {
        if (filtroStatus === "online" && i.connection_status !== "open") return false;
        if (filtroStatus === "offline" && i.connection_status !== "close") return false;
        if (filtroStatus === "cloud" && i.provider !== "whatsapp_cloud") return false;
        if (filtroStatus === "sem_status" && (i.connection_status || i.provider === "whatsapp_cloud")) return false;
      }
      if (filtroProvider !== "all" && i.provider !== filtroProvider) return false;
      return true;
    });
  }, [inboxes, busca, filtroStatus, filtroProvider]);

  async function verificarAgora() {
    setVerificando(true);
    setResultado(null);
    try {
      const r = await fetch("/api/chatwoot/inboxes/status", { method: "POST" });
      const data = await r.json();
      if (r.ok) {
        setResultado(`✓ ${data.online} ON · ${data.offline} OFF · ${data.cloud_na} N/A · ${data.erros?.length || 0} erros`);
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

  const hasFilters = busca !== "" || filtroStatus !== "all" || filtroProvider !== "all";

  return (
    <div className="space-y-5 max-w-[1800px]">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Caixas de Entrada</h1>
          <p className="text-sm text-slate-600">
            Monitoramento WhatsApp das {stats.total} inboxes ativas no Chatwoot
          </p>
        </div>
        <div className="flex items-center gap-3">
          {resultado && <span className="text-xs text-slate-600">{resultado}</span>}
          <Button variant="outline" size="sm" onClick={verificarAgora} disabled={verificando}>
            {verificando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {verificando ? "Verificando..." : "Verificar agora"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Total Inboxes" value={stats.total} icon={Inbox} accent="default" />
        <KPICard label="ONLINE" value={stats.online} icon={CheckCircle2} accent="success" />
        <KPICard label="OFFLINE" value={stats.offline} icon={XCircle} accent="danger" />
        <KPICard label="Cloud (N/A)" value={stats.cloud} icon={Cloud} accent="default" hint="Meta gerencia" />
        <KPICard label="Sem status" value={stats.semStatus} icon={AlertOctagon} accent={stats.semStatus > 0 ? "warn" : "default"} hint="precisam verificar" />
        <KPICard label="Sem inbox" value={stats.semInbox} icon={AlertOctagon} accent={stats.semInbox > 0 ? "warn" : "default"} hint="accounts sem WhatsApp" />
      </div>

      {/* ALERTA SE TEM OFFLINE */}
      {stats.offline > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-5 w-5 text-red-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">
                  {stats.offline} caixa{stats.offline > 1 ? "s" : ""} de entrada offline
                </p>
                <p className="text-xs text-red-600">
                  WhatsApp desconectado. Verifique e reconecte assim que possível.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FILTROS */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="online">🟢 ONLINE</SelectItem>
                <SelectItem value="offline">🔴 OFFLINE</SelectItem>
                <SelectItem value="cloud">☁️ Cloud (N/A)</SelectItem>
                <SelectItem value="sem_status">⚠ Sem status</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroProvider} onValueChange={setFiltroProvider}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos providers</SelectItem>
                <SelectItem value="waha">WAHA</SelectItem>
                <SelectItem value="whatsapp_cloud">WhatsApp Cloud</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => {
                setBusca("");
                setFiltroStatus("all");
                setFiltroProvider("all");
              }}>
                <X className="h-3 w-3" /> Limpar
              </Button>
            )}
            <span className="ml-auto text-xs text-slate-500">
              {inboxesFiltradas.length} de {inboxes.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {inboxesFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-sm text-slate-500">
            Nenhuma caixa com esses filtros.
          </div>
        ) : (
          inboxesFiltradas.map((i) => (
            <InboxCard key={`${i.chatwoot_account_id}-${i.inbox_id}`} inbox={i} />
          ))
        )}
      </div>

      {/* QUEDAS RECENTES */}
      {quedas.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-600" />
                <h2 className="text-base font-bold text-[#1B2A4A]">
                  Mudanças de status nas últimas 24h
                </h2>
                <span className="text-xs text-slate-500">
                  ({quedas.length} eventos)
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
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
                          {acc?.nome || `Account ${q.chatwoot_account_id}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isQueda && "Caiu (estava ON, ficou OFF)"}
                          {isVolta && "Voltou (estava OFF, ficou ON)"}
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

interface InboxCardData {
  chatwoot_account_id: number;
  inbox_id: number | null;
  nome: string;
  inbox_nome: string | null;
  telefone: string | null;
  provider: string | null;
  connection_status: string | null;
  verificado_em: string | null;
  mensagem_erro: string | null;
}

function InboxCard({ inbox }: { inbox: InboxCardData }) {
  const isCloud = inbox.provider === "whatsapp_cloud";
  const isOnline = inbox.connection_status === "open";
  const isOffline = inbox.connection_status === "close";
  const semStatus = !inbox.connection_status && !isCloud;

  // Cor da borda lateral
  const borderColor = isOnline
    ? "border-l-4 border-l-emerald-500"
    : isOffline
      ? "border-l-4 border-l-red-500"
      : isCloud
        ? "border-l-4 border-l-blue-400"
        : "border-l-4 border-l-amber-400";

  return (
    <Card className={`${borderColor} ${isOffline ? "ring-2 ring-red-200" : ""}`}>
      <CardContent className="p-3">
        {/* Header com status pulsante */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
              isOnline ? "bg-emerald-500" :
              isOffline ? "bg-red-500 animate-pulse" :
              isCloud ? "bg-blue-400" :
              "bg-amber-400"
            }`} />
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {inbox.nome.replace("SPV - ", "")}
            </h3>
          </div>
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
            isOnline ? "bg-emerald-100 text-emerald-700" :
            isOffline ? "bg-red-100 text-red-700" :
            isCloud ? "bg-blue-100 text-blue-700" :
            "bg-amber-100 text-amber-700"
          }`}>
            {isOnline ? "ON" : isOffline ? "OFF" : isCloud ? "CLOUD" : "—"}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1 text-[11px] mb-2.5">
          {inbox.telefone && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{inbox.telefone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="text-[9px] uppercase font-bold tracking-wider">
              {inbox.provider === "waha" ? "WAHA" : inbox.provider === "whatsapp_cloud" ? "Cloud" : "—"}
            </span>
            <span className="text-slate-300">·</span>
            <span>Account #{inbox.chatwoot_account_id}</span>
            <span className="text-slate-300">·</span>
            <span>Inbox #{inbox.inbox_id}</span>
          </div>
        </div>

        {/* Última verificação */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {inbox.verificado_em ? (
              <span>Verificado {timeAgo(inbox.verificado_em)}</span>
            ) : (
              <span className="text-amber-600">Nunca verificado</span>
            )}
          </div>
          {(isOffline || semStatus) && (
            <a
              href={`https://crmsupervisao.com/app/accounts/${inbox.chatwoot_account_id}/settings/inboxes/${inbox.inbox_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1B2A4A] hover:underline inline-flex items-center gap-0.5"
            >
              Abrir <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>

        {/* Erro se houver */}
        {inbox.mensagem_erro && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded p-1.5 text-[10px] text-red-700">
            {inbox.mensagem_erro}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
