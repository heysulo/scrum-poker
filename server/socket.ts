
import { Server, Socket } from 'socket.io';
import { store } from './store';
import { CardValue } from './types';

// Map to track socket connections: socketId -> { sessionId, userId }
const socketUserMap = new Map<string, { sessionId: string, userId: string }>();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join Room
    socket.on('join_room', ({ sessionId, userId, name }) => {
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

    // Handle Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      const userData = socketUserMap.get(socket.id);
      if (userData) {
        const { sessionId, userId } = userData;
        
        // Remove participant completely on disconnect
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
