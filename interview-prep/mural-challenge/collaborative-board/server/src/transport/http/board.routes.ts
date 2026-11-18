import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Server } from 'socket.io';
import { AuthService } from '../../services/auth.service.js';
import { NoteService } from '../../services/note.service.js';
import { DEFAULT_BOARD_ID } from '../../models/note.model.js';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../models/socket-events.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export function createBoardRoutes(
  noteService: NoteService,
  authService: AuthService,
  io: AppServer,
): Router {
  const router = Router();

  router.post('/api/boards/default/import', upload.single('file'), async (req: Request, res: Response) => {
    try {
      // Verify JWT
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
      }
      const token = authHeader.slice(7);
      const payload = authService.verifyToken(token);
      if (!payload) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Parse file
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      const content = req.file.buffer.toString('utf-8');
      let notes: any[];
      try {
        notes = JSON.parse(content);
      } catch {
        res.status(400).json({ error: 'Invalid JSON' });
        return;
      }
      if (!Array.isArray(notes)) {
        res.status(400).json({ error: 'JSON must be an array' });
        return;
      }

      const imported = await noteService.importNotes(notes, DEFAULT_BOARD_ID, payload.username);

      // Broadcast to all connected clients
      const BOARD_ROOM = `board:${DEFAULT_BOARD_ID}`;
      io.to(BOARD_ROOM).emit('board:notes-imported', imported);

      res.json({ imported: imported.length });
    } catch (err: any) {
      console.error('Import error:', err);
      res.status(500).json({ error: 'Import failed' });
    }
  });

  return router;
}
