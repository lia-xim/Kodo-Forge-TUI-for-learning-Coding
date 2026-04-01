# Sektion 3: Option/Maybe Pattern

> Geschätzte Lesezeit: **9 Minuten**
>
> Vorherige Sektion: [02 - Das Result-Pattern](./02-das-result-pattern.md)
> Nächste Sektion: [04 - Exhaustive Error Handling](./04-exhaustive-error-handling.md)

---

## Was du hier lernst

- Was `Option<T>` (auch `Maybe<T>`) ist und wann es besser als `T | null` ist
- Den Unterschied zwischen "kein Wert" (`Option`) und "Fehler" (`Result`)
- Wie TypeScript's `strictNullChecks` schon ein natives `Option`-System bietet
- Wann man `Option<T>` vs `Result<T,E>` vs `null` wählen sollte

---

## Option<T>: "Vielleicht ein Wert"

> **Hintergrund: Haskell's `Maybe` und das Null-Problem**
>
> Tony Hoare nannte `null` sein "Billion Dollar Mistake" (2009): "I couldn't
> resist the temptation to put in a null reference [...] This has led to
> innumerable errors, vulnerabilities, and system crashes."
>
> Haskell hat `null` nie eingeführt. Stattdessen gibt es `Maybe a`:
> entweder `Nothing` (kein Wert) oder `Just a` (ein Wert). Das ist explizit
> und sicher.
>
> Scala hat `Option[T]` (Some/None), Rust hat `Option<T>` (Some/None).
> TypeScript hat kein `Maybe` eingebaut — aber `T | null` mit `strictNullChecks`
> erreicht das gleiche Ziel. `Option<T>` ist damit in TypeScript ein
> dokumentarisches Pattern, kein technisch notwendiges.

```typescript annotated
// TypeScript-Definition:
type Option<T> = T | null;
//              ^^^^^^  'null' = kein Wert
// Mit strictNullChecks: null darf nie ignoriert werden!

// Alternativ: explizites Some/None (Haskell-Stil):
type Some<T> = { readonly some: true;  readonly value: T };
type None    = { readonly some: false };
type Maybe<T> = Some<T> | None;

const some = <T>(value: T): Some<T> => ({ some: true, value });
const none: None = { some: false };

// Beide Ansätze haben Vor/Nachteile (dazu später in dieser Sektion)
```

---

## Wann Option, wann Result?

Die entscheidende Frage: Was bedeutet das Fehlen eines Wertes?

```typescript annotated
// OPTION: Kein Wert ist ein normaler Zustand (kein Fehler!)
function findUserById(id: string): User | null {
  // null = "nicht gefunden" — das ist NORMAL, kein Fehler
  const user = db.find(u => u.id === id);
  return user ?? null;
}

// RESULT: Fehler sind ein außergewöhnlicher Zustand MIT Details
function createUser(data: unknown): Result<User, ValidationError> {
  // Err = Validierung fehlgeschlagen — das ist ein FEHLER mit Ursache
  if (!isValidUserData(data)) {
    return { ok: false, error: { type: 'INVALID_DATA', message: '...' } };
  }
  return { ok: true, value: buildUser(data) };
}

// NULL: Einfachster Fall — kein Fehlerkontext nötig, kein Framework
function getFirstElement<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[0] : null;
  // null = "Array leer" — sehr einfach, kein Detail nötig
}
```

> 🧠 **Erkläre dir selbst:** Erkläre den Unterschied zwischen diesen drei
> Situationen: `findUser()` gibt null zurück | `createUser()` gibt Err zurück |
> `getFirstElement()` gibt null zurück. Warum ist nur die mittlere ein "Fehler"?
>
> **Kernpunkte:** findUser null = normales Suchergebnis (nicht-gefunden) |
> createUser Err = Validierungsproblem das erklärungsbedürftig ist |
> getFirstElement null = trivialer Sonderfall ohne Detail-Bedarf |
> Fehler = unerwartetes Ergebnis das Kontext braucht

---

## `strictNullChecks` als natives Option-System

TypeScript's `strictNullChecks` ist faktisch ein eingebautes `Option`-System:

```typescript annotated
// Mit strictNullChecks: true (sollte immer aktiv sein!)

function getUsername(userId: string): string | null {
  // Rückgabetyp explicit: string OR null — beides muss behandelt werden
  if (userId === 'admin') return 'Administrator';
  return null;
}

const name = getUsername('user-123');

// COMPILE-ERROR ohne null-Prüfung:
console.log(name.toUpperCase()); // ❌ 'name' is possibly 'null'

// Korrekte Behandlung:
if (name !== null) {
  console.log(name.toUpperCase()); // ✅ TypeScript weiß: string (nicht null)
}

// Optional Chaining (?.) als Kurzform:
console.log(name?.toUpperCase()); // ✅ Gibt string | undefined zurück
//               ^ '?' = nur aufrufen wenn name nicht null/undefined

// Nullish Coalescing (??) als Default:
console.log(name ?? 'Unbekannt'); // ✅ 'Unbekannt' wenn null/undefined
```

> 💭 **Denkfrage:** Wenn TypeScript mit `strictNullChecks` schon `T | null`
> hat, brauchen wir dann überhaupt `Option<T>` oder `Maybe<T>`?
>
> **Antwort:** `T | null` reicht für die meisten Fälle. `Option<T>` als
> alias-Type ist hauptsächlich **dokumentarisch**: Der Name kommuniziert
> "dieser Wert ist optional". `Maybe<T>` (Some/None Discriminated Union)
> lohnt sich nur wenn man Chaining-Methoden (map, flatMap) will ohne
> manuelle null-Checks.

---

## Maybe<T> mit Chaining-Methoden

```typescript annotated
type Some<T> = { readonly kind: 'some'; readonly value: T };
type None    = { readonly kind: 'none' };
type Maybe<T> = Some<T> | None;

function some<T>(value: T): Some<T> { return { kind: 'some', value }; }
const none: None = { kind: 'none' };

// Chaining-Helfer:
function mapMaybe<T, U>(maybe: Maybe<T>, fn: (value: T) => U): Maybe<U> {
  if (maybe.kind === 'none') return none;
  return some(fn(maybe.value));
}

function flatMapMaybe<T, U>(maybe: Maybe<T>, fn: (value: T) => Maybe<U>): Maybe<U> {
  if (maybe.kind === 'none') return none;
  return fn(maybe.value);
}

function getOrElse<T>(maybe: Maybe<T>, defaultValue: T): T {
  return maybe.kind === 'some' ? maybe.value : defaultValue;
}

// Verwendung:
const users: Map<string, { name: string; age: number }> = new Map([
  ['user-1', { name: 'Max', age: 30 }]
]);

function findUser(id: string): Maybe<{ name: string; age: number }> {
  const user = users.get(id);
  return user ? some(user) : none;
}

const result = flatMapMaybe(
  findUser('user-1'),
  user => user.age >= 18 ? some(user.name) : none
);

console.log(getOrElse(result, 'Unbekannt')); // 'Max'
console.log(getOrElse(flatMapMaybe(findUser('x'), _ => none), 'Unbekannt')); // 'Unbekannt'
```

> **Experiment:** Öffne `examples/03-option-maybe.ts` und:
> 1. Implementiere `filterMaybe<T>(maybe, predicate)` — gibt `none` wenn Prädikat false.
> 2. Implementiere `fromNullable<T>(value: T | null): Maybe<T>` — konvertiert null zu none.
> 3. Kette: `fromNullable(nullableUser)` → `filterMaybe(u => u.age >= 18)` → `mapMaybe(u => u.name)`

---

## `Option` vs `null` — Pragmatische Entscheidung

```typescript annotated
// Wann T | null reicht (pragmatisch):

// ✅ Einfache Lookups:
function getConfig(key: string): string | null {
  return config.get(key) ?? null;
}

// ✅ Array-Operationen:
function findFirst<T>(arr: T[], pred: (t: T) => boolean): T | null {
  return arr.find(pred) ?? null;
}

// Wann Maybe<T> sich lohnt:

// ✅ Wenn viele verkettete optionale Operationen:
const result = flatMapMaybe(
  flatMapMaybe(
    findUser('user-1'),
    user => getAddress(user.id)
  ),
  addr => getCity(addr.id)
);
// Vs. manuell:
const user = findUser('user-1');
if (!user) { /* ... */ }
const addr = getAddress(user.id);
if (!addr) { /* ... */ }
const city = getCity(addr.id);
```

> 🔍 **Tieferes Wissen: `undefined` vs `null` in TypeScript**
>
> TypeScript hat beide: `null` und `undefined`. Konventionen:
> - `null`: Explizit "kein Wert" (bewusst gesetzt)
> - `undefined`: Nicht initialisiert, fehlendes optionales Property
>
> Für `Option<T>` ist `null` die bessere Wahl: Es ist semantisch
> "kein Wert" (expliciter Zustand). `undefined` signalisiert eher
> "nicht vorhanden" (impliziter Zustand, z.B. optionale Objekt-Properties).
>
> TypeScript's `Array.prototype.find()` gibt `undefined` zurück, nicht `null`.
> Das ist historisch (JavaScript-Kompatibilität), nicht ideal.
> Deshalb: `arr.find(pred) ?? null` um zu `Option<T>` zu normalisieren.

---

## Option in Angular-Services

```typescript
// Angular-typisches Pattern:
@Injectable({ providedIn: 'root' })
class CacheService {
  private cache = new Map<string, unknown>();

  // Optional Chaining + null macht Option elegant:
  get<T>(key: string): T | null {
    return (this.cache.get(key) as T) ?? null;
  }

  // In der Component:
  ngOnInit(): void {
    const cachedUser = this.cache.get<User>('current-user');

    if (cachedUser) {
      // cachedUser ist hier User (nicht null) — TypeScript weiß das!
      this.name = cachedUser.name;
    } else {
      // Kein Cache-Hit — lade von API
      this.loadUser();
    }
  }
}
```

---

## Was du gelernt hast

- `Option<T>` = `T | null` — "vielleicht ein Wert", kein Fehler
- `Maybe<T>` (Some/None) ermöglicht elegantes Chaining ohne manuelle null-Checks
- **Unterschied**: Option = normales Fehlen | Result = Fehler mit Ursache | null = einfacher Sonderfall
- `strictNullChecks` macht TypeScript zu einem nativen Option-System — ohne extra Framework
- Pragmatisch: `T | null` für einfache Fälle, `Maybe<T>` für viele verkettete optionale Operationen

> 🧠 **Erkläre dir selbst:** Eine Funktion `findUser(id): User | null` — ist
> das Result oder Option-Pattern? Was bedeutet `null` hier?
>
> **Kernpunkte:** Option — nicht-gefunden ist NORMAL | Result würde Fehler kommunizieren |
> null hier = "Benutzer existiert nicht in der DB" — völlig ok, kein Fehler |
> Result wäre Over-Engineering für diesen Fall

**Kernkonzept zum Merken:** `Option/null` für optionale Daten. `Result` für Operationen
die scheitern können. Niemals beides verwechseln.

---

> **Pausenpunkt** -- Option vs Result — du kennst den Unterschied.
>
> Weiter geht es mit: [Sektion 04: Exhaustive Error Handling](./04-exhaustive-error-handling.md)
