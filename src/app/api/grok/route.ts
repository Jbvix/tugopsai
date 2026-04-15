import { NextResponse } from 'next/server';
import { grokClient } from '@/lib/grok-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await grokClient.post('/chat/completions', {
      model: "grok-beta",
      messages: [
        { role: "system", content: "Você é um Engenheiro Chefe IA especialista em rebocadores ASD." },
        { role: "user", content: body.prompt }
      ],
      temperature: 0.2
    });

    return NextResponse.json(response.data.choices[0].message);
  } catch (error) {
    return NextResponse.json({ error: 'Erro na API Grok' }, { status: 500 });
  }
}