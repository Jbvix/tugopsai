export type Sistema = 'Propulsão' | 'Energia' | 'Convés';
export type StatusEquip = 'operacional' | 'alerta' | 'critico';

export interface Equipamento {
  id: string;
  nome: string;
  sistema: Sistema;
  horimetro: number;
  limitePreventiva: number; // 1500 para MCP, 500 para DG
  status: StatusEquip;
  woPendente?: string;
}

export interface ItemEstoque {
  id: string;
  descricao: string;
  qtd: number;
  minimo: number;
  unidade: string;
}

export interface InsightIA {
  prioridade: string;
  recomendacao: string;
  economiaEstimada: string;
}