# Design Spec: Real-Time Collaborative Board

> Take-home challenge for Mural — Senior Software Engineer, Admin & IAM

**Date:** 2026-11-17
**Time-box:** ~4 hours
**Author:** Melisa Onofri

---

## 1. Overview

A full-stack prototype of a collaborative board where multiple users can create, edit, and move sticky notes in real time. Changes made by one user are reflected instantly for all other connected users.

### Success Criteria

- Multiple browser tabs can connect as different users to the same board
- Creating, editing, and moving notes syncs in real time across all clients
- Notes persist across server restarts (MongoDB)
- JSON file import loads notes onto the board
- Clean, testable codebase with clear separation of concerns
- Developed using spec-driven design methodology

---

## 2. Development Methodology: Spec-Driven Design

This project follows a **spec-driven development** workflow optimized for AI-assisted implementation. Instead of writing code directly, we define contracts first and implement against them. Every component goes through a structured lifecycle.

### The Workflow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  PROPOSE  │────►│  REVIEW   │────►│  APPLY    │────►│  VERIFY   │
│           │     │           │     │           │     │           │
│ Define the│     │ Validate  │     │ Implement │     │ Confirm   │
│ contract  │     │ correctness│    │ against   │     │ output    │
│ (types,   │     │ and       │     │ the spec  │     │ matches   │
│ interfaces│     │ completeness│   │           │     │ the spec  │
│ schemas)  │     │           │     │           │     │           │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                       │                                  │
                       ▼                                  ▼
                  Revise if                          Fix if
                  incomplete                        divergent
```

### Phase Definitions

**`propose`** — Define the contract before any implementation:
- TypeScript interfaces and types (domain models, event payloads, repository interfaces)
- Socket.io event schemas (client→server and server→client)
- HTTP endpoint contracts (request/response shapes)
- File structure and module boundaries

The spec IS the source of truth. Code is an implementation of the spec, not the other way around.

**`review`** — Validate the proposed contract:
- Are the types complete? No `any`, no missing fields
- Are the interfaces consistent across layers? (e.g., the event payload types used by the transport layer match the service layer's input/output types)
- Does the contract cover all the use cases in the spec?
- Are there ambiguities that could lead to divergent implementations?

**`apply`** — Implement against the reviewed contract:
- Write code that satisfies the interfaces defined in `propose`
- The types are already defined — implementation fills in the behavior
- If the implementation reveals a gap in the spec, go back to `propose` instead of patching ad-hoc

**`verify`** — Confirm the implementation matches the spec:
- Run unit tests (which test against the same interfaces)
- Type-check passes (TypeScript compiler enforces the contracts)
- Manual smoke test: does the feature work as described?
- If verification fails, determine whether the bug is in the implementation (`apply` again) or in the spec (`propose` again)

### How This Maps to Our Implementation

| Implementation Step | propose | review | apply | verify |
|-------------------|---------|--------|-------|--------|
| Domain models | Define `StickyNote`, `NoteColor`, input/output types | Validate completeness, check all fields | Create `note.model.ts` files (server + client) | TypeScript compiles, types are reusable |
| Event contract | Define `ServerToClientEvents`, `ClientToServerEvents` | Validate against use cases (create, edit, move, join) | Create `socket-events.ts`, wire into Socket.io server generics | Events are typed end-to-end |
| Repository layer | Define `INoteRepository` interface | Validate CRUD coverage, check return types | Implement `MongoNoteRepository` + `InMemoryNoteRepository` (for tests) | Unit tests pass against interface |
| Service layer | Define `NoteService` public API (methods, params, returns) | Validate it covers all use cases | Implement business logic | Unit tests with mocked repository |
| Transport layer | Define handler signatures (what each socket event handler does) | Validate handlers map 1:1 to event contract | Implement handlers calling services | Smoke test: events flow correctly |
| Auth | Define `AuthService` interface (login, verify) | Validate JWT flow completeness | Implement JWT generation + Socket.io middleware | Login → token → socket connect works |
| Frontend hooks | Define `useSocket` and `useBoard` return types | Validate they expose all needed operations | Implement hooks | UI renders and syncs |
| Infrastructure | Define Docker Compose services and env vars | Validate connectivity (who talks to whom) | Write docker-compose files, Dockerfiles, nginx.conf | `docker-compose up` runs the full stack |

### Why This Approach

1. **Contracts catch bugs before code exists** — A type mismatch between the event contract and the service layer is caught at `review`, not at runtime
2. **AI implements more accurately against specs** — Giving the AI a clear interface to implement against produces better code than giving it a vague description
3. **The spec is documentation** — The types and interfaces ARE the living documentation. No separate docs to maintain
4. **Testability is built-in** — Interfaces defined at `propose` become the test contracts. The mock repository implements the same interface as the real one
5. **Iteration is cheaper** — Changing a type at `propose` is a one-line change. Changing it after `apply` means refactoring implementation code

### Spec Artifacts

The contracts defined during `propose` phases will be tracked in a `specs/` log documenting each propose→review→apply→verify cycle. This creates an audit trail of design decisions and their implementations.

---

## 3. Architecture

```
┌─────────────┐         WebSocket          ┌─────────────┐        ┌─────────┐
│  React App   │◄════════(Socket.io)═══════►│  Node.js     │◄══════►│ MongoDB  │
│  (Vite + TS) │                            │  (Express +  │        │  (v7)    │
│  Port 5173   │      HTTP (auth, upload)   │   Socket.io) │        │ Port     │
│              │───────────────────────────►│  Port 3000   │        │ 27017    │
└─────────────┘                            └──────┬──────┘        └─────────┘
                                                   │
                                                   │ Pub/Sub
                                                   ▼
                                            ┌─────────────┐
                                            │    Redis     │
                                            │  (v7-alpine) │
                                            │  Port 6379   │
                                            └─────────────┘
       │                                          │                     │
       └──────────────── Docker Compose ──────────┴─────────────────────┘
```

### Services (Docker Compose — Default)

| Service | Image / Build | Port | Purpose |
|---------|--------------|------|---------|
| `client` | Vite dev server | 5173 | React SPA |
| `server` | Node.js + Express + Socket.io | 3000 | REST API + WebSocket server |
| `mongo` | mongo:7 | 27017 | Persistence |
| `redis` | redis:7-alpine | 6379 | Socket.io adapter (Pub/Sub for scaling) |

### Services (Docker Compose — Scaling Demo)

| Service | Image / Build | Port | Purpose |
|---------|--------------|------|---------|
| `nginx` | nginx:alpine | 80 | Load balancer with WebSocket upgrade (no sticky sessions needed) |
| `server-1` | Node.js app | internal | Server instance 1 |
| `server-2` | Node.js app | internal | Server instance 2 |
| `server-3` | Node.js app | internal | Server instance 3 |
| `redis` | redis:7-alpine | 6379 | Cross-instance event relay via Pub/Sub |
| `mongo` | mongo:7 | 27017 | Persistence |
| `client` | Vite dev server | 5173 | React SPA |

### Communication

- **Socket.io** (WebSocket-only transport) — All real-time operations (CRUD on notes, user presence). Uses Redis adapter for cross-instance broadcasting. Engine.io polling phase is skipped (`transports: ['websocket']` on both client and server), which eliminates the need for sticky sessions on the load balancer.
- **HTTP REST** — Authentication (login) and JSON file upload
- **MongoDB native driver** — Data persistence with repository pattern
- **Redis Pub/Sub** — Relays Socket.io broadcast packets between server instances. Even with a single instance, the adapter is wired so the codebase is scaling-ready.

---

## 4. Real-Time Scaling With Redis

### Why Redis Is in the Stack

Socket.io keeps room memberships and connected sockets in-process memory. With a single server this works fine, but with multiple instances each server only sees its own sockets. A broadcast to a room on Server A never reaches sockets on Server B — the board becomes inconsistent.

Redis Pub/Sub solves this by acting as a message bus between instances. The `@socket.io/redis-adapter` intercepts every broadcast and relays it through Redis so all instances deliver the event to their local sockets.

### How It Works

```
User A creates a note (connected to Server 1):

1. Server 1 handler calls socket.to("default").emit("note:created", note)
2. Redis adapter intercepts the broadcast
3. Server 1 delivers to its local sockets in room "default" (fast, no Redis)
4. Server 1 publishes the broadcast packet to Redis channel "socket.io#/"
5. Server 2 and Server 3 receive the packet via their Redis subscription
6. Each checks its local rooms map and delivers to its local sockets in "default"
7. All users across all instances see the new note
```

### What Redis Pub/Sub Does and Doesn't Do

| Does | Doesn't |
|------|---------|
| Relay broadcast packets between server instances | Store messages (fire-and-forget) |
| Enable cross-instance `fetchSockets()` for user presence | Persist connection state across restarts |
| Support `serverSideEmit()` for server-to-server coordination | Replace the in-memory rooms map |
| Work transparently — zero changes to application code | Guarantee delivery if an instance is down |

If an instance is down when a message is published, it misses it. When it comes back, reconnecting clients get the current state via `board:join` from the database. This is acceptable for real-time collaboration.

### Transport: WebSocket Only

Socket.io's Engine.io layer normally starts with HTTP long-polling and then upgrades to WebSocket. This two-phase connection requires sticky sessions on the load balancer (the upgrade request must reach the same server that handled the initial polling).

We skip this by configuring `transports: ['websocket']` on both client and server. The client establishes a WebSocket connection on the very first request — no polling phase, no sticky sessions needed. This simplifies the Nginx config and eliminates a class of connection bugs.

**Tradeoff:** We lose the automatic fallback to HTTP polling in environments where WebSocket is blocked (some corporate proxies, old browsers). Acceptable for this challenge since we control the infrastructure.

### Single Instance vs Multi-Instance

Both Docker Compose configs wire the Redis adapter. The difference:

| Aspect | Default (`docker-compose.yml`) | Scaling (`docker-compose.scaling.yml`) |
|--------|-------------------------------|---------------------------------------|
| Server instances | 1 | 3 |
| Load balancer | None (direct access on port 3000) | Nginx on port 3000 |
| Redis role | Wired but no cross-instance traffic | Active: relaying broadcasts between 3 instances |
| Purpose | Development and basic demo | Demonstrates horizontal scaling works |

The server code is identical in both. The only difference is infrastructure.

### Production Evolution (Write-up)

In production, this would evolve to:
- **Redis Cluster** or **Redis Streams** for high-availability and message durability
- **Auto-scaling** server instances based on connection count
- **Health checks** and graceful shutdown (drain sockets before stopping an instance)
- **Monitoring** Redis Pub/Sub lag and Socket.io connection metrics

---

## 5. Authentication

Simple token-based auth. No login/password — username only.

### Flow

```
┌────────┐                          ┌────────┐
│ Client  │  POST /api/auth/login   │ Server  │
│         │  { username: "María" }  │         │
│         │────────────────────────►│         │
│         │                         │ Generate │
│         │  { token, username }    │ JWT      │
│         │◄────────────────────────│         │
│         │                         │         │
│         │  Socket.io connect      │         │
│         │  auth: { token }        │         │
│         │════════════════════════►│ Verify   │
│         │                         │ JWT in   │
│         │  Connection accepted    │ middleware│
│         │◄════════════════════════│         │
└────────┘                          └────────┘
```

### JWT Payload

```typescript
{
  userId: string;    // UUID generated on first login
  username: string;  // Display name
  iat: number;       // Issued at
  exp: number;       // Expiration (24h)
}
```

### Logout

Client-side: clear localStorage → disconnect socket → show username prompt.

### Demo Flow (Two Users)

1. Tab 1: enter "María" → gets token → connects to board
2. Tab 2: click logout (or open incognito) → enter "Juan" → gets token → connects to board
3. Both tabs see each other's changes in real time

### Production Evolution (Write-up)

In production this would be OAuth 2.0 / SSO with refresh tokens, session management, and SCIM provisioning — exactly what Mural's Admin & IAM team builds.

---

## 6. Data Model

### Collection: `notes`

```typescript
interface StickyNote {
  id: string;          // Server-generated UUID
  text: string;        // Note content (max 500 chars)
  x: number;           // Horizontal position on board
  y: number;           // Vertical position on board
  author: string;      // Username of creator
  color: NoteColor;    // Note color
  boardId: string;     // Board identifier (always "default")
  createdAt: Date;
  updatedAt: Date;
}

type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';
```

**Index:** `{ boardId: 1 }`

### No `boards` Collection

Single default board. The `boardId` field on notes exists so the model supports multiple boards without schema changes — mentioned as a next step in the write-up.

---

## 7. Event Contract (Spec-Driven)

This is the central contract. Defined first, drives all implementation.

### Client → Server

| Event | Payload | Ack | Description |
|-------|---------|-----|-------------|
| `board:join` | — | `(notes: StickyNote[])` | Join default board, receive current state. Username comes from JWT. |
| `note:create` | `{ text, x, y, color }` | `(note: StickyNote)` | Create note. Server responds with full note (includes id, author from JWT). |
| `note:update` | `{ id, text }` | — | Edit note text. |
| `note:move` | `{ id, x, y }` | — | Move note position. Throttled client-side (~50ms). |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `note:created` | `StickyNote` | Another user created a note |
| `note:updated` | `{ id, text, updatedAt }` | Another user edited a note's text |
| `note:moved` | `{ id, x, y }` | Another user moved a note |
| `board:user-joined` | `{ username, users: string[] }` | A user joined. Includes updated user list. |
| `board:user-left` | `{ username, users: string[] }` | A user left. Includes updated user list. |
| `board:notes-imported` | `StickyNote[]` | Notes were imported from a JSON file. Full array of new notes. |

### HTTP Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | No | Send username, receive JWT |
| `POST` | `/api/boards/default/import` | JWT | Upload JSON file with notes array |

### Design Decisions

- **Separate `note:update` and `note:move`**: Move events are frequent (drag) and lightweight (just coordinates). Text updates are infrequent and heavier. Different throttling strategies.
- **Acknowledgements on `note:create` only**: Create needs server-generated ID back. Move and update are fire-and-forget with optimistic UI.
- **Username from JWT, not payload**: The server extracts the author from the validated token, not from client-sent data. Prevents spoofing.

---

## 8. Backend Architecture

Layered architecture with hexagonal principles.

### Structure

```
server/
├── src/
│   ├── models/                    # Domain types and interfaces
│   │   ├── note.model.ts          # StickyNote, NoteColor, CreateNoteInput, etc.
│   │   └── socket-events.ts       # ServerToClientEvents, ClientToServerEvents
│   ├── repositories/              # Data access layer
│   │   └── note.repository.ts     # INoteRepository interface + MongoNoteRepository
│   ├── services/                  # Business logic layer
│   │   ├── note.service.ts        # NoteService (CRUD + validation)
│   │   └── auth.service.ts        # AuthService (JWT generation + verification)
│   ├── transport/                 # External communication layer
│   │   ├── http/
│   │   │   ├── auth.routes.ts     # POST /api/auth/login
│   │   │   └── board.routes.ts    # POST /api/boards/default/import
│   │   └── socket/
│   │       ├── note.handlers.ts   # Socket.io handlers for note events
│   │       ├── board.handlers.ts  # Socket.io handlers for board events (join, presence)
│   │       └── auth.middleware.ts # Socket.io middleware: JWT verification
│   ├── config/
│   │   ├── database.ts            # MongoDB connection
│   │   └── redis.ts               # Redis client creation (pub + sub)
│   └── index.ts                   # Bootstrap: wire dependencies, attach Redis adapter, start server
├── tests/
│   ├── services/
│   │   └── note.service.test.ts
│   └── helpers/
│       └── mock.repository.ts     # In-memory INoteRepository for tests
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Principles

- **Repository interface**: `INoteRepository` abstracts MongoDB. Services depend on the interface. Tests use in-memory mock.
- **Thin transport**: Socket/HTTP handlers parse input and call services. No business logic in handlers.
- **Constructor injection**: Services receive dependencies via constructor. Wired manually in `index.ts` (composition root). No DI framework.
- **Strict event typing**: Socket.io generics with `ServerToClientEvents` / `ClientToServerEvents` interfaces.

---

## 9. Frontend Architecture

### Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Board.tsx              # Canvas area, renders notes, handles click-to-create
│   │   ├── StickyNote.tsx         # Individual note: draggable, editable text
│   │   ├── UsernamePrompt.tsx     # Initial screen to enter username
│   │   └── UserList.tsx           # Connected users indicator
│   ├── hooks/
│   │   ├── useSocket.ts           # Socket.io connection lifecycle + typed event helpers
│   │   └── useBoard.ts            # Board state: notes array, CRUD operations, presence
│   ├── models/
│   │   └── note.model.ts          # StickyNote, NoteColor, event payload types
│   ├── services/
│   │   └── api.ts                 # HTTP client (login, file upload)
│   ├── App.tsx                    # Root: auth gate → board
│   └── main.tsx                   # Vite entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

### State Flow

1. **App.tsx** — Checks localStorage for token. No token → `UsernamePrompt`. Has token → `Board`.
2. **UsernamePrompt** — Input + submit → calls `POST /api/auth/login` → stores token → App re-renders to Board.
3. **useSocket** — Connects to server with `auth: { token }`. Handles reconnection. Exposes typed `emit` and `on`.
4. **useBoard** — On mount, emits `board:join`, receives current notes via ack. Listens for remote events (`note:created`, `note:updated`, `note:moved`, presence). Exposes `createNote`, `updateNote`, `moveNote` that do optimistic update + socket emit.
5. **Board.tsx** — Renders notes with absolute positioning. Click on empty space → new note. Passes handlers to each `StickyNote`.
6. **StickyNote.tsx** — Draggable via mouse events (`onMouseDown/Move/Up`). Double-click to edit text inline. Color displayed as background.

### UX Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Optimistic updates | Update local state immediately, emit to server async | Everything feels instant |
| Drag feedback | Note follows cursor smoothly, throttled emit at ~50ms | Smooth local, efficient network |
| Edit mode | Double-click → inline textarea, blur or Enter to save | Familiar pattern, low friction |
| Create note | Click on empty board space → note appears at click position | Discoverable, direct manipulation |
| Color selection | Color picker on create (simple palette) | Quick, non-blocking |
| Connected users | Small pill/badge showing usernames | Awareness without clutter |
| Connection status | Subtle indicator (green dot / "reconnecting..." text) | User knows if they're synced |
| Transitions | CSS transitions on note position changes from other users | Movement feels natural, not jarring |
| Logout | Button in header/corner → clears token → back to prompt | Easy user switching for demo |

---

## 10. JSON Import

### Auto-Seed on Startup

When running `docker-compose up`, a `seed` service automatically imports `sample-data/notes.json` into the default board. It:

1. Waits for the server to be ready (retry loop with curl)
2. Logs in as `seed-bot` via `POST /api/auth/login` to get a JWT token
3. Imports notes via `POST /api/boards/default/import` with the token

This means the board has sample data from the first moment a user opens it — no manual import needed.

### Manual Import Flow

1. User clicks "Import" button on the board toolbar
2. File picker opens → user selects a `.json` file
3. Client sends file via `POST /api/boards/default/import` with JWT auth
4. Server validates JSON structure (array of objects with required fields)
5. Server bulk-inserts notes into MongoDB with `boardId: "default"`
6. Server broadcasts a single `board:notes-imported` event with the full array of created notes to all connected clients
7. All clients merge the imported notes into their local state

### Validation

The server validates each note in the array:
- `text`: string, required, max 500 chars
- `x`, `y`: number, required
- `color`: must be a valid NoteColor, defaults to "yellow"
- `author`: string, defaults to the importing user's username
- `id` from file is ignored — server generates new IDs

---

## 11. Conflict Resolution

**Strategy:** Last-Write-Wins (LWW) with partial updates.

- **Move conflicts**: Two users moving the same note — last position received by server wins. Acceptable for a prototype.
- **Text conflicts**: Two users editing the same note's text — last text received wins. Acceptable for a prototype.
- **No conflicts**: Two users editing different notes — independent documents, no contention.

### Why This Works for the Prototype

- Partial updates minimize the conflict surface (moving doesn't overwrite text, editing text doesn't overwrite position)
- Real-time sync means the conflict window is very small (milliseconds)
- For the systems design follow-up: discuss OT for text editing, CRDTs for position, and operational awareness (show "user X is editing this note") as production-grade solutions

---

## 12. Testing Strategy

### In Scope

**Server unit tests** (service layer):
- `NoteService.createNote` — validates input, calls repository, returns created note
- `NoteService.updateNote` — validates note exists, partial update
- `NoteService.moveNote` — validates note exists, updates position
- `NoteService.importNotes` — validates JSON structure, bulk creates

Using an in-memory mock of `INoteRepository`. Test framework: Vitest (fast, TypeScript-native, compatible with the Vite toolchain on the frontend).

### Out of Scope (Mentioned as Next Steps)

- Integration tests for Socket.io event flow
- Frontend component tests
- E2E tests

---

## 13. Infrastructure

### Default Docker Compose (`docker-compose.yml`)

Single server instance with Redis adapter already wired. For development and basic demo.

```yaml
services:
  client:
    build: ./client
    ports:
      - '5173:5173'
    depends_on:
      - server

  server:
    build: ./server
    ports:
      - '3000:3000'
    depends_on:
      - mongo
      - redis
    environment:
      MONGODB_URI: mongodb://mongo:27017/collaborative-board
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-change-in-production
      PORT: 3000

  mongo:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  seed:
    image: curlimages/curl:latest
    depends_on:
      - server
    volumes:
      - ./sample-data:/data:ro
      - ./scripts:/scripts:ro
    entrypoint: ["sh", "/scripts/seed.sh"]

volumes:
  mongo-data:
```

### Scaling Docker Compose (`docker-compose.scaling.yml`)

Multiple server instances behind Nginx load balancer. Demonstrates horizontal scaling with Redis Pub/Sub.

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - '3000:80'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - server-1
      - server-2
      - server-3

  server-1:
    build: ./server
    environment:
      MONGODB_URI: mongodb://mongo:27017/collaborative-board
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-change-in-production
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
      JWT_SECRET: dev-secret-change-in-production
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
      JWT_SECRET: dev-secret-change-in-production
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
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - nginx

  seed:
    image: curlimages/curl:latest
    depends_on:
      - nginx
    volumes:
      - ./sample-data:/data:ro
      - ./scripts:/scripts:ro
    entrypoint: ["sh", "/scripts/seed.sh"]
    environment:
      API_URL: http://nginx:80

volumes:
  mongo-data:
```

### Nginx Config (`nginx/nginx.conf`)

```nginx
upstream socket_servers {
    # No sticky sessions needed: Socket.io is configured with
    # transports: ['websocket'] only, skipping the HTTP polling phase.
    # Each client establishes a direct WebSocket connection on first request.

    server server-1:3000;
    server server-2:3000;
    server server-3:3000;
}

server {
    listen 80;

    location / {
        proxy_pass http://socket_servers;

        # WebSocket upgrade headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Long timeout for WebSocket connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

### Redis Adapter Wiring (Server Bootstrap)

```typescript
// config/redis.ts
import { createClient } from 'redis';

export async function createRedisClients(redisUrl: string) {
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  return { pubClient, subClient };
}

// index.ts (composition root)
import { createAdapter } from '@socket.io/redis-adapter';
import { createRedisClients } from './config/redis';

const io = new Server(httpServer, {
  transports: ['websocket'],  // skip Engine.io polling → no sticky sessions needed
  cors: { origin: '*' }
});

const { pubClient, subClient } = await createRedisClients(process.env.REDIS_URL!);
io.adapter(createAdapter(pubClient, subClient));
```

The application code (handlers, services, repositories) requires zero changes. The adapter transparently intercepts `socket.to(room).emit()` calls and relays them through Redis to other instances.

### Running

```bash
# Default (single instance)
docker-compose up --build

# Scaling demo (3 instances + Nginx + Redis)
docker-compose -f docker-compose.scaling.yml up --build
```

Default opens the app at `http://localhost:5173`.
Scaling demo: client at `http://localhost:5173`, API/WebSocket through Nginx at `http://localhost:3000`.

---

## 14. Tech Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + TypeScript + Vite | Modern, fast DX, aligns with JD |
| Backend | Node.js + Express + TypeScript | Aligns with JD (Node.js, TypeScript) |
| Real-time | Socket.io + Redis adapter (WebSocket-only transport) | Rooms, typed events, reconnection, horizontal scaling. No sticky sessions. |
| Database | MongoDB 7 (native driver) | Document-oriented, aligns with JD |
| Scaling | Redis 7 (Pub/Sub) | Cross-instance event relay for Socket.io |
| Load Balancer | Nginx (scaling demo) | Round-robin, WebSocket upgrade support (no sticky sessions — WebSocket-only transport) |
| Auth | JWT (jsonwebtoken) | Simple token flow, relevant to IAM role |
| Testing | Vitest | Fast, TS-native, works for both client and server |
| Infrastructure | Docker Compose (2 configs) | Default (single) + scaling demo (multi-instance) |

---

## 15. Scope

### In Scope

- Username login with JWT token
- Logout / switch user
- Render sticky notes on a board (positioned by x, y)
- Create new sticky notes (text, color, position)
- Edit note text (double-click, inline edit)
- Move notes (drag & drop with real-time sync)
- Import notes from JSON file
- Real-time sync via Socket.io (all operations)
- Redis adapter for Socket.io (scaling-ready from day one)
- Multi-instance scaling demo (3 servers + Nginx + Redis via `docker-compose.scaling.yml`)
- Connected users indicator
- Connection status indicator
- Server unit tests (service layer)
- Docker Compose: default (single instance) + scaling demo (multi-instance)
- README with setup instructions
- Write-up with approach, decisions, tradeoffs

### Out of Scope (Next Steps for Write-up)

- Delete notes
- Multiple boards
- Note resize
- Board zoom/pan
- Real-time cursors
- Undo/redo
- Full OAuth/SSO authentication
- OT/CRDTs for conflict resolution
- Integration / E2E tests
- Rate limiting / input sanitization

---

## 16. Time Budget (Approximate)

| Phase | Time |
|-------|------|
| Project setup (monorepo, Docker, configs, Redis) | 30 min |
| Backend (models, repository, service, auth, transport, Redis adapter) | 60 min |
| Frontend (components, hooks, socket integration) | 75 min |
| JSON import | 15 min |
| Scaling setup (docker-compose.scaling.yml, Nginx config) | 20 min |
| Unit tests | 15 min |
| Polish (UX, edge cases, connection handling) | 10 min |
| README + write-up | 15 min |
| **Total** | **~4 hours** |
