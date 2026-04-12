export interface CoursePhase {
  name: string;
  lessons: string[];
}

export interface CourseHighlight {
  title: string;
  description: string;
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  color: string;
  glowColor: string;
  image: string;
  totalLessons: number;
  totalSections: number;
  estimatedHours: number;
  topics: string[];
  prerequisite: string | null;
  status: "active" | "planned";
  phases: CoursePhase[];
  didacticHighlights?: CourseHighlight[];
  whatYouLearn?: string[];
  targetAudience?: string[];
  screenshots?: string[];
}

export const courses: Course[] = [
  {
    id: "typescript",
    slug: "typescript",
    name: "TypeScript Deep Learning",
    tagline: "From basics to type-level programming — 44 lessons, 5 phases",
    description:
      "The most comprehensive TypeScript course you'll find in a terminal. 44 lessons, 5 phases, from primitives to the Compiler API.",
    longDescription: `This course isn't a simple tutorial — it's a systematic, in-depth learning program that takes you from absolute TypeScript beginner to true expert across 5 phases and 44 lessons.

Every single lesson follows our proven LEARN cycle: You read the theory with diagrams and analogies, explore runnable code examples, apply your knowledge in exercises with increasing difficulty, reflect on your understanding in interactive terminal quizzes, and retain everything through compact cheatsheets.

What makes it special: Our spaced repetition system remembers which concepts you've learned and reminds you of them right before you'd forget. This way you build real, long-term knowledge — not a superficial tutorial experience.

The course covers everything: from primitive types and interfaces through generics, mapped types and conditional types all the way to decorators, the Compiler API, and type-level programming. Phase 5 even goes beyond the usual with TypeScript security, RxJS integration, and advanced design patterns.`,
    color: "#3B82F6",
    glowColor: "rgba(59, 130, 246, 0.4)",
    image: "/course_typescript.png",
    totalLessons: 44,
    totalSections: 239,
    estimatedHours: 82,
    topics: [
      "Primitives & Inference",
      "Generics & Constraints",
      "Mapped & Conditional Types",
      "Template Literal Types",
      "Decorators & Metaprogramming",
      "Compiler API & AST",
      "Security & Migration",
      "RxJS Integration",
      "Design Patterns",
    ],
    prerequisite: null,
    status: "active",
    screenshots: [
      "/screenshots/kodo_typescript_screen_1.png",
      "/screenshots/kodo_typescript_screen_2.png",
      "/screenshots/kodo_typescript_screen_3.png"
    ],
    targetAudience: [
      "JavaScript developers who want to truly understand TypeScript",
      "Self-learners looking for a structured learning path",
      "Developers preparing for Angular, React, or Next.js",
      "Professionals who want to deepen their type system knowledge",
    ],
    whatYouLearn: [
      "All primitive types and when to use annotations vs. inference",
      "Generics: from basics to complex higher-order types",
      "Master mapped types, conditional types, and template literal types",
      "Discriminated unions and exhaustive pattern matching",
      "Branded/nominal types for type-safe IDs and opaque types",
      "Result<T,E> patterns for type-safe error handling",
      "Decorators (legacy & Stage 3) for metaprogramming",
      "The Compiler API and AST manipulation",
      "Type-level programming — computing with the type system",
      "15+ design patterns (GoF, SOLID, Builder, State Machine) implemented type-safely",
      "TypeScript security: recognizing and avoiding dangerous patterns",
      "Fully type-safe RxJS pipeline design",
    ],
    didacticHighlights: [
      {
        title: "Spaced Repetition",
        description: "Every concept is automatically added to your review system. The algorithm schedules reviews optimally — right before you'd forget.",
      },
      {
        title: "Adaptive Reading Depth",
        description: "Every section offers 3 modes: summary, standard, and deep-dive. You decide how deep you want to go.",
      },
      {
        title: "Interactive Quizzes",
        description: "At the end of every lesson: multiple choice, code gaps, and concept questions — right in the terminal.",
      },
      {
        title: "Annotated Code Blocks",
        description: "Code examples with line-by-line annotations that explain what each line does and why.",
      },
      {
        title: "Review Challenges",
        description: "Every 10 lessons: a phase review that combines everything you've learned and tests your understanding.",
      },
      {
        title: "Mermaid Diagrams",
        description: "Complex relationships are displayed as visual diagrams right in the terminal.",
      },
    ],
    phases: [
      {
        name: "Phase 1 — Foundations",
        lessons: [
          "Setup & First Steps",
          "Primitive Types",
          "Type Annotations & Inference",
          "Arrays & Tuples",
          "Objects & Interfaces",
          "Functions",
          "Union & Intersection Types",
          "Type Aliases vs Interfaces",
          "Enums & Literal Types",
          "Review Challenge",
        ],
      },
      {
        name: "Phase 2 — Type System Core",
        lessons: [
          "Type Narrowing",
          "Discriminated Unions",
          "Generics Basics",
          "Generic Patterns",
          "Utility Types",
          "Mapped Types",
          "Conditional Types",
          "Template Literal Types",
          "Modules & Declarations",
          "Review Challenge",
        ],
      },
      {
        name: "Phase 3 — Advanced TypeScript",
        lessons: [
          "Classes & OOP",
          "Advanced Generics",
          "Recursive Types",
          "Branded/Nominal Types",
          "Type-safe Error Handling",
          "Advanced Patterns",
          "Declaration Merging",
          "Decorators",
          "tsconfig Deep Dive",
          "Review Challenge",
        ],
      },
      {
        name: "Phase 4 — Real-World Mastery",
        lessons: [
          "Async TypeScript",
          "Type-safe APIs",
          "Testing TypeScript",
          "Performance & Compiler",
          "Migration Strategies",
          "Library Authoring",
          "Type-Level Programming",
          "Compiler API",
          "Best Practices",
          "Capstone Project",
        ],
      },
      {
        name: "Phase 5 — Mastery Plus",
        lessons: [
          "TypeScript 5.x Features",
          "TypeScript Security",
          "TypeScript with RxJS",
          "Advanced Design Patterns",
        ],
      },
    ],
  },
  {
    id: "angular",
    slug: "angular",
    name: "Angular Mastery",
    tagline: "Component Architecture, Signals, RxJS & DI",
    description:
      "Learn Angular from the ground up — with Signals, modern component design, Dependency Injection, and testing. Requires TypeScript Phase 2 and takes you to production level.",
    color: "#EF4444",
    glowColor: "rgba(239, 68, 68, 0.4)",
    image: "/course_angular.png",
    totalLessons: 40,
    totalSections: 212,
    estimatedHours: 68,
    topics: [
      "Components & Templates",
      "Signals & Reactivity",
      "RxJS Patterns",
      "Dependency Injection",
      "Routing & Guards",
      "Testing & E2E",
      "Server-Side Rendering",
    ],
    prerequisite: "typescript",
    status: "planned",
    phases: [
      {
        name: "Phase 1 — Angular Foundations",
        lessons: [
          "Angular CLI & Workspace",
          "Components Basics",
          "Templates & Bindings",
          "Directives",
          "Pipes",
          "Services & DI",
          "Modules",
          "Signals Intro",
          "Component Communication",
          "Review Challenge",
        ],
      },
      {
        name: "Phase 2 — Core Concepts",
        lessons: [
          "Reactive Forms",
          "Template-Driven Forms",
          "HTTP Client",
          "RxJS Operators",
          "Routing",
          "Guards & Resolvers",
          "Lazy Loading",
          "State Management",
          "Advanced Signals",
          "Review Challenge",
        ],
      },
    ],
  },
  {
    id: "react",
    slug: "react",
    name: "React with TypeScript",
    tagline: "Hooks, Patterns, Performance — all type-safe",
    description:
      "React, done right. With TypeScript from the start. Hook types, component patterns, context, performance optimization, and testing.",
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.4)",
    image: "/course_react.png",
    totalLessons: 40,
    totalSections: 200,
    estimatedHours: 140,
    topics: [
      "Hooks & Custom Hooks",
      "Component Patterns",
      "Context & State",
      "Performance Tuning",
      "Testing Strategies",
    ],
    prerequisite: "typescript",
    status: "planned",
    phases: [
      {
        name: "Phase 1 — React Foundations",
        lessons: [
          "JSX & TypeScript",
          "Components & Props",
          "State & useState",
          "Events & Handlers",
          "Conditional Rendering",
          "Lists & Keys",
          "useEffect & Lifecycle",
          "Custom Hooks",
          "Forms & Inputs",
          "Review Challenge",
        ],
      },
    ],
  },
  {
    id: "nextjs",
    slug: "nextjs",
    name: "Next.js Production",
    tagline: "App Router, Server Components, Deployment",
    description:
      "The full-stack framework for React. Learn App Router, Server Components, caching strategies, and production deployment.",
    color: "#A855F7",
    glowColor: "rgba(168, 85, 247, 0.4)",
    image: "/course_typescript.png",
    totalLessons: 20,
    totalSections: 100,
    estimatedHours: 60,
    topics: [
      "App Router",
      "Server Components",
      "Caching & ISR",
      "API Routes",
      "Deployment & CI/CD",
    ],
    prerequisite: "react",
    status: "planned",
    phases: [
      {
        name: "Phase 1 — Next.js Foundations",
        lessons: [
          "Project Setup & File Conventions",
          "Routing & Layouts",
          "Server vs Client Components",
          "Data Fetching",
          "Loading & Error States",
          "API Route Handlers",
          "Middleware",
          "Static & Dynamic Rendering",
          "Image & Font Optimization",
          "Review Challenge",
        ],
      },
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
