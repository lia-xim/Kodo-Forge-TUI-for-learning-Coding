# Sektion 3: Operator-Typen — map, filter, switchMap und Geschwister

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Observable, Subject, BehaviorSubject](./02-observable-subject-behaviorsubject.md)
> Naechste Sektion: [04 - Kombinations-Operatoren](./04-kombinations-operatoren-typen.md)

---

## Was du hier lernst

- Wie TypeScript die Typ-Signaturen von `map`, `filter`, `switchMap` und Geschwistern liest
- Warum `filter` ohne Type Predicate den Typ **nicht veraendert** — und wie Type Predicates das aendern
- Den Unterschied zwischen `switchMap`, `mergeMap`, `concatMap` und `exhaustMap` aus TypeScript-Sicht
- Das `OperatorFunction<T, R>`-Interface als einheitliches Konzept

---

## OperatorFunction\<T, R\> — Das Rueckgrat aller Operatoren

Bevor wir einzelne Operatoren betrachten, muessen wir das Typsystem verstehen das
alle verbindet. Jeder pipeable Operator in RxJS gibt ein `OperatorFunction<T, R>` zurueck:

```typescript
// Die Kern-Typen fuer Operatoren (vereinfacht aus RxJS-Sourcecode):
type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;
//   ^ Nimmt ein Observable<T> und gibt ein Observable<R> zurueck

// pipe() akzeptiert eine Kette von OperatorFunctions:
// Wenn A → B → C: OperatorFunction<A, B> dann OperatorFunction<B, C>
// TypeScript prueft, ob B kompatibel ist!
```

Das bedeutet: Jedes Mal wenn du Operatoren in `.pipe(...)` schreibst, prueft TypeScript
ob der Ausgabetyp des vorherigen Operators mit dem Eingabetyp des naechsten kompatibel ist.
Eine falsch typisierte Pipeline ist ein **Compile-Fehler**, kein Laufzeitproblem.

> 📖 **Origin Story: Warum pipeable Operators erst in RxJS 5.5 kamen**
>
> In RxJS 4 und frueh in RxJS 5 waren Operatoren direkt auf dem Observable-Prototyp:
> `observable.map(fn).filter(fn).subscribe(fn)`. Das hatte ein grosses Problem:
> **Tree-Shaking funktionierte nicht**. Wenn du `map` importiertest, landete
> der gesamte Operator-Code im Bundle, auch wenn du 50 andere Operatoren nie benutzt hast.
>
> Ben Lesh (damaliger RxJS-Lead) und das Team entwickelten 2017 die "lettable operators"
> (spaeter "pipeable operators"): Statt Methoden auf dem Objekt sind es jetzt freie Funktionen.
> Die Typsignatur `OperatorFunction<T, R>` war eine direkte Konsequenz — jetzt konnte
> TypeScript jeden Schritt in der Pipe einzeln pruefen.

---

## map — T transformieren

```typescript annotated
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// map-Signatur: map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>
// TypeScript inferiert T aus dem vorherigen Observable und R aus der project-Funktion

const users$: Observable<User[]> = this.http.get<User[]>('/api/users');

// T = User[], R = string[] — TypeScript inferiert R aus dem Rueckgabetyp von map-Funktion
const names$: Observable<string[]> = users$.pipe(
  map(users => users.map(u => u.name))
  // ^ TypeScript: T=User[], project returns string[], also R=string[]
);

// Verschachtelte Transformation — TypeScript verfolgt jeden Schritt
const emailDomains$ = users$.pipe(
  map(users => users.filter(u => u.isActive)),
  // ^ Still Observable<User[]>
  map(users => users.map(u => u.email)),
  // ^ Now Observable<string[]>
  map(emails => emails.map(e => e.split('@')[1]))
  // ^ Now Observable<string[]> (the domain parts)
);
// emailDomains$: Observable<string[]>

// Objekt-Transformation — TypeScript inferiert den gemappten Objekt-Typ
const userSummary$ = users$.pipe(
  map(users => users.map(u => ({
    id: u.id,
    displayName: `${u.firstName} ${u.lastName}`,
    // Typ: { id: string; displayName: string }
  })))
);
// userSummary$: Observable<{ id: string; displayName: string }[]>
// TypeScript inferiert das Objekt-Literal als Typ — kein Interface noetig!
```

---

## filter — T behalten (mit und ohne Type Predicate)

Hier wird es interessant. `filter` veraendert normalerweise den Typ **nicht**:

```typescript annotated
import { filter } from 'rxjs/operators';

// Standard filter — Typ bleibt T
const activeUsers$: Observable<User[]> = users$.pipe(
  map(users => users.filter(u => u.isActive))
  // ^ users.filter() gibt User[] zurueck, kein Typ-Narrowing hier
);

// ABER: Mit RxJS filter (nicht Array.filter) auf einem Observable<User>:
const singleUsers$: Observable<User> = from(someUserArray);

const activeOnly$: Observable<User> = singleUsers$.pipe(
  filter(user => user.isActive)
  // ^ Typ bleibt Observable<User> — filter ohne Type Predicate aendert T nicht
);

// Mit Type Predicate: Typ wird GENARROWT!
// TypeScript 5.5+ Inferred Type Predicates koennen das manchmal automatisch,
// aber explizit ist klarer:
interface Admin extends User {
  adminSince: Date;
  permissions: string[];
}

function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}

const adminsOnly$: Observable<Admin> = singleUsers$.pipe(
  filter(isAdmin)
  // ^ TypeScript narrowt den Typ: Observable<User> → Observable<Admin>
  // Das ist moeglich weil isAdmin ein Type Predicate (user is Admin) hat!
);

// Inline Type Predicate — dasselbe wie oben, inline geschrieben
const adminsInline$ = singleUsers$.pipe(
  filter((user): user is Admin => user.role === 'admin')
  // ^ Explizites Type Predicate — TypeScript narrowt zu Observable<Admin>
);
```

> 🧠 **Erklaere dir selbst:** Warum aendert `filter(user => user.isActive)` den Typ NICHT,
> aber `filter((user): user is Admin => user.role === 'admin')` schon?
> Was ist der Unterschied zwischen einem normalen Praedikat und einem Type Predicate?
> **Kernpunkte:** Normales Praedikat: Rueckgabe boolean — TypeScript weiss nur "gefiltert oder nicht" |
> Type Predicate: Rueckgabe `value is T` — TypeScript weiss "wenn true, dann ist value vom Typ T" |
> RxJS verwendet die TypeScript-Signatur von filter: `filter(predicate: (v: T) => v is S)` gibt `OperatorFunction<T, S>` | Ohne Predicate: `filter(predicate: (v: T) => boolean)` gibt `OperatorFunction<T, T>`

---

## switchMap, mergeMap, concatMap, exhaustMap — Das Quartett

Diese vier Operatoren machen alle dasselbe auf Typ-Ebene: `T → Observable<R>`.
Der Unterschied liegt im Verhalten bei mehrfachen Emissions — aber TypeScript sieht
nur die Typ-Transformation:

```typescript annotated
import { switchMap, mergeMap, concatMap, exhaustMap } from 'rxjs/operators';

const userId$ = new Subject<string>();

// switchMap: Bei neuem T wird altes Observable ABGEBROCHEN
// Signatur: switchMap<T, R>(fn: (value: T) => ObservableInput<R>): OperatorFunction<T, R>
const userDetails$: Observable<UserDetails> = userId$.pipe(
  switchMap(id => this.userService.getUser(id))
  // ^ T=string, fn gibt Observable<UserDetails>, also R=UserDetails
  // Wenn schnell zwei IDs kommen, wird der erste HTTP-Request abgebrochen
);
// Perfekt fuer: Suche (Autocomplete), Navigation, Last-wins Semantik

// mergeMap: Alle Observables laufen PARALLEL
const allUserDetails$ = userIds$.pipe(
  mergeMap(id => this.userService.getUser(id))
  // ^ Typ identisch: Observable<UserDetails>
  // Alle HTTP-Requests laufen gleichzeitig — Reihenfolge nicht garantiert
);
// Perfekt fuer: Parallele unabhaengige Requests, Fire-and-forget

// concatMap: Observables laufen SEQUENZIELL (warten aufeinander)
const sequentialDetails$ = userIds$.pipe(
  concatMap(id => this.userService.getUser(id))
  // ^ Typ identisch: Observable<UserDetails>
  // Request 2 wartet bis Request 1 fertig ist
);
// Perfekt fuer: Reihenfolge wichtig, z.B. Formulare nacheinander speichern

// exhaustMap: Waehrend laufendem Observable werden neue T-Werte IGNORIERT
const nonConcurrentLogin$ = loginButton$.pipe(
  exhaustMap(() => this.authService.login())
  // ^ T=Event, R=LoginResponse: Observable<LoginResponse>
  // Waehrend Login laeuft, werden weitere Button-Clicks ignoriert
);
// Perfekt fuer: Doppelt-Klick-Schutz, Rate-limiting
```

> 💭 **Denkfrage:** Alle vier Operatoren haben dieselbe TypeScript-Signatur (`T → Observable<R>`).
> Warum schreibst du trotzdem selten generische Funktionen die alle vier unterstuetzen?
> Was fehlt dem Typsystem hier, um das Verhalten zu beschreiben?
>
> **Antwort:** TypeScript beschreibt **Was**, nicht **Wann** oder **Wie**. Die Typ-Signatur
> sagt: "Du bekommst R-Werte". Aber sie sagt nicht: "alte R-Werte werden abgebrochen"
> oder "R-Werte kommen sequenziell". Das Verhalten (Concurrency-Strategie) ist ein
> Laufzeit-Konzept, kein Typ-Konzept. Typen beschreiben die Form der Daten, nicht
> die zeitliche Beziehung zwischen Werten.

---

## Experiment-Box: Typ-Fehler in Pipelines bewusst ausloesen

Schreibe folgende Pipeline und beobachte wie TypeScript Fehler meldet:

```typescript
import { of } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';

interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

const orderId$ = of('order-1', 'order-2');

const result$ = orderId$.pipe(
  // Schritt 1: string -> Observable<Order> (HTTP-Simulation)
  switchMap(id => of<Order>({ id, userId: 'user-1', total: 99.99, status: 'pending' })),
  // Typ jetzt: Observable<Order>

  // Schritt 2: Nur 'completed' Orders (Type Predicate macht den Unterschied)
  filter((order): order is Order & { status: 'completed' } => order.status === 'completed'),
  // Typ jetzt: Observable<Order & { status: 'completed' }>

  // Schritt 3: Nur das Total extrahieren
  map(order => order.total),
  // Typ jetzt: Observable<number>

  // Jetzt ABSICHTLICH einen Fehler einbauen — entfernen Sie den Kommentar:
  // map(total => total.toUpperCase()),
  // ^ FEHLER: Property 'toUpperCase' does not exist on type 'number'
  // TypeScript weiss: total ist number, nicht string!
);

// result$: Observable<number>
```

Entferne den Kommentar vor `map(total => total.toUpperCase())` und beobachte den
Compile-Fehler. Das ist der Wert von getypten Pipelines: Der Fehler passiert im Editor,
nicht in der Produktion.

---

## Angular-Bezug: switchMap in HTTP-Requests

Das klassische Angular-Pattern: User tippt, wir suchen:

```typescript annotated
@Component({ template: `<input (input)="search($event.target.value)">` })
export class SearchComponent {
  private searchTerm$ = new Subject<string>();

  // Das Ergebnis ist Observable<SearchResult[]> — TypeScript kennt den Typ
  readonly results$ = this.searchTerm$.pipe(
    debounceTime(300),
    // ^ Typ bleibt: Observable<string>
    distinctUntilChanged(),
    // ^ Typ bleibt: Observable<string> (emittiert nur bei Aenderung)
    filter(term => term.length >= 2),
    // ^ Typ bleibt: Observable<string> (kein Type Predicate noetig)
    switchMap(term =>
      this.http.get<SearchResult[]>(`/api/search?q=${term}`)
      // ^ T=string, R=SearchResult[] aus get<SearchResult[]>
    )
    // Ergebnis: Observable<SearchResult[]>
    // switchMap bricht den alten Request ab wenn ein neuer Term kommt
  );

  search(term: string): void {
    this.searchTerm$.next(term);  // string — TypeScript prueft den Typ
  }
}
```

> ⚡ **Praxis-Tipp:** In deinem Angular-Alltag gilt: Bei HTTP-Requests, die durch User-Aktionen
> ausgeloest werden, ist `switchMap` fast immer richtig (Suche, Navigation). Bei
> Fire-and-forget-Aktionen (Analytics-Events senden) ist `mergeMap` passender.
> `exhaustMap` bei Formularen die mehrfaches Absenden verhindern sollen.

---

## Was du gelernt hast

- `OperatorFunction<T, R>` verbindet alle pipeablen Operatoren: Eine Funktion von `Observable<T>` zu `Observable<R>`
- `map<T, R>` transformiert T zu R — TypeScript inferiert R aus der Mapping-Funktion automatisch
- `filter` ohne Type Predicate: Typ bleibt T. Mit `(v): v is S` Type Predicate: Typ wird zu S genarrowt
- `switchMap` / `mergeMap` / `concatMap` / `exhaustMap`: Alle haben dieselbe Typ-Signatur `T → Observable<R>`, unterscheiden sich nur in der Concurrency-Strategie (nicht auf Typ-Ebene sichtbar)
- Eine falsch verkettete Pipeline ist ein **Compile-Fehler** — TypeScript prueft die Kompatibilitaet zwischen Operatoren

**Kernkonzept:** Type Predicates in `filter` sind eines der maechtigsten Werkzeuge in
RxJS+TypeScript. Sie konvertieren ein `Observable<Animal>` in `Observable<Cat>` ohne
Runtime-Overhead — alles passiert zur Compilezeit.

> 🧠 **Erklaere dir selbst:** Dein Observable emittiert `string | null`. Du willst nur
> die `string`-Werte weiterverarbeiten. Wie schreibst du den `filter`-Aufruf damit
> TypeScript den `null`-Typ herausfiltert? Was ist der Typ danach?
> **Kernpunkte:** `filter((v): v is string => v !== null)` | Type Predicate `v is string` |
> Typ nach filter: `Observable<string>` (null ist herausgefiltert) |
> Alternative ohne Predicate: `filter(v => v !== null)` gibt `Observable<string | null>` —
> TypeScript weiss nicht dass null nie vorkommt

---

> **Pausenpunkt** — Die einzelnen Operatoren verstehst du jetzt aus TypeScript-Sicht.
> Im naechsten Kapitel schauen wir uns an, was passiert wenn mehrere Observables
> kombiniert werden — und wie TypeScript die kombinierten Typen inferiert.
>
> Weiter geht es mit: [Sektion 04: Kombinations-Operatoren](./04-kombinations-operatoren-typen.md)
