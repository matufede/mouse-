import React, { useState } from 'react';
import { Monitor, X, Copy, Check, Download, Terminal, Play } from 'lucide-react';

const BRIDGE_CODE = `const WebSocket = require('ws');
const robot = require('robotjs');
const ip = require('ip');
const os = require('os'); // Importar módulo de sistema

// Configuración del Servidor
const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
const pcName = os.hostname();

console.clear();
console.log("\\x1b[33m%s\\x1b[0m", "🚀 TouchMouse Bridge Iniciado");
console.log("---------------------------------");
console.log("🖥️  Nombre PC:", pcName);
console.log("📡 IP para conectar en el móvil:");
console.log("\\x1b[36m%s\\x1b[0m", \`   \${ip.address()}:\${PORT}\`);
console.log("---------------------------------");
console.log("⏳ Esperando conexión...");

wss.on('connection', function connection(ws) {
  console.log("\\x1b[32m%s\\x1b[0m", "✅ Dispositivo Conectado!");

  // 1. Enviar el nombre del PC al teléfono inmediatamente
  ws.send(JSON.stringify({
    type: 'HANDSHAKE',
    payload: { name: pcName }
  }));

  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);
      const mouse = robot.getMousePos();
      
      // Ajuste de velocidad dinámico
      const speed = data.payload.speed === 1 ? 2 : 12; 

      if (data.type === 'MOVE') {
        let x = 0, y = 0;
        const d = data.payload.direction;
        
        if (d.includes('UP')) y = -speed;
        if (d.includes('DOWN')) y = speed;
        if (d.includes('LEFT')) x = -speed;
        if (d.includes('RIGHT')) x = speed;

        robot.moveMouse(mouse.x + x, mouse.y + y);
      }

      if (data.type === 'ACTION') {
        const act = data.payload;
        if (act === 'LEFT_CLICK') robot.mouseClick();
        if (act === 'RIGHT_CLICK') robot.mouseClick('right');
        if (act === 'DOUBLE_CLICK') robot.mouseClick('left', true);
        if (act === 'DRAG') robot.mouseToggle('down'); 
      }
    } catch (e) {
      // Ignorar errores de parseo
    }
  });

  ws.on('close', () => console.log("❌ Dispositivo Desconectado"));
});`;

interface ExtensionModalProps {
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(BRIDGE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([BRIDGE_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bridge.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#121212] w-full max-w-2xl rounded-3xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="bg-brand-accent/10 p-2 rounded-lg">
                <Monitor size={24} className="text-brand-accent"/>
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Descargar Bridge</h2>
                <p className="text-xs text-gray-400">Instalación del script traductor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col md:flex-row gap-6">
              
              {/* Left Column: Instructions */}
              <div className="flex-1 space-y-6">
                <div className="bg-brand-card/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Para que el navegador controle tu mouse real, necesitas este script "puente" (Bridge) ejecutándose en tu computadora.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">1</div>
                            <div className="w-0.5 h-full bg-gray-800 my-1"></div>
                        </div>
                        <div className="pb-4">
                            <h3 className="text-white font-bold text-sm">Instalar Node.js</h3>
                            <p className="text-xs text-gray-500 mt-1">Requisito previo para ejecutar JavaScript en tu PC.</p>
                            <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-blue-400 text-xs hover:underline mt-1 block">nodejs.org ↗</a>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/30">2</div>
                            <div className="w-0.5 h-full bg-gray-800 my-1"></div>
                        </div>
                        <div className="pb-4 w-full">
                            <h3 className="text-white font-bold text-sm">Preparar Entorno</h3>
                            <div className="bg-black/50 p-3 rounded-xl border border-white/10 mt-2 font-mono text-[10px] text-gray-400 flex flex-col gap-1">
                                <span className="flex gap-2"><span className="text-green-500">$</span> mkdir touch-bridge</span>
                                <span className="flex gap-2"><span className="text-green-500">$</span> cd touch-bridge</span>
                                <span className="flex gap-2"><span className="text-green-500">$</span> npm init -y</span>
                                <span className="flex gap-2"><span className="text-green-500">$</span> npm install ws robotjs ip</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center font-bold text-sm border border-brand-accent/30">3</div>
                        </div>
                        <div className="w-full">
                            <h3 className="text-white font-bold text-sm">Descargar y Ejecutar</h3>
                            <p className="text-xs text-gray-500 mt-1 mb-3">Guarda el archivo y ejecútalo.</p>
                            <button 
                                onClick={downloadCode}
                                className="w-full bg-brand-accent hover:bg-brand-accent/90 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                            >
                                <Download size={18} />
                                Descargar bridge.js
                            </button>
                        </div>
                    </div>
                </div>
              </div>

              {/* Right Column: Code Preview */}
              <div className="flex-1 flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vista Previa</span>
                      <button onClick={copyToClipboard} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                          {copied ? <Check size={12} className="text-green-500"/> : <Copy size={12}/>}
                          {copied ? "Copiado" : "Copiar"}
                      </button>
                  </div>
                  <div className="flex-1 bg-[#0a0a0a] p-4 rounded-xl border border-white/5 overflow-auto custom-scrollbar font-mono text-[10px] text-gray-400 relative group">
                      <pre>{BRIDGE_CODE}</pre>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] pointer-events-none"></div>
                  </div>
                  <div className="mt-4 bg-[#1a1a1a] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-lg text-green-500">
                          <Terminal size={16} />
                      </div>
                      <div className="flex-1">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Comando de inicio</p>
                          <p className="font-mono text-xs text-white">node bridge.js</p>
                      </div>
                      <Play size={16} className="text-gray-600" />
                  </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};