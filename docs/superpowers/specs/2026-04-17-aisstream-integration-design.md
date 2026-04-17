# AISStream Integration — Design Spec
**Data:** 2026-04-17  
**Projeto:** TugLife OPS AI  
**Status:** Aprovado

---

## Objetivo

Integrar dados AIS em tempo real da frota SAAM (Base Brasco Caju, Rio de Janeiro) via AISStream.io, exibindo posição, velocidade e status navegacional no dashboard — tanto em mapa Leaflet quanto nos cards de rebocador existentes.

---

## Frota — MMSIs

| Rebocador       | MMSI        |
|-----------------|-------------|
| SAAM ITABIRA    | 710000348   |
| SAAM ARIES      | 710020280   |
| SAAM LANCELOT   | 710016030   |
| SAAM CHILE      | 710021750   |
| SAAM HOLANDA    | 710001593   |
| SAAM ARTHUR     | 710015310   |

---

## Arquitetura

```
Dashboard (browser)
  │
  ├─ polling GET /api/ais  (a cada 60s)
  │       │
  │       └─ WebSocket → wss://stream.aisstream.io/v0/stream
  │               │  subscreve pelos 6 MMSIs
  │               │  aguarda 4s de dados
  │               └─ retorna AISPosition[]
  │
  ├─ <FleetMap />  ← Leaflet + OpenStreetMap
  │
  └─ cards existentes ← enriquecidos com SOG, rumo, status nav
```

---

## Variável de Ambiente

| Variável           | Onde configurar        |
|--------------------|------------------------|
| `AISSTREAM_API_KEY`| Netlify → Environment Variables (já configurada) |

---

## Arquivos Novos

| Arquivo | Responsabilidade |
|---|---|
| `src/app/api/ais/route.ts` | Bridge WebSocket AISStream → HTTP GET |
| `src/components/tuglife/FleetMap.tsx` | Mapa Leaflet com marcadores dos tugs |
| `src/hooks/useAISData.ts` | Hook de polling (60s), estados e cache |
| `src/types/ais.ts` | Tipos `AISPosition`, `NavStatus` |
| `src/config/fleet.ts` | Mapeamento MMSI → nome do rebocador |

---

## Tipos de Dados

```typescript
// src/types/ais.ts
interface AISPosition {
  mmsi: string
  nome: string        // ex: "SAAM ITABIRA"
  lat: number
  lon: number
  sog: number         // velocidade sobre o fundo (knots)
  cog: number         // rumo sobre o fundo (graus 0-360)
  heading: number     // proa verdadeira (graus 0-360)
  navStatus: string   // "Moored" | "Under way using engine" | "At anchor" | ...
  updatedAt: string   // ISO 8601 UTC
}
```

---

## API Route — `/api/ais`

**Método:** GET  
**Tempo estimado:** 4–5s (dentro do limite de 10s do Netlify free tier)

**Fluxo:**
1. Abre WebSocket para `wss://stream.aisstream.io/v0/stream`
2. Envia subscription com os 6 MMSIs dentro de 3s (requisito AISStream)
3. Coleta mensagens `PositionReport` por 4 segundos
4. Fecha conexão e retorna `AISPosition[]`

**Subscription message:**
```json
{
  "APIKey": "<AISSTREAM_API_KEY>",
  "BoundingBoxes": [[[-23.1, -43.4], [-22.6, -43.0]]],
  "FiltersShipMMSI": ["710000348","710020280","710016030","710021750","710001593","710015310"],
  "FilterMessageTypes": ["PositionReport"]
}
```

**Edge cases:**
| Situação | Comportamento |
|---|---|
| Tug sem sinal AIS nos 4s | Retorna `null` para aquele MMSI — card exibe "Sem sinal AIS" |
| AISStream indisponível | Retorna array vazio — dashboard mantém última posição em cache local |
| Timeout excedido | Fecha WS e retorna posições coletadas até o momento |

---

## Hook — `useAISData`

```
Estados: positions: AISPosition[], loading: boolean, error: boolean, lastUpdated: Date | null
- Chama GET /api/ais ao montar o componente
- Repete a cada 60 segundos via setInterval
- Em erro: mantém posições anteriores + exibe aviso "AIS desatualizado Xmin"
- Limpa o intervalo no unmount
```

---

## Componente — `FleetMap`

- **Renderização:** client-only via `dynamic(() => import(...), { ssr: false })` — Leaflet não suporta SSR
- **Centro inicial:** Baía de Guanabara `[-22.88, -43.18]`, zoom 12
- **Tiles:** OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)

**Marcadores:**
| Condição | Cor |
|---|---|
| SOG < 0.5 kn | Verde (parado/atracado) |
| SOG 0.5–3 kn | Amarelo (manobra lenta) |
| SOG > 3 kn | Azul (em trânsito) |

- Ícone SVG de âncora/rebocador rotacionado pelo `heading`
- Tooltip ao click: nome, SOG, rumo, status nav, `updatedAt`

---

## Integração no Dashboard

**Header:** Badge `AIS ●` — verde se dados < 2min, cinza se desatualizado

**Cards de rebocador** — linha adicional:
```
🛰 4.2 kn  ·  📍 -22.89, -43.17  ·  ⚓ Atracado  ·  há 45s
```

**Mapa:** Inserido entre o header e as colunas existentes de frota/escala, largura total (`col-span-12`), altura fixa de 320px em mobile e 400px em desktop.

---

## Dependências Novas

```json
"leaflet": "^1.9.4",
"react-leaflet": "^4.2.1",
"@types/leaflet": "^1.9.8"
```

---

## Fora do Escopo

- Histórico de trajectória (trilha do rebocador)
- Alertas de geofence
- Camada náutica OpenSeaMap (pode ser adicionada futuramente)
- Integração com dados de calado ou AIS dinâmico tipo B
