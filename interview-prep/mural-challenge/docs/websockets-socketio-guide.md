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

## 5. Scaling: Multiple Server Instances

Not required for the challenge prototype, but critical for the systems design follow-up interview. This section covers in depth what breaks when you go from one server to many, and how to fix it.

### 5.1 The Single-Instance Model (What We Build in the Challenge)

With one server process, everything lives in memory:

```
┌──────────────────────────────────────────────┐
│                 Server (single process)        │
│                                                │
│  Rooms Map (in memory):                        │
│  ┌──────────────────────────────────────────┐  │
│  │ "default" → [socket_A, socket_B, socket_C]│  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  When socket_A emits to room "default":        │
│  → Server looks up "default" in the map        │
│  → Sends to socket_B and socket_C              │
│  → Works perfectly ✓                           │
└──────────────────────────────────────────────┘
```

Socket.io stores the room-to-sockets mapping in a `Map` inside the process. Broadcasting to a room is just iterating over that map. Fast, simple, zero network overhead.

**This works until you need more than one server.**

### 5.2 The Multi-Instance Problem

When you horizontally scale (multiple server processes behind a load balancer), each process has its **own isolated rooms map**:

```
              ┌─────────────────┐
              │  Load Balancer   │
              └───┬────┬────┬───┘
                  │    │    │
     ┌────────────┘    │    └────────────┐
     ▼                 ▼                 ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Server A  │    │ Server B  │    │ Server C  │
│           │    │           │    │           │
│ Rooms:    │    │ Rooms:    │    │ Rooms:    │
│ "default" │    │ "default" │    │ "default" │
│ → [A, B]  │    │ → [C, D]  │    │ → [E]     │
└──────────┘    └──────────┘    └──────────┘
```

**Problem 1: Partitioned broadcasts**

User A (on Server A) creates a note. Server A broadcasts to room "default" — but it only knows about sockets A and B. Users C, D, and E (on Servers B and C) **never receive the event**. The board is now inconsistent.

**Problem 2: Room state fragmentation**

Each server thinks it has a partial view of the room. Server A thinks "default" has 2 users, Server B thinks it has 2, Server C thinks it has 1. No single server knows the full picture. Features like "show connected users" return wrong counts.

**Problem 3: Targeted emits fail**

If Server A wants to send a message to a specific socket that happens to be on Server B, it can't — it doesn't have a reference to that socket. `io.to(socketId).emit(...)` silently fails.

**Problem 4: Acknowledgements don't cross boundaries**

If a client on Server B emits with an acknowledgement callback, only Server B can call that callback. If the processing logic somehow involves Server A, the ack can't be forwarded.

### 5.3 The Solution: Redis Adapter

The `@socket.io/redis-adapter` package solves all of these problems by using Redis Pub/Sub as a message bus between server instances.

#### How It Works

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Server A  │     │ Server B  │     │ Server C  │
│           │     │           │     │           │
│ Rooms:    │     │ Rooms:    │     │ Rooms:    │
│ [A, B]    │     │ [C, D]    │     │ [E]       │
└─────┬─────┘     └─────┬─────┘     └─────┬─────┘
      │                 │                 │
      │    ┌────────────┴────────────┐    │
      └───►│         Redis           │◄───┘
           │                         │
           │  Channel: "socket.io#/" │
           │                         │
           │  Pub/Sub messages:      │
           │  - broadcast packets    │
           │  - room join/leave      │
           │  - request/response     │
           └─────────────────────────┘
```

**Step by step — what happens when User A creates a note:**

1. User A's socket (on Server A) emits `note:create`
2. Server A's handler calls `socket.to("default").emit("note:created", note)`
3. The Redis adapter intercepts this broadcast
4. Server A delivers to local sockets in "default" (socket B) — this is fast, no Redis involved
5. Server A **publishes** the broadcast packet to Redis channel `socket.io#/`
6. Servers B and C are **subscribed** to this channel
7. Server B receives the packet, checks its local rooms map, finds sockets C and D in "default", delivers to them
8. Server C receives the packet, finds socket E in "default", delivers to it
9. All 5 users now have the note — consistency restored

**Key insight:** Each server still manages its own sockets and rooms locally. Redis only carries the **broadcast messages** between servers. The actual WebSocket connection is always between the client and its specific server.

#### What Redis Pub/Sub Does (and Doesn't Do)

| Does | Doesn't |
|------|---------|
| Relay broadcast packets between server instances | Store messages (fire-and-forget) |
| Enable cross-instance room broadcasting | Replace the in-memory rooms map |
| Support cross-instance `fetchSockets()` for getting all connected sockets | Guarantee delivery if a server is down |
| Handle request-response between instances (for `serverSideEmit`) | Persist connection state across restarts |

**Redis Pub/Sub is fire-and-forget** — if Server C is down when the message is published, it misses it. When it comes back up, clients reconnect and get the current state via `board:join`. This is acceptable for real-time collaboration where the latest state is always available from the database.

### 5.4 Implementation

#### Install Dependencies

```bash
npm install @socket.io/redis-adapter redis
```

#### Server Setup

```typescript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Create Redis clients (adapter needs two: one for pub, one for sub)
const pubClient = createClient({ url: 'redis://redis:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

// Attach the adapter — this is the only change needed
io.adapter(createAdapter(pubClient, subClient));

// Everything else stays exactly the same:
io.on('connection', (socket) => {
  socket.on('board:join', () => {
    socket.join('default');  // works across instances now
  });

  socket.on('note:create', (data, ack) => {
    const note = createNote(data);
    socket.to('default').emit('note:created', note);  // reaches ALL instances
    ack(note);
  });
});
```

**The beauty of the adapter pattern:** your application code doesn't change at all. `socket.join()`, `socket.to().emit()`, `io.to().emit()` — all work exactly the same. The adapter transparently handles cross-instance communication.

#### Two Pub/Sub Clients — Why?

Redis Pub/Sub has a constraint: a client in "subscribe" mode can only receive messages, not publish. So the adapter needs:
- **pubClient** — publishes broadcast packets to Redis
- **subClient** — subscribes to the channel and receives packets from other instances

`pubClient.duplicate()` creates a second connection with the same config. Both connect to the same Redis instance but serve different roles.

#### Advanced: Cross-Instance Socket Queries

With the Redis adapter, you can query sockets across all instances:

```typescript
// Get all sockets in a room, across all server instances
const sockets = await io.in('default').fetchSockets();
console.log(`Total connected: ${sockets.length}`);  // correct count across all instances

// Emit to a specific remote socket
const remoteSocket = sockets.find(s => s.data.username === 'María');
remoteSocket?.emit('notification', { message: 'Hello!' });
```

Without the adapter, `fetchSockets()` only returns local sockets. With it, the adapter makes inter-instance requests through Redis to collect all sockets.

#### Advanced: Server-to-Server Communication

```typescript
// Send a message from this server instance to all other instances
io.serverSideEmit('cache:invalidate', { boardId: 'default' });

// Listen for messages from other instances
io.on('cache:invalidate', ({ boardId }) => {
  invalidateLocalCache(boardId);
});
```

This uses Redis Pub/Sub under the hood but provides a clean API for server-to-server coordination.

### 5.5 Docker Compose for Multi-Instance Setup

Here's how to run multiple server instances with Redis for the scaling demo:

```yaml
# docker-compose.scaling.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - server-1
      - server-2
      - server-3

  server-1:
    build: ./server
    environment:
      MONGODB_URI: mongodb://mongo:27017/collaborative-board
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret
      PORT: 3000
      INSTANCE_ID: server-1
    depends_on:
      - mongo
      - redis

  server-2:
    build: ./server
    environment:
      MONGODB_URI: mongodb://mongo:27017/collaborative-board
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret
      PORT: 3000
      INSTANCE_ID: server-2
    depends_on:
      - mongo
      - redis

  server-3:
    build: ./server
    environment:
      MONGODB_URI: mongodb://mongo:27017/collaborative-board
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret
      PORT: 3000
      INSTANCE_ID: server-3
    depends_on:
      - mongo
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  mongo:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db

  client:
    build: ./client
    ports:
      - '5173:5173'
    depends_on:
      - nginx

volumes:
  mongo-data:
```

#### Nginx Config With Sticky Sessions

Socket.io needs sticky sessions because Engine.io starts with HTTP long-polling before upgrading to WebSocket. The initial polling requests must reach the same server that will later handle the WebSocket upgrade. Without sticky sessions, the upgrade handshake fails because the new server doesn't recognize the Engine.io session ID.

```nginx
# nginx.conf
upstream socket_servers {
    # ip_hash ensures the same client IP always reaches the same server
    # This is the simplest sticky session strategy
    ip_hash;

    server server-1:3000;
    server server-2:3000;
    server server-3:3000;
}

server {
    listen 80;

    location / {
        proxy_pass http://socket_servers;

        # Required headers for WebSocket upgrade
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Timeout for WebSocket connections (default 60s is too short)
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

**Why `ip_hash`?** It's the simplest sticky session strategy — same client IP always goes to the same backend. Downsides: uneven distribution if many clients share an IP (corporate NAT), and changing IP (mobile networks) breaks the session. Production alternatives:

| Strategy | How It Works | Tradeoff |
|----------|-------------|----------|
| `ip_hash` | Hash of client IP → consistent backend | Uneven if clients share IP; breaks on IP change |
| Cookie-based (`sticky cookie`) | Nginx sets a cookie with the backend ID | Requires Nginx Plus or third-party module |
| Socket.io `cookie` option | Socket.io sets its own cookie with server ID | Works with any load balancer that supports cookie affinity |
| Skip polling, WebSocket only | Set `transports: ['websocket']` in Socket.io config | No fallback, but no sticky sessions needed — the upgrade happens on first request |

**WebSocket-only transport** is the simplest solution if you control the infrastructure:

```typescript
// Server
const io = new Server(httpServer, {
  transports: ['websocket']  // skip polling entirely
});

// Client
const socket = io('http://localhost', {
  transports: ['websocket']
});
```

This eliminates the sticky session requirement entirely because there's no HTTP polling phase — the client upgrades to WebSocket on the first request. The tradeoff is losing the automatic fallback to polling in environments where WebSocket is blocked (some corporate proxies, old browsers).

### 5.6 Scaling Beyond Redis Pub/Sub

For very high-throughput systems (millions of concurrent connections), Redis Pub/Sub has limitations:

| Limitation | Why It Matters | Alternative |
|-----------|---------------|-------------|
| All instances receive all messages | Server C receives broadcasts for rooms it has no sockets in — wasted CPU | Redis Streams with consumer groups, or sharded Pub/Sub (Redis 7+) |
| Fire-and-forget | If an instance is down during publish, messages are lost | Redis Streams for durability |
| Single Redis bottleneck | All traffic goes through one Redis instance | Redis Cluster, or separate Redis per shard |
| Memory | High-throughput Pub/Sub can pressure Redis memory | Dedicated Redis instance for Socket.io, separate from application cache |

**Socket.io also supports other adapters:**

| Adapter | Use Case |
|---------|----------|
| `@socket.io/redis-adapter` | Standard horizontal scaling (most common) |
| `@socket.io/redis-streams-adapter` | When you need message durability (Redis Streams) |
| `@socket.io/cluster-adapter` | Node.js Cluster module (single machine, multiple cores) |
| `@socket.io/mongo-adapter` | If you already have MongoDB and don't want to add Redis |
| Custom adapter | Implement your own for Kafka, RabbitMQ, etc. |

### 5.7 Scaling Decision Tree

```
                     ┌─────────────────────┐
                     │ How many concurrent  │
                     │ connections?         │
                     └──────────┬──────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              < 10,000                 > 10,000
                    │                       │
            ┌───────▼───────┐       ┌───────▼───────┐
            │ Single server  │       │ Multiple       │
            │ (our prototype)│       │ instances?     │
            └───────────────┘       └───────┬───────┘
                                            │
                                ┌───────────┴───────────┐
                                │                       │
                          < 100,000                > 100,000
                                │                       │
                        ┌───────▼───────┐       ┌───────▼───────┐
                        │ Redis Pub/Sub  │       │ Redis Streams  │
                        │ + Nginx        │       │ or sharded     │
                        │ (ip_hash)      │       │ Pub/Sub +      │
                        └───────────────┘       │ Redis Cluster   │
                                                └───────────────┘
```

For the challenge: single instance. For the systems design follow-up: discuss the Redis Pub/Sub path with the ability to articulate why and when you'd move to Redis Streams or sharding.

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
