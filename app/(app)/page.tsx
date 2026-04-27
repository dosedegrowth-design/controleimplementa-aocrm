import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import type { FunilEtapa, UnidadeResumo, EtapaOnboarding } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [unidadesRes, funilRes, etapasRes] = await Promise.all([
    supabase.from("v_unidades_resumo").select("*").order("submitted_at", { ascending: false }),
    supabase.from("v_funil_etapas").select("*"),
    supabase.from("etapas_onboarding").select("id, unidade_id, etapa, ordem, status, iniciado_em, concluido_em, concluido_por, observacao, atualizado_em"),
  ]);

  const unidades = (unidadesRes.data || []) as UnidadeResumo[];
  const funil = (funilRes.data || []) as FunilEtapa[];
  const etapas = (etapasRes.data || []) as EtapaOnboarding[];

  return <DashboardClient unidades={unidades} funil={funil} etapas={etapas} />;
}
