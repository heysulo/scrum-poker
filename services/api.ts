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
    // Usually 'reset' handles hiding, but if we had a specific hide event:
    // s.emit("hide_cards", { sessionId });
    // For now, reveal=false usually implies reset in this logic context,
    // but strictly speaking resetSession handles the reset.
  }
};

export const resetSession = (sessionId: string) => {
  const s = getSocket();
  s.emit("reset_round", { sessionId });
};

// --- SUBSCRIPTIONS ---

export const subscribeToSessionList = (callback: (sessions: any[]) => void) => {
  // The real backend might not push session lists via socket for scalability.
  // We'll fetch immediately and then poll every 5 seconds.
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
  
  // We don't need to explicitly emit "join_room" here if the REST API joinSession was called,
  // BUT if we reload the page, the socket is new. So we should emit join_room.
  // We might lack the userId/name here if strictly following the interface (sessionId, cb).
  // However, typically the hook calling this knows the context. 
  // For simplicity in this drop-in replacement, we assume the REST join happened or we recover.
  // Ideally, we'd pass userId to this subscribe function.
  // Since we can't change the interface easily without breaking hooks, we'll just listen.
  // NOTE: The server 'join_room' event expects {sessionId, userId, name}.
  // If we miss that, we might miss specific 'user joined' logic on server, but we will receive 'session_update'.
  
  // Just in case, let's emit a generic rejoin if possible, or rely on the fact that
  // the server broadcasts to the room 'sessionId'. 
  // We MUST join the socket room to get updates.
  
  // Hack: We need to join the socket room. 
  // We'll emit a "reconnect_socket" style join. 
  // Since we don't have userId/name in args, we pass dummy or rely on previous REST call? 
  // Actually, we can just emit join_room with empty user data just to get on the channel.
  // The server implementation: socket.join(sessionId) happens inside 'join_room'.
  
  // To make this work properly without changing the interface, we'll rely on the client
  // calling joinSession (REST) and then us manually emitting join_room here?
  // Use sessionStorage to recover identity?
  
  // For this refactor, we will rely on the component to pass the data or just emit what we can.
  // But `join_room` requires args. 
  // Let's modify the server/socket.ts to allow joining without updating participant status if just listening?
  // Or just pass generic data.
  
  s.emit("join_room", { sessionId, userId: "listener", name: "Observer" });

  const handler = (data: any) => {
    callback(data);
  };

  s.on("session_update", handler);

  return () => {
    s.off("session_update", handler);
    // s.emit("leave_room", ...);
  };
};
