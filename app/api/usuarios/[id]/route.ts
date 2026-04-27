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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checarSuperAdmin();
  if (!user) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const update: Record<string, unknown> = {};
  if (body.role !== undefined) update.role = body.role;
  if (body.ativo !== undefined) update.ativo = body.ativo;
  if (body.nome !== undefined) update.nome = body.nome;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada pra atualizar" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service.from("usuarios").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await checarSuperAdmin();
  if (!user) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const service = createServiceClient();

  // Pega email pra deletar do auth também
  const { data: profile } = await service
    .from("usuarios")
    .select("email, role")
    .eq("id", id)
    .maybeSingle();

  if (profile?.role === "super_admin") {
    return NextResponse.json(
      { error: "Não é possível deletar um Super Admin" },
      { status: 400 },
    );
  }

  // Deleta do auth (procura por email)
  if (profile?.email) {
    const { data: list } = await service.auth.admin.listUsers();
    const authUser = list?.users?.find(
      (u: { id: string; email?: string | null }) => u.email === profile.email,
    );
    if (authUser) {
      await service.auth.admin.deleteUser(authUser.id);
    }
  }

  await service.from("usuarios").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
