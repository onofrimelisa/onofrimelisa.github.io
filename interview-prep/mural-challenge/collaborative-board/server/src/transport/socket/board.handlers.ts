import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../models/socket-events.js';
import { NoteService } from '../../services/note.service.js';
import { DEFAULT_BOARD_ID } from '../../models/note.model.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const BOARD_ROOM = `board:${DEFAULT_BOARD_ID}`;

// Track users per board (in-memory, per instance)
const boardUsers = new Map<string, Set<string>>();

function getBoardUsers(): string[] {
  const users = boardUsers.get(BOARD_ROOM);
  return users ? Array.from(users) : [];
}

function addUser(username: string): void {
  if (!boardUsers.has(BOARD_ROOM)) {
    boardUsers.set(BOARD_ROOM, new Set());
  }
  boardUsers.get(BOARD_ROOM)!.add(username);
}

function removeUser(username: string): void {
  boardUsers.get(BOARD_ROOM)?.delete(username);
}

export function registerBoardHandlers(io: AppServer, socket: AppSocket, noteService: NoteService): void {
  const username = socket.data.username;

  socket.on('board:join', async (ack) => {
    socket.join(BOARD_ROOM);
    addUser(username);

    const notes = await noteService.getBoardNotes(DEFAULT_BOARD_ID);
    ack({ notes, users: getBoardUsers() });

    socket.to(BOARD_ROOM).emit('board:user-joined', {
      username,
      users: getBoardUsers(),
    });
  });

  socket.on('disconnect', () => {
    removeUser(username);
    socket.to(BOARD_ROOM).emit('board:user-left', {
      username,
      users: getBoardUsers(),
    });
  });
}
