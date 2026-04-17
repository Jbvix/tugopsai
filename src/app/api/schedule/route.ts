import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';
import type { ManobraSAA, TipoManobra } from '@/types/fleet';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRATICAGEM_URL = 'https://www.praticagem-rj.com.br/';

// Número de rebocadores conforme LOA — regra padrão Praticagem RJ
function calcRebocadores(loa: number): number {
  if (loa >= 300) return 4;
  if (loa >= 250) return 3;
  if (loa >= 150) return 2;
  return 1;
}

// POB "17/04 14:00" → extrai hora e calcula prontidão +30min
function parsePob(raw: string): { pob: string; horaProntidao: string } {
  const match = raw.match(/(\d{2}):(\d{2})$/);
  if (!match) return { pob: raw.trim(), horaProntidao: raw.trim() };
  const totalMin = Number(match[1]) * 60 + Number(match[2]) + 30;
  const ph = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
  const pm = String(totalMin % 60).padStart(2, '0');
  return { pob: `${match[1]}:${match[2]}`, horaProntidao: `${ph}:${pm}` };
}

function parseTipo(raw: string): TipoManobra {
  const v = raw.trim().toUpperCase();
  if (v === 'S') return 'S';
  if (v === 'M') return 'M';
  return 'E';
}

// Filtra as próximas 48h (aceita também manobras até 1h atrás)
function isWithin48h(pobRaw: string): boolean {
  const match = pobRaw.match(/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return true;
  const [, day, month, hour, min] = match.map(Number);
  const now = new Date();
  const dt = new Date(now.getFullYear(), month - 1, day, hour, min);
  const diffH = (dt.getTime() - now.getTime()) / 3_600_000;
  return diffH >= -1 && diffH <= 48;
}

const FALLBACK: ManobraSAA[] = [
  {
    pob: '--:--',
    horaProntidao: '--:--',
    navio: 'Praticagem RJ indisponível',
    calado: '-',
    loa: '-',
    tipo: 'E',
    origem: '-',
    destino: '-',
    rebocadoresNecessarios: 0,
  },
];

export async function GET() {
  try {
    const res = await fetch(PRATICAGEM_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TugLifeOPS/1.0)' },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('[schedule] praticagem-rj fetch failed', res.status);
      return NextResponse.json(FALLBACK);
    }

    const html = await res.text();
    const root = parse(html);

    // Apenas linhas da Baía de Guanabara: id contém "rptAreas_ctl00_rptManobrasArea"
    const rows = root.querySelectorAll('[id*="rptAreas_ctl00_rptManobrasArea"]');

    const seen = new Set<string>();
    const manobras: ManobraSAA[] = [];

    for (const row of rows) {
      const cells = row.querySelectorAll('td.tdManobraArea');
      if (cells.length < 12) continue;

      const pobRaw = cells[0].text.trim();
      if (!isWithin48h(pobRaw)) continue;

      // Nome do navio: primeiro text node do .tooltipDiv (antes do tooltip CSS)
      const tooltipDiv = cells[1].querySelector('.tooltipDiv');
      const navio = tooltipDiv?.childNodes[0]?.text?.trim() ?? cells[1].text.split('\n')[0].trim();
      if (!navio || navio.length < 2) continue;

      // Filtra apenas manobras atribuídas à SAAM (EMP.RB = td[15])
      const empRb = cells[15]?.text?.trim() ?? '';
      if (empRb !== 'SAA') continue;

      // Deduplicação por POB + navio
      const key = `${pobRaw}|${navio}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const calado = cells[2].text.trim().replace(',', '.') || '-';
      const loa    = cells[3].text.trim().replace(',', '.') || '0';
      const tipo   = parseTipo(cells[7].text);
      const origem = cells[8].text.trim() || '-';
      const destino= cells[11].text.trim() || '-';
      const loaNum = parseFloat(loa) || 0;
      const { pob, horaProntidao } = parsePob(pobRaw);

      manobras.push({
        pob,
        horaProntidao,
        navio,
        calado,
        loa: loaNum > 0 ? loa : '-',
        tipo,
        origem,
        destino,
        rebocadoresNecessarios: calcRebocadores(loaNum),
      });
    }

    if (manobras.length === 0) {
      console.warn('[schedule] 0 manobras parsed — fallback');
      return NextResponse.json(FALLBACK);
    }

    // Ordena por hora POB
    manobras.sort((a, b) => a.pob.localeCompare(b.pob));

    console.info(`[schedule] ${manobras.length} manobras from praticagem-rj`);
    return NextResponse.json(manobras);
  } catch (err) {
    console.error('[schedule] error', err);
    return NextResponse.json(FALLBACK);
  }
}
