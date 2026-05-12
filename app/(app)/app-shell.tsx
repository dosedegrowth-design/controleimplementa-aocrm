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
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);

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
          "min-h-screen transition-[margin] duration-200 pt-12 md:pt-0",
          // No mobile não tem sidebar fixa (vira topbar + sheet)
          "md:transition-all",
          collapsed ? "md:ml-16" : "md:ml-[240px]",
        )}
      >
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-5 md:space-y-6 pb-safe">
          {children}
        </div>
      </main>
      <AlertasProvider />
    </div>
  );
}
