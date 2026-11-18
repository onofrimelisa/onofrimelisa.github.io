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
