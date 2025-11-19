import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { store } from './store';
import { setupSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

app.use(cors() as express.RequestHandler);
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Setup Socket.io logic
setupSocket(io);

// --- REST API ENDPOINTS ---

// List Sessions
app.get('/sessions', (req, res) => {
  const sessions = store.getSessionsList();
  res.json(sessions);
});

// Create Session
app.post('/sessions', (req, res) => {
  const { name, password, creatorName } = req.body;
  if (!name || !creatorName) {
    return res.status(400).json({ message: 'Missing name or creatorName' });
  }
  const result = store.createSession(name, creatorName, password);
  res.status(201).json(result);
});

// Join Session
app.post('/sessions/:id/join', (req, res) => {
  const { id } = req.params;
  const { password, userName } = req.body;

  const session = store.getSession(id);
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  if (session.protected && session.password !== password) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  if (!userName) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const result = store.addParticipant(id, userName);
  if (!result) {
     return res.status(500).json({ message: 'Failed to join session' });
  }

  // Return session data along with new userId
  const publicSession = store.getPublicSession(id);
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
  res.status(200).json({ message: 'Left session' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});