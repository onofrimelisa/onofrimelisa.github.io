# Backend Architecture for Node.js + TypeScript — Guide for Senior Devs

> A guide covering modern backend architecture patterns for Node.js with TypeScript, specifically for real-time applications. Evaluates hexagonal architecture and alternatives, with a recommendation for this challenge's scope and time constraints.

---

## 1. The Landscape: Backend Architecture in Node.js + TypeScript

The Node.js ecosystem has matured significantly. With TypeScript as the standard, the community has moved beyond "just Express with routes" toward structured architectures borrowed from enterprise Java/.NET — but adapted for Node's lightweight, async-first nature.

The main patterns you'll encounter:

| Pattern | Core Idea | Typical Use |
|---------|-----------|-------------|
| **MVC** | Model-View-Controller separation | CRUD apps, REST APIs |
| **Layered (3-tier)** | Controller → Service → Repository | Most Node.js backends today |
| **Hexagonal (Ports & Adapters)** | Business logic at the center, infrastructure at the edges | Domain-rich applications |
| **Clean Architecture** | Hexagonal + explicit use case layer + dependency rule | Complex business domains |
| **Vertical Slices** | Organize by feature, not by layer | Microservices, feature-heavy apps |

---

## 2. Hexagonal Architecture (Ports & Adapters)

### The Core Idea

Your **business logic** (domain) sits at the center and knows nothing about the outside world. It communicates with the outside through **ports** (interfaces) and **adapters** (implementations).

```
                    ┌─────────────────────────────┐
                    │        INFRASTRUCTURE        │
                    │                              │
  ┌──────────┐     │   ┌──────────────────────┐   │     ┌──────────┐
  │  Socket.io│────►│   │                      │   │◄────│  MongoDB  │
  │  (adapter)│     │   │    DOMAIN / CORE     │   │     │  (adapter)│
  └──────────┘     │   │                      │   │     └──────────┘
                    │   │  - Entities           │   │
  ┌──────────┐     │   │  - Use Cases          │   │     ┌──────────┐
  │  Express  │────►│   │  - Port interfaces   │   │◄────│  File     │
  │  (adapter)│     │   │                      │   │     │  System   │
  └──────────┘     │   └──────────────────────┘   │     │  (adapter)│
                    │              ▲                │     └──────────┘
                    │              │                │
                    │     Dependency Rule:          │
                    │     arrows point INWARD       │
                    └─────────────────────────────┘
```

### Key Concepts

**Ports** are interfaces that define what the domain needs from the outside world:

```typescript
// Port: how the domain wants to access notes (doesn't know about MongoDB)
interface NoteRepository {
  findByBoardId(boardId: string): Promise<StickyNote[]>;
  create(note: CreateNoteInput): Promise<StickyNote>;
  update(id: string, fields: Partial<StickyNote>): Promise<StickyNote | null>;
  delete(id: string): Promise<boolean>;
}

// Port: how the domain wants to notify clients (doesn't know about Socket.io)
interface BoardNotifier {
  notifyNoteCreated(boardId: string, note: StickyNote, excludeClient?: string): void;
  notifyNoteUpdated(boardId: string, note: Partial<StickyNote> & { id: string }, excludeClient?: string): void;
}
```

**Adapters** are implementations that plug into ports:

```typescript
// Adapter: MongoDB implementation of NoteRepository
class MongoNoteRepository implements NoteRepository {
  constructor(private collection: Collection<StickyNote>) {}

  async findByBoardId(boardId: string): Promise<StickyNote[]> {
    return this.collection.find({ boardId }).toArray();
  }
  // ...
}

// Adapter: Socket.io implementation of BoardNotifier
class SocketIOBoardNotifier implements BoardNotifier {
  constructor(private io: Server) {}

  notifyNoteCreated(boardId: string, note: StickyNote, excludeClient?: string): void {
    const target = excludeClient
      ? this.io.to(boardId).except(excludeClient)
      : this.io.to(boardId);
    target.emit('note:created', note);
  }
  // ...
}
```

**Use Cases** (Application Services) orchestrate business logic using ports:

```typescript
class CreateNoteUseCase {
  constructor(
    private noteRepository: NoteRepository,
    private boardNotifier: BoardNotifier,
  ) {}

  async execute(input: CreateNoteInput, clientId?: string): Promise<StickyNote> {
    // Business logic: validate, enrich, persist, notify
    const note = await this.noteRepository.create(input);
    this.boardNotifier.notifyNoteCreated(input.boardId, note, clientId);
    return note;
  }
}
```

### The Dependency Rule

Dependencies always point **inward** — toward the domain:

- Domain knows nothing about Express, Socket.io, or MongoDB
- Use cases depend on port interfaces, not concrete adapters
- Adapters depend on the domain (they implement its ports)
- Infrastructure wires everything together (dependency injection)

### Advantages

| Advantage | Why It Matters |
|-----------|---------------|
| **Testability** | Mock the ports, test business logic in isolation without DB or sockets |
| **Swappability** | Replace MongoDB with PostgreSQL by writing a new adapter — zero changes to domain |
| **Framework independence** | Express, Fastify, Hapi — the domain doesn't care |
| **Clarity** | Clear boundaries between "what the app does" and "how it connects to the world" |
| **Separation of concerns** | Socket.io handlers are thin — they parse input and call use cases |

### Disadvantages

| Disadvantage | Reality |
|-------------|---------|
| **More files and indirection** | A simple CRUD operation touches 3+ files instead of 1 |
| **Over-engineering risk** | For trivial apps, the abstraction layers add complexity without proportional value |
| **Learning curve** | Developers need to understand ports, adapters, dependency inversion |
| **Boilerplate** | Interfaces, implementations, wiring — more code for the same behavior |

---

## 3. Layered Architecture (The Pragmatic Middle Ground)

The most common pattern in production Node.js backends today. Three layers with clear responsibilities:

```
┌─────────────────────────────────────┐
│          TRANSPORT LAYER             │
│  (Express routes, Socket.io handlers)│
│  - Parse input                       │
│  - Call services                     │
│  - Return/emit responses             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          SERVICE LAYER               │
│  (Business logic, orchestration)     │
│  - Validate                          │
│  - Transform                         │
│  - Coordinate repositories           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          REPOSITORY LAYER            │
│  (Data access, MongoDB operations)   │
│  - CRUD operations                   │
│  - Query building                    │
│  - Data mapping                      │
└─────────────────────────────────────┘
```

### In Practice

```
server/
├── src/
│   ├── transport/          # How the outside world talks to us
│   │   ├── http/           # Express routes (JSON file upload)
│   │   │   └── board.routes.ts
│   │   └── socket/         # Socket.io event handlers
│   │       └── note.handlers.ts
│   ├── services/           # Business logic
│   │   └── note.service.ts
│   ├── repositories/       # Data access
│   │   └── note.repository.ts
│   ├── models/             # TypeScript interfaces and types
│   │   └── note.model.ts
│   ├── config/             # DB connection, environment
│   │   └── database.ts
│   └── index.ts            # App bootstrap and wiring
├── tests/
│   └── services/
│       └── note.service.test.ts
├── package.json
└── tsconfig.json
```

### How It Differs From Hexagonal

| Aspect | Hexagonal | Layered |
|--------|-----------|---------|
| Ports (interfaces) | Mandatory — domain defines them | Optional — services can depend on concrete repositories |
| Dependency direction | Always inward (strict) | Generally top-down (practical) |
| Framework coupling | Zero — domain is pure | Low — services might know about Express types |
| Adapter abstraction | Explicit adapter classes | Repository classes serve the same purpose |
| Boilerplate | Higher | Lower |
| Testability | Excellent (mock ports) | Good (mock repositories) |

---

## 4. Recommendation for the Challenge

### Why Not Full Hexagonal

Full hexagonal architecture is overkill for a 4-hour prototype with a small domain:
- We have one entity (StickyNote) and four operations (CRUD)
- The "business logic" is thin — mostly pass-through from transport to persistence
- The extra indirection (ports, adapters, use case classes) adds files without proportional clarity
- It signals over-engineering for the scope, which the challenge explicitly warns against: *"prioritize intentionally; we'll evaluate how you scope the work and make trade-offs"*

### The Sweet Spot: Layered With Hexagonal Principles

Take the best ideas from hexagonal without the ceremony:

1. **Repository interface** — Define a `NoteRepository` interface. The service depends on the interface, not the MongoDB implementation. This gives us testability (mock the repo) and swappability (mention in write-up).

2. **Thin transport layer** — Socket.io handlers and Express routes only parse input and call services. No business logic in handlers.

3. **Service layer with injected dependencies** — Services receive repositories via constructor injection. No global imports of database clients.

4. **Models as the shared vocabulary** — TypeScript interfaces define the domain language. Both transport and repository layers use the same types.

```typescript
// models/note.model.ts — the shared vocabulary
interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  author: string;
  color: NoteColor;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

// repositories/note.repository.ts — interface + implementation in one file
interface INoteRepository {
  findByBoardId(boardId: string): Promise<StickyNote[]>;
  create(input: CreateNoteInput): Promise<StickyNote>;
  update(id: string, fields: UpdateNoteInput): Promise<StickyNote | null>;
}

class MongoNoteRepository implements INoteRepository {
  constructor(private collection: Collection) {}
  // implementation...
}

// services/note.service.ts — business logic
class NoteService {
  constructor(private noteRepository: INoteRepository) {}

  async createNote(input: CreateNoteInput): Promise<StickyNote> {
    // validate, enrich, persist
    return this.noteRepository.create(input);
  }
}

// transport/socket/note.handlers.ts — thin handler
function registerNoteHandlers(io: Server, socket: Socket, noteService: NoteService) {
  socket.on('note:create', async (data, ack) => {
    const note = await noteService.createNote(data);
    socket.to(data.boardId).emit('note:created', note);
    ack(note);
  });
}
```

### What This Gives Us

- **Testable**: Mock `INoteRepository`, test `NoteService` in isolation
- **Clear separation**: handler → service → repository, each with one job
- **Not over-engineered**: No abstract port classes, no adapter pattern ceremony, no use-case-per-operation
- **Scalable in approach**: In the write-up, mention that this structure naturally evolves toward hexagonal as the domain grows
- **Interview-ready**: Shows you understand the principles without cargo-culting the patterns

---

## 5. TypeScript Patterns That Matter

### Constructor Injection (Simple DI)

No DI framework needed. Wire dependencies manually in the bootstrap file:

```typescript
// index.ts — composition root
const db = await connectToMongo();
const noteRepository = new MongoNoteRepository(db.collection('notes'));
const noteService = new NoteService(noteRepository);

// Pass to transport layer
registerNoteHandlers(io, noteService);
registerBoardRoutes(app, noteService);
```

This is explicit, type-safe, and easy to understand. DI frameworks (like tsyringe, inversify) add value in large codebases but are overhead here.

### Strict Types for Socket Events

Leverage Socket.io's TypeScript support to type the entire event contract:

```typescript
interface ServerToClientEvents {
  'note:created': (note: StickyNote) => void;
  'note:updated': (update: NoteUpdate) => void;
  'note:moved': (move: NoteMove) => void;
  'board:state': (notes: StickyNote[]) => void;
  'board:user-joined': (username: string) => void;
  'board:user-left': (username: string) => void;
}

interface ClientToServerEvents {
  'note:create': (data: CreateNoteInput, ack: (note: StickyNote) => void) => void;
  'note:update': (data: NoteUpdate) => void;
  'note:move': (data: NoteMove) => void;
  'board:join': (data: JoinBoardInput) => void;
}
```

This is the **spec-driven contract** — define the events first, then implement. Both client and server code is fully typed against these interfaces.

### Discriminated Unions for Event Payloads

If events share a common shape but differ by type:

```typescript
type BoardEvent =
  | { type: 'note:created'; payload: StickyNote }
  | { type: 'note:updated'; payload: NoteUpdate }
  | { type: 'note:moved'; payload: NoteMove };

function handleBoardEvent(event: BoardEvent) {
  switch (event.type) {
    case 'note:created':
      // event.payload is StickyNote here (narrowed by TS)
      break;
    case 'note:updated':
      // event.payload is NoteUpdate here
      break;
  }
}
```

### Result Types Instead of Thrown Exceptions

For service methods that can fail in expected ways:

```typescript
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

class NoteService {
  async createNote(input: CreateNoteInput): Promise<Result<StickyNote>> {
    if (!input.text.trim()) {
      return { ok: false, error: 'Note text cannot be empty' };
    }
    const note = await this.noteRepository.create(input);
    return { ok: true, value: note };
  }
}
```

This makes error handling explicit in the type system — callers must handle both cases.

---

## 6. File Structure Summary

```
server/
├── src/
│   ├── models/                    # Domain types and interfaces
│   │   ├── note.model.ts          # StickyNote, NoteColor, CreateNoteInput, etc.
│   │   └── board.model.ts         # Board-related types
│   ├── repositories/              # Data access layer
│   │   └── note.repository.ts     # INoteRepository interface + MongoNoteRepository
│   ├── services/                  # Business logic layer
│   │   └── note.service.ts        # NoteService
│   ├── transport/                 # External communication layer
│   │   ├── http/
│   │   │   └── board.routes.ts    # Express routes (JSON upload)
│   │   └── socket/
│   │       ├── note.handlers.ts   # Socket.io event handlers for notes
│   │       └── board.handlers.ts  # Socket.io event handlers for board (join, users)
│   ├── config/
│   │   └── database.ts            # MongoDB connection
│   └── index.ts                   # Bootstrap: wire dependencies, start server
├── tests/
│   ├── services/
│   │   └── note.service.test.ts
│   └── helpers/
│       └── mock.repository.ts     # In-memory INoteRepository for tests
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## 7. Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Layered with hexagonal principles | Right level of structure for 4-hour scope |
| Dependency management | Constructor injection, no DI framework | Explicit, type-safe, zero overhead |
| Repository pattern | Interface + concrete implementation | Testability and swappability without ceremony |
| Transport layer | Thin handlers calling services | Separation of concerns, easy to test |
| Type strategy | Shared interfaces, strict event typing | Spec-driven, compile-time safety |
| Error handling | Result types for expected failures | Explicit in the type system |
| Evolution path | Toward hexagonal/clean as domain grows | Mention in write-up as scaling strategy |
