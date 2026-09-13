# Key Concepts

> Quick-reference cheat sheet. Read before interviews to refresh your vocabulary. You should be able to explain each concept clearly and give a real example.

---

## Monolithic vs Microservices Architecture

### Monolithic Architecture
A single deployable unit that contains all the application's functionality. All modules run in the same process and share the same database.

**Advantages:**
- **Simple to develop and deploy:** One codebase, one build, one deployment
- **Easy to test:** End-to-end tests run against a single application
- **Low latency:** In-process function calls, no network overhead between modules
- **Simple debugging:** One process, one log, one stack trace
- **No distributed system complexity:** No network failures between modules, no eventual consistency concerns

**Disadvantages:**
- **Scaling limitations:** Must scale the entire application even if only one module needs it. Can't scale modules independently.
- **Tight coupling:** Changes in one module can break others. Deployments require deploying everything.
- **Technology lock-in:** Entire application uses the same tech stack. Can't choose the best tool for each job.
- **Team scaling:** As the team grows, coordination overhead increases. Multiple teams stepping on each other's code.
- **Deployment risk:** A bug in one module can bring down the entire application. Every deployment is all-or-nothing.
- **Long build/deploy cycles:** As the codebase grows, build and deploy times increase.

### Microservices Architecture
The application is decomposed into small, independent services, each owning its own data and deployable independently. Services communicate via network (HTTP, gRPC, messaging).

**Advantages:**
- **Independent deployment:** Deploy, scale, and update each service independently
- **Technology diversity:** Each service can use the best language, framework, and database for its problem
- **Team autonomy:** Small teams own small services. Clear boundaries, less coordination overhead
- **Fault isolation:** A failure in one service doesn't necessarily bring down the entire system
- **Independent scaling:** Scale only the services that need it

**Disadvantages:**
- **Distributed system complexity:** Network failures, latency, eventual consistency, distributed transactions
- **Operational overhead:** More services to deploy, monitor, log, and debug. Need robust CI/CD, observability, and infrastructure
- **Data consistency:** No single database transaction across services. Need sagas, eventual consistency, compensation patterns
- **Testing complexity:** Integration and E2E tests are harder. Service contracts must be tested.
- **Debugging difficulty:** A request flows through multiple services. Need distributed tracing and correlation IDs.

### When to choose each

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Team size | Small (< 10 devs) | Large (multiple teams) |
| Domain complexity | Simple/medium | Complex with clear bounded contexts |
| Scale requirements | Uniform | Different modules need different scaling |
| Time to market | Need to ship fast, iterate later | Can invest in infrastructure upfront |
| Organizational maturity | Limited DevOps/infra capabilities | Strong DevOps, CI/CD, monitoring culture |

**Pragmatic approach:** Start with a well-structured monolith (modular monolith). Extract services only when you have a clear reason — scaling needs, team autonomy, different technology requirements. Premature decomposition is worse than a monolith.

---

## Microservices Communication

### Synchronous Communication (REST / gRPC)

**How it works:** The caller sends a request and waits for the response before continuing. Direct service-to-service call.

**When to use:**
- The caller **needs the result immediately** to continue its own operation (e.g., validate user authorization before processing)
- **Read operations** where the client needs data right now (e.g., get product details for display)
- Simple **request-response** flows with low latency requirements
- When **strong consistency** is required for the operation

**When NOT to use:**
- The downstream operation is slow or unreliable (will block the caller)
- The caller doesn't need to wait for completion (fire-and-forget)
- During spikes, synchronous calls can cascade failures (use circuit breakers as mitigation)

**Best practices:**
- Always set **timeouts** — never wait forever
- Use **circuit breakers** on every external synchronous call
- Use **retries with backoff** for transient failures
- Consider **bulkheads** to isolate thread pools per dependency

### Asynchronous Communication (Message Queues / Events)

**How it works:** The caller sends a message and continues immediately. The receiver processes the message when ready. Decoupled in time.

**When to use:**
- The caller **doesn't need to wait** for the result (e.g., send email after registration)
- The downstream service is **slow, unreliable, or has rate limits** (queue absorbs spikes)
- **Long-running operations** (e.g., product creation that involves multiple steps)
- When you need **burst absorption** (queue buffers traffic spikes)
- When you want **temporal decoupling** — if the receiver is down, messages persist and are processed when it recovers

**When NOT to use:**
- The caller needs an immediate, synchronous response
- Simple CRUD operations where the overhead of messaging infrastructure isn't justified
- When the added complexity of eventual consistency outweighs the benefits

**Patterns:**
- **Point-to-point (Queue):** One producer, one consumer. Each message is processed once. Use SQS. Good for task distribution.
- **Pub/Sub (Topic):** One producer, multiple subscribers. Each subscriber gets a copy of every message. Use SNS, Kafka topics. Good for event notification.
- **Request-Reply (async):** Producer sends a message with a reply-to queue. Consumer processes and responds to the reply queue. Use when you need async but also need the result eventually.

**My experience:** At NocNoc, sellers-core communicates with product-information via SQS because product creation is a long-running operation that involves external API calls with rate limits. The seller gets an immediate response (PENDING) and tracks the status asynchronously.

### Event-Driven Architecture

**Core idea:** Services communicate by producing and consuming events. An event represents something that happened ("ProductCreated", "OrderPlaced", "PaymentFailed"). Services react to events they care about.

**Components:**
- **Event Producers:** Services that emit events when something happens in their domain
- **Event Broker:** The infrastructure that routes events (Kafka, SNS+SQS, EventBridge, RabbitMQ)
- **Event Consumers:** Services that subscribe to and react to events

**Event types:**
- **Domain Events:** Represent business facts ("OrderPlaced", "UserRegistered"). Carry the minimum data needed for consumers to react.
- **Integration Events:** Events specifically designed for cross-service communication. May carry more data to avoid callbacks.
- **Event Notifications:** Thin events that just notify something happened. Consumers call back for full data if needed. Lower coupling but more network calls.
- **Event-Carried State Transfer:** Fat events that carry all the data consumers need. Higher coupling but consumers don't need to call back. Good for building read models.

**Choreography vs Orchestration:**
- **Choreography:** Each service listens for events and decides what to do. No central coordinator. Simpler but harder to understand the full flow as complexity grows. Risk of cyclic event chains.
- **Orchestration:** A central service (orchestrator) coordinates the flow by sending commands to services and listening for their responses. Easier to understand, monitor, and modify. Single point of failure (mitigated with replicas).

**Benefits:**
- **Loose coupling:** Producers don't know about consumers. New consumers can subscribe without changing the producer.
- **Scalability:** Consumers can scale independently based on event volume.
- **Extensibility:** Add new functionality by adding a new consumer — no changes to existing services.
- **Audit trail:** Events form a natural log of everything that happened.

**Challenges:**
- **Eventual consistency:** The system is not immediately consistent after an event. Consumers may lag.
- **Event ordering:** Guaranteeing event order across partitions is hard. Design for out-of-order processing.
- **Debugging:** Following an event chain across services requires distributed tracing and correlation IDs.
- **Schema evolution:** Changing event schemas without breaking consumers requires careful versioning.

**Message Guarantees:**
- **At-most-once:** Message may be lost but never duplicated. Lowest latency. Rare use in business systems.
- **At-least-once:** Message is never lost but may be duplicated. Most common. **Requires idempotent consumers.**
- **Exactly-once:** Message is delivered exactly once. Hard to achieve in distributed systems. Kafka supports it within its ecosystem with transactional producers and consumers.

**My experience:** At NocNoc, sellers-core uses event-driven patterns: product creation events flow through SQS to downstream services. At UenoBank, the policy orchestrator uses async messaging for the issuance flow — the user gets immediate feedback while the policy is processed in the background.

---

## Microservices Patterns (Extended)

### API Gateway
Single entry point for all client requests. Routes to appropriate microservices. Handles cross-cutting concerns: authentication, rate limiting, logging, request/response transformation. Tools: Kong, AWS API Gateway, Nginx.

**When to use:** When you have multiple client types (web, mobile, third-party) that need different API shapes, or when you want to centralize cross-cutting concerns instead of duplicating them in every service.

### Circuit Breaker
Prevents cascading failures when a downstream service is unavailable. Three states: Closed (normal), Open (failing, don't call), Half-Open (testing recovery). Libraries: Resilience4j, Hystrix.

**How it works in detail:**
- **Closed:** Requests pass through normally. A failure counter tracks errors. When failures exceed a threshold (e.g., 5 failures in 10 seconds), the circuit opens.
- **Open:** All requests immediately fail without calling the downstream service. After a timeout period, the circuit moves to Half-Open.
- **Half-Open:** A limited number of test requests are allowed through. If they succeed, the circuit closes. If they fail, it opens again.

**My experience:** Used at UenoBank for external insurance provider integrations. When a provider went down, the circuit breaker prevented cascading failures into the banking app.

### Saga Pattern
Manages distributed transactions across multiple services. Each step has a compensation action for rollback.

**Two types:**
- **Choreography:** Each service publishes events and listens for events from other services. No central coordinator. Simpler for few steps but harder to debug as complexity grows. Risk of cyclic dependencies.
- **Orchestration:** A central orchestrator service tells each participant what to do. Easier to understand, debug, and modify. Single point of failure (mitigated with replicas). Better for complex flows.

**Example:** Order creation saga — (1) Reserve inventory → (2) Charge payment → (3) Create shipment. If payment fails, compensation: release inventory. If shipment fails, compensation: refund payment + release inventory.

**When to use:** When you need ACID-like guarantees across services but can't use a single database transaction.

### Service Discovery
Services register themselves and discover other services dynamically. Essential when services scale horizontally and IPs change.

**Types:**
- **Client-side discovery:** The client queries a service registry and selects an instance (e.g., Netflix Eureka + Ribbon).
- **Server-side discovery:** The client makes a request to a load balancer/router, which queries the registry (e.g., AWS ALB, Kubernetes Services).

Tools: Consul, Eureka, Kubernetes DNS, etcd.

### Event Sourcing
Store state changes as a sequence of events rather than current state. The current state is derived by replaying all events.

**Benefits:** Complete audit trail, temporal queries ("what was the state at time X?"), ability to rebuild state from scratch, natural fit for event-driven architectures.

**Trade-offs:** Higher storage, increased read complexity (need snapshots for performance), eventual consistency between write and read models, harder to query directly.

**When to use:** Regulated domains requiring audit trails (fintech, healthcare), systems where understanding "how we got here" matters.

### CQRS (Command Query Responsibility Segregation)
Separate read and write models. Write model optimized for consistency, read model optimized for queries.

**How it works:** Commands (writes) go to one model/database. Queries (reads) go to another, optimized for the read patterns. The read model is kept in sync via events (eventual consistency).

**When to use:** When read and write patterns differ significantly — e.g., writes are complex domain operations but reads need denormalized views or full-text search.

### Outbox Pattern
Solve the dual-write problem: write to database AND publish event atomically. Write event to an "outbox" table in the same DB transaction, then a separate process (CDC or poller) publishes it to the message broker.

**Why it matters:** Without this, you risk publishing an event but failing the DB write (or vice versa), leading to inconsistency between services.

**Implementation options:**
- **Polling publisher:** A process periodically queries the outbox table for unpublished events
- **Change Data Capture (CDC):** Tools like Debezium tail the database transaction log and publish events automatically

### Sidecar Pattern
Deploy a helper process alongside your main service to provide supporting features: logging, monitoring, networking, configuration. The sidecar runs in the same host/pod as the main service.

**Example:** Envoy proxy as a sidecar for service mesh, or a logging agent that collects and ships logs.

**My experience:** At Mercado Libre, the authorization policy evaluation engine was deployed as a Docker sidecar container alongside applications, reducing network hops for latency-sensitive workloads.

### Bulkhead Pattern
Isolate critical resources so that a failure in one part doesn't take down the entire system. Named after ship bulkheads that contain flooding.

**Implementation:** Separate thread pools, connection pools, or even separate service instances for different workloads. If one pool is exhausted, others remain unaffected.

**Example:** Separate thread pools for "create product" and "get product status" endpoints, so a spike in creation requests doesn't block status queries.

### Backend for Frontend (BFF)
A dedicated backend service for each frontend type (web, mobile, third-party API). Each BFF aggregates and transforms data specifically for its client.

**Why:** Different clients need different data shapes, different amounts of data, and different performance characteristics. A single general-purpose API ends up serving no client well.

**My experience:** At NocNoc, the Seller Center API acts as a BFF for the Seller Center web app.

---

## Monolith to Microservices Migration

### Strangler Fig Pattern
Gradually migrate by building new functionality as microservices and routing traffic from the monolith to the new services. Over time, the monolith "shrinks" until it can be retired.

**Steps:**
1. Identify a bounded context or feature to extract
2. Build the new microservice
3. Route requests for that feature to the new service (via API gateway or proxy)
4. Keep the old code as fallback until the new service is validated
5. Remove the old code from the monolith

**My experience:** At NocNoc, during the migration to sellers-core, I deliberately built replacement services first before migrating flows, to avoid perpetuating dependencies on the PHP monolith.

### Branch by Abstraction
Introduce an abstraction layer in the monolith that wraps the functionality you want to extract. Initially, the abstraction calls the monolith code. Then, build the new service and switch the abstraction to call it. Both implementations coexist until migration is complete.

**When to use:** When you can't do a clean cut because the old and new systems need to coexist during migration.

### Parallel Run
Run both the old and new implementations simultaneously, comparing their outputs. Traffic goes to both, but only the old system's response is returned to the user. Differences are logged for analysis.

**When to use:** High-risk migrations where correctness is critical (e.g., financial calculations, authorization decisions).

### Database Decomposition Strategies
When extracting a service from a monolith, the database is often the hardest part:

- **Shared database (temporary):** Both monolith and new service read/write to the same DB. Quick to implement but creates tight coupling — use only as a transition step.
- **Database view:** Create a view in the monolith DB that the new service reads from. Write operations go to the new service's own DB.
- **Data synchronization:** Use CDC (Change Data Capture) or events to keep both databases in sync during migration.
- **Clean cut:** Migrate all data at once, switch traffic, and decommission the old tables. Only viable for low-risk, well-bounded data.

### Anti-Corruption Layer (ACL)
A translation layer between your new service and the legacy system. Prevents legacy concepts, models, and quirks from leaking into your clean domain model.

**When to use:** Always, when integrating with legacy systems. The ACL translates between the legacy model and your domain model, keeping your new code clean.

---

## Service Characteristics & Resilience

### Idempotency
An operation is idempotent if performing it multiple times produces the same result as performing it once. Critical in distributed systems where retries are common.

**Implementation strategies:**
- **Idempotency key:** Client sends a unique key with each request. Server checks if it already processed that key before executing. Store keys in DB or Redis with TTL.
- **Natural idempotency:** Design operations to be naturally idempotent — `SET status = 'active'` is idempotent, `INCREMENT counter` is not.
- **Database constraints:** Use unique constraints or upserts (INSERT ON CONFLICT) to prevent duplicate processing.

**My experience:** At NocNoc, each product creation attempt has a unique ID (correlation ID + seller ID + product identifier). Product-information checks existence before processing. If a message is processed twice due to a retry, the result is the same.

### Resilience Patterns Summary

| Pattern | What it does | When to use |
|---------|-------------|-------------|
| **Circuit Breaker** | Stops calling a failing service | External/unreliable dependencies |
| **Retry with Backoff** | Retries transient failures with increasing delays | Network glitches, temporary unavailability |
| **Timeout** | Fails fast if a call takes too long | Every external call — always set timeouts |
| **Bulkhead** | Isolates resources per workload | Prevent one failure from consuming all resources |
| **Fallback** | Provides a degraded response when the primary fails | Non-critical features that can gracefully degrade |
| **Rate Limiter** | Limits request rate to protect downstream | APIs with quotas, overloaded services |
| **Dead-letter queue** | Captures failed messages for later analysis | Any async processing pipeline |

### Graceful Degradation
When a non-critical dependency fails, the system should continue working with reduced functionality rather than failing entirely.

**Example:** If the recommendation service is down, show popular products instead of personalized recommendations. The user experience degrades but the app still works.

### Health Checks & Readiness Probes
- **Liveness probe:** "Is the service alive?" — restart it if not. Checks the process is running and not deadlocked.
- **Readiness probe:** "Can the service handle traffic?" — remove it from the load balancer if not. Checks dependencies (DB, cache) are available.

### Observability Pillars
- **Metrics:** Numerical measurements over time (latency, error rate, throughput). Tools: Prometheus, Timestream, CloudWatch.
- **Logs:** Structured, searchable records of events. Include correlation IDs. Tools: ELK stack, Graylog, CloudWatch Logs.
- **Traces:** End-to-end request path across services. Tools: Jaeger, Zipkin, AWS X-Ray.

---

## Consistency in Distributed Systems

### Consistency Models

- **Strong consistency:** After a write, all subsequent reads return the updated value. Simplest to reason about but impacts availability and latency. Example: banking transactions.
- **Eventual consistency:** After a write, reads may return stale data for a window of time, but will eventually return the updated value. Higher availability and performance. Example: social media feeds, DNS.
- **Causal consistency:** Operations that are causally related are seen in the same order by all nodes. Concurrent operations may be seen in different orders. Strikes a balance between strong and eventual.
- **Read-your-writes consistency:** A client always sees its own writes. Other clients may see stale data. Often sufficient for user-facing applications.

### CAP Theorem
In a distributed system, you can only guarantee two of three: **Consistency**, **Availability**, **Partition Tolerance**. Since network partitions always happen, the real choice is between CP (consistency, like banking) and AP (availability, like social media feeds).

**In practice:** Most systems aren't purely CP or AP — they make different trade-offs for different operations. A banking system might be CP for transfers but AP for displaying account balance history.

### Consistency Strategies

**Two-Phase Commit (2PC):**
A coordinator asks all participants to prepare, then asks them to commit. If any participant can't prepare, everyone rolls back. Guarantees atomicity across databases but blocks if the coordinator fails. Rarely used in microservices due to performance and availability impact.

**Saga Pattern:**
The microservices alternative to 2PC. See "Microservices Patterns" section. Provides eventual consistency with compensating transactions.

**Conflict Resolution:**
When concurrent writes happen in an eventually consistent system:
- **Last-writer-wins (LWW):** The write with the latest timestamp wins. Simple but can lose data.
- **Merge/CRDT:** Conflict-free Replicated Data Types — data structures that can be merged automatically without coordination. Used in collaborative editing.
- **Application-level resolution:** The application presents conflicts to the user or applies domain-specific rules.

### Distributed Locking

When multiple service instances need to coordinate access to a shared resource:

**Redis (Redlock algorithm):**
- Acquire a lock by setting a key with a TTL (expiration) using `SET key value NX PX ttl`
- NX ensures only one client gets the lock
- TTL prevents deadlocks if the lock holder crashes
- Redlock extends this to multiple Redis instances for fault tolerance
- Libraries: Redisson (`RLock`), node-redlock

**ZooKeeper:**
- Create an ephemeral sequential node under a lock path
- The client with the lowest sequence number holds the lock
- When the lock holder disconnects, the ephemeral node is deleted and the next client acquires the lock
- More reliable than Redis for strong consistency but higher operational complexity

**When to use:**
- **Redis:** When performance matters and you can tolerate rare edge cases (clock drift, network partitions). Good for rate limiting, leader election, deduplication.
- **ZooKeeper:** When correctness is critical and you need strong guarantees. Good for distributed coordination, configuration management.

**When NOT to use distributed locks:** If you can redesign to avoid coordination — e.g., partition data so each instance owns a subset (sharding), or use optimistic locking (version numbers) instead.

---

## Design Principles

### SOLID
- **S** — Single Responsibility: one class, one reason to change
- **O** — Open/Closed: extend behavior without modifying existing code
- **L** — Liskov Substitution: subtypes replaceable for their base types
- **I** — Interface Segregation: small, focused interfaces over fat ones
- **D** — Dependency Inversion: depend on abstractions, not concretions

### DRY / YAGNI / KISS
- **DRY:** Don't Repeat Yourself — extract common logic
- **YAGNI:** You Aren't Gonna Need It — don't build for hypothetical futures
- **KISS:** Keep It Simple — simplest solution that works

### Clean Architecture
Dependency rule: inner layers don't know about outer layers. Domain logic at the center, frameworks and infrastructure at the edges. Makes the codebase testable and framework-independent.

### Domain-Driven Design (DDD)
- **Bounded Contexts:** Clear boundaries between different parts of the domain
- **Entities:** Objects with identity
- **Value Objects:** Objects defined by their attributes, no identity
- **Aggregates:** Cluster of entities treated as a unit
- **Ubiquitous Language:** Shared vocabulary between devs and domain experts

---

## Design Patterns

### Creational
- **Factory Method:** Create objects without specifying the exact class. Use when the exact type depends on runtime conditions.
- **Abstract Factory:** Create families of related objects without specifying concrete classes. Use when you need to ensure compatibility between related objects.
- **Builder:** Construct complex objects step by step. Use when an object has many optional parameters or complex construction logic.
- **Singleton:** Ensure a class has only one instance (use sparingly — often a code smell, prefer dependency injection).

### Structural
- **Adapter:** Make incompatible interfaces work together. Wraps an existing class with a new interface.
  **My experience:** At NocNoc, each seller integration channel (API, Shopify, SFTP) is an adapter translating to sellers-core's canonical interface.
- **Decorator:** Add behavior to objects dynamically without modifying them. Wraps an object and adds functionality.
- **Facade:** Simplified interface to a complex subsystem. Hides complexity behind a simple API.
- **Proxy:** Controls access to an object — adds lazy loading, access control, logging, or caching.

### Behavioral
- **Strategy:** Define a family of algorithms, make them interchangeable. The client selects the algorithm at runtime.
  **My experience:** At UenoBank, each insurance provider is implemented behind a common interface using the strategy pattern.
- **Observer:** Notify multiple objects when state changes (pub/sub). Decouples the subject from its observers.
- **Command:** Encapsulate a request as an object (undo/redo, queuing). Decouples the sender from the receiver.
- **Template Method:** Define the skeleton of an algorithm in a base class, let subclasses override specific steps.
- **Chain of Responsibility:** Pass a request along a chain of handlers. Each handler decides whether to process it or pass it to the next.

---

## Databases — Relational vs Non-Relational

### Relational Databases (SQL)

**What they are:** Store data in tables with rows and columns. Relationships between tables via foreign keys. Schema is defined upfront and enforced.

**Strengths:**
- ACID transactions — strong consistency guarantees
- Complex queries with JOINs, aggregations, subqueries
- Well-understood, mature tooling and ecosystem
- Data integrity enforced by the schema (constraints, types, foreign keys)

**Weaknesses:**
- Rigid schema — migrations required for structural changes
- Vertical scaling primarily (horizontal scaling via read replicas or sharding is complex)
- Not ideal for hierarchical, graph, or unstructured data

**Examples:**
- **PostgreSQL:** Most versatile. JSONB support, full-text search, extensions. Default choice when unsure.
- **MySQL:** Widely used, simpler than PostgreSQL. Good for read-heavy workloads.
- **Amazon Aurora:** Cloud-native, MySQL/PostgreSQL compatible, auto-scaling storage.

**When to choose:** Transactional data, relationships between entities, complex queries, data integrity is critical. Financial systems, user accounts, inventory management.

### Non-Relational Databases (NoSQL)

**Types and when to use each:**

**Key-Value Stores:**
- Data model: Simple key → value pairs
- Strengths: Extremely fast lookups, easy to scale horizontally
- Examples: **Redis** (in-memory, caching, sessions, rate limiting), **DynamoDB** (managed, auto-scaling, single-digit ms latency)
- When to use: Caching, session storage, simple lookups by ID, counters

**Document Stores:**
- Data model: JSON/BSON documents with nested structures
- Strengths: Flexible schema, natural fit for hierarchical data, good for read-heavy workloads
- Examples: **MongoDB** (general purpose, rich query language), **DynamoDB** (also works as document store)
- When to use: Content management, product catalogs, user profiles, data with variable structure
- **My experience:** At NocNoc, DynamoDB stores variable product metadata (seller-catalog-raw-data) because each channel sends different data structures.

**Wide-Column Stores:**
- Data model: Tables with rows and dynamic columns, optimized for writes
- Examples: **Cassandra** (high write throughput, multi-datacenter), **HBase** (Hadoop ecosystem)
- When to use: Time-series data, IoT, logging, analytics at massive scale

**Graph Databases:**
- Data model: Nodes and edges with properties
- Examples: **Neo4j**, **Amazon Neptune**
- When to use: Social networks, recommendation engines, fraud detection, knowledge graphs

### How to choose

| Question | SQL | NoSQL |
|----------|-----|-------|
| Need ACID transactions? | Yes | Usually no (some offer limited transactions) |
| Schema changes frequently? | Hard | Easy |
| Complex queries with JOINs? | Yes | Usually no — denormalize instead |
| Horizontal scaling needed? | Complex (sharding) | Built-in |
| Data has fixed structure? | Yes → SQL | Variable → NoSQL |
| Read/write patterns? | Balanced | Optimize for one (read-heavy or write-heavy) |

**Polyglot persistence:** Use the right database for each use case within the same system. Don't force one database to do everything.

**My experience:** At NocNoc, sellers-core uses RDS for transactional state machine data (ACID), DynamoDB for variable product metadata (schema flexibility), and Redis for caching and rate limiting.

### ACID (recap)
- **Atomicity:** All or nothing — transaction fully completes or fully rolls back
- **Consistency:** DB moves from one valid state to another
- **Isolation:** Concurrent transactions don't interfere with each other
- **Durability:** Committed data survives crashes

### Indexing
B-tree indexes for range queries, hash indexes for exact lookups. Composite indexes: column order matters — leftmost prefix rule. Always check EXPLAIN plans. Trade-off: faster reads, slower writes.

### Database per Service
Each microservice owns its data. No shared databases. Communication via APIs or events. Enables independent deployment and scaling. Trade-off: harder to do cross-service queries (use CQRS or API composition).

---

## API Communication — gRPC vs REST vs GraphQL

### REST (Representational State Transfer)
- **Protocol:** HTTP/1.1 or HTTP/2
- **Data format:** JSON (typically)
- **Contract:** OpenAPI/Swagger specs (optional, often loose)
- **Strengths:** Simple, universally understood, great tooling, cacheable (HTTP caching), human-readable
- **Weaknesses:** Over-fetching (get more data than needed) and under-fetching (need multiple calls), no built-in schema enforcement
- **When to use:** Public APIs, CRUD operations, when simplicity and broad compatibility matter

### gRPC (Google Remote Procedure Call)
- **Protocol:** HTTP/2 (required)
- **Data format:** Protocol Buffers (binary, compact)
- **Contract:** `.proto` files — strict schema, code generation for multiple languages
- **Strengths:** High performance (binary serialization, HTTP/2 multiplexing), strongly typed contracts, bidirectional streaming, automatic client/server code generation
- **Weaknesses:** Not human-readable (binary), harder to debug, not browser-native (needs grpc-web proxy), less tooling for ad-hoc testing
- **When to use:** Service-to-service communication within a cluster, low-latency requirements, polyglot environments where code generation saves time

### GraphQL
- **Protocol:** HTTP (single endpoint, POST requests)
- **Data format:** JSON
- **Contract:** Schema Definition Language (SDL) — strongly typed
- **Strengths:** Client specifies exactly what data it needs (no over/under-fetching), single endpoint, great for complex nested data, self-documenting schema
- **Weaknesses:** Complex caching (can't use HTTP caching easily), N+1 query problem on the server, security concerns (complex queries can be expensive), learning curve
- **When to use:** Client-facing APIs with diverse frontend needs, mobile apps where bandwidth matters, aggregating data from multiple services

### Comparison Table

| Aspect | REST | gRPC | GraphQL |
|--------|------|------|---------|
| Performance | Good | Best (binary) | Good |
| Schema | Optional (OpenAPI) | Required (proto) | Required (SDL) |
| Streaming | Limited (SSE, WebSocket) | Native bidirectional | Subscriptions |
| Browser support | Native | Needs proxy | Native |
| Caching | HTTP caching built-in | Custom | Custom (complex) |
| Learning curve | Low | Medium | Medium-High |
| Best for | Public APIs, CRUD | Internal service-to-service | Client-facing, complex data |

---

## Load Balancing Strategies

### Round Robin
Distributes requests sequentially across all available instances. Instance 1 → 2 → 3 → 1 → 2 → 3...

**Pros:** Simple, works well when all instances have similar capacity and requests have similar cost.
**Cons:** Doesn't account for instance load — a slow instance gets the same traffic as a fast one.

### Weighted Round Robin
Like round robin but each instance has a weight proportional to its capacity. A more powerful instance gets more requests.

### Least Connections
Routes to the instance with the fewest active connections. Better than round robin when request processing times vary significantly.

**Pros:** Adapts to actual load. Slow instances naturally receive fewer requests.
**Cons:** Requires tracking connection counts across instances.

### Consistent Hashing
Maps both servers and requests to positions on a hash ring. A request is routed to the nearest server clockwise on the ring.

**Key benefit:** When a server is added or removed, only ~1/N of requests are remapped (where N is the number of servers). With simple hashing (`hash(key) % N`), adding a server remaps almost all requests.

**When to use:** Stateful workloads where you want the same client/key to hit the same server (session affinity, caching). Used in: distributed caches, database sharding, CDNs.

**Virtual nodes:** Each physical server gets multiple positions on the ring to ensure even distribution and handle heterogeneous server capacities.

### IP Hash
Hash the client's IP to determine the server. Same client always goes to the same server (session affinity without cookies).

### Health-Check Aware
Any strategy above combined with periodic health checks. Unhealthy instances are removed from the pool until they recover.

---

## Java Language Fundamentals

### Core Characteristics
- **Object-Oriented:** Everything is an object (except primitives). Supports encapsulation, inheritance, polymorphism, and abstraction.
- **Platform Independent ("Write Once, Run Anywhere"):** Java source code compiles to bytecode (`.class` files), which runs on any platform with a JVM. Not the source code that's portable — it's the compiled bytecode.
- **Compiled + Interpreted:** Source code is compiled to bytecode by `javac`, then the JVM interprets (and JIT-compiles) the bytecode at runtime. This two-step process is what enables platform independence.
- **Strongly Typed:** All variables must declare their type. Type checking happens at compile time. Prevents a whole class of runtime errors.
- **Robust:** Strong memory management (no pointers), compile-time type checking, exception handling, and garbage collection make it resistant to crashes.
- **Multi-threaded:** Built-in support for concurrent execution via the `Thread` class and `Runnable` interface.

### JDK, JRE, JVM

```
JDK (Java Development Kit)
├── JRE (Java Runtime Environment)
│   ├── JVM (Java Virtual Machine)
│   │   ├── Class Loader
│   │   ├── Bytecode Verifier
│   │   ├── Interpreter
│   │   └── JIT Compiler
│   └── Core Libraries (java.lang, java.util, java.io, etc.)
└── Development Tools (javac, javadoc, jar, jdb)
```

- **JVM:** The engine that runs Java bytecode. Handles memory management, garbage collection, and translates bytecode to native machine code. Each OS has its own JVM implementation — this is what makes Java platform-independent.
- **JRE:** JVM + core libraries. Everything needed to *run* a Java program.
- **JDK:** JRE + development tools (compiler, debugger, etc.). Everything needed to *develop* Java programs.

### Garbage Collection
The JVM automatically reclaims memory occupied by objects that are no longer referenced. The developer doesn't manage memory manually (no `malloc`/`free`).

**How it works (simplified):**
- **Heap memory** is divided into generations: Young Generation (new objects), Old Generation (long-lived objects), and Metaspace (class metadata).
- **Minor GC:** Cleans Young Generation. Fast and frequent. Most objects die young (generational hypothesis).
- **Major GC (Full GC):** Cleans Old Generation. Slower, causes "stop-the-world" pauses.
- **GC algorithms:** Serial (single-threaded), Parallel (multi-threaded), G1 (low-latency, default since Java 9), ZGC (ultra-low latency, sub-ms pauses).

**Interview tip:** You can't force GC — `System.gc()` is only a suggestion. Avoid creating unnecessary objects, prefer object pooling for expensive resources.

### Threading & Concurrency

**Creating threads:**
- Extend `Thread` class and override `run()`
- Implement `Runnable` interface (preferred — allows extending other classes)
- Implement `Callable<T>` (like Runnable but returns a value and can throw exceptions)

**Thread lifecycle:** New → Runnable → Running → Blocked/Waiting → Terminated

**Synchronization:**
- `synchronized` keyword: locks a method or block so only one thread can execute it at a time. Prevents race conditions but can cause deadlocks.
- `volatile` keyword: ensures a variable's value is always read from main memory, not from a thread's local cache. Guarantees visibility, not atomicity.
- `Lock` interface (ReentrantLock): more flexible than `synchronized` — supports try-lock, timed lock, and interruptible lock.

**High-level concurrency (java.util.concurrent):**
- **ExecutorService:** Thread pool management. Don't create raw threads — use `Executors.newFixedThreadPool(n)`.
- **Future / CompletableFuture:** Represent the result of an async computation. CompletableFuture supports chaining and composition.
- **CountDownLatch:** Block until N operations complete.
- **Semaphore:** Control access to a limited number of resources.
- **ConcurrentHashMap, CopyOnWriteArrayList:** Thread-safe collections.

**Deadlock:** Two threads each hold a lock the other needs. Prevention: always acquire locks in the same order, use timeouts, or use `tryLock()`.

### Exception Handling

**Hierarchy:**
```
Throwable
├── Error (system-level, don't catch: OutOfMemoryError, StackOverflowError)
└── Exception
    ├── Checked Exceptions (must handle: IOException, SQLException)
    └── RuntimeException / Unchecked (optional: NullPointerException, IllegalArgumentException)
```

- **Checked exceptions:** Compiler forces you to handle them (try-catch or throws). Represent recoverable conditions.
- **Unchecked exceptions (RuntimeException):** Not required to handle. Represent programming errors (bugs).
- **try-with-resources:** Automatically closes resources implementing `AutoCloseable`. Prevents resource leaks.

```java
try (Connection conn = getConnection()) {
    // use connection
} // automatically closed, even if an exception occurs
```

### Key Java 8+ Features
- **Lambdas & Functional Interfaces:** `(x) -> x * 2`, `Predicate<T>`, `Function<T,R>`, `Consumer<T>`, `Supplier<T>`
- **Streams API:** Declarative data processing pipelines — `filter`, `map`, `reduce`, `collect`. Lazy evaluation, can run in parallel.
- **Optional:** Wrapper to avoid null checks and NullPointerException. `Optional.of()`, `Optional.ofNullable()`, `orElse()`, `map()`.
- **Default methods in interfaces:** Add methods to interfaces without breaking implementations.
- **Records (Java 14+):** Immutable data carriers — auto-generates constructor, getters, equals, hashCode, toString.
- **Sealed classes (Java 17+):** Restrict which classes can extend a class — exhaustive pattern matching.

---

## Java & Spring Ecosystem

### Spring Boot
Auto-configuration, embedded server, opinionated defaults. Eliminates boilerplate XML config. Starters for common setups (web, data, security).

### Key Annotations
- `@SpringBootApplication` — combines `@Configuration`, `@EnableAutoConfiguration`, `@ComponentScan`
- `@RestController` — REST endpoints (combines `@Controller` + `@ResponseBody`)
- `@Service` — business logic layer
- `@Repository` — data access layer
- `@Autowired` — dependency injection (prefer constructor injection)

### Spring Data JPA / Hibernate
ORM mapping Java objects to database tables. JPA is the spec, Hibernate is the implementation. Key concepts: entities, repositories, lazy vs eager loading, N+1 query problem.

### Java Streams & Lambdas
- **Lambdas:** Concise way to implement functional interfaces. `(x) -> x * 2`
- **Streams:** Process collections functionally. Don't modify the original collection. Support `filter`, `map`, `reduce`, `collect`. Can run in parallel with `parallelStream()`.

### Collections
- **HashMap:** Key-value pairs, O(1) lookup. Allows null keys/values. Not thread-safe.
- **HashSet:** Unique elements, O(1) contains check. Backed by HashMap internally.
- **ConcurrentHashMap:** Thread-safe HashMap. Use in multi-threaded environments.
- **ArrayList vs LinkedList:** ArrayList for random access, LinkedList for frequent insertions/deletions.

---

## Cloud (AWS)

### Compute
- **EC2:** Virtual machines, full control, various instance types
- **Lambda:** Serverless functions, pay per invocation, auto-scales to zero
- **ECS/Fargate:** Container orchestration without managing servers

### Storage & Databases
- **S3:** Object storage, high durability (11 9's), lifecycle policies
- **RDS:** Managed relational databases (PostgreSQL, MySQL)
- **DynamoDB:** Managed NoSQL, single-digit ms latency, auto-scaling

### Messaging
- **SQS:** Message queue, at-least-once delivery, dead-letter queues
- **SNS:** Pub/sub notifications, fan-out to multiple subscribers
- **EventBridge:** Event bus for event-driven architectures

### Monitoring
- **CloudWatch:** Metrics, logs, alarms, dashboards

### Infrastructure as Code
- **Terraform:** Multi-cloud, declarative, state management
- **Pulumi:** IaC using real programming languages (TypeScript, Go, Python)

---

## Rate Limiting, Throttling & Backpressure

### Rate Limiting
Control how many requests are allowed in a time period. Protects services from overload and external APIs from exceeding their quotas.

**Main algorithms:**
- **Token Bucket:** A bucket fills with tokens at a fixed rate. Each request consumes a token. If no tokens, the request is rejected. Allows short bursts (the bucket can accumulate tokens).
- **Leaky Bucket:** Requests enter a buffer and exit at a fixed rate. Smooths out spikes — no bursts allowed. Like a funnel.
- **Sliding Window:** Counts requests in a sliding time window. More precise than fixed windows, avoids the boundary problem between windows.

### Distributed Rate Limiter
When you have multiple instances of a service, the rate limit must be shared. A local rate limiter (per instance) isn't enough: if you have 5 instances and the limit is 10 req/s, each would allow 10 → 50 total.

**Implementation with Redis (Redisson):** Use Redis as a centralized store for the counter/token bucket. Redisson provides `RRateLimiter` that implements a distributed token bucket with atomic operations in Redis.

**Trade-off:** Adds network latency (call to Redis per request). For hot paths, consider local rate limiting as a first line + distributed as a second.

**My experience:** Used at NocNoc to respect Amazon API's 10 req/s rate limit (AMZ wrapper with Redisson).

### Throttling vs Rate Limiting
- **Rate Limiting:** Rejects requests that exceed the limit (responds with 429 Too Many Requests).
- **Throttling:** Slows down requests instead of rejecting them — enqueues or delays them. More friendly to the caller.

### Pull-Based Rate Control with SQS
When a reactive rate limiter generates many 429s and retries (thundering herd), an alternative is to invert the model: instead of push + reject, use an SQS queue where the consumer controls how many messages it processes in parallel.

**Advantages over reactive rate limiting:**
- No 429s: the rate limit is respected by design (controlling consumer concurrency)
- Absorbs spikes: the queue acts as a natural buffer
- No thundering herd: no retries competing for the same resource

**My experience:** Evolution of the Amazon integration at NocNoc — migrated from distributed rate limiter (which still generated 429s during spikes) to a pull-based model with SQS and controlled concurrency.

### Exponential Backoff with Jitter
A retry strategy where the time between retries grows exponentially: 1s, 2s, 4s, 8s, etc. **Jitter is key:** adds a random component to the delay to prevent multiple clients from retrying at the same time (thundering herd).

```
delay = min(base * 2^attempt + random(0, base), max_delay)
```

Without jitter, if 100 clients fail at the same time, all 100 retry at 2s, then at 4s — the problem repeats. With jitter, they distribute naturally.

### Thundering Herd Problem
Occurs when many clients/processes try to access the same resource simultaneously, typically after a failure or when a rate limiter rejects requests in bulk and everyone retries together.

**Solutions:**
- Exponential backoff with jitter (distribute retries over time)
- Pull-based consumption (invert the model, the consumer controls the pace)
- Request coalescing (group duplicate requests to the same resource)

---

## Messaging & Events

### Apache Kafka
Distributed streaming platform. High throughput, fault tolerance, horizontal scaling. Topics, partitions, consumer groups. Use for: real-time analytics, event sourcing, system integration, log aggregation.

### Key Concepts
- **At-least-once vs exactly-once delivery:** Most systems guarantee at-least-once. Design for idempotency.
- **Dead-letter queue (DLQ):** Where messages go when they can't be processed after N retries
- **Backpressure:** When a consumer can't keep up with the producer. Handle with buffering, scaling consumers, or dropping messages. Related: see "Rate Limiting, Throttling & Backpressure" section for pull-based rate control patterns.

---

## Testing

### Testing Pyramid
- **Unit tests:** Fast, isolated, test a single function/class. Mock dependencies.
- **Integration tests:** Test interaction between components (DB, APIs, message queues).
- **E2E tests:** Test the full flow from user perspective. Slow, brittle, use sparingly.

### TDD (Test-Driven Development)
Red → Green → Refactor. Write the failing test first, then the minimal code to pass it, then clean up. Not always practical but valuable for complex logic.

### Testing in Microservices
- Contract testing (Pact) to verify service interfaces
- Consumer-driven contracts: consumer defines what it expects from provider
- Testcontainers for integration tests with real databases/queues

---

## Agile

### Scrum
Sprints (1-4 weeks), roles (PO, SM, Dev Team), ceremonies (planning, daily standup, review, retro). Focus on delivering increments.

### Kanban
Continuous flow, WIP limits, visual board. No fixed sprints. Focus on throughput and cycle time.

---

## Concepts to Study Further

<!-- Add concepts here when you encounter gaps in interviews -->

- [ ] OAuth2 / OpenID Connect flow
- [ ] Kubernetes basics (pods, services, deployments, ingress)
- [ ] Database sharding and partitioning strategies
