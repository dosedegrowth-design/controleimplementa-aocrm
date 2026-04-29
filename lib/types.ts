// Tipos do schema crm_onboarding

export type Role = "super_admin" | "admin" | "viewer";
export type StatusGeral = "pendente" | "em_andamento" | "concluido" | "bloqueado";
export type Prioridade = "baixa" | "normal" | "alta" | "urgente";
export type EtapaKey =
  | "painel_criado"
  | "grupo_whatsapp"
  | "acessos_enviados"
  | "conexao_whatsapp"
  | "treinamento"
  | "grupo_suporte_ativo";
export type StatusEtapa = "pendente" | "em_andamento" | "concluido" | "bloqueado" | "nao_aplicavel";
export type PerfilAgente = "administrador" | "agente" | "digitador" | "proprietario" | "outro";

export interface Usuario {
  id: string;
  email: string;
  nome: string | null;
  role: Role;
  ativo: boolean;
  ultimo_login: string | null;
  criado_em: string;
  criado_por: string | null;
}

export interface Unidade {
  id: string;
  submitted_at: string;
  nome_unidade: string;
  nome_franqueado: string | null;
  telefone_franqueado: string | null;
  numeros_crm: string[];
  dados_agentes_raw: string | null;
  status_geral: StatusGeral;
  prioridade: Prioridade;
  responsavel_interno: string | null;
  observacoes: string | null;
  alerta_ativo: boolean;
  alerta_motivo: string | null;
  alerta_criado_em: string | null;
  alerta_criado_por: string | null;
  sheet_row_hash: string;
  sheet_row_index: number | null;
  criado_em: string;
  atualizado_em: string;
}

export interface UnidadeResumo extends Unidade {
  etapas_concluidas: number;
  etapas_total: number;
  qtd_agentes: number;
  agentes_com_acesso: number;
}

export interface Agente {
  id: string;
  unidade_id: string;
  nome: string | null;
  email: string | null;
  perfil: PerfilAgente;
  perfil_raw: string | null;
  criado_no_crm: boolean;
  acesso_enviado: boolean;
  data_envio_acesso: string | null;
  observacao: string | null;
  origem: "form" | "manual";
  criado_em: string;
  atualizado_em: string;
}

export interface EtapaOnboarding {
  id: string;
  unidade_id: string;
  etapa: EtapaKey;
  ordem: number;
  status: StatusEtapa;
  iniciado_em: string | null;
  concluido_em: string | null;
  concluido_por: string | null;
  observacao: string | null;
  atualizado_em: string;
}

export interface SubEtapa {
  id: string;
  etapa_id: string;
  chave: string;
  rotulo: string;
  ordem: number;
  concluido: boolean;
  concluido_em: string | null;
  concluido_por: string | null;
}

export interface HistoricoEtapa {
  id: string;
  unidade_id: string;
  etapa_id: string | null;
  acao: string;
  status_anterior: string | null;
  status_novo: string | null;
  mudado_por: string | null;
  nota: string | null;
  mudado_em: string;
}

export interface SyncLog {
  id: string;
  iniciado_em: string;
  concluido_em: string | null;
  status: string;
  linhas_lidas: number;
  unidades_inseridas: number;
  unidades_atualizadas: number;
  agentes_inseridos: number;
  erros: string[] | null;
  detalhes: unknown;
}

export interface FunilEtapa {
  etapa: EtapaKey;
  pendentes: number;
  em_andamento: number;
  concluidas: number;
  bloqueadas: number;
  total: number;
}
