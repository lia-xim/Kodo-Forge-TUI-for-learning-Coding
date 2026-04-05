# Sektion 3: Algebraische Datentypen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Pattern Matching](./02-pattern-matching.md)
> Naechste Sektion: [04 - Zustandsmodellierung](./04-zustandsmodellierung.md)

---

## Was du hier lernst

- Was **Algebraische Datentypen (ADTs)** sind und warum sie wichtig sind
- Wie TypeScript ADTs aus Haskell und Rust uebernimmt
- Das **Option-Pattern** (Some/None) als null-sichere Alternative
- Das **Result-Pattern** (Ok/Err) fuer elegante Fehlerbehandlung
- Die historischen Wurzeln in der Typentheorie

---

## Hintergrund: Woher kommt das?

Discriminated Unions sind kein TypeScript-Erfindung. Sie kommen aus der
**funktionalen Programmierung** und sind dort seit den 1970er Jahren
ein Grundpfeiler der Typentheorie.

### Die Ideenlinie

```
ML (1973)          →  Haskell (1990)     →  Rust (2010)      →  TypeScript (2016)
"datatype"             "data"                "enum"               Discriminated Unions
```

**ML** (Meta Language) fuehrte 1973 algebraische Datentypen ein.
**Haskell** perfektionierte sie mit Pattern Matching.
**Rust** machte sie mainstream-tauglich mit `enum` und `match`.
**TypeScript** brachte sie in die JavaScript-Welt — nicht als
neues Sprachfeature, sondern als clevere Nutzung bestehender Features
(Union Types + Literal Types + Control Flow Analysis).

> **Das Besondere an TypeScript:** Keine neue Syntax noetig! ADTs
> entstehen durch die Kombination von Features, die du schon kennst.

---

## Sum Types und Product Types

In der Typentheorie gibt es zwei grundlegende Kompositionsarten:

### Product Types (UND)

Ein Product Type kombiniert Werte mit UND — **alle** Felder sind
gleichzeitig vorhanden:

```typescript annotated
// Product Type: x UND y UND z — alle gleichzeitig
type Point3D = { x: number; y: number; z: number };
// Moegliche Werte = number x number x number (Multiplikation)
```

Der Name "Product" kommt daher, dass die Anzahl moeglicher Werte
das **Produkt** der einzelnen Typen ist.

### Sum Types (ODER)

Ein Sum Type kombiniert Varianten mit ODER — **genau eine** ist
aktiv:

```typescript annotated
// Sum Type: Circle ODER Rectangle ODER Triangle — genau eins
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };
// Moegliche Werte = Circle + Rectangle + Triangle (Addition)
```

Der Name "Sum" kommt daher, dass die Anzahl moeglicher Werte
die **Summe** der Varianten ist.

> **Erklaere dir selbst:** Warum heisst ein Interface "Product Type"
> und eine Discriminated Union "Sum Type"? Denke an die Anzahl
> moeglicher Werte.
> **Kernpunkte:** Product = Multiplikation der Moeglichkeiten | Sum = Addition der Varianten | Beides zusammen = Algebraische Datentypen

---

## Vergleich: Haskell, Rust und TypeScript

Dasselbe Konzept, drei Sprachen:

### Haskell

```haskell
-- data = neuer Typ, | = ODER
data Shape = Circle Double
           | Rectangle Double Double
           | Triangle Double Double

area :: Shape -> Double
area (Circle r)      = pi * r * r
area (Rectangle w h) = w * h
area (Triangle b h)  = b * h / 2
```

### Rust

```rust
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
    Triangle { base: f64, height: f64 },
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
        Shape::Triangle { base, height } => base * height / 2.0,
    }
}
```

### TypeScript

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    case "triangle": return (shape.base * shape.height) / 2;
  }
}
```

**Alle drei drucken dasselbe Konzept aus.** TypeScript braucht dafuer
kein spezielles Keyword — es nutzt Union Types, Literal Types und
Control Flow Analysis, die du bereits kennst.

---

## Das Option-Pattern: Some / None

Eines der wichtigsten ADT-Patterns: **Option** (auch: Maybe in Haskell)
repraesentiert einen Wert, der da sein kann oder nicht.

### Das Problem mit null/undefined

```typescript annotated
// Klassisch — null/undefined sind unsichtbare Fallstricke:
function findUser(id: string): User | null {
  // ...
}

const user = findUser("123");
// user.name; // Runtime Error wenn null!
// Man MUSS pruefen, vergisst es aber leicht.
```

### Die ADT-Loesung: Option<T>

```typescript annotated
type Option<T> =
  | { tag: "some"; value: T }
  | { tag: "none" };

// Konstruktor-Funktionen:
function some<T>(value: T): Option<T> {
  return { tag: "some", value };
}

function none<T>(): Option<T> {
  return { tag: "none" };
}

// Verwendung:
function findUser(id: string): Option<User> {
  const user = database.get(id);
  return user ? some(user) : none();
}

const result = findUser("123");

// TypeScript ERZWINGT die Pruefung:
if (result.tag === "some") {
  console.log(result.value.name); // Sicher!
} else {
  console.log("Benutzer nicht gefunden");
}
```

> **Vorteil gegenueber null:** Du kannst `result.value` nicht aufrufen,
> ohne vorher den Tag zu pruefen. Der Compiler erzwingt die Behandlung
> beider Faelle.

---

## Das Result-Pattern: Ok / Err

Noch maechtiger: **Result** (in Rust das Standardpattern) repraesentiert
eine Operation, die erfolgreich sein kann oder fehlschlagen:

```typescript annotated
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Konstruktor-Funktionen:
function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Anwendung: Parsen ohne Exceptions
function parseAge(input: string): Result<number, string> {
  const age = parseInt(input, 10);

  if (isNaN(age)) {
    return err(`"${input}" ist keine gueltige Zahl`);
  }
  if (age < 0 || age > 150) {
    return err(`Alter ${age} ist nicht realistisch`);
  }

  return ok(age);
}

// Verwendung:
const result = parseAge("abc");

if (result.ok) {
  console.log(`Alter: ${result.value}`);  // Typ: number
} else {
  console.log(`Fehler: ${result.error}`); // Typ: string
}
```

### Warum Result statt try/catch?

| Aspekt | try/catch | Result<T, E> |
|--------|-----------|--------------|
| Sichtbarkeit | Error ist unsichtbar in der Signatur | Error ist Teil des Typs |
| Erzwungene Behandlung | Nein — catch ist optional | Ja — Compiler erzwingt Pruefung |
| Typsicherheit | Error ist `unknown` im catch | Error hat konkreten Typ E |
| Komposition | Schwer zu verketten | Map/flatMap-Ketten moeglich |

> **Wichtig:** Result ersetzt NICHT alle Exceptions. Fuer
> unerwartete Programmierfehler (Bugs) sind Exceptions richtig.
> Result ist fuer **erwartbare Fehlerfaelle** — Validierung,
> Parsing, Netzwerk-Timeouts.

---

## Utility-Funktionen fuer Result

In der Praxis schreibt man Hilfsfunktionen, um Result-Werte
elegant zu verarbeiten:

```typescript annotated
// map: Transformiere den Erfolgs-Wert
function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

// Verwendung:
const ageResult = parseAge("25");
const doubledAge = mapResult(ageResult, age => age * 2);
// Result<number, string> — Fehler wird durchgereicht!
```

> **Experiment:** Probiere das Result-Pattern direkt aus — ohne externe Bibliothek, alles inline:
>
> ```typescript
> type Result<T, E> =
>   | { ok: true; value: T }
>   | { ok: false; error: E };
>
> function divide(a: number, b: number): Result<number, string> {
>   if (b === 0) return { ok: false, error: "Division durch null!" };
>   return { ok: true, value: a / b };
> }
>
> const result = divide(10, 0);
>
> // Versuche: result.value ohne if-Pruefung zu verwenden.
> // Was sagt TypeScript?
> if (result.ok) {
>   console.log(result.value); // Hier sicher!
> } else {
>   console.log(result.error); // Hier sicher!
> }
> ```
>
> Versuche nun `divide(10, 2)` und `divide(10, 0)` — was wird jeweils ausgegeben? Was waere mit einem `try/catch`-Ansatz anders?

---

**In deinem Angular-Projekt:** Das Result-Pattern eignet sich hervorragend fuer HTTP-Calls. Statt try/catch in jedem Component kannst du einen zentralen Service schreiben, der `Result<T, ApiError>` zurueckgibt:

```typescript
type ApiError =
  | { kind: "network"; message: string }
  | { kind: "unauthorized" }
  | { kind: "not_found"; resource: string }
  | { kind: "server_error"; statusCode: number };

@Injectable({ providedIn: 'root' })
class ApiService {
  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<Result<User, ApiError>> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      map(user => ({ ok: true as const, value: user })),
      catchError(err => {
        if (err.status === 401) return of({ ok: false as const, error: { kind: "unauthorized" as const } });
        if (err.status === 404) return of({ ok: false as const, error: { kind: "not_found" as const, resource: "User" } });
        return of({ ok: false as const, error: { kind: "server_error" as const, statusCode: err.status } });
      })
    );
  }
}

// Im Component: kein try/catch, kein isError-Boolean — klare Fallunterscheidung:
this.apiService.getUser("123").subscribe(result => {
  if (result.ok) {
    this.user = result.value; // User
  } else if (result.error.kind === "unauthorized") {
    this.router.navigate(['/login']);
  } else {
    this.errorMessage = `Fehler: ${result.error.kind}`;
  }
});
```

**In React:** Dasselbe Pattern funktioniert in einem `useQuery`-aehnlichen Hook — der Rueckgabewert ist `Result<T, ApiError>` statt die ueblichen `{ data, error, isLoading }`-Properties.

---

## Was du gelernt hast

- **Algebraische Datentypen (ADTs)** kommen aus ML (1973) und durchziehen Haskell, Rust und TypeScript — ein jahrzehnteraltes, bewaehrtes Konzept
- **Product Types** (Interfaces/Objects) kombinieren Werte mit UND — alle Felder sind gleichzeitig vorhanden
- **Sum Types** (Discriminated Unions) kombinieren Varianten mit ODER — genau eine ist aktiv
- Das **Option-Pattern** (`Some<T> | None`) ersetzt `null`/`undefined` typsicher und erzwingt die Behandlung beider Faelle
- Das **Result-Pattern** (`Ok<T> | Err<E>`) macht Fehlerfaelle sichtbar in der Typsignatur — kein verstecktes `throw` mehr

**Kernkonzept:** Sum Types machen das Unmoegliche unrepresentierbar — wenn eine Funktion `Result<T, E>` zurueckgibt, ist der Fehlerfall nicht mehr versteckt oder optional, sondern ein expliziter Teil des Typs.

---

> **Pausenpunkt:** Du verstehst jetzt die theoretischen Grundlagen
> und zwei der wichtigsten ADT-Patterns. In der naechsten Sektion
> wenden wir das auf einen der haeufigsten Praxisfaelle an:
> Zustandsmodellierung mit Loading/Error/Success.
>
> Weiter: [Sektion 04 - Zustandsmodellierung](./04-zustandsmodellierung.md)
