import { NextResponse } from 'next/server';
import { AIS_BOUNDING_BOX, FLEET_MMSI, isInsideGeofence } from '@/config/fleet';
import { NAV_STATUS } from '@/types/ais';
import type { AISPosition } from '@/types/ais';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AISSTREAM_URL = 'wss://stream.aisstream.io/v0/stream';
const AISSTREAM_KEY = process.env.AISSTREAM_API_KEY ?? '';
const COLLECT_WINDOW_MS = 8_000;

interface AISDebugInfo {
  ok: boolean;
  hasApiKey: boolean;
  collectedCount: number;
  trackedMmsiCount: number;
  windowMs: number;
  startedAt: string;
  openedAt: string | null;      // quando onopen disparou
  subscriptionSentAt: string | null; // quando subscription foi enviada
  finishedAt: string;
  durationMs: number;
  messageEvents: number;
  allMessageTypes: string[];    // todos os tipos recebidos (inclui não-PositionReport)
  lastMessageType: string | null;
  closeCode: number | null;
  closeReason: string | null;
  reason:
    | 'ok'
    | 'missing_api_key'
    | 'timeout'
    | 'socket_error'
    | 'socket_closed'
    | 'unexpected_error';
  error: string | null;
}

function createDebugInfo(): AISDebugInfo {
  return {
    ok: false,
    hasApiKey: Boolean(AISSTREAM_KEY),
    collectedCount: 0,
    trackedMmsiCount: Object.keys(FLEET_MMSI).length,
    windowMs: COLLECT_WINDOW_MS,
    startedAt: new Date().toISOString(),
    openedAt: null,
    subscriptionSentAt: null,
    finishedAt: '',
    durationMs: 0,
    messageEvents: 0,
    allMessageTypes: [],
    lastMessageType: null,
    closeCode: null,
    closeReason: null,
    reason: AISSTREAM_KEY ? 'unexpected_error' : 'missing_api_key',
    error: null,
  };
}

function finalizeDebugInfo(debug: AISDebugInfo, positions: Map<string, AISPosition>) {
  debug.finishedAt = new Date().toISOString();
  debug.durationMs = new Date(debug.finishedAt).getTime() - new Date(debug.startedAt).getTime();
  debug.collectedCount = positions.size;
  debug.ok = debug.reason === 'ok';
}

interface AISStreamEnvelope {
  MessageType?: string;
  Message?: {
    PositionReport?: {
      Cog?: number;
      Latitude?: number;
      Longitude?: number;
      NavigationalStatus?: number;
      Sog?: number;
      TrueHeading?: number;
    };
  };
  MetaData?: {
    MMSI?: number | string;
    latitude?: number;
    longitude?: number;
    time_utc?: string;
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wantsDebug = url.searchParams.get('debug') === '1';
  const noFilter = url.searchParams.get('nofilter') === '1';
  const globalBox = url.searchParams.get('global') === '1'; // testa com bounding box global

  if (!AISSTREAM_KEY) {
    const debug = createDebugInfo();
    finalizeDebugInfo(debug, new Map());
    console.warn('[AIS] Missing AISSTREAM_API_KEY in runtime environment');
    return wantsDebug ? NextResponse.json({ positions: [], debug }) : NextResponse.json([]);
  }

  const positions = new Map<string, AISPosition>();
  const debug = createDebugInfo();

  try {
    await new Promise<void>((resolve) => {
      let settled = false;
      const ws = new WebSocket(AISSTREAM_URL);

      const finish = (reason: AISDebugInfo['reason']) => {
        if (settled) {
          return;
        }

        settled = true;
        debug.reason = reason;
        clearTimeout(timer);

        try {
          ws.close();
        } catch {
          // Ignore close errors so we can still return collected data.
        }

        resolve();
      };

      const timer = setTimeout(() => finish('timeout'), COLLECT_WINDOW_MS);

      ws.onopen = () => {
        debug.openedAt = new Date().toISOString();
        const subscriptionPayload: Record<string, unknown> = {
          APIKey: AISSTREAM_KEY,
          BoundingBoxes: globalBox ? [[[-90, -180], [90, 180]]] : AIS_BOUNDING_BOX,
          FilterMessageTypes: ['PositionReport'],
        };
        if (!noFilter) {
          subscriptionPayload.FiltersShipMMSI = Object.keys(FLEET_MMSI);
        }
        const subscription = JSON.stringify(subscriptionPayload);
        ws.send(subscription);
        debug.subscriptionSentAt = new Date().toISOString();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(String(event.data)) as AISStreamEnvelope;
          debug.messageEvents += 1;
          debug.lastMessageType = data.MessageType ?? null;
          if (!debug.allMessageTypes.includes(data.MessageType ?? '')) {
            debug.allMessageTypes.push(data.MessageType ?? 'unknown');
          }
          if (data.MessageType !== 'PositionReport') {
            return;
          }

          const report = data.Message?.PositionReport;
          const meta = data.MetaData;
          const mmsi = String(meta?.MMSI ?? '');
          const tugName = FLEET_MMSI[mmsi];

          if (!report || !meta || !tugName) {
            return;
          }

          const lat = Number(meta.latitude ?? report.Latitude);
          const lon = Number(meta.longitude ?? report.Longitude);

          if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return;
          }

          const navCode = Number(report.NavigationalStatus ?? 15);
          const cog = Number(report.Cog ?? 0);
          const trueHeading = Number(report.TrueHeading ?? cog);
          const heading = trueHeading === 511 ? cog : trueHeading;

          positions.set(mmsi, {
            mmsi,
            nome: tugName,
            lat,
            lon,
            sog: Number(report.Sog ?? 0),
            cog,
            heading,
            navStatus: isInsideGeofence(lat, lon) ? 'Na Base' : (NAV_STATUS[navCode] ?? 'Indefinido'),
            updatedAt: meta.time_utc ?? new Date().toISOString(),
          });
        } catch {
          // Ignore malformed events and keep collecting the remaining ones.
        }
      };

      ws.onerror = () => {
        debug.error = 'WebSocket connection error';
        console.error('[AIS] WebSocket error while collecting AISStream data');
        finish('socket_error');
      };

      ws.onclose = (event) => {
        debug.closeCode = event.code;
        debug.closeReason = event.reason || null;
        if (!settled) {
          finish('socket_closed');
        }
      };
    });
  } catch (error) {
    debug.reason = 'unexpected_error';
    debug.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AIS] Unexpected route error', error);
    finalizeDebugInfo(debug, positions);
    return wantsDebug ? NextResponse.json({ positions: [], debug }) : NextResponse.json([]);
  }

  if (debug.reason === 'timeout') {
    debug.reason = 'ok';
  }

  finalizeDebugInfo(debug, positions);

  if (wantsDebug) {
    console.info('[AIS] Debug response', debug);
    return NextResponse.json({ positions: Array.from(positions.values()), debug });
  }

  return NextResponse.json(Array.from(positions.values()));
}
