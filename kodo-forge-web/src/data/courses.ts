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
    tagline: "Von Basics bis Type-Level Programming — 44 Lektionen, 5 Phasen",
    description:
      "Der umfassendste TypeScript-Kurs, den du im Terminal finden wirst. 44 Lektionen, 5 Phasen, von Primitives bis zur Compiler API.",
    longDescription: `Dieser Kurs ist kein einfaches Tutorial — es ist ein systematisches, tiefgründiges Lernprogramm, das dich über 5 Phasen und 44 Lektionen vom absoluten TypeScript-Anfänger zum echten Experten bringt.

Jede einzelne Lektion folgt unserem bewährten LEARN-Zyklus: Du liest die Theorie mit Diagrammen und Analogien, erkundest lauffähige Code-Beispiele, wendest dein Wissen in Übungen mit steigender Schwierigkeit an, reflektierst dein Verständnis in interaktiven Terminal-Quizzes, und behältst alles über kompakte Cheatsheets.

Das Besondere: Unser Spaced-Repetition-System merkt sich, welche Konzepte du gelernt hast, und erinnert dich genau dann an sie, bevor du sie vergessen würdest. So baust du echtes, langfristiges Wissen auf — keine oberflächliche Tutorial-Erfahrung.

Der Kurs deckt alles ab: von primitiven Typen und Interfaces über Generics, Mapped Types und Conditional Types bis hin zu Decorators, der Compiler API und Type-Level Programming. Phase 5 geht sogar über das Übliche hinaus mit TypeScript Security, RxJS-Integration und fortgeschrittenen Design Patterns.`,
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
      "JavaScript-Entwickler, die TypeScript wirklich verstehen wollen",
      "Selbstlerner, die einen strukturierten Lernpfad suchen",
      "Entwickler, die sich auf Angular, React oder Next.js vorbereiten",
      "Profis, die ihr Type-System-Wissen vertiefen wollen",
    ],
    whatYouLearn: [
      "Alle primitiven Typen und wann du Annotations vs. Inference verwendest",
      "Generics: von den Basics bis zu komplexen Higher-Order Types",
      "Mapped Types, Conditional Types und Template Literal Types meistern",
      "Discriminated Unions und exhaustive Pattern Matching",
      "Branded/Nominal Types für type-safe IDs und Opaque Types",
      "Result<T,E> Patterns für type-safe Error Handling",
      "Decorators (Legacy & Stage 3) für Metaprogrammierung",
      "Die Compiler API und AST-Manipulation",
      "Type-Level Programming — Computing mit dem Type System",
      "15+ Design Patterns (GoF, SOLID, Builder, State Machine) typsicher implementiert",
      "TypeScript Security: gefährliche Muster erkennen und vermeiden",
      "RxJS-Pipelines vollständig typsicher designen",
    ],
    didacticHighlights: [
      {
        title: "Spaced Repetition",
        description: "Jedes Konzept wird automatisch in dein Review-System aufgenommen. Der Algorithmus plant Wiederholungen optimal — genau bevor du etwas vergisst.",
      },
      {
        title: "Adaptive Lesetiefe",
        description: "Jede Sektion bietet 3 Modi: Kurzfassung, Standard und Vollständig. Du entscheidest, wie tief du eintauchen willst.",
      },
      {
        title: "Interaktive Quizzes",
        description: "Am Ende jeder Lektion: Multiple Choice, Code-Lücken und Konzeptfragen direkt im Terminal.",
      },
      {
        title: "Annotierte Code-Blöcke",
        description: "Code-Beispiele mit zeilenweisen Annotationen, die erklären, was jede Zeile tut und warum.",
      },
      {
        title: "Review Challenges",
        description: "Alle 10 Lektionen: eine Phase-Review, die alles Gelernte kombiniert und dein Verständnis prüft.",
      },
      {
        title: "Mermaid-Diagramme",
        description: "Komplexe Zusammenhänge werden als visuelle Diagramme direkt im Terminal dargestellt.",
      },
    ],
    phases: [
      {
        name: "Phase 1 — Foundations",
        lessons: [
          "Setup & Erste Schritte",
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
          "TypeScript mit RxJS",
          "Design Patterns Erweitert",
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
      "Lerne Angular von Grund auf — mit Signals, modernem Component Design, Dependency Injection und Testing. Der Kurs setzt TypeScript Phase 2 voraus und bringt dich auf Production-Level.",
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
    name: "React mit TypeScript",
    tagline: "Hooks, Patterns, Performance — alles typsicher",
    description:
      "React, aber richtig. Mit TypeScript von Anfang an. Hooks-Typen, Component Patterns, Context, Performance-Optimierung und Testing.",
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
      "Das Full-Stack Framework für React. Lerne App Router, Server Components, Caching-Strategien und Production Deployment.",
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
