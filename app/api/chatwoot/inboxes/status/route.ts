/**
 * GET /api/chatwoot/inboxes/status
 * Retorna status atual de todas as inboxes (lê do cache local em chatwoot_status_inbox).
 *
 * POST /api/chatwoot/inboxes/status
 * Força verificação ao vivo de todas as inboxes WAHA via Chatwoot API.
 */
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { chatwootGet, ChatwootError, type ChatwootInbox } from "@/lib/chatwoot/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("v_chatwoot_status_atual")
    .select("*")
    .order("chatwoot_account_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ statuses: data });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const service = createServiceClient();

  // Pega todas as accounts com inbox configurada
  const { data: accounts, error: accErr } = await service
    .from("chatwoot_accounts")
    .select("chatwoot_account_id, inbox_id, provider, nome")
    .not("inbox_id", "is", null);

  if (accErr) {
    return NextResponse.json({ error: accErr.message }, { status: 500 });
  }

  const result = {
    total: accounts?.length || 0,
    verificados: 0,
    online: 0,
    offline: 0,
    cloud_na: 0,
    erros: [] as { account_id: number; mensagem: string }[],
    detalhes: [] as Array<{
      account_id: number;
      inbox_id: number;
      nome: string;
      status: string;
      anterior: string | null;
    }>,
  };

  for (const acc of accounts || []) {
    try {
      // Cloud não tem provider_connection — marca como 'na'
      if (acc.provider === "whatsapp_cloud") {
        await registrarStatus(service, acc.chatwoot_account_id, acc.inbox_id, "na");
        result.cloud_na++;
        result.verificados++;
        result.detalhes.push({
          account_id: acc.chatwoot_account_id,
          inbox_id: acc.inbox_id,
          nome: acc.nome,
          status: "na",
          anterior: null,
        });
        continue;
      }

      // WAHA: lê inbox e pega provider_connection.connection
      const inbox = await chatwootGet<ChatwootInbox>(
        `/api/v1/accounts/${acc.chatwoot_account_id}/inboxes/${acc.inbox_id}`,
        { timeout: 10000 },
      );
      const conn = inbox?.provider_connection?.connection;
      const status = conn === "open" ? "open" : conn === "close" ? "close" : "na";

      const { anterior } = await registrarStatus(service, acc.chatwoot_account_id, acc.inbox_id, status);

      if (status === "open") result.online++;
      else if (status === "close") result.offline++;
      else result.cloud_na++;
      result.verificados++;

      result.detalhes.push({
        account_id: acc.chatwoot_account_id,
        inbox_id: acc.inbox_id,
        nome: acc.nome,
        status,
        anterior,
      });
    } catch (err) {
      const msg = err instanceof ChatwootError
        ? `${err.status}: ${err.message}`
        : err instanceof Error ? err.message : String(err);
      result.erros.push({ account_id: acc.chatwoot_account_id, mensagem: msg });
      // Registra como erro
      await registrarStatus(service, acc.chatwoot_account_id, acc.inbox_id!, "error", msg);
    }
  }

  return NextResponse.json(result);
}

async function registrarStatus(
  service: ReturnType<typeof createServiceClient>,
  accountId: number,
  inboxId: number,
  novoStatus: string,
  erroMsg?: string,
): Promise<{ anterior: string | null }> {
  // Pega último registro pra detectar mudança
  const { data: ultimo } = await service
    .from("chatwoot_status_inbox")
    .select("connection_status")
    .eq("chatwoot_account_id", accountId)
    .eq("inbox_id", inboxId)
    .order("verificado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  const anterior = ultimo?.connection_status || null;
  const mudou = anterior !== null && anterior !== novoStatus;

  await service.from("chatwoot_status_inbox").insert({
    chatwoot_account_id: accountId,
    inbox_id: inboxId,
    connection_status: novoStatus,
    status_anterior: anterior,
    mudou,
    mensagem_erro: erroMsg || null,
  });

  return { anterior };
}
