import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GerenciarUsuarios } from "./gerenciar-usuarios";
import { SyncStatus } from "./sync-status";
import { Badge } from "@/components/ui/badge";
import type { Usuario, SyncLog } from "@/lib/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Buscar profile do usuário logado
  const { data: meuProfile } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", user?.email || "")
    .maybeSingle();

  const isSuperAdmin = meuProfile?.role === "super_admin";

  // Service client pra ler todos usuários (bypass RLS se houver)
  const service = createServiceClient();
  const { data: usuarios = [] } = await service
    .from("usuarios")
    .select("*")
    .order("criado_em", { ascending: false });

  const { data: syncLogs = [] } = await service
    .from("sync_log")
    .select("*")
    .order("iniciado_em", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Configurações</h1>
        <p className="text-sm text-slate-600">
          Gerenciar usuários, sincronização e preferências
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-32">Email:</span>
              <span className="font-medium text-slate-800">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-32">Perfil:</span>
              {meuProfile ? (
                <Badge variant="outline">{meuProfile.role}</Badge>
              ) : (
                <span className="text-amber-600 text-xs">
                  Sem perfil cadastrado — peça acesso ao admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-32">Nome:</span>
              <span className="font-medium text-slate-800">{meuProfile?.nome || "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <SyncStatus logs={(syncLogs || []) as SyncLog[]} />

      {isSuperAdmin && (
        <GerenciarUsuarios usuarios={(usuarios || []) as Usuario[]} />
      )}

      {!isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar usuários</CardTitle>
            <CardDescription>
              Apenas Super Admins podem adicionar/remover usuários do painel.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
