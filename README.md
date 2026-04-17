# TugLife OPS AI

Sistema de gestão operacional de frota de rebocadores para a **SAAM — Base Brasco Caju, Rio de Janeiro**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00c7b7?logo=netlify)

**Live:** [tuglifeopsai.netlify.app](https://tuglifeopsai.netlify.app)

---

## Visão Geral

O TugLife OPS AI centraliza em um único dashboard:

- **Status da frota** — disponibilidade, manutenções ativas e equipamentos críticos
- **Escala de manobras SAA** — dados em tempo real da Praticagem RJ (Baía de Guanabara)
- **Mapa AIS** — posicionamento via MarineTraffic embed centrado no cais BRASCO
- **Logística de combustível** — monitoramento por rebocador com alerta de abastecimento
- **Agente de IA** — assistente de manutenção e logística via xAI Grok

---

## Frota

6 rebocadores ASD operando na Base Brasco Caju:

| Rebocador | MMSI |
|-----------|------|
| SAAM ITABIRA | 710000348 |
| SAAM LANCELOT | 710016030 |
| SAAM HOLANDA | 710001593 |
| SAAM ARIES | 710020280 |
| SAAM CHILE | 710021750 |
| SAAM ARTHUR | 710015310 |

---

## Funcionalidades

### Dashboard Operacional
- Frota segmentada por status: **Em Manutenção** e **Livre (Ops)**
- Equipamentos monitorados por rebocador: MCP BB/BE, MCA 01/02, Guincho de Manobra (Proa), Propulsores ASD BB/BE, Compressores de Ar 01/02
- Indicador de combustível com barra visual (capacidade 60.000 L/rebocador, alerta ≤ 30.000 L)

### Escala de Manobras SAA
- Scraping em tempo real do site [praticagem-rj.com.br](https://www.praticagem-rj.com.br)
- Filtra apenas manobras atribuídas à SAAM (`EMP.RB = SAA`) na Baía de Guanabara
- Exibe: data, POB, prontidão (POB − 30 min), tipo (E/S/M), local, nº de rebocadores necessários
- Auto-refresh a cada 5 minutos

### Mapa AIS
- Embed MarineTraffic centralizado no cais Brasco Caju (lat −22.8701 / lon −43.2132)
- Geofence do cais baseado em shapefile WKT oficial

### Agente Grok
- Powered by **xAI Grok** (`grok-4-1-fast-non-reasoning`)
- Papéis: `[MANUTENÇÃO]` `[LOGÍSTICA]` `[ALMOXARIFE]`
- Contexto completo da frota, equipamentos e regras de combustível
- Botões **Copiar** e **Limpar** conversa

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS (paleta `naval`) |
| AIS Tracking | AISStream.io WebSocket (`ws`) |
| Web Scraping | `node-html-parser` |
| IA | xAI Grok API |
| Deploy | Netlify + `@netlify/plugin-nextjs` |

---

## API Routes

| Rota | Descrição |
|------|-----------|
| `GET /api/fleet` | Status da frota, equipamentos e combustível |
| `GET /api/schedule` | Escala SAA em tempo real (scraping Praticagem RJ) |
| `POST /api/grok` | Chat com o agente de manutenção e logística |
| `GET /api/ais` | Posições AIS via AISStream WebSocket |

---

## Configuração

### Variáveis de Ambiente

```env
AISSTREAM_API_KEY=   # AISStream.io — rastreamento AIS
XAI_API_KEY=         # xAI — agente Grok
```

Configure em **Netlify → Site configuration → Environment variables**.

### Desenvolvimento Local

```bash
cd src
npm install
npm run dev
```

Acesse `http://localhost:3000/dashboard`.

---

## Deploy

O deploy é automático via Netlify a cada push na branch `main`. Requer o plugin `@netlify/plugin-nextjs` configurado no `netlify.toml`.

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── ais/        # WebSocket AISStream
│   │   ├── fleet/      # Dados da frota
│   │   ├── grok/       # Agente xAI
│   │   └── schedule/   # Scraping Praticagem RJ
│   └── dashboard/      # Interface principal
├── components/tuglife/  # FleetMap, EquipCard, SplashScreen
├── config/fleet.ts      # MMSIs, geofence, bounding box
├── hooks/useAISData.ts  # Polling AIS
└── types/fleet.ts       # Interfaces TypeScript
```

---

## Licença

Veja [LICENSE](LICENSE).
