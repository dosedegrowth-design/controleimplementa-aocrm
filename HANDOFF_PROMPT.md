# 🚀 HANDOFF — Continuar projeto CRM SuperVisão em outra máquina/Claude

> **Como usar:** clone o repo na nova máquina, abra um chat novo no Claude Code (ou Cursor/qualquer harness), e cole o conteúdo da seção "PROMPT PRONTO" abaixo como **primeira mensagem**.
>
> O Claude vai ler todo o contexto necessário e estar pronto pra continuar exatamente de onde paramos.

---

## ✅ Pré-requisitos na nova máquina

Antes de colar o prompt, garanta que tem:

### 1. Clone do repo

```bash
cd ~/Antigravity  # ou onde preferir
git clone https://github.com/dosedegrowth-design/controleimplementa-aocrm.git
cd controleimplementa-aocrm
npm install
```

### 2. `.env.local` configurado (mesmas envs do Vercel)

Crie `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hkjukobqpjezhpxzplpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<pegar-no-vercel-ou-supabase-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<pegar-no-vercel>

CHATWOOT_BASE_URL=https://crmsupervisao.com
CHATWOOT_TOKEN=<pegar-no-vercel>
CHATWOOT_PLATFORM_TOKEN=9213d3cae70a9792ea15f1cf05ba2f338d9b77be665d0f0236d3a9ae849caeb5

WAHA_API_URL=https://waha.aifocus.dev
WAHA_ADMIN_TOKEN=dc372bd703c2404387bbfc6a7cdf656b

# Opcionais (se for trabalhar com sync legacy do Google Sheets)
GOOGLE_SERVICE_ACCOUNT_JSON=<base64>
SHEETS_ID=1nrcFrSgx2gBhNaUNlRJG1AWVcyWlxhPqjF7Uik8Y6Jw
```

### 3. MCPs conectados no Claude Code (mesmos da máquina original)

Os principais que esse projeto usa:

- **Supabase MCP** — pra `execute_sql`, `deploy_edge_function`, etc (projeto `hkjukobqpjezhpxzplpj`)
- **Vercel MCP** — pra `list_deployments`, `get_deployment` (team `dose-de-growths-projects`)
- **GitHub** — através do git CLI configurado no terminal

Se o Claude Code da nova máquina não tem esses MCPs, o agente vai precisar usar `curl` direto contra as APIs (todas as credenciais estão no `.env.local`).

### 4. Login no GitHub configurado

```bash
gh auth login  # se usar gh
# OU
git config --global user.name "Seu Nome"
git config --global user.email "dosedegrowth@gmail.com"
```

### 5. Skills do Claude Code instaladas

As skills relevantes (todas já instaladas no `~/.claude/skills/`):
- `chatwoot-api`
- `spv-core`, `spv-matriz`, `spv-unidades`
- `dash-supervisao`
- `supabase-postgres-best-practices`
- `n8n-workflow-patterns`
- `nextjs-best-practices`, `nextjs-supabase-auth`
- `react-best-practices`, `tailwind-patterns`

Se faltar alguma, JSON source: `https://www.aitmpl.com/components.json`

---

## 📋 PROMPT PRONTO (cole no primeiro turno do chat novo)

```
Estou continuando o projeto CRM SuperVisão (controleimplementa-aocrm) em uma nova máquina.

Antes de qualquer coisa, lê estes documentos em ordem pra carregar contexto completo:

1. /Users/<seu-usuario>/Antigravity/controleimplementa-aocrm/CLAUDE.md
   ↑ estado atual completo do projeto (URLs, stack, estado em produção, stats)

2. /Users/<seu-usuario>/Antigravity/controleimplementa-aocrm/REGRAS_E_LOGICA.md
   ↑ regras de negócio detalhadas, ciclo de vida do onboarding, provisionamento

3. /Users/<seu-usuario>/Antigravity/controleimplementa-aocrm/docs/PROVISIONAMENTO_CHATWOOT.md
   ↑ referência completa "Padrão Brasília" (27 chamadas API)

4. /Users/<seu-usuario>/Antigravity/controleimplementa-aocrm/MANUAL_DE_USO.md
   ↑ manual operacional pro time

Skills relevantes (auto-trigger se mencionar termos):
- chatwoot-api → trabalhar com Chatwoot
- spv-core, spv-matriz → padrões SuperVisão
- dash-supervisao → o sistema irmão (visualmente referência)
- supabase-postgres-best-practices → queries no schema crm_onboarding

CONTEXTO RÁPIDO:
- Projeto deployado em https://controleimplementa-aocrm.vercel.app
- Branch main = produção (Vercel auto-deploy em ~40s)
- Supabase: project hkjukobqpjezhpxzplpj, schema crm_onboarding
- Chatwoot prod: https://crmsupervisao.com (Platform API criando accounts)
- Edge Function principal: provisionar-chatwoot-unidade v2 (27 calls + rollback)
- 25 unidades + 50 agentes cadastrados, 0 provisionadas via Edge Function ainda

ÚLTIMO CONTEXTO DA SESSÃO ANTERIOR:
- Reestruturação visual completa alinhada com dash-supervisao deployada
- Botão "Provisionar agora" funcional em /onboardings
- Forms público /cadastro testado end-to-end e funcional
- LP /crm em produção pra apresentar pros franqueados
- Treinamento agendado pra sexta 15/05 às 15h via Google Meet
- E-mail/WhatsApp enviado pros 41 e-mails do sistema (2 problemáticos excluídos:
  administração.aprove@gmail.com e analiafranco@supervisa.com)

PRÓXIMA AÇÃO PROVÁVEL:
[colar aqui o que você quer fazer agora — ex: "Provisionar a unidade X no Chatwoot",
"Adicionar campo Y no quiz", "Investigar um bug Z"]

Quando entender o contexto, me confirma com um resumo de 3-5 linhas do estado atual
e me pergunta o que vou querer fazer.
```

---

## 🎯 Como adaptar pra outra máquina

1. Troque `<seu-usuario>` pelo seu username (ex: `lucascassiano`)
2. Se a pasta do projeto está em outro path, ajuste os 4 paths
3. Cole a "PRÓXIMA AÇÃO PROVÁVEL" com o que você quer fazer hoje
4. (Opcional) adicione "Estamos em [contexto específico]" no final pra ancorar

---

## 🔑 Credenciais críticas (manter em local seguro fora do Git)

| Credencial | Onde está | Como recuperar |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel envs + Supabase Dashboard | Dashboard Supabase → Project Settings → API |
| `CHATWOOT_PLATFORM_TOKEN` | Hardcoded em `provisionar-chatwoot-unidade/index.ts` + envs Vercel | Painel Chatwoot superadmin |
| `WAHA_ADMIN_TOKEN` | Hardcoded em `provisionar-chatwoot-unidade/index.ts` + envs Vercel | Painel WAHA |
| Supabase Auth password admin | Definido manualmente | Supabase Dashboard → Authentication → Users |
| Vercel deploy token | (não usamos via MCP) | Vercel → Settings → Tokens |

---

## 🆘 Se algo der errado na nova máquina

### "npm run build falha"
```bash
# Limpa cache e reinstala
rm -rf .next node_modules
npm install
npm run build
```

### "Não consigo conectar no Supabase"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão certos
- Tente `npx supabase --version` pra ver se tem CLI
- No painel Supabase, garanta que IP da máquina não está bloqueado

### "Edge Function não responde"
- Edge Functions estão deployadas no Supabase (não rodam local sem `supabase functions serve`)
- Pra invocar: `curl -X POST https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/provisionar-chatwoot-unidade -H "Authorization: Bearer <service-key>" -H "Content-Type: application/json" -d '{"unidade_id":"..."}'`

### "Vercel não deploy depois do push"
- Verifique se push foi pra `main`: `git log origin/main..HEAD`
- Veja deployments: https://vercel.com/dose-de-growths-projects/controleimplementa-aocrm/deployments
- Se ficou em "BUILDING" mais de 5min, cancela e tenta de novo

---

## 📞 Quem chamar se travar

- Repo issues: https://github.com/dosedegrowth-design/controleimplementa-aocrm/issues
- Lucas Cassiano (dono): dosedegrowth@gmail.com

---

**Boa sorte na nova máquina! 🚀**
