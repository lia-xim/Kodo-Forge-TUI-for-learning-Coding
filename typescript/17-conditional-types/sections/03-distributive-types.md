# Sektion 3: Distributive Conditional Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Infer-Keyword](./02-infer-keyword.md)
> Naechste Sektion: [04 - Rekursive Conditional](./04-rekursive-conditional.md)

---

## Was du hier lernst

- Wie Conditional Types ueber Unions verteilen
- Warum `string | number` anders behandelt wird als erwartet
- Distribution kontrollieren mit `[T]`
- Die never-Sonderregel

---

## Distribution: Die Ueberraschung

Wenn T ein **nackter Typparameter** ist und ein Union-Typ, wird der
Conditional Type **fuer jedes Member einzeln** ausgewertet:

```typescript
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string>;           // string[]
type B = ToArray<string | number>;  // string[] | number[]
//                                     NICHT (string | number)[]!
```

> **Merkregel:** Der Conditional wird "verteilt" (distributed) ueber jeden
> Union-Member einzeln. Das Ergebnis wird wieder zu einem Union zusammengefuegt.

---

## Distribution Schritt fuer Schritt

```typescript
type IsString<T> = T extends string ? "ja" : "nein";

type Result = IsString<string | number>;
// Schritt 1: IsString<string>  → "ja"
// Schritt 2: IsString<number>  → "nein"
// Ergebnis:  "ja" | "nein"
```

Das passiert AUTOMATISCH wenn:
1. T ist ein **nackter Typparameter** (nicht eingepackt)
2. T ist ein **Union-Typ**

---

## Distribution verhindern mit [T]

Manchmal willst du den Union als GANZES pruefen. Packe T in ein Tuple:

```typescript
// Distributiv (Default):
type ToArray<T> = T extends any ? T[] : never;
type A = ToArray<string | number>;  // string[] | number[]

// Nicht-distributiv:
type ToArrayND<T> = [T] extends [any] ? T[] : never;
type B = ToArrayND<string | number>;  // (string | number)[]
```

> **[T] extends [U]** — die Tuple-Wrapping-Technik verhindert Distribution.
> T wird als Ganzes geprueft, nicht Member fuer Member.

---

## Die never-Sonderregel

`never` ist der "leere Union" — er hat KEINE Member. Distribution ueber
never ergibt immer never:

```typescript
type IsString<T> = T extends string ? "ja" : "nein";

type A = IsString<never>;  // never (NICHT "nein"!)
// Distribution: fuer jedes Member von never -> kein Member -> never
```

Wenn du `never` speziell behandeln willst:

```typescript
type IsNever<T> = [T] extends [never] ? true : false;

type A = IsNever<never>;     // true
type B = IsNever<string>;    // false
```

---

## Praxis: Extract und Exclude

TypeScripts eingebaute Utility Types nutzen Distribution:

```typescript
// Extract: Behalte nur Member die U zuweisbar sind
type Extract<T, U> = T extends U ? T : never;

type A = Extract<string | number | boolean, string | number>;
// string | number

// Exclude: Entferne Member die U zuweisbar sind
type Exclude<T, U> = T extends U ? never : T;

type B = Exclude<string | number | boolean, string>;
// number | boolean
```

> **Extract = behalten, Exclude = entfernen.** Beide nutzen distributive
> Conditional Types um ueber Union-Member zu filtern.

---

## Pausenpunkt

**Kernerkenntnisse:**
- Nackter Typparameter + Union = Distribution (automatisch)
- `[T] extends [U]` verhindert Distribution
- `never` bei Distribution = immer never (leerer Union)
- Extract/Exclude sind distributive Conditionals

> **Weiter:** [Sektion 04 - Rekursive Conditional](./04-rekursive-conditional.md)
