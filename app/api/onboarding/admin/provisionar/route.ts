/**
 * POST /api/onboarding/admin/provisionar
 * Body: { submission_id: string, force?: boolean }
 *
 * Aciona a Edge Function `provisionar-chatwoot-unidade` para a unidade
 * vinculada à submissão. Faz os 27 calls no Chatwoot (account, inbox,
 * agentes, funil, stages, labels, automacoes, dashboard apps).
 *
 * Requer: super_admin ou admin. A submissão precisa estar 'aprovado'
 * (ou 'provisionado' + force=true).
 */
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("usuarios")
    .select("role")
    .eq("email", user.email || "")
    .maybeSingle();

  if (profile?.role !== "super_admin" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const subId = body.submission_id as string | undefined;
  const force = body.force === true;

  if (!subId) {
    return NextResponse.json(
      { error: "submission_id obrigatório" },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  // Carrega submissão e valida estado
  const { data: sub, error: subErr } = await service
    .from("onboarding_submissoes")
    .select("id, status, unidade_id, provider_chatwoot")
    .eq("id", subId)
    .maybeSingle();

  if (subErr || !sub) {
    return NextResponse.json(
      { error: "Submissão não encontrada" },
      { status: 404 },
    );
  }
  if (!sub.unidade_id) {
    return NextResponse.json(
      {
        error:
          "Submissão sem unidade vinculada. Aprove a submissão antes de provisionar.",
      },
      { status: 400 },
    );
  }
  if (sub.status !== "aprovado" && !(sub.status === "provisionado" && force)) {
    return NextResponse.json(
      {
        error: `Status atual "${sub.status}" não permite provisionar. Use force=true pra reprovisionar.`,
      },
      { status: 400 },
    );
  }
  if (!sub.provider_chatwoot) {
    return NextResponse.json(
      { error: "Submissão sem provider_chatwoot — re-aprove pra escolher." },
      { status: 400 },
    );
  }

  // Chama a Edge Function
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const fnUrl = `${supabaseUrl}/functions/v1/provisionar-chatwoot-unidade`;

  const t0 = Date.now();
  let fnResp: Response;
  try {
    fnResp = await fetch(fnUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ unidade_id: sub.unidade_id, force }),
      // Provisionamento pode levar ~30s (27 API calls)
      signal: AbortSignal.timeout(180_000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Falha ao invocar Edge Function: ${msg}` },
      { status: 502 },
    );
  }
  const tookMs = Date.now() - t0;

  const text = await fnResp.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!fnResp.ok) {
    return NextResponse.json(
      {
        error: "Edge Function retornou erro",
        status: fnResp.status,
        took_ms: tookMs,
        payload,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    took_ms: tookMs,
    result: payload,
  });
}
