import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../models/socket-events.js';
import { NoteService } from '../../services/note.service.js';
import { DEFAULT_BOARD_ID, NoteColor } from '../../models/note.model.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const BOARD_ROOM = `board:${DEFAULT_BOARD_ID}`;

export function registerNoteHandlers(io: AppServer, socket: AppSocket, noteService: NoteService): void {
  const username = socket.data.username;

  socket.on('note:create', async (data, ack) => {
    try {
      const note = await noteService.createNote({
        text: data.text,
        x: data.x,
        y: data.y,
        color: data.color as NoteColor,
        boardId: DEFAULT_BOARD_ID,
        author: username,
      });
      ack(note);
      socket.to(BOARD_ROOM).emit('note:created', note);
    } catch (err) {
      console.error('note:create error:', err);
    }
  });

  socket.on('note:update', async (data) => {
    try {
      const updated = await noteService.updateNoteText(data.id, data.text);
      if (updated) {
        socket.to(BOARD_ROOM).emit('note:updated', {
          id: updated.id,
          text: updated.text,
          updatedAt: updated.updatedAt,
        });
      }
    } catch (err) {
      console.error('note:update error:', err);
    }
  });

  socket.on('note:move', async (data) => {
    try {
      const moved = await noteService.moveNote(data.id, data.x, data.y);
      if (moved) {
        socket.to(BOARD_ROOM).emit('note:moved', {
          id: moved.id,
          x: moved.x,
          y: moved.y,
        });
      }
    } catch (err) {
      console.error('note:move error:', err);
    }
  });
}
