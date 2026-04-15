'use client';
import { TwinEngineCard } from '@/components/tuglife/TwinEngineCard';
import { InsightIA } from '@/types';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [insight, setInsight] = useState<string>("Analisando frota...");

  // Exemplo de chamada para a IA ao carregar
  useEffect(() => {
    fetch('/api/grok', { 
      method: 'POST', 
      body: JSON.stringify({ prompt: "Gere o relatório de eficácia matinal." }) 
    })
    .then(res => res.json())
    .then(data => setInsight(data.content));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4 space-y-4 max-w-md mx-auto">
      <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-xl">
        <h2 className="text-blue-200 text-xs font-bold uppercase tracking-widest">IA Insight</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed">{insight}</p>
      </div>

      <TwinEngineCard 
        mcp1={{ id: '1', nome: 'BE', horimetro: 1420, limitePreventiva: 1500, status: 'alerta', sistema: 'Propulsão' }}
        mcp2={{ id: '2', nome: 'BB', horimetro: 1410, limitePreventiva: 1500, status: 'operacional', sistema: 'Propulsão' }}
      />
      
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase">Estoque Crítico</h3>
        <p className="text-red-500 font-bold mt-1">Óleo SAE 40: Abaixo do ponto de pedido (1.200L)</p>
      </div>
    </main>
  );
}