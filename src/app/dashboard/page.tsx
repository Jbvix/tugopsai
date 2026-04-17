'use client';

export const dynamic = 'force-dynamic';

import dynamicImport from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import {
  Anchor, TrendingUp, Clock, Send, Bot, Gauge, MapPin
} from 'lucide-react';
import { FleetData, ManobraSAA } from '@/types/fleet';
import { useAISData } from '@/hooks/useAISData';
import { EquipCard } from '@/components/tuglife/EquipCard';
import { SplashScreen } from '@/components/tuglife/SplashScreen';
import type { AISPosition } from '@/types/ais';

const FleetMap = dynamicImport(
  () => import('@/components/tuglife/FleetMap').then((module) => module.FleetMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-white/[0.03]" />,
  },
);

function StatBadge({ count, color, label }: { count: number; color: string; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${color}`}>
      <span className="text-xs font-black">{count}</span>
      <span className="text-[10px] font-medium hidden sm:inline">{label}</span>
    </div>
  );
}

function formatRelativeAge(value: Date | string | null): string {
  if (!value) {
    return 'Sem atualização';
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  const parsedTime = parsedDate.getTime();

  if (Number.isNaN(parsedTime)) {
    return 'Sem atualização';
  }

  const diffMs = Math.max(0, Date.now() - parsedTime);
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `há ${Math.max(diffSeconds, 1)}s`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `há ${diffMinutes}min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  return `há ${diffHours}h`;
}


function TugAISLine({ position }: { position?: AISPosition }) {
  if (!position) return null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-5 text-[10px] text-slate-400">
      <span className="inline-flex items-center gap-1">
        <Gauge size={10} />
        {position.sog.toFixed(1)} kn
      </span>
      <span className="inline-flex items-center gap-1">
        <MapPin size={10} />
        {position.lat.toFixed(3)}, {position.lon.toFixed(3)}
      </span>
      <span className="inline-flex items-center gap-1">
        <Anchor size={10} />
        {position.navStatus}
      </span>
      <span>{formatRelativeAge(position.updatedAt)}</span>
    </div>
  );
}

export default function Dashboard() {
  const [fleetData, setFleetData] = useState<FleetData | null>(null);
  const [schedule, setSchedule]   = useState<ManobraSAA[]>([]);
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'agent', text: string}[]>([{
    role: 'agent',
    text: 'Olá, Chemaq/Almoxarife virtual online. Posso confirmar status de peças e liberação de máquinas. O que precisa?'
  }]);
  const [chatInput, setChatInput]     = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [errorData, setErrorData]           = useState(false);
  const [simulatedInitialDelay, setSimulatedInitialDelay] = useState(true);
  const [scheduleUpdatedAt, setScheduleUpdatedAt] = useState<Date | null>(null);
  const { positions: aisPositions } = useAISData();

  const fetchSchedule = () => {
    fetch('/api/schedule')
      .then(r => r.json())
      .then((sch: ManobraSAA[]) => {
        setSchedule(sch);
        setScheduleUpdatedAt(new Date());
      })
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/fleet').then(r => r.json()),
      fetch('/api/schedule').then(r => r.json())
    ])
      .then(([fleet, sch]) => {
        setFleetData(fleet);
        setSchedule(sch);
        setScheduleUpdatedAt(new Date());
      })
      .catch(() => setErrorData(true))
      .finally(() => setLoadingInitial(false));

    const scheduleInterval = setInterval(fetchSchedule, 5 * 60 * 1000);
    const timer = setTimeout(() => setSimulatedInitialDelay(false), 5500);
    return () => {
      clearTimeout(timer);
      clearInterval(scheduleInterval);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);
    try {
      const res = await fetch('/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Contexto do Sistema (Simulador Fase Teste): Você atua como Agente de CCO, Almoxarife e Chemaq de frota simultaneamente. Frota SAAM: ${fleetData?.resumo.emManutencao ?? 0} em manutenção, ${fleetData?.resumo.disponiveis ?? 0} livres. Escala: ${schedule.length} manobras agendadas. Mensagem do Supervisor: "${userMessage}"`
        }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'agent', text: data.content ?? 'Erro de conexão MESH.' }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'agent', text: 'Desculpe, sinal da ponte caiu. Tente novamente.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loadingInitial || simulatedInitialDelay) {
    return <SplashScreen />;
  }

  const emManutencao = fleetData?.rebocadores.filter(r => r.status === 'Em_Manutencao') ?? [];
  const disponiveis  = fleetData?.rebocadores.filter(r => r.status === 'Disponivel') ?? [];
  const aisByTugName = new Map(aisPositions.map((position) => [position.nome, position]));

  return (
    <div className="min-h-screen bg-naval-900 text-white">
      <header className="sticky top-0 z-50 bg-naval-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-blue-500/20 rounded-xl border border-blue-500/20 shrink-0">
              <Anchor size={17} className="text-blue-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black tracking-tight leading-none">CCO Operacional — Rio de Janeiro</h1>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {fleetData ? `Base Brasco Caju · ${fleetData.resumo.totalRebocadores} Rebocadores` : 'Carregando frota...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {fleetData ? (
              <>
                {fleetData.resumo.emManutencao > 0 && <StatBadge count={fleetData.resumo.emManutencao} color="bg-red-500/15 text-red-400 border-red-500/30" label="Retido" />}
                {fleetData.resumo.disponiveis > 0 && <StatBadge count={fleetData.resumo.disponiveis} color="bg-green-500/15 text-green-400 border-green-500/30" label="Livre" />}
              </>
            ) : <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border border-white/5 bg-[#061321] shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Mapa AIS da Frota</h2>
              <p className="mt-1 text-[10px] text-slate-400">
                Base Brasco Caju · Baía de Guanabara
              </p>
            </div>
          </div>
          <div className="h-80 lg:h-96">
            <FleetMap />
          </div>
        </section>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUNA ESQUERDA: FROTA */}
        <div className="lg:col-span-5 space-y-6">
          {errorData ? (
            <div className="text-center py-12 text-slate-500">Falha ao carregar dados da frota.</div>
          ) : (
            <>
              {emManutencao.length > 0 && (
                <section className="space-y-3 bg-red-950/10 border border-red-500/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-red-400">Frota Impedida (Manutenção)</h2>
                    <span className="ml-auto text-xs font-bold bg-white/5 text-slate-400 px-2 rounded-full">{emManutencao.length}</span>
                  </div>
                  {emManutencao.map(reb => (
                    <div key={reb.id} className="pt-2 border-t border-white/5">
                      <h3 className="font-bold text-slate-200 mb-2 flex flex-col gap-1">
                        <div className="flex items-center gap-2"><Anchor size={14} className="text-red-400"/> {reb.nome}</div>
                        <span className="text-[10px] text-red-300/60 font-normal pl-5 leading-tight">{reb.motivoIndisponibilidade}</span>
                      </h3>
                      <TugAISLine position={aisByTugName.get(reb.nome)} />
                      <div className="grid grid-cols-1 gap-2">
                        {reb.equipamentos.filter(e => e.status !== 'operacional').map(eq => <EquipCard key={eq.id} eq={eq} />)}
                      </div>
                    </div>
                  ))}
                </section>
              )}
              {disponiveis.length > 0 && (
                <section className="space-y-3 bg-green-950/10 border border-green-500/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-green-400">Frota Livre (Ops)</h2>
                    <span className="ml-auto text-xs font-bold bg-white/5 text-slate-400 px-2 rounded-full">{disponiveis.length}</span>
                  </div>
                  {disponiveis.map(reb => (
                    <div key={reb.id} className="pt-2 border-t border-white/5">
                      <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2"><Anchor size={14} className="text-green-400"/> {reb.nome}</h3>
                      <TugAISLine position={aisByTugName.get(reb.nome)} />
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
          {fleetData && fleetData.resumo.custoTotalPrevisto > 0 && (
            <div className="flex items-center gap-3 bg-red-950/30 border border-red-500/20 rounded-2xl px-4 py-3">
              <TrendingUp size={16} className="text-red-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Previsão Custos Críticos</p>
                <p className="text-base font-black text-red-400">R$ {fleetData.resumo.custoTotalPrevisto.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: ESCALA + CHAT */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* ESCALA SAA */}
          <section className="flex-shrink-0 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
            <header className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">Escala de Manobras SAA</h2>
              <div className="ml-auto flex items-center gap-2">
                {scheduleUpdatedAt && (
                  <span className="text-[10px] text-slate-500">
                    {formatRelativeAge(scheduleUpdatedAt)}
                  </span>
                )}
                <span className="text-[10px] text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2 rounded-full">Praticagem RJ</span>
              </div>
            </header>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-white/[0.02] text-slate-400">
                    <th className="px-4 py-2 font-medium">Navio</th>
                    <th className="px-4 py-2 font-medium">Ops</th>
                    <th className="px-4 py-2 font-medium">POB</th>
                    <th className="px-4 py-2 font-medium bg-amber-500/5 text-amber-300">Prontidão</th>
                    <th className="px-4 py-2 font-medium">Local</th>
                    <th className="px-4 py-2 font-medium">RBs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {schedule.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500 italic">Nenhuma manobra SAA programada.</td></tr>
                  ) : (
                    schedule.map((manobra, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.01]">
                        <td className="px-4 py-3 font-bold text-white">{manobra.navio}</td>
                        <td className="px-4 py-3 font-medium text-slate-400">{manobra.tipo}</td>
                        <td className="px-4 py-3">{manobra.pob}</td>
                        <td className="px-4 py-3 font-bold text-amber-400 bg-amber-500/5">
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {manobra.horaProntidao}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 max-w-[150px] truncate">{manobra.destino || manobra.origem}</td>
                        <td className="px-4 py-3 text-center"><span className="bg-white/10 px-2 py-0.5 rounded-full">{manobra.rebocadoresNecessarios}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* CHAT GROK */}
          <section className="flex-1 min-h-[400px] flex flex-col bg-gradient-to-br from-[#0a1f3a] to-[#0d1b2a] border border-blue-500/15 rounded-2xl overflow-hidden">
            <header className="px-4 py-3 border-b border-white/5 flex items-center gap-2 shrink-0 bg-black/20">
              <Bot size={16} className="text-blue-400" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Terminal Agente Grok</h2>
                <p className="text-[9px] text-blue-400/60 uppercase">Simulação Chemaq + Almoxarifado + Ops</p>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-sm font-light'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:100ms]" />
                    <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:200ms]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 shrink-0 bg-black/20 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ex: Qual rebocador posso atrasar a preventiva para cobrir às 18h?"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
