"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Inbox,
  Kanban,
  Users as UsersIcon,
  Calendar,
  BarChart3,
  Tag,
  Sparkles,
  Phone,
  Search,
  Activity,
  Smartphone,
  ChevronDown,
  Menu,
  X,
  Zap,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";

const CTA_CADASTRO = "/cadastro";

export function CrmLanding() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />
      <Hero />
      <BadgeRede />
      <Problema />
      <Solucao />
      <Features />
      <Demo />
      <ParaQuem />
      <ComoFunciona />
      <SoffiaTeaser />
      <Numeros />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  );
}

// ============================== NAVBAR ==============================
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/crm" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#E31E24] font-bold text-white flex items-center justify-center">
            S
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-[#1B2A4A]">SuperVisão</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              CRM Oficial
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
          <a href="#problema" className="hover:text-[#1B2A4A]">Por quê</a>
          <a href="#features" className="hover:text-[#1B2A4A]">Recursos</a>
          <a href="#como-funciona" className="hover:text-[#1B2A4A]">Como funciona</a>
          <a href="#faq" className="hover:text-[#1B2A4A]">FAQ</a>
          <Link
            href="/login"
            className="text-slate-500 hover:text-[#1B2A4A] text-xs"
          >
            Já sou cliente →
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={CTA_CADASTRO}
            className="bg-[#E31E24] text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#C41A1F] transition-colors"
          >
            Cadastrar unidade
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 text-sm">
            <a href="#problema" onClick={() => setOpen(false)}>Por quê</a>
            <a href="#features" onClick={() => setOpen(false)}>Recursos</a>
            <a href="#como-funciona" onClick={() => setOpen(false)}>Como funciona</a>
            <a href="#faq" onClick={() => setOpen(false)}>FAQ</a>
            <Link href="/login" onClick={() => setOpen(false)}>
              Já sou cliente
            </Link>
            <Link
              href={CTA_CADASTRO}
              className="bg-[#E31E24] text-white font-semibold px-4 py-2 rounded-lg text-center"
            >
              Cadastrar unidade
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ============================== HERO ==============================
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] text-white">
      {/* Glow decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#E31E24]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Texto */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              CRM oficial da rede SuperVisão
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Pare de perder cliente no <span className="text-[#E31E24]">WhatsApp</span>.
            </h1>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-xl">
              Centralize, organize e venda mais com o painel oficial da rede.
              Multi-atendente, kanban de vendas, agenda integrada e relatórios
              em tempo real — tudo num lugar só.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={CTA_CADASTRO}
                className="inline-flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#C41A1F] text-white font-semibold px-6 py-3.5 rounded-lg transition-colors shadow-lg shadow-red-500/30"
              >
                Cadastrar minha unidade
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-lg transition-colors"
              >
                Ver demonstração
              </a>
            </div>
            <div className="mt-8 flex items-center gap-5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Sem instalação
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Configuração em ~2 dias
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Treinamento incluso
              </div>
            </div>
          </div>

          {/* Mockup ilustrativo */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                <div className="flex-1 text-center text-[10px] text-slate-400">
                  controleimplementa-aocrm.vercel.app
                </div>
              </div>
              {/* Mini kanban mockup */}
              <div className="bg-white rounded-lg p-3 grid grid-cols-3 gap-2">
                <KanbanCol titulo="Lead" cor="#3B82F6" cards={3} />
                <KanbanCol titulo="Interesse" cor="#F59E0B" cards={5} />
                <KanbanCol titulo="Fechado" cor="#10B981" cards={2} />
              </div>
              <div className="bg-white rounded-lg mt-2 p-3 grid grid-cols-3 gap-2">
                <MiniKpi label="Hoje" valor="14" cor="text-blue-600" />
                <MiniKpi label="Esta semana" valor="58" cor="text-emerald-600" />
                <MiniKpi label="Convertidos" valor="22%" cor="text-[#1B2A4A]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KanbanCol({ titulo, cor, cards }: { titulo: string; cor: string; cards: number }) {
  return (
    <div className="bg-slate-50 rounded p-2">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: cor }} />
        <span className="text-[9px] font-bold uppercase text-slate-500">{titulo}</span>
      </div>
      <div className="space-y-1">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="bg-white rounded border border-slate-200 p-1.5">
            <div className="h-1.5 w-2/3 bg-slate-300 rounded mb-1" />
            <div className="h-1 w-1/2 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniKpi({ label, valor, cor }: { label: string; valor: string; cor: string }) {
  return (
    <div>
      <div className={`text-2xl font-bold ${cor}`}>{valor}</div>
      <div className="text-[9px] uppercase font-medium text-slate-500">{label}</div>
    </div>
  );
}

// ============================== BADGE REDE ==============================
function BadgeRede() {
  return (
    <section className="py-8 border-b border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs uppercase tracking-wider text-slate-500 font-medium mb-4">
          Já em uso em unidades da rede
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-semibold text-slate-400">
          <span>Mooca</span>
          <span className="text-slate-200">·</span>
          <span>Penha</span>
          <span className="text-slate-200">·</span>
          <span>Butantã</span>
          <span className="text-slate-200">·</span>
          <span>Morumbi</span>
          <span className="text-slate-200">·</span>
          <span>Vila Leopoldina</span>
          <span className="text-slate-200">·</span>
          <span>Barueri</span>
          <span className="text-slate-200">·</span>
          <span>Itajaí</span>
          <span className="text-slate-200">·</span>
          <span>Araras</span>
          <span className="text-slate-200">·</span>
          <span className="text-[#E31E24]">+16 unidades</span>
        </div>
      </div>
    </section>
  );
}

// ============================== PROBLEMA ==============================
function Problema() {
  const dores = [
    {
      icon: Smartphone,
      titulo: "WhatsApp lotado, atendente perdido",
      desc: "Cada vendedor tem o próprio celular, conversas espalhadas. Quando a pessoa sai, o cliente vai junto.",
    },
    {
      icon: Search,
      titulo: "Sem saber em que pé tá cada cliente",
      desc: "Pergunta no grupo \"alguém atendeu o fulano?\" e ninguém sabe responder. Lead some no meio do caos.",
    },
    {
      icon: Activity,
      titulo: "Cliente sumiu sem ninguém perceber",
      desc: "Sem follow-up automático, oportunidade evapora. Você só descobre quando recebe a reclamação do concorrente fechar com ele.",
    },
    {
      icon: BarChart3,
      titulo: "Vendedor diz que vendeu, você acredita?",
      desc: "Sem números reais, fica tudo no \"achismo\". Quem é o melhor vendedor? Quem precisa de treinamento? Ninguém sabe.",
    },
  ];
  return (
    <section id="problema" className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-red-50 text-[#E31E24] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Se identifica?
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] leading-tight">
            Esses problemas estão custando vendas da sua unidade
          </h2>
          <p className="mt-4 text-slate-600">
            Atender no WhatsApp comum funciona até a unidade crescer. Aí vira
            caos.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {dores.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.titulo}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-red-300 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-[#E31E24]" />
                </div>
                <h3 className="font-bold text-[#1B2A4A] text-lg mb-1.5">
                  {d.titulo}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{d.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================== SOLUÇÃO ==============================
function Solucao() {
  return (
    <section className="py-20 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            A virada
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] leading-tight">
            Um único painel pra todo o atendimento da unidade
          </h2>
          <p className="mt-4 text-slate-600">
            O CRM SuperVisão centraliza WhatsApp, controle de vendas, agenda e
            relatórios. Você vê tudo em tempo real.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Antes */}
          <div className="bg-white border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="font-bold text-red-900">Antes (sem CRM)</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {[
                "1 WhatsApp por atendente, sem visibilidade",
                "Controle de vendas em planilha que ninguém atualiza",
                "Cliente esquecido, sem follow-up automático",
                "Cliente recebe atendimento duplicado",
                "Sem números do time comercial",
                "Quando atendente sai, leva contatos com ele",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0 mt-0.5">✗</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Depois */}
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-emerald-900">Com CRM SuperVisão</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {[
                "Caixa única com todas as conversas da unidade",
                "Kanban visual mostra em que etapa cada cliente está",
                "Etiquetas e automação categorizam sozinho",
                "Atribuição automática — sem atendimento duplicado",
                "Relatórios mostram quem está vendendo e quanto",
                "Contatos ficam da unidade, não do atendente",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================== FEATURES ==============================
function Features() {
  const features = [
    {
      icon: Inbox,
      titulo: "Caixa de entrada unificada",
      desc: "Todas as conversas dos WhatsApp da unidade num só lugar. Multi-atendente com permissões individuais.",
    },
    {
      icon: Kanban,
      titulo: "Kanban de vendas visual",
      desc: "Lead → Interesse → Qualificado → Agendado → Fechado. Arrasta e solta, vê funil real em tempo real.",
    },
    {
      icon: UsersIcon,
      titulo: "Multi-atendente com controle",
      desc: "Admin, agente, gestor. Cada perfil vê o que precisa ver. Atribuição automática evita duplicação.",
    },
    {
      icon: Calendar,
      titulo: "Agenda integrada",
      desc: "Agendamentos confirmados pelo bot, lembretes automáticos, redução de no-show.",
    },
    {
      icon: BarChart3,
      titulo: "Relatórios em tempo real",
      desc: "Quantos leads hoje, taxa de conversão, ticket médio, ranking de vendedores. Dashboard executivo.",
    },
    {
      icon: Tag,
      titulo: "Etiquetas e automação",
      desc: "Categoriza cliente sozinho (vistoria cautelar, transferência, moto, etc). Time foca em vender.",
    },
  ];
  return (
    <section id="features" className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-[#1B2A4A]/5 text-[#1B2A4A] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Recursos
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] leading-tight">
            Tudo que sua unidade precisa em um único painel
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.titulo}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-[#1B2A4A]/30 transition-all"
              >
                <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-[#1B2A4A] to-[#243556] flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-[#1B2A4A] text-lg mb-2">
                  {f.titulo}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================== DEMO ==============================
function Demo() {
  return (
    <section id="demo" className="py-20 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] leading-tight">
            É assim que sua unidade vai parecer
          </h2>
          <p className="mt-4 text-slate-600">
            Painel real — não é mockup. Cada card é um cliente, cada coluna é
            uma etapa de venda.
          </p>
        </div>

        {/* Frame "navegador" com painel */}
        <div className="bg-[#1B2A4A] rounded-2xl p-3 shadow-2xl max-w-5xl mx-auto">
          <div className="flex items-center gap-1.5 px-2 py-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
            <div className="h-3 w-3 rounded-full bg-emerald-400/60" />
            <div className="ml-3 text-[11px] text-slate-300">
              controleimplementa-aocrm.vercel.app
            </div>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-6">
            {/* Header simulado */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#1B2A4A] text-lg">Centro de Controle</h3>
                <p className="text-xs text-slate-500">SuperVisão Mooca</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs">
                  📅 Hoje
                </div>
              </div>
            </div>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <DemoKpi label="Leads hoje" valor="14" trend="+3" />
              <DemoKpi label="Em andamento" valor="28" trend="+5" />
              <DemoKpi label="Agendados" valor="12" trend="+2" />
              <DemoKpi label="Fechados" valor="7" trend="+1" />
            </div>
            {/* Kanban */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { titulo: "Lead", cor: "#3B82F6", n: 14 },
                { titulo: "Interesse", cor: "#F59E0B", n: 9 },
                { titulo: "Qualificado", cor: "#A855F7", n: 6 },
                { titulo: "Agendado", cor: "#06B6D4", n: 12 },
                { titulo: "Fechado", cor: "#10B981", n: 7 },
              ].map((c) => (
                <div key={c.titulo} className="bg-white rounded p-2 border border-slate-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: c.cor }} />
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      {c.titulo}
                    </span>
                    <span className="ml-auto text-[9px] font-bold text-slate-400">{c.n}</span>
                  </div>
                  <div className="space-y-1.5">
                    {Array.from({ length: Math.min(c.n, 4) }).map((_, i) => (
                      <div key={i} className="bg-slate-50 rounded p-1.5 border border-slate-100">
                        <div className="h-1.5 w-3/4 bg-slate-300 rounded mb-1" />
                        <div className="h-1 w-1/2 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoKpi({ label, valor, trend }: { label: string; valor: string; trend: string }) {
  return (
    <div className="bg-white rounded p-2 border border-slate-200">
      <div className="text-[9px] uppercase font-bold text-slate-500">{label}</div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-xl font-bold text-[#1B2A4A]">{valor}</span>
        <span className="text-[9px] text-emerald-600 font-bold">{trend}</span>
      </div>
    </div>
  );
}

// ============================== PARA QUEM ==============================
function ParaQuem() {
  const perfis = [
    {
      titulo: "Franqueado",
      desc: "Quer ver tudo em tempo real, sem depender de relatório semanal. Saber quanto a unidade tá produzindo agora.",
      icon: TrendingUp,
    },
    {
      titulo: "Time Comercial",
      desc: "Quer focar em vender, não em organizar planilha. Sistema empurra cliente na fila certa.",
      icon: Zap,
    },
    {
      titulo: "Atendente",
      desc: "Quer abrir o painel e já saber quem responder primeiro. Atribuição automática, sem confusão.",
      icon: Phone,
    },
    {
      titulo: "Gestor",
      desc: "Quer relatórios reais pra tomar decisão. Quem performa, quem precisa treinar, onde tá o gargalo.",
      icon: BarChart3,
    },
  ];
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] leading-tight">
            Pensado pra cada papel da unidade
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perfis.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.titulo}
                className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-5"
              >
                <div className="h-9 w-9 rounded-lg bg-[#E31E24]/10 flex items-center justify-center mb-3">
                  <Icon className="h-4.5 w-4.5 text-[#E31E24]" />
                </div>
                <h3 className="font-bold text-[#1B2A4A] mb-2">{p.titulo}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================== COMO FUNCIONA ==============================
function ComoFunciona() {
  const passos = [
    {
      n: "1",
      titulo: "Você cadastra a unidade",
      desc: "Preenche um formulário rápido com dados da unidade e do time. Leva ~5 minutos.",
      tempo: "5 min",
    },
    {
      n: "2",
      titulo: "A gente configura tudo",
      desc: "Criamos painel, conectamos WhatsApp, cadastramos atendentes, montamos funil e etiquetas.",
      tempo: "~2 dias",
    },
    {
      n: "3",
      titulo: "Treinamos seu time",
      desc: "Reunião ao vivo (1h) ensinando o time a usar. Suporte direto via grupo de WhatsApp.",
      tempo: "1 hora",
    },
    {
      n: "4",
      titulo: "Sua unidade começa a vender melhor",
      desc: "Time foca em conversar, sistema cuida do controle. Métricas começam a chegar no dia 1.",
      tempo: "Dia 1",
    },
  ];
  return (
    <section id="como-funciona" className="py-20 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-[#1B2A4A]/5 text-[#1B2A4A] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Processo simples
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] leading-tight">
            Em poucos dias sua unidade tá no ar
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {passos.map((p, i) => (
            <div key={p.n} className="relative">
              <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#E31E24] text-white font-bold flex items-center justify-center">
                    {p.n}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.tempo}
                  </span>
                </div>
                <h3 className="font-bold text-[#1B2A4A] mb-1.5">{p.titulo}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
              {i < passos.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 h-5 w-5 text-slate-300 -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href={CTA_CADASTRO}
            className="inline-flex items-center gap-2 bg-[#E31E24] hover:bg-[#C41A1F] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Começar agora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================== SOFFIA TEASER ==============================
function SoffiaTeaser() {
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-br from-[#1B2A4A] to-[#111D35] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E31E24]/20 text-[#E31E24] border border-[#E31E24]/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="h-3 w-3" />
              Em breve
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              E quando sua unidade crescer, a <span className="text-[#E31E24]">Soffia</span> entra em cena.
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              Nossa IA treinada com tudo da SuperVisão atende 24/7, qualifica
              leads, agenda vistorias e passa pro humano só quando precisa.
              Conecta direto no mesmo painel que você já vai estar usando.
            </p>
            <div className="space-y-2.5 text-sm text-slate-300">
              <SoffiaItem>Atende cliente fora do horário comercial</SoffiaItem>
              <SoffiaItem>Filtra leads frios — humano só pega quem tá quente</SoffiaItem>
              <SoffiaItem>Agenda vistorias automaticamente</SoffiaItem>
              <SoffiaItem>Aprende com sua unidade, fala como sua unidade</SoffiaItem>
            </div>
            <a
              href="https://soffiaiasupervisao.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#E31E24] hover:underline font-semibold"
            >
              Conhecer a Soffia <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="relative">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#E31E24] to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm">Soffia IA</div>
                  <div className="text-[10px] text-slate-400">Atendendo agora</div>
                </div>
              </div>
              <div className="space-y-2">
                <Bubble bot>Oi! Sou a Soffia da SuperVisão Mooca 😊 Em que posso ajudar?</Bubble>
                <Bubble>Queria fazer vistoria cautelar de um Civic</Bubble>
                <Bubble bot>Show! O valor pra Civic é R$ 180. Quer agendar pra esta semana?</Bubble>
                <Bubble>Pode ser quinta à tarde</Bubble>
                <Bubble bot>Tenho 14h ou 16h disponível 👌 Qual prefere?</Bubble>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SoffiaItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function Bubble({ children, bot }: { children: React.ReactNode; bot?: boolean }) {
  return (
    <div className={`flex ${bot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
          bot
            ? "bg-white/10 text-slate-200 rounded-tl-sm"
            : "bg-emerald-500 text-white rounded-tr-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ============================== NÚMEROS ==============================
function Numeros() {
  const numeros = [
    { v: "24+", l: "Unidades operando", sub: "rede SuperVisão" },
    { v: "200+", l: "Atendentes ativos", sub: "diariamente" },
    { v: "10k+", l: "Conversas/mês", sub: "centralizadas" },
    { v: "<2 dias", l: "Pra começar", sub: "setup completo" },
  ];
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] leading-tight">
            Não é tecnologia teórica.<br />É operação rodando.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {numeros.map((n) => (
            <div
              key={n.l}
              className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-6 text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-[#1B2A4A] to-[#E31E24] bg-clip-text text-transparent">
                {n.v}
              </div>
              <div className="text-sm font-semibold text-slate-800 mt-2">
                {n.l}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{n.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================== FAQ ==============================
function FAQ() {
  const perguntas = [
    {
      q: "Quanto custa?",
      a: "O CRM é um benefício oferecido pela rede SuperVisão pra cada unidade. Os valores e modelo de cobrança a Matriz explica diretamente com você após o cadastro.",
    },
    {
      q: "Em quanto tempo minha unidade entra no ar?",
      a: "Em até 2 dias úteis após o cadastro. A gente configura o painel, conecta o WhatsApp, cadastra seus atendentes, monta o funil de vendas e as etiquetas padrão.",
    },
    {
      q: "Preciso trocar o número do meu WhatsApp?",
      a: "Não. Você usa o mesmo número que já tem. O CRM se conecta nele e centraliza tudo. Se ainda não tiver número da unidade, a gente orienta.",
    },
    {
      q: "Quem treina meu time?",
      a: "Nossa equipe faz uma reunião ao vivo de ~1h com seu time, ensinando tudo. Depois você ganha acesso a um grupo de suporte no WhatsApp pra dúvidas.",
    },
    {
      q: "Funciona no celular?",
      a: "Sim. O painel é 100% web e funciona em qualquer celular ou computador. Tem app oficial do Chatwoot na Play Store e App Store também.",
    },
    {
      q: "E se eu já uso outro CRM?",
      a: "Sem problema. A gente ajuda a migrar seus contatos e conversas atuais. O processo é tranquilo e não trava sua operação durante a transição.",
    },
    {
      q: "Tem suporte se algo der errado?",
      a: "Sim. Você fica em um grupo de WhatsApp com nossa equipe técnica. Resposta no horário comercial em até 30 minutos. Bugs críticos resolvemos no mesmo dia.",
    },
    {
      q: "Qual a diferença do WhatsApp Business comum?",
      a: "WhatsApp Business é pra UM celular, UM atendente. O CRM SuperVisão é multi-atendente, com histórico unificado, kanban de vendas, relatórios, etiquetas, agenda integrada e atribuição automática.",
    },
    {
      q: "Quando a IA Soffia fica disponível?",
      a: "A Soffia já está em produção em algumas unidades. A integração padronizada com o CRM SuperVisão está sendo finalizada — em breve qualquer unidade poderá ativar com 1 clique.",
    },
    {
      q: "Posso cancelar?",
      a: "Sim, a qualquer momento. Não há multa nem fidelidade. Mas a verdade é que ninguém cancelou ainda 😉",
    },
  ];
  return (
    <section id="faq" className="py-20 sm:py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] leading-tight">
            Perguntas frequentes
          </h2>
        </div>
        <div className="space-y-2">
          {perguntas.map((p, i) => (
            <FAQItem key={i} q={p.q} a={p.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-[#1B2A4A] text-sm sm:text-base">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

// ============================== CTA FINAL ==============================
function CTAFinal() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative bg-gradient-to-br from-[#1B2A4A] via-[#243556] to-[#111D35] rounded-3xl p-10 sm:p-16 text-center text-white overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#E31E24]/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />
          </div>
          <div className="relative">
            <Shield className="h-10 w-10 text-[#E31E24] mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Pronto pra organizar sua unidade?
            </h2>
            <p className="mt-4 text-slate-300 max-w-xl mx-auto">
              Sem instalar nada. Sem trocar número. Sem dor de cabeça. Em 2 dias
              sua unidade vendendo melhor.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={CTA_CADASTRO}
                className="inline-flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#C41A1F] text-white font-semibold px-7 py-4 rounded-lg transition-colors shadow-lg shadow-red-500/30"
              >
                Cadastrar minha unidade agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Cadastro em ~5 minutos · Time da Matriz revisa e configura
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================== FOOTER ==============================
function Footer() {
  return (
    <footer className="bg-[#0F1729] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-9 w-9 rounded-lg bg-[#E31E24] font-bold text-white flex items-center justify-center">
                S
              </div>
              <div>
                <div className="text-sm font-bold text-white">SuperVisão</div>
                <div className="text-[10px] uppercase tracking-wider">
                  CRM Oficial
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed">
              Painel oficial das unidades da rede SuperVisão. Centraliza, organiza
              e potencializa vendas.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-3">
              Produto
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white">Recursos</a></li>
              <li><a href="#como-funciona" className="hover:text-white">Como funciona</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li>
                <a href="https://soffiaiasupervisao.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Soffia IA
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-3">
              Acesso
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cadastro" className="hover:text-white">
                  Cadastrar unidade
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Login (já sou cliente)
                </Link>
              </li>
              <li>
                <a href="https://supervisao.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Site SuperVisão
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>© {new Date().getFullYear()} SuperVisão · Dose de Growth</div>
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
            <Clock className="h-3 w-3" /> Sistema 99,9% uptime
          </div>
        </div>
      </div>
    </footer>
  );
}
