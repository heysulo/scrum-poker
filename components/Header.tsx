
import React, { useState } from 'react';
import { Users, Info, LogOut, Eye, EyeOff, Link as LinkIcon, Check } from 'lucide-react';

interface HeaderProps {
  sessionName: string;
  sessionId: string;
  participantCount: number;
  onLeave: () => void;
  isPresenterMode: boolean;
  setIsPresenterMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  sessionName, 
  sessionId,
  participantCount, 
  onLeave,
  isPresenterMode,
  setIsPresenterMode
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', sessionId);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-20 shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="font-bold text-xl text-white">S</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight hidden sm:block">ScrumSense</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Users size={12} /> {participantCount} Online
          </div>
        </div>
      </div>
      
      {/* Right Actions - Margin added to avoid overlap with absolute theme switcher */}
      <div className="flex items-center gap-3 sm:gap-4 mr-16">
        
        {/* Share Button */}
        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
             copied 
             ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
             : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
          }`}
          title="Copy Room Link"
        >
           {copied ? <Check size={16} /> : <LinkIcon size={16} />}
           <span className="text-xs font-medium hidden sm:inline">
             {copied ? 'Copied!' : 'Share'}
           </span>
        </button>

        {/* Presenter Mode Toggle */}
        <button
          onClick={() => setIsPresenterMode(!isPresenterMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
            isPresenterMode 
              ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20' 
              : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title={isPresenterMode ? "Presenter Mode Active (Your vote is masked)" : "Enable Presenter Mode (Masks your vote)"}
        >
           {isPresenterMode ? <EyeOff size={16} /> : <Eye size={16} />}
           <span className="text-xs font-medium hidden sm:inline">
             Presenter Mode: {isPresenterMode ? 'ON' : 'OFF'}
           </span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <Info size={14} className="text-blue-500 dark:text-blue-400"/> 
          <span>Session: </span>
          <span className="text-slate-900 dark:text-slate-200 font-medium">{sessionName}</span>
        </div>
        
        <button 
          onClick={onLeave}
          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
          title="Leave Room"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
