"use client";

import { useState, useEffect } from "react";
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
                Cadastro de Unidade
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
            className="text-[10px] text-slate-400 hover:text-white"
          >
            Recomeçar
          </button>
        </div>

        {/* Progress */}
        <div className="bg-white/10 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="h-full bg-[#E31E24] transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>

        {/* Card do step */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
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

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Etapa {step + 1} de {STEPS.length} · Progresso salvo automaticamente neste navegador
        </div>
      </div>
    </div>
  );
}

// ==================== STEPS ====================

function StepBoasVindas({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-2">
      <div className="h-16 w-16 mx-auto bg-gradient-to-br from-[#1B2A4A] to-[#E31E24] rounded-2xl flex items-center justify-center mb-4">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">
        Bem-vindo ao cadastro da sua unidade!
      </h1>
      <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
        Em alguns minutos coletamos tudo que precisamos pra criar o painel no CRM,
        configurar o WhatsApp e ativar os acessos do seu time.
      </p>
      <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
        <p className="text-xs uppercase font-bold text-slate-500 mb-2">
          Tenha em mãos:
        </p>
        <ul className="text-sm text-slate-700 space-y-1.5">
          <li>🏢 Nome e endereço da unidade</li>
          <li>👤 Seu nome e contato (franqueado)</li>
          <li>📞 Número(s) de WhatsApp da unidade</li>
          <li>👥 Lista de atendentes (nome + email)</li>
        </ul>
      </div>
      <Button onClick={onNext} size="lg" className="w-full sm:w-auto">
        Começar cadastro
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
      <p className="text-[10px] text-slate-400 mt-3">
        Pode fechar e voltar — seu progresso fica salvo neste navegador.
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
  const podeAvancar = telefone.trim().length > 0;
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Phone className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">Seu WhatsApp pessoal</h2>
          <p className="text-sm text-slate-600 mt-1">
            Pra nosso time entrar em contato com você diretamente. Inclua DDD.
          </p>
        </div>
      </div>
      <Input
        value={telefone}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: (11) 99999-9999"
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
        {numeros.map((n, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={n}
              onChange={(e) => onUpdate(idx, e.target.value)}
              placeholder={
                idx === 0 ? "Ex: (11) 3333-3333" : "Outro número..."
              }
              autoFocus={idx === 0}
              className="h-12 text-base flex-1"
            />
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
        ))}
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
            placeholder="@suaunidade"
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
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <UsersIcon className="h-6 w-6 text-[#E31E24]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">
            Quantas pessoas vão atender?
          </h2>
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
