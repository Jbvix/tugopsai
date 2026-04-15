import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Droplet, Zap, Anchor, Settings } from 'lucide-react';

const DashboardManutencao = () => {
  // Simulação de processamento dos blocos CSV pela IA
  const [equipamentos] = useState([
    { id: 'MCP_01', nome: 'MCP BE', horas: 1425, limite: 1500, status: 'Alerta', sistema: 'Propulsão' },
    { id: 'MCP_02', nome: 'MCP BB', horas: 1410, limite: 1500, status: 'Operacional', sistema: 'Propulsão' },
    { id: 'DG_01', nome: 'Gerador 01', horas: 482, limite: 500, status: 'Operacional', sistema: 'Energia' },
    { id: 'DG_02', nome: 'Gerador 02', horas: 491, limite: 500, status: 'Crítico', sistema: 'Energia', wo: 'WO_002: Oscilação de Tensão' },
    { id: 'PROP_01', nome: 'Propulsor BE', horas: 3200, limite: 4000, status: 'Operacional', sistema: 'Propulsão' },
    { id: 'PROP_02', nome: 'Propulsor BB', horas: 3850, limite: 4000, status: 'Crítico', sistema: 'Propulsão', wo: 'WO_004: Alta Temperatura' },
    { id: 'GUIN_01', nome: 'Guincho', horas: 1200, limite: 2000, status: 'Operacional', sistema: 'Convés' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Crítico': return 'text-red-600 border-red-200 bg-red-50';
      case 'Alerta': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      default: return 'text-green-600 border-green-200 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      {/* Header Fixo Mobile */}
      <header className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">TugLife Ops</h1>
          <p className="text-xs text-slate-500">Status da Frota: 2 MCPs | 2 DGs | 2 Azimutais</p>
        </div>
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Anchor size={20} />
        </div>
      </header>

      {/* Grid Responsivo: 1 col mobile, 2 tablet, 3 desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card de Insight da IA (Grok) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-blue-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="flex items-center gap-2 font-semibold text-blue-200 mb-2">
              <Zap size={18} /> Insight Estratégico xAI Grok
            </h3>
            <p className="text-sm leading-relaxed">
              O <strong>DG_02</strong> atingirá 500h em 9h de operação e possui uma WO crítica de tensão. 
              Sugestão: Realizar intervenção única imediata para evitar duplo Off-hire.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Settings size={80} />
          </div>
        </div>

        {/* Mapeamento dos Equipamentos Corrigidos */}
        {equipamentos.map((eq) => (
          <div key={eq.id} className={`p-4 rounded-2xl border-2 transition-all ${getStatusColor(eq.status)}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">{eq.sistema}</span>
                <h2 className="text-lg font-bold text-slate-800">{eq.nome}</h2>
              </div>
              {eq.status === 'Operacional' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">Uso: {eq.horas}h</span>
                <span className="text-slate-400">Meta: {eq.limite}h</span>
              </div>
              {/* Barra de Progresso Progressiva */}
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${eq.status === 'Crítico' ? 'bg-red-500' : eq.status === 'Alerta' ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${(eq.horas / eq.limite) * 100}%` }}
                ></div>
              </div>
            </div>

            {eq.wo && (
              <div className="mt-4 p-2 bg-white/50 rounded-lg border border-current text-[11px] font-mono italic">
                {eq.wo}
              </div>
            )}
            
            <button className="w-full mt-4 py-2 bg-white rounded-lg text-xs font-bold shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50">
              Ver Detalhes e Insumos
            </button>
          </div>
        ))}

        {/* Card de Combustível (Diferenciado) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Droplet size={24} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Diesel Total</h2>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800">45.000L</div>
            <p className="text-xs text-slate-400 mb-4">Autonomia est. 12 dias de operação</p>
            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">
              Programar Reabastecimento
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardManutencao;