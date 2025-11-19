
import React from 'react';
import { CardValue } from '../types';

interface PokerCardProps {
  value: CardValue;
  selected: boolean;
  onClick?: () => void;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PokerCard: React.FC<PokerCardProps> = ({ 
  value, 
  selected, 
  onClick, 
  faceDown = false,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-16 text-2xl rounded-lg', // Increased text size, slightly larger radius
    md: 'w-20 h-32 text-2xl rounded-xl',
    lg: 'w-32 h-48 text-4xl rounded-2xl',
  };

  const isSmall = size === 'sm';

  const baseClasses = "relative flex items-center justify-center font-bold cursor-pointer transition-all duration-200 border-2 shadow-lg select-none transform hover:-translate-y-2";
  
  const stateClasses = faceDown 
    ? "bg-violet-50 dark:bg-violet-900 border-violet-200 dark:border-violet-700" // Light violet (light mode) / Dark violet (dark mode)
    : selected
      ? "bg-blue-500 border-blue-300 text-white scale-110 shadow-blue-500/50 z-10"
      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500";

  return (
    <div 
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${stateClasses}`}
    >
      {faceDown ? (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Only show dashed border for medium/large cards */}
            {!isSmall && <div className="absolute inset-2 border-2 border-dashed border-violet-200 dark:border-violet-500 opacity-50 rounded-lg" />}
            
            {/* Cool Emoji on back */}
            <span className={`select-none opacity-40 ${isSmall ? 'text-xl' : 'text-4xl'} animate-pulse`}>
                🚀
            </span>
        </div>
      ) : (
        <>
          {!isSmall && <span className="absolute top-2 left-2 text-xs opacity-50">{value}</span>}
          <span>{value}</span>
          {!isSmall && <span className="absolute bottom-2 right-2 text-xs opacity-50 transform rotate-180">{value}</span>}
        </>
      )}
    </div>
  );
};
