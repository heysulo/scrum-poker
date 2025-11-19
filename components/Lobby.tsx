import React, { useState, useEffect } from 'react';
import { Plus, Lock, LogIn, RefreshCw, Terminal, Search, Users, Clock } from 'lucide-react';
import { createSession, joinSession, subscribeToSessionList } from '../services/firebaseService';

interface LobbyProps {
  onJoin: (sessionId: string, userId: string, userName: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoin }) => {
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'list'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session List State
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Form State
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionPassword, setNewSessionPassword] = useState('');

  // Join State
  const [joinSessionId, setJoinSessionId] = useState('');
  const [joinSessionPassword, setJoinSessionPassword] = useState('');
  const [selectedSessionProtected, setSelectedSessionProtected] = useState(false);

  // Subscribe to session list on mount
  useEffect(() => {
      const unsubscribe = subscribeToSessionList((sessions) => {
          setAvailableSessions(sessions);
      });
      return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !newSessionName.trim()) {
        setError("Name and Session Name are required");
        return;
    }
    setError(null);
    setLoading(true);
    try {
        const { sessionId, userId } = await createSession(newSessionName, newSessionPassword || null, userName);
        onJoin(sessionId, userId, userName);
    } catch (err: any) {
        setError(err.message || "Failed to create session");
    } finally {
        setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !joinSessionId.trim()) {
        setError("Name and Room ID are required");
        return;
    }
    setError(null);
    setLoading(true);
    try {
        const userId = await joinSession(joinSessionId, joinSessionPassword || null, userName);
        onJoin(joinSessionId, userId, userName);
    } catch (err: any) {
        setError(err.message || "Failed to join session");
    } finally {
        setLoading(false);
    }
  };

  const selectSessionToJoin = (session: any) => {
      setJoinSessionId(session.id);
      setSelectedSessionProtected(session.protected);
      setActiveTab('join');
      setError(null);
  };

  // Filter sessions
  const filteredSessions = availableSessions.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Panel: Identity & Info */}
        <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-900/50 p-8 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-xl text-white">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ScrumSense</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                    Real-time agile estimation for remote teams.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 text-xs text-indigo-600 dark:text-indigo-300 flex gap-2">
                  <Terminal size={16} className="shrink-0" />
                  <div>
                    <span className="font-bold block mb-1">Mock Mode Active</span>
                    Using in-memory dummy data. Bots included.
                  </div>
                </div>
            </div>
        </div>

        {/* Right Panel: Actions */}
        <div className="w-full md:w-2/3 p-8 bg-white dark:bg-slate-800 flex flex-col">
            
            {/* User Name Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
                <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl mb-6 self-start">
                <button 
                    onClick={() => { setActiveTab('list'); setError(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Search size={16}/> Available Rooms
                </button>
                <button 
                    onClick={() => { setActiveTab('create'); setError(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'create' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Plus size={16}/> Create Room
                </button>
                <button 
                    onClick={() => { setActiveTab('join'); setError(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'join' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <LogIn size={16}/> Join ID
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Available Rooms List */}
            {activeTab === 'list' && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search active rooms..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-sm"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                        {filteredSessions.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                No active rooms found. Why not create one?
                            </div>
                        ) : (
                            filteredSessions.map(session => (
                                <div 
                                    key={session.id}
                                    onClick={() => selectSessionToJoin(session)}
                                    className="group p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all shadow-sm hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {session.name}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1"><Users size={12}/> {session.participantsCount}</span>
                                                <span className="flex items-center gap-1"><Clock size={12}/> {new Date(session.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                        {session.protected ? (
                                            <Lock size={16} className="text-amber-500" />
                                        ) : (
                                            <div className="px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase">Public</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Create View */}
            {activeTab === 'create' && (
                <form onSubmit={handleCreate} className="flex-1 flex flex-col max-w-md animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Room Name</label>
                            <input 
                                type="text"
                                value={newSessionName}
                                onChange={(e) => setNewSessionName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Sprint 42 Planning"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                                Password <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input 
                                type="password"
                                value={newSessionPassword}
                                onChange={(e) => setNewSessionPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Set a room password..."
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20}/>}
                            Create Room
                        </button>
                    </div>
                </form>
            )}

            {/* Join View */}
            {activeTab === 'join' && (
                <form onSubmit={handleJoin} className="flex-1 flex flex-col max-w-md animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Room ID</label>
                            <input 
                                type="text"
                                value={joinSessionId}
                                onChange={(e) => setJoinSessionId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                placeholder="e.g. room-1234"
                                required
                            />
                        </div>
                        {/* Only show password field if the selected session is protected, or if entering manually (defaults to true-ish or we can show it always for manual) */}
                        {(activeTab === 'join' && (!joinSessionId || selectedSessionProtected)) && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                                    Password <span className="text-slate-400 font-normal">(If required)</span>
                                </label>
                                <input 
                                    type="password"
                                    value={joinSessionPassword}
                                    onChange={(e) => setJoinSessionPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Room password..."
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <LogIn size={20}/>}
                            Join Room
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};