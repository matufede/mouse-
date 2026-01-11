import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ActionRow } from './components/ActionRow';
import { DirectionPad } from './components/DirectionPad';
import { Landing } from './components/Landing';
import { Receiver } from './components/Receiver';
import { ConnectionState, MouseAction, Direction, SpeedLevel, AppMode, RemoteMessage } from './types';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.LANDING);
  const [roomId, setRoomId] = useState<string>('');
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [speed, setSpeed] = useState<SpeedLevel>(1);
  const [activeAction, setActiveAction] = useState<MouseAction | null>(null);
  const [lastLog, setLastLog] = useState<string>("");
  const [receivedMessage, setReceivedMessage] = useState<RemoteMessage | null>(null);

  // Broadcast Channel for simulating WebSocket communication between tabs
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('touchmouse_channel');
    
    channelRef.current.onmessage = (event) => {
      const msg = event.data as RemoteMessage;
      // In a real app, we would check if msg.roomId === roomId
      // For this demo, we'll process it if we are in Receiver mode
      if (appMode === AppMode.RECEIVER) {
        setReceivedMessage(msg);
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, [appMode, roomId]);

  const generateRoomId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleCreateRoom = () => {
    const newId = generateRoomId();
    setRoomId(newId);
    setAppMode(AppMode.CONTROLLER);
    setConnectionState(ConnectionState.CONNECTED);
    setLastLog("Sala creada. Esperando receptor...");
  };

  const handleJoinRoom = () => {
    setAppMode(AppMode.RECEIVER);
    setConnectionState(ConnectionState.DISCONNECTED);
  };

  const handleReceiverConnect = (id: string) => {
    setRoomId(id);
    setConnectionState(ConnectionState.CONNECTING);
    setTimeout(() => {
      setConnectionState(ConnectionState.CONNECTED);
    }, 1000);
  };

  const handleExit = () => {
    setAppMode(AppMode.LANDING);
    setConnectionState(ConnectionState.DISCONNECTED);
    setRoomId('');
    setLastLog("");
  };

  const toggleSpeed = () => {
    setSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 3 : 1) as SpeedLevel);
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
    sendMessage('MOVE', { direction, speed });
  };

  // ----------------------------------------------------------------------
  // RENDER LOGIC
  // ----------------------------------------------------------------------

  if (appMode === AppMode.LANDING) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center safe-area-inset-bottom">
        <div className="fixed inset-0 bg-gradient-to-b from-brand-card/20 to-transparent pointer-events-none" />
        <Landing onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      </div>
    );
  }

  if (appMode === AppMode.RECEIVER) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Receiver 
          onJoin={handleReceiverConnect} 
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
            roomId={roomId}
            onExit={handleExit}
            speed={speed}
            onToggleSpeed={toggleSpeed}
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
              {lastLog || "Esperando input..."}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Diseñado por Matías Duncan Federico
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;