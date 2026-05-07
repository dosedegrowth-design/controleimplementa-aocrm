"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Centro de Controle", icon: LayoutDashboard },
  { href: "/caixas-entrada", label: "Caixas de Entrada", icon: Inbox },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  // Persiste preferência no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    const novo = !collapsed;
    setCollapsed(novo);
    localStorage.setItem("sidebar_collapsed", String(novo));
    // Dispara um evento custom pra o layout reagir
    window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { collapsed: novo } }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#1B2A4A] text-slate-200 transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo / Header */}
      <div
        className={cn(
          "flex items-center border-b border-[#2D4166] py-5",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E31E24] font-bold text-white shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold tracking-tight truncate">SuperVisão</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                Controle CRM
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="text-slate-400 hover:text-white transition-colors"
            title="Encolher menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Botão expandir (quando colapsado) */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="mx-2 mt-2 flex items-center justify-center rounded-md py-2 text-slate-400 hover:bg-[#243556] hover:text-white transition-colors"
          title="Expandir menu"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <nav className={cn("flex-1 space-y-1 py-4", collapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "bg-[#E31E24] text-white"
                  : "text-slate-300 hover:bg-[#243556] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={cn("border-t border-[#2D4166] py-3", collapsed ? "px-2" : "p-3")}>
        {!collapsed && (
          <div className="px-3 py-2 text-xs text-slate-400 truncate" title={userEmail}>
            {userEmail}
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          className={cn(
            "flex w-full items-center rounded-md py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-[#243556] hover:text-white",
            collapsed ? "justify-center px-2" : "gap-3 px-3",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
