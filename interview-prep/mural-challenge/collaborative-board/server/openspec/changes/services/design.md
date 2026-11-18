## Design

### AuthService
- Stateless JWT signing/verification
- 24-hour token expiry
- Trims and validates username on login

### NoteService
- Validates text: non-empty, non-whitespace, max 500 chars
- `importNotes` is lenient: skips invalid entries rather than rejecting the entire batch
- Invalid colors default to 'yellow'
- Delegates all persistence to INoteRepository (dependency injection)

### Testing Strategy
- Unit tests use InMemoryNoteRepository to avoid external dependencies
- Tests cover happy paths, validation errors, and edge cases
