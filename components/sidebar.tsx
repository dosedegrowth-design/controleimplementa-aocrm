"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/", label: "Centro de Controle", icon: LayoutDashboard },
  { href: "/caixas-entrada", label: "Caixas de Entrada", icon: Inbox },
  { href: "/onboardings", label: "Onboardings", icon: Sparkles },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    const novo = !collapsed;
    setCollapsed(novo);
    localStorage.setItem("sidebar_collapsed", String(novo));
    window.dispatchEvent(
      new CustomEvent("sidebar-toggle", { detail: { collapsed: novo } }),
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isItemActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      {/* ============ TOPBAR MOBILE ============ */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-12 bg-[#1B2A4A] text-white flex items-center justify-between px-3 border-b border-[#2D4166]">
        <div className="flex items-center gap-2">
          <Image
            src="/sv-logo.png"
            alt="SuperVisão"
            width={120}
            height={26}
            className="h-5 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="touch-target h-9 w-9 flex items-center justify-center rounded-md hover:bg-white/10"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="bg-[#1B2A4A] text-slate-200 border-r border-[#2D4166] p-0 w-[260px] h-dvh max-h-dvh"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SheetDescription className="sr-only">
            Navegação principal do CRM SuperVisão
          </SheetDescription>
          <SidebarBody
            navItems={NAV_ITEMS}
            collapsed={false}
            isItemActive={isItemActive}
            onItemClick={() => setMobileOpen(false)}
            userEmail={userEmail}
            onLogout={handleLogout}
            onCloseMobile={() => setMobileOpen(false)}
            showCloseButton
          />
        </SheetContent>
      </Sheet>

      {/* ============ SIDEBAR DESKTOP ============ */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col bg-[#1B2A4A] text-slate-200 border-r border-[#2D4166]"
      >
        <SidebarBody
          navItems={NAV_ITEMS}
          collapsed={collapsed}
          isItemActive={isItemActive}
          userEmail={userEmail}
          onLogout={handleLogout}
          toggleCollapsed={toggleCollapsed}
        />
      </motion.aside>
    </>
  );
}

interface SidebarBodyProps {
  navItems: typeof NAV_ITEMS;
  collapsed: boolean;
  isItemActive: (href: string) => boolean;
  onItemClick?: () => void;
  userEmail: string;
  onLogout: () => void;
  toggleCollapsed?: () => void;
  onCloseMobile?: () => void;
  showCloseButton?: boolean;
}

function SidebarBody({
  navItems,
  collapsed,
  isItemActive,
  onItemClick,
  userEmail,
  onLogout,
  toggleCollapsed,
  onCloseMobile,
  showCloseButton,
}: SidebarBodyProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header logo */}
      <div
        className={cn(
          "h-14 flex items-center border-b border-[#2D4166] shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link
          href="/"
          onClick={onItemClick}
          className="flex items-center gap-2 min-w-0"
        >
          <div className="h-8 w-8 rounded-md bg-[#E31E24] flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/sv-logo.png"
              alt=""
              width={24}
              height={24}
              className="h-5 w-5 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 overflow-hidden whitespace-nowrap"
              >
                <div className="text-sm font-bold tracking-tight">SuperVisão</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-[0.18em]">
                  CRM
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        {showCloseButton && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="touch-target h-9 w-9 flex items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {!showCloseButton && toggleCollapsed && !collapsed && (
          <button
            onClick={toggleCollapsed}
            className="text-slate-400 hover:text-white transition-colors h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10"
            title="Encolher menu"
            aria-label="Encolher menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {!showCloseButton && toggleCollapsed && collapsed && (
        <button
          onClick={toggleCollapsed}
          className="mx-2 mt-2 flex h-8 items-center justify-center rounded-md text-slate-400 hover:bg-[#243556] hover:text-white transition-colors"
          title="Expandir menu"
          aria-label="Expandir menu"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <nav
        className={cn(
          "flex-1 space-y-1 py-4 overflow-y-auto",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center rounded-md py-2 text-sm font-medium transition-colors group",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
                active
                  ? "bg-white/5 text-white"
                  : "text-slate-300 hover:bg-[#243556] hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-indicator"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#E31E24]"
                />
              )}
              <Icon
                className={cn(
                  "shrink-0 transition-colors",
                  collapsed ? "h-[18px] w-[18px]" : "h-[18px] w-[18px]",
                  active ? "text-[#E31E24]" : "text-slate-400 group-hover:text-white",
                )}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        className={cn(
          "border-t border-[#2D4166] py-3 shrink-0",
          collapsed ? "px-2" : "p-3",
        )}
      >
        {!collapsed && (
          <div
            className="px-3 py-1.5 text-[11px] text-slate-400 truncate"
            title={userEmail}
          >
            {userEmail}
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? "Sair" : undefined}
          className={cn(
            "flex w-full items-center rounded-md py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-[#243556] hover:text-white",
            collapsed ? "justify-center px-2" : "gap-3 px-3",
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}
