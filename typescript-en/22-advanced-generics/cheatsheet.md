# Cheatsheet: Advanced Generics in TypeScript

Quick reference for Lesson 22.

---

## Variance Table

| Variance | Direction | Modifier | Example | Rule |
|---|---|---|---|---|
| **Covariant** | Subtype preserved | `out T` | `Producer<Cat> extends Producer<Animal>` | T only in output position |
| **Contravariant** | Subtype reversed | `in T` | `Consumer<Animal> extends Consumer<Cat>` | T only in input position |
| **Invariant** | No direction | `in out T` | `MutableBox<Cat> !== MutableBox<Animal>` | T in both positions |
| **Bivariant** | Both directions | — | Method params (without strict) | Legacy, unsafe |

---

## Variance Positions

| Position | Variance | Example |
|---|---|---|
| Return type | Output (covariant) | `get(): T` |
| Parameter | Input (contravariant) | `set(value: T): void` |
| Property (readonly) | Output (covariant) | `readonly value: T` |
| Property (mutable) | Input + Output (invariant) | `value: T` |
| Callback parameter | Input (contravariant) | `fn: (item: T) => void` |
| Callback return | Output (covariant) | `fn: () => T` |

---

## in/out Modifier Syntax (TS 4.7+)

```typescript
// Covariant — only produce T
interface Producer<out T> {
  get(): T;           // OK: output position
  // set(v: T): void; // Error: input position!
}

// Contravariant — only consume T
interface Consumer<in T> {
  accept(item: T): void;  // OK: input position
  // get(): T;             // Error: output position!
}

// Invariant — both
interface MutableBox<in out T> {
  get(): T;
  set(value: T): void;
}
```

---

## Higher-Kinded Types Emulation

```typescript
// Interface map as lookup table
interface URItoKind<A> {
  Array: Array<A>;
  Promise: Promise<A>;
  Set: Set<A>;
}

type URIS = keyof URItoKind<any>;
type Kind<URI extends URIS, A> = URItoKind<A>[URI];

// Usage:
type X = Kind<"Array", string>;   // string[]
type Y = Kind<"Promise", number>; // Promise<number>
```

---

## Constraint Patterns

```typescript
// Intersection constraint (AND)
function f<T extends HasId & Serializable>(item: T): void { }

// Recursive / F-bounded constraint
interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number;
}

// Conditional constraint (indirect)
type ValidatorFor<T> = T extends string ? StringValidator
                     : T extends number ? NumberValidator
                     : never;
```

---

## Distributive Conditional Types

```typescript
// Distributive (default):
type IsString<T> = T extends string ? true : false;
IsString<string | number>  // true | false (distributed!)

// Non-distributive (tuple wrapping):
type IsStringStrict<T> = [T] extends [string] ? true : false;
IsStringStrict<string | number>  // false (not distributed)

// never becomes never (empty union):
IsString<never>  // never
```

---

## API Design Rules

| Rule | Description |
|---|---|
| **Rule of Two** | Use type parameters at least twice (input ↔ output) |
| **Overloads vs Generic** | Discrete mappings → overloads, parametric → generic |
| **Default > any** | `<T = unknown>` instead of `<T = any>` |
| **Guide inference** | Place inference candidates where TypeScript can see them |
| **Less is more** | Fewer type parameters = more readable |

---

## Common Anti-Patterns

```typescript
// Anti-pattern: T used only once (no added value)
function bad<T>(x: T): void { }
function good(x: unknown): void { }

// Anti-pattern: Too many type parameters
function bad<A, B, C, D>(a: A, b: B, c: C): D { }
// Better: overloads or fewer parameters

// Anti-pattern: Generic with immediate cast
function bad<T>(x: unknown): T { return x as T; }
// No type safety — just an illusion
```

---

## Key Terms

| Term | Meaning |
|---|---|
| **Type Constructor** | A generic type that takes an argument (`Array<T>`, `Promise<T>`) |
| **Higher-Kinded Type** | A type over type constructors — not natively supported in TS |
| **F-bounded Polymorphism** | `T extends F<T>` — a type references itself in its constraint |
| **Naked Type Parameter** | A type parameter without wrapping in conditional types |
| **Variance Position** | Where T appears in an interface (input/output) |

---

> **Lesson 22 complete!**
> Next lesson: [23 - Recursive Types](../23-recursive-types/README.md)