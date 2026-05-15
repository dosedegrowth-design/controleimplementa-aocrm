# 🚀 HANDOFF — CRM SuperVisão (arquivo único, auto-contido)

> **Você está aqui:** quer continuar o projeto **CRM SuperVisão** (controleimplementa-aocrm) em outra máquina, outro chat, ou daqui a meses.
>
> **Este arquivo tem TUDO** que você precisa. Não precisa abrir mais nada.
>
> Última atualização: **15/05/2026**

---

## ⚡ COMO USAR (3 passos)

### 1. Clone o repo na máquina nova

```bash
cd ~/Antigravity   # ou onde preferir
git clone https://github.com/dosedegrowth-design/controleimplementa-aocrm.git
cd controleimplementa-aocrm
npm install
```

### 2. Crie `.env.local` (copie o bloco do final deste arquivo)

### 3. Abra um chat novo no Claude Code e cole o **PROMPT PRONTO** (logo abaixo)

Pronto. O Claude novo vai ter o mesmo contexto que tinha na máquina antiga.

---

## 📋 PROMPT PRONTO (cole no primeiro turno do chat novo)

```
Estou continuando o projeto CRM SuperVisão (controleimplementa-aocrm) em outra máquina.

Lê o arquivo /Users/<seu-usuario>/Antigravity/controleimplementa-aocrm/HANDOFF.md
— ele tem TODO o contexto auto-contido (estado, regras, credenciais, troubleshooting).

CONTEXTO RÁPIDO:
- Painel interno DDG pra onboarding de unidades SuperVisão no Chatwoot
- Produção: https://controleimplementa-aocrm.vercel.app
- Supabase project hkjukobqpjezhpxzplpj, schema crm_onboarding
- Chatwoot prod https://crmsupervisao.com (Platform API criando accounts)
- 25 unidades + 50 agentes cadastrados, 0 provisionadas via Edge Function ainda
- Última feature: botão "Provisionar agora" em /onboardings funciona end-to-end

PRÓXIMA AÇÃO:
[diga aqui o que você quer fazer agora — ex: "Provisionar a primeira unidade real",
"Adicionar campo X no quiz", "Investigar bug Y", "Continuar de onde paramos"]

Quando entender o contexto, me confirma com resumo de 3-5 linhas e me pergunta
o que vou querer fazer.
```

---

## 🎯 O QUE É O PROJETO

**Controle CRM SuperVisão** — painel interno da Dose de Growth (DDG) que gerencia o onboarding de novas unidades da rede SuperVisão no Chatwoot.

### Cobre o ciclo completo:

```
1. FRANQUEADO
   ↓ acessa /cadastro (quiz multi-step 9 etapas, salva em localStorage)
   ↓ POST /api/cadastro/submit (anti-spam + dedup)
2. SUPABASE
   ↓ INSERT em onboarding_submissoes, status="enviado"
3. ADMIN DDG (em /onboardings)
   ↓ revisa, clica "Aprovar" → escolhe provider (WhatsApp Cloud ou WAHA)
   ↓ Cria registro em unidades + agentes (6 etapas via trigger)
4. ADMIN clica "🚀 Provisionar agora no Chatwoot"
   ↓ Edge Function executa 27 chamadas API (~30s)
5. CONTA CHATWOOT 100% PRONTA: Account, Inbox, Funil, 7 Stages, 13 Labels,
   3 Automações, 2 Dashboard Apps
6. STATUS = "provisionado", drawer mostra link "Abrir no Chatwoot"
```

### URLs

| Função | URL |
|---|---|
| Painel admin | https://controleimplementa-aocrm.vercel.app |
| LP marketing (pros franqueados) | https://controleimplementa-aocrm.vercel.app/crm |
| Forms público (quiz) | https://controleimplementa-aocrm.vercel.app/cadastro |
| Login admin | https://controleimplementa-aocrm.vercel.app/login |
| GitHub | https://github.com/dosedegrowth-design/controleimplementa-aocrm |

### Identificadores cloud

| Serviço | ID |
|---|---|
| Vercel team | `dose-de-growths-projects` |
| Vercel project | `controleimplementa-aocrm` (id `prj_m7jSLFDaxx8lIRatqS9nbAI9XFuy`) |
| Supabase project | `hkjukobqpjezhpxzplpj` (DDG, sa-east-1) |
| Schema Supabase | `crm_onboarding` |
| Chatwoot prod | https://crmsupervisao.com |

---

## 🤖 STACK

- **Frontend:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4
- **UI:** shadcn-style + Radix UI + Lucide icons + Framer Motion
- **Banco:** Supabase PostgreSQL 15 (schema `crm_onboarding`)
- **Auth:** Supabase Auth (email + senha)
- **Edge Functions:** Deno
  - `crm-sync-form-to-db` — sync legacy do Google Sheets
  - `provisionar-chatwoot-unidade` **v2** — provisionamento Chatwoot (27 API calls + rollback)
- **Deploy:** Vercel (auto-deploy do `main`, ~40s)
- **WhatsApp providers:** WhatsApp Cloud (Meta oficial) ou WAHA (não-oficial)

---

## 📊 ESTADO ATUAL (15/05/2026)

### ✅ Funcionando 100% em produção

**Sistema base**
- Schema `crm_onboarding` com 12 tabelas + 6 triggers + 2 views
- 25 unidades cadastradas com 50 agentes
- Painel autenticado com Sidebar (240/64px), 5 rotas internas
- Visual unificado com `dash-supervisao` (PageHero gradient navy, KPICard padronizado, Framer Motion, tabelas `spv-table`)

**Forms público `/cadastro`**
- Quiz multi-step 9 etapas com salvamento automático
- Máscaras formatação BR (telefone, email, Instagram)
- Anti-spam (5 submissões/IP/24h) + deduplicação (7 dias)

**LP marketing `/crm`**
- Estética Soffia (Archivo display + Inter Tight + JetBrains Mono)
- Paleta isolada em `.soffia-scope` (RED #E30613, NAVY #0F172A)

**Admin `/onboardings`**
- Drawer com 3 estados (enviado / aprovado / provisionado)
- Botão "🚀 Provisionar agora" testado end-to-end
- Render do resultado: badges Account/Inbox/Funnel IDs + steps expansíveis

**Caixas de Entrada `/caixas-entrada`**
- Monitor inboxes Chatwoot — bypassa bug do `provider_connection`, consulta WAHA direto

**Relatórios `/relatorios` + Configurações `/configuracoes`**
- Tempo médio por etapa, gargalos, perf por responsável
- CRUD usuários (super_admin only)

### 🟡 Pendências futuras

- Cadastrar OBD e Super Cautelar no WordPress da SuperVisão
- Templates Meta WhatsApp aprovados (pra mensagens fora janela 24h em Cloud)
- Dashboard de métricas agregadas
- Corrigir 2 e-mails problemáticos: `administração.aprove@gmail.com` (acento) e `analiafranco@supervisa.com` (typo)

---

## 🗄️ SCHEMA SUPABASE (`crm_onboarding`)

| Tabela | Função |
|---|---|
| `usuarios` | Auth painel (super_admin / admin / viewer) |
| `unidades` | Source of truth — 25 unidades hoje |
| `agentes` | Agentes por unidade — 50 hoje |
| `etapas_onboarding` | 6 etapas/unidade (auto via trigger) |
| `sub_etapas` | 3 sub-itens dentro de "Grupo WhatsApp" |
| `historico_etapas` | Audit trail |
| `sync_log` | Histórico syncs |
| `onboarding_submissoes` | Submissões `/cadastro` (em_andamento/enviado/aprovado/rejeitado/provisionado) |
| `chatwoot_accounts` | Cache accounts Chatwoot |
| `chatwoot_status_inbox` | Histórico status WhatsApp |
| `chatwoot_agents` | (vazia hoje — pra futuro sync) |
| `unidade_chatwoot_link` | Vínculo manual unidade ↔ Chatwoot |

**Views:** `v_unidades_resumo`, `v_funil_etapas`, `v_chatwoot_status_atual`

### Etapas do Onboarding (Kanban)

1. **painel_criado** — Account Chatwoot criada
2. **grupo_whatsapp** — Grupo criado (3 sub-itens: criado / time interno / franqueado)
3. **acessos_enviados** — Acessos pros agentes
4. **conexao_whatsapp** — QR code lido
5. **treinamento** — Treinamento c/ franqueado
6. **grupo_suporte_ativo** — Grupo virou suporte permanente

Status por etapa: `pendente → em_andamento → concluido` (ou `bloqueado` / `nao_aplicavel`).

---

## 🔧 ENDPOINTS API

### Públicos
- `POST /api/cadastro/submit` — submit do quiz
- `POST /api/onboarding/iniciar` — gera token único
- `POST /api/onboarding/[token]/submit` — submit com token
- `GET /api/onboarding/[token]` — recupera estado do quiz

### Admin (auth required)
- `POST /api/onboarding/admin/aprovar` — aprova + cria unidade (precisa `provider_chatwoot`)
- `POST /api/onboarding/admin/rejeitar` — rejeita com motivo
- `POST /api/onboarding/admin/provisionar` ⭐ — invoca Edge Function
- `POST /api/sync/trigger` — força sync Sheets→DB
- `GET/POST /api/usuarios` — CRUD usuários
- `GET /api/chatwoot/accounts` — lista accounts
- `GET /api/chatwoot/inboxes/status` — status atual
- `POST /api/chatwoot/inboxes/[id]/qrcode` — QR pra reconectar
- `POST /api/chatwoot/inboxes/[id]/reconnect` — força reconexão
- `GET /api/alertas` — lista alertas

---

## 🏗️ PROVISIONAMENTO CHATWOOT — "Padrão Brasília"

### Sequência das 27 chamadas API

| # | Chamada | Token |
|---|---|---|
| 1 | `POST /platform/api/v1/accounts` | Platform |
| 1b | `POST /platform/api/v1/users` (owner DDG) + `POST /platform/api/v1/accounts/{id}/account_users` | Platform |
| 2 | `POST /api/v1/accounts/{id}/inboxes` (WAHA ou Cloud) | Owner token |
| 3 | `POST /api/v1/accounts/{id}/agents` × 6 (5 globais + locais) | Owner token |
| 4 | `POST /api/v1/accounts/{id}/funnels` | Owner token |
| 5 | `PATCH /api/v1/accounts/{id}/funnels/{id}` (7 stages) | Owner token |
| 6 | `POST /api/v1/accounts/{id}/labels` × 13 | Owner token |
| 7 | `POST /api/v1/accounts/{id}/automation_rules` × 3 | Owner token |
| 8 | `POST /api/v1/accounts/{id}/dashboard_apps` × 2 | Owner token |
| 9 | UPDATE Supabase com IDs e status='provisionado' | (interno) |

### Por que o passo "1b" (owner user)?

O **Platform Token cria contas mas NÃO autoriza** chamadas `/api/v1/accounts/{id}/*` — retorna 401. **v2 da Edge Function** resolve criando um User Owner DDG (`ddg-owner-acc{N}@dosedegrowth.com.br`) com senha randomizada, vinculando via `account_users` (passo extra obrigatório), e usando o `access_token` retornado pra todas as 26 chamadas seguintes.

### Rollback automático

Qualquer falha das chamadas 2-8 → `DELETE /platform/api/v1/accounts/{id}` → estado limpo.

### 7 Stages criados (cores Padrão Brasília)

```
1. Lead          #f80dad (rosa)
2. Interesse     #13fbcd (ciano)    ← default_stage
3. Qualificado   #06B6D4 (sky)
4. Delivery     #01f9a6 (verde-claro)
5. Agendado     #06b0f9 (azul)
6. Fechado      #0af50e (verde)
7. Perdido      #ff0000 (vermelho)
```

### 13 Labels

`diagnosticoeletronico`, `google`, `infracaodetransito`, `laudodetransferencia`, `meta`, `supercautelar`, `vendedor`, `vistoriacautelar`, `vistoriacerticar`, `vistoriacsv`, `vistoriademoto`, `vistoriadepintura`, `vistorialacrada`

### 3 Automações

1. **Kanban Lead** — `conversation_created` → funil stage `lead_{slug}`
2. **TAG Google** — `message_created` contains "Google" → label `google`
3. **TAG Meta** — `message_created` contains "Meta" → label `meta`

### 2 Dashboard Apps

1. **Dashboard** → iframe `https://dashboardsupervisao.vercel.app/`
2. **Registro Manual** → iframe `https://dashboardsupervisao.vercel.app/dashboard/registro-manual`

### 5 Agentes globais SuperVisão (sempre adicionados)

- Renato Carlet · `renato.carlet@supervisao.com`
- Leo Souza · `leosouza@supervisao.com`
- Rodrigo · `rodrigo.ribeirinho@supervisao.com`
- Cris Dmais1 · `cris@dmais1.com.br`
- Dose De Growth · `dosedegrowth@gmail.com`

---

## 🚦 REGRAS CRÍTICAS (NUNCA QUEBRAR)

1. **Provider WhatsApp é decisão técnica do time DDG** — franqueado NÃO escolhe. Aprovação no `/onboardings` exige `provider_chatwoot`
2. **Provisionamento é idempotente** — se `chatwoot_account_id` existe, não reprovisiona (a menos que `force: true`)
3. **Rollback automático** — qualquer falha das 27 calls → DELETE account
4. **Owner user obrigatório** — Platform token sozinho não cria inbox. Edge Function cria user + vincula via `account_users`
5. **WAHA status real** — Chatwoot `provider_connection` tem bug, sempre cruzar com WAHA `/api/sessions`
6. **`.soffia-scope`** isolado — paleta da LP `/crm` NÃO vaza pras rotas internas
7. **Branch `main`** = produção (auto-deploy Vercel ~40s)
8. **NUNCA `git add -A`** — tem arquivos pre-existentes com erros (matriz/comercial) que quebram build. Adicionar arquivo por arquivo
9. **Edge Functions versionadas** — incrementar versão a cada deploy

---

## 🆘 TROUBLESHOOTING

| Sintoma | Causa provável | Fix |
|---|---|---|
| Botão "Provisionar" retorna 401 | Service role key vencida ou env errado | Conferir `SUPABASE_SERVICE_ROLE_KEY` no Vercel |
| Edge Function falha em "criar inbox" | Platform token sem acesso à account nova | Garantir que passo 1b (owner user + account_users) executou — v2 já corrige |
| Cadastro retorna 429 | Anti-spam — 5 submissões mesmo IP em 24h | Esperar 24h ou liberar no banco |
| Cadastro retorna 409 | Mesma unidade+telefone últimos 7 dias | Deletar submission antiga se quiser refazer |
| Vercel não atualizou após push | Build falhando | Conferir Inspector URL do deployment |
| Status Chatwoot "offline" mas WhatsApp funciona | Bug `provider_connection` | `/caixas-entrada` já cruza com WAHA real |
| LP `/crm` quebrou visual | Mudança em `.soffia-scope` ou Tailwind conflict | Rever `app/crm/soffia.css` |
| `npm run build` falha | Cache do Turbopack | `rm -rf .next node_modules && npm install && npm run build` |

---

## 📂 ESTRUTURA DO PROJETO

```
controleimplementa-aocrm/
├── app/
│   ├── (app)/                    # rotas autenticadas
│   │   ├── page.tsx              # Centro de Controle (Kanban)
│   │   ├── onboardings/          # admin + botão Provisionar
│   │   ├── caixas-entrada/       # monitor WhatsApp
│   │   ├── relatorios/
│   │   ├── configuracoes/
│   │   └── app-shell.tsx
│   ├── api/
│   │   ├── cadastro/submit/      # quiz público
│   │   └── onboarding/admin/
│   │       ├── aprovar/
│   │       ├── rejeitar/
│   │       └── provisionar/      # ⭐ invoca Edge Function
│   ├── cadastro/                 # quiz público 9 etapas
│   ├── crm/                      # LP marketing (Soffia)
│   ├── login/
│   └── globals.css
├── components/
│   ├── ui/                       # primitives
│   ├── page-hero.tsx             # ⭐ Hero gradient SPV
│   ├── section-header.tsx        # ⭐ header de seção
│   ├── kpi-card.tsx              # KPI + tabular-nums
│   ├── sidebar.tsx               # 240/64px mobile sheet
│   └── dashboard/                # kanban-board, table, drawer
├── lib/
│   ├── supabase/                 # client + server + middleware
│   ├── format.ts                 # máscaras BR
│   ├── types.ts
│   └── utils.ts
├── supabase/
│   ├── migrations/               # SQL crm_onboarding
│   └── functions/
│       ├── crm-sync-form-to-db/
│       └── provisionar-chatwoot-unidade/   # ⭐ v2
├── docs/
│   └── PROVISIONAMENTO_CHATWOOT.md
└── HANDOFF.md  ← VOCÊ ESTÁ AQUI
```

---

## 🛠️ COMANDOS RÁPIDOS

```bash
# Desenvolvimento local
npm install
cp .env.local.example .env.local  # preencher conforme bloco abaixo
npm run dev                        # http://localhost:3000

# Build local (validar antes de push)
npm run build

# Type-check
npx tsc --noEmit

# Deploy é automático: git push origin main → Vercel rebuild em ~40s

# Invocar Edge Function de provisionamento via curl (teste manual)
curl -X POST \
  https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/provisionar-chatwoot-unidade \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"unidade_id":"<UUID>"}'
```

---

## 🔐 `.env.local` — TEMPLATE COMPLETO

> Copie esse bloco pra `controleimplementa-aocrm/.env.local` na máquina nova.
> Os 4 valores marcados `<PEGAR>` você precisa copiar do Vercel ou Supabase Dashboard.

```bash
# ────────────────────────────────────────────────────────────────
# Supabase
# ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://hkjukobqpjezhpxzplpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<PEGAR no Supabase Dashboard → Project Settings → API → anon public>
SUPABASE_SERVICE_ROLE_KEY=<PEGAR no Supabase Dashboard → Project Settings → API → service_role>

# ────────────────────────────────────────────────────────────────
# Chatwoot
# ────────────────────────────────────────────────────────────────
CHATWOOT_BASE_URL=https://crmsupervisao.com
CHATWOOT_TOKEN=<PEGAR no Vercel envs ou painel Chatwoot bot user>
CHATWOOT_PLATFORM_TOKEN=9213d3cae70a9792ea15f1cf05ba2f338d9b77be665d0f0236d3a9ae849caeb5

# ────────────────────────────────────────────────────────────────
# WAHA (provider WhatsApp não-oficial)
# ────────────────────────────────────────────────────────────────
WAHA_API_URL=https://waha.aifocus.dev
WAHA_ADMIN_TOKEN=dc372bd703c2404387bbfc6a7cdf656b

# ────────────────────────────────────────────────────────────────
# WhatsApp Cloud (quando provider=cloud, pendente de configurar)
# ────────────────────────────────────────────────────────────────
META_API_KEY=PENDING_META_API_KEY
META_WABA_ID=PENDING_WABA_ID
META_PHONE_NUMBER_ID=PENDING_PHONE_ID
META_BUSINESS_ACCOUNT_ID=PENDING_BIZ_ID

# ────────────────────────────────────────────────────────────────
# Google Sheets sync (legacy, opcional)
# ────────────────────────────────────────────────────────────────
GOOGLE_SERVICE_ACCOUNT_JSON=<PEGAR base64 do JSON do service account>
SHEETS_ID=1nrcFrSgx2gBhNaUNlRJG1AWVcyWlxhPqjF7Uik8Y6Jw
```

---

## 🎯 ACESSO AO PAINEL

- **Super admin:** `dosedegrowth@gmail.com`
- **Senha:** definida via Supabase Dashboard → Authentication → Users
- **Demais admins:** criados via `/configuracoes` (apenas super_admin)

---

## 📞 CONTATOS / SUPORTE

- **Dono do projeto:** Lucas Cassiano (`dosedegrowth@gmail.com`)
- **GitHub issues:** https://github.com/dosedegrowth-design/controleimplementa-aocrm/issues
- **Empresa:** Dose de Growth (https://dosedegrowth.pro)
- **Cliente:** SuperVisão (https://supervisao.com)

---

## 📝 HISTÓRICO RECENTE DE COMMITS

```
5ba48ba docs: handoff completo (CLAUDE.md + REGRAS + README + HANDOFF_PROMPT)
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

---

## 📌 PRÓXIMA AÇÃO PROVÁVEL

Última coisa que estávamos planejando antes do handoff:

- **Provisionar a primeira unidade real no Chatwoot** (validar fluxo end-to-end com dados de produção, não mais teste)
- **Treinamento agendado** pra sexta-feira 15/05 às 15h via Google Meet (https://meet.google.com/qmb-mwzs-eao)
- **41 convites de e-mail** já enviados (excluindo 2 problemáticos)

---

**Fim do handoff. Bom trabalho na máquina nova! 🚀**
