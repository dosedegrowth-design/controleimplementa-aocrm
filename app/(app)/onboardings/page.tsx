import { createServiceClient } from "@/lib/supabase/server";
import { OnboardingsClient } from "./onboardings-client";

export const dynamic = "force-dynamic";

interface OnboardingSubmission {
  id: string;
  token_publico: string;
  status: "em_andamento" | "enviado" | "aprovado" | "rejeitado" | "provisionado";
  step_atual: number;
  nome_unidade: string | null;
  cidade: string | null;
  estado: string | null;
  nome_franqueado: string | null;
  email_franqueado: string | null;
  telefone_franqueado: string | null;
  telefone_inbox: string | null;
  agentes: { nome: string; email: string; perfil: string }[];
  observacoes: string | null;
  provider_chatwoot: "whatsapp_cloud" | "waha" | null;
  enviado_em: string | null;
  aprovado_em: string | null;
  rejeitado_em: string | null;
  rejeicao_motivo: string | null;
  provisionado_em: string | null;
  unidade_id: string | null;
  chatwoot_account_id: number | null;
  criado_em: string;
  atualizado_em: string;
}

export default async function OnboardingsPage() {
  const service = createServiceClient();

  const { data: submissoes } = await service
    .from("onboarding_submissoes")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(200);

  return <OnboardingsClient submissoes={(submissoes || []) as OnboardingSubmission[]} />;
}
