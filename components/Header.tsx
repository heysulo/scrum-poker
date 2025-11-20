
import React, { useState } from 'react';
import { Users, Info, LogOut, Eye, EyeOff, Link as LinkIcon, Check, Keyboard, X, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  sessionName: string;
  sessionId: string;
  participantCount: number;
  onLeave: () => void;
  isPresenterMode: boolean;
  setIsPresenterMode: (val: boolean) => void;
  isTempAdmin?: boolean; // New Prop
}

export const Header: React.FC<HeaderProps> = ({ 
  sessionName, 
  sessionId,
  participantCount, 
  onLeave,
  isPresenterMode,
  setIsPresenterMode,
  isTempAdmin
}) => {
  const [copied, setCopied] = useState(false);
  const [showPresenterConfirm, setShowPresenterConfirm] = useState(false);

  const handleShare = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', sessionId);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTogglePresenterMode = () => {
    if (isPresenterMode) {
      // Turn off immediately without confirmation
      setIsPresenterMode(false);
    } else {
      // Ask for confirmation before turning on
      setShowPresenterConfirm(true);
    }
  };

  const confirmEnablePresenter = () => {
    setIsPresenterMode(true);
    setShowPresenterConfirm(false);
  };

  return (
    <>
      <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-20 shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-xl text-white">S</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight hidden sm:block flex items-center gap-2">
                ScrumSense
                {isTempAdmin && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200" title="Creator is offline. Temporary Admin rights active.">
                        <ShieldAlert size={10} />
                        <span>TEMP ADMIN</span>
                    </div>
                )}
            </h1>
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
            onClick={handleTogglePresenterMode}
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

      {/* Confirmation Modal */}
      {showPresenterConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <EyeOff size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enable Presenter Mode?</h3>
                </div>
                <button 
                  onClick={() => setShowPresenterConfirm(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                When active, your selection will be <span className="font-bold text-indigo-600 dark:text-indigo-400">masked</span>. 
                This allows you to safely share your screen during estimation without biasing the team.
              </p>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 mb-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  <Keyboard size={16} />
                  <span>Keyboard Voting Enabled</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  You can vote discretely using your keyboard:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['1', '2', '3', '5', '8', '13'].map(key => (
                    <kbd key={key} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-xs font-mono text-slate-600 dark:text-slate-300 shadow-sm">
                      {key}
                    </kbd>
                  ))}
                  <kbd className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-md text-xs font-mono text-amber-600 dark:text-amber-400 shadow-sm">C</kbd>
                  <kbd className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-md text-xs font-mono text-blue-600 dark:text-blue-400 shadow-sm">?</kbd>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPresenterConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmEnablePresenter}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Enable Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
