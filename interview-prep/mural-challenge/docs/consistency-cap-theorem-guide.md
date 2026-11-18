# Consistency & CAP Theorem — Interview Guide

## CAP Theorem Refresher

The CAP theorem states that a distributed system can guarantee at most **two of three** properties simultaneously:

| Property | Definition | In Our Context |
|----------|-----------|----------------|
| **Consistency** | Every read receives the most recent write | All users see the same board state at any given time |
| **Availability** | Every request receives a response (no errors/timeouts) | The board always responds, even if a server instance is down |
| **Partition Tolerance** | The system continues to operate despite network partitions between nodes | If Redis Pub/Sub between server instances drops, the board keeps working |

**In practice, P is non-negotiable** in distributed systems (network partitions happen). So the real choice is between **CP** and **AP**.

---

## Where Does Our Solution Sit?

**Our collaborative board is an AP system** — we chose Availability + Partition tolerance over strict Consistency.

Why:
- Clients get immediate responses (optimistic updates, no blocking on server ack)
- If Redis Pub/Sub drops a message between instances, each instance keeps serving its clients
- If a server instance goes down, clients on other instances keep working
- The tradeoff: users on different instances might briefly see different board states

This is the **correct choice for a collaborative board**. Tools like Miro, Figma, and Google Docs all favor AP — a user dragging a note should never be blocked waiting for consensus across servers.

---

## Consistency Model We Implement

### Three Layers of Consistency

```
Client A (Instance 1)          Server 1              MongoDB           Server 2          Client B (Instance 2)
     |                            |                     |                  |                    |
     |-- moveNote(x,y) --------->|                     |                  |                    |
     |   [optimistic update]     |                     |                  |                    |
     |   UI updates instantly    |-- findOneAndUpdate ->|                  |                    |
     |                           |<-- ack -------------|                  |                    |
     |                           |-- Redis Pub/Sub ----|----------------->|                    |
     |                           |                     |                  |-- note:moved ------>|
     |                           |                     |                  |   [remote update]   |
```

| Layer | What Happens | Consistency | Latency |
|-------|-------------|-------------|---------|
| **1. Client (Optimistic)** | `setNotes()` immediately | None — client is ahead of server | 0ms |
| **2. Server (Persistence)** | `findOneAndUpdate` in MongoDB | Strong single-doc ACID | ~5-20ms |
| **3. Cross-instance (Pub/Sub)** | Redis adapter relays to other instances | Eventual — fire-and-forget | ~1-5ms |

**Total end-to-end latency for a remote user to see a change: ~10-50ms** (server write + Redis relay + network to client B).

### What "Last-Write-Wins" Means in Practice

Our conflict resolution strategy is **LWW (Last-Write-Wins)** with **partial updates**:

```typescript
// server/src/repositories/note.repository.ts
async updatePosition(id: string, x: number, y: number) {
  return this.collection.findOneAndUpdate(
    { id },
    { $set: { x, y, updatedAt: new Date() } },  // Only touches x, y
    { returnDocument: 'after' }
  );
}

async updateText(id: string, text: string) {
  return this.collection.findOneAndUpdate(
    { id },
    { $set: { text, updatedAt: new Date() } },   // Only touches text
    { returnDocument: 'after' }
  );
}
```

**Why partial updates matter for consistency:**

| Scenario | Conflict? | Result |
|----------|-----------|--------|
| User A moves note, User B edits its text (simultaneously) | No | Both writes succeed — `$set` on different fields |
| User A moves note to (100,200), User B moves same note to (300,400) | Yes — LWW | Whoever's write hits MongoDB last wins. The other user's position is silently lost |
| User A edits text to "foo", User B edits same text to "bar" | Yes — LWW | Last write wins. No merge, no warning |

**The partial update design shrinks the conflict surface significantly.** In practice, two users rarely edit the _same field_ of the _same note_ at the _same instant_.

---

## Consistency Gaps (and Why They're Acceptable)

### Gap 1: Optimistic Updates Can Diverge

```
Client                     Server
  |-- setNotes(x=100) -->|
  |   UI shows x=100     |-- findOneAndUpdate fails (validation, DB error)
  |                       |-- [no rollback to client]
  |   Client shows x=100 |   MongoDB has x=50 (old value)
```

**Risk:** If the server write fails, the client shows stale state until next `board:join` refresh.

**Why it's acceptable:** Server writes almost never fail in this scenario (simple `$set` on existing doc). And if they do, the user refreshing the page recovers to ground truth.

**Production evolution:** Add error acknowledgements — if write fails, emit `note:move:error` back to the client, which rolls back the optimistic update.

### Gap 2: Redis Pub/Sub Is Fire-and-Forget

Redis Pub/Sub has **no message persistence**. If a subscriber is temporarily disconnected:

```
Server 1 publishes "note:moved {id, x:100, y:200}"
  |
  Redis channel -----> Server 2 (down for 500ms, misses the message)
  |
  Server 2 reconnects. The message is gone.
  Clients on Server 2 never see the move.
```

**Recovery mechanism:** When a client reconnects (Socket.io auto-reconnect), it fires `board:join` again, which fetches the full board state from MongoDB. This is our **consistency recovery point**.

**Production evolution:** Use Redis Streams instead of Pub/Sub for at-least-once delivery. Or use a message sequence number so clients can detect gaps and request a resync.

### Gap 3: No Causal Ordering Across Events

Events are independent. There's no vector clock or logical timestamp:

```
User A: create note "Task 1" (t=0)
User B: edit note "Task 1" text (t=50ms)

If User B's event arrives at Server before User A's create:
  -> edit fails silently (note doesn't exist yet)
  -> User B sees their edit locally (optimistic) but it's lost
```

**Why it's acceptable:** This race condition requires sub-50ms timing between independent users creating and editing the same note. In practice, the create ack returns before anyone else can interact with the note (server-generated ID needed for edits).

### Gap 4: No Read-Your-Writes Guarantee Cross-Instance

If a user disconnects from Server 1 and reconnects to Server 2 (via load balancer), there's a brief window where:

```
Server 1: Accepts write, persists to MongoDB (5ms)
           Redis Pub/Sub publishes (1ms)
User reconnects to Server 2: board:join reads from MongoDB
  -> If the reconnect happens within those 5ms, the user might not see their last write
```

**Why it's acceptable:** WebSocket connections are persistent (not HTTP request-based), so load balancer reassignment only happens on full disconnect/reconnect. By the time the reconnection handshake completes (~100ms+), MongoDB has long committed the write.

---

## CAP Analysis by Component

| Component | CAP Choice | Justification |
|-----------|-----------|---------------|
| **MongoDB (single node)** | CP | Single node = no partition possible. Reads always consistent. But if Mongo is down, writes fail (sacrificing A) |
| **Redis Pub/Sub** | AP | Messages are delivered best-effort. If subscriber misses a message, it's lost (sacrificing C). Redis itself stays available |
| **Socket.io + Redis Adapter** | AP | Clients on healthy instances keep working even if one instance crashes or Redis hiccups. Consistency is eventual |
| **Overall System** | AP | Favors responsiveness and availability over strict consistency |

### Production: Moving Toward Stronger Consistency

| Current (Prototype) | Production Evolution | Consistency Gain |
|---------------------|---------------------|-----------------|
| Last-write-wins | CRDTs for position, OT for text | Automatic conflict resolution without data loss |
| Redis Pub/Sub (fire-and-forget) | Redis Streams (consumer groups) | At-least-once delivery, replay missed events |
| No versioning | Vector clocks or sequence numbers per note | Causal ordering, detect and resolve conflicts |
| Optimistic updates (no rollback) | Optimistic with server ack + rollback | Client-server convergence guaranteed |
| `board:join` as recovery | Periodic state checksums | Detect drift without full rejoin |
| Single MongoDB node | MongoDB replica set (read concern: majority) | Read-your-writes + fault tolerance |

---

## CRDTs vs OT: The Next Step for Consistency

If the interviewer asks "how would you make this strongly consistent?":

### Operational Transformation (OT) — Good for Text

Used by Google Docs. The idea: each edit is an "operation" with a position and content. When concurrent operations conflict, transform them mathematically so both converge to the same result.

```
User A: insert "X" at position 3  ->  Operation: insert(3, "X")
User B: insert "Y" at position 1  ->  Operation: insert(1, "Y")

Without OT: Applying A then B gives different result than B then A
With OT: Transform B against A -> insert(1, "Y") stays; transform A against B -> insert(4, "X")
         Both orders now converge
```

**Tradeoff:** Requires a central server to serialize operations. Complex to implement correctly. Good for text editing (linear sequences).

### CRDTs (Conflict-free Replicated Data Types) — Good for Position/State

Used by Figma. The idea: data structures that can be merged without conflicts by design.

For our note positions, a **LWW-Register CRDT** with Lamport timestamps:

```typescript
// Each note position becomes:
interface PositionCRDT {
  x: number;
  y: number;
  timestamp: number;    // Lamport clock
  nodeId: string;       // Server instance ID (tiebreaker)
}

// Merge rule: highest (timestamp, nodeId) wins
function merge(local: PositionCRDT, remote: PositionCRDT): PositionCRDT {
  if (remote.timestamp > local.timestamp) return remote;
  if (remote.timestamp === local.timestamp && remote.nodeId > local.nodeId) return remote;
  return local;
}
```

**Tradeoff:** No central coordinator needed (true peer-to-peer possible). But CRDTs for text (like Yjs or Automerge) are memory-intensive and complex. Good for spatial data like note positions.

### What Makes Sense for a Collaborative Board

| Data Type | Best Strategy | Why |
|-----------|--------------|-----|
| Note position (x, y) | LWW-Register CRDT | Simple merge rule, spatial data has clear "latest" semantics |
| Note text (short strings) | OT or Yjs (CRDT) | For short sticky note text, even simple LWW is acceptable. Full OT for longer text editing |
| Note creation/deletion | Causal delivery + tombstones | Need ordering to prevent edit-of-deleted-note ghosts |
| Board membership | OR-Set CRDT | Merge "who's online" across instances without conflicts |

---

## Talking Points for the Interview

### "Walk me through the consistency model"

> "We use eventual consistency with optimistic updates. The client updates immediately for a responsive UX, then emits to the server asynchronously. The server persists to MongoDB with atomic document-level writes and broadcasts to other instances via Redis Pub/Sub. The tradeoff is last-write-wins: if two users edit the same note simultaneously, we don't merge — the last write wins. We minimize this risk through partial updates — moving a note doesn't overwrite its text, and editing text doesn't affect position."

### "Why not strong consistency?"

> "Strong consistency would mean blocking the UI until the server confirms the write. For a collaborative board where users drag notes around at 60fps, that latency would destroy the experience. Miro and Figma face the same tradeoff and also choose availability over consistency. The user should never feel like the board is 'thinking' — it should feel like a physical whiteboard."

### "What happens if Redis drops a message?"

> "Redis Pub/Sub is fire-and-forget, so if a subscriber misses a message, those clients don't see the update. But our recovery mechanism is the `board:join` event — whenever a client reconnects, it fetches the full board state from MongoDB, which is our source of truth. For production, I'd move to Redis Streams with consumer groups for at-least-once delivery, plus a sequence number per note so clients can detect gaps and request targeted resyncs instead of full reloads."

### "How would you evolve toward stronger consistency?"

> "Three steps: (1) Add version numbers to notes and reject stale writes on the server — that's optimistic concurrency control. (2) Use CRDTs for position data — an LWW-Register with Lamport timestamps gives deterministic conflict resolution without coordination. (3) For text editing, integrate something like Yjs, which is a battle-tested CRDT library that handles collaborative text editing with automatic conflict resolution."

### "Where does CAP apply here?"

> "We're an AP system. We favor availability and partition tolerance over strict consistency. If Redis Pub/Sub between instances drops, each instance keeps serving its clients — they just won't see cross-instance updates until the next reconnection. MongoDB is our CP component — it's the source of truth, and if it's down, writes fail. The key insight is that different components in the system can make different CAP tradeoffs: AP for the real-time layer, CP for persistence."

---

## Connection to Other Guides

- **Redis Pub/Sub deep dive:** See `redis-pubsub-guide.md` for adapter internals, two-client requirement, and Pub/Sub vs Streams tradeoffs
- **Real-time update patterns:** See `real-time-update-patterns-guide.md` for the three-layer model, debounce vs throttle, and CSS transition smoothing
- **WebSocket scaling:** See `websockets-socketio-guide.md` for transport selection, sticky sessions, and horizontal scaling
