import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../models/socket-events.js';
import { NoteService } from '../../services/note.service.js';
import { DEFAULT_BOARD_ID } from '../../models/note.model.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const BOARD_ROOM = `board:${DEFAULT_BOARD_ID}`;

// Cross-instance user list via Redis adapter's fetchSockets()
async function getBoardUsers(io: AppServer): Promise<string[]> {
  const sockets = await io.in(BOARD_ROOM).fetchSockets();
  return [...new Set(sockets.map((s) => s.data.username))];
}

export function registerBoardHandlers(io: AppServer, socket: AppSocket, noteService: NoteService): void {
  const username = socket.data.username;

  socket.on('board:join', async (ack) => {
    socket.join(BOARD_ROOM);

    const [notes, users] = await Promise.all([
      noteService.getBoardNotes(DEFAULT_BOARD_ID),
      getBoardUsers(io),
    ]);
    ack({ notes, users });

    socket.to(BOARD_ROOM).emit('board:user-joined', {
      username,
      users,
    });
  });

  socket.on('disconnect', async () => {
    const users = await getBoardUsers(io);
    socket.to(BOARD_ROOM).emit('board:user-left', {
      username,
      users,
    });
  });
}
