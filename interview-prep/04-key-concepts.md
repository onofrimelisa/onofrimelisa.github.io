# Key Concepts

> Quick-reference cheat sheet. Read before interviews to refresh your vocabulary. You should be able to explain each concept clearly and give a real example.

---

## Microservices Patterns

### API Gateway
Single entry point for all client requests. Routes to appropriate microservices. Handles cross-cutting concerns: authentication, rate limiting, logging. Tools: Kong, AWS API Gateway, Nginx.

### Circuit Breaker
Prevents cascading failures when a downstream service is unavailable. Three states: Closed (normal), Open (failing, don't call), Half-Open (testing recovery). Libraries: Resilience4j, Hystrix.
**My experience:** Used at UenoBank for external insurance provider integrations.

### Saga Pattern
Manages distributed transactions across multiple services. Each step has a compensation action for rollback. Two types: Choreography (events) and Orchestration (central coordinator).
**When to use:** When you need ACID-like guarantees across services but can't use a single database transaction.

### Service Discovery
Services register themselves and discover other services dynamically. Tools: Consul, Eureka, Kubernetes DNS. Essential when services scale horizontally and IPs change.

### Event Sourcing
Store state changes as a sequence of events rather than current state. Enables audit trail, temporal queries, and rebuilding state. Often paired with CQRS.

### CQRS (Command Query Responsibility Segregation)
Separate read and write models. Write model optimized for consistency, read model optimized for queries. Useful when read and write patterns differ significantly.

### Outbox Pattern
Solve the dual-write problem: write to database AND publish event atomically. Write event to an "outbox" table in the same DB transaction, then a separate process publishes it to the message broker.

### Strangler Fig Pattern
Gradually migrate from monolith to microservices by replacing functionality piece by piece. Route requests to old or new system based on feature, reducing migration risk.

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
- **Factory Method:** Create objects without specifying the exact class
- **Builder:** Construct complex objects step by step
- **Singleton:** Ensure a class has only one instance (use sparingly)

### Structural
- **Adapter:** Make incompatible interfaces work together
- **Decorator:** Add behavior to objects dynamically without modifying them
- **Facade:** Simplified interface to a complex subsystem

### Behavioral
- **Strategy:** Define a family of algorithms, make them interchangeable
- **Observer:** Notify multiple objects when state changes (pub/sub)
- **Command:** Encapsulate a request as an object (undo/redo, queuing)

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

## Databases

### ACID
- **Atomicity:** All or nothing — transaction fully completes or fully rolls back
- **Consistency:** DB moves from one valid state to another
- **Isolation:** Concurrent transactions don't interfere with each other
- **Durability:** Committed data survives crashes

### CAP Theorem
In a distributed system, you can only guarantee two of three: **Consistency**, **Availability**, **Partition Tolerance**. Since network partitions always happen, the real choice is between CP (consistency, like banking) and AP (availability, like social media feeds).

### Indexing
B-tree indexes for range queries, hash indexes for exact lookups. Composite indexes: column order matters — leftmost prefix rule. Always check EXPLAIN plans. Trade-off: faster reads, slower writes.

### Database per Service
Each microservice owns its data. No shared databases. Communication via APIs or events. Enables independent deployment and scaling. Trade-off: harder to do cross-service queries (use CQRS or API composition).

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

## Messaging & Events

### Apache Kafka
Distributed streaming platform. High throughput, fault tolerance, horizontal scaling. Topics, partitions, consumer groups. Use for: real-time analytics, event sourcing, system integration, log aggregation.

### Key Concepts
- **At-least-once vs exactly-once delivery:** Most systems guarantee at-least-once. Design for idempotency.
- **Dead-letter queue (DLQ):** Where messages go when they can't be processed after N retries
- **Backpressure:** When a consumer can't keep up with the producer. Handle with buffering, scaling consumers, or dropping messages.

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

- [ ] gRPC vs REST vs GraphQL — trade-offs
- [ ] OAuth2 / OpenID Connect flow
- [ ] Kubernetes basics (pods, services, deployments, ingress)
- [ ] Database sharding and partitioning strategies
- [ ] Distributed locking (Redis, ZooKeeper)
- [ ] Load balancing strategies (round-robin, least connections, consistent hashing)
