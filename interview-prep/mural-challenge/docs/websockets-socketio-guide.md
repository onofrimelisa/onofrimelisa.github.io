# WebSockets & Socket.io — Guide for Senior Devs

> A guide for senior developers who know HTTP and REST but haven't worked with WebSockets or Socket.io. Covers the mental model, how it works under the hood, and why we chose it for this challenge.

---

## 1. The Problem It Solves

In classic HTTP, communication is **request-response**: the client asks, the server responds, the connection closes (or is reused, but the server never initiates communication). If you want the server to notify the client that something changed, you have two poor options:

- **Polling:** The client asks every N seconds "anything new?". Wastes bandwidth and adds latency (on average, N/2 seconds).
- **Long polling:** The client makes a request and the server "holds" it until there's data. It works, but it's a hack — each message requires a full HTTP cycle (headers, handshake, overhead).

WebSockets solves this with a **persistent bidirectional channel**: once the connection is established, both sides can send messages at any time without HTTP overhead.

---

## 2. WebSockets: The Protocol

### Handshake

WebSocket starts as a normal HTTP request with an `Upgrade` header:

```
GET /ws HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

The server responds with `101 Switching Protocols` and from that point the TCP connection is "upgraded" — it's no longer HTTP, it's a bidirectional binary channel.

### Mental Model

Think of WebSocket as a **TCP tunnel with framing**:

```
┌──────────┐                        ┌──────────┐
│  Client   │◄══════ TCP tunnel ═════►│  Server  │
│           │   (messages in both     │          │
│           │    directions)          │          │
└──────────┘                        └──────────┘
```

- **No request/response** — either side sends a "message" whenever it wants
- **Messages are frames** — can be text (UTF-8) or binary
- **The connection persists** — it doesn't close after each message
- **Heartbeat (ping/pong)** — the protocol includes control frames to detect dead connections

### Native Browser API

```typescript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'join', boardId: 'board_1' }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // handle message
};

ws.onclose = (event) => {
  // manual reconnect logic
};
```

The native API is **very low level**: no automatic reconnection, no rooms, no broadcast, no fallback if WebSocket is unavailable. That's where Socket.io comes in.

---

## 3. Socket.io: The Abstraction

Socket.io **is not** a WebSocket implementation — it's a **custom protocol** that uses WebSocket as its primary transport. It adds a functionality layer on top.

### What It Adds Over Native WebSocket

| Feature | Native WebSocket | Socket.io |
|---------|-----------------|-----------|
| Automatic reconnection | No | Yes, with exponential backoff |
| Fallback (HTTP long-polling) | No | Yes, transparent |
| Rooms (logical groups) | No | Yes, built-in |
| Broadcasting | Manual | `io.to(room).emit()` |
| Typed events | No (only `message`) | Yes, custom named events |
| Acknowledgements | No | Yes, per-message callbacks |
| Middlewares | No | Yes, like Express |
| Binary support | Yes (manual) | Yes (automatic) |
| Multiplexing (namespaces) | No | Yes |

### Internal Architecture

```
┌─────────────────────────────────────────────────┐
│                   Socket.io                      │
│                                                  │
│  ┌─────────────┐    ┌────────────────────────┐  │
│  │   Engine.io  │    │  Socket.io Protocol     │  │
│  │  (transport) │    │  (rooms, events, acks)  │  │
│  │             │    │                          │  │
│  │  1. Polling  │    │  - Namespaces            │  │
│  │  2. WebSocket│    │  - Rooms                 │  │
│  │             │    │  - Broadcasting           │  │
│  └─────────────┘    └────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Engine.io** handles transport: it starts with HTTP long-polling (to traverse proxies/firewalls) and automatically upgrades to WebSocket. This means Socket.io **always connects**, even in restrictive environments.

**Socket.io Protocol** handles high-level logic: named events, acknowledgements, rooms, namespaces.

### Server-side (Node.js + TypeScript)

```typescript
import { Server } from 'socket.io';
import { createServer } from 'http';

// Event typing — this is key in TypeScript
interface ServerToClientEvents {
  'note:created': (note: StickyNote) => void;
  'note:updated': (note: Partial<StickyNote> & { id: string }) => void;
  'note:deleted': (noteId: string) => void;
}

interface ClientToServerEvents {
  'note:create': (data: CreateNotePayload, ack: (note: StickyNote) => void) => void;
  'note:update': (data: UpdateNotePayload) => void;
  'note:delete': (noteId: string) => void;
  'board:join': (boardId: string) => void;
}

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  // socket is 100% typed here

  socket.on('board:join', (boardId) => {
    socket.join(boardId);  // joins the board's room
  });

  socket.on('note:create', (data, ack) => {
    const note = createNote(data);
    // broadcast to everyone in the room EXCEPT the sender
    socket.to(data.boardId).emit('note:created', note);
    // acknowledge to the sender with the created note (includes id)
    ack(note);
  });

  socket.on('note:update', (data) => {
    updateNote(data);
    socket.to(data.boardId).emit('note:updated', data);
  });
});
```

### Client-side (React + TypeScript)

```typescript
import { io, Socket } from 'socket.io-client';

// Same typing — shared between client and server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000');

// Emit with acknowledgement
socket.emit('note:create', payload, (createdNote) => {
  // the server confirms and returns the note with id
  addNoteToState(createdNote);
});

// Listen for events from other users
socket.on('note:created', (note) => {
  addNoteToState(note);
});
```

### Rooms: The Key Concept for Collaborative Boards

A **room** is a server-side logical channel. Sockets join and leave rooms. When you broadcast to a room, only sockets in that room receive the message.

```
Board "board_abc"  (Room)
├── User A  (Socket)
├── User B  (Socket)
└── User C  (Socket)

Board "board_xyz"  (Room)
├── User D  (Socket)
└── User E  (Socket)
```

```typescript
// User A creates a note in board_abc
socket.to('board_abc').emit('note:created', note);
// → User B and C receive it. User D and E don't.
```

This maps directly to our use case: **each board is a room**.

---

## 4. Comparison With Alternatives

### vs Server-Sent Events (SSE)

| Aspect | Socket.io (WebSocket) | SSE |
|--------|----------------------|-----|
| Direction | Bidirectional | Server → Client only |
| Client writes | Through the same channel | Requires separate HTTP requests |
| Protocol | WebSocket (binary) | HTTP (text/event-stream) |
| Reconnection | Automatic (Socket.io) | Automatic (browser native) |
| Rooms/Broadcasting | Built-in | Manual (maintain connection list) |
| Compatibility | Requires upgrade | Works over standard HTTP |
| Scaling | Requires sticky sessions or Redis adapter | Easier stateless (each write is HTTP) |
| Complexity | Medium | Low |

**When SSE is better:** Dashboards, news feeds, notifications — where the client mostly reads and rarely writes (via REST). Simpler to scale because writes are stateless HTTP.

**When WebSocket is better:** Real-time collaboration, chat, games — where both sides send messages frequently and latency matters. For a collaborative board where a user drags notes and everyone sees the movement in real time, WebSocket is the natural choice.

### vs HTTP Polling / Long Polling

| Aspect | Socket.io | Polling | Long Polling |
|--------|-----------|---------|-------------|
| Latency | ~instant | N/2 sec average | Variable |
| Overhead per message | Minimal (frame headers) | Full HTTP request | Full HTTP request |
| Connections to server | 1 persistent | 1 per interval | 1 "hanging" + reconnect |
| Server complexity | Medium | Low | Medium |
| Real-time feel | Yes | No | Approximate |

**Polling is viable** only when real-time isn't critical and you want the simplest possible implementation. For a challenge that explicitly asks for "real-time collaboration", it's not a good signal.

### vs Native WebSocket (without Socket.io)

| Aspect | Socket.io | Native WebSocket |
|--------|-----------|-----------------|
| Reconnection | Automatic with backoff | Manual |
| Typed events | Yes | Only `message` (manual JSON parsing) |
| Rooms | Built-in | Implement from scratch |
| Fallback | Automatic HTTP polling | None |
| Middlewares | Yes | No |
| Overhead | ~2KB extra protocol | Minimal |
| Interoperability | Only Socket.io clients | Any WebSocket client |

**Native WebSocket is better** when you need interoperability with non-Socket.io clients, or when minimal overhead matters (AAA games, financial data streaming). For a prototype with a 4-hour time-box, Socket.io saves hours of boilerplate.

---

## 5. Scaling Considerations

Not required for the challenge, but critical for the systems design follow-up:

### The Problem: In-Memory State

Socket.io keeps rooms in process memory. With a single server, everything works. With multiple servers (horizontal scaling), a user connected to Server A doesn't receive events emitted from Server B.

### The Solution: Redis Adapter

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Server A  │     │ Server B  │     │ Server C  │
│ (rooms)   │◄───►│ (rooms)   │◄───►│ (rooms)   │
└─────┬─────┘     └─────┬─────┘     └─────┬─────┘
      │                 │                 │
      └────────┬────────┴────────┬────────┘
               │   Redis Pub/Sub  │
               └──────────────────┘
```

Socket.io has a `@socket.io/redis-adapter` that uses Redis Pub/Sub to synchronize events between instances. When Server A emits to a room, the message goes through Redis and reaches the sockets in that room on Server B and C.

### Sticky Sessions

Because Engine.io starts with HTTP polling before upgrading to WebSocket, the first requests must reach the same server. This requires sticky sessions on the load balancer (by IP or by cookie).

---

## 6. Patterns Relevant to the Challenge

### Optimistic Updates

```typescript
// Client-side: update UI immediately, without waiting for the server
const moveNote = (noteId: string, x: number, y: number) => {
  // 1. Update local state (optimistic)
  updateLocalNote(noteId, { x, y });

  // 2. Send to server
  socket.emit('note:update', { id: noteId, x, y });
};

// If the server rejects, revert (in a more robust system)
```

### Position Throttling (Drag & Drop)

When a user drags a note, we don't want to emit an event for every pixel. Throttle to ~30-60ms:

```typescript
const throttledMove = throttle((noteId: string, x: number, y: number) => {
  socket.emit('note:move', { id: noteId, x, y });
}, 50);
```

### Acknowledgements for Critical Operations

For creating or deleting notes, use acknowledgements to confirm the server processed the operation:

```typescript
socket.emit('note:create', payload, (response) => {
  if (response.error) {
    // rollback optimistic update
  }
});
```

---

## 7. Summary: Why Socket.io for This Challenge

1. **Direct domain mapping**: board = room, users = sockets, operations = typed events
2. **TypeScript first-class**: shared interfaces between client and server
3. **Development speed**: rooms, broadcasting, reconnection — all built-in
4. **Signal to the interviewer**: it's the technology Mural would use for their actual product
5. **Systems design ready**: the rooms + Redis adapter model gives plenty to discuss in the next interview
6. **4-hour time-box**: no time to implement rooms and reconnection from scratch with native WebSocket
