# Section 5: Patterns and Best Practices

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Decision Matrix](./04-entscheidungsmatrix.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- Why **Angular prefers interfaces** and what's behind that choice
- Why the **React community prefers types** and why that makes sense
- Real-world **patterns** that combine both constructs
- How to **define and enforce team conventions**

---

## Angular: Interfaces preferred

The Angular team and the official Angular Style Guide recommend
`interface` for most object types. The reasons:

### 1. Service Contracts and Dependency Injection

Angular's Dependency Injection is based on tokens. Interfaces
describe the shape of a service — the class implements them:

```typescript annotated
// Angular Style Guide: Interface for the contract
interface UserRepository {
  findById(id: string): Observable<User>;
  findAll(): Observable<User[]>;
  save(user: User): Observable<User>;
}

// Class implements the interface
@Injectable({ providedIn: 'root' })
class HttpUserRepository implements UserRepository {
// ^ implements checks: Does the class have all the methods?
  constructor(private http: HttpClient) {}

  findById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
  // ...
}
```

### 2. DTOs and Models

```typescript annotated
// Angular convention: interface for data structures
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// But UserRole is a union — here it MUST be type:
type UserRole = "admin" | "editor" | "viewer";
// ^ No contradiction: interface for objects, type for unions.
```

### 3. Why not type for everything?

In Angular projects `interface` is preferred because:

- **Tradition**: Angular comes from the Java/C# world, where interfaces
  are central (Dependency Injection, SOLID principles)
- **implements**: Angular services use `implements` extensively
- **Declaration Merging**: Angular libraries often extend
  existing interfaces
- **Codegen**: Angular CLI generates interfaces, not types

> 📖 **Background: Angular Style Guide**
>
> The official Angular Style Guide (angular.io/guide/styleguide)
> explicitly recommends:
> - "Do" use interfaces for data models
> - "Do" use interfaces for service contracts
> - "Consider" prefixing interfaces NOT with "I" (so `User`, not `IUser`)
>
> That last point is interesting: In C#/Java the "I" prefix is common
> (`IUserService`). Angular deliberately chose against it, because
> TypeScript's structural type system makes the distinction between interface
> and implementation less relevant.

---

## React: Types preferred

The React community and the official React team predominantly use
`type`. The reasons:

### 1. Props are often unions

```typescript annotated
// React-typical: Props with union variants
type ButtonProps = {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "danger";
// ^ Inline union — seamless with type.
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
};

// Discriminated union for polymorphic components:
type LinkButtonProps = ButtonProps & { href: string; target?: string };
type SubmitButtonProps = ButtonProps & { form: string };
type ActionButtonProps = LinkButtonProps | SubmitButtonProps;
// ^ Union of intersections — only possible with type.
```

### 2. Utility types are ubiquitous

```typescript annotated
// React-typical: Utility types for props
type UserCardProps = Pick<User, "name" | "email"> & {
  showAvatar?: boolean;
};
// ^ Pick is a mapped type. Combining the result with & = type world.

type ReadonlyProps<T> = { readonly [K in keyof T]: T[K] };
// ^ Generic mapped type = type only.

// Real example: Make all props optional for default props
type WithDefaults<T, D extends Partial<T>> = Omit<T, keyof D> & Partial<Pick<T, keyof D>>;
```

### 3. React's own types are types

The official React type definitions primarily use `type`:

```typescript
// From @types/react:
type FC<P = {}> = FunctionComponent<P>;
type ReactNode = ReactElement | string | number | ...;
type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
```

> 📖 **Background: Why did React choose type?**
>
> React's type system revolves around **composition**, not inheritance.
> Components don't inherit from each other — they are combined. And
> composition is exactly what `type` expresses with `&` (intersection) and `|`
> (union).
>
> Additionally, React props are often **short-lived**: they are defined for one
> component and rarely reused. Declaration Merging (the main argument
> for interfaces) is almost never needed in React props.
>
> Matt Pocock (TypeScript educator, known for "Total TypeScript")
> also recommends `type` as the default in React projects.

---

## Patterns that combine both

In practice you will use BOTH constructs in a single project.
Here are proven patterns:

### Pattern 1: Interface for contracts, type for variants

```typescript annotated
// Interface: The stable contract
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// type: The variants and unions
type QueryResult<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

type SortDirection = "asc" | "desc";
type SortOption<T> = { field: keyof T; direction: SortDirection };
```

### Pattern 2: Interface for base, type for derivations

```typescript annotated
// Interface: The base entity
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface: Extends the base
interface User extends BaseEntity {
  name: string;
  email: string;
}

// type: Derivation with utility types
type CreateUserDTO = Omit<User, "id" | "createdAt" | "updatedAt">;
// ^ type because Omit is a mapped type.

type UpdateUserDTO = Partial<CreateUserDTO>;
// ^ type because Partial is a mapped type.

type UserSummary = Pick<User, "id" | "name">;
// ^ type because Pick is a mapped type.
```

### Pattern 3: Declaration Merging + type helpers

```typescript annotated
// Interface: Extensible by plugins
interface AppConfig {
  port: number;
  host: string;
}

// Plugin A extends config:
interface AppConfig {
  database: { url: string; pool: number };
}

// Plugin B extends config:
interface AppConfig {
  redis: { host: string; port: number };
}

// type: Helpers for partial configurations
type RequiredConfig = Required<AppConfig>;
type ConfigKeys = keyof AppConfig;
// ^ "port" | "host" | "database" | "redis"
```

> 🧠 **Explain it to yourself:** Why is the pattern "interface for base,
> type for derivations" so widespread? Could you do it entirely without
> interface?
> **Key points:** Base entities are stable object shapes (interface strength) |
> Derivations use utility types (type strength) | Yes, everything possible with type,
> but extends performance and clarity are lost

---

## Defining team conventions

### Variant A: "interface-first" (Angular style)

```
Rule: Use interface for all object types.
      Use type only when necessary (unions, mapped types, etc.).

ESLint: @typescript-eslint/consistent-type-definitions: ["error", "interface"]

Advantage: Clear and predictable. New team members from Java/C#
           feel immediately at home.
```

### Variant B: "type-first" (React style)

```
Rule: Use type for everything.
      Use interface only for declaration merging and
      extensible library contracts.

ESLint: @typescript-eslint/consistent-type-definitions: ["error", "type"]

Advantage: Uniform. No need to think about whether to use type or interface.
           Union extensions are seamless.
```

### Variant C: "Hybrid" (pragmatic)

```
Rule: interface for object shapes (DTOs, services, entities).
      type for unions, intersections, utility derivations.

ESLint: No strict rule — code review ensures consistency.

Advantage: Leverages the strengths of both constructs.
Disadvantage: Requires judgment — less dogmatic.
```

> ⚡ **Practical tip:** Document your convention in a
> `CONTRIBUTING.md` or directly in `.eslintrc.json`. For example:
>
> ```markdown
> ## Type Conventions
> - `interface` for DTOs, service contracts, and extensible objects
> - `type` for unions, utility derivations, and mapped types
> - No "I" prefix: `User`, not `IUser`
> - No "Type" suffix: `UserRole`, not `UserRoleType`
> ```

---

## Anti-Patterns

### Anti-Pattern 1: "I" prefix for interfaces

```typescript
// BAD:
interface IUser { name: string; }
interface IUserService { getUser(): IUser; }

// GOOD:
interface User { name: string; }
interface UserService { getUser(): User; }
// ^ TypeScript's structural type system makes the prefix superfluous.
// Both the Angular and React Style Guides recommend: No "I" prefix.
```

### Anti-Pattern 2: Mixing type and interface arbitrarily

```typescript
// BAD: No recognizable pattern
type User = { name: string };
interface Product { name: string; }
type Order = { items: string[] };
interface Cart { items: string[]; }

// GOOD: Consistent pattern
interface User { name: string; }
interface Product { name: string; }
interface Order { items: string[]; }
interface Cart { items: string[]; }
```

### Anti-Pattern 3: Intersection instead of extends for simple inheritance

```typescript
// BAD: Unnecessary intersection
type Admin = User & { permissions: string[] };
// ^ Slower than extends. No advantage for simple extension.

// GOOD: extends for simple inheritance
interface Admin extends User { permissions: string[]; }
// ^ Faster, clearer error messages.

// BUT — sometimes & IS the right choice:
type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
// ^ Generic extension — here & is the right tool.
```

---

## What you learned

- **Angular** prefers `interface` (DI, service contracts, style guide)
- **React** prefers `type` (composition, unions, utility types)
- In practice you **combine** both constructs deliberately
- **Define team conventions** and enforce them with ESLint
- **Avoid anti-patterns**: no "I" prefix, no arbitrary mixing

> 🧠 **Explain it to yourself:** You're starting a new project that uses both
> Angular (backend admin) and React (customer frontend). Both
> teams share types in a shared package. Which convention do you
> choose for the shared package — and why?
> **Key points:** Shared types must be consumed by both sides |
> interface for DTOs (works everywhere) | type for unions
> (unavoidable) | hybrid approach most pragmatic | API response types
> are almost always unions (type)

**Core concept to remember:** There is no universally "correct" answer.
The best convention is the one your team understands, has documented,
and applies consistently.

---

> **Experiment:** Go into an existing project and count: How many
> `type` declarations and how many `interface` declarations are there?
> Is there a recognizable pattern or is it random? What would you
> change if you could set the convention?

---

> **End of lesson.** You now have a deep understanding of
> `type` vs `interface`. Next: Work through the examples and exercises
> to consolidate your knowledge.
>
> Back to [Overview](../README.md)