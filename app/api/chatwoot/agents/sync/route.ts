/**
 * POST /api/chatwoot/agents/sync
 * Sincroniza todos os agentes de todas as accounts via Chatwoot API.
 * Salva em crm_onboarding.chatwoot_agents.
 */
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { chatwootGet, ChatwootError, type ChatwootAgent } from "@/lib/chatwoot/client";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const service = createServiceClient();

  const { data: accounts, error: accErr } = await service
    .from("chatwoot_accounts")
    .select("chatwoot_account_id, nome");

  if (accErr) {
    return NextResponse.json({ error: accErr.message }, { status: 500 });
  }

  const result = {
    total_accounts: accounts?.length || 0,
    accounts_processadas: 0,
    agentes_inseridos: 0,
    agentes_atualizados: 0,
    erros: [] as { account_id: number; mensagem: string }[],
  };

  for (const acc of accounts || []) {
    try {
      const agentes = await chatwootGet<ChatwootAgent[]>(
        `/api/v1/accounts/${acc.chatwoot_account_id}/agents`,
        { timeout: 15000 },
      );

      if (!Array.isArray(agentes)) continue;

      for (const ag of agentes) {
        // upsert: tenta atualizar; se não existir, insere
        const { data: existing } = await service
          .from("chatwoot_agents")
          .select("id")
          .eq("chatwoot_user_id", ag.id)
          .eq("chatwoot_account_id", acc.chatwoot_account_id)
          .maybeSingle();

        if (existing) {
          await service.from("chatwoot_agents").update({
            nome: ag.name,
            email: ag.email?.toLowerCase() || null,
            role: ag.role,
            confirmed: ag.confirmed,
            ultima_sync: new Date().toISOString(),
          }).eq("id", existing.id);
          result.agentes_atualizados++;
        } else {
          const { error } = await service.from("chatwoot_agents").insert({
            chatwoot_user_id: ag.id,
            chatwoot_account_id: acc.chatwoot_account_id,
            nome: ag.name,
            email: ag.email?.toLowerCase() || null,
            role: ag.role,
            confirmed: ag.confirmed,
          });
          if (!error) result.agentes_inseridos++;
        }
      }

      result.accounts_processadas++;
    } catch (err) {
      const msg = err instanceof ChatwootError
        ? `${err.status}: ${err.message}`
        : err instanceof Error ? err.message : String(err);
      result.erros.push({ account_id: acc.chatwoot_account_id, mensagem: msg });
    }
  }

  return NextResponse.json(result);
}
