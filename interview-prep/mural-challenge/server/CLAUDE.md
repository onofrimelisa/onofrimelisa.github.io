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
