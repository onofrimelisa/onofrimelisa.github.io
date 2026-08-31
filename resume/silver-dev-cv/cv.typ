#import "@preview/silver-dev-cv:1.0.2": *

#show: cv.with(
  font-type: "PT Serif",
  continue-header: "false",
  name: "Melisa Onofri",
  address: "Buenos Aires, Argentina",
  lastupdated: "true",
  pagecount: "true",
  date: "2026-08-11",
  contacts: (
    (text: "+54 9 221 612 3419", link: "tel:+5492216123419"),
    (text: "LinkedIn", link: "https://www.linkedin.com/in/onofrimelisa/"),
    (text: "onofrimelisa@gmail.com", link: "mailto:onofrimelisa@gmail.com"),
  ),
)

// About
#section[About Me]
#descript[Senior Software Engineer with 6+ years of experience designing, building, and shipping production systems across fintech, e-commerce, and platform infrastructure. Specialized in backend development with a strong focus on microservices architecture, distributed systems, and third-party integrations. Experienced across both large-scale multinational product companies and fast-paced startups, as well as US-based client engagements. English proficiency: C1 Advanced (Cambridge CAE certified).]

#sectionsep
// Experience
#section("Experience")

#job(
  position: "Senior Software Engineer",
  institution: [NocNoc],
  location: "Argentina",
  date: "Aug 2025 - Present",
  description: [
    - Building the seller integration layer (public API, Shopify, SFTP, Seller Center).
    - Owned the Amazon Scraper service — a business-critical microservice for product data synchronization, with distributed rate limiting to comply with Amazon API throttling policies.
  ],
)

#job(
  position: "Senior Software Engineer",
  institution: [itti (UenoBank)],
  location: "Argentina",
  date: "Oct 2024 - Aug 2025",
  description: [
    - Architected and built the Insurance Manager microservice from scratch — the core policy issuance engine powering every insurance product (life, mobile, commercial, home).
    - Designed resilient integrations with legacy external providers using circuit breaker, async communication, and retry patterns.
    - Developed the backend of a mobile banking app, ensuring smooth user experience across critical processes like policy purchase, claims, and account management.
  ],
)

#job(
  position: "Semi-Senior Software Engineer",
  institution: [Emi Labs],
  location: "Argentina",
  date: "Aug 2023 - Apr 2024",
  description: [
    - Built the integration layer for US and Mexico clients at an AI-powered recruitment platform serving 50+ enterprises (Walmart, Coca-Cola FEMSA, Heineken) processing 12M+ conversations.
    - Balanced client-specific customizations with a generic, scalable cross-client architecture.
  ],
)

#job(
  position: "Semi-Senior Software Engineer",
  institution: [Kavak],
  location: "Argentina",
  date: "Jul 2022 - Aug 2023",
  description: [
    - Automated core banking processes in Kavak's fintech division (Capital), building greenfield microservices in Go, Node.js (TypeScript), and Java (Spring Boot, Hibernate/JPA).
    - Built backend services with PostgreSQL and an internal backoffice with Angular and NestJS.
  ],
)

#job(
  position: "Software Development Analyst → Semi-Senior Software Engineer (Promoted)",
  institution: [Mercado Libre],
  location: "Argentina",
  date: "Feb 2021 - Jul 2022",
  description: [
    - Built Mercado Libre's new AWS IAM-inspired authorization platform — a policy-based access control system in the critical path of every MELI application, impacting millions of users.
    - Developed multi-language SDKs (Java, Go, Python, Node.js) and a Docker sidecar deployment model. On-call rotations for production incidents at massive scale.
  ],
)

#job(
  position: "Engineering Associate",
  institution: [Southworks],
  location: "Argentina",
  date: "Apr 2020 - Jan 2021",
  description: [
    - Built greenfield applications from scratch for Discovery Channel (US) using Node.js, TypeScript, and microservices architecture.
    - Infrastructure provisioning with Pulumi on AWS, CI/CD with CircleCI, and production monitoring with Datadog and CloudWatch.
  ],
)

#job(
  position: "Freelance Software Developer",
  institution: [Independent],
  location: "Argentina",
  date: "2019 - 2020",
  description: [
    - Designed and developed Zeppelin Pedidos (zeppelinok.com) end-to-end using Angular, TypeScript, and Firebase (Firestore, Auth, Hosting).
  ],
)

#sectionsep
#section("Skills")
#oneline-title-item(
  title: "Languages & Frameworks",
  content: [Java, Go, TypeScript/Node.js, Kotlin, Python, Angular, React],
)
#oneline-title-item(
  title: "Cloud & Infra",
  content: [AWS, Docker, Terraform, Pulumi, Argo CD, CircleCI, Jenkins],
)
#oneline-title-item(
  title: "Databases",
  content: [PostgreSQL, MySQL, NoSQL (Firestore, DynamoDB), Key-Value Store],
)
#oneline-title-item(
  title: "Observability",
  content: [Datadog, NewRelic, Grafana, Graylog, Kibana, AWS CloudWatch],
)
#oneline-title-item(
  title: "Practices",
  content: [Microservices, REST APIs, CI/CD, Scrum, Gitflow, TDD],
)

#sectionsep
#section("Education")
#education(
  institution: [Universidad Nacional de La Plata (UNLP)],
  major: [B.S. in Information Systems (Licenciatura en Sistemas) — GPA: 3.6/4.0],
  date: "2017 - 2024",
  location: "Argentina",
)
#education(
  institution: [Universidad Nacional de La Plata (UNLP)],
  major: [University Programmer Analyst (intermediate degree) — GPA: 3.5/4.0],
  date: "2017 - 2020",
  location: "Argentina",
)

#sectionsep
#section("Certifications")
#award(award: [AWS Certified Cloud Practitioner], date: [2020], institution: [Amazon Web Services])
#award(award: [Certificate in Advanced English (CAE) — C1], date: [2016], institution: [University of Cambridge])
#award(award: [First Certificate in English (FCE) — B2], date: [2015], institution: [University of Cambridge])
#award(award: [HSK Level 3 — Mandarin Chinese], date: [2018], institution: [Hanban Confucius Institute])

#sectionsep
#section("Honors & Awards")
#award(award: [Outstanding Freshman Award], date: [2017], institution: [UNLP])
#award(award: [Academic Merit Award], date: [2018, 2020], institution: [UNLP])

#set document(author: "Melisa Onofri", title: "Melisa Onofri - Senior Software Engineer")
