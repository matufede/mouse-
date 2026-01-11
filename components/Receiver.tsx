import React, { useState, useEffect } from 'react';
import { MousePointer2, ScanLine, Wifi, Loader2 } from 'lucide-react';
import { ConnectionState, RemoteMessage, MouseAction } from '../types';

interface ReceiverProps {
  onJoin: (roomId: string) => void;
  onExit: () => void;
  connectionState: ConnectionState;
  lastMessage: RemoteMessage | null;
}

export const Receiver: React.FC<ReceiverProps> = ({ onJoin, onExit, connectionState, lastMessage }) => {
  const [inputId, setInputId] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  // Simulate cursor movement based on messages
  useEffect(() => {
    if (lastMessage?.type === 'MOVE') {
      const { direction, speed } = lastMessage.payload;
      const step = speed === 1 ? 2 : speed === 2 ? 5 : 10;
      
      setCursorPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        // Simple movement logic (in a real app this would map vector directions)
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto p-6 animate-in slide-in-from-bottom-10">
        <div className="bg-brand-card w-full rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent"></div>
          
          <div className="flex justify-center mb-6">
            <div className="bg-brand-dark p-4 rounded-full border border-gray-700">
              <ScanLine size={48} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">Unirse a Sala</h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            Ingresa el ID generado por el controlador o escanea el QR.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">ID de Sala</label>
              <input
                type="text"
                maxLength={4}
                placeholder="0000"
                value={inputId}
                onChange={(e) => setInputId(e.target.value.toUpperCase())}
                className="w-full bg-brand-dark border border-gray-700 text-white text-3xl font-mono text-center py-4 rounded-2xl focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all uppercase placeholder-gray-700"
              />
            </div>

            <button
              onClick={() => onJoin(inputId)}
              disabled={inputId.length < 4}
              className="w-full py-4 bg-brand-accent text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors shadow-glow"
            >
              Conectar
            </button>
            
            <button 
              onClick={onExit}
              className="w-full py-3 text-gray-500 text-sm hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected View (Simulated Screen)
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      {/* Simulated Screen Area */}
      <div className="relative w-full max-w-4xl h-[70vh] bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl overflow-hidden m-4">
        
        {/* Status Bar */}
        <div className="absolute top-4 right-4 bg-brand-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-green-500/30 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500 text-xs font-mono">EN LÍNEA</span>
        </div>

        <div className="absolute top-4 left-4">
           <button onClick={onExit} className="text-gray-500 hover:text-white text-xs bg-brand-card/50 px-3 py-1 rounded-full">Salir de Sala</button>
        </div>

        {/* The simulated cursor */}
        <div 
          className="absolute transition-all duration-100 ease-out will-change-transform pointer-events-none"
          style={{ 
            left: `${cursorPos.x}%`, 
            top: `${cursorPos.y}%`,
            transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`
          }}
        >
          <MousePointer2 
            size={24} 
            className="text-white drop-shadow-xl fill-white"
          />
          {isClicking && (
            <div className="absolute -inset-4 border-2 border-brand-accent rounded-full animate-ping opacity-75"></div>
          )}
        </div>

        {/* Center Hint */}
        {!showCursor && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-30">
              <Wifi size={64} className="mx-auto mb-4" />
              <p className="text-xl">Esperando movimiento...</p>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-gray-500 mt-4 text-sm animate-pulse">
        La pantalla reaccionará a tus movimientos en el controlador
      </p>
    </div>
  );
};