import { NextResponse } from 'next/server';
import type { FleetData } from '@/types/fleet';

const fleetData: FleetData = {
  dataReferencia: new Date().toISOString(),
  rebocadores: [
    {
      id: 'rb-01',
      nome: 'SAAM ITABIRA',
      status: 'Em_Manutencao',
      motivoIndisponibilidade: 'Troca de hélice de proa + vazamento hidráulico no guincho de reboque',
      equipamentos: [
        { id: 'eq-01', nome: 'Hélice de Proa (Bow Thruster)', tipo: 'Propulsão', status: 'critico', horasAtual: 8400, proximaTroca: 8000, descricao: 'Cavitação severa — substituição em andamento' },
        { id: 'eq-02', nome: 'Guincho de Reboque', tipo: 'Reboque', status: 'critico', descricao: 'Vazamento hidráulico no cilindro principal' },
        { id: 'eq-03', nome: 'Motor Principal BB', tipo: 'Propulsão', status: 'operacional', horasAtual: 3200, proximaTroca: 4000 },
        { id: 'eq-04', nome: 'Motor Principal BE', tipo: 'Propulsão', status: 'operacional', horasAtual: 3200, proximaTroca: 4000 },
      ],
    },
    {
      id: 'rb-02',
      nome: 'SAAM LANCELOT',
      status: 'Em_Manutencao',
      motivoIndisponibilidade: 'Preventiva de 2.000h + troca de óleo lubrificante motores principais',
      equipamentos: [
        { id: 'eq-05', nome: 'Motor Principal BB', tipo: 'Propulsão', status: 'alerta', horasAtual: 2050, proximaTroca: 2000, descricao: 'Vencida — em troca de óleo' },
        { id: 'eq-06', nome: 'Motor Principal BE', tipo: 'Propulsão', status: 'alerta', horasAtual: 2050, proximaTroca: 2000, descricao: 'Vencida — em troca de óleo' },
        { id: 'eq-07', nome: 'Bomba de Incêndio', tipo: 'Segurança', status: 'operacional' },
        { id: 'eq-08', nome: 'Gerador de Emergência', tipo: 'Elétrico', status: 'operacional' },
      ],
    },
    {
      id: 'rb-03',
      nome: 'SAAM HOLANDA',
      status: 'Disponivel',
      equipamentos: [
        { id: 'eq-09', nome: 'Motor Principal BB', tipo: 'Propulsão', status: 'operacional', horasAtual: 1100, proximaTroca: 2000 },
        { id: 'eq-10', nome: 'Motor Principal BE', tipo: 'Propulsão', status: 'operacional', horasAtual: 1100, proximaTroca: 2000 },
        { id: 'eq-11', nome: 'Guincho de Reboque', tipo: 'Reboque', status: 'operacional' },
        { id: 'eq-12', nome: 'Hélice de Proa', tipo: 'Propulsão', status: 'operacional' },
      ],
    },
    {
      id: 'rb-04',
      nome: 'SAAM ARIES',
      status: 'Disponivel',
      equipamentos: [
        { id: 'eq-13', nome: 'Motor Principal BB', tipo: 'Propulsão', status: 'operacional', horasAtual: 750, proximaTroca: 2000 },
        { id: 'eq-14', nome: 'Motor Principal BE', tipo: 'Propulsão', status: 'operacional', horasAtual: 750, proximaTroca: 2000 },
        { id: 'eq-15', nome: 'Guincho de Reboque', tipo: 'Reboque', status: 'operacional' },
        { id: 'eq-16', nome: 'Bomba de Incêndio', tipo: 'Segurança', status: 'operacional' },
      ],
    },
    {
      id: 'rb-05',
      nome: 'SAAM CHILE',
      status: 'Disponivel',
      equipamentos: [
        { id: 'eq-17', nome: 'Motor Principal BB', tipo: 'Propulsão', status: 'operacional', horasAtual: 500, proximaTroca: 2000 },
        { id: 'eq-18', nome: 'Motor Principal BE', tipo: 'Propulsão', status: 'operacional', horasAtual: 500, proximaTroca: 2000 },
        { id: 'eq-19', nome: 'Hélice de Proa', tipo: 'Propulsão', status: 'operacional' },
        { id: 'eq-20', nome: 'Guincho de Reboque', tipo: 'Reboque', status: 'operacional' },
      ],
    },
    {
      id: 'rb-06',
      nome: 'SAAM ARTHUR',
      status: 'Disponivel',
      equipamentos: [
        { id: 'eq-21', nome: 'Motor Principal BB', tipo: 'Propulsão', status: 'operacional', horasAtual: 920, proximaTroca: 2000 },
        { id: 'eq-22', nome: 'Motor Principal BE', tipo: 'Propulsão', status: 'operacional', horasAtual: 920, proximaTroca: 2000 },
        { id: 'eq-23', nome: 'Guincho de Reboque', tipo: 'Reboque', status: 'operacional' },
        { id: 'eq-24', nome: 'Gerador de Emergência', tipo: 'Elétrico', status: 'operacional' },
      ],
    },
  ],
  estoque: {
    diesel_L: 42000,
    oleo_L: 3200,
    autonomiaDias: 12,
  },
  resumo: {
    totalRebocadores: 6,
    disponiveis: 4,
    emManutencao: 2,
    emOperacao: 0,
    custoTotalPrevisto: 87500,
  },
};

export async function GET() {
  return NextResponse.json(fleetData);
}
