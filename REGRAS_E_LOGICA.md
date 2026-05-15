# Regras de Negócio e Lógica — Controle CRM SuperVisão

> Documento de referência operacional. Atualizado em 15/05/2026.

---

## 1. Visão geral do produto

O CRM SuperVisão integra atendimento WhatsApp (Chatwoot + IA Soffia) com Kanban de vendas para cada unidade da rede de vistorias veiculares SuperVisão. Este projeto (`controleimplementa-aocrm`) **NÃO é o CRM em si** — é o **painel de implantação** que cria e acompanha o onboarding de cada nova unidade dentro do Chatwoot.

**3 atores:**
- **Franqueado** — dono de unidade SuperVisão que quer aderir ao CRM
- **Time DDG** — Dose de Growth, opera o painel, aprova e provisiona
- **Time SuperVisão Matriz** — recebe relatórios, define padrões

---

## 2. Ciclo de vida do Onboarding

### Status possíveis (tabela `onboarding_submissoes`)

| Status | Significado | Quem move |
|---|---|---|
| `em_andamento` | Franqueado começou a preencher o quiz, ainda não finalizou | Sistema (auto) |
| `enviado` | Franqueado finalizou o cadastro | Sistema (auto) |
| `aprovado` | Admin DDG validou e criou a unidade no banco | Admin manual |
| `rejeitado` | Admin DDG rejeitou (com motivo) | Admin manual |
| `provisionado` | Conta Chatwoot completamente criada | Sistema (Edge Function) |

### Transições válidas

```
[novo cadastro] → em_andamento → enviado → aprovado → provisionado
                                        └→ rejeitado
```

**Regra**: não permite voltar status. Só ir pra frente ou pra `rejeitado` quando estava `enviado`.

### Status da unidade (`unidades.status_geral`)

| Status | Quando |
|---|---|
| `pendente` | Recém-aprovada, ainda não começou as etapas |
| `em_andamento` | Pelo menos 1 etapa começada |
| `concluido` | Todas as 6 etapas marcadas como `concluido` |
| `bloqueado` | Manualmente marcado pelo admin (algo travou) |

Recálculo automático via trigger ao mudar status de qualquer etapa.

---

## 3. Quiz de Cadastro (`/cadastro`)

### Etapas (9)

1. **Boas-vindas** — explicação do processo
2. **Quantos atendentes vai ter** — define dinamicamente o nº de campos no Step 8
3. **Telefone do franqueado** — máscara BR + validação
4. **Nome do franqueado** — titleCase no blur
5. **Nome da unidade**
6. **Cidade/UF** — opcional
7. **Telefone(s) da inbox** — 1 ou mais números operacionais
8. **Atendimento** — horário + contato preferencial + Instagram
9. **Atendentes** — N agentes com nome/email/perfil (administrador ou agente)
10. **Revisão + Submit**

### Persistência

- **Draft em `localStorage`** — `STORAGE_KEY` salva tudo. Se franqueado fechar e voltar, recupera de onde parou
- **No submit** → `POST /api/cadastro/submit` → cria `onboarding_submissoes` com `status="enviado"`
- **Limpa draft** após submit OK

### Anti-spam e validações

- **Max 5 submissions por IP** nas últimas 24h (HTTP 429)
- **Dedup**: mesma `nome_unidade` + `telefone_franqueado` nos últimos 7 dias com status `enviado`/`aprovado`/`provisionado` → bloqueia (HTTP 409)
- **Obrigatórios**: nome_unidade, nome_franqueado, telefone_franqueado, pelo menos 1 agente válido (nome + email)
- **Auditoria**: salva `ip_address` e `user_agent`

### Rota alternativa: `/onboarding/[token]`

Quando o admin gera um link manual no `/onboardings`, cria submission com `status="em_andamento"` e `token_publico` único. Franqueado acessa via `/onboarding/[token]` e preenche o mesmo quiz, mas no submit já tem token (não cria registro novo, atualiza o existente).

---

## 4. Aprovação no `/onboardings`

### Quem pode aprovar

- `super_admin` ou `admin` (não `viewer`)
- Validado em `POST /api/onboarding/admin/aprovar`

### O que acontece na aprovação

1. Admin clica "Aprovar" → modal pede `provider_chatwoot` (Cloud ou WAHA)
2. Sistema:
   - INSERT em `crm_onboarding.unidades` (1 nova linha)
   - Trigger cria 6 etapas + 3 sub-etapas automaticamente
   - Para cada agente da submission, INSERT em `crm_onboarding.agentes` (perfil normalizado, email lowercase)
   - UPDATE submission: status='aprovado', aprovado_em, aprovado_por (email do admin), unidade_id, provider_chatwoot

### Decisão técnica: WhatsApp Cloud vs WAHA

| Critério | Cloud | WAHA |
|---|---|---|
| Setup | Demorado (precisa BM Meta) | Rápido (qualquer número) |
| Oficial Meta | ✅ | ❌ |
| Risco de ban | Baixíssimo | Pequeno |
| Custos | Por conversa (Meta) | Zero |
| Default sugerido | Apenas se franqueado já tem BM | **Sim — padrão atual** |

**Regra crítica**: franqueado NÃO escolhe. É decisão técnica do time DDG no momento da aprovação.

---

## 5. Provisionamento Chatwoot — "Padrão Brasília"

### Quando dispara

Admin clica "🚀 Provisionar agora no Chatwoot" no drawer de uma submission `aprovado` → `POST /api/onboarding/admin/provisionar` → invoca Edge Function `provisionar-chatwoot-unidade` v2 com timeout 180s.

### Idempotência

- Se `unidades.chatwoot_account_id` já existe → retorna sem refazer (skipped=true)
- Para forçar reprovisionamento → `{ force: true }` no body (cria account nova, a antiga **não é deletada** automaticamente)

### Sequência das 27 chamadas API

| # | Chamada | Token |
|---|---|---|
| 1 | `POST /platform/api/v1/accounts` | Platform |
| 1b | `POST /platform/api/v1/users` (owner DDG) + `POST /platform/api/v1/accounts/{id}/account_users` | Platform |
| 2 | `POST /api/v1/accounts/{id}/inboxes` (WAHA ou Cloud) | Owner token |
| 3 | `POST /api/v1/accounts/{id}/agents` × 6 | Owner token |
| 4 | `POST /api/v1/accounts/{id}/funnels` | Owner token |
| 5 | `PATCH /api/v1/accounts/{id}/funnels/{id}` (7 stages) | Owner token |
| 6 | `POST /api/v1/accounts/{id}/labels` × 13 | Owner token |
| 7 | `POST /api/v1/accounts/{id}/automation_rules` × 3 | Owner token |
| 8 | `POST /api/v1/accounts/{id}/dashboard_apps` × 2 | Owner token |
| 9 | UPDATE Supabase com IDs e status='provisionado' | (interno) |

**Detalhes completos** em `docs/PROVISIONAMENTO_CHATWOOT.md`.

### Por que o passo "1b"?

O **Platform Token** cria contas mas **NÃO autoriza** chamadas `/api/v1/accounts/{id}/*`. Tentar usá-lo diretamente retorna `401 You are not authorized to access this account`.

**Solução implementada na v2**: depois de criar a Account, criamos um User Owner DDG (`ddg-owner-acc{N}@dosedegrowth.com.br`) com senha randomizada, vinculamos via `account_users` (passo extra obrigatório, o `account_user` no POST de user às vezes não vincula), e usamos o `access_token` retornado pelo POST do user pra todas as 26 chamadas seguintes.

### Rollback automático

Em qualquer falha das chamadas 2-8 → `DELETE /platform/api/v1/accounts/{rollbackAccountId}` → estado limpo, próximo retry funciona.

### 7 Stages criados (cores Padrão Brasília)

```
1. Lead          #f80dad (rosa)         — sla 24h
2. Interesse     #13fbcd (ciano)        — default_stage, allow_new_conversations
3. Qualificado   #06B6D4 (sky)          — sla 24h
4. Delivery      #01f9a6 (verde-claro)  — sla 24h
5. Agendado      #06b0f9 (azul)         — sla 24h
6. Fechado       #0af50e (verde)        — sla 24h
7. Perdido       #ff0000 (vermelho)     — sla 24h
```

### 13 Labels criadas

```
diagnosticoeletronico  google           infracaodetransito
laudodetransferencia   meta             supercautelar
vendedor               vistoriacautelar vistoriacerticar
vistoriacsv            vistoriademoto   vistoriadepintura
vistorialacrada
```

### 3 Automações criadas

1. **Kanban Lead** — `conversation_created` → adiciona ao funil no stage `lead_{slug}`
2. **TAG Google** — `message_created` contains "Google" → label `google`
3. **TAG Meta** — `message_created` contains "Meta" → label `meta`

### 2 Dashboard Apps criados

1. **Dashboard** → iframe `https://dashboardsupervisao.vercel.app/`
2. **Registro Manual** → iframe `https://dashboardsupervisao.vercel.app/dashboard/registro-manual`

---

## 6. Etapas do Onboarding (Kanban interno)

Após provisionamento, o time DDG acompanha as 6 etapas operacionais:

| Ordem | Etapa | Sub-itens | Descrição |
|---|---|---|---|
| 1 | `painel_criado` | — | Account Chatwoot criada (auto após provisionamento) |
| 2 | `grupo_whatsapp` | criado, time_interno, franqueado | Grupo WhatsApp criado com participantes |
| 3 | `acessos_enviados` | — | Cada agente recebe acesso individual (controlado em `agentes.acesso_enviado`) |
| 4 | `conexao_whatsapp` | — | QR code lido, WhatsApp pareado |
| 5 | `treinamento` | — | Treinamento realizado com franqueado |
| 6 | `grupo_suporte_ativo` | — | Grupo virou canal de suporte permanente |

### Status por etapa

`pendente` → `em_andamento` → `concluido` (ou `bloqueado` / `nao_aplicavel`)

### Triggers de auditoria

Toda mudança de status em `etapas_onboarding`:
1. INSERT em `historico_etapas` (audit trail)
2. Recalcula `unidades.status_geral` baseado nos status agregados

---

## 7. Visual / Design System

### Paleta SuperVisão (rotas internas + admin)

```
NAVY        #1B2A4A (principal — sidebar, headers, CTAs)
NAVY_2      #2D4373 (gradient stop)
NAVY_3      #4A6BAB (gradient stop suave)
NAVY_4      #7A95C7 (faint)
RED         #E31E24 (accent, active states)
AMBER       #F59E0B (alertas warn)
EMERALD     #16A34A (sucesso)
SLATE       50/100/200/400/500/700/900 (neutros)
```

### Componentes-chave

- **`<PageHero>`** — hero gradient navy com eyebrow + título + KPIs internos + bottom bar (alertas)
- **`<SectionHeader>`** — ícone em círculo navy/5 + título + subtítulo
- **`<KPICard>`** — label uppercase + ícone colorido + valor `tabular-nums` + hover lift + Framer Motion delay
- **Sidebar** — 240px expanded / 64px collapsed, red accent bar 3px + `layoutId` spring animation, mobile topbar + Sheet lateral
- **Tabelas `.spv-table`** — header gradient navy → navy-2, zebra striping `#F9FAFB`, hover `#F1F5F9`

### LP `/crm` — paleta SOFFIA (isolada)

```
RED       #E30613 (acento)
NAVY      #0F172A (texto principal)
Fonts     Archivo (display) + Inter Tight (body) + JetBrains Mono (labels)
Scope     .soffia-scope (NÃO vaza pras rotas internas)
```

Animações: IntersectionObserver com `useReveal`, word-by-word reveal, gradient text.

---

## 8. Edge Functions

### `crm-sync-form-to-db` (legacy)

- Lê Google Sheets via service account
- Parseia campo "Dados do agente" (formato customizado)
- UPSERT em `unidades` + `agentes`
- Não sobrescreve campos editados manualmente (`status_geral`, `prioridade`, `observacoes`, `responsavel_interno`)
- Cron sugerido: 5min
- **Status atual**: ainda usado pra dados antigos do Google Form, mas novas unidades vêm via `/cadastro`

### `provisionar-chatwoot-unidade` v2 ⭐

- Body: `{ unidade_id: string, force?: boolean }`
- Lê `crm_onboarding.unidades` (precisa `provider_chatwoot` setado)
- Executa 27 chamadas API com rollback automático
- Persiste IDs em `unidades` + UPDATE `onboarding_submissoes.status='provisionado'`
- Idempotente (skipped=true se já provisionou)

### Tokens hardcoded como fallback (também ficam em env)

```typescript
CHATWOOT_PLATFORM_TOKEN = "9213d3cae70a9792ea15f1cf05ba2f338d9b77be665d0f0236d3a9ae849caeb5"
WAHA_ADMIN_TOKEN        = "dc372bd703c2404387bbfc6a7cdf656b"
WAHA_API_URL            = "https://waha.aifocus.dev"
CHATWOOT_BASE_URL       = "https://crmsupervisao.com"
```

---

## 9. Gotchas conhecidos

| Bug / surpresa | Solução |
|---|---|
| Chatwoot `provider_connection` field sempre retorna "close" mesmo com WAHA funcionando | `/caixas-entrada` consulta WAHA direto via `/api/sessions` |
| Platform Token sozinho não cria inbox | Criar User Owner + vincular via `account_users` antes (v2) |
| `account_user` no POST `/platform/api/v1/users` às vezes não vincula efetivamente | POST extra em `/platform/api/v1/accounts/{id}/account_users` (idempotente, ignora "already exists") |
| `git add -A` quebra build | Tem arquivos pre-existentes com erros (matriz/comercial). Sempre `git add` arquivo por arquivo |
| Stage `interesse_-_{slug}` vira `interesse__{slug}` no Chatwoot | Chatwoot sanitiza hífens. Aceitar como está |
| Vercel pode demorar até 1min após push | Deploy automático mas tem fila |
| Tabela `unidades` NÃO tem `email_franqueado` (só `telefone_franqueado`) | Email do franqueado fica em `onboarding_submissoes.email_franqueado` apenas |

---

## 10. Roles e permissões

| Role | Acessa | Modifica |
|---|---|---|
| `super_admin` | tudo | tudo, inclui criar/remover outros usuários |
| `admin` | tudo exceto `/configuracoes/usuarios` | aprovar/rejeitar/provisionar, editar unidades, mover etapas |
| `viewer` | só leitura de Visão Geral e Relatórios | nada |

Validação:
- Frontend esconde botões conforme role
- API valida no server (todas rotas `/api/onboarding/admin/*` exigem `super_admin` ou `admin`)

---

## 11. Padrões de comunicação

### Tom

- Direto, técnico mas acessível
- "Aperto de interpretação" em vez de "erro de prompt" (terminologia usada nos fluxos SPV)
- "Apertamos as interpretações" em vez de "consertamos bug"

### E-mails dos agentes (`@supervisao.com`)

Padrão observado: a maioria segue `<unidade>@supervisao.com` ou `<funcao>.<unidade>@supervisao.com`.

Convenções vistas: `barueri@supervisao.com`, `comercial.fortaleza@supervisao.com`, `adm.maua@supervisao.com`, `itajai.sc.adm@supervisao.com`.

---

## 12. Roadmap (futuro)

- [ ] Templates Meta WhatsApp aprovados (pra Cloud)
- [ ] Dashboard métricas agregadas (taxa conclusão, lead time)
- [ ] Cadastro automático no n8n da Soffia ao provisionar
- [ ] Sync bidirecional agentes Chatwoot ↔ painel
- [ ] Reports automatizados por e-mail (semanal pro time DDG e Matriz)
- [ ] Multi-tenancy: separar contas DDG por cliente (não só SuperVisão)
