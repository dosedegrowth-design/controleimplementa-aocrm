# 🎯 CRM SuperVisão · Estado Atual

> **Leia este arquivo SEMPRE no início da sessão.** Última atualização: 15/05/2026

---

## 📍 O que é

**Controle CRM SuperVisão** — painel interno da Dose de Growth (DDG) que gerencia o onboarding de novas unidades da rede SuperVisão no Chatwoot.

Cobre o ciclo completo:
1. Franqueado preenche cadastro público (`/cadastro`)
2. Time DDG revisa e aprova (`/onboardings`)
3. Sistema provisiona automaticamente conta Chatwoot completa (27 chamadas API — Padrão Brasília)
4. Time acompanha onboarding via Kanban de etapas (`/`)
5. Monitora status WhatsApp das inboxes (`/caixas-entrada`)

---

## 🌐 URLs

| Função | URL |
|---|---|
| **Painel admin** | https://controleimplementa-aocrm.vercel.app |
| **LP marketing** (mandar pros franqueados) | https://controleimplementa-aocrm.vercel.app/crm |
| **Forms público** (quiz multi-step) | https://controleimplementa-aocrm.vercel.app/cadastro |
| **Quiz com token único** (admin gera) | https://controleimplementa-aocrm.vercel.app/onboarding/[token] |
| **Login admin** | https://controleimplementa-aocrm.vercel.app/login |
| **GitHub** | https://github.com/dosedegrowth-design/controleimplementa-aocrm |
| **Vercel** | team `dose-de-growths-projects`, project `controleimplementa-aocrm` (id `prj_m7jSLFDaxx8lIRatqS9nbAI9XFuy`) |
| **Supabase** | project `hkjukobqpjezhpxzplpj` (DDG, sa-east-1) — schema `crm_onboarding` |
| **Chatwoot prod** | https://crmsupervisao.com — Platform API criando accounts |

---

## 🤖 Stack

- **Frontend**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4
- **UI**: shadcn-style + Radix UI + Lucide icons + Framer Motion
- **Banco**: Supabase PostgreSQL 15 — schema `crm_onboarding`
- **Auth**: Supabase Auth (email + senha)
- **Sync Sheets→DB**: Edge Function Deno `crm-sync-form-to-db` (legacy, ainda usado pra dados antigos do Google Form)
- **Provisionamento Chatwoot**: Edge Function Deno `provisionar-chatwoot-unidade` v2 (27 chamadas API com rollback automático)
- **Deploy**: Vercel auto-deploy do branch `main` no GitHub
- **WhatsApp providers**: WhatsApp Cloud (Meta oficial) ou WAHA (não-oficial)

---

## ⚡ Estado em 15/05/2026

### ✅ Funcionando 100% em produção

**Sistema base**
- Schema `crm_onboarding` com 12 tabelas + 6 triggers + 2 views
- 25 unidades cadastradas com 50 agentes
- Painel autenticado com Sidebar (240/64px), 5 rotas internas
- Visual unificado com `dash-supervisao` (PageHero gradient navy, SectionHeader, KPICard padronizado, Framer Motion, tabelas `spv-table` com gradient header)

**Forms público**
- `/cadastro` — quiz multi-step 9 etapas com salvamento automático em `localStorage`
- Máscaras formatação BR (`lib/format.ts`): telefone, e-mail, Instagram
- Anti-spam (5 submissões/IP/24h) + deduplicação (mesma unidade+telefone 7 dias)
- Submit cria `onboarding_submissoes` com `status="enviado"`

**LP marketing**
- `/crm` — landing page estética Soffia (Archivo display + Inter Tight + JetBrains Mono)
- Hero, problema, solução, funil, mockups, comparativo, CTA pra `/cadastro`
- Paleta isolada em `.soffia-scope` (RED #E30613, NAVY #0F172A)
- Logo real SuperVisão PNG

**Admin Onboardings** (`/onboardings`)
- Lista submissões com filtros por status
- Drawer com 3 estados visuais:
  - `enviado` → Aprovar (escolhe provider: WhatsApp Cloud ou WAHA) / Rejeitar
  - `aprovado` → Botão "🚀 Provisionar agora no Chatwoot" → invoca Edge Function
  - `provisionado` → Card roxo com Account ID + link "Abrir no Chatwoot" + botão "Reprovisionar (force)"
- Provisionamento executa 27 chamadas API com rollback automático

**Caixas de Entrada** (`/caixas-entrada`)
- Monitor de inboxes Chatwoot (online/offline/cloud)
- Verifica WAHA diretamente (não confia no `provider_connection` do Chatwoot que tem bug)

**Relatórios** (`/relatorios`)
- Tempo médio por etapa, gargalos, performance por responsável

**Configurações** (`/configuracoes`)
- Gerenciar usuários do painel (super_admin only)
- Histórico de syncs

### 🟡 Pendências futuras

- Cadastrar OBD e Super Cautelar no WordPress da SuperVisão
- Templates Meta WhatsApp aprovados (pra mensagens fora janela 24h em Cloud)
- Dashboard de métricas agregadas (taxa conclusão por mês, lead time médio)
- Corrigir 2 e-mails problemáticos no banco: `administração.aprove@gmail.com` (acento) e `analiafranco@supervisa.com` (typo no domínio)

### ❌ Bloqueios

Nenhum bloqueio crítico.

---

## 🏗️ Arquitetura — Fluxo completo

```
1. FRANQUEADO
   ↓ acessa /cadastro (ou /onboarding/[token] se admin gerou)
   ↓ preenche 9 steps com máscaras + validação
   ↓ POST /api/cadastro/submit (anti-spam + dedup)
2. SUPABASE
   ↓ INSERT em crm_onboarding.onboarding_submissoes
   ↓ status="enviado"
3. ADMIN (em /onboardings)
   ↓ revisa submissão no drawer
   ↓ clica "Aprovar" → escolhe provider (Cloud ou WAHA)
   ↓ POST /api/onboarding/admin/aprovar
   ↓ Cria registro em unidades + agentes (com 6 etapas via trigger)
   ↓ status="aprovado", unidade_id linked
4. ADMIN clica "🚀 Provisionar agora no Chatwoot"
   ↓ POST /api/onboarding/admin/provisionar
   ↓ Invoca Edge Function provisionar-chatwoot-unidade (timeout 180s)
5. EDGE FUNCTION (27 chamadas API)
   ↓ 1. POST /platform/api/v1/accounts → cria Account
   ↓ 1b. POST /platform/api/v1/users (owner DDG) + vincula via account_users
   ↓ 2. POST /accounts/{id}/inboxes (WAHA ou Cloud)
   ↓ 3. POST /accounts/{id}/agents × 6 (5 globais + locais)
   ↓ 4. POST /accounts/{id}/funnels → cria funil
   ↓ 5. PATCH /accounts/{id}/funnels/{id} → 7 stages
   ↓ 6. POST /accounts/{id}/labels × 13
   ↓ 7. POST /accounts/{id}/automation_rules × 3
   ↓ 8. POST /accounts/{id}/dashboard_apps × 2
   ↓ ROLLBACK automático em qualquer falha (DELETE account)
6. SUPABASE
   ↓ UPDATE unidades SET chatwoot_account_id, chatwoot_inbox_id, chatwoot_funnel_id
   ↓ status submission = "provisionado"
7. DRAWER ATUALIZA com IDs Chatwoot + link "Abrir no Chatwoot"
```

---

## 🗄️ Tabelas Supabase (schema `crm_onboarding`)

| Tabela | Função |
|---|---|
| `usuarios` | Auth painel (super_admin / admin / viewer) |
| `unidades` | Source of truth — 25 unidades atualmente |
| `agentes` | Agentes operacionais por unidade — 50 hoje |
| `etapas_onboarding` | 6 etapas por unidade (auto-criadas via trigger) |
| `sub_etapas` | 3 sub-itens dentro de "Grupo WhatsApp" |
| `historico_etapas` | Audit trail de mudanças de status |
| `sync_log` | Histórico de syncs |
| `onboarding_submissoes` | Submissões do `/cadastro` (em_andamento/enviado/aprovado/rejeitado/provisionado) |
| `chatwoot_accounts` | Cache das accounts Chatwoot pra monitoramento |
| `chatwoot_status_inbox` | Histórico de status (online/offline) |
| `chatwoot_agents` | (vazia hoje — pra futuro sync de agentes) |
| `unidade_chatwoot_link` | Vínculo manual unidade ↔ Chatwoot |

**Views**: `v_unidades_resumo`, `v_funil_etapas`, `v_chatwoot_status_atual`

### Etapas do Onboarding (Kanban)

1. **painel_criado** — Account Chatwoot criada
2. **grupo_whatsapp** — Grupo WhatsApp criado (3 sub-itens: criado / time interno / franqueado)
3. **acessos_enviados** — Acessos enviados pros agentes
4. **conexao_whatsapp** — WhatsApp conectado (QR code lido)
5. **treinamento** — Treinamento realizado com o franqueado
6. **grupo_suporte_ativo** — Grupo virou canal de suporte ativo

---

## 🔧 Endpoints API

### Públicos
- `POST /api/cadastro/submit` — submissão do quiz `/cadastro`
- `POST /api/onboarding/iniciar` — gera token único pra link
- `POST /api/onboarding/[token]/submit` — submissão do quiz com token
- `GET /api/onboarding/[token]` — recupera estado do quiz

### Admin (auth required)
- `POST /api/onboarding/admin/aprovar` — aprova submissão + cria unidade (precisa `provider_chatwoot`)
- `POST /api/onboarding/admin/rejeitar` — rejeita com motivo
- `POST /api/onboarding/admin/provisionar` ⭐ — invoca Edge Function de provisionamento Chatwoot
- `POST /api/sync/trigger` — força sync Sheets→DB
- `GET/POST /api/usuarios` — CRUD usuários painel
- `GET /api/chatwoot/accounts` — lista accounts
- `POST /api/chatwoot/agents/sync` — sync agentes Chatwoot
- `GET /api/chatwoot/inboxes/status` — status atual
- `POST /api/chatwoot/inboxes/[id]/qrcode` — pega QR pra reconectar
- `POST /api/chatwoot/inboxes/[id]/reconnect` — força reconexão
- `GET /api/alertas` — lista alertas ativos

---

## 🔐 Envs Vercel (configuradas em produção)

```
NEXT_PUBLIC_SUPABASE_URL=https://hkjukobqpjezhpxzplpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-key-sb_secret_...>

# Chatwoot
CHATWOOT_BASE_URL=https://crmsupervisao.com
CHATWOOT_TOKEN=<bot-token>
CHATWOOT_PLATFORM_TOKEN=9213d3cae70a9792ea15f1cf05ba2f338d9b77be665d0f0236d3a9ae849caeb5

# WAHA (provider WhatsApp não-oficial)
WAHA_API_URL=https://waha.aifocus.dev
WAHA_ADMIN_TOKEN=dc372bd703c2404387bbfc6a7cdf656b

# WhatsApp Cloud (quando provider for cloud)
META_API_KEY=<pending>
META_WABA_ID=<pending>
META_PHONE_NUMBER_ID=<pending>
META_BUSINESS_ACCOUNT_ID=<pending>

# Google Sheets sync (legacy)
GOOGLE_SERVICE_ACCOUNT_JSON=<base64-encoded>
SHEETS_ID=1nrcFrSgx2gBhNaUNlRJG1AWVcyWlxhPqjF7Uik8Y6Jw
```

**Edge Functions deployadas:**
- `crm-sync-form-to-db` (legacy)
- `provisionar-chatwoot-unidade` v2 ⭐

---

## 🚦 Regras Críticas (NUNCA QUEBRAR)

1. **Provider WhatsApp é decisão técnica do time DDG** — franqueado NÃO escolhe. Aprovação no `/onboardings` exige `provider_chatwoot` ('whatsapp_cloud' ou 'waha')
2. **Provisionamento é idempotente** — se `chatwoot_account_id` já existe, não reprovisiona (a menos que `force: true`)
3. **Rollback automático** — qualquer falha nas 27 chamadas API → DELETE account no Chatwoot
4. **Owner user obrigatório** — Platform token NÃO autoriza criar inbox direto. Edge Function cria user DDG primeiro, vincula via `account_users`, daí usa o `access_token` do user
5. **WAHA status real** — Chatwoot `provider_connection` tem bug, sempre cruzar com WAHA `/api/sessions`
6. **`.soffia-scope`** isolado — paleta da LP `/crm` NÃO vaza pras rotas internas
7. **Versionamento de Edge Function** — incrementar versão a cada deploy
8. **Branch `main`** = produção (auto-deploy Vercel). Qualquer push aqui sobe em ~40s
9. **NUNCA `git add -A`** — tem arquivos pre-existentes com erros que quebram build. Adicionar arquivo por arquivo

---

## 🛠️ Comandos rápidos

```bash
# Desenvolvimento local
npm install
cp .env.local.example .env.local  # preencher envs
npm run dev                        # http://localhost:3000

# Build local (validar antes de push)
npm run build

# Type-check
npx tsc --noEmit

# Deploy é automático: git push origin main → Vercel rebuild em ~40s
```

---

## 📚 Documentos relacionados

- `README.md` — visão geral pública
- `REGRAS_E_LOGICA.md` — regras de negócio detalhadas
- `MANUAL_DE_USO.md` — manual operacional pro time
- `DEPLOY.md` — setup do projeto do zero
- `HANDOFF_PROMPT.md` ⭐ — prompt pra continuar projeto em outra máquina/sessão
- `docs/PROVISIONAMENTO_CHATWOOT.md` — referência completa "Padrão Brasília" (27 chamadas API)

---

## 🎯 Continuar projeto em chat novo / outra máquina

Cole o conteúdo de `HANDOFF_PROMPT.md` no primeiro turno do novo Claude. Ele lê este `CLAUDE.md` + docs relacionados + as skills (`chatwoot-api`, `supabase-postgres-best-practices`, `spv-core`) e já tem contexto completo.

---

## 📊 Stats atuais (15/05/2026)

| Métrica | Valor |
|---|---|
| Unidades cadastradas | 25 |
| Agentes operacionais | 50 |
| E-mails únicos no sistema | 43 (2 com problema) |
| Unidades provisionadas no Chatwoot via Edge Function | 0 (sistema novo) |

---

## 🆘 Quando algo dá errado

| Sintoma | Causa provável | Fix |
|---|---|---|
| Botão "Provisionar agora" retorna 401 | Service role key vencida ou env errado | Conferir `SUPABASE_SERVICE_ROLE_KEY` no Vercel |
| Edge Function falha em "criar inbox" | Platform token não tem acesso à account nova | Verificar se passo `1b` (criar user owner + vincular) executou — v2 já corrige isso |
| Cadastro retorna 429 | Anti-spam — 5 submissões do mesmo IP em 24h | Esperar 24h ou liberar manualmente no banco |
| Cadastro retorna 409 (duplicado) | Mesma unidade+telefone nos últimos 7 dias | Conferir submissions existentes, deletar a antiga se necessário |
| Vercel não atualizou após push | Build falhando | Conferir Inspector URL do deployment |
| Status Chatwoot mostra "offline" mas WhatsApp funciona | Bug do `provider_connection` do Chatwoot | `/caixas-entrada` já cruza com WAHA real |
| LP `/crm` quebrou visual | Mudança em `.soffia-scope` ou conflito Tailwind | Rever `app/crm/soffia.css` |

---

## 📝 Histórico recente de commits

```
1271e88 feat(ui): reestruturação visual completa + botão "Provisionar agora"
af5b400 feat(supabase): Edge Function provisionar-chatwoot-unidade
d5278b0 feat(onboarding): provider WhatsApp na aprovação + doc Padrão Brasília
8df0834 feat(cadastro): boas-vindas premium + máscaras de formatação
364c6d8 feat(cadastro): logo real + visual premium no quiz
4d8d67d feat(crm/lp): aplicar logo PNG oficial SuperVisão
913e9d4 fix(crm/lp): trocar emojis quadrados por SVGs minimalistas
23171a2 feat: mockups fiéis aos prints reais (Dashboard + Agenda + Kanban)
6397b8e feat: /crm reconstruída fiel à LP da Soffia + tokens unificados
05bc35a feat: landing page /crm pra vender o CRM SuperVisão pros franqueados
```
