## Why
The transport layer wires services to external interfaces (WebSocket and HTTP). Separating handlers from services keeps transport concerns isolated.

## What Changes
- Create Socket.io board handlers (join, disconnect, presence tracking)
- Create Socket.io note handlers (create, update, move with broadcast)
- Create Express auth routes (POST /api/auth/login)
- Create Express board routes (POST /api/boards/default/import with file upload)

## Capabilities
### New Capabilities
- `transport/socket/board`: Board join/leave with user presence
- `transport/socket/note`: Real-time note CRUD with room broadcasting
- `transport/http/auth`: JWT login endpoint
- `transport/http/board`: JSON file import with JWT auth
