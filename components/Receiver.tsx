import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, Monitor, Wifi } from 'lucide-react';
import { ConnectionState, RemoteMessage, MouseAction } from '../types.ts';

interface ReceiverProps {
  myDeviceId: string;
  onExit: () => void;
  connectionState: ConnectionState;
  lastMessage: RemoteMessage | null;
}

export const Receiver: React.FC<ReceiverProps> = ({ myDeviceId, onExit, connectionState, lastMessage }) => {
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [deviceName, setDeviceName] = useState('');

  // Generate a random name on mount
  useEffect(() => {
    const names = ['Monitor', 'Desktop', 'Laptop', 'Screen', 'Display'];
    const randomName = `${names[Math.floor(Math.random() * names.length)]}-${Math.floor(100 + Math.random() * 900)}`;
    setDeviceName(randomName);
  }, []);

  // Broadcast presence logic
  useEffect(() => {
    if (!deviceName) return;
    
    const channel = new BroadcastChannel('touchmouse_channel');
    
    const advertise = () => {
      channel.postMessage({
        type: 'ADVERTISE',
        payload: {
          id: myDeviceId,
          name: deviceName,
          lastSeen: Date.now()
        },
        roomId: ''
      });
    };

    // Advertise every 1.5 seconds so controllers can find us
    const interval = setInterval(advertise, 1500);
    advertise(); // Initial

    return () => {
      clearInterval(interval);
      channel.close();
    };
  }, [deviceName, myDeviceId]);

  // Simulate cursor movement based on messages
  useEffect(() => {
    if (lastMessage?.type === 'MOVE') {
      const { direction, speed } = lastMessage.payload;
      const step = speed === 1 ? 2 : speed === 2 ? 5 : 10;
      
      setCursorPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        // Simple movement logic
        if (direction.includes('UP')) newY -= step;
        if (direction.includes('DOWN')) newY += step;
        if (direction.includes('LEFT')) newX -= step;
        if (direction.includes('RIGHT')) newX += step;

        return { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) };
      });
      setShowCursor(true);
    } 
    
    if (lastMessage?.type === 'ACTION') {
      if (lastMessage.payload === MouseAction.LEFT_CLICK) {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 150);
      }
    }
  }, [lastMessage]);

  if (connectionState === ConnectionState.DISCONNECTED) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] w-full max-w-md mx-auto p-6 animate-in slide-in-from-bottom-10 text-center">
        
        {/* Pulsing Wifi Effect */}
        <div className="relative mb-12">
           <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-ping scale-150"></div>
           <div className="absolute inset-0 bg-brand-accent/10 rounded-full animate-ping delay-75 scale-125"></div>
           <div className="bg-brand-card p-6 rounded-full relative z-10 border-2 border-brand-accent shadow-glow">
             <Monitor size={48} className="text-white" />
           </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Visible como</h2>
        <h1 className="text-4xl font-mono text-brand-accent font-bold mb-6 tracking-wider">{deviceName || "..."}</h1>
        
        <div className="bg-brand-card/50 px-6 py-4 rounded-2xl border border-white/5 max-w-sm">
          <p className="text-gray-300 text-sm leading-relaxed">
            Abre esta web en tu teléfono y selecciona <strong>"Buscar Dispositivos"</strong> para controlar esta pantalla.
          </p>
        </div>

        <button 
          onClick={onExit}
          className="mt-12 text-gray-500 hover:text-white text-sm transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  // Connected View (Simulated Screen)
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-none">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="relative w-full max-w-4xl h-[70vh] bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl overflow-hidden m-4">
        
        <div className="absolute top-4 right-4 bg-brand-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-green-500/30 flex items-center gap-2 z-20">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500 text-xs font-mono">CONECTADO: {deviceName}</span>
        </div>

        <div className="absolute top-4 left-4 z-20">
           <button onClick={onExit} className="text-gray-500 hover:text-white text-xs bg-brand-card/50 px-3 py-1 rounded-full pointer-events-auto">Desconectar</button>
        </div>

        <div 
          className="absolute transition-all duration-100 ease-out will-change-transform z-10"
          style={{ 
            left: `${cursorPos.x}%`, 
            top: `${cursorPos.y}%`,
            transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`
          }}
        >
          <MousePointer2 
            size={32} 
            className="text-white drop-shadow-2xl fill-white"
          />
          {isClicking && (
            <div className="absolute -inset-4 border-2 border-brand-accent rounded-full animate-ping opacity-75"></div>
          )}
        </div>

        {!showCursor && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-30">
              <Wifi size={64} className="mx-auto mb-4" />
              <p className="text-xl">Dispositivo Conectado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};