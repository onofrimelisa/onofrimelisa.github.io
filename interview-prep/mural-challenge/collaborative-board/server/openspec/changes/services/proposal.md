## Why
Services encapsulate business logic (validation, authorization) independently of transport and persistence layers, making them testable in isolation.

## What Changes
- Create AuthService for JWT-based login and token verification
- Create NoteService with validation, CRUD delegation, and bulk import logic
- Add unit tests for NoteService using InMemoryNoteRepository

## Capabilities
### New Capabilities
- `service/auth`: JWT token creation and verification
- `service/note`: Note CRUD with text validation, position updates, and bulk import with filtering
