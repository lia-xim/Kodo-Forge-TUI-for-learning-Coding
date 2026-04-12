# Cheatsheet: Union & Intersection Types

## Union Types (|) -- "Either ... or"

```typescript
type StringOrNumber = string | number;
type Direction = "north" | "south" | "east" | "west"; // Literal Union
type Nullable<T> = T | null | undefined;
```

**Rule:** Only shared operations are allowed without narrowing.

---

## Narrowing Techniques

| Technique | Syntax | Suitable for |
|-----------|--------|--------------|
| typeof | `typeof x === "string"` | Primitives |
| instanceof | `x instanceof Date` | Classes |
| in | `"email" in user` | Object properties |
| Truthiness | `if (x)` | null/undefined/falsy |
| Equality | `x === null` | Exact values |
| Type Guard | `value is Type` | Custom checks |

**TS 5.5:** `arr.filter(x => x !== null)` automatically infers a type guard!

---

## Discriminated Unions

```typescript
type Shape =
  | { type: "circle"; radius: number }
  | { type: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.type) {  // Tag property as discriminator
    case "circle": return Math.PI * shape.radius ** 2;
    case "rect": return shape.width * shape.height;
    default:
      const _: never = shape;  // Exhaustive Check!
      return _;
  }
}
```

---

## Intersection Types (&) -- "Everything at once"

```typescript
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged; // Must have name AND age

// Note: Incompatible primitives = never!
type Impossible = string & number; // never
```

---

## Union vs Intersection -- Comparison

|  | Union (\|) | Intersection (&) |
|--|-----------|------------------|
| Value set | LARGER | SMALLER |
| Properties | FEWER accessible | MORE accessible |
| Meaning | "is one of" | "is all at once" |
| On conflicts | No problem | Property becomes never |

---

## Result Pattern

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handle(result: Result<User>) {
  if (result.success) {
    console.log(result.data); // TypeScript knows: data
  } else {
    console.log(result.error); // TypeScript knows: error
  }
}
```

---

## Distributive Law

```
(A | B) & C = (A & C) | (B & C)
```

---

## Common Mistakes

- `typeof null === "object"` -- Don't use for null checks!
- Discriminator with `string` instead of a literal -- No narrowing possible
- Intersection conflicts produce a silent `never` -- No compile error
- Narrowing is lost after function calls on `let` variables