
/*
import { io, Socket } from "socket.io-client";
import { CardValue, Session } from "../types";

// ------------------------------------------------------------------
// REAL BACKEND SERVICE (Inactive in Mock Mode)
// This file is currently commented out to prevent "socket.io-client"
// import errors since we are running in Mock Mode without that dependency.
// Uncomment this file when you are ready to connect to the real Node.js backend.
// ------------------------------------------------------------------

const API_URL = 'http://localhost:4000'; 

export const api = {
  async getSessions(): Promise<any[]> {
    const res = await fetch(`${API_URL}/sessions`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return await res.json();
  },

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
*/

// Export empty placeholders to satisfy build if referenced anywhere (though they shouldn't be)
export const api = {};
export const socketService = {};
