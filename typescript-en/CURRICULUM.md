# TypeScript Deep Learning — Curriculum

> Goal: Build real TypeScript mastery — from your first type all the way to type-level programming.

## Teaching Approach

Every lesson follows the **LEARN cycle**:

```
  L — Lesen & Verstehen    →  README.md mit Theorie, Diagrammen, Analogien
  E — Erkunden              →  examples/*.ts — lauffähige Beispiele zum Experimentieren
  A — Anwenden              →  exercises/*.ts — Aufgaben mit steigender Schwierigkeit
  R — Reflektieren          →  quiz.ts — interaktives Quiz im Terminal
  N — Nachschlagen          →  cheatsheet.md — kompakte Referenz für später
```

**How to work through each lesson:**
1. Read through the README.md — take your time, think about the "Think about it" boxes
2. Run the examples: `npx tsx examples/01-dateiname.ts`
3. Work through the exercises — the TODOs guide you, the compiler checks you
4. Take the quiz: `npx tsx quiz.ts`
5. Use the cheatsheet as a reference

**Important rules:**
- Only look at solutions AFTER you've tried the exercise yourself
- If you're stuck: try for 10 minutes on your own, then look at the solution
- Modify the examples! Experiment! Break things!

---

## Phase 1: Foundations (Lesson 01–10)

The foundation. Here you get to know TypeScript as a language — no frameworks, just you and the compiler.

| # | Lesson | Core Concept | After this you can... |
|---|--------|--------------|----------------------|
| 01 | Setup & First Steps | Compiler, tsconfig, execution | Set up TS projects and run code |
| 02 | Primitive Types | string, number, boolean, etc. | Use all basic types correctly |
| 03 | Type Annotations & Inference | When to annotate, when to infer | Make conscious decisions about type annotations |
| 04 | Arrays & Tuples | Array<T>, readonly, tuples | Use type-safe collections |
| 05 | Objects & Interfaces | Interfaces, optional/readonly props | Model complex object structures |
| 06 | Functions | Parameter/return types, overloads | Write type-safe functions |
| 07 | Union & Intersection Types | The \| and & operators | Combine types flexibly and precisely |
| 08 | Type Aliases vs Interfaces | When to use which | Choose the right abstraction |
| 09 | Enums & Literal Types | const enum, string literals, as const | Constrain value ranges precisely |
| 10 | Review Challenge | All Phase 1 concepts | Apply everything from Phase 1 freely |

## Phase 2: Type System Core (Lesson 11–20)

The heart of TypeScript. This is where it gets powerful — and where knowledge separates from mastery.

| # | Lesson | Core Concept | After this you can... |
|---|--------|--------------|----------------------|
| 11 | Type Narrowing | typeof, instanceof, in, is | Narrow types safely |
| 12 | Discriminated Unions | Tagged unions, exhaustive checks | Model complex states |
| 13 | Generics Basics | Type parameters, constraints | Write reusable type-safe functions |
| 14 | Generic Patterns | Factories, collections, builder | Apply generics in practice |
| 15 | Utility Types | Partial, Required, Pick, Omit, etc. | Master built-in utility types |
| 16 | Mapped Types | Transform types | Build your own utility types |
| 17 | Conditional Types | extends, infer | Compute types dynamically |
| 18 | Template Literal Types | String manipulation at the type level | Make string-based APIs type-safe |
| 19 | Modules & Declarations | import/export, .d.ts, @types | Understand and use the module system |
| 20 | Review Challenge | All Phase 2 concepts | Use the type system freely |

## Phase 3: Advanced TypeScript (Lesson 21–30)

Advanced techniques that take you from "knows TypeScript" to "masters TypeScript."

| # | Lesson | Core Concept | After this you can... |
|---|--------|--------------|----------------------|
| 21 | Classes & OOP in TS | Access modifiers, abstract, implements | Design type-safe class hierarchies |
| 22 | Advanced Generics | Higher-order types, variance | Build complex generic abstractions |
| 23 | Recursive Types | Self-referential types | Type tree structures and deep operations |
| 24 | Branded/Nominal Types | Type-safe IDs, opaque types | Prevent confusion between structurally similar types |
| 25 | Type-safe Error Handling | Result<T,E>, exhaustive errors | Model errors as types |
| 26 | Advanced Patterns | Builder, state machine, phantom | Design patterns with the type system |
| 27 | Declaration Merging | Module augmentation, global | Extend third-party types |
| 28 | Decorators | Legacy & Stage 3 decorators | Metaprogramming with type safety |
| 29 | tsconfig Deep Dive | All compiler flags | Configure projects optimally |
| 30 | Review Challenge | All Phase 3 concepts | Apply advanced TS techniques |

## Phase 4: Real-World Mastery (Lesson 31–40)

From knowledge to application. Here TypeScript becomes a superpower in real-world code.

| # | Lesson | Core Concept | After this you can... |
|---|--------|--------------|----------------------|
| 31 | Async TypeScript | Promises, async/await, types | Write asynchronous code type-safely |
| 32 | Type-safe APIs | REST/GraphQL types | Type API layers end-to-end |
| 33 | Testing TypeScript | Vitest/Jest types, mocking | Test TypeScript code effectively |
| 34 | Performance & Compiler | Type instantiation limits | Understand compiler performance |
| 35 | Migration Strategies | JS→TS, strict mode | Safely migrate existing code |
| 36 | Library Authoring | Package types, .d.ts | Write your own type-safe libraries |
| 37 | Type-Level Programming | Computing with types | "Program" at the type level |
| 38 | Compiler API | ts.createProgram, AST | Use the compiler as a tool |
| 39 | Best Practices & Anti-Patterns | any vs unknown, overengineering | Avoid common mistakes |
| 40 | Capstone Project | Everything together | Implement a complete project independently |

---

## Phase 5: TypeScript Mastery Plus (Lesson 41–44)

Deep dives and modern extensions. These are the topics that turn a good TypeScript developer into an excellent one.

| # | Lesson | Core Concept | After this you can... |
|---|--------|--------------|----------------------|
| 41 | TypeScript 5.x Features | TS 5.0–5.7, inferred predicates, verbatimModuleSyntax | Use all modern TS features strategically |
| 42 | TypeScript Security | Dangerous patterns, parse-don't-validate, JS pitfalls | Write TypeScript code safely and defensively |
| 43 | TypeScript with RxJS | Observable types, operator types, Angular patterns | Design RxJS pipelines fully type-safely |
| 44 | Design Patterns Extended | GoF patterns, SOLID, repository, strategy | Implement 15+ design patterns type-safely |

---

## After This: Framework Phases

After completing all 44 lessons, the framework-specific deep dives follow:

- **Angular with TypeScript** — Decorators, DI, RxJS types, template type safety, Signals
- **React with TypeScript** — JSX types, Hook types, component patterns, Context
- **Next.js with TypeScript** — Server Components, API Routes, getServerSideProps types