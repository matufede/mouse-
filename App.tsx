import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { ActionRow } from './components/ActionRow.tsx';
import { DirectionPad } from './components/DirectionPad.tsx';
import { Landing } from './components/Landing.tsx';
import { Receiver } from './components/Receiver.tsx';
import { DeviceScanner } from './components/DeviceScanner.tsx';
import { ExtensionModal } from './components/ExtensionModal.tsx';
import { ConnectionState, MouseAction, Direction, SensitivityMode, AppMode, RemoteMessage, DeviceInfo } from './types.ts';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.LANDING);
  const [roomId, setRoomId] = useState<string>(''); // Used as Target ID or Own ID
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('');
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [sensitivity, setSensitivity] = useState<SensitivityMode>(SensitivityMode.NAVIGATION);
  const [activeAction, setActiveAction] = useState<MouseAction | null>(null);
  const [lastLog, setLastLog] = useState<string>("");
  const [receivedMessage, setReceivedMessage] = useState<RemoteMessage | null>(null);
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  
  // Refs for communication
  const channelRef = useRef<BroadcastChannel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize BroadcastChannel for Browser-to-Browser demo
    channelRef.current = new BroadcastChannel('touchmouse_channel');
    
    channelRef.current.onmessage = (event) => {
      const msg = event.data as RemoteMessage;
      
      // LOGIC: CONTROLLER SCANNING
      if (appMode === AppMode.SCANNING && msg.type === 'ADVERTISE') {
        const device: DeviceInfo = msg.payload;
        setAvailableDevices(prev => {
          // Update existing or add new
          const exists = prev.find(d => d.id === device.id);
          if (exists) return prev.map(d => d.id === device.id ? {...device, lastSeen: Date.now()} : d);
          return [...prev, {...device, lastSeen: Date.now()}];
        });
      }

      // LOGIC: RECEIVER
      if (appMode === AppMode.RECEIVER) {
        // If we are the receiver, we check if the message is for us
        if (msg.roomId === roomId) { // roomId here acts as our DeviceID
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

    return () => {
      channelRef.current?.close();
      wsRef.current?.close();
    };
  }, [appMode, roomId]);

  // Clean up old devices from scanner list (simulated)
  useEffect(() => {
    if (appMode !== AppMode.SCANNING) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setAvailableDevices(prev => prev.filter(d => {
        // Keep "Real" IPs (containing dots) persistent longer or forever if from localstorage
        if (d.id.includes('.')) return true;
        return now - d.lastSeen < 4000;
      })); 
    }, 1000);
    return () => clearInterval(interval);
  }, [appMode]);

  const loadRecentDevices = () => {
    try {
      const saved = localStorage.getItem('touchmouse_recent');
      if (saved) {
        const devices: DeviceInfo[] = JSON.parse(saved);
        setAvailableDevices(prev => {
           // Merge simulated devices with saved devices
           const merged = [...prev];
           devices.forEach(d => {
             if (!merged.find(m => m.id === d.id)) merged.push(d);
           });
           return merged;
        });
      }
    } catch (e) {
      console.error("Error loading recent devices", e);
    }
  };

  const saveRecentDevice = (id: string, name: string) => {
    try {
      const newDevice: DeviceInfo = { id, name, lastSeen: Date.now() };
      const saved = localStorage.getItem('touchmouse_recent');
      let devices: DeviceInfo[] = saved ? JSON.parse(saved) : [];
      
      // Remove duplicate IPs
      devices = devices.filter(d => d.id !== id);
      devices.push(newDevice);
      
      // Keep only last 5
      if (devices.length > 5) devices.shift();
      
      localStorage.setItem('touchmouse_recent', JSON.stringify(devices));
      // Update state immediately
      setAvailableDevices(prev => {
        const filtered = prev.filter(p => p.id !== id);
        return [...filtered, newDevice];
      });
    } catch (e) {
      console.error("Error saving device", e);
    }
  };

  const handleScanWifi = () => {
    setIsScanning(true);
    // Load persisted real devices
    loadRecentDevices();
    
    // Simulate network scan duration
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  const startScanning = () => {
    setAvailableDevices([]);
    loadRecentDevices(); // Load immediately
    setAppMode(AppMode.SCANNING);
  };

  const startReceiver = () => {
    // Generate a persistent ID for this session
    const myId = 'DEV-' + Math.floor(Math.random() * 10000);
    setRoomId(myId); // In receiver mode, roomId is MY id
    setAppMode(AppMode.RECEIVER);
    setConnectionState(ConnectionState.DISCONNECTED);
  };

  const handleConnectToDevice = (device: DeviceInfo) => {
    if (device.id.includes('.')) {
      // It's a Real IP (from history)
      handleManualConnect(device.id);
    } else {
      // Mode: Browser-to-Browser (BroadcastChannel)
      setRoomId(device.id); // In controller mode, roomId is TARGET id
      setConnectedDeviceName(device.name);
      setConnectionState(ConnectionState.CONNECTING);
      
      const msg: RemoteMessage = { type: 'CONNECT', payload: {}, roomId: device.id };
      channelRef.current?.postMessage(msg);

      setTimeout(() => {
        setConnectionState(ConnectionState.CONNECTED);
        setAppMode(AppMode.CONTROLLER);
        setLastLog(`Conectado a ${device.name}`);
      }, 800);
    }
  };

  const handleManualConnect = (ip: string) => {
    // Mode: Native Controller (WebSocket)
    let formattedIp = ip;
    if (!formattedIp.startsWith('ws://') && !formattedIp.startsWith('wss://')) {
      formattedIp = `ws://${formattedIp}`;
    }

    setRoomId('NATIVE_SOCKET');
    setConnectedDeviceName(ip); // Temporary name until handshake
    setConnectionState(ConnectionState.CONNECTING);
    setLastLog(`Conectando a ${ip}...`);

    try {
      const ws = new WebSocket(formattedIp);
      
      ws.onopen = () => {
        setConnectionState(ConnectionState.CONNECTED);
        setAppMode(AppMode.CONTROLLER);
        setLastLog("Conectado");
        // Save initially as IP, update later if name comes
        saveRecentDevice(ip, "PC (Bridge)"); 
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // NEW: Listen for handshake with Computer Name
          if (data.type === 'HANDSHAKE' && data.payload.name) {
             const realName = data.payload.name;
             setConnectedDeviceName(realName);
             setLastLog(`Conectado a ${realName}`);
             saveRecentDevice(ip, realName); // Update history with real name
          }
        } catch (e) {
          // ignore non-json
        }
      };
      
      ws.onclose = () => {
        if (appMode === AppMode.CONTROLLER) {
          setConnectionState(ConnectionState.DISCONNECTED);
          setAppMode(AppMode.SCANNING); 
          alert("Desconectado del servidor");
        } else {
            setConnectionState(ConnectionState.DISCONNECTED);
        }
        setLastLog("Desconectado");
      };

      ws.onerror = (err) => {
        console.error("WebSocket Error", err);
        setConnectionState(ConnectionState.DISCONNECTED);
        setLastLog("Error de conexión");
        if (appMode === AppMode.SCANNING) {
            alert("No se pudo conectar a " + ip);
        }
      };

      wsRef.current = ws;
    } catch (e) {
      setLastLog("IP Inválida");
      setConnectionState(ConnectionState.DISCONNECTED);
      alert("IP Inválida");
    }
  };

  const handleExit = () => {
    setAppMode(AppMode.LANDING);
    setConnectionState(ConnectionState.DISCONNECTED);
    setRoomId('');
    setLastLog("");
    setIsScanning(false);
    wsRef.current?.close();
    wsRef.current = null;
  };

  const toggleSensitivity = () => {
    setSensitivity(prev => prev === SensitivityMode.NAVIGATION ? SensitivityMode.PRECISION : SensitivityMode.NAVIGATION);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const sendMessage = (type: 'MOVE' | 'ACTION', payload: any) => {
    // 1. Try WebSocket (Native Desktop Control)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
      return;
    }

    // 2. Fallback to BroadcastChannel (Browser Demo)
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

  // ----------------------------------------------------------------------
  // RENDER LOGIC
  // ----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center safe-area-inset-bottom">
      {/* Background Gradient for all screens */}
      <div className="fixed inset-0 bg-gradient-to-b from-brand-card/20 to-transparent pointer-events-none" />

      {/* Global Modals */}
      {showExtensionModal && <ExtensionModal onClose={() => setShowExtensionModal(false)} />}

      {appMode === AppMode.LANDING && (
        <Landing 
          onCreateRoom={startScanning} 
          onJoinRoom={startReceiver} 
          onDownloadExtension={() => setShowExtensionModal(true)}
        />
      )}

      {appMode === AppMode.SCANNING && (
        <div className="w-full">
          <DeviceScanner 
            devices={availableDevices}
            onConnect={handleConnectToDevice}
            onManualConnect={handleManualConnect}
            onCancel={handleExit}
            onScanWifi={handleScanWifi}
            isScanning={isScanning}
            isConnecting={connectionState === ConnectionState.CONNECTING}
          />
        </div>
      )}

      {appMode === AppMode.RECEIVER && (
        <div className="w-full min-h-screen">
          <Receiver 
            myDeviceId={roomId}
            onExit={handleExit}
            connectionState={connectionState}
            lastMessage={receivedMessage}
          />
        </div>
      )}

      {appMode === AppMode.CONTROLLER && (
        <div className="w-full max-w-lg flex flex-col h-[100dvh] relative z-10">
          <div className="flex-none pt-4">
            <Header 
              roomId={connectedDeviceName}
              onExit={handleExit}
              sensitivity={sensitivity}
              onToggleSensitivity={toggleSensitivity}
            />
          </div>

          <div className="flex-none py-4">
            <ActionRow 
              onAction={handleAction}
              activeAction={activeAction}
            />
          </div>

          <DirectionPad 
            onMove={handleMove}
            onCenterClick={() => handleAction(MouseAction.LEFT_CLICK)}
          />

          <div className="flex-none p-4 pb-8 text-center">
            <div className="bg-brand-card rounded-full px-4 py-2 inline-flex items-center justify-center min-w-[200px] shadow-lg border border-white/5">
               <div className={`w-2 h-2 rounded-full mr-2 ${connectionState === ConnectionState.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-mono text-gray-300 truncate max-w-[250px]">
                {lastLog || "Controlando dispositivo"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;