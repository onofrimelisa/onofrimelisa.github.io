# Design: Client Models

## Architecture

Single file `src/models/note.model.ts` exports:
- `NoteColor` union type and `NOTE_COLORS` const array
- `StickyNote` interface matching server schema
- `ServerToClientEvents` and `ClientToServerEvents` interfaces for typed socket.io
- Constants: `DEFAULT_BOARD_ID`, `MAX_NOTE_TEXT_LENGTH`

## Constraints

- Uses union types (not enums) due to `erasableSyntaxOnly: true`
- All types exportable for use by hooks and components
