## Design

### Event Taxonomy
- `note:*` events handle individual note CRUD (create, update, move)
- `board:*` events handle board-level actions (join, user presence, bulk import)

### Acknowledgements
- `board:join` and `note:create` use Socket.io ack callbacks to return data to the caller
- `note:update` and `note:move` are fire-and-forget from the client's perspective; the server broadcasts to others

### SocketData
- Stores `username` after JWT verification in the auth middleware
