import React from 'react';
import { Smartphone, Monitor, Wifi, Globe, ArrowRight, MousePointer2, Download, Info } from 'lucide-react';
import { Logo } from './Logo.tsx';

interface LandingProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onDownloadExtension: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onCreateRoom, onJoinRoom, onDownloadExtension }) => {
  return (
    <div className="flex flex-col items-center justify-start min-h-[90vh] w-full max-w-md mx-auto p-6 gap-6 animate-in fade-in duration-500 overflow-y-auto safe-area-inset-bottom">
      
      {/* Header Compacto */}
      <div className="flex items-center gap-4 w-full pt-4 pb-2">
        <div className="bg-brand-card/50 p-3 rounded-2xl shadow-glow border border-brand-accent/20">
          <Logo className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-none">
            Touch<span className="text-brand-accent">Mouse</span>
          </h1>
          <p className="text-gray-400 text-xs">Control Remoto</p>
        </div>
      </div>

      {/* STEP 1: DOWNLOAD ACTION (PRIMARY - AT THE TOP) */}
      <div className="w-full space-y-2 animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Paso 1: Instalación</span>
            <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Para PC</span>
        </div>
        <button 
          onClick={onDownloadExtension}
          className="w-full bg-gradient-to-r from-brand-accent to-orange-600 hover:to-orange-500 text-white rounded-2xl py-4 px-5 flex items-center justify-between shadow-lg shadow-orange-900/20 transition-all active:scale-95 group relative overflow-hidden border border-orange-500/20"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl text-white shadow-sm">
              <Download size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg leading-tight text-white">Descargar Bridge</h3>
              <p className="text-orange-100 text-xs font-medium opacity-90">Script de conexión para tu PC</p>
            </div>
          </div>
          
          <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
             <ArrowRight size={20} className="text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* VISUALIZATION CARD (INFO) */}
      <div className="w-full bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden animate-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="bg-[#252525] px-4 py-2 flex items-center gap-2 border-b border-white/5">
            <Info size={14} className="text-gray-500" />
            <span className="text-[10px] text-gray-400 font-mono">Funcionamiento</span>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between relative opacity-70 mb-3">
               <Smartphone size={16} className="text-gray-400" />
               <div className="flex-1 h-[1px] bg-gray-700 mx-2"></div>
               <Wifi size={16} className="text-brand-accent" />
               <div className="flex-1 h-[1px] bg-gray-700 mx-2"></div>
               <Monitor size={16} className="text-gray-400" />
            </div>
            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                Tu celular envía señales WiFi al <strong>Bridge</strong> en tu PC para mover el mouse.
            </p>
          </div>
      </div>

      {/* STEP 2: CONNECTION MODES */}
      <div className="w-full space-y-3 animate-in slide-in-from-bottom-8 duration-700 delay-200">
        <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest pl-2 mb-1">
          Paso 2: Conectar
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={onCreateRoom}
            className="group relative w-full p-4 bg-brand-card hover:bg-[#353535] border border-brand-accent/20 hover:border-brand-accent/40 rounded-2xl transition-all duration-200 active:scale-95 text-left flex items-center gap-4 overflow-hidden shadow-md"
          >
            <div className="bg-[#252525] p-3 rounded-xl text-gray-200 group-hover:text-white transition-colors border border-white/5">
              <Smartphone size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">Control Remoto</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Escanear y controlar PC</p>
            </div>
          </button>

          <button
            onClick={onJoinRoom}
            className="group w-full p-4 bg-transparent hover:bg-brand-card/30 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-200 active:scale-95 text-left flex items-center gap-4"
          >
             <div className="bg-[#1a1a1a] p-3 rounded-xl text-gray-500 group-hover:text-gray-300 transition-colors">
              <Monitor size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-400 group-hover:text-white text-sm transition-colors">Modo Pantalla</h3>
              <p className="text-[10px] text-gray-600 mt-0.5">Recibir señales en este equipo</p>
            </div>
          </button>
        </div>
      </div>
      
    </div>
  );
};