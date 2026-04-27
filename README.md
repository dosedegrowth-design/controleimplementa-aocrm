# Controle CRM SuperVisão

Painel de controle de implantação do CRM (Chatwoot) por unidade da rede SuperVisão.
Alimentado automaticamente por um Google Form, com checklist de etapas, gestão de agentes, relatórios e controle de acesso.

📄 **Documentação completa de regras e lógica**: [`REGRAS_E_LOGICA.md`](./REGRAS_E_LOGICA.md)

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind v4
- **UI**: shadcn-style + Radix + Lucide + Framer Motion
- **Banco**: Supabase Postgres (schema `crm_onboarding`)
- **Auth**: Supabase Auth (email + senha)
- **Sync**: Supabase Edge Function Deno (Google Sheets API)
- **Deploy**: Vercel + GitHub

## Quickstart

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abra http://localhost:3000 e faça login.

## Estrutura

```
crm-supervisao/
├── app/
│   ├── (app)/                  # rotas autenticadas (Visão Geral, Unidades, Relatórios, Config)
│   ├── api/                    # API Routes (sync trigger, usuários CRUD)
│   ├── login/
│   ├── globals.css             # Design system SuperVisão
│   └── layout.tsx
├── components/
│   ├── ui/                     # primitives (button, card, input...)
│   ├── sidebar.tsx
│   ├── sync-button.tsx
│   ├── kpi-card.tsx
│   ├── funil-etapas.tsx
│   └── status-badge.tsx
├── lib/
│   ├── supabase/               # client + server + middleware
│   ├── types.ts                # tipos do schema
│   └── utils.ts                # helpers
├── supabase/
│   ├── migrations/             # SQL do schema crm_onboarding
│   └── functions/
│       └── crm-sync-form-to-db/  # Edge Function (Deno)
├── middleware.ts               # auth guard
└── REGRAS_E_LOGICA.md          # documentação completa
```

## Acesso inicial

- **Super Admin**: `dosedegrowth@gmail.com` (já cadastrado no banco)
- A senha deve ser definida via Supabase Dashboard > Authentication > Users

## Schema Supabase

Schema isolado: `crm_onboarding`

- `usuarios` — auth + roles (super_admin / admin / viewer)
- `unidades` — 1 por submissão do Form
- `agentes` — N por unidade (parseados do form)
- `etapas_onboarding` — checklist de 6 etapas por unidade (auto-criadas)
- `sub_etapas` — 3 sub-itens dentro de "Grupo WhatsApp"
- `historico_etapas` — audit trail
- `sync_log` — rastreio de sincronizações Sheets→DB

Triggers automáticos: ao inserir uma unidade, cria 6 etapas + 3 sub-etapas; ao mudar status de etapa, atualiza histórico e recalcula `status_geral` da unidade.

## Sincronização

Edge Function `crm-sync-form-to-db` lê a planilha do Form via service account, parseia "Dados do agente" e dá UPSERT em `unidades` + `agentes`. Não sobrescreve campos editados manualmente no painel (status, prioridade, observações, responsável).

Cron sugerido: a cada 5 minutos.

## Checklist de etapas

1. **Painel criado** no Chatwoot
2. **Grupo WhatsApp** (sub-itens: criado, time interno adicionado, franqueado adicionado)
3. **Acessos enviados** (controlado por agente individual)
4. **Conexão WhatsApp** feita
5. **Treinamento** realizado
6. **Grupo virou suporte ativo** (canal permanente)

---

Projeto da [Dose de Growth](https://dosedegrowth.pro) para a rede [SuperVisão](https://supervisao.com).
