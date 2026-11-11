# Mural — Interview Prep

> Everything related to the Mural interview process. Updated as we progress through each stage.

---

## About the Company

- **Product:** Visual collaboration platform (digital whiteboards, templates, facilitation tools)
- **Mission:** Fix broken teamwork — eliminate app fragmentation, unproductive meetings, siloed information, and misaligned priorities
- **Clients:** 50%+ of Fortune 100 companies. Ranked #1 visual work solution for enterprise
- **Culture:** Remote-first. Values: triumph through teamwork, adapt to thrive, commit to caring
- **AI:** Actively integrating AI into the product (Mural AI, Microsoft 365 Copilot integration)
- **Investors:** Tiger Global, Gradient Ventures, Slack
- **Leadership:** CEO Leigh-Margaret Stull, CTO Omar Ayub

---

## Position: Senior Software Engineer, Admin & IAM

**Team mission:** Define user authentication, identity management, and organizational access controls at Mural. Own authentication & authorization, SSO, MFA, user provisioning (SCIM), session management, and the permission model for roles and access control. Also manage enterprise administration experiences for company and workspace administrators.

**Core mission:** Design and deliver identity capabilities end-to-end — from identity primitives like the permission model and authentication flows to the admin surfaces enterprise customers use every day. Own complex technical initiatives while influencing platform and security practices.

**Responsibilities:**
- Build and evolve identity and access systems: authentication, authorization, SSO, user provisioning, session management, permissions
- Develop enterprise admin experiences: company/workspace configuration, user/content administration, billing, internal admin tooling
- Collaborate cross-functionally with product, design, security, and engineering partners
- Own technical initiatives from design through implementation, rollout, and operational support
- Build flexible, observable, maintainable solutions — accountable for security, quality, performance, reliability
- Contribute to technical design discussions and code reviews
- Mentor teammates and improve engineering work quality
- Use AI tools as part of fundamental workflows

**Requirements:**
- 4+ years shipping large-scale production software in agile teams
- Node.js, TypeScript/JavaScript, MongoDB (or comparable)
- Production React experience with modern frontend patterns
- Plan and deliver projects iteratively, balancing speed, quality, and long-term maintainability
- Strong collaboration and communication across product, design, security, and engineering
- Fast-moving / growth-stage environment background
- Outcome-oriented interest in AI-driven development practices

**Preferred:**
- IAM domain experience: authentication flows, authorization models, roles & permissions, SSO, SCIM provisioning, session management
- Enterprise admin or B2B SaaS configuration surfaces: org management, billing, admin dashboards

**Environment:** Remote-first (Buenos Aires office option), small focused team, reports to Engineering Manager

---

## Profile Match — What to Highlight

| JD Requirement | My experience |
|----------------|---------------|
| IAM domain: auth flows, authorization models, roles & permissions, SSO | Built MeLi's authorization platform — policy-based access control (AWS IAM-style) in the critical path of every MELI application, millions of users |
| Build and evolve identity systems | Designed the permission model, built multi-language SDKs (Java, Go, Python, Node.js), Docker sidecar deployment for latency-sensitive workloads |
| Enterprise admin / B2B SaaS config surfaces | sellers-core at NocNoc = centralized admin/config layer for all seller operations. UenoBank Insurance Manager = config-driven policy engine |
| Node.js, TypeScript, MongoDB | Primary stack at NocNoc. TypeScript/Node.js across all recent roles |
| Production React | Frontend experience at NocNoc (Seller Center) |
| Own initiatives from design through operational support | End-to-end ownership across every role: design → implementation → observability → on-call |
| Scale & on-call | On-call rotations for MeLi's auth platform — production incidents = immediate impact on millions |
| Security, quality, performance, reliability | Auth platform was security-critical. Stress testing at MeLi-scale. Circuit breaker + resilience patterns at UenoBank |
| Mentor teammates, code reviews | Mentored junior dev at Kavak (PR reviews, pair programming). Code review culture at every role |
| AI tools in workflows | Active user of Claude Code, MCP servers, prompt engineering. Built AI-assisted development workflows |
| Fast-moving / growth-stage environment | Kavak (hypergrowth), NocNoc (startup), Emi Labs (early-stage) |

### Cross-cutting strengths

- 6+ years shipping production systems at scale
- Buenos Aires, remote — exact location match
- TypeScript/Node.js as primary stack
- End-to-end ownership: design → implementation → observability → on-call
- AI integration in development workflows (Claude Code, MCP, prompt engineering)
- English C1 (Cambridge CAE), remote work since day one (US clients at Southworks)
- Growth trajectory: promoted at MeLi, architected core systems at UenoBank, built from scratch at NocNoc

---

## Adapted Pitch (for Admin & IAM / EM interview)

> I'm Melisa, a Senior Software Engineer with 6+ years of experience building production backend systems. What drew me to this role specifically is the domain — identity and access management is something I've worked on directly. At Mercado Libre, I was part of the team that built their authorization platform — essentially an AWS IAM-style system that sat in the critical path of every application in the ecosystem, evaluating access policies for millions of users. I built multi-language SDKs, a sidecar deployment model, and ran stress tests at real-world scale. Since then, I've kept building platform-level systems: an insurance policy engine at UenoBank with resilient integrations, and the entire seller integration platform at NocNoc, from scratch. The thread across my career is building critical infrastructure that other teams and systems depend on — and that's exactly what Admin & IAM does at Mural.

---

## Engineering Manager Interview

### What an EM typically evaluates

- Technical depth in the domain (IAM, auth, permissions)
- System design thinking and trade-offs
- Ownership, initiative, and end-to-end delivery
- Collaboration style and communication
- How you handle ambiguity, disagreements, and pressure
- Growth trajectory — can this person become a tech lead?
- Cultural fit — do I want this person on my team?

---

### Storytelling: MeLi Authorization Platform (deep dive for Mural)

This is the most relevant experience for the Admin & IAM role. The EM will likely want to go deep here. Below is the expanded story with IAM-specific vocabulary and connections to what Mural is building.

#### The Setup (30 seconds)

> "At Mercado Libre I was part of the team building their new authorization platform. Think of it as an internal AWS IAM — a policy-based access control system that would become the standard authorization mechanism across the entire MELI ecosystem. Every application, every request, every user — all going through this system."

#### The Challenge (1 minute)

> "The core challenge was three-fold:
>
> First, **designing the permission model**. We needed a policy language expressive enough to handle MELI's complexity — fine-grained permissions across different resources, roles, and contexts — while being simple enough that teams across the company could adopt it without needing to become authorization experts.
>
> Second, **performance in the critical path**. This system sat between every request and its destination. Even a few milliseconds of added latency at MELI's scale — millions of requests — has a measurable business impact. We couldn't afford to be a bottleneck.
>
> Third, **multi-language adoption**. MELI's ecosystem is polyglot — Java, Go, Python, Node.js. Every team needed to integrate with the auth platform regardless of their stack. The policy evaluation had to be consistent across all languages — the same policy must evaluate identically whether the SDK is Java or Node.js."

#### What I Built (2 minutes)

> "I owned the development of the multi-language SDKs — Java, Go, Python, and Node.js. The SDKs were **thin clients** that abstracted the communication with the central policy evaluation service. On every authorization check, the SDK made a network call to the service, which evaluated the policy and returned allow/deny. Each SDK had to:
> - Provide a **clean, idiomatic API** for each language — middleware for Node.js, decorators for Python, Spring integration for Java, functional options for Go
> - Handle **response caching** to reduce network round-trips — caching evaluation results for repeated checks with the same policy + context, with TTL-based expiration
> - Implement **resilience patterns** — retries with backoff for transient failures, circuit breaker when the central service was degraded, and configurable fallback behavior (fail open or fail closed) when the service was completely unreachable
>
> I also worked on the **Docker sidecar deployment model** — for teams where even the optimized SDK latency was too much. The sidecar runs the full policy evaluation engine as a container alongside the application in the same pod. Instead of crossing the network to reach the central service, the app calls the sidecar on localhost via gRPC. The sidecar fetches and caches policies from the central service in the background, but the actual evaluation happens locally — eliminating the network hop from the request path entirely.
>
> For validation, I **designed and ran stress tests** simulating real-world MELI traffic patterns. We identified bottlenecks in both the SDK path (network latency, serialization overhead) and the sidecar path (policy evaluation hot path, memory for cached policies), optimizing each accordingly.
>
> I also participated in **on-call rotations** for a system in the critical path. Production incidents meant immediate impact on millions of users — there was no 'we'll fix it tomorrow'."

#### The Connection to Mural (30 seconds)

> "What I see in Mural's Admin & IAM team is essentially the same challenge at a different scale and context: designing authentication and authorization flows, building the permission model, SSO, SCIM provisioning, session management — all critical infrastructure that enterprise customers depend on every day. The difference is the product surface — at MeLi it was internal platform, at Mural it includes the enterprise admin UI that customers interact with directly. That's actually exciting to me because it adds the product dimension to the infrastructure work."

#### Likely follow-up questions

**"How did you design the permission model?"**
> "It was policy-based — inspired by AWS IAM. Each policy defines who (principal) can do what (action) on which resources, with conditions. Policies could be attached to users, roles, or groups. The evaluation logic was: collect all applicable policies, evaluate them, and the result is allow/deny with explicit deny winning over allow. We iterated on the policy language with internal teams to balance expressiveness with usability."

**"How did you ensure cross-language consistency in the SDKs?"**
> "We had a shared test suite — a set of policy evaluation scenarios (policy + request → expected result) defined in a language-agnostic format (JSON). Every SDK ran the same test suite. If a test passed in Java but failed in Go, we had a bug. This was the contract — the test suite was the source of truth, not any individual SDK implementation."

**"What was the hardest production incident you handled on-call?"**
> "The hardest ones were cache staleness issues. The SDKs cached evaluation responses with a TTL — so if a policy was updated in the central service, SDK instances would keep returning the old (cached) result until the TTL expired. This caused intermittent authorization failures: a user's permissions were updated but some app instances still served stale deny responses, while others (with expired cache) returned the correct allow. The debugging was tricky because it was non-deterministic — it depended on which app instance served the request and when its cache last refreshed. We improved the invalidation mechanism from pure TTL-based to event-driven: the central service published policy change events, and SDKs subscribed to invalidate specific cache entries immediately. This drastically reduced the staleness window from minutes (TTL) to seconds (event propagation)."

**"How did the sidecar model work? Why not just use the SDK?"**
> "The SDK was a thin client — it made a network call to the central policy evaluation service on every auth check. That worked fine for most applications, but for latency-sensitive services the network round-trip was too expensive. The sidecar solved this by running the full evaluation engine locally as a container in the same pod. The app calls the sidecar on localhost via gRPC instead of crossing the network. The sidecar fetches policies from the central service in the background, but evaluation happens locally — no network hop in the request path. It also gave us three bonus advantages: **language coverage** (any language can call gRPC on localhost, no SDK needed), **deployment independence** (platform team updates the sidecar without app teams redeploying), and **resource isolation** (evaluation runs in its own container). The trade-off was operational complexity — another container to deploy, monitor, and debug per pod."

---

### Deep Dive: Multi-Language SDKs & Sidecar Deployment

This section expands on two key architectural decisions from the MeLi authorization platform. Use it to demonstrate depth when the EM probes "how" and "why" beyond the high-level story.

#### Why Multi-Language SDKs?

**What the SDKs actually did:**

The SDKs were **thin clients** — they abstracted the network communication with the central policy evaluation service. On every authorization check, the SDK made a network call to the service, sent the request context (who, what action, which resource), and received an allow/deny response. The SDKs also handled resilience (retries, circuit breaker, fallback behavior) and response caching.

The evaluation logic itself lived in the central service, not in the SDKs. This was a deliberate design decision: maintaining the evaluation engine in one place (the service) is far simpler than replicating it across four language implementations.

**The fundamental question: Can't an app just call the central service directly via HTTP? Why do we need SDKs at all?**

Technically yes — any app can make an HTTP call. But that pushes all the complexity onto every consuming team:

1. **Resilience logic is non-trivial and must be consistent.** Every team would need to implement retries with backoff, circuit breaker when the service is degraded, configurable fallback behavior (fail open vs. fail closed), and response caching. If each team rolls their own, you get 50 different implementations with inconsistent behavior — some silently failing open (security hole), others failing closed on transient errors (availability issue). The SDK standardizes this.

2. **Idiomatic integration matters for adoption.** The SDK had to feel native to each language's ecosystem. If the SDK feels foreign, teams resist adoption. And adoption was critical — this was meant to be the standard auth mechanism for the entire company. A raw HTTP call doesn't integrate cleanly with framework patterns.

3. **Each SDK solved the same problem but leveraged each language's strengths.** The core job was always the same: call the central service, cache responses, handle failures, expose a clean API. But *how* each SDK did it internally was tailored to what each language is good at:

   **Java SDK:**
   - Java excels at long-running, multi-threaded server applications. Its mature concurrency model (thread pools, `ExecutorService`, `CompletableFuture`) made it natural to run auth calls asynchronously without blocking the request thread, and to manage the response cache with concurrent-safe data structures (`ConcurrentHashMap`).
   - Published to Maven Central. Used builder pattern for configuration (idiomatic Java). Integrated with Spring's dependency injection via `@Bean` configuration — teams added auth to their app with a single Spring config class.
   - The JVM's JIT compilation optimized the SDK's hot paths (serialization, cache lookups) over time. We pre-warmed connections on startup to avoid cold-start latency spikes on the first auth calls.
   - **Where Java shines here:** Mature threading model for async calls, concurrent data structures for caching, vast ecosystem for enterprise integration (Spring, Maven).

   **Go SDK:**
   - Go's goroutines made it trivial to handle auth calls concurrently — fire the network call in a goroutine, check the cache first, fall back to the call if needed. Background cache refresh ran in a goroutine with minimal memory overhead.
   - Followed Go module conventions (`go get`). Used the functional options pattern for configuration (idiomatic Go: `NewClient(WithCacheTTL(300), WithFallbackPolicy(deny))`). Returned errors explicitly — no exceptions, no panics.
   - Go compiles to a single static binary with the HTTP client built in — the SDK added zero external runtime dependencies.
   - **Where Go shines here:** Lightweight concurrency (goroutines), zero-dependency static binary, explicit error handling that forces callers to deal with failures, built-in HTTP client.

   **Python SDK:**
   - Python is single-threaded (GIL), so the network calls had to be managed carefully. We used `requests` for synchronous calls with connection pooling, and provided an async variant using `aiohttp` for teams running async frameworks (FastAPI, aiohttp).
   - pip-installable. Provided decorators for permission checks (`@require_permission("resource:action")`) — the most Pythonic way to express "this endpoint requires authorization." Also provided a context manager for more complex evaluation scenarios.
   - Cache was thread-safe using `threading.Lock` for the sync variant and simple dict for the async variant (single-threaded event loop).
   - **Where Python shines here:** Expressiveness (decorators, context managers), dual sync/async support, rapid adoption for data/ML teams that needed auth.

   **Node.js SDK:**
   - Node.js is single-threaded with an event loop — the async/non-blocking model meant auth calls (network I/O) never blocked the event loop. Response caching used a simple in-memory Map with TTL (single-threaded, no concurrency issues).
   - npm package. Provided Express/Fastify middleware (`app.use(authMiddleware({ policy: 'resource:action' }))`) — the idiomatic way to add cross-cutting concerns in Node.js web frameworks.
   - Node.js apps tend to start and stop frequently (especially in serverless-like deployments), so the SDK handled cold starts gracefully — warming up the connection pool and pre-fetching common policy evaluations on `require()`.
   - **Where Node.js shines here:** Event loop for non-blocking I/O, middleware pattern for web frameworks, simple caching (no concurrency), fast startup for ephemeral workloads.

4. **Dependency isolation.** A single "universal" SDK written in one language would force its runtime onto every consuming app. A Go binary embedded in a Node.js app introduces libc dependencies, CGO compilation requirements, and a binary that's opaque to Node.js tooling (debugging, profiling, APM agents). Each native SDK keeps the dependency footprint minimal and compatible with the host ecosystem.

**How we ensured consistency across SDKs:**

The risk of multi-language SDKs is behavioral divergence — different fallback behavior, different caching semantics, different circuit breaker thresholds. We mitigated this with:

- **Language-agnostic test suite:** A shared JSON file defining hundreds of scenarios: (request context + service response → expected SDK behavior, including cache hits, fallback scenarios, and error handling). Every SDK ran this exact suite in its own test framework. This was the contract.
- **Shared specification document:** The SDK behavior was formally specified — cache TTL semantics, circuit breaker thresholds, retry policy, fallback modes. The spec was the source of truth, SDKs were implementations of it.
- **Cross-SDK integration tests in CI:** On every PR to any SDK, CI ran the full shared test suite across all four languages. A regression in one SDK blocked the release of all SDKs.

**What I'd say in the interview:**

> "We built native SDKs in four languages because teams needed a clean, idiomatic way to integrate with the central auth service — not raw HTTP calls where each team rolls their own retry logic and caching. The SDKs standardized resilience patterns (circuit breaker, fallback, caching) so auth behavior was consistent across the entire company. Each SDK was tailored to its language's strengths — Spring integration for Java, middleware for Node.js, decorators for Python, functional options for Go. The hard part was ensuring all four behaved identically, which we solved with a shared, language-agnostic test suite."

---

#### Sidecar Deployment Model

**What is a sidecar?**

A sidecar is a separate container that runs alongside the main application container in the same pod (in Kubernetes) or on the same host. It shares the network namespace with the main container, so communication between them is via `localhost`.

**The key difference from the SDK:** The SDK is a thin client that calls the central auth service over the network on every evaluation. The sidecar runs the **full policy evaluation engine locally** — it fetches and caches policies from the central service in the background, but the actual evaluation happens inside the sidecar container with no network call in the request path.

```
SDK model (thin client):
┌─────────────┐   network    ┌──────────────────┐
│  Application │────────────→│  Central Auth     │
│  + SDK       │  (~2-10ms)  │  Service (eval)   │
└─────────────┘              └──────────────────┘

Sidecar model (local evaluation):
┌──────────────────── Pod ────────────────────┐
│                                             │
│  ┌─────────────┐  localhost  ┌────────────┐ │       background
│  │  Application │───gRPC────→│  Sidecar   │ │──── policy sync ───→ Central
│  │  (any lang)  │  (~0.1ms)  │  (eval     │ │                      Auth
│  └─────────────┘             │   engine)  │ │                      Service
│                              └────────────┘ │
└─────────────────────────────────────────────┘
```

**Why a sidecar when we already had SDKs?**

The SDK and the sidecar are two different integration models with a clear latency/complexity spectrum:

| Dimension | SDK (thin client) | Sidecar (local evaluation) |
|-----------|-------------------|---------------------------|
| **Latency** | Network round-trip to central service (~2-10ms, varies with load and distance). Response caching reduces frequency but cache misses still pay the full cost | Localhost gRPC call (~0.1-0.5ms). Evaluation is local — no network in the request path. Policies synced in background |
| **Where evaluation happens** | Central service (remote) | Sidecar container (local) |
| **Language coupling** | Requires an SDK for the app's language | Language-agnostic — any app can call gRPC on localhost |
| **Update/rollout** | App team must update their SDK dependency and redeploy | Platform team can update the sidecar image independently |
| **Resource isolation** | Lightweight — SDK is just an HTTP client + cache in the app's process | Heavier — separate container consuming its own memory/CPU for the evaluation engine and policy cache |
| **Adoption friction** | Team must add a dependency, learn the SDK API, adapt to the framework pattern | Team only needs to make a gRPC call — minimal code change, no dependency to import |
| **Debugging** | One process — simpler stack traces, SDK logs are part of the app's logs | Two processes — need to correlate logs between app container and sidecar container |
| **Versioning** | Each app may be on a different SDK version — fragmentation risk | Platform team controls the version centrally |
| **Failure mode** | If central service is down → SDK circuit breaker opens → fallback (fail open/closed). Cache may serve stale results | If sidecar is down → app gets connection refused on localhost → must handle gracefully. If central service is down → sidecar keeps evaluating with cached policies — more resilient |
| **Operational cost** | Low — just a library dependency | Higher — another container per pod to deploy, monitor, resource-limit, and debug |

**When to recommend each:**

- **SDK** when: the team's language has a mature SDK, latency is acceptable (cache hit ratio is high, so most checks don't hit the network), and they want the simplest operational footprint (no extra container).
- **Sidecar** when: latency is critical (the network round-trip to the central service is too expensive), the team uses a language without an SDK, or when the platform team needs deployment independence (push updates without requiring app teams to redeploy). Also useful as a staging ground for new authorization features — ship it in the sidecar first, validate, then update SDKs.

**The three-tier model (how it evolved):**

```
1. Direct HTTP calls     →  Every team rolls their own. Inconsistent, fragile.
2. SDK (thin client)     →  Standardized client. Network call on eval, but with
                            caching, retries, circuit breaker. Good enough for
                            most services.
3. Sidecar (local eval)  →  Full evaluation engine on localhost. Best latency,
                            most operational complexity. For latency-sensitive
                            services and teams without an SDK.
```

Each tier was introduced to solve the limitations of the previous one. The SDKs fixed the "everyone rolls their own client" problem. The sidecar fixed the "network latency on every cache miss" problem.

**The real-world scenario that drove the sidecar decision:**

> "The SDKs worked well for most services — the response cache meant that the majority of auth checks were served locally without a network call. But we had two categories of teams that needed more. First, **latency-sensitive services** in the critical path where even occasional cache misses (full network round-trip to the central service) were too expensive — a p99 spike of 10ms on an auth check cascaded into their SLA. The sidecar eliminated this because evaluation is always local — no network in the hot path, ever. Second, **teams without an SDK** for their language or framework. The sidecar gave them auth evaluation immediately — just add a container and call gRPC on localhost. But the biggest win turned out to be versioning: with SDKs, some teams were stuck on old versions because upgrading required code changes and testing. With the sidecar, the platform team controls the version — we deploy an update and it's live everywhere on the next pod restart."

**How sidecar deployment and versioning worked for consuming teams:**

The sidecar was published as a Docker image to the internal container registry, versioned with semver tags:

```
auth-sidecar:1.0.0
auth-sidecar:1.1.0  (new feature: condition evaluation)
auth-sidecar:1.2.0  (performance optimization)
auth-sidecar:2.0.0  (breaking: new policy format)
```

Teams integrated by adding the sidecar container to their Kubernetes deployment manifest:

```yaml
# Team's deployment.yaml
spec:
  containers:
    - name: my-app
      image: my-app:latest
    - name: auth-sidecar
      image: auth-sidecar:1.2.0    # pin to a specific version
      ports:
        - containerPort: 9090       # gRPC endpoint
      env:
        - name: POLICY_SERVICE_URL
          value: "https://auth-central.internal"
        - name: CACHE_TTL
          value: "300"              # policy cache duration in seconds
```

**Rollout strategy:**

- **Minor/patch versions** (backward-compatible): Platform team announced the new version. Teams updated the image tag at their own pace. Strongly encouraged but not forced.
- **Major versions** (breaking changes): Coordinated rollout with a migration window. Old version kept running for N weeks. Platform team provided migration guides and office hours.
- **Emergency patches** (security fixes): Platform team could push a new image tag and trigger rolling restarts across all pods using the sidecar — teams didn't need to do anything because the sidecar version was managed via a shared Helm chart variable that the platform team controlled.
- **Canary rollout for risky changes**: Deploy the new sidecar version to a subset of pods first, monitor policy evaluation metrics (latency, error rate, deny rate), and promote or rollback based on data.

**Disadvantages of the sidecar model:**

The sidecar is not free. Every advantage has a cost, and these are the reasons many teams stayed on the SDK:

1. **Resource overhead per pod.** Every pod that uses the sidecar runs an extra container with its own memory and CPU allocation. The evaluation engine needs to hold the full policy cache in memory, plus the gRPC server, plus the background sync goroutines. At MeLi's scale — thousands of pods — this adds up. If the sidecar uses 128MB RAM per pod and you have 2,000 pods, that's 256GB of RAM across the cluster just for auth sidecars. You need to set resource requests/limits carefully: too low and the sidecar OOMs under load, too high and you waste cluster capacity.

2. **Startup dependency and ordering.** The application container and the sidecar start concurrently in a pod. If the app starts making auth calls before the sidecar is ready (hasn't finished initial policy sync), those calls fail. You need either: a readiness probe on the sidecar that the app waits for, an init container that blocks until the sidecar is healthy, or the app retrying with backoff on startup. This is subtle — it works fine in steady state but causes flaky failures during deployments and pod restarts if not handled correctly.

3. **Debugging becomes cross-container.** With the SDK, a failed auth check is visible in the app's own logs and stack traces — one process, one log stream. With the sidecar, you need to correlate: the app log says "auth call failed," but the reason is in the sidecar container's logs (policy not found, sync failed, evaluation error). During incidents at 3 AM, jumping between container logs in the same pod adds friction. We mitigated this with a shared correlation ID passed in the gRPC metadata, but it's still more complex than single-process debugging.

4. **Failure mode is different and harder to reason about.** With the SDK (thin client), if the central service is down, the SDK's circuit breaker opens and you get a configurable fallback (fail open/closed, serve cached responses). With the sidecar, you have two potential failure points:
   - **Sidecar process crashes or OOMs:** The app gets `connection refused` on localhost. This looks like a network error, not an auth error — confusing. You need health checks and restart policies (`restartPolicy`, liveness probes) tuned correctly.
   - **Background policy sync fails:** The sidecar keeps running but its policies become stale. It still evaluates, but with outdated data. Unlike the SDK (where a cache miss forces a fresh call to the central service), the sidecar has no "cache miss" path — it always evaluates locally. If the sync is broken for hours, the sidecar silently serves stale results. You need alerting on sync lag.
   - **The worst case:** Sidecar is running, passes health checks, but its policy data is corrupt or empty due to a bad sync. It evaluates everything as deny (or allow, depending on the default). This is a silent failure that only shows up as user-facing permission errors. We added a "policy freshness" metric to detect this.

5. **Versioning coordination across the fleet.** While the sidecar decouples the platform team from app teams for updates, it creates a new problem: **which sidecar version is running where?** With SDKs, you can query each app's dependency manifest to know the version. With sidecars, you need to query the cluster — which pods have which image tag. During a gradual rollout, you may have sidecar v1.2 and v1.3 running simultaneously across the cluster, evaluating the same policy differently if the evaluation logic changed. You need observability on sidecar version distribution (we added it as a metric label).

6. **Network policy and security complexity.** The sidecar needs to make outbound calls to the central auth service for policy sync. In environments with strict network policies (like MeLi), you need to explicitly allow this egress. The sidecar also opens a gRPC port on localhost — in theory only accessible within the pod, but you need to ensure no other pod can reach it (network policies, no `hostNetwork`). Each security layer adds configuration that must be maintained and audited.

7. **Cold start and scaling lag.** When the cluster autoscaler adds new nodes and pods spin up, the sidecar needs to do a full initial policy sync before it can serve evaluations. If the policy set is large (thousands of policies for a complex org), this initial sync can take seconds. During a traffic spike — exactly when you need fast scaling — the new pods aren't ready for auth until the sidecar warms up. The SDK doesn't have this problem because the central service is already warm and ready to serve.

8. **Testing complexity for consuming teams.** With the SDK, teams can mock the auth client in tests — it's just a library dependency they can stub. With the sidecar, integration tests need to either: run a real sidecar container (slower, requires Docker in CI), mock the gRPC endpoint (requires understanding the proto contract), or bypass auth in tests (risky, tests don't reflect production behavior). We published a lightweight test sidecar image with preconfigured allow-all policies for CI, but it was extra maintenance.

**Summary: when the sidecar cost is NOT worth it**

| Scenario | Why SDK is better |
|----------|-------------------|
| Team has a mature SDK for their language and high cache hit ratio | SDK latency is good enough, zero operational overhead |
| Cluster resources are tight | Sidecar memory/CPU per pod adds up at scale |
| Team needs simple, single-process debugging | SDK keeps everything in one log stream |
| Policies change infrequently | Cache staleness risk with sidecar sync is unnecessary complexity |
| Team has strong testing practices and wants full control | SDK is a library they can mock and test easily |

**The key trade-off to articulate in the interview:**

> "The sidecar gives you the best latency and deployment independence, but it's not free. You're adding a container to every pod — that's memory, CPU, startup coordination, debugging across two log streams, and a new failure mode where the sidecar can silently serve stale policies if sync breaks. At MeLi we found about 70% of teams were fine with the SDK — the response cache gave them good enough latency and they valued the simplicity. The sidecar was for the 30% that needed guaranteed sub-millisecond evaluation or didn't have an SDK for their stack. The lesson: don't adopt the sidecar by default — adopt it when the SDK's trade-offs are actually a problem for your specific service."

---

### Storytelling: Other experiences mapped to Admin & IAM

#### NocNoc sellers-core — Ownership & Building from Scratch

> "At NocNoc, I identified that every seller integration channel had been built independently — different validation logic, different error handling, no unified view. I proposed and built sellers-core from scratch: a centralized processing layer that all seller-facing services route through. This is relevant to Admin & IAM because it's the same pattern — building the platform layer that enforces consistent rules regardless of where the request comes from."

**Use when asked about:** initiative, ownership, building from scratch, legacy migration

#### UenoBank Insurance Manager — Resilient External Integrations

> "I architected the policy orchestrator — the service managing all transactional flows for insurance policies. The key decision was moving from synchronous to asynchronous issuance, with circuit breaker and retry patterns on external provider calls. Weeks after launch, a provider went down and the system handled it exactly as designed — graceful degradation instead of cascading failures."

**Use when asked about:** resilience patterns, designing for failure, integration with external systems (relevant if Mural's IAM integrates with external IdPs)

#### Kavak — Mentoring

> "A junior developer was consistently delivering PRs with bugs. Instead of escalating, I started doing detailed PR reviews with constructive explanations and pair-programmed on complex features. Over weeks, their quality improved significantly and they started reviewing others' code more carefully."

**Use when asked about:** mentoring, improving team quality, leadership without authority

---

### Deep Dive: AWS IAM as a Reference Model

AWS IAM is the authorization system we modeled MeLi's platform after. Understanding it deeply demonstrates domain expertise and gives you a shared vocabulary when discussing authorization architecture with any engineering team. It's also the industry's most well-known and battle-tested access control system.

#### What is AWS IAM?

AWS Identity and Access Management (IAM) is the service that controls **who** can do **what** on **which resources** across the entire AWS ecosystem. Every single AWS API call — launching an EC2 instance, reading from S3, querying DynamoDB — goes through IAM for authorization. It handles:

- **Authentication:** Verifying the identity of the caller (user, service, application)
- **Authorization:** Evaluating whether the authenticated caller is allowed to perform the requested action on the specified resource
- **Audit:** Recording every API call for compliance and forensics (via CloudTrail)

At AWS's scale, IAM evaluates **billions of authorization decisions per second** with sub-millisecond latency. It's arguably the most critical service in all of AWS — if IAM goes down, everything goes down.

#### Core Concepts

**1. Principals — "Who is making the request?"**

A principal is any entity that can make a request to AWS:

- **IAM Users:** Human identities with long-lived credentials (access key + secret key). Used for individual developers or service accounts.
- **IAM Roles:** Temporary identities that can be assumed by users, services, or external entities. No permanent credentials — you get temporary security tokens via STS (Security Token Service). This is the recommended approach for almost everything.
- **Federated Users:** External identities (from corporate directories like Okta, Azure AD) that assume IAM roles via SAML or OIDC federation. The user never gets IAM credentials — they get temporary tokens scoped to a role.
- **AWS Services:** Services themselves act as principals. Lambda needs to read from S3 → Lambda assumes a role with S3 read permissions.

**The key design insight:** Principals are separated from credentials. A role defines *what you can do*, not *who you are*. Multiple users can assume the same role. This separation is what makes IAM flexible.

**2. Policies — "What is allowed or denied?"**

Policies are JSON documents that define permissions. They are the core of IAM:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "192.168.1.0/24"
        }
      }
    }
  ]
}
```

Each statement has:
- **Effect:** `Allow` or `Deny`
- **Action:** The API operation(s) — `s3:GetObject`, `ec2:RunInstances`, `iam:CreateUser`, etc. Supports wildcards (`s3:*`)
- **Resource:** The specific resource(s) the action applies to, identified by ARN (Amazon Resource Name). `arn:aws:s3:::my-bucket/*` = all objects in my-bucket
- **Condition (optional):** Additional constraints — source IP, time of day, MFA presence, tags, etc.

**Policy types:**
- **Identity-based policies:** Attached to a principal (user, group, role). "This user can do X."
- **Resource-based policies:** Attached to a resource (S3 bucket, SQS queue). "This bucket allows access from account Y." Enables cross-account access.
- **Permission boundaries:** A ceiling on what an identity-based policy can grant. Used for delegation: "Allow the DevOps team to create roles, but only with permissions up to this boundary."
- **Service Control Policies (SCPs):** Organization-level policies that restrict what any account in the org can do. Even if an account's IAM policy says Allow, the SCP can deny it. Used for governance guardrails.
- **Session policies:** Temporary policies passed when assuming a role. Further restrict the role's permissions for that specific session.

**3. Policy Evaluation Logic — "How does IAM decide?"**

This is the engine. Given a request (principal + action + resource + context), IAM evaluates all applicable policies and returns allow or deny:

```
1. By default, everything is DENIED (implicit deny)
2. Evaluate all applicable policies:
   a. If ANY policy has an explicit Deny → DENY (explicit deny always wins)
   b. If ANY policy has an Allow AND no explicit Deny → ALLOW
   c. If no policy matches → DENY (implicit deny)
3. Check boundaries:
   a. Permission boundaries, SCPs, and session policies can further restrict
   b. The effective permission is the INTERSECTION of all applicable policy layers
```

**The "explicit deny wins" rule** is critical — it means you can grant broad access and then selectively restrict with deny statements. This is how SCPs work: the account has full permissions, but the SCP denies dangerous operations (e.g., leaving the organization, disabling CloudTrail).

**4. Roles and Assume Role — "Temporary, scoped identities"**

Roles are IAM's most powerful concept. Instead of giving a service or user permanent credentials:

1. Define a role with specific permissions
2. Define a trust policy — who can assume the role
3. The caller asks STS for temporary credentials scoped to that role
4. Temporary credentials expire after a configurable duration (15min to 12h)

**Why this matters:**
- No long-lived credentials to leak or rotate
- Permissions are scoped to what's needed for the task (least privilege)
- Cross-account access without sharing credentials — account A's role trusts account B's users
- Service-to-service auth without hardcoded secrets — each service assumes its own role

**Connection to MeLi:** Our platform used a similar model — policies attached to principals (users, roles, groups) with temporary evaluation contexts. The trust chain concept (who can assume what) was directly inspired by IAM's role assumption model.

#### Architecture Characteristics That Made IAM Successful

**1. Evaluation happens at the edge, not centrally**

If every AWS API call had to route through a single central IAM service, it would be the worst bottleneck in the world. Instead:
- Policy data is **distributed and cached** at every AWS service endpoint
- Evaluation happens **locally** at the service receiving the request
- Policy changes are **propagated** to all endpoints with eventual consistency (this is why IAM changes can take "a few seconds" to propagate)

**Connection to MeLi:** This is exactly the problem our sidecar solved — moving evaluation from a central service to a local engine. AWS does the same thing but at planet scale.

**2. The policy language is the contract**

IAM's policy language (JSON) is the **API between the authorization system and every AWS service**. A new AWS service doesn't need a custom auth integration — it defines its actions and resources, and IAM's evaluation engine handles the rest. This decouples the auth platform from the services it protects.

**Connection to MeLi:** We designed our policy language as the contract too — SDKs and the sidecar both evaluated the same policy format. Adding a new service to the auth platform meant defining its actions/resources in the policy schema, not modifying the evaluation engine.

**3. Layered policy system enables delegation**

IAM's multiple policy layers (identity, resource, boundary, SCP, session) solve a real organizational problem: **how do you give teams autonomy while maintaining guardrails?**

- SCPs let the security team set hard limits ("no one can disable CloudTrail")
- Permission boundaries let the DevOps team create roles without exceeding their ceiling
- Identity policies let individual teams manage their own access within those limits

**Connection to Mural:** This maps directly to Mural's multi-tenant model. Organization admins set policies for their org (like SCPs). Workspace admins manage their workspace within those limits (like permission boundaries). Individual users have their own permissions within the workspace (like identity policies).

**4. Everything is auditable by design**

Every IAM decision is logged via CloudTrail — who made the request, what policy allowed or denied it, and why. This isn't an afterthought; it's built into the evaluation engine.

**Why enterprises care:** SOC 2, ISO 27001, GDPR compliance all require audit trails. "Show me every access decision for user X in the last 90 days" must be answerable.

#### Common IAM Challenges (that apply to any auth system)

**1. Least privilege is aspirational, not practical**

The principle says "give only the minimum permissions needed." In practice:
- Developers don't know exactly what permissions their app needs upfront. They start with broad access and (theoretically) narrow it down.
- AWS has 15,000+ distinct actions across 300+ services. Knowing the exact set is unrealistic without tooling.
- **Solutions:** AWS Access Analyzer (identifies unused permissions), IAM Access Advisor (shows last-used timestamps per permission), policy generation from CloudTrail logs (see what was actually used, generate a policy for just that).
- **Connection to Mural:** Same challenge — how do you help workspace admins grant appropriate permissions without over-granting? Usage analytics + permission suggestions.

**2. Policy debugging is hard**

When a user gets "Access Denied," figuring out *why* is non-trivial:
- Which policy denied it? Identity policy? Resource policy? SCP? Permission boundary?
- Was it an explicit deny or an implicit deny (no policy matched)?
- Is it a condition that's not met (MFA, IP range, tag mismatch)?
- **Solutions:** IAM Policy Simulator (test a request without executing it), CloudTrail correlation (find the exact evaluation result), structured deny reasons in logs.
- **Connection to MeLi:** We faced the same problem — intermittent auth failures caused by cache staleness. Policy debugging tooling is essential for any auth platform.

**3. Cross-account and cross-tenant access**

In AWS, companies often have multiple accounts. Granting access across accounts (dev → prod, vendor → customer) requires careful role chains and trust policies. Misconfiguration can expose resources to unintended accounts.

**Connection to Mural:** Cross-tenant access = "share a mural with someone outside your organization." The same trust model applies — explicit trust establishment, scoped permissions, audit trail.

**4. Credential management and rotation**

Long-lived credentials (access keys) are a constant security risk. They get committed to git repos, embedded in CI/CD configs, shared via Slack. AWS recommends roles + temporary credentials for everything, but migration from long-lived keys is a slow organizational change.

**Connection to Mural:** API keys, session tokens, OAuth tokens — same problem space. Credential hygiene is a platform responsibility.

**5. Eventual consistency in policy propagation**

IAM policy changes don't take effect immediately — they propagate across AWS's global infrastructure with eventual consistency. This creates a window where:
- A newly granted permission doesn't work yet (user frustration)
- A revoked permission still works briefly (security risk)
- **Mitigation:** Design for eventual consistency. Make the propagation window as short as possible. For critical revocations (deprovisioning, security incidents), have an immediate enforcement mechanism that bypasses the cache.
- **Connection to MeLi:** Exactly the cache staleness issue we faced with the SDKs — we moved from TTL-based to event-driven invalidation to shrink the window.

#### What I'd Say in the Interview

> "AWS IAM was the direct inspiration for MeLi's authorization platform. I studied its architecture deeply — the policy language, the evaluation logic (explicit deny wins), the layered policy system, and the distributed evaluation model. What I took from IAM specifically was: the policy language as the contract between the auth system and consumers, the separation of principals from credentials (roles vs. users), and the principle that evaluation should happen as close to the consumer as possible (which drove our sidecar decision). I also learned from IAM's challenges — least privilege being hard without tooling, policy debugging being essential, and eventual consistency in policy propagation being a real operational issue we had to solve."

---

### Domain Knowledge: Auth & Access Control

Everything a senior engineer should know about the identity and access control domain. Use this to demonstrate you can contribute to Mural's IAM platform from day one — not just as a generalist backend engineer, but as someone who understands the problem space deeply.

#### The Core Problem

Every multi-user application eventually faces the same two questions:
1. **Who is this person?** (Authentication)
2. **What are they allowed to do?** (Authorization)

These sound simple, but at enterprise scale they become some of the hardest problems in software engineering. The reason: auth is a **cross-cutting concern that touches every feature**, it's **security-critical** (a bug means data leaks or unauthorized access), it's **in the critical path** of every request (performance matters), and it must **scale with organizational complexity** (not just traffic).

For a product like Mural — used by 50%+ of Fortune 100 — auth is the foundation that makes enterprise sales possible. No SSO, no SCIM, no fine-grained permissions → no enterprise deal.

#### Authentication: The Hard Parts

Authentication seems solved ("just use OAuth") but the real-world challenges are subtle:

**1. Identity Federation — Who owns the user's identity?**

Enterprise customers don't want their employees creating Mural-specific passwords. They want their existing corporate identity (Okta, Azure AD, Google Workspace) to be the single source of truth. This means:
- **SAML 2.0:** The legacy standard. XML-based, redirect-heavy, but deeply entrenched in enterprise. Every large company has a SAML-capable IdP. Supporting SAML is table stakes for enterprise sales.
- **OIDC (OpenID Connect):** The modern standard. Built on OAuth 2.0, JSON/JWT-based, simpler to implement. Preferred by newer IdPs and SaaS products.
- **The challenge:** Supporting both protocols simultaneously, handling the subtle differences in assertion formats, clock skew tolerance, signature validation, and redirect flows. Each enterprise IdP has its own quirks — Azure AD behaves differently from Okta, which behaves differently from PingFederate.
- **My experience:** At MeLi the auth platform had to integrate with multiple identity sources. At Emi Labs I dealt with enterprise client IdPs for the recruitment platform. The pattern is always the same: abstract the protocol behind a common interface and handle IdP-specific quirks in adapter layers.

**2. Multi-Factor Authentication (MFA) — Balancing security with usability**

- **The tension:** Enterprise security teams want MFA everywhere. Users want frictionless access. The product must satisfy both.
- **MFA methods:** TOTP (Google Authenticator), WebAuthn/FIDO2 (hardware keys, biometrics), SMS (insecure but still required by some), push notifications.
- **Adaptive MFA:** Don't prompt MFA on every login — evaluate risk signals (new device, unusual location, sensitive operation) and only challenge when the risk score exceeds a threshold. This is where auth becomes an ML/heuristics problem.
- **Recovery flows:** What happens when a user loses their MFA device? Recovery codes, admin-assisted reset, backup methods. Each is a potential security hole if not designed carefully.

**3. Session Management — The invisible complexity**

Sessions seem trivial until you handle edge cases at scale:

- **Token strategy:** JWTs (stateless, scalable, but hard to revoke) vs. opaque tokens with server-side sessions (revocable, but need a session store). Many systems use a hybrid: short-lived JWTs for API calls + a server-side session for the web app.
- **Token refresh:** Access tokens expire quickly (15min) to limit damage if stolen. Refresh tokens live longer but must be rotated on every use (rotation prevents replay attacks). Handling the race condition where two tabs refresh simultaneously is a classic bug.
- **Session revocation:** "Show me all active sessions for user X" and "revoke all sessions now" are hard requirements for enterprise admin. With pure JWTs this requires a revocation list (negating some of the stateless benefit). With server-side sessions it's a DB delete.
- **Cross-device sessions:** A user logged in on laptop, phone, and tablet. They change their password → all other sessions must be invalidated. They get deprovisioned via SCIM → all sessions die immediately.
- **Session fixation and hijacking:** The classic attacks. Mitigations: regenerate session ID on login, bind sessions to client fingerprint (IP + user-agent), use secure/httpOnly/sameSite cookie attributes.

**4. User Provisioning (SCIM) — Automating the lifecycle**

SCIM is the protocol that keeps Mural's user database in sync with the enterprise customer's directory:

- **Provisioning:** Employee joins the company → IdP sends SCIM `POST /Users` → Mural creates the account with the right role and workspace.
- **Updates:** Employee changes department → IdP sends SCIM `PATCH /Users/{id}` → Mural updates their group memberships and permissions.
- **Deprovisioning:** Employee leaves → IdP sends SCIM `PATCH /Users/{id}` with `active: false` → Mural deactivates the account, revokes all sessions, removes from shared content where appropriate.
- **The challenge:** SCIM implementations vary wildly across IdPs. Okta's SCIM client behaves differently from Azure AD's. Some send full replacement payloads, others send minimal patches. Some respect the spec, others don't. Robust SCIM implementation means defensive parsing, idempotent operations, and extensive logging for troubleshooting enterprise onboarding issues.
- **Group provisioning:** SCIM also handles groups (`/Groups`). Enterprise customers map their AD groups to Mural roles/workspaces. When a group membership changes in AD, SCIM propagates it to Mural. The mapping logic between "corporate group" and "Mural permission" is product-specific and often the source of enterprise support tickets.

#### Authorization: Models and Trade-offs

Authorization is where the permission model lives. The choice of model determines what "permissions" look like for end users, how easy it is to add new features, and how the system scales.

**1. RBAC (Role-Based Access Control)**

The most common model. Users are assigned roles, roles have permissions.

```
User → Role → Permissions
          │
  "Workspace Admin" → [manage_members, manage_billing, manage_settings, view_all_content]
  "Member"          → [create_murals, edit_own_murals, comment]
  "Guest"           → [view_shared_murals, comment]
```

- **Pros:** Simple to understand, easy to audit ("who has admin access?"), maps well to organizational structure.
- **Cons:** Role explosion — as the product grows, you need more granular roles. "Can edit murals in workspace X but not workspace Y" doesn't fit cleanly into static roles. You end up with "Workspace-X-Editor" and "Workspace-Y-Viewer" — dozens of roles that are hard to manage.
- **Where it works:** Mural likely uses RBAC as the user-facing model (Owner, Admin, Member, Guest). Enterprise customers understand roles.

**2. ABAC (Attribute-Based Access Control)**

Permissions based on attributes of the subject, resource, action, and environment.

```
ALLOW if:
  subject.role == "member"
  AND resource.workspace == subject.workspace
  AND action == "edit"
  AND environment.time IN business_hours    (optional)
```

- **Pros:** Extremely flexible. Can express any permission rule without creating new roles. Handles multi-tenancy naturally ("user can only access resources in their workspace").
- **Cons:** Harder to reason about — "what can user X do?" requires evaluating all policies against all resources. Harder to audit. Performance cost if policies are complex.
- **Where it works:** Under the hood, the permission engine. Even if users see "roles," the internal evaluation may be attribute-based.
- **My experience:** MeLi's auth platform was policy-based (closer to ABAC) — policies with conditions on principals, resources, and actions. The user-facing layer was roles; the engine underneath was attribute evaluation.

**3. ReBAC (Relationship-Based Access Control)**

Permissions based on relationships between objects. Made popular by Google Zanzibar (used by Google Drive, YouTube, etc.).

```
document:budget-2024#viewer@user:melisa         → Melisa can view budget-2024
workspace:design-team#member@user:melisa        → Melisa is a member of design-team
workspace:design-team#parent@org:acme           → design-team belongs to org acme
```

Permission checks traverse the relationship graph: "Can Melisa edit this mural?" → Is Melisa a member of a workspace that contains this mural, with a role that grants edit?

- **Pros:** Models real-world sharing naturally (Google Docs-style). Handles inheritance ("workspace admin → can manage all murals in workspace"). Scales to complex sharing hierarchies.
- **Cons:** Requires a relationship graph store (specialized infrastructure). Evaluation involves graph traversal — performance depends on graph depth. More complex to implement and debug.
- **Where it works:** Products with sharing/collaboration (Google Drive, Notion, Figma — and likely Mural). If Mural has "share this mural with user X" or "share with workspace Y," that's relationship-based access control.
- **Relevance to Mural:** A visual collaboration tool almost certainly has sharing semantics. The permission model likely combines RBAC (workspace roles) with ReBAC (content sharing). Understanding both gives you the vocabulary to discuss Mural's specific model intelligently.

**4. The Hybrid Reality**

No real product uses a pure model. Enterprise SaaS products typically combine:
- **RBAC** for the user-facing permission structure (workspace roles, org-level roles)
- **ABAC** for the policy engine that evaluates permissions (conditions, context)
- **ReBAC** for content sharing and collaboration permissions (share with user/group/workspace)

The art is in designing a system where these layers compose cleanly — the user sees simple roles, the admin sees manageable policies, and the engine evaluates efficiently under the hood.

#### Common Challenges in Enterprise IAM (and how to solve them)

**1. Permission evaluation performance**

- **Problem:** Every API call needs an authorization check. At scale, this is millions of evaluations per second. The permission check can't add meaningful latency.
- **Solutions:**
  - Cache aggressively: user permissions, role definitions, policy evaluation results. Most permissions don't change frequently.
  - Pre-compute permission sets: on role assignment, compute and cache the full set of allowed actions. Evaluation becomes a set lookup instead of policy traversal.
  - Push vs. pull: instead of the app asking "can user X do Y?" on every request, push the user's permission set to the app on login and on changes. The app evaluates locally.
- **My experience:** At MeLi this was the entire challenge — sub-millisecond evaluation in the critical path. SDK caching + sidecar deployment + pre-compiled policies.

**2. Permission inheritance and hierarchy**

- **Problem:** Mural has a hierarchy: Organization → Workspace → Room → Mural. Permissions at a higher level should flow down. An org admin should be able to manage all workspaces without being explicitly added to each one.
- **Solutions:**
  - Define clear inheritance rules: "org admin inherits workspace admin on all workspaces in the org."
  - Implement inheritance at the evaluation engine level, not by duplicating permissions at every level.
  - Allow overrides: "org admin everywhere, except workspace X where they're read-only" (explicit deny overrides inherited allow).
- **The edge cases:** What happens when a user has conflicting permissions at different levels? Explicit deny at workspace level vs. allow at org level. The resolution strategy must be documented and consistent.

**3. The "who has access to what?" audit problem**

- **Problem:** Enterprise security teams need to answer: "List every user who can access document X" or "Show me everything user Y has access to." With complex permission models (inheritance, sharing, group memberships), computing this is non-trivial.
- **Solutions:**
  - Materialized permission views: pre-compute and store the effective permissions. Update them asynchronously when permissions change.
  - Audit log: record every permission grant, revocation, and change. Not just "user X was given admin" but "user X was given admin by user Y at timestamp Z via SCIM sync from Okta."
  - Access review workflows: periodic campaigns where workspace owners review and confirm or revoke access. Required by SOC 2 and many enterprise compliance frameworks.

**4. Tenant isolation in multi-tenant SaaS**

- **Problem:** Company A's data must never be visible to Company B, even if there's a bug in the permission evaluation. This is the single most critical security requirement in enterprise SaaS.
- **Solutions:**
  - Defense in depth: tenant isolation at the application layer (permission checks), at the data layer (tenant ID in every query), and at the infrastructure layer (row-level security in the database).
  - Never rely on a single layer. A bug in the application permission check should still be caught by the database-level tenant filter.
  - Test with adversarial scenarios: "What if a user crafts a request with another tenant's workspace ID?" — the system must reject it at multiple layers.

**5. Balancing security with user experience**

- **Problem:** Security teams want strict controls. Product teams want frictionless experiences. Both are right.
- **Solutions:**
  - Risk-based authentication: low-risk actions (view a mural) → no extra challenge. High-risk actions (invite external user, export data, change billing) → step-up authentication (re-enter password, MFA challenge).
  - Progressive disclosure of admin controls: don't overwhelm workspace admins with 50 settings. Show the essential ones, hide advanced controls behind "Advanced Security Settings."
  - Sensible defaults: new workspaces should be secure by default (e.g., external sharing disabled, MFA encouraged). Admins can relax controls deliberately.
- **My experience:** At UenoBank, the insurance flow had similar tension — security requirements (identity verification, regulatory compliance) vs. user experience (fast policy issuance). The solution was the same: async flows with step-up verification only when the risk level required it.

**6. Backward compatibility when evolving the permission model**

- **Problem:** The permission model evolves as the product grows. Adding a new permission, splitting an existing one, or changing the hierarchy can break existing integrations, scripts, and enterprise configurations.
- **Solutions:**
  - Additive changes only: adding new permissions is safe. Removing or renaming is a migration.
  - Permission aliasing: old permission name maps to the new one during a transition period.
  - Versioned admin APIs: enterprise customers using the admin API shouldn't break when the model evolves.
  - Feature flags for permission changes: roll out to a subset of tenants first, validate, then promote.
- **My experience:** At NocNoc, evolving the seller API while maintaining backward compatibility for existing integrations. Same discipline: additive changes, versioning, feature flags.

#### What I'd Say in the Interview

> "The auth domain is something I've lived in — not just consumed as an API, but designed and built from the evaluation engine up. I understand the trade-offs between RBAC and ABAC, the challenge of making permission evaluation fast in the critical path, and the enterprise requirements like SSO, SCIM, and audit. What I find exciting about Mural's IAM specifically is the collaboration dimension — permission models for shared content (who can view/edit this mural, how does workspace-level access compose with direct sharing) are more interesting than simple CRUD permissions. It's closer to what Google solved with Zanzibar, and I'd love to dig into how Mural approaches it."

---

### Technical Topics the EM Might Probe

#### Authentication vs Authorization

- **Authentication (AuthN):** Verifying identity — "who are you?" (SSO, MFA, SAML, OIDC, passwords, sessions)
- **Authorization (AuthZ):** Verifying permissions — "what can you do?" (RBAC, ABAC, policy evaluation, permission models)
- **My experience covers AuthZ deeply** (MeLi platform) and AuthN tangentially (session management, integration with identity providers)

#### SSO Protocols

- **SAML 2.0:** XML-based, common in enterprise. Identity Provider (IdP) issues assertions to Service Provider (SP). Redirect-based flow.
- **OIDC (OpenID Connect):** OAuth 2.0 extension for authentication. JSON/JWT-based. More modern, used by Google, Microsoft, etc.
- **How they relate to Mural:** Enterprise customers use SSO to log into Mural via their corporate IdP (Okta, Azure AD, etc.). The Admin & IAM team owns this integration.

#### SCIM (System for Cross-domain Identity Management)

- Standard protocol for automating user provisioning/deprovisioning
- Enterprise customer's IdP pushes user lifecycle events (create, update, deactivate) to Mural via SCIM API
- Critical for enterprise: when someone leaves the company, their Mural access must be revoked automatically
- **Connection to my experience:** This is an integration pattern I know well — external system pushing events via API, with validation, error handling, and idempotency

#### RBAC vs ABAC

- **RBAC (Role-Based Access Control):** Permissions assigned to roles, users assigned to roles. Simple, widely understood. "Admins can do X, Members can do Y."
- **ABAC (Attribute-Based Access Control):** Permissions based on attributes of the user, resource, and context. More flexible but more complex. "Users in department X can access resources tagged with Y during business hours."
- **MeLi's platform was closer to ABAC** — policy-based with conditions. Mural likely uses RBAC for the user-facing permission model with potential ABAC elements for fine-grained enterprise controls.

#### Session Management

- How sessions are created, validated, refreshed, and revoked
- Token-based (JWT) vs server-side sessions
- Session fixation, hijacking, and expiration policies
- Multi-device session management
- **Enterprise concern:** "Show me all active sessions for user X" / "Revoke all sessions for user X" — admin control

#### Multi-tenancy in IAM

- Mural serves multiple companies (tenants) on the same platform
- Data isolation: a user from Company A must never see Company B's data
- Permission boundaries: workspace admins can manage their workspace but not others
- **Connection to my experience:** At MeLi, the auth platform had to handle policies across different business units with clear boundaries

---

### EM Interview: Likely Questions & Prepared Answers

**"Tell me about yourself"**
> Use the adapted pitch above (Admin & IAM version).

**"Why Mural? Why this role specifically?"**
> "Two reasons. First, the domain — I've built authorization systems at scale and I know both the technical complexity and the business criticality of getting identity right. It's infrastructure that every feature depends on, and I find that kind of foundational work deeply satisfying. Second, Mural's product resonates with me — I've worked remotely my entire career and I've seen firsthand how collaboration tools shape team effectiveness. Building the identity and admin layer for a product used by over half of Fortune 100 companies is the kind of challenge I'm looking for."

**"Walk me through a system you designed end-to-end"**
> Use the MeLi authorization platform deep dive above, or NocNoc sellers-core depending on what angle they're probing. If they want IAM depth, go MeLi. If they want ownership/initiative, go NocNoc.

**"How do you approach a large, ambiguous technical problem?"**
> "I start by understanding the constraints — who are the users, what are the non-negotiable requirements, what's the timeline. Then I map the problem space: what exists today, what are the gaps, what are the risks. I write a short technical proposal (not a 20-page doc — just enough to align with stakeholders and get feedback before committing to an approach). Then I iterate: build the smallest version that validates the core assumption, get it to production, and evolve from there. At NocNoc, this is exactly how sellers-core was born — I mapped all the existing integrations, identified the common patterns, proposed the centralized layer, and built it incrementally."

**"Tell me about a time you disagreed with a technical decision"**
> UenoBank async architecture story: "The team was building insurance integrations with synchronous HTTP calls. I believed this would create reliability issues. I prepared a short technical document showing failure scenarios and presented it to my lead — not confrontationally, but as 'here's a risk I see and a mitigation.' The lead agreed. We implemented circuit breakers and async patterns. Weeks later, the external provider went down and the system handled it gracefully. The lesson: back your opinion with data and scenarios, not just gut feeling."

**"How do you handle working on a system you didn't build?"**
> "This is something I've done at every job. At NocNoc, I had to deeply understand five independently-built integration services before I could design sellers-core — each with different technologies, no documentation, scattered ownership. My approach: read the code, trace request flows end-to-end, talk to the people who built it (if they're still around), and map the actual behavior vs. the expected behavior. I'm comfortable getting productive in large, existing codebases — that's the reality of this kind of work."

**"How do you use AI in your development workflow?"**
> "I use Claude Code as my primary AI development tool — not just for code completion, but as an engineering partner. I use it for code review, debugging, exploring unfamiliar codebases, and writing tests. I've built MCP servers and custom skills that integrate AI into our team's workflows. I'm deliberate about it: AI is a force multiplier for thinking, not a replacement for it. I always review and understand AI-generated code before shipping it."

**"Where do you see yourself in 2-3 years?"**
> "Growing into a tech lead or staff engineer role. I want to own the technical direction of a platform area, mentor engineers, and drive architectural decisions. I've been doing some of this already — proposing architectures, mentoring juniors, owning systems end-to-end — but I want a role where that's explicitly expected and supported."

---

### Questions to Ask the EM

**About the team:**
- How is the Admin & IAM team structured today? How many engineers?
- What's the current state of the identity platform? Is it a mature system being evolved, or are there greenfield components?
- What's the biggest technical challenge the team is tackling right now?

**About the work:**
- What does the permission model look like today? RBAC, ABAC, something custom?
- How do you handle SSO integrations — SAML, OIDC, both? Any specific challenges with enterprise IdPs?
- How much of the role is backend platform work vs. frontend admin surfaces?
- What does on-call look like for the IAM team?

**About engineering culture:**
- How do technical decisions get made? RFCs, design docs, informal discussions?
- What does the code review process look like?
- How does the team use AI tools in development? Is it encouraged, mandated, or organic?

**About growth:**
- What does the career path look like for a Senior Engineer here? Is there a Staff track?
- What would success look like for this role in the first 6 months?

---

## HR Interview

### Likely Questions & Answers

**Why Mural?**
> I believe in remote collaboration — I've worked remotely my entire career. Mural's mission of fixing broken teamwork resonates with me. The Admin & IAM domain is where I have direct experience (MeLi's auth platform) and it's the kind of critical infrastructure I love building.

**Why are you looking?**
> I want ownership of critical systems in a product-led company with strong engineering culture. I'm looking to grow toward tech leadership, and Mural's scale and complexity offer that path.

**Tell me about yourself**
> Use the adapted pitch above. Close with: "The common thread is building critical infrastructure that other teams depend on — authorization at MeLi, the policy engine at UenoBank, the seller platform at NocNoc. That's what Admin & IAM is at Mural."

**Remote work experience?**
> My entire career has been remote. Started at Southworks working with US clients in English from day one. Cambridge CAE certified (C1). Comfortable leading discussions async and across time zones.

**Salary expectations?**
> Research Mural's range beforehand. Frame as "flexible depending on the full package."

---

## Interview Progress

| Stage | Date | Status | Notes |
|-------|------|--------|-------|
| HR Screen | — | Done | — |
| EM Interview | — | Upcoming | Focus on Admin & IAM, MeLi auth platform deep dive |
| | | | |

<!-- Update this table as you progress through interview rounds -->
