# Sektion 5: Praxis-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Rekursive Conditional](./04-rekursive-conditional.md)

---

## Was du hier lernst

- UnpackPromise, Flatten, DeepPartial in der Praxis
- Typ-sichere Event-Handler mit Conditional Types
- API-Response-Typen ableiten
- Conditional Types mit Mapped Types kombinieren

---

## Pattern 1: Smart Return Types

```typescript
type ParseResult<T extends string> =
  T extends `${number}` ? number :
  T extends "true" | "false" ? boolean :
  string;

function parse<T extends string>(input: T): ParseResult<T> {
  if (input === "true") return true as ParseResult<T>;
  if (input === "false") return false as ParseResult<T>;
  const num = Number(input);
  if (!isNaN(num)) return num as ParseResult<T>;
  return input as ParseResult<T>;
}

const a = parse("42");     // number
const b = parse("true");   // boolean
const c = parse("hello");  // string
```

---

## Pattern 2: Typ-sichere Event Handler

```typescript
interface EventMap {
  click: { x: number; y: number };
  keydown: { key: string; code: string };
  resize: { width: number; height: number };
}

type EventHandler<K extends keyof EventMap> = (event: EventMap[K]) => void;

type HandlerFor<E extends string> = E extends keyof EventMap
  ? EventHandler<E>
  : (event: CustomEvent) => void;

// Typ wird basierend auf dem Event-Namen bestimmt:
type ClickHandler = HandlerFor<"click">;    // (event: { x: number; y: number }) => void
type CustomHandler = HandlerFor<"custom">;  // (event: CustomEvent) => void
```

---

## Pattern 3: Conditional + Mapped Types

```typescript
// Nur die function-Properties eines Objekts extrahieren
type Methods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

// Nur die Daten-Properties (keine Funktionen)
type Data<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

interface UserService {
  name: string;
  email: string;
  save(): Promise<void>;
  validate(): boolean;
}

type UserMethods = Methods<UserService>;  // { save: ...; validate: ...; }
type UserData = Data<UserService>;        // { name: string; email: string; }
```

---

## Pattern 4: API Response Unwrapping

```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type UnwrapResponse<T> = T extends ApiResponse<infer U> ? U : T;

type UserResponse = ApiResponse<{ name: string; email: string }>;
type UserData = UnwrapResponse<UserResponse>;
// { name: string; email: string; }
```

---

## Pattern 5: Conditional Default Types

```typescript
type WithDefault<T, D> = T extends undefined | null ? D : T;

type A = WithDefault<string, "fallback">;     // string
type B = WithDefault<undefined, "fallback">;  // "fallback"
type C = WithDefault<null, 0>;                // 0
```

---

## Zusammenfassung: Wann welches Conditional Pattern?

| Situation | Pattern |
|-----------|---------|
| Typ-abhaengiger Return Type | `T extends X ? A : B` |
| Typ extrahieren | `T extends X<infer U> ? U : T` |
| Union filtern | Distributive: `T extends X ? T : never` |
| Verschachtelte Strukturen aufloesen | Rekursion: `DeepX<T[K]>` |
| Mapped + Conditional | `[K in keyof T as T[K] extends X ? K : never]` |

---

## Pausenpunkt — Ende der Lektion

Du beherrschst jetzt Conditional Types — von einfachen extends-Pruefungen
bis zu rekursiven Typ-Transformationen.

> **Naechste Lektion:** [18 - Template Literal Types](../../18-template-literal-types/README.md)
