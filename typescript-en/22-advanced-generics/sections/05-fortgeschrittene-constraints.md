# Section 5: Advanced Constraints

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - in/out Modifier](./04-in-out-modifier.md)
> Next section: [06 - Designing Generic APIs](./06-generische-apis-designen.md)

---

## What you'll learn here

- **Intersection constraints** (`T extends A & B`) — multiple requirements at once
- **Recursive constraints** (`T extends Comparable<T>`) — the F-bounded polymorphism pattern
- **Distributive behavior** in conditional types and how to control it
- How to **combine constraints** for maximum type safety

---

## Intersection Constraints: Multiple Requirements
<!-- section:summary -->
In lesson 13 you learned simple constraints: `T extends HasId`.

<!-- depth:standard -->
In lesson 13 you learned simple constraints: `T extends HasId`.
But what if T needs to satisfy multiple interfaces at the same time?

```typescript annotated
interface HasId { id: number; }
interface HasName { name: string; }
interface Serializable { serialize(): string; }

// Simple constraint — one requirement:
function getIdSimple<T extends HasId>(item: T): number {
  return item.id;
}

// Intersection constraint — MULTIPLE requirements:
function processEntity<T extends HasId & HasName & Serializable>(item: T): string {
  console.log(`Processing ${item.name} (ID: ${item.id})`);
  return item.serialize();
}
// ^^^ T must satisfy ALL three interfaces:
//     id: number AND name: string AND serialize(): string

// Usage:
const user = {
  id: 1,
  name: "Max",
  serialize() { return JSON.stringify({ id: this.id, name: this.name }); }
};
processEntity(user); // OK — has all three properties

// processEntity({ id: 1 });
// ^^^ ERROR: name and serialize are missing!
```

> 📖 **Background: Why `&` instead of separate constraints?**
>
> In Java you write `<T extends A & B>` — same syntax. But in Java
> these are separate bounds, not an intersection. TypeScript uses the
> same `&` operator as with normal intersection types. This is
> consistent: `T extends A & B` is the same as "T must be a subtype of
> the intersection of A and B".
>
> The advantage over separate constraints: you can combine any number of
> interfaces, mix in `Partial<>`, and even use conditional
> types within the constraint.

---

<!-- /depth -->
## Extra Properties Are Allowed
<!-- section:summary -->
An often overlooked aspect: with generic constraints, extra

<!-- depth:standard -->
An often overlooked aspect: with generic constraints, extra
properties are no problem (unlike direct object assignment):

```typescript annotated
interface HasId { id: number; }
interface HasName { name: string; }

function greet<T extends HasId & HasName>(entity: T): string {
  return `Hello ${entity.name} (#${entity.id})`;
}

// Extra properties are OK:
const fullUser = { id: 1, name: "Max", email: "max@test.de", age: 30 };
greet(fullUser);
// ^^^ T is inferred as { id: number; name: string; email: string; age: number }
//     Extra properties are allowed with generics!
//     (Unlike direct assignment to an interface.)

// The constraint only says: "at least id and name".
// Everything beyond that is OK.
```

---

<!-- /depth -->
## Recursive Constraints: F-bounded Polymorphism
<!-- section:summary -->
One of the most powerful constraint techniques: the type parameter references

<!-- depth:standard -->
One of the most powerful constraint techniques: the type parameter references
**itself** in the constraint.

```typescript annotated
// The Comparable pattern (familiar from Java):
interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number;
}
// ^^^ T extends Comparable<T> — T must be able to compare itself with ITSELF!
//     This ensures: apples only compare themselves to apples,
//     not to oranges.

class Temperature implements Comparable<Temperature> {
  constructor(public celsius: number) {}

  compareTo(other: Temperature): number {
    return this.celsius - other.celsius;
  }
}

class Weight implements Comparable<Weight> {
  constructor(public kg: number) {}

  compareTo(other: Weight): number {
    return this.kg - other.kg;
  }
}

// Type-safe sort function:
function sortItems<T extends Comparable<T>>(items: T[]): T[] {
  return [...items].sort((a, b) => a.compareTo(b));
}

const temps = sortItems([new Temperature(30), new Temperature(20)]);
// ^^^ OK — Temperature compares itself with Temperature.

// sortItems([new Temperature(30), new Weight(70)]);
// ^^^ ERROR! Mixing Temperature[] and Weight[] is not allowed.
```

> 🧠 **Explain it to yourself:** Why does `T extends U ? X : Y`
> distribute over union types when T is a "naked" type parameter? What happens
> with `IsString<string | number>`?
>
> **Key points:** Naked type parameter = T without wrapping (not [T]) |
> TypeScript distributes: `IsString<string | number>` becomes
> `IsString<string> | IsString<number>` | Each union member is checked individually |
> This is called "Distributive Conditional Types"

---

<!-- /depth -->
## Distributive Conditional Types: Control
<!-- section:summary -->
You know conditional types from lesson 17. Here is the advanced

<!-- depth:standard -->
You know conditional types from lesson 17. Here is the advanced
version: controlling distribution.

```typescript annotated
// DISTRIBUTIVE (default): T distributes over the union
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;           // "yes"
type B = IsString<number>;           // "no"
type C = IsString<string | number>;  // "yes" | "no" — Distribution!
// ^^^ TypeScript does: IsString<string> | IsString<number>
//     = "yes" | "no"

type D = IsString<never>;            // never — empty union!
// ^^^ never is the empty union. Distribution over 0 members = never.

// NON-DISTRIBUTIVE: Wrapping with a tuple prevents distribution
type IsStringStrict<T> = [T] extends [string] ? "yes" : "no";

type E = IsStringStrict<string>;          // "yes"
type F = IsStringStrict<string | number>; // "no" — NO distribution!
// ^^^ [string | number] extends [string] → false
//     The union is checked AS A WHOLE.

type G = IsStringStrict<never>;           // "yes"!
// ^^^ [never] extends [string] → true (never extends everything)
//     Surprising! Without distribution, never is checked normally.
```

---

> 🤔 **Think about it:** What happens with `SomeType<string | number>` when
> SomeType contains a conditional type?
>
> ```typescript
> type Wrap<T> = T extends string ? { text: T } : { value: T };
> type Result = Wrap<string | number>;
> ```
>
> Answer: Distribution! Result = `{ text: string } | { value: number }`.
> Each union member is processed individually.

---

<!-- /depth -->
## Conditional Constraints with Conditional Types
<!-- section:summary -->
You can also make constraints dynamic — based on the type:

<!-- depth:standard -->
You can also make constraints dynamic — based on the type:

```typescript annotated
// Validator type that adapts to the field type:
interface StringValidator { minLength: number; pattern: RegExp; }
interface NumberValidator { min: number; max: number; }

type ValidatorFor<T> = T extends string ? StringValidator
                     : T extends number ? NumberValidator
                     : never;
// ^^^ Conditional type as "constraint dispatch":
//     String → StringValidator, Number → NumberValidator

// Type-safe validate function:
function validate<T extends string | number>(
  value: T,
  validator: ValidatorFor<T>
): boolean {
  // TypeScript knows: if T is string, validator is a StringValidator
  return true; // (simplified)
}

validate("hello", { minLength: 3, pattern: /^[a-z]+$/ }); // OK
validate(42, { min: 0, max: 100 }); // OK
// validate("hello", { min: 0, max: 100 }); // ERROR — wrong validator!
```

---

> 🔬 **Experiment:** Combine intersection constraints with conditional
> types:
>
> ```typescript
> interface HasId { id: number; }
> interface HasVersion { version: number; }
>
> // Only versioned entities should require serialize():
> type RequiredMethods<T> = T extends HasVersion
>   ? { serialize(): string; validate(): boolean }
>   : { validate(): boolean };
>
> function process<T extends HasId>(
>   entity: T & RequiredMethods<T>
> ): void {
>   // entity has id (from HasId) AND the appropriate methods
> }
> ```
>
> This is powerful: the requirements change based on the type!

---

<!-- /depth -->
## Suppressing Distributive Behavior
<!-- section:summary -->
Sometimes you want to explicitly **prevent** distribution. Here are the

<!-- depth:standard -->
Sometimes you want to explicitly **prevent** distribution. Here are the
three methods:

```typescript annotated
type IsNullable<T> = T extends null | undefined ? true : false;

// Problem: distribution over union
type A = IsNullable<string | null>; // true | false = boolean (not helpful!)

// Solution 1: Tuple wrapping
type IsNullableStrict<T> = [T] extends [null | undefined] ? true : false;
type B = IsNullableStrict<string | null>; // false

// Solution 2: Check in the reverse direction
type ContainsNull<T> = null extends T ? true : false;
type C = ContainsNull<string | null>; // true!
// ^^^ null extends (string | null) is true!
//     No naked type parameter → no distribution.

// Solution 3: Extract for targeted checking
type HasNull<T> = Extract<T, null> extends never ? false : true;
type D = HasNull<string | null>; // true
type E = HasNull<string>;        // false
```

---

<!-- /depth -->
## The Framework Connection

> 🅰️ **Angular:** Angular's Reactive Forms use advanced
> constraints: `FormControl<T extends AbstractControl>` ensures
> that only valid control types are used. The new Typed Forms
> API (Angular 14+) uses recursive types and intersection constraints
> to make the entire form structure type-safe.
>
> ⚛️ **React:** React's `ComponentProps<T extends keyof JSX.IntrinsicElements | ComponentType>`
> is a constraint that accepts both HTML elements and React components.
> The union in the constraint (`|`) allows different
> element categories.

---

## What you've learned

- **Intersection constraints** (`T extends A & B`) require that T has all
  properties of both interfaces — like an AND contract
- **Extra properties** are allowed with generic constraints (T can
  have more than the constraint requires)
- **F-bounded polymorphism** (`T extends Comparable<T>`) ensures
  that a type can only compare itself with instances of its own type
- **Distributive conditional types** distribute over unions — but
  only with naked type parameters. `[T] extends [U]` prevents distribution.
- Distribution is controlled with: tuple wrapping, reverse checking,
  or `Extract<T, U>`

> **Core concept:** Advanced constraints give you precision control:
> intersection for "AND", recursive for "self-reference", conditional for
> "conditional requirements". Distribution is powerful but must be controlled.

---

> ⏸️ **Break point:** Last content break before the final section.
> In section 6 we bring everything together: How do you design generic
> APIs that are type-safe, ergonomic, and maintainable?
>
> **Continue:** [Section 06 - Designing Generic APIs →](./06-generische-apis-designen.md)