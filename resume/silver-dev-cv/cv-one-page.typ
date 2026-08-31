#import "@preview/silver-dev-cv:1.0.2": *

#show: cv.with(
  font-type: "PT Serif",
  continue-header: "false",
  name: "Melisa Onofri",
  address: "Buenos Aires, Argentina",
  lastupdated: "true",
  pagecount: "false",
  date: "2026-08-11",
  contacts: (
    (text: "+54 9 221 612 3419", link: "tel:+5492216123419"),
    (text: "LinkedIn", link: "https://www.linkedin.com/in/onofrimelisa/"),
    (text: "onofrimelisa@gmail.com", link: "mailto:onofrimelisa@gmail.com"),
  ),
)

// About
#section[About Me]
#descript[Senior Software Engineer with 5+ years of experience building production systems across fintech, e-commerce, and platform infrastructure. Specialized in backend development, microservices architecture, distributed systems, and third-party integrations. Experienced with US-based clients and global teams. English proficiency: C1 Advanced (Cambridge CAE certified).]

#sectionsep
#section("Experience")

#job(
  position: "Senior Software Engineer",
  institution: [NocNoc],
  location: "Argentina",
  date: "Aug 2025 - Present",
  description: [
    - Building seller integration layer (public API, Shopify, SFTP, Seller Center). Owned the Amazon Scraper service — a business-critical microservice for product data synchronization with distributed rate limiting.
  ],
)

#job(
  position: "Senior Software Engineer",
  institution: [itti (UenoBank)],
  location: "Argentina",
  date: "Oct 2024 - Aug 2025",
  description: [
    - Architected and built the Insurance Manager microservice from scratch — the core policy issuance engine powering every insurance product (life, mobile, commercial, home). Designed resilient integrations with legacy providers using circuit breaker and async patterns.
  ],
)

#job(
  position: "Semi-Senior Software Engineer",
  institution: [Emi Labs],
  location: "Argentina",
  date: "Aug 2023 - Apr 2024",
  description: [
    - Built the integration layer for US and Mexico clients at an AI-powered recruitment platform (Walmart, Coca-Cola FEMSA, Heineken). Balanced client-specific customizations with a scalable cross-client architecture.
  ],
)

#job(
  position: "Semi-Senior Software Engineer",
  institution: [Kavak],
  location: "Argentina",
  date: "Jul 2022 - Aug 2023",
  description: [
    - Fintech division (Capital): automated core banking processes with greenfield microservices in Go, Node.js (TypeScript), and Java (Spring Boot). Built backend services with PostgreSQL and internal backoffice (Angular, NestJS).
  ],
)

#job(
  position: "Software Development Analyst → Semi-Senior Engineer (Promoted)",
  institution: [Mercado Libre],
  location: "Argentina",
  date: "Feb 2021 - Jul 2022",
  description: [
    - Built Mercado Libre's new AWS IAM-inspired authorization platform — critical path for every MELI application. Developed multi-language SDKs (Java, Go, Python, Node.js) and Docker sidecar deployment. On-call for production incidents at massive scale.
  ],
)

#job(
  position: "Engineering Associate",
  institution: [Southworks],
  location: "Argentina",
  date: "Apr 2020 - Oct 2020",
  description: [
    - Built greenfield applications for Discovery Channel (US). Node.js, TypeScript, AWS (Pulumi), CircleCI, Datadog. All communication in English.
  ],
)

#sectionsep
#section("Skills")
#oneline-title-item(
  title: "Languages",
  content: [Java, Go, TypeScript/Node.js, Kotlin, Python],
)
#oneline-title-item(
  title: "Frontend",
  content: [Angular, React],
)
#oneline-title-item(
  title: "Cloud & Infra",
  content: [AWS, Docker, Pulumi, Argo CD, CircleCI, Jenkins],
)
#oneline-title-item(
  title: "Databases",
  content: [PostgreSQL, MySQL, NoSQL (Firestore, DynamoDB)],
)
#oneline-title-item(
  title: "Observability",
  content: [Datadog, NewRelic, Kibana, AWS CloudWatch],
)

#sectionsep
#section("Education")
#education(
  institution: [Universidad Nacional de La Plata (UNLP)],
  major: [B.S. in Information Systems (Licenciatura en Sistemas) — GPA: 3.6/4.0],
  date: "2017 - 2024",
  location: "Argentina",
)

#sectionsep
#section("Certifications")
#award(award: [AWS Certified Cloud Practitioner], date: [2020], institution: [Amazon Web Services])
#award(award: [Certificate in Advanced English (CAE) — C1], date: [2016], institution: [University of Cambridge])
#award(award: [HSK Level 3 — Mandarin Chinese], date: [2018], institution: [Hanban Confucius Institute])

#set document(author: "Melisa Onofri", title: "Melisa Onofri - Senior Software Engineer")
