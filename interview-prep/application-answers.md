# Application Answers

> Actual responses submitted for job applications.

---

## 1. Describe a technically challenging project you've worked on. What made it complex and how did you solve it?

I was the owner of an initiative called Sellers Core: at my current company, our clients can manage products through different channels: a public REST API, a Shopify integration, SFTP bulk uploads, and a Seller Center UI. Each channel had been built independently with different tech stacks, duplicated validation logic, and inconsistent error handling. There were also legacy services involved, such as a monstrous monolith. We had no unified observability — when something broke, the only way to debug was digging through logs across multiple services from scratch. I proposed a solution: Sellers Core, a centralized processing layer that all channels route through. I owned it and designed it from the ground up, and the complexity came from several angles: unifying legacy systems, business logic and requirements, migrating the monolith to a microservice architecture, distributed coordination, external rate limits, consistency between a DB and messaging, and so on. As a result, we went from purely reactive (finding out about problems after sellers complained) to proactive, with differentiated alerting — business alerts for Account Managers to self-serve common issues, and technical alerts for the engineering team. This dramatically reduced the load on IT and gave sellers real-time visibility into their product status, and I was really proud of the result.

---

## 2. What would your former colleagues or manager say is your greatest strength(s)? Share a specific example from your work that demonstrates it.

They'd say it's ownership and a constant drive for quality — but always grounded in the reality of the project: deadlines, team capacity, budget, and business requirements.
I don't just pick up tasks and execute them — I take full responsibility for outcomes. When I see a problem or an opportunity to improve something, I propose a solution, build the case for it, and drive it forward. But I'm not the kind of engineer who chases technical perfection at the expense of delivery. I understand that quality means finding the right solution for the constraints you have, not the theoretically ideal one.
At my current company, I identified and led three major initiatives — Sellers Core (a centralized processing layer that unified the independent integration channels), a monolith-to-microservices migration, and a company-wide observability platform with differentiated alerting. None of these were assigned to me — I saw the problems, proposed the solutions, and owned them end to end: from the technical design and stakeholder alignment to implementation and rollout. In each case, I had to balance what I knew was the "right" architecture with what was realistic given our team size and timelines

---

## 3. Tell us about a time you took full ownership of a project or subsystem. What responsibilities did you take on, and what was the measurable outcome?

At UenoBank (a digital banking app in Paraguay), I took full ownership of the Policy Orchestrator: the service responsible for all transactional flows related to insurance policies: issuance, approval, and cancellation.
Although my role was backend software engineer, I went well beyond writing code. I led the project end to end: I broke down the requirements into backlog tasks, coordinated development with the frontend team (it was a mobile app), and owned the entire software process from initial design through delivery to end users and continuous improvement of the product.
The service acted as an orchestrator integrating with multiple external insurance providers, each with different APIs and reliability characteristics. I applied several design patterns to make it robust: a Strategy pattern so each provider implements a common interface (making it trivial to add new ones), circuit breakers on external calls to gracefully degrade when a provider is down, and async processing with retry and exponential backoff so users get immediate feedback instead of waiting on slow external calls.
The measurable outcomes: the number of issued policies increased directly after launch — users had been abandoning the old synchronous flow because it was too slow. And we could deliver new products fast because the whole policy emission process was scalable and efficient. Because of that, UenoBank became the first Paraguayan bank to offer a fully digital insurance experience.

---

## 4. If you joined Canals, what would you hope to accomplish in your first 90 days?

In the first 90 days, my goal would be to ramp up quickly, take ownership of a high-impact feature or subsystem, and ship it to customers. That's what drives me most in this world: solving a real problem that customers actually have and putting the solution in their hands.
I'd spend the first few days understanding the product deeply: both the technical architecture and how customers actually use Canals day to day. Then I'd want to own something meaningful, because I want to deliver real value early.
Beyond individual delivery, I'd also focus on understanding the team's workflows, codebase conventions, and engineering culture so I can contribute effectively and start identifying opportunities where my experience with distributed systems, integrations, and building from scratch can have the most impact.
