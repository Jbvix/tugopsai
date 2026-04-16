'use client';

type Equipamento = {
  id: string;
  nome: string;
  tipo: string;
  status: 'operacional' | 'alerta' | 'critico';
  horasAtual?: number;
  proximaTroca?: number;
  descricao?: string;
};

const statusConfig = {
  operacional: { dot: 'bg-green-500', badge: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'OK' },
  alerta:      { dot: 'bg-amber-500 animate-pulse', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Alerta' },
  critico:     { dot: 'bg-red-500 animate-pulse', badge: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Crítico' },
};

export function EquipCard({ eq }: { eq: Equipamento }) {
  const cfg = statusConfig[eq.status] ?? statusConfig.operacional;
  const pct = eq.horasAtual && eq.proximaTroca
    ? Math.min((eq.horasAtual / eq.proximaTroca) * 100, 100)
    : null;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{eq.tipo}</p>
          <p className="text-xs font-bold text-slate-200 truncate">{eq.nome}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {pct !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{eq.horasAtual}h</span>
            <span>Meta: {eq.proximaTroca}h</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {eq.descricao && (
        <p className="text-[10px] text-slate-500 leading-relaxed">{eq.descricao}</p>
      )}
    </div>
  );
}
