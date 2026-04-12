# 06 -- Index Signatures

> Estimated reading time: ~10 minutes

## What you'll learn here

- What **Index Signatures** are and when you need them
- How to combine fixed and dynamic properties
- `Record<K, V>` as an elegant alternative
- The `noUncheckedIndexedAccess` compiler option (why you should enable it)
- Practical patterns for dictionaries and lookup maps

---

## The Problem: Unknown Property Names

Sometimes you don't know the property names in advance. A dictionary, a
configuration file, a cache — the keys are dynamic:

```typescript
// Wie typisierst du das?
const translations = {
  hello: "hallo",
  goodbye: "tschuess",
  thanks: "danke",
  // ... beliebig viele weitere
};
```

That's what **Index Signatures** are for:

```typescript annotated
interface StringDictionary {
  [key: string]: string;
// ^^^^^^^^^^^^^ This is the Index Signature: square brackets with a type annotation
// 'key' is just a label (you can rename it) — the type 'string' is what matters
// The value type after the colon: every access returns 'string'
}
// Meaning: this object can have any number of properties —
//          all keys are strings, all values are strings

const translations: StringDictionary = {
  hello: "hallo",    // string-key -> string-value ✓
  goodbye: "tschuess",  // string-key -> string-value ✓
  thanks: "danke",   // string-key -> string-value ✓
  // Any number of additional entries allowed
};
```

> 🧠 **Explain to yourself:** When do you need an Index Signature instead of a
> regular interface? Why is `Record<string, string>` often better than an
> Index Signature? And what's the risk when TypeScript by default returns a value
> that could be `undefined` at runtime?
>
> **Key points:** Index Signatures for unknown/dynamic keys | Record<K,V>
> is cleaner and more readable for pure dictionaries | By default TypeScript says
> the type is T — but at runtime, undefined might come back | Solution:
> enable noUncheckedIndexedAccess in tsconfig

> **Analogy:** An Index Signature is like a **library catalog**. You don't know
> in advance which books (keys) exist, but you know that every entry is a book
> (of a certain type). The signature describes the SHAPE of the catalog, not its
> contents.

---

## Key Types: What Can an Index Be?

Index Signatures only allow certain key types:

```typescript
// Erlaubt:
interface WithStringKeys { [key: string]: any; }
interface WithNumberKeys { [key: number]: any; }
interface WithSymbolKeys { [key: symbol]: any; }

// NICHT erlaubt:
// interface Bad { [key: boolean]: any; }  // FEHLER!
```

> **Deeper knowledge:** Why only `string`, `number`, and `symbol`? Because those
> are the only types JavaScript allows as property keys. All other values are
> automatically converted to strings at runtime (`toString()`).
>
> That's why `[key: number]` is effectively a special case of `[key: string]` —
> `obj[0]` and `obj["0"]` access the same property. TypeScript maintains this
> distinction because it's useful for arrays.

---

## Mixing Fixed and Dynamic Properties

You can combine known properties with Index Signatures — but there's a constraint:

```typescript
// FEHLER: 'version' (number) passt nicht zur Index Signature (string)
interface Config {
  name: string;
  version: number;          // number != string!
  [key: string]: string;    // Alle Werte muessen string sein
}

// LOESUNG: Union-Typ fuer die Index Signature
interface ConfigFixed {
  name: string;
  version: number;
  [key: string]: string | number;  // Beide Typen erlaubt
}
```

**The Rule:** All **fixed** property types must be **compatible** with the index
signature type. The index type must be a supertype of all fixed types.

```
  Feste Properties muessen zum Index passen
  ──────────────────────────────────────────

  interface X {
    name: string;              // string   -- passt zu string | number
    version: number;           // number   -- passt zu string | number
    [key: string]: string | number;  // <-- Muss ALLE festen Typen abdecken
  }
```

---

## Record<K, V> — The Elegant Alternative

The `Record` utility type is often cleaner than Index Signatures:

```typescript
// Statt:
interface NumberMap {
  [key: string]: number;
}

// Besser:
type NumberMap = Record<string, number>;
```

### Record with Specific Keys

The real advantage of `Record` shows with **restricted keys**:

```typescript
type Status = "pending" | "active" | "closed";

// Record erzwingt, dass JEDER Status einen Wert hat:
type StatusCounts = Record<Status, number>;

// Equivalent zu:
// { pending: number; active: number; closed: number }

const counts: StatusCounts = {
  pending: 5,
  active: 12,
  closed: 88,
  // Fehlt einer? FEHLER!
};
```

> **Pro tip:** `Record<Status, T>` ensures you don't miss any status.
> This is especially useful in Angular services and React reducers:
> ```typescript
> type Theme = "light" | "dark" | "system";
> const themeLabels: Record<Theme, string> = {
>   light: "Helles Design",
>   dark: "Dunkles Design",
>   system: "Systemeinstellung",
>   // Fuergen wir spaeter "high-contrast" hinzu,
>   // ERZWINGT der Compiler, es hier zu ergaenzen!
> };
> ```

---

## The `noUncheckedIndexedAccess` Trap

By default, TypeScript lies about Index Signatures:

```typescript
interface Dict {
  [key: string]: string;
}

const dict: Dict = { hello: "hallo" };

// TypeScript sagt: typ ist "string"
const value = dict["nichtVorhanden"];
// Aber zur Laufzeit: undefined!
```

TypeScript assumes every key exists — this is **unsound** (not type-safe).

### The Solution: `noUncheckedIndexedAccess`

In your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

With this option:

```typescript
const value = dict["nichtVorhanden"];
//    ^? string | undefined  <-- jetzt korrekt!

// Du MUSST jetzt pruefen:
if (value !== undefined) {
  console.log(value.toUpperCase());  // OK -- narrowed
}

// Oder mit Nullish Coalescing:
const safe = dict["nichtVorhanden"] ?? "Fallback";
```

> **Pro tip:** Enable `noUncheckedIndexedAccess` in every new project.
> It's not included in `strict` (for backwards compatibility), but it prevents
> an entire class of `undefined` bugs at runtime.
>
> Angular projects since Angular 16+ have it enabled by default.

---

## Practical Patterns

### Pattern 1: Lookup Map (Angular/React)

```typescript
// Fehlermeldungen als Lookup-Map
type ErrorCode = "NOT_FOUND" | "FORBIDDEN" | "TIMEOUT" | "UNKNOWN";

const errorMessages: Record<ErrorCode, string> = {
  NOT_FOUND: "Die Ressource wurde nicht gefunden.",
  FORBIDDEN: "Zugriff verweigert.",
  TIMEOUT: "Die Anfrage hat zu lange gedauert.",
  UNKNOWN: "Ein unbekannter Fehler ist aufgetreten.",
};

function getErrorMessage(code: ErrorCode): string {
  return errorMessages[code];  // Typ-sicher! Jeder Code ist abgedeckt.
}
```

> **Think about it:** You have `Record<"a" | "b", number>` and `Record<string, number>`.
> Which is stricter? Why?
>
> **Answer:** `Record<"a" | "b", number>` is stricter — it enforces that ONLY
> `"a"` and `"b"` exist as keys and BOTH must be present.
> `Record<string, number>` allows arbitrary keys and enforces none of them.
> In practice: use the union-key variant wherever possible, because the compiler
> can then check for completeness.

> **Experiment:** Create in the playground:
> ```typescript
> type Status = "active" | "inactive" | "banned";
> const labels: Record<Status, string> = {
>   active: "Aktiv",
>   inactive: "Inaktiv",
>   // banned fehlt -- was passiert?
> };
> ```
> Observe the error message. Now add `"suspended"` to the `Status` union and watch
> how the compiler immediately flags that the new status is missing from the `labels`
> object. **That's the exhaustiveness pattern in action.**

### Pattern 2: Dynamic Cache

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

type Cache<T> = Record<string, CacheEntry<T> | undefined>;

function getFromCache<T>(cache: Cache<T>, key: string): T | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) return null;
  return entry.data;
}
```

---

## Summary

| Concept | Description |
|---------|-------------|
| Index Signature | `[key: string]: Type` — dynamic keys |
| Allowed key types | `string`, `number`, `symbol` |
| Fixed + Index | Fixed types must match the index type |
| `Record<K, V>` | Elegant alternative to Index Signatures |
| `Record<Union, V>` | Enforces completeness with union keys |
| `noUncheckedIndexedAccess` | Returns `T \| undefined` instead of `T` |

---

**What you've learned:** You can type dynamic object structures and understand why
`noUncheckedIndexedAccess` matters.

| [<-- Previous Section](05-readonly-und-optional.md) | [Back to Overview](../README.md) | [Next Section: Intersection & Utility Types -->](07-intersection-und-utility-types.md) |