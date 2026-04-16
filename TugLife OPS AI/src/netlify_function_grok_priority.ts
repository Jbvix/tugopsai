
import { Handler } from '@netlify/functions';
import axios from 'axios';

// Interfaces de Dados
interface Equipamento {
  id: string;
  nome: string;
  sistema: 'Energia' | 'Propulsao' | 'Conves';
  horimetro: number;
  limite: number;
  status: string;
  wo_critica: boolean;
}

export const handler: Handler = async (event, context) => {
  try {
    // 1. Simulação de captura de dados das planilhas (Sheets API)
    // Em produção, aqui você faria o fetch das abas de Estoque, WOs e Horímetros
    const frota: Equipamento[] = [
      { id: 'MCP_01', nome: 'MCP BE', sistema: 'Propulsao', horimetro: 1425, limite: 1500, status: 'OK', wo_critica: false },
      { id: 'DG_02', nome: 'Gerador 02', sistema: 'Energia', horimetro: 491, limite: 500, status: 'Alerta', wo_critica: true }
    ];

    const estoque = { oleo_lube: 2000, placa_avr: 1, filtros_mcp: 8 };

    // 2. Construção do Prompt Estratégico para o xAI Grok
    const systemPrompt = `Você é o Estrategista de Manutenção TugLife. 
    Analise os dados técnicos de 02 MCPs, 02 DGs, 02 Propulsores e 01 Guincho.
    Sua prioridade é: 1. Segurança (Energia/Propulsão), 2. Evitar Off-hire duplo, 3. Custo de Estoque.
    Se um equipamento tem WO crítica e está perto da preventiva, sugira MANUTENÇÃO ÚNICA.`;

    const userPrompt = `Dados Atuais: ${JSON.stringify({ frota, estoque })}. 
    Calcule a Prioridade Resultante e sugira a melhor janela de manutenção.`;

    // 3. Chamada à API do xAI Grok
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2 // Baixa temperatura para respostas técnicas precisas
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response.data.choices[0].message.content)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha na análise estratégica' })
    };
  }
};
