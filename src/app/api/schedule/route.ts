import { NextResponse } from 'next/server';
import type { ManobraSAA } from '@/types/fleet';

const schedule: ManobraSAA[] = [
  {
    pob: '06:00',
    horaProntidao: '06:30',
    navio: 'MOUNT OLYMPUS',
    calado: '12.4',
    loa: '228',
    tipo: 'E',
    origem: 'Fundeadouro',
    destino: 'Pier Brasco Caju — Boreste',
    rebocadoresNecessarios: 3,
  },
  {
    pob: '09:30',
    horaProntidao: '10:00',
    navio: 'FRONTIER LEADER',
    calado: '9.8',
    loa: '199',
    tipo: 'S',
    origem: 'Cais Almirante Tamandaré',
    destino: 'Fundeadouro',
    rebocadoresNecessarios: 2,
  },
  {
    pob: '13:00',
    horaProntidao: '13:30',
    navio: 'MINERVA ARIES',
    calado: '11.2',
    loa: '245',
    tipo: 'M',
    origem: 'Pier Sul — Boreste',
    destino: 'Pier Norte — Bombordo',
    rebocadoresNecessarios: 3,
  },
  {
    pob: '16:30',
    horaProntidao: '17:00',
    navio: 'MSC AURORA',
    calado: '13.1',
    loa: '299',
    tipo: 'E',
    origem: 'Fundeadouro',
    destino: 'Terminal de Granéis Líquidos',
    rebocadoresNecessarios: 4,
  },
];

export async function GET() {
  return NextResponse.json(schedule);
}
