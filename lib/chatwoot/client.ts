/**
 * Cliente HTTP do Chatwoot — só pode ser usado em código SERVER (API Routes / Edge Functions).
 * O token mora em variável de ambiente CHATWOOT_TOKEN, NUNCA exposto ao browser.
 *
 * Uso:
 *   import { chatwootGet, chatwootPost } from "@/lib/chatwoot/client";
 *   const data = await chatwootGet(`/api/v1/accounts/${accountId}/inboxes`);
 */

const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL || "https://crmsupervisao.com";
const CHATWOOT_TOKEN = process.env.CHATWOOT_TOKEN || "";

if (typeof window !== "undefined") {
  throw new Error("[chatwoot/client] NUNCA importe este módulo no client! Use API Routes.");
}

export class ChatwootError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "ChatwootError";
  }
}

interface RequestOptions {
  timeout?: number; // ms
}

async function chatwootRequest<T = unknown>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  if (!CHATWOOT_TOKEN) {
    throw new ChatwootError("CHATWOOT_TOKEN não configurado nas envs do servidor", 500);
  }

  const url = path.startsWith("http") ? path : `${CHATWOOT_BASE_URL}${path}`;
  const ctrl = new AbortController();
  const timeoutMs = opts.timeout ?? 15000;
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const r = await fetch(url, {
      method,
      headers: {
        api_access_token: CHATWOOT_TOKEN,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });

    const text = await r.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!r.ok) {
      throw new ChatwootError(
        `Chatwoot ${method} ${path} → ${r.status}`,
        r.status,
        data,
      );
    }

    return data as T;
  } catch (err) {
    if (err instanceof ChatwootError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ChatwootError(`Timeout (${timeoutMs}ms) em ${method} ${path}`, 504);
    }
    throw new ChatwootError(
      `Falha de rede em ${method} ${path}: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const chatwootGet = <T = unknown>(path: string, opts?: RequestOptions) =>
  chatwootRequest<T>("GET", path, undefined, opts);
export const chatwootPost = <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
  chatwootRequest<T>("POST", path, body, opts);
export const chatwootPatch = <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
  chatwootRequest<T>("PATCH", path, body, opts);
export const chatwootPut = <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
  chatwootRequest<T>("PUT", path, body, opts);
export const chatwootDelete = <T = unknown>(path: string, opts?: RequestOptions) =>
  chatwootRequest<T>("DELETE", path, undefined, opts);

// ─── Tipos parciais da API Chatwoot ──────────────────────────────────

export interface ChatwootAgent {
  id: number;
  name: string;
  email: string;
  role: "administrator" | "agent";
  confirmed: boolean;
  account_id?: number;
}

export interface ChatwootInboxProviderConnection {
  connection?: "open" | "close";
  // outros campos específicos por provider
  [k: string]: unknown;
}

export interface ChatwootInbox {
  id: number;
  name: string;
  channel_type: string;
  phone_number?: string;
  provider?: string; // "waha", "whatsapp_cloud", etc
  provider_config?: Record<string, unknown>;
  provider_connection?: ChatwootInboxProviderConnection;
}
