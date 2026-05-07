/**
 * GET /api/chatwoot/inboxes/[id]/qrcode?account_id=X
 * Retorna QR Code da inbox WAHA pra reconexão WhatsApp.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatwootGet, ChatwootError } from "@/lib/chatwoot/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id: inboxId } = await params;
  const url = new URL(request.url);
  const accountId = url.searchParams.get("account_id");

  if (!accountId || !inboxId) {
    return NextResponse.json({ error: "account_id e inbox id obrigatórios" }, { status: 400 });
  }

  try {
    const data = await chatwootGet(
      `/api/v1/accounts/${accountId}/inboxes/${inboxId}/whatsapp_evolution/qrcode`,
      { timeout: 15000 },
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
