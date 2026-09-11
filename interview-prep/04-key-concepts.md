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

## Rate Limiting, Throttling & Backpressure

### Rate Limiting
Controlar cuántas requests se permiten en un período de tiempo. Protege servicios de sobrecarga y APIs externas de exceder sus cuotas.

**Algoritmos principales:**
- **Token Bucket:** Un bucket se llena con tokens a un rate fijo. Cada request consume un token. Si no hay tokens, se rechaza. Permite bursts cortos (el bucket puede acumular tokens).
- **Leaky Bucket:** Las requests entran a un buffer y salen a un rate fijo. Suaviza los picos — no permite bursts. Como un embudo.
- **Sliding Window:** Cuenta requests en una ventana de tiempo deslizante. Más preciso que ventanas fijas, evita el problema del boundary entre ventanas.

### Rate Limiter Distribuido
Cuando tenés múltiples instancias de un servicio, el rate limit debe ser compartido. Un rate limiter local (por instancia) no alcanza: si tenés 5 instancias y el límite es 10 req/s, cada una permitiría 10 → 50 totales.

**Implementación con Redis (Redisson):** Usar Redis como store centralizado del contador/token bucket. Redisson provee `RRateLimiter` que implementa token bucket distribuido con operaciones atómicas en Redis.

**Trade-off:** Agrega latencia de red (call a Redis por cada request). Para hot paths, considerar rate limiting local como primera línea + distribuido como segunda.

**My experience:** Usado en NocNoc para respetar el rate limit de 10 req/s de la API de Amazon (AMZ wrapper con Redisson).

### Throttling vs Rate Limiting
- **Rate Limiting:** Rechaza requests que exceden el límite (responde 429 Too Many Requests).
- **Throttling:** Ralentiza las requests en lugar de rechazarlas — las encola o las demora. Más amigable con el caller.

### Pull-Based Rate Control con SQS
Cuando un rate limiter reactivo genera muchos 429 y retries (thundering herd), una alternativa es invertir el modelo: en vez de push + reject, usar una cola SQS donde el consumer controla cuántos mensajes procesa en paralelo.

**Ventajas sobre rate limiter reactivo:**
- No hay 429: el rate limit se respeta por diseño (controlando concurrencia del consumer)
- Absorbe picos: la cola actúa como buffer natural
- Sin thundering herd: no hay retries compitiendo por el mismo recurso

**My experience:** Evolución de la integración con Amazon en NocNoc — migramos de rate limiter distribuido (que seguía generando 429 en picos) a un modelo pull-based con SQS y concurrencia controlada.

### Exponential Backoff con Jitter
Estrategia de retry donde el tiempo entre reintentos crece exponencialmente: 1s, 2s, 4s, 8s, etc. **El jitter es clave:** agrega un componente aleatorio al delay para evitar que múltiples clientes reintenten al mismo tiempo (thundering herd).

```
delay = min(base * 2^attempt + random(0, base), max_delay)
```

Sin jitter, si 100 clientes fallan al mismo tiempo, los 100 reintentan a los 2s, luego a los 4s — el problema se repite. Con jitter, se distribuyen naturalmente.

### Thundering Herd Problem
Ocurre cuando muchos clientes/procesos intentan acceder al mismo recurso simultáneamente, típicamente después de una caída o cuando un rate limiter rechaza requests en masa y todos reintentan juntos.

**Soluciones:**
- Exponential backoff con jitter (distribuir retries en el tiempo)
- Pull-based consumption (invertir el modelo, el consumer controla el ritmo)
- Request coalescing (agrupar requests duplicadas al mismo recurso)

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

- [ ] gRPC vs REST vs GraphQL — trade-offs
- [ ] OAuth2 / OpenID Connect flow
- [ ] Kubernetes basics (pods, services, deployments, ingress)
- [ ] Database sharding and partitioning strategies
- [ ] Distributed locking (Redis, ZooKeeper)
- [ ] Load balancing strategies (round-robin, least connections, consistent hashing)
