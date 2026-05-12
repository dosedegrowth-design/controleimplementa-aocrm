"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  maskTelefoneBR,
  isTelefoneValido,
  isEmailValido,
  maskInstagram,
  titleCase,
  cleanEmail,
} from "@/lib/format";
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
  Building2,
  User,
  Phone,
  Users as UsersIcon,
  Mail,
  Sparkles,
  Hash,
  MapPin,
  Plus,
  Trash2,
  AtSign,
  Clock,
} from "lucide-react";

interface Agente {
  nome: string;
  email: string;
  perfil: "administrador" | "agente";
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
  "numeros_inbox",
  "atendimento",
  "qtd_agentes",
  "dados_agentes",
  "observacoes",
  "revisao",
] as const;

const STORAGE_KEY = "spv_cadastro_draft_v1";

interface FormState {
  nome_unidade: string;
  cidade: string;
  estado: string;
  endereco_unidade: string;
  nome_franqueado: string;
  email_franqueado: string;
  telefone_franqueado: string;
  numeros_inbox: string[];
  horario_atendimento: string;
  contato_preferencial: string;
  instagram: string;
  qtd_agentes: number;
  agentes: Agente[];
  observacoes: string;
}

const INITIAL: FormState = {
  nome_unidade: "",
  cidade: "",
  estado: "",
  endereco_unidade: "",
  nome_franqueado: "",
  email_franqueado: "",
  telefone_franqueado: "",
  numeros_inbox: [""],
  horario_atendimento: "",
  contato_preferencial: "",
  instagram: "",
  qtd_agentes: 1,
  agentes: [{ nome: "", email: "", perfil: "administrador" }],
  observacoes: "",
};

export function CadastroClient() {
  const [step, setStep] = useState<number>(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hidratado, setHidratado] = useState(false);

  // Hidrata de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm({ ...INITIAL, ...parsed.form });
        setStep(parsed.step || 0);
      }
    } catch {
      // ignora
    }
    setHidratado(true);
  }, []);

  // Persiste em localStorage a cada mudança
  useEffect(() => {
    if (!hidratado) return;
    if (submitted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
  }, [form, step, hidratado, submitted]);

  function next() {
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function prev() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
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

  function addNumeroInbox() {
    setForm({ ...form, numeros_inbox: [...form.numeros_inbox, ""] });
  }
  function rmNumeroInbox(idx: number) {
    const novos = form.numeros_inbox.filter((_, i) => i !== idx);
    setForm({ ...form, numeros_inbox: novos.length > 0 ? novos : [""] });
  }
  function updateNumeroInbox(idx: number, val: string) {
    const novos = [...form.numeros_inbox];
    novos[idx] = val;
    setForm({ ...form, numeros_inbox: novos });
  }

  async function submeter() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nome_unidade: form.nome_unidade,
        cidade: form.cidade,
        estado: form.estado,
        endereco_unidade: form.endereco_unidade,
        nome_franqueado: form.nome_franqueado,
        email_franqueado: form.email_franqueado,
        telefone_franqueado: form.telefone_franqueado,
        numeros_inbox: form.numeros_inbox.filter((n) => n.trim()),
        horario_atendimento: form.horario_atendimento,
        contato_preferencial: form.contato_preferencial,
        instagram: form.instagram,
        agentes: form.agentes.filter((a) => a.nome.trim() && a.email.trim()),
        observacoes: form.observacoes,
      };

      const r = await fetch("/api/cadastro/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Erro ao enviar");
        return;
      }

      // Limpa draft
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <TelaSucesso />;
  }

  if (!hidratado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const stepKey = STEPS[step];
  const progresso = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] flex items-center justify-center p-4 overflow-hidden">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#E30613]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Header com logo real */}
        <div className="flex items-center justify-between mb-7 px-1">
          <div className="flex items-center gap-3">
            <Image
              src="/sv-logo.png"
              alt="SuperVisão"
              width={128}
              height={28}
              priority
              style={{
                height: 28,
                width: "auto",
                filter: "brightness(0) invert(1)",
              }}
            />
            <div
              style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }}
              className="pl-3"
            >
              <div
                className="text-[10px] uppercase tracking-[0.14em] text-slate-300 font-semibold"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                Cadastro de Unidade
              </div>
              <div
                className="text-[9px] text-slate-500 mt-0.5 tracking-wider"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                CRM Oficial
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm("Limpar tudo e recomeçar?")) {
                localStorage.removeItem(STORAGE_KEY);
                setForm(INITIAL);
                setStep(0);
              }
            }}
            className="text-[10px] uppercase tracking-[0.14em] text-slate-400 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            ↻ Recomeçar
          </button>
        </div>

        {/* Progress com label + número da etapa */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              Etapa {step + 1} de {STEPS.length}
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.18em] text-[#E30613] font-bold tabular-nums"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {progresso}%
            </span>
          </div>
          <div className="bg-white/8 rounded-full h-1 overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progresso}%`,
                background:
                  "linear-gradient(90deg, #E30613 0%, #FF3B47 100%)",
                boxShadow: "0 0 12px rgba(227,6,19,0.6)",
              }}
            />
          </div>
        </div>

        {/* Card do step com sombra mais elegante */}
        <div
          className="bg-white rounded-2xl p-6 sm:p-10"
          style={{
            boxShadow:
              "0 30px 80px -20px rgba(0,0,0,0.45), 0 12px 24px -8px rgba(0,0,0,0.2)",
          }}
        >
          {stepKey === "boas_vindas" && <StepBoasVindas onNext={next} />}

          {stepKey === "nome_unidade" && (
            <StepInputUnico
              titulo="Qual o nome da sua unidade?"
              subtitulo="É o nome que vai aparecer no painel e no Chatwoot."
              icone={<Building2 className="h-6 w-6 text-[#E31E24]" />}
              valor={form.nome_unidade}
              onChange={(v) => setForm({ ...form, nome_unidade: v })}
              placeholder="Ex: SuperVisão Mooca"
              onNext={next}
              onPrev={prev}
              required
            />
          )}

          {stepKey === "localizacao" && (
            <StepLocalizacao
              cidade={form.cidade}
              estado={form.estado}
              endereco={form.endereco_unidade}
              onChange={(cidade, estado, endereco) =>
                setForm({ ...form, cidade, estado, endereco_unidade: endereco })
              }
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
            <StepTelefoneFranqueado
              telefone={form.telefone_franqueado}
              onChange={(t) => setForm({ ...form, telefone_franqueado: t })}
              onNext={next}
              onPrev={prev}
            />
          )}

          {stepKey === "numeros_inbox" && (
            <StepNumerosInbox
              numeros={form.numeros_inbox}
              onAdd={addNumeroInbox}
              onRemove={rmNumeroInbox}
              onUpdate={updateNumeroInbox}
              onNext={next}
              onPrev={prev}
            />
          )}

          {stepKey === "atendimento" && (
            <StepAtendimento
              horario={form.horario_atendimento}
              contato={form.contato_preferencial}
              instagram={form.instagram}
              onChange={(h, c, i) =>
                setForm({
                  ...form,
                  horario_atendimento: h,
                  contato_preferencial: c,
                  instagram: i,
                })
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
              subtitulo="Algo importante que o time precise saber? Por exemplo: nº WhatsApp já em uso, prazo desejado, integrações específicas... (opcional)"
              valor={form.observacoes}
              onChange={(v) => setForm({ ...form, observacoes: v })}
              placeholder="Ex: Já tenho número antigo no WhatsApp Business, quero migrar..."
              onNext={next}
              onPrev={prev}
            />
          )}

          {stepKey === "revisao" && (
            <StepRevisao
              form={form}
              onPrev={prev}
              onSubmit={submeter}
              submitting={submitting}
              error={error}
            />
          )}
        </div>

        {/* Footer minimalista */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-slate-500">
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
          <span
            className="uppercase tracking-[0.14em] font-medium"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Progresso salvo automaticamente
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== STEPS ====================

function StepBoasVindas({ onNext }: { onNext: () => void }) {
  const checklist = [
    {
      label: "Nome e endereço da unidade",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V7l7-4 7 4v14" />
          <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
        </svg>
      ),
    },
    {
      label: "Seu nome e contato (franqueado)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      ),
    },
    {
      label: "Número(s) de WhatsApp da unidade",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      label: "Lista de atendentes (nome + email)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <div className="py-2">
      {/* Eyebrow */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#E30613] animate-pulse" />
        <span
          className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#E30613]"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          Bem-vindo
        </span>
      </div>

      {/* Headline em Archivo display */}
      <h1
        className="text-[28px] sm:text-[36px] font-bold text-[#1B2A4A] leading-[1.05] tracking-tight text-center mx-auto max-w-lg"
        style={{ fontFamily: "var(--font-archivo), 'Inter Tight', sans-serif" }}
      >
        Vamos configurar a sua{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #E30613 0%, #A30309 60%, #1B2A4A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          unidade
        </span>
        .
      </h1>

      <p className="text-[15px] text-slate-600 mt-4 max-w-md mx-auto text-center leading-relaxed">
        Em ~5 minutos coletamos tudo que precisamos pra criar o painel,
        configurar seu WhatsApp e liberar os acessos do time.
      </p>

      {/* Card "Tenha em mãos" — refinado */}
      <div
        className="mt-8 rounded-xl border border-slate-200 bg-white"
        style={{
          boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
        }}
      >
        <div
          className="px-5 py-3 border-b border-slate-100 flex items-center gap-2"
          style={{ background: "#F8FAFC" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <path d="m5 12 5 5L20 7" />
          </svg>
          <span
            className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-500"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Tenha em mãos
          </span>
        </div>
        <ul className="divide-y divide-slate-100">
          {checklist.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-5 py-3 text-[14px] text-slate-700"
            >
              <span
                className="h-8 w-8 rounded-lg bg-[#FEE2E4] text-[#E30613] flex items-center justify-center shrink-0"
                style={{ boxShadow: "inset 0 0 0 1px rgba(227,6,19,0.08)" }}
              >
                <span style={{ width: 16, height: 16, display: "block" }}>
                  {item.icon}
                </span>
              </span>
              <span className="font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA grandão estilo .btn-red */}
      <button
        onClick={onNext}
        className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-white font-semibold text-[15px] tracking-tight transition-all hover:-translate-y-0.5"
        style={{
          background: "#E30613",
          boxShadow: "0 12px 28px -8px rgba(227,6,19,0.5)",
          fontFamily: "var(--font-inter-tight), sans-serif",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#C40510";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 18px 36px -10px rgba(227,6,19,0.6)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#E30613";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 12px 28px -8px rgba(227,6,19,0.5)";
        }}
      >
        Começar cadastro
        <ArrowRight className="h-4 w-4" />
      </button>

      <p
        className="text-center mt-4 text-[10px] uppercase tracking-[0.14em] text-slate-400"
        style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
      >
        ↻ Pode fechar e voltar — progresso salvo
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
  endereco,
  onChange,
  onNext,
  onPrev,
}: {
  cidade: string;
  estado: string;
  endereco: string;
  onChange: (cidade: string, estado: string, endereco: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const podeAvancar = cidade.trim().length > 0 && estado.length > 0;
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <MapPin className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">Onde fica sua unidade?</h2>
          <p className="text-sm text-slate-600 mt-1">Cidade, estado e endereço.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Label className="text-xs">Cidade</Label>
            <Input
              value={cidade}
              onChange={(e) => onChange(e.target.value, estado, endereco)}
              placeholder="Ex: São Paulo"
              autoFocus
              className="h-12 text-base mt-1.5"
            />
          </div>
          <div>
            <Label className="text-xs">Estado</Label>
            <Select value={estado} onValueChange={(v) => onChange(cidade, v, endereco)}>
              <SelectTrigger className="h-12 mt-1.5"><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>
                {ESTADOS_BR.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs">Endereço completo (opcional)</Label>
          <Input
            value={endereco}
            onChange={(e) => onChange(cidade, estado, e.target.value)}
            placeholder="Ex: Rua das Vistorias, 123 — Bairro"
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
          <p className="text-sm text-slate-600 mt-1">Quem é o franqueado responsável?</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Seu nome completo</Label>
          <Input
            value={nome}
            onChange={(e) => onChange(e.target.value, email)}
            onBlur={(e) => onChange(titleCase(e.target.value), email)}
            placeholder="Ex: João da Silva"
            autoCapitalize="words"
            autoComplete="name"
            autoFocus
            className="h-12 text-base mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs flex items-center gap-1.5">
            <Mail className="h-3 w-3" /> Seu email (opcional)
          </Label>
          <div className="relative">
            <Input
              type="email"
              value={email}
              onChange={(e) => onChange(nome, e.target.value)}
              onBlur={(e) => onChange(nome, cleanEmail(e.target.value))}
              placeholder="seu@email.com"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              className={`h-12 text-base mt-1.5 pr-10 lowercase ${
                email && !isEmailValido(email)
                  ? "border-amber-300"
                  : ""
              } ${isEmailValido(email) ? "border-emerald-300" : ""}`}
            />
            {email.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5">
                {isEmailValido(email) ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                )}
              </span>
            )}
          </div>
          {email && !isEmailValido(email) && (
            <p className="text-[11px] text-amber-600 mt-1.5">
              Verifica o email — formato esperado nome@dominio.com
            </p>
          )}
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

function StepTelefoneFranqueado({
  telefone,
  onChange,
  onNext,
  onPrev,
}: {
  telefone: string;
  onChange: (t: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const valido = isTelefoneValido(telefone);
  const tocado = telefone.length > 0;
  const podeAvancar = valido;

  function handleChange(raw: string) {
    onChange(maskTelefoneBR(raw));
  }

  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Phone className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">Seu WhatsApp pessoal</h2>
          <p className="text-sm text-slate-600 mt-1">
            Pra nosso time entrar em contato com você diretamente.
          </p>
        </div>
      </div>
      <div className="relative">
        <Input
          value={telefone}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="(11) 99999-9999"
          autoFocus
          inputMode="tel"
          autoComplete="tel"
          maxLength={16}
          className={`h-14 text-base pl-4 pr-12 tabular-nums tracking-wide font-medium ${
            tocado && !valido ? "border-red-400 focus-visible:ring-red-300" : ""
          } ${valido ? "border-emerald-400 focus-visible:ring-emerald-300" : ""}`}
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          onKeyDown={(e) => e.key === "Enter" && podeAvancar && onNext()}
        />
        {/* Status icon à direita */}
        {tocado && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {valido ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            )}
          </span>
        )}
      </div>
      {/* Hint dinâmica */}
      <p
        className={`text-[11px] mt-2 transition-colors ${
          tocado && !valido
            ? "text-amber-600"
            : valido
              ? "text-emerald-600"
              : "text-slate-500"
        }`}
      >
        {!tocado && "💡 Inclua DDD. A máscara já formata pra você."}
        {tocado && !valido && "Faltam dígitos — número precisa ter DDD + 8 ou 9 dígitos"}
        {valido && "✓ Número válido"}
      </p>
      <div className="flex justify-between gap-3 mt-8">
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

function StepNumerosInbox({
  numeros,
  onAdd,
  onRemove,
  onUpdate,
  onNext,
  onPrev,
}: {
  numeros: string[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Hash className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">
            Número(s) de WhatsApp da unidade
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Que vão ser conectados no CRM. Pode adicionar quantos quiser (uma linha
            por número).
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {numeros.map((n, idx) => {
          const valido = isTelefoneValido(n);
          const tocado = n.length > 0;
          return (
          <div key={idx} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={n}
                onChange={(e) => onUpdate(idx, maskTelefoneBR(e.target.value))}
                placeholder={
                  idx === 0 ? "(11) 3333-3333" : "Outro número..."
                }
                autoFocus={idx === 0}
                inputMode="tel"
                autoComplete="off"
                maxLength={16}
                className={`h-12 text-base tabular-nums pr-10 ${
                  tocado && !valido ? "border-amber-300" : ""
                } ${valido ? "border-emerald-300" : ""}`}
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              />
              {tocado && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {valido ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  )}
                </span>
              )}
            </div>
            {numeros.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(idx)}
                className="h-12 w-12 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="w-full"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar outro número
        </Button>
      </div>
      <p className="text-[10px] text-slate-500 mt-3">
        💡 Se ainda não tem o número, deixe em branco e adicione depois. Mas tenta enviar pelo menos 1.
      </p>
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

function StepAtendimento({
  horario,
  contato,
  instagram,
  onChange,
  onNext,
  onPrev,
}: {
  horario: string;
  contato: string;
  instagram: string;
  onChange: (h: string, c: string, i: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Clock className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">Como funciona o atendimento?</h2>
          <p className="text-sm text-slate-600 mt-1">
            Algumas infos extras pra configurar o painel direitinho (opcional).
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Horário de atendimento
          </Label>
          <Input
            value={horario}
            onChange={(e) => onChange(e.target.value, contato, instagram)}
            placeholder="Ex: Seg a Sex 9h-18h, Sáb 9h-13h"
            className="h-12 text-base mt-1.5"
            autoFocus
          />
        </div>
        <div>
          <Label className="text-xs flex items-center gap-1.5">
            <Phone className="h-3 w-3" /> Canal de contato preferencial pra suporte
          </Label>
          <Select
            value={contato}
            onValueChange={(v) => onChange(horario, v, instagram)}
          >
            <SelectTrigger className="h-12 mt-1.5">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="telefone">Ligação telefônica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs flex items-center gap-1.5">
            <AtSign className="h-3 w-3" /> Instagram da unidade (opcional)
          </Label>
          <Input
            value={instagram}
            onChange={(e) => onChange(horario, contato, e.target.value)}
            onBlur={(e) => onChange(horario, contato, maskInstagram(e.target.value))}
            placeholder="@suaunidade"
            autoCapitalize="off"
            autoComplete="off"
            className="h-12 text-base mt-1.5"
          />
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
  // Avatares fake (iniciais) — letras viram dots
  const initials = "ABCDEFGHIJKLMNO".slice(0, qtd).split("");
  const avatarColors = [
    "#E30613",
    "#1B2A4A",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#A855F7",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#EF4444",
    "#14B8A6",
    "#8B5CF6",
    "#F97316",
    "#0EA5E9",
    "#22C55E",
  ];

  return (
    <div>
      {/* Header com ícone discreto */}
      <div className="flex items-start gap-3 mb-2">
        <span
          className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#E30613]"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          ● Sua equipe
        </span>
      </div>
      <h2
        className="text-2xl sm:text-[28px] font-bold text-[#1B2A4A] leading-tight tracking-tight"
        style={{ fontFamily: "var(--font-archivo), 'Inter Tight', sans-serif" }}
      >
        Quantas pessoas vão atender?
      </h2>
      <p className="text-sm text-slate-600 mt-2 max-w-md">
        Inclua você e todos os atendentes que precisam acessar o CRM. Você pode
        ajustar depois.
      </p>

      {/* NÚMERO GRANDE EM DISPLAY */}
      <div className="mt-8 mb-2 flex items-baseline justify-center gap-3">
        <span
          className="text-[88px] sm:text-[112px] font-bold leading-none tabular-nums"
          style={{
            fontFamily:
              "var(--font-archivo), 'Inter Tight', sans-serif",
            letterSpacing: "-0.06em",
            background:
              "linear-gradient(135deg, #1B2A4A 0%, #E30613 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {qtd}
        </span>
        <span
          className="text-sm text-slate-500 uppercase tracking-[0.14em] font-semibold pb-3"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          {qtd === 1 ? "pessoa" : "pessoas"}
        </span>
      </div>

      {/* AVATARES VISUAIS — feedback visual da quantidade */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-7 min-h-[36px]">
        {initials.map((letter, i) => (
          <div
            key={i}
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold transition-all"
            style={{
              background: avatarColors[i % avatarColors.length],
              fontFamily:
                "var(--font-archivo), 'Inter Tight', sans-serif",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              animation: `dotIn 0.3s ease-out ${i * 30}ms backwards`,
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* CONTROLES — − slider + */}
      <div className="flex items-center gap-3 max-w-md mx-auto">
        <button
          onClick={() => onChange(Math.max(1, qtd - 1))}
          disabled={qtd <= 1}
          aria-label="Diminuir"
          className="h-11 w-11 rounded-full bg-white border border-slate-200 text-[#1B2A4A] font-bold text-lg flex items-center justify-center hover:border-[#E30613] hover:text-[#E30613] hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>
        <div className="flex-1 relative">
          <input
            type="range"
            min={1}
            max={15}
            value={qtd}
            onChange={(e) => onChange(parseInt(e.target.value))}
            aria-label="Quantidade de atendentes"
            className="w-full cadastro-range"
            style={{ accentColor: "#E30613" }}
          />
          {/* Marcadores */}
          <div className="flex justify-between mt-1 px-0.5">
            {[1, 5, 10, 15].map((n) => (
              <span
                key={n}
                className={`text-[9px] tabular-nums ${
                  qtd >= n ? "text-[#E30613] font-bold" : "text-slate-400"
                }`}
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => onChange(Math.min(15, qtd + 1))}
          disabled={qtd >= 15}
          aria-label="Aumentar"
          className="h-11 w-11 rounded-full bg-[#E30613] text-white font-bold text-lg flex items-center justify-center hover:bg-[#C40510] hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{ boxShadow: "0 4px 12px -2px rgba(227,6,19,0.35)" }}
        >
          +
        </button>
      </div>

      {/* Hint dinâmica */}
      <p className="text-center text-[11px] text-slate-500 mt-5">
        {qtd <= 2 && "Operação enxuta — pode crescer depois ✨"}
        {qtd > 2 && qtd <= 6 && "Time pequeno e ágil 🚀"}
        {qtd > 6 && qtd <= 10 && "Operação consolidada 💪"}
        {qtd > 10 && "Time robusto — perfeito pra escalar 🔥"}
      </p>

      <div className="flex justify-between gap-3 mt-10">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onNext}>
          Próximo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes dotIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .cadastro-range {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #e2e8f0;
          border-radius: 999px;
          outline: none;
        }
        .cadastro-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          background: #ffffff;
          border: 3px solid #e30613;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px -2px rgba(227, 6, 19, 0.4);
          transition: transform 0.15s ease;
        }
        .cadastro-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .cadastro-range::-moz-range-thumb {
          width: 22px;
          height: 22px;
          background: #ffffff;
          border: 3px solid #e30613;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px -2px rgba(227, 6, 19, 0.4);
        }
      `}</style>
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
  const todosPreenchidos = agentes.every(
    (a) => a.nome.trim() && a.email.trim(),
  );
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
        Dados dos atendentes
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Cada pessoa recebe acesso individual ao CRM. Use email que a pessoa realmente
        usa.
      </p>
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
        {agentes.map((ag, idx) => (
          <div
            key={idx}
            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-[#1B2A4A] text-white font-bold text-xs flex items-center justify-center">
                {idx + 1}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {idx === 0
                  ? "Responsável principal"
                  : `Atendente ${idx + 1}`}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Nome</Label>
                <Input
                  value={ag.nome}
                  onChange={(e) => onChange(idx, "nome", e.target.value)}
                  onBlur={(e) => onChange(idx, "nome", titleCase(e.target.value))}
                  placeholder="Nome completo"
                  autoCapitalize="words"
                  autoComplete="off"
                  className="h-10 mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px]">Email</Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={ag.email}
                    onChange={(e) => onChange(idx, "email", e.target.value)}
                    onBlur={(e) => onChange(idx, "email", cleanEmail(e.target.value))}
                    placeholder="email@..."
                    inputMode="email"
                    autoComplete="off"
                    autoCapitalize="off"
                    className={`h-10 mt-1 pr-8 lowercase ${
                      ag.email && !isEmailValido(ag.email)
                        ? "border-amber-300"
                        : ""
                    } ${isEmailValido(ag.email) ? "border-emerald-300" : ""}`}
                  />
                  {ag.email.length > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5">
                      {isEmailValido(ag.email) ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5L20 7" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4M12 16h.01" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
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
                      Administrador (acesso total ao CRM)
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
  submitting,
  error,
}: {
  form: FormState;
  onPrev: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
        Confira tudo antes de enviar
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Verifica se tá tudo certo. Depois de enviar, nosso time recebe e começa a
        configurar.
      </p>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <InfoLinha label="Unidade" valor={form.nome_unidade} />
        <InfoLinha
          label="Localização"
          valor={`${form.cidade} / ${form.estado}`}
        />
        {form.endereco_unidade && (
          <InfoLinha label="Endereço" valor={form.endereco_unidade} />
        )}
        <InfoLinha label="Franqueado" valor={form.nome_franqueado} />
        {form.email_franqueado && (
          <InfoLinha label="Email" valor={form.email_franqueado} />
        )}
        <InfoLinha label="WhatsApp pessoal" valor={form.telefone_franqueado} />
        {form.numeros_inbox.some((n) => n.trim()) && (
          <InfoLinha
            label="Números da unidade"
            valor={form.numeros_inbox.filter((n) => n.trim()).join(", ")}
          />
        )}
        {form.horario_atendimento && (
          <InfoLinha label="Horário" valor={form.horario_atendimento} />
        )}
        {form.contato_preferencial && (
          <InfoLinha label="Contato preferencial" valor={form.contato_preferencial} />
        )}
        {form.instagram && (
          <InfoLinha label="Instagram" valor={form.instagram} />
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
        <Button variant="ghost" onClick={onPrev} disabled={submitting}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={onSubmit} disabled={submitting} size="lg">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" /> Enviar cadastro
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

function TelaSucesso() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="h-16 w-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">
          Recebemos seu cadastro! 🎉
        </h1>
        <p className="text-sm text-slate-600 mb-2">
          Nossa equipe vai validar tudo e configurar seu painel no CRM,
          WhatsApp e acessos.
        </p>
        <p className="text-sm text-slate-600 mb-6">
          Em breve entramos em contato pelo WhatsApp que você cadastrou. ✨
        </p>
        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
          Dúvidas? Fale com a Matriz SuperVisão.
        </div>
      </div>
    </div>
  );
}
