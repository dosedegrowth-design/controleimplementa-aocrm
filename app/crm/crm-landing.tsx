"use client";

import "./soffia.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const CTA = "/cadastro";

// ============== HOOKS / UTILS ==============
function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -50px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

function Reveal({
  delay = 0,
  className = "",
  style,
  children,
}: {
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [ref, shown] = useReveal();
  const cls = `reveal ${shown ? "in" : ""} ${delay ? `reveal-delay-${delay}` : ""} ${className}`;
  return (
    <div ref={ref} className={cls} style={style}>
      {children}
    </div>
  );
}

function WordReveal({
  text,
  highlight = [],
  delayBase = 0,
  className = "",
}: {
  text: string;
  highlight?: string[];
  delayBase?: number;
  className?: string;
}) {
  const [ref, shown] = useReveal();
  const words = text.split(" ");
  return (
    <span
      ref={ref as unknown as React.Ref<HTMLSpanElement>}
      className={`word-reveal ${shown ? "in" : ""} ${className}`}
    >
      {words.map((w, i) => {
        const clean = w.replace(/[.,—]/g, "");
        const isHi = highlight.includes(clean);
        return (
          <span key={i} style={{ transitionDelay: `${delayBase + i * 80}ms` }}>
            {isHi ? <em className="soffia-mark">{w}</em> : w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        );
      })}
    </span>
  );
}

function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 1500,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [ref, shown] = useReveal();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!shown) return;
    let raf: number;
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setVal(to * eased);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shown, to, duration]);
  return (
    <span
      ref={ref as unknown as React.Ref<HTMLSpanElement>}
      className="counter-num"
    >
      {prefix}
      {Math.round(val).toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

// ============== MAIN ==============
export function CrmLanding() {
  return (
    <div className="soffia-scope">
      <Hero />
      <Problema />
      <Solucao />
      <Funil />
      <AcessosSection />
      <AgendaSection />
      <Painel />
      <NotCommonCRM />
      <BeforeAfter />
      <SoffiaTeaser />
      <CTAFinal />
      <Footer />
      <FloatingProgress />
    </div>
  );
}

// ============== HERO ==============
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-grid-bg" />
      <div className="container hero-inner">
        <div>
          <Reveal>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 8px 8px 14px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid var(--slate-200)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: "var(--sv-red)",
                  color: "#fff",
                  fontWeight: 900,
                  fontFamily: "var(--font-display)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                }}
              >
                S
              </span>
              <span className="crm-chip">CRM SuperVisão</span>
            </div>
          </Reveal>
          <h1 className="h-display" style={{ marginTop: 28 }}>
            <WordReveal
              text="Pare de perder cliente no WhatsApp."
              highlight={["WhatsApp."]}
            />
            <br />
            <WordReveal
              text="Centralize tudo num painel só."
              delayBase={420}
              highlight={["painel"]}
            />
          </h1>
          <Reveal delay={4}>
            <p className="lead" style={{ marginTop: 28 }}>
              O painel oficial da rede SuperVisão pra unidades. Conversas,
              agenda, time comercial, kanban de vendas, números reais — tudo
              num lugar só, em tempo real.
            </p>
          </Reveal>
          <Reveal delay={4} style={{ marginTop: 36 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href={CTA} className="btn btn-red btn-pulse">
                Cadastrar minha unidade
                <span style={{ fontSize: 18 }}>→</span>
              </Link>
              <a href="#painel" className="btn btn-outline">
                Ver o painel
              </a>
            </div>
          </Reveal>
          <Reveal delay={5} style={{ marginTop: 48 }}>
            <div
              style={{
                display: "flex",
                gap: 28,
                flexWrap: "wrap",
                color: "var(--slate-500)",
                fontSize: 12.5,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span>WhatsApp multi-atendente</span>
              <span style={{ color: "var(--slate-300)" }}>·</span>
              <span>Kanban em tempo real</span>
              <span style={{ color: "var(--slate-300)" }}>·</span>
              <span>Agenda integrada</span>
            </div>
          </Reveal>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  const [ref, shown] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        transform: shown ? "translateX(0)" : "translateX(40px)",
        opacity: shown ? 1 : 0,
        transition:
          "transform 0.9s cubic-bezier(.2,.7,.2,1) 0.3s, opacity 0.9s 0.3s",
        paddingBottom: 60,
      }}
    >
      <div
        className="mockup"
        style={{ position: "relative", zIndex: 1, transform: "rotate(-1deg)" }}
      >
        <div className="mockup-bar">
          <span className="dot r" />
          <span className="dot y" />
          <span className="dot g" />
          <span className="url">controle.supervisao.com</span>
          <span
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "var(--st-green)",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--st-green)",
                animation: "soffia-soft-pulse 1.6s infinite",
              }}
            />
            AO VIVO
          </span>
        </div>
        <DashboardPreview />
      </div>

      <div
        style={{
          position: "absolute",
          right: -16,
          bottom: -10,
          zIndex: 2,
          transform: "rotate(4deg)",
        }}
      >
        <WAPhone />
      </div>

      <div
        style={{
          position: "absolute",
          left: -16,
          top: 24,
          zIndex: 3,
          background: "var(--navy)",
          color: "#fff",
          padding: "9px 14px",
          borderRadius: 999,
          fontSize: 11.5,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.06em",
          boxShadow: "0 12px 30px -10px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--sv-red)",
            animation: "soffia-soft-pulse 1.6s infinite",
          }}
        />
        3 atendentes online · 12 conversas
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div
      style={{
        padding: 18,
        background: "#fff",
        height: 340,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "var(--slate-500)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Faturamento da unidade · Hoje
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--navy)",
            }}
          >
            R$ <Counter to={14820} duration={1800} />
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Hoje", "Semana", "Mês"].map((t, i) => (
            <span
              key={t}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                background: i === 0 ? "var(--sv-red)" : "var(--slate-100)",
                color: i === 0 ? "#fff" : "var(--slate-500)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <svg
        viewBox="0 0 320 90"
        preserveAspectRatio="none"
        style={{ width: "100%", height: 80 }}
      >
        <defs>
          <linearGradient id="dashGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#E30613" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#E30613" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 70 L40 60 L80 65 L120 50 L160 40 L200 45 L240 30 L280 25 L320 15 L320 90 L0 90 Z"
          fill="url(#dashGrad)"
        />
        <path
          d="M0 70 L40 60 L80 65 L120 50 L160 40 L200 45 L240 30 L280 25 L320 15"
          fill="none"
          stroke="#E30613"
          strokeWidth="2"
        />
      </svg>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {[
          { l: "Leads", v: 47, c: "#16A34A" },
          { l: "Qualif.", v: 31, c: "#2563EB" },
          { l: "Agend.", v: 19, c: "#E30613" },
          { l: "Fechado", v: 12, c: "#15803D" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: "#fff",
              border: "1px solid var(--slate-200)",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--slate-500)",
                fontWeight: 600,
              }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 20,
                color: s.c,
                marginTop: 2,
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WAPhone({ scale = 0.82 }: { scale?: number }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 6), 2400);
    return () => clearInterval(id);
  }, []);
  const messages = [
    { from: "them", text: "Oi! Quanto custa a vistoria pro Civic 2018?", t: "10:42" },
    { from: "me", text: "Oi! 👋 Aqui é a Carol da SuperVisão. Você quer cautelar ou laudo de transferência?", t: "10:42" },
    { from: "them", text: "Cautelar", t: "10:43" },
    { from: "me", text: "Show! Pro Civic 2018 sai R$ 280. Temos horário hoje 16h ou amanhã 9h. Qual prefere?", t: "10:43" },
    { from: "them", text: "Hoje 16h", t: "10:44" },
    { from: "me", text: "Fechado ✅ Confirmado. Te mando lembrete 1h antes.", t: "10:44" },
  ];
  const visible = messages.slice(0, step + 1);
  return (
    <div
      className="phone"
      style={{ transform: `scale(${scale})`, transformOrigin: "bottom right" }}
    >
      <div className="phone-screen">
        <div className="wa-header">
          <div className="wa-avatar">C</div>
          <div>
            <div className="wa-name">Carol · SuperVisão Mooca</div>
            <div className="wa-status">online · digitando</div>
          </div>
        </div>
        <div className="wa-msgs">
          {visible.map((m, i) => (
            <div
              key={i}
              className={`wa-bubble ${m.from}`}
              style={{
                animation: i === visible.length - 1 ? "fadeIn 0.4s" : "none",
              }}
            >
              {m.text}
              <span className="meta">
                {m.t} {m.from === "me" && "✓✓"}
              </span>
            </div>
          ))}
          {step < messages.length - 1 && (
            <div className="wa-typing">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== PROBLEMA ==============
function Problema() {
  const clusters = [
    {
      label: "Caos",
      heading: "Conversas espalhadas",
      items: [
        "Cada atendente com WhatsApp próprio",
        "Cliente atende com 2 pessoas, ninguém sabe",
        "Histórico some quando alguém sai",
      ],
    },
    {
      label: "Perda",
      heading: "Lead que evapora",
      items: [
        "Sem follow-up automático",
        "Cliente sumiu, ninguém percebeu",
        "Não dá pra cobrar o time do que não vê",
      ],
    },
    {
      label: "Achismo",
      heading: "Sem números reais",
      items: [
        "Quem é o melhor vendedor?",
        "Quantos leads viraram fechamento?",
        "Qual o ticket médio da unidade?",
      ],
    },
  ];

  return (
    <section className="section dark section-pad" id="problema">
      <div className="container">
        <Reveal>
          <span className="eyebrow on-dark">
            <span className="dot" /> O problema hoje
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 18 }}>
          <h2 className="h-section" style={{ maxWidth: 900 }}>
            Sua operação tá no <em className="soffia-mark on-dark">escuro</em>.
          </h2>
        </Reveal>
        <Reveal delay={2} style={{ marginTop: 16 }}>
          <p
            className="lead on-dark"
            style={{ maxWidth: 600 }}
          >
            WhatsApp comum funciona até a unidade crescer. Aí vira gargalo, vira
            perda, vira chute. Você reconhece estes problemas?
          </p>
        </Reveal>

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {clusters.map((c, idx) => (
            <Reveal key={c.label} delay={(idx + 2) as 2 | 3 | 4}>
              <div className="card on-dark" style={{ height: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(227,6,19,0.16)",
                      color: "var(--sv-red)",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                    }}
                  >
                    {c.label}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 16,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {c.heading}
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {c.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        fontSize: 14.5,
                        color: "rgba(255,255,255,0.78)",
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--sv-red)",
                          marginTop: 2,
                          fontWeight: 900,
                        }}
                      >
                        ?
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== SOLUÇÃO ==============
function Solucao() {
  return (
    <section className="section section-pad" id="solucao">
      <div className="container">
        <Reveal>
          <span className="eyebrow">
            <span className="dot" /> A virada de chave
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 18 }}>
          <h2 className="h-section" style={{ maxWidth: 920 }}>
            Um único painel pra{" "}
            <em className="soffia-mark">toda</em> a unidade.
          </h2>
        </Reveal>
        <Reveal delay={2} style={{ marginTop: 16 }}>
          <p className="lead">
            Recepção, vistoriadores, gestor — todo mundo no mesmo lugar, com a
            visão certa pra cada papel. Chega de planilha, caderno e
            atendimento duplicado.
          </p>
        </Reveal>

        <div
          style={{
            marginTop: 64,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {[
            {
              t: "Caixa única",
              d: "Todos os WhatsApp da unidade num só painel. Atendentes vivem aqui.",
              ic: "💬",
            },
            {
              t: "Kanban de vendas",
              d: "Lead → Interesse → Qualificado → Agendado → Fechado. Visual e real.",
              ic: "📊",
            },
            {
              t: "Números de verdade",
              d: "Quem vendeu o quê, ticket médio, conversão. Sem achismo.",
              ic: "🎯",
            },
          ].map((f, i) => (
            <Reveal key={f.t} delay={(i + 2) as 2 | 3 | 4}>
              <div className="card">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, var(--sv-red-soft) 0%, #FFD8DC 100%)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 22,
                    marginBottom: 18,
                  }}
                >
                  {f.ic}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 8,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {f.t}
                </h3>
                <p
                  style={{
                    color: "var(--slate-600)",
                    fontSize: 15,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {f.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== FUNIL ==============
function Funil() {
  const steps = [
    {
      n: 1,
      t: "Cliente chega no WhatsApp",
      d: "Atendente vê o lead na fila já etiquetado com origem (Google, Meta, Indicação) e tipo de serviço.",
    },
    {
      n: 2,
      t: "Time qualifica e orça",
      d: "Painel mostra preço por serviço e unidade. Histórico completo, custom attributes, base de conhecimento.",
    },
    {
      n: 3,
      t: "Agenda automática",
      d: "Cliente confirma horário, agenda já bloqueia slot. Lembretes 1h antes pra reduzir no-show.",
    },
    {
      n: 4,
      t: "Cliente comparece, vistoria roda",
      d: "Status muda automático. Time da unidade vê tudo no painel sem precisar perguntar.",
    },
    {
      n: 5,
      t: "Fechamento auditado",
      d: "Conferência com API do laudo. Métrica de conversão real, ticket por origem, performance do time.",
    },
  ];
  return (
    <section className="section section-pad tinted" id="funil">
      <div className="container">
        <Reveal>
          <span className="eyebrow">
            <span className="dot" /> Do lead ao faturamento
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 18 }}>
          <h2 className="h-section" style={{ maxWidth: 900 }}>
            Como o CRM transforma <em className="soffia-mark">caos em previsibilidade</em>.
          </h2>
        </Reveal>

        <div
          className="funnel-track"
          style={{
            marginTop: 56,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 820,
            position: "relative",
          }}
        >
          <FunnelLine />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div className="funnel-num">{s.n}</div>
                <div style={{ flex: 1, paddingTop: 6 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 6,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.t}
                  </h3>
                  <p
                    style={{
                      color: "var(--slate-600)",
                      fontSize: 15,
                      lineHeight: 1.55,
                      margin: 0,
                      maxWidth: 600,
                    }}
                  >
                    {s.d}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FunnelLine() {
  const [ref, shown] = useReveal();
  return (
    <div
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      className={`funnel-line ${shown ? "in" : ""}`}
    >
      <div className="progress" />
    </div>
  );
}

// ============== ACESSOS / PAPÉIS ==============
function AcessosSection() {
  const perfis = [
    {
      titulo: "Recepção",
      desc: "Vê só o que precisa: novas conversas, agendamento, cadastro do cliente. Sem distração com números do mês.",
      cor: "var(--sv-blue)",
      bg: "var(--sv-blue-soft)",
    },
    {
      titulo: "Vistoriador",
      desc: "Acessa a fila do dia (presencial + delivery), checa endereço, marca como concluído. Tudo no celular.",
      cor: "var(--sv-amber)",
      bg: "var(--sv-amber-soft)",
    },
    {
      titulo: "Time Comercial",
      desc: "Kanban completo, follow-up de quem sumiu, ranking, comissão calculada. Foco em fechar.",
      cor: "var(--sv-red)",
      bg: "var(--sv-red-soft)",
    },
    {
      titulo: "Franqueado / Gestor",
      desc: "Visão executiva: faturamento ao vivo, gargalos do funil, performance individual. Decisão por dado.",
      cor: "var(--sv-plum)",
      bg: "var(--sv-plum-soft)",
    },
  ];

  return (
    <section className="section section-pad" id="acessos">
      <div className="container">
        <Reveal>
          <span className="eyebrow">
            <span className="dot" /> Acessos por perfil
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 18 }}>
          <h2 className="h-section" style={{ maxWidth: 900 }}>
            Cada um vê o que <em className="soffia-mark">precisa ver</em>.
          </h2>
        </Reveal>
        <Reveal delay={2} style={{ marginTop: 16 }}>
          <p className="lead">
            Permissões granulares por perfil. Atendente não vê faturamento. Gestor
            não precisa abrir conversa. Cada papel tem sua tela.
          </p>
        </Reveal>

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          {perfis.map((p, i) => (
            <Reveal key={p.titulo} delay={((i % 4) + 2) as 2 | 3 | 4 | 5}>
              <div className="card" style={{ height: "100%" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: p.bg,
                    color: p.cor,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  {p.titulo}
                </div>
                <p
                  style={{
                    color: "var(--slate-700)",
                    fontSize: 15.5,
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== AGENDA ==============
function AgendaSection() {
  return (
    <section className="section section-pad tinted" id="agenda">
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="dot" /> Agenda integrada
              </span>
            </Reveal>
            <Reveal delay={1} style={{ marginTop: 18 }}>
              <h2 className="h-section">
                Uma agenda.{" "}
                <em className="soffia-mark">Presencial</em> e delivery.
              </h2>
            </Reveal>
            <Reveal delay={2} style={{ marginTop: 16 }}>
              <p className="lead">
                Time comercial agenda direto pelo painel. Cliente recebe
                confirmação no WhatsApp e lembrete 1h antes. Sem no-show, sem
                planilha paralela.
              </p>
            </Reveal>
            <Reveal delay={3} style={{ marginTop: 28 }}>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {[
                  "Agendamento presencial e delivery na mesma tela",
                  "Bloqueio automático de horário ao confirmar",
                  "Lembrete automático 1h antes (reduz no-show)",
                  "Visão por dia, semana ou vistoriador",
                  "Sincronização com o atendimento (sem retrabalho)",
                ].map((t) => (
                  <li
                    key={t}
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 15.5,
                      color: "var(--slate-700)",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--sv-red)",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={3}>
            <AgendaMockup />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function AgendaMockup() {
  const slots = [
    { h: "09:00", c: "Civic 2018 — Carol", t: "presencial", st: "fechado" },
    { h: "10:30", c: "Onix — João S.", t: "presencial", st: "fechado" },
    { h: "11:00", c: "HB20 — Marcos R.", t: "delivery", st: "qual" },
    { h: "14:00", c: "Corolla — Patrícia", t: "presencial", st: "fechado" },
    { h: "15:30", c: "Compass — Letícia", t: "delivery", st: "agend" },
    { h: "16:00", c: "Civic — Rafael F.", t: "presencial", st: "agend" },
  ];
  const colorMap: Record<string, string> = {
    fechado: "var(--st-green-soft)",
    qual: "var(--st-blue-soft)",
    agend: "var(--sv-red-soft)",
  };
  const textMap: Record<string, string> = {
    fechado: "#166534",
    qual: "#1D4ED8",
    agend: "var(--sv-red)",
  };
  return (
    <div className="mockup">
      <div className="mockup-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="url">controle.supervisao.com/agenda</span>
      </div>
      <div style={{ padding: 20, background: "#fff" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--slate-500)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Quinta · 30/04
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--navy)",
              }}
            >
              6 agendamentos
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "var(--st-green-soft)",
                color: "#166534",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              3 PRESENCIAL
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "var(--sv-plum-soft)",
                color: "#7E22CE",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              3 DELIVERY
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {slots.map((s) => (
            <div
              key={s.h}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: "var(--slate-50)",
                border: "1px solid var(--slate-200)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "var(--navy)",
                  width: 44,
                }}
              >
                {s.h}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: "var(--slate-700)",
                  fontWeight: 500,
                }}
              >
                {s.c}
              </span>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: s.t === "delivery" ? "var(--sv-plum-soft)" : "var(--slate-100)",
                  color: s.t === "delivery" ? "#7E22CE" : "var(--slate-600)",
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {s.t}
              </span>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: colorMap[s.st],
                  color: textMap[s.st],
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {s.st === "fechado"
                  ? "fechado"
                  : s.st === "qual"
                  ? "qualif"
                  : "agend"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============== PAINEL ==============
function Painel() {
  return (
    <section className="section dark section-pad" id="painel">
      <div className="container">
        <Reveal>
          <span className="eyebrow on-dark">
            <span className="dot" /> Painel em tempo real
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 18 }}>
          <h2 className="h-section" style={{ maxWidth: 900 }}>
            O painel que <em className="soffia-mark on-dark">substitui</em>{" "}
            planilha, caderno e achismo.
          </h2>
        </Reveal>
        <Reveal delay={2} style={{ marginTop: 16 }}>
          <p className="lead on-dark" style={{ maxWidth: 720 }}>
            Indicadores que sua unidade passa a ter no momento que ativa o CRM.
          </p>
        </Reveal>

        <div
          style={{
            marginTop: 64,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {[
            { v: 47, suf: "", label: "Leads hoje" },
            { v: 91, suf: "%", label: "Comparecimento" },
            { v: 312, pre: "R$", label: "Ticket médio" },
            { v: 67, suf: "%", label: "Conversão" },
          ].map((kpi, i) => (
            <Reveal key={kpi.label} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <div className="card on-dark" style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {kpi.label}
                </div>
                <Counter to={kpi.v} prefix={kpi.pre || ""} suffix={kpi.suf || ""} />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={3} style={{ marginTop: 48 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
            }}
            className="painel-areas-grid"
          >
            {[
              { t: "Conversas", ic: "💬" },
              { t: "Kanban", ic: "📊" },
              { t: "Agenda", ic: "📅" },
              { t: "Relatórios", ic: "📈" },
              { t: "Etiquetas", ic: "🏷️" },
            ].map((area) => (
              <div
                key={area.t}
                style={{
                  padding: "20px 16px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{area.ic}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                  }}
                >
                  {area.t}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============== NOT-COMMON CRM ==============
function NotCommonCRM() {
  const rows = [
    { left: "WhatsApp Business solto", right: "Caixa unificada de toda a unidade" },
    { left: "Sem histórico quando atendente sai", right: "Contatos ficam da unidade" },
    { left: "Planilha que ninguém atualiza", right: "Kanban em tempo real" },
    { left: "Sem follow-up automático", right: "Recovery loop integrado" },
    { left: "Quem fez quanto? Achismo.", right: "Ranking individual de vendas" },
    { left: "Lojista e cliente final misturados", right: "Etiquetas auto-categorizam" },
    { left: "Cliente confunde regra/preço", right: "Base de conhecimento centralizada" },
    { left: "Agenda em caderno separado", right: "Agenda integrada (presencial + delivery)" },
  ];

  return (
    <section className="section section-pad" id="diferenca">
      <div className="container">
        <Reveal>
          <span className="eyebrow">
            <span className="dot" /> O que torna diferente
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 18 }}>
          <h2 className="h-section" style={{ maxWidth: 920 }}>
            Não é só mais um <em className="soffia-mark">CRM</em>.<br />
            É o CRM oficial da rede.
          </h2>
        </Reveal>
        <Reveal delay={2} style={{ marginTop: 16 }}>
          <p className="lead">
            Construído pra rotina da unidade SuperVisão. Da Matriz pra cada
            franqueado.
          </p>
        </Reveal>

        <Reveal delay={3} style={{ marginTop: 56 }}>
          <div className="cmp-table">
            <div className="cmp-col left">
              <div className="cmp-head">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "var(--sv-red-soft)",
                    color: "var(--sv-red)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 6 18 18M18 6 6 18" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 17,
                    letterSpacing: "-0.01em",
                  }}
                >
                  CRM comum / WhatsApp solto
                </span>
              </div>
              {rows.map((r) => (
                <div className="cmp-row" key={r.left}>
                  <span className="icon">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 6 18 18M18 6 6 18" />
                    </svg>
                  </span>
                  <span style={{ color: "var(--slate-600)" }}>{r.left}</span>
                </div>
              ))}
            </div>
            <div className="cmp-col right">
              <div className="cmp-head">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "var(--sv-red)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  S
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 17,
                    letterSpacing: "-0.01em",
                  }}
                >
                  CRM SuperVisão
                </span>
              </div>
              {rows.map((r) => (
                <div className="cmp-row" key={r.right}>
                  <span className="icon">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  <span style={{ color: "var(--navy)", fontWeight: 500 }}>
                    {r.right}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============== BEFORE/AFTER ==============
function BeforeAfter() {
  const before = [
    "Não sei quantos leads chegaram esse mês",
    "Atendente perde contato quando sai",
    "Vendedor diz que vendeu, eu acredito",
    "Cliente sumiu, ninguém percebeu",
    "Agenda em caderno e WhatsApp",
    "Sem ranking, sem comissão real",
  ];
  const after = [
    "Sei o número de leads ao vivo, por origem",
    "Contatos ficam da unidade, não da pessoa",
    "Cada venda registrada e auditável",
    "Follow-up automático em 30min, 1h, 2h, 4h, 23h",
    "Agenda integrada (presencial + delivery)",
    "Ranking individual + comissão calculada",
  ];
  return (
    <section className="section section-pad tinted" id="impacto">
      <div className="container">
        <Reveal>
          <span className="eyebrow">
            <span className="dot" /> O que muda
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 18 }}>
          <h2 className="h-section" style={{ maxWidth: 880 }}>
            Como sua unidade <em className="soffia-mark">opera depois</em> do CRM.
          </h2>
        </Reveal>

        <Reveal delay={2} style={{ marginTop: 56 }}>
          <div className="before-after">
            <div className="ba-col before">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 600,
                }}
              >
                Antes
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginTop: 8,
                  color: "#fff",
                }}
              >
                No escuro
              </h3>
              <ul className="ba-list">
                {before.map((t) => (
                  <li key={t}>
                    <span className="ba-icon">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 6 18 18M18 6 6 18" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ba-col after">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--sv-red)",
                  fontWeight: 700,
                }}
              >
                Depois
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginTop: 8,
                  color: "var(--navy)",
                }}
              >
                Operação iluminada
              </h3>
              <ul className="ba-list">
                {after.map((t) => (
                  <li key={t}>
                    <span className="ba-icon">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============== SOFFIA TEASER ==============
function SoffiaTeaser() {
  return (
    <section className="section section-pad" id="soffia">
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="dot" /> Em breve
              </span>
            </Reveal>
            <Reveal delay={1} style={{ marginTop: 18 }}>
              <h2 className="h-section">
                E quando sua operação crescer,<br />
                a <em className="soffia-mark">Soffia</em> entra.
              </h2>
            </Reveal>
            <Reveal delay={2} style={{ marginTop: 18 }}>
              <p className="lead">
                A IA treinada com tudo da SuperVisão atende 24/7, qualifica,
                orça via FIPE, agenda. Plugada no mesmo painel. Você não troca
                de sistema — só liga o turbo.
              </p>
            </Reveal>
            <Reveal delay={3} style={{ marginTop: 24 }}>
              <a
                href="https://soffiaiasupervisao.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--sv-red)",
                  letterSpacing: "0.04em",
                }}
              >
                Conhecer a Soffia →
              </a>
            </Reveal>
          </div>
          <Reveal delay={2}>
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: "1px solid var(--slate-200)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--sv-red) 0%, #FF3B47 100%)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                  }}
                >
                  S
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    Soffia IA
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--slate-500)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Atendendo agora
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "var(--slate-100)",
                    padding: "8px 12px",
                    borderRadius: 12,
                    fontSize: 13,
                    maxWidth: "80%",
                  }}
                >
                  Oi! Sou a Soffia 🌟 Em que posso ajudar?
                </div>
                <div
                  style={{
                    alignSelf: "flex-end",
                    background: "var(--sv-red)",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: 12,
                    fontSize: 13,
                    maxWidth: "80%",
                  }}
                >
                  Quero fazer vistoria do Civic
                </div>
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "var(--slate-100)",
                    padding: "8px 12px",
                    borderRadius: 12,
                    fontSize: 13,
                    maxWidth: "80%",
                  }}
                >
                  Pra Civic 2018 sai R$ 280. Tenho 16h ou amanhã 9h. Qual prefere?
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============== CTA FINAL ==============
function CTAFinal() {
  return (
    <section className="section cta-final section-pad" id="cta">
      <div className="cta-final-grid" />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <span className="eyebrow on-dark">
            <span className="dot" /> Próximo passo
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 24 }}>
          <h2
            className="h-display"
            style={{
              maxWidth: 900,
              fontSize: "clamp(38px, 5vw, 64px)",
              color: "#fff",
            }}
          >
            Sua unidade pode estar rodando o{" "}
            <em className="soffia-mark on-dark">CRM</em> ainda esta semana.
          </h2>
        </Reveal>
        <Reveal delay={2} style={{ marginTop: 24 }}>
          <p
            className="lead on-dark"
            style={{ maxWidth: 600 }}
          >
            Cadastra em 5 minutos. Em até 2 dias úteis a Matriz configura
            tudo, treina seu time e libera o acesso.
          </p>
        </Reveal>
        <Reveal delay={3} style={{ marginTop: 40 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href={CTA} className="btn btn-red btn-pulse">
              Cadastrar minha unidade
              <span style={{ fontSize: 18 }}>→</span>
            </Link>
            <a
              href="https://soffiaiasupervisao.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline on-dark"
            >
              Conhecer a Soffia IA
            </a>
          </div>
        </Reveal>
        <Reveal delay={4} style={{ marginTop: 56 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(32px, 3.8vw, 48px)",
              letterSpacing: "-0.03em",
              color: "var(--sv-red)",
              maxWidth: 800,
              lineHeight: 1.1,
            }}
          >
            Eu quero o CRM da minha unidade.
          </p>
          <p
            style={{
              marginTop: 12,
              color: "rgba(255,255,255,0.65)",
              fontSize: 15,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
            }}
          >
            É assim que a sua próxima conversa com cliente vai começar.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ============== FOOTER ==============
function Footer() {
  return (
    <footer
      style={{
        background: "var(--navy)",
        color: "rgba(255,255,255,0.5)",
        padding: "48px 0 32px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "var(--sv-red)",
                color: "#fff",
                fontWeight: 900,
                fontFamily: "var(--font-display)",
                display: "grid",
                placeItems: "center",
              }}
            >
              S
            </span>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                SuperVisão
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                CRM Oficial
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <Link href="/cadastro" style={{ color: "rgba(255,255,255,0.7)" }}>
              Cadastrar
            </Link>
            <Link href="/login" style={{ color: "rgba(255,255,255,0.7)" }}>
              Login
            </Link>
            <a
              href="https://soffiaiasupervisao.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Soffia IA
            </a>
          </div>
        </div>
        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          © {new Date().getFullYear()} SuperVisão · Dose de Growth · Sistema 99,9% uptime
        </div>
      </div>
    </footer>
  );
}

// ============== FLOATING PROGRESS ==============
function FloatingProgress() {
  const [active, setActive] = useState("hero");
  const [onDark, setOnDark] = useState(false);
  useEffect(() => {
    const ids = [
      "hero",
      "problema",
      "solucao",
      "funil",
      "acessos",
      "agenda",
      "painel",
      "diferenca",
      "impacto",
      "soffia",
      "cta",
    ];
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= mid) cur = id;
      }
      setActive(cur);
      const el = document.getElementById(cur);
      if (el) {
        const dark =
          el.classList.contains("dark") || el.classList.contains("cta-final");
        setOnDark(dark);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const labels: Record<string, string> = {
    hero: "Início",
    problema: "Problema",
    solucao: "Solução",
    funil: "Funil",
    acessos: "Acessos",
    agenda: "Agenda",
    painel: "Painel",
    diferenca: "Diferença",
    impacto: "Impacto",
    soffia: "Soffia",
    cta: "Próximo",
  };

  return (
    <div className={`floating-marker ${onDark ? "on-dark" : ""}`}>
      {Object.keys(labels).map((id) => (
        <a
          key={id}
          href={`#${id}`}
          className={`step ${active === id ? "active" : ""}`}
        >
          <span className="label">{labels[id]}</span>
          <span className="bar" />
        </a>
      ))}
    </div>
  );
}
