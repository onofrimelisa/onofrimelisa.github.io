import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectToMongo } from './config/database.js';
import { connectToRedis } from './config/redis.js';
import { MongoNoteRepository } from './repositories/note.repository.js';
import { NoteService } from './services/note.service.js';
import { AuthService } from './services/auth.service.js';
import { createAuthRoutes } from './transport/http/auth.routes.js';
import { createBoardRoutes } from './transport/http/board.routes.js';
import { registerBoardHandlers } from './transport/socket/board.handlers.js';
import { registerNoteHandlers } from './transport/socket/note.handlers.js';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from './models/socket-events.js';

async function main() {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-board';
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
  const INSTANCE_ID = process.env.INSTANCE_ID || 'server';

  // Connect to databases
  const { db } = await connectToMongo(MONGODB_URI);
  const { adapter } = await connectToRedis(REDIS_URL);

  // Create services
  const noteRepository = new MongoNoteRepository(db.collection('notes'));
  const noteService = new NoteService(noteRepository);
  const authService = new AuthService(JWT_SECRET);

  // Create Express app + HTTP server
  const app = express();
  app.use(cors());
  app.use(express.json());
  const httpServer = createServer(app);

  // Create Socket.io server
  const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
    cors: { origin: '*' },
    transports: ['websocket'],
    adapter: adapter as any,
  });

  // HTTP routes (io available now)
  app.use(createAuthRoutes(authService));
  app.use(createBoardRoutes(noteService, authService, io));

  // Socket.io auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const payload = authService.verifyToken(token);
    if (!payload) {
      return next(new Error('Invalid token'));
    }
    socket.data.username = payload.username;
    next();
  });

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log(`[${INSTANCE_ID}] User connected: ${socket.data.username}`);
    registerBoardHandlers(io, socket, noteService);
    registerNoteHandlers(io, socket, noteService);
  });

  httpServer.listen(PORT, () => {
    console.log(`[${INSTANCE_ID}] Server running on port ${PORT}`);
  });
}

main().catch(console.error);
