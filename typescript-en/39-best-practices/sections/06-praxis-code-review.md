# Section 6: Practice — Code Review Checklist and Refactoring Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Defensive vs Offensive Typing](./05-defensive-vs-offensive-typing.md)
> Next section: [Lesson 40 - Capstone Project](../../40-capstone-project/sections/01-projekt-ueberblick.md)

---

## What you'll learn here

- A **code review checklist** for TypeScript you can start using tomorrow
- **5 refactoring patterns** that immediately improve TypeScript code
- How to make TypeScript quality **measurable**
- The result of 39 lessons: your personal typing style

---

## The Code Review Checklist

This checklist has one special quality: it doesn't just explain
*what* to check, but also **why**. Each checkpoint is linked to a
concrete failure mode. That's the difference between "I know I
check this" and "I know why I check this."

Print this list out and hang it next to your monitor. At every
code review, check these points:

### Category 1: Type Safety

| # | Checkpoint | Red Flag | Damage if ignored | Fix |
|---|-----------|----------|----------------------|-----|
| 1 | Is there `any`? | Every `any` without a comment | any-drift throughout the code | `unknown` + type guard |
| 2 | Is there `as`? | `as` on external data | Silent crash when API changes | Runtime validation |
| 3 | Is there `!`? | Non-null assertion on optional value | TypeError in production on unexpected null | Optional chaining `?.` |
| 4 | Are switch statements exhaustive? | Missing `default: never` | New status is silently ignored | Add exhaustive check |
| 5 | Do public functions have return types? | No explicit return type | Refactoring changes return type unnoticed | Add explicit type |

### Category 2: Architecture

| # | Checkpoint | Red Flag | Damage if ignored | Fix |
|---|-----------|----------|----------------------|-----|
| 6 | Are system boundaries validated? | `JSON.parse()` without validation | Unexpected data crashes the app | Zod/type guard |
| 7 | Are IDs type-safe? | `userId: string` instead of branded type | `userId` and `orderId` get swapped | Introduce branded type |
| 8 | Is state a discriminated union? | Boolean flags (`isLoading && isError`) | Impossible states become possible (isLoading+isError) | Refactor to DU |
| 9 | Are errors visible in the type? | `throws` in JSDoc instead of return type | Caller forgets error handling | Result pattern |
| 10 | Are generics justified? | Generic with only one usage | Complexity without benefit | `unknown` or concrete type |

### Category 3: Maintainability

| # | Checkpoint | Red Flag | Damage if ignored | Fix |
|---|-----------|----------|----------------------|-----|
| 11 | Is the type understandable in 30s? | Nested conditional types | New team member needs hours | Simplify |
| 12 | Is there type duplication? | Same type in multiple files | Change must be made in N places | Extract shared types |
| 13 | Is `strict: true` active? | `strict: false` or missing | null bugs go unnoticed | Enable it |
| 14 | Are barrel exports intentional? | `index.ts` with 50+ re-exports | Circular dependencies, slow builds | Direct imports |
| 15 | Is there `@ts-ignore`? | Every `@ts-ignore` without justification | Hidden type errors accumulate | Fix the type error |

> 📖 **Background: Why checklists work**
>
> Atul Gawande described in "The Checklist Manifesto" (2009) how
> checklists in surgery reduced mortality rates by 47%.
> The principle applies to code as well: not because developers
> don't know the rules, but because they forget to apply them
> under time pressure. A checklist makes forgetting impossible.
> Microsoft's TypeScript team internally uses a similar list
> for PRs into the TypeScript repository itself.

---

## 5 Refactoring Patterns

### Pattern 1: Boolean Flags → Discriminated Union

```typescript annotated
// BEFORE:
interface State {
  isLoading: boolean;
  isError: boolean;
  data: User[] | null;
  error: string | null;
}
// ^ 2^2 = 4 combinations, 2 of them invalid

// AFTER:
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };
// ^ Exactly 4 valid states, no invalid one possible
```

### Pattern 2: String IDs → Branded Types

```typescript annotated
// BEFORE:
function transfer(from: string, to: string, amount: number) {}
transfer(orderId, userId, price);  // OOPS! Arguments swapped
// ^ No compile error — orderId and userId are both string

// AFTER:
type AccountId = string & { __brand: "AccountId" };
type Amount = number & { __brand: "Amount" };

// Smart constructor — the only way to create an AccountId:
function accountId(raw: string): AccountId {
  if (raw.length === 0) throw new Error("AccountId must not be empty");
  return raw as AccountId;
}

function transfer(from: AccountId, to: AccountId, amount: Amount) {}

// transfer(orderId, userId, price);  // COMPILE ERROR!
// ^ orderId is OrderId, not AccountId
// ^ Confusion is now impossible
```

### Pattern 3: Optional Chaining instead of Non-null Assertion

```typescript annotated
// BEFORE:
const name = user!.profile!.name!;
// ^ Three places that could be null → runtime crash

// AFTER:
const name = user?.profile?.name ?? "Unknown";
// ^ Safe: if null → fallback
```

### Pattern 4: Overloads instead of Union Return

```typescript annotated
// BEFORE:
function parse(input: string): string | number {
  const num = Number(input);
  return isNaN(num) ? input : num;
}
const result = parse("42");  // string | number — imprecise!

// AFTER:
function parse(input: `${number}`): number;
function parse(input: string): string;
function parse(input: string): string | number {
  const num = Number(input);
  return isNaN(num) ? input : num;
}
const result = parse("42");  // number — precise!
```

### Pattern 5: Index Signature → Record/Map

```typescript annotated
// BEFORE:
interface Config {
  [key: string]: string;  // Everything allowed, nothing checked
}
config.tyypo;  // No error — typo goes unnoticed!

// AFTER (when keys are known):
interface Config {
  host: string;
  port: string;
  env: "development" | "staging" | "production";
  // ^ Even more precise: env is not an arbitrary string
}
// config.tyypo;  // ERROR: Property 'tyypo' does not exist
// config.env = "prod";  // ERROR: "prod" not in union

// AFTER (when keys are dynamic but finite):
type Environment = "development" | "staging" | "production";
type FeatureFlags = Record<Environment, boolean>;
// ^ Better than { [key: string]: boolean } — keys are typed

// AFTER (when keys are truly arbitrary):
const config = new Map<string, string>();
config.get("tyypo");  // Returns string | undefined — safer
// ^ Map.get() always returns | undefined — enforces null handling
```

> 🧠 **Explain to yourself:** Which of these 5 patterns would have
> the greatest impact in your current project? Which one could you
> implement tomorrow?
> **Key points:** Boolean → DU has the highest impact (prevents
> impossible states) | String → Branded is easiest to implement
> (5 lines) | Both together cover 80% of improvements |
> Pattern 5 (Index → Record) is most common in legacy code

---

## Angular and React: Framework-Specific Review Points

In framework code there are additional points that general tools
don't know about:

```typescript annotated
// Angular-specific:

// BAD practice: Component knows HTTP details
@Component({ /* ... */ })
class UserComponent {
  users: any[] = [];  // any in component state

  constructor(private http: HttpClient) {
    this.http.get("/api/users").subscribe((data: any) => {
      this.users = data;  // any is not validated
    });
  }
}

// GOOD practice: Service encapsulates validation, component trusts the type
@Injectable({ providedIn: "root" })
class UserService {
  getUsers(): Observable<User[]> {
    return this.http.get<unknown>("/api/users").pipe(
      map(data => {
        if (!Array.isArray(data) || !data.every(isUser)) {
          throw new Error("Unexpected API response");
        }
        return data as User[];
        // ^ as is acceptable here: data.every(isUser) has already proven
        //   that all elements are User
      })
    );
  }
}

@Component({ /* ... */ })
class UserComponent {
  users: User[] = [];  // No any — component trusts the service

  constructor(private userService: UserService) {
    this.userService.getUsers().subscribe(users => {
      this.users = users;  // Type-safe
    });
  }
}
```

```typescript annotated
// React-specific:

// BAD practice: Props without complete types
function UserCard({ user, onSelect }: any) {  // any for props!
  return <div onClick={() => onSelect(user)}>{user.name}</div>;
}

// GOOD practice: Precise props types
interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
  // ^ onSelect takes a User — not any, not id: string
}

function UserCard({ user, onSelect }: UserCardProps) {
  return <div onClick={() => onSelect(user)}>{user.name}</div>;
  // ^ TypeScript checks whether onSelect has the correct signature
}

// Custom hook with explicit return type:
interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useUsers(): UseUsersResult {
  // ^ Explicit return type — contract for all consumers
  const [state, setState] = useState<{
    users: User[];
    isLoading: boolean;
    error: Error | null;
  }>({ users: [], isLoading: true, error: null });

  // ...
  return { ...state, refetch: () => { /* ... */ } };
}
```

## Measuring TypeScript Quality

> ⚡ **Framework reference:** In Angular projects with Nx, the
> `nx lint` command checks `@typescript-eslint` rules. In React
> projects with Next.js, `next lint` checks similar rules. For
> both: the ESLint configuration IS your code review
> checklist — automated. Enable at minimum:
> `@typescript-eslint/no-explicit-any`, `no-floating-promises`,
> `strict-boolean-expressions`.

```
Metrics for TypeScript quality:
│
├── "any" density: number of 'any' per 1000 lines
│     Goal: < 1 per 1000 lines (in new code: 0)
│
├── "as" density: number of type assertions per 1000 lines
│     Goal: < 5 per 1000 lines (most of them in tests)
│
├── Strict mode: Are all strict flags enabled?
│     Goal: strict: true + noUncheckedIndexedAccess
│
├── Exhaustive checks: % of switch statements with never check
│     Goal: 100% for discriminated unions
│
└── Return types: % of exported functions with explicit type
      Goal: 100% (rule: @typescript-eslint/explicit-module-boundary-types)
```

> 💭 **Think about it:** Is it realistic to have 0 `any` in a large
> project? What would be a pragmatic path to get there?
>
> **Answer:** 0 `any` in NEW code is realistic and should be
> the rule. In legacy code: incremental migration. Set
> `@typescript-eslint/no-explicit-any: "warn"` for existing code and
> `"error"` for new files. Use `// eslint-disable-next-line`
> only with justification. Over months, any density drops to zero.

---

## Experiment: Code Review on a Real Example

Check this code against all 15 points of the checklist:

```typescript
// Angular service — how many problems can you find?

@Injectable({ providedIn: "root" })
export class ProductService {
  private products: any[] = [];
  private isLoading = false;
  private hasError = false;

  constructor(private http: HttpClient) {}

  loadProducts() {  // No return type
    this.isLoading = true;
    this.http.get("/api/products").subscribe((data: any) => {
      this.products = data as any[];
      this.isLoading = false;
    }, (err: any) => {
      this.hasError = true;
      this.isLoading = false;
      console.log(err.message);  // What if err.message is undefined?
    });
  }

  getProduct(id: string) {  // No return type
    return this.products.find(p => p.id == id);  // == instead of ===
    // ^ No type guard — p.id could be a number
  }
}

// Fill in the checklist:
// Red flags (write which checkpoints apply):
// Category 1: [___]
// Category 2: [___]
// Category 3: [___]

// Your improved version:
// Hint: Start with the state (isLoading + hasError → discriminated union)
// Then: any → concrete type, add return types, improve error handling
```

---

## What you've learned

- A **15-point checklist** for TypeScript code reviews — now with failure modes
- **5 refactoring patterns**: Boolean→DU, String→Brand, !→?., Overloads, Index→Record
- Branded types need **smart constructors** to secure the single creation path
- **Framework-specific review points**: services encapsulate validation, components trust the type
- **Metrics** for TypeScript quality: any density, as density, strict mode, exhaustive checks
- Most improvements are **small changes** with large impact
- Automation via **ESLint rules** makes the checklist permanent

> 🧠 **Explain to yourself:** If you had only ONE piece of advice
> for a colleague learning TypeScript — what would it be? What is
> the single most important best practice?
> **Key points:** "Trust the compiler — when it complains, it's
> usually right. Don't use `as` and `any` to silence it." |
> That's the summary of the entire lesson in one sentence |
> The discipline of not giving in when the compiler complains is
> the only thing that turns you from a TypeScript user into a
> TypeScript master

**Core concept of the entire lesson:** Best practices are not rigid rules — they are a decision framework. The checklist, the decision trees, and the refactoring patterns give you tools to make the right decision in any situation. After 39 lessons you have the knowledge. Now it's about building the habit.

---

> **Pause point** — You have mastered best practices and anti-patterns.
> The final lesson brings everything together: the Capstone Project.
>
> Continue with: [Lesson 40: Capstone Project](../../40-capstone-project/sections/01-projekt-ueberblick.md)