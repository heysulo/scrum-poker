
import { Server, Socket } from 'socket.io';
import logger from 'perfect-logger';
import { store, BOT_ALLOWED_VOTES } from './store';
import { CardValue } from './types';

// Map to track socket connections: socketId -> { sessionId, userId }
const socketUserMap = new Map<string, { sessionId: string, userId: string }>();

export const simulateBotVotes = (io: Server, sessionId: string) => {
    const session = store.getSession(sessionId);
    if (!session) return;

    // Get all bots
    const bots = Object.values(session.participants).filter(p => p.isBot);
    
    bots.forEach(bot => {
        // Random delay between 1s and 5s
        const delay = Math.floor(Math.random() * 4000) + 1000;
        
        setTimeout(() => {
            // Re-fetch session to ensure it still exists and isn't revealed
            const currentSession = store.getSession(sessionId);
            if (currentSession && !currentSession.isRevealed && currentSession.participants[bot.id]) {
                const randomVote = BOT_ALLOWED_VOTES[Math.floor(Math.random() * BOT_ALLOWED_VOTES.length)];
                currentSession.participants[bot.id].vote = randomVote;
                
                // Broadcast update
                io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
            }
        }, delay);
    });
};

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`[Socket] Client connected: ${socket.id}`);

    // Join Room
    socket.on('join_room', ({ sessionId, userId, name }) => {
      logger.debug(`[Socket] join_room: ${name} (${userId}) -> ${sessionId}`);
      const session = store.getSession(sessionId);
      if (session) {
        socket.join(sessionId);
        
        // Track this socket's user
        socketUserMap.set(socket.id, { sessionId, userId });

        // Ensure user exists in store (sync check)
        if (session.participants[userId]) {
           session.participants[userId].status = 'online';
        }
        
        // Notify room of new joiner/status change
        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
      } else {
        logger.warn(`[Socket] join_room failed: Session ${sessionId} not found`);
      }
    });

    // Vote
    socket.on('vote', ({ sessionId, userId, value }: { sessionId: string, userId: string, value: CardValue | null }) => {
      logger.debug(`[Socket] vote: ${userId} -> ${value} (Session: ${sessionId})`);
      const session = store.getSession(sessionId);
      if (session && session.participants[userId]) {
        session.participants[userId].vote = value;
        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
      }
    });

    // Reveal
    socket.on('reveal_cards', ({ sessionId }) => {
      logger.info(`[Socket] reveal_cards: Session ${sessionId}`);
      const session = store.getSession(sessionId);
      if (session) {
        session.isRevealed = true;
        
        Object.values(session.participants).forEach(p => {
            // Rule: If user hasn't voted when revealed, put them on Break
            if (p.vote === null) {
                p.vote = '☕';
            }
            // Snapshot current votes to initialRevealVote
            p.initialRevealVote = p.vote;
        });

        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
      }
    });

    // Reset
    socket.on('reset_round', ({ sessionId }) => {
      logger.info(`[Socket] reset_round: Session ${sessionId}`);
      const session = store.getSession(sessionId);
      if (session) {
        session.isRevealed = false;
        
        // Reset votes but keep 'Break' status
        // Also clear initialRevealVote
        Object.values(session.participants).forEach(p => {
          delete p.initialRevealVote;
          if (p.vote !== '☕') {
            p.vote = null;
          }
        });

        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));

        // If this is the demo room, make bots vote again
        if (sessionId === 'room-demo') {
            logger.info(`[Socket] Triggering bot votes for demo room`);
            simulateBotVotes(io, sessionId);
        }
      }
    });

    // Update Settings
    socket.on('update_settings', ({ sessionId, allowReveal }) => {
      logger.info(`[Socket] update_settings: Session ${sessionId} allowReveal=${allowReveal}`);
      const session = store.getSession(sessionId);
      if (session) {
        // Permission Check logic isn't strictly enforced via Socket payloads usually, 
        // but ideally we trust the UI or add a userId payload. 
        // However, following the pattern:
        // If allowReveal is changed, we apply it. 
        // For stricter security we'd pass userId in the emit payload too.
        session.allowReveal = !!allowReveal;
        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      logger.info(`[Socket] Client disconnected: ${socket.id}`);
      
      const userData = socketUserMap.get(socket.id);
      if (userData) {
        const { sessionId, userId } = userData;
        
        // Remove participant completely on disconnect
        logger.debug(`[Socket] Removing user ${userId} from ${sessionId} due to disconnect`);
        store.removeParticipant(sessionId, userId);
        
        // Clean up map entry
        socketUserMap.delete(socket.id);

        // Notify remaining participants in the room
        // We need to check if session still exists (it might be deleted if empty)
        const session = store.getPublicSession(sessionId);
        if (session) {
            io.to(sessionId).emit('session_update', session);
        }
      }
    });
  });
};
