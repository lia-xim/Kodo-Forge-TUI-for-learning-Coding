# Sektion 2: Das State Machine Pattern

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Builder Pattern](./01-builder-pattern.md)
> Naechste Sektion: [03 - Phantom Types](./03-phantom-types.md)

---

## Was du hier lernst

- Wie man **Zustandsmaschinen** im TypeScript-Typsystem abbildet
- Warum **unmoegliche Zustandsuebergaenge** zur Compilezeit verhindert werden koennen
- Den Unterschied zwischen **runtime** und **compile-time** State Machines
- Wie **Discriminated Unions** und **Methoden-Overloads** State Machines typsicher machen

---

## Hintergrund: State Machines ueberall

> **Feature Origin Story: Finite State Machines**
>
> Finite State Machines (FSMs) wurden 1943 von Warren McCulloch und
> Walter Pitts formalisiert — urspruenglich als Modell fuer neuronale
> Netze. Spaeter wurden sie zum Standardwerkzeug in der Informatik:
> Compiler, Netzwerkprotokolle, UI-Logik.
>
> In der Frontend-Entwicklung erlebten FSMs ein Revival durch Bibliotheken
> wie XState (2018, David Khourshid). Die Erkenntnis: Die meisten Bugs
> in UI-Code entstehen durch **unmoegliche Zustaende** — ein Formular
> das gleichzeitig "loading" und "error" ist, ein Modal das "open" und
> "closing" zugleich anzeigt.
>
> TypeScript kann solche unmoeglichen Zustaende **zur Compilezeit
> verbieten**. Das ist maechtig — und in kaum einer anderen Mainstream-
> Sprache so elegant moeglich.

---

## Das Problem: Boolean-Flags und unmoegliche Zustaende

```typescript annotated
// ANTI-PATTERN: Zustand als Boolean-Flags
interface FetchState {
  isLoading: boolean;
  isError: boolean;
  data: User[] | null;
  error: string | null;
}

// Problem: Unmoegliche Kombinationen sind erlaubt!
const broken: FetchState = {
  isLoading: true,   // Laden...
  isError: true,     // ...und gleichzeitig Fehler?
  data: [],          // ...und gleichzeitig Daten?
  error: "Timeout",  // Alles gleichzeitig — macht keinen Sinn!
};
// ^ TypeScript beschwert sich NICHT. Alle boolean-Kombinationen sind gueltig.
```

> 🧠 **Erklaere dir selbst:** Wie viele moegliche Kombinationen haben
> 4 Boolean-Flags? Wie viele davon sind sinnvolle Zustaende?
>
> **Kernpunkte:** 4 Booleans = 2^4 = 16 Kombinationen | Sinnvolle
> Zustaende: idle, loading, success, error = 4 | 12 von 16 Kombinationen
> sind unmoegliche Zustaende | Das Typsystem erlaubt sie alle

---

## Loesung: Discriminated Union als State Machine

```typescript annotated
// BESSER: Jeder Zustand ist ein eigener Typ
type FetchState<T> =
  | { status: "idle" }
  // ^ Startzustand: nichts passiert
  | { status: "loading" }
  // ^ Request laeuft — keine Daten, kein Fehler
  | { status: "success"; data: T }
  // ^ Erfolg: data ist GARANTIERT vorhanden
  | { status: "error"; error: string; retryCount: number }
  // ^ Fehler: error ist GARANTIERT vorhanden, retryCount fuer Wiederholung

// Jetzt ist es UNMEGLICH gleichzeitig loading UND error zu sein:
const state: FetchState<User[]> = { status: "loading" };
// state.data  // COMPILE-ERROR: data existiert nicht bei status="loading"
// state.error // COMPILE-ERROR: error existiert nicht bei status="loading"

// TypeScript narrowt automatisch:
function render(state: FetchState<User[]>): string {
  switch (state.status) {
    case "idle":    return "Bereit";
    case "loading": return "Laden...";
    case "success": return `${state.data.length} User geladen`;
    // ^ TypeScript weiss: state.data existiert, weil status="success"
    case "error":   return `Fehler: ${state.error} (Versuch ${state.retryCount})`;
    // ^ TypeScript weiss: state.error und retryCount existieren
  }
}
```

> 💭 **Denkfrage:** Was ist der Unterschied zwischen einer Discriminated
> Union und einem enum fuer Zustaende? Warum ist die Union machtiger?
>
> **Antwort:** Ein enum kann nur den Zustandsnamen tragen. Eine
> Discriminated Union kann **zusaetzliche Daten pro Zustand** haben:
> "success" hat `data`, "error" hat `error`. Das enum muesste diese
> Daten separat speichern — ohne Typgarantie dass sie im richtigen
> Zustand vorhanden sind.

---

## Zustandsuebergaenge typsicher machen
<!-- section:summary -->
Die Discriminated Union verhindert unmoegliche Zustaende. Aber was ist

<!-- depth:standard -->
Die Discriminated Union verhindert unmoegliche Zustaende. Aber was ist
mit unmoeglichen **Uebergaengen**? Zum Beispiel: Von "idle" direkt
nach "success" springen (ohne "loading" dazwischen).

```typescript annotated
// Typ-Level Transition Map
type Transitions = {
  idle:    "loading";
  // ^ Von idle darf man nur nach loading
  loading: "success" | "error";
  // ^ Von loading nach success ODER error
  success: "idle";
  // ^ Von success zurueck zu idle
  error:   "loading" | "idle";
  // ^ Von error: retry (loading) oder reset (idle)
};

// Typsichere Transition-Funktion
function transition<Current extends keyof Transitions>(
  current: Current,
  next: Transitions[Current]
  // ^ 'next' ist auf die erlaubten Uebergaenge beschraenkt!
): Transitions[Current] {
  return next;
}

transition("idle", "loading");    // OK
transition("loading", "success"); // OK
transition("loading", "error");   // OK
// transition("idle", "success"); // COMPILE-ERROR!
// ^ Von idle nach success ist KEIN erlaubter Uebergang
// transition("success", "error"); // COMPILE-ERROR!
// ^ Von success nach error ist KEIN erlaubter Uebergang
```

<!-- depth:vollstaendig -->
> **Experiment:** Erweitere die Transitions um einen neuen Zustand
> "retrying". Ueberlege:
>
> ```typescript
> // 1. Von welchen Zustaenden darf man nach "retrying" wechseln?
> // 2. Wohin darf man von "retrying" wechseln?
> // 3. Wie aendert sich die Transitions-Map?
>
> type ExtendedTransitions = {
>   idle:     "loading";
>   loading:  "success" | "error";
>   success:  "idle";
>   error:    "retrying" | "idle";     // error -> retrying NEU
>   retrying: "success" | "error";     // retrying wie loading
> };
>
> // Pruefe: Kann man von "retrying" direkt nach "idle"?
> // Antwort: Nein — man muss durch success oder error.
> ```

---

<!-- /depth -->
## State Machine als Klasse mit Methoden-Guards
<!-- section:summary -->
Fuer komplexere State Machines kann man die erlaubten Methoden

<!-- depth:standard -->
Fuer komplexere State Machines kann man die erlaubten Methoden
pro Zustand einschraenken:

```typescript annotated
// Jeder Zustand hat eigene Methoden
interface IdleState {
  status: "idle";
  fetch(): LoadingState;
  // ^ Einzige erlaubte Aktion: fetch starten
}

interface LoadingState {
  status: "loading";
  resolve(data: User[]): SuccessState;
  // ^ Erfolg: Daten setzen
  reject(error: string): ErrorState;
  // ^ Fehler: Error setzen
  // Kein fetch()! Man kann nicht doppelt laden.
}

interface SuccessState {
  status: "success";
  data: User[];
  reset(): IdleState;
  // ^ Zurueck zum Start
}

interface ErrorState {
  status: "error";
  error: string;
  retry(): LoadingState;
  // ^ Nochmal versuchen
  reset(): IdleState;
  // ^ Aufgeben und zurueck
}

type AnyState = IdleState | LoadingState | SuccessState | ErrorState;
```

> ⚡ **In deinem Angular-Projekt** kennst du State Machines aus dem NgRx-Store:
>
> ```typescript
> // NgRx Reducer — im Prinzip eine State Machine:
> const reducer = createReducer(
>   initialState,
>   on(loadUsers, (state) => ({ ...state, status: 'loading' as const })),
>   on(loadUsersSuccess, (state, { users }) => ({
>     ...state, status: 'success' as const, data: users
>   })),
>   on(loadUsersFailure, (state, { error }) => ({
>     ...state, status: 'error' as const, error
>   })),
> );
> // ^ Die Discriminated Union macht den State typsicher.
> //   NgRx erzwingt aber nicht die Reihenfolge der Actions!
> ```
>
> In React nutzt man oft `useReducer` fuer das gleiche Pattern:
>
> ```typescript
> const [state, dispatch] = useReducer(fetchReducer, { status: "idle" });
> // dispatch({ type: "FETCH" }) → loading
> // dispatch({ type: "SUCCESS", data }) → success
> ```

---

<!-- /depth -->
## Praxis-Beispiel: Formular-Wizard
<!-- section:summary -->
Ein typischer Anwendungsfall: Ein mehrstufiges Formular, bei dem

<!-- depth:standard -->
Ein typischer Anwendungsfall: Ein mehrstufiges Formular, bei dem
jeder Schritt bestimmte Aktionen erlaubt:

```typescript
type WizardState =
  | { step: "personal"; name: string; email: string }
  | { step: "address"; address: string; city: string }
  | { step: "payment"; cardNumber: string }
  | { step: "review"; allData: CompleteFormData }
  | { step: "submitted"; confirmationId: string };

type WizardTransitions = {
  personal: "address";
  address:  "payment" | "personal"; // zurueck erlaubt
  payment:  "review" | "address";   // zurueck erlaubt
  review:   "submitted" | "payment"; // zurueck erlaubt
  submitted: never; // Endstation — kein Uebergang moeglich
};
```

---

<!-- /depth -->
## Was du gelernt hast

- **Boolean-Flags** fuer Zustaende erzeugen unmoegliche Kombinationen (2^n Zustaende statt n)
- **Discriminated Unions** modellieren jeden Zustand als eigenen Typ mit zustandsspezifischen Daten
- **Transition Maps** als Typ koennen unmoegliche Zustandsuebergaenge zur Compilezeit verhindern
- **Methoden-Guards** pro Zustand verhindern dass im falschen Zustand die falsche Aktion ausgefuehrt wird

> 🧠 **Erklaere dir selbst:** Warum ist `{ isLoading: boolean; isError: boolean }`
> ein Antipattern? Was ist die mathematische Erklaerung fuer die Explosion
> unmoeglicher Zustaende?
>
> **Kernpunkte:** n Booleans = 2^n Kombinationen | Davon sind die meisten
> ungueltig | Discriminated Union: genau n Zustaende | Kein ungeueltiger
> Zustand moeglich

**Kernkonzept zum Merken:** "Make impossible states impossible" — nicht
zur Laufzeit pruefen, sondern im Typ verbieten. Wenn der Typ es nicht
erlaubt, kann der Bug nicht existieren.

---

> **Pausenpunkt** -- State Machines sind ein maechiges Werkzeug.
> Naechstes Thema: Phantom Types — Typen die zur Laufzeit unsichtbar sind.
>
> Weiter geht es mit: [Sektion 03: Phantom Types](./03-phantom-types.md)
