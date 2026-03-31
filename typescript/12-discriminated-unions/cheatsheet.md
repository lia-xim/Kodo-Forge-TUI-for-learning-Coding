# Cheatsheet: Discriminated Unions

## Grundstruktur

```typescript
// 1. Tag-Property mit Literal Types
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };

// 2. Union Type
type Shape = Circle | Rectangle;

// 3. Narrowing
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
  }
}
```

---

## Exhaustive Check mit assertNever

```typescript
function assertNever(value: never): never {
  throw new Error(`Unbehandelt: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    default: return assertNever(shape);
    // Compile-Error wenn ein Fall fehlt!
  }
}
```

---

## Gueltige Diskriminator-Typen

```typescript
// String Literal (am haeufigsten):
type A = { type: "success"; data: string };

// Number Literal:
type B = { code: 200; body: string };

// Boolean Literal:
type C = { ok: true; value: number };

// NICHT gueltig:
// type D = { type: string };     // Zu breit!
// type E = { type: number };     // Zu breit!
```

---

## Option\<T\> und Result\<T, E\>

```typescript
// Option: Wert oder nichts
type Option<T> =
  | { tag: "some"; value: T }
  | { tag: "none" };

// Result: Erfolg oder typisierter Fehler
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

## AsyncState\<T\> (Loading/Error/Success)

```typescript
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// Render mit switch:
function render<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case "idle": return "Bereit";
    case "loading": return "Lade...";
    case "error": return `Fehler: ${state.error}`;
    case "success": return `OK: ${JSON.stringify(state.data)}`;
  }
}
```

---

## Action Types (Redux/NgRx)

```typescript
type Action =
  | { type: "INCREMENT" }
  | { type: "ADD"; payload: { amount: number } }
  | { type: "SET"; payload: { value: number } }
  | { type: "RESET" };

function reducer(count: number, action: Action): number {
  switch (action.type) {
    case "INCREMENT": return count + 1;
    case "ADD": return count + action.payload.amount;
    case "SET": return action.payload.value;
    case "RESET": return 0;
  }
}
```

---

## Extract und Exclude

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "tri"; base: number; height: number };

// Extrahiere eine Variante:
type OnlyCircle = Extract<Shape, { kind: "circle" }>;
// { kind: "circle"; radius: number }

// Schliesse eine Variante aus:
type NoCircle = Exclude<Shape, { kind: "circle" }>;
// rect | tri

// Alle Tag-Werte extrahieren:
type ShapeKind = Shape["kind"];
// "circle" | "rect" | "tri"
```

---

## Narrowing-Methoden

| Methode | Wann verwenden |
|---------|---------------|
| **switch/case** | Mehrere Varianten, Exhaustive Check moeglich |
| **if/else** | Wenige Varianten, Boolean-Diskriminatoren |
| **Early Return** | Sequenzielle Pruefungen, flacher Code |
| **Ternary** | Inline-Entscheidungen, JSX |

---

## Haeufige Fehler

```typescript
// FALSCH: Destrukturierung bricht Narrowing
const { kind } = shape;
if (kind === "circle") { shape.radius } // Error!

// RICHTIG: Direkt pruefen
if (shape.kind === "circle") { shape.radius } // OK!

// FALSCH: Breiter Typ als Diskriminator
type A = { type: string };  // Kein Narrowing!

// RICHTIG: Literal Type als Diskriminator
type A = { type: "a" };     // Narrowing funktioniert!
```

---

## Empfehlung

| Situation | Empfehlung |
|-----------|------------|
| Verschiedene Objekt-Varianten | **Discriminated Union** |
| Wert oder kein Wert | **Option\<T\>** |
| Erfolg oder typisierter Fehler | **Result\<T, E\>** |
| Async-Zustaende | **AsyncState\<T\>** |
| Redux/NgRx Actions | **Action Discriminated Union** |
| Variante herausziehen | **Extract\<T, U\>** |
| Variante ausschliessen | **Exclude\<T, U\>** |
| Alle Faelle abdecken | **assertNever im default** |
