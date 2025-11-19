
import logger from 'perfect-logger';
import { Session, Participant } from './types';

class Store {
  private sessions: Map<string, Session> = new Map();

  createSession(name: string, creatorName: string, creatorId: string, password?: string): { sessionId: string, userId: string, session: Session } {
    const sessionId = `room-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    const userId = creatorId; // Use the provided persistent ID

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
    logger.debug(`[Store] Created session ${sessionId} (Protected: ${!!password})`);
    return { sessionId, userId, session };
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getPublicSession(sessionId: string): Omit<Session, 'password'> | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    const { password, ...publicData } = session;
    return publicData;
  }

  getSessionsList(): any[] {
    return Array.from(this.sessions.values()).map(s => ({
      id: s.id,
      name: s.name,
      createdAt: s.createdAt,
      participantsCount: Object.values(s.participants).filter(p => p.status === 'online').length,
      protected: !!s.protected
    })).sort((a, b) => b.createdAt - a.createdAt);
  }

  addParticipant(sessionId: string, name: string, userId: string): { userId: string, participant: Participant } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if this user ID already exists in the session
    let participant = session.participants[userId];
    
    if (participant) {
      // User re-joining with same ID
      logger.debug(`[Store] User ${name} (${userId}) re-connected to ${sessionId}`);
      participant.name = name; // Update name if changed
      participant.status = 'online';
      return { userId, participant };
    }

    // New participant with this ID
    logger.debug(`[Store] New participant ${name} (${userId}) added to ${sessionId}`);
    participant = {
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
      if (session.participants[userId]) {
        logger.debug(`[Store] Removing participant ${userId} from ${sessionId}`);
        delete session.participants[userId];
      }
      if (Object.keys(session.participants).length === 0) {
        logger.info(`[Store] Session ${sessionId} is empty, deleting.`);
        this.sessions.delete(sessionId);
      }
    }
  }

  markParticipantOffline(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.participants[userId]) {
      logger.debug(`[Store] Marking participant ${userId} offline in ${sessionId}`);
      session.participants[userId].status = 'offline';
    }
  }
}

export const store = new Store();