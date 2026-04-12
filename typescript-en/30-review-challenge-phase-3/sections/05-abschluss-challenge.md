# Section 5: Final Challenge — Everything Together

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Framework Integration](./04-framework-integration.md)
> Next section: -- (End of Phase 3)

---

## What you'll learn here

- How to combine ALL Phase 3 concepts in a single system
- What a professional domain model looks like with TypeScript
- The self-assessment for Phase 3
- A preview of Phase 4

---

## The ultimate challenge: A type-safe domain model
<!-- section:summary -->
Imagine you're building a task management system. We'll use

<!-- depth:standard -->
Imagine you're building a task management system. We'll use
ALL Phase 3 concepts to make it maximally type-safe.

### Step 1: Branded IDs (L24)

```typescript annotated
// Branded Types for all IDs:
type Brand<T, B extends string> = T & { readonly __brand: B };

type TaskId = Brand<string, 'TaskId'>;
type ProjectId = Brand<string, 'ProjectId'>;
type UserId = Brand<string, 'UserId'>;

// Smart Constructors with validation:
function createTaskId(id: string): TaskId {
  if (!id.startsWith('task-')) throw new Error('Invalid TaskId');
  return id as TaskId;
}
// ^ Brand is ONLY assigned after validation — "Parse, Don't Validate"
```

### Step 2: State machine with Phantom Types (L26)

```typescript annotated
// Task states as Phantom Types:
type Open = { readonly __state: 'open' };
type InProgress = { readonly __state: 'in-progress' };
type Done = { readonly __state: 'done' };
type Archived = { readonly __state: 'archived' };

// Task with Phantom Type for the state:
interface Task<State> {
  readonly id: TaskId;
  readonly projectId: ProjectId;
  title: string;
  assignee: UserId | null;
}

// State transitions — only valid transitions exist:
function startTask(task: Task<Open>, assignee: UserId): Task<InProgress> {
  return { ...task, assignee } as Task<InProgress>;
  // ^ Open → InProgress (with Assignee!)
}

function completeTask(task: Task<InProgress>): Task<Done> {
  return task as unknown as Task<Done>;
  // ^ ONLY InProgress → Done is possible!
}

function archiveTask(task: Task<Done>): Task<Archived> {
  return task as unknown as Task<Archived>;
  // ^ ONLY Done → Archived
}

// Invalid transition = compile error:
// completeTask(openTask);
// ^ Error! Task<Open> is not Task<InProgress>
```

### Step 3: Error handling with Result (L25)

```typescript annotated
// Error types for the domain:
type TaskError =
  | { kind: 'not-found'; taskId: TaskId }
  | { kind: 'already-assigned'; assignee: UserId }
  | { kind: 'invalid-transition'; from: string; to: string }
  | { kind: 'permission-denied'; userId: UserId };
  // ^ Discriminated Union — exhaustive handlebar

type TaskResult<T> = Result<T, TaskError>;

// Service method with Result:
function assignTask(
  task: Task<Open>,
  assignee: UserId
): TaskResult<Task<InProgress>> {
  if (task.assignee !== null) {
    return {
      ok: false,
      error: { kind: 'already-assigned', assignee: task.assignee }
    };
  }
  return { ok: true, value: startTask(task, assignee) };
}
```

### Step 4: Recursive deep types (L23)

```typescript annotated
// Projects with nested tasks (tree structure):
type TaskTree = {
  task: Task<Open | InProgress | Done>;
  subtasks: TaskTree[];
  // ^ Recursive — tasks can be nested arbitrarily deep
};

// Deep operation: count all open tasks
type DeepCount<T> = T extends { subtasks: (infer U)[] }
  ? 1 | DeepCount<U>
  : 1;
// ^ Type-level recursion — shows the nested structure
```

### Step 5: Generic repository with variance (L21 + L22)

```typescript annotated
// Repository for various entities:
interface ReadRepository<out T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<readonly T[]>;
}

class TaskRepository implements ReadRepository<Task<any>> {
  private tasks = new Map<TaskId, Task<any>>();

  async findById(id: TaskId): Promise<Task<any> | null> {
    return this.tasks.get(id) ?? null;
  }

  async findAll(): Promise<readonly Task<any>[]> {
    return [...this.tasks.values()];
  }
}
```

### Step 6: Module Augmentation (L27)

```typescript annotated
// Extend Express Request with user context:
declare module 'express' {
  interface Request {
    user?: { id: UserId; roles: ('admin' | 'member')[] };
    // ^ Branded UserId + Literal Union for roles
  }
}

// Extend Angular Router Data:
declare module '@angular/router' {
  interface Route {
    data?: { requiredRole?: 'admin' | 'member' };
  }
}
```

### Step 7: tsconfig configuration (L29)

```typescript annotated
// The tsconfig for this project:
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    // ^ Array access returns T | undefined
    "noImplicitOverride": true,
    // ^ Class inheritance explicit
    "verbatimModuleSyntax": true,
    // ^ import type explicit
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

> 📖 **Background: Domain-Driven Design meets TypeScript**
>
> Eric Evans coined the term "Domain-Driven Design" (DDD) in 2003.
> The core idea: code should reflect the business domain,
> not the technical implementation. TypeScript with Branded Types,
> Discriminated Unions and the Result Pattern makes DDD
> surprisingly natural: the types ARE the domain model.
> Invalid states cannot be represented, errors are
> explicit, IDs cannot be confused.

> 🔬 **Experiment:** Draw on paper or in your head the complete
> type diagram for the task system above. Mark for each
> type which lesson the concept comes from:
>
> ```
> TaskId (L24: Branded Type)
>   ↓
> Task<State> (L26: Phantom Type, L21: Interface)
>   ↓
> TaskTree (L23: Recursive Type)
>   ↓
> TaskResult<T> (L25: Result Pattern)
>   ↓
> TaskRepository (L21: Class, L22: Generics + Variance)
>   ↓
> Module Augmentation (L27)
>   ↓
> tsconfig (L29)
> ```

---

<!-- /depth -->
## Self-assessment Phase 3
<!-- section:summary -->
Rate your understanding of each concept on a scale from

<!-- depth:standard -->
Rate your understanding of each concept on a scale from
1 (uncertain) to 4 (I can explain and apply it):

| Lesson | Concept | Your Level (1-4) |
|--------|---------|:----------------:|
| L21 | Classes, Access Modifiers, abstract | ? |
| L22 | Covariance, Contravariance, in/out | ? |
| L23 | Recursive Types, DeepPartial | ? |
| L24 | Branded Types, Smart Constructors | ? |
| L25 | Result<T,E>, Exhaustive Errors | ? |
| L26 | State Machines, Phantom Types | ? |
| L27 | Module Augmentation, Declaration Merging | ? |
| L28 | Decorators (Legacy & Stage 3) | ? |
| L29 | tsconfig Flags, Module Resolution | ? |

> 🧠 **Explain to yourself:** For which concept would you
> give a 1 or 2? Go back to that lesson and re-read
> the section — or use the review runner.
> **Key points:** Honest self-assessment | Watch for Dunning-Kruger |
> Level 3-4 = you can explain it to a colleague |
> Level 1-2 = read again or practice

---

<!-- /depth -->
## Preview: What's coming in Phase 4?
<!-- section:summary -->
Phase 4 takes everything you learned in Phase 1-3 and applies

<!-- depth:standard -->
```
Phase 4: Real-World Mastery (L31-L40)
========================================

L31: Async TypeScript
  |  Promise<T>, Awaited<T>, AsyncGenerator
  v
L32: Type-safe APIs
  |  Zod, tRPC Patterns, End-to-end Typing
  v
L33: Testing TypeScript
  |  vi.fn(), Mock<T>, Type-safe Test Helpers
  v
L34: Performance & Compiler
  |  --generateTrace, Type Instantiation Limits
  v
L35: Migration Strategies
  |  JS→TS, Strict Mode Migration
  v
L36: Library Authoring
  |  Package Exports, Dual CJS/ESM
  v
L37: Type-Level Programming
  |  Advanced Type-Level Algorithms
  v
L38: Compiler API
  |  ts.createProgram, AST, Custom Transforms
  v
L39: Best Practices & Anti-Patterns
  |  Code Review Checklist, Common Pitfalls
  v
L40: Capstone Project
     Implement a complete project independently
```

Phase 4 takes everything you learned in Phase 1-3 and applies
it to real-world problems: async code, API design, testing,
performance, and finally a complete capstone project.

> 💭 **Think about it:** Which Phase 4 lesson are you most
> looking forward to? Why?
>
> **Consideration:** For most developers, L32 (Type-safe
> APIs) and L33 (Testing) are immediately most useful — because they
> affect daily work. L37 (Type-Level Programming) is
> for enthusiasts who really want to master the type system.

---

<!-- /depth -->
## What you've learned

- All Phase 3 concepts can be combined in a domain model
- Branded Types + Result + Phantom Types + Recursion = professional TypeScript
- The self-assessment helps identify gaps and work on them in a targeted way
- Phase 4 builds on the foundation of Phase 1-3

> 🧠 **Explain to yourself:** How would you explain to a junior developer
> in 3 sentences what you learned in Phase 3?
> **Key points:** "TypeScript can do more than check types — it can
> prevent incorrect code." | "Branded Types, the Result Pattern and
> State Machines make invalid state unrepresentable." |
> "The tsconfig is not a mystery — every flag has a reason."

**Core concept to remember:** Phase 3 has taken you from TypeScript user
to TypeScript architect. You don't just design code —
you design **types that prevent incorrect code**. That is the
difference between "can use TypeScript" and "masters TypeScript".

---

> **Phase 3 complete!** You have mastered 30 of 40 lessons.
> You command the TypeScript type system at a level that
> most professional developers never reach.
>
> **Next step:** Use the review runner (`npm run review`)
> to regularly revisit the Phase 3 concepts. Spaced
> repetition consolidates knowledge for the long term.
>
> Continue with: [Phase 4: Real-World Mastery](../../docs/08-CURRICULUM-PLANS.md)