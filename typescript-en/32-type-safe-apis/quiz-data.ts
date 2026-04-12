// quiz-data.ts — L32: Type-safe APIs
// 9 MC + 3 short-answer + 2 predict-output + 1 explain-why = 15 questions
// MC correct-index distribution: 3x0, 2x1, 2x2, 2x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "32";
export const lessonTitle = "Type-safe APIs";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (9 questions, correct: 0,0,0, 1,1, 2,2, 3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 1: Trust me Problem — correct: 0 ---
  {
    question: "What is the main problem with HttpClient.get<User[]>('/api/users')?",
    options: [
      "TypeScript does not check whether the API actually returns User[] — it is a compile-time cast",
      "HttpClient does not support generics correctly — the type information is lost during HTTP transfer",
      "The browser blocks typed HTTP requests for security reasons and removes the type annotation",
      "User[] cannot be used as a type parameter because arrays require special handling",
    ],
    correct: 0,
    explanation:
      "HttpClient.get<T>() is a 'Trust me, Compiler'. TypeScript believes you, but " +
      "does not check what the API actually returns. If the API changes its schema, " +
      "your code continues to compile — the error only occurs at runtime.",
    elaboratedFeedback: {
      whyCorrect: "The type parameter T is only used at compile time. At runtime it does not exist (type erasure). The API could return null, an error body, or a completely different schema.",
      commonMistake: "Many think the type parameter 'proves' that the data is correct. It only 'claims' it. The proof comes only through runtime validation."
    }
  },

  // --- Question 2: Derived Types — correct: 0 ---
  {
    question: "Why are derived types (Pick, Partial, Omit) better than manually defined request types?",
    options: [
      "Changes to the base type propagate automatically — no out-of-sync possible",
      "Derived types are faster at runtime because they do not require their own memory allocations",
      "TypeScript can only use derived types in HTTP calls because they are optimized by the compiler",
      "Derived types have better IDE support because they are directly indexed by the language service",
    ],
    correct: 0,
    explanation:
      "When User gets a new field, Pick/Partial propagates it automatically. " +
      "Manual types must be updated manually — and that gets forgotten.",
    elaboratedFeedback: {
      whyCorrect: "type CreateUser = Pick<User, 'name' | 'email'> — if User.email is renamed to User.emailAddress, Pick breaks immediately (compile error). A manual interface CreateUser { email: string } would continue to compile.",
      commonMistake: "Derived types are not always better. With very different request/response schemas (e.g. backend transformation), separate types are clearer."
    }
  },

  // --- Question 3: Zod Schema First — correct: 0 ---
  {
    question: "What does 'Schema First' mean when typing APIs with Zod?",
    options: [
      "Define the Zod schema first, then derive the TypeScript type with z.infer",
      "Define the TypeScript interface first, then write the Zod schema manually in parallel",
      "Define the OpenAPI schema first, then generate TypeScript and derive the Zod schema from it",
      "Model the database first, then derive the API types and automatically generate the schema",
    ],
    correct: 0,
    explanation:
      "Schema First: The Zod schema is the single source of truth. The TypeScript type " +
      "is derived with z.infer<typeof Schema>. This way the schema (runtime) and type " +
      "(compile time) can never diverge.",
    elaboratedFeedback: {
      whyCorrect: "const UserSchema = z.object({ name: z.string() }); type User = z.infer<typeof UserSchema>; — User is ALWAYS identical to the schema. With 'Type First', the interface and validation could diverge.",
      commonMistake: "Many define the interface first and then write a matching Zod schema. This leads to duplication and inconsistency — exactly what Schema First prevents."
    }
  },

  // --- Question 4: tRPC — correct: 1 ---
  {
    question: "How does tRPC transport types from server to client?",
    options: [
      "Through code generation in a build step that transfers the server code to the client",
      "Through 'import type' — the client imports only the router TYPE, no runtime code",
      "Through a shared npm package with types used by both server and client",
      "Through JSON Schema that is checked at runtime and automatically generates the client types",
    ],
    correct: 1,
    explanation:
      "tRPC uses 'import type { AppRouter } from \"../server\"'. This imports ONLY the " +
      "TypeScript type — nothing is imported at runtime (type erasure). TypeScript " +
      "infers all endpoint types from the router type.",
    elaboratedFeedback: {
      whyCorrect: "import type is a purely static import. The bundler removes it entirely. But the TypeScript compiler uses it for type inference. This way the client 'sees' the server types without loading server code into the bundle.",
      commonMistake: "Many think tRPC 'sends types over the wire'. No — types only exist at compile time. At runtime, tRPC sends normal JSON over HTTP."
    }
  },

  // --- Question 5: safeParse — correct: 1 ---
  {
    question: "What is the difference between z.parse() and z.safeParse()?",
    options: [
      "parse() returns undefined on error, safeParse() throws an exception and stops execution",
      "parse() throws on invalid input, safeParse() returns a result object",
      "parse() only validates types at compile time, safeParse() also validates values at runtime",
      "There is no difference — they are aliases that call the same function with a different name",
    ],
    correct: 1,
    explanation:
      "parse() throws a ZodError exception on validation failure. safeParse() returns " +
      "a result object: { success: true, data: T } or { success: false, error: ZodError }. " +
      "safeParse() is better for graceful error handling.",
    elaboratedFeedback: {
      whyCorrect: "safeParse() is like the Result pattern from L25: errors become values instead of exceptions. You can inspect the error, display error messages, or use a fallback — all type-safe.",
      commonMistake: "Many use parse() in API handlers. That can be fine if the catch block handles the error. But safeParse() is more explicit and avoids try/catch blocks."
    }
  },

  // --- Question 6: graphql-codegen — correct: 2 ---
  {
    question: "Why does graphql-codegen generate types PER QUERY instead of a global User type?",
    options: [
      "Because GraphQL does not support global types and must define each query type separately",
      "Because global types use more memory and degrade the performance of the GraphQL engine",
      "Because each query only requests certain fields — the type reflects exactly that",
      "Because TypeScript cannot import global types and must redefine them per file",
    ],
    correct: 2,
    explanation:
      "GraphQL allows partial selection: query { user { id name } } only loads id and name. " +
      "The generated type only has these fields. If you used the global User type, " +
      "you could access email — even though it was not loaded.",
    elaboratedFeedback: {
      whyCorrect: "Query-specific types prevent 'undefined access': if you don't request role, role is not in the type. The compiler prevents data.user.role — instead of it being undefined.",
      commonMistake: "Some find query-specific types cumbersome. In practice they are a huge advantage: you immediately see which fields a component actually needs."
    }
  },

  // --- Question 7: OpenAPI — correct: 2 ---
  {
    question: "What happens when the API changes but you forget to regenerate the OpenAPI types?",
    options: [
      "TypeScript automatically detects the change and updates the generated types in the background",
      "The server rejects requests with outdated types because it checks the version number in the header",
      "The generated types become stale — code compiles, but does not match the API",
      "openapi-typescript updates itself on every build and automatically downloads the latest schema",
    ],
    correct: 2,
    explanation:
      "Generated types are snapshots. Without regeneration they become stale. Solution: " +
      "integrate type generation into the CI/CD pipeline, pre-commit hooks, and additionally " +
      "use runtime validation as a safety net.",
    elaboratedFeedback: {
      whyCorrect: "This is a fundamental disadvantage of code generation: there is a temporal gap between schema changes and type updates. CI/CD integration and runtime validation close this gap.",
      commonMistake: "Many rely ONLY on generated types without runtime validation. This combines the worst of both worlds: code generation overhead PLUS a false sense of security."
    }
  },

  // --- Question 8: Valibot — correct: 3 ---
  {
    question: "What is the main advantage of Valibot over Zod?",
    options: [
      "Valibot has better TypeScript integration because it was developed exclusively for TypeScript",
      "Valibot supports more data types than Zod and thus covers a broader range of validation cases",
      "Valibot has faster validation because it is based on WebAssembly instead of JavaScript",
      "Valibot has a drastically smaller bundle size (~1kb vs ~13kb)",
    ],
    correct: 3,
    explanation:
      "Valibot uses a pipe-based design instead of method chaining. This enables " +
      "excellent tree shaking: only the validations actually used end up in the " +
      "bundle. Result: ~1kb instead of ~13kb (gzip).",
    elaboratedFeedback: {
      whyCorrect: "Zod's method chaining (z.string().min(1).email()) loads the entire Zod library. Valibot's pipe (v.pipe(v.string(), v.minLength(1), v.email())) only imports the used functions — the bundler removes the rest.",
      commonMistake: "Bundle size is not always the most important criterion. Zod has a much larger ecosystem (tRPC integration, React Hook Form, etc.). For server-side code, size is irrelevant."
    }
  },

  // --- Question 9: Response validation — correct: 3 ---
  {
    question: "Why should you also validate the API RESPONSE, not just the input?",
    options: [
      "Because the browser could block the response if the Content-Type headers do not match",
      "Because TypeScript handles responses differently from requests and needs special type parameters for both directions",
      "Because responses are transmitted compressed and TypeScript does not handle decompression correctly",
      "Because the backend can change its schema — without response validation you notice too late",
    ],
    correct: 3,
    explanation:
      "The backend team could rename fields, make them nullable, or remove them. " +
      "Without response validation: TypeError deep in the UI. With validation: a clear error message " +
      "at the API boundary, before faulty data travels through the app.",
    elaboratedFeedback: {
      whyCorrect: "Backend schema changes are common — migrations, refactorings, new API versions. Response validation is your safety net: the error is caught at the API boundary, not in the UI.",
      commonMistake: "Many only validate user input ('is the email valid?'). But the API response is just as untrusted as any other external data source. Treat it as unknown!"
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "How do you derive the TypeScript type from a schema with Zod? (z.???<typeof Schema>)",
    expectedAnswer: "z.infer",
    acceptableAnswers: ["z.infer", "infer", "z.infer<typeof Schema>"],
    explanation:
      "z.infer<typeof Schema> extracts the TypeScript type from a Zod schema. " +
      "Under the hood it uses TypeScript's conditional types and infer to derive " +
      "the output type of the schema.",
  },

  {
    type: "short-answer",
    question: "What is the tool called that generates TypeScript types from GraphQL schemas?",
    expectedAnswer: "graphql-codegen",
    acceptableAnswers: ["graphql-codegen", "GraphQL Code Generator", "@graphql-codegen/cli", "graphql code generator"],
    explanation:
      "graphql-codegen (@graphql-codegen/cli) reads GraphQL schemas and queries " +
      "and generates TypeScript types, hooks, and services for various frameworks.",
  },

  {
    type: "short-answer",
    question: "Which TypeScript import syntax imports ONLY the type, without runtime code?",
    expectedAnswer: "import type",
    acceptableAnswers: ["import type", "import type { }", "type-only import"],
    explanation:
      "import type { AppRouter } from '...' imports only the TypeScript type. " +
      "At runtime nothing is imported (type erasure). This is the mechanism " +
      "that tRPC uses to make server types available on the client.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "What does safeParse return when validation fails?",
    code:
      "const schema = z.object({ name: z.string(), age: z.number() });\n" +
      "const result = schema.safeParse({ name: 'Max', age: 'dreissig' });\n" +
      "console.log(result.success);",
    expectedAnswer: "false",
    acceptableAnswers: ["false", "False"],
    explanation:
      "'age' expects number, but receives the string 'dreissig'. safeParse does not throw, " +
      "but returns { success: false, error: ZodError }. result.success is false.",
  },

  {
    type: "predict-output",
    question: "What type does 'data' have after successful validation?",
    code:
      "const UserSchema = z.object({ name: z.string(), role: z.enum(['admin', 'user']) });\n" +
      "type User = z.infer<typeof UserSchema>;\n" +
      "// What is User?",
    expectedAnswer: "{ name: string; role: 'admin' | 'user' }",
    acceptableAnswers: [
      "{ name: string; role: 'admin' | 'user' }",
      "{ name: string; role: \"admin\" | \"user\" }",
      "{name: string; role: 'admin' | 'user'}",
    ],
    explanation:
      "z.infer derives the TypeScript type: z.string() → string, z.enum(['admin', 'user']) → 'admin' | 'user'. " +
      "The result is an object type with exactly these fields and types.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 question)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is the network boundary (API call) the most important place for runtime validation " +
      "in a TypeScript application?",
    modelAnswer:
      "TypeScript types end at the network boundary. Inside the app the compiler guarantees " +
      "type correctness — but data from APIs, WebSockets, localStorage, or URL parameters " +
      "has NO TypeScript types at runtime (type erasure). The network boundary is the " +
      "transition from 'uncontrolled' (external world) to 'controlled' (type system). " +
      "If you validate here, everything that follows is type-safe. If you do NOT validate here, " +
      "an incorrect value can propagate through the entire app.",
    keyPoints: [
      "Type erasure: TypeScript types do not exist at runtime",
      "API data is external data — TypeScript cannot guarantee it",
      "Validation at the boundary makes the rest of the app type-safe",
      "Without validation, incorrect data propagates through the entire app",
    ],
  },
];