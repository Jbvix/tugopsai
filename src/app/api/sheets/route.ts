import { NextResponse } from 'next/server';

// Integração Google Sheets — pendente de configuração de credenciais
export async function GET() {
  return NextResponse.json(
    { message: 'Integração Google Sheets em configuração.' },
    { status: 200 }
  );
}