# Section 4: Constraints

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Generic Interfaces and Types](./03-generische-interfaces-und-types.md)
> Next section: [05 - Default Type Parameters](./05-default-typparameter.md)

---

## What you'll learn here

- Why unconstrained type parameters are sometimes too limited
- How `extends` constrains type parameters
- The `keyof` constraint for type-safe property access
- Combining multiple constraints

---

## The Problem: T Can Be ANYTHING

Without a constraint, `T` is completely open. You can't do anything with it:

```typescript annotated
function getLength<T>(arg: T): number {
  return arg.length;
  //         ^^^^^^ Error! Property 'length' does not exist on type 'T'
}
// TypeScript: "T could be number — and number has no .length!"
```

This is correct. `T` could be `string` (has `.length`), but also
`number` (has no `.length`). TypeScript only allows operations that
apply to **every possible type**.

> 💭 **Think about it:** What happens without the `extends` constraint? And why
> isn't `unknown` sufficient as a constraint?
>
> **Think for a moment before reading on...**
>
> Without a constraint, `T` is completely unconstrained — TypeScript treats it
> like `unknown`. You can't read any properties, call any methods,
> nothing. `unknown` as an explicit constraint (`T extends unknown`) changes
> nothing, because `unknown` has zero known properties. A constraint
> must describe the **concrete capabilities** you need —
> e.g. `{ length: number }`.

---

## The Solution: `extends` as a Constraint

With `extends` you say: "T must have at least these properties."

```typescript annotated
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length; // OK! TypeScript knows: T has .length
}

getLength("hello");        // OK — string has .length
getLength([1, 2, 3]);      // OK — Array has .length
getLength({ length: 10 }); // OK — object has .length

// getLength(42);           // Error! number has no .length
// getLength(true);         // Error! boolean has no .length
```

`T extends { length: number }` means: "T must be a type that
has at least a property `length: number`." TypeScript checks this
at every call site.

> 🔬 **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> // Step 1: Without constraint — observe the error
> function getLengthBroken<T>(arg: T): number {
>   return arg.length; // Error here — why exactly?
> }
>
> // Step 2: With constraint — the error moves to the call site
> function getLength<T extends { length: number }>(arg: T): number {
>   return arg.length; // Now OK!
> }
>
> getLength("hello");   // OK
> getLength([1, 2, 3]); // OK
> getLength(42);         // Error — here, at the call site
> ```
>
> Notice: Where does the error appear **without** a constraint (inside the function)?
> Where with a constraint (at the call site)? That's the difference between
> "discovering errors late" and "discovering errors early."

> 🔍 **Deeper Knowledge: Constraints in TypeScript vs. Bounds in Java**
>
> TypeScript's `<T extends { length: number }>` conceptually corresponds to
> Java's *Upper Bounds*: `<T extends Comparable<T>>`. But there's a
> crucial difference:
>
> - **Java** checks whether T **implements** a class/interface
>   (nominal typing). `T extends Comparable<T>` means: T must
>   explicitly implement `Comparable`.
> - **TypeScript** checks whether T satisfies the **structure** (structural
>   typing). `T extends { length: number }` means: T must have a
>   property `length: number` — regardless of origin.
>
> This makes TypeScript constraints more flexible: A `string` satisfies
> `{ length: number }` without `String` needing to implement anything.

---

## Constraints with Named Interfaces

Instead of inline constraints you can also use interfaces:

```typescript annotated
interface HasId {
  id: number;
}

interface HasName {
  name: string;
}

function printId<T extends HasId>(entity: T): void {
  console.log(`ID: ${entity.id}`);
  // entity has .id — guaranteed by the constraint
}

// The type retains ALL properties — not just id:
const user = { id: 1, name: "Max", email: "max@test.de" };
printId(user); // OK — user has .id (and more)
// ^ TypeScript infers T as { id: number; name: string; email: string }
// Not as HasId! T is the FULL type.
```

> **Important:** The constraint is the **minimum requirement**. The
> inferred type `T` retains all actual properties.

---

## The `keyof` Constraint — Type-Safe Property Access

One of the most common generics patterns of all:

```typescript annotated
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
// ^ K must be a valid key of T
// ^ T[K] is the type of the property — automatically correct!

const user = { name: "Max", age: 30, active: true };

const name = getProperty(user, "name");
// ^ Type: string — TypeScript knows that user.name is string

const age = getProperty(user, "age");
// ^ Type: number

// getProperty(user, "email");
// Error! "email" is not in keyof typeof user
```

Let's break this down:

1. `T` is the type of the object (inferred from `user`)
2. `K extends keyof T` means: K must be a key of T
3. `T[K]` is an **Indexed Access Type**: "The type of property K in T"
4. TypeScript checks at compile time that the key exists

> This is the fundamental building block for TypeScript utility types like
> `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, etc.

> 🧠 **Self-Explanation:** Pause briefly and explain to yourself: Why does
> `getProperty` need **two** type parameters (`T` and `K`) instead of one?
> What would be the problem if K were simply `string` instead of
> `K extends keyof T`?
>
> **Key points:** With `K extends keyof T` TypeScript knows the **exact**
> key | The return type `T[K]` is then precise (`string`, not
> `string | number | boolean`) | With `string` as key type there would be no
> compile-time check whether the key exists

---

## Multiple Constraints

TypeScript only allows one `extends` per type parameter, but you can
combine multiple constraints using intersection types:

```typescript annotated
interface HasId {
  id: number;
}

interface Serializable {
  toJSON(): string;
}

// T must satisfy BOTH:
function saveEntity<T extends HasId & Serializable>(entity: T): void {
  console.log(`Saving entity ${entity.id}`);
  const json = entity.toJSON();
  // ... save
}
```

`T extends HasId & Serializable` means: "T must have both `id: number`
and `toJSON(): string`."

### Constraints with Multiple Type Parameters

Each type parameter can have its own constraint:

```typescript annotated
function merge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  return { ...target, ...source };
}

const result = merge(
  { name: "Max" },
  { age: 30 }
);
// ^ Type: { name: string } & { age: number }
// result.name — string
// result.age  — number
```

---

## Constraint Patterns in Practice

### Pattern 1: Comparable Values

```typescript annotated
function max<T extends number | string>(a: T, b: T): T {
  return a > b ? a : b;
}

max(10, 20);       // OK: number
max("abc", "xyz"); // OK: string
// max(10, "abc"); // Error! number and string mixed
```

### Pattern 2: Objects with a Specific Shape

```typescript annotated
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const users = [
  { name: "Max", age: 30 },
  { name: "Anna", age: 25 },
];

const names = pluck(users, "name");
// ^ Type: string[] — automatically correct!

const ages = pluck(users, "age");
// ^ Type: number[]
```

### Pattern 3: Constructor Constraint

```typescript annotated
function createInstance<T>(Constructor: new () => T): T {
  return new Constructor();
}
// ^ Only accepts classes that can be called with new()
```

---

## Real-World Usage: Constraints in Angular and React

Constraints are ubiquitous in real frameworks:

**Angular — Pipe with Generic Constraint:**

```typescript annotated
// A pipe that only works on arrays with an id property
@Pipe({ name: 'sortById' })
class SortByIdPipe implements PipeTransform {
  transform<T extends { id: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.id - b.id);
  }
  // ^ T retains the full type — the pipe works with
  //   User[], Product[], Order[] — anything that has an id
}
```

**React — useSelector with Constraint:**

```typescript annotated
// Redux useSelector — simplified
function useSelector<TState, TSelected>(
  selector: (state: TState) => TSelected
): TSelected;

// Usage:
const userName = useSelector((state: RootState) => state.user.name);
// ^ TSelected is inferred as string — type-safe!
```

In both cases, constraints ensure that the generics **know enough** to be
useful, but remain **open enough** to be reusable.

---

## Common Mistake: Constraints That Are Too Narrow

```typescript annotated
// BAD: Constraint unnecessarily restricts
function logValue<T extends string>(value: T): void {
  console.log(value);
}
// Why generic? T is only used as string.
// Better: function logValue(value: string): void

// GOOD: Constraint used meaningfully
function sortByKey<T extends Record<string, number>>(
  items: T[],
  key: keyof T
): T[] {
  return [...items].sort((a, b) => (a[key] as number) - (b[key] as number));
}
// Here T preserves the full type of the objects
```

---

## What You've Learned

- Without constraints, `T` is like `unknown` — you can't read any properties, call any methods
- `T extends { length: number }` means: T must have **at least** this structure (minimum requirement, not exact shape)
- `K extends keyof T` + `T[K]` is the fundamental building block for type-safe property access — the return type is precise
- Constraints can be combined: `T extends A & B` enforces multiple minimum requirements
- The pattern `<T extends { id: number }>` is ubiquitous in Angular pipes and React hooks

**Core concept:** Constraints are the balance between "too general" (unconstrained T can do nothing) and "too specific" (a concrete type loses reusability). `T extends { length: number }` means: "Whatever type — as long as it has `.length`."

---

## Summary

| Concept | Syntax | Meaning |
|---------|--------|---------|
| Basic constraint | `T extends Type` | T must satisfy Type |
| keyof constraint | `K extends keyof T` | K must be a key of T |
| Multiple constraints | `T extends A & B` | T must satisfy A AND B |
| Indexed access | `T[K]` | Type of property K in T |

---

> 🧠 **Explain to yourself:** Why does `getProperty(user, "name")` return
> the type `string` and not `string | number | boolean`?
> **Key points:** K is inferred as "name" | T["name"] is string | Indexed access is precise per key

---

> **Pause point** — Good? Then continue to [Section 05: Default Type Parameters](./05-default-typparameter.md)