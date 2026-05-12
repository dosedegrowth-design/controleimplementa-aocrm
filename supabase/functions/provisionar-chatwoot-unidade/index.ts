// ═══════════════════════════════════════════════════════════════════════════
// Edge Function: provisionar-chatwoot-unidade
// ─────────────────────────────────────────────────────────────────────────
// Provisiona uma unidade no Chatwoot seguindo o Padrão Brasília.
//
// Sequência (27 chamadas API):
//   1. POST /platform/.../accounts            → account_id
//   2. POST .../inboxes (cloud OU waha)        → inbox_id
//   3. POST .../agents × 6 (5 globais + 1 local)
//   4. POST .../funnels                        → funnel_id
//   5. PATCH .../funnels/{id} (stages)
//   6. POST .../labels × 13
//   7. POST .../automation_rules × 3
//   8. POST .../dashboard_apps × 2
//
// Body: { unidade_id: string }
//
// Idempotente: se a unidade já tem chatwoot_account_id, faz dry-run e retorna
// o estado atual. Pra forçar reprovisionamento, passar { force: true }.
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CHATWOOT_BASE_URL = Deno.env.get("CHATWOOT_BASE_URL") || "https://crmsupervisao.com";
const CHATWOOT_TOKEN = Deno.env.get("CHATWOOT_TOKEN") || "HwHKhyq4EYHehEa8ydn3zwcM";
const CHATWOOT_PLATFORM_TOKEN = Deno.env.get("CHATWOOT_PLATFORM_TOKEN") ||
  "9213d3cae70a9792ea15f1cf05ba2f338d9b77be665d0f0236d3a9ae849caeb5";

const WAHA_API_URL = Deno.env.get("WAHA_API_URL") || "https://waha.aifocus.dev";
const WAHA_ADMIN_TOKEN = Deno.env.get("WAHA_ADMIN_TOKEN") || "dc372bd703c2404387bbfc6a7cdf656b";

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

interface Step {
  step: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

function justDigitsPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("55") ? `+${d}` : `+55${d}`;
}

async function chatwootCall<T>(
  method: string,
  path: string,
  body: unknown,
  usePlatformToken = false,
): Promise<T> {
  const token = usePlatformToken ? CHATWOOT_PLATFORM_TOKEN : CHATWOOT_TOKEN;
  const url = `${CHATWOOT_BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      api_access_token: token,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  if (!res.ok) {
    const errMsg = typeof parsed === "object" && parsed && "message" in parsed
      ? String((parsed as { message: string }).message)
      : `HTTP ${res.status}`;
    throw new Error(`${method} ${path}: ${errMsg} (response: ${text.slice(0, 300)})`);
  }
  return parsed as T;
}

// Provisão agente — se email já existe, ignora erro 422
async function tryCreateAgent(
  accountId: number,
  name: string,
  email: string,
): Promise<{ ok: boolean; existed: boolean; error?: string }> {
  try {
    await chatwootCall(
      "POST",
      `/api/v1/accounts/${accountId}/agents`,
      { name, email, role: "administrator" },
    );
    return { ok: true, existed: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Email já existe no Chatwoot — não é erro fatal
    if (/already|taken|exist|conflict/i.test(msg)) {
      return { ok: true, existed: true };
    }
    return { ok: false, existed: false, error: msg };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

interface UnidadeRow {
  id: string;
  nome_unidade: string;
  nome_franqueado: string | null;
  numeros_crm: string[] | null;
  provider_chatwoot: "whatsapp_cloud" | "waha" | null;
  chatwoot_account_id: number | null;
  chatwoot_inbox_id: number | null;
  chatwoot_funnel_id: number | null;
}

interface AgenteRow {
  nome: string | null;
  email: string | null;
}

async function provisionarUnidade(unidadeId: string, force: boolean) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: "crm_onboarding" },
  });

  const steps: Step[] = [];
  const rollbackAccountId: { id: number | null } = { id: null };

  function logStep(name: string, ok: boolean, data?: unknown, error?: string) {
    steps.push({ step: name, ok, data, error });
  }

  try {
    // ─── 0. Carrega unidade + agentes ────────────────────────────────────
    const { data: unidade, error: unidadeErr } = await supabase
      .from("unidades")
      .select(
        "id, nome_unidade, nome_franqueado, numeros_crm, provider_chatwoot, chatwoot_account_id, chatwoot_inbox_id, chatwoot_funnel_id",
      )
      .eq("id", unidadeId)
      .maybeSingle();

    if (unidadeErr || !unidade) {
      throw new Error(`Unidade não encontrada: ${unidadeErr?.message || "vazia"}`);
    }
    const u = unidade as UnidadeRow;

    if (!u.provider_chatwoot) {
      throw new Error("Unidade sem provider_chatwoot definido. Aprove primeiro.");
    }

    // Idempotência: se já tem account_id e não é force, retorna
    if (u.chatwoot_account_id && !force) {
      return {
        ok: true,
        skipped: true,
        message: `Unidade já provisionada (account #${u.chatwoot_account_id}). Use force=true pra reprovisionar.`,
        chatwoot: {
          account_id: u.chatwoot_account_id,
          inbox_id: u.chatwoot_inbox_id,
          funnel_id: u.chatwoot_funnel_id,
        },
      };
    }

    // Agentes da unidade
    const { data: agentesData } = await supabase
      .from("agentes")
      .select("nome, email")
      .eq("unidade_id", unidadeId)
      .order("criado_em");

    const agentesLocais = (agentesData || []) as AgenteRow[];

    const nomeUnidade = u.nome_unidade.trim();
    const slug = slugify(nomeUnidade);
    const provider = u.provider_chatwoot;
    const telefone = u.numeros_crm && u.numeros_crm.length > 0
      ? justDigitsPhone(u.numeros_crm[0])
      : null;

    // ─── 1. CRIA ACCOUNT (Platform API) ──────────────────────────────────
    const accountResp = await chatwootCall<{ id: number }>(
      "POST",
      "/platform/api/v1/accounts",
      { name: `SPV - ${nomeUnidade}`, locale: "pt_BR" },
      true, // usePlatformToken
    );
    const accountId = accountResp.id;
    rollbackAccountId.id = accountId;
    logStep("1. Account criada", true, { id: accountId, nome: `SPV - ${nomeUnidade}` });

    // ─── 2. CRIA INBOX ───────────────────────────────────────────────────
    let inboxBody: Record<string, unknown>;
    if (provider === "whatsapp_cloud") {
      inboxBody = {
        name: `(Soffia) ${nomeUnidade}`,
        channel: {
          type: "whatsapp",
          phone_number: telefone || "+5511000000000",
          provider: "whatsapp_cloud",
          provider_config: {
            api_key: Deno.env.get("META_API_KEY") || "PENDING_META_API_KEY",
            waba_id: Deno.env.get("META_WABA_ID") || "PENDING_WABA_ID",
            phone_number_id: Deno.env.get("META_PHONE_NUMBER_ID") || "PENDING_PHONE_ID",
            business_account_id: Deno.env.get("META_BUSINESS_ACCOUNT_ID") || "PENDING_BIZ_ID",
          },
        },
      };
    } else {
      // WAHA
      inboxBody = {
        name: `Soffia-${slug}`,
        channel: {
          type: "whatsapp",
          phone_number: telefone || "+5511000000000",
          provider: "waha",
          provider_config: {
            api_url: WAHA_API_URL,
            admin_token: WAHA_ADMIN_TOKEN,
            session_name: slug,
            ignore_groups: true,
          },
        },
      };
    }
    const inboxResp = await chatwootCall<{ id: number }>(
      "POST",
      `/api/v1/accounts/${accountId}/inboxes`,
      inboxBody,
    );
    const inboxId = inboxResp.id;
    logStep("2. Inbox criada", true, { id: inboxId, provider, slug });

    // ─── 3. AGENTES (5 globais + N locais) ───────────────────────────────
    const agentesGlobais = [
      { name: "Renato Carlet", email: "renato.carlet@supervisao.com" },
      { name: "Leo Souza", email: "leosouza@supervisao.com" },
      { name: "Rodrigo", email: "rodrigo.ribeirinho@supervisao.com" },
      { name: "Cris Dmais1", email: "cris@dmais1.com.br" },
      { name: "Dose De Growth", email: "dosedegrowth@gmail.com" },
    ];
    const agentResults: Array<{ email: string; ok: boolean; existed: boolean; error?: string }> = [];

    for (const ag of agentesGlobais) {
      const r = await tryCreateAgent(accountId, ag.name, ag.email);
      agentResults.push({ email: ag.email, ...r });
    }
    // Locais (do cadastro)
    for (const ag of agentesLocais) {
      if (!ag.nome || !ag.email) continue;
      const r = await tryCreateAgent(accountId, ag.nome, ag.email);
      agentResults.push({ email: ag.email, ...r });
    }
    logStep("3. Agentes processados", true, agentResults);

    // ─── 4. FUNNEL ───────────────────────────────────────────────────────
    const funnelResp = await chatwootCall<{ id: number }>(
      "POST",
      `/api/v1/accounts/${accountId}/funnels`,
      { name: `SPV - ${nomeUnidade}` },
    );
    const funnelId = funnelResp.id;
    logStep("4. Funnel criado", true, { id: funnelId });

    // ─── 5. STAGES (via PATCH) ───────────────────────────────────────────
    const stagesBody = {
      stages: {
        [`lead_${slug}`]: {
          label: `Lead - ${nomeUnidade}`,
          color: "#f80dad",
          position: 0,
          sla_hours: 24,
          description: "",
        },
        [`interesse_-_${slug}`]: {
          label: `Interesse - ${nomeUnidade}`,
          color: "#13fbcd",
          position: 1,
          description: "",
          allow_new_conversations: true,
        },
        [`qualificado_${slug}`]: {
          label: `Qualificado - ${nomeUnidade}`,
          color: "#06B6D4",
          position: 2,
          sla_hours: 24,
          description: "",
        },
        [`delivery_${slug}`]: {
          label: `Delivery - ${nomeUnidade}`,
          color: "#01f9a6",
          position: 3,
          sla_hours: 24,
          description: "",
        },
        [`agendado_${slug}`]: {
          label: `Agendado - ${nomeUnidade}`,
          color: "#06b0f9",
          position: 4,
          sla_hours: 24,
          description: "",
        },
        [`fechado_${slug}`]: {
          label: `Fechado - ${nomeUnidade}`,
          color: "#0af50e",
          position: 5,
          sla_hours: 24,
          description: "",
        },
        [`perdido_${slug}`]: {
          label: `Perdido - ${nomeUnidade}`,
          color: "#ff0000",
          position: 6,
          sla_hours: 24,
          description: "",
        },
      },
      settings: {
        icon: "📊",
        default_stage: `interesse_-_${slug}`,
        allow_manual_move: true,
        notify_on_stage_change: true,
        enable_sla: false,
        auto_move: false,
        enable_automation: false,
        conversation_limit: 0,
      },
    };
    await chatwootCall(
      "PATCH",
      `/api/v1/accounts/${accountId}/funnels/${funnelId}`,
      stagesBody,
    );
    logStep("5. Stages criados", true, { count: 7 });

    // ─── 6. LABELS (13) ──────────────────────────────────────────────────
    const labels = [
      { title: "diagnosticoeletronico", color: "#69A871" },
      { title: "google", color: "#FBFF00" },
      { title: "infraçãodetransito", color: "#115490" },
      { title: "laudodetransferencia", color: "#EF2975" },
      { title: "meta", color: "#001EFD" },
      { title: "supercautelar", color: "#6366f1" },
      { title: "vendedor", color: "#A69DE2" },
      { title: "vistoriacautelar", color: "#4ADE33" },
      { title: "vistoriacerticar", color: "#4E53C7" },
      { title: "vistoriacsv", color: "#1AD530" },
      { title: "vistoriademoto", color: "#EEA92A" },
      { title: "vistoriadepintura", color: "#FAD1EE" },
      { title: "vistorialacrada", color: "#0A7850" },
    ];
    let labelsOk = 0;
    const labelsErrors: string[] = [];
    for (const lb of labels) {
      try {
        await chatwootCall(
          "POST",
          `/api/v1/accounts/${accountId}/labels`,
          { ...lb, show_on_sidebar: true },
        );
        labelsOk++;
      } catch (e) {
        labelsErrors.push(`${lb.title}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    logStep("6. Labels criadas", labelsErrors.length === 0, { ok: labelsOk, total: 13, erros: labelsErrors });

    // ─── 7. AUTOMAÇÕES (3) ───────────────────────────────────────────────
    const automacoes = [
      {
        name: "Kanban Lead",
        description: "Entrada no Kanban",
        event_name: "conversation_created",
        conditions: [{
          values: ["all", "all"],
          attribute_key: "status",
          filter_operator: "equal_to",
          custom_attribute_type: "",
        }],
        actions: [{
          action_name: "funnel_action",
          action_params: [{
            funnel_id: funnelId,
            stage_name: `lead_${slug}`,
            action_type: "add_to_funnel",
          }],
        }],
      },
      {
        name: "TAG Google",
        description: "Tag Google",
        event_name: "message_created",
        conditions: [{
          values: ["Google"],
          attribute_key: "content",
          filter_operator: "contains",
          custom_attribute_type: "",
        }],
        actions: [{
          action_name: "add_label",
          action_params: ["google"],
        }],
      },
      {
        name: "TAG Meta",
        description: "Tag Meta",
        event_name: "message_created",
        conditions: [{
          values: ["Meta"],
          attribute_key: "content",
          filter_operator: "contains",
          custom_attribute_type: "",
        }],
        actions: [{
          action_name: "add_label",
          action_params: ["meta"],
        }],
      },
    ];
    let automacoesOk = 0;
    const automacoesErrors: string[] = [];
    for (const rule of automacoes) {
      try {
        await chatwootCall(
          "POST",
          `/api/v1/accounts/${accountId}/automation_rules`,
          rule,
        );
        automacoesOk++;
      } catch (e) {
        automacoesErrors.push(`${rule.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    logStep("7. Automações criadas", automacoesErrors.length === 0, { ok: automacoesOk, total: 3, erros: automacoesErrors });

    // ─── 8. DASHBOARD APPS (2) ───────────────────────────────────────────
    const apps = [
      {
        title: "Dashboard",
        content: [{ url: "https://dashboardsupervisao.vercel.app/", type: "frame" }],
      },
      {
        title: "Registro Manual",
        content: [{ url: "https://dashboardsupervisao.vercel.app/dashboard/registro-manual", type: "frame" }],
      },
    ];
    let appsOk = 0;
    const appsErrors: string[] = [];
    for (const app of apps) {
      try {
        await chatwootCall(
          "POST",
          `/api/v1/accounts/${accountId}/dashboard_apps`,
          app,
        );
        appsOk++;
      } catch (e) {
        appsErrors.push(`${app.title}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    logStep("8. Dashboard apps criados", appsErrors.length === 0, { ok: appsOk, total: 2, erros: appsErrors });

    // ─── 9. PERSISTE IDs NA UNIDADE ──────────────────────────────────────
    await supabase
      .from("unidades")
      .update({
        chatwoot_account_id: accountId,
        chatwoot_inbox_id: inboxId,
        chatwoot_funnel_id: funnelId,
        chatwoot_provisionado_em: new Date().toISOString(),
      })
      .eq("id", unidadeId);

    // Tenta atualizar submission pra "provisionado" (se houver vinculada)
    await supabase
      .from("onboarding_submissoes")
      .update({
        status: "provisionado",
        provisionado_em: new Date().toISOString(),
        chatwoot_account_id: accountId,
      })
      .eq("unidade_id", unidadeId);

    logStep("9. IDs persistidos no banco", true, { accountId, inboxId, funnelId });

    return {
      ok: true,
      skipped: false,
      chatwoot: {
        account_id: accountId,
        inbox_id: inboxId,
        funnel_id: funnelId,
      },
      steps,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logStep("FATAL", false, undefined, errMsg);

    // Rollback: se chegou a criar account, deleta tudo
    if (rollbackAccountId.id) {
      try {
        await chatwootCall(
          "DELETE",
          `/platform/api/v1/accounts/${rollbackAccountId.id}`,
          null,
          true,
        );
        logStep("ROLLBACK", true, { deleted_account_id: rollbackAccountId.id });
      } catch (rbErr) {
        logStep("ROLLBACK_FALHOU", false, undefined,
          rbErr instanceof Error ? rbErr.message : String(rbErr));
      }
    }

    return {
      ok: false,
      error: errMsg,
      steps,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { unidade_id?: string; force?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.unidade_id) {
    return new Response(
      JSON.stringify({ error: "unidade_id obrigatório" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const result = await provisionarUnidade(body.unidade_id, body.force === true);

  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json" },
    status: result.ok ? 200 : 500,
  });
});
