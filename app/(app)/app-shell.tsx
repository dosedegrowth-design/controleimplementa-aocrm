"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { AlertasProvider } from "@/components/alertas-provider";
import { cn } from "@/lib/utils";

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Lê estado inicial do localStorage
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);

    // Escuta o evento custom da Sidebar
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ collapsed: boolean }>).detail;
      setCollapsed(detail.collapsed);
    };
    window.addEventListener("sidebar-toggle", handler);
    return () => window.removeEventListener("sidebar-toggle", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar userEmail={userEmail} />
      <main
        className={cn(
          "min-h-screen transition-all duration-200",
          collapsed ? "ml-16" : "ml-64",
        )}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
      <AlertasProvider />
    </div>
  );
}
