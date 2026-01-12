import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { Logo } from './Logo';

interface LandingProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onCreateRoom, onJoinRoom }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto p-6 gap-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2 mb-8">
        <div className="bg-brand-card/50 p-6 rounded-full inline-block mb-4 shadow-glow border border-brand-accent/20">
          <Logo className="w-20 h-20" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Touch<span className="text-brand-accent">Mouse</span>
        </h1>
        <p className="text-gray-400 text-lg">Controla tu computadora a distancia</p>
      </div>

      <div className="w-full space-y-4">
        <button
          onClick={onCreateRoom}
          className="group relative w-full p-6 bg-brand-card hover:bg-brand-card/80 border border-brand-accent/30 rounded-3xl transition-all duration-200 active:scale-95 text-left flex items-center justify-between overflow-hidden"
        >
          <div className="z-10 flex items-center gap-4">
            <div className="bg-brand-accent p-3 rounded-2xl text-black">
              <Smartphone size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Buscar Dispositivos</h3>
              <p className="text-sm text-gray-400">Usar este celular como mouse</p>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button
          onClick={onJoinRoom}
          className="group w-full p-6 bg-[#1a1a1a] hover:bg-brand-card/50 border border-white/10 hover:border-white/20 rounded-3xl transition-all duration-200 active:scale-95 text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
             <div className="bg-gray-700 p-3 rounded-2xl text-white">
              <Monitor size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Modo Pantalla</h3>
              <p className="text-sm text-gray-400">Hacer visible este dispositivo</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};