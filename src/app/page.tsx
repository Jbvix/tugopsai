import Link from 'next/link';
import { Anchor } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 text-white p-6">
      <div className="mb-8 p-4 bg-white/10 rounded-full">
        <Anchor size={48} className="text-blue-300" />
      </div>
      <h1 className="text-3xl font-black tracking-tight mb-2">TUGLIFE OPS</h1>
      <p className="text-blue-200 text-center mb-10 max-w-xs">
        Gestão Inteligente de Manutenção e Performance de Frota
      </p>
      
      <Link href="/dashboard" className="w-full max-w-xs bg-white text-blue-900 font-bold py-4 rounded-2xl text-center shadow-lg active:scale-95 transition-transform">
        Entrar no Sistema
      </Link>
      
      <footer className="mt-20 text-[10px] uppercase tracking-widest text-blue-400 font-bold">
        v1.0.0 • Charlie Bravo Engineering
      </footer>
    </div>
  );
}