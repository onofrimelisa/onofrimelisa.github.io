export const siteConfig = {
  name: "Melisa Onofri",
  accentColor: "#7c3aed",
  cvPath: "/professional-profile/cv.pdf",
  social: {
    email: "onofrimelisa@gmail.com",
    linkedin: "https://www.linkedin.com/in/onofrimelisa/",
    github: "https://github.com/melisaonofri",
  },
  defaultLang: "en" as "en" | "es",
  en: {
    title: "Senior Software Engineer",
    description: "Portfolio of Melisa Onofri - Senior Software Engineer",
    greeting: "Hello!",
    aboutMeTitle: "About Me",
    aboutMe:
      "Senior Software Engineer with 6+ years of experience designing, building, and shipping production systems across fintech, e-commerce, and platform infrastructure. Specialized in backend development with a strong focus on microservices architecture, distributed systems, and third-party integrations. Experienced across both large-scale multinational product companies and fast-paced startups, as well as US-based client engagements. Proven ability to lead technical initiatives and coordinate with stakeholders and cross-functional teams. English proficiency: C1 Advanced (Cambridge CAE certified).",
    skillsTitle: "Skills",
    skills: {
      "Languages & Frameworks": [
        "Java",
        "Go",
        "TypeScript/Node.js",
        "Kotlin",
        "Python",
        "Angular",
        "React",
        "Flutter",
      ],
      "Cloud & Infra": [
        "AWS",
        "Docker",
        "Terraform",
        "Pulumi",
        "Argo CD",
        "CircleCI",
        "Jenkins",
      ],
      Databases: [
        "PostgreSQL",
        "MySQL",
        "NoSQL (Firestore, DynamoDB)",
        "Key-Value Store",
        "Cache",
      ],
      Observability: [
        "Datadog",
        "NewRelic",
        "Grafana",
        "Graylog",
        "Kibana",
        "AWS CloudWatch",
      ],
      Practices: [
        "Microservices",
        "REST APIs",
        "CI/CD",
        "SOLID",
        "Design Patterns",
        "Spec-Driven Development",
        "Event-Driven Design",
        "Scrum",
        "Gitflow",
        "TDD",
      ],
    },
    experienceTitle: "Experience",
    experience: [
      {
        company: "NocNoc",
        title: "Senior Software Engineer",
        dateRange: "Aug 2025 - Present",
        bullets: [
          "Developed and maintained the integrations that sellers use to connect to the NocNoc ecosystem (public API, Shopify, SFTP, Seller Center) — enabling product creation and updates, order registration, package generation, and more.",
          "Owned the Amazon Scraper service — a business-critical microservice for product data synchronization that directly drives sales performance and marketplace reputation. Implemented distributed rate limiting to comply with Amazon API throttling policies.",
          "Built the sellers-core service from the ground up — a centralized processing layer through which all seller operations are routed and validated, enabling unified metrics, alerting, and observability across the entire seller integration platform.",
        ],
      },
      {
        company: "itti (UenoBank)",
        title: "Senior Software Engineer",
        dateRange: "Oct 2024 - Aug 2025",
        bullets: [
          "Architected and built the Insurance Manager microservice — the core policy issuance engine powering every insurance product (life, mobile, commercial, home).",
          "Designed resilient integrations with legacy external providers using circuit breaker, async communication, and retry patterns.",
          "Developed the backend of a mobile banking app, ensuring smooth user experience across critical processes like policy purchase, claims, and account management.",
        ],
      },
      {
        company: "Emi Labs",
        title: "Semi-Senior Software Engineer",
        dateRange: "Aug 2023 - Apr 2024",
        bullets: [
          "Built the integration layer for US and Mexico clients at an AI-powered recruitment platform serving 50+ enterprises (Walmart, Coca-Cola FEMSA, Heineken) processing 12M+ conversations.",
          "Balanced client-specific customizations with a generic, scalable cross-client architecture — designing maintainable abstractions to serve diverse enterprise requirements without fragmenting the codebase.",
        ],
      },
      {
        company: "Kavak",
        title: "Semi-Senior Software Engineer",
        dateRange: "Jul 2022 - Aug 2023",
        bullets: [
          "Automated core banking processes in Kavak's fintech division (Capital), replacing manual workflows with directly profitable, high-impact solutions. Built greenfield microservices in Go, Node.js (TypeScript), and Java (Spring Boot, Hibernate/JPA).",
          "Built backend services with PostgreSQL and an internal backoffice with Angular and NestJS. Observability with Datadog dashboards/alerts and CI/CD with Argo CD.",
        ],
      },
      {
        company: "Mercado Libre",
        title: "Software Dev Analyst → Semi-Senior (Promoted)",
        dateRange: "Feb 2021 - Jul 2022",
        bullets: [
          "Built Mercado Libre's new AWS IAM-inspired authorization platform — a policy-based access control system in the critical path of every MELI application, impacting millions of users.",
          "Developed multi-language SDKs (Java, Go, Python, Node.js) and a Docker sidecar deployment model. Rigorous stress testing to validate performance under real-world scale and on-call rotations for production incidents.",
        ],
      },
      {
        company: "Southworks",
        title: "Engineering Associate",
        dateRange: "Apr 2020 - Jan 2021",
        bullets: [
          "Built greenfield applications end-to-end for Discovery Channel (US) using Node.js, TypeScript, and microservices architecture.",
          "Infrastructure provisioning with Pulumi on AWS, CI/CD with CircleCI, and production monitoring with Datadog and CloudWatch. Earned AWS Certified Cloud Practitioner during this role.",
        ],
      },
    ],
    educationTitle: "Education",
    education: [
      {
        school: "Universidad Nacional de La Plata (UNLP)",
        degree: "B.S. in Information Systems",
        dateRange: "2017 - 2024",
        achievements: [
          "GPA: 3.6/4.0",
          "Thesis: Designed and built a full-stack e-commerce platform for a university-affiliated solidarity marketplace serving 200+ local producers.",
          "Outstanding Freshman Award, UNLP (2017)",
          "Academic Merit Award, UNLP (2018, 2020)",
        ],
      },
      {
        school: "Universidad Nacional de La Plata (UNLP)",
        degree: "University Programmer Analyst (intermediate degree)",
        dateRange: "2017 - 2020",
        achievements: [
          "GPA: 3.5/4.0 — Core CS fundamentals: data structures, algorithms, databases, software engineering, and OOP.",
        ],
      },
    ],
    certificationsTitle: "Certifications",
    certifications: [
      {
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        year: "2020",
      },
      {
        name: "HSK Level 3 — Mandarin Chinese",
        issuer: "Hanban Confucius Institute",
        year: "2018",
      },
      {
        name: "Certificate in Advanced English (CAE) — C1",
        issuer: "University of Cambridge",
        year: "2016",
      },
      {
        name: "First Certificate in English (FCE) — B2",
        issuer: "University of Cambridge",
        year: "2015",
      },
    ],
    downloadCV: "Download CV",
  },
  es: {
    title: "Ingeniera de Software Senior",
    description:
      "Portfolio de Melisa Onofri - Ingeniera de Software Senior",
    greeting: "¡Hola!",
    aboutMeTitle: "Sobre Mí",
    aboutMe:
      "Ingeniera de Software Senior con más de 6 años de experiencia diseñando, construyendo y desplegando sistemas productivos en fintech, e-commerce e infraestructura de plataformas. Especializada en desarrollo backend con fuerte foco en arquitectura de microservicios, sistemas distribuidos e integraciones con terceros. Experiencia tanto en grandes empresas multinacionales de producto como en startups de ritmo acelerado, así como en proyectos con clientes de Estados Unidos. Capacidad comprobada para liderar iniciativas técnicas y coordinar con stakeholders y equipos multifuncionales. Nivel de inglés: C1 Advanced (Cambridge CAE).",
    skillsTitle: "Skills",
    skills: {
      "Languages & Frameworks": [
        "Java",
        "Go",
        "TypeScript/Node.js",
        "Kotlin",
        "Python",
        "Angular",
        "React",
        "Flutter",
      ],
      "Cloud & Infra": [
        "AWS",
        "Docker",
        "Terraform",
        "Pulumi",
        "Argo CD",
        "CircleCI",
        "Jenkins",
      ],
      Databases: [
        "PostgreSQL",
        "MySQL",
        "NoSQL (Firestore, DynamoDB)",
        "Key-Value Store",
        "Cache",
      ],
      Observability: [
        "Datadog",
        "NewRelic",
        "Grafana",
        "Graylog",
        "Kibana",
        "AWS CloudWatch",
      ],
      Practices: [
        "Microservices",
        "REST APIs",
        "CI/CD",
        "SOLID",
        "Design Patterns",
        "Spec-Driven Development",
        "Event-Driven Design",
        "Scrum",
        "Gitflow",
        "TDD",
      ],
    },
    experienceTitle: "Experiencia",
    experience: [
      {
        company: "NocNoc",
        title: "Ingeniera de Software Senior",
        dateRange: "Ago 2025 - Presente",
        bullets: [
          "Desarrollo y mantenimiento de las integraciones que los sellers usan para conectarse al ecosistema de NocNoc (API pública, Shopify, SFTP, Seller Center) — habilitando creación y actualización de productos, registro de órdenes, generación de paquetes, y más.",
          "Responsable del servicio Amazon Scraper — un microservicio crítico para la sincronización de datos de productos que impacta directamente en ventas y reputación del marketplace. Implementación de rate limiting distribuido para cumplir con las políticas de throttling de Amazon.",
          "Construcción del servicio sellers-core desde cero — una capa centralizada de procesamiento por la cual se rutean y validan todas las operaciones de sellers, habilitando métricas unificadas, alertas y observabilidad en toda la plataforma de integración.",
        ],
      },
      {
        company: "itti (UenoBank)",
        title: "Ingeniera de Software Senior",
        dateRange: "Oct 2024 - Ago 2025",
        bullets: [
          "Arquitectura y construcción del microservicio Insurance Manager — el motor central de emisión de pólizas que impulsa todos los productos de seguros (vida, celular, comercio, hogar).",
          "Diseño de integraciones resilientes con proveedores externos legacy usando circuit breaker, comunicación asincrónica y patrones de reintento.",
          "Desarrollo del backend de una app de banca móvil, asegurando una experiencia fluida en procesos críticos como compra de pólizas, reclamos y gestión de cuentas.",
        ],
      },
      {
        company: "Emi Labs",
        title: "Ingeniera de Software Semi-Senior",
        dateRange: "Ago 2023 - Abr 2024",
        bullets: [
          "Construcción de la capa de integración para clientes de EEUU y México en una plataforma de reclutamiento con IA que atiende a 50+ empresas (Walmart, Coca-Cola FEMSA, Heineken) procesando 12M+ conversaciones.",
          "Balance entre personalizaciones por cliente y una arquitectura genérica y escalable — diseñando abstracciones mantenibles para servir requisitos empresariales diversos sin fragmentar el codebase.",
        ],
      },
      {
        company: "Kavak",
        title: "Ingeniera de Software Semi-Senior",
        dateRange: "Jul 2022 - Ago 2023",
        bullets: [
          "Automatización de procesos bancarios core en la división fintech de Kavak (Capital), reemplazando flujos manuales con soluciones de alto impacto directamente rentables. Construcción de microservicios greenfield en Go, Node.js (TypeScript) y Java (Spring Boot, Hibernate/JPA).",
          "Construcción de servicios backend con PostgreSQL y un backoffice interno con Angular y NestJS. Observabilidad con dashboards/alertas de Datadog y CI/CD con Argo CD.",
        ],
      },
      {
        company: "Mercado Libre",
        title: "Analista de Desarrollo → Semi-Senior (Promovida)",
        dateRange: "Feb 2021 - Jul 2022",
        bullets: [
          "Construcción de la nueva plataforma de autorización de Mercado Libre inspirada en AWS IAM — un sistema de control de acceso basado en políticas en el camino crítico de cada aplicación de MELI, impactando millones de usuarios.",
          "Desarrollo de SDKs multi-lenguaje (Java, Go, Python, Node.js) y un modelo de despliegue Docker sidecar. Testing de estrés riguroso para validar rendimiento a escala real y rotaciones de guardia para incidentes productivos.",
        ],
      },
      {
        company: "Southworks",
        title: "Asociada de Ingeniería",
        dateRange: "Abr 2020 - Ene 2021",
        bullets: [
          "Construcción de aplicaciones greenfield end-to-end para Discovery Channel (EEUU) usando Node.js, TypeScript y arquitectura de microservicios.",
          "Aprovisionamiento de infraestructura con Pulumi en AWS, CI/CD con CircleCI y monitoreo productivo con Datadog y CloudWatch. Obtención de la certificación AWS Certified Cloud Practitioner durante este rol.",
        ],
      },
    ],
    educationTitle: "Educación",
    education: [
      {
        school: "Universidad Nacional de La Plata (UNLP)",
        degree: "Licenciatura en Sistemas",
        dateRange: "2017 - 2024",
        achievements: [
          "Promedio: 8.51/10 — Premio Ingresante Destacado (2017), Premios al Mérito Académico (2018, 2020)",
          "Tesis: Diseño y construcción de una plataforma e-commerce full-stack para un mercado solidario universitario con 200+ productores locales.",
        ],
      },
      {
        school: "Universidad Nacional de La Plata (UNLP)",
        degree: "Analista Programador Universitario (título intermedio)",
        dateRange: "2017 - 2020",
        achievements: [
          "Promedio: 8.46/10 — Fundamentos de CS: estructuras de datos, algoritmos, bases de datos, ingeniería de software y POO.",
        ],
      },
    ],
    certificationsTitle: "Certificaciones",
    certifications: [
      {
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        year: "2020",
      },
      {
        name: "HSK Nivel 3 — Chino Mandarín",
        issuer: "Instituto Confucio Hanban",
        year: "2018",
      },
      {
        name: "Certificate in Advanced English (CAE) — C1",
        issuer: "University of Cambridge",
        year: "2016",
      },
      {
        name: "First Certificate in English (FCE) — B2",
        issuer: "University of Cambridge",
        year: "2015",
      },
    ],
    downloadCV: "Descargar CV",
  },
};
