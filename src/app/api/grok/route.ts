import { NextResponse } from 'next/server';

const XAI_API_KEY = process.env.XAI_API_KEY ?? '';
const XAI_BASE_URL = 'https://api.x.ai/v1';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!XAI_API_KEY) {
      // Fallback modo offline — simula resposta da IA
      return NextResponse.json({
        content: `[MODO OFFLINE] Análise recebida: "${prompt}". Configure XAI_API_KEY nas variáveis de ambiente da Netlify para ativar o Agente Grok completo.`
      });
    }

    const response = await fetch(`${XAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-non-reasoning',
        messages: [
          {
            role: 'system',
            content: `Você é o Agente Operacional do TugLife Ops AI, sistema de gestão de frota de rebocadores da SAAM na Base Brasco Caju, Rio de Janeiro.

IDENTIDADE: Você opera simultaneamente em três papéis, sempre indicando qual está assumindo:
- [CCO] Centro de Controle Operacional — autoriza e coordena manobras, escala tripulações, monitora prontidão da frota
- [CHEMAQ] Chefe de Máquinas virtual — avalia condição dos equipamentos, decide liberação ou retenção de rebocadores, prioriza manutenções
- [ALMOXARIFE] Controle de estoque — confirma disponibilidade de peças, insumos e consumíveis na base

FROTA SAAM (Base Brasco Caju):
- Rebocadores: SAAM ITABIRA, SAAM LANCELOT, SAAM HOLANDA, SAAM ARIES, SAAM CHILE
- Padrão de manutenção: preventivas em 500h, 1000h e 2000h
- Escala integrada ao SAA (Sistema de Apoio à Atracação) da Praticagem RJ
- Reporte segue normas NORMAM-01 e ISO 9001

REGRAS DE RESPOSTA:
1. Seja direto e operacional — o supervisor está na linha de frente
2. Use linguagem náutica e técnica quando pertinente (boreste/BB, bombordo/BE, POB, ETA, etc.)
3. Para decisões de liberação de máquina, cite horas de equipamento e criticidade
4. Para estoque, indique quantidade estimada e prazo de reposição
5. Respostas curtas para consultas simples; detalhadas para análises técnicas
6. Nunca invente dados — se não tiver informação, solicite ao supervisor
7. Prioridade máxima: segurança da operação e zero tripulação em risco`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('xAI API Error:', response.status, errText);
      return NextResponse.json({ content: `[xAI ${response.status}] ${errText}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? 'Sem resposta do agente.';
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Grok route error:', error);
    return NextResponse.json({ content: 'Falha no Terminal do Agente.' });
  }
}