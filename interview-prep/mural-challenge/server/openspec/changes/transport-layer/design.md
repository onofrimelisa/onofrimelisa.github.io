## Design

### Socket.io Handlers
- Each handler module receives io, socket, and noteService
- Board handlers manage room joins and in-memory user presence tracking
- Note handlers delegate to NoteService and broadcast changes via `socket.to(room).emit()`
- Errors are caught and logged; they do not crash the socket connection

### HTTP Routes
- Auth route is stateless: validates username, returns JWT
- Import route: verifies JWT from Authorization header, parses uploaded JSON file, delegates to NoteService.importNotes, then broadcasts via Socket.io

### Broadcasting Pattern
- `socket.to(room)` sends to all OTHER clients in the room (not the sender)
- `io.to(room)` sends to ALL clients in the room (used for import broadcast)
