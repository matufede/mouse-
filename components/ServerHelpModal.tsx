import React, { useState } from 'react';
import { Monitor, X, Copy, Check, Download } from 'lucide-react';

const SERVER_CODE = `const WebSocket = require('ws');
const robot = require('robotjs');
const ip = require('ip');

const wss = new WebSocket.Server({ port: 8080 });

console.log("Servidor TouchMouse iniciado!");
console.log("IP para conectar:", ip.address() + ":8080");

wss.on('connection', function connection(ws) {
  console.log('Dispositivo conectado');

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    const mouse = robot.getMousePos();
    const speed = data.payload.speed === 1 ? 2 : 15; // Ajustar velocidad

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
    }
  });
});`;

interface ServerHelpModalProps {
  onClose: () => void;
}

export const ServerHelpModal: React.FC<ServerHelpModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SERVER_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([SERVER_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'server.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] w-full max-w-lg rounded-3xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Monitor size={20} className="text-brand-accent"/>
            Configurar Servidor PC
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* PRIMARY ACTION: DOWNLOAD BUTTON */}
          <button 
            onClick={downloadCode}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold p-4 rounded-xl flex items-center justify-center gap-3 mb-8 shadow-lg shadow-amber-900/20 transition-all active:scale-95"
          >
            <Download size={24} />
            <span className="text-lg">Descargar server.js</span>
          </button>

          <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="flex gap-4 items-start">
               <span className="bg-brand-accent/20 text-brand-accent font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
               <div>
                 <p className="text-sm text-gray-300 font-medium">Instala Node.js</p>
                 <p className="text-xs text-gray-500">Descárgalo desde nodejs.org.</p>
               </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex gap-4 items-start">
               <span className="bg-brand-accent/20 text-brand-accent font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
               <div>
                 <p className="text-sm text-gray-300 font-medium">Prepara la carpeta</p>
                 <p className="text-xs text-gray-500 font-mono bg-black p-3 rounded-lg mt-2 border border-white/10">
                   mkdir mouse-server<br/>
                   cd mouse-server<br/>
                   npm init -y<br/>
                   npm install ws robotjs ip
                 </p>
               </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
               <span className="bg-brand-accent/20 text-brand-accent font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
               <div className="w-full">
                 <p className="text-sm text-gray-300 font-medium mb-2">Código del servidor</p>
                 
                 <div className="bg-black text-gray-400 p-3 rounded-xl border border-white/10 overflow-x-auto font-mono text-[10px] max-h-32 mb-3">
                    {SERVER_CODE}
                 </div>

                 <button 
                   onClick={copyToClipboard}
                   className="w-full flex items-center justify-center gap-2 p-3 bg-brand-card hover:bg-gray-700 rounded-xl border border-white/10 transition-all text-xs font-medium text-white"
                 >
                   {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
                   {copied ? "Copiado al portapapeles" : "Copiar código"}
                 </button>
               </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start">
               <span className="bg-brand-accent/20 text-brand-accent font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
               <div>
                 <p className="text-sm text-gray-300 font-medium">Ejecuta y conecta</p>
                 <p className="text-xs text-gray-500 font-mono bg-black p-2 rounded border border-white/10 mt-1 inline-block">node server.js</p>
                 <p className="text-xs text-gray-500 mt-1">Usa la IP que aparece en la consola.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-0 mt-auto flex-shrink-0">
           <button 
             onClick={onClose}
             className="w-full bg-brand-card hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
           >
             Entendido
           </button>
        </div>

      </div>
    </div>
  );
};