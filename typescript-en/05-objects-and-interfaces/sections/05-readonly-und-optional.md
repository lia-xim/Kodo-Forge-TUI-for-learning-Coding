# 05 -- Readonly & Optional

> Estimated reading time: ~10 minutes

## What you'll learn here

- How `readonly` properties work and why they are **shallow**
- The difference between `optional` and `undefined`
- How `Readonly<T>` and `Required<T>` work
- The correct syntax for object destructuring with types
- Practical patterns for immutable state (Angular/React)

---

## Readonly Properties

With `readonly`, you mark properties that cannot be changed after creation:

```typescript annotated
interface Point {
  readonly x: number;
// ^^^^^^^^ 'readonly' modifier: This property cannot be changed after creation
  readonly y: number;
// ^^^^^^^^ Applies to the reference (assignment), not to the referenced object!
}

const p: Point = { x: 10, y: 20 };
// p.x = 30;
// ^^^^^^^ ERROR: Cannot assign to 'x' because it is a read-only property.
// Important: 'readonly' is a pure TYPE SYSTEM concept -- no difference at runtime!
```

> 🧠 **Explain to yourself:** What exactly does `readonly` protect? Is a property with
> `readonly` deeply immutable -- or only shallowly? What happens to `readonly` at runtime?
>
> **Key points:** readonly only protects direct assignment (p.x = ...) | Not
> the interior of nested objects (shallow!) | At runtime there is no readonly --
> pure type system construct | Object.freeze() needed for runtime immutability |
> Known soundness gap: readonly objects can be assigned to mutable types

> **Analogy:** `readonly` is like **laminated paper**. You can read the text,
> but not overwrite it. However -- and this is the crucial point --
> if the paper has an **address** written on it, only the address is laminated.
> What happens at that address (the referenced object) is not protected.

---

## The Shallow Trap

`readonly` in TypeScript only protects the **top level**. Nested objects
remain mutable:

```typescript
interface Company {
  readonly name: string;
  readonly address: {
    street: string;
    city: string;
  };
}

const company: Company = {
  name: "ACME",
  address: { street: "Hauptstr. 1", city: "Berlin" },
};

// company.name = "Foo";             // FEHLER -- readonly
// company.address = { ... };        // FEHLER -- readonly (die Referenz!)
company.address.street = "Neue Str.";  // KEIN FEHLER! Das Objekt selbst ist mutable!
```

```
  Readonly is SHALLOW
  ──────────────────────────────────────

  company ─────────────────────────────────
  |  name: "ACME"            PROTECTED    |
  |  address: ──────┐        PROTECTED    |  (reference only!)
  ─────────────────│──────────────────────
                   |
                   v
  address object ─────────────────────────────────
  |  street: "Hauptstr. 1"  NOT protected!       |
  |  city: "Berlin"         NOT protected!       |
  ────────────────────────────────────────────────
```

> **Deeper knowledge:** Why is `readonly` shallow? Because TypeScript doesn't inject
> any code at runtime. `readonly` only exists in the type system -- at runtime it's
> normal JavaScript, and JavaScript objects are mutable by default.
>
> `Object.freeze()` makes objects immutable at runtime -- but also only shallowly!
> For deep immutability you need libraries like Immer or a recursive
> `DeepReadonly` pattern (Lesson 16, Mapped Types).

### Readonly with Arrays

The same trap applies to arrays:

```typescript
interface TodoList {
  readonly items: string[];
}

const list: TodoList = { items: ["Einkaufen"] };
// list.items = [];            // FEHLER -- Referenz ist readonly
list.items.push("Kochen");    // KEIN FEHLER! Array-Inhalt ist mutable!

// Loesung: readonly Array
interface SafeTodoList {
  readonly items: readonly string[];
  // Alternativ: readonly items: ReadonlyArray<string>;
}

const safeList: SafeTodoList = { items: ["Einkaufen"] };
// safeList.items.push("Kochen");  // FEHLER! push existiert nicht auf readonly string[]
```

---

## Readonly\<T\> -- The Utility Type

`Readonly<T>` makes **all** properties of a type readonly -- but also only shallowly:

```typescript
interface User {
  name: string;
  age: number;
}

const frozenUser: Readonly<User> = { name: "Max", age: 30 };
// frozenUser.name = "Foo";  // FEHLER!
// frozenUser.age = 31;      // FEHLER!
```

> **Pro tip:** In Angular services that hold state, `Readonly<T>` is useful:
> ```typescript
> private _state: UserState = { /* ... */ };
>
> // Expose als Readonly -- Consumer koennen nicht direkt mutieren
> get state(): Readonly<UserState> { return this._state; }
> ```
>
> In React, `Readonly<Props>` is less necessary because React already treats Props as
> immutable. But for state objects (useReducer) it's helpful.

---

## Optional Properties

The `?` marks properties that may be absent:

```typescript
interface Config {
  host: string;
  port: number;
  debug?: boolean;     // Kann fehlen ODER undefined sein
  logFile?: string;    // Kann fehlen ODER undefined sein
}

// Gueltig -- debug und logFile werden weggelassen
const config: Config = {
  host: "localhost",
  port: 3000,
};
```

### Optional vs. `undefined` -- The Subtle Difference

```typescript
interface A {
  x?: number;              // Property kann FEHLEN oder undefined sein
}

interface B {
  x: number | undefined;   // Property MUSS existieren, Wert kann undefined sein
}

const a: A = {};               // OK -- x fehlt
// const b: B = {};            // FEHLER! Property 'x' is missing
const b: B = { x: undefined }; // OK -- x existiert, Wert ist undefined
```

> **Think about it:** When does the difference matter?
>
> Imagine a function `updateUser(changes: Partial<User>)`.
> If you pass `{ name: undefined }`, you're actively setting the name to undefined.
> If you pass `{}` (without name), you're not changing the name at all.
>
> With `exactOptionalPropertyTypes` (tsconfig option, since TS 4.4) TypeScript makes
> this distinction explicit: `x?` then only allows the property to be absent,
> NOT `undefined` as a value. This is stricter, but more precise.

---

## The Readonly Soundness Gap

> **Deeper knowledge:** TypeScript has a **known soundness gap** with `readonly`.
> A `readonly` object can be assigned to a non-readonly type -- and then
> mutated:
>
> ```typescript
> interface ReadonlyPoint { readonly x: number; readonly y: number; }
> interface MutablePoint { x: number; y: number; }
>
> const fixed: ReadonlyPoint = { x: 1, y: 2 };
> const mutable: MutablePoint = fixed;  // KEIN Fehler!
> mutable.x = 99;  // Aendert das "readonly" Objekt!
> console.log(fixed.x);  // 99 -- ueberraschung!
> ```
>
> Why does TypeScript allow this? Because `ReadonlyPoint` and `MutablePoint` are
> **structurally compatible**. Structural typing checks whether all properties are
> present and type-compatible -- `readonly` is not an obstacle for assignability.
>
> **This is a deliberate trade-off:** Strict readonly checks would break a great deal of
> existing code. The TypeScript maintainers decided against it.
>
> **Think about it:** Why would it be so costly to enforce `readonly` strictly? Consider
> a function `function process(point: MutablePoint)` -- if you could no longer pass a
> `ReadonlyPoint` to it, ALL functions that accept objects would have to explicitly
> accept `Readonly<T>`. That would be a massive breaking change.

---

## Object Destructuring with Types

When destructuring, the type annotation can look unfamiliar:

```typescript
// FALSCH -- das ist JavaScript-Syntax fuer UMBENENNUNG!
// const { name: string } = user;  // Benennt 'name' in 'string' um!

// RICHTIG -- Typ nach dem gesamten Pattern
const { name, age }: { name: string; age: number } = user;

// Besser: Interface verwenden
const { name, age }: User = user;

// In Funktionsparametern (Angular/React Best Practice):
function UserCard({ name, age }: { name: string; age: number }) {
  return `${name}, ${age} Jahre`;
}
```

> **Warning:** Confusing destructuring renaming with type annotation is one of the
> most common beginner mistakes. The syntax `{ name: string }` means in JavaScript
> "take `name` and call it `string`" -- not "name has type string".

### React Pattern: Destructuring Props

```typescript
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  showAvatar?: boolean;
}

// Destrukturierung direkt im Parameter:
function UserCard({ user, onEdit, showAvatar = false }: UserCardProps) {
  // showAvatar hat Default-Wert -- TypeScript weiss: boolean, nicht undefined
  return (
    <div>
      {showAvatar && <Avatar />}
      <span>{user.name}</span>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
}
```

---

## Required\<T\> -- The Counterpart to Optional

`Required<T>` makes ALL properties mandatory -- including the optional ones:

```typescript
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// Required<Config> = { host: string; port: number; debug: boolean }
const fullConfig: Required<Config> = {
  host: "localhost",
  port: 3000,
  debug: false,
  // Jede Property MUSS angegeben werden!
};
```

> **Pro tip:** `Required<T>` is useful for validation functions:
> ```typescript
> function validateConfig(partial: Config): Required<Config> {
>   return {
>     host: partial.host ?? "localhost",
>     port: partial.port ?? 3000,
>     debug: partial.debug ?? false,
>   };
> }
> ```
> The function takes an optional config and returns a complete one.

---

## Experiment Box: Optional vs. Undefined in Action

> **Experiment:** Enable `exactOptionalPropertyTypes` in the Playground (under
> "TS Config" top right) and write:
> ```typescript
> interface Prefs {
>   theme?: "light" | "dark";
> }
>
> const p1: Prefs = {};                    // OK -- theme fehlt
> const p2: Prefs = { theme: "light" };    // OK
> const p3: Prefs = { theme: undefined };  // ???
> ```
> With `exactOptionalPropertyTypes: true`, `p3` gives an error!
> Without the option it's allowed. This shows: TypeScript distinguishes
> "property is missing" and "property is undefined" -- but only when you
> explicitly enable it.
>
> **Think about it:** When is this difference relevant in practice?
> Consider `Object.keys(p1)` vs. `Object.keys(p3)` -- with `p1` there is
> no key `theme`, but with `p3` there is (with value `undefined`). This can cause
> bugs in serialization (JSON.stringify) and iteration logic.

---

## Summary

| Concept | Description |
|---------|-------------|
| `readonly` | Property cannot be changed after creation |
| Shallow readonly | Only the top level is protected! |
| `readonly T[]` | Array contents are also readonly |
| `Readonly<T>` | Make all properties readonly (shallow!) |
| Readonly soundness | readonly objects can be assigned to mutable types! |
| `x?` (optional) | Property can be absent |
| `x: T \| undefined` | Property MUST exist, value can be undefined |
| `exactOptionalPropertyTypes` | Stricter separation of missing vs. undefined |
| `Required<T>` | All optional properties become mandatory |
| Destructuring | Type after the pattern: `{ x, y }: Type` |

---

**What you've learned:** You understand the shallow trap of `readonly`, the difference
between optional and undefined, and how destructuring with types works.

| [<-- Previous Section](04-excess-property-checking.md) | [Back to Overview](../README.md) | [Next Section: Index Signatures -->](06-index-signatures.md) |