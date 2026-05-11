/**
 * POST /api/onboarding/iniciar
 * Cria um novo rascunho de submissão e retorna o token público.
 * NÃO requer autenticação — qualquer um pode iniciar (franqueado).
 *
 * Útil pra: gerar link único pra mandar pro franqueado.
 *   Time interno chama esse endpoint → recebe token → manda link
 *   https://controleimplementa-aocrm.vercel.app/onboarding/{token}
 *
 * Anti-spam: limita por IP (3 rascunhos novos por hora).
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const service = createServiceClient();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Anti-spam: máximo 3 rascunhos novos por IP por hora
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await service
    .from("onboarding_submissoes")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("criado_em", umaHoraAtras);

  if (count !== null && count >= 3) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde antes de iniciar outro." },
      { status: 429 },
    );
  }

  const { data, error } = await service
    .from("onboarding_submissoes")
    .insert({
      ip_address: ip,
      user_agent: userAgent,
    })
    .select("token_publico, id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    token: data.token_publico,
    id: data.id,
    url: `/onboarding/${data.token_publico}`,
  });
}
