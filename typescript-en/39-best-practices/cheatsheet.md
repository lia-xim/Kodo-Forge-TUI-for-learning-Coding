# Cheatsheet: Best Practices & Anti-Patterns

Quick reference for Lesson 39.

---

## The Top 5 Rules

1. **No `any`** — use `unknown` + Type Guard
2. **No `as`** with external data — use runtime validation
3. **Exhaustive Checks** — `default: const _: never = value`
4. **Explicit Return Types** for exported functions
5. **Defensive shell, offensive core** — validate at boundaries

---

## Decision Tree: any vs unknown vs never

```
Do you need a type for "anything"?
├── External data? → unknown + Type Guard
├── Generic container? → Generic T
├── Function never returns? → never
├── JS→TS migration? → any (temporary! with TODO)
├── Type system boundary? → as any as TargetType (with comment)
└── Otherwise? → unknown
```

---

## Type Assertions vs Type Guards

```typescript
// BAD: Trust me
const user = data as User;

// GOOD: Prove it (Type Guard)
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "name" in data;
}
if (isUser(data)) { /* data: User */ }

// GOOD: Fail fast (Assertion Function)
function assertUser(data: unknown): asserts data is User {
  if (!isUser(data)) throw new Error("Not a User");
}
assertUser(data);  // After this: data is User (no if needed)
```

---

## Defensive Shell, Offensive Core

```
DEFENSIVE (system boundaries):     OFFENSIVE (core):
├── API handlers                   ├── Services
├── Forms                          ├── Pure functions
├── JSON.parse                     ├── Business logic
├── Event handlers                 ├── State management
└── External APIs                  └── Utility functions

Shell: unknown → validate → typed
Core: trust the type system → no runtime checks
```

---

## 5 Refactoring Patterns

| # | Before | After |
|---|--------|-------|
| 1 | `{ isLoading: boolean; isError: boolean }` | Discriminated Union with `status` |
| 2 | `userId: string` | `type UserId = string & { __brand: "UserId" }` |
| 3 | `user!.name!` | `user?.name ?? "Unknown"` |
| 4 | `function f(): string \| number` | Overloads with specific return types |
| 5 | `{ [key: string]: T }` | Explicit interface or `Map<string, T>` |

---

## Exhaustive Check

```typescript
type Status = "idle" | "loading" | "success" | "error";

function handle(s: Status): string {
  switch (s) {
    case "idle": return "Idle";
    case "loading": return "Loading";
    case "success": return "Done";
    case "error": return "Error";
    default: {
      const _: never = s;  // Compile error if case is missing!
      return _;
    }
  }
}
```

---

## Generics Rule of Thumb

```typescript
// OVER-ENGINEERING: T used only once
function log<T>(msg: T): void { console.log(msg); }

// CORRECT: T connects input with output
function identity<T>(value: T): T { return value; }

// Rule: use Generic only when T appears >= 2 times
```

---

## Code Review Checklist (Short Form)

| # | Checkpoint |
|---|-----------|
| 1 | No `any` without a comment? |
| 2 | No `as` with external data? |
| 3 | No `!` where `?.` is possible? |
| 4 | Switch exhaustive (never)? |
| 5 | Public functions with return type? |
| 6 | System boundaries validated? |
| 7 | IDs as branded types? |
| 8 | State as discriminated union? |
| 9 | Errors visible in the type? |
| 10 | Generics justified? |

---

## Metrics

| Metric | Target |
|--------|--------|
| any density (per 1000 lines) | < 1 (new code: 0) |
| as density (per 1000 lines) | < 5 (mostly in tests) |
| strict: true | Always |
| Exhaustive checks | 100% for DUs |
| Explicit return types | 100% for exports |