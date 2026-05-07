/**
 * GET /api/chatwoot/inboxes/status
 * Retorna status atual de todas as inboxes (lê do cache local).
 *
 * POST /api/chatwoot/inboxes/status
 * Força verificação ao vivo:
 *   - WAHA: consulta WAHA API direto (fonte de verdade)
 *   - Cloud: marca como N/A (Meta gerencia)
 *
 * IMPORTANTE: O campo provider_connection.connection do Chatwoot
 * está DESATUALIZADO. Sempre usar WAHA API como fonte de verdade.
 */
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { chatwootGet, ChatwootError, type ChatwootInbox } from "@/lib/chatwoot/client";

export const dynamic = "force-dynamic";

const WAHA_BASE_URL = process.env.WAHA_BASE_URL || "https://waha.aifocus.dev";
const WAHA_TOKEN = process.env.WAHA_TOKEN || "dc372bd703c2404387bbfc6a7cdf656b";

interface WahaSession {
  name: string;
  status: string;
}

async function fetchWahaSessions(): Promise<Map<string, string>> {
  const r = await fetch(`${WAHA_BASE_URL}/api/sessions`, {
    headers: { "X-Api-Key": WAHA_TOKEN },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`WAHA API ${r.status}`);
  const sessions = (await r.json()) as WahaSession[];
  const map = new Map<string, string>();
  for (const s of sessions) map.set(s.name, s.status);
  return map;
}

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

  const { data: accounts, error: accErr } = await service
    .from("chatwoot_accounts")
    .select("chatwoot_account_id, inbox_id, provider, nome, session_name")
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
  };

  // Carrega TODAS sessões WAHA de uma vez (1 request, mais eficiente)
  let wahaSessions: Map<string, string>;
  try {
    wahaSessions = await fetchWahaSessions();
  } catch (err) {
    return NextResponse.json(
      { error: `Falha ao consultar WAHA: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 },
    );
  }

  for (const acc of accounts || []) {
    try {
      // Cloud: Meta gerencia, marca como N/A
      if (acc.provider === "whatsapp_cloud") {
        await registrarStatus(service, acc.chatwoot_account_id, acc.inbox_id, "na");
        result.cloud_na++;
        result.verificados++;
        continue;
      }

      // WAHA: precisa do session_name pra consultar a fonte de verdade
      let sessionName = acc.session_name as string | null;

      if (!sessionName) {
        // Busca via Chatwoot pra atualizar cache
        try {
          const inbox = await chatwootGet<ChatwootInbox>(
            `/api/v1/accounts/${acc.chatwoot_account_id}/inboxes/${acc.inbox_id}`,
            { timeout: 10000 },
          );
          const cfg = inbox?.provider_config as { session_name?: string } | undefined;
          sessionName = cfg?.session_name || null;
          if (sessionName) {
            await service
              .from("chatwoot_accounts")
              .update({ session_name: sessionName })
              .eq("chatwoot_account_id", acc.chatwoot_account_id);
          }
        } catch (err) {
          if (err instanceof ChatwootError && err.status === 404) {
            await registrarStatus(
              service,
              acc.chatwoot_account_id,
              acc.inbox_id,
              "error",
              "Inbox deletada do Chatwoot",
            );
            result.erros.push({
              account_id: acc.chatwoot_account_id,
              mensagem: "Inbox não existe mais",
            });
            continue;
          }
          throw err;
        }
      }

      if (!sessionName) {
        await registrarStatus(
          service,
          acc.chatwoot_account_id,
          acc.inbox_id,
          "error",
          "session_name não configurado na inbox",
        );
        result.erros.push({
          account_id: acc.chatwoot_account_id,
          mensagem: "session_name vazio",
        });
        continue;
      }

      // Cruza com WAHA real (fonte de verdade)
      const wahaStatus = wahaSessions.get(sessionName);
      let connStatus: string;
      let erroMsg: string | undefined;

      if (wahaStatus === "WORKING") {
        connStatus = "open";
        result.online++;
      } else if (wahaStatus === undefined) {
        connStatus = "close";
        erroMsg = `Session "${sessionName}" não existe na WAHA`;
        result.offline++;
      } else {
        connStatus = "close";
        erroMsg = `WAHA: ${wahaStatus}`;
        result.offline++;
      }

      await registrarStatus(
        service,
        acc.chatwoot_account_id,
        acc.inbox_id,
        connStatus,
        erroMsg,
      );
      result.verificados++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.erros.push({ account_id: acc.chatwoot_account_id, mensagem: msg });
      await registrarStatus(
        service,
        acc.chatwoot_account_id,
        acc.inbox_id!,
        "error",
        msg,
      );
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
): Promise<void> {
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
}
