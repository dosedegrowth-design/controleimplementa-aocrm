/**
 * GET /api/alertas
 * Agrega todos os alertas críticos pra mostrar pop-up no login.
 *
 * Retorna:
 *  - inboxesOffline: WhatsApp desconectado
 *  - unidadesAlerta: Unidades com alerta_ativo manual
 *  - unidadesBloqueadas: Unidades em status "bloqueado"
 *  - paradasLongas: Unidades pendentes há +14 dias sem progresso
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const [statusRes, alertasRes, bloqueadasRes, paradasRes] = await Promise.all([
    supabase
      .from("v_chatwoot_status_atual")
      .select("chatwoot_account_id, inbox_id, account_nome, telefone, connection_status, verificado_em")
      .eq("connection_status", "close"),
    supabase
      .from("unidades")
      .select("id, nome_unidade, alerta_motivo, alerta_criado_em, prioridade")
      .eq("alerta_ativo", true)
      .order("alerta_criado_em", { ascending: false }),
    supabase
      .from("unidades")
      .select("id, nome_unidade, observacoes, prioridade")
      .eq("status_geral", "bloqueado"),
    supabase
      .from("unidades")
      .select("id, nome_unidade, status_geral, submitted_at, prioridade")
      .in("status_geral", ["pendente", "em_andamento"])
      .lte("submitted_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order("submitted_at", { ascending: true })
      .limit(20),
  ]);

  return NextResponse.json({
    geradoEm: new Date().toISOString(),
    inboxesOffline: statusRes.data || [],
    unidadesAlerta: alertasRes.data || [],
    unidadesBloqueadas: bloqueadasRes.data || [],
    paradasLongas: paradasRes.data || [],
    total:
      (statusRes.data?.length || 0) +
      (alertasRes.data?.length || 0) +
      (bloqueadasRes.data?.length || 0) +
      (paradasRes.data?.length || 0),
  });
}
