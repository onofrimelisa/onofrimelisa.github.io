## Design

### Interface
`INoteRepository` exposes 5 methods: findByBoardId, create, updateText, updatePosition, createMany. All return promises for async compatibility.

### MongoDB Implementation
- Uses application-generated UUIDs as `id` field (also set as `_id`)
- Creates an index on `boardId` for query performance
- `findOneAndUpdate` with `returnDocument: 'after'` for atomic update-and-return

### In-Memory Implementation
- Backed by a `Map<string, StickyNote>` for O(1) lookups
- Includes a `clear()` helper for test teardown
