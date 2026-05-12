# Provisionamento Chatwoot — Padrão Brasília

> **Documento de referência** pra criar novas unidades no Chatwoot.
> Fonte: Account 6 (SPV - Brasilia) — mapeado em 2026-05-09.
> Versão Chatwoot: 4.12.1.

Substituir `{{UNIDADE}}` pelo nome da unidade e `{{SLUG}}` pelo slug lowercase sem acento (ex: `Brasilia` → `brasilia`).

---

## ⚠️ DECISÃO TÉCNICA OBRIGATÓRIA — feita pelo time interno

Antes de iniciar o provisionamento, **o time precisa decidir o provider WhatsApp**:

| Provider | Quando usar | Trade-offs |
|---|---|---|
| **WhatsApp Cloud (API oficial Meta)** | Unidade tem BM da Meta aprovado, quer status oficial, vai escalar | ✅ Oficial · ✅ Estável · ❌ Setup mais demorado · ❌ Custos Meta |
| **WAHA (não-oficial)** | Setup rápido, sem burocracia Meta, número pessoal/Business existente | ✅ Rápido · ✅ Funciona com qualquer número · ❌ Não-oficial · ⚠ Risco ban |

**Default sugerido**: `WAHA` (mais rápido pra entregar, padrão atual da rede).

**Quando reavaliar pra Cloud**: unidade cresceu, tem BM da Meta, ou time quer maior estabilidade.

⚠️ **O franqueado NÃO escolhe**. Essa decisão é do time da Matriz no momento da aprovação no painel `/onboardings`.

---

## 1. ACCOUNT

```
POST /platform/api/v1/accounts
Header: api_access_token: {{PLATFORM_TOKEN}}
```

```json
{
  "name": "SPV - {{UNIDADE}}",
  "locale": "pt_BR"
}
```

→ Salva `account_id` no banco.

---

## 2. INBOX (Caixa de Entrada WhatsApp)

**Nome padrão**:
- WhatsApp Cloud: `(Soffia) {{UNIDADE}}` (aceita espaços e parênteses)
- WAHA: `Soffia-{{SLUG}}` (só `[a-zA-Z0-9_-]`)

```
POST /api/v1/accounts/{{account_id}}/inboxes
```

### WhatsApp Cloud (oficial Meta)
```json
{
  "name": "(Soffia) {{UNIDADE}}",
  "channel": {
    "type": "whatsapp",
    "phone_number": "{{TELEFONE}}",
    "provider": "whatsapp_cloud",
    "provider_config": {
      "api_key": "{{META_API_KEY}}",
      "waba_id": "{{WABA_ID}}",
      "phone_number_id": "{{PHONE_NUMBER_ID}}",
      "business_account_id": "{{BUSINESS_ACCOUNT_ID}}"
    }
  }
}
```

### WAHA
```json
{
  "name": "Soffia-{{SLUG}}",
  "channel": {
    "type": "whatsapp",
    "phone_number": "{{TELEFONE}}",
    "provider": "waha",
    "provider_config": {
      "api_url": "https://waha.aifocus.dev",
      "admin_token": "dc372bd703c2404387bbfc6a7cdf656b",
      "session_name": "{{SLUG}}",
      "ignore_groups": true
    }
  }
}
```

**Configurações comuns da inbox** (PATCH após criar):

| Campo | Valor padrão |
|---|---|
| `lock_to_single_conversation` | `true` |
| `allow_messages_after_resolved` | `true` |
| `enable_auto_assignment` | `true` |

→ Salva `inbox_id` no banco.

---

## 3. AGENTES (6 inserts)

Executar `POST /api/v1/accounts/{{account_id}}/agents` para cada:

**Globais (sempre os 5):**
```json
{"name": "Renato Carlet", "email": "renato.carlet@supervisao.com", "role": "administrator"}
{"name": "Leo Souza", "email": "leosouza@supervisao.com", "role": "administrator"}
{"name": "Rodrigo", "email": "rodrigo.ribeirinho@supervisao.com", "role": "administrator"}
{"name": "Cris Dmais1", "email": "cris@dmais1.com.br", "role": "administrator"}
{"name": "Dose De Growth", "email": "dosedegrowth@gmail.com", "role": "administrator"}
```

**+ Agente local (do cadastro do franqueado):**
```json
{"name": "{{NOME_RESPONSAVEL}}", "email": "{{EMAIL_RESPONSAVEL}}", "role": "administrator"}
```

**Regra**: Se email já existir no Chatwoot, vincula automaticamente (não duplica).

---

## 4. FUNNEL + 7 STAGES (Kanban)

### 4.1 Criar Funnel

```
POST /api/v1/accounts/{{account_id}}/funnels
```

```json
{"name": "SPV - {{UNIDADE}}"}
```

→ Salva `funnel_id`.

### 4.2 Criar Stages (via PATCH)

```
PATCH /api/v1/accounts/{{account_id}}/funnels/{{funnel_id}}
```

```json
{
  "stages": {
    "lead_{{SLUG}}": {
      "label": "Lead - {{UNIDADE}}",
      "color": "#f80dad",
      "position": 0,
      "sla_hours": 24,
      "description": ""
    },
    "interesse_-_{{SLUG}}": {
      "label": "Interesse - {{UNIDADE}}",
      "color": "#13fbcd",
      "position": 1,
      "description": "",
      "allow_new_conversations": true
    },
    "qualificado_{{SLUG}}": {
      "label": "Qualificado - {{UNIDADE}}",
      "color": "#06B6D4",
      "position": 2,
      "sla_hours": 24,
      "description": ""
    },
    "delivery_{{SLUG}}": {
      "label": "Delivery - {{UNIDADE}}",
      "color": "#01f9a6",
      "position": 3,
      "sla_hours": 24,
      "description": ""
    },
    "agendado_{{SLUG}}": {
      "label": "Agendado - {{UNIDADE}}",
      "color": "#06b0f9",
      "position": 4,
      "sla_hours": 24,
      "description": ""
    },
    "fechado_{{SLUG}}": {
      "label": "Fechado - {{UNIDADE}}",
      "color": "#0af50e",
      "position": 5,
      "sla_hours": 24,
      "description": ""
    },
    "perdido_{{SLUG}}": {
      "label": "Perdido - {{UNIDADE}}",
      "color": "#ff0000",
      "position": 6,
      "sla_hours": 24,
      "description": ""
    }
  },
  "settings": {
    "icon": "📊",
    "default_stage": "interesse_-_{{SLUG}}",
    "allow_manual_move": true,
    "notify_on_stage_change": true,
    "enable_sla": false,
    "auto_move": false,
    "enable_automation": false,
    "conversation_limit": 0
  }
}
```

---

## 5. LABELS (13 etiquetas padrão)

```
POST /api/v1/accounts/{{account_id}}/labels
```

| # | title | color |
|---|---|---|
| 1 | `diagnosticoeletronico` | `#69A871` |
| 2 | `google` | `#FBFF00` |
| 3 | `infraçãodetransito` | `#115490` |
| 4 | `laudodetransferencia` | `#EF2975` |
| 5 | `meta` | `#001EFD` |
| 6 | `supercautelar` | `#6366f1` |
| 7 | `vendedor` | `#A69DE2` |
| 8 | `vistoriacautelar` | `#4ADE33` |
| 9 | `vistoriacerticar` | `#4E53C7` |
| 10 | `vistoriacsv` | `#1AD530` |
| 11 | `vistoriademoto` | `#EEA92A` |
| 12 | `vistoriadepintura` | `#FAD1EE` |
| 13 | `vistorialacrada` | `#0A7850` |

Todos com `show_on_sidebar: true`.

---

## 6. AUTOMAÇÕES (3 regras)

### 6.1 Kanban Lead (entrada automática)

```
POST /api/v1/accounts/{{account_id}}/automation_rules
```

```json
{
  "name": "Kanban Lead",
  "description": "Entrada no Kanban",
  "event_name": "conversation_created",
  "conditions": [
    {
      "values": ["all", "all"],
      "attribute_key": "status",
      "filter_operator": "equal_to",
      "custom_attribute_type": ""
    }
  ],
  "actions": [
    {
      "action_name": "funnel_action",
      "action_params": [
        {
          "funnel_id": "{{funnel_id}}",
          "stage_name": "lead_{{SLUG}}",
          "action_type": "add_to_funnel"
        }
      ]
    }
  ]
}
```

### 6.2 TAG Google

```json
{
  "name": "TAG Google",
  "description": "Tag Google",
  "event_name": "message_created",
  "conditions": [
    {
      "values": ["Google"],
      "attribute_key": "content",
      "filter_operator": "contains",
      "custom_attribute_type": ""
    }
  ],
  "actions": [
    {
      "action_name": "add_label",
      "action_params": ["google"]
    }
  ]
}
```

### 6.3 TAG Meta

```json
{
  "name": "TAG Meta",
  "description": "Tag Meta",
  "event_name": "message_created",
  "conditions": [
    {
      "values": ["Meta"],
      "attribute_key": "content",
      "filter_operator": "contains",
      "custom_attribute_type": ""
    }
  ],
  "actions": [
    {
      "action_name": "add_label",
      "action_params": ["meta"]
    }
  ]
}
```

---

## 7. DASHBOARD APPS (2 aplicativos)

```
POST /api/v1/accounts/{{account_id}}/dashboard_apps
```

### 7.1 Dashboard
```json
{
  "title": "Dashboard",
  "content": [{
    "url": "https://dashboardsupervisao.vercel.app/",
    "type": "frame"
  }]
}
```

### 7.2 Registro Manual
```json
{
  "title": "Registro Manual",
  "content": [{
    "url": "https://dashboardsupervisao.vercel.app/dashboard/registro-manual",
    "type": "frame"
  }]
}
```

---

## 8. SEQUÊNCIA COMPLETA

```
0. [TIME INTERNO] Decidir provider: whatsapp_cloud OU waha

1. POST /platform/.../accounts                          → account_id
2. POST .../inboxes (cloud OU waha)                     → inbox_id
3. POST .../agents × 6 (5 globais + 1 local)
4. POST .../funnels                                     → funnel_id
5. PATCH .../funnels/{{funnel_id}} (stages + settings)
6. POST .../labels × 13
7. POST .../automation_rules × 3
8. POST .../dashboard_apps × 2

TOTAL: 27 chamadas API
```

---

## 9. DADOS DO FORMULÁRIO

| Campo | Origem | Usado em |
|---|---|---|
| `nome_unidade` | quiz franqueado | Account, Funnel, Stages, Labels |
| `slug` | derivado (slugify nome) | Stage keys, default_stage, session WAHA |
| `telefone` | quiz franqueado (numero_inbox[0]) | Inbox |
| `provider` | **decisão do time interno** | Inbox |
| `email_responsavel` | quiz franqueado (1º agente) | Agent |
| `nome_responsavel` | quiz franqueado (1º agente) | Agent |
| `session_name` | derivado (= slug) | Inbox provider_config (só WAHA) |

---

## 10. GOTCHAS / REGRAS

1. **Platform API**: Precisa de `PLATFORM_API_ACCESS_TOKEN` separado do User Token.
   - Token: `9213d3cae70a9792ea15f1cf05ba2f338d9b77be665d0f0236d3a9ae849caeb5`

2. **Nome inbox WAHA**: SÓ `[a-zA-Z0-9_-]` — sem espaços, parênteses ou acentos. Usar slug.

3. **Nome inbox Cloud**: Aceita espaços e parênteses — padrão `(Soffia) {{Unidade}}`.

4. **Stages = JSON dentro do funnel**: NÃO criadas por endpoint separado. Sempre PATCH no funnel.

5. **`default_stage`** no settings deve bater **exatamente** com uma key dos stages criados.

6. **Automação Kanban Lead**: `funnel_id` é dinâmico — pegar do retorno do step 4.

7. **Labels**: Sem espaços no title. Cores hex com `#`. Sem acentos em algumas (exceto onde tradição da rede tem como `infraçãodetransito`).

8. **Agent com email existente**: Vincula o usuário existente automaticamente, não duplica.

9. **WAHA session_name único**: Não pode repetir entre inboxes no mesmo servidor WAHA.

10. **Provider config WAHA**:
    - `api_url`: `https://waha.aifocus.dev`
    - `admin_token`: `dc372bd703c2404387bbfc6a7cdf656b`
    - `session_name`: igual ao slug da unidade
    - `ignore_groups`: `true`

---

## 11. CONFERÊNCIA PÓS-CRIAÇÃO

Validar no Chatwoot após terminar:

- [ ] Account aparece no Super Admin
- [ ] Inbox conectada (status `WORKING` se WAHA, ou aprovação Meta se Cloud)
- [ ] 6 agentes na account (5 globais + 1 local)
- [ ] Funnel com 7 stages na ordem certa
- [ ] 13 labels visíveis na sidebar
- [ ] 3 automation rules ativas
- [ ] 2 dashboard apps acessíveis

---

## 12. ROLLBACK (se algo der errado)

Em caso de erro no meio do provisionamento:

1. `DELETE /platform/api/v1/accounts/{{account_id}}` — deleta tudo de uma vez (account + todos os recursos)
2. Marcar submission no banco como `rejeitado` com motivo do erro
3. Logs do erro ficam no painel `/onboardings` no histórico

---

*Doc gerado em 2026-05-11 · Atualizar conforme novos padrões da rede.*
