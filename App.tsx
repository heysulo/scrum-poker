
import React, { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { PokerRoom } from './components/PokerRoom';
import { Sun, Moon, Monitor, Check, ChevronDown, WifiOff, AlertCircle, BookOpen, X, Users, Crown, EyeOff, BarChart3, Lock, Shield, Zap } from 'lucide-react';
import { subscribeToConnectionStatus } from './services/firebaseService';

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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                    {/* Modal Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">User Manual</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Complete guide to ScrumSense</p>
                            </div>
                        </div>
                        <button onClick={() => setShowManual(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X size={24}/>
                        </button>
                    </div>
                    
                    {/* Modal Content - Vertical Layout */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-black/20">
                        <div className="p-8 space-y-12 max-w-4xl mx-auto">
                            
                            {/* Section 1: The Basics */}
                            <div className="flex flex-col md:flex-row gap-8 items-start animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-sm">
                                        <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">1</span>
                                        Starting & Inviting
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Setup your Session</h4>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Enter your name in the Lobby and click <strong>Create Room</strong>. Once inside, click the <strong>Share Link</strong> icon in the top header to copy the room URL.
                                    </p>
                                    <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                        <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5"/> Share URL allows instant joining</li>
                                        <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5"/> Optional passwords for secure rooms</li>
                                        <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5"/> Join as "Spectator" to observe without voting</li>
                                    </ul>
                                </div>
                                <div className="w-full md:w-80 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 select-none">
                                    {/* Visual Mockup: Header Share */}
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
                                        <div className="font-bold text-slate-800 dark:text-slate-200">ScrumSense</div>
                                        <div className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                                            <Check size={12}/> Copied!
                                        </div>
                                    </div>
                                    <div className="text-xs text-center text-slate-400 italic">
                                        "Click to copy invite link"
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700/50" />

                            {/* Section 2: Estimation Loop */}
                            <div className="flex flex-col md:flex-row-reverse gap-8 items-start animate-in slide-in-from-bottom-4 duration-500 delay-100">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-sm">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">2</span>
                                        Estimation Process
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Vote, Reveal, Discuss</h4>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Select a card from the bottom deck. Your vote is hidden (face-down) until the Admin reveals the cards. 
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                            <div className="font-bold text-blue-700 dark:text-blue-300 text-sm mb-1">Change Vote</div>
                                            <div className="text-xs text-blue-600/80 dark:text-blue-400/80">You can change your selection anytime before the reveal.</div>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                            <div className="font-bold text-amber-700 dark:text-amber-300 text-sm mb-1">Coffee Card</div>
                                            <div className="text-xs text-amber-600/80 dark:text-amber-400/80">Select ☕ if you need a break. This status persists.</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-80 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 select-none relative overflow-hidden">
                                    {/* Visual Mockup: Cards */}
                                    <div className="flex justify-center gap-3">
                                        <div className="w-12 h-16 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/40 flex items-center justify-center text-white font-bold text-xl -translate-y-2 z-10">5</div>
                                        <div className="w-12 h-16 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center text-slate-300 font-bold">8</div>
                                        <div className="w-12 h-16 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center text-slate-300 font-bold">13</div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center font-bold">M</div>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">Mike</span>
                                            </div>
                                            <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-bold text-[10px]">READY</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700/50" />

                            {/* Section 3: Admin Powers */}
                            <div className="flex flex-col md:flex-row gap-8 items-start animate-in slide-in-from-bottom-4 duration-500 delay-200">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-sm">
                                        <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">3</span>
                                        Admin Powers
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Facilitate like a Pro</h4>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        The room creator gets the <strong>Crown</strong> <Crown size={14} className="inline text-amber-500"/> icon.
                                        Only Admins can reveal cards or reset the round (unless they unlock permissions).
                                    </p>
                                    <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                        <li className="flex items-start gap-2"><Check size={16} className="text-amber-500 mt-0.5"/> <strong>Kick Users:</strong> Hover over a card and click the Ban icon.</li>
                                        <li className="flex items-start gap-2"><Check size={16} className="text-amber-500 mt-0.5"/> <strong>Unlock Controls:</strong> Click the Lock icon <Lock size={14} className="inline"/> to let anyone reveal.</li>
                                        <li className="flex items-start gap-2"><Check size={16} className="text-amber-500 mt-0.5"/> <strong>Temp Admin:</strong> If the Admin disconnects, rights are temporarily shared.</li>
                                    </ul>
                                </div>
                                <div className="w-full md:w-80 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 select-none">
                                    {/* Visual Mockup: Admin Controls */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-bold text-slate-500 uppercase">Estimation Area</div>
                                            <Lock size={12} className="text-slate-400"/>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-8 flex-1 bg-indigo-500 rounded-lg"></div>
                                            <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">A</div>
                                            <div className="text-xs font-bold dark:text-slate-300">Admin <Crown size={10} className="inline text-amber-500"/></div>
                                        </div>
                                        <div className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">Kick</div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700/50" />

                            {/* Section 4: Pro Modes */}
                            <div className="flex flex-col md:flex-row-reverse gap-8 items-start animate-in slide-in-from-bottom-4 duration-500 delay-300">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-sm">
                                        <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">4</span>
                                        Pro Features
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Advanced Tools</h4>
                                    
                                    <div className="space-y-4 mt-4">
                                        <div className="flex gap-4">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg h-fit text-indigo-600 dark:text-indigo-400"><EyeOff size={20}/></div>
                                            <div>
                                                <h5 className="font-bold text-slate-900 dark:text-white">Presenter Mode</h5>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    Masks your selection on your screen. Ideal for sharing your screen via Zoom/Teams without biasing the team.
                                                    Supports keyboard voting (1, 2, 3, 5...).
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg h-fit text-purple-600 dark:text-purple-400"><Zap size={20}/></div>
                                            <div>
                                                <h5 className="font-bold text-slate-900 dark:text-white">Auto-Reveal</h5>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    Automatically reveals cards 6 seconds after the last person votes. Keeps the meeting flowing fast.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-80 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 select-none flex flex-col gap-3">
                                    {/* Visual Mockup: Presenter Mode Banner */}
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50 text-center">
                                        <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1 flex items-center justify-center gap-2">
                                            <EyeOff size={14}/> Voting Masked
                                        </div>
                                        <div className="flex justify-center gap-1 mt-2 opacity-70">
                                            {[1, 2, 3].map(n => <div key={n} className="w-4 h-4 rounded bg-indigo-200 dark:bg-indigo-800"></div>)}
                                        </div>
                                    </div>
                                    {/* Visual Mockup: Keyboard */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        <div className="text-xs font-bold text-slate-500 mb-2 text-center">Keyboard Shortcuts</div>
                                        <div className="flex justify-center gap-2">
                                            <div className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono shadow-sm">1</div>
                                            <div className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono shadow-sm">2</div>
                                            <div className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono shadow-sm">3</div>
                                            <div className="px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-mono shadow-sm text-amber-600">C</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    
                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-between items-center">
                        <div className="text-xs text-slate-400 hidden sm:block">
                            Pro Tip: Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">?</kbd> if you are unsure about an estimate.
                        </div>
                        <button 
                            onClick={() => setShowManual(false)}
                            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
                        >
                            Got it, let's play!
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;
