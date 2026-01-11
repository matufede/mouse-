import React, { useCallback } from 'react';

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

export const ControlButton: React.FC<ControlButtonProps> = ({
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
    // Haptic feedback for accessibility
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    if (onHoldStart) onHoldStart();
  }, [disabled, onHoldStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    if (onHoldEnd) onHoldEnd();
    if (onClick) onClick();
  }, [disabled, onHoldEnd, onClick]);

  // Base styles
  const baseStyles = "relative flex items-center justify-center rounded-3xl transition-all duration-100 active:scale-95 touch-manipulation select-none overflow-hidden";
  
  // Variant styles
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
      onPointerLeave={onHoldEnd} // Ensure hold is cancelled if finger slides off
      aria-label={label}
      aria-pressed={isActive}
    >
      <div className="z-10 transform transition-transform">
        {icon}
      </div>
      {isActive && variant !== 'primary' && (
        <div className="absolute inset-0 bg-brand-accent/10 rounded-3xl animate-pulse" />
      )}
    </button>
  );
};