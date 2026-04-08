# Sektion 4: Option und Result Pattern

> Geschaetzte Lesezeit: **12 Minuten**
>
> Vorherige Sektion: [03 - Algebraische Datentypen](./03-algebraische-datentypen.md)
> Naechste Sektion: [05 - Zustandsmodellierung](./05-zustandsmodellierung.md)

---

## Was du hier lernst

- Das **Option-Pattern** (Some/None) als typsichere null-Alternative
- Das **Result-Pattern** (Ok/Err) fuer elegante Fehlerbehandlung
- Utility-Funktionen fuer Result-Werte (map)
- Warum Option/Result besser sind als `null` und `try/catch`

---

## Historischer Hintergrund: Woher kommen Option und Result?

Bevor wir in die Details einsteigen, ein kurzer Blick zurueck — denn diese
Pattern sind keine neue Erfindung, sondern haben eine lange Geschichte.

Das **Option-Pattern** stammt urspruenglich aus der funktionalen
Programmiersprache **ML** (Meta Language, 1973), wo es als `datatype 'a option
= SOME of 'a | NONE` definiert wurde. Von dort wanderte es nach **Haskell**
(`Maybe`), **OCaml**, **F#**, und schliesslich in moderne Sprachen wie
**Rust** (`Option<T>`), **Swift** (`Optional<T>`), und **Kotlin** (nullable
Types). Sogar **Java** zog mit `Optional<T>` in Version 8 nach — allerdings
nur als Wrapper, nicht als echter ADT.

Das **Result-Pattern** wurde durch **Rust** populär gemacht, wo es der
standardmaessige Weg fuer Fehlerbehandlung ist. Aber die Idee ist aelter:
Eithers in **Haskell** (`Either e a`), `Validation` in **Scala** (cats),
und `Expected` in C++ (seit C++23) folgen alle demselben Grundprinzip:
**Mache den Fehlerfall zu einem erstklassigen, sichtbaren Wert.**

> **Selbst-Erklärung:** Warum haben so viele Sprachen dieses Pattern
> unabhaengig voneinander uebernommen? Was sagt das ueber den
> Wert des Patterns aus?
>
> **Kernel-Punkt:** Weil null/try-catch grundlegend *unsichtbar* machen,
> was im Code passieren kann. Option/Result machen es *sichtbar*.

---

## Das Option-Pattern: Some / None

Eines der wichtigsten ADT-Patterns: **Option** (auch: Maybe in Haskell)
repraesentiert einen Wert, der da sein kann oder nicht.

### Drei Analogien fuer Option<T>

Stell dir Option wie eine **verschlossene Schatztruhe** vor: Sie kann einen
Schatz enthalten (`some`) oder leer sein (`none`). Der Clou: Du musst die
Truhe erst oeffnen (den Tag pruefen), bevor du an den Inhalt kommst. Du
kannst nicht einfach hineingreifen und hoffen, dass etwas drin ist.

Oder denk an eine **Suchmaschine**: Wenn du nach etwas suchst, bekommst du
entweder ein Ergebnis (`some`) oder die Meldung "Keine Ergebnisse gefunden"
(`none`). Beides sind gueltige Antworten — keine von beiden ist ein "Fehler".

Eine dritte Analogie: Option ist wie ein **Briefumschlag**. Der Umschlag
hat eine klare Aussenseite (den Tag), die dir sagt, ob ein Brief drin ist.
Du kannst den Brief nicht lesen, ohne den Umschlag zu oeffnen. Bei null
hingegen bekommst du einfach gar nichts — und wenn du trotzdem liest,
knallt es.

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

> **Denkfrage:** Tony Hoare, der Erfinder von null, nannte es seinen
> "billion-dollar mistake". Was glaubst du, meinte er damit?
>
> *(Denkzeit: ~15 Sekunden)*
>
> **Aufloesung:** Nicht dass null an sich schlecht ist — sondern dass
> die summierten Kosten aller null-pointer Bugs in der Geschichte der
> Softwareentwicklung sich auf etwa eine Milliarde Dollar belaufen.
> Jeder Entwickler vergisst gelegentlich die null-Pruefung.

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

### Zeile-fuer-Zeile-Erklaerung des Option-Codes

Schauen wir uns die Schluesselstellen genau an:

```typescript
// Zeile 1-3: Option ist ein discriminated union mit zwei Varianten
type Option<T> =
  | { tag: "some"; value: T }   // Fall 1: Wert vorhanden, T wird mitgeliefert
  | { tag: "none" };             // Fall 2: Kein Wert, keine Daten
// Der Discriminator "tag" ermoeglicht dem Compiler, den Typ einzugrenzen.
// Innerhalb von if(result.tag === "some") weiss TypeScript: result.value existiert.

// Zeile 6-9: some() ist ein smarter Konstruktor — er verpackt einen Wert
function some<T>(value: T): Option<T> {
  return { tag: "some", value };
}
// Der generische Typ T wird automatisch inferiert: some(42) ergibt Option<number>

// Zeile 11-13: none() gibt die leere Variante zurueck
function none<T>(): Option<T> {
  return { tag: "none" };
}
// T wird hier nicht benoetigt — none() ist fuer jeden Typ gueltig.

// Zeile 16-19: findUser gibt Option<User> zurueck — die Signatur
// verrat dir sofort: "Diese Funktion kann scheitern!"
function findUser(id: string): Option<User> {
  const user = database.get(id);
  return user ? some(user) : none();
}
// Bei null/undefined wuerde die Signatur User | null lauten —
// das "oder null" wird leicht uebersehen. Option ist expliziter.
```

> **Selbst-Erklärung:** Warum ist `Option<User>` informativer als
> `User | null`? Erklaere es laut, als wuerdest du es einem
> Junior-Developer erklaeren.
>
> **Kernel-Punkt:** `Option<User>` ist ein bewusster, benannter Typ.
> `User | null` ist ein Union, der aussieht wie ein Detail. Option
> kommuniziert *Absicht*: "Hier kann etwas fehlen, und das ist okay."
> Null kommuniziert gar nichts — es ist ein technisches Detail, kein
> semantisches Konzept.

> **Experiment:** Erstelle eine `firstElement`-Funktion fuer Arrays:
>
> ```typescript
> type Option<T> =
>   | { tag: "some"; value: T }
>   | { tag: "none" };
>
> function firstElement<T>(arr: T[]): Option<T> {
>   if (arr.length === 0) return { tag: "none" };
>   return { tag: "some", value: arr[0] };
> }
>
> // Teste mit leerem und vollem Array:
> const empty = firstElement([]);
> const full = firstElement(["Hallo", "Welt"]);
>
> // Was zeigt TypeScript bei empty.tag und full.tag?
> // Was bei empty.value (Fehler!) vs. full.value (nach Pruefung)?
> ```

---

## Das Result-Pattern: Ok / Err

Noch maechtiger: **Result** (in Rust das Standardpattern) repraesentiert
eine Operation, die erfolgreich sein kann oder fehlschlagen:

### Drei Analogien fuer Result<T, E>

Result ist wie eine **Paketlieferung**: Entweder kommt das Paket an (`ok`)
oder es geht verloren (`err`) — aber in beiden Faelle bekommst du eine
Nachricht. Bei try/catch wuerde das Paket einfach verschwinden, und du
wuerdest es erst merken, wenn du ins leere Regal schaust.

Result ist wie ein **Arztbesuch**: Der Arzt gibt dir entweder eine gute
Nachricht (`ok: gesund`) oder eine Diagnose (`err: konkrete Krankheit`).
Beides sind strukturierte Informationen — kein abstrakter "Fehler".

Result ist wie ein **Vending-Automat**: Du wirfst Geld ein und bekommst
entweder dein Getraenk (`ok`) oder eine Fehlermeldung mit Rueckgabe
(`err: "Automat leer"`). Der Automat *kommuniziert* das Ergebnis, er
explodiert nicht einfach.

### Warum Result statt try/catch? — Die tiefere Erklaerung

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

### Warum Option/Result besser sind als null/try-catch — im Detail

**1. Komposition:** Result-Werte lassen sich verketten. Du kannst
`map`, `flatMap`, und `andThen` schreiben, um Result-Operationen
zu einer Pipeline zu verbinden. Bei try/catch musst du jede Operation
in einen eigenen try-Block packen:

```typescript
// Result-Pipeline — Fehler werden automatisch durchgereicht:
const result = parseAge("25")
  .pipe(age => multiply(age, 2))
  .pipe(age => checkLegal(age));
// Ein Fehler an ANY Stelle bricht die Pipeline sauber ab.

// try/catch — jede Stufe braucht eigene Behandlung:
try {
  const age = parseAgeRaw("25");  // could throw
  try {
    const doubled = multiplyRaw(age, 2);
    try {
      const legal = checkLegalRaw(doubled);
    } catch (e) { /* legal check failed */ }
  } catch (e) { /* multiply failed */ }
} catch (e) { /* parse failed */ }
```

**2. Sichtbarkeit:** Die Signatur `Result<T, E>` sagt dir sofort,
welche Fehler auftreten koennen. Bei `try/catch` musst du die
Implementierung lesen — oder raten.

**3. Explizitheit:** `Option<User>` und `Result<T, ApiError>` sind
*benannte Absichten*. `null` und `throw` sind *technische Mechanismen*.
Guter Code kommuniziert Absicht, nicht nur Mechanik.

> **Denkfrage:** Wann wuerdest du `Option` verwenden und wann `Result`?
> Gibt es Faelle, wo beide passen?
>
> *(Denkzeit: ~20 Sekunden)*
>
> **Aufloesung:** `Option` sagt "Wert da oder nicht" — ohne Grund.
> `Result` sagt "Erfolg ODER Fehler MIT Grund". Wenn du nur wissen
> willst *ob* etwas existiert: Option. Wenn du wissen willst *warum*
> etwas schiefging: Result. Ein `findUser` braucht Option (entweder
> gefunden oder nicht). Ein `parseAge` braucht Result (falsches Format,
> ungueltiger Wert, etc.).

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

> **Experiment:** Probiere das Result-Pattern direkt aus:
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
> if (result.ok) {
>   console.log(result.value);
> } else {
>   console.log(result.error);
> }
> ```
>
> Versuche `divide(10, 2)` und `divide(10, 0)` — was wird jeweils ausgegeben?

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
  getUser(id: string): Observable<Result<User, ApiError>> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      map(user => ({ ok: true as const, value: user })),
      catchError(err => {
        if (err.status === 401) return of({ ok: false as const, error: { kind: "unauthorized" as const } });
        return of({ ok: false as const, error: { kind: "server_error" as const, statusCode: err.status } });
      })
    );
  }
}

// Im Component: klare Fallunterscheidung ohne try/catch:
this.apiService.getUser("123").subscribe(result => {
  if (result.ok) {
    this.user = result.value;
  } else if (result.error.kind === "unauthorized") {
    this.router.navigate(['/login']);
  }
});
```

**In React:** Dasselbe Pattern in einem `useQuery`-Hook — `Result<T, ApiError>` statt `{ data, error, isLoading }`.

**In RxJS:** Der `materialize`-Operator wandelt Observable-Events in
strukturierte Notifications — das Result-Pattern fuer Streams.

---

## Was du gelernt hast

- Das **Option-Pattern** (`Some<T> | None`) ersetzt `null`/`undefined` typsicher und erzwingt die Behandlung beider Faelle
- Das **Result-Pattern** (`Ok<T> | Err<E>`) macht Fehlerfaelle sichtbar in der Typsignatur — kein verstecktes `throw` mehr
- **Utility-Funktionen** wie `mapResult` ermoeglichen elegante Transformation des Erfolgs-Werts, waehrend Fehler automatisch durchgereicht werden
- Result ist fuer **erwartbare Fehlerfaelle** (Validierung, Parsing, Timeouts), Exceptions bleiben fuer unerwartete Bugs zustaendig

**Kernkonzept:** Option und Result machen das Unmoegliche unrepresentierbar — wenn eine Funktion `Result<T, E>` zurueckgibt, ist der Fehlerfall nicht mehr versteckt oder optional, sondern ein expliziter Teil des Typs.

---

> **Pausenpunkt:** Du kennst jetzt zwei der wichtigsten ADT-Patterns.
> In der naechsten Sektion wenden wir das auf einen der haeufigsten
> Praxisfaelle an: Zustandsmodellierung mit Loading/Error/Success.
>
> Weiter: [Sektion 05 - Zustandsmodellierung](./05-zustandsmodellierung.md)
