-- =====================================================
-- CRM Onboarding Painel — Schema Inicial
-- Painel de controle de implantação Chatwoot por unidade
-- Aplicado em produção em 2026-04-27
-- =====================================================

CREATE SCHEMA IF NOT EXISTS crm_onboarding;

-- ENUMS
CREATE TYPE crm_onboarding.status_geral_enum AS ENUM (
  'pendente', 'em_andamento', 'concluido', 'bloqueado'
);

CREATE TYPE crm_onboarding.prioridade_enum AS ENUM (
  'baixa', 'normal', 'alta', 'urgente'
);

CREATE TYPE crm_onboarding.etapa_enum AS ENUM (
  'painel_criado',
  'grupo_whatsapp',
  'acessos_enviados',
  'conexao_whatsapp',
  'treinamento',
  'grupo_suporte_ativo'
);

CREATE TYPE crm_onboarding.status_etapa_enum AS ENUM (
  'pendente', 'em_andamento', 'concluido', 'bloqueado', 'nao_aplicavel'
);

CREATE TYPE crm_onboarding.perfil_agente_enum AS ENUM (
  'administrador', 'agente', 'digitador', 'proprietario', 'outro'
);

CREATE TYPE crm_onboarding.role_enum AS ENUM (
  'super_admin', 'admin', 'viewer'
);

-- TABELA usuarios (auth)
CREATE TABLE crm_onboarding.usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  nome text,
  role crm_onboarding.role_enum NOT NULL DEFAULT 'viewer',
  ativo boolean NOT NULL DEFAULT true,
  ultimo_login timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  criado_por text
);

CREATE INDEX idx_usuarios_email ON crm_onboarding.usuarios(email);
CREATE INDEX idx_usuarios_ativo ON crm_onboarding.usuarios(ativo) WHERE ativo = true;

-- Seed: super admin
INSERT INTO crm_onboarding.usuarios (email, nome, role, criado_por)
VALUES ('dosedegrowth@gmail.com', 'Lucas Cassiano', 'super_admin', 'sistema');

-- TABELA unidades
CREATE TABLE crm_onboarding.unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at timestamptz NOT NULL,
  nome_unidade text NOT NULL,
  nome_franqueado text,
  telefone_franqueado text,
  numeros_crm text[] DEFAULT '{}',
  dados_agentes_raw text,
  status_geral crm_onboarding.status_geral_enum NOT NULL DEFAULT 'pendente',
  prioridade crm_onboarding.prioridade_enum NOT NULL DEFAULT 'normal',
  responsavel_interno text,
  observacoes text,
  sheet_row_hash text NOT NULL UNIQUE,
  sheet_row_index integer,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_unidades_status ON crm_onboarding.unidades(status_geral);
CREATE INDEX idx_unidades_prioridade ON crm_onboarding.unidades(prioridade);
CREATE INDEX idx_unidades_responsavel ON crm_onboarding.unidades(responsavel_interno);
CREATE INDEX idx_unidades_submitted ON crm_onboarding.unidades(submitted_at DESC);
CREATE INDEX idx_unidades_nome ON crm_onboarding.unidades(nome_unidade);

-- TABELA agentes
CREATE TABLE crm_onboarding.agentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid NOT NULL REFERENCES crm_onboarding.unidades(id) ON DELETE CASCADE,
  nome text,
  email text,
  perfil crm_onboarding.perfil_agente_enum DEFAULT 'outro',
  perfil_raw text,
  criado_no_crm boolean NOT NULL DEFAULT false,
  acesso_enviado boolean NOT NULL DEFAULT false,
  data_envio_acesso timestamptz,
  observacao text,
  origem text NOT NULL DEFAULT 'form' CHECK (origem IN ('form', 'manual')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agentes_unidade ON crm_onboarding.agentes(unidade_id);
CREATE INDEX idx_agentes_email ON crm_onboarding.agentes(email) WHERE email IS NOT NULL;

-- TABELA etapas_onboarding
CREATE TABLE crm_onboarding.etapas_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid NOT NULL REFERENCES crm_onboarding.unidades(id) ON DELETE CASCADE,
  etapa crm_onboarding.etapa_enum NOT NULL,
  ordem smallint NOT NULL,
  status crm_onboarding.status_etapa_enum NOT NULL DEFAULT 'pendente',
  iniciado_em timestamptz,
  concluido_em timestamptz,
  concluido_por text,
  observacao text,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE(unidade_id, etapa)
);

CREATE INDEX idx_etapas_unidade ON crm_onboarding.etapas_onboarding(unidade_id);
CREATE INDEX idx_etapas_etapa_status ON crm_onboarding.etapas_onboarding(etapa, status);

-- TABELA sub_etapas
CREATE TABLE crm_onboarding.sub_etapas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_id uuid NOT NULL REFERENCES crm_onboarding.etapas_onboarding(id) ON DELETE CASCADE,
  chave text NOT NULL,
  rotulo text NOT NULL,
  ordem smallint NOT NULL,
  concluido boolean NOT NULL DEFAULT false,
  concluido_em timestamptz,
  concluido_por text,
  UNIQUE(etapa_id, chave)
);

CREATE INDEX idx_sub_etapas_etapa ON crm_onboarding.sub_etapas(etapa_id);

-- TABELA historico_etapas
CREATE TABLE crm_onboarding.historico_etapas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid NOT NULL REFERENCES crm_onboarding.unidades(id) ON DELETE CASCADE,
  etapa_id uuid REFERENCES crm_onboarding.etapas_onboarding(id) ON DELETE SET NULL,
  acao text NOT NULL,
  status_anterior text,
  status_novo text,
  mudado_por text,
  nota text,
  mudado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_historico_unidade ON crm_onboarding.historico_etapas(unidade_id, mudado_em DESC);

-- TABELA sync_log
CREATE TABLE crm_onboarding.sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  concluido_em timestamptz,
  status text NOT NULL DEFAULT 'em_andamento',
  linhas_lidas integer DEFAULT 0,
  unidades_inseridas integer DEFAULT 0,
  unidades_atualizadas integer DEFAULT 0,
  agentes_inseridos integer DEFAULT 0,
  erros text[],
  detalhes jsonb
);

CREATE INDEX idx_sync_log_iniciado ON crm_onboarding.sync_log(iniciado_em DESC);

-- TRIGGER atualizado_em
CREATE OR REPLACE FUNCTION crm_onboarding.trigger_set_atualizado_em()
RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_atualizado_em_unidades
  BEFORE UPDATE ON crm_onboarding.unidades
  FOR EACH ROW EXECUTE FUNCTION crm_onboarding.trigger_set_atualizado_em();

CREATE TRIGGER set_atualizado_em_agentes
  BEFORE UPDATE ON crm_onboarding.agentes
  FOR EACH ROW EXECUTE FUNCTION crm_onboarding.trigger_set_atualizado_em();

CREATE TRIGGER set_atualizado_em_etapas
  BEFORE UPDATE ON crm_onboarding.etapas_onboarding
  FOR EACH ROW EXECUTE FUNCTION crm_onboarding.trigger_set_atualizado_em();

-- TRIGGER criar etapas default + sub-etapas Grupo WhatsApp
CREATE OR REPLACE FUNCTION crm_onboarding.criar_etapas_default()
RETURNS trigger AS $$
DECLARE
  v_etapa_grupo_id uuid;
BEGIN
  INSERT INTO crm_onboarding.etapas_onboarding (unidade_id, etapa, ordem)
  VALUES
    (NEW.id, 'painel_criado', 1),
    (NEW.id, 'grupo_whatsapp', 2),
    (NEW.id, 'acessos_enviados', 3),
    (NEW.id, 'conexao_whatsapp', 4),
    (NEW.id, 'treinamento', 5),
    (NEW.id, 'grupo_suporte_ativo', 6);

  SELECT id INTO v_etapa_grupo_id
  FROM crm_onboarding.etapas_onboarding
  WHERE unidade_id = NEW.id AND etapa = 'grupo_whatsapp';

  INSERT INTO crm_onboarding.sub_etapas (etapa_id, chave, rotulo, ordem)
  VALUES
    (v_etapa_grupo_id, 'grupo_criado', 'Grupo criado no WhatsApp', 1),
    (v_etapa_grupo_id, 'time_interno_adicionado', 'Time interno SuperVisão adicionado', 2),
    (v_etapa_grupo_id, 'franqueado_adicionado', 'Franqueado adicionado (com permissão de incluir time dele)', 3);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER criar_etapas_apos_inserir_unidade
  AFTER INSERT ON crm_onboarding.unidades
  FOR EACH ROW EXECUTE FUNCTION crm_onboarding.criar_etapas_default();

-- TRIGGER histórico de mudança de status
CREATE OR REPLACE FUNCTION crm_onboarding.registrar_historico_etapa()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO crm_onboarding.historico_etapas (
      unidade_id, etapa_id, acao, status_anterior, status_novo, mudado_por
    )
    VALUES (
      NEW.unidade_id, NEW.id, 'mudanca_status',
      OLD.status::text, NEW.status::text, NEW.concluido_por
    );

    IF NEW.status = 'concluido' AND OLD.status <> 'concluido' THEN
      NEW.concluido_em = now();
    ELSIF NEW.status <> 'concluido' THEN
      NEW.concluido_em = NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER historico_etapa_status
  BEFORE UPDATE ON crm_onboarding.etapas_onboarding
  FOR EACH ROW EXECUTE FUNCTION crm_onboarding.registrar_historico_etapa();

-- TRIGGER recalcular status_geral da unidade
CREATE OR REPLACE FUNCTION crm_onboarding.recalcular_status_unidade()
RETURNS trigger AS $$
DECLARE
  v_total integer;
  v_concluidas integer;
  v_bloqueadas integer;
  v_em_andamento integer;
  v_novo_status crm_onboarding.status_geral_enum;
BEGIN
  SELECT
    count(*),
    count(*) FILTER (WHERE status = 'concluido'),
    count(*) FILTER (WHERE status = 'bloqueado'),
    count(*) FILTER (WHERE status = 'em_andamento')
  INTO v_total, v_concluidas, v_bloqueadas, v_em_andamento
  FROM crm_onboarding.etapas_onboarding
  WHERE unidade_id = NEW.unidade_id;

  IF v_bloqueadas > 0 THEN
    v_novo_status := 'bloqueado';
  ELSIF v_concluidas = v_total THEN
    v_novo_status := 'concluido';
  ELSIF v_em_andamento > 0 OR v_concluidas > 0 THEN
    v_novo_status := 'em_andamento';
  ELSE
    v_novo_status := 'pendente';
  END IF;

  UPDATE crm_onboarding.unidades
  SET status_geral = v_novo_status
  WHERE id = NEW.unidade_id AND status_geral <> v_novo_status;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalcular_status_apos_etapa
  AFTER INSERT OR UPDATE OF status ON crm_onboarding.etapas_onboarding
  FOR EACH ROW EXECUTE FUNCTION crm_onboarding.recalcular_status_unidade();

-- VIEWS
CREATE OR REPLACE VIEW crm_onboarding.v_unidades_resumo AS
SELECT
  u.id,
  u.nome_unidade,
  u.nome_franqueado,
  u.telefone_franqueado,
  u.numeros_crm,
  u.status_geral,
  u.prioridade,
  u.responsavel_interno,
  u.submitted_at,
  u.atualizado_em,
  COUNT(e.*) FILTER (WHERE e.status = 'concluido') AS etapas_concluidas,
  COUNT(e.*) AS etapas_total,
  COUNT(a.*) AS qtd_agentes,
  COUNT(a.*) FILTER (WHERE a.acesso_enviado) AS agentes_com_acesso
FROM crm_onboarding.unidades u
LEFT JOIN crm_onboarding.etapas_onboarding e ON e.unidade_id = u.id
LEFT JOIN crm_onboarding.agentes a ON a.unidade_id = u.id
GROUP BY u.id;

CREATE OR REPLACE VIEW crm_onboarding.v_funil_etapas AS
SELECT
  etapa,
  COUNT(*) FILTER (WHERE status = 'pendente') AS pendentes,
  COUNT(*) FILTER (WHERE status = 'em_andamento') AS em_andamento,
  COUNT(*) FILTER (WHERE status = 'concluido') AS concluidas,
  COUNT(*) FILTER (WHERE status = 'bloqueado') AS bloqueadas,
  COUNT(*) AS total
FROM crm_onboarding.etapas_onboarding
GROUP BY etapa
ORDER BY MIN(ordem);

-- PostgREST grants
GRANT USAGE ON SCHEMA crm_onboarding TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA crm_onboarding TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA crm_onboarding TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA crm_onboarding TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA crm_onboarding
  GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA crm_onboarding
  GRANT ALL ON SEQUENCES TO authenticated, service_role;
