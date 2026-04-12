// pretest-data.ts — L32: Type-safe APIs
// 18 Questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: REST API Typing ────────────────────────────────────────

  {
    sectionId: 1,
    question: "Why is fetch('/api/users').then(r => r.json()) as User[] problematic?",
    options: [
      "Because fetch() doesn't support generics",
      "Because 'as User[]' is a compile-time cast — no runtime validation",
      "Because json() only returns strings",
      "I don't know",
    ],
    correct: 1,
    explanation: "'as User[]' tells TypeScript 'Trust me, this is User[]'. No check whether it's actually true.",
  },
  {
    sectionId: 1,
    question: "What are Derived Types like Pick<User, 'name' | 'email'>?",
    options: [
      "Types derived from a base type — changes propagate automatically",
      "Types computed at runtime",
      "Special types for databases",
      "I don't know",
    ],
    correct: 0,
    explanation: "Derived Types use Utility Types to derive new types from a base type. Changes to the base type flow through automatically.",
  },
  {
    sectionId: 1,
    question: "What is an API type map?",
    options: [
      "A mapping of API URLs to request/response types in an interface",
      "A data structure that caches API calls",
      "A map that assigns API errors to error codes",
      "I don't know",
    ],
    correct: 0,
    explanation: "An API type map defines the request and response types for each endpoint in a central interface.",
  },

  // ─── Section 2: Zod/Valibot Runtime Validation ───────────────────────

  {
    sectionId: 2,
    question: "What does z.infer<typeof UserSchema> do?",
    options: [
      "It validates a value at runtime",
      "It derives the TypeScript type from a Zod schema",
      "It generates a JSON Schema from the Zod schema",
      "I don't know",
    ],
    correct: 1,
    explanation: "z.infer extracts the TypeScript type from the Zod schema. This keeps schema and type always in sync.",
  },
  {
    sectionId: 2,
    question: "What is the difference between parse() and safeParse()?",
    options: [
      "parse() throws on error, safeParse() returns a Result",
      "parse() is faster than safeParse()",
      "safeParse() validates more strictly than parse()",
      "I don't know",
    ],
    correct: 0,
    explanation: "parse() throws ZodError, safeParse() returns { success, data/error }. safeParse is better for graceful error handling.",
  },
  {
    sectionId: 2,
    question: "What is the main advantage of Valibot over Zod?",
    options: [
      "Better TypeScript integration",
      "Drastically smaller bundle size through tree-shaking",
      "Faster validation",
      "I don't know",
    ],
    correct: 1,
    explanation: "Valibot uses a pipe-based design: ~1kb gzip vs ~13kb for Zod. Only used functions in the bundle.",
  },

  // ─── Section 3: End-to-End Type Safety ─────────────────────────────────

  {
    sectionId: 3,
    question: "What does 'End-to-End Type Safety' mean?",
    options: [
      "Types flow automatically from backend to frontend — without manual synchronization",
      "Every function has explicit return types",
      "All variables have type annotations",
      "I don't know",
    ],
    correct: 0,
    explanation: "End-to-End: Types from the server propagate directly to the client. No manual type definition needed.",
  },
  {
    sectionId: 3,
    question: "How does tRPC transport types from server to client?",
    options: [
      "Via JSON Schema in the HTTP response",
      "Via 'import type' — only the type is imported, no runtime code",
      "Via a shared npm package",
      "I don't know",
    ],
    correct: 1,
    explanation: "import type imports only the TypeScript type. Type erasure removes it at runtime.",
  },
  {
    sectionId: 3,
    question: "When is tRPC NOT suitable?",
    options: [
      "When the frontend uses React",
      "When the backend is not TypeScript or external consumers exist",
      "When the API has more than 10 endpoints",
      "I don't know",
    ],
    correct: 1,
    explanation: "tRPC requires TypeScript on both sides (monorepo). Non-TS backends and external consumers are excluded.",
  },

  // ─── Section 4: GraphQL and Code Generation ────────────────────────────

  {
    sectionId: 4,
    question: "Why is GraphQL inherently better suited for type safety than REST?",
    options: [
      "GraphQL has a built-in schema — every server MUST define it",
      "GraphQL is faster than REST",
      "GraphQL uses TypeScript natively",
      "I don't know",
    ],
    correct: 0,
    explanation: "GraphQL enforces a schema. REST APIs can exist without any specification. The schema is the basis for code generation.",
  },
  {
    sectionId: 4,
    question: "What does graphql-codegen do?",
    options: [
      "It compiles GraphQL to SQL",
      "It replaces the GraphQL server with TypeScript code",
      "It generates TypeScript types and hooks from GraphQL schemas and queries",
      "I don't know",
    ],
    correct: 2,
    explanation: "graphql-codegen reads schema + queries and generates TypeScript types, React Hooks, or Angular Services.",
  },
  {
    sectionId: 4,
    question: "What is the advantage of query-specific types over global schema types?",
    options: [
      "Global types require more memory",
      "Query types compile faster",
      "Query types reflect exactly the requested fields — no access to unloaded fields",
      "I don't know",
    ],
    correct: 2,
    explanation: "If you only query { id, name }, the type only has id and name. Accessing email would be a compile error.",
  },

  // ─── Section 5: OpenAPI/Swagger → TypeScript ──────────────────────────

  {
    sectionId: 5,
    question: "What is OpenAPI (formerly Swagger)?",
    options: [
      "An alternative to GraphQL",
      "A JavaScript framework for API development",
      "The standard for REST API documentation and schema definition",
      "I don't know",
    ],
    correct: 2,
    explanation: "OpenAPI is a machine-readable specification for REST APIs. Most backend frameworks generate it automatically.",
  },
  {
    sectionId: 5,
    question: "What does openapi-typescript generate?",
    options: [
      "A complete HTTP client with validation",
      "I don't know",
      "A new OpenAPI spec from TypeScript code",
      "ONLY TypeScript types from an OpenAPI specification",
    ],
    correct: 3,
    explanation: "openapi-typescript generates TypeScript types (.d.ts) from an OpenAPI spec. No client, no hooks — just types.",
  },
  {
    sectionId: 5,
    question: "What is the main risk with generated types?",
    options: [
      "They don't work with strict: true",
      "They are slower than handwritten types",
      "They can become stale when the API changes and is not regenerated",
      "I don't know",
    ],
    correct: 2,
    explanation: "Generated types are snapshots. Without regeneration they no longer match the API. CI/CD integration helps.",
  },

  // ─── Section 6: Practice — Angular & React ──────────────────────────────

  {
    sectionId: 6,
    question: "How do you make Angular's HttpClient truly type-safe?",
    options: [
      "Through stricter tsconfig options",
      "I don't know",
      "By using HttpClient v2",
      "By using get<unknown>() and Zod validation of the response",
    ],
    correct: 3,
    explanation: "get<unknown>() instead of get<User[]>() — then Zod validation. This way the type is PROVEN, not just asserted.",
  },
  {
    sectionId: 6,
    question: "What is a generic ValidatedHttpService?",
    options: [
      "A service that caches all HTTP calls",
      "I don't know",
      "A service that logs HTTP calls",
      "A wrapper around HttpClient that accepts Zod schemas for automatic validation",
    ],
    correct: 3,
    explanation: "ValidatedHttpService.get(url, schema) validates the response with the Zod schema and returns Result<T>.",
  },
  {
    sectionId: 6,
    question: "What is the most pragmatic approach for most projects?",
    options: [
      "Always use tRPC",
      "I don't know",
      "Only use TypeScript interfaces",
      "Define Zod schemas, derive types, validate every response",
    ],
    correct: 3,
    explanation: "Zod schemas as source of truth, z.infer for types, response validation at the API boundary. Works independently of the backend.",
  },
];