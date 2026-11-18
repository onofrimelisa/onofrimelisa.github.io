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
- **Three-layer drag model**: Local state updates at ~60fps (instant cursor tracking), socket emit is debounced at 50ms (reduces network to ~1-3 messages/sec during drag), server persists on receive. Same pattern used by Miro and Figma — instant local, rate-limited network, batched persistence.
- **CSS transitions on remote notes**: When another user moves a note, `transition: left 0.15s ease, top 0.15s ease` interpolates between received positions. When you drag, transitions are disabled so the note follows your cursor exactly.
- **Debounce (not throttle) for prototype**: A debounce (trailing edge) means events only emit when movement pauses. A throttle would emit at regular intervals for smoother remote tracking. Debounce is acceptable here because natural hand jitter creates micro-pauses, and CSS transitions smooth the gaps. Production evolution: proper throttle + write coalescing on the server.
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
| Debounce (not throttle) on drag emit | Fewer network messages but remote users see position jumps instead of smooth tracking. CSS transitions compensate. Production: proper throttle (leading + trailing edge) |
| No server-side write coalescing | Every move event triggers a MongoDB write. Simple but doesn't scale. Production: buffer in Redis, flush to DB every 500ms-1s |
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
