import React from 'react';
import { LogOut, QrCode } from 'lucide-react';
import { ControlButton } from './ControlButton';
import { SpeedLevel } from '../types';

interface HeaderProps {
  roomId: string;
  onExit: () => void;
  speed: SpeedLevel;
  onToggleSpeed: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  onExit,
  speed,
  onToggleSpeed
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 pb-2">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-white">Touch</span>
          <span className="text-brand-accent">Mouse</span>
        </h1>
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
            <QrCode size={18} className="text-brand-accent/70" />
          </div>
        </div>

        {/* Speed Toggle Button */}
        <ControlButton
          onClick={onToggleSpeed}
          label="Toggle Speed"
          variant="action"
          className="w-20 h-20"
          icon={
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                 <span className="text-gray-400 mr-1">=</span>
                 <span className="text-brand-accent text-2xl font-bold">X{speed}</span>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};