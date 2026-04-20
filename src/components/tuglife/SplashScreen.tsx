'use client';

import { useState, useEffect } from 'react';
import { Anchor } from 'lucide-react';

const loadingSteps = [
  "Estabelecendo uplink naval...",
  "Sincronizando telemetria SAA...",
  "Lendo tábua de praticagem RJ-1...",
  "Calculando POB e janelas operacionais...",
  "Verificando inventário Brasco Caju...",
  "Despertando cluster de IA..."
];

export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.min(((step + 1) / loadingSteps.length) * 100, 100);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060d1a] overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Shapes rotativos */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          {/* Anel externo */}
          <div className="absolute inset-0 rounded-full border border-blue-500/20 border-t-blue-400/80 animate-spin" style={{ animationDuration: '4s' }} />
          {/* Hexágono inverso */}
          <div
            className="absolute inset-2 border border-cyan-400/30 animate-spin"
            style={{
              animationDuration: '3s',
              animationDirection: 'reverse',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}
          />
          {/* Quadrado 3D A */}
          <div
            className="absolute inset-4 border border-amber-500/20 animate-spin"
            style={{ animationDuration: '2s', animationTimingFunction: 'ease-in-out', transform: 'rotateX(45deg) rotateY(45deg)' }}
          />
          {/* Quadrado 3D B */}
          <div
            className="absolute inset-4 border border-emerald-500/20 animate-spin"
            style={{ animationDuration: '2.5s', animationTimingFunction: 'ease-in-out', animationDirection: 'reverse', transform: 'rotateX(45deg) rotateY(45deg)' }}
          />
          {/* Logo central */}
          <div className="relative bg-[#060d1a] border border-white/10 rounded-xl p-3 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Anchor size={28} className="text-blue-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-black text-white tracking-widest uppercase mb-2">
          TugLife Ops AI
        </h2>

        <div className="h-6 flex items-center justify-center overflow-hidden">
          <p
            key={step}
            className="text-xs text-blue-300 font-medium uppercase tracking-widest"
            style={{ animation: 'slideUp 0.3s ease-out forwards' }}
          >
            {loadingSteps[step]}
          </p>
        </div>

        <div className="w-48 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
