"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setLastResult(null);
    try {
      const r = await fetch("/api/sync/trigger", { method: "POST" });
      const data = await r.json();
      if (r.ok) {
        setLastResult(
          `${data.unidades_inseridas ?? 0} novas, ${data.unidades_atualizadas ?? 0} atualizadas`,
        );
        router.refresh();
      } else {
        setLastResult(`Erro: ${data.error || "desconhecido"}`);
      }
    } catch (err) {
      setLastResult(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {lastResult && (
        <span className="text-xs text-slate-600">{lastResult}</span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={loading}
      >
        <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        {loading ? "Sincronizando..." : "Sincronizar agora"}
      </Button>
    </div>
  );
}
