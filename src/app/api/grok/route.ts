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
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `Você é o Agente CCO do TugLife Ops AI. Atua simultaneamente como: Supervisor de Manutenção, Almoxarife e Chemaq da frota SAAM de rebocadores na Base Brasco Caju, Rio de Janeiro. Responda sempre de forma profissional, direta e operacional. Quando simular papéis (Chemaq/Almoxarife), indique qual papel está assumindo. Fase atual: TESTES operacionais.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 400,
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