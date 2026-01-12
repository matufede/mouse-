import React, { useState } from 'react';
import { Monitor, RefreshCw, Wifi, ChevronLeft, Globe, ArrowRight, Radar, Loader2 } from 'lucide-react';
import { DeviceInfo } from '../types.ts';

interface DeviceScannerProps {
  devices: DeviceInfo[];
  onConnect: (device: DeviceInfo) => void;
  onManualConnect: (ip: string) => void;
  onCancel: () => void;
  onScanWifi: () => void;
  isScanning: boolean;
  isConnecting: boolean;
}

export const DeviceScanner: React.FC<DeviceScannerProps> = ({ 
  devices, 
  onConnect, 
  onManualConnect, 
  onCancel,
  onScanWifi,
  isScanning,
  isConnecting
}) => {
  const [manualIp, setManualIp] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIp.trim().length > 0) {
      onManualConnect(manualIp);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white p-6 safe-area-inset-bottom overflow-y-auto relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            disabled={isConnecting}
            className="p-3 rounded-full bg-brand-card hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Conectar</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto gap-6">
        
        {/* Network Scan Button */}
        <button
          onClick={onScanWifi}
          disabled={isScanning || isConnecting}
          className={`w-full p-6 rounded-3xl border transition-all flex items-center justify-between group overflow-hidden relative ${isScanning ? 'bg-brand-accent text-brand-dark border-brand-accent' : 'bg-brand-card border-brand-accent/30 hover:border-brand-accent'}`}
        >
          {isScanning && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-2xl ${isScanning ? 'bg-black/20' : 'bg-brand-accent text-black'}`}>
              <Radar size={28} className={isScanning ? "animate-spin" : ""} />
            </div>
            <div className="text-left">
              <h3 className={`font-bold text-lg ${isScanning ? 'text-black' : 'text-white'}`}>
                {isScanning ? "Escaneando..." : "Escanear Red Wi-Fi"}
              </h3>
              <p className={`text-xs ${isScanning ? 'text-black/70' : 'text-gray-400'}`}>
                Buscar en 192.168.1.x
              </p>
            </div>
          </div>
          {!isScanning && <ArrowRight size={24} className="text-gray-500 group-hover:text-white transition-colors" />}
        </button>

        {/* Device List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dispositivos Encontrados</span>
            {isScanning && <RefreshCw size={14} className="text-brand-accent animate-spin" />}
          </div>

          {devices.length === 0 ? (
             <div className="text-center py-12 px-4 border border-dashed border-gray-800 rounded-3xl bg-brand-card/20 flex flex-col items-center">
               <div className="relative w-16 h-16 mb-4 opacity-50">
                 <div className="bg-brand-card p-4 rounded-full relative z-10">
                   <Wifi size={24} className="text-gray-500" />
                 </div>
               </div>
              <p className="text-gray-500 text-sm mb-1">Sin dispositivos</p>
              <p className="text-xs text-gray-600">Pulsa "Escanear" o asegúrate de que el servidor esté corriendo.</p>
            </div>
          ) : (
            devices.map((device) => (
              <button
                key={device.id}
                onClick={() => onConnect(device)}
                disabled={isConnecting}
                className="w-full bg-brand-card hover:bg-gray-800 border border-brand-accent/20 p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-95 group shadow-lg animate-in slide-in-from-bottom-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="bg-[#1a1a1a] p-3 rounded-xl text-brand-accent group-hover:text-white transition-colors">
                  {device.id.includes('.') ? <Monitor size={24} /> : <Globe size={24} />}
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg text-white">{device.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    {device.id}
                  </p>
                </div>
                <div className="bg-brand-accent text-black font-bold text-xs px-3 py-1.5 rounded-full">
                  CONECTAR
                </div>
              </button>
            ))
          )}
        </div>

        {/* Fallback Manual Input */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-2 px-2">Si no aparece automáticamente:</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className={`flex-1 bg-brand-card rounded-xl px-4 py-3 flex items-center gap-2 border border-white/5 transition-colors ${isConnecting ? 'opacity-50' : 'focus-within:border-brand-accent/50'}`}>
              <Globe size={16} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Ingresar IP manual (ej: 192.168.1.15)"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                disabled={isConnecting}
                className="flex-1 bg-transparent outline-none text-white text-sm font-mono placeholder:text-gray-600 disabled:cursor-not-allowed"
              />
            </div>
            <button 
              type="submit"
              disabled={!manualIp || isConnecting}
              className={`bg-brand-card text-white p-3 rounded-xl border border-white/10 transition-all flex items-center justify-center min-w-[50px] ${
                  !manualIp || isConnecting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-brand-accent hover:text-black shadow-lg hover:shadow-brand-accent/20'
              }`}
            >
              {isConnecting ? (
                <Loader2 size={20} className="animate-spin text-brand-accent" />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};