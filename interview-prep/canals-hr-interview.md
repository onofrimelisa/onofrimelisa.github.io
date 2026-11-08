# Canals — HR Interview Prep

> Entrevista con Recursos Humanos para **Senior Software Engineer - Argentina** (Remote).
> Fecha: 16 de octubre de 2026.

---

## Sobre Canals — Lo que tenés que saber

- **Qué hacen:** Plataforma de AI que automatiza procesos manuales para distribuidores mayoristas, fabricantes y contratistas de la industria de materiales de construcción e infraestructura.
- **Producto core:** Procesan órdenes de venta, cuentas por pagar (AP) y tracking de POs/recepciones. Toman inputs de cualquier formato (emails, PDFs, voicemails, notas escritas a mano) y los convierten en datos listos para el ERP.
- **Escala:** 100+ distribuidores como clientes, 2M+ órdenes procesadas, $2.1B+ en pagos procesados.
- **Equipo:** ~140 empleados distribuidos en Norte y Sudamérica. Remote-first.
- **Estado financiero:** Startup rentable con fuerte product-market fit. Sin hype cycles ni pivots constantes.
- **Founders:** Michael Delgado (CEO) y Erez Arnon (CTO).
- **Seguridad:** SOC 2 Type 2 certificados.
- **Valores:** Skill (contratan excelentes y dan autonomía), Motivation (creer en el impacto del producto), Communication (colaboración rápida y alineada).
- **Industria:** Multi-trillion dollar market — wholesale distribution es la columna vertebral del comercio global.

---

## Respuestas personalizadas para Canals

### 1. Tell me about yourself

I'm Melisa, a Senior Software Engineer based in Buenos Aires with 6+ years of experience building production backend systems. I specialize in microservices, distributed systems, and third-party integrations. I've built an authorization platform at Mercado Libre that served millions of users, insurance microservices at UenoBank, and I currently own the seller integration platform at NocNoc — where I designed and built a centralized processing layer that routes all seller operations from multiple channels through a single service. I have a B.S. in Information Systems, an AWS certification, and C1 English. I'm looking for a role where I can own critical backend systems, work on technically challenging problems, and keep growing toward technical leadership.

### 2. Why are you interested in Canals?

**Esta es la pregunta más importante. Personalizala bien.**

"Three things excite me about Canals:

First, **the problem space is fascinating**. Taking messy, unstructured inputs — emails, PDFs, handwritten notes, voicemails — and turning them into structured data for ERPs is a genuinely hard engineering challenge. It's the kind of integration and data processing work I love and have spent my career doing.

Second, **the AI component**. As a software engineer, working with AI-powered products is incredibly motivating right now. It's not just about staying current with modern technologies — it's about being at the frontier of how software is built and delivered. I want to be part of a team that's using AI to solve real business problems, not just experimenting with it. Canals is already doing this at scale with 100+ distributors and millions of orders processed, which tells me the AI actually works and delivers value.

Third, **the culture resonates with me**. A profitable startup that values skill, autonomy, and ownership — that's exactly the environment where I do my best work. At NocNoc I identified the need for a centralized seller processing layer and built it from scratch. At UenoBank I architected the insurance engine. I thrive when I have ownership and the trust to execute.

I also see a strong parallel between what Canals does and what I've built — processing data from multiple input channels through a unified system. At NocNoc, sellers come through a public API, Shopify, SFTP, a web UI, and an Amazon scraper, and everything routes through the centralized service I designed. That's conceptually very similar to what Canals does with orders coming from emails, PDFs, and other formats."

### 3. Why are you leaving your current role?

"I've had a great experience at NocNoc — I've owned critical systems and built key services from scratch. But I'm ready for the next step: a stronger engineering culture, harder technical problems, and the opportunity to work on a product that leverages AI at its core. Canals checks all those boxes — real AI solving real problems in a massive industry, with a team that values quality and ownership."

### 4. What do you know about our product?

"Canals is the operating AI for 100+ distributors. Your platform automates three core workflows: sales order entry — converting any customer input format into quotes and orders ready for the ERP; accounts payable — touchless invoice processing with validation against POs and business rules; and PO/receipt tracking — reading vendor communications and flagging discrepancies.

What I find impressive is the breadth of input formats you handle — emails, PDFs, voicemails, even handwritten notes — and that the ML models are trained specifically for industrial verticals like electrical, plumbing, HVAC, and building materials. Plus the implementation is lightweight — about 1-2 hours of IT time for ERP connection, which tells me the integration layer is well-designed.

Your numbers speak for themselves: 96% touchless invoice processing, 2.8x hit rate improvement for customers like Turtle, and $2.1B+ in payables submitted."

### 5. What's your experience with AI/ML?

"While I'm not an ML engineer, I have relevant experience at the intersection of AI and software engineering. At NocNoc, I work alongside the product grouping system that uses ML models to automatically group products from different marketplaces. I understand the engineering side of AI products — building reliable data pipelines, handling async processing for ML workloads, designing systems that can gracefully handle model uncertainty, and building observability around AI-powered features.

I'm also deeply invested in AI-assisted development — I use AI tools daily (Claude Code, Cursor) and understand the tooling ecosystem from LLMs and prompt engineering to MCP integrations. This isn't just about using tools — it's about understanding how AI changes the way we build software.

Working on an AI-powered product is genuinely exciting to me. As engineers, we're at a unique moment where AI is transforming not just what we build but how we build it. Being part of a company where AI is the core product — not an afterthought — means staying at the cutting edge while solving real problems. That combination of technical innovation and tangible business impact is what motivates me."

### 6. Tell me about a time you showed ownership

**Use the NocNoc sellers-core story — it's your strongest ownership case and the most relevant to Canals.**

"At NocNoc, sellers could manage products through five different channels: a public API, Shopify, SFTP uploads, a web UI, and an Amazon scraper. Each channel had been built independently with different technologies, duplicated validation, and inconsistent error handling. When sellers had issues, Account Managers couldn't resolve them — everything fell on IT.

I identified the need for a centralized processing layer and proposed building sellers-core from scratch. Before writing any code, I did a deep analysis of every existing integration — mapping out similarities, differences, and business logic across all channels. This meant dealing with legacy code from forgotten services with no documentation.

I designed and built sellers-core as the single routing point for all seller operations. The result: we went from reactive (finding out about problems after sellers complained) to proactive (catching issues before they impact sellers). We also separated business alerts for Account Managers from technical alerts for IT, which dramatically reduced the load on the engineering team."

**Por qué esto es relevante para Canals:** Es exactamente el mismo patrón — múltiples formatos de input (emails, PDFs, voicemails en el caso de Canals; API, Shopify, SFTP, scraper en NocNoc) procesados a través de un sistema unificado.

### 7. Tell me about a technical challenge

**Use the Mercado Libre authorization platform story for scale, or UenoBank for resilience patterns.**

MeLi version: "I built multi-language SDKs and a Docker sidecar deployment for Mercado Libre's authorization platform — a system in the critical path of every application in the company. The challenge was ensuring cross-language consistency while meeting strict latency requirements at millions of requests. I ran stress tests simulating real-world traffic and optimized the hot path."

UenoBank version: "I architected the Insurance Manager at UenoBank — moving policy issuance from a slow synchronous flow to an async architecture with circuit breakers, retry with exponential backoff, and dead-letter queues. Weeks after launch, an external provider had downtime and our system handled it gracefully — exactly as designed."

### 8. How do you handle working in a fast-paced startup?

"I've spent most of my career in startups. At NocNoc I'm the primary backend engineer for the seller platform — I need to move fast while maintaining quality. My approach is:
- Ship the specific solution first, then generalize (I learned this the hard way at Emi Labs when I over-engineered under time pressure)
- Build observability from day one so I can move fast with confidence
- Make reversible decisions quickly, and take more time for irreversible ones
- Communicate proactively — if something is going to take longer than expected, I flag it early"

### 9. How do you handle mentoring / code reviews?

"At Kavak, a junior developer was consistently delivering PRs with bugs and missing edge cases. I started doing thorough PR reviews with constructive, educational comments — not just 'this is wrong' but 'here's why and how I'd approach it.' I also pair-programmed on complex features. Over a few weeks, their PR quality improved significantly, and they started reviewing others' code more carefully.

I believe code review is one of the highest-leverage activities for team quality. I'm direct but constructive — I focus on the code, not the person."

### 10. What are your salary expectations?

> No traigas el tema de plata vos. Si te preguntan:

"I'd prefer to learn more about the full scope of the role and the team before discussing specific numbers. I'm flexible and more focused on finding the right fit. Could you share the range you have in mind for this position?"

### 11. Do you have any questions for us?

**Preguntas que muestran research y genuine curiosity:**

- "How is the engineering team structured? Are there dedicated teams per product area (order entry, AP, purchasing) or is it more cross-functional?"
- "What does the tech stack look like for backend services? I saw the product handles multiple input formats — I'm curious about the processing pipeline architecture."
- "How does the ML/AI team interact with the engineering team? Is there a feedback loop between production data and model improvement?"
- "What are the biggest technical challenges the team is facing right now as you scale to more distributors?"
- "How do you handle the variety of ERP integrations — is there an abstraction layer or does each ERP require custom work?"
- "What does onboarding look like for a new engineer? How long until someone is shipping to production?"
- "What's the team's approach to testing and deployments?"

---

## Puntos fuertes para resaltar durante toda la entrevista

### Conexiones directas con el producto de Canals

| Lo que hace Canals | Tu experiencia equivalente |
|---|---|
| Procesa múltiples formatos de input (emails, PDFs, voicemails) a través de un sistema unificado | sellers-core: unificaste 5 canales (API, Shopify, SFTP, UI, Scraper) en un solo servicio de procesamiento |
| Integra con ERPs de los clientes | Integraste con providers de seguros en UenoBank, sistemas de RRHH en Emi Labs, marketplaces en NocNoc |
| Maneja AI/ML en producción a escala | Trabajaste con ML models para product grouping en NocNoc |
| Necesita resiliencia en integraciones externas | Circuit breaker, retry, DLQ en UenoBank; validaron en producción con downtime real |
| Startup rentable, equipo distribuido | NocNoc es startup, equipo distribuido, vos sos la referente backend del seller platform |
| Necesita ownership y autonomía | Identificaste la necesidad de sellers-core y lo construiste de cero sin que nadie te lo pidiera |

### Diferenciadores clave

1. **Integration specialist:** Todo tu career arc es sobre "building systems that connect things" — exactamente lo que Canals necesita.
2. **AI-motivated:** Genuino interés en trabajar con AI como producto core, no solo como herramienta de desarrollo. Estar en la frontera tecnológica como ingeniera.
3. **Scale experience:** Mercado Libre te da credibilidad de que podés trabajar a escala.
4. **Startup DNA:** Experiencia en startups (NocNoc, Emi Labs, UenoBank, Kavak) — sabés moverte rápido.
5. **English proficiency:** C1 Cambridge certified, trabajaste con clientes US desde el día uno en Southworks.
6. **Ownership mindset:** No esperás que te digan qué hacer — identificás problemas y proponés soluciones.
7. **Resilience patterns:** Circuit breaker, retry, DLQ, async processing — patterns críticos para un producto que integra con ERPs y procesa documentos.

---

## Red flags a evitar

- No hables mal de NocNoc ni de empleadores anteriores
- No menciones plata/salario a menos que te pregunten
- No seas genérica — siempre conectá tus respuestas con el producto/problema de Canals
- No digas "we" sin aclarar tu contribución específica — usá "I"
- No te disculpes por no tener experiencia en ML puro — reenmarcalo como experiencia en el lado engineering de productos AI
- No preguntes cosas que están en la web (cuántos clientes tienen, qué hacen)

---

## Checklist pre-entrevista

- [ ] Revisar esta guía 30 min antes
- [ ] Tener agua y ambiente tranquilo
- [ ] Tener abierta la web de Canals por si necesitás referenciar algo
- [ ] Preparar 2-3 preguntas de la sección 11 que genuinamente te interesen
- [ ] Recordar: la entrevista es bidireccional — vos también los estás evaluando
- [ ] Sonreír y mostrar entusiasmo genuino — HR quiere ver motivación y culture fit
