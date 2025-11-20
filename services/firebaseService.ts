
import { CardValue, Participant, Session } from '../types';
import { FIBONACCI_DECK } from '../constants';

// --- MOCK DATABASE STATE ---
let MOCK_SESSIONS: Record<string, Session> = {};
const LISTENERS: Record<string, ((data: any) => void)[]> = {};
const LIST_LISTENERS: ((data: any[]) => void)[] = [];

// --- BOT SIMULATION LOGIC ---
const BOT_NAMES = [
  "Sarah (AI)", "Tom (Backend)", "Mike (DevOps)", "Lisa (UX)", "James (Product)",
  "Emma (QA)", "David (Frontend)", "Chris (Security)", "Anna (Mobile)", "John (Data)",
  "Robert (Cloud)", "Pat (EM)"
];

const BOT_ALLOWED_VOTES: CardValue[] = ['1', '2', '3', '5', '8'];

// Initialize with Dummy Data
const initDummyData = () => {
    const dummyId1 = 'room-demo-1';
    const dummyId2 = 'room-demo-2';
    const now = Date.now();
    const systemCreatorId = 'user-system-admin';

    const generateBots = (startId: number, count: number) => {
        const participants: Record<string, Participant> = {};
        for (let i = 0; i < count; i++) {
            const botId = `bot-dummy-${startId + i}`;
            const randomVote = BOT_ALLOWED_VOTES[Math.floor(Math.random() * BOT_ALLOWED_VOTES.length)];
            
            participants[botId] = {
                id: botId,
                name: BOT_NAMES[(startId + i) % BOT_NAMES.length],
                vote: randomVote,
                status: 'online',
                joinedAt: now,
                isBot: true,
                role: 'voter'
            };
        }
        return participants;
    };

    // Room 1: Active Sprint Planning
    MOCK_SESSIONS[dummyId1] = {
        id: dummyId1,
        name: "Sprint 42 Planning",
        createdBy: "System",
        creatorId: systemCreatorId,
        createdAt: now - 3600000,
        isRevealed: false,
        participants: generateBots(100, 8), // 8 Bots
        allowReveal: false
    };

    // Room 2: Design Review (Protected)
    MOCK_SESSIONS[dummyId2] = {
        id: dummyId2,
        name: "Design Team Sync",
        createdBy: "System",
        creatorId: systemCreatorId,
        createdAt: now - 7200000,
        isRevealed: true,
        protected: true,
        participants: generateBots(200, 8), // 8 Bots
        allowReveal: false
    };
};

// Call init immediately
initDummyData();

// Helper to notify listeners
const notifySession = (sessionId: string) => {
  const session = MOCK_SESSIONS[sessionId];
  if (LISTENERS[sessionId]) {
    LISTENERS[sessionId].forEach(cb => cb(session ? { ...session } : null));
  }
  notifyList();
};

const notifyList = () => {
  const list = Object.values(MOCK_SESSIONS).map(s => ({
    id: s.id,
    name: s.name,
    createdAt: s.createdAt,
    participantsCount: Object.values(s.participants).length,
    protected: !!s.protected
  })).sort((a, b) => b.createdAt - a.createdAt);

  LIST_LISTENERS.forEach(cb => cb(list));
};

const simulateBotVotes = (sessionId: string) => {
  const session = MOCK_SESSIONS[sessionId];
  if (!session) return;

  // Get all bots
  const bots = Object.values(session.participants).filter(p => p.isBot);
  if (bots.length === 0) return;

  // Iterate all bots to ensure they vote eventually
  bots.forEach((p) => {
     // If bot hasn't voted, schedule a vote
     if (p.vote === null) {
         // 1000ms to 3000ms
         const delay = Math.floor(Math.random() * 2000) + 1000;
         
         setTimeout(() => {
            const currentSession = MOCK_SESSIONS[sessionId];
            if (currentSession && !currentSession.isRevealed && currentSession.participants[p.id]) {
                if (currentSession.participants[p.id].vote === null) {
                    const randomCard = BOT_ALLOWED_VOTES[Math.floor(Math.random() * BOT_ALLOWED_VOTES.length)];
                    currentSession.participants[p.id].vote = randomCard;
                    notifySession(sessionId);
                }
            }
         }, delay);
     }
  });
};

// --- SERVICE METHODS ---

export const createSession = async (sessionName: string, password: string | null, creatorName: string, role: 'voter' | 'spectator' = 'voter') => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const sessionId = `room-${Math.floor(Math.random() * 10000)}`;
  const userId = `user-${Math.floor(Math.random() * 10000)}`;

  const creator: Participant = {
    id: userId,
    name: creatorName,
    vote: null,
    status: 'online',
    joinedAt: Date.now(),
    role: role
  };

  const participants: Record<string, Participant> = { [userId]: creator };

  const botCount = 8;
  for (let i = 0; i < botCount; i++) {
      const botId = `bot-${i}-${sessionId}`;
      const randomVote = BOT_ALLOWED_VOTES[Math.floor(Math.random() * BOT_ALLOWED_VOTES.length)];
      participants[botId] = {
          id: botId,
          name: BOT_NAMES[i % BOT_NAMES.length],
          vote: randomVote, 
          status: 'online',
          joinedAt: Date.now(),
          isBot: true,
          role: 'voter'
      };
  }

  MOCK_SESSIONS[sessionId] = {
    id: sessionId,
    name: sessionName,
    createdBy: creatorName,
    creatorId: userId,
    createdAt: Date.now(),
    isRevealed: false,
    participants: participants,
    protected: !!password,
    allowReveal: false
  };

  notifySession(sessionId);
  
  return { sessionId, userId };
};

export const joinSession = async (sessionId: string, passwordInput: string | null, userName: string, role: 'voter' | 'spectator' = 'voter') => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const session = MOCK_SESSIONS[sessionId];
  if (!session) throw new Error("Session not found");
  
  const userId = `user-${Math.floor(Math.random() * 10000)}`;
  const participant: Participant = {
    id: userId,
    name: userName,
    vote: null,
    status: 'online',
    joinedAt: Date.now(),
    role: role
  };

  session.participants[userId] = participant;
  notifySession(sessionId);
  return userId;
};

export const getSession = async (sessionId: string) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const session = MOCK_SESSIONS[sessionId];
  if (!session) throw new Error("Session not found");
  return {
    id: session.id,
    name: session.name,
    protected: !!session.protected,
    participantsCount: Object.keys(session.participants).length
  };
};

export const leaveSession = async (sessionId: string, userId: string) => {
  const session = MOCK_SESSIONS[sessionId];
  if (session && session.participants[userId]) {
      delete session.participants[userId];
      notifySession(sessionId);
  }
};

export const kickParticipant = async (sessionId: string, userIdToKick: string, requesterId: string) => {
  const session = MOCK_SESSIONS[sessionId];
  if (!session) throw new Error("Session not found");
  
  const creator = session.participants[session.creatorId];
  const isCreatorOnline = creator && creator.status === 'online';

  if (isCreatorOnline && session.creatorId !== requesterId) {
      throw new Error("Only admin can kick participants");
  }

  if (session.participants[userIdToKick]) {
      delete session.participants[userIdToKick];
      notifySession(sessionId);
  }
};

export const castVote = (sessionId: string, userId: string, vote: CardValue | null) => {
  const session = MOCK_SESSIONS[sessionId];
  if (session && session.participants[userId]) {
    session.participants[userId].vote = vote;
    notifySession(sessionId);
  }
};

export const updateRevealState = (sessionId: string, isRevealed: boolean) => {
  const session = MOCK_SESSIONS[sessionId];
  if (session) {
    session.isRevealed = isRevealed;
    if (isRevealed) {
        Object.values(session.participants).forEach(p => {
             if (p.vote === null && p.role !== 'spectator') {
                 p.vote = '☕';
             }
             p.initialRevealVote = p.vote;
        });
    }
    notifySession(sessionId);
  }
};

export const resetSession = async (sessionId: string) => {
  const session = MOCK_SESSIONS[sessionId];
  if (session) {
    session.isRevealed = false;
    Object.keys(session.participants).forEach(pid => {
        session.participants[pid].initialRevealVote = undefined;
        if (session.participants[pid].vote !== '☕') {
            session.participants[pid].vote = null;
        }
    });
    notifySession(sessionId);
    
    setTimeout(() => simulateBotVotes(sessionId), 100);
  }
};

export const updateSessionSettings = (sessionId: string, allowReveal: boolean) => {
  const session = MOCK_SESSIONS[sessionId];
  if (session) {
    session.allowReveal = allowReveal;
    notifySession(sessionId);
  }
};

export const subscribeToSessionList = (callback: (sessions: any[]) => void) => {
  LIST_LISTENERS.push(callback);
  notifyList();
  return () => {
    const idx = LIST_LISTENERS.indexOf(callback);
    if (idx !== -1) LIST_LISTENERS.splice(idx, 1);
  };
};

export const subscribeToSession = (sessionId: string, callback: (data: any) => void) => {
  if (!LISTENERS[sessionId]) LISTENERS[sessionId] = [];
  LISTENERS[sessionId].push(callback);
  const session = MOCK_SESSIONS[sessionId];
  if (session) callback({ ...session });

  return () => {
    if (!LISTENERS[sessionId]) return;
    const idx = LISTENERS[sessionId].indexOf(callback);
    if (idx !== -1) LISTENERS[sessionId].splice(idx, 1);
  };
};

export const subscribeToConnectionStatus = (callback: (connected: boolean) => void) => {
  callback(true);
  return () => {};
};
