
import { Session, Participant } from './types';

class Store {
  private sessions: Map<string, Session> = new Map();

  createSession(name: string, creatorName: string, password?: string): { sessionId: string, userId: string, session: Session } {
    const sessionId = `room-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    const userId = `user-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

    const creator: Participant = {
      id: userId,
      name: creatorName,
      vote: null,
      status: 'online',
      joinedAt: Date.now()
    };

    const session: Session = {
      id: sessionId,
      name,
      createdBy: creatorName,
      createdAt: Date.now(),
      isRevealed: false,
      participants: { [userId]: creator },
      protected: !!password,
      password
    };

    this.sessions.set(sessionId, session);
    return { sessionId, userId, session };
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  // Returns session data without sensitive info (password)
  getPublicSession(sessionId: string): Omit<Session, 'password'> | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    const { password, ...publicData } = session;
    return publicData;
  }

  // Returns a list of all sessions (summary)
  getSessionsList(): any[] {
    return Array.from(this.sessions.values()).map(s => ({
      id: s.id,
      name: s.name,
      createdAt: s.createdAt,
      // Only count online participants for the lobby display
      participantsCount: Object.values(s.participants).filter(p => p.status === 'online').length,
      protected: !!s.protected
    })).sort((a, b) => b.createdAt - a.createdAt);
  }

  addParticipant(sessionId: string, name: string): { userId: string, participant: Participant } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if user with same name exists (handle reconnect/refresh)
    const existingParticipant = Object.values(session.participants).find(p => p.name === name);
    
    if (existingParticipant) {
      existingParticipant.status = 'online';
      return { userId: existingParticipant.id, participant: existingParticipant };
    }

    const userId = `user-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    const participant: Participant = {
      id: userId,
      name,
      vote: null,
      status: 'online',
      joinedAt: Date.now()
    };

    session.participants[userId] = participant;
    return { userId, participant };
  }

  removeParticipant(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      delete session.participants[userId];
      // Optional: Cleanup empty sessions
      if (Object.keys(session.participants).length === 0) {
        this.sessions.delete(sessionId);
      }
    }
  }

  markParticipantOffline(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.participants[userId]) {
      session.participants[userId].status = 'offline';
    }
  }
}

export const store = new Store();
