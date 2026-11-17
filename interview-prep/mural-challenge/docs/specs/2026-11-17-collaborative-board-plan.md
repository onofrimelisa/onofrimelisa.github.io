# Real-Time Collaborative Board — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack real-time collaborative board with sticky notes for Mural's take-home challenge.

**Architecture:** Monorepo with `server/` (Node.js + Express + Socket.io + TypeScript) and `client/` (React + Vite + TypeScript). MongoDB for persistence, Redis adapter for Socket.io horizontal scaling. Layered backend with hexagonal principles (repository interface, service layer, thin transport).

**Tech Stack:** React, Vite, TypeScript, Node.js, Express, Socket.io, MongoDB (native driver), Redis (Pub/Sub adapter), Nginx, Docker Compose, Vitest, JWT.

**Methodology:** Spec-Driven Development (SDD) using OpenSpec CLI. Each component is implemented through a change lifecycle: `opsx-propose` → `opsx-apply` → `opsx-sync` → `opsx-archive`. Slash commands live in each service's `.claude/commands/` directory.

**Spec:** `docs/specs/2026-11-17-collaborative-board-design.md`

---

## OpenSpec Change Lifecycle

Every feature follows this cycle:

```
opsx-propose <change-name>     → Creates proposal.md, design.md, tasks.md, specs/
opsx-apply <change-name>       → Implements tasks from the change
opsx-sync <change-name>        → Syncs delta specs to main specs
opsx-archive <change-name>     → Moves completed change to archive/
```

Each service has its own OpenSpec setup:

```
server/
├── openspec/
│   ├── config.yaml            # Schema, context, rules for server
│   ├── changes/               # Active changes
│   │   └── <change-name>/
│   │       ├── proposal.md
│   │       ├── design.md
│   │       ├── tasks.md
│   │       └── specs/         # Delta specs
│   └── specs/                 # Main specs (synced from completed changes)
├── .claude/
│   └── commands/              # opsx-propose, opsx-apply, opsx-sync, opsx-archive, opsx-explore, opsx-update
└── ...

client/
├── openspec/
│   ├── config.yaml
│   ├── changes/
│   └── specs/
├── .claude/
│   └── commands/
└── ...
```

---

## Phase 1: Project Scaffolding

### Task 1: Initialize monorepo structure

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `client/package.json` (via Vite scaffold)
- Create: `client/tsconfig.json` (via Vite scaffold)

- [ ] **Step 1: Create server directory and initialize package.json**

```bash
cd /path/to/mural-challenge
mkdir -p server/src/{models,repositories,services,transport/{http,socket},config}
mkdir -p server/tests/{services,helpers}
```

- [ ] **Step 2: Create server/package.json**

```json
{
  "name": "collaborative-board-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@socket.io/redis-adapter": "^8.3.0",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "mongodb": "^6.10.0",
    "multer": "^1.4.5-lts.1",
    "redis": "^4.7.0",
    "socket.io": "^4.8.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/multer": "^1.4.12",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 4: Scaffold client with Vite**

```bash
cd /path/to/mural-challenge
npm create vite@latest client -- --template react-ts
```

- [ ] **Step 5: Add client dependencies**

```bash
cd client
npm install socket.io-client
npm install -D @types/node
```

- [ ] **Step 6: Install server dependencies**

```bash
cd ../server
npm install
```

- [ ] **Step 7: Commit**

```bash
git add server/ client/
git commit -m "feat: scaffold monorepo with server and client projects"
```

### Task 2: Setup OpenSpec CLI + Slash Commands

**Files:**
- Create: `server/openspec/config.yaml`
- Create: `server/openspec/changes/` (empty dir)
- Create: `server/openspec/specs/` (empty dir)
- Create: `server/.claude/commands/opsx-propose.md`
- Create: `server/.claude/commands/opsx-apply.md`
- Create: `server/.claude/commands/opsx-sync.md`
- Create: `server/.claude/commands/opsx-archive.md`
- Create: `server/.claude/commands/opsx-explore.md`
- Create: `server/.claude/commands/opsx-update.md`
- Create: `client/openspec/config.yaml`
- Create: `client/openspec/changes/` (empty dir)
- Create: `client/openspec/specs/` (empty dir)
- Create: `client/.claude/commands/opsx-propose.md`
- Create: `client/.claude/commands/opsx-apply.md`
- Create: `client/.claude/commands/opsx-sync.md`
- Create: `client/.claude/commands/opsx-archive.md`
- Create: `client/.claude/commands/opsx-explore.md`
- Create: `client/.claude/commands/opsx-update.md`

- [ ] **Step 1: Create server OpenSpec config**

```yaml
# server/openspec/config.yaml

schema: spec-driven

context: |
  We are building the backend for a real-time collaborative board with sticky notes.
  Tech Stack:
    - Node.js + TypeScript (strict mode)
    - Express for HTTP routes (auth login, JSON import)
    - Socket.io for real-time events (WebSocket-only transport)
    - MongoDB 7 with native driver (not Mongoose)
    - Redis 7 for Socket.io Pub/Sub adapter (horizontal scaling)
    - JWT for authentication (username-only login, no passwords)
    - Vitest for unit testing

  Architecture:
    - Layered with hexagonal principles
    - Repository interface (INoteRepository) with concrete MongoNoteRepository
    - Service layer (NoteService, AuthService) with constructor injection
    - Thin transport layer: Socket.io handlers and Express routes only parse input and call services
    - No DI framework — manual constructor injection in composition root (index.ts)

  Key patterns:
    - Spec-driven development: define contracts (types, interfaces, events) before implementation
    - Separate events for move (note:move, frequent/throttled) vs text update (note:update, infrequent)
    - Last-write-wins conflict resolution with partial updates
    - Single default board (boardId: "default")

  Conventions:
    - Domain types in models/
    - Repository interface + implementation in repositories/
    - Business logic in services/
    - Socket.io handlers in transport/socket/
    - Express routes in transport/http/
    - MongoDB + Redis connection in config/

rules:
  proposal:
    - Keep proposals focused on the specific component or change, not the whole system.
    - Reference the design spec at ../docs/specs/2026-11-17-collaborative-board-design.md for context.
  design:
    - Must respect layered architecture boundaries (transport → service → repository).
    - Services depend on repository interfaces, not concrete implementations.
    - Socket.io handlers and Express routes are thin — parse input, call service, emit/respond.
  tasks:
    - Each task must be independently verifiable.
    - Include exact TypeScript code for types and interfaces.
    - Include verification commands (tsc --noEmit, vitest run).
```

- [ ] **Step 2: Create client OpenSpec config**

```yaml
# client/openspec/config.yaml

schema: spec-driven

context: |
  We are building the frontend for a real-time collaborative board with sticky notes.
  Tech Stack:
    - React 18 + TypeScript (strict mode)
    - Vite for build tooling
    - Socket.io-client for real-time events (WebSocket-only transport)
    - CSS (plain, no CSS-in-JS or preprocessors)

  Architecture:
    - Functional components with hooks
    - Custom hooks for state management (useSocket, useBoard)
    - API service layer for HTTP calls (login, import)
    - Domain types mirrored from server (not shared — each project defines its own)

  Key patterns:
    - Optimistic updates: UI updates immediately, server sync is async
    - Throttled drag events (~50ms) to avoid flooding Socket.io
    - CSS transitions on notes from other users (smooth position updates)
    - Auth gate: UsernamePrompt → Board component

  Conventions:
    - Domain types in models/
    - React hooks in hooks/
    - React components in components/
    - HTTP API service in services/

rules:
  proposal:
    - Keep proposals focused on the specific component or hook.
    - Reference the design spec at ../docs/specs/2026-11-17-collaborative-board-design.md for context.
  design:
    - Components should be small and focused (one responsibility).
    - Business logic goes in hooks, not components.
    - Components are thin: render + call hook functions.
  tasks:
    - Each task must be independently verifiable.
    - Include exact TypeScript/TSX code.
```

- [ ] **Step 3: Copy OpenSpec slash commands to both services**

Copy the 6 OpenSpec slash commands from the reference implementation at `/Users/melisaonofri/Documents/Personal/interviews/canals-interview/canals-service/.claude/commands/` into both `server/.claude/commands/` and `client/.claude/commands/`:

```bash
mkdir -p server/.claude/commands client/.claude/commands
mkdir -p server/openspec/{changes,specs} client/openspec/{changes,specs}

# Copy slash commands to both services
for cmd in opsx-propose opsx-apply opsx-sync opsx-archive opsx-explore opsx-update; do
  cp /Users/melisaonofri/Documents/Personal/interviews/canals-interview/canals-service/.claude/commands/${cmd}.md server/.claude/commands/
  cp /Users/melisaonofri/Documents/Personal/interviews/canals-interview/canals-service/.claude/commands/${cmd}.md client/.claude/commands/
done
```

- [ ] **Step 4: Commit**

```bash
git add server/openspec/ server/.claude/ client/openspec/ client/.claude/
git commit -m "feat: setup OpenSpec CLI config and slash commands for both services"
```

---

## Phase 2: Backend Changes (via OpenSpec)

Each change follows the OpenSpec lifecycle: `opsx-propose` → review artifacts → `opsx-apply` → `opsx-sync` → `opsx-archive`.

Run all backend changes from the `server/` directory.

### Change 1: `domain-models`

**Propose command:**
```
/project:opsx-propose domain-models
```

**Context to provide:**
```
Implement all domain model types for the collaborative board.

Models needed (see ../docs/specs/2026-11-17-collaborative-board-design.md Section 6):

1. StickyNote interface:
   - id (string), text (string), x (number), y (number), author (string)
   - color (NoteColor), boardId (string), createdAt (Date), updatedAt (Date)

2. NoteColor type: 'yellow' | 'blue' | 'green' | 'pink' | 'orange'
   - Also export NOTE_COLORS array constant

3. Input types:
   - CreateNoteInput: text, x, y, color, boardId, author
   - UpdateNoteInput: text
   - MoveNoteInput: x, y
   - ImportNoteInput: text, x, y, color? (optional), author? (optional)

4. Constants:
   - DEFAULT_BOARD_ID = 'default'
   - MAX_NOTE_TEXT_LENGTH = 500

Constraints:
- File: src/models/note.model.ts
- Export all types and constants
- Types must match the event contract in design spec Section 7
```

**After propose → apply → sync → archive, expected result:**
- `src/models/note.model.ts` with all types
- Spec synced to `openspec/specs/domain/models/spec.md`

---

### Change 2: `socket-events`

**Propose command:**
```
/project:opsx-propose socket-events
```

**Context to provide:**
```
Define the typed Socket.io event contract for the collaborative board.

Events (see ../docs/specs/2026-11-17-collaborative-board-design.md Section 7):

1. ClientToServerEvents:
   - 'board:join': (ack: (notes: StickyNote[]) => void) => void
   - 'note:create': (data: { text, x, y, color }, ack: (note: StickyNote) => void) => void
   - 'note:update': (data: { id, text }) => void
   - 'note:move': (data: { id, x, y }) => void

2. ServerToClientEvents:
   - 'note:created': (note: StickyNote) => void
   - 'note:updated': (data: { id, text, updatedAt }) => void
   - 'note:moved': (data: { id, x, y }) => void
   - 'board:user-joined': (data: { username, users }) => void
   - 'board:user-left': (data: { username, users }) => void
   - 'board:notes-imported': (notes: StickyNote[]) => void

3. SocketData: { username: string }

Import StickyNote from note.model.ts.

Constraints:
- File: src/models/socket-events.ts
- These interfaces are used by Socket.io Server<ServerToClientEvents, ClientToServerEvents, {}, SocketData>
```

---

### Change 3: `repository-interface`

**Propose command:**
```
/project:opsx-propose repository-interface
```

**Context to provide:**
```
Define the INoteRepository interface and implement MongoNoteRepository.

Interface (see ../docs/specs/2026-11-17-collaborative-board-design.md Section 8):

INoteRepository:
  - findByBoardId(boardId: string): Promise<StickyNote[]>
  - create(input: CreateNoteInput): Promise<StickyNote>
  - updateText(id: string, text: string): Promise<StickyNote | null>
  - updatePosition(id: string, x: number, y: number): Promise<StickyNote | null>
  - createMany(inputs: CreateNoteInput[]): Promise<StickyNote[]>

MongoNoteRepository implements INoteRepository using MongoDB native driver:
  - constructor(collection: Collection)
  - Generates UUID for id field
  - Sets createdAt/updatedAt on create
  - Uses $set with updatedAt on updates
  - Uses insertMany for createMany

Also implement InMemoryNoteRepository for testing:
  - Stores notes in a Map<string, StickyNote>
  - Same interface, in-memory operations

Also create database.ts config:
  - connectToMongo(uri: string): Promise<{ db, client }>
  - Create index on boardId

Constraints:
- Interface + MongoNoteRepository: src/repositories/note.repository.ts
- InMemoryNoteRepository: tests/helpers/mock.repository.ts
- Database config: src/config/database.ts
```

---

### Change 4: `services`

**Propose command:**
```
/project:opsx-propose services
```

**Context to provide:**
```
Implement AuthService and NoteService.

AuthService (see spec Section 5):
  - constructor(jwtSecret: string)
  - login(username: string): { token, username } — generates JWT with { username } payload, 24h expiry
  - verifyToken(token: string): { username } | null — verifies JWT, returns payload or null

NoteService (see spec Sections 7-10):
  - constructor(noteRepository: INoteRepository)
  - createNote(input: CreateNoteInput): Promise<StickyNote> — validates text (non-empty, max 500 chars), delegates to repo
  - updateNoteText(id: string, text: string): Promise<StickyNote | null> — validates text, delegates to repo
  - moveNote(id: string, x: number, y: number): Promise<StickyNote | null> — delegates to repo
  - getBoardNotes(boardId: string): Promise<StickyNote[]> — delegates to repo
  - importNotes(notes: ImportNoteInput[], boardId: string, author: string): Promise<StickyNote[]> — validates each note, sets defaults, bulk creates

Also create unit tests with Vitest:
  - Test NoteService with InMemoryNoteRepository
  - Test createNote (happy path, empty text, long text)
  - Test updateNoteText, moveNote, getBoardNotes
  - Test importNotes (happy path, validation)

Constraints:
- AuthService: src/services/auth.service.ts (uses jsonwebtoken package)
- NoteService: src/services/note.service.ts
- Tests: tests/services/note.service.test.ts
- Services use constructor injection — depend on INoteRepository interface, not concrete implementation
```

---

### Change 5: `transport-layer`

**Propose command:**
```
/project:opsx-propose transport-layer
```

**Context to provide:**
```
Implement Socket.io handlers and Express routes.

Socket.io handlers (see spec Section 7):

1. Auth middleware: verifies JWT token from socket.handshake.auth.token, sets socket.data.username
2. Board handlers:
   - board:join → calls noteService.getBoardNotes, joins socket to room, emits board:user-joined to room
   - disconnect → emits board:user-left to room
3. Note handlers:
   - note:create → calls noteService.createNote, ack result, broadcast note:created to room (exclude sender)
   - note:update → calls noteService.updateNoteText, broadcast note:updated to room (exclude sender)
   - note:move → calls noteService.moveNote, broadcast note:moved to room (exclude sender)

Express routes (see spec Section 7):

1. POST /api/auth/login — body: { username }, returns { token, username }
2. POST /api/boards/default/import — multer file upload, JWT auth header, parses JSON, calls noteService.importNotes, broadcasts board:notes-imported via io.to(room)

Constraints:
- Socket handlers: src/transport/socket/board.handlers.ts, src/transport/socket/note.handlers.ts
- HTTP routes: src/transport/http/auth.routes.ts, src/transport/http/board.routes.ts
- Handlers are thin: parse input → call service → emit/respond
- Use typed Socket.io server: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
```

---

### Change 6: `server-bootstrap`

**Propose command:**
```
/project:opsx-propose server-bootstrap
```

**Context to provide:**
```
Wire everything together in the composition root (index.ts) and add Redis adapter config.

Composition root (see spec Section 8):
  - Connect to MongoDB
  - Connect to Redis (pub + sub clients)
  - Create MongoNoteRepository
  - Create NoteService, AuthService
  - Create Express app with CORS
  - Create HTTP server
  - Create Socket.io server with WebSocket-only transport, Redis adapter
  - Register HTTP routes
  - Register Socket.io auth middleware and event handlers
  - Start server on PORT env var

Redis config (see spec Section 4):
  - src/config/redis.ts: connectToRedis(url: string) → { pubClient, subClient }
  - Uses @socket.io/redis-adapter createAdapter

Environment variables:
  - MONGODB_URI, REDIS_URL, JWT_SECRET, PORT

Constraints:
- Composition root: src/index.ts
- Redis config: src/config/redis.ts
- No DI framework — manual constructor injection
- WebSocket-only: transports: ['websocket'] in Socket.io server config
```

---

## Phase 3: Frontend Changes (via OpenSpec)

Run all frontend changes from the `client/` directory.

### Change 7: `client-models`

**Propose command:**
```
/project:opsx-propose client-models
```

**Context to provide:**
```
Define client-side domain types that mirror the server types.

Types needed (mirror of server types for the client):

1. StickyNote interface: id, text, x, y, author, color (NoteColor), boardId, createdAt (Date), updatedAt (Date)
2. NoteColor type: 'yellow' | 'blue' | 'green' | 'pink' | 'orange'
3. NOTE_COLORS array constant
4. ServerToClientEvents interface (same as server)
5. ClientToServerEvents interface (same as server)

Constraints:
- File: src/models/note.model.ts
- These are the client's own definitions — not imported from server
```

---

### Change 8: `api-service`

**Propose command:**
```
/project:opsx-propose api-service
```

**Context to provide:**
```
Implement HTTP API service for login and import.

Functions:
1. login(username: string): Promise<{ token, username }> — POST to /api/auth/login
2. importNotes(file: File, token: string): Promise<{ imported: number }> — POST FormData to /api/boards/default/import with Bearer token

API_URL from VITE_API_URL env var, default 'http://localhost:3000'.

Constraints:
- File: src/services/api.ts
- Use fetch API (no axios)
```

---

### Change 9: `hooks`

**Propose command:**
```
/project:opsx-propose hooks
```

**Context to provide:**
```
Implement React hooks for socket connection and board state management.

1. useSocket(token: string | null):
   - Creates Socket.io connection with WebSocket-only transport and auth token
   - Returns { socket, connected }
   - Cleans up on unmount or token change

2. useBoard(socket: AppSocket | null):
   - Manages notes state (StickyNote[]), users state (string[]), joined state
   - On mount: emits board:join with ack callback to get initial notes
   - Listens for: note:created, note:updated, note:moved, board:user-joined, board:user-left, board:notes-imported
   - Provides: createNote, updateNote, moveNote functions
   - createNote: emits note:create with ack, adds to local state
   - updateNote: optimistic update + emit note:update
   - moveNote: optimistic update + throttled (50ms) emit note:move

Constraints:
- useSocket: src/hooks/useSocket.ts
- useBoard: src/hooks/useBoard.ts
- Use typed Socket: Socket<ServerToClientEvents, ClientToServerEvents>
```

---

### Change 10: `components`

**Propose command:**
```
/project:opsx-propose components
```

**Context to provide:**
```
Implement all React components and styles.

Components:

1. UsernamePrompt: form with username input + submit button, calls onLogin(username)
2. StickyNote: positioned absolutely, draggable (mousedown/move/up), double-click to edit, color-coded
3. UserList: shows connected users with status indicator
4. Board: main board area with toolbar (color picker, import button, logout), renders StickyNote children, click board to create note
5. App: root component with auth gate (UsernamePrompt if no token, Board if authenticated), login/logout logic with localStorage

Styles: plain CSS, one file per component. Keep it simple but polished (see spec Section 9 UX decisions).

Constraints:
- Components: src/components/UsernamePrompt.tsx, StickyNote.tsx, UserList.tsx, Board.tsx
- Root: src/App.tsx, src/index.css, src/main.tsx
- Remove Vite default App.css
```

---

## Phase 4: Infrastructure

### Task 3: apply — Service CLAUDE.md and README files

**Files:**
- Create: `server/CLAUDE.md`
- Create: `server/README.md`
- Create: `client/CLAUDE.md`
- Create: `client/README.md`

- [ ] **Step 1: Create server CLAUDE.md**

```markdown
# Collaborative Board — Server

## What This Is

Backend service for a real-time collaborative board with sticky notes. Node.js + Express + Socket.io + TypeScript.

## Architecture

Layered with hexagonal principles:

```
src/
├── models/           # Domain types (StickyNote, events, inputs)
├── repositories/     # INoteRepository interface + MongoNoteRepository
├── services/         # NoteService, AuthService (business logic)
├── transport/        # Socket.io handlers + Express routes (thin)
│   ├── http/         # auth.routes.ts, board.routes.ts
│   └── socket/       # board.handlers.ts, note.handlers.ts
├── config/           # database.ts, redis.ts
└── index.ts          # Composition root (DI wiring)
```

## Rules

- **Transport layer is thin**: handlers parse input → call service → emit/respond. No business logic.
- **Services depend on interfaces**: `NoteService` takes `INoteRepository`, not `MongoNoteRepository`.
- **No DI framework**: manual constructor injection in `index.ts`.
- **Domain types are the contract**: `StickyNote`, event interfaces, input types define the API. Changes to types must be reflected in all layers.
- **WebSocket-only**: Socket.io configured with `transports: ['websocket']`. No HTTP polling fallback.
- **Last-write-wins**: no conflict resolution beyond MongoDB's single-document atomicity.

## Key Decisions

| Decision | Reference |
|----------|-----------|
| MongoDB native driver (not Mongoose) | `../docs/mongodb-guide.md` |
| Layered + hexagonal principles | `../docs/backend-architecture-guide.md` |
| Socket.io WebSocket-only | `../docs/websockets-socketio-guide.md` Section 5 |
| Redis Pub/Sub for scaling | `../docs/specs/2026-11-17-collaborative-board-design.md` Section 4 |

## OpenSpec

Spec-driven development workflow:
- `openspec/config.yaml` — project context and rules
- `openspec/changes/` — active changes (propose → apply → sync → archive)
- `openspec/specs/` — accumulated specs from completed changes
- `.claude/commands/` — OpenSpec slash commands

## Testing

- Vitest for unit tests
- InMemoryNoteRepository as mock
- Tests in `tests/services/`
- Run: `npm test`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/collaborative-board` | MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | — | Secret for JWT signing |
| `PORT` | `3000` | HTTP server port |
```

- [ ] **Step 2: Create client CLAUDE.md**

```markdown
# Collaborative Board — Client

## What This Is

React frontend for a real-time collaborative board with sticky notes. React + TypeScript + Vite + Socket.io-client.

## Architecture

```
src/
├── models/           # Domain types (mirrors server types)
├── hooks/            # useSocket, useBoard (state + logic)
├── components/       # UsernamePrompt, StickyNote, Board, UserList
├── services/         # api.ts (HTTP calls: login, import)
├── App.tsx           # Root with auth gate
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Rules

- **Components are thin**: render + call hook functions. Business logic lives in hooks.
- **Optimistic updates**: UI updates immediately, server sync is async.
- **Throttled drag events**: ~50ms intervals, not per pixel.
- **CSS transitions on remote notes**: smooth position animations for notes moved by other users.
- **Domain types are independent**: client defines its own types (not imported from server).

## Key Decisions

| Decision | Reference |
|----------|-----------|
| WebSocket-only transport | No `transports` fallback, direct WS connection |
| Plain CSS (no CSS-in-JS) | Simplicity for 4-hour scope |
| No frontend tests | Simplicity — server tests cover business logic |

## OpenSpec

- `openspec/config.yaml` — project context and rules
- `openspec/changes/` — active changes
- `openspec/specs/` — accumulated specs
- `.claude/commands/` — OpenSpec slash commands

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend API URL |
```

- [ ] **Step 3: Create server README**

```markdown
# Collaborative Board — Server

Real-time backend for a collaborative sticky-notes board.

## Quick Start (standalone)

```bash
npm install
npm run dev
```

Requires MongoDB and Redis running locally (or use the root docker-compose).

## Run Tests

```bash
npm test
npm run test:watch  # watch mode
```

## Tech Stack

- Node.js + TypeScript
- Express (HTTP routes)
- Socket.io (real-time events, WebSocket-only)
- MongoDB 7 (native driver)
- Redis 7 (Socket.io Pub/Sub adapter)
- JWT (authentication)
- Vitest (testing)
```

- [ ] **Step 4: Create client README**

```markdown
# Collaborative Board — Client

React frontend for a collaborative sticky-notes board.

## Quick Start (standalone)

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. Requires the server running at http://localhost:3000.

## Tech Stack

- React 18 + TypeScript
- Vite
- Socket.io-client (WebSocket-only)
- Plain CSS
```

- [ ] **Step 5: Commit**

```bash
git add server/CLAUDE.md server/README.md client/CLAUDE.md client/README.md
git commit -m "feat: add CLAUDE.md and README for both server and client services"
```

### Task 4: apply — Dockerfiles

**Files:**
- Create: `server/Dockerfile`
- Create: `client/Dockerfile`

- [ ] **Step 1: Create server Dockerfile**

```dockerfile
# server/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "tsx", "src/index.ts"]
```

- [ ] **Step 2: Create client Dockerfile**

```dockerfile
# client/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npx", "vite", "--host"]
```

- [ ] **Step 3: Create .dockerignore files**

```
# server/.dockerignore
node_modules
dist
```

```
# client/.dockerignore
node_modules
dist
```

- [ ] **Step 4: Commit**

```bash
git add server/Dockerfile server/.dockerignore client/Dockerfile client/.dockerignore
git commit -m "apply: Dockerfiles for server and client"
```

### Task 5: apply — Docker Compose (default)

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
# docker-compose.yml

services:
  client:
    build: ./client
    ports:
      - '5173:5173'
    environment:
      VITE_API_URL: http://localhost:3000
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

- [ ] **Step 2: verify — Run docker-compose up**

```bash
docker-compose up --build
```

Expected: All 4 services start. Client at http://localhost:5173, server at http://localhost:3000.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "apply: Docker Compose default config (single instance)"
```

### Task 6: apply — Docker Compose (scaling demo)

**Files:**
- Create: `docker-compose.scaling.yml`
- Create: `nginx/nginx.conf`

- [ ] **Step 1: Create nginx config**

```bash
mkdir -p nginx
```

```nginx
# nginx/nginx.conf

upstream socket_servers {
    server server-1:3000;
    server server-2:3000;
    server server-3:3000;
}

server {
    listen 80;

    location / {
        proxy_pass http://socket_servers;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

- [ ] **Step 2: Create scaling docker-compose**

```yaml
# docker-compose.scaling.yml

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

- [ ] **Step 3: Commit**

```bash
git add docker-compose.scaling.yml nginx/
git commit -m "apply: scaling Docker Compose — 3 server instances + Nginx + Redis"
```

---

## Phase 5: Seed & Documentation

### Task 7: apply — Seed script

**Files:**
- Create: `scripts/seed.sh`

- [ ] **Step 1: Create seed shell script**

This script runs in the `seed` Docker service. It waits for the server to be healthy, logs in to get a JWT token, and imports the sample notes.

```bash
#!/bin/sh
# scripts/seed.sh
# Auto-seed: waits for server, logs in, imports sample notes

API_URL="${API_URL:-http://server:3000}"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "[seed] Waiting for server at $API_URL..."

for i in $(seq 1 $MAX_RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/login" \
    -X POST -H "Content-Type: application/json" -d '{"username":"seed-bot"}' 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "[seed] Server is ready."
    break
  fi
  echo "[seed] Attempt $i/$MAX_RETRIES — server not ready (status: $STATUS). Retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

if [ "$STATUS" != "200" ]; then
  echo "[seed] ERROR: Server did not become ready after $MAX_RETRIES attempts."
  exit 1
fi

# Login to get token
echo "[seed] Logging in as seed-bot..."
LOGIN_RESPONSE=$(curl -s "$API_URL/api/auth/login" \
  -X POST -H "Content-Type: application/json" -d '{"username":"seed-bot"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "[seed] ERROR: Failed to extract token from login response."
  echo "[seed] Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "[seed] Got token. Importing notes..."

# Import sample notes
IMPORT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/boards/default/import" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/data/notes.json")

HTTP_CODE=$(echo "$IMPORT_RESPONSE" | tail -1)
BODY=$(echo "$IMPORT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "[seed] Import successful: $BODY"
else
  echo "[seed] Import failed (HTTP $HTTP_CODE): $BODY"
  exit 1
fi
```

- [ ] **Step 2: Make executable and commit**

```bash
chmod +x scripts/seed.sh
git add scripts/seed.sh
git commit -m "apply: seed script — auto-imports sample notes on docker-compose up"
```

### Task 8: apply — Sample data file

**Files:**
- Create: `sample-data/notes.json`

- [ ] **Step 1: Create sample notes JSON (from challenge dataset)**

```json
[
  { "id": "note_1", "text": "Login flow is confusing", "x": 100, "y": 100, "author": "user_1", "color": "yellow" },
  { "id": "note_2", "text": "Love the new dashboard", "x": 350, "y": 120, "author": "user_2", "color": "green" },
  { "id": "note_3", "text": "Need better error messages", "x": 600, "y": 150, "author": "user_3", "color": "pink" },
  { "id": "note_4", "text": "Mobile app is slow", "x": 150, "y": 350, "author": "user_1", "color": "orange" },
  { "id": "note_5", "text": "Great onboarding experience", "x": 400, "y": 380, "author": "user_2", "color": "blue" },
  { "id": "note_6", "text": "Search needs improvement", "x": 650, "y": 400, "author": "user_3", "color": "yellow" }
]
```

- [ ] **Step 2: Commit**

```bash
git add sample-data/
git commit -m "apply: sample notes.json for import testing"
```

### Task 9: apply — README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

```markdown
# Real-Time Collaborative Board

A full-stack prototype of a collaborative whiteboard where multiple users can create, edit, and move sticky notes in real time.

## Quick Start

```bash
docker-compose up --build
```

Open http://localhost:5173 in your browser. Sample notes are automatically imported on startup.

### Two-User Demo

1. Open Tab 1 → enter a username (e.g., "Alice") → join the board (sample notes already loaded)
2. Open Tab 2 → click **Logout** → enter a different username (e.g., "Bob")
3. Create, edit, and move notes — changes sync in real time between tabs

### Import More Notes

Click **Import JSON** in the toolbar to import additional notes from a JSON file.

## Scaling Demo

Run with 3 server instances behind Nginx + Redis:

```bash
docker-compose -f docker-compose.scaling.yml up --build
```

Same client URL (http://localhost:5173). API traffic routes through Nginx on port 3000 to 3 Node.js instances. Redis Pub/Sub ensures Socket.io events reach all connected clients regardless of which instance they're on.

## Run Tests

```bash
cd server && npm test
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Real-time | Socket.io (WebSocket-only transport) |
| Database | MongoDB 7 |
| Scaling | Redis 7 (Pub/Sub adapter for Socket.io) |
| Load Balancer | Nginx (scaling demo) |
| Auth | JWT |
| Testing | Vitest |
| Infrastructure | Docker Compose |

## Project Structure

```
├── client/                    # React frontend
│   └── src/
│       ├── components/        # Board, StickyNote, UsernamePrompt, UserList
│       ├── hooks/             # useSocket, useBoard
│       ├── models/            # TypeScript types
│       └── services/          # HTTP API client
├── server/                    # Node.js backend
│   └── src/
│       ├── models/            # Domain types + Socket.io event contract
│       ├── repositories/      # INoteRepository + MongoNoteRepository
│       ├── services/          # NoteService, AuthService
│       ├── transport/         # Socket.io handlers + Express routes
│       └── config/            # MongoDB + Redis connection
├── nginx/                     # Nginx config for scaling demo
├── sample-data/               # Sample notes.json for import
├── docker-compose.yml         # Default: 1 server + Mongo + Redis
└── docker-compose.scaling.yml # Scaling: 3 servers + Nginx + Redis
```

## Architecture Decisions

See `docs/specs/2026-11-17-collaborative-board-design.md` for the full design spec.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "apply: README with setup, demo instructions, and architecture overview"
```

### Task 10: apply — Write-up

**Files:**
- Create: `WRITEUP.md`

- [ ] **Step 1: Write the challenge write-up**

```markdown
# Write-Up

## How I Approached the Challenge

I used **Spec-Driven Development (SDD)** with OpenSpec CLI: every component was implemented through a change lifecycle (`opsx-propose` → `opsx-apply` → `opsx-sync` → `opsx-archive`). Before writing any code, I defined all TypeScript interfaces, Socket.io event contracts, and repository patterns in spec artifacts. This approach ensures type safety end-to-end and produces self-documenting code — the specs accumulated in `openspec/specs/` are living documentation of every component.

I prioritized:
1. **Real-time collaboration** — the core ask. Socket.io with typed events, optimistic updates, and throttled drag events.
2. **Scalable architecture** — not just "it works on one server" but demonstrably scales. Redis adapter + multi-instance Docker Compose.
3. **Clean separation** — layered backend with repository pattern and dependency injection. Thin transport layer, testable services.
4. **Developer experience** — single `docker-compose up` runs everything. Clear project structure.

## Assumptions

- Single board (no board selection). The data model supports multiple boards via `boardId`.
- No persistent user accounts — username-only login with JWT for session identity.
- Last-write-wins for conflict resolution — acceptable for a prototype.
- WebSocket-only transport (no HTTP polling fallback) since we control the infrastructure.

## Architectural Overview

- **Monorepo** with independent `server/` and `client/` projects
- **Layered backend** with hexagonal principles: repository interface → service layer → thin transport handlers
- **Socket.io** for all real-time operations, **HTTP** only for auth and file upload
- **Redis Pub/Sub** adapter enables horizontal scaling without changing application code
- **MongoDB** with native driver for document persistence (notes are natural JSON documents)

## UX Decisions

- **Optimistic updates**: UI responds instantly to user actions; server sync happens asynchronously
- **Throttled drag events**: Mouse move events emit at ~50ms intervals, not per pixel
- **CSS transitions**: Notes from other users animate smoothly to new positions
- **Inline editing**: Double-click to edit, Enter to save — familiar pattern
- **Connected users**: Always visible, so you know the board is shared

## AI Usage

I used Claude Code (AI assistant) for:
- **Brainstorming** architecture decisions and evaluating trade-offs (Socket.io vs SSE, MongoDB vs alternatives)
- **Generating** technical documentation for technologies I wanted to understand deeply (WebSocket scaling, Redis Pub/Sub)
- **Spec-driven development** — defining contracts first, then implementing against them
- **Code generation** against well-defined interfaces and types

The design decisions, architecture, and trade-off analysis are my own. AI accelerated the implementation.

## Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| WebSocket-only transport | No fallback for restrictive proxies, but eliminates sticky session complexity |
| Last-write-wins | Simple but can lose edits in rare concurrent scenarios. Production: OT/CRDTs |
| Single default board | Simplifies scope. Data model already supports multiple boards |
| No delete notes | Prioritized create/edit/move as higher-signal features |
| In-memory user tracking | Works per-instance. With Redis adapter, `fetchSockets()` could provide cross-instance count |

## Next Steps (With More Time)

- **Conflict resolution**: Operational Transformation for text, CRDTs for position
- **Real-time cursors**: Show other users' cursor positions on the board
- **Multiple boards**: Board creation, selection, and URL-based routing
- **Delete notes**: With undo support
- **Full auth**: OAuth 2.0 / SSO with refresh tokens and session management
- **Board zoom/pan**: Infinite canvas with viewport controls
- **E2E tests**: Playwright tests for the full collaboration flow
- **Monitoring**: Socket.io connection metrics, Redis Pub/Sub lag dashboards

## Time Spent

Approximately 4 hours.
```

- [ ] **Step 2: Commit**

```bash
git add WRITEUP.md
git commit -m "apply: challenge write-up — approach, decisions, tradeoffs, next steps"
```

---

## Self-Review Checklist

**Spec coverage:**
- Sec 1 (Overview): Tasks 5 (docker-compose), changes 4 (services/tests) ✓
- Sec 2 (SDD methodology): Task 2 (OpenSpec setup), all changes use opsx-propose/apply lifecycle ✓
- Sec 3 (Architecture): Changes 6 (bootstrap), Tasks 4-6 (Docker) ✓
- Sec 4 (Redis scaling): Change 6 (Redis adapter), Task 6 (scaling compose) ✓
- Sec 5 (Auth): Change 4 (AuthService), Change 5 (transport), Change 10 (components auth gate) ✓
- Sec 6 (Data model): Change 1 (domain models), Change 3 (repository) ✓
- Sec 7 (Event contract): Change 2 (socket-events) ✓
- Sec 8 (Backend arch): Changes 1-6 ✓
- Sec 9 (Frontend arch): Changes 7-10 ✓
- Sec 10 (JSON import): Change 5 (HTTP routes), Change 10 (import button), Task 7 (seed), Task 8 (sample data) ✓
- Sec 11 (Conflict resolution): LWW implicit in implementation ✓
- Sec 12 (Testing): Change 4 (NoteService unit tests with Vitest) ✓
- Sec 13 (Infrastructure): Tasks 4-6 (Docker), Task 7 (auto-seed) ✓
- Sec 14 (Tech stack): All covered ✓
- Sec 15 (Scope): All in-scope items covered ✓
- Sec 16 (Time budget): Plan follows same phase ordering ✓

**SDD artifacts:**
- Each backend change (1-6) produces: proposal.md, design.md, tasks.md, specs/ in `server/openspec/changes/`
- Each frontend change (7-10) produces same in `client/openspec/changes/`
- After each change: opsx-sync moves delta specs to main `openspec/specs/`
- After sync: opsx-archive moves completed change to `archive/` with date prefix
- Result: full spec documentation of every component, accumulated in both services

**Placeholder scan:** No TBDs, TODOs, or "implement later" found. ✓

**Type consistency:**
- `StickyNote` interface: same fields in server and client `note.model.ts` ✓
- `ServerToClientEvents` / `ClientToServerEvents`: same in both services ✓
- `INoteRepository` methods match what `NoteService` calls ✓
- `NoteService` method signatures match what transport handlers call ✓
