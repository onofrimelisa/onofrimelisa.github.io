# Technical Questions

> Common technical questions from real interviews. Each includes the question, a structured answer, and key concepts to mention. Based on past interview experiences and challenges.

---

## System Design & Architecture

### How would you design a microservices architecture for X?

**Framework for answering:**
1. **Clarify requirements** — Ask about scale, users, read/write ratio, latency requirements
2. **Identify services** — Break the domain into bounded contexts
3. **Define communication** — Sync (REST/gRPC) vs async (message queues/events)
4. **Data strategy** — Database per service, eventual consistency, CQRS if needed
5. **Resilience** — Circuit breakers, retries, timeouts, dead-letter queues
6. **Observability** — Logging, metrics, tracing, alerting
7. **Deployment** — CI/CD, containerization, infrastructure as code

**Real example (NocNoc seller platform):**
- Seller-facing services: Public API, Shopify integration, SFTP, Seller Center
- Central processing: sellers-core routes and validates all seller operations
- Data sync: Amazon Scraper with distributed rate limiting
- Observability: Unified metrics and alerting across the entire integration platform

### How do you handle communication between microservices?

**Synchronous (REST/gRPC):**
- Use when the caller needs an immediate response
- Keep it for queries and validations
- Always set timeouts, use circuit breakers

**Asynchronous (Message Queues / Events):**
- Use when the caller doesn't need to wait for the result
- Better for resilience — if a downstream service is down, messages queue up
- Patterns: publish/subscribe, event-driven, Saga for distributed transactions

**Real example (UenoBank):**
- Policy issuance: sync call to verify user eligibility, async call to notify the external insurance provider
- Circuit breaker on external provider calls — if they're down, we gracefully degrade instead of cascading failures
- Retry with exponential backoff for transient failures

### How do you ensure data consistency in distributed systems?

- **ACID transactions** within a single service/database
- **Saga pattern** for distributed transactions — each step has a compensation action
- **Eventual consistency** — accept that data may be temporarily inconsistent, but will converge
- **Idempotency** — design operations so repeating them has the same effect (critical for retries)
- **Outbox pattern** — write to DB and publish event atomically

### How do you handle API rate limiting?

**Real example (NocNoc Amazon Scraper):**
- Amazon API has strict throttling policies
- Implemented distributed rate limiting — token bucket algorithm shared across instances
- Backoff strategy when throttled — exponential with jitter
- Monitoring: alert when approaching rate limits, dashboard showing API usage vs. quota

---

## Code & Design

### Explain SOLID principles with examples

- **S — Single Responsibility:** A class should have one reason to change. E.g., separate the order validation logic from the order persistence logic.
- **O — Open/Closed:** Open for extension, closed for modification. E.g., use strategy pattern for different payment methods instead of a giant if/else.
- **L — Liskov Substitution:** Subtypes must be substitutable for their base types. E.g., if you have a `Bird` class with `fly()`, a `Penguin` subclass that throws on `fly()` violates LSP.
- **I — Interface Segregation:** No client should depend on methods it doesn't use. E.g., split a fat `UserService` interface into `UserReader` and `UserWriter`.
- **D — Dependency Inversion:** High-level modules shouldn't depend on low-level modules. Both should depend on abstractions. E.g., inject a `PaymentGateway` interface instead of a `StripeClient` concrete class.

### What design patterns do you use most?

- **Strategy:** Different behaviors behind a common interface (e.g., different integration providers at Emi Labs)
- **Factory:** Creating objects without specifying the exact class (e.g., creating different message handlers based on event type)
- **Circuit Breaker:** Prevent cascading failures when calling external services (used extensively at UenoBank)
- **Observer/Pub-Sub:** Decoupled event-driven communication between services
- **Builder:** Complex object construction (e.g., building API responses with optional fields)
- **Decorator:** Adding behavior without modifying existing code (e.g., adding logging/metrics to service calls)

### Explain the difference between coupling and cohesion

- **Low coupling:** Components have minimal dependencies on each other. Changes in one don't cascade to others. Achieved through interfaces, event-driven communication, and clear boundaries.
- **High cohesion:** Related responsibilities are grouped together. A class/service does one thing well. Everything inside it is related to its core purpose.
- **Goal:** Low coupling + high cohesion = maintainable, testable, evolvable systems.

---

## Databases

### When would you use SQL vs NoSQL?

**SQL (PostgreSQL, MySQL):**
- Structured data with relationships
- ACID transactions needed
- Complex queries and joins
- When data consistency is critical (banking, orders)

**NoSQL (DynamoDB, Firestore, MongoDB):**
- Flexible schema, evolving data models
- High read/write throughput at scale
- Key-value or document access patterns
- When horizontal scaling is a priority

**Real example:** At Kavak, used PostgreSQL for financial data (ACID needed), while at NocNoc some product catalog data uses NoSQL for flexibility and read performance.

### Explain database indexing

- Indexes speed up reads by creating a data structure (usually B-tree) that allows the DB to find rows without scanning the entire table
- Trade-off: faster reads, slower writes (index must be updated on every insert/update)
- Composite indexes for multi-column queries — column order matters
- Always check query plans (EXPLAIN) to verify indexes are being used

---

## Cloud & Infrastructure

### How do you approach CI/CD?

- **Pipeline:** Code → Tests → Build → Deploy to staging → Integration tests → Deploy to production
- **Practices:** Automated tests on every PR, trunk-based development or short-lived branches, feature flags for gradual rollouts
- **Tools I've used:** CircleCI (Southworks), Argo CD (Kavak), Jenkins (NocNoc)
- **Key:** Fast feedback loops. If CI takes 30+ minutes, developers lose context.

### How do you approach observability?

Three pillars:
- **Logs:** Structured logging (JSON), correlation IDs across services, log levels
- **Metrics:** Business metrics (orders processed, policies issued) and technical metrics (latency, error rates, throughput)
- **Traces:** Distributed tracing to follow a request across services

**Tools I've used:** Datadog, NewRelic, Grafana, Graylog, Kibana, AWS CloudWatch

**Real example (NocNoc):** Built unified observability in sellers-core — all seller operations route through it, enabling a single dashboard for metrics, alerting, and debugging across the entire seller integration platform.

---

## Past Interview Challenges

### UenoBank Securities Trading Platform Design

**Challenge:** Design a platform for clients to autonomously trade securities (previously done through personal executives via email/WhatsApp).

**Key entities:**
- Mercado de Valores (MV) — where transactions occur
- AFI — receives transaction notifications, may levy taxes
- CIV — authorizes all transactions

**Features:** Check security prices, view holdings, execute buy/sell orders

**Key considerations:**
- Integration with external entities (MV, AFI, CIV) — async where possible, resilient patterns
- Transaction consistency — Saga pattern for the buy/sell flow
- Real-time price updates — WebSocket or polling with caching
- Audit trail — every transaction logged for compliance

### Production Incident Resolution

**Challenge:** Describe how you handle a production incident.

**Real example:** Database schema change not mapped in Hibernate broke API workflows.

**Steps:**
1. **Identify:** Alerts fired on error rate spike, confirmed via logs
2. **Assess impact:** Which endpoints, which users, which environments
3. **Mitigate:** Rollback or hotfix — in this case, quick schema mapping fix
4. **Communicate:** Update stakeholders, post in incident channel
5. **Resolve:** Deploy fix, verify metrics return to normal
6. **Post-mortem:** What happened, why it wasn't caught, how to prevent it (e.g., migration tests, schema validation in CI)

---

## Questions to Prepare For

<!-- Add new questions here as you encounter them in interviews -->

- [ ] How would you migrate a monolith to microservices?
- [ ] How do you handle authentication/authorization in microservices?
- [ ] Explain event-driven architecture vs request-response
- [ ] How do you handle backward compatibility in APIs?
- [ ] What's your approach to testing in microservices?
- [ ] How do you handle secrets management?
- [ ] Explain CAP theorem and its practical implications
