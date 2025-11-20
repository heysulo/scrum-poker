
import React from 'react';
import { Timer, Minus, Plus, RotateCcw, Eye, Lock, Unlock, Shield } from 'lucide-react';

interface ControlsProps {
  isAutoRevealEnabled: boolean;
  setIsAutoRevealEnabled: (val: boolean) => void;
  initialTimerValue: number;
  setInitialTimerValue: React.Dispatch<React.SetStateAction<number>>;
  autoRevealTimer: number;
  allVoted: boolean;
  isRevealed: boolean;
  handleReveal: () => void;
  handleReset: () => void;
  isAdmin?: boolean;
  allowReveal?: boolean;
  onTogglePermissions?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isAutoRevealEnabled,
  setIsAutoRevealEnabled,
  initialTimerValue,
  setInitialTimerValue,
  autoRevealTimer,
  allVoted,
  isRevealed,
  handleReveal,
  handleReset,
  isAdmin = false,
  allowReveal = false,
  onTogglePermissions
}) => {
  
  const canControl = isAdmin || allowReveal;

  // Hide entire panel if user has no control rights
  if (!canControl) {
      return null;
  }

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/60 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/30 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
      
      <div className="z-10 flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Estimation Area
            {isAdmin && (
                <button 
                    onClick={onTogglePermissions}
                    className={`ml-2 p-1.5 rounded-lg border transition-all ${allowReveal ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-600'}`}
                    title={allowReveal ? "Everyone can reveal/reset" : "Only Admin can reveal/reset"}
                >
                    {allowReveal ? <Unlock size={14} /> : <Lock size={14} />}
                </button>
            )}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isAdmin 
                ? "Manage the round and permissions." 
                : "Vote on the complexity of the current user story."}
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto z-10">
        {/* Auto Reveal Toggle */}
        <div 
          className={`
            group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 select-none mr-2
            ${isAutoRevealEnabled
              ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
              : 'bg-white border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer'}
          `}
          onClick={() => !isAutoRevealEnabled && setIsAutoRevealEnabled(true)}
        >
          <div 
             onClick={(e) => {
                if (isAutoRevealEnabled) {
                    e.stopPropagation();
                    setIsAutoRevealEnabled(false);
                }
             }}
             className={`p-1.5 rounded-lg transition-colors duration-300 cursor-pointer ${isAutoRevealEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
            <Timer size={16} className={isAutoRevealEnabled && allVoted && !isRevealed ? 'animate-pulse' : ''} />
          </div>

          <div className="flex flex-col">
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isAutoRevealEnabled ? 'text-indigo-600 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
              Auto Reveal
            </span>
            <div className="h-4 flex items-center">
                {isAutoRevealEnabled ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setInitialTimerValue(prev => Math.max(3, prev - 1)); }}
                            className="w-4 h-4 flex items-center justify-center rounded bg-indigo-500/20 hover:bg-indigo-500 hover:text-white text-indigo-600 dark:text-indigo-300"
                            disabled={initialTimerValue <= 3}
                        >
                            <Minus size={10} />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-300 min-w-[20px] text-center">
                            {initialTimerValue}s
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setInitialTimerValue(prev => Math.min(60, prev + 1)); }}
                            className="w-4 h-4 flex items-center justify-center rounded bg-indigo-500/20 hover:bg-indigo-500 hover:text-white text-indigo-600 dark:text-indigo-300"
                            disabled={initialTimerValue >= 60}
                        >
                            <Plus size={10} />
                        </button>
                    </div>
                ) : (
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Disabled</span>
                )}
            </div>
          </div>

          <div 
            onClick={(e) => { e.stopPropagation(); setIsAutoRevealEnabled(!isAutoRevealEnabled); }}
            className={`relative w-9 h-5 rounded-full transition-colors duration-300 ml-2 cursor-pointer ${isAutoRevealEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isAutoRevealEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>

        <button 
          onClick={isRevealed ? handleReset : handleReveal}
          className={`relative overflow-hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
            allVoted && !isRevealed
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] border border-green-400/50' 
                : isRevealed 
                    ? 'bg-white dark:bg-slate-700 hover:bg-red-600 dark:hover:bg-red-600 text-slate-700 dark:text-white hover:text-white dark:hover:text-white border border-slate-200 dark:border-slate-600 hover:border-red-500 dark:hover:border-red-500 shadow-sm dark:shadow-none'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20'
          }`}
        >
          {isAutoRevealEnabled && allVoted && !isRevealed && (
            <div 
              className="absolute inset-0 bg-black/20 z-0 transition-all duration-1000 ease-linear origin-left"
              style={{ width: `${((initialTimerValue - autoRevealTimer) / initialTimerValue) * 100}%` }}
            />
          )}

          {allVoted && !isRevealed && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer skew-x-12 pointer-events-none z-0"></div>
          )}

          <div className="relative z-10 flex items-center gap-2">
            {!isAdmin && !allowReveal && <Lock size={16} />}
            {isRevealed ? (
              <><RotateCcw size={20}/> Start New Round</>
            ) : (
              <><Eye size={20}/> Reveal Cards</>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
