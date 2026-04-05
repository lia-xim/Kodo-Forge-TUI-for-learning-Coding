# Sektion 2: Generische Funktionen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Warum Generics](./01-warum-generics.md)
> Naechste Sektion: [03 - Generische Interfaces und Types](./03-generische-interfaces-und-types.md)

---

## Was du hier lernst

- Die Syntax `function name<T>(arg: T): T`
- Wie TypeScript den Typparameter **automatisch** erkennt (Inference)
- Wann du den Typ **explizit** angeben musst
- Funktionen mit **mehreren Typparametern** `<T, U>`

---

> 📖 **Hintergrund: Warum TypeScript Inference so gut ist**
>
> Als TypeScript 2012 entstand, mussten Entwickler in Java und C# Generics
> **immer** explizit angeben: `List<String> names = new ArrayList<String>()`.
> Das war laestig. Java 7 (2011) fuehrte den Diamond-Operator ein: `new ArrayList<>()` —
> TypeScript-Entwickler lachen darueber, weil TypeScript von Anfang an viel
> weiter geht.
>
> TypeScript's Typ-Inferenz bei Generics basiert auf einem Algorithmus namens
> **Hindley-Milner** (entwickelt 1969/1978 unabhaengig von Roger Hindley und
> Robin Milner). Dieser Algorithmus kann Typen in beide Richtungen ableiten —
> aus Argumenten, aus Rueckgabetypen, aus Callbacks. TypeScript's Implementierung
> ist eine pragmatische Variante davon: schnell genug fuer IDEs, praezise genug
> fuer komplexe Code-Basen.
>
> Das Ergebnis: Du schreibst `map(numbers, n => String(n))` und TypeScript
> weiss ohne jede Annotation, dass das Ergebnis `string[]` ist. Das ist
> kein Trick — das ist formale Typentheorie, die fuer dich arbeitet.

---

## Die Grundsyntax

```typescript annotated
function identity<T>(arg: T): T {
  return arg;
}
// ^ <T> deklariert den Typparameter
// ^ (arg: T) verwendet T als Parametertyp
// ^ : T verwendet T als Rueckgabetyp
```

Das ist die einfachste generische Funktion. Sie nimmt einen Wert
und gibt ihn unveraendert zurueck. Der Typ bleibt erhalten.

### Expliziter vs. inferierter Typparameter

```typescript annotated
// Explizit: Du sagst TypeScript welcher Typ
const a = identity<string>("hallo");
// ^ T wird zu string

// Inferiert: TypeScript erkennt T aus dem Argument
const b = identity("hallo");
// ^ T wird aus "hallo" als string inferiert — identisches Ergebnis!

// TypeScript inferiert sogar Literal Types:
const c = identity("hallo" as const);
// ^ T ist "hallo" (Literal Type!)
```

> **Faustregel:** Lass TypeScript inferieren wenn moeglich.
> Gib den Typ nur explizit an, wenn die Inference nicht das liefert
> was du brauchst.

---

## Type Inference bei Generics — der Zauber

Die echte Staerke von Generics ist die **automatische Inference**.
TypeScript schaut sich die Argumente an und leitet `T` daraus ab:

```typescript annotated
function wrap<T>(value: T): { wrapped: T } {
  return { wrapped: value };
}

const result1 = wrap("hallo");
// ^ Typ: { wrapped: string }
// TypeScript: "value ist 'hallo', also ist T = string"

const result2 = wrap(42);
// ^ Typ: { wrapped: number }
// TypeScript: "value ist 42, also ist T = number"

const result3 = wrap({ name: "Max", age: 30 });
// ^ Typ: { wrapped: { name: string; age: number } }
// TypeScript inferiert sogar komplexe Objekttypen!
```

Die Inference funktioniert, weil TypeScript den Typ von `value`
kennt und ihn mit dem Typparameter `T` **unifiziert**. Dasselbe
Prinzip wie Type Inference bei Variablen — nur maechtiger.

---

## Mehrere Typparameter

Eine Funktion kann **mehrere** Typparameter haben:

```typescript annotated
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p1 = pair("hallo", 42);
// ^ Typ: [string, number]

const p2 = pair(true, [1, 2, 3]);
// ^ Typ: [boolean, number[]]

// Auch mit expliziter Angabe:
const p3 = pair<string, boolean>("ja", true);
// ^ Typ: [string, boolean]
```

### Die `map`-Funktion — ein klassisches Beispiel

```typescript annotated
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  const result: U[] = [];
  for (const item of arr) {
    result.push(fn(item));
  }
  return result;
}
// ^ T ist der Input-Typ, U ist der Output-Typ

const names = map([1, 2, 3], n => String(n));
// ^ T = number (aus dem Array), U = string (aus der Callback-Rueckgabe)
// Ergebnis: string[]

const lengths = map(["ab", "cde", "f"], s => s.length);
// ^ T = string, U = number
// Ergebnis: number[]
```

TypeScript inferiert **beide** Typparameter gleichzeitig — `T` aus dem
Array, `U` aus dem Rueckgabetyp der Callback-Funktion.

---

## Arrow Functions mit Generics

Generics funktionieren auch mit Arrow Functions:

```typescript annotated
// Standard Arrow Function:
const identity2 = <T>(arg: T): T => arg;

// Mehrere Typparameter:
const swap = <T, U>(pair: [T, U]): [U, T] => [pair[1], pair[0]];

const result = swap(["hallo", 42]);
// ^ Typ: [number, string]
```

> **Achtung in .tsx-Dateien (React):** `<T>` wird als JSX-Tag interpretiert!
> Loesung: `<T,>` (Trailing Comma) oder `<T extends unknown>`.
>
> ```typescript
> // In .tsx-Dateien:
> const identity = <T,>(arg: T): T => arg;        // Trailing Comma
> const identity = <T extends unknown>(arg: T): T => arg; // Constraint
> ```

---

## Wann explizite Typangabe noetig ist

Manchmal kann TypeScript den Typ nicht inferieren:

```typescript annotated
// Problem: Leeres Array — TypeScript weiss nicht was T ist
function createArray<T>(): T[] {
  return [];
}

// const arr = createArray(); // Error! T kann nicht inferiert werden
const arr = createArray<string>(); // OK: T = string
// ^ Hier MUSS man T explizit angeben

// Problem: Gewuenschter Typ ist breiter als der inferierte
function parseJSON<T>(json: string): T {
  return JSON.parse(json);
}

const data = parseJSON<{ name: string }>(jsonString);
// ^ T muss explizit sein — TypeScript kann nicht in den JSON schauen
```

> **Regel:** Wenn der Typparameter **nur im Rueckgabetyp** vorkommt
> (nicht in den Parametern), kann TypeScript ihn nicht inferieren.
> Dann musst du ihn explizit angeben.

---

> 💭 **Denkfrage:** Du siehst diesen Code:
>
> ```typescript
> function transform<T, U>(value: T, fn: (input: T) => U): U {
>   return fn(value);
> }
> ```
>
> Wie viele Typparameter hat diese Funktion, und **warum braucht sie zwei?**
> Koennte man das mit einem auskommen?
>
> **Denk einen Moment nach, bevor du weiterliest.**
>
> `T` beschreibt den Eingabetyp, `U` beschreibt den Ausgabetyp nach der
> Transformation. Sie sind **unabhaengig** voneinander: `transform("hallo", s => s.length)`
> hat `T = string` und `U = number`. Ein einzelner Typparameter koennte
> nicht ausdruecken, dass Input und Output unterschiedliche Typen sein koennen.
> Merke: Jeder Typparameter repraesentiert eine **unbekannte, aber konsistente** Groesse.

---

## Haeufiger Fehler: Unnoetige Typparameter

Nicht jedes `<T>` ist sinnvoll:

```typescript annotated
// SCHLECHT: T wird nur einmal verwendet — bringt keinen Mehrwert
function bad<T>(arr: T[]): void {
  console.log(arr.length);
}
// ^ T taucht nur im Parameter auf, nicht im Rueckgabetyp
// Besser: function bad(arr: unknown[]): void

// GUT: T verbindet Input und Output
function good<T>(arr: T[]): T | undefined {
  return arr[0];
}
// ^ T stellt sicher: "Was reingeht, kommt auch raus"
```

> **Faustregel:** Ein Typparameter sollte mindestens **zweimal** vorkommen.
> Einmal im Parameter UND einmal im Rueckgabetyp (oder in einem
> anderen Parameter). Sonst ist er ueberfluessig.

---

## In deinem Angular-Projekt: Generische Funktionen ueberall

Du schreibst tagtaeglich generische Funktionen, ohne es zu merken:

```typescript annotated
// Angular Service mit generischer Hilfsfunktion:
@Injectable({ providedIn: 'root' })
class DataService {
  // Eine Funktion fuer alle API-Endpunkte:
  fetch<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(endpoint);
    // ^ T wird vom Aufrufer bestimmt — Inference funktioniert hier NICHT
    //   weil TypeScript nicht in den HTTP-Response schauen kann
  }

  // Mit Transformation:
  fetchAndTransform<TRaw, TModel>(
    endpoint: string,
    transform: (raw: TRaw) => TModel
  ): Observable<TModel> {
    return this.http.get<TRaw>(endpoint).pipe(
      map(transform)
      // ^ map() ist selbst generisch: map<TRaw, TModel>
    );
  }
}

// Verwendung — TypeScript inferiert TModel:
service.fetchAndTransform<UserDTO, User>(
  '/api/users/1',
  dto => ({ id: dto.userId, name: dto.fullName })
);
// ^ TRaw = UserDTO (explizit), TModel = User (inferiert aus transform)
```

**In React:**

```typescript
// Eine generische Fetch-Hook fuer alle API-Calls:
function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  // ...Fetch-Logik...
  return { data, loading };
}

// Verwendung:
const { data: users } = useFetch<User[]>('/api/users');
// users ist User[] | null — volle IDE-Unterstuetzung
```

---

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> // Baue eine pipe()-Funktion fuer zwei Schritte:
> function pipe<A, B, C>(
>   value: A,
>   fn1: (a: A) => B,
>   fn2: (b: B) => C
> ): C {
>   return fn2(fn1(value));
> }
>
> // Teste diese Aufrufe:
> const result1 = pipe("hallo", s => s.length, n => n > 3);
> const result2 = pipe(42, n => String(n), s => s.split(""));
>
> // Hovere ueber result1 und result2 — was sind ihre Typen?
> // Aendere dann fn1 so dass sie einen falschen Typ zurueckgibt:
> const broken = pipe("hallo", s => s.length, (s: string) => s.toUpperCase());
> // Was sagt TypeScript? Warum genau dort?
> ```
>
> Beobachte wie TypeScript **genau die Stelle** markiert, wo die Typen
> nicht passen — nicht in der `pipe`-Definition, sondern beim Aufruf.

---

## Was du gelernt hast

- Die Grundsyntax `function name<T>(arg: T): T` — Typparameter in spitzen Klammern vor den Parametern
- TypeScript inferiert Typparameter automatisch aus den uebergebenen Argumenten (Hindley-Milner)
- Mehrere Typparameter `<T, U>` fuer Funktionen die verschiedene Input- und Output-Typen haben
- Arrow Functions benoetigen in `.tsx`-Dateien ein Trailing Comma: `<T,>`
- Ein Typparameter der nur einmal vorkommt ist meistens ueberfluessig — Generics verbinden Input und Output

**Kernkonzept:** Typparameter-Inference ist der "Zauber" von TypeScript-Generics — du schreibst typsicheren Code, ohne den Typ staendig explizit angeben zu muessen. Der Compiler erledigt das.

---

## Zusammenfassung

| Konzept | Syntax | Beispiel |
|---------|--------|----------|
| Einzelner Typparameter | `<T>` | `function f<T>(x: T): T` |
| Mehrere Typparameter | `<T, U>` | `function f<T, U>(a: T, b: U): [T, U]` |
| Expliziter Typ | `f<string>(...)` | Wenn Inference nicht reicht |
| Inferierter Typ | `f(...)` | TypeScript erkennt T automatisch |
| Arrow Function | `<T>(x: T): T => x` | In `.tsx`: `<T,>` verwenden |

---

> 🧠 **Erklaere dir selbst:** Warum soll ein Typparameter mindestens
> zweimal vorkommen? Was passiert wenn er nur einmal vorkommt?
> **Kernpunkte:** Einmal = kein Zusammenhang hergestellt | Generics verbinden Input und Output | Sonst reicht unknown

---

> **Pausenpunkt** — Gut? Dann weiter zu [Sektion 03: Generische Interfaces und Types](./03-generische-interfaces-und-types.md)
