# Manual de Uso — Controle CRM SuperVisão

> Guia prático pro time interno SuperVisão usar o painel no dia-a-dia.
> Para questões técnicas (como fazer deploy, schema do banco, etc), ver `REGRAS_E_LOGICA.md`.

🌐 **URL do painel**: https://controleimplementa-aocrm.vercel.app

---

## 📋 Sumário

1. [O que é o painel](#1-o-que-é-o-painel)
2. [Quem usa e quando](#2-quem-usa-e-quando)
3. [Tipos de acesso](#3-tipos-de-acesso)
4. [Fluxo de trabalho](#4-fluxo-de-trabalho-end-to-end)
5. [Como usar cada tela](#5-como-usar-cada-tela)
6. [Regras de negócio importantes](#6-regras-de-negócio-importantes)
7. [Boas práticas](#7-boas-práticas-do-dia-a-dia)
8. [Perguntas frequentes](#8-perguntas-frequentes)
9. [Suporte](#9-suporte)

---

## 1. O que é o painel

É a **central de controle de implantação do CRM (Chatwoot)** para cada nova unidade da rede SuperVisão.

**O que ele resolve:**
- Sai do controle manual em planilha que ninguém olha
- Mostra de relance quantas unidades estão pendentes em cada etapa
- Centraliza os dados do franqueado, agentes do Chatwoot, status de cada implantação
- Cria histórico auditável (quem mudou o quê, quando)

**O que ele NÃO faz:**
- Não cria conta no Chatwoot automaticamente (ainda manual)
- Não cria grupo de WhatsApp automaticamente (ainda manual)
- Não envia mensagens pra franqueados
- Não substitui o Chatwoot — ele só *acompanha* a implantação

---

## 2. Quem usa e quando

### Quem usa

| Pessoa | Função |
|---|---|
| **Time SuperVisão** | Marca etapas concluídas conforme implantação avança |
| **Lucas / Gerência** | Acompanha visão geral, cobra gargalos, aprova nova unidade |
| **Franqueado** | NÃO usa o painel. Ele preenche o Google Form e pronto |

### Quando

- **Toda nova unidade da rede** vai passar por aqui
- **Quando o franqueado preenche o Form**: a unidade aparece automaticamente no painel em até 5 minutos (sync automática)
- **Toda vez que avança uma etapa**: time interno marca como concluído

---

## 3. Tipos de acesso

| Perfil | O que pode fazer |
|---|---|
| **Super Admin** (Lucas) | Tudo: editar unidades, gerenciar usuários, configurações de sistema |
| **Admin** | Editar unidades, etapas, agentes, observações. NÃO pode criar/remover outros usuários |
| **Viewer** | Só lê. Vê tudo mas não edita nada. Ideal pra galera que só quer acompanhar |

### Como criar um novo usuário (só Super Admin pode)

1. Login como Super Admin
2. Menu lateral → **Configurações**
3. Aba **"Gerenciar usuários"** → **"Novo usuário"**
4. Preencher: email, nome, senha temporária, perfil
5. Salvar
6. Avisar a pessoa: email + senha temporária (ela troca depois)

> ⚠️ Sempre prefira criar como **Viewer** primeiro. Promova para Admin depois se realmente precisar.

---

## 4. Fluxo de trabalho end-to-end

```
1. Franqueado preenche Google Form
   ↓ (até 5 min)
2. Unidade aparece no painel com status "Pendente"
   ↓
3. Time interno define responsável + prioridade
   ↓
4. Time vai marcando as 6 etapas conforme conclui:
   ┌────────────────────────────────────────┐
   │ ✅ 1. Painel criado no Chatwoot         │
   │ ✅ 2. Grupo WhatsApp                    │
   │     ☐ Grupo criado                     │
   │     ☐ Time interno adicionado          │
   │     ☐ Franqueado adicionado            │
   │ ✅ 3. Acessos enviados                  │
   │ ☐ 4. Conexão WhatsApp                  │
   │ ☐ 5. Treinamento                        │
   │ ☐ 6. Grupo virou suporte ativo         │
   └────────────────────────────────────────┘
   ↓
5. Quando todas concluídas → status muda automaticamente para "Concluído"
6. Grupo WhatsApp continua ativo como canal de suporte permanente
```

**Tempo médio esperado por unidade**: depende, o painel vai te dizer (em Relatórios).

---

## 5. Como usar cada tela

### 🏠 Visão Geral (`/`)

**Pra que serve**: panorama executivo. É a primeira tela ao logar.

**O que tem**:
- **4 KPIs no topo**: total de unidades, em andamento, concluídas, bloqueadas
- **Funil de Onboarding**: 6 cards, um por etapa, mostrando quantas estão concluídas
- **Últimas unidades cadastradas**: tabela com as 8 mais recentes

**Quando usar**:
- Reunião com gerência: tela perfeita pra projetar
- Bate-papo rápido sobre status geral
- Identificar bottlenecks (qual etapa tem mais bloqueio)

**Botão "Sincronizar agora"**: força sincronização imediata com o Form (normalmente roda automático a cada 5min). Use se uma unidade nova entrou e você quer ver agora.

---

### 🏢 Unidades (`/unidades`)

**Pra que serve**: lista completa com filtros. É onde você vai ficar a maior parte do tempo.

**Filtros disponíveis**:
- **Busca por nome** — útil quando alguém pergunta "Como está a Curitiba?"
- **Status**: Pendente / Em andamento / Concluído / Bloqueado
- **Prioridade**: Urgente / Alta / Normal / Baixa
- **Aguardando etapa**: filtra unidades travadas em uma etapa específica (ex: "todas que ainda não tiveram treinamento")

**Colunas**:
- Unidade
- Franqueado
- Telefone
- Progresso (barra + X/6)
- Agentes (X/Y agentes com acesso enviado)
- Status / Prioridade / Responsável
- Última atualização

**Truque**: clica em qualquer unidade pra entrar no detalhe.

---

### 🔍 Detalhe da Unidade (`/unidades/[id]`)

**Pra que serve**: gerenciar UMA unidade. É a tela mais importante operacionalmente.

**Header (topo)**: nome, status, prioridade, % concluído, observações.
- Botão **"Editar"** abre formulário pra mudar:
  - Nome do franqueado (caso tenha vindo vazio do Form)
  - Telefone do franqueado
  - **Prioridade** (decisão sua: urgente/alta/normal/baixa)
  - **Responsável interno** (quem do time tá tocando)
  - **Observações** (notas livres — aparecem destacadas)

**4 abas embaixo**:

#### Aba "Checklist"
As 6 etapas. Pra cada uma:
- **Ícone do status** muda de cor (cinza=pendente, azul=em andamento, verde=concluído, vermelho=bloqueado)
- Botão **lápis** abre edição: muda status + adiciona observação
- **Etapa "Grupo WhatsApp"** tem 3 sub-checkboxes — quando todos forem marcados, a etapa principal vira "Concluído" automaticamente

#### Aba "Agentes"
Lista de agentes parseados automaticamente do campo "Dados do agente" do Form.
- 2 checkboxes por agente: **"Criado no CRM"** e **"Acesso enviado"**
- Botão **lixeira** remove o agente
- Botão **"Adicionar agente"**: cria manualmente um agente que não veio do Form

> ⚠️ **Importante**: o parser tenta detectar nome/email/perfil automaticamente. Se vier errado, você corrige clicando no agente OU adicionando um novo manualmente.

#### Aba "Histórico"
Timeline de todas as mudanças de status. Útil pra:
- Auditoria ("quem marcou treinamento como concluído?")
- Ver quanto tempo demorou entre cadastro e conclusão

#### Aba "Dados originais"
Mostra exatamente o que veio do Form, sem parsing. Útil quando o parser falha e você quer ver a fonte.

---

### 📊 Relatórios (`/relatorios`)

**Pra que serve**: análise gerencial. Use 1x por semana ou pra reuniões.

**O que tem**:
- **4 KPIs**: total de unidades, taxa de conclusão, tempo médio total, maior gargalo
- **Tempo médio por etapa**: quanto tempo cada etapa leva em média (do cadastro até conclusão). Te mostra onde o processo trava
- **Etapas com mais unidades travadas**: ranking visual dos bottlenecks
- **Performance por responsável**: quantas unidades cada pessoa tá tocando + taxa de conclusão

**Insights típicos que você vai tirar**:
- "A etapa de Treinamento é nosso gargalo — 8 unidades travadas"
- "Demora em média 3 dias do cadastro até criar o painel — pode melhorar"
- "Fulano fechou 80% das que pegou, ciclano só 30% — investigar"

---

### ⚙️ Configurações (`/configuracoes`)

**Pra que serve**: gestão da plataforma.

**Seções**:

#### "Sua conta"
Mostra seu email, nome e perfil.

#### "Sincronização Sheets → Banco"
- **Botão "Sincronizar agora"**: força sync manual
- **Histórico das últimas 10 execuções**: vê se está rodando OK
- **Status de cada sync**: ✅ concluído, ⚠️ com erros, ❌ erro fatal
- Se aparecer erro consistente, chamar o Lucas

#### "Gerenciar usuários" (só Super Admin vê)
- Lista todos os usuários do painel
- Mudar perfil (admin ↔ viewer ↔ super_admin)
- Ativar/desativar usuário
- Deletar usuário (não dá pra deletar Super Admin)
- **"Novo usuário"**: criar conta nova com email + senha temporária

---

## 6. Regras de negócio importantes

### 6.1 As 6 etapas do checklist

| # | Etapa | O que significa |
|---|---|---|
| 1 | **Painel criado** | Conta criada no Chatwoot, com inbox configurado |
| 2 | **Grupo WhatsApp** | Grupo do WhatsApp criado com SuperVisão + franqueado |
| 3 | **Acessos enviados** | Cada agente recebeu credenciais de login do Chatwoot |
| 4 | **Conexão WhatsApp** | Número conectado ao Chatwoot via Evolution/WaBA |
| 5 | **Treinamento** | Franqueado e equipe foram treinados |
| 6 | **Suporte ativo** | Grupo permanece ativo como canal de atendimento permanente |

### 6.2 Sub-etapas do Grupo WhatsApp

| # | Sub-item | O que significa |
|---|---|---|
| 1 | Grupo criado | O grupo foi efetivamente criado |
| 2 | Time interno SuperVisão adicionado | Pessoas do escritório central no grupo |
| 3 | Franqueado adicionado | Franqueado entrou (e tem permissão de adicionar a equipe dele depois) |

### 6.3 Status automáticos

O sistema calcula `status_geral` da unidade automaticamente baseado nas etapas:

| Situação | Status resultante |
|---|---|
| Qualquer etapa marcada como Bloqueado | 🔴 **Bloqueado** |
| Todas as 6 etapas Concluídas | 🟢 **Concluído** |
| Pelo menos uma em Andamento ou Concluída | 🟡 **Em andamento** |
| Nenhuma iniciada | ⚪ **Pendente** |

⚠️ **Você não muda o status_geral diretamente** — ele é derivado das etapas. Se quer "concluir uma unidade", marque todas as etapas.

### 6.4 Prioridade

Você define manualmente baseada no caso:
- **Urgente**: franqueado de peso ou unidade que abriu já operando
- **Alta**: prazo apertado
- **Normal**: padrão
- **Baixa**: pode esperar

Filtra por prioridade na tela de Unidades pra atacar o que importa primeiro.

### 6.5 O que o sync NÃO sobrescreve

A sincronização Sheets → Banco roda a cada 5min. Ela atualiza:
- Dados originais do Form (nome unidade, franqueado, telefone, números, dados agentes)

**Ela NÃO mexe em**:
- Status das etapas (vira pendente uma vez, pode ser editado livremente)
- Prioridade
- Responsável interno
- Observações
- Status dos agentes (criado/acesso enviado)

Ou seja: **edits manuais sobrevivem ao sync**. Pode editar à vontade.

### 6.6 Linhas de teste são ignoradas

Linhas com `nome_unidade = "teste"` (case-insensitive) **não entram** no painel. Use isso pra testar o Form sem poluir o banco.

---

## 7. Boas práticas do dia-a-dia

### ✅ Faça

- **Defina responsável imediatamente** quando uma unidade nova entra. Senão fica órfã.
- **Use observações** generosamente. Tipo: "Franqueado pediu pra agendar treinamento dia 15", "Esperando ID Chatwoot do TI"
- **Marque etapas em ordem** — só comece etapa N+1 depois de N concluída
- **Bloqueio (etapa = bloqueado)** quando estiver esperando algo externo (franqueado responder, WhatsApp aprovar, etc). Coloque no campo "observação" o motivo
- **Revise Relatórios semanalmente** pra identificar gargalos antes que virem problema
- **Treine novos admins** mostrando essa documentação

### ❌ Evite

- Marcar etapa como concluída antes de realmente estar (vai bagunçar o relatório de tempo médio)
- Editar dados originais do Form no painel (eles são source-of-truth do que o franqueado preencheu)
- Apagar agentes só porque parsearam errado — corrija o nome/email em vez disso
- Deixar uma unidade muito tempo em "Pendente" sem responsável (sinal de processo quebrado)

---

## 8. Perguntas frequentes

### "Cadastrei uma unidade no Form mas ela não apareceu"
- Espera 5 minutos (sync automático)
- Se passou 5min e não apareceu, vai em **Configurações → Sincronizar agora**
- Se ainda assim não veio, verifica se a planilha foi de fato atualizada (talvez Form tenha falhado)

### "O parser pegou o nome do agente errado"
- Edita manualmente na aba "Agentes" da unidade
- Se for um padrão recorrente (formato novo do Form), avisa o Lucas — pode ser ajustado no parser

### "Quero deletar uma unidade"
- Hoje não tem botão de delete na UI (proteção contra erro). Se REALMENTE precisar, fala com Lucas
- Alternativa: marca a unidade como "Não aplicável" em todas as etapas, ou deixa com observação "DESCONSIDERAR"

### "Posso compartilhar a URL com franqueado?"
- **NÃO** — o painel é interno do time SuperVisão
- Franqueado só interage via Form de cadastro e WhatsApp depois

### "Quem pode resetar minha senha?"
- Você mesmo (se aparecer "Esqueci a senha" na tela de login)
- Ou Super Admin via Supabase Dashboard

### "Como troco minha senha?"
- Hoje precisa pedir pro Super Admin via Supabase Dashboard. *Funcionalidade self-service será adicionada em breve.*

### "Adicionei um agente novo manualmente, ele aparece no Chatwoot automaticamente?"
- **NÃO**. O painel só **registra** o agente. Você ainda precisa criar a conta no Chatwoot manualmente
- O painel serve pra **acompanhar** se foi criado, não pra criar

### "Por que vejo X unidades mas o time fala Y?"
- Pode ter unidade duplicada no Form (mesma submetida 2x)
- Filtra por nome na tela Unidades pra confirmar
- Se for duplicata, marca uma como "bloqueada" com observação "duplicata da {outra}"

### "Mudou o cabeçalho da planilha do Form, quebrou tudo"
- O parser usa busca por substring (ex: procura "carimbo", "nome da unidade", etc)
- Mudanças de capitalização ou pequenas variações são OK
- Se mudar nome de coluna inteiro, avisa o Lucas pra ajustar

---

## 9. Suporte

**Bugs / Problemas técnicos**:
- Lucas Cassiano (`dosedegrowth@gmail.com`)

**Dúvidas de uso / processo**:
- Time interno SuperVisão

**Funcionalidade nova**:
- Mande sugestão pro Lucas. Roadmap aberto:
  - [ ] Self-service password reset
  - [ ] Notificações Slack quando etapa fica bloqueada >7d
  - [ ] Export CSV/PDF de relatório executivo
  - [ ] Botão "deletar unidade" com proteção dupla

---

## 📌 Atalhos úteis

| Ação | Caminho |
|---|---|
| Ver tudo aguardando treinamento | `/unidades?etapa=treinamento&status=pendente` |
| Ver bloqueadas | `/unidades?status=bloqueado` |
| Ver urgentes | `/unidades?prioridade=urgente` |
| Ver minhas (Lucas) | `/unidades` → busca filtra por responsável "Lucas" |

---

**Última atualização**: 2026-04-27
**Versão do painel**: v1.0 (initial release)
