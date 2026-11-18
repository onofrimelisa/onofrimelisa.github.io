## Why
Before implementing any service or handler, the domain types must be defined. These types are the contract that every other layer depends on.

## What Changes
- Define StickyNote interface with all fields
- Define NoteColor type and constants
- Define input types: CreateNoteInput, UpdateNoteInput, MoveNoteInput, ImportNoteInput
- Define constants: DEFAULT_BOARD_ID, MAX_NOTE_TEXT_LENGTH

## Capabilities
### New Capabilities
- `domain/models`: Core domain types for the collaborative board
