/**
 * POST /api/cadastro/submit
 * Endpoint público — recebe submissão completa do quiz /cadastro.
 * Cria registro novo em onboarding_submissoes já com status="enviado".
 *
 * Anti-spam:
 *  - max 5 submissions por IP nas últimas 24h
 *  - validação de campos obrigatórios
 *  - hash determinístico (nome_unidade + telefone) pra detectar duplicatas
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface AgenteSub {
  nome: string;
  email: string;
  perfil: "administrador" | "agente";
}

interface SubmitBody {
  nome_unidade: string;
  cidade?: string;
  estado?: string;
  endereco_unidade?: string;
  nome_franqueado: string;
  email_franqueado?: string;
  telefone_franqueado: string;
  numeros_inbox?: string[];
  horario_atendimento?: string;
  contato_preferencial?: string;
  instagram?: string;
  agentes: AgenteSub[];
  observacoes?: string;
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

export async function POST(request: Request) {
  const service = createServiceClient();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Anti-spam por IP (5 submissions / 24h)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await service
    .from("onboarding_submissoes")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("criado_em", dayAgo);

  if (count !== null && count >= 5) {
    return NextResponse.json(
      { error: "Muitas submissões deste IP nas últimas 24h. Tente novamente mais tarde ou fale com nosso time." },
      { status: 429 },
    );
  }

  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Validações
  const obrigatorios: (keyof SubmitBody)[] = [
    "nome_unidade",
    "nome_franqueado",
    "telefone_franqueado",
  ];
  for (const c of obrigatorios) {
    const v = body[c];
    if (!v || (typeof v === "string" && !v.trim())) {
      return NextResponse.json(
        { error: `Campo obrigatório: ${c}` },
        { status: 400 },
      );
    }
  }

  if (!Array.isArray(body.agentes) || body.agentes.length === 0) {
    return NextResponse.json(
      { error: "Adicione ao menos 1 atendente" },
      { status: 400 },
    );
  }
  const agentesValidos = body.agentes.filter(
    (a) => a.nome?.trim() && a.email?.trim(),
  );
  if (agentesValidos.length === 0) {
    return NextResponse.json(
      { error: "Nenhum atendente tem nome e email preenchidos" },
      { status: 400 },
    );
  }

  // Detecta duplicata recente (mesma unidade + telefone, últimos 7 dias)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: duplicada } = await service
    .from("onboarding_submissoes")
    .select("id, status")
    .ilike("nome_unidade", body.nome_unidade.trim())
    .eq("telefone_franqueado", body.telefone_franqueado.trim())
    .gte("criado_em", weekAgo)
    .in("status", ["enviado", "aprovado", "provisionado"])
    .maybeSingle();

  if (duplicada) {
    return NextResponse.json(
      {
        error: "Já existe um cadastro recente para essa unidade. Aguarde nosso time entrar em contato.",
        duplicada_id: duplicada.id,
      },
      { status: 409 },
    );
  }

  const sessionName = slugify(body.nome_unidade);
  const tokenPublico = crypto.randomBytes(16).toString("hex");

  const { data: criada, error } = await service
    .from("onboarding_submissoes")
    .insert({
      token_publico: tokenPublico,
      status: "enviado",
      enviado_em: new Date().toISOString(),
      step_atual: 99,
      // Dados da unidade
      nome_unidade: body.nome_unidade.trim(),
      cidade: body.cidade?.trim() || null,
      estado: body.estado?.trim() || null,
      endereco_unidade: body.endereco_unidade?.trim() || null,
      // Franqueado
      nome_franqueado: body.nome_franqueado.trim(),
      email_franqueado: body.email_franqueado?.trim().toLowerCase() || null,
      telefone_franqueado: body.telefone_franqueado.trim(),
      // WhatsApp da unidade
      numeros_inbox: (body.numeros_inbox || []).map((n) => n.trim()).filter(Boolean),
      session_name: sessionName,
      // Atendimento
      horario_atendimento: body.horario_atendimento?.trim() || null,
      contato_preferencial: body.contato_preferencial?.trim() || null,
      instagram: body.instagram?.trim() || null,
      // Agentes
      agentes: agentesValidos.map((a) => ({
        nome: a.nome.trim(),
        email: a.email.trim().toLowerCase(),
        perfil: a.perfil || "agente",
      })),
      // Observações
      observacoes: body.observacoes?.trim() || null,
      // Auditoria
      ip_address: ip,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao criar submission:", error);
    return NextResponse.json(
      { error: "Erro ao salvar. Tenta de novo em alguns segundos." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: criada.id,
  });
}
