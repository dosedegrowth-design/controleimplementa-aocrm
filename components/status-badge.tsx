import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, PRIORIDADE_LABELS } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const variant = status as
    | "pendente"
    | "em_andamento"
    | "concluido"
    | "bloqueado"
    | undefined;
  return <Badge variant={variant || "default"}>{STATUS_LABELS[status] || status}</Badge>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  const variant = prioridade as
    | "urgente"
    | "alta"
    | "normal"
    | "baixa"
    | undefined;
  return <Badge variant={variant || "default"}>{PRIORIDADE_LABELS[prioridade] || prioridade}</Badge>;
}
