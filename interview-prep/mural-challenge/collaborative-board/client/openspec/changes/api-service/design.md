# Design: API Service

## Architecture

Single file `src/services/api.ts` with two exported async functions:
- `login(username)` — POST JSON, returns `{ token, username }`
- `importNotes(file, token)` — POST FormData with Bearer auth, returns `{ imported }`

Uses `VITE_API_URL` env var with fallback to `http://localhost:3000`.

## Error Handling

Both functions throw `Error` with server message on non-OK responses.
