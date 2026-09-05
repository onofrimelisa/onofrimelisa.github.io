# Experience Cases

> Concrete, detailed examples from your career. Use these when an interviewer says "tell me about a time when..." or "walk me through your architecture." Each case includes context, your role, technical details, and the outcome. Practice telling each one in 3-5 minutes.

---

## NocNoc — Seller Integration Platform

### The Architecture

**Context:** NocNoc is an e-commerce marketplace. Sellers need multiple ways to manage their products and orders: a public API, a Shopify integration, SFTP bulk uploads, a Seller Center UI, and an Amazon Scraper that imports product data from Amazon.

**The problem:** Each integration channel was built independently, leading to duplicated validation logic, inconsistent error handling, and no unified observability across seller operations.

**What I built:** I designed and built **sellers-core** from the ground up — a centralized processing layer that all seller-facing services route through. Instead of each channel implementing its own validation, transformation, and persistence logic, they all call sellers-core as a single source of truth.

**Architecture:**
```
Public API ─────┐
Shopify ────────┤
SFTP ───────────┼──→ sellers-core ──→ Database / Events
Seller Center ──┤
Amazon Scraper ──┘
```

**Key decisions:**
- **Centralized validation:** All seller operations (create product, update price, sync inventory) go through sellers-core regardless of the source channel
- **Unified observability:** Since everything routes through one service, I built a single dashboard for metrics, alerting, and debugging across the entire seller integration platform
- **Channel-agnostic processing:** sellers-core doesn't care where the request came from — it enforces the same business rules consistently

**Result:** Reduced duplicated logic across 5 integration channels, made debugging dramatically easier (one place to look), and enabled the team to add new channels without reimplementing core business logic.

**Use this when asked about:**
- System design / architecture decisions
- Building something from scratch
- Ownership and initiative
- Reducing technical debt

### Amazon Scraper — Distributed Rate Limiting

**Context:** NocNoc's Amazon Scraper service imports product data from Amazon's API to help sellers list products. Amazon enforces strict API throttling policies.

**The problem:** With multiple instances of the scraper running concurrently, we were hitting Amazon's rate limits and getting throttled, which caused data import failures and delays for sellers.

**What I built:** Implemented a distributed rate limiting system using a token bucket algorithm shared across all scraper instances.

**Technical details:**
- Token bucket algorithm with a shared state across instances
- Exponential backoff with jitter when throttled — prevents all instances from retrying at the same time
- Monitoring dashboard showing real-time API usage vs. quota
- Alerting when approaching rate limits, so we could proactively adjust before sellers experienced issues

**Result:** Eliminated uncontrolled throttling, made the scraping process predictable and reliable, and gave the team visibility into API consumption patterns.

**Use this when asked about:**
- Rate limiting / throttling
- Distributed systems challenges
- Monitoring and observability
- Working with external APIs

---

## UenoBank — Insurance Manager

### Architecting the Insurance Engine

**Context:** UenoBank (accessed via itti, the digital banking app) wanted to offer insurance products to its users — life insurance, home insurance, etc. Each insurance product involves integration with a different external provider, each with their own API, data formats, and reliability characteristics.

**The problem:** Build the core policy issuance engine that would power all insurance products. It needed to handle multiple external providers, each with different interfaces and varying reliability, while maintaining a consistent user experience.

**What I built:** The **Insurance Manager** — the central microservice responsible for the entire policy lifecycle: quoting, issuance, renewal, and cancellation.

**Key technical decisions:**
- **Strategy pattern for providers:** Each external insurance provider is implemented behind a common interface. Adding a new provider means implementing the interface, not modifying the core engine.
- **Async for non-critical operations:** Policy issuance verification is synchronous (user needs immediate feedback), but notifications to external providers and downstream systems are asynchronous via message queues.
- **Circuit breaker on external calls:** When an external provider is down, the circuit opens and we gracefully degrade — showing cached data or informing the user — instead of cascading failures through the entire banking app.
- **Retry with exponential backoff:** For transient failures on external provider calls, with a dead-letter queue for messages that fail after N retries.

**Real-world validation:** Weeks after launch, one of the external insurance providers had significant downtime. Because of the circuit breaker and async patterns, our users saw graceful degradation instead of errors. The system handled it exactly as designed.

**Result:** Successfully launched multiple insurance products. The architecture proved resilient under real-world failure conditions and made it straightforward to onboard new insurance providers.

**Use this when asked about:**
- Resilience patterns (circuit breaker, retry, DLQ)
- Integration with external/legacy systems
- Architecture decisions and trade-offs
- Designing for failure

### Securities Trading Platform Design (Interview Challenge)

**Context:** This was a technical challenge during the UenoBank interview process. Design a platform for clients to autonomously trade securities (previously done through personal executives via email/WhatsApp).

**Key entities:**
- **Mercado de Valores (MV):** Where transactions actually occur
- **AFI:** Receives transaction notifications, may levy taxes
- **CIV:** Authorizes all transactions

**My design approach:**
1. **Service decomposition:** Separate services for portfolio management, order execution, price feeds, and compliance
2. **Integration strategy:** Async communication with MV, AFI, and CIV where possible, synchronous only for CIV authorization (blocking requirement)
3. **Transaction flow:** Saga pattern for buy/sell orders — each step (CIV authorization → MV execution → AFI notification) has a compensation action for rollback
4. **Real-time prices:** WebSocket connection to MV with local caching, fallback to polling if WebSocket drops
5. **Audit trail:** Event sourcing for all transactions — regulatory requirement, every state change is recorded

**Use this when asked about:**
- System design interviews
- Fintech / regulated systems
- Distributed transactions (Saga pattern)
- Event sourcing

---

## Mercado Libre — Authorization Platform

### Building the Authorization Platform

**Context:** Mercado Libre needed a new authorization platform — think AWS IAM but for MELI's internal ecosystem. This system would sit in the critical path of every application in the company, evaluating access policies for millions of users.

**The problem:** Build a policy-based access control system that could handle MELI-scale traffic (millions of requests) with strict latency requirements, and make it available across multiple programming languages.

**What I built:**
- **Multi-language SDKs:** Java, Go, Python, and Node.js SDKs that applications integrate to evaluate authorization policies. Each SDK had to provide consistent behavior while respecting the idioms and conventions of each language.
- **Docker sidecar deployment:** An alternative deployment model where the policy evaluation engine runs as a sidecar container alongside the application, reducing network hops for latency-sensitive workloads.
- **Stress testing:** Designed and ran load tests that simulated real-world MELI traffic patterns to validate the platform could handle production scale without degrading latency.

**Key challenges:**
- **Cross-language consistency:** The same policy must evaluate identically whether the SDK is Java, Go, Python, or Node.js. This required careful specification and thorough cross-language testing.
- **Latency in the critical path:** Every request to every MELI application would go through this system. Even a few milliseconds of added latency at this scale has a measurable impact.
- **On-call at scale:** Participated in on-call rotations for a system in the critical path of MELI's entire ecosystem. Production incidents meant immediate impact on millions of users.

**Result:** The platform shipped successfully and became the standard authorization mechanism across Mercado Libre. Got promoted from Software Development Analyst to Semi-Senior during this project.

**Use this when asked about:**
- Working at scale
- SDK design / multi-language development
- Performance optimization
- Critical path systems
- Promotion / career growth

---

## Kavak — Fintech Banking Automation

### Automating Core Banking Processes

**Context:** Kavak's fintech division handled vehicle financing. Many core banking processes — loan disbursements, payment reconciliation, account management — involved manual steps that slowed operations and introduced errors.

**What I built:** Greenfield microservices in Go, Node.js, and Java that automated previously manual banking workflows.

**Key aspects:**
- **Polyglot architecture:** Different services used different languages based on what fit best — Go for performance-critical services, Node.js for I/O-heavy integrations, Java for services that needed the Spring ecosystem
- **Financial data integrity:** PostgreSQL with ACID transactions for all financial operations — no eventual consistency for money movement
- **CI/CD with Argo CD:** GitOps-based deployment pipeline ensuring consistent, auditable deployments

**Use this when asked about:**
- Greenfield development
- Polyglot architectures
- Fintech / financial systems
- Automation of manual processes

---

## Emi Labs — AI Recruitment Platform Integrations

### Building the Enterprise Integration Layer

**Context:** Emi Labs is an AI-powered recruitment platform used by 50+ enterprises including Walmart and Coca-Cola FEMSA. Each enterprise client needs to integrate Emi with their existing HR systems (ATS, HRIS, etc.), each with different APIs and requirements.

**What I built:** The integration layer that connected Emi's AI platform with each enterprise client's systems.

**Key decisions:**
- **Strategy pattern for client integrations:** Common interface for all integrations, with client-specific implementations. This made onboarding new clients a matter of implementing the interface rather than building from scratch.
- **Balancing generic vs. specific:** The temptation was always to build a fully generic abstraction layer. I learned to ship the specific solution first, prove it works, then generalize. Over-engineering under time pressure leads to missed deadlines and technical debt that's worse than the duplication it was meant to prevent.

**The lesson:** One client had requirements that didn't fit our standard architecture. I proposed a generic abstraction layer but underestimated the complexity under a tight timeline. We had to cut scope and deliver a specific solution first, then refactor. The lesson: YAGNI under time pressure. Ship specific, then generalize.

**Use this when asked about:**
- Working with enterprise clients
- Integration architecture
- YAGNI / pragmatic engineering
- A project that didn't go as planned (the over-engineering story)

---

## Southworks — US Client Projects

### The Foundation

**Context:** My first professional role, building applications for US-based clients like Discovery Channel. Worked in English from day one, with US-standard engineering practices.

**What I gained:**
- Professional English communication (C1 level, Cambridge CAE certified)
- AWS Cloud Practitioner certification
- CI/CD discipline with CircleCI
- Infrastructure as code practices
- Understanding of US work culture and expectations

**Use this when asked about:**
- Early career / how you got started
- Working with US clients
- Remote work experience
- English proficiency

---

## Production Incident Case

### Database Schema Change Breaking API Workflows

**Context:** A database schema change was deployed but the corresponding Hibernate entity mappings weren't updated, causing API endpoints to fail.

**How I handled it:**
1. **Detection:** Alerts fired on error rate spike in monitoring. Confirmed via structured logs that Hibernate was throwing mapping exceptions.
2. **Impact assessment:** Identified which endpoints were affected, which user flows were broken, and which environments had the issue.
3. **Mitigation:** Quick fix to align the Hibernate entity mappings with the new schema. Deployed as a hotfix.
4. **Communication:** Updated stakeholders in the incident channel with status and ETA.
5. **Resolution:** Deployed fix, verified metrics returned to normal baseline.
6. **Post-mortem:** Root cause was that schema migrations and entity mappings were updated in separate PRs with no cross-validation. Action items: add schema-entity mapping validation to CI pipeline, require migration + mapping changes in the same PR.

**Use this when asked about:**
- Production incidents
- Debugging under pressure
- Post-mortem culture
- Observability and monitoring

---

## Cross-Cutting Themes

Use these themes to connect your stories to common interview questions:

| Theme | Stories to Reference |
|-------|---------------------|
| **Ownership** | NocNoc sellers-core (built from scratch), UenoBank Insurance Manager (architected the engine) |
| **Scale** | Mercado Libre authorization platform (millions of users), NocNoc Amazon Scraper (distributed rate limiting) |
| **Resilience** | UenoBank circuit breaker (real-world validation), NocNoc rate limiting (external API management) |
| **Leadership without authority** | Kavak mentoring junior dev, UenoBank proposing async architecture to lead |
| **Learning from failure** | Emi Labs over-engineering story, production incident post-mortem |
| **Technical depth** | Multi-language SDKs at MeLi, distributed rate limiting at NocNoc, Saga pattern at UenoBank |
| **Communication** | English from day one at Southworks, stakeholder updates during incidents, presenting technical proposals |

---

## Cases to Add

<!-- Add new cases here as you encounter new interview questions or remember relevant stories -->

- [ ] Deep dive into NocNoc's full service architecture (all microservices and how they interact)
- [ ] Specific performance optimization story with metrics (before/after)
- [ ] Database migration or scaling story
- [ ] A time you had to make a trade-off between speed and quality
- [ ] A time you onboarded to a new codebase quickly
