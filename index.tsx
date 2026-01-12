import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  LogOut, 
  Crosshair, 
  Navigation, 
  MousePointer2, 
  MousePointerClick, 
  Target, 
  Smartphone, 
  Monitor, 
  Wifi, 
  ChevronLeft, 
  ArrowRight,
  Hash,
  AlertCircle
} from 'lucide-react';
import { Peer } from 'peerjs';

// --- TYPES ---

enum MouseAction {
  LEFT_CLICK = 'LEFT_CLICK',
  RIGHT_CLICK = 'RIGHT_CLICK',
  DOUBLE_CLICK = 'DOUBLE_CLICK',
  DRAG = 'DRAG',
  MOVE = 'MOVE'
}

enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP_LEFT = 'UP_LEFT',
  UP_RIGHT = 'UP_RIGHT',
  DOWN_LEFT = 'DOWN_LEFT',
  DOWN_RIGHT = 'DOWN_RIGHT',
  CENTER = 'CENTER'
}

enum AppMode {
  LANDING = 'LANDING',
  CONNECT_FORM = 'CONNECT_FORM',
  CONTROLLER = 'CONTROLLER',
  RECEIVER = 'RECEIVER'
}

enum SensitivityMode {
  PRECISION = 'PRECISION',
  NAVIGATION = 'NAVIGATION'
}

interface PeerMessage {
  type: 'MOVE' | 'ACTION' | 'PING';
  payload: any;
}

// --- UTILS ---

const generateShortId = () => Math.floor(1000 + Math.random() * 9000).toString();
const getPeerId = (code: string) => `tm-app-${code}`;

// --- COMPONENTS ---

const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M50 8 L38 22 H62 Z" fill="white" />
    <path d="M50 92 L38 78 H62 Z" fill="white" />
    <path d="M8 50 L22 38 V62 Z" fill="white" />
    <path d="M92 50 L78 38 V62 Z" fill="white" />
    <rect x="34" y="28" width="32" height="44" rx="14" fill="#f59e0b" />
    <rect x="46" y="34" width="8" height="12" rx="4" fill="#121212" />
  </svg>
);

const ControlButton: React.FC<{
  onClick?: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  className?: string;
  variant?: 'primary' | 'action' | 'connection';
  disabled?: boolean;
}> = ({
  onClick,
  onHoldStart,
  onHoldEnd,
  icon,
  label,
  isActive = false,
  className = '',
  variant = 'primary',
  disabled = false,
}) => {
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    if (navigator.vibrate) navigator.vibrate(15);
    if (onHoldStart) onHoldStart();
  }, [disabled, onHoldStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    if (onHoldEnd) onHoldEnd();
    if (onClick) onClick();
  }, [disabled, onHoldEnd, onClick]);

  const baseStyles = "relative flex items-center justify-center rounded-3xl transition-all duration-100 active:scale-95 touch-manipulation select-none overflow-hidden";
  let variantStyles = "";
  
  if (variant === 'action') {
    variantStyles = isActive 
        ? "bg-brand-card border border-brand-accent text-brand-accent shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
        : "bg-brand-card hover:bg-gray-700 text-white";
  } else if (variant === 'primary') {
    variantStyles = isActive 
        ? "bg-brand-accent text-white shadow-glow" 
        : "bg-brand-card text-white hover:bg-gray-700";
  } else {
    variantStyles = "bg-brand-card text-gray-400";
  }

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={onHoldEnd}
      aria-label={label}
    >
      <div className="z-10 transform transition-transform">{icon}</div>
    </button>
  );
};

// --- SCREENS ---

const Landing: React.FC<{ onConnect: () => void; onHost: () => void }> = ({ onConnect, onHost }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full max-w-md mx-auto p-6 gap-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-4 mb-8">
        <div className="bg-brand-card/50 p-6 rounded-[2rem] inline-block mb-4 shadow-glow border border-brand-accent/20">
          <Logo className="w-24 h-24" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
            Touch<span className="text-brand-accent">Mouse</span>
          </h1>
          <p className="text-gray-400 font-medium">Remote Control</p>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button
          onClick={onConnect}
          className="group w-full p-6 bg-brand-accent hover:bg-amber-600 rounded-3xl transition-all duration-200 active:scale-95 text-left flex items-center justify-between shadow-lg shadow-amber-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl text-white">
              <Smartphone size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Usar como Mouse</h3>
              <p className="text-amber-100 text-sm">Controlar otro dispositivo</p>
            </div>
          </div>
          <ArrowRight className="text-white/70 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onHost}
          className="group w-full p-6 bg-brand-card hover:bg-[#333] border border-white/10 rounded-3xl transition-all duration-200 active:scale-95 text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
             <div className="bg-[#121212] p-3 rounded-2xl text-gray-400 group-hover:text-white transition-colors">
              <Monitor size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Modo Pantalla</h3>
              <p className="text-gray-400 text-sm">Recibir control</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

const ConnectionForm: React.FC<{ onBack: () => void; onJoin: (code: string) => void; isConnecting: boolean }> = ({ onBack, onJoin, isConnecting }) => {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 4) onJoin(code);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white p-6">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={onBack} className="p-3 rounded-full bg-brand-card hover:bg-gray-700 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Conectar</h1>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-xs mx-auto w-full">
        <div className="w-20 h-20 bg-brand-card rounded-3xl flex items-center justify-center mb-8 shadow-glow border border-brand-accent/30">
          <Hash size={40} className="text-brand-accent" />
        </div>

        <p className="text-gray-400 text-center mb-8">
          Ingresa el código de 4 dígitos que aparece en la pantalla de tu computadora.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <input
            ref={inputRef}
            type="tel"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full bg-brand-card border-2 border-brand-accent/20 focus:border-brand-accent outline-none text-center text-5xl font-mono tracking-[0.5em] py-6 rounded-3xl text-white transition-colors placeholder:text-gray-700"
            placeholder="0000"
            disabled={isConnecting}
          />
          
          <button
            type="submit"
            disabled={code.length !== 4 || isConnecting}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
              code.length === 4 && !isConnecting
                ? 'bg-brand-accent text-white shadow-glow active:scale-95' 
                : 'bg-brand-card text-gray-500 cursor-not-allowed'
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <Wifi className="animate-pulse" /> Conectando...
              </span>
            ) : "Conectar"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Receiver: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState<'INIT' | 'WAITING' | 'CONNECTED'>('INIT');
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const [clickEffect, setClickEffect] = useState(false);
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    const newCode = generateShortId();
    setCode(newCode);
    const peer = new Peer(getPeerId(newCode));
    peerRef.current = peer;

    peer.on('open', () => {
      setStatus('WAITING');
    });

    peer.on('connection', (conn) => {
      setStatus('CONNECTED');
      conn.on('data', (data: any) => {
        const msg = data as PeerMessage;
        if (msg.type === 'MOVE') {
          const { direction, speed } = msg.payload;
          const step = speed === 1 ? 2 : speed === 2 ? 5 : 8;
          setCursor(prev => {
             let dx = 0, dy = 0;
             if (direction.includes('UP')) dy = -step;
             if (direction.includes('DOWN')) dy = step;
             if (direction.includes('LEFT')) dx = -step;
             if (direction.includes('RIGHT')) dx = step;
             return {
               x: Math.max(0, Math.min(100, prev.x + (dx * 0.5))), // Scale down for web viewport
               y: Math.max(0, Math.min(100, prev.y + (dy * 0.5)))
             };
          });
        }
        if (msg.type === 'ACTION') {
          setClickEffect(true);
          setTimeout(() => setClickEffect(false), 200);
        }
      });
      conn.on('close', () => setStatus('WAITING'));
    });

    return () => {
      peer.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden cursor-none">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Info Card */}
      <div className={`transition-all duration-500 ${status === 'CONNECTED' ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="bg-[#1a1a1a] p-10 rounded-[3rem] border border-gray-800 shadow-2xl text-center max-w-md mx-4 relative z-10">
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-card p-4 rounded-3xl border border-brand-accent shadow-glow">
             <Logo className="w-12 h-12" />
           </div>
           
           <h2 className="text-gray-400 mt-6 mb-2 font-medium uppercase tracking-widest text-sm">Código de Conexión</h2>
           {status === 'INIT' ? (
             <div className="h-20 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"/></div>
           ) : (
             <div className="text-7xl font-mono font-bold text-white tracking-widest mb-6">{code}</div>
           )}
           
           <p className="text-gray-500 leading-relaxed text-sm px-4">
             1. Abre <span className="text-brand-accent">TouchMouse</span> en tu celular.<br/>
             2. Selecciona "Usar como Mouse".<br/>
             3. Ingresa el código de arriba.
           </p>

           <button onClick={onExit} className="mt-8 text-red-400 hover:text-red-300 text-sm font-medium">Cancelar</button>
        </div>
      </div>

      {/* Connection Indicator */}
      {status === 'CONNECTED' && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-green-500/10 backdrop-blur-md px-6 py-2 rounded-full border border-green-500/20 text-green-400 font-mono text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          DISPOSITIVO CONECTADO
        </div>
      )}

      {/* Virtual Cursor */}
      <div 
        className="absolute w-8 h-8 pointer-events-none transition-transform duration-75 ease-out z-50 will-change-transform"
        style={{ 
          left: `${cursor.x}%`, 
          top: `${cursor.y}%`,
          transform: `translate(-50%, -50%) scale(${clickEffect ? 0.8 : 1})`
        }}
      >
        <MousePointer2 
          size={48} 
          className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] fill-white stroke-black stroke-2" 
        />
        {clickEffect && (
          <div className="absolute -inset-6 border-4 border-brand-accent rounded-full animate-ping opacity-50"/>
        )}
      </div>

      {/* Disconnect Button (Hidden but accessible) */}
      <button onClick={onExit} className="absolute top-8 right-8 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 transition-colors z-50">
        <LogOut size={20} />
      </button>
    </div>
  );
};

// --- CONTROLLER LOGIC ---

const Controller: React.FC<{ roomId: string; onDisconnect: () => void }> = ({ roomId, onDisconnect }) => {
  const [sensitivity, setSensitivity] = useState<SensitivityMode>(SensitivityMode.NAVIGATION);
  const [activeAction, setActiveAction] = useState<MouseAction | null>(null);
  const connRef = useRef<any>(null);

  useEffect(() => {
    const peer = new Peer();
    peer.on('open', () => {
      const conn = peer.connect(getPeerId(roomId));
      conn.on('open', () => {
        connRef.current = conn;
      });
      conn.on('close', () => {
        alert("El dispositivo se desconectó.");
        onDisconnect();
      });
      conn.on('error', () => {
         alert("Error de conexión.");
         onDisconnect();
      });
    });
    peer.on('error', (err) => {
      console.error(err);
      alert("No se pudo conectar. Verifica el código.");
      onDisconnect();
    });
    return () => peer.destroy();
  }, [roomId, onDisconnect]);

  const send = (type: 'MOVE' | 'ACTION', payload: any) => {
    if (connRef.current?.open) {
      connRef.current.send({ type, payload });
    }
  };

  const handleAction = (action: MouseAction) => {
    if (action === MouseAction.DRAG) {
      setActiveAction(prev => prev === MouseAction.DRAG ? null : MouseAction.DRAG);
    }
    send('ACTION', action);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleMove = (direction: Direction) => {
    const speed = sensitivity === SensitivityMode.PRECISION ? 1 : 3;
    send('MOVE', { direction, speed });
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 text-xs font-mono font-bold tracking-wider">{roomId}</span>
          </div>
        </div>
        <button onClick={onDisconnect} className="p-2 bg-red-500/10 text-red-400 rounded-full">
          <LogOut size={20} />
        </button>
      </div>

      {/* Controls Container */}
      <div className="flex-1 flex flex-col justify-end pb-8 px-4 gap-6 max-w-md mx-auto w-full">
        
        {/* Toggle Mode */}
        <div className="flex justify-center">
           <button 
             onClick={() => {
                setSensitivity(s => s === SensitivityMode.NAVIGATION ? SensitivityMode.PRECISION : SensitivityMode.NAVIGATION);
                if(navigator.vibrate) navigator.vibrate(50);
             }}
             className="bg-brand-card border border-brand-accent/30 rounded-full p-1 flex relative w-48 shadow-lg"
           >
             <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand-accent rounded-full transition-all duration-300 ${sensitivity === SensitivityMode.PRECISION ? 'left-[calc(50%+2px)]' : 'left-1'}`} />
             <div className="flex-1 relative z-10 text-xs font-bold py-2 text-center transition-colors text-white uppercase tracking-tighter">Navegar</div>
             <div className="flex-1 relative z-10 text-xs font-bold py-2 text-center transition-colors text-white uppercase tracking-tighter">Precisión</div>
           </button>
        </div>

        {/* Action Row */}
        <div className="flex gap-3">
          <ControlButton
            onClick={() => handleAction(MouseAction.DOUBLE_CLICK)}
            label="Double"
            variant="action"
            className="flex-1 h-20"
            icon={<div className="flex flex-col items-center"><MousePointer2 size={24} className="mb-1 text-white"/><span className="text-[10px] uppercase font-bold text-gray-400">Double</span></div>}
          />
          <ControlButton
            onClick={() => handleAction(MouseAction.DRAG)}
            label="Drag"
            variant="action"
            isActive={activeAction === MouseAction.DRAG}
            className="flex-1 h-20"
            icon={<div className="flex flex-col items-center"><MousePointerClick size={24} className={activeAction === MouseAction.DRAG ? "text-brand-accent" : "text-white"}/><span className="text-[10px] uppercase font-bold text-gray-400">Drag</span></div>}
          />
          <ControlButton
            onClick={() => handleAction(MouseAction.RIGHT_CLICK)}
            label="Right"
            variant="action"
            className="flex-1 h-20"
            icon={<div className="flex flex-col items-center"><MousePointer2 size={24} className="mb-1 text-white scale-x-[-1]"/><span className="text-[10px] uppercase font-bold text-gray-400">Right</span></div>}
          />
        </div>

        {/* D-PAD */}
        <div className="aspect-square bg-brand-card/30 rounded-[2.5rem] p-4 grid grid-cols-3 gap-3 border border-white/5">
           {[
             { d: Direction.UP_LEFT, r: -45 }, { d: Direction.UP, r: 0 }, { d: Direction.UP_RIGHT, r: 45 },
             { d: Direction.LEFT, r: -90 }, { d: Direction.CENTER }, { d: Direction.RIGHT, r: 90 },
             { d: Direction.DOWN_LEFT, r: -135 }, { d: Direction.DOWN, r: 180 }, { d: Direction.DOWN_RIGHT, r: 135 }
           ].map((btn, i) => (
             <ControlButton
               key={i}
               label={btn.d}
               variant={btn.d === Direction.CENTER ? 'action' : 'primary'}
               className={`rounded-2xl ${btn.d === Direction.CENTER ? 'bg-brand-card border border-white/10' : 'bg-brand-card shadow-lg'}`}
               icon={btn.d === Direction.CENTER ? (
                 <Target className="text-brand-accent animate-pulse-fast" size={32} />
               ) : (
                 <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-200" style={{ transform: `rotate(${btn.r}deg)` }} fill="currentColor"><path d="M12 4L20 12H15V20H9V12H4L12 4Z"/></svg>
               )}
               onClick={btn.d === Direction.CENTER ? () => handleAction(MouseAction.LEFT_CLICK) : undefined}
               onHoldStart={btn.d !== Direction.CENTER ? () => {
                 const interval = setInterval(() => handleMove(btn.d), 100);
                 (window as any)._moveInterval = interval;
                 handleMove(btn.d);
               } : undefined}
               onHoldEnd={() => {
                 clearInterval((window as any)._moveInterval);
               }}
             />
           ))}
        </div>
      </div>
    </div>
  );
};

// --- APP ROOT ---

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [connectCode, setConnectCode] = useState<string>("");

  const handleConnect = (code: string) => {
    setConnectCode(code);
    setMode(AppMode.CONTROLLER);
  };

  const handleBack = () => {
    setMode(AppMode.LANDING);
    setConnectCode("");
  };

  return (
    <div className="h-[100dvh] w-full max-w-lg mx-auto bg-[#121212] relative overflow-hidden shadow-2xl">
      {mode === AppMode.LANDING && (
        <Landing 
          onConnect={() => setMode(AppMode.CONNECT_FORM)} 
          onHost={() => setMode(AppMode.RECEIVER)} 
        />
      )}
      
      {mode === AppMode.CONNECT_FORM && (
        <ConnectionForm 
          onBack={handleBack} 
          onJoin={handleConnect} 
          isConnecting={false} 
        />
      )}
      
      {mode === AppMode.CONTROLLER && (
        <Controller 
          roomId={connectCode} 
          onDisconnect={handleBack} 
        />
      )}
      
      {mode === AppMode.RECEIVER && (
        <Receiver 
          onExit={handleBack} 
        />
      )}
    </div>
  );
};

// Mount
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}