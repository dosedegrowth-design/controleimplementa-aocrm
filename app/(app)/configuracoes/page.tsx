import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GerenciarUsuarios } from "./gerenciar-usuarios";
import { SyncStatus } from "./sync-status";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/page-hero";
import { SectionHeader } from "@/components/section-header";
import { Settings, User as UserIcon, Users, RefreshCw } from "lucide-react";
import type { Usuario, SyncLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: meuProfile } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", user?.email || "")
    .maybeSingle();

  const isSuperAdmin = meuProfile?.role === "super_admin";

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
    <>
      <PageHero
        eyebrow="Sistema"
        title="Configurações"
        subtitle="Gerenciar usuários, sincronização e preferências do painel"
        icon={<Settings className="h-5 w-5" />}
      />

      <div>
        <SectionHeader
          icon={<UserIcon className="h-4 w-4" />}
          title="Sua conta"
          subtitle="Dados do usuário logado"
        />
        <Card>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 w-32 shrink-0">
                Email
              </span>
              <span className="font-medium text-slate-800">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 w-32 shrink-0">
                Perfil
              </span>
              {meuProfile ? (
                <Badge variant="outline">{meuProfile.role}</Badge>
              ) : (
                <span className="text-amber-600 text-xs">
                  Sem perfil cadastrado — peça acesso ao admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 w-32 shrink-0">
                Nome
              </span>
              <span className="font-medium text-slate-800">
                {meuProfile?.nome || "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <SectionHeader
          icon={<RefreshCw className="h-4 w-4" />}
          title="Sincronização"
          subtitle="Histórico de syncs com Google Sheets e Chatwoot"
        />
        <SyncStatus logs={(syncLogs || []) as SyncLog[]} />
      </div>

      {isSuperAdmin && (
        <div>
          <SectionHeader
            icon={<Users className="h-4 w-4" />}
            title="Gerenciar usuários"
            subtitle="Apenas Super Admins"
          />
          <GerenciarUsuarios usuarios={(usuarios || []) as Usuario[]} />
        </div>
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
    </>
  );
}
