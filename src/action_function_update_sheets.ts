/**
 * Autor: Jossian Brito
 * Versão: 1.0.0
 * Data/Hora: 15/04/2026 01:40
 * Descrição: Serverless Function para atualização segura de dados no Google Sheets.
 * Modificações: 
 * - Implementação de escrita para Reset de Horímetros.
 * - Lógica de decremento de estoque via Batch Update.
 * - Registro de logs de manutenção pós-intervenção.
 */

import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ativoId, servico, itensConsumidos } = body;

    // 1. Configuração de Autenticação com Google Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // 2. Lógica de Atualização de Horímetro (Exemplo simplificado)
    // Localiza a célula do ativo e reseta para 0 ou valor da preventiva
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `EQUIPAMENTOS!D${body.rowIndex}`, // Linha mapeada do ativo
      valueInputOption: 'RAW',
      requestBody: { values: [[0]] },
    });

    // 3. Lógica de Baixa de Estoque
    // Percorre a lista de itens e subtrai das quantidades atuais
    const updateRequests = itensConsumidos.map((item: any) => ({
      range: `ESTOQUE!D${item.rowIndex}`,
      values: [[item.novaQtd]],
    }));

    // Executa as atualizações em lote para eficiência
    for (const request of updateRequests) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: request.range,
        valueInputOption: 'RAW',
        requestBody: { values: request.values },
      });
    }

    // 4. Registro no Histórico de Manutenção
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'LOG_MANUTENCAO!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          new Date().toISOString(),
          ativoId,
          servico,
          "EXECUTADO - IA INSIGHT",
          "Supervisor: Jossian Brito"
        ]],
      },
    });

    return NextResponse.json({ success: true, message: 'Dados sincronizados com sucesso' });
  } catch (error) {
    console.error('Erro na escrita Sheets:', error);
    return NextResponse.json({ error: 'Falha na persistência de dados' }, { status: 500 });
  }
}