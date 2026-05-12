"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  kpis?: ReactNode;
  bottom?: ReactNode;
}

/**
 * Hero gradient navy padrão SuperVisão (mesmo do dash-supervisao):
 * - Background linear-gradient navy → navy-2 → navy-3
 * - Blur balls decorativas em branco/5
 * - Eyebrow opcional + título + subtítulo
 * - Actions à direita (botões)
 * - KPIs opcionais (renderizados num grid no rodapé)
 * - Bottom bar opcional (info secundária com backdrop-blur preto/15)
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  icon,
  actions,
  kpis,
  bottom,
}: PageHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative rounded-xl overflow-hidden shadow-sm hero-gradient"
    >
      {/* Blur balls decorativas */}
      <div
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -right-8 bottom-0 w-32 h-32 rounded-full bg-white/5 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-white/5 pointer-events-none"
        aria-hidden
      />

      {/* Conteúdo */}
      <div className="relative px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/60 font-semibold mb-1">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-white/70 text-xs md:text-sm mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0 flex gap-2">{actions}</div>}
        </div>

        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
            {kpis}
          </div>
        )}
      </div>

      {bottom && (
        <div className="relative px-5 md:px-6 py-2.5 bg-black/15 backdrop-blur-sm border-t border-white/10 text-white/80 text-xs flex items-center gap-3">
          {bottom}
        </div>
      )}
    </motion.div>
  );
}

interface HeroKPIProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: "default" | "danger" | "success";
}

/**
 * KPI dentro do Hero (fundo escuro com backdrop-blur).
 */
export function HeroKPI({
  label,
  value,
  icon,
  accent = "default",
}: HeroKPIProps) {
  const accentMap = {
    default: "bg-white/10 border-white/15 text-white",
    danger: "bg-red-500/15 border-red-300/30 text-red-100",
    success: "bg-emerald-500/15 border-emerald-300/30 text-emerald-100",
  };

  const valueColor = {
    default: "text-white",
    danger: "text-red-100",
    success: "text-emerald-100",
  };

  return (
    <div
      className={`px-3 py-2.5 rounded-lg backdrop-blur-sm border ${accentMap[accent]}`}
    >
      <div className="flex items-center gap-1.5 text-white/70 text-[10px] uppercase tracking-wider font-semibold">
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={`text-lg md:text-xl font-bold tabular-nums leading-tight mt-0.5 ${valueColor[accent]}`}
      >
        {value}
      </p>
    </div>
  );
}
