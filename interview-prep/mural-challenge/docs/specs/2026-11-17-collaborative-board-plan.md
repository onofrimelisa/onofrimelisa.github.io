# Real-Time Collaborative Board — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack real-time collaborative board with sticky notes for Mural's take-home challenge.

**Architecture:** Monorepo with `server/` (Node.js + Express + Socket.io + TypeScript) and `client/` (React + Vite + TypeScript). MongoDB for persistence, Redis adapter for Socket.io horizontal scaling. Layered backend with hexagonal principles (repository interface, service layer, thin transport).

**Tech Stack:** React, Vite, TypeScript, Node.js, Express, Socket.io, MongoDB (native driver), Redis (Pub/Sub adapter), Nginx, Docker Compose, Vitest, JWT.

**Methodology:** Spec-driven design — `propose` → `review` → `apply` → `verify` for each component.

**Spec:** `docs/specs/2026-11-17-collaborative-board-design.md`

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

---

## Phase 2: PROPOSE — Define All Contracts

This is the spec-driven core. We define every type, interface, and event contract before writing any implementation.

### Task 2: propose — Domain models (server)

**Files:**
- Create: `server/src/models/note.model.ts`

- [ ] **Step 1: Create domain model types**

```typescript
// server/src/models/note.model.ts

export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export const NOTE_COLORS: NoteColor[] = ['yellow', 'blue', 'green', 'pink', 'orange'];

export interface StickyNote {
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

export interface CreateNoteInput {
  text: string;
  x: number;
  y: number;
  color: NoteColor;
  boardId: string;
  author: string;
}

export interface UpdateNoteInput {
  text: string;
}

export interface MoveNoteInput {
  x: number;
  y: number;
}

export interface ImportNoteInput {
  text: string;
  x: number;
  y: number;
  color?: string;
  author?: string;
}

export const DEFAULT_BOARD_ID = 'default';
export const MAX_NOTE_TEXT_LENGTH = 500;
```

- [ ] **Step 2: review — Validate completeness**

Checklist:
- StickyNote has all fields from spec sec 6: id, text, x, y, author, color, boardId, createdAt, updatedAt ✓
- NoteColor matches spec: yellow, blue, green, pink, orange ✓
- CreateNoteInput matches `note:create` payload + server-enriched fields (boardId, author) ✓
- UpdateNoteInput matches `note:update` payload (just text) ✓
- MoveNoteInput matches `note:move` payload (just x, y) ✓
- ImportNoteInput matches JSON import validation rules (color optional, author optional) ✓
- MAX_NOTE_TEXT_LENGTH = 500 per spec ✓

- [ ] **Step 3: Commit**

```bash
git add server/src/models/note.model.ts
git commit -m "propose: domain models for StickyNote and input types"
```

### Task 3: propose — Event contract (server)

**Files:**
- Create: `server/src/models/socket-events.ts`

- [ ] **Step 1: Create typed event interfaces**

```typescript
// server/src/models/socket-events.ts

import { StickyNote, NoteColor } from './note.model.js';

// Client → Server events
export interface ClientToServerEvents {
  'board:join': (ack: (notes: StickyNote[]) => void) => void;
  'note:create': (
    data: { text: string; x: number; y: number; color: NoteColor },
    ack: (note: StickyNote) => void,
  ) => void;
  'note:update': (data: { id: string; text: string }) => void;
  'note:move': (data: { id: string; x: number; y: number }) => void;
}

// Server → Client events
export interface ServerToClientEvents {
  'note:created': (note: StickyNote) => void;
  'note:updated': (data: { id: string; text: string; updatedAt: Date }) => void;
  'note:moved': (data: { id: string; x: number; y: number }) => void;
  'board:user-joined': (data: { username: string; users: string[] }) => void;
  'board:user-left': (data: { username: string; users: string[] }) => void;
  'board:notes-imported': (notes: StickyNote[]) => void;
}

// Data attached to each socket after JWT auth
export interface SocketData {
  userId: string;
  username: string;
}
```

- [ ] **Step 2: review — Validate against spec sec 7**

Checklist:
- `board:join`: no payload, ack with StickyNote[] ✓
- `note:create`: payload {text, x, y, color}, ack with StickyNote ✓
- `note:update`: payload {id, text}, no ack ✓
- `note:move`: payload {id, x, y}, no ack ✓
- `note:created`: StickyNote ✓
- `note:updated`: {id, text, updatedAt} ✓
- `note:moved`: {id, x, y} ✓
- `board:user-joined`: {username, users[]} ✓
- `board:user-left`: {username, users[]} ✓
- `board:notes-imported`: StickyNote[] ✓
- SocketData carries userId + username from JWT ✓

- [ ] **Step 3: Commit**

```bash
git add server/src/models/socket-events.ts
git commit -m "propose: Socket.io event contract (ClientToServer + ServerToClient)"
```

### Task 4: propose — Repository interface (server)

**Files:**
- Create: `server/src/repositories/note.repository.ts` (interface only)

- [ ] **Step 1: Define INoteRepository interface**

```typescript
// server/src/repositories/note.repository.ts

import { StickyNote, CreateNoteInput, UpdateNoteInput, MoveNoteInput } from '../models/note.model.js';

export interface INoteRepository {
  findByBoardId(boardId: string): Promise<StickyNote[]>;
  create(input: CreateNoteInput): Promise<StickyNote>;
  updateText(id: string, input: UpdateNoteInput): Promise<StickyNote | null>;
  updatePosition(id: string, input: MoveNoteInput): Promise<StickyNote | null>;
  createMany(inputs: CreateNoteInput[]): Promise<StickyNote[]>;
}
```

- [ ] **Step 2: review — Validate CRUD coverage**

Checklist:
- `findByBoardId`: covers `board:join` (load all notes) ✓
- `create`: covers `note:create` ✓
- `updateText`: covers `note:update` (partial — text only) ✓
- `updatePosition`: covers `note:move` (partial — x, y only) ✓
- `createMany`: covers JSON import (bulk insert) ✓
- Returns StickyNote (not MongoDB documents) — clean domain types ✓
- updateText/updatePosition return null if note not found — caller handles ✓

- [ ] **Step 3: Commit**

```bash
git add server/src/repositories/note.repository.ts
git commit -m "propose: INoteRepository interface for data access layer"
```

### Task 5: propose — Service interfaces (server)

**Files:**
- Create: `server/src/services/note.service.ts` (interface + class shell)
- Create: `server/src/services/auth.service.ts` (interface + class shell)

- [ ] **Step 1: Define NoteService class shell**

```typescript
// server/src/services/note.service.ts

import { StickyNote, CreateNoteInput, UpdateNoteInput, MoveNoteInput, ImportNoteInput,
         NoteColor, NOTE_COLORS, MAX_NOTE_TEXT_LENGTH, DEFAULT_BOARD_ID } from '../models/note.model.js';
import { INoteRepository } from '../repositories/note.repository.js';
import { v4 as uuidv4 } from 'uuid';

export class NoteService {
  constructor(private noteRepository: INoteRepository) {}

  async getBoardNotes(boardId: string): Promise<StickyNote[]> {
    throw new Error('Not implemented');
  }

  async createNote(text: string, x: number, y: number, color: NoteColor, author: string): Promise<StickyNote> {
    throw new Error('Not implemented');
  }

  async updateNoteText(id: string, text: string): Promise<StickyNote | null> {
    throw new Error('Not implemented');
  }

  async moveNote(id: string, x: number, y: number): Promise<StickyNote | null> {
    throw new Error('Not implemented');
  }

  async importNotes(notes: ImportNoteInput[], defaultAuthor: string): Promise<StickyNote[]> {
    throw new Error('Not implemented');
  }
}
```

- [ ] **Step 2: Define AuthService class shell**

```typescript
// server/src/services/auth.service.ts

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  userId: string;
  username: string;
}

export class AuthService {
  constructor(private jwtSecret: string) {}

  login(username: string): { token: string; userId: string; username: string } {
    throw new Error('Not implemented');
  }

  verify(token: string): JwtPayload {
    throw new Error('Not implemented');
  }
}
```

- [ ] **Step 3: review — Validate service coverage**

NoteService checklist:
- `getBoardNotes` → used by `board:join` handler ✓
- `createNote` → used by `note:create` handler. Takes primitive args, not raw payload ✓
- `updateNoteText` → used by `note:update` handler. Returns null if not found ✓
- `moveNote` → used by `note:move` handler. Returns null if not found ✓
- `importNotes` → used by POST /api/boards/default/import. Takes ImportNoteInput[] ✓
- Constructor takes INoteRepository — dependency injection ✓

AuthService checklist:
- `login` → generates JWT with userId (new UUID) + username. Returns token + user info ✓
- `verify` → validates JWT, returns JwtPayload. Throws on invalid ✓
- Constructor takes jwtSecret — configurable ✓

- [ ] **Step 4: Commit**

```bash
git add server/src/services/
git commit -m "propose: NoteService and AuthService interfaces with method signatures"
```

### Task 6: propose — Domain models (client)

**Files:**
- Create: `client/src/models/note.model.ts`

- [ ] **Step 1: Create client-side domain types**

```typescript
// client/src/models/note.model.ts

export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export const NOTE_COLORS: NoteColor[] = ['yellow', 'blue', 'green', 'pink', 'orange'];

export interface StickyNote {
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

// Socket.io event types (mirrors server)
export interface ServerToClientEvents {
  'note:created': (note: StickyNote) => void;
  'note:updated': (data: { id: string; text: string; updatedAt: Date }) => void;
  'note:moved': (data: { id: string; x: number; y: number }) => void;
  'board:user-joined': (data: { username: string; users: string[] }) => void;
  'board:user-left': (data: { username: string; users: string[] }) => void;
  'board:notes-imported': (notes: StickyNote[]) => void;
}

export interface ClientToServerEvents {
  'board:join': (ack: (notes: StickyNote[]) => void) => void;
  'note:create': (
    data: { text: string; x: number; y: number; color: NoteColor },
    ack: (note: StickyNote) => void,
  ) => void;
  'note:update': (data: { id: string; text: string }) => void;
  'note:move': (data: { id: string; x: number; y: number }) => void;
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/models/
git commit -m "propose: client-side domain models and Socket.io event types"
```

---

## Phase 3: APPLY — Backend Implementation

### Task 7: apply — MongoDB repository

**Files:**
- Modify: `server/src/repositories/note.repository.ts` (add MongoNoteRepository)
- Create: `server/src/config/database.ts`

- [ ] **Step 1: Create database connection helper**

```typescript
// server/src/config/database.ts

import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(uri: string): Promise<Db> {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  await db.collection('notes').createIndex({ boardId: 1 });
  console.log('Connected to MongoDB');
  return db;
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
  }
}
```

- [ ] **Step 2: Implement MongoNoteRepository**

Add below the INoteRepository interface in `server/src/repositories/note.repository.ts`:

```typescript
// server/src/repositories/note.repository.ts

import { Collection, WithId, Document } from 'mongodb';
import { StickyNote, CreateNoteInput, UpdateNoteInput, MoveNoteInput } from '../models/note.model.js';
import { v4 as uuidv4 } from 'uuid';

export interface INoteRepository {
  findByBoardId(boardId: string): Promise<StickyNote[]>;
  create(input: CreateNoteInput): Promise<StickyNote>;
  updateText(id: string, input: UpdateNoteInput): Promise<StickyNote | null>;
  updatePosition(id: string, input: MoveNoteInput): Promise<StickyNote | null>;
  createMany(inputs: CreateNoteInput[]): Promise<StickyNote[]>;
}

interface NoteDocument {
  _id: string;
  text: string;
  x: number;
  y: number;
  author: string;
  color: string;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

function toStickyNote(doc: NoteDocument): StickyNote {
  return {
    id: doc._id,
    text: doc.text,
    x: doc.x,
    y: doc.y,
    author: doc.author,
    color: doc.color as StickyNote['color'],
    boardId: doc.boardId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoNoteRepository implements INoteRepository {
  private collection: Collection<NoteDocument>;

  constructor(collection: Collection<NoteDocument>) {
    this.collection = collection;
  }

  async findByBoardId(boardId: string): Promise<StickyNote[]> {
    const docs = await this.collection.find({ boardId }).toArray();
    return docs.map(toStickyNote);
  }

  async create(input: CreateNoteInput): Promise<StickyNote> {
    const now = new Date();
    const doc: NoteDocument = {
      _id: uuidv4(),
      text: input.text,
      x: input.x,
      y: input.y,
      author: input.author,
      color: input.color,
      boardId: input.boardId,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(doc);
    return toStickyNote(doc);
  }

  async updateText(id: string, input: UpdateNoteInput): Promise<StickyNote | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { text: input.text, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return result ? toStickyNote(result) : null;
  }

  async updatePosition(id: string, input: MoveNoteInput): Promise<StickyNote | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { x: input.x, y: input.y, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return result ? toStickyNote(result) : null;
  }

  async createMany(inputs: CreateNoteInput[]): Promise<StickyNote[]> {
    const now = new Date();
    const docs: NoteDocument[] = inputs.map(input => ({
      _id: uuidv4(),
      text: input.text,
      x: input.x,
      y: input.y,
      author: input.author,
      color: input.color,
      boardId: input.boardId,
      createdAt: now,
      updatedAt: now,
    }));
    await this.collection.insertMany(docs);
    return docs.map(toStickyNote);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add server/src/repositories/note.repository.ts server/src/config/database.ts
git commit -m "apply: MongoNoteRepository implementation + database connection"
```

### Task 8: apply — In-memory repository (for tests)

**Files:**
- Create: `server/tests/helpers/mock.repository.ts`

- [ ] **Step 1: Create InMemoryNoteRepository**

```typescript
// server/tests/helpers/mock.repository.ts

import { INoteRepository } from '../../src/repositories/note.repository.js';
import { StickyNote, CreateNoteInput, UpdateNoteInput, MoveNoteInput } from '../../src/models/note.model.js';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryNoteRepository implements INoteRepository {
  private notes: Map<string, StickyNote> = new Map();

  async findByBoardId(boardId: string): Promise<StickyNote[]> {
    return Array.from(this.notes.values()).filter(n => n.boardId === boardId);
  }

  async create(input: CreateNoteInput): Promise<StickyNote> {
    const now = new Date();
    const note: StickyNote = {
      id: uuidv4(),
      text: input.text,
      x: input.x,
      y: input.y,
      author: input.author,
      color: input.color,
      boardId: input.boardId,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(note.id, note);
    return note;
  }

  async updateText(id: string, input: UpdateNoteInput): Promise<StickyNote | null> {
    const note = this.notes.get(id);
    if (!note) return null;
    const updated = { ...note, text: input.text, updatedAt: new Date() };
    this.notes.set(id, updated);
    return updated;
  }

  async updatePosition(id: string, input: MoveNoteInput): Promise<StickyNote | null> {
    const note = this.notes.get(id);
    if (!note) return null;
    const updated = { ...note, x: input.x, y: input.y, updatedAt: new Date() };
    this.notes.set(id, updated);
    return updated;
  }

  async createMany(inputs: CreateNoteInput[]): Promise<StickyNote[]> {
    const results: StickyNote[] = [];
    for (const input of inputs) {
      results.push(await this.create(input));
    }
    return results;
  }

  clear(): void {
    this.notes.clear();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/tests/helpers/mock.repository.ts
git commit -m "apply: InMemoryNoteRepository for unit testing"
```

### Task 9: apply — AuthService implementation

**Files:**
- Modify: `server/src/services/auth.service.ts`

- [ ] **Step 1: Implement AuthService**

```typescript
// server/src/services/auth.service.ts

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  userId: string;
  username: string;
}

export class AuthService {
  constructor(private jwtSecret: string) {}

  login(username: string): { token: string; userId: string; username: string } {
    const userId = uuidv4();
    const token = jwt.sign({ userId, username }, this.jwtSecret, { expiresIn: '24h' });
    return { token, userId, username };
  }

  verify(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
    return { userId: decoded.userId, username: decoded.username };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/services/auth.service.ts
git commit -m "apply: AuthService with JWT login and verify"
```

### Task 10: apply — NoteService implementation

**Files:**
- Modify: `server/src/services/note.service.ts`

- [ ] **Step 1: Implement NoteService**

```typescript
// server/src/services/note.service.ts

import { StickyNote, CreateNoteInput, ImportNoteInput,
         NoteColor, NOTE_COLORS, MAX_NOTE_TEXT_LENGTH, DEFAULT_BOARD_ID } from '../models/note.model.js';
import { INoteRepository } from '../repositories/note.repository.js';

export class NoteService {
  constructor(private noteRepository: INoteRepository) {}

  async getBoardNotes(boardId: string): Promise<StickyNote[]> {
    return this.noteRepository.findByBoardId(boardId);
  }

  async createNote(text: string, x: number, y: number, color: NoteColor, author: string): Promise<StickyNote> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Note text cannot be empty');
    }
    if (trimmed.length > MAX_NOTE_TEXT_LENGTH) {
      throw new Error(`Note text cannot exceed ${MAX_NOTE_TEXT_LENGTH} characters`);
    }
    if (!NOTE_COLORS.includes(color)) {
      throw new Error(`Invalid color: ${color}`);
    }
    return this.noteRepository.create({
      text: trimmed,
      x,
      y,
      color,
      author,
      boardId: DEFAULT_BOARD_ID,
    });
  }

  async updateNoteText(id: string, text: string): Promise<StickyNote | null> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Note text cannot be empty');
    }
    if (trimmed.length > MAX_NOTE_TEXT_LENGTH) {
      throw new Error(`Note text cannot exceed ${MAX_NOTE_TEXT_LENGTH} characters`);
    }
    return this.noteRepository.updateText(id, { text: trimmed });
  }

  async moveNote(id: string, x: number, y: number): Promise<StickyNote | null> {
    return this.noteRepository.updatePosition(id, { x, y });
  }

  async importNotes(notes: ImportNoteInput[], defaultAuthor: string): Promise<StickyNote[]> {
    const inputs: CreateNoteInput[] = notes.map(note => ({
      text: note.text.trim().slice(0, MAX_NOTE_TEXT_LENGTH),
      x: note.x,
      y: note.y,
      color: (note.color && NOTE_COLORS.includes(note.color as NoteColor) ? note.color : 'yellow') as NoteColor,
      author: note.author || defaultAuthor,
      boardId: DEFAULT_BOARD_ID,
    }));
    return this.noteRepository.createMany(inputs);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/services/note.service.ts
git commit -m "apply: NoteService with validation and business logic"
```

### Task 11: apply — NoteService unit tests

**Files:**
- Create: `server/tests/services/note.service.test.ts`
- Create: `server/vitest.config.ts`

- [ ] **Step 1: Create vitest config**

```typescript
// server/vitest.config.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

- [ ] **Step 2: Write unit tests**

```typescript
// server/tests/services/note.service.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { NoteService } from '../../src/services/note.service.js';
import { InMemoryNoteRepository } from '../helpers/mock.repository.js';

describe('NoteService', () => {
  let service: NoteService;
  let repo: InMemoryNoteRepository;

  beforeEach(() => {
    repo = new InMemoryNoteRepository();
    service = new NoteService(repo);
  });

  describe('createNote', () => {
    it('creates a note with valid input', async () => {
      const note = await service.createNote('Hello', 100, 200, 'yellow', 'alice');
      expect(note.text).toBe('Hello');
      expect(note.x).toBe(100);
      expect(note.y).toBe(200);
      expect(note.color).toBe('yellow');
      expect(note.author).toBe('alice');
      expect(note.boardId).toBe('default');
      expect(note.id).toBeDefined();
      expect(note.createdAt).toBeInstanceOf(Date);
    });

    it('trims whitespace from text', async () => {
      const note = await service.createNote('  Hello  ', 0, 0, 'blue', 'alice');
      expect(note.text).toBe('Hello');
    });

    it('rejects empty text', async () => {
      await expect(service.createNote('', 0, 0, 'yellow', 'alice')).rejects.toThrow('Note text cannot be empty');
    });

    it('rejects text exceeding max length', async () => {
      const longText = 'a'.repeat(501);
      await expect(service.createNote(longText, 0, 0, 'yellow', 'alice')).rejects.toThrow('cannot exceed 500');
    });

    it('rejects invalid color', async () => {
      await expect(service.createNote('Hello', 0, 0, 'red' as any, 'alice')).rejects.toThrow('Invalid color');
    });
  });

  describe('updateNoteText', () => {
    it('updates text of an existing note', async () => {
      const note = await service.createNote('Original', 0, 0, 'yellow', 'alice');
      const updated = await service.updateNoteText(note.id, 'Updated');
      expect(updated?.text).toBe('Updated');
    });

    it('returns null for non-existent note', async () => {
      const result = await service.updateNoteText('nonexistent', 'text');
      expect(result).toBeNull();
    });

    it('rejects empty text', async () => {
      const note = await service.createNote('Original', 0, 0, 'yellow', 'alice');
      await expect(service.updateNoteText(note.id, '  ')).rejects.toThrow('Note text cannot be empty');
    });
  });

  describe('moveNote', () => {
    it('updates position of an existing note', async () => {
      const note = await service.createNote('Note', 0, 0, 'yellow', 'alice');
      const moved = await service.moveNote(note.id, 500, 600);
      expect(moved?.x).toBe(500);
      expect(moved?.y).toBe(600);
    });

    it('returns null for non-existent note', async () => {
      const result = await service.moveNote('nonexistent', 100, 200);
      expect(result).toBeNull();
    });
  });

  describe('getBoardNotes', () => {
    it('returns all notes for a board', async () => {
      await service.createNote('Note 1', 0, 0, 'yellow', 'alice');
      await service.createNote('Note 2', 100, 100, 'blue', 'bob');
      const notes = await service.getBoardNotes('default');
      expect(notes).toHaveLength(2);
    });

    it('returns empty array for board with no notes', async () => {
      const notes = await service.getBoardNotes('default');
      expect(notes).toEqual([]);
    });
  });

  describe('importNotes', () => {
    it('imports valid notes with defaults', async () => {
      const input = [
        { text: 'Note 1', x: 100, y: 200 },
        { text: 'Note 2', x: 300, y: 400, color: 'blue', author: 'bob' },
      ];
      const notes = await service.importNotes(input, 'alice');
      expect(notes).toHaveLength(2);
      expect(notes[0].author).toBe('alice');
      expect(notes[0].color).toBe('yellow');
      expect(notes[1].author).toBe('bob');
      expect(notes[1].color).toBe('blue');
    });

    it('defaults invalid color to yellow', async () => {
      const input = [{ text: 'Note', x: 0, y: 0, color: 'invalid' }];
      const notes = await service.importNotes(input, 'alice');
      expect(notes[0].color).toBe('yellow');
    });

    it('truncates text exceeding max length', async () => {
      const input = [{ text: 'a'.repeat(600), x: 0, y: 0 }];
      const notes = await service.importNotes(input, 'alice');
      expect(notes[0].text.length).toBe(500);
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd server && npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add server/tests/ server/vitest.config.ts
git commit -m "verify: NoteService unit tests — all passing"
```

### Task 12: apply — Transport layer (Socket.io handlers)

**Files:**
- Create: `server/src/transport/socket/auth.middleware.ts`
- Create: `server/src/transport/socket/board.handlers.ts`
- Create: `server/src/transport/socket/note.handlers.ts`

- [ ] **Step 1: Create Socket.io auth middleware**

```typescript
// server/src/transport/socket/auth.middleware.ts

import { Socket } from 'socket.io';
import { AuthService } from '../../services/auth.service.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../models/socket-events.js';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function createAuthMiddleware(authService: AuthService) {
  return (socket: AppSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = authService.verify(token);
      socket.data.userId = payload.userId;
      socket.data.username = payload.username;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  };
}
```

- [ ] **Step 2: Create board handlers (join + presence)**

```typescript
// server/src/transport/socket/board.handlers.ts

import { Server, Socket } from 'socket.io';
import { NoteService } from '../../services/note.service.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../models/socket-events.js';
import { DEFAULT_BOARD_ID } from '../../models/note.model.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

// Track connected users per board (in-memory, per-instance)
const boardUsers = new Map<string, Set<string>>();

function getBoardUsers(boardId: string): string[] {
  return Array.from(boardUsers.get(boardId) || []);
}

function addUser(boardId: string, username: string): void {
  if (!boardUsers.has(boardId)) {
    boardUsers.set(boardId, new Set());
  }
  boardUsers.get(boardId)!.add(username);
}

function removeUser(boardId: string, username: string): void {
  boardUsers.get(boardId)?.delete(username);
}

export function registerBoardHandlers(io: AppServer, socket: AppSocket, noteService: NoteService) {
  socket.on('board:join', async (ack) => {
    const { username } = socket.data;
    socket.join(DEFAULT_BOARD_ID);
    addUser(DEFAULT_BOARD_ID, username);

    const notes = await noteService.getBoardNotes(DEFAULT_BOARD_ID);
    ack(notes);

    socket.to(DEFAULT_BOARD_ID).emit('board:user-joined', {
      username,
      users: getBoardUsers(DEFAULT_BOARD_ID),
    });
  });

  socket.on('disconnect', () => {
    const { username } = socket.data;
    removeUser(DEFAULT_BOARD_ID, username);

    socket.to(DEFAULT_BOARD_ID).emit('board:user-left', {
      username,
      users: getBoardUsers(DEFAULT_BOARD_ID),
    });
  });
}
```

- [ ] **Step 3: Create note handlers**

```typescript
// server/src/transport/socket/note.handlers.ts

import { Server, Socket } from 'socket.io';
import { NoteService } from '../../services/note.service.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../models/socket-events.js';
import { DEFAULT_BOARD_ID } from '../../models/note.model.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function registerNoteHandlers(io: AppServer, socket: AppSocket, noteService: NoteService) {
  socket.on('note:create', async (data, ack) => {
    try {
      const note = await noteService.createNote(
        data.text, data.x, data.y, data.color, socket.data.username,
      );
      socket.to(DEFAULT_BOARD_ID).emit('note:created', note);
      ack(note);
    } catch (err) {
      console.error('Error creating note:', err);
    }
  });

  socket.on('note:update', async (data) => {
    try {
      const updated = await noteService.updateNoteText(data.id, data.text);
      if (updated) {
        socket.to(DEFAULT_BOARD_ID).emit('note:updated', {
          id: updated.id,
          text: updated.text,
          updatedAt: updated.updatedAt,
        });
      }
    } catch (err) {
      console.error('Error updating note:', err);
    }
  });

  socket.on('note:move', async (data) => {
    try {
      const moved = await noteService.moveNote(data.id, data.x, data.y);
      if (moved) {
        socket.to(DEFAULT_BOARD_ID).emit('note:moved', {
          id: moved.id,
          x: moved.x,
          y: moved.y,
        });
      }
    } catch (err) {
      console.error('Error moving note:', err);
    }
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/transport/socket/
git commit -m "apply: Socket.io transport layer — auth middleware, board and note handlers"
```

### Task 13: apply — HTTP routes (auth + import)

**Files:**
- Create: `server/src/transport/http/auth.routes.ts`
- Create: `server/src/transport/http/board.routes.ts`

- [ ] **Step 1: Create auth routes**

```typescript
// server/src/transport/http/auth.routes.ts

import { Router, Request, Response } from 'express';
import { AuthService } from '../../services/auth.service.js';

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  router.post('/login', (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }
    const result = authService.login(username.trim());
    res.json(result);
  });

  return router;
}
```

- [ ] **Step 2: Create board routes (JSON import)**

```typescript
// server/src/transport/http/board.routes.ts

import { Router, Request, Response } from 'express';
import { Server } from 'socket.io';
import multer from 'multer';
import { NoteService } from '../../services/note.service.js';
import { AuthService } from '../../services/auth.service.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../models/socket-events.js';
import { DEFAULT_BOARD_ID } from '../../models/note.model.js';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export function createBoardRoutes(noteService: NoteService, authService: AuthService, io: AppServer): Router {
  const router = Router();

  router.post('/default/import', upload.single('file'), async (req: Request, res: Response) => {
    // Verify JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization required' });
      return;
    }

    let username: string;
    try {
      const payload = authService.verify(authHeader.slice(7));
      username = payload.username;
    } catch {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'JSON file is required' });
      return;
    }

    let notesData: unknown[];
    try {
      notesData = JSON.parse(req.file.buffer.toString('utf-8'));
      if (!Array.isArray(notesData)) {
        res.status(400).json({ error: 'File must contain a JSON array' });
        return;
      }
    } catch {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }

    // Validate each note has required fields
    const validNotes = notesData.filter((n: any) =>
      n && typeof n.text === 'string' && typeof n.x === 'number' && typeof n.y === 'number'
    );

    if (validNotes.length === 0) {
      res.status(400).json({ error: 'No valid notes found in file' });
      return;
    }

    const imported = await noteService.importNotes(validNotes as any[], username);
    io.to(DEFAULT_BOARD_ID).emit('board:notes-imported', imported);
    res.json({ imported: imported.length });
  });

  return router;
}
```

- [ ] **Step 3: Commit**

```bash
git add server/src/transport/http/
git commit -m "apply: HTTP routes — auth login and JSON import with JWT verification"
```

### Task 14: apply — Redis config + server bootstrap

**Files:**
- Create: `server/src/config/redis.ts`
- Create: `server/src/index.ts`

- [ ] **Step 1: Create Redis client helper**

```typescript
// server/src/config/redis.ts

import { createClient } from 'redis';

export async function createRedisClients(redisUrl: string) {
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  console.log('Connected to Redis');
  return { pubClient, subClient };
}
```

- [ ] **Step 2: Create server bootstrap (composition root)**

```typescript
// server/src/index.ts

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { connectToDatabase } from './config/database.js';
import { createRedisClients } from './config/redis.js';
import { MongoNoteRepository } from './repositories/note.repository.js';
import { NoteService } from './services/note.service.js';
import { AuthService } from './services/auth.service.js';
import { createAuthMiddleware } from './transport/socket/auth.middleware.js';
import { registerBoardHandlers } from './transport/socket/board.handlers.js';
import { registerNoteHandlers } from './transport/socket/note.handlers.js';
import { createAuthRoutes } from './transport/http/auth.routes.js';
import { createBoardRoutes } from './transport/http/board.routes.js';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './models/socket-events.js';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-board';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

async function main() {
  // Infrastructure
  const db = await connectToDatabase(MONGODB_URI);
  const { pubClient, subClient } = await createRedisClients(REDIS_URL);

  // Dependencies
  const noteRepository = new MongoNoteRepository(db.collection('notes'));
  const noteService = new NoteService(noteRepository);
  const authService = new AuthService(JWT_SECRET);

  // Express
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', createAuthRoutes(authService));

  // Socket.io
  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
    transports: ['websocket'],
    cors: { origin: '*' },
  });

  // Redis adapter
  io.adapter(createAdapter(pubClient, subClient));

  // Board routes need io for broadcasting imports
  app.use('/api/boards', createBoardRoutes(noteService, authService, io));

  // Socket.io middleware + handlers
  io.use(createAuthMiddleware(authService));
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.username} (${socket.id})`);
    registerBoardHandlers(io, socket, noteService);
    registerNoteHandlers(io, socket, noteService);
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch(console.error);
```

- [ ] **Step 3: verify — Type-check the entire server**

```bash
cd server && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add server/src/config/redis.ts server/src/index.ts
git commit -m "apply: server bootstrap — Express + Socket.io + Redis adapter + DI wiring"
```

---

## Phase 4: APPLY — Frontend Implementation

### Task 15: apply — API service (HTTP client)

**Files:**
- Create: `client/src/services/api.ts`

- [ ] **Step 1: Create API client**

```typescript
// client/src/services/api.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
}

export async function login(username: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    throw new Error('Login failed');
  }
  return res.json();
}

export async function importNotes(file: File, token: string): Promise<{ imported: number }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/boards/default/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    throw new Error('Import failed');
  }
  return res.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/services/api.ts
git commit -m "apply: frontend API service — login and import HTTP calls"
```

### Task 16: apply — useSocket hook

**Files:**
- Create: `client/src/hooks/useSocket.ts`

- [ ] **Step 1: Create socket connection hook**

```typescript
// client/src/hooks/useSocket.ts

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '../models/note.model';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket(token: string | null) {
  const socketRef = useRef<AppSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket: AppSocket = io(API_URL, {
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return { socket: socketRef.current, connected };
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/hooks/useSocket.ts
git commit -m "apply: useSocket hook — typed Socket.io connection with auth"
```

### Task 17: apply — useBoard hook

**Files:**
- Create: `client/src/hooks/useBoard.ts`

- [ ] **Step 1: Create board state management hook**

```typescript
// client/src/hooks/useBoard.ts

import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { StickyNote, NoteColor, ServerToClientEvents, ClientToServerEvents } from '../models/note.model';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useBoard(socket: AppSocket | null) {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);
  const throttleTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Join board and load initial notes
  useEffect(() => {
    if (!socket) return;

    socket.emit('board:join', (initialNotes) => {
      setNotes(initialNotes);
      setJoined(true);
    });

    // Listen for remote events
    socket.on('note:created', (note) => {
      setNotes((prev) => [...prev, note]);
    });

    socket.on('note:updated', (data) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === data.id ? { ...n, text: data.text, updatedAt: data.updatedAt } : n)),
      );
    });

    socket.on('note:moved', (data) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === data.id ? { ...n, x: data.x, y: data.y } : n)),
      );
    });

    socket.on('board:user-joined', (data) => {
      setUsers(data.users);
    });

    socket.on('board:user-left', (data) => {
      setUsers(data.users);
    });

    socket.on('board:notes-imported', (importedNotes) => {
      setNotes((prev) => [...prev, ...importedNotes]);
    });

    return () => {
      socket.off('note:created');
      socket.off('note:updated');
      socket.off('note:moved');
      socket.off('board:user-joined');
      socket.off('board:user-left');
      socket.off('board:notes-imported');
    };
  }, [socket]);

  const createNote = useCallback(
    (text: string, x: number, y: number, color: NoteColor) => {
      if (!socket) return;
      socket.emit('note:create', { text, x, y, color }, (note) => {
        setNotes((prev) => [...prev, note]);
      });
    },
    [socket],
  );

  const updateNote = useCallback(
    (id: string, text: string) => {
      if (!socket) return;
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, text, updatedAt: new Date() } : n)),
      );
      socket.emit('note:update', { id, text });
    },
    [socket],
  );

  const moveNote = useCallback(
    (id: string, x: number, y: number) => {
      if (!socket) return;
      // Optimistic update
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
      // Throttle socket emit
      const existing = throttleTimers.current.get(id);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        socket.emit('note:move', { id, x, y });
        throttleTimers.current.delete(id);
      }, 50);
      throttleTimers.current.set(id, timer);
    },
    [socket],
  );

  return { notes, users, joined, createNote, updateNote, moveNote };
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/hooks/useBoard.ts
git commit -m "apply: useBoard hook — state management with optimistic updates and throttling"
```

### Task 18: apply — UsernamePrompt component

**Files:**
- Create: `client/src/components/UsernamePrompt.tsx`
- Create: `client/src/components/UsernamePrompt.css`

- [ ] **Step 1: Create UsernamePrompt component**

```tsx
// client/src/components/UsernamePrompt.tsx

import { useState, FormEvent } from 'react';
import './UsernamePrompt.css';

interface Props {
  onLogin: (username: string) => void;
  loading: boolean;
}

export function UsernamePrompt({ onLogin, loading }: Props) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      onLogin(trimmed);
    }
  };

  return (
    <div className="username-prompt">
      <div className="username-prompt__card">
        <h1>Collaborative Board</h1>
        <p>Enter your name to join the board</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            autoFocus
            disabled={loading}
            maxLength={30}
          />
          <button type="submit" disabled={!username.trim() || loading}>
            {loading ? 'Joining...' : 'Join Board'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create styles**

```css
/* client/src/components/UsernamePrompt.css */

.username-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f5f5;
}

.username-prompt__card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 360px;
  width: 100%;
}

.username-prompt__card h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #333;
}

.username-prompt__card p {
  margin: 0 0 1.5rem;
  color: #666;
}

.username-prompt__card form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.username-prompt__card input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.username-prompt__card input:focus {
  border-color: #4a90d9;
}

.username-prompt__card button {
  padding: 0.75rem;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.username-prompt__card button:hover:not(:disabled) {
  background: #357abd;
}

.username-prompt__card button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/UsernamePrompt.tsx client/src/components/UsernamePrompt.css
git commit -m "apply: UsernamePrompt component with form and styles"
```

### Task 19: apply — StickyNote component

**Files:**
- Create: `client/src/components/StickyNote.tsx`
- Create: `client/src/components/StickyNote.css`

- [ ] **Step 1: Create StickyNote component**

```tsx
// client/src/components/StickyNote.tsx

import { useState, useRef, useEffect, MouseEvent, KeyboardEvent } from 'react';
import { StickyNote as StickyNoteType } from '../models/note.model';
import './StickyNote.css';

interface Props {
  note: StickyNoteType;
  onMove: (id: string, x: number, y: number) => void;
  onUpdate: (id: string, text: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  yellow: '#fff9c4',
  blue: '#bbdefb',
  green: '#c8e6c9',
  pink: '#f8bbd0',
  orange: '#ffe0b2',
};

export function StickyNote({ note, onMove, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) {
      setEditText(note.text);
    }
  }, [note.text, editing]);

  const handleMouseDown = (e: MouseEvent) => {
    if (editing) return;
    e.preventDefault();
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    };
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      onMove(note.id, newX, newY);
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, note.id, onMove]);

  const handleDoubleClick = () => {
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const saveEdit = () => {
    setEditing(false);
    const trimmed = editText.trim();
    if (trimmed && trimmed !== note.text) {
      onUpdate(note.id, trimmed);
    } else {
      setEditText(note.text);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setEditText(note.text);
    }
  };

  return (
    <div
      className={`sticky-note ${dragging ? 'sticky-note--dragging' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        backgroundColor: COLOR_MAP[note.color] || COLOR_MAP.yellow,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          className="sticky-note__editor"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
      ) : (
        <p className="sticky-note__text">{note.text}</p>
      )}
      <span className="sticky-note__author">{note.author}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create styles**

```css
/* client/src/components/StickyNote.css */

.sticky-note {
  position: absolute;
  width: 200px;
  min-height: 120px;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
  cursor: grab;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow 0.2s;
}

.sticky-note:not(.sticky-note--dragging) {
  transition: left 0.15s ease-out, top 0.15s ease-out, box-shadow 0.2s;
}

.sticky-note--dragging {
  cursor: grabbing;
  box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.25);
  z-index: 1000;
}

.sticky-note__text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-word;
  color: #333;
  flex: 1;
}

.sticky-note__editor {
  width: 100%;
  min-height: 80px;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
  resize: none;
  outline: none;
  font-family: inherit;
  flex: 1;
  cursor: text;
}

.sticky-note__author {
  font-size: 0.7rem;
  color: #888;
  margin-top: 8px;
  text-align: right;
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/StickyNote.tsx client/src/components/StickyNote.css
git commit -m "apply: StickyNote component — drag & drop, inline edit, color"
```

### Task 20: apply — Board + UserList + ColorPicker components

**Files:**
- Create: `client/src/components/Board.tsx`
- Create: `client/src/components/Board.css`
- Create: `client/src/components/UserList.tsx`
- Create: `client/src/components/UserList.css`

- [ ] **Step 1: Create UserList component**

```tsx
// client/src/components/UserList.tsx

import './UserList.css';

interface Props {
  users: string[];
  currentUser: string;
  connected: boolean;
}

export function UserList({ users, currentUser, connected }: Props) {
  return (
    <div className="user-list">
      <span className={`user-list__status ${connected ? 'user-list__status--connected' : ''}`} />
      <span className="user-list__label">{connected ? 'Connected' : 'Reconnecting...'}</span>
      {users.map((user) => (
        <span key={user} className={`user-list__user ${user === currentUser ? 'user-list__user--me' : ''}`}>
          {user}
        </span>
      ))}
    </div>
  );
}
```

```css
/* client/src/components/UserList.css */

.user-list {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.85rem;
}

.user-list__status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.user-list__status--connected {
  background: #4caf50;
}

.user-list__label {
  color: #666;
  margin-right: 4px;
}

.user-list__user {
  padding: 2px 10px;
  background: #e3f2fd;
  border-radius: 12px;
  color: #1976d2;
}

.user-list__user--me {
  background: #1976d2;
  color: white;
}
```

- [ ] **Step 2: Create Board component**

```tsx
// client/src/components/Board.tsx

import { useRef, MouseEvent, useState, ChangeEvent } from 'react';
import { StickyNote as StickyNoteType, NoteColor, NOTE_COLORS } from '../models/note.model';
import { StickyNote } from './StickyNote';
import { UserList } from './UserList';
import { importNotes } from '../services/api';
import './Board.css';

interface Props {
  notes: StickyNoteType[];
  users: string[];
  username: string;
  connected: boolean;
  token: string;
  onCreateNote: (text: string, x: number, y: number, color: NoteColor) => void;
  onUpdateNote: (id: string, text: string) => void;
  onMoveNote: (id: string, x: number, y: number) => void;
  onLogout: () => void;
}

export function Board({ notes, users, username, connected, token, onCreateNote, onUpdateNote, onMoveNote, onLogout }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow');

  const handleBoardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== boardRef.current) return;
    const rect = boardRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onCreateNote('New note', x, y, selectedColor);
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importNotes(file, token);
    } catch (err) {
      console.error('Import failed:', err);
    }
    e.target.value = '';
  };

  return (
    <div className="board-container">
      <div className="board-toolbar">
        <div className="board-toolbar__left">
          <span className="board-toolbar__title">Collaborative Board</span>
          <div className="board-toolbar__colors">
            {NOTE_COLORS.map((color) => (
              <button
                key={color}
                className={`board-toolbar__color ${color === selectedColor ? 'board-toolbar__color--selected' : ''}`}
                style={{ backgroundColor: color === 'yellow' ? '#fff9c4' : color === 'blue' ? '#bbdefb' : color === 'green' ? '#c8e6c9' : color === 'pink' ? '#f8bbd0' : '#ffe0b2' }}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
          </div>
          <button className="board-toolbar__btn" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} hidden />
        </div>
        <div className="board-toolbar__right">
          <UserList users={users} currentUser={username} connected={connected} />
          <button className="board-toolbar__btn board-toolbar__btn--logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="board" ref={boardRef} onClick={handleBoardClick}>
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onMove={onMoveNote}
            onUpdate={onUpdateNote}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Board styles**

```css
/* client/src/components/Board.css */

.board-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  z-index: 100;
}

.board-toolbar__left,
.board-toolbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.board-toolbar__title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.board-toolbar__colors {
  display: flex;
  gap: 4px;
}

.board-toolbar__color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s;
}

.board-toolbar__color--selected {
  border-color: #333;
}

.board-toolbar__btn {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.board-toolbar__btn:hover {
  background: #f5f5f5;
}

.board-toolbar__btn--logout {
  color: #d32f2f;
  border-color: #d32f2f;
}

.board-toolbar__btn--logout:hover {
  background: #ffebee;
}

.board {
  flex: 1;
  position: relative;
  background: #fafafa;
  overflow: hidden;
  cursor: crosshair;
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/Board.tsx client/src/components/Board.css client/src/components/UserList.tsx client/src/components/UserList.css
git commit -m "apply: Board, UserList components with toolbar, color picker, import, logout"
```

### Task 21: apply — App.tsx (root with auth gate)

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/index.css` (global reset)
- Delete: `client/src/App.css` (Vite default)

- [ ] **Step 1: Create App.tsx**

```tsx
// client/src/App.tsx

import { useState, useCallback, useEffect } from 'react';
import { UsernamePrompt } from './components/UsernamePrompt';
import { Board } from './components/Board';
import { useSocket } from './hooks/useSocket';
import { useBoard } from './hooks/useBoard';
import { login } from './services/api';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState<string>(() => localStorage.getItem('username') || '');
  const [loginLoading, setLoginLoading] = useState(false);

  const { socket, connected } = useSocket(token);
  const { notes, users, joined, createNote, updateNote, moveNote } = useBoard(socket);

  const handleLogin = useCallback(async (name: string) => {
    setLoginLoading(true);
    try {
      const result = await login(name);
      localStorage.setItem('token', result.token);
      localStorage.setItem('username', result.username);
      setToken(result.token);
      setUsername(result.username);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername('');
  }, []);

  if (!token) {
    return <UsernamePrompt onLogin={handleLogin} loading={loginLoading} />;
  }

  return (
    <Board
      notes={notes}
      users={users}
      username={username}
      connected={connected}
      token={token}
      onCreateNote={createNote}
      onUpdateNote={updateNote}
      onMoveNote={moveNote}
      onLogout={handleLogout}
    />
  );
}

export default App;
```

- [ ] **Step 2: Update global styles**

```css
/* client/src/index.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 3: Clean up Vite defaults**

Delete `client/src/App.css` if it exists. Update `client/src/main.tsx` to only import `index.css`:

```tsx
// client/src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Commit**

```bash
git add client/src/App.tsx client/src/index.css client/src/main.tsx
git rm -f client/src/App.css 2>/dev/null; true
git commit -m "apply: App root component with auth gate, login, logout"
```

---

## Phase 5: Infrastructure

### Task 22: apply — Dockerfiles

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

### Task 23: apply — Docker Compose (default)

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

### Task 24: apply — Docker Compose (scaling demo)

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

## Phase 6: Seed & Documentation

### Task 25: apply — Seed script

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

### Task 26: apply — Sample data file

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

### Task 27: apply — README

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

### Task 28: apply — Write-up

**Files:**
- Create: `WRITEUP.md`

- [ ] **Step 1: Write the challenge write-up**

```markdown
# Write-Up

## How I Approached the Challenge

I used **spec-driven development**: before writing any code, I defined all TypeScript interfaces, Socket.io event contracts, and repository patterns. This approach ensures type safety end-to-end and makes the codebase self-documenting — the types ARE the documentation.

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
- Sec 1 (Overview + success criteria): Tasks 23 (docker-compose), 11 (tests), all apply tasks ✓
- Sec 2 (Spec-driven methodology): Tasks 2-6 (propose phases), naming convention throughout ✓
- Sec 3 (Architecture): Tasks 14 (bootstrap), 22-24 (Docker) ✓
- Sec 4 (Redis scaling): Tasks 14 (Redis adapter), 24 (scaling compose) ✓
- Sec 5 (Auth): Tasks 5, 9 (AuthService), 12 (middleware), 13 (routes), 18 (prompt), 21 (App) ✓
- Sec 6 (Data model): Task 2 (domain models), 7 (Mongo repo) ✓
- Sec 7 (Event contract): Task 3 (socket-events.ts) ✓
- Sec 8 (Backend arch): Tasks 7-14 ✓
- Sec 9 (Frontend arch): Tasks 15-21 ✓
- Sec 10 (JSON import): Tasks 13 (board.routes), 20 (Board component import button), 25 (seed script), 26 (sample data) ✓
- Sec 11 (Conflict resolution): LWW is implicit in the implementation (last write to MongoDB wins) ✓
- Sec 12 (Testing): Task 11 ✓
- Sec 13 (Infrastructure): Tasks 22-24 (Docker), 25 (auto-seed on startup) ✓
- Sec 14 (Tech stack): All covered ✓
- Sec 15 (Scope): All in-scope items have tasks ✓
- Sec 16 (Time budget): Plan follows the same phase ordering ✓

**Placeholder scan:** No TBDs, TODOs, or "implement later" found. All steps have code. ✓

**Type consistency:**
- `StickyNote` interface: same fields in server `note.model.ts` and client `note.model.ts` ✓
- `ServerToClientEvents` / `ClientToServerEvents`: same in server `socket-events.ts` and client `note.model.ts` ✓
- `INoteRepository` methods match what `NoteService` calls ✓
- `NoteService` method signatures match what transport handlers call ✓
- `useBoard` hook functions match what `Board` component expects as props ✓
