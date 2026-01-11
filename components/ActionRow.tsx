import React from 'react';
import { MousePointer2, MousePointerClick, Grip } from 'lucide-react';
import { ControlButton } from './ControlButton';
import { MouseAction } from '../types';

interface ActionRowProps {
  onAction: (action: MouseAction) => void;
  activeAction: MouseAction | null;
}

export const ActionRow: React.FC<ActionRowProps> = ({ onAction, activeAction }) => {
  return (
    <div className="flex justify-between gap-3 w-full max-w-md mx-auto px-4">
      {/* Double Click */}
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

      {/* Drag / Hold */}
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

      {/* Right Click */}
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