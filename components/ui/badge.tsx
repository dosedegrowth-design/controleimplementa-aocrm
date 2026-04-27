import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        pendente: "bg-slate-100 text-slate-700",
        em_andamento: "bg-blue-100 text-blue-800",
        concluido: "bg-emerald-100 text-emerald-800",
        bloqueado: "bg-red-100 text-red-800",
        urgente: "bg-red-600 text-white",
        alta: "bg-orange-100 text-orange-800",
        normal: "bg-slate-100 text-slate-700",
        baixa: "bg-slate-50 text-slate-500",
        outline: "border border-[var(--border)] text-[var(--foreground)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
