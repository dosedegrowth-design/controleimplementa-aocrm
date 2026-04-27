"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ETAPA_LABELS } from "@/lib/utils";

export function UnidadesFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");

  useEffect(() => {
    setQ(sp.get("q") || "");
  }, [sp]);

  function update(name: string, value: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (value && value !== "all") params.set(name, value);
    else params.delete(name);
    router.push(`/unidades?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    update("q", q.trim() || null);
  }

  function clearAll() {
    setQ("");
    router.push("/unidades");
  }

  const hasFilters = sp.toString().length > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome de unidade..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </form>

          <Select
            value={sp.get("status") || "all"}
            onValueChange={(v) => update("status", v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sp.get("prioridade") || "all"}
            onValueChange={(v) => update("prioridade", v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sp.get("etapa") || "all"}
            onValueChange={(v) => update("etapa", v)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Aguardando etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer etapa</SelectItem>
              {Object.entries(ETAPA_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  Aguardando: {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="h-4 w-4" /> Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
