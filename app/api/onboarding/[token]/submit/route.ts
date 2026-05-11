/**
 * POST /api/onboarding/[token]/submit
 * Finaliza a submissão do quiz (status: em_andamento → enviado).
 * Após isso a submissão fica read-only até time interno aprovar/rejeitar.
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const service = createServiceClient();

  const { data: existing } = await service
    .from("onboarding_submissoes")
    .select("*")
    .eq("token_publico", token)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Token inválido" }, { status: 404 });
  }
  if (existing.status !== "em_andamento") {
    return NextResponse.json(
      { error: "Submissão já foi enviada" },
      { status: 400 },
    );
  }

  // Validações mínimas
  const obrigatorios = ["nome_unidade", "nome_franqueado", "telefone_franqueado"];
  const faltando = obrigatorios.filter((k) => !existing[k]);
  if (faltando.length > 0) {
    return NextResponse.json(
      { error: `Campos obrigatórios faltando: ${faltando.join(", ")}` },
      { status: 400 },
    );
  }

  // Gera session_name se não tiver
  const sessionName = existing.session_name || slugify(existing.nome_unidade);

  const { error } = await service
    .from("onboarding_submissoes")
    .update({
      status: "enviado",
      enviado_em: new Date().toISOString(),
      session_name: sessionName,
    })
    .eq("token_publico", token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "enviado" });
}
