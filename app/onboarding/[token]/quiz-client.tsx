"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Building2,
  User,
  Phone,
  Users as UsersIcon,
  Mail,
  Sparkles,
} from "lucide-react";

interface Agente {
  nome: string;
  email: string;
  perfil: "administrador" | "agente";
}

interface Submission {
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
  agentes: Agente[];
  observacoes: string | null;
}

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const STEPS = [
  "boas_vindas",
  "nome_unidade",
  "localizacao",
  "franqueado",
  "telefones",
  "qtd_agentes",
  "dados_agentes",
  "observacoes",
  "revisao",
] as const;

type StepKey = (typeof STEPS)[number];

export function QuizClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [readonly, setReadonly] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form state local
  const [form, setForm] = useState({
    nome_unidade: "",
    cidade: "",
    estado: "",
    nome_franqueado: "",
    email_franqueado: "",
    telefone_franqueado: "",
    telefone_inbox: "",
    qtd_agentes: 1,
    agentes: [{ nome: "", email: "", perfil: "administrador" }] as Agente[],
    observacoes: "",
  });

  // Carrega submission
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/onboarding/${token}`);
        const data = await r.json();
        if (!r.ok) {
          setError(data.error || "Erro ao carregar");
          setLoading(false);
          return;
        }
        const sub = data.submission as Submission;
        setSubmission(sub);
        setReadonly(data.readonly);
        setStep(sub.step_atual || 0);
        setForm({
          nome_unidade: sub.nome_unidade || "",
          cidade: sub.cidade || "",
          estado: sub.estado || "",
          nome_franqueado: sub.nome_franqueado || "",
          email_franqueado: sub.email_franqueado || "",
          telefone_franqueado: sub.telefone_franqueado || "",
          telefone_inbox: sub.telefone_inbox || "",
          qtd_agentes: sub.agentes?.length || 1,
          agentes:
            sub.agentes?.length > 0
              ? sub.agentes
              : [{ nome: "", email: "", perfil: "administrador" }],
          observacoes: sub.observacoes || "",
        });
        if (sub.status !== "em_andamento") {
          setSubmitted(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Auto-save com debounce
  const saveProgress = useCallback(
    async (newStep?: number) => {
      if (readonly) return;
      setSaving(true);
      try {
        await fetch(`/api/onboarding/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step_atual: newStep ?? step,
            ...form,
          }),
        });
      } finally {
        setSaving(false);
      }
    },
    [token, step, form, readonly],
  );

  function next() {
    const novo = Math.min(step + 1, STEPS.length - 1);
    setStep(novo);
    saveProgress(novo);
  }
  function prev() {
    const novo = Math.max(step - 1, 0);
    setStep(novo);
  }

  async function submeter() {
    setSaving(true);
    setError(null);
    try {
      // Salva tudo primeiro
      await saveProgress(STEPS.length - 1);
      // Submete
      const r = await fetch(`/api/onboarding/${token}/submit`, { method: "POST" });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Erro ao enviar");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  function updateQtdAgentes(novo: number) {
    const ag = [...form.agentes];
    while (ag.length < novo) ag.push({ nome: "", email: "", perfil: "agente" });
    while (ag.length > novo) ag.pop();
    setForm({ ...form, qtd_agentes: novo, agentes: ag });
  }

  function updateAgente(idx: number, campo: keyof Agente, valor: string) {
    const ag = [...form.agentes];
    ag[idx] = { ...ag[idx], [campo]: valor };
    setForm({ ...form, agentes: ag });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-lg p-8 shadow-xl">
          <div className="h-12 w-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Link inválido</h1>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <TelaSucesso readonly={readonly} status={submission?.status} />;
  }

  const stepKey: StepKey = STEPS[step];
  const progresso = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#E31E24] font-bold text-white flex items-center justify-center text-lg">
              S
            </div>
            <div>
              <div className="text-sm font-bold text-white">SuperVisão</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                Onboarding CRM
              </div>
            </div>
          </div>
          {saving && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="bg-white/10 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="h-full bg-[#E31E24] transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>

        {/* Card do step */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {stepKey === "boas_vindas" && (
            <StepBoasVindas onNext={next} />
          )}
          {stepKey === "nome_unidade" && (
            <StepInputUnico
              titulo="Qual o nome da sua unidade?"
              subtitulo="É o nome que vai aparecer no painel e no Chatwoot."
              icone={<Building2 className="h-6 w-6 text-[#E31E24]" />}
              valor={form.nome_unidade}
              onChange={(v) => setForm({ ...form, nome_unidade: v })}
              placeholder="Ex: Mooca, Penha, São Paulo"
              onNext={next}
              onPrev={prev}
              required
            />
          )}
          {stepKey === "localizacao" && (
            <StepLocalizacao
              cidade={form.cidade}
              estado={form.estado}
              onChange={(cidade, estado) => setForm({ ...form, cidade, estado })}
              onNext={next}
              onPrev={prev}
            />
          )}
          {stepKey === "franqueado" && (
            <StepFranqueado
              nome={form.nome_franqueado}
              email={form.email_franqueado}
              onChange={(nome, email) =>
                setForm({ ...form, nome_franqueado: nome, email_franqueado: email })
              }
              onNext={next}
              onPrev={prev}
            />
          )}
          {stepKey === "telefones" && (
            <StepTelefones
              telFranqueado={form.telefone_franqueado}
              telInbox={form.telefone_inbox}
              onChange={(t1, t2) =>
                setForm({ ...form, telefone_franqueado: t1, telefone_inbox: t2 })
              }
              onNext={next}
              onPrev={prev}
            />
          )}
          {stepKey === "qtd_agentes" && (
            <StepQtdAgentes
              qtd={form.qtd_agentes}
              onChange={updateQtdAgentes}
              onNext={next}
              onPrev={prev}
            />
          )}
          {stepKey === "dados_agentes" && (
            <StepDadosAgentes
              agentes={form.agentes}
              onChange={updateAgente}
              onNext={next}
              onPrev={prev}
            />
          )}
          {stepKey === "observacoes" && (
            <StepInputTextarea
              titulo="Quer adicionar alguma observação?"
              subtitulo="Algo importante que o time precise saber sobre a unidade? (opcional)"
              valor={form.observacoes}
              onChange={(v) => setForm({ ...form, observacoes: v })}
              placeholder="Ex: Já tenho número antigo do WhatsApp, quero migrar..."
              onNext={next}
              onPrev={prev}
            />
          )}
          {stepKey === "revisao" && (
            <StepRevisao
              form={form}
              onPrev={prev}
              onSubmit={submeter}
              saving={saving}
              error={error}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Etapa {step + 1} de {STEPS.length}
        </div>
      </div>
    </div>
  );
}

// =================== STEPS ===================

function StepBoasVindas({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="h-16 w-16 mx-auto bg-gradient-to-br from-[#1B2A4A] to-[#E31E24] rounded-2xl flex items-center justify-center mb-4">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">
        Vamos configurar sua unidade!
      </h1>
      <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
        Em alguns minutos vamos coletar tudo que precisamos pra criar seu painel
        no CRM, configurar o WhatsApp e ativar os acessos do seu time.
      </p>
      <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
        <p className="text-xs uppercase font-bold text-slate-500 mb-2">O que você vai precisar:</p>
        <ul className="text-sm text-slate-700 space-y-1.5">
          <li>📍 Cidade e estado da unidade</li>
          <li>👤 Nome e contato do responsável</li>
          <li>📞 Número de WhatsApp do atendimento</li>
          <li>👥 Lista de atendentes (nome + email)</li>
        </ul>
      </div>
      <Button onClick={onNext} size="lg" className="w-full sm:w-auto">
        Começar
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
      <p className="text-[10px] text-slate-400 mt-3">
        Seu progresso é salvo automaticamente — pode fechar e continuar depois pelo mesmo link.
      </p>
    </div>
  );
}

function StepInputUnico({
  titulo,
  subtitulo,
  icone,
  valor,
  onChange,
  placeholder,
  onNext,
  onPrev,
  required,
}: {
  titulo: string;
  subtitulo: string;
  icone: React.ReactNode;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
  onNext: () => void;
  onPrev: () => void;
  required?: boolean;
}) {
  const podeAvancar = !required || valor.trim().length > 0;
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          {icone}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">{titulo}</h2>
          <p className="text-sm text-slate-600 mt-1">{subtitulo}</p>
        </div>
      </div>
      <Input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="h-12 text-base"
        onKeyDown={(e) => e.key === "Enter" && podeAvancar && onNext()}
      />
      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!podeAvancar}>
          Próximo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepInputTextarea({
  titulo,
  subtitulo,
  valor,
  onChange,
  placeholder,
  onNext,
  onPrev,
}: {
  titulo: string;
  subtitulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">{titulo}</h2>
      <p className="text-sm text-slate-600 mb-6">{subtitulo}</p>
      <Textarea
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="text-base"
      />
      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onNext}>
          Próximo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepLocalizacao({
  cidade,
  estado,
  onChange,
  onNext,
  onPrev,
}: {
  cidade: string;
  estado: string;
  onChange: (cidade: string, estado: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const podeAvancar = cidade.trim().length > 0 && estado.length > 0;
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">📍 Onde fica sua unidade?</h2>
      <p className="text-sm text-slate-600 mb-6">Cidade e estado onde a unidade opera.</p>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Cidade</Label>
          <Input
            value={cidade}
            onChange={(e) => onChange(e.target.value, estado)}
            placeholder="Ex: São Paulo"
            autoFocus
            className="h-12 text-base mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs">Estado</Label>
          <Select value={estado} onValueChange={(v) => onChange(cidade, v)}>
            <SelectTrigger className="h-12 mt-1.5">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_BR.map((uf) => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!podeAvancar}>
          Próximo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepFranqueado({
  nome,
  email,
  onChange,
  onNext,
  onPrev,
}: {
  nome: string;
  email: string;
  onChange: (nome: string, email: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const podeAvancar = nome.trim().length > 0;
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">Sobre você</h2>
          <p className="text-sm text-slate-600 mt-1">Quem é o responsável pela unidade?</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Seu nome completo</Label>
          <Input
            value={nome}
            onChange={(e) => onChange(e.target.value, email)}
            placeholder="Ex: João da Silva"
            autoFocus
            className="h-12 text-base mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs flex items-center gap-1.5">
            <Mail className="h-3 w-3" /> Seu email (opcional)
          </Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => onChange(nome, e.target.value)}
            placeholder="seu@email.com"
            className="h-12 text-base mt-1.5"
          />
        </div>
      </div>
      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!podeAvancar}>
          Próximo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepTelefones({
  telFranqueado,
  telInbox,
  onChange,
  onNext,
  onPrev,
}: {
  telFranqueado: string;
  telInbox: string;
  onChange: (t1: string, t2: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const podeAvancar = telFranqueado.trim().length > 0;
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Phone className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">Telefones</h2>
          <p className="text-sm text-slate-600 mt-1">Whatsapp pessoal e do atendimento.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Seu WhatsApp pessoal</Label>
          <Input
            value={telFranqueado}
            onChange={(e) => onChange(e.target.value, telInbox)}
            placeholder="Ex: (11) 99999-9999"
            autoFocus
            className="h-12 text-base mt-1.5"
          />
          <p className="text-[10px] text-slate-500 mt-1">É pra contato do nosso time com você diretamente.</p>
        </div>
        <div>
          <Label className="text-xs">WhatsApp do atendimento (opcional agora)</Label>
          <Input
            value={telInbox}
            onChange={(e) => onChange(telFranqueado, e.target.value)}
            placeholder="Ex: (11) 3333-3333"
            className="h-12 text-base mt-1.5"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Número que receberá as conversas dos clientes. Pode adicionar depois.
          </p>
        </div>
      </div>
      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!podeAvancar}>
          Próximo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepQtdAgentes({
  qtd,
  onChange,
  onNext,
  onPrev,
}: {
  qtd: number;
  onChange: (n: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <UsersIcon className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">Quantas pessoas vão atender?</h2>
          <p className="text-sm text-slate-600 mt-1">
            Inclua você e todos os atendentes que precisam acessar o CRM.
          </p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl p-6 text-center">
        <div className="text-6xl font-bold text-[#1B2A4A]">{qtd}</div>
        <div className="text-sm text-slate-500 mt-1">
          {qtd === 1 ? "pessoa" : "pessoas"}
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(Math.max(1, qtd - 1))}
            disabled={qtd <= 1}
          >
            −
          </Button>
          <input
            type="range"
            min={1}
            max={15}
            value={qtd}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 max-w-xs accent-[#E31E24]"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(Math.min(15, qtd + 1))}
            disabled={qtd >= 15}
          >
            +
          </Button>
        </div>
      </div>
      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onNext}>
          Próximo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepDadosAgentes({
  agentes,
  onChange,
  onNext,
  onPrev,
}: {
  agentes: Agente[];
  onChange: (idx: number, campo: keyof Agente, valor: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const todosPreenchidos = agentes.every((a) => a.nome.trim() && a.email.trim());
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
        Dados dos atendentes
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Cada pessoa vai receber acesso individual ao CRM.
      </p>
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
        {agentes.map((ag, idx) => (
          <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-[#1B2A4A] text-white font-bold text-xs flex items-center justify-center">
                {idx + 1}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {idx === 0 ? "Você (responsável principal)" : `Atendente ${idx + 1}`}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Nome</Label>
                <Input
                  value={ag.nome}
                  onChange={(e) => onChange(idx, "nome", e.target.value)}
                  placeholder="Nome completo"
                  className="h-10 mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px]">Email</Label>
                <Input
                  type="email"
                  value={ag.email}
                  onChange={(e) => onChange(idx, "email", e.target.value)}
                  placeholder="email@..."
                  className="h-10 mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-[10px]">Perfil</Label>
                <Select
                  value={ag.perfil}
                  onValueChange={(v) => onChange(idx, "perfil", v)}
                >
                  <SelectTrigger className="h-10 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">
                      Administrador (acesso total)
                    </SelectItem>
                    <SelectItem value="agente">
                      Agente (só atende conversas)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!todosPreenchidos}>
          Próximo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepRevisao({
  form,
  onPrev,
  onSubmit,
  saving,
  error,
}: {
  form: {
    nome_unidade: string;
    cidade: string;
    estado: string;
    nome_franqueado: string;
    email_franqueado: string;
    telefone_franqueado: string;
    telefone_inbox: string;
    agentes: Agente[];
    observacoes: string;
  };
  onPrev: () => void;
  onSubmit: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
        Confira tudo antes de enviar
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Veja se as informações estão corretas. Depois de enviar, nosso time
        recebe e começa a configurar tudo.
      </p>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <InfoLinha label="Unidade" valor={form.nome_unidade} />
        <InfoLinha
          label="Localização"
          valor={`${form.cidade} / ${form.estado}`}
        />
        <InfoLinha label="Franqueado" valor={form.nome_franqueado} />
        {form.email_franqueado && (
          <InfoLinha label="Email" valor={form.email_franqueado} />
        )}
        <InfoLinha label="WhatsApp pessoal" valor={form.telefone_franqueado} />
        {form.telefone_inbox && (
          <InfoLinha label="WhatsApp atendimento" valor={form.telefone_inbox} />
        )}
        <div>
          <p className="text-xs uppercase font-bold text-slate-500 mb-2">
            Atendentes ({form.agentes.length})
          </p>
          <div className="space-y-1.5">
            {form.agentes.map((a, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-50 rounded p-2 text-sm"
              >
                <div className="h-6 w-6 rounded-full bg-[#1B2A4A] text-white font-bold text-[10px] flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{a.nome}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {a.email} · {a.perfil}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {form.observacoes && (
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">
              Observações
            </p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded p-2">
              {form.observacoes}
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={onPrev} disabled={saving}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onSubmit} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" /> Enviar tudo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function InfoLinha({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-500">{label}</p>
      <p className="text-sm text-slate-800">{valor}</p>
    </div>
  );
}

function TelaSucesso({
  readonly,
  status,
}: {
  readonly: boolean;
  status?: string;
}) {
  const titulo =
    status === "provisionado"
      ? "Sua unidade já está no ar! 🎉"
      : status === "aprovado"
        ? "Cadastro aprovado!"
        : "Recebemos seus dados! ✅";
  const mensagem =
    status === "provisionado"
      ? "Tudo configurado. Você deve ter recebido um email com seus acessos. Qualquer dúvida, fale com nosso time."
      : status === "aprovado"
        ? "Nosso time validou seus dados e está configurando tudo agora. Em breve você recebe os acessos."
        : "Nosso time recebeu suas informações e vai validar tudo. Em breve entramos em contato pra confirmar e te enviar os acessos.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="h-16 w-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">{titulo}</h1>
        <p className="text-sm text-slate-600 mb-6">{mensagem}</p>
        {readonly && (
          <p className="text-xs text-slate-400">
            Se precisar corrigir alguma informação, entre em contato com nosso time.
          </p>
        )}
      </div>
    </div>
  );
}
