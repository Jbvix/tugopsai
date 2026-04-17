# Spec: Integração AIS — Status

> **OBSOLETO** — A integração via AISStream foi descontinuada.  
> O AISStream não possui cobertura para a Baía de Guanabara.

## Solução Adotada

Substituída por **MarineTraffic embed** com localização individual por MMSI:

- Visão geral da frota: `zoom:15/centery:-22.8703/centerx:-43.2132`
- Foco por rebocador: `zoom:17/mmsi:{MMSI}/get_info:false`

Localização ativada por botões de abreviação nos cards de frota (`IB`, `LC`, `HL`, `AR`, `CH`, `AT`).

## Limitação Conhecida

A Baía de Guanabara não possui receptores AIS terrestres indexados pelo AISStream.  
O MarineTraffic utiliza rede própria de receptores + satélite, cobrindo a área adequadamente.  
O badge de status (Na Base / Fora da Base / Sem Sinal) permanece como "Sem Sinal" até que uma fonte AIS com cobertura local seja integrada.

## Alternativa Futura para Geofence Automático

| Serviço | Custo | Cobertura |
|---------|-------|-----------|
| AISHub (`aishub.net`) | Gratuito (registro) | Global |
| MarineTraffic API | 100 calls/mês grátis | Global |
