# MongoDB — Guide for Senior Devs

> A guide for senior developers who know relational databases but haven't worked with MongoDB in depth. Covers the mental model, when to use it, data modeling patterns, and how it applies to our challenge.

---

## 1. What Is MongoDB

MongoDB is a **document-oriented** database — instead of tables with rows and columns, it stores **JSON documents** (internally BSON, a binary representation of JSON) grouped into **collections**.

```
Relational                    MongoDB
──────────                    ───────
Database        →             Database
Table           →             Collection
Row             →             Document
Column          →             Field
JOIN            →             Embedding / $lookup
Schema (DDL)    →             Flexible schema (optional with validation)
```

### The Document as the Unit

A MongoDB document is a JSON object with typed fields:

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "text": "Login flow is confusing",
  "x": 412,
  "y": 891,
  "author": "user_7",
  "color": "yellow",
  "boardId": "board_abc",
  "createdAt": ISODate("2026-11-17T10:30:00Z")
}
```

- **`_id`** is mandatory and unique. If you don't provide it, MongoDB generates an `ObjectId` (12 bytes: timestamp + random + counter). It's the equivalent of an auto-increment primary key, but distributed — no coordination between nodes is needed to generate unique IDs.
- Fields can be strings, numbers, booleans, arrays, nested objects, dates, binaries, etc.
- Each document in the same collection **can have different fields** — there's no fixed schema at the DB level (although you can enforce one, see section 5).

---

## 2. When to Use MongoDB (and When Not To)

### Good Fit

| Use Case | Why |
|----------|-----|
| **Data with variable structure** | Documents in the same collection can have different fields without migrations |
| **Read-heavy with denormalized data** | Embedding related data in a document avoids JOINs — a single read fetches everything |
| **Rapidly evolving schema** | Adding fields doesn't require ALTER TABLE or migrations — the new field simply appears in new documents |
| **Semi-structured / JSON-native data** | If your domain already thinks in JSON (APIs, configurations, events), the mapping is direct |
| **Horizontal scaling** | Native sharding distributes data across nodes. Designed for horizontal scaling from the ground up |
| **Rapid prototyping** | No schema DDL, no migrations — fast iteration |

### Poor Fit

| Use Case | Why |
|----------|-----|
| **Many complex relationships** | If you need constant JOINs across 5+ tables, a relational model is more natural |
| **Frequent multi-document transactions** | MongoDB supports multi-document ACID transactions (since v4.0), but it's not its primary use case — adds latency and complexity |
| **Reporting / analytics with complex aggregations** | Works (the aggregation pipeline is powerful), but SQL is more ergonomic for complex ad-hoc queries |
| **Highly normalized data** | If your model requires strict normalization to avoid inconsistencies, relational is better |

### The Quick Criterion

> If your unit of work is "fetch a complete document and use it," MongoDB. If your unit of work is "join data from many tables to build a response," relational.

For our challenge: sticky notes are independent documents, grouped by board. No JOINs. It's a natural fit.

---

## 3. Data Modeling: Embed vs Reference

This is the most important design decision in MongoDB. In relational databases, you normalize and join. In MongoDB, you choose between **embedding** (denormalizing) or **referencing** (like FK).

### Embedding (Denormalization)

Putting related data inside the same document:

```json
{
  "_id": "board_abc",
  "name": "Sprint Retro",
  "notes": [
    { "id": "note_1", "text": "Login flow confusing", "x": 412, "y": 891 },
    { "id": "note_2", "text": "Great teamwork", "x": 200, "y": 300 }
  ]
}
```

**Advantages:**
- A single read fetches the board with all its notes (data locality)
- Atomic updates — updating the board and its notes is a single-document atomic operation
- No JOINs needed

**Disadvantages:**
- Large document if there are many notes (16MB limit per document)
- Updating an individual note requires array operators (`$set` with positional operator)
- Concurrency: two users updating different notes on the same board compete for the same document

### Referencing (Normalization)

Separate documents with ID references:

```json
// Collection: boards
{ "_id": "board_abc", "name": "Sprint Retro" }

// Collection: notes
{ "_id": "note_1", "text": "Login flow confusing", "x": 412, "y": 891, "boardId": "board_abc" }
{ "_id": "note_2", "text": "Great teamwork", "x": 200, "y": 300, "boardId": "board_abc" }
```

**Advantages:**
- Each note is an independent document — granular updates without conflict
- No practical limit on notes per board
- Concurrency: two users editing different notes don't compete

**Disadvantages:**
- Fetching the complete board requires two queries (or a `$lookup`)
- No foreign key constraints — referential integrity is the application's responsibility

### Decision for the Challenge: Referencing

For a collaborative board, **referencing** is the right choice:
- Multiple users edit different notes concurrently — we need independent updates
- Notes are created, edited, and deleted individually
- The access pattern is "fetch all notes for a board" → a query with an index on `boardId`

---

## 4. CRUD Operations in MongoDB

### With the Native Driver (`mongodb`)

```typescript
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
const db = client.db('collaborative-board');
const notes = db.collection<StickyNote>('notes');

// Create
const result = await notes.insertOne({
  text: 'New idea',
  x: 100,
  y: 200,
  author: 'user_1',
  color: 'yellow',
  boardId: 'board_abc',
  createdAt: new Date()
});
// result.insertedId → generated ObjectId

// Read — all notes for a board
const boardNotes = await notes.find({ boardId: 'board_abc' }).toArray();

// Update — move a note
await notes.updateOne(
  { _id: new ObjectId('...') },
  { $set: { x: 500, y: 600, updatedAt: new Date() } }
);

// Delete
await notes.deleteOne({ _id: new ObjectId('...') });
```

### With Mongoose (ODM)

Mongoose adds a layer of **schema definition**, **validation**, **middleware**, and **type safety** on top of the native driver:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

interface IStickyNote extends Document {
  text: string;
  x: number;
  y: number;
  author: string;
  color: string;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

const stickyNoteSchema = new Schema<IStickyNote>({
  text: { type: String, required: true, maxlength: 500 },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  author: { type: String, required: true },
  color: { type: String, enum: ['yellow', 'blue', 'green', 'pink', 'orange'], default: 'yellow' },
  boardId: { type: String, required: true, index: true },
}, {
  timestamps: true  // adds createdAt and updatedAt automatically
});

const StickyNote = mongoose.model<IStickyNote>('StickyNote', stickyNoteSchema);

// Create
const note = await StickyNote.create({ text: 'New idea', x: 100, y: 200, ... });

// Read
const boardNotes = await StickyNote.find({ boardId: 'board_abc' });

// Update
await StickyNote.findByIdAndUpdate(noteId, { $set: { x: 500, y: 600 } });

// Delete
await StickyNote.findByIdAndDelete(noteId);
```

### Native Driver vs Mongoose

| Aspect | Native driver (`mongodb`) | Mongoose |
|--------|--------------------------|----------|
| Schema enforcement | No (or manual with JSON Schema) | Yes, with rich validation |
| Type safety | Basic generics | Generics + schema inference |
| Middleware (hooks) | No | Pre/post save, validate, remove |
| Population (pseudo-JOINs) | Manual with `$lookup` | Declarative `.populate()` |
| Overhead | Minimal | Schema parsing + validation |
| Learning curve | Low (it's the driver) | Medium (its own API) |
| Flexibility | Full | Opinionated |

**For the challenge: native driver.** With TypeScript and well-defined interfaces, we get type safety without Mongoose overhead. For a 4-hour prototype, fewer dependencies = less complexity. Mongoose shines in larger projects where validation and hooks justify the abstraction.

---

## 5. Indexes

Indexes in MongoDB work conceptually the same as in relational databases — they are B-tree structures that speed up queries at the cost of space and write overhead.

### Key Index for the Challenge

```typescript
// All our queries filter by boardId
db.collection('notes').createIndex({ boardId: 1 });

// If we need to sort by creation
db.collection('notes').createIndex({ boardId: 1, createdAt: 1 });
```

Without the index on `boardId`, MongoDB does a **collection scan** — reads all documents to find the ones for a board. With the index, it goes directly.

### Relevant Index Types

| Type | Usage | Example |
|------|-------|---------|
| Single field | Filter by one field | `{ boardId: 1 }` |
| Compound | Filter + sort | `{ boardId: 1, createdAt: -1 }` |
| Unique | Guarantee uniqueness | `{ boardId: 1, slug: 1 }` with `unique: true` |
| TTL | Auto-delete after N seconds | `{ expireAt: 1 }` with `expireAfterSeconds: 0` |
| Text | Full-text search | `{ text: 'text' }` for searching within notes |

---

## 6. Aggregation Pipeline

The aggregation pipeline is MongoDB's equivalent to complex SQL queries. It's a sequence of **stages** that transform documents:

```typescript
// Example: count notes by color in a board
const stats = await notes.aggregate([
  { $match: { boardId: 'board_abc' } },              // WHERE
  { $group: { _id: '$color', count: { $sum: 1 } } }, // GROUP BY
  { $sort: { count: -1 } }                            // ORDER BY
]).toArray();

// Result: [{ _id: 'yellow', count: 15 }, { _id: 'blue', count: 8 }, ...]
```

We don't need this for the challenge, but it's useful to know for the systems design follow-up — for example, board usage analytics.

---

## 7. Concurrency and Atomicity

### Fundamental Rule

> Operations on **a single document** are atomic in MongoDB. You don't need transactions to update a document.

This means that `updateOne` on a note is atomic — there are no race conditions between two updates to the same field of the same document. The last write wins (last-write-wins).

### For Our Use Case

Two users editing **the same note** at the same time: last-write-wins. The last position/text that arrives at the server is what persists. For a prototype this is acceptable.

Two users editing **different notes**: no conflict — they are independent documents.

### Multi-Document Transactions

Since MongoDB 4.0, you can do ACID transactions spanning multiple documents:

```typescript
const session = client.startSession();
try {
  session.startTransaction();
  await notes.deleteMany({ boardId: 'board_abc' }, { session });
  await boards.deleteOne({ _id: 'board_abc' }, { session });
  await session.commitTransaction();
} catch (e) {
  await session.abortTransaction();
} finally {
  session.endSession();
}
```

We don't need this for the challenge, but it's good to know it exists for the follow-up.

---

## 8. MongoDB With Docker

Spinning up MongoDB for development is trivial with Docker:

```yaml
# docker-compose.yml (fragment)
services:
  mongo:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: collaborative-board

volumes:
  mongo-data:
```

No username/password needed for local development. Connect with:

```
mongodb://localhost:27017/collaborative-board
```

---

## 9. Useful Patterns for the Challenge

### Repository Pattern

Abstract data access behind an interface:

```typescript
interface NoteRepository {
  findByBoardId(boardId: string): Promise<StickyNote[]>;
  create(note: CreateNoteInput): Promise<StickyNote>;
  update(id: string, fields: Partial<StickyNote>): Promise<StickyNote | null>;
  delete(id: string): Promise<boolean>;
}
```

This allows:
- Testing with a mock/in-memory repository
- Swapping the implementation without touching business logic
- Clearly typing the data access interface

### Projection — Fetch Only What You Need

```typescript
// Only fetch id, x, y for a fast initial render
const positions = await notes
  .find({ boardId: 'board_abc' })
  .project({ _id: 1, x: 1, y: 1 })
  .toArray();
```

### Bulk Operations

```typescript
// Import notes from a JSON file
const bulkOps = notesFromFile.map(note => ({
  insertOne: { document: { ...note, boardId } }
}));
await notes.bulkWrite(bulkOps);
```

This is relevant for the "load a JSON file" requirement.

---

## 10. MongoDB vs Alternatives for the Challenge

| Aspect | MongoDB | PostgreSQL | SQLite | In-memory |
|--------|---------|-----------|--------|-----------|
| Schema match (JSON notes) | Native | Requires table + JSON column or normalization | Works | Native |
| Docker setup | 1 service | 1 service | None (file) | None |
| Alignment with Mural JD | Yes (mentioned in requirements) | No | No | No |
| Scaling story | Native sharding | Read replicas | Doesn't scale | Doesn't persist |
| Complexity for the challenge | Low | Low-medium | Very low | Minimal |
| Durability | Yes | Yes | Yes | No |

### Why MongoDB for This Challenge

1. **It's in the JD** — Mural asks for MongoDB experience. Using it demonstrates alignment with their stack
2. **The domain is document-oriented** — a sticky note IS a JSON document
3. **Referencing pattern** maps to their model: independent notes, queries by boardId
4. **Docker Compose** spins up the entire stack (server + mongo) in a single command
5. **Systems design follow-up** — you can talk about sharding by boardId, replica sets, read preference
