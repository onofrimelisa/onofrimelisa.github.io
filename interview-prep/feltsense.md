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
| **TypeScript / Node.js** | Primary stack, 3+ years production | NocNoc (7 Node.js services: public API, BFFs, integrations, admin tools — see Node.js Services section below), Emi Labs |
| **PostgreSQL** | Production use with ACID transactions | Kavak (financial data), UenoBank (policy orchestrator), NocNoc |
| **LLM APIs (Anthropic, OpenAI)** | Daily user of Claude Code (Opus/Sonnet), built MCP servers that call Anthropic API. Built production AI classification system with multiple LLM providers (Bedrock, TypeSafe JEV) | NocNoc (MCP servers + risk platform with multi-provider LLM architecture) |
| **Prompt engineering** | Designed production prompt system for product classification: structured rules as data, confidence rubrics, disambiguation rules, versioning by content hash. Also CLAUDE.md design, few-shot patterns | NocNoc (risk platform prompt architecture + skills with complex system prompts) |
| **AI coding agents** | Claude Code as primary development tool daily. Built custom skills and hooks that extend agent behavior | Current daily workflow |
| **Multi-agent orchestration** | Built skills that dispatch parallel subagents, coordinate independent tasks, and aggregate results | NocNoc (superpowers skills: parallel agents, plan execution, subagent-driven development) |
| **Structured outputs (Zod)** | Zod for runtime validation in TypeScript services. Built structured JSON output contracts for LLM responses with repair parsing for malformed outputs | NocNoc (API validation + risk platform structured LLM output contracts) |
| **Background jobs / Pub-Sub** | SQS queues, async orchestration, DLQ patterns, event-driven architecture | NocNoc (sellers-core → product-information → amz-wrapper, file-integration-service, shopify sync), UenoBank (async policy issuance) |
| **GCP** | AWS-focused (certified Cloud Practitioner), but cloud-native patterns transfer: containerized services, managed queues, IAM | All roles (AWS), patterns are cloud-agnostic |
| **Self-improving agent systems** | Built feedback loops where agent output is evaluated and used to improve subsequent runs. Risk platform has a full evaluation pipeline: labeled sets, threshold grid search, confusion analysis → rules refined based on model errors | NocNoc (skills with evaluation checkpoints + risk platform eval-driven prompt refinement) |

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

### AI-Powered Product Classification — NocNoc Risk Platform (Prohibited Products Detection)

**Connection:** This is the most directly relevant experience for Feltsense. I built a production AI system that uses LLMs to classify e-commerce products into risk categories — involving prompt engineering, model selection, cost optimization, structured outputs, evaluation pipelines, and multi-provider architecture. This is exactly the kind of AI-backend engineering Feltsense needs.

#### The Problem

NocNoc is a cross-border marketplace. Different markets (countries) have different regulations on what products can be sold. Account Health (the compliance team) maintains 54 risk families (weapons, drugs, medical devices, live animals, tobacco, etc.) with 140+ patterns describing how prohibited products hide behind euphemisms, unexpected categories, and evasion tactics. The catalog has hundreds of thousands of products that need to be screened.

Previously this was done manually — unsustainable at scale. We needed an automated system that could classify every product in the catalog against these 54 families, with high accuracy, at manageable cost.

#### The Architecture

```
1. EXTRACT     →  Pull product catalog from Athena data lake into SQLite
                   (title, brand, description, categories per product)

2. PRE-FILTER  →  Keyword scan: regex patterns from Account Health's rules
                   run against every product. Hits are stored and optionally
                   passed to the model as "hints" (leads for the model to
                   investigate)

3. CLASSIFY    →  Send products to the LLM provider for classification.
                   Two providers behind a common interface:
                   ├── Bedrock (Qwen 3 Next 80B) — prompt-based, batch mode
                   └── TypeSafe JEV — typed Choice question, single product

4. ROUTE       →  Based on confidence thresholds, route results to:
                   ├── FINAL (high confidence) → automated action
                   ├── PASS 2 (ambiguous) → deeper review (deprecated: JEV alone performs best)
                   └── DISCARD (low confidence / errors)

5. DELIVER     →  CSV output with: product ID, family, confidence (0-100),
                   trigger (exact words that decided it), reason, alt_family
```

#### Prompt Design — How We Instructed the Model

**The core challenge:** The model needs to understand 54 risk families, each with nuanced boundaries ("a butterfly knife trainer IS a weapon, but a knife-shaped letter opener is NOT"), evasion patterns ("sellers use 'voucher', 'culture', 'for research use only' to disguise prohibited products"), and cross-family disambiguation ("nicotine patches are Tobacco, not Medicine, even when sold as quit-smoking aids").

**Prompt architecture (for Qwen / Bedrock):**

The prompt is a structured system prompt (`pass1_reader.md`) with dynamic sections rendered at runtime:

1. **Role definition:** "You screen e-commerce listings for products that belong to restricted families. Your job is to say WHAT THE PRODUCT IS, not whether it is legal."

2. **General rules** (`pass1_rules.json` → `general`): Cross-cutting classification rules that apply to all families:
   - "Judge the thing actually shipped — a cage is not an animal, a holster is not a weapon"
   - "Title wins over description when they contradict"
   - "Categories are often wrong — never trust the category alone"
   - "Products hide behind euphemisms, counts instead of names, misspellings"

3. **Confidence rubric** (`confidence_rubric.md`): A calibrated scale so the model's confidence numbers are consistent and meaningful:
   - 90-100: text explicitly names something of the family
   - 70-89: almost sure but one detail is missing
   - 50-69: ambiguous (accessory, look-alike, toy)
   - Below 50: probably does not belong

4. **Pattern library** (rendered from `shared/families.json`): Each of the 54 families with:
   - What it covers (in Spanish, exactly as Account Health wrote it — source of truth)
   - Patterns: how products in this family hide (concepts, categories they appear in, brand signals, evasion tactics, known false positives)
   - Family-specific rules that settle boundary ambiguities between families

5. **Family rules** (`pass1_rules.json` → `family`): Disambiguation rules for overlapping families:
   - "Nicotine patches → Tobacco, not Medicine"
   - "Butterfly knife trainers → Knives, even with 'cosplay'"
   - "Bullion bars → Precious metals; replica money → Money"
   - "Test strips for pools → NOT home test kits; tests on human samples → YES"

6. **Structured output contract:** The model must return a JSON array with exact fields: `id`, `family`, `confidence` (0-100), `trigger` (exact words copied from the text), `why` (up to 20 words), `alt_family`.

**Key prompt engineering decisions:**

- **Rules as data, not code:** All family descriptions, patterns, and rules live in JSON files maintained by the Account Health team. No family text is hardcoded in the codebase. A change to a rule takes effect on the next run with no code change.
- **Versioning by content hash:** `prompt_version` = hash of the rendered prompt. `rules_version` = hash of `families.json`. Both are written into every output row, so a run made with different rules is never confused with another.
- **Keyword hints (A/B testable):** Regex hits from the pre-filter can be passed to the model as "leads" with `--keyword-hints`, so we can measure whether giving the model hints improves or hurts accuracy.

#### The JEV Provider — Structured Classification Without Prompts

**What is JEV (TypeSafe System One):** A specialized classification API that doesn't take a prompt — it takes typed Choice questions. Instead of asking the model to read a prompt and produce JSON, you define the question, the options (54 families + None), and the criteria for each option. JEV returns a probability distribution across all options.

**Why JEV outperformed prompt-based classification:**

- **No JSON parsing failures.** With Qwen, the model sometimes returns malformed JSON (missing commas, unterminated strings, truncated output). We built a repair parser (`parse.py`), but some responses were unrecoverable. JEV returns structured data by design — the output format is guaranteed by the API.
- **Probability distribution.** JEV doesn't just say "this is Weapons" — it gives the probability for every family. Confidence = probability of the top choice x 100. This enables threshold-based routing without relying on the model's self-reported confidence (which is often uncalibrated in prompt-based models).
- **Two-stage optimization.** Step 1 asks a cheap "screening" question (just family names, no details — 1/14th of the tokens). Products that screen clearly as None (probability >= 0.98) are done. Only ambiguous products get the full question (step 2 with all the patterns and rules). Result: 59% fewer input tokens, same accuracy.

**How the request is built:**

```python
# Each family becomes a Choice option with its criteria
criteria = {
    "Weapons & ammunition": {
        "covers": "Armas de fuego, municiones...",   # Account Health's text
        "patterns": [                                 # How they hide
            {"concept": "...", "hides_in": "...", "evasion": "..."}
        ],
        "rules": ["Night-vision optics are Weapons..."]  # Disambiguation
    },
    # ... 53 more families
    "None": {"covers": "The product belongs to no restricted family."}
}
```

#### Cost Optimization

This was critical — classifying hundreds of thousands of products with expensive models is not viable.

| Model | Cost (input per 1M tokens) | Cost (output per 1M tokens) | Use case |
|-------|---------------------------|----------------------------|----------|
| **TypeSafe JEV** | $0.042 | $0.00 (output not billed) | Best accuracy, cheapest. Production choice |
| **Qwen 3 Next 80B** (Bedrock) | $0.14 (batch: $0.07) | $1.20 (batch: $0.60) | Prompt-based fallback, batch mode for full catalog |
| **Amazon Nova Micro** | $0.035 | $0.14 | Cheapest Bedrock option, lower accuracy |
| **Claude Haiku 4.5** | $1.10 | $5.50 | Too expensive for this use case at catalog scale |

**Cost optimization strategies we applied:**

1. **Model selection for the task:** We evaluated 7+ models and picked JEV — not the most well-known, but the best combination of accuracy, structured output, and cost. Claude Haiku would have been 26x more expensive on input tokens alone.
2. **Two-stage classification:** JEV's screen question uses 1/14th of the tokens. 66% of products are classified in step 1 (clear None). Only 34% need the full question. Net saving: ~59% of input tokens.
3. **Batch mode on Bedrock:** For the Qwen provider, Bedrock batch pricing is 50% cheaper than on-demand. Full catalog runs use batch mode via S3.
4. **No unnecessary output tokens:** For products classified as None, the model returns minimal JSON (just id, family, confidence) — no trigger, no why. This saves output tokens on the majority of products.
5. **Keyword pre-filter:** The regex scan is free (runs locally). Products with zero keyword hits and high None confidence from the screen step don't need the expensive full classification.

#### Evaluation and Quality

**How we measure accuracy:**

- **Labeled evaluation sets:** Account Health labels products manually. `pass1 evaluate` compares model output against labels: precision, recall, F1 per family, confusion matrix.
- **Threshold grid search:** `pass1 evaluate --grid` tries different routing thresholds without calling the model — finds the optimal confidence cutoffs for routing decisions.
- **Prompt versioning:** Every run records the exact prompt and rules versions. When accuracy changes, we can trace it to a specific prompt or rule change.
- **Alt-family analysis:** The model provides a second-best guess (`alt_family`). When the model is wrong, the alt-family is often the correct answer — this tells us which families are commonly confused and where rules need refinement.

#### What I'd Say in the Interview

> "At NocNoc I built a production AI classification system that screens the entire product catalog against 54 risk families for prohibited products. The system uses two LLM providers behind a common interface — TypeSafe JEV for structured classification with probability distributions, and Qwen on Bedrock for prompt-based batch processing. The prompt is engineered as a rule system: 54 family descriptions with patterns and disambiguation rules, all maintained as data files by the compliance team — no family text is hardcoded. I optimized costs with a two-stage classification (59% fewer tokens), model selection (JEV at $0.042/M tokens vs. Claude Haiku at $1.10/M), and batch processing. The system has a full evaluation pipeline: labeled test sets, threshold grid search, prompt versioning by content hash, and confusion analysis. This is the kind of AI-backend system I'd be building at Feltsense — structured AI decisions at scale, with cost discipline, evaluation rigor, and production reliability."

---

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

## Node.js Services — NocNoc Production Experience

> Reference for when asked about hands-on Node.js/TypeScript experience. All services below run in production at NocNoc.

**Note:** sellers-core (the core orchestrator) is Java. The Node.js ecosystem surrounds it — APIs, BFFs, integrations, and internal tools.

| Service | Framework | What it does | Key tech |
|---------|-----------|-------------|----------|
| **sc-api** | NestJS | Seller-facing REST API (BFF). The main interface sellers interact with — routes requests to sellers-core and other backend services | NestJS, Sentry, REST |
| **manager-api** | NestJS | Internal platform management API. Used by ops and support teams to manage sellers, products, and platform operations | NestJS, OpenTelemetry, Sentry |
| **file-integration-service** | NestJS | File import/export processing. Handles bulk operations via file uploads (CSV/Excel), SFTP/FTP integrations with external channels | NestJS, MySQL/TypeORM, AWS SQS, SFTP/FTP |
| **shopify** | NestJS | Shopify product sync integration. Keeps NocNoc catalog in sync with Shopify stores — handles product create/update/delete events | NestJS, MySQL/TypeORM, AWS SQS |
| **shopify-channel-app-frontend** | React 18 + Vite | Shopify app frontend. The UI sellers see inside Shopify to connect their store with NocNoc | React 18, Vite, Shopify Polaris |
| **sellers-admin-tools** | NestJS v10 | Internal admin tool for bulk seller operations. Used by ops for tasks that need direct data manipulation | NestJS v10, MariaDB |
| **sellers-tools** | Next.js 14 | Internal dashboard for ops/support. Provides visibility into seller operations, product status, and troubleshooting tools | Next.js 14, Tailwind, Radix UI, Zod |

**Patterns across these services:**
- **NestJS dominance:** 5 of 7 services use NestJS — modules, dependency injection, decorators, guards, interceptors
- **TypeORM for persistence:** Multiple services use TypeORM with MySQL/MariaDB
- **Event-driven integration:** SQS queues connect services (file-integration-service and shopify consume async events)
- **Observability:** OpenTelemetry and Sentry across services
- **Internal tooling:** 2 services (sellers-tools, sellers-admin-tools) are internal tools — shows experience building ops/support interfaces, not just customer-facing APIs

**What to say in the interview:**

> "At NocNoc I work with 7 Node.js/TypeScript services in production — from seller-facing BFFs and API gateways to async file processing services and Shopify integrations. Most are built with NestJS, so I'm very comfortable with its module system, dependency injection, and decorator-based patterns. I've also built internal tools with Next.js 14 and React. The Java core service (sellers-core) orchestrates the domain logic, but everything around it — the APIs sellers interact with, the integration layer, the admin tools — is TypeScript/Node.js."

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
