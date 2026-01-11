import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Arrows */}
    <path d="M50 8 L38 22 H62 Z" fill="white" /> {/* Up */}
    <path d="M50 92 L38 78 H62 Z" fill="white" /> {/* Down */}
    <path d="M8 50 L22 38 V62 Z" fill="white" /> {/* Left */}
    <path d="M92 50 L78 38 V62 Z" fill="white" /> {/* Right */}

    {/* Mouse Body */}
    <rect x="34" y="28" width="32" height="44" rx="14" fill="#f59e0b" />
    
    {/* Scroll Wheel */}
    <rect x="46" y="34" width="8" height="12" rx="4" fill="#121212" />
  </svg>
);