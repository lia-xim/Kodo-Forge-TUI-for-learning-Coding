# Sektion 2: String Utility Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Grundlagen](./01-grundlagen.md)
> Naechste Sektion: [03 - Pattern Matching](./03-pattern-matching.md)

---

## Was du hier lernst

- Uppercase\<T\>, Lowercase\<T\>
- Capitalize\<T\>, Uncapitalize\<T\>
- Kombination mit Template Literals
- Praxis: CamelCase, PascalCase Konvertierung

---

## Die vier eingebauten String-Utilities

```typescript
type A = Uppercase<"hello">;      // "HELLO"
type B = Lowercase<"HELLO">;      // "hello"
type C = Capitalize<"hello">;     // "Hello"
type D = Uncapitalize<"Hello">;   // "hello"
```

> Diese sind **intrinsisch** — sie sind direkt in den Compiler eingebaut
> und koennen nicht mit normalen Conditional Types nachgebaut werden.

---

## Kombination mit Template Literals

```typescript
// camelCase Property -> PascalCase Event-Name
type EventName<T extends string> = `on${Capitalize<T>}`;

type A = EventName<"click">;     // "onClick"
type B = EventName<"mouseMove">; // "onMouseMove"

// SCREAMING_SNAKE_CASE
type ScreamingSnake<T extends string> = Uppercase<T>;
type C = ScreamingSnake<"hello_world">; // "HELLO_WORLD"
```

---

## Getter/Setter mit Capitalize

```typescript
type Getter<T extends string> = `get${Capitalize<T>}`;
type Setter<T extends string> = `set${Capitalize<T>}`;

type G = Getter<"name">;  // "getName"
type S = Setter<"name">;  // "setName"
```

Dies ist DAS Pattern das du in L16 bei Mapped Types + Key Remapping gesehen hast.

---

## Mit Unions

```typescript
type Properties = "name" | "email" | "age";

type GetterNames = `get${Capitalize<Properties>}`;
// "getName" | "getEmail" | "getAge"

type SetterNames = `set${Capitalize<Properties>}`;
// "setName" | "setEmail" | "setAge"

type AllAccessors = GetterNames | SetterNames;
// "getName" | "getEmail" | "getAge" | "setName" | "setEmail" | "setAge"
```

---

## Pausenpunkt

**Kernerkenntnisse:**
- Uppercase, Lowercase, Capitalize, Uncapitalize — die 4 String-Utilities
- Intrinsisch eingebaut, nicht mit Conditional Types nachbaubar
- Kraftvoll in Kombination mit Template Literals und Unions

> **Weiter:** [Sektion 03 - Pattern Matching](./03-pattern-matching.md)
