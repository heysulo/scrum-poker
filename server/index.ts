
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import logger from 'perfect-logger';
import { store } from './store';
import { setupSocket, simulateBotVotes } from './socket';

// Initialize Logger
logger.initialize('ScrumSense', {
  logLevelConsole: 0, // 0 = DEBUG/ALL
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

app.use(cors() as any);
app.use(express.json() as any);

// Request Logging Middleware
app.use((req, res, next) => {
  logger.debug(`[API] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 4000;

// Setup Socket.io logic
setupSocket(io);

// Trigger initial voting for the demo room
setTimeout(() => {
    logger.info('[Server] Starting initial bot votes for room-demo');
    simulateBotVotes(io, 'room-demo');
}, 2000);

// --- REST API ENDPOINTS ---

// List Sessions
app.get('/sessions', (req, res) => {
  const sessions = store.getSessionsList();
  res.json(sessions);
});

// Create Session
app.post('/sessions', (req, res) => {
  const { name, password, creatorName, userId, role } = req.body;
  if (!name || !creatorName || !userId) {
    logger.warn('[API] Create session failed: Missing fields');
    return res.status(400).json({ message: 'Missing name, creatorName, or userId' });
  }
  const result = store.createSession(name, creatorName, userId, password, role);
  logger.info(`[API] Session created: ${result.sessionId} by ${creatorName}`);
  res.status(201).json(result);
});

// Join Session
app.post('/sessions/:id/join', (req, res) => {
  const { id } = req.params;
  const { password, userName, userId, role } = req.body;

  const session = store.getSession(id);
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  if (session.protected && session.password !== password) {
    logger.warn(`[API] Join failed for ${id}: Invalid password`);
    return res.status(401).json({ message: 'Invalid password' });
  }

  if (!userName || !userId) {
    return res.status(400).json({ message: 'Username and UserId are required' });
  }

  const result = store.addParticipant(id, userName, userId, role);
  if (!result) {
     return res.status(500).json({ message: 'Failed to join session' });
  }

  // Return session data along with the userId (confirming it)
  const publicSession = store.getPublicSession(id);
  logger.info(`[API] User ${userName} (${userId}) joined session ${id}`);
  res.json({ userId: result.userId, session: publicSession });
});

// Get Session
app.get('/sessions/:id', (req, res) => {
  const session = store.getPublicSession(req.params.id);
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  res.json(session);
});

// Leave Session
app.post('/sessions/:id/leave', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  store.removeParticipant(id, userId);
  logger.info(`[API] User ${userId} left session ${id}`);
  
  // Broadcast update
  const session = store.getPublicSession(id);
  if (session) {
    io.to(id).emit('session_update', session);
  }
  
  res.status(200).json({ message: 'Left session' });
});

// Kick Participant
app.post('/sessions/:id/kick', (req, res) => {
  const { id } = req.params;
  const { userId, requesterId } = req.body;

  const session = store.getSession(id);
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  // Check if creator is online
  const creator = session.participants[session.creatorId];
  const isCreatorOnline = creator && creator.status === 'online';

  // Permission Check:
  // 1. Requester is the Creator
  // 2. OR Creator is offline (Temporary Admin Mode for everyone)
  if (isCreatorOnline && session.creatorId !== requesterId) {
    logger.warn(`[API] Kick failed: Requester ${requesterId} is not admin of session ${id} and admin is online`);
    return res.status(403).json({ message: 'Only the session admin can kick participants' });
  }

  store.removeParticipant(id, userId);
  logger.info(`[API] User ${userId} kicked by ${requesterId} from session ${id}`);

  // Broadcast update
  const updatedSession = store.getPublicSession(id);
  if (updatedSession) {
    io.to(id).emit('session_update', updatedSession);
  }
  
  res.json({ success: true });
});

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
