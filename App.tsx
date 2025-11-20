
import React, { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { PokerRoom } from './components/PokerRoom';
import { Sun, Moon, Monitor, Check, ChevronDown, WifiOff, AlertCircle } from 'lucide-react';
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

        {/* Floating Theme Switcher (Always visible) */}
        <div className="absolute top-4 right-4 z-50">
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
    </div>
  );
};

export default App;
