export type StatusEquipamento = 'operacional' | 'alerta' | 'critico';
export type StatusRebocador = 'Disponivel' | 'Em_Manutencao' | 'Em_Operacao';
export type TipoManobra = 'E' | 'S' | 'M';

export interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  status: StatusEquipamento;
  horasAtual?: number;
  proximaTroca?: number;
  descricao?: string;
}

export interface Rebocador {
  id: string;
  nome: string;
  status: StatusRebocador;
  motivoIndisponibilidade?: string;
  equipamentos: Equipamento[];
}

export interface EstoqueFlota {
  diesel_L: number;
  oleo_L: number;
  autonomiaDias: number;
}

export interface FleetData {
  rebocadores: Rebocador[];
  estoque: EstoqueFlota;
  dataReferencia: string;
  resumo: {
    totalRebocadores: number;
    disponiveis: number;
    emManutencao: number;
    emOperacao: number;
    custoTotalPrevisto: number;
  };
}

export interface ManobraSAA {
  pob: string;
  horaProntidao: string;
  navio: string;
  calado: string;
  loa: string;
  tipo: TipoManobra;
  origem: string;
  destino: string;
  rebocadoresNecessarios: number;
}
