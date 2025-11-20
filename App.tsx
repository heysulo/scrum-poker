
import React, { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { PokerRoom } from './components/PokerRoom';
import { Sun, Moon, Monitor, Check, ChevronDown, WifiOff, AlertCircle, BookOpen, X } from 'lucide-react';
import { subscribeToConnectionStatus } from './services/api';

const App: React.FC = () => {
  // Global Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Session State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: string, name: string} | null>(null);
  
  // Connection State
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [kickNotification, setKickNotification] = useState(false);
  
  // Deep Link State
  const [initialRoomId, setInitialRoomId] = useState<string | undefined>(undefined);

  // Help Modal State
  const [showManual, setShowManual] = useState(false);

  // Check URL for room param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInitialRoomId(roomParam);
      // Clear the param from URL without refresh so it doesn't stick if they leave
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Subscribe to Connection Status (Global)
  useEffect(() => {
    const unsubscribe = subscribeToConnectionStatus((connected) => {
      setIsConnected(connected);
    });
    return () => unsubscribe();
  }, []);

  // Debounce the disconnected banner to prevent flicker on load
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isConnected) {
      setShowBanner(false);
    } else {
      // Wait 2 seconds before showing banner to allow for initial connection latency
      timeout = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [isConnected]);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
        const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
        root.classList.remove('light', 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
    };

    applyTheme();
    const listener = () => { if (theme === 'system') applyTheme(); };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const getThemeIcon = (t: string) => {
      if (t === 'light') return <Sun size={16} />;
      if (t === 'dark') return <Moon size={16} />;
      return <Monitor size={16} />;
  };

  const handleJoinSession = (sessionId: string, userId: string, userName: string) => {
      setCurrentUser({ id: userId, name: userName });
      setCurrentSessionId(sessionId);
      setKickNotification(false);
  };

  const handleLeaveSession = (reason?: string) => {
      setCurrentSessionId(null);
      if (reason === 'kicked') {
          setKickNotification(true);
          // Hide notification after 5 seconds
          setTimeout(() => setKickNotification(false), 5000);
      }
  };

  return (
    <div className="h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-black text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300 relative">
        
        {/* Disconnection Banner (Global) */}
        {showBanner && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 text-center text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top-full z-[60] shadow-lg">
              <WifiOff size={16} />
              <span>Disconnected: Cannot reach backend server. Reconnecting...</span>
          </div>
        )}

        {/* Kick Notification Banner */}
        {kickNotification && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white py-3 px-4 text-center text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top-full z-[60] shadow-lg">
              <AlertCircle size={20} />
              <span>You were kicked from the session by the administrator.</span>
          </div>
        )}

        {/* Floating Controls (Theme & Help) */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
             {/* User Manual Button */}
             <button 
                onClick={() => setShowManual(true)}
                className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all"
                title="User Manual"
             >
                <BookOpen size={20} />
             </button>

             {/* Theme Switcher */}
             <div className="relative">
                {isThemeMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)}></div>}
                <button 
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className="relative z-50 flex items-center gap-2 p-2 pl-3 pr-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all"
                >
                  {getThemeIcon(theme)}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isThemeMenuOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-0.5">
                             {(['light', 'dark', 'system'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setTheme(t); setIsThemeMenuOpen(false); }}
                                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                                        theme === t 
                                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-medium' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {getThemeIcon(t)}
                                        <span className="capitalize">{t}</span>
                                    </div>
                                    {theme === t && <Check size={14} className="text-indigo-600 dark:text-indigo-400"/>}
                                </button>
                             ))}
                        </div>
                    </div>
                )}
             </div>
        </div>

        {currentSessionId && currentUser ? (
            <PokerRoom 
                sessionId={currentSessionId}
                userId={currentUser.id}
                userName={currentUser.name}
                onLeave={handleLeaveSession}
            />
        ) : (
            <Lobby 
                onJoin={handleJoinSession} 
                initialRoomId={initialRoomId}
            />
        )}

        {/* User Manual Modal */}
        {showManual && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">User Manual</h3>
                    </div>
                    <button onClick={() => setShowManual(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto leading-relaxed text-slate-600 dark:text-slate-300 space-y-6">
                    <section>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs flex items-center justify-center font-mono">1</span> 
                            Starting a Session
                        </h4>
                        <ul className="list-disc list-inside space-y-1 ml-8 text-sm">
                            <li>Enter your <strong>Name</strong> in the lobby.</li>
                            <li>Go to the <strong>Create Room</strong> tab.</li>
                            <li>Enter a Session Name and optional password.</li>
                            <li>Click <strong>Create Room</strong>. You become the <strong>Admin</strong>.</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs flex items-center justify-center font-mono">2</span> 
                            Inviting Team Members
                        </h4>
                        <ul className="list-disc list-inside space-y-1 ml-8 text-sm">
                            <li>Click the <strong>Share</strong> button (Link icon) in the top header of the room.</li>
                            <li>The link is copied to your clipboard. Share it with your team.</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs flex items-center justify-center font-mono">3</span> 
                            Estimation Process
                        </h4>
                        <ul className="list-disc list-inside space-y-1 ml-8 text-sm">
                            <li><strong>Vote:</strong> Select a card from the deck at the bottom.</li>
                            <li><strong>Coffee ☕:</strong> Select if you need a break.</li>
                            <li><strong>Presenter Mode:</strong> Use the Eye icon to mask your vote if sharing your screen.</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs flex items-center justify-center font-mono">4</span> 
                            Revealing & Consensus
                        </h4>
                        <ul className="list-disc list-inside space-y-1 ml-8 text-sm">
                            <li><strong>Reveal:</strong> Admin clicks "Reveal Cards" (or Auto-Reveal triggers).</li>
                            <li><strong>Stats:</strong> Review "Most Voted", "Consensus Range", and "Distribution".</li>
                            <li><strong>Outliers:</strong> Discuss estimates with high variance.</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs flex items-center justify-center font-mono">5</span> 
                            Next Round
                        </h4>
                        <p className="ml-8 text-sm">Click <strong>Start New Round</strong> to clear votes and hide cards for the next story.</p>
                    </section>
                </div>
                
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                    <button 
                        onClick={() => setShowManual(false)}
                        className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
            </div>
        )}
    </div>
  );
};

export default App;
