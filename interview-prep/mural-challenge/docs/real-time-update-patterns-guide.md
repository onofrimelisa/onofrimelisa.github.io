# Real-Time Update Patterns for Collaborative Tools — Interview Guide

> How tools like Miro, draw.io, Figma, and Google Docs handle the problem of syncing frequent user actions (like dragging objects) without flooding the network. Covers throttle vs debounce, optimistic updates, and how our implementation works.

---

## 1. The Problem

A user drags a sticky note across the board. The browser fires `mousemove` ~60 times per second (every ~16ms). If we send a socket event for every move, that's:

- **60 messages/second** per user dragging
- Multiply by N concurrent users
- Each message triggers: server processing → MongoDB write → Redis Pub/Sub broadcast → all other clients re-render

This saturates the network, the server, and the database — for coordinates that will be overwritten 16ms later.

**How real tools solve it:**
- **Miro**: Batches position updates at ~30-50ms intervals, sends only the latest position
- **Figma**: Uses a custom sync engine that batches all mutations into frames (~60fps local, ~10-30fps network)
- **draw.io**: Saves on explicit actions (drop, deselect) rather than during drag — no intermediate sync
- **Google Docs**: Uses Operational Transformation with batched operations, not per-keystroke sync

The core insight: **the user's screen must update on every frame, but the network only needs the final (or sampled) positions.**

---

## 2. Throttle vs Debounce

### Throttle

Executes at most once per interval. During continuous input, it fires at regular intervals.

```
Mouse events:  |--x-x-x-x-x-x-x-x-x-x-x-x--|
Throttle 50ms: |--x--------x--------x--------x|
                 ^emit     ^emit     ^emit    ^emit
```

**Behavior during a 500ms drag:**
- ~30 mouse events fired
- ~10 socket emits (one every 50ms)
- Other users see **smooth, incremental movement**

```typescript
// Classic throttle (leading + trailing edge)
function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return ((...args: any[]) => {
    const now = Date.now();
    const remaining = ms - (now - lastCall);

    if (remaining <= 0) {
      // Enough time passed — fire immediately
      if (timer) { clearTimeout(timer); timer = null; }
      lastCall = now;
      fn(...args);
    } else if (!timer) {
      // Schedule trailing edge
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  }) as T;
}
```

### Debounce

Waits until input stops for N ms, then fires once.

```
Mouse events:  |--x-x-x-x-x-x-x-x-x-x-x-x--|
Debounce 50ms: |------------------------------x|
                                               ^emit (after silence)
```

**Behavior during a 500ms drag:**
- ~30 mouse events fired
- **1 socket emit** (50ms after the last move)
- Other users see **nothing during drag, then a jump to final position**

```typescript
// Classic debounce (trailing edge only)
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return ((...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  }) as T;
}
```

### Comparison

| Aspect | Throttle | Debounce |
|--------|----------|----------|
| When it fires | At regular intervals during input | Once, after input stops |
| Messages during 1s drag | ~20 (at 50ms) | 1 (at the end) |
| Remote user experience | Smooth incremental movement | No movement, then a jump |
| Network usage | Moderate (bounded) | Minimal (single message) |
| Best for | Drag & drop, cursor tracking, scroll | Search input, resize end, save-on-idle |

### For collaborative drag & drop: throttle wins

Other users need to see the note **moving**, not just appearing at the final position. A throttle gives them 10-20 intermediate positions per second — enough for smooth perceived movement. A debounce gives them nothing until the drag ends.

---

## 3. What We Implemented (and the Nuance)

### Our current code (useBoard.ts)

```typescript
const moveNote = useCallback(
  (id: string, x: number, y: number) => {
    if (!socket) return;
    // 1. Optimistic update — instant local feedback
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n))
    );
    // 2. Debounce the socket emit (trailing edge, 50ms)
    const existing = moveTimers.current.get(id);
    if (existing) clearTimeout(existing);
    moveTimers.current.set(
      id,
      setTimeout(() => {
        socket.emit('note:move', { id, x, y });
        moveTimers.current.delete(id);
      }, 50),
    );
  },
  [socket],
);
```

### This is a debounce, not a throttle

The `clearTimeout` + `setTimeout` pattern resets the timer on every call. During a continuous drag (mouse events every ~16ms), the timer never fires because it keeps getting reset. Only when the user pauses or slows down for 50ms+ does it emit.

**During a smooth 1-second drag:** ~1-3 emits (only during micro-pauses in mouse movement)
**What other users see:** The note stays still, then jumps, stays still, then jumps — not smooth tracking.

### Why it still "works"

For a 4-hour prototype, the debounce is acceptable because:
1. Mouse movement isn't perfectly continuous — natural hand jitter creates micro-pauses that trigger the timer
2. The 50ms window is short enough that the "jumps" are small
3. The CSS transition (`left 0.15s ease, top 0.15s ease`) smooths the jumps on the receiving end

But in a production tool like Miro, this would need to be a proper throttle.

### What a throttle version would look like

```typescript
const moveNote = useCallback(
  (id: string, x: number, y: number) => {
    if (!socket) return;
    // 1. Optimistic update — always instant
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n))
    );
    // 2. Throttle: emit at most once per 50ms, plus trailing edge
    const now = Date.now();
    const lastEmit = lastEmitTimes.current.get(id) || 0;
    const remaining = 50 - (now - lastEmit);

    if (remaining <= 0) {
      // Fire immediately
      socket.emit('note:move', { id, x, y });
      lastEmitTimes.current.set(id, now);
      const timer = moveTimers.current.get(id);
      if (timer) { clearTimeout(timer); moveTimers.current.delete(id); }
    } else if (!moveTimers.current.has(id)) {
      // Schedule trailing edge (ensures final position is always sent)
      moveTimers.current.set(
        id,
        setTimeout(() => {
          socket.emit('note:move', { id, x, y });
          lastEmitTimes.current.set(id, Date.now());
          moveTimers.current.delete(id);
        }, remaining),
      );
    }
  },
  [socket],
);
```

**During a smooth 1-second drag:** ~20 emits (one every 50ms)
**What other users see:** Smooth, incremental movement with 150ms CSS transition filling the gaps.

---

## 4. The Three-Layer Pattern

Every production collaborative tool uses this same three-layer approach:

```
Layer 1: Local UI          → updates on EVERY frame (~60fps)
Layer 2: Network emit      → throttled to N ms (30-100ms depending on tool)
Layer 3: Server persistence → further batched or coalesced (save on idle, not on every move)
```

### Our implementation

| Layer | What we do | Frequency |
|-------|-----------|-----------|
| Local UI | `setNotes()` on every mousemove | ~60fps |
| Network emit | Debounced socket.emit at 50ms | ~1-3/sec during drag |
| Server persistence | MongoDB write on every `note:move` received | Same as network |

### What Miro/Figma would do

| Layer | What they do | Frequency |
|-------|-----------|-----------|
| Local UI | Canvas redraw on requestAnimationFrame | 60fps |
| Network emit | Throttled at 30-50ms | ~20-30/sec |
| Server persistence | Batched writes, save-on-idle or periodic flush | ~1-5/sec |

### The gap in our implementation

We don't have Layer 3 optimization. Every `note:move` the server receives triggers an immediate `updatePosition()` → MongoDB write. In production, you'd:
1. Buffer moves in memory (or Redis)
2. Flush to MongoDB every 500ms-1s, or on drag-end
3. This reduces DB writes from ~20/sec to ~1-2/sec per active note

Good interview talking point: "For the prototype I persist every move event, but in production I'd add a write coalescing layer — buffer positions in memory and flush to the database periodically or on drag-end."

---

## 5. CSS Transitions: Smoothing the Remote Experience

When User A drags a note, their screen updates at 60fps (local state). User B receives throttled/debounced positions. Without transitions, User B sees the note "teleport" between positions.

```typescript
// StickyNote.tsx
style={{
  left: note.x,
  top: note.y,
  transition: dragging ? 'none' : 'left 0.15s ease, top 0.15s ease',
}}
```

**Key decision: `dragging ? 'none' : transition`**

- When **you** drag: `transition: none` — the note follows your cursor exactly, no lag
- When **someone else** moves a note: `transition: 0.15s ease` — smooth interpolation between received positions

The 150ms duration is chosen to be:
- Long enough to smooth the gaps between throttled updates (~50ms)
- Short enough to not feel laggy or "floaty"

This is the same pattern Miro uses. Figma achieves it differently (canvas rendering with interpolation, not CSS transitions).

---

## 6. Event Separation: move vs update

We use separate events for position changes and text changes:

| Event | Payload | Frequency | Strategy |
|-------|---------|-----------|----------|
| `note:move` | `{ id, x, y }` | High (drag) | Throttled/debounced, no ack |
| `note:update` | `{ id, text }` | Low (edit save) | On blur/Enter, no ack |
| `note:create` | `{ text, x, y, color }` | Low (click) | Immediate, with ack |

**Why separate them:**
1. Move payloads are tiny (3 fields). Text payloads can be up to 500 chars. Mixing them wastes bandwidth on moves.
2. Move events are fire-and-forget (last-write-wins, no ack needed). Create events need the server-generated ID back.
3. Different throttling strategies: moves are throttled during drag; text updates fire once on save.

This is a standard pattern in collaborative tools. Figma calls them "property changes" and batches them by type.

---

## 7. Interview Talking Points

### "How do you handle real-time drag performance?"

> "Three layers: the local UI updates on every mouse event for instant feedback, the network emit is debounced at 50ms to avoid flooding the socket, and the server persists each received position. For production, I'd add write coalescing — buffer in Redis and flush to MongoDB periodically, reducing DB writes from 20/sec to 1-2/sec per active drag."

### "Why debounce instead of throttle?"

> "Honestly, for a 4-hour prototype, the debounce works well enough because natural mouse jitter creates enough micro-pauses to trigger emits, and CSS transitions smooth the gaps on the receiving end. But in production I'd use a proper throttle (leading + trailing edge) so other users see smooth incremental movement rather than position jumps."

### "How do other users see smooth movement?"

> "CSS transitions on `left` and `top` with 150ms ease timing. When I drag a note, transitions are disabled (follows cursor exactly). When another user moves a note, the transition interpolates between received positions. The 150ms duration fills the gaps between throttled network updates."

### "What about at scale — 50 users dragging simultaneously?"

> "Each drag generates ~20 throttled events/second. With 50 concurrent drags, that's ~1000 events/second through Redis Pub/Sub. Redis handles this easily. The bottleneck would be MongoDB writes — that's where write coalescing becomes essential. Buffer in-memory, deduplicate by note ID, flush the latest position every 500ms. You could also reduce broadcast scope: only emit move events to users whose viewport includes the moved note."

### "How does this compare to Miro/Figma?"

> "Same three-layer architecture: instant local, throttled network, batched persistence. Figma uses a custom sync engine with binary encoding for minimal payload size. Miro uses a similar WebSocket approach. The key difference in production is CRDT-based conflict resolution — where my prototype uses last-write-wins, production tools use CRDTs to merge concurrent position changes deterministically."
