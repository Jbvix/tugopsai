import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // Procura as abas de Equipamentos e WOs simultaneamente
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: ['EQUIPAMENTOS!A2:E8', 'WORK_ORDERS!A2:F10'],
    });

    const [equipamentos, wos] = response.data.valueRanges || [];

    return NextResponse.json({
      lastUpdate: new Date().toISOString(),
      equipamentos: equipamentos.values,
      workOrders: wos.values,
    });
  } catch (error) {
    console.error('Erro na sincronização com Sheets:', error);
    return NextResponse.json({ error: 'Falha ao ler planilhas' }, { status: 500 });
  }
}