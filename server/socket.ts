
import { Server, Socket } from 'socket.io';
import { store } from './store';
import { CardValue } from './types';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join Room
    socket.on('join_room', ({ sessionId, userId, name }) => {
      const session = store.getSession(sessionId);
      if (session) {
        socket.join(sessionId);
        
        // Ensure user exists in store (sync check)
        if (!session.participants[userId]) {
           // In a real app, we might validate the token or re-add them
           // For now, assume they joined via REST API first
        } else {
           session.participants[userId].status = 'online';
        }
        
        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
      }
    });

    // Vote
    socket.on('vote', ({ sessionId, userId, value }: { sessionId: string, userId: string, value: CardValue | null }) => {
      const session = store.getSession(sessionId);
      if (session && session.participants[userId]) {
        session.participants[userId].vote = value;
        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
      }
    });

    // Reveal
    socket.on('reveal_cards', ({ sessionId }) => {
      const session = store.getSession(sessionId);
      if (session) {
        session.isRevealed = true;
        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
      }
    });

    // Reset
    socket.on('reset_round', ({ sessionId }) => {
      const session = store.getSession(sessionId);
      if (session) {
        session.isRevealed = false;
        
        // Reset votes but keep 'Break' status
        Object.values(session.participants).forEach(p => {
          if (p.vote !== '☕') {
            p.vote = null;
          }
        });

        io.to(sessionId).emit('session_update', store.getPublicSession(sessionId));
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // In a real app, handle offline status or cleanup after timeout
    });
  });
};
