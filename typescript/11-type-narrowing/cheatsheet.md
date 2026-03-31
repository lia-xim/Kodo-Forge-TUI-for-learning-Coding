# Cheatsheet: Type Narrowing in TypeScript

Schnellreferenz fuer Lektion 11.

---

## Alle Narrowing-Mechanismen auf einen Blick

| Mechanismus | Syntax | Narrowt zu | Anwendungsfall |
|---|---|---|---|
| `typeof` | `typeof x === "string"` | Primitiver Typ | string, number, boolean, etc. |
| `instanceof` | `x instanceof Date` | Klassen-Instanz | Klassen (NICHT Interfaces!) |
| `in` | `"name" in obj` | Typ mit Property | Discriminated Unions, Interfaces |
| `===` / `!==` | `x === null` | Literal / null | Exakte Wert-Vergleiche |
| `==` / `!=` null | `x != null` | Nicht-null/undefined | null UND undefined eliminieren |
| Truthiness | `if (x)` | Truthy Werte | Schneller null-Check (Vorsicht!) |
| `is` | `x is string` | Custom Type Guard | Komplexe Validierung |
| `asserts` | `asserts x is T` | Assertion Function | Vorbedingungen |
| `never` | `const _: never = x` | Exhaustive Check | Alle Faelle abdecken |

---

## typeof — 8 moegliche Ergebnisse

```typescript
typeof "hallo"   === "string"     // Strings
typeof 42        === "number"     // Zahlen (inkl. NaN, Infinity)
typeof true      === "boolean"    // Wahrheitswerte
typeof undefined === "undefined"  // undefined
typeof {}        === "object"     // Objekte, Arrays, UND null (!)
typeof (() => {}) === "function"  // Funktionen
typeof Symbol()  === "symbol"     // Symbols
typeof 42n       === "bigint"     // BigInts
```

**Fallstrick:** `typeof null === "object"` — immer null separat pruefen!

---

## Narrowing-Muster

### typeof Guard

```typescript
function f(x: string | number) {
  if (typeof x === "string") {
    x.toUpperCase();  // x: string
  } else {
    x.toFixed(2);     // x: number
  }
}
```

### Early Return (null eliminieren)

```typescript
function f(x: string | null) {
  if (x === null) return;
  x.toUpperCase();  // x: string (fuer den Rest)
}
```

### in-Operator (Discriminated Union)

```typescript
interface A { kind: "a"; propA: string }
interface B { kind: "b"; propB: number }
type AB = A | B;

function f(x: AB) {
  if ("propA" in x) {
    x.propA;  // x: A
  } else {
    x.propB;  // x: B
  }
}
```

### Custom Type Guard

```typescript
function isString(x: unknown): x is string {
  return typeof x === "string";
}

if (isString(value)) {
  value.toUpperCase();  // value: string
}
```

### Assertion Function

```typescript
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("Kein String!");
}

assertString(value);
value.toUpperCase();  // value: string (ab hier)
```

### Exhaustive Switch

```typescript
function assertNever(x: never): never {
  throw new Error(`Unbehandelt: ${x}`);
}

type T = "a" | "b" | "c";
function f(x: T) {
  switch (x) {
    case "a": return 1;
    case "b": return 2;
    case "c": return 3;
    default: return assertNever(x);
  }
}
```

---

## TS 5.5: Inferred Type Predicates

```typescript
// Ab TS 5.5 narrowt filter() automatisch:
const items: (string | null)[] = ["a", null, "b"];

const clean = items.filter(x => x !== null);
// Typ: string[] (nicht mehr (string | null)[])

const nums = [1, "a", 2, "b"].filter(x => typeof x === "number");
// Typ: number[]
```

---

## Truthiness vs. Nullish

| Check | Eliminiert | Sicher fuer 0, ""? |
|---|---|---|
| `if (x)` | null, undefined, 0, "", false, NaN | **Nein!** |
| `if (x != null)` | null, undefined | **Ja** |
| `if (x !== null)` | null | **Ja** |
| `x ?? default` | null, undefined | **Ja** |
| `x \|\| default` | Alle falsy-Werte | **Nein!** |

**Faustregel:** Wenn 0, "" oder false gueltige Werte sind, verwende
`!= null` oder `??` statt Truthiness-Checks.

---

## typeof null Bug

```typescript
function sicher(x: object | null) {
  if (typeof x === "object") {
    // x: object | null — null ist NOCH da!
    if (x !== null) {
      // x: object — JETZT sicher
    }
  }
}

// Besser: null zuerst ausschliessen
function besser(x: object | null) {
  if (x === null) return;
  // x: object — sauber!
}
```

---

## instanceof vs. in vs. typeof

| Werkzeug | Funktioniert mit | Funktioniert NICHT mit |
|---|---|---|
| `typeof` | Primitives, function | Verschiedene Objekt-Typen |
| `instanceof` | Klassen | Interfaces, Type Aliases |
| `in` | Properties/Interfaces | Primitive Typen |
| `Array.isArray` | Arrays | Andere Objekte |

---

## Equality Narrowing

```typescript
// === narrowt BEIDE Seiten:
function f(a: string | number, b: string | boolean) {
  if (a === b) {
    // a: string, b: string (einziger gemeinsamer Typ)
  }
}

// != null prueft null UND undefined:
function g(x: string | null | undefined) {
  if (x != null) {
    x.toUpperCase();  // x: string
  }
}
```

---

## assertNever — Doppeltes Sicherheitsnetz

```
Compile-Schutz:  Fehlender case -> Type Error
                 "Type 'xyz' is not assignable to type 'never'"

Laufzeit-Schutz: Unerwarteter Wert -> Error
                 "Unbehandelter Fall: xyz"
```

```typescript
function assertNever(value: never): never {
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);
}
```

---

## Type Guard vs. Assertion Function

| | Type Guard (`is`) | Assertion (`asserts`) |
|---|---|---|
| Rueckgabe | `boolean` | `void` (oder throw) |
| Verwendung | `if (isX(val))` | `assertX(val); // narrowt danach` |
| Narrowing-Scope | Im if-Block | Gesamter restlicher Scope |
| Bei Fehler | Gibt false | Wirft Error |

---

## Haeufige Fehler

| Fehler | Problem | Loesung |
|---|---|---|
| `typeof null === "object"` | null kommt durch | `x === null` separat pruefen |
| `if (x)` bei Zahlen | 0 wird ausgeschlossen | `if (x != null)` oder `x ?? 0` |
| `instanceof Interface` | Compile Error | `in`-Operator oder Type Guard |
| `filter(x => x !== null)` | Typ bleibt (TS <5.5) | TS 5.5+ oder manueller Guard |
| Kein `assertNever` | Stille Fehler | Immer assertNever im default |
| Type Guard gibt immer true | Falsches Narrowing | Alle Felder pruefen + testen |
| Narrowing ueber boolean-Funktion | Kein Narrowing | `is` statt `boolean` verwenden |
