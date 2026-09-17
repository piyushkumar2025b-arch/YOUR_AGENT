export * from "./masterPrompt";
export * from "./devopsPrompt";
export * from "./uiuxPrompt";
export * from "./databasePrompt";
export * from "./architectPrompt";
export * from "./testingPrompt";
export * from "./securityPrompt";
export * from "./reviewerPrompt";

export interface AgentSpec {
  id: string;
  name: string;
  role: string;
  avatar: string;
  sequenceOrder: number; // Sequence ranking (1 to 7)
  priority: number;
  description: string;
  capabilities: string[];
  systemPrompt: string;
}

export interface SuggestedWorkflowStep {
  title: string;
  agentId: string;
  inputPrompt: string;
  targetPath?: string;
}

export interface SuggestedWorkflowChain {
  id: string;
  title: string;
  description: string;
  agentIds: string[];
  icon: string;
  steps: SuggestedWorkflowStep[];
}

import { DEVOPS_AGENT_PROMPT } from "./devopsPrompt";
import { UIUX_AGENT_PROMPT } from "./uiuxPrompt";
import { DATABASE_AGENT_PROMPT } from "./databasePrompt";
import { ARCHITECT_AGENT_PROMPT } from "./architectPrompt";
import { TESTING_AGENT_PROMPT } from "./testingPrompt";
import { SECURITY_AGENT_PROMPT } from "./securityPrompt";
import { REVIEWER_AGENT_PROMPT } from "./reviewerPrompt";

export const SPECIALIST_AGENTS: AgentSpec[] = [
  {
    id: "architect_agent",
    name: "Project Architect",
    role: "Software Systems Architect",
    avatar: "🏛️",
    sequenceOrder: 1,
    priority: 10,
    description: "Folder structure, class diagrams, API architecture, SOLID principles & technology selection.",
    capabilities: [
      "Folder Structures", "Domain Models", "API Contracts", "SOLID Compliance",
      "Module Boundaries", "State Management", "Design Patterns"
    ],
    systemPrompt: ARCHITECT_AGENT_PROMPT
  },
  {
    id: "database_agent",
    name: "Database Agent",
    role: "Database Architect & Query Optimizer",
    avatar: "🗄️",
    sequenceOrder: 2,
    priority: 9,
    description: "Database schemas, ER diagrams, migrations, SQL optimization & indexing strategies.",
    capabilities: [
      "PostgreSQL", "MySQL", "SQLite", "Supabase", "Prisma/Drizzle",
      "ER Diagrams", "SQL Migrations", "Indexing & Constraints"
    ],
    systemPrompt: DATABASE_AGENT_PROMPT
  },
  {
    id: "uiux_agent",
    name: "UI/UX Agent",
    role: "User Experience & Interface Specialist",
    avatar: "🎨",
    sequenceOrder: 3,
    priority: 8,
    description: "Responsive layouts, Tailwind CSS, accessibility (a11y), dark mode & design systems.",
    capabilities: [
      "Responsive Layouts", "Tailwind CSS", "Animations", "Accessibility (a11y)",
      "Dark Mode", "Component Hierarchy", "Design Systems", "Typography"
    ],
    systemPrompt: UIUX_AGENT_PROMPT
  },
  {
    id: "devops_agent",
    name: "DevOps Agent",
    role: "Deployment & Infrastructure Specialist",
    avatar: "🚀",
    sequenceOrder: 4,
    priority: 7,
    description: "Deployment, CI/CD pipelines, Docker, Kubernetes, Terraform & Cloud Infrastructure.",
    capabilities: [
      "Dockerfile", "docker-compose.yml", "Kubernetes", "Helm", "Nginx",
      "GitHub Actions", "Terraform", "Monitoring & Logging"
    ],
    systemPrompt: DEVOPS_AGENT_PROMPT
  },
  {
    id: "testing_agent",
    name: "Test Generator Agent",
    role: "Quality Assurance & Automated Testing Specialist",
    avatar: "🧪",
    sequenceOrder: 5,
    priority: 6,
    description: "Unit tests, integration tests, E2E tests, mocks, fixtures & regression suites.",
    capabilities: [
      "Vitest/Jest", "React Testing Library", "Mock Services",
      "Edge-Case Scenarios", "Regression Testing", "Coverage Analysis"
    ],
    systemPrompt: TESTING_AGENT_PROMPT
  },
  {
    id: "security_agent",
    name: "Security Agent",
    role: "Cybersecurity & Vulnerability Audit Specialist",
    avatar: "🛡️",
    sequenceOrder: 6,
    priority: 5,
    description: "OWASP Top 10 audit, SQLi/XSS prevention, JWT flaws, secrets detection & security scoring.",
    capabilities: [
      "SQLi & XSS Detection", "CSRF/SSRF Auditing", "Authentication Hardening",
      "Secrets Scanning", "OWASP Top 10", "Remediation Blueprints"
    ],
    systemPrompt: SECURITY_AGENT_PROMPT
  },
  {
    id: "reviewer_agent",
    name: "Code Reviewer Agent",
    role: "Senior Staff Engineer Code Reviewer",
    avatar: "🧐",
    sequenceOrder: 7,
    priority: 4,
    description: "Deep code review, maintainability scoring, DRY/SOLID evaluation & refactoring guidelines.",
    capabilities: [
      "Readability & Maintainability", "Performance Auditing", "Code Smells Identification",
      "SOLID & DRY Principles", "Actionable Refactoring", "Final Verdict Scoring"
    ],
    systemPrompt: REVIEWER_AGENT_PROMPT
  }
];

export const SUGGESTED_WORKFLOW_CHAINS: SuggestedWorkflowChain[] = [
  {
    id: "build_saas",
    title: "Build a SaaS App",
    description: "Architect → Database → UI/UX → DevOps",
    agentIds: ["architect_agent", "database_agent", "uiux_agent", "devops_agent"],
    icon: "🚀",
    steps: [
      {
        title: "1. Architect Domain Models & Contracts",
        agentId: "architect_agent",
        inputPrompt: "Analyze the workspace requirements and define comprehensive TypeScript domain models, user roles, subscription statuses, and API contract interfaces.",
        targetPath: "src/types/saas.ts"
      },
      {
        title: "2. Design Database Schema & Indexes",
        agentId: "database_agent",
        inputPrompt: "Design production-ready SQL database schema with accounts, users, subscriptions, audit_logs tables, foreign keys, and optimized indexes.",
        targetPath: "src/db/schema.sql"
      },
      {
        title: "3. Build Modern SaaS Dashboard UI",
        agentId: "uiux_agent",
        inputPrompt: "Build a responsive SaaS dashboard view using Tailwind CSS featuring KPI metrics cards, activity feed, and accessible interactive filters.",
        targetPath: "src/components/SaaSDashboard.tsx"
      },
      {
        title: "4. Production DevOps & Docker Setup",
        agentId: "devops_agent",
        inputPrompt: "Generate a multi-stage production Dockerfile, .dockerignore, and docker-compose.yml configuration with secure networking and health checks.",
        targetPath: "Dockerfile"
      }
    ]
  },
  {
    id: "review_repo",
    title: "Review Repository",
    description: "Code Reviewer → Security Audit → Test Generator",
    agentIds: ["reviewer_agent", "security_agent", "testing_agent"],
    icon: "🔍",
    steps: [
      {
        title: "1. Staff Engineer Code Quality Audit",
        agentId: "reviewer_agent",
        inputPrompt: "Perform deep review of workspace code quality, evaluate SOLID/DRY compliance, assign quality score (0-100), and highlight strengths and weaknesses."
      },
      {
        title: "2. Cybersecurity & OWASP Top 10 Audit",
        agentId: "security_agent",
        inputPrompt: "Scan codebase for OWASP Top 10 vulnerabilities, unsanitized inputs, hardcoded secrets, and auth bypass risks. Provide surgical fix patches."
      },
      {
        title: "3. Automated Test Suite Generation",
        agentId: "testing_agent",
        inputPrompt: "Generate comprehensive unit and integration tests covering primary business logic and edge cases using Vitest/Jest.",
        targetPath: "src/tests/app.test.ts"
      }
    ]
  },
  {
    id: "fullstack_feature",
    title: "Fullstack Feature Pipeline",
    description: "Architect → Database → UI/UX → QA Tests",
    agentIds: ["architect_agent", "database_agent", "uiux_agent", "testing_agent"],
    icon: "⚡",
    steps: [
      {
        title: "1. Architect Feature Specifications",
        agentId: "architect_agent",
        inputPrompt: "Define state machines, data flow, and TypeScript interfaces for the new feature module.",
        targetPath: "src/types/feature.ts"
      },
      {
        title: "2. Create Feature Database Schema",
        agentId: "database_agent",
        inputPrompt: "Write SQL DDL tables, migration queries, and indexing for the feature data models.",
        targetPath: "src/db/feature_schema.sql"
      },
      {
        title: "3. Build Responsive Feature Component",
        agentId: "uiux_agent",
        inputPrompt: "Implement the interactive user interface using Tailwind CSS with mobile-first responsive layout and animations.",
        targetPath: "src/components/FeatureView.tsx"
      },
      {
        title: "4. Generate Unit & Integration Tests",
        agentId: "testing_agent",
        inputPrompt: "Create automated unit tests verifying feature logic, state transitions, and error handling.",
        targetPath: "src/tests/feature.test.ts"
      }
    ]
  },
  {
    id: "deploy_project",
    title: "Deploy Infrastructure",
    description: "DevOps Infrastructure & CI/CD",
    agentIds: ["devops_agent"],
    icon: "📦",
    steps: [
      {
        title: "1. Multi-Stage Dockerfile & CI/CD",
        agentId: "devops_agent",
        inputPrompt: "Generate production-grade Dockerfile, docker-compose.yml, and GitHub Actions CI workflow with caching and automated lint/test stages.",
        targetPath: "Dockerfile"
      }
    ]
  },
  {
    id: "design_schema",
    title: "Design Database Schema",
    description: "Database ERD, SQL & Migrations",
    agentIds: ["database_agent"],
    icon: "🗄️",
    steps: [
      {
        title: "1. Comprehensive SQL Architecture",
        agentId: "database_agent",
        inputPrompt: "Design normalized database tables, relationship constraints, performance indexes, and sample seed data.",
        targetPath: "src/db/schema.sql"
      }
    ]
  },
  {
    id: "improve_frontend",
    title: "Improve Frontend UI/UX",
    description: "UI/UX Layouts, Accessibility & Design System",
    agentIds: ["uiux_agent"],
    icon: "🎨",
    steps: [
      {
        title: "1. UI/UX Refactor & Polish",
        agentId: "uiux_agent",
        inputPrompt: "Modernize interface components with responsive Tailwind CSS utilities, accessible color contrast, micro-interactions, and dark mode compliance.",
        targetPath: "src/components/DesignSystemShowcase.tsx"
      }
    ]
  }
];
