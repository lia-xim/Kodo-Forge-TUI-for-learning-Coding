// pretest-data.ts — L24: Branded/Nominal Types
// Pre-Test questions: 3 per section = 18 questions total

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: The Nominal Typing Problem ─────────────────────
  {
    sectionId: 1,
    question: "What is TypeScript's typing approach?",
    options: [
      "Nominal Typing (like Java) — types are identified by name",
      "Structural Typing — types are identified by their structure",
      "Duck Typing at runtime only, no compile-time types",
      "Hybrid: Nominal for classes, Structural for interfaces"
    ],
    correct: 1,
    explanation: "TypeScript uses Structural Typing: if the structure (fields/methods) is compatible, the types are compatible — regardless of the name."
  },
  {
    sectionId: 1,
    question: "What happens with this code? `type A = string; type B = string; function f(x: A): void {} f('b' as B)`",
    options: [
      "Compile error: B is not A",
      "No error: A and B are structurally identical (both = string)",
      "Runtime error: cast is invalid",
      "Warning: implicit type conversion"
    ],
    correct: 1,
    explanation: "Structural Typing: `A = B = string`. All three are compatible. Type aliases assign new names, but not new types."
  },
  {
    sectionId: 1,
    question: "In Java: can `new OrderId('abc')` be passed to `void getUser(UserId id)` if both contain only a `String`?",
    options: [
      "Yes, because Java also uses Structural Typing",
      "No — Java's Nominal Typing makes `UserId` and `OrderId` incompatible",
      "Yes, but only with an explicit cast `(UserId) orderId`",
      "No, because Java does not support generic wrapper classes"
    ],
    correct: 1,
    explanation: "Java uses Nominal Typing: two classes are distinct even if they have identical fields. TypeScript, by contrast: same structure = compatible."
  },

  // ─── Section 2: The Brand Technique ──────────────────────────────
  {
    sectionId: 2,
    question: "What does `A & B` mean in TypeScript?",
    options: [
      "One-or-the-other (Union, like `A | B`)",
      "A or B, whichever type fits better",
      "A and B simultaneously — must have ALL properties of both types",
      "B extends A (equivalent to `B extends A`)"
    ],
    correct: 2,
    explanation: "Intersection Type `A & B` means: a value must satisfy BOTH — all properties of A AND all properties of B."
  },
  {
    sectionId: 2,
    question: "Which property makes `string & { readonly __brand: 'UserId' }` a 'Branded Type'?",
    options: [
      "The `string` keyword alone is sufficient",
      "The `readonly` keyword prevents mutation",
      "The `__brand: 'UserId'` property makes the type structurally unique",
      "The `&` operator automatically creates Nominal Typing"
    ],
    correct: 2,
    explanation: "The `__brand` property (with a string literal as its value) makes the type structurally distinct from other brands. A plain `string` has no `__brand`."
  },
  {
    sectionId: 2,
    question: "What is the advantage of using `as UserId` ONLY inside the Smart Constructor?",
    options: [
      "It improves runtime performance",
      "It prevents the compiler from reporting errors",
      "Centralization: all `as` casts in one validated place — easy to audit",
      "TypeScript enforces this syntactically — there is no alternative"
    ],
    correct: 2,
    explanation: "If `as UserId` is allowed everywhere, the protection can be bypassed unintentionally. Centralize in Smart Constructors: one place, validated, easy to audit."
  },

  // ─── Section 3: Smart Constructors & Opaque Types ─────────────
  {
    sectionId: 3,
    question: "What is the difference between `createEmail(): Email` (throws) and `tryCreateEmail(): Email | null`?",
    options: [
      "The throw variant is faster; the null variant is more type-safe",
      "Both are identical — TypeScript treats them the same",
      "The null variant enforces via the type that the error case must be handled; throw does not",
      "The throw variant is only allowed in async functions"
    ],
    correct: 2,
    explanation: "With `Email | null`, TypeScript enforces: you must check for `null` before using `Email`. With `throw`, the caller can ignore the error — no compile error."
  },
  {
    sectionId: 3,
    question: "What is `declare const x: unique symbol` in TypeScript?",
    options: [
      "A variable with a random value generated at runtime",
      "An ambient declaration — exists only at compile time, produces a unique symbol type",
      "A global constant that cannot be reassigned",
      "Syntactic sugar for `const x = Symbol('x')`"
    ],
    correct: 1,
    explanation: "`declare const` is an ambient declaration with no runtime value (not compiled, type erasure). `unique symbol` creates a distinct, unambiguous type for each declaration."
  },
  {
    sectionId: 3,
    question: "Given: `type Brand<T, B extends string> = T & { readonly __brand: B }`. What is `Brand<number, 'Meter'>`?",
    options: [
      "`number & { readonly __brand: 'Meter' }` — a number with a unique brand",
      "`{ __brand: 'Meter' }` — a pure brand object without number",
      "`Meter extends number` — nominal subtype of number",
      "`number | { readonly __brand: 'Meter' }` — union of number and brand"
    ],
    correct: 0,
    explanation: "`Brand<number, 'Meter'>` expands to `number & { readonly __brand: 'Meter' }`. That is an intersection: behaves like `number` (arithmetic, methods), but carries the unique brand property."
  },

  // ─── Section 4: Multiple Brands & Hierarchies ──────────────────
  {
    sectionId: 4,
    question: "Is `VerifiedEmail = Email & { __verified: true }` a subtype or supertype of `Email`?",
    options: [
      "Supertype — because VerifiedEmail has more properties",
      "Subtype — because VerifiedEmail has all properties of Email plus more",
      "Neither — intersection does not create a sub/supertype relationship",
      "Supertype for instantiation, subtype for assignability (complex)"
    ],
    correct: 1,
    explanation: "Subtype: `VerifiedEmail` has all properties of `Email` plus `__verified`. Therefore `VerifiedEmail` can be used anywhere `Email` is expected — but not the other way around."
  },
  {
    sectionId: 4,
    question: "What does `type SearchQuery = string & Trimmed & NonEmpty & Lowercase` guarantee?",
    options: [
      "Only that the string contains no whitespace (Trimmed)",
      "Only that the string is not empty (NonEmpty)",
      "Exactly one of the three states — depending on context",
      "That the string is trimmed, non-empty, and lowercase — all three guaranteed"
    ],
    correct: 3,
    explanation: "Intersection combination: `SearchQuery` must have ALL three properties. That guarantees: trimmed AND non-empty AND lowercase. All three transformations have been applied."
  },
  {
    sectionId: 4,
    question: "The Mars Climate Orbiter was lost because thrust was passed in the wrong units. Which TypeScript approach would have prevented this?",
    options: [
      "Defensive programming with `if (unit === 'Newton')` at runtime",
      "Code reviews — TypeScript cannot model physical units",
      "Typing all numbers as `any` so the calculation does not fail",
      "Branded Types like `NewtonSeconds` vs `PoundForceSeconds` with a compile-time check"
    ],
    correct: 3,
    explanation: "With `type NewtonSeconds = Brand<number, 'Newton'>` and `type PoundSeconds = Brand<number, 'Pound'>`, the wrong argument would be a compile error — not a $327-million orbiter loss."
  },

  // ─── Section 5: Practical Patterns ───────────────────────────
  {
    sectionId: 5,
    question: "Why are monetary amounts modelled as positive integers (cents) instead of decimals (euros)?",
    options: [
      "Because of JavaScript's floating-point representation: `0.1 + 0.2 !== 0.3`",
      "Because TypeScript does not support decimals as Branded Types",
      "Because international currencies have no decimal places",
      "For performance reasons — integer operations are faster"
    ],
    correct: 0,
    explanation: "IEEE 754 floating-point (JavaScript's number format) is imprecise with decimals. `0.1 + 0.2 = 0.30000000000000004`. Cents as integers do not have this problem."
  },
  {
    sectionId: 5,
    question: "What does `type Id<Entity extends string> = string & { readonly __idType: Entity }` model?",
    options: [
      "A factory function that validates IDs",
      "An interface for all repository operations",
      "A singleton type for global IDs",
      "A generic ID brand that creates a distinct ID variant for each entity"
    ],
    correct: 3,
    explanation: "`Id<'User'>` and `Id<'Order'>` have different `__idType` values ('User' vs 'Order'). This makes them structurally distinct — a robust generic ID hierarchy."
  },
  {
    sectionId: 5,
    question: "What makes `AbsolutePath` and `RelativePath` into different types?",
    options: [
      "`__pathType: 'absolute'` vs `__pathType: 'relative'` as a brand property",
      "A `/` prefix is forbidden in `RelativePath` and allowed in `AbsolutePath`",
      "Class inheritance: `class AbsolutePath extends RelativePath`",
      "Runtime check: `path.isAbsolute()` determines the type"
    ],
    correct: 0,
    explanation: "Brand types: `AbsolutePath = string & { __pathType: 'absolute' }` and `RelativePath = string & { __pathType: 'relative' }`. The different literal types make them incompatible."
  },

  // ─── Section 6: Practice ─────────────────────────────────────
  {
    sectionId: 6,
    question: "In an Angular service: where should the `as UserId` cast take place?",
    options: [
      "In every component that uses the ID",
      "In the HTTP interceptor before the request goes out",
      "Nowhere — Angular does this automatically",
      "In the mapper/anti-corruption layer that converts HTTP responses to domain types"
    ],
    correct: 3,
    explanation: "Anti-Corruption Layer principle: HTTP response (raw string) → mapper (createUserId) → domain entity (UserId). After that: no more `as` casts needed in the rest of the code."
  },
  {
    sectionId: 6,
    question: "When should you NOT use Branded Types?",
    options: [
      "For local calculations with few, clearly named variables — over-engineering",
      "For HTTP API responses — these do not need type safety",
      "For authentication tokens — too much runtime overhead",
      "For database entities — that is the ORM's responsibility"
    ],
    correct: 0,
    explanation: "YAGNI: if local variables in the same scope (`width`, `height`) cannot be confused, a brand type adds unnecessary complexity without any safety benefit."
  },
  {
    sectionId: 6,
    question: "What advantage do Branded Types have over runtime validation with classes (e.g. `class UserId { constructor(public value: string) {} }`)?",
    options: [
      "Branded Types have zero runtime overhead — they disappear after compilation (type erasure)",
      "Classes offer better type safety than Branded Types",
      "Branded Types execute faster because they exist at runtime",
      "There is no difference — both approaches are equivalent"
    ],
    correct: 0,
    explanation: "Branded Types exist only at compile time (type erasure). In the transpiled JavaScript, a `UserId` is simply a `string` — no wrapper object, no overhead. Classes create real objects at runtime, which complicates serialization and API compatibility."
  }
];