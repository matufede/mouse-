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
  RefreshCw 
} from 'lucide-react';

// --- TYPES ---

enum MouseAction {
  LEFT_CLICK = 'LEFT_CLICK',
  RIGHT_CLICK = 'RIGHT_CLICK',
  DOUBLE_CLICK = 'DOUBLE_CLICK',
  DRAG = 'DRAG',
  MOVE = 'MOVE',
  SCROLL = 'SCROLL'
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

enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED'
}

enum AppMode {
  LANDING = 'LANDING',
  SCANNING = 'SCANNING',
  CONTROLLER = 'CONTROLLER',
  RECEIVER = 'RECEIVER'
}

enum SensitivityMode {
  PRECISION = 'PRECISION',
  NAVIGATION = 'NAVIGATION'
}

interface RemoteMessage {
  type: 'MOVE' | 'ACTION' | 'ADVERTISE' | 'CONNECT';
  payload: any;
  roomId: string;
}

interface DeviceInfo {
  id: string;
  name: string;
  lastSeen: number;
}

// --- COMPONENTS ---

// 1. Logo
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

// 2. ControlButton
interface ControlButtonProps {
  onClick?: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  className?: string;
  variant?: 'primary' | 'action' | 'connection';
  disabled?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
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
    if (navigator.vibrate) navigator.vibrate(20);
    if (onHoldStart) onHoldStart();
  }, [disabled, onHoldStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    if (onHoldEnd) onHoldEnd();
    if (onClick) onClick();
  }, [disabled, onHoldEnd, onClick]);

  const baseStyles = "relative flex items-center justify-center rounded-3xl transition-all duration-100 active:scale-95 touch-manipulation select-none overflow-hidden";
  let variantStyles = "";
  
  switch (variant) {
    case 'connection':
      variantStyles = isActive 
        ? "bg-brand-card border-2 border-brand-accent shadow-glow" 
        : "bg-brand-card/50 text-gray-400";
      break;
    case 'action':
      variantStyles = isActive 
        ? "bg-brand-card border border-brand-accent text-brand-accent" 
        : "bg-brand-card hover:bg-gray-700 text-white";
      break;
    case 'primary':
    default:
      variantStyles = isActive 
        ? "bg-brand-accent text-white shadow-glow" 
        : "bg-brand-card text-white hover:bg-gray-700";
      break;
  }

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={onHoldEnd}
      aria-label={label}
      aria-pressed={isActive}
    >
      <div className="z-10 transform transition-transform">{icon}</div>
      {isActive && variant !== 'primary' && (
        <div className="absolute inset-0 bg-brand-accent/10 rounded-3xl animate-pulse" />
      )}
    </button>
  );
};

// 3. Header
interface HeaderProps {
  roomId: string;
  onExit: () => void;
  sensitivity: SensitivityMode;
  onToggleSensitivity: () => void;
}

const Header: React.FC<HeaderProps> = ({
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
        <div className="flex-1 h-20 bg-brand-card rounded-3xl border border-brand-accent/30 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-accent/5" />
          <span className="text-[10px] text-brand-accent uppercase font-bold tracking-widest mb-1">Conectado a</span>
          <div className="flex items-center gap-2 px-2 w-full justify-center">
            <span className="text-lg font-mono text-white font-bold tracking-tight truncate">{roomId}</span>
          </div>
        </div>

        <ControlButton
          onClick={onToggleSensitivity}
          label={isPrecision ? "Modo Precisión" : "Modo Navegación"}
          variant="action"
          className="w-24 h-20"
          isActive={true} 
          icon={
            <div className="flex flex-col items-center justify-center">
              {isPrecision ? <Crosshair size={24} className="mb-1" /> : <Navigation size={24} className="mb-1" />}
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

// 4. ActionRow
interface ActionRowProps {
  onAction: (action: MouseAction) => void;
  activeAction: MouseAction | null;
}

const ActionRow: React.FC<ActionRowProps> = ({ onAction, activeAction }) => {
  return (
    <div className="flex justify-between gap-3 w-full max-w-md mx-auto px-4">
      <ControlButton
        onClick={() => onAction(MouseAction.DOUBLE_CLICK)}
        label="Double Click"
        variant="action"
        className="flex-1 h-20"
        icon={
           <div className="relative">
             <MousePointer2 className="text-white fill-white" size={32} />
             <div className="absolute -top-2 -right-2 bg-brand-accent w-3 h-3 rounded-full animate-ping" />
           </div>
        }
      />

      <ControlButton
        onClick={() => onAction(MouseAction.DRAG)}
        label="Drag Mode"
        variant="action"
        isActive={activeAction === MouseAction.DRAG}
        className="flex-1 h-20"
        icon={
            <div className="flex flex-col items-center">
                <MousePointerClick className={activeAction === MouseAction.DRAG ? "text-brand-accent" : "text-white"} size={32} />
                <span className="text-[10px] uppercase font-bold mt-1 tracking-widest text-gray-400">Drag</span>
            </div>
        }
      />

      <ControlButton
        onClick={() => onAction(MouseAction.RIGHT_CLICK)}
        label="Right Click"
        variant="action"
        className="flex-1 h-20"
        icon={
          <div className="relative">
            <MousePointer2 className="text-white transform scale-x-[-1]" size={32} />
            <div className="absolute top-0 right-0 w-3 h-3 bg-brand-accent rounded-full border-2 border-brand-card"></div>
          </div>
        }
      />
    </div>
  );
};

// 5. DirectionPad
interface DirectionPadProps {
  onMove: (direction: Direction) => void;
  onCenterClick: () => void;
}

const ArrowIcon = ({ angle }: { angle: number }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-14 h-14 text-white drop-shadow-sm transition-transform duration-200"
    style={{ transform: `rotate(${angle}deg)` }}
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3L20 11H15V21H9V11H4L12 3Z" />
  </svg>
);

const DirectionPad: React.FC<DirectionPadProps> = ({ onMove, onCenterClick }) => {
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startMoving = (direction: Direction) => {
    setActiveDirection(direction);
    onMove(direction);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      onMove(direction);
    }, 100);
  };

  const stopMoving = () => {
    setActiveDirection(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const buttons = [
    { dir: Direction.UP_LEFT, icon: <ArrowIcon angle={-45} /> },
    { dir: Direction.UP, icon: <ArrowIcon angle={0} /> },
    { dir: Direction.UP_RIGHT, icon: <ArrowIcon angle={45} /> },
    { dir: Direction.LEFT, icon: <ArrowIcon angle={-90} /> },
    { dir: Direction.CENTER, icon: <Target size={32} strokeWidth={2.5} className="text-brand-accent animate-pulse" /> },
    { dir: Direction.RIGHT, icon: <ArrowIcon angle={90} /> },
    { dir: Direction.DOWN_LEFT, icon: <ArrowIcon angle={-135} /> },
    { dir: Direction.DOWN, icon: <ArrowIcon angle={180} /> },
    { dir: Direction.DOWN_RIGHT, icon: <ArrowIcon angle={135} /> },
  ];

  return (
    <div className="flex-1 w-full max-w-md mx-auto p-4">
      <div className="grid grid-cols-3 gap-3 h-full">
        {buttons.map((btn, index) => {
           if (btn.dir === Direction.CENTER) {
             return (
               <ControlButton
                 key={index}
                 label="Center Click"
                 icon={btn.icon}
                 variant="action"
                 onClick={onCenterClick}
                 className="aspect-square rounded-2xl shadow-lg border border-gray-700/50 bg-brand-card/80"
               />
             );
           }
           return (
            <ControlButton
              key={index}
              label={`Move ${btn.dir}`}
              icon={btn.icon}
              onHoldStart={() => startMoving(btn.dir)}
              onHoldEnd={stopMoving}
              isActive={activeDirection === btn.dir}
              className="aspect-square rounded-2xl bg-brand-card hover:bg-brand-card/80 active:bg-brand-accent shadow-lg border border-white/5"
              variant="primary" 
            />
           );
        })}
      </div>
    </div>
  );
};

// 6. Landing
interface LandingProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

const Landing: React.FC<LandingProps> = ({ onCreateRoom, onJoinRoom }) => {
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

// 7. DeviceScanner
interface DeviceScannerProps {
  devices: DeviceInfo[];
  onConnect: (device: DeviceInfo) => void;
  onCancel: () => void;
}

const DeviceScanner: React.FC<DeviceScannerProps> = ({ devices, onConnect, onCancel }) => {
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

// 8. Receiver
interface ReceiverProps {
  myDeviceId: string;
  onExit: () => void;
  connectionState: ConnectionState;
  lastMessage: RemoteMessage | null;
}

const Receiver: React.FC<ReceiverProps> = ({ myDeviceId, onExit, connectionState, lastMessage }) => {
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    const names = ['Monitor', 'Desktop', 'Laptop', 'Screen', 'Display'];
    const randomName = `${names[Math.floor(Math.random() * names.length)]}-${Math.floor(100 + Math.random() * 900)}`;
    setDeviceName(randomName);
  }, []);

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
    const interval = setInterval(advertise, 1500);
    advertise();
    return () => {
      clearInterval(interval);
      channel.close();
    };
  }, [deviceName, myDeviceId]);

  useEffect(() => {
    if (lastMessage?.type === 'MOVE') {
      const { direction, speed } = lastMessage.payload;
      const step = speed === 1 ? 2 : speed === 2 ? 5 : 10;
      setCursorPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
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
        <button onClick={onExit} className="mt-12 text-gray-500 hover:text-white text-sm transition-colors">Cancelar</button>
      </div>
    );
  }

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
          <MousePointer2 size={32} className="text-white drop-shadow-2xl fill-white" />
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

// 9. Main App Logic
const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.LANDING);
  const [roomId, setRoomId] = useState<string>(''); 
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('');
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [sensitivity, setSensitivity] = useState<SensitivityMode>(SensitivityMode.NAVIGATION);
  const [activeAction, setActiveAction] = useState<MouseAction | null>(null);
  const [lastLog, setLastLog] = useState<string>("");
  const [receivedMessage, setReceivedMessage] = useState<RemoteMessage | null>(null);
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('touchmouse_channel');
    channelRef.current.onmessage = (event) => {
      const msg = event.data as RemoteMessage;
      if (appMode === AppMode.SCANNING && msg.type === 'ADVERTISE') {
        const device: DeviceInfo = msg.payload;
        setAvailableDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (exists) return prev.map(d => d.id === device.id ? {...device, lastSeen: Date.now()} : d);
          return [...prev, {...device, lastSeen: Date.now()}];
        });
      }
      if (appMode === AppMode.RECEIVER) {
        if (msg.roomId === roomId) {
          if (msg.type === 'MOVE' || msg.type === 'ACTION') {
            setReceivedMessage(msg);
            setConnectionState(ConnectionState.CONNECTED);
          }
          if (msg.type === 'CONNECT') {
             setConnectionState(ConnectionState.CONNECTED);
          }
        }
      }
    };
    return () => { channelRef.current?.close(); };
  }, [appMode, roomId]);

  useEffect(() => {
    if (appMode !== AppMode.SCANNING) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setAvailableDevices(prev => prev.filter(d => now - d.lastSeen < 4000));
    }, 1000);
    return () => clearInterval(interval);
  }, [appMode]);

  const startScanning = () => {
    setAvailableDevices([]);
    setAppMode(AppMode.SCANNING);
  };

  const startReceiver = () => {
    const myId = 'DEV-' + Math.floor(Math.random() * 10000);
    setRoomId(myId);
    setAppMode(AppMode.RECEIVER);
    setConnectionState(ConnectionState.DISCONNECTED);
  };

  const handleConnectToDevice = (device: DeviceInfo) => {
    setRoomId(device.id);
    setConnectedDeviceName(device.name);
    setAppMode(AppMode.CONTROLLER);
    setConnectionState(ConnectionState.CONNECTING);
    const msg: RemoteMessage = { type: 'CONNECT', payload: {}, roomId: device.id };
    channelRef.current?.postMessage(msg);
    setTimeout(() => {
      setConnectionState(ConnectionState.CONNECTED);
      setLastLog(`Conectado a ${device.name}`);
    }, 500);
  };

  const handleExit = () => {
    setAppMode(AppMode.LANDING);
    setConnectionState(ConnectionState.DISCONNECTED);
    setRoomId('');
    setLastLog("");
  };

  const toggleSensitivity = () => {
    setSensitivity(prev => prev === SensitivityMode.NAVIGATION ? SensitivityMode.PRECISION : SensitivityMode.NAVIGATION);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const sendMessage = (type: 'MOVE' | 'ACTION', payload: any) => {
    const msg: RemoteMessage = { type, payload, roomId };
    channelRef.current?.postMessage(msg);
  };

  const handleAction = (action: MouseAction) => {
    if (action === MouseAction.DRAG) {
      setActiveAction(prev => prev === MouseAction.DRAG ? null : MouseAction.DRAG);
      setLastLog(activeAction === MouseAction.DRAG ? "Drag Finalizado" : "Drag Iniciado");
    } else {
      setLastLog(`Acción: ${action}`);
    }
    sendMessage('ACTION', action);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleMove = (direction: Direction) => {
    setLastLog(`Moviendo ${direction}`);
    const speedValue = sensitivity === SensitivityMode.PRECISION ? 1 : 3;
    sendMessage('MOVE', { direction, speed: speedValue });
  };

  if (appMode === AppMode.LANDING) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center safe-area-inset-bottom">
        <div className="fixed inset-0 bg-gradient-to-b from-brand-card/20 to-transparent pointer-events-none" />
        <Landing onCreateRoom={startScanning} onJoinRoom={startReceiver} />
      </div>
    );
  }

  if (appMode === AppMode.SCANNING) {
    return (
       <DeviceScanner devices={availableDevices} onConnect={handleConnectToDevice} onCancel={handleExit} />
    );
  }

  if (appMode === AppMode.RECEIVER) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Receiver myDeviceId={roomId} onExit={handleExit} connectionState={connectionState} lastMessage={receivedMessage} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center safe-area-inset-bottom">
      <div className="fixed inset-0 bg-gradient-to-b from-brand-card/20 to-transparent pointer-events-none" />
      <div className="w-full max-w-lg flex flex-col h-[100dvh] relative z-10">
        <div className="flex-none pt-4">
          <Header roomId={connectedDeviceName} onExit={handleExit} sensitivity={sensitivity} onToggleSensitivity={toggleSensitivity} />
        </div>
        <div className="flex-none py-4">
          <ActionRow onAction={handleAction} activeAction={activeAction} />
        </div>
        <DirectionPad onMove={handleMove} onCenterClick={() => handleAction(MouseAction.LEFT_CLICK)} />
        <div className="flex-none p-4 pb-8 text-center">
          <div className="bg-brand-card rounded-full px-4 py-2 inline-flex items-center justify-center min-w-[200px] shadow-lg border border-white/5">
             <div className={`w-2 h-2 rounded-full mr-2 ${connectionState === ConnectionState.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-mono text-gray-300 truncate max-w-[250px]">
              {lastLog || "Controlando dispositivo"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mount
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}