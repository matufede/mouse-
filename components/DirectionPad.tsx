import React, { useEffect, useState, useRef } from 'react';
import { Target } from 'lucide-react';
import { ControlButton } from './ControlButton';
import { Direction } from '../types';

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

export const DirectionPad: React.FC<DirectionPadProps> = ({ onMove, onCenterClick }) => {
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startMoving = (direction: Direction) => {
    setActiveDirection(direction);
    onMove(direction);
    
    // Auto-repeat movement while holding
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

  // Clean up interval on unmount
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
    { dir: Direction.CENTER, icon: <Target size={32} strokeWidth={2.5} className="text-brand-accent animate-pulse" /> }, // Center action
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