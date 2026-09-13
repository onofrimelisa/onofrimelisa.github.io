# Diagram Talking Points

> Guide for system design technical interviews. Each section accompanies a diagram from `07-experience-cases-diagrams.drawio` and details what to mention, which patterns to highlight, and how to answer follow-up questions.

---

## NocNoc — Product Creation Flow (sellers-core)

### Context for the interviewer

"Of all the flows that sellers-core handles (product creation, orders, inventory), I'll focus on product creation because it has the most architectural complexity: multiple input channels, asynchronous processing, integration with an external API with rate limits, and a state machine to track the lifecycle."

### End-to-end flow

```
Seller
  ├── Public API ──────────┐
  ├── Seller Center (web) ─┤
  ├── SFTP (file uploads) ─┤     ┌──────────┐    ┌─────────────┐    ┌────────────────┐    ┌─────────────┐    ┌─────┐
  └── Shopify ─────────────┼────→│sellers-core├───→│ SQS (product │───→│ product-       │───→│ SQS (amz-   │───→│ amz-│
                           │     │            │    │  creation)   │    │ information    │    │  lookup)    │    │wrap.│
                           │     └────┬───┬───┘    └──────┬───────┘    └───┬────────────┘    └─────────────┘    └──┬──┘
                           │          │   │               │                │                                      │
                           │        [RDS] [DynamoDB]    [DLQ]           [RDS]                               [Redis cache]
                           │    seller-catalog  raw-data             product DB                          [Rate limiter]
                           │          │                                                                       │
                           │     [Timestream]                                                              [Amazon]
                           │      metrics
```

### 1. Adapter Pattern (Ports & Adapters / Hexagonal Architecture)

**What to say:** "Each integration channel is an adapter that translates the channel-specific interface into sellers-core's canonical operations. Public API translates REST requests, Seller Center translates UI actions, SFTP parses CSV/Excel files, and Shopify translates webhooks. Sellers-core defines the ports (the domain interface) and the adapters implement the translation."

**Why it matters:**
- If tomorrow we add a new channel (e.g., WooCommerce integration), we implement a new adapter without touching sellers-core
- Business logic (validation, state machine, rules) lives in a single place
- Before sellers-core, each channel had its own validation and logic — duplicated and inconsistent

**Likely follow-up question:** "What are the differences between adapters?"
- Public API: the seller sends products one by one via REST, synchronous response with the attempt status
- Seller Center: the web app calls the seller center API, which acts as a BFF and translates to sellers-core
- SFTP: the seller uploads a file, a batch process parses it and generates N requests to sellers-core
- Shopify: the Shopify app listens for product webhooks and translates them to sellers-core

**Evolution: API Gateway in front of the adapters**

**What to say:** "One improvement I'd add if we were to evolve this is an API Gateway in front of all the adapters. Right now each adapter handles its own auth, rate limiting, and routing. An API Gateway centralizes those cross-cutting concerns."

**Benefits:**
- **Centralized authentication/authorization:** All adapters validate tokens against the same policy rather than each implementing their own auth logic
- **Edge rate limiting:** Throttle bad actors or runaway sellers before the request even hits the adapter — protects the whole system
- **Single entry point for observability:** Request volume, error rates, and latencies aggregated in one place rather than scattered across adapters
- **Routing and versioning:** A new adapter version can be deployed behind a feature flag at the gateway level without coordinating across services
- **Security:** TLS termination, IP allowlisting, and payload validation centralized

**Why I didn't do it initially:** Each adapter had very different semantics (REST vs webhook vs batch), so the effort of abstracting common behavior behind a gateway wasn't justified with the team size and timeline. With more adapters it becomes obvious payoff.

### 2. Saga Pattern — Distributed coordination in sellers-core

**What to say:** "When sellers-core processes a product creation, it can't do it in a single DB transaction — it needs to coordinate with N internal services: validate the seller's permissions, fetch category mappings, check pricing rules, update inventory references. Since these are distributed calls, we can't wrap them in a single ACID transaction. That's where the Saga pattern comes in."

**How it works in practice:**
- Sellers-core acts as the saga orchestrator
- Each step is a local transaction + a call to a downstream service
- If any step fails, sellers-core executes compensating transactions for the steps that already succeeded
- The state machine (PENDING → SUCCESS / FAILED / NEEDS_INFO / ERROR) represents the saga's progress

**Why it matters:**
- Without saga, a partial failure leaves the system in an inconsistent state — product data in one service, nothing in another
- Compensating transactions give us "eventual consistency with rollback" — not ACID, but correct
- The saga state is persisted in RDS, so if sellers-core crashes mid-flight, it can resume or compensate on restart

**Choreography vs Orchestration:**
- We chose **orchestration** (sellers-core is the explicit orchestrator) because the flow is complex enough that implicit choreography via events would be hard to trace and debug
- Orchestration gives us a single source of truth for the saga's current state

**Likely follow-up question:** "What happens if a compensating transaction also fails?"
→ "That's the hard case. We have a DLQ for the saga events and an alert. The product ends up in ERROR state, which triggers a manual review. In practice this is extremely rare — compensating transactions are usually simpler operations (e.g., delete what was created) and they're idempotent."

### 2b. Outbox Pattern — Atomicity between DB and SQS

**What to say:** "There's a subtle consistency problem when sellers-core finishes processing and needs to both update its DB and publish a message to SQS. If we do them sequentially — write DB, then publish SQS — we have a window where the DB write succeeds but the SQS publish fails. The product looks finished in our DB but nothing was sent downstream. The Outbox pattern solves this."

**How it works:**
1. Sellers-core writes to its RDS **and** writes an outbox event record — both in the **same DB transaction**
2. A separate outbox reader process polls the outbox table and publishes pending events to SQS
3. Once published, the outbox event is marked as delivered

**Why it matters:**
- The DB write and the "intent to publish" are now atomic — if the transaction commits, the outbox record exists; if it rolls back, nothing happened
- The outbox reader can retry publishing independently without any business logic involved
- Guarantees at-least-once delivery to SQS (combined with idempotent consumers downstream, this is effectively exactly-once)

**Likely follow-up question:** "Why not use a distributed transaction (2PC) between the DB and SQS?"
→ "SQS doesn't support 2PC. Even if it did, distributed transactions have serious performance and availability trade-offs — they require both participants to be available simultaneously. The Outbox pattern achieves the same atomicity guarantee with local transactions only."

### 3. Two-level asynchronous communication

**What to say:** "We have two SQS queues in the flow, and each one solves a different problem."

**First queue: sellers-core → product-information**
- **Problem:** Decouple the seller channel from processing. The seller needs an immediate response ("your product was received, it's in PENDING status"), they can't wait for Amazon to resolve.
- **Additional benefit:** If product-information goes down, messages persist in the queue. Sellers-core is unaffected.
- **Burst absorption:** A seller uploads 5000 products via SFTP — sellers-core enqueues them without overwhelming product-information.
- **DLQ:** Messages that fail after N retries go to the DLQ for later analysis. Nothing is lost.

**Second queue: product-information → amz-wrapper**
- **Problem:** Control the request rate to Amazon. Amazon has a rate limit of 10 req/s.
- **Pull-based design:** amz-wrapper consumes from the queue with controlled concurrency (max N consumers), ensuring the rate limit is never exceeded by design.
- **Evolution:** Originally product-information called amz-wrapper synchronously, with a distributed rate limiter (Redisson) in amz-wrapper. But during spikes we kept getting 429s due to thundering herd on retries. We migrated to a pull-based model where the queue absorbs spikes and the consumer controls concurrency.

**Likely follow-up question:** "Wouldn't a single queue be enough?"
- "No, because they address two different bottlenecks. The first queue absorbs seller variability (unpredictable load spikes). The second controls an external service constraint (Amazon rate limit). With a single queue, we'd have to choose between optimizing for seller throughput or for Amazon's rate limit — and those are two independent constraints."

### 4. Rate limiting and the evolution of the solution

**What to say (iterative improvement storytelling):**

"Our Amazon account has a rate limit of 10 req/s. The first solution was a distributed rate limiter with Redisson in amz-wrapper, which rejected excess requests with 429. Product-information retried with exponential backoff. But we identified a problem: during load spikes, multiple product-information instances retried simultaneously, causing thundering herd. The 429s multiplied and actual throughput dropped below the rate limit."

"The solution was to invert the model: instead of push with reactive rate limiting, we switched to pull with concurrency control. Product-information enqueues in SQS, and amz-wrapper consumes with a maximum number of consumers that respect the rate limit. The Redisson rate limiter is kept as a safety net, but in normal operation it never activates."

**Redisson + concurrent SQS consumption — how they work together:**
- amz-wrapper runs with exactly **N concurrent SQS consumers** (e.g., 10), one per allowed Amazon req/s
- Each consumer polls the queue, acquires a Redisson rate limiter token, then calls Amazon
- If somehow multiple consumers fire simultaneously and the token bucket is empty, Redisson blocks the call — it's the hard stop before Amazon is touched
- This is far more efficient than exponential backoff retries: we never make an Amazon call we know will get 429'd
- The SQS visibility timeout is tuned to exceed processing time, preventing redelivery while a message is in flight

**Likely follow-up question:** "How does product-information get responses if amz-wrapper is now async?"
→ amz-wrapper writes the result to the response SQS queue. Product-information consumes it and updates the product's state. Sellers-core is notified via the product creation response queue.

**Likely follow-up question:** "What if the rate limit changes? Amazon raises it to 20 req/s?"
→ "Update the consumer count and the Redisson token bucket size — it's pure configuration. No code change."

### 5. Circuit Breaker — Resilience when Amazon is down

**What to say:** "Rate limiting handles steady-state load, but what if Amazon is fully unavailable — not slow, completely down? Without a circuit breaker, amz-wrapper keeps pulling from SQS and immediately failing, burning CPU and resetting visibility timeouts in a tight loop. The circuit breaker stops that."

**States:**
- **CLOSED (normal):** Calls go through. Failures are counted.
- **OPEN (Amazon down):** After N consecutive failures, the circuit opens. amz-wrapper stops pulling from the queue (or pulls and rejects immediately without calling Amazon). Messages sit safely in SQS with no retries wasting resources.
- **HALF-OPEN (testing recovery):** After a cooldown, one probe request goes through. Success closes the circuit; failure reopens it.

**Why it pairs well with the queue:**
- The queue is the buffer — it holds messages while Amazon is down without losing them
- The circuit breaker is the protector — it prevents amz-wrapper from hammering a dead API and avoids exhausting message retries into the DLQ
- When Amazon recovers, the circuit closes and the backlog drains naturally while the rate limiter keeps us within quota

**Where it lives:** At the amz-wrapper → Amazon boundary, not earlier. Product-information doesn't need to know Amazon is down — it just enqueues and moves on. The circuit breaker is amz-wrapper's responsibility.

**Likely follow-up question:** "Wouldn't the DLQ handle the outage?"
→ "DLQ is the last resort when retries are exhausted. If Amazon is down for 30 minutes and messages keep retrying every 30s, they'd hit max retries in about 15 minutes and flood the DLQ — requiring manual reprocessing. With the circuit breaker, messages stay in the main queue and drain automatically when Amazon recovers. DLQ stays clean for genuine failures."

### 7. Product state machine

**What to say:** "Each product creation attempt has a lifecycle represented as a state machine in sellers-core's relational DB."

```
PENDING → SUCCESS
PENDING → NEEDS_INFO (missing required data)
PENDING → FAILED (creation failed in product-information)
PENDING → ERROR (technical error, can be retried)
```

**Why it matters:**
- Account Managers can see each product's status in their dashboards without escalating to IT
- The seller can see the status in Seller Center
- Alerts are configured on state transitions (e.g., if ERROR % spikes, technical alert fires)

### 8. Correlation ID — End-to-end traceability

**What to say:** "The correlation ID is born in the adapter, not in sellers-core, because the adapter is the system boundary."

**How it propagates:**
1. **Adapter** generates the correlation ID (UUID) when receiving the seller's request
2. Sent as an **HTTP header** to sellers-core
3. Sellers-core stores it in the DB alongside the creation attempt
4. Propagated as an **SQS message attribute** to product-information
5. Product-information propagates it to amz-wrapper (via the second SQS)
6. All logs across all services include the correlation ID

**Why it starts at the adapter:**
- Seller Center can display the correlation ID to the seller in the UI
- If a seller reports a problem, the Account Manager searches by correlation ID and gets the complete trace
- The Public API returns it in the response header so integrators can correlate with their own systems

**Likely follow-up question:** "What if the seller uploads a file via SFTP with 5000 products?"
- "The SFTP adapter generates a correlation ID per file (batch) and a sub-correlation ID per line/product. This way you can trace both the complete batch and each individual product."

### 9. Observability (Timestream + Dashboards)

**What to say:** "Sellers-core sends metrics to Timestream: attempt count by channel, success/error rate, processing latency. With that we built differentiated dashboards:"

- **Business dashboard (Account Managers):** % of successfully created products per seller, products in NEEDS_INFO, top sellers with errors
- **Technical dashboard (IT):** p95 latency of the end-to-end flow, SQS queue depth, Amazon 429 rate, DLQ size

**Why it matters for the interview:** "We went from being purely reactive — finding out about problems when the seller complained — to being proactive. Alerts notify us before the seller even notices."

### 10. Storage decisions

**What to say:**
- **RDS (seller-catalog):** Structured data for the creation attempt — seller ID, status, timestamps, correlation ID. We need ACID for state transitions.
- **DynamoDB (seller-catalog-raw-data):** Variable product metadata (each channel sends different data, flexible schema). Schema-on-read, we can't enforce a relational schema because the structure depends on the channel and category.
- **Redis:** Amazon product cache (avoids repeated calls) + distributed rate limiter (safety net).

**Likely follow-up question:** "Why not everything in DynamoDB or everything in RDS?"
- "Creation attempts are transactional (state machine with ACID) — RDS. Product metadata is variable and schema-less — DynamoDB. Each store for what it does best."

---

### 11. Dedicated queues per communication direction

**What to say:** "The queues between product-information and amz-wrapper are separate for request and response. We don't reuse the same queue."

**Why separate queues:**
- **Different semantics:** The outbound message is "resolve this product in Amazon" (contains the universal product identifier). The inbound message is "here's the result" (contains the product info or the error). Different contracts.
- **Different consumers with different needs:** The outbound queue is consumed by amz-wrapper with controlled concurrency (respecting Amazon's rate limit). The inbound queue is consumed by product-information with no rate restriction — we want to process responses as fast as possible to update the product's status.
- **Independent monitoring:** If the outbound queue grows, the problem is that Amazon is slow or down. If the inbound queue grows, the problem is that product-information is overloaded. These are distinct operational signals that we need to alert on separately.
- **No routing logic:** If we used the same queue, we'd need logic to distinguish "is this message a request or a response?" — unnecessary complexity.

**Likely follow-up question:** "Why not use a synchronous request-reply pattern with correlation?"
→ "Because processing in Amazon can take seconds, and with controlled concurrency messages may stay queued. A synchronous request-reply would block product-information threads waiting for a response, reducing its capacity to keep processing messages from sellers-core. With separate queues, product-information enqueues and moves on — the result arrives when it's ready."

---

### Pattern summary

| Pattern | Where | Why |
|---------|-------|-----|
| Ports & Adapters | Channels → sellers-core | Decouple channels from business logic |
| API Gateway | In front of adapters | Centralize auth, rate limiting, observability |
| Saga (orchestration) | sellers-core | Coordinate N services with compensating transactions |
| Outbox | sellers-core → SQS | Atomic DB write + message publish, no 2PC needed |
| Async messaging (SQS) | sellers-core → product-info | Decouple seller from processing |
| Pull-based rate control | product-info → amz-wrapper | Respect rate limit by design |
| DLQ | Both queues | Don't lose failed messages |
| Exponential backoff | amz-wrapper → Amazon | Retry on transient Amazon errors |
| Circuit breaker | amz-wrapper → Amazon | Fail fast on outage, protect queue backlog |
| Distributed rate limiter | amz-wrapper (Redisson) | Hard stop — safety net when concurrency leaks |
| Cache-aside | amz-wrapper (Redis/Valkey) | Avoid repeated calls to Amazon |
| Correlation ID | From the adapter | End-to-end traceability |
| State machine | sellers-core (RDS) | Creation attempt + saga lifecycle |
| Polyglot persistence | RDS + DynamoDB + Redis | Each store for its use case |
| Dedicated queues per direction | product-info ↔ amz-wrapper | Independent monitoring, no routing logic |

### Hard questions and how to answer them

**"What happens if Amazon is down for hours?"**
→ "Messages accumulate in the amz-lookup queue. We have alarms on queue depth. Sellers see their products in PENDING status. When Amazon comes back, the queue drains naturally while respecting the rate limit. If the outage is prolonged, the DLQ captures messages that exceed max retries and we reprocess them manually."

**"How do you guarantee idempotency?"**
→ "Each creation attempt has a unique ID (correlation ID + seller ID + product identifier). Product-information checks if it already exists before processing. Amz-wrapper uses the Redis cache as a lookup before going to Amazon. If a message is processed twice due to a retry, the result is the same."

**"How does this scale?"**
→ "Horizontally at each layer. Adapters and sellers-core are stateless behind load balancers. SQS queues scale automatically. Product-information and amz-wrapper scale in instances but with controlled concurrency on the Amazon queue consumer."

**"What would you change if you started from scratch?"**
→ "Two things: first, an API Gateway in front of the adapters from day one — centralized auth, rate limiting, and observability without duplicating that logic per adapter. Second, I'd evaluate event sourcing in sellers-core instead of a traditional state machine: the saga steps are already events, so capturing them as an immutable event log would give us better auditability and make replaying/debugging sagas much easier."
