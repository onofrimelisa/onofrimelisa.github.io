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
