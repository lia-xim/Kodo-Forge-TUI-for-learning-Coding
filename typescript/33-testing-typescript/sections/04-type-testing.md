# Sektion 4: Type-Testing — expectTypeOf und tsd

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Mocking mit Typen](./03-mocking-mit-typen.md)
> Naechste Sektion: [05 - Test-Patterns](./05-test-patterns.md)

---

## Was du hier lernst

- Warum du Typen testen solltest — nicht nur Werte
- Wie `expectTypeOf` in Vitest funktioniert und was es testet
- Wie `tsd` als externe Type-Testing-Library arbeitet
- Wann Type-Tests sinnvoll sind und wann nicht

---

## Warum Type-Tests?

Normale Tests pruefen **Laufzeit-Verhalten**: `expect(add(1, 2)).toBe(3)`.
Type-Tests pruefen **Compilezeit-Verhalten**: "Hat `add(1, 2)` den Typ `number`?"

Warum ist das wichtig? Weil TypeScript-Code manchmal die **richtigen Werte**
liefert aber die **falschen Typen** hat:

```typescript
// Beispiel: Die Funktion funktioniert korrekt...
function identity<T>(value: T): T {
  return value;
}

// ...aber was wenn jemand refactort zu:
function identity(value: any): any {
  return value;
}
// Laufzeit-Tests bestehen alle! add(1,2) gibt immer noch 3 zurueck.
// Aber der Typ ist kaputt: identity("hello") gibt jetzt 'any' statt 'string'.
// Type-Tests fangen das.
```

> 📖 **Hintergrund: Type-Testing in der Open-Source-Welt**
>
> Type-Testing wurde populaer durch Library-Autoren. Wenn du eine
> Library wie lodash, zod oder tRPC entwickelst, sind die TYPEN ein
> Teil der oeffentlichen API. Ein Typ-Regression-Bug (z.B. ein Feld
> wird zu `any` statt `string`) bricht den Code aller Nutzer — auch
> wenn die Laufzeit weiterhin funktioniert.
>
> `tsd` wurde 2018 von Sam Verschueren entwickelt, speziell fuer
> DefinitelyTyped (@types/*) Packages. Vitest integrierte Type-Testing
> mit `expectTypeOf` direkt in den Test-Runner — inspiriert von
> `expect-type` von Matt Pocock.

---

## expectTypeOf: Type-Tests in Vitest

Vitest hat `expectTypeOf` eingebaut — keine Installation noetig:

```typescript annotated
import { expectTypeOf, describe, it } from 'vitest';

describe('Type Tests', () => {
  it('identity preserves type', () => {
    const result = identity("hello");

    expectTypeOf(result).toBeString();
    // ^ PASS: typeof result === string

    expectTypeOf(result).not.toBeAny();
    // ^ PASS: result ist NICHT any

    expectTypeOf(result).toEqualTypeOf<string>();
    // ^ PASS: result ist exakt string (nicht string | number o.ae.)
  });

  it('Promise.all returns tuple', () => {
    const p = Promise.all([
      Promise.resolve(42),
      Promise.resolve("hello"),
    ]);

    expectTypeOf(p).toEqualTypeOf<Promise<[number, string]>>();
    // ^ PASS: Tupel-Typ wird korrekt inferiert
  });

  it('generic function preserves type parameter', () => {
    function wrap<T>(value: T): { wrapped: T } {
      return { wrapped: value };
    }

    expectTypeOf(wrap(42)).toEqualTypeOf<{ wrapped: number }>();
    // ^ PASS: T wird als number inferiert

    expectTypeOf(wrap).parameter(0).toBeNumber();
    // ^ Pruefe den Typ des ersten Parameters
    // ACHTUNG: parameter(0) prueft den Typ WENN number uebergeben wird
  });
});
```

### Wichtige expectTypeOf-Methoden

```typescript annotated
// Exakter Typ-Vergleich
expectTypeOf<string>().toEqualTypeOf<string>();          // ✓
expectTypeOf<string>().toEqualTypeOf<string | number>(); // ✗

// Zuweisbarkeits-Check (breiter als Equal)
expectTypeOf<string>().toMatchTypeOf<string | number>(); // ✓ string ⊂ string|number
expectTypeOf<string | number>().toMatchTypeOf<string>(); // ✗ string|number ⊄ string

// Primitive Checks
expectTypeOf("hello").toBeString();
expectTypeOf(42).toBeNumber();
expectTypeOf(true).toBeBoolean();
expectTypeOf(null).toBeNull();
expectTypeOf(undefined).toBeVoid();

// Negation
expectTypeOf("hello").not.toBeNumber();
expectTypeOf(undefined).not.toBeNull();

// Funktion-Checks
expectTypeOf(add).toBeFunction();
expectTypeOf(add).returns.toBeNumber();
// ^ Prueft den Rueckgabetyp
expectTypeOf(add).parameter(0).toBeNumber();
// ^ Prueft den Typ des ersten Parameters
```

> 💭 **Denkfrage:** Was ist der Unterschied zwischen `toEqualTypeOf`
> und `toMatchTypeOf`? Wann wuerdest du welches verwenden?
>
> **Antwort:** `toEqualTypeOf` prueft exakte Gleichheit (bidirektionale
> Zuweisbarkeit). `toMatchTypeOf` prueft nur ob der Actual-Typ zum
> Expected-Typ zuweisbar ist (unidirektional). Verwende `toEqual`
> wenn du den exakten Typ garantieren willst, `toMatch` wenn du nur
> "ist mindestens so breit wie X" pruefen willst.

---

## tsd: Type-Testing fuer Libraries

`tsd` ist eine eigenstaendige Library, ideal fuer Package-Autoren:

```typescript annotated
// __tests__/types.test-d.ts (tsd-Dateiendung: .test-d.ts)
import { expectType, expectNotType, expectError, expectAssignable } from 'tsd';
import { identity, createUser } from '../src';

// Typ-Assertions
expectType<string>(identity("hello"));
// ^ PASS: identity("hello") hat den Typ string

expectNotType<any>(identity("hello"));
// ^ PASS: identity("hello") ist NICHT any

// Fehler-Assertions — pruefe dass etwas NICHT kompiliert!
expectError(identity());
// ^ PASS: identity() ohne Argument ist ein Compile-Error

// Zuweisbarkeit
expectAssignable<string | number>(identity(42));
// ^ PASS: number ist zu string | number zuweisbar
```

### tsd vs expectTypeOf

| Kriterium | expectTypeOf (Vitest) | tsd |
|---|---|---|
| Integration | In Vitest eingebaut | Eigenes CLI-Tool |
| Ausfuehrung | Waehrend des Tests | Separater Type-Check |
| Error-Testing | Nicht moeglich | `expectError()` moeglich |
| Setup | Zero-Config (Vitest) | Eigene Konfiguration |
| Empfehlung | App-Code, Quick-Checks | Library-Autoren, Package-Tests |

> 🧠 **Erklaere dir selbst:** Warum kann `expectTypeOf` keine
> "erwarteten Compile-Errors" testen, aber `tsd` schon? Was ist
> der technische Unterschied?
>
> **Kernpunkte:** expectTypeOf laeuft ZUR LAUFZEIT — wenn der Code
> nicht kompiliert, laeuft er nicht | tsd analysiert den Code
> STATISCH (wie der Compiler) — es kann pruefen ob Code NICHT
> kompiliert | tsd nutzt die TypeScript Compiler API direkt

---

## Praktische Type-Test-Patterns

### Pattern 1: Utility Types testen

```typescript annotated
import { expectTypeOf } from 'vitest';

// Eigene Utility Types testen:
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

it('DeepReadonly makes nested properties readonly', () => {
  type Input = { a: { b: string } };
  type Result = DeepReadonly<Input>;

  expectTypeOf<Result>().toEqualTypeOf<{
    readonly a: { readonly b: string };
  }>();
  // ^ Prueft dass BEIDE Ebenen readonly sind
});
```

### Pattern 2: API-Typen testen

```typescript annotated
it('API client returns correct types', () => {
  const client = createApiClient({ baseUrl: '' });

  // Pruefe dass get() den richtigen generischen Typ zurueckgibt
  expectTypeOf(client.get<User[]>('/users')).toEqualTypeOf<Promise<User[]>>();

  // Pruefe dass der Client die richtige Signatur hat
  expectTypeOf(client.post).parameter(1).toEqualTypeOf<unknown>();
  // ^ body ist unknown — nicht any!
});
```

### Pattern 3: Discriminated Union testen

```typescript annotated
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

it('Result narrows correctly', () => {
  const result: Result<string> = { ok: true, value: "hello" };

  if (result.ok) {
    expectTypeOf(result.value).toBeString();
    // ^ Nach ok-Check: value ist string
  } else {
    expectTypeOf(result.error).toEqualTypeOf<Error>();
    // ^ Nach !ok-Check: error ist Error
  }
});
```

> ⚡ **Praxis-Tipp fuer Angular und React:** Type-Tests sind besonders
> wertvoll fuer:
>
> ```typescript
> // Angular: Pruefe dass ein Service den richtigen Observable-Typ zurueckgibt
> expectTypeOf(userService.getUsers()).toEqualTypeOf<Observable<User[]>>();
>
> // React: Pruefe dass ein Hook den richtigen Typ zurueckgibt
> expectTypeOf(useUser('1')).toMatchTypeOf<{
>   data: User | undefined;
>   isLoading: boolean;
> }>();
> ```

---

## Wann Type-Tests schreiben?

```typescript
// ✅ Type-Tests sind sinnvoll fuer:
// - Library-APIs (oeffentliche Schnittstellen)
// - Utility Types (DeepReadonly, DeepPartial, etc.)
// - Generische Funktionen (identity, pipe, compose)
// - Discriminated Unions (Narrowing testen)
// - API-Client-Typen (Response-Typen)

// ❌ Type-Tests sind uebertrieben fuer:
// - Einfache Funktionen mit offensichtlichen Typen
// - Interne Implementierungsdetails
// - Code der sich haeufig aendert
// - Wenn Laufzeit-Tests den Typ implizit pruefen
```

> 🔬 **Experiment:** Schreibe Type-Tests fuer eine eigene Utility-Funktion:
>
> ```typescript
> function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
>   const result = {} as Pick<T, K>;
>   keys.forEach(k => { result[k] = obj[k]; });
>   return result;
> }
>
> // Type-Tests:
> const user = { name: 'Max', age: 30, email: 'max@test.de' };
> const picked = pick(user, ['name', 'age']);
>
> expectTypeOf(picked).toEqualTypeOf<{ name: string; age: number }>();
> // Hat der Typ nur name und age? Oder auch email?
> // Antwort: Nur name und age — Pick<T, K> entfernt die anderen Keys.
> ```

---

## Was du gelernt hast

- Type-Tests pruefen COMPILEZEIT-Verhalten, nicht Laufzeit-Verhalten
- `expectTypeOf` in Vitest prueft Typen als Teil normaler Tests
- `tsd` ist ein eigenstaendiges Tool das auch "erwartete Fehler" testen kann
- `toEqualTypeOf` prueft exakte Gleichheit, `toMatchTypeOf` prueft Zuweisbarkeit
- Type-Tests sind besonders wertvoll fuer Libraries, Utility Types und generische APIs

**Kernkonzept zum Merken:** Type-Tests sind die "Unit-Tests fuer dein Typsystem". Sie stellen sicher, dass Refactorings nicht versehentlich Typen zu `any` degradieren oder Generics brechen. Fuer Library-Code sind sie unverzichtbar — fuer App-Code ein nice-to-have.

---

> **Pausenpunkt** — Type-Testing ist ein maechtige Technik.
> Die naechste Sektion zeigt bewaeaehrte Test-Patterns.
>
> Weiter geht es mit: [Sektion 05: Test-Patterns](./05-test-patterns.md)
