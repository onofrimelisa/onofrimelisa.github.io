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

## 7. Concurrency, Atomicity, and Consistency

### Fundamental Rule

> Operations on **a single document** are atomic in MongoDB. You don't need transactions to update a document.

MongoDB uses **WiredTiger** as its storage engine (default since 3.2). WiredTiger implements **document-level locking** — not collection-level, not database-level. This means two concurrent writes to _different documents_ in the same collection proceed in parallel with zero contention.

For a _single document_, WiredTiger serializes concurrent writes using **optimistic concurrency control internally**: it detects conflicts at commit time and retries automatically. From the application's perspective, `findOneAndUpdate` is always atomic.

### Race Condition Analysis for Our Solution

Let's trace exactly what happens when two users interact with the same note simultaneously.

#### Scenario 1: Two users move the same note at the same time

```
User A drags note to (100, 200)         User B drags note to (300, 400)
        |                                         |
        v                                         v
Server receives note:move {x:100,y:200}  Server receives note:move {x:300,y:400}
        |                                         |
        v                                         v
findOneAndUpdate({ id }, { $set: {x:100, y:200} })
                                         findOneAndUpdate({ id }, { $set: {x:300, y:400} })
```

**What MongoDB does internally:**
1. Both operations target the same document
2. WiredTiger acquires a write lock on the document for the first operation
3. The second operation waits (microseconds) for the lock to release
4. Both succeed — the second one overwrites the first's values
5. Final state: `{x:300, y:400}` (last-write-wins)

**What the users see:**
- User A sees `(100,200)` from their optimistic update, then receives User B's `note:moved` broadcast and snaps to `(300,400)`
- User B sees `(300,400)` immediately
- Both converge to the same state, but User A's move is silently lost

#### Scenario 2: One user moves, another edits text (same note)

```
User A: note:move {id, x:100, y:200}    User B: note:update {id, text:"new text"}
        |                                         |
        v                                         v
$set: { x:100, y:200, updatedAt }       $set: { text:"new text", updatedAt }
```

**No conflict.** MongoDB's `$set` operator only touches the specified fields. These two operations write to disjoint fields (`x,y` vs `text`), so both succeed without overwriting each other. This is a key advantage of **partial updates** — they shrink the conflict surface.

**Caveat:** `updatedAt` is written by both. The last one wins for that field, but `updatedAt` is informational, not a correctness concern.

#### Scenario 3: Two users edit the same note's text

```
User A: note:update {id, text:"foo"}     User B: note:update {id, text:"bar"}
        |                                         |
        v                                         v
$set: { text:"foo", updatedAt }          $set: { text:"bar", updatedAt }
```

**Last-write-wins.** If B's write commits after A's, the note says "bar" and A's edit is silently lost. Neither user is notified of the conflict.

### Why Our Current Approach Works (and Its Limits)

Our repository uses `findOneAndUpdate` with `$set` for all mutations:

```typescript
// note.repository.ts — position update
async updatePosition(id: string, x: number, y: number) {
  return this.collection.findOneAndUpdate(
    { id },
    { $set: { x, y, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
}
```

**What this gives us:**
- Atomicity: each individual write is atomic (no partial writes)
- Isolation: `$set` on disjoint fields don't interfere
- Durability: written to the journal before ack (default `w:1`)
- Last-write-wins: simple, no coordination overhead

**What this does NOT give us:**
- No conflict detection (we can't tell if we're overwriting another user's change)
- No merge (concurrent text edits don't combine)
- No ordering (no guarantee that server receives events in the order they were generated)

### Alternatives: How We Could Handle Concurrency Differently

#### Option 1: Optimistic Concurrency Control with Version Field

Add a `version` field to each note. Reject writes that target a stale version:

```typescript
// Add version to the model
interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  version: number;  // incremented on each write
  // ...
}

// Repository: conditional update
async updatePosition(id: string, x: number, y: number, expectedVersion: number) {
  const result = await this.collection.findOneAndUpdate(
    { id, version: expectedVersion },     // only if version matches
    { $set: { x, y, updatedAt: new Date() }, $inc: { version: 1 } },
    { returnDocument: 'after' },
  );
  if (!result) {
    throw new StaleVersionError(id, expectedVersion);
  }
  return result;
}
```

**How it works:** Client sends current version with each edit. If another write incremented the version, the filter `{ id, version: expectedVersion }` matches nothing — write rejected. The client must refetch and retry.

**Tradeoff:**
- Pro: Detects conflicts instead of silently overwriting
- Con: Adds round-trips (refetch + retry). For drag operations at 20 events/sec, version conflicts would fire constantly, making the UI stutter. The retry loop would be worse than LWW for the user.

**When to use it:** Text editing (low frequency, high value per edit). NOT for position updates during drag.

#### Option 2: CRDTs (Conflict-free Replicated Data Types)

Use a LWW-Register with Lamport timestamps instead of raw `$set`:

```typescript
interface PositionCRDT {
  x: number;
  y: number;
  timestamp: number;    // Lamport clock
  nodeId: string;       // tiebreaker for equal timestamps
}

// MongoDB write: only update if incoming timestamp is higher
async updatePosition(id: string, position: PositionCRDT) {
  return this.collection.findOneAndUpdate(
    { id, $or: [
      { 'position.timestamp': { $lt: position.timestamp } },
      { 'position.timestamp': position.timestamp,
        'position.nodeId': { $lt: position.nodeId } }
    ]},
    { $set: { position } },
    { returnDocument: 'after' },
  );
}
```

**Tradeoff:**
- Pro: Deterministic resolution — all nodes converge to the same state regardless of message ordering
- Pro: No coordination needed (true distributed merge)
- Con: More complex data model and write logic
- Con: Requires Lamport clocks or vector clocks in every client

**When to use it:** When you need consistency across multiple server instances without a single coordinator. Good for position data.

#### Option 3: Operational Transformation (OT)

For text editing, transform concurrent operations so both apply cleanly:

```
User A: insert "X" at pos 3    User B: insert "Y" at pos 1

Server receives A first:        "helloX" (at pos 3)
Then transforms B against A:    insert "Y" at pos 1 (unchanged, pos < 3)
Result:                         "hYelloX"

If server received B first:     "hYello" (at pos 1)
Then transforms A against B:    insert "X" at pos 4 (shifted right by 1)
Result:                         "hYelXlo"  — wait, different!
```

OT requires careful mathematical transformation rules and a central server to establish a canonical operation order.

**Tradeoff:**
- Pro: No data loss — concurrent edits merge intelligently
- Pro: Industry proven (Google Docs)
- Con: Complex to implement correctly (operation transformation is subtle)
- Con: Requires a central ordering server
- Con: Overkill for short sticky note text (280 chars max)

#### What We Chose and Why

| Strategy | Position (drag) | Text (edit) | Complexity | Our Choice |
|----------|----------------|-------------|------------|------------|
| **LWW (current)** | Good enough — drag is continuous, only final position matters | Acceptable — sticky notes are short, concurrent edits rare | Minimal | Yes |
| **Version field (OCC)** | Bad — constant version conflicts during drag | Good for forms, bad for real-time | Low | No |
| **CRDTs** | Best — deterministic merge without coordination | Overkill for short text | Medium | Production evolution |
| **OT** | N/A (designed for sequential data) | Best for long text | High | Not needed for sticky notes |

**Our reasoning:** For a collaborative board with short sticky notes, LWW with partial updates is the right tradeoff. The conflict surface is small (independent notes + disjoint field updates), and the worst case (two users edit the same note's text simultaneously) is rare and recoverable (the board state is always visible). Production evolution: CRDTs for positions, OT/Yjs for text if notes grow into rich-text documents.

### MongoDB Consistency in a Distributed Setup

#### Read Concern and Write Concern

MongoDB lets you tune consistency per operation:

```typescript
// Our current default: w:1 (acknowledged by primary)
await collection.findOneAndUpdate(filter, update);

// Stronger: majority write concern (acknowledged by majority of replica set)
await collection.findOneAndUpdate(filter, update, { writeConcern: { w: 'majority' } });

// Strongest read: read your own writes
await collection.find(filter).readConcern('majority');
```

| Write Concern | Meaning | Latency | Durability |
|--------------|---------|---------|------------|
| `w: 1` (our default) | Ack after primary writes to memory | ~1-5ms | Durable after journal flush (default 100ms) |
| `w: 'majority'` | Ack after majority of replica set confirms | ~5-20ms | Survives primary failure |
| `w: 0` (fire-and-forget) | No ack | ~0ms | No guarantee |

**We use `w:1` (default)** because we're running a single MongoDB node. In production with a replica set, `w: 'majority'` would be appropriate for critical writes (note creation) while `w:1` stays fine for position updates (high frequency, low value per individual write).

#### Single Node vs Replica Set

| Aspect | Single Node (current) | Replica Set (production) |
|--------|----------------------|-------------------------|
| Consistency | Strong (single source of truth) | Tunable (read concern) |
| Availability | SPOF — if Mongo dies, writes fail | Primary election, automatic failover |
| Read scaling | None | Read from secondaries |
| CAP position | CP (consistent but single point of failure) | CP with tunable read preferences |

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

We don't need this for the challenge (all operations are single-document), but it's relevant if the board evolves to support "delete board with all its notes" as an atomic operation.

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
