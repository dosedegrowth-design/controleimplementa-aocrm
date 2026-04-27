import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  hint?: string;
  accent?: "default" | "success" | "warn" | "danger";
}

export function KPICard({ label, value, icon: Icon, hint, accent = "default" }: KPICardProps) {
  const accentMap: Record<string, string> = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-[#1B2A4A]">
              {value}
            </p>
            {hint && (
              <p className="text-xs text-slate-500">{hint}</p>
            )}
          </div>
          {Icon && (
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accentMap[accent])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
