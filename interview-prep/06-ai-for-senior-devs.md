# AI Concepts for Senior Developers

> What a senior developer should know about AI-assisted development — not just that they use it, but that they understand how to use it effectively and apply best practices. Covers the tools, patterns, and mental models that separate someone who "uses Copilot" from someone who drives real engineering productivity with AI.

---

## Core Concepts

### LLMs (Large Language Models)

The foundation of AI coding tools. Transformer-based models trained on massive text corpora that predict the next token. Key things to understand:

- **Context window:** The amount of text the model can "see" at once (e.g., 200K tokens for Claude). Determines how much code/docs you can feed in a single interaction. Managing context efficiently is critical for getting good results.
- **Tokens vs. characters:** Models process tokens (roughly 3/4 of a word). Costs and limits are measured in tokens, not characters.
- **Temperature:** Controls randomness. Low temperature = deterministic/predictable, high temperature = creative/varied. For code generation you usually want low temperature.
- **Reasoning models vs. standard models:** Some models (like Claude with extended thinking) allocate compute to "think" before responding. Better for complex multi-step problems, architecture decisions, and debugging. Standard models are faster for simple completions.

**Why it matters for a senior dev:** Understanding the model's limitations (hallucinations, context limits, training cutoff) lets you design better prompts and workflows. You know when to trust the output and when to verify.

### Prompt Engineering

The practice of structuring inputs to get better outputs from LLMs. Not just "asking nicely" — it's a repeatable engineering discipline:

- **System prompts:** Instructions that set the model's behavior for an entire session. Define role, constraints, and output format.
- **Few-shot examples:** Providing 2-3 examples of desired input/output pairs to guide the model's pattern matching.
- **Chain of thought:** Asking the model to reason step-by-step before giving an answer. Dramatically improves accuracy on complex tasks.
- **Structured output:** Requesting JSON, YAML, or specific formats so outputs are machine-parseable and consistent.

**Best practice:** Treat prompts like code — version them, review them, iterate on them. A well-crafted system prompt is a reusable engineering asset.

### AI Agents

Autonomous systems where an LLM decides which actions to take, executes them via tools, observes results, and iterates. The key difference vs. a chatbot: agents have a tool loop.

```
User goal --> LLM plans --> calls tool --> observes result --> plans next step --> ... --> done
```

- **Tool use:** The model can call functions (read files, run commands, search code, call APIs). This is what makes agents powerful — they can act, not just talk.
- **Agentic loop:** The cycle of plan-act-observe-repeat that lets agents solve multi-step problems autonomously.
- **Guardrails:** Constraints on what the agent can do (permission systems, sandboxing, confirmation prompts for destructive actions). Critical for safety and trust.

**Real-world example:** Claude Code is an AI agent — it reads your codebase, edits files, runs tests, and iterates until the task is done.

### MCP (Model Context Protocol)

An open standard (created by Anthropic) that lets AI models connect to external tools and data sources through a unified protocol. Think of it as "USB-C for AI" — one protocol, many integrations.

- **MCP Servers:** Services that expose tools and resources (e.g., a Grafana MCP server exposes dashboards, queries, alerts).
- **MCP Clients:** The AI application that connects to servers and uses their tools (e.g., Claude Code, Claude Desktop).
- **Tools:** Actions the model can take through an MCP server (e.g., `search_dashboards`, `query_prometheus`, `create_incident`).
- **Resources:** Data the model can read from an MCP server (e.g., database schemas, documentation).

**Why it matters:** MCP eliminates the N x M integration problem. Instead of every AI tool building custom integrations with every service, both sides implement the MCP protocol and interoperate. A senior dev should know how to configure MCP servers, build custom ones for internal tools, and understand the security implications (tool permissions, data exposure).

**Architecture:**
```
Claude Code ──MCP──> Grafana Server ──> Grafana API
            ──MCP──> Notion Server  ──> Notion API
            ──MCP──> Custom Server  ──> Internal tools
```

### Hooks

Event-driven scripts that execute automatically in response to AI agent actions. They extend agent behavior without modifying the agent itself.

- **Pre-hooks:** Run before a tool executes. Can validate, modify, or block the action (e.g., prevent commits to main, enforce naming conventions).
- **Post-hooks:** Run after a tool executes. Can process results, trigger side effects, or log actions (e.g., auto-format after file edits).
- **Use cases:** Enforcing team conventions, adding guardrails, integrating with internal workflows, auditing agent actions.

**Why it matters:** Hooks let you customize AI agent behavior to match your team's practices without forking the tool. They're the equivalent of git hooks but for AI actions.

### Skills

Reusable, structured prompts that encode workflows, best practices, and domain knowledge for AI agents. A skill is a prompt template that gets loaded when relevant.

- **Rigid skills:** Must be followed exactly (e.g., TDD workflow, debugging protocol). Encode discipline.
- **Flexible skills:** Provide principles to adapt (e.g., design patterns, code review guidelines). Encode knowledge.
- **Skill discovery:** The agent identifies which skills apply to the current task and loads them automatically.

**Why it matters:** Skills capture institutional knowledge in a format AI agents can use. Instead of every developer writing the same prompt, you write a skill once and the whole team benefits. They're version-controlled, reviewable, and composable.

### Spec-Driven Development

A methodology where you write a detailed specification before any code, then use AI to implement it. The spec becomes the source of truth for the AI agent.

**Workflow:**
1. **Write the spec:** Define what you want — inputs, outputs, constraints, edge cases, architecture decisions. Be explicit.
2. **AI generates a plan:** The agent reads the spec and produces an implementation plan.
3. **Review the plan:** You validate the approach before any code is written.
4. **AI implements:** The agent follows the plan, writing code, tests, and documentation.
5. **Verify against spec:** Confirm the implementation matches the specification.

**Why it matters:** It shifts the developer's role from "writing code" to "defining intent precisely." A well-written spec gets dramatically better AI output than vague instructions. The spec also serves as documentation and a contract for the feature.

**Best practice:** The spec should be detailed enough that a junior developer (or an AI agent) could implement it without asking questions. If you need to clarify during implementation, the spec was incomplete.

### Vibe Coding

A term coined by Andrej Karpathy describing a style of coding where you describe what you want in natural language and let AI generate the implementation, iterating conversationally until it works.

- **When it works:** Prototyping, exploratory coding, throwaway scripts, learning new APIs, scaffolding.
- **When it doesn't:** Production systems, security-sensitive code, performance-critical paths, complex business logic with edge cases.
- **The risk:** Accepting code you don't fully understand. A senior dev should always review AI-generated code with the same rigor as a PR from a junior developer.

**Senior dev perspective:** Vibe coding is useful for speed but dangerous without discipline. The best approach combines vibe coding's speed with spec-driven development's rigor — use natural language for the "what," but maintain engineering standards for the "how."

---

## AI-Assisted Development Patterns

### Context Management

The most important skill in AI-assisted development. The quality of AI output is directly proportional to the quality of context you provide.

- **CLAUDE.md / Project docs:** A file at the project root that gives the AI agent persistent context about your project — architecture, conventions, key files, common commands. Loaded automatically every session.
- **Focused context:** Feed the model only what's relevant. A 200K context window is big but not infinite — irrelevant context dilutes quality.
- **Codebase indexing:** Use tools that let the AI search and explore your codebase rather than dumping everything into context.

**Best practice:** Maintain a CLAUDE.md (or equivalent) in every project. Keep it concise, accurate, and updated. It's the highest-ROI investment in AI-assisted development.

### Human-in-the-Loop

The pattern where AI proposes and humans approve. Critical for trust and safety:

- **Permission systems:** AI agents ask for approval before destructive actions (file deletion, git push, production changes).
- **Plan-then-execute:** The agent writes a plan, you review it, then it executes. Catches mistakes before they happen.
- **Incremental trust:** Start with high oversight, reduce as you build confidence in the agent's behavior for specific tasks.

### Test-Driven AI Development

Combining TDD with AI code generation:

1. Write the test (human or AI-assisted)
2. AI generates implementation to pass the test
3. AI refactors while keeping tests green
4. Human reviews the final result

**Why it works:** Tests constrain the AI's output. Instead of generating "whatever works," the AI generates code that provably meets your requirements.

### Subagent Parallelization

Spawning multiple AI agents to work on independent tasks simultaneously:

- **When to use:** Tasks with no dependencies (exploring different parts of a codebase, running independent investigations, implementing isolated components).
- **When not to use:** Tasks that depend on each other's results or need shared state.
- **Pattern:** Main agent orchestrates, subagents execute in parallel, main agent synthesizes results.

### Code Review of AI Output

AI-generated code needs the same (or more) scrutiny as human code:

- **Check for hallucinated APIs:** The model may use functions or methods that don't exist.
- **Verify edge cases:** AI often handles the happy path well but misses edge cases.
- **Security review:** AI can introduce vulnerabilities (SQL injection, XSS, insecure defaults).
- **Check for over-engineering:** AI tends to add unnecessary abstractions, error handling for impossible cases, or "helpful" extras you didn't ask for.

---

## Models & Providers Landscape

### Key Models (as of 2025)

| Provider | Model | Strengths |
|----------|-------|-----------|
| Anthropic | Claude (Opus, Sonnet, Haiku) | Deep reasoning, long context, code generation, agentic use |
| OpenAI | GPT-4o, o1, o3 | Broad capabilities, multimodal, reasoning (o-series) |
| Google | Gemini 2.5 Pro/Flash | Large context, multimodal, speed (Flash) |
| Meta | Llama 3.x | Open source, self-hostable, fine-tunable |
| Mistral | Mistral Large, Codestral | European alternative, code-focused models |

### Model Selection Criteria

- **Task complexity:** Use more capable (and expensive) models for architecture, debugging, and complex reasoning. Use faster/cheaper models for simple completions and formatting.
- **Latency requirements:** Interactive coding needs fast responses. Batch processing can tolerate slower models.
- **Privacy/compliance:** Some orgs require self-hosted models (Llama) or specific data residency.
- **Cost:** Token costs vary 10-100x between models. A senior dev should be cost-aware and choose the right model for the task.

### Embeddings & RAG (Retrieval-Augmented Generation)

Not just for chatbots — relevant for dev tooling:

- **Embeddings:** Vector representations of text that capture semantic meaning. Used for code search, similarity matching, and retrieval.
- **RAG:** Retrieve relevant context from a knowledge base before generating a response. How AI coding tools find relevant code in large codebases.
- **Vector databases:** Specialized DBs for storing and querying embeddings (Pinecone, Weaviate, pgvector).

---

## AI in Production Systems

### LLM Integration Patterns

When building systems that use LLMs:

- **Structured outputs:** Use JSON mode or tool-use to get parseable responses. Never parse free-text LLM output with regex in production.
- **Retry and fallback:** LLM APIs have variable latency and occasional failures. Implement retries with exponential backoff and fallback to simpler models or cached responses.
- **Prompt versioning:** Version your prompts like code. A prompt change can break production behavior just like a code change.
- **Evaluation:** Measure output quality systematically. Build eval suites that test your prompts against known-good inputs/outputs.
- **Cost monitoring:** Track token usage per feature/user. LLM costs can spike unexpectedly.

### Responsible AI

- **Hallucination mitigation:** Ground responses in retrieved data (RAG), use structured outputs, add verification steps.
- **Bias awareness:** LLMs reflect biases in their training data. Review AI-generated content that affects users.
- **Data privacy:** Don't send sensitive data (PII, credentials, proprietary code) to external AI APIs unless contractually permitted.
- **Transparency:** Be clear with users when they're interacting with AI-generated content.

---

## Common Interview Questions & Answers

### Q: "How do you use AI in your daily development workflow?"

**Good answer:** "I use AI coding agents as a force multiplier throughout my workflow. For implementation, I follow a spec-driven approach — I write a detailed spec of what I want, let the agent generate a plan, review it, then execute. For debugging, I feed the agent error logs and relevant code context and let it investigate. For code review, I use it as a first pass to catch issues before human review. I also maintain project documentation (CLAUDE.md) that gives the agent persistent context about our architecture and conventions, which dramatically improves output quality. The key is knowing when to trust AI output and when to verify — I always review generated code with the same rigor as a PR from any team member."

### Q: "What's the difference between using AI for coding and actually understanding the code?"

**Good answer:** "AI is a tool, not a replacement for understanding. I use AI to accelerate implementation of things I already understand architecturally — it's like having a fast typist who knows the language syntax. But I always review the output, understand the approach it took, and verify it meets my requirements. The real skill isn't generating code — it's knowing what to build, how to structure it, and recognizing when the AI got it wrong. I've seen AI suggest approaches that look correct but have subtle bugs or security issues that only someone who understands the underlying system would catch."

### Q: "How do you ensure quality when using AI-generated code?"

**Good answer:** "Multiple layers. First, I write specs before implementation so the AI has clear constraints. Second, I use test-driven development — I write or define the tests first, and the AI implements to pass them. Third, I review all generated code for security vulnerabilities, edge cases, and over-engineering. Fourth, I run the full CI pipeline — tests, linting, type checking. AI-generated code goes through the exact same quality gates as human-written code. And fifth, I keep my project documentation current so the AI generates code that follows our existing patterns instead of inventing new ones."

### Q: "What is MCP and why does it matter?"

**Good answer:** "MCP — Model Context Protocol — is an open standard that lets AI models connect to external tools and data sources through a unified interface. Before MCP, every AI tool had to build custom integrations with every service — N times M integrations. MCP standardizes this: a tool provider implements one MCP server, and any AI client that speaks MCP can use it. It's like how REST standardized web APIs. In practice, it means my AI agent can query Grafana dashboards, search Notion, manage incidents, and interact with internal tools — all through the same protocol. I've used it to connect AI agents to our monitoring stack and internal tooling, which lets the agent help with operational tasks, not just code."

### Q: "What's your take on 'vibe coding'?"

**Good answer:** "Vibe coding — describing what you want in natural language and letting AI generate it — is great for prototyping and exploration. I use it for throwaway scripts, learning new APIs, and scaffolding. But for production code, I combine that speed with engineering discipline: I write a spec first, review the generated plan, use TDD to constrain the output, and review the code thoroughly. The risk of pure vibe coding is accepting code you don't understand — and in production, that's a liability. A senior developer's job isn't to type code fast, it's to make good engineering decisions, and AI helps you execute those decisions faster."

### Q: "How do you handle AI hallucinations in development?"

**Good answer:** "First, I expect them — hallucinations are a known property of LLMs, not a bug to be surprised by. I mitigate them by providing strong context (project docs, relevant code files, explicit constraints), using structured outputs, and always verifying against reality. For API usage, I check docs. For code, I run tests. For architecture advice, I validate against first principles. The key is treating AI output as a draft from a knowledgeable but fallible colleague — you review and verify, not blindly trust."

### Q: "How would you introduce AI tools to a development team?"

**Good answer:** "Incrementally, with clear guidelines. I'd start with low-risk, high-value use cases — code completion, test generation, documentation. Then establish team conventions: maintain a CLAUDE.md with project context, define which tasks are good candidates for AI assistance, set up hooks for guardrails. I'd pair with team members to show effective patterns — most people underuse AI because they don't know how to give it good context. The goal is to make AI a team capability, not an individual secret weapon. And I'd be explicit about the review standards: AI code gets the same scrutiny as human code."

### Q: "What are AI agents and how are they different from chatbots?"

**Good answer:** "A chatbot takes input and generates text. An agent takes a goal and autonomously works toward it using tools. The key difference is the agentic loop: the agent plans what to do, executes an action (reading a file, running a command, calling an API), observes the result, and decides the next step. It keeps iterating until the task is done or it's blocked. Claude Code is a good example — you say 'fix this bug' and it reads the code, forms a hypothesis, makes changes, runs tests, and iterates until the tests pass. The agent has real agency to act, not just advise."

### Q: "How do you decide when to use AI vs. doing something manually?"

**Good answer:** "I use AI when it saves net time — including the time to review and verify its output. Writing boilerplate, implementing well-defined specs, writing tests for existing code, exploring unfamiliar codebases, debugging with lots of logs to analyze — these are high-ROI for AI. But for novel architecture decisions, security-critical code, or subtle business logic that requires deep domain knowledge, I do the thinking myself and might use AI only for the mechanical implementation. The skill is knowing where on that spectrum each task falls."

---

## Quick Reference: AI Development Maturity

| Level | Characteristics |
|-------|----------------|
| **Beginner** | Uses autocomplete (Copilot). Accepts suggestions without review. No project context setup. |
| **Intermediate** | Uses AI chat for code generation. Writes decent prompts. Reviews output. Knows about context windows. |
| **Advanced** | Uses AI agents with tool use. Maintains project docs (CLAUDE.md). Follows spec-driven development. Uses TDD with AI. Configures MCP servers for tooling integration. Builds custom skills and hooks for team workflows. Understands model selection, cost tradeoffs, and when NOT to use AI. |

A senior developer should be at the Advanced level — not just using AI, but architecting how the team uses it.
