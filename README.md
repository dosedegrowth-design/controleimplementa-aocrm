# Controle CRM SuperVisão

Painel interno da **Dose de Growth** que gerencia o onboarding de novas unidades da rede **SuperVisão** no Chatwoot — do cadastro do franqueado até o provisionamento automático da conta Chatwoot completa.

🌐 **Produção:** https://controleimplementa-aocrm.vercel.app
📄 **Estado atual do projeto:** [`CLAUDE.md`](./CLAUDE.md)
📄 **Regras de negócio:** [`REGRAS_E_LOGICA.md`](./REGRAS_E_LOGICA.md)
📄 **Manual operacional:** [`MANUAL_DE_USO.md`](./MANUAL_DE_USO.md)
📄 **Padrão de provisionamento:** [`docs/PROVISIONAMENTO_CHATWOOT.md`](./docs/PROVISIONAMENTO_CHATWOOT.md)
📄 **Setup do zero:** [`DEPLOY.md`](./DEPLOY.md)
📄 **Handoff (outra máquina/sessão):** [`HANDOFF_PROMPT.md`](./HANDOFF_PROMPT.md)

---

## O que faz

1. **`/crm`** — Landing page pra apresentar o produto aos franqueados (estética Soffia)
2. **`/cadastro`** — Quiz multi-step público (9 etapas) substitui o Google Form antigo
3. **`/onboardings`** — Time DDG revisa submissões, aprova com 1 clique escolhendo provider (Cloud/WAHA)
4. **Botão "Provisionar agora"** — Cria conta Chatwoot completa em ~30s (27 chamadas API: Account, Inbox, Agentes, Funil, Stages, Labels, Automações, Dashboard Apps)
5. **`/`** (Centro de Controle) — Kanban de etapas + lista detalhada por unidade
6. **`/caixas-entrada`** — Monitor de status WhatsApp das inboxes
7. **`/relatorios`** — Tempo médio por etapa, gargalos, performance

---

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4
- **UI:** shadcn-style + Radix + Lucide + Framer Motion
- **Banco:** Supabase Postgres (schema `crm_onboarding`)
- **Auth:** Supabase Auth (email + senha)
- **Edge Functions:** Deno
  - `crm-sync-form-to-db` — sync legacy do Google Sheets
  - `provisionar-chatwoot-unidade` v2 — provisionamento Chatwoot
- **Deploy:** Vercel (auto-deploy do `main`)

---

## Quickstart

```bash
git clone https://github.com/dosedegrowth-design/controleimplementa-aocrm.git
cd controleimplementa-aocrm
npm install
cp .env.local.example .env.local   # preencher envs (ver CLAUDE.md)
npm run dev
```

Abra http://localhost:3000 e faça login com `dosedegrowth@gmail.com`.

---

## Estrutura

```
controleimplementa-aocrm/
├── app/
│   ├── (app)/                    # rotas autenticadas
│   │   ├── page.tsx              # Centro de Controle (Kanban)
│   │   ├── onboardings/          # admin de submissões + botão Provisionar
│   │   ├── caixas-entrada/       # monitor WhatsApp
│   │   ├── relatorios/
│   │   ├── configuracoes/
│   │   └── app-shell.tsx
│   ├── api/
│   │   ├── cadastro/submit/      # quiz público
│   │   └── onboarding/admin/
│   │       ├── aprovar/          # cria unidade
│   │       ├── rejeitar/
│   │       └── provisionar/      # ⭐ invoca Edge Function
│   ├── cadastro/                 # quiz público 9 etapas
│   ├── crm/                      # LP marketing (estética Soffia)
│   ├── login/
│   └── globals.css               # tokens + .spv-table + .hero-gradient
├── components/
│   ├── ui/                       # primitives
│   ├── page-hero.tsx             # ⭐ Hero gradient padrão SPV
│   ├── section-header.tsx        # ⭐ header de seção
│   ├── kpi-card.tsx              # KPI com Framer Motion + tabular-nums
│   ├── sidebar.tsx               # 240/64px mobile sheet
│   └── dashboard/                # kanban-board, unidades-table, drawer
├── lib/
│   ├── supabase/                 # client + server + middleware
│   ├── format.ts                 # máscaras BR (telefone, email, IG)
│   ├── types.ts
│   └── utils.ts
├── supabase/
│   ├── migrations/               # SQL crm_onboarding
│   └── functions/
│       ├── crm-sync-form-to-db/
│       └── provisionar-chatwoot-unidade/   # ⭐ v2 (27 API calls + rollback)
└── docs/
    └── PROVISIONAMENTO_CHATWOOT.md
```

---

## Schema Supabase (`crm_onboarding`)

| Tabela | Função |
|---|---|
| `usuarios` | Auth painel (super_admin / admin / viewer) |
| `unidades` | Source of truth — unidades da rede |
| `agentes` | Agentes operacionais por unidade |
| `etapas_onboarding` | 6 etapas/unidade (auto via trigger) |
| `sub_etapas` | 3 itens dentro de "Grupo WhatsApp" |
| `historico_etapas` | Audit trail |
| `sync_log` | Histórico syncs |
| `onboarding_submissoes` | Submissões `/cadastro` |
| `chatwoot_accounts` | Cache accounts Chatwoot |
| `chatwoot_status_inbox` | Status WhatsApp |

Triggers automáticos: ao inserir unidade → cria 6 etapas + 3 sub-etapas; ao mudar status etapa → atualiza histórico + recalcula `status_geral` da unidade.

---

## Provisionamento Chatwoot — "Padrão Brasília"

Edge Function `provisionar-chatwoot-unidade` v2 executa idempotentemente em sequência:

1. **Account** via Platform API
2. **Owner User** DDG + vínculo via `account_users` (obtém token com acesso)
3. **Inbox** WAHA ou WhatsApp Cloud (conforme `provider_chatwoot`)
4. **Agentes** (5 globais SuperVisão + locais da submissão)
5. **Funnel** + 7 stages (Lead, Interesse, Qualificado, Delivery, Agendado, Fechado, Perdido)
6. **13 Labels** (cores do Padrão Brasília)
7. **3 Automation Rules** (Kanban Lead, TAG Google, TAG Meta)
8. **2 Dashboard Apps** (Dashboard + Registro Manual)

**Rollback automático**: qualquer falha → DELETE account.

Detalhes completos em [`docs/PROVISIONAMENTO_CHATWOOT.md`](./docs/PROVISIONAMENTO_CHATWOOT.md).

---

## Acesso

- **Super Admin**: `dosedegrowth@gmail.com` (senha via Supabase Dashboard)
- **Demais admins**: criados via `/configuracoes` (apenas super_admin pode adicionar)

---

## Continuar em outra máquina/sessão

Cole o conteúdo de [`HANDOFF_PROMPT.md`](./HANDOFF_PROMPT.md) no primeiro turno de um novo Claude — ele lê `CLAUDE.md` + docs + skills relevantes e tem contexto completo.

---

Projeto da [Dose de Growth](https://dosedegrowth.pro) para a rede [SuperVisão](https://supervisao.com).
