"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Trash2,
  Plus,
  Phone,
  Mail,
  MapPin,
  User as UserIcon,
  Rocket,
  RotateCw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { timeAgo, formatDateTime } from "@/lib/utils";
import { PageHero } from "@/components/page-hero";
import { SectionHeader } from "@/components/section-header";
import { KPICard } from "@/components/kpi-card";
import { Sparkles, ListChecks, FileEdit, Hourglass, ThumbsUp, ThumbsDown, Rocket as RocketIcon } from "lucide-react";

interface OnboardingSubmission {
  id: string;
  token_publico: string;
  status: "em_andamento" | "enviado" | "aprovado" | "rejeitado" | "provisionado";
  step_atual: number;
  nome_unidade: string | null;
  cidade: string | null;
  estado: string | null;
  nome_franqueado: string | null;
  email_franqueado: string | null;
  telefone_franqueado: string | null;
  telefone_inbox: string | null;
  agentes: { nome: string; email: string; perfil: string }[];
  observacoes: string | null;
  provider_chatwoot: "whatsapp_cloud" | "waha" | null;
  enviado_em: string | null;
  aprovado_em: string | null;
  rejeitado_em: string | null;
  rejeicao_motivo: string | null;
  provisionado_em: string | null;
  unidade_id: string | null;
  chatwoot_account_id: number | null;
  criado_em: string;
  atualizado_em: string;
}

interface ProvStep {
  step: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

interface ProvResult {
  ok: boolean;
  took_ms?: number;
  result?: {
    ok: boolean;
    skipped?: boolean;
    message?: string;
    error?: string;
    chatwoot?: {
      account_id: number;
      inbox_id: number;
      funnel_id: number;
      owner_email?: string;
    };
    steps?: ProvStep[];
  };
  error?: string;
}

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  em_andamento: { label: "Preenchendo", cor: "bg-amber-100 text-amber-800" },
  enviado: { label: "Aguardando revisão", cor: "bg-blue-100 text-blue-800" },
  aprovado: { label: "Aprovado", cor: "bg-emerald-100 text-emerald-800" },
  rejeitado: { label: "Rejeitado", cor: "bg-red-100 text-red-800" },
  provisionado: { label: "Provisionado", cor: "bg-purple-100 text-purple-800" },
};

export function OnboardingsClient({ submissoes }: { submissoes: OnboardingSubmission[] }) {
  const router = useRouter();
  const [gerando, setGerando] = useState(false);
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [selecionada, setSelecionada] = useState<OnboardingSubmission | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("all");

  const stats = useMemo(() => {
    return {
      total: submissoes.length,
      preenchendo: submissoes.filter((s) => s.status === "em_andamento").length,
      aguardando: submissoes.filter((s) => s.status === "enviado").length,
      aprovados: submissoes.filter((s) => s.status === "aprovado").length,
      rejeitados: submissoes.filter((s) => s.status === "rejeitado").length,
      provisionados: submissoes.filter((s) => s.status === "provisionado").length,
    };
  }, [submissoes]);

  const filtradas = useMemo(() => {
    if (filtroStatus === "all") return submissoes;
    return submissoes.filter((s) => s.status === filtroStatus);
  }, [submissoes, filtroStatus]);

  async function gerarLink() {
    setGerando(true);
    setLinkGerado(null);
    setCopiado(false);
    try {
      const r = await fetch("/api/onboarding/iniciar", { method: "POST" });
      const data = await r.json();
      if (!r.ok) {
        alert(data.error || "Erro ao gerar link");
        return;
      }
      const fullUrl = `${window.location.origin}${data.url}`;
      setLinkGerado(fullUrl);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setGerando(false);
    }
  }

  function copiar() {
    if (!linkGerado) return;
    navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <>
      <PageHero
        eyebrow="Onboarding"
        title="Cadastros de unidades"
        subtitle={`${stats.total} submissões · ${stats.aguardando} aguardando revisão · ${stats.provisionados} já provisionadas no Chatwoot`}
        icon={<Sparkles className="h-5 w-5" />}
        actions={
          <Button
            onClick={gerarLink}
            disabled={gerando}
            className="bg-white text-[#1B2A4A] hover:bg-white/90"
          >
            {gerando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {gerando ? "Gerando..." : "Gerar novo link"}
          </Button>
        }
      />

      {/* KPIs */}
      <div>
        <SectionHeader
          icon={<ListChecks className="h-4 w-4" />}
          title="Status dos onboardings"
          subtitle="Clique pra filtrar a lista abaixo"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label="Total"
            value={stats.total}
            icon={ListChecks}
            accent="navy"
            delay={0}
            onClick={() => setFiltroStatus("all")}
          />
          <KPICard
            label="Preenchendo"
            value={stats.preenchendo}
            icon={FileEdit}
            accent="warn"
            delay={0.05}
            onClick={() => setFiltroStatus("em_andamento")}
          />
          <KPICard
            label="Aguardando"
            value={stats.aguardando}
            icon={Hourglass}
            accent="info"
            delay={0.1}
            onClick={() => setFiltroStatus("enviado")}
            highlight={stats.aguardando > 0}
          />
          <KPICard
            label="Aprovados"
            value={stats.aprovados}
            icon={ThumbsUp}
            accent="success"
            delay={0.15}
            onClick={() => setFiltroStatus("aprovado")}
          />
          <KPICard
            label="Rejeitados"
            value={stats.rejeitados}
            icon={ThumbsDown}
            accent="danger"
            delay={0.2}
            onClick={() => setFiltroStatus("rejeitado")}
          />
          <KPICard
            label="Provisionados"
            value={stats.provisionados}
            icon={RocketIcon}
            accent="navy"
            delay={0.25}
            onClick={() => setFiltroStatus("provisionado")}
          />
        </div>
      </div>

      {filtroStatus !== "all" && (
        <button
          onClick={() => setFiltroStatus("all")}
          className="text-xs text-[#1B2A4A] hover:underline"
        >
          ← Ver todos
        </button>
      )}

      {/* Lista */}
      <Card>
        <CardContent className="!p-0">
          {filtradas.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              {filtroStatus === "all"
                ? "Nenhum onboarding ainda. Clique em 'Gerar novo link' pra começar."
                : "Nenhum onboarding com esse status."}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtradas.map((sub) => (
                <SubmissionRow
                  key={sub.id}
                  submission={sub}
                  onClick={() => setSelecionada(sub)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog do link gerado */}
      <Dialog open={!!linkGerado} onOpenChange={(o) => !o && setLinkGerado(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <DialogTitle>Link gerado!</DialogTitle>
                <DialogDescription>
                  Mande esse link pro franqueado preencher os dados da unidade.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 break-all text-sm font-mono">
              {linkGerado}
            </div>
            <Button onClick={copiar} className="w-full" variant={copiado ? "success" : "default"}>
              {copiado ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copiar link
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkGerado(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawer de detalhes */}
      <SubmissionDrawer
        submission={selecionada}
        onClose={() => setSelecionada(null)}
        onAction={() => router.refresh()}
      />
    </>
  );
}

function SubmissionRow({
  submission,
  onClick,
}: {
  submission: OnboardingSubmission;
  onClick: () => void;
}) {
  const statusInfo = STATUS_LABELS[submission.status];
  const nome = submission.nome_unidade || "(sem nome ainda)";
  const subInfo =
    submission.nome_franqueado ||
    (submission.status === "em_andamento"
      ? "preenchendo..."
      : "sem informação");

  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 truncate">{nome}</h3>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${statusInfo?.cor || "bg-slate-100"}`}>
            {statusInfo?.label || submission.status}
          </span>
        </div>
        <p className="text-sm text-slate-600 truncate">
          {subInfo}
          {submission.cidade && ` · ${submission.cidade}/${submission.estado}`}
        </p>
      </div>
      <div className="text-xs text-slate-400 shrink-0 text-right">
        <div>{timeAgo(submission.atualizado_em)}</div>
        {submission.status === "em_andamento" && (
          <div className="text-[10px] mt-0.5">
            Etapa {submission.step_atual + 1}/9
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionDrawer({
  submission,
  onClose,
  onAction,
}: {
  submission: OnboardingSubmission | null;
  onClose: () => void;
  onAction: () => void;
}) {
  const [aprovando, setAprovando] = useState(false);
  const [rejeitando, setRejeitando] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [confirmRejeitar, setConfirmRejeitar] = useState(false);
  const [confirmAprovar, setConfirmAprovar] = useState(false);
  const [providerEscolhido, setProviderEscolhido] = useState<"whatsapp_cloud" | "waha" | null>(null);
  const [provisionando, setProvisionando] = useState(false);
  const [provResult, setProvResult] = useState<ProvResult | null>(null);
  const [confirmReprov, setConfirmReprov] = useState(false);

  if (!submission) return null;

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/onboarding/${submission.token_publico}`;

  async function aprovar() {
    if (!providerEscolhido) {
      alert("Escolha o provider WhatsApp antes de aprovar");
      return;
    }
    setAprovando(true);
    try {
      const r = await fetch("/api/onboarding/admin/aprovar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submission!.id,
          provider_chatwoot: providerEscolhido,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        alert(data.error || "Erro ao aprovar");
        return;
      }
      onAction();
      setConfirmAprovar(false);
      setProviderEscolhido(null);
      onClose();
    } finally {
      setAprovando(false);
    }
  }

  async function rejeitar() {
    setRejeitando(true);
    try {
      const r = await fetch("/api/onboarding/admin/rejeitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submission!.id, motivo: motivoRejeicao }),
      });
      if (!r.ok) {
        const data = await r.json();
        alert(data.error || "Erro ao rejeitar");
        return;
      }
      onAction();
      setConfirmRejeitar(false);
      onClose();
    } finally {
      setRejeitando(false);
    }
  }

  function copiarLink() {
    navigator.clipboard.writeText(link);
  }

  async function provisionar(force: boolean) {
    setProvisionando(true);
    setProvResult(null);
    try {
      const r = await fetch("/api/onboarding/admin/provisionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submission!.id, force }),
      });
      const data = (await r.json()) as ProvResult;
      setProvResult({ ...data, ok: r.ok && data.ok });
      if (r.ok && data.ok) {
        onAction(); // refresh lista
      }
    } catch (e) {
      setProvResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setProvisionando(false);
      setConfirmReprov(false);
    }
  }

  return (
    <Sheet open={!!submission} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="overflow-y-auto p-0">
        <SheetHeader>
          <SheetTitle>{submission.nome_unidade || "(sem nome)"}</SheetTitle>
          <SheetDescription>
            <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded mr-2 ${STATUS_LABELS[submission.status]?.cor}`}>
              {STATUS_LABELS[submission.status]?.label}
            </span>
            Criado {timeAgo(submission.criado_em)}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-5">
          {/* Link público */}
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 mb-2">Link do quiz</p>
            <div className="flex gap-2">
              <input
                value={link}
                readOnly
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 font-mono"
              />
              <Button size="sm" variant="outline" onClick={copiarLink}>
                <Copy className="h-3 w-3" />
              </Button>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>

          {/* Dados */}
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 mb-2">Dados da unidade</p>
            <div className="space-y-2 text-sm">
              <DataRow icon={<MapPin className="h-3 w-3" />} label="Localização" value={submission.cidade && submission.estado ? `${submission.cidade}/${submission.estado}` : null} />
              <DataRow icon={<UserIcon className="h-3 w-3" />} label="Franqueado" value={submission.nome_franqueado} />
              <DataRow icon={<Mail className="h-3 w-3" />} label="Email" value={submission.email_franqueado} />
              <DataRow icon={<Phone className="h-3 w-3" />} label="WhatsApp pessoal" value={submission.telefone_franqueado} />
              <DataRow icon={<Phone className="h-3 w-3" />} label="WhatsApp atendimento" value={submission.telefone_inbox} />
            </div>
          </div>

          {/* Agentes */}
          {submission.agentes?.length > 0 && (
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 mb-2">
                Atendentes ({submission.agentes.length})
              </p>
              <div className="space-y-2">
                {submission.agentes.map((ag, idx) => (
                  <div key={idx} className="bg-slate-50 rounded p-2 text-sm">
                    <p className="font-medium text-slate-800">{ag.nome || <span className="italic text-slate-400">sem nome</span>}</p>
                    <p className="text-xs text-slate-500">
                      {ag.email || "sem email"} · {ag.perfil}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {submission.observacoes && (
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 mb-2">Observações</p>
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-slate-700">
                {submission.observacoes}
              </div>
            </div>
          )}

          {/* Rejeição se houver */}
          {submission.status === "rejeitado" && submission.rejeicao_motivo && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs uppercase font-bold text-red-700 mb-1">Motivo da rejeição</p>
              <p className="text-sm text-red-800">{submission.rejeicao_motivo}</p>
              <p className="text-[10px] text-red-500 mt-1">
                {submission.rejeitado_em && formatDateTime(submission.rejeitado_em)}
              </p>
            </div>
          )}

          {/* Ações */}
          {submission.status === "enviado" && (
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <Button
                onClick={() => {
                  setProviderEscolhido(null);
                  setConfirmAprovar(true);
                }}
                disabled={aprovando}
                className="w-full"
                variant="success"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprovar e criar unidade
              </Button>
              <Button
                onClick={() => setConfirmRejeitar(true)}
                disabled={aprovando}
                className="w-full"
                variant="outline"
              >
                <XCircle className="h-4 w-4" />
                Rejeitar
              </Button>
            </div>
          )}

          {submission.status === "aprovado" && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      ✓ Unidade criada no painel
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Aprovada em {submission.aprovado_em && formatDateTime(submission.aprovado_em)}
                    </p>
                  </div>
                  {submission.provider_chatwoot && (
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded shrink-0 ${
                        submission.provider_chatwoot === "whatsapp_cloud"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {submission.provider_chatwoot === "whatsapp_cloud"
                        ? "Cloud (Meta)"
                        : "WAHA"}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">Chatwoot: aguardando provisionamento</p>
                    <p className="text-[11px] text-slate-500">27 chamadas API (Account, Inbox, Agentes, Funil, Stages, Labels, Automações, Apps)</p>
                  </div>
                </div>
                <Button
                  onClick={() => provisionar(false)}
                  disabled={provisionando}
                  className="w-full"
                >
                  {provisionando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Provisionando no Chatwoot…
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Provisionar agora no Chatwoot
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-slate-400 text-center">
                  Pode levar ~30s. Rollback automático em caso de falha.
                </p>
              </div>

              {provResult && <ProvResultBlock result={provResult} />}
            </div>
          )}

          {submission.status === "provisionado" && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-purple-800">
                      ✓ Provisionado no Chatwoot
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {submission.provisionado_em && formatDateTime(submission.provisionado_em)}
                    </p>
                  </div>
                  {submission.provider_chatwoot && (
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded shrink-0 ${
                        submission.provider_chatwoot === "whatsapp_cloud"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {submission.provider_chatwoot === "whatsapp_cloud"
                        ? "Cloud (Meta)"
                        : "WAHA"}
                    </span>
                  )}
                </div>
                {submission.chatwoot_account_id && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="font-mono bg-white border border-purple-200 rounded px-2 py-1">
                      Account #{submission.chatwoot_account_id}
                    </span>
                    <a
                      href={`https://crmsupervisao.com/app/accounts/${submission.chatwoot_account_id}/dashboard`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-700 hover:underline"
                    >
                      Abrir no Chatwoot
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmReprov(true)}
                disabled={provisionando}
                className="w-full"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Reprovisionar (force)
              </Button>

              {provResult && <ProvResultBlock result={provResult} />}
            </div>
          )}
        </div>
      </SheetContent>

      {/* Modal de aprovação — escolha do provider WhatsApp */}
      <Dialog open={confirmAprovar} onOpenChange={setConfirmAprovar}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aprovar e criar unidade</DialogTitle>
            <DialogDescription>
              Antes de criar no Chatwoot, escolha como o WhatsApp dessa unidade vai conectar.
              <br />
              <span className="text-xs text-amber-700 font-medium">
                ⚠ Decisão técnica do time — não pode ser alterada facilmente depois.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {/* Card WhatsApp Cloud */}
            <button
              type="button"
              onClick={() => setProviderEscolhido("whatsapp_cloud")}
              className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                providerEscolhido === "whatsapp_cloud"
                  ? "border-[#E30613] bg-red-50 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#1B2A4A] text-sm">
                      WhatsApp Cloud (API oficial Meta)
                    </span>
                    {providerEscolhido === "whatsapp_cloud" && (
                      <span className="text-[9px] uppercase font-bold tracking-wider bg-[#E30613] text-white px-2 py-0.5 rounded">
                        Selecionado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Oficial Meta, mais estável, status verificado. Setup mais demorado (precisa BM aprovado).
                  </p>
                  <ul className="text-[11px] space-y-0.5">
                    <li className="text-emerald-700">✓ Oficial e estável</li>
                    <li className="text-emerald-700">✓ Selo verde verificado possível</li>
                    <li className="text-amber-700">⚠ Precisa BM Meta aprovado</li>
                    <li className="text-amber-700">⚠ Custos Meta por conversa</li>
                  </ul>
                </div>
              </div>
            </button>

            {/* Card WAHA */}
            <button
              type="button"
              onClick={() => setProviderEscolhido("waha")}
              className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                providerEscolhido === "waha"
                  ? "border-[#E30613] bg-red-50 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#1B2A4A] text-sm">
                      WAHA (não-oficial)
                    </span>
                    {providerEscolhido === "waha" && (
                      <span className="text-[9px] uppercase font-bold tracking-wider bg-[#E30613] text-white px-2 py-0.5 rounded">
                        Selecionado
                      </span>
                    )}
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Padrão atual
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Setup rápido, funciona com qualquer número (pessoal ou Business). Não-oficial.
                  </p>
                  <ul className="text-[11px] space-y-0.5">
                    <li className="text-emerald-700">✓ Setup em minutos</li>
                    <li className="text-emerald-700">✓ Sem burocracia Meta</li>
                    <li className="text-emerald-700">✓ Funciona com qualquer número</li>
                    <li className="text-amber-700">⚠ Não-oficial — pequeno risco de ban</li>
                  </ul>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 mt-2">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold">Sequência ao aprovar:</span> Account → Inbox (
              {providerEscolhido === "whatsapp_cloud"
                ? "Cloud"
                : providerEscolhido === "waha"
                  ? "WAHA"
                  : "?"}
              ) → 6 agentes → Funnel + 7 stages → 13 labels → 3 automações → 2 dashboards.
              <br />
              <span className="text-[10px] text-slate-500 italic mt-1 inline-block">
                Aprovar cria a unidade no painel. O provisionamento no Chatwoot é o próximo passo (botão &ldquo;Provisionar agora&rdquo; após aprovar).
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmAprovar(false)} disabled={aprovando}>
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={aprovar}
              disabled={aprovando || !providerEscolhido}
            >
              {aprovando && <Loader2 className="h-4 w-4 animate-spin" />}
              <CheckCircle2 className="h-4 w-4" />
              Confirmar aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de reprovisionamento (force) */}
      <Dialog open={confirmReprov} onOpenChange={setConfirmReprov}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <DialogTitle>Reprovisionar essa unidade?</DialogTitle>
                <DialogDescription>
                  Cria uma <span className="font-bold">nova Account</span> no Chatwoot.
                  A account anterior (#{submission?.chatwoot_account_id || "?"}) <span className="font-bold">não é deletada automaticamente</span>.
                  Use só se algo deu errado e quer começar do zero.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmReprov(false)} disabled={provisionando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => provisionar(true)} disabled={provisionando}>
              {provisionando && <Loader2 className="h-4 w-4 animate-spin" />}
              <RotateCw className="h-4 w-4" />
              Sim, reprovisionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de rejeição */}
      <Dialog open={confirmRejeitar} onOpenChange={setConfirmRejeitar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar essa submissão?</DialogTitle>
            <DialogDescription>
              Conte o motivo. O franqueado verá uma mensagem genérica de que houve um problema.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={motivoRejeicao}
            onChange={(e) => setMotivoRejeicao(e.target.value)}
            placeholder="Ex: Dados inconsistentes, telefone inválido..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmRejeitar(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={rejeitar} disabled={rejeitando}>
              {rejeitando && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

function ProvResultBlock({ result }: { result: ProvResult }) {
  const inner = result.result;
  const steps = inner?.steps || [];
  const success = result.ok && inner?.ok && !inner?.error;
  const skipped = inner?.skipped === true;

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 ${
        success
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {success ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-red-700 mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold ${
              success ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {skipped
              ? "Já estava provisionada"
              : success
                ? "Provisionado com sucesso"
                : "Falha no provisionamento"}
          </p>
          {result.took_ms != null && (
            <p className="text-[10px] text-slate-500">
              Levou {(result.took_ms / 1000).toFixed(1)}s
            </p>
          )}
        </div>
      </div>

      {inner?.chatwoot && (
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5">
            Account #{inner.chatwoot.account_id}
          </span>
          <span className="font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5">
            Inbox #{inner.chatwoot.inbox_id}
          </span>
          <span className="font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5">
            Funnel #{inner.chatwoot.funnel_id}
          </span>
        </div>
      )}

      {(result.error || inner?.error) && (
        <p className="text-xs text-red-800 bg-white rounded p-2 border border-red-200 font-mono break-all">
          {result.error || inner?.error}
        </p>
      )}

      {steps.length > 0 && (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-slate-600 hover:text-slate-800 font-medium">
            Ver {steps.length} steps
          </summary>
          <ul className="mt-2 space-y-1 pl-1">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                {s.ok ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={
                      s.ok ? "text-slate-700" : "text-red-700 font-medium"
                    }
                  >
                    {s.step}
                  </p>
                  {s.error && (
                    <p className="text-[10px] text-red-600 font-mono break-all">
                      {s.error}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function DataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-medium text-slate-500">{label}</p>
        <p className="text-sm text-slate-800 break-words">
          {value || <span className="text-slate-400 italic">não informado</span>}
        </p>
      </div>
    </div>
  );
}
