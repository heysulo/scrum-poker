
import logger from 'perfect-logger';
import { Session, Participant, CardValue } from './types';

export const BOT_NAMES = [
  "Sarah (AI)", "Tom (Backend)", "Mike (DevOps)", "Lisa (UX)", "James (Product)",
  "Emma (QA)", "David (Frontend)", "Chris (Security)", "Anna (Mobile)", "John (Data)",
  "Robert (Cloud)", "Pat (EM)"
];

export const BOT_ALLOWED_VOTES: CardValue[] = ['1', '2', '3', '5', '8'];

class Store {
  private sessions: Map<string, Session> = new Map();

  constructor() {
    // Initialize immediately
    this.initDummySession();
  }

  private populateDemoBots() {
    const sessionId = 'room-demo';
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const now = Date.now();
    // Add 8 Bots
    for (let i = 0; i < 8; i++) {
        const botId = `bot-${i}`;
        // Only add if slot is free (though usually called when empty)
        if (!session.participants[botId]) {
            session.participants[botId] = {
                id: botId,
                name: BOT_NAMES[i],
                vote: null, // Will be set by simulation
                status: 'online',
                joinedAt: now,
                isBot: true,
                role: 'voter'
            };
        }
    }
    logger.info(`[Store] Repopulated demo room with bots.`);
  }

  initDummySession() {
    const sessionId = 'room-demo';
    const creatorId = 'system-admin';
    const creatorName = 'System';
    const now = Date.now();

    const session: Session = {
      id: sessionId,
      name: "Demo Room (Try it out!)",
      createdBy: creatorName,
      creatorId: creatorId,
      createdAt: now,
      isRevealed: false,
      participants: {},
      protected: false,
      allowReveal: true // Allow guests to control the demo room
    };

    this.sessions.set(sessionId, session);
    this.populateDemoBots();
    logger.info(`[Store] Initialized Dummy Session: ${sessionId}`);
  }

  createSession(name: string, creatorName: string, creatorId: string, password?: string, role: 'voter' | 'spectator' = 'voter'): { sessionId: string, userId: string, session: Session } {
    const sessionId = `room-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    const userId = creatorId; // Use the provided persistent ID

    const creator: Participant = {
      id: userId,
      name: creatorName,
      vote: null,
      status: 'online',
      joinedAt: Date.now(),
      role: role
    };

    const session: Session = {
      id: sessionId,
      name,
      createdBy: creatorName,
      creatorId: userId,
      createdAt: Date.now(),
      isRevealed: false,
      participants: { [userId]: creator },
      protected: !!password,
      password,
      allowReveal: false // Default: Only admin can reveal
    };

    this.sessions.set(sessionId, session);
    logger.debug(`[Store] Created session ${sessionId} (Protected: ${!!password}) by Admin ${creatorId}`);
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

  addParticipant(sessionId: string, name: string, userId: string, role: 'voter' | 'spectator' = 'voter'): { userId: string, participant: Participant } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if this user ID already exists in the session
    let participant = session.participants[userId];
    
    if (participant) {
      // User re-joining with same ID
      logger.debug(`[Store] User ${name} (${userId}) re-connected to ${sessionId}`);
      participant.name = name; // Update name if changed
      participant.status = 'online';
      // Update role if they changed it on re-join
      participant.role = role;
      return { userId, participant };
    }

    // New participant with this ID
    logger.debug(`[Store] New participant ${name} (${userId}) added to ${sessionId} as ${role}`);
    participant = {
      id: userId,
      name,
      vote: null,
      status: 'online',
      joinedAt: Date.now(),
      role: role
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
      
      // Check demo room: if all bots kicked, respawn them
      if (sessionId === 'room-demo') {
        const remainingBots = Object.values(session.participants).filter(p => p.isBot);
        if (remainingBots.length === 0) {
            this.populateDemoBots();
        }
      }

      // Don't delete the demo room even if empty
      if (Object.keys(session.participants).length === 0 && sessionId !== 'room-demo') {
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
