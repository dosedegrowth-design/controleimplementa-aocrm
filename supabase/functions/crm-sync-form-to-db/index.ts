// ═══════════════════════════════════════════════════════════════════════════
// Edge Function: crm-sync-form-to-db
// ─────────────────────────────────────────────────────────────────────────
// Lê a planilha do Google Form de implantação CRM SuperVisão e sincroniza
// para o schema crm_onboarding (unidades + agentes).
//
// - Sheets é fonte READ-ONLY (form preenche, painel só consome)
// - Idempotente: usa hash de submitted_at + nome_unidade como sheet_row_hash
// - Não sobrescreve campos editados pelo painel (status_geral, prioridade,
//   responsavel_interno, observacoes)
// - Trigger no DB cria 6 etapas + 3 sub-etapas automaticamente ao inserir
//
// Variáveis de ambiente:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   GOOGLE_SHEETS_ID                  (1nrcFrSgx2gBhNaUNlRJG1AWVcyWlxhPqjF7Uik8Y6Jw)
//   GOOGLE_SERVICE_ACCOUNT_EMAIL      (painel-hl-sheets@dose-de-growth.iam.gserviceaccount.com)
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
//
// Cron sugerido: a cada 5 minutos
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHEETS_ID = Deno.env.get("GOOGLE_SHEETS_ID")!;
const SA_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")!;
const SA_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")!;

// ═══════════════════════════════════════════════════════════════════════════
// 1. Autenticação Google (Service Account → JWT → access_token)
// ═══════════════════════════════════════════════════════════════════════════
async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: SA_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const b64url = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const unsigned = `${b64url(header)}.${b64url(payload)}`;

  const pemContents = SA_KEY
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${unsigned}.${sigB64}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const json = await resp.json();
  if (!json.access_token) {
    throw new Error("Falha ao obter access_token Google: " + JSON.stringify(json));
  }
  return json.access_token;
}

async function readSheet(token: string): Promise<string[][]> {
  // Lê a primeira aba (Form Responses 1) com tudo
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/A:Z`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await r.json();
  return data.values ?? [];
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Parsers (timestamp BR, telefone, números CRM, dados de agentes)
// ═══════════════════════════════════════════════════════════════════════════

// Converte "13/04/2026 11:29:50" → ISO timestamp UTC-3
function parseTimestampBR(s: string): string | null {
  if (!s) return null;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, d, mo, y, h, mi, se] = m;
  // Trata como horário de Brasília (UTC-3)
  return `${y}-${mo}-${d}T${h}:${mi}:${se}-03:00`;
}

// Limpa telefone, mantém formatação simples
function normalizePhone(s: string | null | undefined): string | null {
  if (!s) return null;
  const cleaned = s.trim().replace(/\s+/g, " ");
  return cleaned || null;
}

// "+55 11 9..., 11 9..., 21 99...; 8321..." → ["+55 11 9...", "11 9...", ...]
function parseNumerosCRM(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

// Detecta perfil pelo texto bruto
function detectarPerfil(perfilRaw: string): string {
  const p = perfilRaw.toLowerCase();
  if (p.includes("propriet")) return "proprietario";
  if (p.includes("admin")) return "administrador";
  if (p.includes("digit")) return "digitador";
  if (p.includes("agente")) return "agente";
  return "outro";
}

// Extrai email de um pedaço de texto
function extrairEmail(s: string): string | null {
  const m = s.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0].toLowerCase() : null;
}

interface AgenteParsed {
  nome: string | null;
  email: string | null;
  perfil: string;
  perfil_raw: string;
}

// ─── Parser robusto de "Dados do agente" ─────────────────────────────────
// Lida com formatos vistos na planilha:
//   1) "Nome: X E-mail: y@z Perfil: Administrador  Nome: A E-mail: ..."
//   2) "Andreia Nacimento  comercial.fortaleza@supervisao.com administrador"
//   3) Triplas de linhas: nome / email / perfil
//   4) Múltiplos agentes concatenados no mesmo texto
function parseAgentes(raw: string | null | undefined): AgenteParsed[] {
  if (!raw) return [];
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const agentes: AgenteParsed[] = [];

  // FORMATO 1: blocos delimitados por "Nome:"
  if (/Nome\s*:/i.test(text)) {
    const blocos = text.split(/\bNome\s*:/i).slice(1);
    for (const bloco of blocos) {
      // Cada bloco é: "X E-mail: y@z Perfil: Z" (até próximo "Nome:")
      const nomeMatch = bloco.match(/^(.+?)(?=\s*E-?\s*mail\s*:|\s*Perfil\s*:|$)/i);
      const emailMatch = bloco.match(/E-?\s*mail\s*:\s*([^\s]+@[^\s]+)/i);
      const perfilMatch = bloco.match(/Perfil\s*:\s*([^\n]+?)(?=\s*Nome\s*:|$)/i);

      const nome = nomeMatch ? nomeMatch[1].trim() : null;
      const email = emailMatch ? emailMatch[1].trim().toLowerCase() : extrairEmail(bloco);
      const perfilRaw = perfilMatch ? perfilMatch[1].trim() : "";

      if (nome || email) {
        agentes.push({
          nome,
          email,
          perfil: detectarPerfil(perfilRaw),
          perfil_raw: perfilRaw,
        });
      }
    }
    return agentes;
  }

  // FORMATO 2/3: tenta detectar triplas (nome → email → perfil) por sequência
  // Quebra em palavras significativas, busca emails, e infere nomes/perfis ao redor
  const tokens = text.split(/\s+/);
  const emails: { idx: number; email: string }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const e = extrairEmail(tokens[i]);
    if (e) emails.push({ idx: i, email: e });
  }

  // Para cada email, infere nome (palavras antes que parecem nome próprio)
  // e perfil (palavras depois com keyword conhecida)
  if (emails.length > 0) {
    for (const { idx, email } of emails) {
      // Nome: até 4 tokens antes do email (parando em outro email ou keyword)
      const nomeTokens: string[] = [];
      for (let i = idx - 1; i >= Math.max(0, idx - 4); i--) {
        const tok = tokens[i];
        if (extrairEmail(tok)) break;
        if (/^(administrador|agente|digitador|propriet[aá]rio|perfil|nome|e-?mail)/i.test(tok)) break;
        nomeTokens.unshift(tok);
      }

      // Perfil: até 3 tokens depois
      let perfilRaw = "";
      for (let i = idx + 1; i < Math.min(tokens.length, idx + 4); i++) {
        const tok = tokens[i];
        if (extrairEmail(tok)) break;
        if (/(administrador|agente|digitador|propriet[aá]rio)/i.test(tok)) {
          perfilRaw = tok;
          break;
        }
      }

      const nome = nomeTokens.join(" ").trim() || null;
      agentes.push({
        nome,
        email,
        perfil: detectarPerfil(perfilRaw),
        perfil_raw: perfilRaw,
      });
    }
    return agentes;
  }

  // Sem emails: agente único com nome bruto
  return [{
    nome: text.slice(0, 200) || null,
    email: null,
    perfil: "outro",
    perfil_raw: text,
  }];
}

// Hash determinístico p/ idempotência (timestamp + nome_unidade normalizado)
async function hashRow(submitted: string, nomeUnidade: string): Promise<string> {
  const input = `${submitted}|${nomeUnidade.trim().toLowerCase()}`;
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Sync principal
// ═══════════════════════════════════════════════════════════════════════════
interface SyncResult {
  linhas_lidas: number;
  unidades_inseridas: number;
  unidades_atualizadas: number;
  agentes_inseridos: number;
  erros: string[];
}

async function runSync(): Promise<SyncResult> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: "crm_onboarding" },
  });

  const result: SyncResult = {
    linhas_lidas: 0,
    unidades_inseridas: 0,
    unidades_atualizadas: 0,
    agentes_inseridos: 0,
    erros: [],
  };

  // Cria registro de sync_log
  const { data: log, error: logErr } = await supabase
    .from("sync_log")
    .insert({ status: "em_andamento" })
    .select()
    .single();
  if (logErr) console.error("Erro criando sync_log:", logErr);
  const logId = log?.id;

  try {
    const token = await getGoogleAccessToken();
    const rows = await readSheet(token);

    if (rows.length < 2) {
      throw new Error("Planilha vazia ou sem cabeçalho");
    }

    const header = rows[0];
    const dataRows = rows.slice(1);
    result.linhas_lidas = dataRows.length;

    // Mapeia colunas pelo cabeçalho (resiliente a reorder)
    const findCol = (substrings: string[]): number => {
      for (let i = 0; i < header.length; i++) {
        const h = (header[i] || "").toLowerCase();
        for (const s of substrings) {
          if (h.includes(s.toLowerCase())) return i;
        }
      }
      return -1;
    };

    const colTimestamp = findCol(["carimbo", "timestamp"]);
    const colNomeUnidade = findCol(["nome da unidade"]);
    const colNumerosCRM = findCol(["número(s)", "numero(s)", "número que", "numero que"]);
    const colDadosAgente = findCol(["dados do agente"]);
    const colNomeFranqueado = findCol(["nome do franqueado"]);
    const colTelefoneFranqueado = findCol(["número de celular", "numero de celular", "whatsapp"]);

    if (colTimestamp < 0 || colNomeUnidade < 0) {
      throw new Error(`Cabeçalho não reconhecido. Encontrado: ${JSON.stringify(header)}`);
    }

    // Processa linha a linha
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        const submittedRaw = row[colTimestamp] || "";
        const submittedAt = parseTimestampBR(submittedRaw);
        const nomeUnidade = (row[colNomeUnidade] || "").trim();

        if (!submittedAt || !nomeUnidade) continue;

        const sheetRowHash = await hashRow(submittedAt, nomeUnidade);

        // Filtra linhas de teste óbvias
        if (nomeUnidade.toLowerCase() === "teste") continue;

        const unidadePayload = {
          submitted_at: submittedAt,
          nome_unidade: nomeUnidade,
          nome_franqueado: colNomeFranqueado >= 0 ? (row[colNomeFranqueado] || null) : null,
          telefone_franqueado: colTelefoneFranqueado >= 0
            ? normalizePhone(row[colTelefoneFranqueado])
            : null,
          numeros_crm: colNumerosCRM >= 0 ? parseNumerosCRM(row[colNumerosCRM]) : [],
          dados_agentes_raw: colDadosAgente >= 0 ? (row[colDadosAgente] || null) : null,
          sheet_row_hash: sheetRowHash,
          sheet_row_index: i + 2, // +2 = header + 1-indexed
        };

        // Verifica se já existe
        const { data: existing } = await supabase
          .from("unidades")
          .select("id, nome_franqueado, telefone_franqueado, numeros_crm, dados_agentes_raw")
          .eq("sheet_row_hash", sheetRowHash)
          .maybeSingle();

        let unidadeId: string;

        if (existing) {
          // UPDATE: só atualiza dados originais do form (nunca toca em status/prioridade/etc)
          const { error } = await supabase
            .from("unidades")
            .update({
              nome_franqueado: unidadePayload.nome_franqueado,
              telefone_franqueado: unidadePayload.telefone_franqueado,
              numeros_crm: unidadePayload.numeros_crm,
              dados_agentes_raw: unidadePayload.dados_agentes_raw,
              sheet_row_index: unidadePayload.sheet_row_index,
            })
            .eq("id", existing.id);

          if (error) throw error;
          unidadeId = existing.id;
          result.unidades_atualizadas++;
        } else {
          // INSERT (trigger cria etapas + sub_etapas automaticamente)
          const { data: inserted, error } = await supabase
            .from("unidades")
            .insert(unidadePayload)
            .select("id")
            .single();

          if (error) throw error;
          unidadeId = inserted!.id;
          result.unidades_inseridas++;
        }

        // Sincroniza agentes (apenas inserts pra não sobrescrever edits manuais)
        const agentesParseados = parseAgentes(unidadePayload.dados_agentes_raw);
        for (const ag of agentesParseados) {
          if (!ag.nome && !ag.email) continue;

          // Verifica duplicidade por (unidade_id, email) ou (unidade_id, nome)
          let exists = false;
          if (ag.email) {
            const { data: dup } = await supabase
              .from("agentes")
              .select("id")
              .eq("unidade_id", unidadeId)
              .eq("email", ag.email)
              .maybeSingle();
            exists = !!dup;
          } else if (ag.nome) {
            const { data: dup } = await supabase
              .from("agentes")
              .select("id")
              .eq("unidade_id", unidadeId)
              .ilike("nome", ag.nome)
              .maybeSingle();
            exists = !!dup;
          }

          if (!exists) {
            const { error } = await supabase
              .from("agentes")
              .insert({
                unidade_id: unidadeId,
                nome: ag.nome,
                email: ag.email,
                perfil: ag.perfil,
                perfil_raw: ag.perfil_raw,
                origem: "form",
              });
            if (!error) result.agentes_inseridos++;
          }
        }
      } catch (err) {
        const msg = `Linha ${i + 2}: ${err instanceof Error ? err.message : String(err)}`;
        result.erros.push(msg);
        console.error(msg);
      }
    }

    // Atualiza sync_log
    if (logId) {
      await supabase
        .from("sync_log")
        .update({
          concluido_em: new Date().toISOString(),
          status: result.erros.length > 0 ? "concluido_com_erros" : "concluido",
          linhas_lidas: result.linhas_lidas,
          unidades_inseridas: result.unidades_inseridas,
          unidades_atualizadas: result.unidades_atualizadas,
          agentes_inseridos: result.agentes_inseridos,
          erros: result.erros,
        })
        .eq("id", logId);
    }

    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Erro fatal no sync:", msg);
    result.erros.push(`FATAL: ${msg}`);

    if (logId) {
      await supabase
        .from("sync_log")
        .update({
          concluido_em: new Date().toISOString(),
          status: "erro",
          erros: result.erros,
        })
        .eq("id", logId);
    }
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Handler HTTP
// ═══════════════════════════════════════════════════════════════════════════
Deno.serve(async (req: Request) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const result = await runSync();
    return new Response(JSON.stringify(result, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: result.erros.length > 0 ? 207 : 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});
