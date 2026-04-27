import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function checarSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("usuarios")
    .select("role")
    .eq("email", user.email || "")
    .maybeSingle();
  if (profile?.role !== "super_admin") return null;
  return user;
}

export async function POST(request: Request) {
  const user = await checarSuperAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Apenas Super Admins podem criar usuários" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { email, nome, role, senha } = body;

  if (!email || !senha) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios" },
      { status: 400 },
    );
  }

  if (senha.length < 6) {
    return NextResponse.json(
      { error: "Senha precisa ter no mínimo 6 caracteres" },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  // 1. Cria usuário no Supabase Auth
  const { data: authUser, error: authErr } = await service.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 400 });
  }

  // 2. Cria profile na tabela usuarios
  const { error: profErr } = await service.from("usuarios").insert({
    email: email.trim().toLowerCase(),
    nome: nome || null,
    role: role || "viewer",
    criado_por: user.email,
  });

  if (profErr) {
    // Rollback: deletar do auth se falhou na profile
    await service.auth.admin.deleteUser(authUser.user!.id);
    return NextResponse.json({ error: profErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: authUser.user!.id });
}
