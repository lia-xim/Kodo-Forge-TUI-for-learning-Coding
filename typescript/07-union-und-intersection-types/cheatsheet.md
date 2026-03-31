# Cheatsheet: Union & Intersection Types

## Union Types (|) -- "Entweder ... oder"

```typescript
type StringOrNumber = string | number;
type Direction = "north" | "south" | "east" | "west"; // Literal Union
type Nullable<T> = T | null | undefined;
```

**Regel:** Nur gemeinsame Operationen sind ohne Narrowing erlaubt.

---

## Narrowing-Techniken

| Technik | Syntax | Geeignet fuer |
|---------|--------|---------------|
| typeof | `typeof x === "string"` | Primitive |
| instanceof | `x instanceof Date` | Klassen |
| in | `"email" in user` | Object-Properties |
| Truthiness | `if (x)` | null/undefined/falsy |
| Equality | `x === null` | Exakte Werte |
| Type Guard | `value is Type` | Custom-Checks |

**TS 5.5:** `arr.filter(x => x !== null)` inferiert Type Guard automatisch!

---

## Discriminated Unions

```typescript
type Shape =
  | { type: "circle"; radius: number }
  | { type: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.type) {  // Tag-Property als Diskriminator
    case "circle": return Math.PI * shape.radius ** 2;
    case "rect": return shape.width * shape.height;
    default:
      const _: never = shape;  // Exhaustive Check!
      return _;
  }
}
```

---

## Intersection Types (&) -- "Alles gleichzeitig"

```typescript
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged; // Muss name UND age haben

// Achtung: Inkompatible Primitive = never!
type Impossible = string & number; // never
```

---

## Union vs Intersection -- Vergleich

|  | Union (\|) | Intersection (&) |
|--|-----------|------------------|
| Wertemenge | GROESSER | KLEINER |
| Properties | WENIGER zugreifbar | MEHR zugreifbar |
| Bedeutung | "ist eines von" | "ist alles zugleich" |
| Bei Konflikten | Kein Problem | Property wird never |

---

## Result-Pattern

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handle(result: Result<User>) {
  if (result.success) {
    console.log(result.data); // TypeScript kennt: data
  } else {
    console.log(result.error); // TypeScript kennt: error
  }
}
```

---

## Distributives Gesetz

```
(A | B) & C = (A & C) | (B & C)
```

---

## Haeufige Fehler

- `typeof null === "object"` -- Nicht fuer null-Checks verwenden!
- Diskriminator mit `string` statt Literal -- Kein Narrowing moeglich
- Intersection-Konflikte erzeugen stilles `never` -- Kein Compile-Error
- Narrowing geht nach Funktionsaufrufen bei `let`-Variablen verloren
