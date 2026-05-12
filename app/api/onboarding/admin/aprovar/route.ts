/**
 * POST /api/onboarding/admin/aprovar
 * Body: { submission_id: string }
 * Aprova uma submissão e cria a unidade no banco (sem ainda provisionar no Chatwoot).
 *
 * Requer: super_admin ou admin
 */
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface AgenteSubmission {
  nome: string;
  email: string;
  perfil: "administrador" | "agente";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

  const body = await request.json();
  const subId = body.submission_id;
  const providerChatwoot = body.provider_chatwoot as string | undefined;

  if (!subId) {
    return NextResponse.json(
      { error: "submission_id obrigatório" },
      { status: 400 },
    );
  }

  // Provider é obrigatório na aprovação — decisão técnica do time
  if (!providerChatwoot || !["whatsapp_cloud", "waha"].includes(providerChatwoot)) {
    return NextResponse.json(
      {
        error:
          "Escolha o provider WhatsApp: 'whatsapp_cloud' (oficial Meta) ou 'waha'",
      },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  // Pega submission
  const { data: sub, error: subErr } = await service
    .from("onboarding_submissoes")
    .select("*")
    .eq("id", subId)
    .maybeSingle();

  if (subErr || !sub) {
    return NextResponse.json({ error: "Submissão não encontrada" }, { status: 404 });
  }
  if (sub.status !== "enviado") {
    return NextResponse.json(
      { error: `Submissão está em status "${sub.status}", não pode ser aprovada` },
      { status: 400 },
    );
  }

  // Cria unidade
  const sheetHash = `onboarding_${sub.id}`;
  const numerosCRM: string[] = [];
  if (Array.isArray(sub.numeros_inbox) && sub.numeros_inbox.length > 0) {
    numerosCRM.push(...sub.numeros_inbox.filter((n: unknown): n is string => typeof n === "string" && n.trim().length > 0));
  } else if (sub.telefone_inbox) {
    numerosCRM.push(sub.telefone_inbox);
  }

  const { data: unidade, error: unidadeErr } = await service
    .from("unidades")
    .insert({
      submitted_at: sub.enviado_em || sub.criado_em,
      nome_unidade: sub.nome_unidade,
      nome_franqueado: sub.nome_franqueado,
      telefone_franqueado: sub.telefone_franqueado,
      numeros_crm: numerosCRM,
      observacoes: sub.observacoes,
      sheet_row_hash: sheetHash,
      provider_chatwoot: providerChatwoot,
    })
    .select("id")
    .single();

  if (unidadeErr) {
    return NextResponse.json(
      { error: `Falha ao criar unidade: ${unidadeErr.message}` },
      { status: 500 },
    );
  }

  // Cria agentes
  const agentes = (sub.agentes || []) as AgenteSubmission[];
  for (const ag of agentes) {
    if (!ag.nome && !ag.email) continue;
    await service.from("agentes").insert({
      unidade_id: unidade.id,
      nome: ag.nome || null,
      email: ag.email?.toLowerCase() || null,
      perfil: ag.perfil || "agente",
      origem: "manual",
    });
  }

  // Marca submission como aprovada (com provider escolhido)
  await service
    .from("onboarding_submissoes")
    .update({
      status: "aprovado",
      aprovado_em: new Date().toISOString(),
      aprovado_por: user.email,
      unidade_id: unidade.id,
      provider_chatwoot: providerChatwoot,
    })
    .eq("id", subId);

  return NextResponse.json({
    ok: true,
    unidade_id: unidade.id,
    agentes_criados: agentes.length,
    provider_chatwoot: providerChatwoot,
  });
}
