# Section 5: Union vs. Intersection — When to Use Which?

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Intersection Types](./04-intersection-types.md)
> Next section: [06 - Practical Patterns](./06-praxis-patterns.md)

---

## What You'll Learn Here

- When to use `|` and when to use `&` — with clear **decision rules**
- Why Union Types make a type **broader** in terms of values, while Intersection Types add more **properties**
- The **distributive law** for Union and Intersection
- How `|` and `&` behave differently for function parameters

---

## The Intuition: Broader vs. Narrower

What's confusing about Union and Intersection is that the intuition
seems reversed depending on your perspective:

```
                    Union (|)                 Intersection (&)
───────────────────────────────────────────────────────────────
Value set:          LARGER                    SMALLER
                    (more values fit)         (fewer values fit)

Properties:         FEWER accessible          MORE accessible
                    (only shared ones)        (all from all)

Type is:            BROADER (more general)    NARROWER (more specific)
```

An example makes this clearer:

```typescript annotated
interface HasName { name: string; }
interface HasAge { age: number; }

// Union: MORE values fit, FEWER properties accessible
type PersonUnion = HasName | HasAge;
// Valid: { name: "A" } or { age: 30 } or { name: "A", age: 30 }
// Accessible: ONLY properties that BOTH have (= none directly!)

// Intersection: FEWER values fit, MORE properties accessible
type PersonIntersection = HasName & HasAge;
// Valid: ONLY { name: "A", age: 30 } (must have both)
// Accessible: name AND age
```

> 📖 **Background: Duality in Type Theory**
>
> Union and Intersection form a **dual pair** — similar to
> AND and OR in logic. This duality runs through
> all of type theory:
>
> | Concept | Union (`\|`) | Intersection (`&`) |
> |---|---|---|
> | Logic | OR | AND |
> | Set theory | Union (A ∪ B) | Intersection (A ∩ B) |
> | Type theory | Sum Type | Product Type |
> | Value set | Larger | Smaller |
> | Identity element | `never` | `unknown` |
>
> The last row is particularly interesting:
> - `T | never` = `T` (never adds nothing)
> - `T & unknown` = `T` (unknown restricts nothing)

---

## Decision Matrix: Union or Intersection?

| Situation | Use | Example |
|---|---|---|
| "One of several states" | `\|` | `"loading" \| "success" \| "error"` |
| "Can hold different types" | `\|` | `string \| number` |
| "Combine multiple capabilities" | `&` | `Serializable & Comparable` |
| "Extend a type with properties" | `&` | `User & { role: string }` |
| "Need a Discriminated Union" | `\|` | `{ status: "ok"; data: T } \| { status: "err"; error: E }` |
| "Function accepts different inputs" | `\|` | `(input: string \| number) => void` |
| "Function returns an enriched type" | `&` | `() => T & Timestamped` |

**General rule:**
- **Union** = "Either A or B" (variants, states, alternatives)
- **Intersection** = "Both A and B" (combination, extension, mixins)

> 🧠 **Explain to yourself:** An API endpoint can return either Success
> or Error. Would you use Union or Intersection?
> Why?
> **Key points:** Union, because they are alternatives | A response is
> EITHER Success OR Error | Never both at the same time |
> Discriminated Union with a status tag

---

## The Distributive Law

Union and Intersection have a **distributive law** — similar
to `*` and `+` in mathematics:

```typescript annotated
// Distribution of & over |
type A = (string | number) & object;
// = (string & object) | (number & object)
// = never | never
// = never
// Because neither string nor number are object subtypes

// Distribution of | over &
type B = string | (number & boolean);
// = string | never
// = string
// Because number & boolean = never (incompatible)
```

A more practical example:

```typescript annotated
interface WithId { id: string; }
interface WithTimestamp { createdAt: Date; }

type Entity = (WithId & WithTimestamp) | (WithId & { temp: true });
//
// Distribution:
// = WithId & (WithTimestamp | { temp: true })
//
// Every Entity has id, and either createdAt or temp
```

> 💭 **Think question:** Why is `(string | number) & string` equal to
> `string` and not `never`?
>
> **Answer:** The distributive law:
> `(string | number) & string` = `(string & string) | (number & string)`
> = `string | never` = `string`.
> `string & string` is simply `string` (intersection with itself).
> `number & string` is `never` (incompatible). And `T | never` = `T`.

---

## Union and Intersection with Function Types

This is where it gets subtle. For functions, `|` and `&`
behave **differently than with objects**:

```typescript annotated
type StringFn = (x: string) => void;
type NumberFn = (x: number) => void;

// Union of functions: Parameters become an INTERSECTION
type EitherFn = StringFn | NumberFn;
// Callable with: string & number = never — so NOT safely callable at all!
// TypeScript only allows arguments that match BOTH signatures.

// Intersection of functions: Overloading
type BothFn = StringFn & NumberFn;
// Callable with: string OR number — like an overloaded function!

const fn: BothFn = ((x: string | number) => {
  console.log(x);
}) as BothFn;

fn("hello");  // OK — matches StringFn
fn(42);       // OK — matches NumberFn
```

> This is **counterintuitive**: For function types, `&` (Intersection)
> is the **more flexible** operator (accepts more arguments), while
> `|` (Union) is the **more restrictive** one. This is due to the
> **contravariance** of the parameter position.

> 📖 **Background: Covariance and Contravariance**
>
> In type theory, function parameters are **contravariant**: If
> `Dog` is a subtype of `Animal`, then `(animal: Animal) => void`
> is a subtype of `(dog: Dog) => void` — the direction reverses!
>
> This explains the behavior:
> - `StringFn & NumberFn`: parameter intersection → `string | number`
>   (union of parameters, because contravariant)
> - `StringFn | NumberFn`: parameter union → `string & number = never`
>   (intersection of parameters, because contravariant)
>
> Sounds complicated, but it's logical: A function that accepts `string & number`
> can ONLY be called with values that match BOTH parameters — and
> no such values exist.

---

## Practice: Type Refinement with & Instead of Redefinition

Rather than redefining a long type from scratch, refine it with `&`:

```typescript annotated
// Base type (e.g., from a library)
interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: string;     // too broad — just "string"
}

// Refinement: role becomes a literal type
type AdminUser = BaseUser & { role: "admin" };
type EditorUser = BaseUser & { role: "editor" };
type ViewerUser = BaseUser & { role: "viewer" };

type AppUser = AdminUser | EditorUser | ViewerUser;
// Now role is no longer "string", but "admin" | "editor" | "viewer"
```

---

## never and unknown as Identity Elements

Two important algebraic properties:

```typescript
// never is the identity element for Union:
type A = string | never;   // = string (never adds nothing)

// unknown is the identity element for Intersection:
type B = string & unknown;  // = string (unknown restricts nothing)

// unknown is the "absorbing element" for Union:
type C = string | unknown;  // = unknown (unknown "absorbs" everything)

// never is the "absorbing element" for Intersection:
type D = string & never;    // = never (never makes everything impossible)
```

> 🧠 **Explain to yourself:** Why is `string | unknown = unknown`
> but `string & unknown = string`? Explain it using sets.
> **Key points:** unknown = all values | string ∪ all values = all values |
> string ∩ all values = string | Union with "everything" = "everything" |
> Intersection with "everything" = itself

---

## What You've Learned

- Union makes a type **broader** (more values, fewer properties), Intersection makes it **narrower** (fewer values, more properties)
- **General rule:** Union for alternatives, Intersection for combination
- The **distributive law** holds: `(A | B) & C = (A & C) | (B & C)`
- For **functions**, the behavior reverses (contravariance)
- `never` and `unknown` are the **identity elements** for `|` and `&` respectively

**Key concept to remember:** Union and Intersection are **dual operators**. Once you understand one, you understand the other — they behave like mirror images, like addition and multiplication.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> // Distributive law in action:
> type Test = (string | number) & ("hello" | 42);
> // Step-by-step resolution:
> // = (string & "hello") | (string & 42) | (number & "hello") | (number & 42)
> // = "hello"            | never         | never              | 42
> // = "hello" | 42
>
> // Hover over Test — does the result match your expectation?
>
> // Bonus: What does this produce?
> type Test2 = (string | number) & string;
> type Test3 = never | string;
> type Test4 = unknown & string;
> ```
> Hover over `Test`, `Test2`, `Test3`, and `Test4`. Explain each result
> using the distributive law or the identity elements.

---

> **Pause point** — The theory is complete. In the final section,
> we'll apply everything in realistic practical patterns.
>
> Continue with: [Section 06: Practical Patterns](./06-praxis-patterns.md)