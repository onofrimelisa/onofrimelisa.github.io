# Feltsense — Interview Prep

> Everything related to the Feltsense interview process. Updated as we progress through each stage.

---

## About the Company

### What Feltsense Does (plain language)

Feltsense builds **autonomous AI agents that act as founders** — they don't just write code, they identify business opportunities, validate them with real market data, build products, launch them, acquire customers, and iterate. The vision is a "fleet of AI founders" running in parallel, each one testing a different business idea.

Think of it as: instead of a human founder going through the cycle of "idea → validate → build → launch → iterate," Feltsense's agents do that loop autonomously, at scale, in parallel.

### How the System Works

```
1. DISCOVER   → Agents scan real-time market signals for B2C opportunities
2. VALIDATE   → Agents run live ad tests to measure actual demand (not speculation)
3. BUILD      → Agents develop the product: code, landing pages, payment infrastructure
4. LAUNCH     → Agents handle customer acquisition and go-to-market
5. MONITOR    → Agents track performance, revenue, and iterate based on data
6. HUMAN-IN-THE-LOOP → Humans handle what agents can't: regulatory compliance,
                        account verification, legal. Workers are hired on-demand,
                        paid by the minute, scoped to specific tasks.
```

### Core Philosophy

- **Signal over speculation:** They don't guess what will work — they test with real ads and real money before committing to building.
- **Founders by the fleet:** Not one agent, many. Parallel experimentation at scale.
- **Guardrails by design:** Agents operate within constraints — resilient systems for fleet-scale operations.
- **New asset class:** They're treating company creation itself as a repeatable, scalable process with unit economics.

### Current Product

**Gutcheck** — A product diligence tool for builders and investors. This is their first agent-built application shipping to real customers.

### Funding & Backers

- **$5.1M raised**
- Backed by: Draper, Precursor, Liquid2, Matt Schlicht (Moltbook founder), founders of Crunchbase and Republic
- Small team, San Francisco + remote (Argentina)

### What Makes This Company Interesting (and risky)

**Interesting:**
- Bleeding-edge AI-native company — agents are the core product, not a feature bolted on
- The problem is genuinely novel: autonomous business creation, not just AI-assisted coding
- Multi-agent orchestration at production scale is one of the hardest problems in AI engineering right now
- Tiny team, huge ambition — high ownership, high impact per engineer

**Risks to be aware of:**
- Very early stage ($5.1M, small team) — runway depends on burn rate
- The "autonomous founder" vision is extremely ambitious — product-market fit is unproven
- Regulatory and ethical complexity of AI agents making business decisions autonomously
- Heavy dependence on LLM providers (Anthropic, OpenAI, Gemini) — costs, rate limits, model changes can break things

---

## Position: AI Engineer

**What the role actually is:** Hands-on technical leadership building the autonomous agent platform. You're not just writing prompts — you're architecting multi-agent systems, building the orchestration infrastructure, and establishing engineering practices for a team.

**Responsibilities:**
- Architect system infrastructure and make critical technical decisions
- Design and build multi-agent orchestration systems for product development workflows
- Develop self-improving agent harnesses with feedback loops and evaluation mechanisms
- Build AI-powered backend services using Anthropic, OpenAI, and Gemini APIs
- Write production code for agent runtime and orchestration
- Debug and optimize AI behavior via prompt engineering and structured outputs
- Translate complex technical problems into actionable milestones
- Establish engineering standards (code reviews, testing, observability, releases)
- Lead and mentor engineering teams while staying hands-on

**Requirements:**
- 4+ years professional software engineering
- Technical leadership at early-stage companies
- Shipped multi-agent systems and orchestration frameworks to production
- Self-improving / self-evolving agent systems
- Strong backend engineering (APIs, services, data flows)
- LLM expertise: prompt engineering, model config, structured outputs, embeddings, retrieval, evaluation
- Daily hands-on experience with AI coding agents (Claude Code, Cursor, Codex)

**Nice-to-have:**
- TypeScript and Node.js
- Vercel AI SDK, Claude Agent SDK, or custom agent runtimes
- PostgreSQL, Supabase, pgvector
- Background job systems (Inngest, Pub/Sub)
- Zod, Vitest, GCP Cloud Run
- AI evaluation, safety, and observability

**Compensation:** $60K-$110K + offsites + US holidays

---

## Profile Match — Technology by Technology

### Stack Match

| Their tech | My experience | Where I used it |
|------------|---------------|-----------------|
| **TypeScript / Node.js** | Primary stack, 3+ years production | NocNoc (sellers-core, public API, all seller services), Emi Labs |
| **PostgreSQL** | Production use with ACID transactions | Kavak (financial data), UenoBank (policy orchestrator), NocNoc |
| **LLM APIs (Anthropic, OpenAI)** | Daily user of Claude Code (Opus/Sonnet), built MCP servers that call Anthropic API | NocNoc (built MCP servers, skills, hooks for team workflows) |
| **Prompt engineering** | System prompts, structured outputs, CLAUDE.md design, few-shot patterns | NocNoc (production skills with complex system prompts, agent orchestration) |
| **AI coding agents** | Claude Code as primary development tool daily. Built custom skills and hooks that extend agent behavior | Current daily workflow |
| **Multi-agent orchestration** | Built skills that dispatch parallel subagents, coordinate independent tasks, and aggregate results | NocNoc (superpowers skills: parallel agents, plan execution, subagent-driven development) |
| **Structured outputs (Zod)** | Zod for runtime validation in TypeScript services | NocNoc (API validation, request/response schemas) |
| **Background jobs / Pub-Sub** | SQS queues, async orchestration, DLQ patterns, event-driven architecture | NocNoc (sellers-core → product-information → amz-wrapper), UenoBank (async policy issuance) |
| **GCP** | AWS-focused (certified Cloud Practitioner), but cloud-native patterns transfer: containerized services, managed queues, IAM | All roles (AWS), patterns are cloud-agnostic |
| **Self-improving agent systems** | Built feedback loops where agent output is evaluated and used to improve subsequent runs | NocNoc (skills with evaluation checkpoints, verification-before-completion patterns) |

### Gaps to Acknowledge Honestly

| Their tech | My level | How to frame it |
|------------|----------|-----------------|
| **Vercel AI SDK / Claude Agent SDK** | Haven't used directly | "I haven't used the Vercel AI SDK specifically, but I understand the patterns — streaming responses, tool use, multi-step agents. I've built custom agent runtimes with Claude Code skills that do the same things: tool dispatch, parallel execution, structured outputs. The SDK is the interface; I know the underlying concepts." |
| **pgvector / embeddings / retrieval** | Conceptual knowledge, no production use | "I understand vector embeddings and similarity search conceptually — how they're used for RAG, semantic search, and context retrieval. I haven't built a production pgvector pipeline, but I've worked extensively with PostgreSQL and the vector extension is a natural addition to that experience." |
| **Supabase** | Haven't used | "Supabase is a managed Postgres + auth + realtime layer. I've built each of those components separately (Postgres at Kavak/UenoBank, auth at MeLi, realtime events at NocNoc). Supabase wraps them in a developer-friendly package — low learning curve." |
| **Inngest** | Haven't used | "Inngest is a background job orchestration framework — durable workflows, retry logic, step functions. I've built the same patterns manually with SQS + DLQ + saga orchestration at NocNoc. Inngest just provides a higher-level abstraction for it." |
| **Vitest** | Haven't used directly | "Vitest is a Vite-native test runner — fast, compatible with Jest API. I've written extensive tests in Jest/Mocha for Node.js services. Migration to Vitest is trivial." |

---

## Adapted Pitch (for Feltsense)

> I'm Melisa, a Senior Software Engineer with 6+ years of experience building production backend systems. What makes me relevant for Feltsense specifically is the intersection of two things: I have deep backend engineering experience — distributed systems, async orchestration, multi-service architectures — and I've been building AI-powered development workflows in production. At NocNoc I built MCP servers, custom skills, and multi-agent orchestration patterns that my team uses daily. I designed systems where agents dispatch parallel subagents, coordinate independent tasks, verify their own output, and improve through feedback loops. Before that, I built platform-level infrastructure at Mercado Libre, resilient integration systems at UenoBank, and enterprise integrations at Emi Labs. The thread across my career is building systems that orchestrate complex, multi-step workflows reliably — and that's exactly what Feltsense's agent platform needs at its core.

---

## Experience Mapped to Feltsense's Needs

### Multi-Agent Orchestration — NocNoc Skills & Workflows

**Connection:** Feltsense builds multi-agent systems that orchestrate product development workflows. I've built multi-agent orchestration in production.

> "At NocNoc, I built a skills system where a primary agent can dispatch parallel subagents to work on independent tasks simultaneously. Each subagent has its own context, tools, and execution scope. The orchestrator coordinates them, aggregates results, and handles failures. I also built evaluation and verification patterns — agents check their own work before claiming completion, with structured checkpoints that validate output quality. This is the same core problem Feltsense is solving at a larger scale: how do you coordinate multiple autonomous agents working on a complex, multi-step workflow, ensure quality, and handle failures gracefully?"

**Technical details to mention:**
- Parallel agent dispatch with independent contexts (no shared state contamination)
- Structured output validation (agents produce typed results, not free-form text)
- Feedback loops: verification skills that evaluate agent output and trigger re-execution if quality thresholds aren't met
- Plan → execute → verify cycle with checkpoints

### Async Orchestration & Saga Patterns — NocNoc sellers-core

**Connection:** Feltsense's agents run multi-step workflows (discover → validate → build → launch). This is a distributed workflow orchestration problem — same as sellers-core.

> "sellers-core orchestrates multi-step product creation workflows across 5 different input channels. It uses the saga pattern with compensating transactions — if any step fails, previous steps are rolled back. The workflow has a state machine (PENDING → SUCCESS / FAILED / ERROR), async communication via SQS, and dead-letter queues for failures. This maps directly to what Feltsense's agents need: a durable workflow engine that can handle multi-step processes with failures, retries, and rollback."

**Technical details to mention:**
- Saga orchestration (not choreography) — single source of truth for workflow state
- State machine for lifecycle tracking
- DLQ + alerting for failed steps
- Idempotent operations for safe retries

### Resilient External Integrations — UenoBank & Emi Labs

**Connection:** Feltsense's agents call Anthropic, OpenAI, and Gemini APIs — external services with rate limits, downtime, and variable latency. This is the same problem I solved with external providers.

> "At UenoBank, I built the insurance policy orchestrator with circuit breaker and retry patterns on external provider calls. At NocNoc, I solved the Amazon API rate limiting problem by evolving from reactive throttling to pull-based rate control. Feltsense's agent platform will face the same challenges with LLM APIs: rate limits (especially Anthropic's), variable response times, model degradation, and cost management. I've designed systems that handle all of these gracefully."

**Technical details to mention:**
- Circuit breaker for LLM API outages
- Rate limiting strategies (token bucket, pull-based consumption)
- Cost optimization (right model for right task — Haiku for simple, Opus for complex)
- Fallback between providers (if Anthropic is down, route to OpenAI)

### Prompt Engineering & Structured Outputs — NocNoc AI Workflows

**Connection:** Feltsense needs engineers who can debug and optimize AI behavior, not just call APIs.

> "I've built production prompt systems — not one-off chat prompts, but versioned, reviewed system prompts that drive agent behavior consistently. I design prompts as engineering artifacts: they go through code review, they're tested, and they evolve. I understand structured outputs (Zod schemas for runtime validation), temperature tuning, and how to debug when an agent produces unexpected behavior — tracing through the prompt, the context, and the model's reasoning to find where it went wrong."

**Technical details to mention:**
- CLAUDE.md as persistent context that shapes agent behavior across sessions
- Skills as modular, reusable prompt units with structured inputs/outputs
- Hooks for enforcing constraints on agent behavior (guardrails)
- Evaluation patterns: verifying agent output against expected quality before accepting

### Platform Infrastructure & Technical Leadership — All Roles

**Connection:** The role requires hands-on technical leadership, not just coding.

> "At every role I've had increasing ownership: at MeLi I was promoted while building a platform used by every application. At UenoBank I architected the core policy engine. At NocNoc I proposed and built sellers-core from scratch, established observability practices, and mentored teammates. I've always been the person who identifies what needs to be built, proposes the architecture, builds it, and owns it in production. That's the founding-engineer mentality Feltsense needs."

---

## Questions to Ask

**About the product:**
- How many agents are running in parallel today? What's the scale you're targeting?
- What does the agent evaluation/feedback loop look like? How do you measure agent quality?
- How do you handle the "guardrails" — what can an agent NOT do autonomously?

**About the architecture:**
- What does the current agent orchestration stack look like? Is it a custom runtime or built on an existing framework?
- How do you manage cost across Anthropic/OpenAI/Gemini? Do agents choose which model to use?
- What's the biggest technical bottleneck right now?

**About the team:**
- How big is the engineering team today? What's the target in 6 months?
- How do you balance speed (ship fast, early stage) with reliability (agents making real business decisions)?
- What does on-call / incident response look like when an agent does something unexpected?

**About the role:**
- What does success look like in the first 3 months?
- How much of the role is building new agent capabilities vs. improving the orchestration infrastructure?
- What's the most interesting unsolved problem the team is working on right now?

---

## Interview Progress

| Stage | Date | Status | Notes |
|-------|------|--------|-------|
| Initial call | — | Upcoming | — |
| | | | |

<!-- Update this table as you progress through interview rounds -->
