import { Equipamento } from '../types';

export const calcularSaude = (eq: Equipamento): number => {
  return (eq.horimetro / eq.limitePreventiva) * 100;
};

export const formatarPromptParaIA = (equipamentos: Equipamento[], estoque: any) => {
  return `Analise a frota: ${JSON.stringify(equipamentos)}. 
  Estoque disponível: ${JSON.stringify(estoque)}. 
  Considere 02 MCPs e 02 DGs. Identifique janelas estratégicas para evitar Off-hire duplo.`;
};