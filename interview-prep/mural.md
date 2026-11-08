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

> "I owned the development of the multi-language SDKs — Java, Go, Python, and Node.js. Each SDK had to:
> - Provide **consistent policy evaluation** across languages while respecting each language's idioms and conventions
> - Handle **local caching of policies** to minimize network calls — policies were fetched and cached, with invalidation on policy changes
> - Support **fallback behavior** — if the central policy service was unreachable, the SDK could evaluate cached policies instead of failing open or failing closed (configurable per application)
>
> I also worked on the **Docker sidecar deployment model** — an alternative where the policy evaluation engine runs as a sidecar container alongside the application. This was critical for latency-sensitive workloads that couldn't afford even the in-process SDK overhead of fetching policies over the network.
>
> For validation, I **designed and ran stress tests** simulating real-world MELI traffic patterns. We identified bottlenecks in the policy evaluation hot path and optimized accordingly — things like pre-compiling policy rules, efficient data structures for policy lookup, and minimizing allocations in the evaluation loop.
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
> "The hardest ones were cache invalidation issues — a policy was updated but the cache in some SDK instances hadn't refreshed yet, causing intermittent authorization failures. Users would get denied access to resources they should have access to. The debugging was tricky because it was non-deterministic and depended on which instance served the request. We improved the cache invalidation mechanism from TTL-based to event-driven (pub/sub notification on policy changes) to reduce the staleness window."

**"How did the sidecar model work? Why not just use the SDK?"**
> "The SDK works well for most applications, but some latency-sensitive services needed the evaluation engine running locally — no network hop at all. The sidecar was a lightweight container running the evaluation engine with a local gRPC interface. The application talks to localhost, the sidecar evaluates the policy. The trade-off was operational complexity (deploying and managing the sidecar) vs. latency reduction. We let each team choose based on their latency budget."

---

### Deep Dive: Multi-Language SDKs & Sidecar Deployment

This section expands on two key architectural decisions from the MeLi authorization platform. Use it to demonstrate depth when the EM probes "how" and "why" beyond the high-level story.

#### Why Multi-Language SDKs?

**The fundamental question: Can't an app in language X just call an SDK written in language Y?**

No — not for this use case. Here's why:

1. **In-process evaluation is the whole point.** The SDK's job is to evaluate authorization policies locally, inside the application's process, without a network call. If a Java app had to call a Python SDK, that call would go over the network (or through some FFI bridge), which defeats the purpose. The latency budget for policy evaluation was sub-millisecond — a network hop to another process adds milliseconds at minimum.

2. **FFI (Foreign Function Interface) is fragile and costly.** You could theoretically embed a Go evaluation engine inside a Java app via CGO/JNI, but:
   - The operational complexity is enormous — cross-compilation, memory management across runtimes, debugging crashes across language boundaries
   - Each language runtime has its own memory model, garbage collector, and threading model. Mixing them creates unpredictable behavior under load.
   - Deployment becomes a nightmare: now every Java app ships with a Go runtime embedded.
   - This approach is used by some projects (e.g., SQLite), but it makes sense for stable, battle-tested C libraries — not for a policy engine that evolves frequently.

3. **Idiomatic integration matters for adoption.** The SDK had to feel native to each language's ecosystem:
   - Java SDK: published to Maven, uses builder pattern, integrates with Spring dependency injection
   - Go SDK: follows Go module conventions, uses functional options pattern, returns errors (no exceptions)
   - Python SDK: pip-installable, Pythonic API with decorators for permission checks
   - Node.js SDK: npm package, async/await, middleware pattern for Express/Fastify
   - If the SDK feels foreign, teams resist adoption. And adoption was critical — this was meant to be the standard auth mechanism for the entire company.

4. **Dependency isolation.** An SDK written in language X that gets imported into a language Y app brings X's entire runtime and dependency tree. A Go binary embedded in a Node.js app introduces libc dependencies, CGO compilation requirements, and a binary that's opaque to Node.js tooling (debugging, profiling, APM agents). Each native SDK keeps the dependency footprint minimal and compatible with the host ecosystem.

**How we ensured consistency across SDKs:**

The risk of multi-language SDKs is behavioral divergence — the same policy evaluating differently in Java vs. Go. We mitigated this with:

- **Language-agnostic test suite:** A shared JSON file defining hundreds of scenarios: (policy + request context → expected allow/deny result). Every SDK ran this exact suite in its own test framework. This was the contract.
- **Shared specification document:** The policy evaluation algorithm was formally specified — the order of rule evaluation, how conflicts resolve (explicit deny wins), how conditions are matched. The spec was the source of truth, SDKs were implementations of it.
- **Cross-SDK integration tests in CI:** On every PR to any SDK, CI ran the full shared test suite across all four languages. A regression in one SDK blocked the release of all SDKs.

**What I'd say in the interview:**

> "We built native SDKs in four languages because the auth evaluation needed to happen in-process — sub-millisecond, no network hop. You can't achieve that by calling a foreign-language SDK. Each SDK had to be idiomatic to its ecosystem so teams would actually adopt it. The hard part wasn't writing four implementations — it was ensuring they all behaved identically. We solved that with a shared, language-agnostic test suite that was the single source of truth for policy evaluation behavior."

---

#### Sidecar Deployment Model

**What is a sidecar?**

A sidecar is a separate container that runs alongside the main application container in the same pod (in Kubernetes) or on the same host. It shares the network namespace with the main container, so communication between them is via `localhost` — effectively zero network latency.

```
┌──────────────────── Pod ────────────────────┐
│                                             │
│  ┌─────────────┐       ┌─────────────────┐  │
│  │  Application │──gRPC──│  Auth Sidecar  │  │
│  │  (any lang)  │  :9090 │  (policy eval) │  │
│  └─────────────┘  local  └───────┬────────┘  │
│                          host    │            │
│                                  │ fetches    │
│                                  ▼ policies   │
│                          ┌──────────────┐     │
│                          │ Central Auth │     │
│                          │   Service    │     │
│                          └──────────────┘     │
└─────────────────────────────────────────────┘
```

**Why a sidecar when we already had native SDKs?**

The SDK and the sidecar solve the same problem (local policy evaluation) but with different trade-offs:

| Dimension | Native SDK | Sidecar |
|-----------|-----------|---------|
| **Latency** | Lowest — in-process, same memory space | Very low — localhost gRPC call (~0.1-0.5ms) |
| **Language coupling** | Requires an SDK for the app's language | Language-agnostic — any app can call gRPC on localhost |
| **Update/rollout** | App team must update their dependency and redeploy | Platform team can update the sidecar independently |
| **Resource isolation** | Shares memory/CPU with the app — a bug in eval could affect the app | Separate container — memory leak in sidecar doesn't crash the app |
| **Adoption friction** | Team must add a dependency, update code, learn the SDK API | Team only needs to make a gRPC call — minimal code change |
| **Debugging** | One process — simpler stack traces | Two processes — need to correlate logs between containers |
| **Versioning** | Each app may be on a different SDK version — fragmentation risk | Platform team controls the version centrally |

**When to recommend each:**

- **SDK** when: the team's language has a mature SDK, they need absolute minimum latency (sub-millisecond), and they're willing to own the dependency lifecycle (updates, testing).
- **Sidecar** when: the team uses a language without an SDK (or a less mature one), they prefer not to manage auth dependencies, or when the platform team needs to push policy evaluation updates without requiring every app team to redeploy. Also when evaluating new authorization features — ship it in the sidecar, let teams opt in, then backport to SDKs once stable.

**The real-world scenario that drove the sidecar decision:**

> "We had teams using languages or frameworks where the SDK wasn't available yet, or where integrating it required significant refactoring. The sidecar gave them auth evaluation immediately — just add a container to your pod and make a localhost gRPC call. No dependency to import, no code changes beyond the API call. It also solved the versioning problem: with SDKs, some teams were stuck on old versions because upgrading required app changes and testing. With the sidecar, the platform team controls the version — we deploy an update and every app using the sidecar gets the new policy evaluation logic on the next pod restart."

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

**The key trade-off to articulate in the interview:**

> "The sidecar adds operational complexity — it's another container to deploy, monitor, and debug. But it decouples the auth platform's release cycle from every application team's release cycle. With SDKs alone, shipping a critical policy evaluation fix means waiting for 50+ teams to update their dependency and redeploy. With the sidecar, we ship it once and it's live everywhere. For a security-critical system like authorization, that deployment independence was worth the operational cost."

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
