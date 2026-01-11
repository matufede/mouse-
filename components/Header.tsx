import React from 'react';
import { LogOut, Crosshair, Navigation } from 'lucide-react';
import { ControlButton } from './ControlButton';
import { SensitivityMode } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  roomId: string;
  onExit: () => void;
  sensitivity: SensitivityMode;
  onToggleSensitivity: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  onExit,
  sensitivity,
  onToggleSensitivity
}) => {
  const isPrecision = sensitivity === SensitivityMode.PRECISION;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 pb-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight leading-none">
            <span className="text-white">Touch</span>
            <span className="text-brand-accent">Mouse</span>
          </h1>
        </div>
        <button 
          onClick={onExit}
          className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          aria-label="Salir"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex justify-between items-center gap-4">
        {/* Room Info */}
        <div className="flex-1 h-20 bg-brand-card rounded-3xl border border-brand-accent/30 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-accent/5" />
          <span className="text-xs text-brand-accent uppercase font-bold tracking-widest mb-1">Sala ID</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-mono text-white font-bold tracking-wider">{roomId}</span>
          </div>
        </div>

        {/* Sensitivity Toggle Button */}
        <ControlButton
          onClick={onToggleSensitivity}
          label={isPrecision ? "Modo Precisión" : "Modo Navegación"}
          variant="action"
          className="w-24 h-20"
          isActive={true} 
          icon={
            <div className="flex flex-col items-center justify-center">
              {isPrecision ? (
                 <Crosshair size={24} className="mb-1" />
              ) : (
                 <Navigation size={24} className="mb-1" />
              )}
              <span className="text-[10px] uppercase font-bold tracking-tighter">
                {isPrecision ? "Precisión" : "Navegar"}
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};