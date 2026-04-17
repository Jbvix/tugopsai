# AISStream Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar dados AIS em tempo real da frota SAAM via AISStream.io, exibindo posição/velocidade/status em mapa Leaflet e nos cards de rebocador do dashboard.

**Architecture:** API Route `/api/ais` abre WebSocket para AISStream, coleta posições dos 6 tugs por 4 segundos e retorna JSON. O frontend faz polling a cada 60s via hook `useAISData`. Um mapa Leaflet (client-only, SSR desabilitado) exibe marcadores coloridos por velocidade e um geofence do cais Brasco Caju.

**Tech Stack:** Next.js App Router, TypeScript, Leaflet 1.9, react-leaflet 4.2, AISStream WebSocket API, Tailwind CSS

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/types/ais.ts` | Criar | Tipos `AISPosition`, `NAV_STATUS` |
| `src/config/fleet.ts` | Criar | Mapeamento MMSI → nome, coordenadas geofence |
| `src/app/api/ais/route.ts` | Criar | Bridge WebSocket AISStream → HTTP GET |
| `src/hooks/useAISData.ts` | Criar | Polling 60s com cache e estado de erro |
| `src/components/tuglife/FleetMap.tsx` | Criar | Mapa Leaflet com marcadores e geofence |
| `src/app/dashboard/page.tsx` | Modificar | Adicionar FleetMap, badge AIS, enriquecer cards |
| `src/package.json` | Modificar | Adicionar leaflet, react-leaflet, @types/leaflet |

---

## Task 1: Tipos e Configuração de Frota

**Files:**
- Create: `src/types/ais.ts`
- Create: `src/config/fleet.ts`

- [ ] **Step 1: Criar `src/types/ais.ts`**

```typescript
export interface AISPosition {
  mmsi: string
  nome: string
  lat: number
  lon: number
  sog: number
  cog: number
  heading: number
  navStatus: string
  updatedAt: string
}

export const NAV_STATUS: Record<number, string> = {
  0: 'Em Trânsito',
  1: 'Fundeado',
  2: 'Sem Governo',
  3: 'Manobra Restrita',
  5: 'Atracado',
  6: 'Encalhado',
  8: 'À Vela',
  15: 'Desconhecido',
}
```

- [ ] **Step 2: Criar `src/config/fleet.ts`**

```typescript
export const FLEET_MMSI: Record<string, string> = {
  '710000348': 'SAAM ITABIRA',
  '710020280': 'SAAM ARIES',
  '710016030': 'SAAM LANCELOT',
  '710021750': 'SAAM CHILE',
  '710001593': 'SAAM HOLANDA',
  '710015310': 'SAAM ARTHUR',
}

// Polígono do cais Porto Brasco — Brasco Caju, Rio de Janeiro
export const BRASCO_GEOFENCE: [number, number][] = [
  [-22.878, -43.219],
  [-22.873, -43.211],
  [-22.882, -43.206],
  [-22.887, -43.214],
]

export function isInsideGeofence(lat: number, lon: number): boolean {
  const polygon = BRASCO_GEOFENCE
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i]
    const [yj, xj] = polygon[j]
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}
```

- [ ] **Step 3: Verificar compilação TypeScript**

```bash
cd src && npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/types/ais.ts src/config/fleet.ts
git commit -m "feat: tipos AISPosition e config de frota SAAM com geofence Brasco"
```

---

## Task 2: API Route `/api/ais`

**Files:**
- Create: `src/app/api/ais/route.ts`

- [ ] **Step 1: Criar `src/app/api/ais/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { FLEET_MMSI, isInsideGeofence } from '@/config/fleet'
import { NAV_STATUS } from '@/types/ais'
import type { AISPosition } from '@/types/ais'

const AISSTREAM_KEY = process.env.AISSTREAM_API_KEY ?? ''
const COLLECT_MS = 4000

export async function GET() {
  if (!AISSTREAM_KEY) {
    return NextResponse.json([])
  }

  const positions = new Map<string, AISPosition>()

  try {
    await new Promise<void>((resolve) => {
      const ws = new WebSocket('wss://stream.aisstream.io/v0/stream')

      const done = () => {
        clearTimeout(timer)
        try { ws.close() } catch {}
        resolve()
      }

      const timer = setTimeout(done, COLLECT_MS)

      ws.onopen = () => {
        ws.send(JSON.stringify({
          APIKey: AISSTREAM_KEY,
          BoundingBoxes: [[[-23.1, -43.4], [-22.6, -43.0]]],
          FiltersShipMMSI: Object.keys(FLEET_MMSI),
          FilterMessageTypes: ['PositionReport'],
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string)
          if (data.MessageType !== 'PositionReport') return

          const msg = data.Message?.PositionReport
          const meta = data.MetaData
          if (!msg || !meta) return

          const mmsi = String(meta.MMSI)
          if (!FLEET_MMSI[mmsi]) return

          const lat = meta.latitude as number
          const lon = meta.longitude as number
          const navidx = msg.NavigationalStatus as number

          const navStatus = isInsideGeofence(lat, lon)
            ? 'Na Base'
            : (NAV_STATUS[navidx] ?? 'Desconhecido')

          positions.set(mmsi, {
            mmsi,
            nome: FLEET_MMSI[mmsi],
            lat,
            lon,
            sog: msg.Sog ?? 0,
            cog: msg.Cog ?? 0,
            heading: msg.TrueHeading === 511 ? (msg.Cog ?? 0) : (msg.TrueHeading ?? 0),
            navStatus,
            updatedAt: meta.time_utc ?? new Date().toISOString(),
          })
        } catch {}
      }

      ws.onerror = () => done()
    })
  } catch {
    return NextResponse.json([])
  }

  return NextResponse.json(Array.from(positions.values()))
}
```

> **Nota:** `TrueHeading === 511` significa "não disponível" no protocolo AIS — nesse caso usamos `Cog` como fallback.

- [ ] **Step 2: Verificar build**

```bash
cd src && npm run build 2>&1 | grep -E "error|Error|✓"
```

Esperado: `✓ Compiled successfully` e `/api/ais` listado como rota `ƒ (Dynamic)`.

- [ ] **Step 3: Testar localmente**

```bash
cd src && npm run dev
```

Em outro terminal:
```bash
curl http://localhost:3000/api/ais
```

Esperado: array JSON com posições dos tugs (ou `[]` se sem sinal AIS local — normal sem `AISSTREAM_API_KEY` no `.env.local`).

Para testar com a chave real, adicionar ao `src/.env.local`:
```
AISSTREAM_API_KEY=<sua_chave>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ais/route.ts
git commit -m "feat: rota /api/ais — bridge WebSocket AISStream com geofence Brasco"
```

---

## Task 3: Hook `useAISData`

**Files:**
- Create: `src/hooks/useAISData.ts`

- [ ] **Step 1: Criar `src/hooks/useAISData.ts`**

```typescript
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { AISPosition } from '@/types/ais'

interface UseAISDataReturn {
  positions: AISPosition[]
  loading: boolean
  error: boolean
  lastUpdated: Date | null
}

const POLL_INTERVAL_MS = 60_000

export function useAISData(): UseAISDataReturn {
  const [positions, setPositions] = useState<AISPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const prevPositions = useRef<AISPosition[]>([])

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch('/api/ais')
      if (!res.ok) throw new Error('AIS fetch failed')
      const data: AISPosition[] = await res.json()
      if (data.length > 0) {
        prevPositions.current = data
        setPositions(data)
        setError(false)
        setLastUpdated(new Date())
      } else {
        // mantém posições anteriores em caso de array vazio
        setPositions(prevPositions.current)
      }
    } catch {
      setError(true)
      setPositions(prevPositions.current)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPositions()
    const interval = setInterval(fetchPositions, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchPositions])

  return { positions, loading, error, lastUpdated }
}
```

- [ ] **Step 2: Verificar compilação**

```bash
cd src && npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAISData.ts
git commit -m "feat: hook useAISData com polling 60s e cache de posições anteriores"
```

---

## Task 4: Instalar Leaflet e Criar `FleetMap`

**Files:**
- Modify: `src/package.json`
- Create: `src/components/tuglife/FleetMap.tsx`

- [ ] **Step 1: Instalar dependências Leaflet**

```bash
cd src && npm install leaflet react-leaflet @types/leaflet
```

Esperado: `added X packages` sem erros.

- [ ] **Step 2: Criar `src/components/tuglife/FleetMap.tsx`**

```typescript
'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet'
import L from 'leaflet'
import type { AISPosition } from '@/types/ais'
import { BRASCO_GEOFENCE } from '@/config/fleet'
import 'leaflet/dist/leaflet.css'

// Corrige ícones padrão do Leaflet no Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function tugColor(sog: number): string {
  if (sog < 0.5) return '#22c55e'   // verde — parado/atracado
  if (sog < 3)   return '#f59e0b'   // amarelo — manobra lenta
  return '#3b82f6'                   // azul — em trânsito
}

function createTugIcon(heading: number, sog: number): L.DivIcon {
  const color = tugColor(sog)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"
         style="transform: rotate(${heading}deg); transform-origin: center;">
      <circle cx="14" cy="14" r="12" fill="${color}" fill-opacity="0.85" stroke="white" stroke-width="2"/>
      <polygon points="14,4 19,20 14,16 9,20" fill="white"/>
    </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

interface FleetMapProps {
  positions: AISPosition[]
}

export function FleetMap({ positions }: FleetMapProps) {
  useEffect(() => {
    // garante que o CSS do Leaflet seja carregado no client
  }, [])

  return (
    <MapContainer
      center={[-22.88, -43.18]}
      zoom={12}
      style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Geofence — Base SAAM Brasco Caju */}
      <Polygon
        positions={BRASCO_GEOFENCE}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          weight: 2,
        }}
      >
        <Popup>⚓ Base SAAM — Brasco Caju</Popup>
      </Polygon>

      {/* Marcadores dos rebocadores */}
      {positions.map((pos) => (
        <Marker
          key={pos.mmsi}
          position={[pos.lat, pos.lon]}
          icon={createTugIcon(pos.heading, pos.sog)}
        >
          <Popup>
            <div style={{ minWidth: 160, fontFamily: 'monospace', fontSize: 12 }}>
              <strong>{pos.nome}</strong><br />
              🚢 {pos.sog.toFixed(1)} kn &nbsp;·&nbsp; {pos.cog.toFixed(0)}°<br />
              📍 {pos.lat.toFixed(4)}, {pos.lon.toFixed(4)}<br />
              ⚓ {pos.navStatus}<br />
              🕐 {formatTime(pos.updatedAt)}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

- [ ] **Step 3: Verificar build**

```bash
cd src && npm run build 2>&1 | grep -E "error|Error|✓"
```

Esperado: `✓ Compiled successfully` sem erros TypeScript.

- [ ] **Step 4: Commit**

```bash
git add src/components/tuglife/FleetMap.tsx src/package.json src/package-lock.json
git commit -m "feat: componente FleetMap com Leaflet, marcadores por SOG e geofence Brasco"
```

---

## Task 5: Integrar no Dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Adicionar imports no topo de `src/app/dashboard/page.tsx`**

Após os imports existentes, adicionar:

```typescript
import dynamic from 'next/dynamic'
import { useAISData } from '@/hooks/useAISData'
import type { AISPosition } from '@/types/ais'

const FleetMap = dynamic(
  () => import('@/components/tuglife/FleetMap').then(m => m.FleetMap),
  { ssr: false, loading: () => <div className="h-80 bg-white/5 rounded-2xl animate-pulse" /> }
)
```

- [ ] **Step 2: Adicionar hook `useAISData` dentro do componente `Dashboard`**

Logo após os `useState` existentes (linha ~34), adicionar:

```typescript
const { positions: aisPositions, error: aisError, lastUpdated: aisUpdated } = useAISData()

const getAIS = (nomeReb: string): AISPosition | undefined =>
  aisPositions.find(p => p.nome === nomeReb)

const aisAgeMin = aisUpdated
  ? Math.floor((Date.now() - aisUpdated.getTime()) / 60000)
  : null
```

- [ ] **Step 3: Adicionar badge AIS no header**

No header, após os `StatBadge` existentes (linha ~108), adicionar:

```tsx
<div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
  aisError || aisAgeMin === null
    ? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
    : aisAgeMin < 2
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
}`}>
  <span className={`w-1.5 h-1.5 rounded-full ${
    aisError || aisAgeMin === null ? 'bg-slate-400' :
    aisAgeMin < 2 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
  }`} />
  AIS {aisAgeMin !== null && !aisError ? `${aisAgeMin}min` : 'OFF'}
</div>
```

- [ ] **Step 4: Adicionar mapa entre o header e o `<main>`**

Entre o `</header>` e o `<main ...>` (linha ~112), inserir:

```tsx
{/* Mapa AIS da Frota */}
<div className="max-w-7xl mx-auto px-4 pt-4">
  <div className="h-80 lg:h-96 w-full rounded-2xl overflow-hidden border border-white/5">
    <FleetMap positions={aisPositions} />
  </div>
</div>
```

- [ ] **Step 5: Enriquecer cards dos rebocadores em manutenção**

Na seção `emManutencao.map(...)` (linha ~128), dentro do `<div key={reb.id}>`, após o `<h3>` do nome, adicionar:

```tsx
{(() => {
  const ais = getAIS(reb.nome)
  return ais ? (
    <p className="text-[10px] text-slate-500 pl-5 mb-1 flex gap-2">
      <span>🛰 {ais.sog.toFixed(1)} kn</span>
      <span>📍 {ais.lat.toFixed(3)}, {ais.lon.toFixed(3)}</span>
      <span>⚓ {ais.navStatus}</span>
    </p>
  ) : null
})()}
```

- [ ] **Step 6: Enriquecer cards dos rebocadores disponíveis**

Na seção `disponiveis.map(...)` (linha ~150), após o `<h3>` do nome, adicionar o mesmo bloco:

```tsx
{(() => {
  const ais = getAIS(reb.nome)
  return ais ? (
    <p className="text-[10px] text-slate-500 pl-5 flex gap-2">
      <span>🛰 {ais.sog.toFixed(1)} kn</span>
      <span>📍 {ais.lat.toFixed(3)}, {ais.lon.toFixed(3)}</span>
      <span>⚓ {ais.navStatus}</span>
    </p>
  ) : null
})()}
```

- [ ] **Step 7: Verificar build final**

```bash
cd src && npm run build 2>&1 | tail -20
```

Esperado: `✓ Generating static pages` sem erros, rotas `/`, `/dashboard`, `/api/ais`, `/api/fleet`, `/api/grok`, `/api/schedule` todas presentes.

- [ ] **Step 8: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: integra mapa AIS, badge e enriquecimento de cards no dashboard"
```

---

## Task 6: Deploy e Verificação

- [ ] **Step 1: Push para GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Aguardar deploy Netlify**

Aguardar 2-3 minutos. Verificar em `https://tuglifeopsai.netlify.app/dashboard`.

- [ ] **Step 3: Verificar API AIS em produção**

```bash
curl https://tuglifeopsai.netlify.app/api/ais
```

Esperado: array JSON com até 6 objetos `AISPosition`. Se retornar `[]`, verificar se `AISSTREAM_API_KEY` está configurada no Netlify com scope `Runtime`.

- [ ] **Step 4: Verificar no browser**

Abrir `https://tuglifeopsai.netlify.app/dashboard` e confirmar:
- [ ] Mapa da Baía de Guanabara visível com tiles OSM
- [ ] Polígono azul translúcido sobre o Porto Brasco com label ao click
- [ ] Marcadores coloridos para os tugs com sinal AIS ativo
- [ ] Badge `AIS Xmin` no header (verde < 2min, âmbar se mais antigo)
- [ ] Cards com linha de dados AIS (SOG, coordenadas, status)

---

## Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| `FleetMap` não renderiza | Leaflet CSS não carregado | Verificar import `'leaflet/dist/leaflet.css'` no componente |
| Mapa aparece cinza/sem tiles | SSR renderizando Leaflet | Confirmar `dynamic(..., { ssr: false })` no import |
| `/api/ais` retorna `[]` | `AISSTREAM_API_KEY` ausente | Conferir variável no Netlify com scope `Runtime` |
| Tugs sem sinal | MMSIs fora do ar ou fora da bounding box | Normal — AIS depende de transponder ligado a bordo |
| Ícones de marker quebrados | Next.js servindo assets do Leaflet | Fix já aplicado no Step 2 da Task 4 (mergeOptions) |
