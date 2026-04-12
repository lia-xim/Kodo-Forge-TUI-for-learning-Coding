/**
 * Lesson 42 — Pre-Test Questions: TypeScript Security
 *
 * 3 questions per section, asked BEFORE reading.
 * Goal: 'Prime' the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section this question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Brief explanation (only becomes relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: The Security Paradox ────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "You use `this.http.get<User>('/api/me')` in Angular. " +
      "What security guarantee does TypeScript give you?",
    options: [
      "None — <User> is a cast, the API response is not validated",
      "The response is checked against the User interface at runtime",
      "TypeScript checks the structure when deserializing the JSON",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`<User>` is a generic argument that convinces the compiler — " +
      "no runtime check. Angular HttpClient casts blindly. " +
      "The developer must write runtime validation themselves.",
  },
  {
    sectionIndex: 1,
    question:
      "What is the main difference between 'type-safe' and 'secure'?",
    options: [
      "Type-safe means correct types at compile time, secure means protection against attacks at runtime",
      "Both mean the same thing — a type-safe program is automatically secure",
      "Secure is a subset of type-safe — all secure programs are type-safe",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript provides compile-time correctness. Security is a runtime concept: " +
      "Prototype Pollution, XSS, SQL Injection happen despite perfectly typed code.",
  },
  {
    sectionIndex: 1,
    question:
      "Which data sources have NO real runtime types in TypeScript?",
    options: [
      "Only JSON.parse results",
      "API responses, JSON.parse, localStorage, URL parameters — everything external",
      "Only self-defined class instances",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Everything that comes from outside (HTTP, Storage, URL) is untyped JavaScript at runtime. " +
      "TypeScript types only exist at compile time. " +
      "External data needs runtime validation.",
  },

  // ─── Section 2: Dangerous TypeScript Patterns ──────────────────────────

  {
    sectionIndex: 2,
    question:
      "What happens when you write `const data = apiResponse as MyType`?",
    options: [
      "TypeScript checks whether apiResponse actually is MyType",
      "The compiler skips all checks and trusts you — no runtime check",
      "TypeScript performs a type conversion like in Java",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "'as' is a trust statement, not a validation mechanism. " +
      "TypeScript removes the cast completely at runtime. " +
      "apiResponse remains what it is — only the compiler thinks it is MyType.",
  },
  {
    sectionIndex: 2,
    question:
      "Why is the `!` operator (Non-null Assertion) dangerous?",
    options: [
      "It makes the value null",
      "It throws an exception when the value is null",
      "It suppresses the compile error without solving the runtime problem",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "! only removes the compile error. If the value is truly " +
      "null/undefined at runtime, the code explodes with a TypeError. " +
      "It is a 'I promise the compiler' without a real guarantee.",
  },
  {
    sectionIndex: 2,
    question:
      "Why is `any` 'contagious'?",
    options: [
      "Because any converts all other types into a union",
      "Because operations on any values return any and spread that way",
      "Because any sets a global variable that affects other files",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "`const x: any = ...; const y = x.property;` — y is also any. " +
      "any propagates through every assignment and access. " +
      "A single any in a service can destroy the type safety of the entire module.",
  },

  // ─── Section 3: JavaScript Pitfalls in TypeScript ─────────────────────────

  {
    sectionIndex: 3,
    question:
      "How can `{ '__proto__': { isAdmin: true } }` cause harm in an Angular app?",
    options: [
      "It sets isAdmin on the specific object to true",
      "It sets Object.prototype.isAdmin to true — all objects in the app receive this property",
      "It deletes all existing properties of the target object",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Prototype Pollution poisons Object.prototype. " +
      "Since all JavaScript objects inherit from Object.prototype, " +
      "ALL objects then have isAdmin: true — including Angular Guards and Services.",
  },
  {
    sectionIndex: 3,
    question:
      "Why is Angular's `{{ userInput }}` in templates XSS-safe, but `innerHTML = userInput` is not?",
    options: [
      "Template bindings are not safer at all — both are equally dangerous",
      "Angular automatically escapes {{ }} to HTML entities, innerHTML sets raw HTML",
      "innerHTML is forbidden in TypeScript",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Angular's template renderer escapes < to &lt;, > to &gt; etc. " +
      "Script tags are never executed. innerHTML on the other hand sets raw HTML " +
      "that the browser interprets immediately — XSS attack possible.",
  },
  {
    sectionIndex: 3,
    question:
      "What is ReDoS (Regular Expression Denial of Service)?",
    options: [
      "An attack where malicious strings generate exponentially long regex execution times",
      "An attack where a regex crashes the browser through memory consumption",
      "An attack where regex patterns are injected from the network",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Nested quantifiers like `(a+)+` can generate exponential backtracking. " +
      "An attacker sends a string that makes the regex engine hang. " +
      "Node.js is single-threaded — a blocked regex blocks the entire server.",
  },

  // ─── Section 4: Runtime Validation as Protection ──────────────────────────

  {
    sectionIndex: 4,
    question:
      "What does `function isUser(v: unknown): v is User` do differently than `function isUser(v: unknown): boolean`?",
    options: [
      "The type predicate tells TypeScript: 'If true, then v is a User in the calling code'",
      "Nothing — the return type is just documentation",
      "v is User automatically performs a cast",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Type predicates (value is T) are narrowing information for the compiler. " +
      "After `if (isUser(v))` TypeScript knows in the if branch: v is User. " +
      "With `: boolean` no narrowing — you still have to cast.",
  },
  {
    sectionIndex: 4,
    question:
      "Which validation strategy is better: stop at the first error or collect all errors?",
    options: [
      "Collect all errors — the user sees all problems at once and can fix them",
      "Stop at the first error — faster and easier to implement",
      "Both are equivalent — it depends on the use case",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "All errors at once is more user-centric. " +
      "If a form has 3 problems, 'fix one, submit, next error' is frustrating. " +
      "A list of all errors allows fixing them in parallel.",
  },
  {
    sectionIndex: 4,
    question:
      "Why is `const v = value as Record<string, unknown>` safe after `typeof value === 'object'`?",
    options: [
      "Because Record<string, unknown> is a very general type that allows anything",
      "Because TypeScript does not check Record<string, unknown>",
      "Because typeof check and null check together prove: value is an object with properties — the cast reflects that",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "After `typeof value === 'object' && value !== null` TypeScript knows: " +
      "value is a JavaScript object. Record<string, unknown> is the correct " +
      "TypeScript equivalent for 'an object with unknown property values'. " +
      "The cast reflects the proven invariant.",
  },

  // ─── Section 5: Parse, don't validate ─────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "What is the core of Alexis King's 'Parse, don't validate' principle?",
    options: [
      "You should not write boolean validation functions",
      "Parsing is faster than validating",
      "Transform inputs directly into typed values — the result is T or error, not a boolean",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "The core problem with isValid(x): boolean is that the knowledge 'valid' " +
      "is separated from the object and can be lost. " +
      "A parse function returns either T or an error — no intermediate state.",
  },
  {
    sectionIndex: 5,
    question:
      "How does the Parse principle connect to Branded Types from Lesson 24?",
    options: [
      "Not at all — Branded Types are a separate concept",
      "I don't know",
      "Branded Types replace parsers — you no longer need parse functions",
      "A Smart Constructor parses a primitive value into a Branded Type — that is Parse in its purest form",
    ],
    correct: 3,
    briefExplanation:
      "A Smart Constructor like `parseEmail(raw: string): Email` checks the format, " +
      "and on success returns `raw as Email` — a string with a built-in proof. " +
      "That is Parse: input transformed into a type-safe branded value.",
  },
  {
    sectionIndex: 5,
    question:
      "What is 'Parse at the boundary'?",
    options: [
      "You should validate in every function that receives external data",
      "I don't know",
      "Boundary is a design pattern from Domain-Driven Design",
      "Validation occurs once at the system boundary (API, Storage, URL) — after that the type is considered proven",
    ],
    correct: 3,
    briefExplanation:
      "The boundary is the transition from outside to your system. " +
      "There you parse once. Afterwards the type carries the guarantee. " +
      "Deep validation in domain code shows: you do not trust your own parse result.",
  },

  // ─── Section 6: Security Checklist and Code Review ───────────────────

  {
    sectionIndex: 6,
    question:
      "Which of the following is a 'red flag' in a TypeScript code review?",
    options: [
      "`type UserId = string & { readonly _brand: 'UserId' }`",
      "I don't know",
      "`function parseUser(v: unknown): User { /* ... */ }`",
      "`const config = JSON.parse(raw) as AppConfig`",
    ],
    correct: 3,
    briefExplanation:
      "`JSON.parse(raw) as AppConfig` is two red flags in one line: " +
      "JSON.parse without try-catch (can throw with invalid JSON) " +
      "and as without validation (structure is not checked).",
  },
  {
    sectionIndex: 6,
    question:
      "When is `DomSanitizer.bypassSecurityTrustHtml()` justified in Angular?",
    options: [
      "When the HTML content comes from the server and is considered trustworthy",
      "When DomSanitizer.sanitize() has been called beforehand",
      "When the content is controlled by your own code (e.g. your own Markdown renderer)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "bypassSecurityTrust* is legitimate when YOU generate the content — " +
      "your own renderer, static strings, server-side sanitized content. " +
      "Never with direct user input, not even after sanitize().",
  },
  {
    sectionIndex: 6,
    question:
      "What can ESLint rules do for security that code review cannot?",
    options: [
      "ESLint understands the semantics of the code better than a human reviewer",
      "I don't know",
      "ESLint can catch security vulnerabilities at runtime",
      "ESLint checks every line consistently without getting tired or making exceptions",
    ],
    correct: 3,
    briefExplanation:
      "ESLint is tireless and consistent — it checks every line by the same rules. " +
      "Humans overlook things, make exceptions, get distracted. " +
      "ESLint does not replace review, but it is the first safety net that never sleeps.",
  },
];