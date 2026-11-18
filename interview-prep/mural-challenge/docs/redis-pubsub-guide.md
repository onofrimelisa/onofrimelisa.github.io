# Redis & Pub/Sub for Real-Time WebSocket Scaling — Interview Guide

> Everything you need to know about Redis for this challenge: what it is, what Pub/Sub is, why Socket.io needs it, how the adapter works, and what to say in the interview.

---

## 1. What Is Redis

Redis is an **in-memory data store** — all data lives in RAM, not on disk. This makes it extremely fast: sub-millisecond reads and writes. It supports multiple data structures (strings, hashes, lists, sets, sorted sets, streams), but for this challenge we only use one feature: **Pub/Sub**.

### Mental Model

Think of Redis as a shared memory space that multiple processes (our server instances) can access over the network. Unlike a database that stores and retrieves data, Redis Pub/Sub is a **message bus** — messages flow through it but are not stored.

```
┌──────────┐      ┌───────┐      ┌──────────┐
│ Server 1  │─────►│ Redis  │◄─────│ Server 2  │
│ (pub+sub) │◄─────│ Pub/Sub│─────►│ (pub+sub) │
└──────────┘      └───────┘      └──────────┘
                      ▲
                      │
               ┌──────┴──────┐
               │   Server 3   │
               │  (pub+sub)   │
               └─────────────┘
```

### Redis vs Other Message Systems

| System | Model | Persistence | Use Case |
|--------|-------|-------------|----------|
| **Redis Pub/Sub** | Fire-and-forget | No | Real-time broadcast between processes |
| **Redis Streams** | Log with consumer groups | Yes | Durable event processing |
| **RabbitMQ** | Message queue with ack | Yes | Task queues, guaranteed delivery |
| **Kafka** | Distributed log | Yes | High-throughput event streaming |
| **In-memory** (no Redis) | Process-local | No | Single server only |

For Socket.io scaling, Redis Pub/Sub is the standard choice because we need **fast, ephemeral broadcast** — if a message is lost because a server is down, the client will get the current state when it reconnects via `board:join`.

---

## 2. The Problem Redis Solves

### Single Server: Everything Works

```
┌─────────────────────────────────┐
│          Server (1 instance)     │
│                                  │
│  Socket A ──┐                    │
│  Socket B ──┤  rooms map         │
│  Socket C ──┘  (in-memory)       │
│                                  │
│  socket.to("board").emit(...)    │
│  → delivers to A, B, C ✓         │
└─────────────────────────────────┘
```

Socket.io keeps a `rooms` map in process memory. When you call `socket.to("board").emit(...)`, it iterates over the sockets in that room and sends the message. All sockets are in the same process — it just works.

### Multiple Servers: The Problem

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Server 1    │    │   Server 2    │    │   Server 3    │
│               │    │               │    │               │
│  Socket A ─┐  │    │  Socket C ─┐  │    │  Socket E ─┐  │
│  Socket B ─┘  │    │  Socket D ─┘  │    │  Socket F ─┘  │
│               │    │               │    │               │
│  rooms: {A,B} │    │  rooms: {C,D} │    │  rooms: {E,F} │
└──────────────┘    └──────────────┘    └──────────────┘

Server 1: socket.to("board").emit("note:created", note)
→ delivers to A, B ✓
→ C, D, E, F never see it ✗
```

Each server has its own rooms map. Server 1 doesn't know about sockets on Server 2 or 3. A broadcast on Server 1 only reaches local sockets.

**Result:** User A creates a note → Users C, D, E, F never see it. The board is inconsistent.

### With Redis Adapter: Solved

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Server 1    │    │   Server 2    │    │   Server 3    │
│  [pub+sub]    │    │  [pub+sub]    │    │  [pub+sub]    │
│               │    │               │    │               │
│  Socket A ─┐  │    │  Socket C ─┐  │    │  Socket E ─┐  │
│  Socket B ─┘  │    │  Socket D ─┘  │    │  Socket F ─┘  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────┬───────┴───────────────────┘
                   │
            ┌──────▼──────┐
            │    Redis     │
            │   Pub/Sub    │
            └─────────────┘
```

1. Server 1 calls `socket.to("board").emit("note:created", note)`
2. Redis adapter intercepts the broadcast
3. Server 1 delivers to its local sockets (A, B) — fast, no Redis hop
4. Server 1 **publishes** the broadcast packet to Redis channel `socket.io#/`
5. Server 2 and 3 **receive** the packet via their Redis subscription
6. Each server checks its local rooms map, delivers to its local sockets
7. All users (A through F) see the new note

---

## 3. What Is Pub/Sub

Pub/Sub (Publish/Subscribe) is a messaging pattern where:

- **Publishers** send messages to a **channel** (a named topic)
- **Subscribers** listen on channels and receive messages
- Publishers and subscribers don't know about each other — Redis is the intermediary

### Redis Pub/Sub Specifically

```
SUBSCRIBE channel_name     ← client enters "subscribe mode"
PUBLISH channel_name msg   ← sends msg to all subscribers on that channel
```

**Key characteristics:**

| Characteristic | Implication |
|----------------|-------------|
| **Fire-and-forget** | If no one is subscribed when a message is published, it's lost forever |
| **No persistence** | Messages are not stored. No replay, no history |
| **No acknowledgement** | Publisher doesn't know if anyone received the message |
| **All subscribers get all messages** | No consumer groups (unlike Redis Streams or Kafka) |
| **Subscriber mode is exclusive** | A client in subscribe mode can't run other Redis commands |

### Why Two Redis Clients

```typescript
const pubClient = createClient({ url: 'redis://redis:6379' });
const subClient = pubClient.duplicate();
```

Redis has a protocol constraint: a client in "subscribe mode" can **only** receive messages — it can't publish or run other commands. So the adapter needs two connections:

- **pubClient** — publishes broadcast packets to the channel
- **subClient** — subscribes and receives packets from other instances

`pubClient.duplicate()` creates a second connection with the same config. Same Redis server, different roles.

### Channel Structure

The `@socket.io/redis-adapter` uses these channels:

```
socket.io#/            ← main broadcast channel (all rooms, all events)
socket.io#/#<nsp>#     ← namespace-specific (if using custom namespaces)
socket.io-request#/    ← cross-instance requests (fetchSockets, etc.)
socket.io-response#/   ← responses to cross-instance requests
```

For our app (single namespace `/`), all broadcasts go through `socket.io#/`.

---

## 4. The Adapter Pattern

### What `@socket.io/redis-adapter` Does

It's a **decorator** around Socket.io's default in-memory adapter. It intercepts broadcast calls and relays them through Redis.

```typescript
import { createAdapter } from '@socket.io/redis-adapter';

// This single line is all the application code change needed
io.adapter(createAdapter(pubClient, subClient));

// Everything else is unchanged:
socket.to("board").emit("note:created", note);  // now reaches all instances
socket.join("board");                            // local join, but broadcasts are cross-instance
io.in("board").fetchSockets();                   // queries across all instances via Redis
```

### What Happens Under the Hood

When you call `socket.to("board").emit("note:created", note)`:

```
1. Socket.io serializes the event: { room: "board", event: "note:created", data: [note] }
2. Redis adapter publishes to Redis channel "socket.io#/":
   PUBLISH "socket.io#/" <serialized packet>
3. All subscribed instances receive the packet
4. Each instance's adapter:
   a. Deserializes the packet
   b. Checks: do I have sockets in room "board"?
   c. If yes: delivers to those local sockets
   d. If no: ignores (this is wasted work — see tradeoffs)
```

### What Does NOT Go Through Redis

- **Direct socket messages** (`socket.emit(...)` to the sender) — local only
- **Acknowledgements** (`ack(...)`) — go back to the sender's socket directly
- **Room joins/leaves** — local rooms map only. Other instances don't know who's in what room.

This is why `board:join` works correctly: the join is local, but the subsequent broadcast is relayed by Redis.

---

## 5. Our Implementation

### redis.ts — Connection Setup

```typescript
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

export async function connectToRedis(url: string) {
  const pubClient = createClient({ url });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  console.log('Connected to Redis');
  return { pubClient, subClient, adapter: createAdapter(pubClient, subClient) };
}
```

### index.ts — Wiring

```typescript
const { adapter } = await connectToRedis(REDIS_URL);

const io = new Server(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket'],
  adapter: adapter,       // ← this is the only scaling-related line
});
```

### What This Enables

The same codebase runs identically in both Docker Compose configs:

| Config | Instances | Redis Role |
|--------|-----------|-----------|
| `docker-compose.yml` | 1 server | Wired but no cross-instance traffic (broadcasts are local) |
| `docker-compose.scaling.yml` | 3 servers + Nginx | Active: relaying broadcasts between instances |

Zero code changes between single and multi-instance. Only infrastructure changes.

---

## 6. Tradeoffs and Limitations

### What Redis Pub/Sub Gives Us

| Benefit | Detail |
|---------|--------|
| **Transparent scaling** | Application code doesn't change. `socket.to().emit()` works across instances. |
| **Low latency** | Redis is in-memory. Pub/Sub adds ~0.1-0.5ms per message relay. |
| **Simple setup** | 2 lines of code (create adapter, attach to io). |
| **No sticky sessions** | Combined with WebSocket-only transport, any instance can serve any client. |
| **Cross-instance queries** | `fetchSockets()`, `serverSideEmit()` work across instances via Redis. |

### What Redis Pub/Sub Costs

| Limitation | Detail | Mitigation |
|-----------|--------|------------|
| **Fire-and-forget** | If an instance is down during publish, it misses messages | Clients reconnect and get current state via `board:join` from MongoDB |
| **All instances receive all messages** | Server 3 receives broadcasts for rooms it has no sockets in — wasted CPU | Redis 7+ sharded Pub/Sub, or custom channel-per-room |
| **No message durability** | No replay, no history | MongoDB is the source of truth. Redis is just the relay. |
| **Single point of failure** | Redis down = no cross-instance broadcast | Redis Sentinel or Redis Cluster for HA |
| **Memory pressure** | High-throughput Pub/Sub can pressure Redis | Dedicated Redis instance for Socket.io, separate from app cache |
| **Extra infra** | One more service to operate | Acceptable — Redis is lightweight and battle-tested |

### When Redis Pub/Sub Is NOT Enough

| Scale | Solution |
|-------|----------|
| < 10K connections | Single server, no Redis needed |
| 10K - 100K connections | Redis Pub/Sub + N server instances (our approach) |
| 100K - 1M connections | Redis Streams (durable, consumer groups) or sharded Pub/Sub |
| > 1M connections | Custom solution: Kafka/NATS for event bus, geographic sharding |

---

## 7. Redis Pub/Sub vs Redis Streams

This comes up in systems design interviews. Know the difference.

| Aspect | Pub/Sub | Streams |
|--------|---------|---------|
| Persistence | No — fire-and-forget | Yes — messages stored in a log |
| Consumer groups | No — all subscribers get all messages | Yes — messages distributed across consumers |
| Replay | No — missed messages are gone | Yes — read from any point in the stream |
| Delivery guarantee | At-most-once | At-least-once (with acknowledgement) |
| Performance | Faster (no disk I/O) | Slightly slower (writes to append-only log) |
| Memory | Low (messages not stored) | Higher (messages retained until trimmed) |
| Use case | Real-time broadcast (Socket.io) | Event processing, task queues, audit logs |

**For Socket.io:** Pub/Sub is the default and correct choice. The `@socket.io/redis-streams-adapter` exists for cases where you need durability (e.g., guaranteed delivery of critical events like payment notifications). For collaborative board moves, fire-and-forget is fine — a missed position update is harmless because the next one will correct it.

---

## 8. The WebSocket-Only + Redis Combo

### Why They Go Together

Socket.io's default behavior:
1. Client connects via HTTP long-polling (Engine.io)
2. After a few exchanges, upgrades to WebSocket
3. If WebSocket fails, falls back to polling

**Problem:** The initial polling requests create an HTTP session ID. The WebSocket upgrade MUST reach the same server that created the session. This requires **sticky sessions** on the load balancer.

**Our solution:** Skip polling entirely.

```typescript
// Server
const io = new Server(httpServer, {
  transports: ['websocket'],  // no polling phase
});

// Client
const socket = io(API_URL, {
  transports: ['websocket'],  // connect directly via WebSocket
});
```

**Result:**
- First request is a WebSocket upgrade — no session to track
- Load balancer (Nginx) can round-robin freely — no sticky sessions needed
- Simpler Nginx config: just proxy WebSocket upgrade headers

```nginx
upstream socket_servers {
    # No ip_hash! No sticky sessions! Round-robin is fine.
    server server-1:3000;
    server server-2:3000;
    server server-3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://socket_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### The Tradeoff

| Aspect | With Polling Fallback | WebSocket-Only |
|--------|----------------------|----------------|
| Connection reliability | Works behind restrictive proxies | Fails if WebSocket is blocked |
| Load balancer complexity | Needs sticky sessions | Simple round-robin |
| Initial connection speed | Slower (poll → upgrade) | Faster (direct WebSocket) |
| Infrastructure complexity | Higher | Lower |

For this challenge: we control the infrastructure (Docker), so WebSocket-only is the right call.

---

## 9. How User Presence Works With Redis

### The Nuance

User presence (who's connected to the board) is tracked **in-memory per instance**:

```typescript
// board.handlers.ts
const boardUsers = new Map<string, Set<string>>();

socket.on('board:join', () => {
  addUser(username);
  socket.to(BOARD_ROOM).emit('board:user-joined', {
    username,
    users: getBoardUsers(),  // ← only THIS instance's users
  });
});
```

**Problem:** With 3 instances, each one only knows its own users. If Alice is on Server 1 and Bob is on Server 2, the user list each sees is incomplete.

### Production Fix

Use `fetchSockets()` which queries across all instances via Redis:

```typescript
socket.on('board:join', async () => {
  socket.join(BOARD_ROOM);

  // Cross-instance query via Redis adapter
  const allSockets = await io.in(BOARD_ROOM).fetchSockets();
  const allUsers = allSockets.map(s => s.data.username);

  socket.to(BOARD_ROOM).emit('board:user-joined', {
    username,
    users: [...new Set(allUsers)],  // deduplicated, all instances
  });
});
```

**Why we didn't do this:** For the prototype, single-instance presence is fine. It demonstrates the pattern. The `fetchSockets()` improvement is a one-line change, good talking point for the interview.

---

## 10. Interview Talking Points

### "Why Redis for a collaborative board?"

> "Socket.io keeps room memberships in process memory. With multiple server instances, a broadcast on one instance never reaches sockets on another. Redis Pub/Sub acts as a message bus — the `@socket.io/redis-adapter` intercepts every `socket.to().emit()` and relays it through Redis to all instances. It's transparent: zero application code changes. I can go from 1 to N instances by changing only the Docker Compose config."

### "Why Pub/Sub instead of Streams?"

> "Pub/Sub is fire-and-forget, which is exactly what we need. A missed position update during a drag is harmless — the next one overwrites it. Streams add durability and consumer groups, which is overhead we don't need. The database is the source of truth; Redis is just the real-time relay. I'd switch to Streams if I had critical events that must not be lost, like payment notifications."

### "What happens if Redis goes down?"

> "Same-instance broadcasts still work — Socket.io delivers locally. Cross-instance broadcasts stop. When Redis comes back, the adapter reconnects automatically. Meanwhile, any client that reconnects gets the current state from MongoDB via `board:join`. For production: Redis Sentinel for automatic failover, or Redis Cluster for high availability."

### "Why two Redis clients?"

> "Redis Pub/Sub protocol constraint: a client in subscribe mode can only receive, not publish. The adapter needs one client for publishing broadcast packets and another for subscribing to them. `pubClient.duplicate()` creates a second connection with the same config."

### "How does this interact with the load balancer?"

> "Because we use WebSocket-only transport, there's no HTTP polling phase — the client upgrades to WebSocket on the first request. This means no session affinity is needed. Nginx can round-robin freely across instances. If we used the default polling + upgrade flow, we'd need sticky sessions so the upgrade request reaches the same server that handled the initial poll."

### "What's the scaling ceiling for this approach?"

> "Redis Pub/Sub works well up to ~100K concurrent connections across ~10-20 server instances. The limitation is that all instances receive all messages — Server 3 receives broadcasts for rooms it has no sockets in. Beyond 100K, I'd look at Redis 7 sharded Pub/Sub (messages routed by channel to specific nodes), Redis Streams with consumer groups, or custom sharding by board ID so each Redis instance only handles a subset of boards."

### "If you had more time, what would you change about the Redis setup?"

> "Three things: (1) Redis Sentinel or Cluster for high availability — right now it's a single point of failure. (2) Cross-instance presence using `fetchSockets()` instead of per-instance user tracking. (3) Write coalescing — buffer drag positions in Redis and flush to MongoDB periodically, instead of writing every move event to the database immediately."
