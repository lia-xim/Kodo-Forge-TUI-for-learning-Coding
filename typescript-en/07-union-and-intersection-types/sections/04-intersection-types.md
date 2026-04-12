# Section 4: Intersection Types — Everything at Once

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Discriminated Unions](./03-discriminated-unions.md)
> Next section: [05 - Union vs Intersection](./05-union-vs-intersection.md)

---

## What you'll learn

- What the `&` operator means and how Intersection Types work
- How to **combine object types** (mixins, capabilities)
- What happens with **conflicts** (spoiler: sometimes `never`)
- The difference between `extends` and `&`

---

## The Concept: "Everything at Once"

While Union Types mean "either A or B", Intersection Types mean
"both A and B":

```typescript annotated
interface HasName {
  name: string;
}
interface HasAge {
  age: number;
}

type Person = HasName & HasAge;
//            ^^^^^^^^^^^^^^^^
//            Intersection: MUST have both
//            name (from HasName) AND age (from HasAge)

const alice: Person = {
  name: "Alice",   // from HasName
  age: 30,         // from HasAge
};

// If either field is missing, you get an error:
// const bob: Person = { name: "Bob" };
// Error! Property 'age' is missing
```

> 📖 **Background: Intersection in Set Theory**
>
> The name "Intersection" comes from set theory.
> But **beware** — the intuition can be misleading!
>
> With **value sets**, the intersection is SMALLER (fewer values
> satisfy the condition). With **property sets**, the result is
> LARGER (more properties). This sounds contradictory, but:
>
> - `HasName` = set of all objects with `name`
> - `HasAge` = set of all objects with `age`
> - `HasName & HasAge` = set of all objects with `name` AND `age`
>
> Fewer objects satisfy this condition, but each object has
> MORE properties. The set gets smaller, but the type becomes "richer".

---

## Combining Objects

The most common use case: **merging multiple interfaces into one type**:

```typescript annotated
// ─── Base Interfaces ──────────────────────────────
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt: Date | null;
  isDeleted: boolean;
}

interface HasId {
  id: string;
}

// ─── Combining with & ─────────────────────────────
type DatabaseEntity = HasId & Timestamped & SoftDeletable;
// Has ALL properties from all three interfaces:
// id, createdAt, updatedAt, deletedAt, isDeleted

const user: DatabaseEntity = {
  id: "usr-123",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  isDeleted: false,
};
```

### Real-world example: Extending an API request

```typescript annotated
interface BaseRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
}

interface Authenticated {
  headers: { authorization: string };
}

interface WithBody {
  body: Record<string, unknown>;
}

// Different request types through composition:
type GetRequest = BaseRequest & Authenticated;
type PostRequest = BaseRequest & Authenticated & WithBody;

function sendPost(request: PostRequest): void {
  // request has: url, method, headers.authorization, body
  console.log(`${request.method} ${request.url}`);
}
```

---

## Conflicts: What Happens with Incompatible Properties?

When two types have the **same property with different types**,
the result is an intersection of those property types:

```typescript annotated
interface A {
  value: string;
}
interface B {
  value: number;
}

type AB = A & B;
// AB.value has type: string & number
// A value that is SIMULTANEOUSLY a string AND a number? Impossible!
// Result: value is "never"

// This means: AB is IMPOSSIBLE to instantiate
// const impossible: AB = { value: ??? }; // No value fits!
```

> 💭 **Think about it:** Why does `string & number` become `never`
> rather than a compile error?
>
> **Answer:** TypeScript doesn't report an error at the type definition
> level, because Intersection Types are always syntactically "legal".
> Only when you try to create a value of that type does it become clear
> it's impossible. The `never` type expresses exactly that: "the empty set".

### Compatible Conflicts: Literal + Parent

Not every "conflict" leads to `never`. When one type is a **subtype**
of the other, the narrower type wins:

```typescript annotated
interface Config1 {
  mode: string;          // broad
}
interface Config2 {
  mode: "production";    // narrow (literal type)
}

type Combined = Config1 & Config2;
// Combined.mode: string & "production" = "production"
// This works! "production" is a subtype of string.
// The intersection is the NARROWER type.

const config: Combined = { mode: "production" };  // OK
// const bad: Combined = { mode: "development" };   // Error!
```

---

## extends vs & — When to Use Which?

Both can achieve similar results, but have different semantics:

```typescript
// ─── Option 1: extends (interface inheritance) ───
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}
// Dog has: name + breed

// ─── Option 2: & (intersection) ──────────────────
interface AnimalBase {
  name: string;
}
interface DogTraits {
  breed: string;
}
type DogType = AnimalBase & DogTraits;
// DogType has: name + breed — same result!
```

| Criterion | `extends` | `&` |
|---|---|---|
| Usable with | Interfaces | Interfaces, types, primitives |
| Conflicts | **Compile error** | Intersection (possibly `never`) |
| Multiple inheritance | Yes (multiple extends) | Yes (A & B & C) |
| Declaration merging | Yes (interfaces) | No (type aliases) |
| Intent | "is a" (inheritance) | "also has" (composition) |
| Performance | Better (caching) | Slightly slower with many types |

> **Key difference with conflicts:**

```typescript
interface Base {
  id: string;
}

// extends reports an error:
// interface Child extends Base {
//   id: number;  // Error! Type 'number' is not assignable to type 'string'
// }

// & silently produces a never type:
type Child = Base & { id: number };
// Child.id is string & number = never — no compile error,
// but impossible to instantiate!
```

> 🧠 **Explain to yourself:** Why is `extends` "stricter" than `&`
> when it comes to conflicts? Which approach is safer?
> **Key points:** extends checks compatibility at declaration time |
> & combines blindly and may produce never | extends gives earlier errors |
> & is more flexible but can lead to hidden never types

---

## Intersection with Generics: The Mixin Pattern

A powerful pattern: **mixins** using generics and intersections:

```typescript annotated
// Generic function that "extends" a type
function withTimestamps<T>(obj: T): T & Timestamped {
  return {
    ...obj,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

interface User {
  name: string;
  email: string;
}

const user: User = { name: "Alice", email: "alice@example.com" };
const timestamped = withTimestamps(user);
// Type: User & Timestamped
// Has: name, email, createdAt, updatedAt
console.log(timestamped.name);       // OK
console.log(timestamped.createdAt);  // OK
```

> ⚡ **Pro tip:** This pattern is everywhere in modern frameworks:
>
> ```typescript
> // React: Higher-Order Components
> function withAuth<P>(Component: React.FC<P>): React.FC<P & { user: User }> { ... }
>
> // Angular: Decorator pattern for services
> type WithLogging<T> = T & { log: (msg: string) => void };
> ```

---

## What you learned

- The `&` operator creates Intersection Types: a value must satisfy **all types simultaneously**
- Intersection Types **combine properties** from multiple interfaces
- Incompatible properties result in `never` (silently — no error!)
- `extends` is stricter (reports conflicts), `&` is more flexible (combines blindly)
- Generics + `&` enable powerful **mixin patterns**

**Core concept to remember:** Intersection Types are the **intersection** of all participating types. The set of valid values gets SMALLER (more restrictive), but each value has MORE properties.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> interface User {
>   name: string;
>   email: string;
> }
>
> type Admin = User & { role: "admin" };
>
> // What happens here?
> const a: Admin = { name: "Alice", email: "a@x.com", role: "admin" };  // OK
> const b: Admin = { name: "Bob",   email: "b@x.com", role: "user" };   // ???
>
> // Bonus: What is the type of "role" in Admin?
> // Hover over "role" in the Admin definition.
> ```
> What error message does TypeScript show for `role: "user"`?
> What would happen if you used `role: string` (broad) instead of `role: "admin"` (literal)?

---

> **Pause point** — You now know both operators: `|` for Union
> and `&` for Intersection. In the next section we compare them
> directly and learn when to use which.
>
> Continue with: [Section 05: Union vs Intersection](./05-union-vs-intersection.md)