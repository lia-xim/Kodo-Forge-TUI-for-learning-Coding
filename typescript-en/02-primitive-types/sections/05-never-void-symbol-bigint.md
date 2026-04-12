# Section 5: never, void, symbol, bigint — The Specialists

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - any vs unknown](./04-any-vs-unknown.md)
> Next section: [06 - Type Widening](./06-type-widening.md)

---

## What you'll learn here

- `never` as Bottom Type: What "impossible" means in type theory
- `void` vs `undefined`: The subtle but important difference
- `symbol` as a unique identifier and its role in JavaScript/TypeScript
- `bigint` for large numbers and why ES2020 needed it

---

## never — the "impossible" type

`never` is the **Bottom Type** — it represents values that
**can never occur**.

### Where does never appear?

```typescript
// 1. Funktionen, die nie zurueckkehren (throw):
function throwError(msg: string): never {
  throw new Error(msg);
}

// 2. Endlosschleifen:
function infiniteLoop(): never {
  while (true) {}
}

// 3. Nach erschoepfenden Pruefungen (Exhaustive Checks):
type Color = "rot" | "gruen" | "blau";

function colorToHex(c: Color): string {
  switch (c) {
    case "rot":   return "#ff0000";
    case "gruen": return "#00ff00";
    case "blau":  return "#0000ff";
    default:
      // Wenn alle Faelle behandelt sind, ist c hier never
      const exhaustive: never = c;
      return exhaustive;
  }
}
```

### Why is never useful?

The **Exhaustive Check** is the most important pattern. If you add a new
value to the `Color` union but don't update the `switch`,
you get a compile error:

```typescript
type Color = "rot" | "gruen" | "blau" | "gelb";  // "gelb" neu hinzugefuegt

function colorToHex(c: Color): string {
  switch (c) {
    case "rot":   return "#ff0000";
    case "gruen": return "#00ff00";
    case "blau":  return "#0000ff";
    default:
      const exhaustive: never = c;
      //    ^^^^^^^^^^^^^^^^^^
      // Error! Type '"gelb"' is not assignable to type 'never'.
      return exhaustive;
  }
}
```

> 📖 **Background: never in type theory**
>
> In type theory, the Bottom Type is the **empty set**: there is
> no value that has this type. Yet it is assignable to every type —
> just like the empty set is a subset of every other set.
>
> This sounds paradoxical, but is logical: The statement "All elements of the
> empty set are strings" is **true** (vacuous truth), because there are
> no counterexamples. That's why `never` is a subtype of `string`,
> `number`, and every other type.
>
> In practice this means: A function with return type `never` can
> be used anywhere a concrete type is expected — because it
> never returns anyway.

> ⚡ **Practical tip: Exhaustive Check as a utility function**
>
> ```typescript
> // Einmal definieren, ueberall verwenden:
> function assertNever(value: never): never {
>   throw new Error(`Unerwarteter Wert: ${value}`);
> }
>
> // Verwendung:
> function colorToHex(c: Color): string {
>   switch (c) {
>     case "rot":   return "#ff0000";
>     case "gruen": return "#00ff00";
>     case "blau":  return "#0000ff";
>     default: return assertNever(c);
>   }
> }
> ```
>
> This function provides compile-time safety AND runtime safety:
> a compile error for forgotten cases, and a clear error if an
> unknown value somehow arrives.

---

## void — for functions with no return value

`void` means: "This function returns nothing meaningful."

```typescript
function logMessage(msg: string): void {
  console.log(msg);
  // Kein return noetig
}
```

### void is NOT the same as undefined

```typescript
function returnVoid(): void {}
function returnUndefined(): undefined {
  return undefined;  // Muss explizit zurueckgegeben werden!
}
```

> 🔍 **Deeper knowledge: Why the difference between void and undefined?**
>
> The difference lies in **callback compatibility**. When a
> callback type returns `void`, the implementation may still
> return a value — it's simply ignored:
>
> ```typescript
> // Array.forEach erwartet (value) => void
> const arr = [1, 2, 3];
>
> // Array.push gibt number zurueck — trotzdem kein Error:
> arr.forEach((v) => arr.push(v));  // OK
>
> // Waere der Typ (value) => undefined, muesste die
> // Implementation explizit undefined zurueckgeben:
> type StrictCallback = (value: number) => undefined;
> const cb: StrictCallback = (v) => arr.push(v);  // Error!
> ```
>
> This design decision makes TypeScript compatible with the
> real JavaScript ecosystem, where callbacks frequently return a value
> that is ignored by the caller.

> 💭 **Think about it:** Why does TypeScript have both `void` and `undefined`,
> even though `void` functions return `undefined` at runtime?
>
> **Answer:** `void` is a **signal to the caller**: "Ignore the
> return value." `undefined` is a **concrete value**: "The return value
> is `undefined`." The difference is semantic — `void` says "whatever comes back",
> `undefined` says "exactly `undefined` comes back."

---

## symbol — the underrated type

`symbol` is a primitive type that creates **guaranteed unique** values.
It was introduced in ES2015.

```typescript
const sym1 = Symbol("beschreibung");
const sym2 = Symbol("beschreibung");

console.log(sym1 === sym2);  // false! Jedes Symbol ist einzigartig
// Die Beschreibung ist nur fuer Debugging — sie beeinflusst die Identitaet nicht
```

### What are symbols used for?

**1. As unique property keys** that never collide:

```typescript
const id = Symbol("id");
const user = {
  name: "Max",
  [id]: 12345  // Unsichtbar in for...in und JSON.stringify!
};

console.log(user[id]);       // 12345
console.log(JSON.stringify(user));  // {"name":"Max"} — Symbol-Key fehlt!
```

**2. Well-Known Symbols** — for language features:

```typescript
// Symbol.iterator macht Objekte iterierbar (for...of):
class Range {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
}

for (const n of new Range(1, 5)) {
  console.log(n);  // 1, 2, 3, 4, 5
}
```

**3. Symbol.for()** — global symbol registry:

```typescript
const s1 = Symbol.for("app.id");
const s2 = Symbol.for("app.id");
console.log(s1 === s2);  // true! Gleicher Key = gleiches Symbol
// Symbol.for() sucht in einer globalen Registry
```

### unique symbol in TypeScript

```typescript
// "unique symbol" ist ein Subtyp von symbol — wie ein Literal Type
const mySymbol: unique symbol = Symbol("mein");

// Nur als const deklarierbar:
// let notUnique: unique symbol = Symbol("x");  // Error!

// Nuetzlich fuer typsichere Property-Zugriffe:
interface HasId {
  [mySymbol]: number;
}
```

> 📖 **Background: Why were Symbols introduced?**
>
> Before ES2015, JavaScript objects only had string keys. This led
> to **name collisions**: if two libraries set the same property
> (e.g. `id` or `type`) on an object, they would overwrite each other.
>
> Symbols solve the problem: each symbol is unique, so different
> libraries can use different symbol keys without colliding. In practice,
> **framework internals** make the most use of symbols (e.g. Angular's DI
> system internally, React's `$$typeof` for element validation).

---

## bigint — when number isn't enough

`bigint` can represent **arbitrarily large** integers. It was
introduced in ES2020.

```typescript
const gross: bigint = 9007199254740991n;     // n-Suffix
const nochGroesser: bigint = BigInt("123456789012345678901234567890");

// Arithmetik funktioniert wie erwartet:
const summe = 1n + 2n;  // 3n

// ABER: number und bigint koennen NICHT gemischt werden!
// const mix = 1n + 2;     // Error! Cannot mix bigint and other types
const ok = 1n + BigInt(2);  // OK: 3n
```

> 📖 **Background: Why did ES2020 need bigint?**
>
> JavaScript always had a problem with large numbers:
> `Number.MAX_SAFE_INTEGER` (2^53 - 1 = 9007199254740991) was the
> limit. Beyond that, `number` loses precision:
>
> ```typescript
> 9007199254740991 + 1;   // 9007199254740992 — korrekt
> 9007199254740991 + 2;   // 9007199254740992 — FALSCH!
> ```
>
> This became a real problem when Twitter (now X) introduced
> **Snowflake IDs** — numeric IDs larger than 2^53.
> Many JavaScript apps displayed incorrect tweet IDs because
> `JSON.parse()` automatically converts large numbers to `number` and
> loses precision in the process.
>
> Another driver was cryptography: modern crypto algorithms
> work with numbers hundreds of digits long — impossible with
> `number`.

### When to use bigint?

| Scenario | Recommendation | Why |
|---|---|---|
| IDs from databases (PostgreSQL bigint) | `string` or `bigint` | IDs > 2^53 lose precision as number |
| Cryptographic calculations | `bigint` | Large primes, modular arithmetic |
| Unix timestamps with nanoseconds | `bigint` | Exceeds MAX_SAFE_INTEGER |
| Small numbers (age, index) | `number` | bigint would be overkill |

### Limitations of bigint

```typescript
// Kein Math-Objekt:
// Math.round(1n);         // Error!
// Math.floor(1n);         // Error!

// Kein JSON:
// JSON.stringify(1n);     // TypeError: Do not know how to serialize a BigInt
// Loesung:
JSON.stringify(1n, (_, v) => typeof v === "bigint" ? v.toString() : v);

// Langsamer als number:
// bigint-Arithmetik ist ~10-100x langsamer als number
// Verwende bigint nur wenn noetig!
```

> ⚡ **Practical tip: Large IDs in Angular/React**
>
> ```typescript
> // API liefert grosse numerische IDs als Strings (best practice):
> interface ApiUser {
>   id: string;     // "1580661436132757507" — als string sicher!
>   name: string;
> }
>
> // FALSCH: Als number parsen
> const userId: number = parseInt(apiResponse.id);
> // 1580661436132757507 wird zu 1580661436132757500 — Praezisionsverlust!
>
> // RICHTIG: Als string lassen ODER als bigint:
> const userIdBig: bigint = BigInt(apiResponse.id);  // Exakt
>
> // In der Praxis: Die meisten APIs liefern grosse IDs als string,
> // und du solltest sie als string weiterverarbeiten.
> ```

---

## Interim Summary: The Specialists

| Type | Meaning | Core use |
|---|---|---|
| `never` | "Can never occur" | Exhaustive checks, functions that never return |
| `void` | "No meaningful return value" | Callbacks, event handlers, side-effect functions |
| `symbol` | "Guaranteed unique" | Property keys, Well-Known Symbols, framework internals |
| `bigint` | "Arbitrarily large integers" | Large IDs, cryptography, precision arithmetic |

---

## What you learned

- `never` is the Bottom Type and essential for **Exhaustive Checks**
- `void` is not `undefined` — `void` allows callbacks to return a value
- `symbol` creates guaranteed unique values and solves name collisions
- `bigint` is for numbers over 2^53 — but slower and not JSON-compatible

**Core Concept to remember:** `never` as an Exhaustive Check in `switch` statements is one of the most valuable patterns in TypeScript. It guarantees compile-time safety when union types are extended.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> // Exhaustive Check mit never
> type Farbe = "rot" | "gruen" | "blau";
>
> function farbeZuHex(f: Farbe): string {
>   switch (f) {
>     case "rot":   return "#ff0000";
>     case "gruen": return "#00ff00";
>     case "blau":  return "#0000ff";
>     default:
>       const _check: never = f; // Compile-Error wenn ein Fall fehlt!
>       return _check;
>   }
> }
>
> // Praezisionsverlust: number vs bigint
> const max = Number.MAX_SAFE_INTEGER; // 9007199254740991
> console.log(max + 1);  // 9007199254740992 — OK
> console.log(max + 2);  // 9007199254740992 — FALSCH! Gleich wie +1
>
> const maxBig = BigInt(Number.MAX_SAFE_INTEGER);
> console.log(maxBig + 1n); // 9007199254740992n — korrekt!
> console.log(maxBig + 2n); // 9007199254740993n — korrekt!
> ```
> Add `"yellow"` to the `Farbe` union without updating the `switch`.
> What error appears in the `default` branch — and why is that more valuable
> than a runtime error? Then compare the `number` and `bigint` results:
> at what point do they start to diverge?

---

> **Pause point** -- You now know all primitive types in TypeScript.
> The final section ties everything together with one of the most subtle concepts:
> Type Widening.
>
> Continue with: [Section 06: Type Widening](./06-type-widening.md)