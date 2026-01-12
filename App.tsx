import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ActionRow } from './components/ActionRow';
import { DirectionPad } from './components/DirectionPad';
import { Landing } from './components/Landing';
import { Receiver } from './components/Receiver';
import { DeviceScanner } from './components/DeviceScanner';
import { ConnectionState, MouseAction, Direction, SensitivityMode, AppMode, RemoteMessage, DeviceInfo } from './types';

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

  // Broadcast Channel for simulating WebSocket communication between tabs
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
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
             // Optionally send an ACK back
          }
        }
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, [appMode, roomId]);

  // Clean up old devices from scanner list
  useEffect(() => {
    if (appMode !== AppMode.SCANNING) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setAvailableDevices(prev => prev.filter(d => now - d.lastSeen < 4000)); // Remove if not seen in 4s
    }, 1000);
    return () => clearInterval(interval);
  }, [appMode]);


  const startScanning = () => {
    setAvailableDevices([]);
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
    setRoomId(device.id); // In controller mode, roomId is TARGET id
    setConnectedDeviceName(device.name);
    setAppMode(AppMode.CONTROLLER);
    setConnectionState(ConnectionState.CONNECTING);
    
    // Send connect message
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

  // ----------------------------------------------------------------------
  // RENDER LOGIC
  // ----------------------------------------------------------------------

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
       <DeviceScanner 
         devices={availableDevices}
         onConnect={handleConnectToDevice}
         onCancel={handleExit}
       />
    );
  }

  if (appMode === AppMode.RECEIVER) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Receiver 
          myDeviceId={roomId}
          onExit={handleExit}
          connectionState={connectionState}
          lastMessage={receivedMessage}
        />
      </div>
    );
  }

  // CONTROLLER MODE
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center safe-area-inset-bottom">
      <div className="fixed inset-0 bg-gradient-to-b from-brand-card/20 to-transparent pointer-events-none" />

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
    </div>
  );
};

export default App;