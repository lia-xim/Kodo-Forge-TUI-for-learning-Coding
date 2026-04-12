# Section 2: Readonly Arrays

> **Estimated reading time:** ~10 minutes
>
> **What you'll learn here:**
> - Why array mutation is a classic source of bugs
> - `readonly T[]` and `ReadonlyArray<T>` — two ways to the same goal
> - Which methods are available on readonly arrays (and which aren't)
> - The critical difference between `readonly` (compile-time) and `Object.freeze` (runtime)
> - Why `readonly` for function parameters is almost always the right choice

---

## The Problem: Unintended Mutation

```typescript
function verarbeite(namen: string[]): void {
  namen.sort();          // ACHTUNG: sortiert das Original-Array!
  namen.push("Neuer");   // ACHTUNG: veraendert das Original-Array!
}

const meineNamen = ["Charlie", "Alice", "Bob"];
verarbeite(meineNamen);
// meineNamen ist jetzt ["Alice", "Bob", "Charlie", "Neuer"] !!!
```

> **Experiment Box:** Run this code in your IDE (`npx tsx`):
> ```typescript
> const original = [3, 1, 2];
> const referenz = original;
> referenz.sort();
> console.log(original);  // Was kommt raus?
> console.log(original === referenz);  // true oder false?
> ```
> Now compare with:
> ```typescript
> const original2 = [3, 1, 2];
> const kopie = [...original2].sort();
> console.log(original2);  // Unveraendert!
> console.log(original2 === kopie);  // false!
> ```
> The difference: reference assignment vs. spread copy.

This is a classic bug. The function modifies the passed array,
even though the caller doesn't expect it.

> **Background: Why does this happen?** In JavaScript/TypeScript, arrays are
> passed **by reference**, not by copy. When you pass an array to a function,
> the function receives a pointer to **the same object in memory**. This is a
> fundamental difference from primitive types (`number`, `string`, `boolean`),
> which are copied by value.
>
> ```
>   const meineNamen = ["Charlie", "Alice", "Bob"];
>                        │
>                        ▼
>                   ┌─────────────────────────────┐
>                   │ ["Charlie", "Alice", "Bob"]  │  <-- EIN Objekt im Heap
>                   └─────────────────────────────┘
>                        ▲
>                        │
>   verarbeite(namen) ---┘   namen zeigt auf DASSELBE Array!
> ```
>
> Experienced JavaScript developers are well aware of this behavior, but
> it still leads to constant bugs — especially in Angular services or
> React state, where shared references get mutated unnoticed.

---

## The Solution: `readonly`

```typescript annotated
function verarbeiteSicher(namen: readonly string[]): void {
  // namen.sort();      // ← ERROR! 'sort' does not exist on readonly
  // namen.push("X");   // ← ERROR! 'push' does not exist on readonly
  // namen[0] = "Y";    // ← ERROR! Index signature is readonly

  // Only reading operations allowed:
  console.log(namen.length);          // ← OK: read length
  console.log(namen[0]);              // ← OK: read element
  console.log(namen.includes("Alice")); // ← OK: searching creates nothing new

  // Creating new arrays is okay:
  const sortiert = [...namen].sort();    // ← OK: copy first, then sort
  const erweitert = [...namen, "Neuer"]; // ← OK: create new array
}
```

**Explain to yourself:** Why does `readonly` block exactly the mutating methods, but not `map()`, `filter()`, or `slice()`?
- `readonly` protects against in-place mutation — i.e., methods that modify the original (`push`, `sort`, `splice`)
- Methods like `map()` and `filter()` create a **new** array and leave the original unchanged — they are therefore allowed
- This follows the functional paradigm: "Create new data instead of modifying existing data"
`

> **Practical tip:** Make it a habit: **Function parameters that accept arrays should almost always be `readonly`.** This is the same principle as `const` for variables — you're communicating: "This function does not modify the array." In Angular projects, this is especially important for services that share arrays with multiple components.

---

## Two Syntaxes for Readonly Arrays

```
  readonly string[]         ReadonlyArray<string>
  -----------------         --------------------
  Kurzform                  Generische Form
  Haeufiger verwendet       Deutlicher/expliziter
```

Both are identical in their result:

```typescript
const a: readonly string[] = ["A", "B"];
const b: ReadonlyArray<string> = ["A", "B"];
```

**Why are there two different types?** Because `ReadonlyArray<T>` is
its own interface in the standard library that contains **only the
non-mutating methods** of `Array<T>`. `readonly T[]` is syntactic sugar for it.

---

## Available Methods: What Works, What Doesn't?

```
  Methode       string[]    readonly string[]    Veraendert Original?
  ----------    --------    -----------------    --------------------
  length        ja          ja                   nein
  [index]       ja          ja (nur lesen)       nein
  includes()    ja          ja                   nein
  indexOf()     ja          ja                   nein
  find()        ja          ja                   nein
  filter()      ja          ja                   nein (neues Array)
  map()         ja          ja                   nein (neues Array)
  forEach()     ja          ja                   nein
  slice()       ja          ja                   nein (neues Array)
  concat()      ja          ja                   nein (neues Array)
  push()        ja          NEIN                 ja
  pop()         ja          NEIN                 ja
  sort()        ja          NEIN                 ja
  splice()      ja          NEIN                 ja
  reverse()     ja          NEIN                 ja
  shift()       ja          NEIN                 ja
  unshift()     ja          NEIN                 ja
  [index] = x   ja          NEIN                 ja
```

**The pattern:** Everything that **mutates the array in-place** is blocked on `readonly`.
Everything that **returns a new** array continues to work.

> **Going deeper:** Since ES2023, there are `toSorted()`, `toReversed()` and
> `toSpliced()` — these are **non-mutating** variants of `sort()`,
> `reverse()`, and `splice()`. They return a new array and therefore also
> work on `readonly` arrays. If your project targets ES2023 or higher
> (in `tsconfig.json`), these methods are available and are the preferred choice.

---

> **Think about it:** If `readonly` blocks all mutating methods, why can you
> still write `const arr: readonly string[] = [...readonlyArr, "neu"]`?
> Isn't that also a change?
>
> **Answer:** No — the spread operator creates a **new array**. The
> original is not modified. `readonly` protects against **in-place mutation**
> (push, pop, sort), not against the **creation of new arrays**. This is
> exactly the functional programming paradigm: "Create new data instead of
> modifying existing data."

## `readonly` vs `Object.freeze`

```typescript
// readonly ist nur zur Compile-Zeit — es schuetzt nicht zur Laufzeit!
const arr: readonly number[] = [1, 2, 3];
// arr.push(4);  // Compile-Fehler

// Object.freeze schuetzt zur Laufzeit, aber der Typ ist weniger praezise
const frozen = Object.freeze([1, 2, 3]);
// frozen.push(4);  // Compile-Fehler UND Laufzeit-Fehler
```

**The critical difference:**

| Aspect | `readonly` | `Object.freeze` |
|---|---|---|
| Protection point | Compile-time only | Compile-time AND runtime |
| After compilation | Gone (Type Erasure!) | Persists |
| Depth | Can be arbitrarily deep | **Shallow** (one level only) |
| Performance | No runtime overhead | Minimal overhead |
| Bypassable via `as any` | Yes | No |

> **Background: Type Erasure.** `readonly` only exists in the TypeScript
> type system. After compilation to JavaScript, it's completely gone — there
> is no runtime difference between `readonly string[]` and `string[]`.
> An `as any` cast or a call from a JavaScript file can still mutate the array.
> `Object.freeze`, on the other hand, is a real runtime feature,
> but it is **shallow** — nested arrays are not frozen.

---

## Assignment Direction: readonly Is a One-Way Street

```typescript
const readonlyArr: readonly string[] = ["A", "B"];
// const mutableArr: string[] = readonlyArr;  // FEHLER!

// Aber andersherum geht es:
const mutable: string[] = ["A", "B"];
const readonlyRef: readonly string[] = mutable;  // OK!
```

**Why this asymmetry?**

```
  string[]  ──────────►  readonly string[]     OK (Rechte entfernen)
  readonly string[]  ──X──►  string[]          FEHLER (Rechte hinzufuegen)
```

**Removing** readonly would be unsafe — someone could then mutate the array
marked as readonly via the mutable reference. **Adding** readonly is safe —
granting fewer rights cannot cause any harm.

> **Think about it:** Why does a function with a `readonly string[]`
> parameter also accept a regular `string[]` as an argument?
>
> **Answer:** Because the function **promises** not to modify the array.
> Whether the passed array is actually readonly or not doesn't matter — the
> function will not mutate it. It's like a library that promises not to damage
> your book — it doesn't matter whether the book is laminated (readonly) or not.

---

## In Practice: readonly in Angular and React

### Angular Services

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [];

  // Gibt readonly zurueck — niemand kann das interne Array mutieren
  getUsers(): readonly User[] {
    return this.users;
  }
}

// In der Component:
// this.userService.getUsers().push(newUser);  // Compile-Fehler!
// Stattdessen muss man den Service benutzen:
// this.userService.addUser(newUser);
```

### React State

```typescript
// React state sollte nie direkt mutiert werden — readonly hilft dabei:
interface AppState {
  readonly items: readonly string[];
  readonly count: number;
}

// setState mit Spread statt Mutation:
setState(prev => ({
  ...prev,
  items: [...prev.items, newItem],
}));
```

---

## What you've learned

- Array mutation via shared references is a common source of bugs
- `readonly string[]` and `ReadonlyArray<string>` are identical
- `readonly` blocks all **mutating** methods, lets **reading** methods through
- `readonly` is purely compile-time (Type Erasure), `Object.freeze` is runtime (but shallow)
- Assigning mutable to readonly is OK, the other way around is not
- Function parameters should almost always be `readonly`

**Break point:** In the next section, we dive into tuples — the position-typed sibling of arrays.

---

[<-- Previous Section: Array Basics](01-array-grundlagen.md) | [Back to Overview](../README.md) | [Next Section: Tuples Basics -->](03-tuples-grundlagen.md)