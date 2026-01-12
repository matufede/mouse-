import React from 'react';
import { Monitor, RefreshCw, Wifi, ChevronLeft } from 'lucide-react';
import { DeviceInfo } from '../types.ts';

interface DeviceScannerProps {
  devices: DeviceInfo[];
  onConnect: (device: DeviceInfo) => void;
  onCancel: () => void;
}

export const DeviceScanner: React.FC<DeviceScannerProps> = ({ devices, onConnect, onCancel }) => {
  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white p-6 safe-area-inset-bottom">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onCancel}
          className="p-3 rounded-full bg-brand-card hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Buscar Dispositivos</h1>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Radar Animation */}
        <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-brand-accent/30 rounded-full animate-[ping_2s_ease-in-out_infinite]" />
          <div className="absolute inset-4 border-2 border-brand-accent/50 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s]" />
          <div className="bg-brand-card p-4 rounded-full z-10 shadow-glow border border-brand-accent/50">
            <Wifi size={40} className="text-brand-accent" />
          </div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-between items-center px-2 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dispositivos en la red</span>
            <RefreshCw size={14} className="text-gray-500 animate-spin opacity-50" />
          </div>

          {devices.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-gray-800 rounded-3xl bg-brand-card/20">
              <p className="text-gray-500 mb-2">Buscando pantallas...</p>
              <p className="text-xs text-gray-600">Asegúrate que el otro dispositivo tenga abierta la web en "Modo Pantalla".</p>
            </div>
          ) : (
            devices.map((device) => (
              <button
                key={device.id}
                onClick={() => onConnect(device)}
                className="w-full bg-brand-card hover:bg-brand-card/80 border border-brand-accent/20 p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-95 group shadow-lg"
              >
                <div className="bg-[#1a1a1a] p-3 rounded-xl text-brand-accent group-hover:text-white transition-colors">
                  <Monitor size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg text-white">{device.name}</h3>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Disponible
                  </p>
                </div>
                <div className="bg-brand-accent text-brand-dark font-bold text-xs px-3 py-1.5 rounded-full">
                  CONECTAR
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};