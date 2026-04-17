# TugLife OPS AI

Sistema de gestão operacional de frota de rebocadores para a **SAAM — Base Brasco Caju, Rio de Janeiro**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00c7b7?logo=netlify)

**Live:** [tuglifeopsai.netlify.app](https://tuglifeopsai.netlify.app)

---

## Visão Geral

O TugLife OPS AI centraliza em um único dashboard o que o CCM precisa em tempo real:

- **Status da frota** — disponibilidade, manutenções ativas e equipamentos críticos por rebocador
- **Combustível** — nível individual por rebocador, alerta automático de reabastecimento
- **Escala de manobras SAA** — dados ao vivo da Praticagem RJ, filtrados para a SAAM
- **Mapa AIS** — MarineTraffic embed com localização individual de cada rebocador por botão
- **Agente de IA** — assistente de manutenção e logística via xAI Grok

---

## Frota

6 rebocadores ASD na Base Brasco Caju — Baía de Guanabara:

| Rebocador | Abrev. | MMSI |
|-----------|--------|------|
| SAAM ITABIRA | IB | 710000348 |
| SAAM LANCELOT | LC | 710016030 |
| SAAM HOLANDA | HL | 710001593 |
| SAAM ARIES | AR | 710020280 |
| SAAM CHILE | CH | 710021750 |
| SAAM ARTHUR | AT | 710015310 |

---

## Funcionalidades

### Dashboard — CCM Operacional

- Frota segmentada: **Impedida (Manutenção)** e **Livre (Ops)**
- Equipamentos monitorados por rebocador (9 sistemas):
  - MCP BB / MCP BE — Motores Principais
  - MCA 01 / MCA 02 — Motores Auxiliares / Geradores
  - Guincho de Manobra (Proa)
  - Propulsor ASD BB / Propulsor ASD BE
  - Compressor de Ar 01 / Compressor de Ar 02
- Cards exibem status crítico/alerta com descrição da ocorrência

### Logística de Combustível

- Capacidade por rebocador: **60.000 L**
- Ponto de pedido de abastecimento: **≤ 30.000 L** (alerta visual laranja)
- Barra de nível individual por rebocador em cada card

### Localização no Mapa

- Badge com abreviação (`IB` / `LC` / `HL` / `AR` / `CH` / `AT`) em cada card de frota
- Clique no badge → iframe do MarineTraffic muda para `zoom:17/mmsi:{MMSI}`, centralizando o rebocador no próprio mapa do app
- Header do mapa indica o MMSI rastreado
- Botão **← Frota** reseta para a visão geral da Base Brasco Caju
- Badge fica destacado enquanto o rebocador está selecionado

### Escala de Manobras SAA

- Scraping em tempo real de [praticagem-rj.com.br](https://www.praticagem-rj.com.br)
- Filtra apenas manobras da **Baía de Guanabara** com `EMP.RB = SAA`
- Exibe: data + POB, prontidão (POB − 30 min), tipo (E/S/M), local, nº de rebocadores
- Cálculo de RBs por LOA: `< 150 m = 1 RB`, `150–250 m = 2 RB`, `250–300 m = 3 RB`, `≥ 300 m = 4 RB`
- Auto-refresh a cada **5 minutos**

### Agente Grok

- Powered by **xAI Grok** (`grok-4-1-fast-non-reasoning`)
- Papéis: `[MANUTENÇÃO]` `[LOGÍSTICA]` `[ALMOXARIFE]`
- Contexto da frota: equipamentos, horas de manutenção, combustível e escala SAA
- Botões **Copiar** (formata `[Supervisor] / [Agente]`) e **Limpar** conversa

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS (paleta `naval`) |
| Mapa | MarineTraffic embed (localização por MMSI) |
| Web Scraping | `node-html-parser` |
| IA | xAI Grok API |
| Deploy | Netlify + `@netlify/plugin-nextjs` |

---

## API Routes

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/fleet` | GET | Status da frota, equipamentos e combustível por rebocador |
| `/api/schedule` | GET | Escala SAA em tempo real — scraping Praticagem RJ |
| `/api/grok` | POST | Chat com o agente de manutenção e logística |

---

## Configuração

### Variáveis de Ambiente

```env
XAI_API_KEY=   # xAI — agente Grok
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

Automático via Netlify a cada push na branch `main`.  
Requer `@netlify/plugin-nextjs` no `netlify.toml`.

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── fleet/        # Dados da frota, equipamentos e combustível
│   │   ├── grok/         # Agente xAI — Manutenção e Logística
│   │   └── schedule/     # Scraping Praticagem RJ — Escala SAA
│   └── dashboard/        # Interface CCM Operacional
├── components/tuglife/
│   ├── FleetMap.tsx      # Mapa MarineTraffic com foco por MMSI
│   ├── EquipCard.tsx     # Card de equipamento com status
│   └── SplashScreen.tsx  # Tela de carregamento
├── config/fleet.ts        # MMSIs, abreviações, geofence BRASCO
└── types/fleet.ts         # Interfaces TypeScript
```

---

## Geofence Base Brasco Caju

Polígono real baseado em shapefile WKT oficial (lat/lon):

```
[-22.8702826, -43.2151462]
[-22.871884,  -43.2132579]
[-22.8698674, -43.2112838]
[-22.8683253, -43.213215 ]
```

---

## Licença

Software proprietário — todos os direitos reservados.  
© 2026 Jossian Brito. Reprodução, cópia ou uso não autorizados são proibidos.  
Veja [LICENSE](LICENSE) para os termos completos.
