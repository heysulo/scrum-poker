
import { io, Socket } from "socket.io-client";
import { CardValue } from "../types";

// ------------------------------------------------------------------
// REAL BACKEND SERVICE
// To use this, change imports in Lobby.tsx and usePokerGame.ts
// from '../services/firebaseService' to '../services/api'
// ------------------------------------------------------------------

const API_URL = 'http://localhost:4000';

let socket: Socket | null = null;

// Helper to get or create a persistent User ID
const getPersistentUserId = (): string => {
  let id = localStorage.getItem('scrum_poker_client_id');
  if (!id) {
    // Generate a robust unique ID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = `user-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
    localStorage.setItem('scrum_poker_client_id', id);
  }
  return id;
};

const getSocket = () => {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
      // Pass auth/query if needed, but simple emit is fine for now
    });
    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });
  }
  return socket;
};

// --- REST API METHODS ---

export const createSession = async (sessionName: string, password: string | null, creatorName: string, role: 'voter' | 'spectator' = 'voter') => {
  const userId = getPersistentUserId();
  
  const res = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: sessionName, password, creatorName, userId, role }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create session');
  }
  
  const data = await res.json();
  // Backend uses our userId, so we return it back or just use local
  return { sessionId: data.sessionId, userId: userId };
};

export const joinSession = async (sessionId: string, passwordInput: string | null, userName: string, role: 'voter' | 'spectator' = 'voter') => {
  const userId = getPersistentUserId();
  
  const res = await fetch(`${API_URL}/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: passwordInput, userName, userId, role }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to join session');
  }
  
  const data = await res.json();
  return userId; // Return the local persistent ID
};

export const getSession = async (sessionId: string) => {
  const res = await fetch(`${API_URL}/sessions/${sessionId}`);
  if (!res.ok) {
    throw new Error('Session not found');
  }
  return await res.json();
};

export const leaveSession = async (sessionId: string, userId: string) => {
  // userId param is passed from hook, but should match getPersistentUserId()
  await fetch(`${API_URL}/sessions/${sessionId}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
};

export const kickParticipant = async (sessionId: string, userIdToKick: string, requesterId: string) => {
  const res = await fetch(`${API_URL}/sessions/${sessionId}/kick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: userIdToKick, requesterId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to kick participant');
  }
};

// --- SOCKET EMITTERS ---

export const castVote = (sessionId: string, userId: string, vote: CardValue | null) => {
  const s = getSocket();
  s.emit("vote", { sessionId, userId, value: vote });
};

export const updateRevealState = (sessionId: string, isRevealed: boolean) => {
  const s = getSocket();
  if (isRevealed) {
    s.emit("reveal_cards", { sessionId });
  }
};

export const resetSession = (sessionId: string) => {
  const s = getSocket();
  s.emit("reset_round", { sessionId });
};

export const updateSessionSettings = (sessionId: string, allowReveal: boolean) => {
  const s = getSocket();
  s.emit("update_settings", { sessionId, allowReveal });
};

// --- SUBSCRIPTIONS ---

export const subscribeToSessionList = (callback: (sessions: any[]) => void) => {
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`);
      if (res.ok) {
        const data = await res.json();
        callback(data);
      }
    } catch (e) {
      console.error("Failed to fetch session list", e);
    }
  };

  fetchSessions();
  const interval = setInterval(fetchSessions, 3000);

  return () => clearInterval(interval);
};

export const subscribeToSession = (sessionId: string, callback: (data: any) => void) => {
  const s = getSocket();
  const userId = getPersistentUserId();
  
  // Join the socket room with the persistent User ID
  // Name is optional here as it's already in the store via joinSession
  s.emit("join_room", { sessionId, userId, name: localStorage.getItem('scrum_poker_username') || 'User' });

  const handler = (data: any) => {
    callback(data);
  };

  s.on("session_update", handler);

  return () => {
    s.off("session_update", handler);
  };
};

export const subscribeToConnectionStatus = (callback: (connected: boolean) => void) => {
  const s = getSocket();
  
  // Send immediate status
  callback(s.connected);

  const onConnect = () => callback(true);
  const onDisconnect = () => callback(false);
  const onConnectError = () => callback(false);

  s.on('connect', onConnect);
  s.on('disconnect', onDisconnect);
  s.on('connect_error', onConnectError);

  return () => {
    s.off('connect', onConnect);
    s.off('disconnect', onDisconnect);
    s.off('connect_error', onConnectError);
  };
};
