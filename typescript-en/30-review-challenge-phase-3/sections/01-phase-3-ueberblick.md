# Section 1: Phase 3 Overview — The Concept Map

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Pattern Combination](./02-pattern-kombination.md)

---

## What you'll learn here

- How the 9 lessons of Phase 3 are connected and build on each other
- Which "red threads" run through all the topics
- Why Phase 3 turns you into an **architect** rather than just a user of the type system
- The mental map for advanced TypeScript

---

## The Journey Through Phase 3
<!-- section:summary -->
Phase 3 has taken you from "can use the type system" to "can

<!-- depth:standard -->
Phase 3 has taken you from "can use the type system" to "can
design the type system." Here is the map:

```
Phase 3: Advanced TypeScript (L21-L29)
========================================

L21: Classes & OOP
  |  public/private/protected, abstract, #private, implements
  |  → Foundation for structured abstraction
  v
L22: Advanced Generics
  |  Covariance, contravariance, in/out modifiers, higher-order types
  |  → Understanding variance = designing generic APIs safely
  v
L23: Recursive Types
  |  Self-referencing types, DeepPartial, deep operations
  |  → Making tree structures and nested data type-safe
  v
L24: Branded/Nominal Types
  |  Branded types, smart constructors, opaque types
  |  → Making uniform types distinguishable (UserId ≠ OrderId)
  v
L25: Type-safe Error Handling
  |  Result<T,E>, Option<T>, exhaustive error types
  |  → Errors as part of the API rather than as exceptions
  v
L26: Advanced Patterns ─────────────────────────────┐
  |  Builder, state machines, phantom types          |  These three
  v                                                   |  connect
L27: Declaration Merging ──────────────────────────  |  EVERYTHING from
  |  Module augmentation, global types, merging      |  Phase 1-3
  v                                                   |
L28: Decorators ───────────────────────────────────  |
  |  Legacy & Stage 3, metadata, factories           |
  v                                                   |
L29: tsconfig Deep Dive ───────────────────────────  ┘
     All compiler flags, module resolution, practice
```

---

<!-- /depth -->
## The Three Red Threads
<!-- section:summary -->
Looking back, you can recognize three major themes that run

<!-- depth:standard -->
Looking back, you can recognize three major themes that run
through all 9 lessons:

### 1. Type Safety Through Design (L21, L24, L25)

```typescript annotated
// L21: Access modifiers protect invariants
class Account {
  #balance: number;
  // ^ Private field — unreachable from outside
  constructor(initial: number) { this.#balance = initial; }
  withdraw(amount: number): void {
    if (amount > this.#balance) throw new Error("Insufficient");
    this.#balance -= amount;
  }
}

// L24: Branded types prevent mix-ups
type UserId = number & { readonly __brand: unique symbol };
type OrderId = number & { readonly __brand: unique symbol };
// ^ Both are number — but NOT interchangeable!

// L25: Result pattern makes errors explicit
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
// ^ No try/catch needed — error is visible in the type
```

The idea: **Make invalid state unrepresentable.** Don't check at
runtime whether something is correct — enforce at compile time
that it MUST be correct.

> 📖 **Background: "Make Illegal States Unrepresentable"**
>
> This principle comes from functional programming (Elm,
> Haskell, F#). Yaron Minsky of Jane Street Capital coined
> the phrase in an influential talk in 2011. The idea: if
> your type system CANNOT represent invalid state, you don't
> need runtime checks for it. TypeScript with branded types,
> discriminated unions, and the Result pattern comes
> surprisingly close to this ideal — even though it runs on JavaScript.

### 2. Abstraction and Reuse (L22, L23, L26)

```typescript annotated
// L22: Variance determines assignability
interface ReadonlyBox<out T> { get(): T; }
// ^ out = covariant: ReadonlyBox<Dog> is assignable to ReadonlyBox<Animal>

// L23: Recursive types for arbitrary depth
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
// ^ Works on arbitrarily deeply nested objects

// L26: Phantom types for state machines
type Draft = { __state: 'draft' };
type Published = { __state: 'published' };
// ^ The type carries the state — invalid transitions are compile errors
```

The idea: **Design once correctly, use everywhere safely.**
Generic abstractions that protect themselves.

### 3. Integration and Configuration (L27, L28, L29)

```typescript annotated
// L27: Module augmentation extends external types
declare module 'express' {
  interface Request { user?: AuthUser; }
}
// ^ You change the types of a library without touching its code

// L28: Decorators for metaprogramming
@Injectable()
class UserService { }
// ^ The decorator registers the service in the DI container

// L29: tsconfig controls EVERYTHING
{
  "strict": true,
  "moduleResolution": "bundler",
  "verbatimModuleSyntax": true
}
// ^ Three lines that make your entire project safer
```

The idea: **Integrate TypeScript into the real world.** External
libraries, frameworks, build tools — everything must work together.

> 💭 **Think about it:** Which of the three red threads is most
> important for your daily work? Why?
>
> **Reflection:** For most professional developers, #3
> (Integration) is the most frequent — because you work with
> frameworks and libraries every day. But #1 (Type Safety
> Through Design) has the greatest long-term impact, because it
> eliminates entire classes of errors.

---

<!-- /depth -->
## Connections: What Depends on What?

```
              Variance (L22)
                ↓
Classes (L21) → Generics + Variance → Recursive Types (L23)
    ↓              ↓                        ↓
    ↓         Branded Types (L24)    Deep operations
    ↓              ↓
    ↓         Error Handling (L25) → Result + branded errors
    ↓              ↓
Decorators (L28) Advanced Patterns (L26) → State machines + phantom types
    ↓              ↓
Declaration Merging (L27) → Module augmentation + interface merging
    ↓
tsconfig (L29) → Configure and bring everything together
```

> 🧠 **Explain to yourself:** How does L24 (Branded Types) build on
> L22 (Advanced Generics)? And how does L25 (Error Handling) use
> the concepts from L24?
> **Key points:** Branded types use intersection types + generics |
> Smart constructors use generic return types | Result<T,E> is
> a generic discriminated union | Branded error types combine
> L24 + L25

---

## The Knowledge Test: How Well Does It Stick?
<!-- section:summary -->
Before we dive into the details, a quick check. Can you

<!-- depth:standard -->
Before we dive into the details, a quick check. Can you
answer these questions off the top of your head?

1. **L21:** What is the difference between `#private` (ES2022) and
   `private` (TypeScript)?
   → `#private` is runtime protection (exists in JavaScript). `private`
   is compile-time only (disappears via type erasure).

2. **L22:** When is a type parameter covariant, when is it contravariant?
   → Covariant (`out`): In return positions. Contravariant (`in`):
   In parameter positions. Invariant: Both.

3. **L23:** What does `DeepReadonly<T>` do differently than `Readonly<T>`?
   → `Readonly<T>` only works one level deep. `DeepReadonly<T>` is
   recursive and makes ALL nested levels readonly.

4. **L24:** What is a Smart Constructor?
   → A function that validates a value and only assigns the brand
   on success: `parseEmail(s): Email | null`.

5. **L25:** Why is `Result<T,E>` better than try/catch?
   → Errors are visible in the type. The compiler enforces error
   handling. With try/catch, the function signature "lies."

6. **L29:** What does `noEmit: true` do?
   → TypeScript only checks types, produces no output. The
   bundler (esbuild/Vite) handles the transpilation.

If you were unsure about more than two questions, it's worth
reviewing the corresponding lesson.

> 💭 **Think about it:** Which of these six questions was the hardest?
> That is probably the concept that needs the most repetition.
> Note it down for the review runner.
>
> **Tip:** The review runner (`npm run review`) automatically selects
> questions from lessons that haven't been reviewed in a while.

---

<!-- /depth -->
## Phase 3 vs. Phase 1 & 2: What Has Changed?
<!-- section:summary -->
| Phase 1 (L01-L10) | Basics | "How do I write types?" |

<!-- depth:standard -->
| Phase | Focus | Mindset |
|-------|-------|---------|
| Phase 1 (L01-L10) | Basics | "How do I write types?" |
| Phase 2 (L11-L20) | Type system | "How do I transform types?" |
| Phase 3 (L21-L30) | Architecture | "How do I design with types?" |

The decisive leap: In Phase 1 and 2 you learned the type system.
In Phase 3 you learned to use the type system as a
**design tool** — to express architectural decisions in
code that the compiler enforces.

> 🔬 **Experiment:** Think about your current Angular project at
> work. Which concepts from Phase 3 could you use IMMEDIATELY?
> Here are some suggestions:
>
> - **Branded Types (L24):** Prevent ID mix-ups
>   (CustomerId vs OrderId)
> - **Result Pattern (L25):** Model HTTP errors explicitly in the type
>   instead of try/catch
> - **Module Augmentation (L27):** Extend Express/Angular types
> - **tsconfig optimization (L29):** Enable noUncheckedIndexedAccess

---

<!-- /depth -->
## What You Learned

- Phase 3 has three red threads: type safety through design, abstraction, integration
- The 9 lessons build on each other and interconnect
- The leap from Phase 2 to Phase 3: from type user to type architect
- "Make Illegal States Unrepresentable" is the guiding principle

> 🧠 **Explain to yourself:** What does "Make Illegal States
> Unrepresentable" mean concretely? Give an example from Phase 3 where
> this principle is applied.
> **Key points:** Invalid state = compile error, not runtime error |
> Branded types: UserId instead of number |
> Discriminated unions: only valid state transitions |
> Result<T,E>: error is in the type, not invisible

**Core concept to remember:** Phase 3 makes you a TypeScript architect.
You don't just design code — you design types that
PREVENT incorrect code.

---

> **Pause point** — The overview is complete. Starting with the next section
> we will combine concepts from different lessons.
>
> Continue with: [Section 02: Pattern Combination](./02-pattern-kombination.md)