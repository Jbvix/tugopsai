# Plano: Integração AIS — Encerrado

> **ENCERRADO** — Implementação via AISStream descontinuada.

## Resultado

A integração com AISStream WebSocket foi implementada e testada mas descontinuada por falta de cobertura de receptores terrestres na Baía de Guanabara.

## O que foi implementado e mantido

- `/api/ais` — rota mantida como legado (não exposta no dashboard)
- `config/fleet.ts` — MMSIs, geofence BRASCO, abreviações da frota
- `types/ais.ts` — interfaces `AISPosition` e `NAV_STATUS`

## Solução em produção

Localização dos rebocadores via MarineTraffic embed com foco por MMSI (`zoom:17/mmsi:{MMSI}`), acionada por botões de abreviação nos cards do dashboard.

Veja spec atualizada em `docs/superpowers/specs/2026-04-17-aisstream-integration-design.md`.
