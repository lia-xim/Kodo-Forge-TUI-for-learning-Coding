# Cheatsheet: Generics Basics

## Generische Funktionen

```typescript
// Grundsyntax
function identity<T>(arg: T): T { return arg; }

// Inference (bevorzugt):
const s = identity("hallo"); // T = string

// Explizit (wenn noetig):
const arr = createArray<string>(); // T = string
```

---

## Mehrere Typparameter

```typescript
function pair<T, U>(a: T, b: U): [T, U] { return [a, b]; }
function map<T, U>(arr: T[], fn: (item: T) => U): U[] { ... }

const p = pair("Max", 30); // [string, number]
```

---

## Arrow Functions mit Generics

```typescript
const identity = <T>(arg: T): T => arg;

// In .tsx-Dateien (React): Trailing Comma oder extends
const identity = <T,>(arg: T): T => arg;
const identity = <T extends unknown>(arg: T): T => arg;
```

---

## Generische Interfaces

```typescript
interface Box<T> {
  content: T;
  label: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Verwendung:
const box: Box<string> = { content: "Hi", label: "text" };
```

---

## Generische Type Aliases

```typescript
type Nullable<T> = T | null;
type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };
```

---

## Array<T> = T[]

```typescript
// Identisch:
const a: number[] = [1, 2, 3];
const b: Array<number> = [1, 2, 3];
```

---

## Constraints (extends)

```typescript
// Mindestanforderung:
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

// Mit Interface:
function printId<T extends HasId>(entity: T): void {
  console.log(entity.id); // Garantiert durch Constraint
}

// Mehrere Constraints:
function save<T extends HasId & Serializable>(entity: T): void { ... }
```

---

## keyof Constraint

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const name = getProperty(user, "name"); // Praeziser Typ!
// getProperty(user, "invalid");         // Error!
```

---

## Default-Typparameter

```typescript
interface Container<T = string> { value: T; }

const a: Container = { value: "Hi" };          // T = string (Default)
const b: Container<number> = { value: 42 };    // T = number

// Default + Constraint:
interface Repo<T extends { id: number } = { id: number; name: string }> { ... }

// Reihenfolge: Defaults am Ende!
interface Cache<K, V = string> { ... } // OK
// interface Cache<K = string, V> { ... } // Error!
```

---

## Namenskonventionen

| Name | Bedeutung | Beispiel |
|------|-----------|----------|
| `T` | Type | `Array<T>`, `Box<T>` |
| `U` | Zweiter Typ | `map<T, U>` |
| `K` | Key | `Record<K, V>`, `keyof T` |
| `V` | Value | `Map<K, V>` |
| `E` | Element/Error | `Result<T, E>` |
| `R` | Return | Rueckgabetyp |

---

## Haeufige Patterns

```typescript
// API-Response
interface ApiResponse<T> { data: T; status: number; }

// Result-Type
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

// Event-Emitter
interface Emitter<TEvents extends Record<string, unknown>> {
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
}

// Repository
interface Repository<T extends { id: number }> {
  findById(id: number): T | null;
  save(entity: T): void;
}
```

---

## Faustregeln

| Regel | Erklaerung |
|-------|------------|
| T mindestens 2x verwenden | Sonst ist T ueberfluessig (unknown reicht) |
| Inference bevorzugen | Nur explizit wenn noetig (kein Argument fuer T) |
| Constraints minimal halten | Nur einschraenken was die Funktion BRAUCHT |
| Defaults fuer Bibliotheken | Einfache Nutzung + Flexibilitaet bei Bedarf |

---

## Standardbibliothek: Alles generisch

```typescript
Array<T>       // number[], string[]
Promise<T>     // Promise<string>, Promise<User>
Map<K, V>      // Map<string, number>
Set<T>         // Set<number>
Record<K, V>   // Record<string, unknown>
Partial<T>     // Partial<User>
Required<T>    // Required<Config>
Pick<T, K>     // Pick<User, "name" | "email">
Omit<T, K>     // Omit<User, "password">
```
