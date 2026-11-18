## Design

### Domain Model: StickyNote
The central entity is a `StickyNote` with position (x, y), text content, color, board association, and audit timestamps. Each note belongs to exactly one board and has a single author.

### Type Safety
- `NoteColor` is a union type restricted to 5 valid colors
- Input types are separated by operation (create, update, move, import) to enforce minimal required fields per action
- Constants (`MAX_NOTE_TEXT_LENGTH`, `DEFAULT_BOARD_ID`) centralize validation rules

### Decisions
- IDs are application-generated UUIDs (not MongoDB ObjectIds) for portability
- `ImportNoteInput` has optional fields to allow lenient bulk imports
