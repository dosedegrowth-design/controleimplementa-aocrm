/**
 * POST /api/chatwoot/inboxes/[id]/reconnect
 * Tenta reconectar uma inbox WAHA via Chatwoot.
 * Body: { account_id: number }
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatwootPost, ChatwootError } from "@/lib/chatwoot/client";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Só admins podem reconectar
  const { data: profile } = await supabase
    .from("usuarios")
    .select("role")
    .eq("email", user.email || "")
    .maybeSingle();

  if (profile?.role !== "super_admin" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id: inboxId } = await params;
  const body = await request.json();
  const accountId = body.account_id;

  if (!accountId || !inboxId) {
    return NextResponse.json({ error: "account_id e inbox id obrigatórios" }, { status: 400 });
  }

  try {
    const data = await chatwootPost(
      `/api/v1/accounts/${accountId}/inboxes/${inboxId}/whatsapp_evolution/reconnect`,
      {},
      { timeout: 30000 },
    );
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    if (err instanceof ChatwootError) {
      return NextResponse.json(
        { error: err.message, status: err.status, response: err.response },
        { status: err.status === 404 ? 404 : 500 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
