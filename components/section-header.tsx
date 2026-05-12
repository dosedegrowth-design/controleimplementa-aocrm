import type { ReactNode } from "react";

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/**
 * Section header padrão (entre seções de uma página).
 * Visual: ícone num círculo navy/5 + título h2 navy + subtítulo opcional.
 */
export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center text-[#1B2A4A] shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-bold text-[#1B2A4A] leading-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
