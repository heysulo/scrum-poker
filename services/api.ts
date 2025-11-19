import { io, Socket } from "socket.io-client";
import { CardValue, Session } from "../types";

// Configuration
const API_URL = 'http://localhost:4000'; // Backend URL

// --- REST API ---

export const api = {
  async createSession(name: string, password: string | null, creatorName: string): Promise<{ sessionId: string, userId: string, session: Session }> {
    const res = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, creatorName }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create session');
    }
    return await res.json();
  },

  async joinSession(sessionId: string, password: string | null, userName: string): Promise<{ userId: string, session: Session }> {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, userName }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to join session');
    }
    return await res.json();
  },

  async getSession(sessionId: string): Promise<Session> {
    const res = await fetch(`${API_URL}/sessions/${sessionId}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to get session');
    }
    return await res.json();
  },

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    await fetch(`${API_URL}/sessions/${sessionId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  }
};

// --- SOCKET.IO SERVICE ---

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;
    
    this.socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("error", (err: any) => {
      console.error("Socket error:", err);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emitters
  joinRoom(sessionId: string, userId: string, name: string) {
    this.socket?.emit("join_room", { sessionId, userId, name });
  }

  castVote(sessionId: string, userId: string, value: CardValue | null) {
    this.socket?.emit("vote", { sessionId, userId, value });
  }

  reveal(sessionId: string) {
    this.socket?.emit("reveal_cards", { sessionId });
  }

  reset(sessionId: string) {
    this.socket?.emit("reset_round", { sessionId });
  }

  // Listeners
  onSessionUpdate(callback: (session: Session) => void) {
    this.socket?.on("session_update", callback);
    return () => {
      this.socket?.off("session_update", callback);
    };
  }
}

export const socketService = new SocketService();