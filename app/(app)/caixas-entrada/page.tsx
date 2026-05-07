import { createClient } from "@/lib/supabase/server";
import { CaixasEntradaClient } from "./caixas-entrada-client";

export const dynamic = "force-dynamic";

interface InboxStatus {
  chatwoot_account_id: number;
  inbox_id: number | null;
  account_nome: string;
  inbox_nome: string | null;
  telefone: string | null;
  provider: string | null;
  connection_status: string | null;
  verificado_em: string | null;
  status_anterior: string | null;
  mudou: boolean | null;
  mensagem_erro: string | null;
}

interface ChatwootAccount {
  chatwoot_account_id: number;
  nome: string;
  inbox_id: number | null;
  inbox_nome: string | null;
  telefone: string | null;
  provider: string | null;
  ultima_sync: string | null;
}

interface QuedaRecente {
  id: string;
  chatwoot_account_id: number;
  inbox_id: number;
  connection_status: string;
  status_anterior: string | null;
  verificado_em: string;
  mensagem_erro: string | null;
}

export default async function CaixasEntradaPage() {
  const supabase = await createClient();

  const [accountsRes, statusRes, quedasRes] = await Promise.all([
    supabase
      .from("chatwoot_accounts")
      .select("chatwoot_account_id, nome, inbox_id, inbox_nome, telefone, provider, ultima_sync")
      .order("chatwoot_account_id"),
    supabase
      .from("v_chatwoot_status_atual")
      .select("*"),
    supabase
      .from("chatwoot_status_inbox")
      .select("id, chatwoot_account_id, inbox_id, connection_status, status_anterior, verificado_em, mensagem_erro")
      .eq("mudou", true)
      .gte("verificado_em", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("verificado_em", { ascending: false })
      .limit(50),
  ]);

  const accounts = (accountsRes.data || []) as ChatwootAccount[];
  const statuses = (statusRes.data || []) as InboxStatus[];
  const quedas = (quedasRes.data || []) as QuedaRecente[];

  return <CaixasEntradaClient accounts={accounts} statuses={statuses} quedas={quedas} />;
}
