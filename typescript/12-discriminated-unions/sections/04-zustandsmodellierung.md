# Sektion 4: Zustandsmodellierung mit Discriminated Unions

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Algebraische Datentypen](./03-algebraische-datentypen.md)
> Naechste Sektion: [05 - Praxis-Patterns](./05-praxis-patterns.md)

---

## Was du hier lernst

- Warum **unmoegliche Zustaende** die haeufigste Bug-Quelle sind
- Wie Discriminated Unions **State Machines** als Typen ausdruecken
- Das **Loading/Error/Success**-Pattern fuer async Daten
- Wie React und Angular State-Management damit sicherer wird
- Zustandsuebergaenge typsicher modellieren

---

## Das Problem: Unmoegliche Zustaende

Der haeufigste Bug in Frontend-Anwendungen entsteht durch **Zustaende,
die eigentlich nie existieren sollten:**

```typescript annotated
// SCHLECHT: Flache State-Struktur mit Booleans
type DataState = {
  isLoading: boolean;
  isError: boolean;
  data: string[] | null;
  error: string | null;
};

// Unmoegliche Zustaende sind ERLAUBT:
const impossible1: DataState = {
  isLoading: true,
  isError: true,    // Laden UND Fehler gleichzeitig?!
  data: ["a", "b"], // Daten DA waehrend des Ladens?!
  error: "Oops",    // Fehler UND Daten?!
};

// Wer garantiert, dass data null ist wenn isLoading true ist?
// NIEMAND. Das ist ein Vertrag im Kopf des Entwicklers — nicht im Typ.
```

> **Kent C. Dodds** hat es auf den Punkt gebracht:
> *"Make impossible states impossible."*
> Wenn der Typ unmoegliche Zustaende erlaubt, werden Bugs entstehen.

> 💭 **Denkfrage:** Wie viele verschiedene Zustaende kann der `DataState`-Typ mit vier Booleans/Nullables theoretisch annehmen? Wie viele davon sind tatsaechlich sinnvoll? Was sagt das ueber den Qualitaet des Typen aus?
>
> **Antwort:** `boolean * boolean * (T | null) * (string | null)` ergibt `2 * 2 * 2 * 2 = 16` moegliche Kombinationen — aber nur 4 sind sinnvoll (idle, loading, error, success). Du schreibst also Code, der 12 unsinnige Zustaende aktiv erlaubt und defensiv behandeln muss.

---

## Die Loesung: State als Discriminated Union

Modelliere jeden Zustand als **eigene Variante** mit nur den
Daten, die in diesem Zustand sinnvoll sind:

```typescript annotated
type DataState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: string[] };

// Unmoegliche Zustaende sind UNMOGLICH:
// - loading hat keine data und keinen error
// - error hat einen error aber keine data
// - success hat data aber keinen error
```

### Vorher vs. Nachher

```typescript annotated
// VORHER: 2^4 = 16 moegliche Kombinationen (die meisten unsinning)
type Old = {
  isLoading: boolean; // 2 Werte
  isError: boolean;   // 2 Werte
  data: string[] | null; // 2 Moeglichkeiten
  error: string | null;  // 2 Moeglichkeiten
};
// 16 Zustaende — nur 4 davon sinnvoll!

// NACHHER: Genau 4 Zustaende — alle sinnvoll
type New =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: string[] };
// 4 Zustaende — alle gueltig!
```

---

## State Machines als Typen

Eine **State Machine** definiert:
1. Welche **Zustaende** existieren
2. Welche **Uebergaenge** zwischen Zustaenden erlaubt sind

Discriminated Unions modellieren die Zustaende perfekt.
Die Uebergaenge kodieren wir in den Funktionen:

```typescript annotated
// Zustaende einer Bestellung
type OrderState =
  | { status: "draft"; items: CartItem[] }
  | { status: "submitted"; items: CartItem[]; submittedAt: Date }
  | { status: "paid"; items: CartItem[]; submittedAt: Date; paidAt: Date }
  | { status: "shipped"; items: CartItem[]; trackingCode: string }
  | { status: "delivered"; items: CartItem[]; deliveredAt: Date };

type CartItem = { name: string; price: number; quantity: number };

// Uebergaenge als Funktionen — nur gueltige Uebergaenge kompilieren:
function submitOrder(order: Extract<OrderState, { status: "draft" }>): OrderState {
  return {
    status: "submitted",
    items: order.items,
    submittedAt: new Date(),
  };
}

function payOrder(order: Extract<OrderState, { status: "submitted" }>): OrderState {
  return {
    status: "paid",
    items: order.items,
    submittedAt: order.submittedAt,
    paidAt: new Date(),
  };
}

// submitOrder bei einer bereits bezahlten Bestellung? Compile-Error!
// payOrder bei einem Draft? Compile-Error!
```

> **Erklaere dir selbst:** Warum ist `Extract<OrderState, { status: "draft" }>`
> besser als einfach der konkrete Typ? Was passiert wenn der Typ sich aendert?
> **Kernpunkte:** Extract leitet den Typ automatisch ab | Aenderungen am Union propagieren | Kein manuelles Synchronisieren noetig

---

## Loading/Error/Success in React

Das haeufigste Pattern in React-Anwendungen:

```typescript annotated
// State-Typ als Discriminated Union
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// React-Hook der typsicheren State liefert:
function useFetch<T>(url: string): FetchState<T> {
  // ... Implementation mit useState/useEffect
  return { status: "idle" }; // Beispiel
}

// Komponente mit exhaustive Rendering:
function UserList() {
  const state = useFetch<User[]>("/api/users");

  switch (state.status) {
    case "idle":
      return <p>Bereit zum Laden.</p>;
    case "loading":
      return <Spinner />;
    case "error":
      return <ErrorBanner message={state.error} />;
    case "success":
      return (
        <ul>
          {state.data.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      );
  }
}
```

**Kein `data && !isLoading && !isError` mehr.** Der switch/case
deckt alle Zustaende ab, und TypeScript erzwingt die Vollstaendigkeit.

---

## Loading/Error/Success in Angular

Dasselbe Pattern funktioniert auch mit Angular Signals oder NgRx:

```typescript annotated
// State-Typ (identisch zu React!)
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// Angular Signal-basierter Service:
@Injectable({ providedIn: "root" })
class UserService {
  private state = signal<AsyncState<User[]>>({ status: "idle" });

  readonly userState = this.state.asReadonly();

  async loadUsers() {
    this.state.set({ status: "loading" });

    try {
      const users = await fetchUsers();
      this.state.set({ status: "success", data: users });
    } catch (e) {
      this.state.set({ status: "error", error: String(e) });
    }
  }
}

// Template mit @switch (Angular 17+):
// @switch (userState().status) {
//   @case ("loading") { <app-spinner /> }
//   @case ("error")   { <app-error [message]="userState().error" /> }
//   @case ("success") { <app-user-list [users]="userState().data" /> }
// }
```

> **Beachte:** Der State-Typ ist framework-unabhaengig. Derselbe
> `AsyncState<T>` funktioniert in React, Angular, Vue, Svelte
> und purem TypeScript. Das ist die Staerke des Patterns.

---

## Generischer AsyncState mit Transformation

In der Praxis willst du den Success-Wert oft transformieren:

```typescript annotated
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// Map ueber den Success-Fall:
function mapAsyncState<T, U>(
  state: AsyncState<T>,
  fn: (data: T) => U
): AsyncState<U> {
  if (state.status === "success") {
    return { status: "success", data: fn(state.data) };
  }
  return state; // idle, loading, error bleiben unveraendert
}

// Verwendung:
const usersState: AsyncState<User[]> = { status: "success", data: users };
const namesState = mapAsyncState(usersState, users =>
  users.map(u => u.name)
);
// AsyncState<string[]> — nur die Namen, gleicher State-Wrapper
```

---

## Anti-Pattern: Verschachtelte Booleans

Ein letztes Beispiel, warum Discriminated Unions besser sind:

```typescript annotated
// ANTI-PATTERN: Verschachtelte Bedingungen
function renderOld(state: OldState) {
  if (state.isLoading) {
    if (state.data) {
      // Laden mit alten Daten? Was zeigen wir?
    } else {
      // Erstes Laden ohne Daten
    }
  } else if (state.isError) {
    if (state.data) {
      // Fehler aber alte Daten vorhanden?
    } else {
      // Fehler ohne Daten
    }
  }
  // 8+ Branches — und trotzdem nicht alle Faelle abgedeckt!
}

// BESSER: Ein Branch pro Zustand
function renderNew(state: AsyncState<string[]>) {
  switch (state.status) {
    case "idle": return null;
    case "loading": return "Laden...";
    case "error": return `Fehler: ${state.error}`;
    case "success": return state.data.join(", ");
  }
  // 4 Branches — ALLE Faelle abgedeckt!
}
```

> **Experiment:** Versuche direkt im TypeScript Playground den unmoelichen Zustand zu erzeugen:
>
> ```typescript
> // VORHER: Flache Booleans
> type OldState = {
>   isLoading: boolean;
>   isError: boolean;
>   data: string[] | null;
>   error: string | null;
> };
>
> // Probiere: Kannst du TypeScript dazu bringen, diesen Wert abzulehnen?
> const impossibleOld: OldState = {
>   isLoading: true,
>   isError: true,
>   data: ["a", "b"],
>   error: "Oh nein",
> };
>
> // NACHHER: Discriminated Union
> type NewState =
>   | { status: "idle" }
>   | { status: "loading" }
>   | { status: "error"; error: string }
>   | { status: "success"; data: string[] };
>
> // Versuche den gleichen unmoelichen Zustand zu erstellen:
> const impossibleNew: NewState = {
>   status: "loading",
>   // error: "Oh nein", // <- Was sagt TypeScript dazu?
>   // data: ["a", "b"], // <- Und hierzu?
> };
> ```
>
> Was ist der fundamentale Unterschied in den TypeScript-Fehlermeldungen?

---

## Was du gelernt hast

- **Unmoegliche Zustaende** entstehen durch flache Boolean-Flags — bei `n` Flags gibt es `2^n` theoretische Kombinationen, von denen die meisten Bugs sind
- **Discriminated Unions als State** modellieren jeden Zustand als eigene Variante mit genau den Daten, die in diesem Zustand sinnvoll sind
- **State Machines** lassen sich als Typen und Uebergangs-Funktionen ausdruecken — `Extract<Union, Bedingung>` stellt sicher, dass nur gueltige Ausgangszustaende akzeptiert werden
- Das **AsyncState\<T\>**-Pattern (idle/loading/error/success) ist framework-agnostisch und funktioniert identisch in React, Angular, Vue und purem TypeScript
- Der `mapAsyncState`-Helfer erlaubt elegante Transformation des Erfolgs-Werts ohne Boilerplate

**Kernkonzept:** "Make impossible states impossible" — wenn dein Typ unmoegliche Zustaende repraesentieren kann, werden sie irgendwann auftreten. Discriminated Unions eliminieren ganze Klassen von Bugs, indem sie den Zustandsraum exakt auf die gueltigen Kombinationen reduzieren.

---

> **Pausenpunkt:** Du kannst jetzt Zustaende sauber modellieren.
> In der letzten Sektion schauen wir uns fortgeschrittene Praxis-Patterns
> an: API Responses, Action Types fuer Redux/NgRx und Event Systeme.
>
> Weiter: [Sektion 05 - Praxis-Patterns](./05-praxis-patterns.md)
