# HR & Behavioral Questions

> Prepared answers for classic behavioral questions. Use STAR method (Situation, Task, Action, Result). Keep each answer under 2 minutes. Practice with a timer or record yourself on Loom.

---

## Tips Before You Start

### Connecting with the Interviewer (Silver.dev)
- **The goal is not to pass — it's to make them want to work with you.** A "Strong Yes" means the interviewer becomes your champion.
- **Treat the interviewer as an equal**, not an examiner. The interview is bidirectional — you're also evaluating them.
- **The interviewer wants you to pass.** Failed interviews are frustrating for them too. They want to help — collaborate with them.
- **Don't cause friction.** Don't complain about the process, the industry, or previous employers.
- **Show enthusiasm.** If you seem apathetic, they won't want you on their team.
- **If it's going badly, reset.** Ask: "What should I focus on to make the most of the remaining time?" Don't freeze like a deer in headlights.

### American Work Culture (Silver.dev)
- **Ownership matters.** Americans value people who take responsibility for outcomes, not just complete assigned tasks. Don't say "I fulfill my hours and do what I'm told."
- **Results-based evaluation.** Your accent, background, or location don't matter if you deliver results. This is an advantage for remote workers.
- **Company values matter.** Research the company's values and have examples of how you align. Don't say "I don't care about company values."
- **Don't bring up salary/money early.** Focus on the opportunity, growth, and challenge first.

---

## The Questions

### 1. Tell me about yourself

I'm a Senior Software Engineer with 6+ years of experience, based in Buenos Aires. I specialize in backend development — microservices, distributed systems, and integrations. I've built an authorization platform at Mercado Libre that served millions of users, insurance microservices at UenoBank, and I currently own the seller integration platform at NocNoc. I have a B.S. in Information Systems from UNLP, an AWS certification, and C1 English. I'm looking for my next challenge where I can own critical systems and grow toward technical leadership.

> **Do:** Highlight relevant experience. Keep it under 90 seconds. End with what you're looking for.
> **Don't:** List every job chronologically. Mention irrelevant hobbies. Go over 2 minutes.

### 2. Why are you interested in this position?

<!-- TODO: Customize per company. Research the product, tech stack, and engineering blog. -->

Template: "I'm excited about [specific product/feature] because [connection to my experience]. I noticed you're using [tech/approach] which aligns with my experience building [relevant system]. I'm looking for [ownership/scale/growth] and this role seems like the right fit because [specific reason]."

> **Do:** Mention specific features and characteristics of the product. Show you've done research.
> **Don't:** Talk generically about the industry. Focus only on personal gain (salary, remote work).

### 3. Why are you leaving your current role?

I've had a great experience at NocNoc — I've built key services and owned critical systems. But I'm looking for the next step in my career: working at a larger scale, with a stronger engineering culture, and more opportunities to grow into technical leadership. I want to be challenged by harder problems.

> **Do:** Be positive about your current role. Focus on growth and new challenges.
> **Don't:** Badmouth your current employer. Mention money as the primary reason.

### 4. Tell me about a time you disagreed with your manager or leadership

**Situation:** At UenoBank, the team was building insurance integrations with external providers. The initial approach was synchronous HTTP calls for everything, including policy issuance.

**Task:** I believed this would create reliability issues — if the external provider was slow or down, our entire flow would block and users would get errors.

**Action:** I proposed an alternative: use async communication with retry patterns and circuit breakers for non-critical calls, keeping only the essential verification synchronous. I prepared a short technical document showing failure scenarios and presented it to my lead. I wasn't confrontational — I framed it as "here's a risk I see and a possible mitigation."

**Result:** The lead agreed. We implemented the resilient pattern, and when the external provider had downtime weeks later, our system handled it gracefully instead of cascading failures to users.

### 5. Tell me about a time you had to work with an underperforming team member

**Situation:** At Kavak, a junior developer on the team was consistently delivering PRs with bugs and missing edge cases, which slowed down the whole team's velocity.

**Task:** As a semi-senior, I wasn't their manager, but I needed to find a way to improve the situation without overstepping.

**Action:** I started doing more thorough PR reviews with detailed, constructive comments — not just "this is wrong" but "here's why and here's how I'd approach it." I also pair-programmed with them on a couple of complex features to help them understand our patterns. I focused on the code, not the person.

**Result:** Over a few weeks, the quality of their PRs improved significantly. They started catching edge cases themselves and even began reviewing other people's code more carefully. The lead noticed and thanked me for the mentorship.

### 6. What was the most difficult technical challenge you faced?

**Situation:** At Mercado Libre, I worked on the authorization platform — a policy-based access control system in the critical path of every MELI application.

**Task:** We needed to build multi-language SDKs (Java, Go, Python, Node.js) and a Docker sidecar deployment model that could handle the scale of Mercado Libre — millions of requests, with strict latency requirements.

**Action:** I owned the development of the SDKs, ensuring consistent behavior across languages while respecting each language's idioms. We ran rigorous stress testing, identified bottlenecks in the policy evaluation engine, and optimized the hot path. I also participated in on-call rotations, dealing with production incidents in real-time.

**Result:** The platform shipped successfully and became the standard authorization mechanism across Mercado Libre's ecosystem. The stress tests validated it could handle real-world scale without degrading latency.

> See [05-experience-cases.md](05-experience-cases.md) for more detailed versions of technical stories.

### 7. Tell me about a project that failed or didn't go as planned

**Situation:** At Emi Labs, we were building integrations for a new enterprise client with very specific requirements that didn't fit our standard architecture.

**Task:** The temptation was to build a fully custom solution for this client, but I knew that would fragment our codebase and make maintenance a nightmare.

**Action:** I proposed building a generic abstraction layer that could serve this client's needs while remaining extensible for future clients. However, the timeline was tight and I underestimated the complexity of making it truly generic. We had to cut scope and deliver a more specific solution first, then refactor to the generic version later.

**Result:** We met the deadline but accumulated some technical debt. The lesson was: don't over-engineer under time pressure. Ship the specific solution, prove it works, then generalize. I applied this principle successfully in later projects.

### 8. Questions to ask the interviewer

**About the role:**
- What does a typical day/week look like for this role?
- What are the biggest technical challenges the team is facing right now?
- How do you measure success for this position in the first 6 months?

**About the team:**
- How big is the engineering team? How is it structured?
- What does the code review process look like?
- What's the on-call situation?

**About the company:**
- What's the company's runway / financial situation?
- What's the employee attrition rate like?
- How has the engineering culture evolved in the last year?

**About growth:**
- What does the career path look like for a Senior Engineer here?
- Are there opportunities for technical leadership?
- How does the company support professional development?

> **Do:** Ask questions that show genuine curiosity and research. Ask about challenges, not just perks.
> **Don't:** Ask things easily found on the website. Ask about salary/benefits in the first round.
