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

**How LLMs connect to the tools you use:**

An LLM is the model — the "brain." You don't interact with it directly. The stack looks like this:

```
LLM (model)          →  Claude Opus, Claude Sonnet, Claude Haiku
  ↓ exposed via
API (provider)        →  Anthropic API
  ↓ consumed by
Client (tool you use) →  Claude Code (CLI agent), Cursor (IDE), Claude Desktop (chat)
```

The client is what you use day-to-day. It calls the provider's API, which runs the model. Some clients let you choose which model runs behind the scenes — for example, Cursor can use Claude or GPT-4. Claude Code uses Anthropic models exclusively.

**Claude model family — when to use each:**

| Model | Characteristics | When to use |
|-------|----------------|-------------|
| **Opus** | Most capable, deep reasoning, slower, higher cost | Complex architecture decisions, multi-step debugging, large refactors, agentic tasks |
| **Sonnet** | Strong balance of capability and speed | Day-to-day coding, code review, implementation from specs, most development tasks |
| **Haiku** | Fastest, lowest cost, lighter reasoning | Simple completions, formatting, boilerplate generation, high-volume batch tasks |

**Why it matters for a senior dev:** Understanding the model's limitations (hallucinations, context limits, training cutoff) lets you design better prompts and workflows. You know when to trust the output and when to verify. Choosing the right model for each task optimizes both quality and cost.

### Prompt Engineering

The practice of structuring inputs to get better outputs from LLMs. Not just "asking nicely" — it's a repeatable engineering discipline:

- **System prompts:** Instructions that set the model's behavior for an entire session. Define role, constraints, and output format.
- **Few-shot examples:** Providing 2-3 examples of desired input/output pairs to guide the model's pattern matching.
- **Chain of thought:** Asking the model to reason step-by-step before giving an answer. Dramatically improves accuracy on complex tasks.
- **Structured output:** Requesting JSON, YAML, or specific formats so outputs are machine-parseable and consistent.

**Recommendations for good prompt engineering (interview-ready):**

- **Be explicit, not vague:** "Refactor this function to use dependency injection, keep the public interface unchanged" beats "improve this code." The more precise the instruction, the less room for hallucination.
- **Provide context, not just the task:** Include the why — what the code does, what system it belongs to, what constraints exist. An LLM with context about your architecture generates code that fits; without it, it generates generic solutions.
- **Constrain the output:** Tell the model what NOT to do. "Don't add error handling I didn't ask for. Don't change the function signature. Only modify the database layer." Constraints prevent over-engineering.
- **Break complex tasks into steps:** Instead of "build me a REST API with auth," go step by step — data model first, then endpoints, then auth. Smaller scopes produce better results and are easier to review.
- **Iterate, don't restart:** If the first output is 80% right, refine with follow-up prompts instead of rewriting the whole prompt. The model has conversational context — use it.
- **Use the model's own output as input:** Ask it to generate a plan, review the plan, then ask it to execute. This "plan-then-implement" loop catches bad approaches before they become bad code.
- **Treat prompts as engineering artifacts:** Version them, review them in PRs, share them with the team. A well-crafted system prompt (like a CLAUDE.md) is a reusable asset — not a throwaway message.

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

**The problem it solves — N x M integrations:**

Before MCP, integrating AI with external services meant building custom code for each combination:
- Copilot wanted to talk to GitHub? Custom integration.
- Claude Code wanted to query Grafana? Custom integration.
- Some new AI tool wanted to access Jira? Write another integration.
- And from the service side: if you had a tool, you'd need to build integrations with Claude, Copilot, and every other AI tool.

Result: N AI tools × M services = N×M custom integrations. Exponential complexity.

MCP eliminates this. Instead:
- **Services** build one MCP server (implement the protocol once)
- **AI clients** connect to any MCP server (implement the protocol once)
- Result: N + M integrations instead of N×M

**Key concepts:**

- **MCP Servers:** Services that expose tools and resources (e.g., a Grafana MCP server exposes dashboards, queries, alerts).
- **MCP Clients:** The AI application that connects to servers and uses their tools (e.g., Claude Code, Claude Desktop).
- **Tools:** Actions the model can take through an MCP server (e.g., `search_dashboards`, `query_prometheus`, `create_incident`).
- **Resources:** Data the model can read from an MCP server (e.g., database schemas, documentation).

**Advantages:**

1. **Interoperability:** One MCP server works with any AI client that speaks MCP. No vendor lock-in.
2. **Standardization:** Reduces duplication. Teams don't rebuild the same integrations.
3. **Extensibility:** Easy to add new tools and data sources — just connect a new MCP server.
4. **Security:** Centralized permission model. AI clients can't access anything not explicitly exposed by a server.

**When you'd build your own MCP server:**

You'd create a custom MCP server when your team has internal tools that AI should be able to use:
- Internal APis (custom dashboards, configuration systems, deployment tools)
- Private databases or data pipelines
- Team-specific workflows (incident management, ticket systems, knowledge bases)
- Internal CLIs or scripts that should be callable by AI agents

**Example:** Your team uses an internal tool called "Deploy-o-matic" for deployments. Instead of training every developer on how to use it manually, you:
1. Build an MCP server that wraps the Deploy-o-matic API
2. Expose tools like `deploy(service, env)`, `get_deployment_status(id)`, `rollback(id)`
3. Connect it to Claude Code
4. Now the AI agent can help with deployments autonomously

**How to develop your own MCP server:**

MCP servers are typically lightweight processes that communicate JSON-RPC with clients. You can build them in:
- **Python** (using the `mcp` package) — recommended, most tooling
- **Node.js** (using `@modelcontextprotocol/sdk`)
- **Any language** that can talk JSON-RPC

Basic structure:
```
your-mcp-server/
├── server.py (or .js)           # Implements MCP protocol
├── tools.py                      # Your exposed tools
├── requirements.txt
└── config.json                   # Tool definitions
```

You define tools by specifying name, description, input schema, and implementation. The client calls them, you execute and return results.

**Setting up MCP locally — configuration files:**

MCP clients are configured via config files. The location depends on the client:

**For Claude Desktop:**
- macOS: `~/.claude/config.json`
- Windows: `%APPDATA%\Claude\config.json`
- Linux: `~/.claude/config.json`

Example `config.json`:
```json
{
  "mcpServers": {
    "grafana": {
      "command": "python",
      "args": ["/path/to/grafana-mcp-server/server.py"],
      "env": {
        "GRAFANA_URL": "https://grafana.example.com",
        "GRAFANA_API_KEY": "YOUR_KEY_HERE"
      }
    },
    "notion": {
      "command": "node",
      "args": ["/path/to/notion-mcp-server/index.js"],
      "env": {
        "NOTION_API_KEY": "YOUR_KEY_HERE"
      }
    },
    "internal-deploy": {
      "command": "python",
      "args": ["/path/to/your-mcp-server/server.py"],
      "env": {
        "DEPLOY_API_URL": "http://internal.deploy.local",
        "AUTH_TOKEN": "secret"
      }
    }
  }
}
```

**For Claude Code:**
Configuration is set up similarly — the agent loads MCP servers from your local config when it starts. You restart Claude Code to pick up config changes.

**A senior dev should know:**

- How to configure existing MCP servers (modify config.json, add API keys)
- How to develop and test a custom MCP server for internal tools
- The security model: MCP servers are separate processes; permission boundaries are enforced at the protocol level
- How to debug: MCP servers log to stderr, check logs when tools aren't appearing in the client

**Is MCP Anthropic-only?**

MCP is an *open standard* — anyone can implement it. But adoption is currently concentrated in the Anthropic ecosystem (Claude Desktop, Claude Code). Other providers like OpenAI use their own tool systems and don't support MCP yet. Technically, nothing prevents GPT from supporting MCP in the future — it would just require OpenAI to implement it. Think of it like REST APIs: not tied to any one company, but adoption varies.

**Architecture:**
```
Claude Code ──MCP──> Grafana Server ──> Grafana API
            ──MCP──> Notion Server  ──> Notion API
            ──MCP──> Your Custom Server  ──> Internal tools

(All via config.json — no code changes needed, just wire up servers)
```

**How MCPs change your workflow — the Git MCP example:**

Without Git MCP (current workflow):
```
You: "Check the git status"
Agent: "Current branch: main, 3 files modified..."
You: "Make a commit with message 'fix bug'"
Agent: Makes the commit
You: "Push to origin"
Agent: Pushes
```

You're directing the agent with explicit git commands. You need to know the git sequence and ask for each step.

With Git MCP installed:
```
You: "Fix the race condition in the cache layer and commit the changes"
Agent:
  1. Reads the code (filesystem access)
  2. Identifies the issue
  3. Makes changes
  4. Runs tests (bash access)
  5. Automatically checks git status (git MCP)
  6. Creates a descriptive commit (git MCP)
  7. Pushes to origin (git MCP)
  → Done. No intermediate prompts needed.
```

**The difference:**

- **Without MCP:** You micromanage git operations. Agent says "should I commit?" and waits for your response.
- **With MCP:** Agent *can* execute git operations autonomously. It sees the repo state, makes decisions, acts — without asking permission for each step.
- **You shift from:** "Do this git command" → "Achieve this objective"

**Real-world impact:**

You can now say:
- "Refactor this module, commit the changes with a good message, and push" — agent handles the full workflow end-to-end
- "Create a feature branch, implement the spec, run tests, and commit" — agent does the git plumbing transparently
- "Review the last 3 commits and tell me what changed" — agent can traverse git history directly

Without MCPs, you'd need to ask the agent to do each of those steps separately or do the git work manually yourself.

**Why it matters for a senior dev:**

MCPs make agents more autonomous and reduce friction. Instead of chatting with the agent about "what should I do next," you set a high-level goal and the agent executes it with the tools available. The experience becomes less like "calling a contractor and supervising every step" and more like "delegating to a competent teammate who knows when to ask for clarification and when to just move forward."

**Essential MCPs for a senior dev — and how you'd use them:**

| MCP | What it exposes | Daily use cases |
|-----|-----------------|-----------------|
| **Git** | `commit()`, `push()`, `pull()`, `diff()`, `branch()`, `log()` | Commit changes without manual git commands. Check history. Create feature branches. The agent handles git plumbing. |
| **GitHub** | `create_pr()`, `search_issues()`, `comment_on_pr()`, `merge_pr()` | Let the agent open PRs, search for related issues, add review comments. Create release notes from commits automatically. |
| **Filesystem** | `read_file()`, `write_file()`, `list_dir()`, `delete_file()` | Already built into Claude Code, but knowing it's an MCP helps you understand why the agent can edit code. The agent can navigate and modify your project. |
| **Slack** | `send_message()`, `search_messages()`, `get_channel_info()` | Notify team when a deployment is done. Post summaries of completed tasks. Search conversation history for context. The agent can keep the team in the loop. |
| **Notion** | `search_pages()`, `read_page()`, `create_page()`, `update_page()` | The agent reads your CLAUDE.md and project docs from Notion automatically. Can create incident reports, update status pages, or add findings from debugging. |
| **Grafana** | `search_dashboards()`, `query_prometheus()`, `create_alert()`, `list_incidents()` | When debugging an issue, the agent can pull live metrics, check dashboards, correlate logs with performance drops. Create alerts for new issues without manual UI clicking. |
| **PostgreSQL / Database** | `query()`, `get_schema()`, `explain()` | Agent can inspect your database schema to understand data models. Run queries to validate a fix. Generate migrations. Check explain plans for slow queries. |
| **Jira / Linear** | `create_issue()`, `search_issues()`, `update_status()`, `add_comment()` | Agent can file bugs it finds during debugging. Link commits to tickets. Update ticket status when a fix is deployed. Create subtasks for refactoring. |
| **Anthropic Claude API** | Access to the Claude API directly | Build internal tools that use Claude. The agent can help debug AI integrations or generate prompts for your app. |

**Typical senior dev workflow with MCPs:**

```
You: "There's a race condition in the cache layer. Fix it, run tests, and deploy to staging."

Agent:
1. Filesystem MCP → reads the cache code
2. Identifies the issue
3. Filesystem MCP → writes the fix
4. Bash (built-in) → runs tests
5. Git MCP → commits with message "fix(cache): prevent race condition with mutex"
6. GitHub MCP → creates a PR with description
7. Grafana MCP → pulls metrics from staging to verify the fix doesn't degrade performance
8. Slack MCP → posts "Cache fix deployed to staging, metrics look good" in #deployments
9. Done.
```

You set a goal. The agent orchestrates multiple tools. No context-switching, no manual steps.

**What a senior dev should know about MCPs:**

- Which ones exist and what they do (so you know what to ask the agent)
- How to install/configure them (modify config.json)
- How to build a custom one for your team's internal tools
- The security model: each MCP server runs in its own process with explicit permissions
- You can chain MCPs: one task might use Git + GitHub + Slack + Grafana sequentially

### Hooks

Event-driven scripts that execute automatically in response to AI agent actions. They extend agent behavior without modifying the agent itself. Think of them as "middleware" for AI agents — they intercept actions, validate them, modify them, or block them entirely.

**Types of hooks:**

- **Pre-hooks:** Run before a tool executes. Can validate, modify, or block the action. Examples: prevent commits to main branch, enforce commit message format, require approval for deletions.
- **Post-hooks:** Run after a tool executes. Can process results, trigger side effects, or log actions. Examples: auto-format code after edits, run linters, notify team, update metrics.

**Essential hooks for a senior dev:**

| Hook | Type | What it does | Example use case |
|------|------|-------------|------------------|
| **Commit message enforcer** | Pre | Validates commit messages follow your team's convention (feat:, fix:, refactor:, etc.) | Enforce semantic commit messages across the team |
| **Branch protection** | Pre | Blocks commits/pushes to protected branches (main, production) unless it's a PR | Prevent accidental direct commits to main |
| **Code formatter** | Post | Auto-runs prettier, black, or gofmt after file edits | Keep code style consistent without manual review |
| **Linter enforcer** | Post | Runs ESLint, Pylint, or similar after code generation | Catch issues before they reach CI |
| **Test runner** | Post | Automatically runs relevant tests after code changes | Fail fast if tests break |
| **Git secrets checker** | Pre | Scans for API keys, credentials, or secrets in commits | Prevent accidental credential leaks |
| **Approval gate** | Pre | Requires human approval for risky operations (deletions, DB migrations) | Add a safety layer for destructive operations |
| **Audit logger** | Post | Logs all agent actions to a file or service for compliance | Track what the AI agent did and when |
| **Slack notifier** | Post | Posts agent actions to a team channel | Keep team in the loop on major changes |

**How to configure hooks in Claude Code CLI:**

Hooks are configured via a **hooks configuration file** in your project. The location depends on your setup:

**Option 1: Global hooks (apply to all Claude Code projects)**

Create `~/.claude/hooks.json`:

```json
{
  "hooks": {
    "pre-file-write": [
      {
        "name": "check-secrets",
        "command": "sh",
        "args": ["-c", "git secrets --scan $FILE || exit 1"]
      }
    ],
    "post-file-write": [
      {
        "name": "format-code",
        "command": "sh",
        "args": ["-c", "prettier --write $FILE || black $FILE || gofmt -w $FILE"]
      },
      {
        "name": "lint",
        "command": "sh",
        "args": ["-c", "eslint $FILE || pylint $FILE"]
      }
    ],
    "pre-git-commit": [
      {
        "name": "validate-message",
        "command": "sh",
        "args": ["-c", "echo \"$COMMIT_MESSAGE\" | grep -E '^(feat|fix|refactor|chore|docs):' || (echo 'Commit message must start with feat:, fix:, refactor:, chore:, or docs:' && exit 1)"]
      }
    ],
    "pre-git-push": [
      {
        "name": "protect-main",
        "command": "sh",
        "args": ["-c", "[ \"$BRANCH\" != \"main\" ] || (echo 'Cannot push directly to main. Use a PR.' && exit 1)"]
      }
    ]
  }
}
```

**Option 2: Project-specific hooks**

Create `.claude/hooks.json` in your project root:

```json
{
  "hooks": {
    "post-task-complete": [
      {
        "name": "notify-slack",
        "command": "sh",
        "args": ["-c", "curl -X POST $SLACK_WEBHOOK -d '{\"text\": \"Task completed: $TASK_NAME\"}' || true"]
      }
    ]
  }
}
```

**Available hook events:**

```
pre-file-read           → Before reading a file
pre-file-write          → Before writing/editing a file
post-file-write         → After writing/editing a file
pre-git-commit          → Before creating a commit
post-git-commit         → After creating a commit
pre-git-push            → Before pushing to remote
post-git-push           → After pushing to remote
pre-bash-execute        → Before running a bash command
post-bash-execute       → After running a bash command
pre-task-execute        → Before starting a task
post-task-complete      → After completing a task
pre-file-delete         → Before deleting a file
post-file-delete        → After deleting a file
```

**Hook environment variables (available inside scripts):**

```bash
$FILE                   # Path to file being operated on
$BRANCH                 # Current git branch
$COMMIT_MESSAGE         # Commit message (for git hooks)
$COMMAND                # Bash command being executed
$TASK_NAME              # Current task name
$TASK_STATUS            # Task status (in_progress, completed, failed)
```

**Practical example: Commit message enforcer hook**

```bash
#!/bin/bash
# ~/.claude/hooks/validate-commit-message.sh

COMMIT_MSG="$1"

# Require semantic commit format: feat:, fix:, refactor:, etc.
if ! echo "$COMMIT_MSG" | grep -qE '^(feat|fix|refactor|chore|docs|test|ci):'; then
  echo "❌ Commit message must start with: feat:, fix:, refactor:, chore:, docs:, test:, or ci:"
  echo "   Example: 'fix: prevent race condition in cache layer'"
  exit 1
fi

# Require minimum length
if [ ${#COMMIT_MSG} -lt 10 ]; then
  echo "❌ Commit message too short (minimum 10 characters)"
  exit 1
fi

echo "✅ Commit message valid"
exit 0
```

Then in `~/.claude/hooks.json`:

```json
{
  "hooks": {
    "pre-git-commit": [
      {
        "name": "validate-message",
        "command": "bash",
        "args": ["~/.claude/hooks/validate-commit-message.sh", "$COMMIT_MESSAGE"]
      }
    ]
  }
}
```

**Practical example: Auto-format on save**

```bash
#!/bin/bash
# ~/.claude/hooks/auto-format.sh

FILE="$1"

# Skip non-code files
if [[ ! $FILE =~ \.(js|ts|jsx|tsx|py|go|java|rb)$ ]]; then
  exit 0
fi

# Auto-format based on file type
if [[ $FILE =~ \.(js|ts|jsx|tsx)$ ]]; then
  prettier --write "$FILE" 2>/dev/null
elif [[ $FILE =~ \.py$ ]]; then
  black "$FILE" 2>/dev/null
elif [[ $FILE =~ \.go$ ]]; then
  gofmt -w "$FILE" 2>/dev/null
fi

exit 0
```

**What a senior dev should know about hooks:**

- **Pre-hooks for safety:** Use them to enforce immutable rules (no secrets, no commits to main, required message format).
- **Post-hooks for automation:** Use them to run formatters, linters, tests — things that should always happen.
- **Fail gracefully:** Hooks can block actions, but only block when it's a real problem. Too many false positives and developers will disable hooks.
- **Logging matters:** Post-hooks should log what they did for auditability.
- **Team standardization:** Share hooks across the team via a checked-in `.claude/hooks.json` so everyone has the same guardrails.
- **Performance:** Keep hooks fast. Long-running hooks slow down the agent and frustrate developers.

**Why it matters:** Hooks let you enforce team standards without code review friction. Instead of "remember to format your code" (which gets skipped), the agent auto-formats. Instead of "make sure your commit message is good," hooks validate. It's like CI/CD, but for the AI agent's actions in real-time.

### Skills

Reusable, structured prompts that encode workflows, best practices, and domain knowledge for AI agents. A skill is a prompt template that gets loaded when relevant. Think of skills as "playbooks" for the AI — recipes for how to solve common problems the way your team does.

**Types of skills:**

- **Rigid skills:** Must be followed exactly (e.g., TDD workflow, debugging protocol, deployment checklist). Encode discipline and process.
- **Flexible skills:** Provide principles and guidance (e.g., design patterns, code review guidelines, architectural decisions). Encode knowledge without rigid rules.
- **Skill discovery:** The agent identifies which skills apply to the current task and loads them automatically (or you invoke them explicitly with `/skill-name`).

**How skills work:**

Skills are loaded into the agent's context automatically when:
1. You mention keywords that match the skill (e.g., "write tests" loads a TDD skill)
2. You explicitly invoke with `/skill-name`
3. The agent detects you're working on a related task

**Local vs. Remote skills:**

- **Local skills:** Stored in `.claude/skills/` in your project. Checked into git. Available to your team.
- **Remote skills:** Stored in a central repository or marketplace. Shared across orgs. Examples: Anthropic's official skills, company marketplace skills.
- **Hybrid:** Load from remote, customize locally.

**Skill file structure:**

A skill is typically a markdown file with metadata and instructions:

```markdown
# skill-name
## metadata
- priority: 1 (1-10, higher = load earlier)
- tags: [testing, tdd, backend]
- trigger-keywords: [test, tdd, test-driven]
- applicable-file-types: [.js, .ts, .py, .go]

## description
Brief description of what this skill does.

## instructions
1. Step-by-step instructions for how the agent should approach this
2. Include constraints and guardrails
3. Provide examples of good vs. bad outputs
4. Reference team standards

## examples

### Good example
[show what you want]

### Bad example
[show what you don't want]

## constraints
- Don't do X
- Always verify Y before Z
```

**Standard skill structure (team practices):**

Most teams follow this pattern:

```
.claude/
├── skills/
│   ├── testing/
│   │   ├── tdd-workflow.md
│   │   ├── unit-testing.md
│   │   └── integration-testing.md
│   ├── architecture/
│   │   ├── design-patterns.md
│   │   ├── dependency-injection.md
│   │   └── api-design.md
│   ├── process/
│   │   ├── code-review.md
│   │   ├── debugging.md
│   │   └── refactoring.md
│   └── deployment/
│       ├── staging-deployment.md
│       └── production-deployment.md
└── CLAUDE.md  # Also references which skills apply
```

**How to configure skills in Claude Code:**

Skills are configured in your project's `.claude/` directory. No special config file needed — just create `.claude/skills/` and add markdown files.

To load/activate a skill:

```bash
# Explicit load
/skill-name

# Or mention it in context
"Use the TDD workflow for this implementation"

# Or let auto-discovery work (if keywords match)
"Write tests for the auth module"  # Auto-loads tdd-workflow.md if tagged with "testing"
```

**Essential skills for a senior dev:**

| Skill | Type | What it encodes | Example trigger |
|-------|------|-----------------|-----------------|
| **TDD Workflow** | Rigid | Test-first development: write test → fail → implement → pass → refactor | "Write tests first" |
| **Code Review** | Flexible | How to review code: security, performance, maintainability, style | "Review this PR" |
| **Debugging Protocol** | Rigid | Systematic approach: hypothesis → test hypothesis → verify → document | "Debug this error" |
| **API Design** | Flexible | REST principles, naming, versioning, error handling | "Design this API" |
| **Refactoring** | Flexible | When to refactor, patterns, keeping tests green | "Clean up this code" |
| **Security Review** | Rigid | Check for OWASP top 10, secrets, injection, auth, encryption | "Security check" |
| **Performance Optimization** | Flexible | Profiling, caching, DB optimization, async patterns | "Optimize this" |
| **Deployment Checklist** | Rigid | Pre-deploy verification, rollback plan, monitoring | "Deploy to prod" |

**Example skill: TDD Workflow**

```markdown
# tdd-workflow
## metadata
- priority: 8
- tags: [testing, development, process]
- trigger-keywords: [test, tdd, write tests, test-driven]
- applicable-file-types: [.js, .ts, .py, .go, .java]

## description
Test-Driven Development (TDD) workflow. Write tests first, then implementation.

## instructions
1. **Write the test first (RED)**
   - Define what the code should do
   - Test should fail initially
   - Focus on the interface, not implementation

2. **Implement to pass (GREEN)**
   - Write minimal code to make test pass
   - Don't over-engineer
   - Don't write code beyond what test requires

3. **Refactor (REFACTOR)**
   - Improve code quality while tests stay green
   - Extract duplicates
   - Improve naming
   - Run tests after every change

4. **Repeat for next behavior**

## constraints
- NEVER implement first
- NEVER skip the refactor step
- NEVER have failing tests in commits
- Tests must be meaningful (not trivial)

## examples

### Good: TDD approach
1. Test: "should return user by ID"
   ```javascript
   test('getUserById returns correct user', () => {
     const user = getUserById(123);
     expect(user.id).toBe(123);
   });
   ```
2. Implementation: minimal code to pass
   ```javascript
   function getUserById(id) {
     return users.find(u => u.id === id);
   }
   ```
3. Refactor: improve, add edge cases

### Bad: Implementation-first
- Writing code without tests
- Tests written after implementation (catches fewer bugs)
- Tests that don't verify behavior
```

**Example skill: Security Review**

```markdown
# security-review
## metadata
- priority: 9
- tags: [security, review, mandatory]
- trigger-keywords: [security, vulnerabilities, sensitive, auth, crypto]
- applicable-file-types: [.js, .ts, .py, .go, .java]

## description
Security review checklist. Verify code against common vulnerabilities.

## instructions
Check the following for all changes:

1. **Authentication & Authorization**
   - ✅ Are auth tokens stored securely? (not in localStorage on web)
   - ✅ Is authorization checked before sensitive operations?
   - ✅ Are permissions validated server-side, not client-side?

2. **Data Protection**
   - ✅ No secrets/credentials in code or env files checked in
   - ✅ Sensitive data encrypted at rest and in transit
   - ✅ PII handled according to compliance (GDPR, etc.)

3. **Input Validation**
   - ✅ All user input validated and sanitized
   - ✅ SQL injection mitigated (use parameterized queries)
   - ✅ XSS prevented (encode output, use safe APIs)
   - ✅ No command injection (don't build shell commands from input)

4. **Dependency Security**
   - ✅ Dependencies up-to-date
   - ✅ No known CVEs in dependencies
   - ✅ Run `npm audit` / `pip audit` / equivalent

5. **Error Handling**
   - ✅ Error messages don't leak sensitive info
   - ✅ Stack traces not exposed in production

## constraints
- ALWAYS check for hardcoded secrets
- NEVER trust client-side validation alone
- NEVER use eval() or similar
- Block code if security issue found
```

**How to create and share skills:**

```bash
# Create skill locally
mkdir -p .claude/skills/my-process
cat > .claude/skills/my-process/custom-workflow.md << 'EOF'
# custom-workflow
## metadata
- priority: 5
- tags: [process, custom]
- trigger-keywords: [workflow, custom]

## instructions
Your workflow here...
EOF

# Commit to git
git add .claude/skills/
git commit -m "feat: add custom workflow skill"

# Team members automatically get it when they pull
```

**What a senior dev should know about skills:**

- **Skills are team memory:** They capture "how we do things" in a format the AI understands.
- **Version control matters:** Keep skills in git so the team stays aligned and you can track changes.
- **Discoverable but explicit:** Use keywords so the agent auto-loads relevant skills, but also allow explicit `/skill` invocation.
- **Rigid vs. flexible:** Use rigid skills for non-negotiable processes (security review, deployment checklist). Use flexible skills for guidance (design patterns).
- **Review skills like code:** Skills are part of your codebase and engineering standards. Review them in PRs, iterate on them.
- **Compose skills:** Complex workflows combine multiple skills. E.g., "fix a bug" might load debugging skill → code-review skill → testing skill.
- **Skill discovery matters:** If a skill isn't being used, either its keywords don't match, or the team doesn't know it exists.

**Why it matters:** Skills standardize how the AI helps your team. Instead of each developer explaining the same process to the AI ("write tests first, then code"), you write it once as a skill. The AI loads it automatically. The skill becomes documentation, training, and automation all in one.

### Spec-Driven Development with OpenSpec

Write detailed specifications in [OpenSpec](https://intent-driven.dev/knowledge/openspec/) format before code. The spec is the source of truth. Your role shifts from "writing code" to "defining intent precisely."

**OpenSpec workflow: `/opsx:propose → /opsx:apply → /opsx:sync → /opsx:archive`**

**Step 1: PROPOSE — Define the spec**

Create spec in OpenSpec format (EARS + GIVEN/WHEN/THEN):

```markdown
# User Authentication

## Purpose
Secure login with JWT tokens and email verification.

## ADDED

### User Login
- **Priority:** HIGH
- **Requirement:** The system SHALL verify credentials and issue JWT token

#### Scenarios

**Scenario: Valid login**
```
GIVEN user "user@example.com" exists with password hashed
WHEN user submits login with correct credentials
THEN system returns 200 with JWT token
AND token expires in 24 hours
```

**Scenario: Invalid credentials**
```
GIVEN credentials are incorrect
WHEN user submits login
THEN system returns 401 Unauthorized
AND login attempt is logged
```

**Scenario: Rate limiting**
```
GIVEN 5 failed attempts from same IP in 15 minutes
WHEN 6th attempt is made
THEN system returns 429 Too Many Requests
```
```

Invoke with:
```
/opsx:propose .spec/user-authentication.md
```

Agent will: Parse spec, generate implementation plan, list all tasks (tests + code).

---

**Step 2: APPLY — Implement the spec**

```
/opsx:apply
```

Agent will:
1. Create test files from GIVEN/WHEN/THEN scenarios
2. Write implementation to pass tests
3. Follow your CLAUDE.md conventions
4. Check off each task as it's completed

You review & approve changes as they happen.

---

**Step 3: SYNC — Verify spec matches code**

```
/opsx:sync
```

Agent will:
- Confirm all scenarios in spec have passing tests
- Check implementation matches all requirements
- Flag any gaps between spec and code
- Update spec if needed

---

**Step 4: ARCHIVE — Complete the change**

```
/opsx:archive
```

Agent will:
- Merge delta spec into main spec library
- Move change to archive
- Create audit history
- Clean up working branches

---

**OpenSpec spec structure:**

```markdown
# Feature Name

## Purpose
What problem does this solve?

## ADDED (New in this version)
### Requirement Name
- **Priority:** HIGH/MEDIUM/LOW
- **Requirement:** The system SHALL [behavior]

#### Scenarios
**Scenario: [name]**
```
GIVEN [initial state]
WHEN [action]
THEN [outcome]
```

## MODIFIED (Changes to existing)
### Requirement Name
- **Changed from:** Old behavior
- **Changed to:** New behavior
- **Rationale:** Why change?

## REMOVED (Deprecated)
- Feature X no longer supported (use Feature Y instead)
```

**Project structure:**

```
project/
├── .spec/
│   ├── openspec.yaml              # OpenSpec config
│   ├── user-authentication.md     # Specs (ADDED/MODIFIED/REMOVED)
│   ├── api-pagination.md
│   └── _archive/                  # Completed specs
│       └── v1-user-auth.md
│
├── src/
│   ├── auth/
│   │   ├── auth.ts
│   │   └── __tests__/
│   │       └── auth.test.ts       # Tests from GIVEN/WHEN/THEN
│
├── CLAUDE.md                       # References .spec/ directory
└── README.md
```

**Example: Full OpenSpec workflow**

```markdown
# User Registration

## Purpose
Allow new users to create accounts with validated credentials.

## ADDED

### Email Validation
- **Priority:** HIGH
- **Requirement:** The system SHALL validate email format before registration

#### Scenarios
**Scenario: Valid email**
```
GIVEN registration form is open
WHEN user enters "user@example.com"
THEN system accepts email
AND allows submission
```

**Scenario: Invalid email**
```
GIVEN registration form is open
WHEN user enters "invalid-email"
THEN system returns error: "Invalid email format"
AND blocks submission
```

### Password Hashing
- **Priority:** HIGH
- **Requirement:** The system SHALL hash passwords with bcrypt before storing

#### Scenarios
**Scenario: Password stored securely**
```
GIVEN user submits password "SecurePass123"
WHEN system creates user
THEN password is hashed with bcrypt
AND plaintext password never stored
```

### Duplicate Email Prevention
- **Priority:** HIGH
- **Requirement:** The system SHALL prevent duplicate email registrations

#### Scenarios
**Scenario: Duplicate prevented**
```
GIVEN "user@example.com" already registered
WHEN another registration attempt with same email
THEN system returns 409 Conflict
AND error: "Email already exists"
```

## MODIFIED

### Email Verification Flow
- **Changed from:** Immediate account activation
- **Changed to:** Account inactive until email verified
- **Rationale:** Reduce spam registrations

## REMOVED
- SMS verification (replaced by email verification)
```

Then:
```
/opsx:propose .spec/user-registration.md
# Agent creates test cases from each GIVEN/WHEN/THEN
# You review the plan

/opsx:apply
# Agent implements code to pass all tests
# Tests pass = spec satisfied

/opsx:sync
# Verify everything matches

/opsx:archive
# Done. Spec merged to history.
```

**Best practices with OpenSpec:**

1. **GIVEN/WHEN/THEN are your tests** — Don't write separate test files, scenarios ARE the tests
2. **Be explicit in scenarios** — "THEN returns 200 with {accessToken}" not "THEN succeeds"
3. **One spec per feature** — Don't create massive specs, keep them focused
4. **ADDED/MODIFIED/REMOVED sections** — Makes it clear what changed and why
5. **Rationale is required** — MODIFIED section must explain WHY you changed it

**OpenSpec: The standard for Spec-Driven Development**

There IS a standard: **[OpenSpec](https://intent-driven.dev/knowledge/openspec/)** — an open-source framework for Spec-Driven Development created by Fission-AI.

OpenSpec combines two proven methodologies:
- **EARS** (Easy Approach to Requirements Syntax) — structured requirement phrasing with SHALL/MUST/SHOULD
- **BDD** (Behavior-Driven Development) — GIVEN/WHEN/THEN scenarios for testability

**OpenSpec structure:**

```markdown
# Capability Name

## Purpose
What problem does this solve?

## ADDED (New features in this version)

### Requirement Title
- **Priority:** HIGH/MEDIUM/LOW
- **Rationale:** Why does this exist?
- **Requirement:** The system SHALL/MUST/SHOULD [behavior]

#### Scenarios

**Scenario: Happy path**
```
GIVEN [initial state]
WHEN [user/system action]
THEN [expected outcome]
```

**Scenario: Edge case**
```
GIVEN [condition]
WHEN [action]
THEN [error handling]
```

## MODIFIED (Changes to existing features)
[Same structure as ADDED]

## REMOVED (Deprecated features)
[Features no longer supported]
```

**Real example: User Authentication (OpenSpec format)**

```markdown
# User Authentication System

## Purpose
Enable secure user login with JWT tokens and email verification to protect account access.

## ADDED

### User Registration
- **Priority:** HIGH
- **Rationale:** New users must create accounts with validated credentials
- **Requirement:** The system SHALL create a user account with email and bcrypt-hashed password

#### Scenarios

**Scenario: Valid registration**
```
GIVEN user is on /register page
AND no account exists for their email
WHEN they submit email "user@example.com" and password "SecurePass123"
THEN system creates user
AND returns 201 with { userId: "uuid", token: "jwt" }
AND sends verification email to user@example.com
```

**Scenario: Password too short**
```
GIVEN registration form is open
WHEN user submits password with < 8 characters
THEN system returns 400
AND error message: "Password must be at least 8 characters"
```

**Scenario: Email already exists**
```
GIVEN email "existing@example.com" already registered
WHEN user attempts to register with same email
THEN system returns 409 Conflict
AND error message: "Email already registered"
```

### User Login
- **Priority:** HIGH
- **Rationale:** Users must authenticate to access protected resources
- **Requirement:** The system SHALL verify credentials and issue JWT token

#### Scenarios

**Scenario: Valid login**
```
GIVEN user with email "user@example.com" exists
AND password hash matches "SecurePass123"
WHEN user submits login form with email and password
THEN system returns 200
AND response contains { accessToken: "jwt", expiresIn: 86400 }
AND JWT payload contains { userId, email }
AND JWT expires in 24 hours
```

**Scenario: Invalid credentials**
```
GIVEN login credentials are incorrect
WHEN user submits login
THEN system returns 401 Unauthorized
AND error message: "Invalid email or password"
AND login attempt is logged (for rate limiting)
```

**Scenario: Rate limiting (5 failed attempts)**
```
GIVEN 5 failed login attempts from IP 192.168.1.1 in 15 minutes
WHEN 6th attempt is made
THEN system returns 429 Too Many Requests
AND client must wait 15 minutes before retrying
```

## MODIFIED

### JWT Token Expiration
- **Rationale:** Updated from 6 hours to 24 hours based on user feedback
- **Requirement:** The system SHALL expire JWT tokens after 24 hours (not 6 hours)

## REMOVED

### SMS Two-Factor Authentication
- **Rationale:** Removed in favor of email-based 2FA (lower cost, better UX)
- **Replacement:** See "Email Two-Factor Authentication" in ADDED
```

**Why OpenSpec is better than custom formats:**

| Aspect | Custom Spec | OpenSpec |
|--------|-------------|----------|
| **Structure** | Varies per team | Standardized (ADDED/MODIFIED/REMOVED) |
| **Requirements** | Informal prose | EARS format (SHALL/MUST/SHOULD) |
| **Test cases** | Separate document | Integrated GIVEN/WHEN/THEN scenarios |
| **AI understanding** | Agent must infer | AI knows exact format, parses reliably |
| **Team alignment** | Everyone invents own | Everyone uses same standard |
| **Versioning** | Unclear what changed | Clear (ADDED/MODIFIED/REMOVED sections) |

**How to use OpenSpec with Claude Code:**

1. Create `.spec/` directory with OpenSpec format:
```
.spec/
├── user-authentication.md
├── api-pagination.md
└── error-handling.md
```

2. Write specs in OpenSpec format (EARS + BDD)

3. Ask the agent:
```
Implement according to .spec/user-authentication.md (OpenSpec format).
Each GIVEN/WHEN/THEN scenario becomes a test case.
Ensure implementation satisfies all scenarios.
```

4. Agent will:
   - Parse OpenSpec structure automatically
   - Create tests from GIVEN/WHEN/THEN
   - Implement to pass all scenarios
   - Output will align perfectly with spec

**Benefits for a senior dev:**

- **Standard format:** Your specs look like everyone else's (easier onboarding)
- **Version control:** ADDED/MODIFIED/REMOVED makes git diffs clear
- **Test-driven by default:** GIVEN/WHEN/THEN scenarios ARE your test cases
- **AI-friendly:** Claude/other models parse OpenSpec naturally
- **Team communication:** Specs are the contract everyone reviews

**Alternative standards:**

While OpenSpec is the most AI-friendly, other standards exist:

- **OpenAPI/Swagger:** For API specifications (REST endpoints, schemas)
- **JSON Schema:** For data structure validation
- **Gherkin/Cucumber:** For BDD scenarios (similar to OpenSpec but more verbose)
- **ADR (Architecture Decision Records):** For architecture decisions (not functional specs)

**Which to use?**
- **OpenSpec:** For general feature specs, works great with AI agents
- **OpenAPI:** If you're building APIs, use this for endpoint documentation
- **Both:** Most teams use OpenSpec for features + OpenAPI for API contracts

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

## The Shift: From Implementation to Architecture & Judgment

**How has the role of software engineers changed with AI?**

Honestly: **fundamentally**. But not the way some fear.

We didn't stop being engineers. We evolved.

**What changed:**

**Before AI:**
- 70% of my time was **writing code**
- 20% was **thinking about architecture & design**
- 10% was **code review & verification**

**After AI (and doing it right):**
- 15% writing code (boilerplate, glue, trivial stuff the AI can handle in seconds)
- 50% **designing systems & specs** (being explicit about what to build)
- 25% **guiding AI** (writing good prompts, providing context, setting constraints)
- 10% **auditing AI output** (verifying correctness, security, fit)

The skill that mattered most — **thinking clearly** — got more important, not less.

**What we lost:**
- Typing speed is irrelevant now
- Memorizing APIs is pointless (AI knows them better)
- Time spent on boilerplate is wasted time
- "I know this obscure library" is not a differentiator

**What we gained:**
- **Judgment** is now the scarcest resource
  - Does this AI solution fit our business?
  - Is it architecturally sound for *our* system (not just any system)?
  - Can our team maintain this?
  - Does it ship on deadline?
  - Is it secure for *our* threat model?

- **Context mastery** became critical
  - Understanding your codebase deeply
  - Knowing your team's constraints
  - Understanding your business requirements
  - Being able to articulate these to the AI

- **Verification skills** are harder now
  - You can't just read code line-by-line
  - You need to think about edge cases the AI missed
  - You need to test against *your* specific scenarios
  - You need security mindset, not just syntax knowledge

**My take on the role change:**

We shifted from **"builders of features"** to **"architects of systems assisted by AI"**.

The AI is not a replacement. It's a multiplicative force. But only if you know how to steer it.

This is why **senior developers** become more valuable, not less:
- Juniors can now write code faster (given a good spec and AI)
- But they still need seniors to write the spec
- They still need seniors to review whether the code is *correct* (not just syntactically valid)
- They still need seniors to say "this approach won't work for our constraints"

**The new core skill: Knowing when to trust AI, and when to override it.**

A junior asks the AI "how do I paginate this API?" and trusts the first answer. A senior asks:
- Does this fit our data model?
- Will this work at our scale (1M users vs 100 users)?
- Does this expose data we shouldn't expose?
- Can our team maintain this in 2 years?
- Does this match our existing patterns?

The AI might give the textbook answer. You give the *correct* answer for your context.

**What happens if you don't maintain technical depth:**

If you become pure "prompt writer" without deep technical knowledge:
- You can't evaluate if AI output is correct
- You'll accept hallucinations as truth
- You'll deploy insecure code because you didn't verify
- You'll build things that don't fit your business
- You'll become a bottleneck instead of a multiplier (because you can't make good judgment calls)

**What happens if you stay deep technically + learn to use AI:**

- You make better design decisions (because you understand trade-offs)
- You guide AI effectively (because you know what good looks like)
- You catch AI mistakes immediately (because you have a baseline to compare against)
- You're 10x faster (because the AI handles the mechanical parts)
- Your judgment is trusted by the team (because it's grounded in expertise)

**Practically, here's what I do:**

1. **I write detailed specs** (not because the AI can't write code, but because I need clarity)
2. **I guide the AI** with context (CLAUDE.md, architecture decisions, constraints)
3. **I review thoroughly** (tests pass, but does it make sense for *our* system?)
4. **I don't accept "it works"** — I ask "why did you make that choice? Is there a better way given our constraints?"
5. **I maintain my chops** (I still read code, understand my codebase, know my infrastructure)
6. **I make the final call** (does this ship? Does it align with business? Is it maintainable?)

**The hard truth:**

If AI makes you obsolete, it's because you made yourself obsolete by stop thinking.

AI makes you more powerful if you use it as a tool to amplify your judgment, not replace it.

**In interviews, here's what I say:**

"AI hasn't changed what makes a senior developer valuable — judgment and taste. It's just made those skills more important and less forgiving. I use AI to move fast, but I move fast in the *right direction* because I understand the domain deeply. The AI is the accelerator. I'm the steering wheel."

---

## Quick Reference: AI Development Maturity

| Level | Characteristics |
|-------|----------------|
| **Beginner** | Uses autocomplete (Copilot). Accepts suggestions without review. No project context setup. |
| **Intermediate** | Uses AI chat for code generation. Writes decent prompts. Reviews output. Knows about context windows. |
| **Advanced** | Uses AI agents with tool use. Maintains project docs (CLAUDE.md). Follows spec-driven development. Uses TDD with AI. Configures MCP servers for tooling integration. Builds custom skills and hooks for team workflows. Understands model selection, cost tradeoffs, and when NOT to use AI. |

A senior developer should be at the Advanced level — not just using AI, but architecting how the team uses it.
