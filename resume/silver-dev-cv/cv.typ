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
#descript[Senior Software Engineer with 5+ years of experience designing, building, and shipping production systems across fintech, e-commerce, and platform infrastructure. Specialized in backend development with a strong focus on microservices architecture, distributed systems, and third-party integrations. Experienced working with US-based clients and global teams. English proficiency: C1 Advanced (Cambridge CAE certified).]

#sectionsep
// Experience
#section("Experience")

#job(
  position: "Senior Software Engineer",
  institution: [NocNoc],
  location: "Argentina",
  date: "Aug 2025 - Present",
  description: [
    - Part of the Sellers team, building the integration layer enabling sellers to connect through multiple channels: public API, Shopify, SFTP, and Seller Center.
    - Owned the Amazon Scraper service, a business-critical microservice for fetching and synchronizing product data from Amazon — directly driving sales performance and marketplace reputation.
    - Designed distributed rate limiting to comply with Amazon API throttling policies while ensuring high-throughput data synchronization.
  ],
)

#job(
  position: "Senior Software Engineer",
  institution: [itti (UenoBank)],
  location: "Argentina",
  date: "Oct 2024 - Aug 2025",
  description: [
    - Built the Insurance Core platform from the ground up. Architected and developed the Insurance Manager microservice — the central orchestration engine for policy issuance.
    - Created a generic, scalable foundation powering every insurance product launch (life, mobile, commercial, home insurance).
    - Designed resilient integration layers with a legacy external provider using circuit breaker, async communication, and retry patterns.
  ],
)

#job(
  position: "Semi-Senior Software Engineer",
  institution: [Emi Labs],
  location: "Argentina",
  date: "Aug 2023 - Apr 2024",
  description: [
    - Part of the integrations team at an AI-powered recruitment platform serving 50+ enterprise clients (Walmart, Coca-Cola FEMSA, Heineken) processing 12M+ conversations.
    - Built the integration layer enabling US and Mexico-based clients to connect to Emi's ecosystem.
    - Balanced client-specific customizations with developing a generic, scalable cross-client solution.
  ],
)

#job(
  position: "Semi-Senior Software Engineer",
  institution: [Kavak],
  location: "Argentina",
  date: "Jul 2022 - Aug 2023",
  description: [
    - Worked in Kavak's fintech division (Capital), automating core banking processes — delivering directly profitable, high-impact solutions.
    - Designed and built greenfield microservices across a polyglot stack: Go, Node.js (TypeScript), and Java 11+ with Spring Boot and Hibernate/JPA.
    - Built full-stack solutions including backend services backed by PostgreSQL and an internal backoffice with Angular and NestJS.
  ],
)

#job(
  position: "Software Development Analyst → Semi-Senior Software Engineer (Promoted)",
  institution: [Mercado Libre],
  location: "Argentina",
  date: "Feb 2021 - Jul 2022",
  description: [
    - Designed and built core components of Mercado Libre's new authorization platform — an AWS IAM-inspired, policy-based access control system in the critical path of every application at MELI.
    - Developed multi-language SDKs (Java, Go, Python, Node.js) and a Docker-based sidecar deployment model for internal engineering teams.
    - Services handled massive traffic volumes impacting millions of users. On-call rotations for production incident response.
  ],
)

#job(
  position: "Fullstack Software Engineer",
  institution: [Technisys],
  location: "Argentina",
  date: "Oct 2020 - Jan 2021",
  description: [
    - Worked in a globally distributed, multicultural team — the first at Technisys to deliver a project for a North American client.
    - Contributed to adapting the company's core banking platform to meet US market requirements. All collaboration in English across multiple time zones.
  ],
)

#job(
  position: "Engineering Associate",
  institution: [Southworks],
  location: "Argentina",
  date: "Apr 2020 - Oct 2020",
  description: [
    - Built greenfield applications from scratch for Discovery Channel (US). All communication and Agile ceremonies in English.
    - Microservices architecture, backend development with Node.js and TypeScript, infrastructure with Pulumi on AWS, CI/CD with CircleCI, monitoring with Datadog and CloudWatch.
  ],
)

#job(
  position: "Freelance Software Developer",
  institution: [Independent],
  location: "Argentina",
  date: "2019 - 2020",
  description: [
    - Independently designed and developed Zeppelin Pedidos (zeppelinok.com), a web application for a local delivery company.
    - Owned the entire SDLC end-to-end. Built from scratch using Angular, TypeScript, and Firebase (Cloud Firestore, Realtime Database, Hosting, Auth).
  ],
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
