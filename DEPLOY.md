# Deploy — Controle CRM SuperVisão

Guia pra colocar o painel no ar. Estimativa: 10 minutos.

---

## ✅ Já está pronto (não precisa fazer)

- [x] Schema Supabase `crm_onboarding` criado e validado
- [x] Edge Function `crm-sync-form-to-db` **deployada** no Supabase (`hkjukobqpjezhpxzplpj`)
- [x] Super admin `dosedegrowth@gmail.com` cadastrado na tabela `usuarios`
- [x] Código no GitHub: https://github.com/dosedegrowth-design/controleimplementa-aocrm
- [x] Build local validado (10 rotas)

---

## 🔧 Você precisa fazer (5 passos)

### 1. Compartilhar a planilha do Form com a Service Account

1. Abra a planilha: https://docs.google.com/spreadsheets/d/1nrcFrSgx2gBhNaUNlRJG1AWVcyWlxhPqjF7Uik8Y6Jw/edit
2. Botão **"Compartilhar"** (canto superior direito)
3. Adicione: `painel-hl-sheets@dose-de-growth.iam.gserviceaccount.com`
4. Permissão: **Leitor**
5. Desmarcar "notificar pessoas"
6. Compartilhar

---

### 2. Configurar secrets da Edge Function no Supabase

Acesse: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/settings/functions

Adicione 3 secrets (os outros 2 — `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — já estão automaticamente disponíveis):

| Nome | Valor |
|---|---|
| `GOOGLE_SHEETS_ID` | `1nrcFrSgx2gBhNaUNlRJG1AWVcyWlxhPqjF7Uik8Y6Jw` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `painel-hl-sheets@dose-de-growth.iam.gserviceaccount.com` |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | *Copiar do projeto painel-comercial-hl-models — Vercel Dashboard > Settings > Environment Variables* |

> 💡 **Como pegar a private key**: Abra https://vercel.com/dose-de-growths-projects/painel-comercial-hl-models/settings/environment-variables → procure `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` → clique no olho pra revelar → copia o valor inteiro (incluindo `-----BEGIN PRIVATE KEY-----` ... `-----END PRIVATE KEY-----`).

---

### 3. Testar a Edge Function

Após salvar os secrets, teste:

```bash
curl -X POST https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/crm-sync-form-to-db
```

Esperado: JSON com `unidades_inseridas` > 0 (vai puxar todas as ~20 linhas existentes da planilha).

Se der erro, ver logs em: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/functions/crm-sync-form-to-db/logs

---

### 4. Configurar cron 5min na Edge Function (opcional mas recomendado)

No SQL Editor do Supabase: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/sql/new

Rodar:

```sql
-- Habilitar pg_cron + pg_net (se não estiver habilitado)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar sync a cada 5 minutos
SELECT cron.schedule(
  'crm-sync-form-to-db-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/crm-sync-form-to-db',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
  ) AS request_id;
  $$
);

-- Validar que foi agendado
SELECT * FROM cron.job;
```

Alternativa mais simples (sem pg_cron): use https://cron-job.org com URL `https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/crm-sync-form-to-db` a cada 5min.

---

### 5. Definir senha do super admin

Acesse: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/auth/users

1. Clique em **"Add user"** > **"Create new user"**
2. Email: `dosedegrowth@gmail.com`
3. Password: a que você quiser (mínimo 6 caracteres)
4. **Marcar "Auto Confirm User"**
5. Salvar

> ⚠️ **Importante**: O email `dosedegrowth@gmail.com` já existe na tabela `crm_onboarding.usuarios` como `super_admin`. Você só precisa criar a entrada correspondente no Supabase Auth.

---

### 6. Deploy no Vercel

1. Acesse https://vercel.com/new
2. Import Git Repository: `dosedegrowth-design/controleimplementa-aocrm`
3. **Framework Preset**: Next.js (auto-detectado)
4. **Project Name**: `controle-crm-supervisao` (ou nome de sua escolha)
5. **Environment Variables** (clica em "Environment Variables" e cola):

```
NEXT_PUBLIC_SUPABASE_URL=https://hkjukobqpjezhpxzplpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhranVrb2JxcGplemhweHpwbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NTQ1MzgsImV4cCI6MjA2MjEzMDUzOH0.WK1_e0m2AkAq8yGFv3d_tKqDIzi72yoQ_lwoyDx8kcQ
SUPABASE_SERVICE_ROLE_KEY=<copiar do dashboard Supabase: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/settings/api-keys>
SUPABASE_FUNCTION_URL=https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/crm-sync-form-to-db
```

6. **Deploy** ✅

URL final: `https://controle-crm-supervisao.vercel.app` (ou similar). Vai estar funcionando em ~30s.

---

## ✅ Validação final

Após os 6 passos:

1. Acessar a URL do Vercel
2. Login com `dosedegrowth@gmail.com` + senha que você criou
3. Visão Geral deve carregar (vazia até primeiro sync)
4. Clicar **"Sincronizar agora"** no canto superior
5. Aguardar 10s → atualizar página → ~20 unidades aparecendo
6. Clicar em qualquer unidade → checklist de 6 etapas + agentes parseados deve estar lá

🎉 Painel no ar!

---

## 🐛 Troubleshooting

### "Falha ao obter access_token Google"
- Service account não tem acesso à planilha. Verificar passo 1.

### "Cabeçalho não reconhecido"
- A planilha mudou de cabeçalho. Editar `supabase/functions/crm-sync-form-to-db/index.ts`, função `findCol`.

### Login não funciona
- Verificar que o usuário foi criado em **Authentication > Users** (passo 5), não só na tabela `crm_onboarding.usuarios`.

### Página em branco / 500
- Verificar env vars do Vercel (passo 6). Especialmente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Ver logs em https://vercel.com/dose-de-growths-projects/<projeto>/logs
