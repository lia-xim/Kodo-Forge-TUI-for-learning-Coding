# Sektion 2: Das infer-Keyword

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Extends-Bedingung](./01-extends-bedingung.md)
> Naechste Sektion: [03 - Distributive Types](./03-distributive-types.md)

---

## Was du hier lernst

- Typ-Extraktion mit `infer`
- Return Types und Parameter Types extrahieren
- Promise-Unwrapping
- Mehrere infer in einem Pattern

---

## Was ist infer?

`infer` deklariert eine **Typ-Variable** innerhalb eines Conditional Types.
TypeScript "raet" (inferiert) den Typ aus dem Pattern:

```typescript
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnpackPromise<Promise<string>>;  // string
type B = UnpackPromise<Promise<number>>;  // number
type C = UnpackPromise<string>;           // string (kein Promise)
```

> **Denke an infer als Platzhalter:** "Wenn T ein Promise von IRGENDWAS ist,
> nenne dieses IRGENDWAS U und gib es zurueck."

---

## Return Type extrahieren

So funktioniert TypeScripts eingebauter `ReturnType<T>`:

```typescript
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = MyReturnType<() => string>;           // string
type B = MyReturnType<(x: number) => boolean>; // boolean
type C = MyReturnType<string>;                 // never (keine Funktion)
```

---

## Parameter Types extrahieren

```typescript
type FirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never;

type A = FirstParam<(name: string, age: number) => void>;  // string
type B = FirstParam<() => void>;                            // never (kein Parameter)

// Alle Parameter als Tuple:
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type C = MyParameters<(a: string, b: number) => void>;  // [a: string, b: number]
```

---

## Array-Element extrahieren

```typescript
type ElementType<T> = T extends (infer U)[] ? U : T;

type A = ElementType<string[]>;    // string
type B = ElementType<number[]>;    // number
type C = ElementType<string>;      // string (kein Array)

// Erstes Element eines Tuples:
type First<T> = T extends [infer F, ...any[]] ? F : never;

type D = First<[string, number, boolean]>;  // string
type E = First<[]>;                         // never
```

---

## Mehrere infer in einem Pattern

```typescript
type FunctionParts<T> = T extends (a: infer A, b: infer B) => infer R
  ? { firstParam: A; secondParam: B; returnType: R }
  : never;

type Parts = FunctionParts<(name: string, age: number) => boolean>;
// { firstParam: string; secondParam: number; returnType: boolean; }
```

---

## Praxis: Constructor-Parameter extrahieren

```typescript
type ConstructorParams<T> = T extends new (...args: infer P) => any ? P : never;

class UserService {
  constructor(private db: Database, private logger: Logger) {}
}

type Deps = ConstructorParams<typeof UserService>;
// [db: Database, logger: Logger]
```

---

## Pausenpunkt

**Kernerkenntnisse:**
- `infer U` deklariert eine Typ-Variable im Conditional
- Funktioniert in jeder Position: Return, Parameter, Array-Element, etc.
- Mehrere infer in einem Pattern moeglich
- TypeScripts ReturnType, Parameters, etc. sind alle mit infer gebaut

> **Weiter:** [Sektion 03 - Distributive Types](./03-distributive-types.md)
