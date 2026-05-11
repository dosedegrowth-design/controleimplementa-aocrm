/**
 * GET /api/onboarding/[token]  — busca rascunho pelo token público
 * PATCH /api/onboarding/[token] — salva progresso (auto-save)
 * POST /api/onboarding/[token]/submit — finaliza submissão
 *
 * Sem auth (público). Token serve como autorização.
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const service = createServiceClient();

  const { data, error } = await service
    .from("onboarding_submissoes")
    .select("*")
    .eq("token_publico", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Token inválido" }, { status: 404 });
  }

  // Status terminal — não pode mais editar
  if (data.status !== "em_andamento" && data.status !== "enviado") {
    return NextResponse.json({
      submission: data,
      readonly: true,
    });
  }

  return NextResponse.json({ submission: data, readonly: false });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await request.json();
  const service = createServiceClient();

  // Pega rascunho atual
  const { data: existing } = await service
    .from("onboarding_submissoes")
    .select("status")
    .eq("token_publico", token)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Token inválido" }, { status: 404 });
  }
  if (existing.status !== "em_andamento") {
    return NextResponse.json(
      { error: "Submissão já foi enviada, não pode mais ser editada" },
      { status: 400 },
    );
  }

  // Campos editáveis no rascunho
  const allowed = [
    "step_atual",
    "steps_completos",
    "nome_unidade",
    "cidade",
    "estado",
    "nome_franqueado",
    "email_franqueado",
    "telefone_franqueado",
    "telefone_inbox",
    "session_name",
    "agentes",
    "observacoes",
  ];
  const update: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) update[k] = body[k];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await service
    .from("onboarding_submissoes")
    .update(update)
    .eq("token_publico", token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
