import { Droplet } from 'lucide-react';

export const FuelGauge = ({ level }: { level: number }) => {
  const isLow = level < 25;
  
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
      <div className="flex justify-between items-center mb-4">
        <div className={`p-2 rounded-xl ${isLow ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <Droplet size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Combustível</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-3xl font-black text-naval-800">{level}%</span>
          <span className="text-xs font-bold text-slate-400">Tanque Principal</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${isLow ? 'bg-action-danger pulse-danger' : 'bg-action-info'}`}
            style={{ width: `${level}%` }}
          />
        </div>
      </div>
    </div>
  );
};