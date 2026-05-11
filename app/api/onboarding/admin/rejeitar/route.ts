/**
 * POST /api/onboarding/admin/rejeitar
 * Body: { submission_id: string, motivo: string }
 */
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
  const { submission_id, motivo } = body;
  if (!submission_id) {
    return NextResponse.json({ error: "submission_id obrigatório" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("onboarding_submissoes")
    .update({
      status: "rejeitado",
      rejeitado_em: new Date().toISOString(),
      rejeitado_por: user.email,
      rejeicao_motivo: motivo || null,
    })
    .eq("id", submission_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
