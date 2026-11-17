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
