import { Equipamento } from '@/types';
import { Settings } from 'lucide-react';

export const TwinEngineCard = ({ mcp1, mcp2 }: { mcp1: Equipamento, mcp2: Equipamento }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 flex items-center gap-2">
        <Settings size={14}/> Propulsão Principal (MCPs)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {[mcp1, mcp2].map(mcp => (
          <div key={mcp.id} className="space-y-2">
            <span className="text-sm font-bold text-slate-700">{mcp.nome}</span>
            <div className="text-xl font-black">{mcp.horimetro}h</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${mcp.status === 'critico' ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${(mcp.horimetro/mcp.limitePreventiva)*100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};