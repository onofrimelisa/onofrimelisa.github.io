# Design: React Hooks

## useSocket(token)
- Creates typed socket.io connection when token is present
- Tracks connected state
- Cleans up on unmount or token change
- Returns `{ socket, connected }`

## useBoard(socket)
- Emits `board:join` on socket connect, receives initial notes
- Listens for all server events (note:created, note:updated, note:moved, user-joined, user-left, notes-imported)
- Provides `createNote`, `updateNote`, `moveNote` callbacks with optimistic updates
- Throttles move emissions at 50ms to avoid flooding
- Returns `{ notes, users, joined, createNote, updateNote, moveNote }`
