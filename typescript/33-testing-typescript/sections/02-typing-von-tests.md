# Sektion 2: Typing von Tests — describe, it, expect

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Test-Setup](./01-test-setup.md)
> Naechste Sektion: [03 - Mocking mit Typen](./03-mocking-mit-typen.md)

---

## Was du hier lernst

- Wie `describe`, `it`, `expect` intern typisiert sind
- Warum `expect()` eine typisierte Matcher-Chain zurueckgibt
- Wie TypeScript generische Matcher wie `toEqual<T>()` nutzt
- Wie du eigene typsichere Matcher (Custom Matchers) erstellst

---

## Die Typen hinter describe und it

Test-Funktionen haben praezise TypeScript-Definitionen:

```typescript annotated
// Vereinfachte Vitest-Typen:
type TestFunction = (name: string, fn: () => void | Promise<void>, timeout?: number) => void;
//                    ^ Test-Name    ^ Test-Body (sync oder async!)    ^ Optionaler Timeout

// describe — gruppiert Tests
declare function describe(name: string, fn: () => void): void;
// ^ fn ist synchron — describe darf NICHT async sein!
// Warum? Weil der Test-Runner die Struktur synchron aufbauen muss.

// it / test — definiert einen einzelnen Test
declare function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
// ^ fn kann async sein — Tests duerfen asynchron sein
// ^ timeout ist optional (default: 5000ms in Vitest)
```

> 📖 **Hintergrund: Warum describe synchron sein muss**
>
> Test-Runner bauen zuerst einen "Test-Baum" auf (alle describes und
> its werden registriert), und fuehren dann die Tests aus. Wenn describe
> async waere, muesste der Runner auf jedes describe warten bevor er
> den naechsten Block registrieren kann — das wuerde die Parallelisierung
> zerstoeren. Deshalb: describe ist immer synchron, it kann async sein.
>
> Wenn du in einem describe-Block einen async-Aufruf brauchst (z.B.
> Datenbank-Setup), nutze `beforeAll()` statt den describe-Body.

---

## expect(): Die typisierte Matcher-Chain

`expect()` ist die maechtigste Typ-Definition in Test-Frameworks:

```typescript annotated
// Vereinfachte Typ-Definition:
interface Expect {
  <T>(actual: T): Matchers<T>;
  // ^ T wird aus dem uebergebenen Wert inferiert
  // ^ Rueckgabe: Matchers<T> — der Typ fliesst in die Matcher
}

interface Matchers<T> {
  toBe(expected: T): void;
  // ^ expected muss den GLEICHEN Typ haben wie actual
  // expect(42).toBe("hello") → Compile-Error!

  toEqual(expected: T): void;
  // ^ Deep Equality — gleicher Typ-Check

  toContain(expected: T extends (infer U)[] ? U : T extends string ? string : never): void;
  // ^ Wenn T ein Array ist: einzelnes Element. Wenn T ein String: Substring.

  toBeGreaterThan(expected: number): void;
  // ^ Nur wenn T extends number — sonst nicht verfuegbar
  // (In Praxis: Vitest erlaubt es immer, aber TS prueft den Typ)

  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  // ^ Diese Matcher brauchen kein Argument
}
```

### Typinferenz in der Praxis

```typescript annotated
// TypeScript inferiert den Typ aus expect():
expect(42).toBe(42);           // T = number ✓
expect("hello").toBe("hello"); // T = string ✓
// expect(42).toBe("hello");   // T = number, aber "hello" ist string → Compile-Error!

expect([1, 2, 3]).toContain(2);        // T = number[], Element = number ✓
expect("TypeScript").toContain("Type"); // T = string, Substring ✓
// expect([1,2,3]).toContain("hello");  // T = number[], aber "hello" ist string → Compile-Error!

// Objekt-Vergleich:
interface User { name: string; age: number }
const user: User = { name: "Max", age: 30 };

expect(user).toEqual({ name: "Max", age: 30 });    // ✓
// expect(user).toEqual({ name: "Max" });            // Fehlende Properties → Error
// expect(user).toEqual({ name: "Max", age: "30" }); // age: string statt number → Error
```

> 💭 **Denkfrage:** Warum prueft TypeScript `expect(user).toEqual()`
> auf die gleichen Properties wie das `User`-Interface? Was passiert
> wenn die API ein zusaetzliches Feld zurueckgibt?
>
> **Antwort:** TypeScript prueft strukturell: Das Argument von toEqual
> muss zu T passen. Fehlende Properties sind ein Fehler. Zusaetzliche
> Properties werden (je nach Konfiguration) erlaubt oder abgelehnt.
> In Tests ist das wertvoll: Wenn User ein neues Feld bekommt, schlagen
> toEqual-Tests fehl — du merkst es sofort.

---

## Async Tests und Typen

```typescript annotated
// Async Tests — Promise<void> als Rueckgabetyp
it('fetches users', async () => {
  const users = await fetchUsers();
  // ^ users: User[] — TypeScript inferiert den Typ

  expect(users).toHaveLength(3);
  expect(users[0].name).toBe("Max");
  // ^ users[0]: User — Array-Zugriff ist typsicher
});

// ACHTUNG: Vergessenes await
it('dangerous test', () => {
  // KEIN async!
  const promise = fetchUsers();
  // ^ promise: Promise<User[]> — NICHT User[]!
  expect(promise).toHaveLength(3);
  // ^ FALSCH: Du pruefst ein Promise-Objekt, nicht das Array!
  // TypeScript warnt: Promise hat keine 'length' Property
  // → Immer async/await in async Tests!
});
```

---

## Custom Matchers typsicher erstellen

Vitest und Jest erlauben eigene Matcher:

```typescript annotated
// custom-matchers.ts
import { expect } from 'vitest';

// 1. Custom Matcher implementieren
expect.extend({
  toBeValidEmail(received: string) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be a valid email`
        : `Expected ${received} to be a valid email`,
    };
  },

  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `Expected ${received} to be within [${floor}, ${ceiling}]`,
    };
  },
});

// 2. TypeScript-Typen deklarieren (Declaration Merging!)
interface CustomMatchers<R = unknown> {
  toBeValidEmail(): R;
  toBeWithinRange(floor: number, ceiling: number): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// 3. Verwendung — volle Autocomplete!
expect("test@example.com").toBeValidEmail(); // ✓
expect(50).toBeWithinRange(1, 100);          // ✓
// expect(50).toBeValidEmail();               // Compile-Error? Nein — TypeScript kann
// den Typ von 'received' im Matcher nicht einschraenken. Laufzeitfehler moeglich.
```

> 🧠 **Erklaere dir selbst:** Warum nutzen Custom Matchers
> "Declaration Merging" (declare module) statt einer neuen Klasse?
> Was wuerde passieren wenn du eine neue Klasse erstellen wuerdest?
>
> **Kernpunkte:** expect() gibt immer Assertion<T> zurueck — du kannst
> den Rueckgabetyp nicht aendern | Declaration Merging erweitert das
> bestehende Interface | Neue Klasse wuerde die expect()-Chain brechen |
> Das ist das gleiche Pattern wie bei L27 (Declaration Merging)

---

## Type Narrowing in Tests

```typescript annotated
// Tests koennen Type Narrowing verwenden:
it('handles union types', () => {
  const result: string | null = getOptionalName();

  // Ohne Narrowing:
  // expect(result.length).toBe(3);
  // ^ Compile-Error: result koennte null sein!

  // Mit Narrowing:
  expect(result).not.toBeNull();
  // ACHTUNG: TypeScript weiss nach expect().not.toBeNull() NICHT
  // dass result nicht null ist! expect() narrowt nicht.

  // Loesung: Explizites Narrowing
  if (result === null) throw new Error("Expected non-null");
  expect(result.length).toBe(3);
  // ^ Jetzt OK — TypeScript weiss: result ist string

  // Alternative: Non-null assertion (nur in Tests!)
  expect(result!.length).toBe(3);
  // ^ ! sagt: "Ich weiss es ist nicht null". In Tests akzeptabel.
});
```

> ⚡ **Praxis-Tipp fuer Angular:** In Angular-Tests mit TestBed
> begegnest du dem Narrowing-Problem staendig:
>
> ```typescript
> const fixture = TestBed.createComponent(UserComponent);
> const component = fixture.componentInstance;
> // component: UserComponent — direkt typsicher!
>
> // Aber: DOM-Queries sind unknown:
> const element = fixture.nativeElement.querySelector('.user-name');
> // element: Element | null — muss genarrowt werden!
> expect(element).toBeTruthy();
> expect(element!.textContent).toContain('Max');
> ```

---

## Generische Test-Helpers

```typescript annotated
// Typsichere Test-Factory
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
    // ^ Partial<User> erlaubt einzelne Felder zu ueberschreiben
  };
}

// Verwendung:
it('handles admin users', () => {
  const admin = createTestUser({ role: 'admin' });
  // ^ admin: User — voller Typ, nur role ueberschrieben
  expect(admin.role).toBe('admin');
  expect(admin.name).toBe('Test User'); // Default-Wert
});
```

> 🔬 **Experiment:** Erstelle eine generische `createTestEntity`-Funktion
> die fuer jeden Typ funktioniert:
>
> ```typescript
> function createTestEntity<T>(defaults: T, overrides?: Partial<T>): T {
>   return { ...defaults, ...overrides };
> }
>
> const user = createTestEntity(
>   { id: '1', name: 'Test', email: 'test@test.de', role: 'user' as const },
>   { name: 'Max' }
> );
> // Was ist der Typ von user? Ist er User?
> // Antwort: { id: string; name: string; email: string; role: 'user' }
> // role ist 'user' (nicht string) wegen 'as const'!
> ```

---

## Was du gelernt hast

- `expect<T>(actual)` inferiert T und gibt typisierte Matcher zurueck
- `describe` muss synchron sein, `it` kann async sein
- Custom Matchers nutzen Declaration Merging um Vitest/Jest zu erweitern
- `expect().not.toBeNull()` narrowt den TypeScript-Typ NICHT — explizites Narrowing noetig
- Generische Test-Factories mit `Partial<T>` vermeiden Test-Duplikation

**Kernkonzept zum Merken:** expect() ist eine generische Funktion die den Typ vom `actual`-Wert in die Matcher-Chain transportiert. Das bedeutet: Wenn dein Produktionscode typsicher ist, sind deine Tests es automatisch auch — TypeScript verhindert unsinnige Assertions wie `expect(42).toBe("hello")`.

---

> **Pausenpunkt** — Du verstehst jetzt die Typ-Grundlagen von Tests.
> Als naechstes: Mocking — wo Typen am komplexesten werden.
>
> Weiter geht es mit: [Sektion 03: Mocking mit Typen](./03-mocking-mit-typen.md)
