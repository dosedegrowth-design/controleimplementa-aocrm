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
} from "lucide-react";
import { timeAgo, formatDateTime } from "@/lib/utils";

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
  criado_em: string;
  atualizado_em: string;
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
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Onboardings</h1>
          <p className="text-sm text-slate-600">
            Cadastros de novas unidades em andamento
          </p>
        </div>
        <Button onClick={gerarLink} disabled={gerando}>
          {gerando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {gerando ? "Gerando..." : "Gerar novo link"}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Total" value={stats.total} cor="slate" />
        <KPI label="Preenchendo" value={stats.preenchendo} cor="amber" onClick={() => setFiltroStatus("em_andamento")} />
        <KPI label="Aguardando" value={stats.aguardando} cor="blue" onClick={() => setFiltroStatus("enviado")} />
        <KPI label="Aprovados" value={stats.aprovados} cor="emerald" onClick={() => setFiltroStatus("aprovado")} />
        <KPI label="Rejeitados" value={stats.rejeitados} cor="red" onClick={() => setFiltroStatus("rejeitado")} />
        <KPI label="Provisionados" value={stats.provisionados} cor="purple" onClick={() => setFiltroStatus("provisionado")} />
      </div>

      {/* Botão limpar filtro */}
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
        <CardContent className="p-0">
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
    </div>
  );
}

function KPI({
  label,
  value,
  cor,
  onClick,
}: {
  label: string;
  value: number;
  cor: "slate" | "amber" | "blue" | "emerald" | "red" | "purple";
  onClick?: () => void;
}) {
  const corMap = {
    slate: "border-slate-200",
    amber: "border-amber-200 hover:border-amber-300",
    blue: "border-blue-200 hover:border-blue-300",
    emerald: "border-emerald-200 hover:border-emerald-300",
    red: "border-red-200 hover:border-red-300",
    purple: "border-purple-200 hover:border-purple-300",
  };
  const textCor = {
    slate: "text-slate-700",
    amber: "text-amber-700",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    red: "text-red-700",
    purple: "text-purple-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`bg-white rounded-lg border p-4 text-left transition-colors ${corMap[cor]} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${textCor[cor]}`}>{value}</p>
    </button>
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
                Por enquanto, aprovar cria só a unidade no painel interno. O provisionamento automático Chatwoot é o próximo passo.
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
