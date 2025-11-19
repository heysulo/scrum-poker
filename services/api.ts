
import { io, Socket } from "socket.io-client";
import { CardValue } from "../types";

// ------------------------------------------------------------------
// REAL BACKEND SERVICE
// To use this, change imports in Lobby.tsx and usePokerGame.ts
// from '../services/firebaseService' to '../services/api'
// ------------------------------------------------------------------

const API_URL = 'http://localhost:4000';

let socket: Socket | null = null;

const getSocket = () => {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true
    });
    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });
  }
  return socket;
};

// --- REST API METHODS ---

export const createSession = async (sessionName: string, password: string | null, creatorName: string) => {
  const res = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: sessionName, password, creatorName }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create session');
  }
  // Backend returns { sessionId, userId, session }
  // We just need { sessionId, userId } to match firebaseService interface
  const data = await res.json();
  return { sessionId: data.sessionId, userId: data.userId };
};

export const joinSession = async (sessionId: string, passwordInput: string | null, userName: string) => {
  const res = await fetch(`${API_URL}/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: passwordInput, userName }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to join session');
  }
  // Backend returns { userId, session }
  const data = await res.json();
  return data.userId as string;
};

export const leaveSession = async (sessionId: string, userId: string) => {
  await fetch(`${API_URL}/sessions/${sessionId}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  // We don't wait for response or error check strictly here for UX speed
};

// --- SOCKET EMITTERS (MATCHING FIREBASE SERVICE SIGNATURES) ---

export const castVote = (sessionId: string, userId: string, vote: CardValue | null) => {
  const s = getSocket();
  s.emit("vote", { sessionId, userId, value: vote });
};

export const updateRevealState = (sessionId: string, isRevealed: boolean) => {
  const s = getSocket();
  if (isRevealed) {
    s.emit("reveal_cards", { sessionId });
  } else {
    // Usually 'reset' handles hiding
  }
};

export const resetSession = (sessionId: string) => {
  const s = getSocket();
  s.emit("reset_round", { sessionId });
};

// --- SUBSCRIPTIONS ---

export const subscribeToSessionList = (callback: (sessions: any[]) => void) => {
  // The real backend might not push session lists via socket for scalability.
  // We'll fetch immediately and then poll every 3 seconds.
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
  
  // Join the socket room to get updates
  s.emit("join_room", { sessionId, userId: "listener", name: "Observer" });

  const handler = (data: any) => {
    callback(data);
  };

  s.on("session_update", handler);

  return () => {
    s.off("session_update", handler);
  };
};
