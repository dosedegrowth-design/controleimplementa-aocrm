"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  hint?: string;
  accent?: "default" | "navy" | "red" | "success" | "warn" | "danger" | "info";
  delay?: number;
  onClick?: () => void;
  highlight?: boolean;
}

const ACCENT_MAP: Record<string, { bg: string; text: string }> = {
  default: { bg: "#64748B15", text: "#475569" },
  navy: { bg: "#1B2A4A15", text: "#1B2A4A" },
  red: { bg: "#E31E2415", text: "#E31E24" },
  success: { bg: "#16A34A15", text: "#16A34A" },
  warn: { bg: "#F59E0B15", text: "#B45309" },
  danger: { bg: "#DC262615", text: "#DC2626" },
  info: { bg: "#4A6BAB15", text: "#1B2A4A" },
};

/**
 * KPI card padrão SuperVisão.
 * Visual alinhado com dash-supervisao: label uppercase + ícone
 * num quadradinho colorido + valor grande com tabular-nums + hint.
 */
export function KPICard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "default",
  delay = 0,
  onClick,
  highlight = false,
}: KPICardProps) {
  const ac = ACCENT_MAP[accent];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={onClick ? { y: -2 } : undefined}
      className={cn(
        "bg-white rounded-xl border p-3 md:p-4 text-left transition-shadow hover:shadow-md disabled:cursor-default",
        highlight
          ? "border-[#2D4373]/30 bg-[#1B2A4A]/5"
          : "border-slate-200",
        onClick && "cursor-pointer",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          {label}
        </p>
        {Icon && (
          <div
            className="p-1.5 rounded-lg shrink-0"
            style={{ backgroundColor: ac.bg, color: ac.text }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <p
        className="text-base sm:text-lg md:text-xl font-bold text-[#1B2A4A] tabular-nums truncate"
      >
        {value}
      </p>
      {hint && (
        <p className="text-[10px] md:text-[11px] text-slate-500 mt-1 truncate">
          {hint}
        </p>
      )}
    </motion.button>
  );
}
