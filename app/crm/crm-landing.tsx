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
      <KanbanSection />
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
  // Sparkline genérico (caminho SVG curvo)
  const spark = (color: string) => (
    <svg
      viewBox="0 0 80 24"
      preserveAspectRatio="none"
      style={{ width: "100%", height: 22 }}
    >
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 18 L10 14 L20 16 L30 10 L40 12 L50 6 L60 8 L70 4 L80 6 L80 24 L0 24 Z"
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      <path
        d="M0 18 L10 14 L20 16 L30 10 L40 12 L50 6 L60 8 L70 4 L80 6"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );

  return (
    <div style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
      {/* HERO FINANCEIRO (gradient navy/blue) */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #2D4373 50%, #3B82F6 100%)",
          color: "#fff",
          padding: "18px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Blobs decorativos */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1.4fr",
            gap: 16,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Receita */}
          <div>
            <div
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>$</span>
              <span>Receita do período</span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 26,
                letterSpacing: "-0.03em",
                marginTop: 2,
                color: "#fff",
              }}
            >
              R$ <Counter to={47820} duration={1800} />
            </div>
            <div
              style={{
                fontSize: 9.5,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
                fontFamily: "var(--font-mono)",
              }}
            >
              Vistorias verificadas · ticket médio R$ 218
            </div>
          </div>
          {/* Top Unidade */}
          <div
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.15)",
              paddingLeft: 14,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>👑</span>
              <span>Top unidade</span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.02em",
                marginTop: 2,
                color: "#fff",
              }}
            >
              Centro
            </div>
            <div
              style={{
                fontSize: 9.5,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
                fontFamily: "var(--font-mono)",
              }}
            >
              R$ 12.480 · 64 fechados
            </div>
          </div>
          {/* Sparkline 14 dias */}
          <div
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.15)",
              paddingLeft: 14,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Receita · últimos 14 dias
            </div>
            <svg
              viewBox="0 0 200 40"
              preserveAspectRatio="none"
              style={{ width: "100%", height: 32, marginTop: 4 }}
            >
              <path
                d="M0 28 L15 22 L30 26 L50 18 L70 24 L90 14 L110 18 L130 8 L150 14 L170 6 L185 12 L200 8"
                fill="none"
                stroke="#fff"
                strokeWidth="1.8"
                opacity="0.95"
              />
            </svg>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Conversão: 14.5%
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE KPIS COM SPARKLINES */}
      <div
        style={{
          background: "#F8FAFC",
          padding: 12,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
        }}
      >
        {[
          { l: "Total", v: "812", c: "#1B2A4A" },
          { l: "Leads", v: "247", c: "#3B82F6" },
          { l: "Interess.", v: "186", c: "#2D4373" },
          { l: "Qualif.", v: "94", c: "#A855F7" },
          { l: "Agend.", v: "68", c: "#E30613" },
          { l: "Fechado", v: "52", c: "#16A34A" },
          { l: "Receita", v: "R$47k", c: "#E30613" },
        ].map((k) => (
          <div
            key={k.l}
            style={{
              background: "#fff",
              border: "1px solid var(--slate-200)",
              borderRadius: 8,
              padding: "8px 9px 4px",
            }}
          >
            <div
              style={{
                fontSize: 7.5,
                fontFamily: "var(--font-mono)",
                color: "var(--slate-500)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {k.l}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--navy)",
                marginTop: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {k.v}
            </div>
            <div style={{ marginTop: 2 }}>{spark(k.c)}</div>
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
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a8.5 8.5 0 0 1-12.7 7.4L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z" />
                </svg>
              ),
            },
            {
              t: "Kanban de vendas",
              d: "Lead → Interesse → Qualificado → Agendado → Fechado. Visual e real.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="5" height="16" rx="1" />
                  <rect x="10" y="4" width="5" height="11" rx="1" />
                  <rect x="17" y="4" width="4" height="7" rx="1" />
                </svg>
              ),
            },
            {
              t: "Números de verdade",
              d: "Quem vendeu o quê, ticket médio, conversão. Sem achismo.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M7 17V9M12 17V5M17 17v-6" />
                </svg>
              ),
            },
          ].map((f, i) => (
            <Reveal key={f.t} delay={(i + 2) as 2 | 3 | 4}>
              <div className="card">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#fff",
                    border: "1px solid var(--slate-200)",
                    color: "var(--sv-red)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 20,
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                  }}
                >
                  <span style={{ width: 22, height: 22, display: "block" }}>
                    {f.icon}
                  </span>
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
    { h: "08:00", t: "presencial", nome: "Cliente A.", servico: "Vistoria de Transferência", placa: "ABC1D23", valor: 211, unidade: "Centro" },
    { h: "09:30", t: "presencial", nome: "Cliente B.", servico: "Cautelar Premium", placa: "FRB0527", valor: 280, unidade: "Norte" },
    { h: "11:00", t: "delivery", nome: "Cliente C.", servico: "Cautelar", placa: "XYZ7E89", valor: 211, unidade: "Centro" },
    { h: "14:00", t: "presencial", nome: "Cliente D.", servico: "Transferência (ECV)", placa: "JKL4M56", valor: 168, unidade: "Sul" },
  ];

  return (
    <div className="mockup">
      <div className="mockup-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="url">controle.supervisao.com/agenda</span>
      </div>
      {/* HEADER navy escuro com 4 chips */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1B2A4A 0%, #243556 100%)",
          color: "#fff",
          padding: "16px 20px 18px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            filter: "blur(30px)",
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
            gap: 10,
            alignItems: "stretch",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 13 }}>📅</span>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                }}
              >
                Agendamentos
              </div>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--st-green)",
                  marginTop: 2,
                  animation: "soffia-soft-pulse 1.6s infinite",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 9.5,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.02em",
              }}
            >
              Painel executivo · 4 hoje · 22 esta semana
            </div>
          </div>
          {/* 4 chips */}
          {[
            { l: "Hoje", v: "4", c: "rgba(255,255,255,0.10)", txt: "#fff" },
            { l: "Semana", v: "22", c: "rgba(255,255,255,0.10)", txt: "#fff" },
            { l: "Delivery hoje", v: "1", c: "rgba(255,255,255,0.10)", txt: "#fff" },
            { l: "Pgto pendente", v: "3", c: "rgba(227,6,19,0.18)", txt: "#FF8A91" },
          ].map((c) => (
            <div
              key={c.l}
              style={{
                background: c.c,
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.65)",
                  fontWeight: 700,
                }}
              >
                {c.l}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 16,
                  color: c.txt,
                  letterSpacing: "-0.02em",
                  marginTop: 1,
                }}
              >
                {c.v}
              </div>
            </div>
          ))}
        </div>
        {/* RECEITA PREVISTA */}
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid rgba(255,255,255,0.10)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 8.5,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 700,
            }}
          >
            Receita prevista (semana)
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            R$ 5.248
          </span>
        </div>
      </div>

      {/* LISTA TEMPORAL */}
      <div style={{ padding: 14, background: "#fff" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingBottom: 10,
            borderBottom: "1px solid var(--slate-100)",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "4px 9px",
              background: "var(--navy)",
              color: "#fff",
              borderRadius: 5,
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Todos
          </span>
          <span
            style={{
              padding: "4px 9px",
              background: "var(--slate-100)",
              color: "var(--slate-600)",
              borderRadius: 5,
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Presencial
          </span>
          <span
            style={{
              padding: "4px 9px",
              background: "var(--sv-plum-soft)",
              color: "#7E22CE",
              borderRadius: 5,
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Delivery
          </span>
          <span style={{ marginLeft: "auto", color: "var(--sv-red)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 10 }}>
            Hoje
          </span>
        </div>

        {/* Slots */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {slots.map((s) => (
            <div key={s.h} style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
              {/* Horário lateral */}
              <div
                style={{
                  width: 46,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  paddingTop: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 13,
                    color: "var(--navy)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.h}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: "var(--slate-500)",
                    fontFamily: "var(--font-mono)",
                    marginTop: 1,
                  }}
                >
                  1 agend.
                </div>
              </div>
              {/* Card */}
              <div
                style={{
                  flex: 1,
                  padding: "8px 11px",
                  background: "#fff",
                  border: "1px solid var(--slate-200)",
                  borderLeft: `3px solid ${s.t === "delivery" ? "#7E22CE" : "var(--st-green)"}`,
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        fontFamily: "var(--font-mono)",
                        color: "var(--slate-500)",
                        fontWeight: 700,
                      }}
                    >
                      {s.h}
                    </span>
                    <span
                      style={{
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: s.t === "delivery" ? "var(--sv-plum-soft)" : "var(--st-green-soft)",
                        color: s.t === "delivery" ? "#7E22CE" : "#15803D",
                        fontSize: 7.5,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.t}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--navy)",
                      letterSpacing: "-0.01em",
                      marginBottom: 1,
                    }}
                  >
                    {s.nome}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--slate-600)",
                      marginBottom: 3,
                    }}
                  >
                    {s.servico}
                  </div>
                  <div
                    style={{
                      fontSize: 8.5,
                      fontFamily: "var(--font-mono)",
                      color: "var(--slate-400)",
                      letterSpacing: "0.04em",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <span>🚗 {s.placa}</span>
                    <span>#{Math.random().toString(36).substr(2, 5).toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span
                    style={{
                      padding: "1.5px 6px",
                      background: "var(--slate-100)",
                      color: "var(--slate-600)",
                      borderRadius: 999,
                      fontSize: 7.5,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.unidade}
                  </span>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 14,
                      color: "var(--st-green)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    R$ {s.valor}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============== KANBAN ==============
function KanbanSection() {
  return (
    <section className="section section-pad" id="kanban">
      <div className="container">
        <Reveal>
          <span className="eyebrow">
            <span className="dot" /> Kanban de vendas
          </span>
        </Reveal>
        <Reveal delay={1} style={{ marginTop: 18 }}>
          <h2 className="h-section" style={{ maxWidth: 920 }}>
            Cada cliente em <em className="soffia-mark">uma etapa</em>.<br />
            Em tempo real.
          </h2>
        </Reveal>
        <Reveal delay={2} style={{ marginTop: 16 }}>
          <p className="lead">
            Arrasta e solta entre etapas. Tags automáticas categorizam o serviço.
            SLA acende quando demora. Sua unidade vê o funil de verdade — não a
            planilha que ninguém atualiza.
          </p>
        </Reveal>

        <Reveal delay={3} style={{ marginTop: 56 }}>
          <KanbanMockup />
        </Reveal>
      </div>
    </section>
  );
}

interface KanbanCard {
  nome: string;
  origem: string;
  tempo: string;
  msg: string;
  valor: string;
  agend: string;
  status: string;
  sla?: boolean;
}

function KanbanMockup() {
  // 5 colunas com bordas coloridas distintas (igual print real)
  const columns: Array<{ titulo: string; cor: string; count: number; cards: KanbanCard[] }> = [
    {
      titulo: "Lead",
      cor: "#EC4899", // pink
      count: 18,
      cards: [
        {
          nome: "Cliente L.",
          origem: "google",
          tempo: "1h",
          msg: "Olá, gostaria de saber mais sobre as vistorias...",
          valor: "—",
          agend: "—",
          status: "pendente",
        },
        {
          nome: "Cliente M.",
          origem: "meta",
          tempo: "7h",
          msg: "Vim pelo anúncio do Instagram",
          valor: "—",
          agend: "—",
          status: "pendente",
        },
      ],
    },
    {
      titulo: "Interesse",
      cor: "#14B8A6", // teal
      count: 22,
      cards: [
        {
          nome: "Cliente A.",
          origem: "vistoriacautelar",
          tempo: "4h",
          msg: "Gostaria de saber o valor da cautelar",
          valor: "—",
          agend: "—",
          status: "pendente",
        },
        {
          nome: "Cliente T.",
          origem: "vistoriacautelar",
          tempo: "10h",
          msg: "Olá, acessei pelo Google e gostaria...",
          valor: "—",
          agend: "—",
          status: "pendente",
        },
      ],
    },
    {
      titulo: "Qualificado",
      cor: "#3B82F6", // blue
      count: 14,
      cards: [
        {
          nome: "Cliente N.",
          origem: "vistoriacautelar",
          tempo: "9h",
          msg: "Olá, acessei pelo site",
          valor: "R$ 280",
          agend: "Sex 14h",
          status: "pendente",
          sla: false,
        },
        {
          nome: "Cliente G.",
          origem: "google",
          tempo: "5d",
          msg: "Olá, acessei pelo Google",
          valor: "R$ 211",
          agend: "—",
          status: "pendente",
          sla: true,
        },
      ],
    },
    {
      titulo: "Delivery",
      cor: "#10B981", // green
      count: 7,
      cards: [
        {
          nome: "Cliente V.",
          origem: "diagnosticoeletronico",
          tempo: "agora",
          msg: "Confirmado, pode vir no endereço",
          valor: "R$ 380",
          agend: "Hoje 16h",
          status: "pendente",
        },
        {
          nome: "Cliente L.",
          origem: "vistoriacautelar",
          tempo: "3h",
          msg: "Endereço enviado",
          valor: "R$ 211",
          agend: "Hoje 17h",
          status: "pendente",
        },
      ],
    },
    {
      titulo: "Agendado",
      cor: "#06B6D4", // cyan
      count: 12,
      cards: [
        {
          nome: "Cliente F.",
          origem: "google",
          tempo: "2h",
          msg: "Confirmado, até amanhã!",
          valor: "R$ 211",
          agend: "Amanhã 9h",
          status: "confirmado",
        },
      ],
    },
  ];

  return (
    <div className="mockup">
      {/* Mockup bar */}
      <div className="mockup-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="url">crm.supervisao.com/kanban</span>
      </div>

      {/* Toolbar do kanban */}
      <div
        style={{
          padding: "12px 16px",
          background: "#fff",
          borderBottom: "1px solid var(--slate-100)",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 180,
            background: "var(--slate-50)",
            border: "1px solid var(--slate-200)",
            borderRadius: 8,
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--slate-500)",
            fontFamily: "var(--font-sans)",
          }}
        >
          <span>🔍</span>
          <span>Pesquisar conversas...</span>
        </div>
        {/* Avatares dos atendentes */}
        <div style={{ display: "flex", alignItems: "center", gap: -4 }}>
          {["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#A855F7"].map((c, i) => (
            <div
              key={i}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: c,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 9,
                border: "2px solid #fff",
                marginLeft: i === 0 ? 0 : -6,
              }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          <span
            style={{
              fontSize: 10,
              color: "var(--slate-500)",
              fontFamily: "var(--font-mono)",
              marginLeft: 6,
              fontWeight: 600,
            }}
          >
            +3
          </span>
        </div>
        {/* Total ganho */}
        <div
          style={{
            background: "#D1FAE5",
            color: "#065F46",
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          R$ 12.480
        </div>
        {/* Calendário */}
        <div
          style={{
            background: "var(--slate-50)",
            border: "1px solid var(--slate-200)",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 10,
            color: "var(--slate-600)",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          📅 Calendário
        </div>
        {/* Conversas total */}
        <div
          style={{
            background: "var(--slate-50)",
            border: "1px solid var(--slate-200)",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 10,
            color: "var(--slate-600)",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          💬 412
        </div>
        {/* Unidade */}
        <div
          style={{
            background: "var(--slate-50)",
            border: "1px solid var(--slate-200)",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 10,
            color: "var(--navy)",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          UNIDADE CENTRO ⌄
        </div>
      </div>

      {/* Colunas do Kanban */}
      <div
        style={{
          padding: "16px 14px",
          background: "var(--slate-50)",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(180px, 1fr))",
            gap: 10,
            minWidth: 920,
          }}
        >
          {columns.map((col) => (
            <div key={col.titulo}>
              {/* Header da coluna com borda colorida grossa em cima */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "6px 6px 0 0",
                  borderTop: `3px solid ${col.cor}`,
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--navy)",
                  letterSpacing: "-0.01em",
                  borderLeft: "1px solid var(--slate-200)",
                  borderRight: "1px solid var(--slate-200)",
                }}
              >
                <span
                  style={{
                    color: "var(--slate-700)",
                    fontWeight: 800,
                  }}
                >
                  {col.count}
                </span>
                <span>{col.titulo}</span>
              </div>

              {/* Cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "8px 0",
                }}
              >
                {col.cards.map((card, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#fff",
                      borderRadius: 8,
                      border: `1px solid ${card.sla ? "rgba(239,68,68,0.5)" : "var(--slate-200)"}`,
                      padding: "10px",
                      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                    }}
                  >
                    {/* Header card */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 9,
                        color: "var(--slate-500)",
                        fontFamily: "var(--font-mono)",
                        marginBottom: 6,
                        fontWeight: 600,
                      }}
                    >
                      <span>(Atend.) {col.titulo === "Lead" ? "Centro" : col.titulo === "Interesse" ? "Norte" : "Centro"}</span>
                      <span style={{ color: card.sla ? "#EF4444" : "var(--slate-400)", fontWeight: card.sla ? 700 : 600 }}>
                        {card.tempo}
                        {card.sla && " · SLA!"}
                      </span>
                    </div>
                    {/* Avatar + nome */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#3B82F6",
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 700,
                          fontSize: 10,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {card.nome[card.nome.length - 2]}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: 12,
                          color: "var(--navy)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {card.nome}
                      </div>
                    </div>
                    {/* Sub-nome */}
                    <div
                      style={{
                        fontSize: 9.5,
                        color: "var(--slate-500)",
                        marginBottom: 6,
                        fontStyle: "italic",
                      }}
                    >
                      Atendente
                    </div>
                    {/* Mensagem */}
                    <div
                      style={{
                        background: "var(--slate-50)",
                        borderRadius: 6,
                        padding: "6px 8px",
                        fontSize: 10,
                        color: "var(--slate-700)",
                        lineHeight: 1.35,
                        marginBottom: 8,
                        border: "1px solid var(--slate-100)",
                      }}
                    >
                      {card.msg}
                    </div>
                    {/* Grid Valor + Agendamento */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 4,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          background: "var(--slate-50)",
                          border: "1px solid var(--slate-100)",
                          borderRadius: 6,
                          padding: "5px 7px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 7,
                            fontFamily: "var(--font-mono)",
                            color: "var(--slate-500)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          Valor total
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 11,
                            color: "var(--st-green)",
                            letterSpacing: "-0.01em",
                            marginTop: 1,
                          }}
                        >
                          {card.valor}
                        </div>
                      </div>
                      <div
                        style={{
                          background: "var(--slate-50)",
                          border: "1px solid var(--slate-100)",
                          borderRadius: 6,
                          padding: "5px 7px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 7,
                            fontFamily: "var(--font-mono)",
                            color: "var(--slate-500)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          Agendamento
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 11,
                            color: "var(--slate-700)",
                            letterSpacing: "-0.01em",
                            marginTop: 1,
                          }}
                        >
                          {card.agend}
                        </div>
                      </div>
                    </div>
                    {/* Footer: tag + status */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 6px",
                          background: "var(--sv-plum-soft)",
                          color: "#6D28D9",
                          borderRadius: 4,
                          fontSize: 8,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {card.origem}
                      </span>
                      <span
                        style={{
                          padding: "2px 6px",
                          background: card.status === "confirmado" ? "var(--st-green-soft)" : "#FEF3C7",
                          color: card.status === "confirmado" ? "#15803D" : "#92400E",
                          borderRadius: 4,
                          fontSize: 8,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {card.status}
                      </span>
                    </div>
                  </div>
                ))}
                {col.cards.length < col.count && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 9,
                      color: "var(--slate-400)",
                      fontFamily: "var(--font-mono)",
                      padding: 4,
                      fontWeight: 600,
                    }}
                  >
                    + {col.count - col.cards.length} cards
                  </div>
                )}
              </div>
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
              {
                t: "Conversas",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a8.5 8.5 0 0 1-12.7 7.4L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z" />
                  </svg>
                ),
              },
              {
                t: "Kanban",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="5" height="16" rx="1" />
                    <rect x="10" y="4" width="5" height="11" rx="1" />
                    <rect x="17" y="4" width="4" height="7" rx="1" />
                  </svg>
                ),
              },
              {
                t: "Agenda",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                ),
              },
              {
                t: "Relatórios",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18M7 17V9M12 17V5M17 17v-6" />
                  </svg>
                ),
              },
              {
                t: "Etiquetas",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                ),
              },
            ].map((area) => (
              <div
                key={area.t}
                style={{
                  padding: "20px 16px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(227,6,19,0.10)",
                    border: "1px solid rgba(227,6,19,0.25)",
                    color: "var(--sv-red)",
                    margin: "0 auto 12px",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <span style={{ width: 20, height: 20, display: "block" }}>
                    {area.icon}
                  </span>
                </div>
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
      "kanban",
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
    kanban: "Kanban",
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
