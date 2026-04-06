# Sektion 3: Behavioral Patterns — Verhalten kapseln und komponieren

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Structural Patterns](./02-structural-patterns.md)
> Naechste Sektion: [04 - Repository und Data Access](./04-repository-und-data-access.md)

---

## Was du hier lernst

- Wie **Strategy** auswechselbare Algorithmen als typsichere Interfaces kapselt
- Wie ein **typisierter Event-Bus** ohne RxJS funktioniert — rein mit TypeScript-Generics
- Wie **Command mit Undo/Redo** in TypeScript implementiert wird
- Warum NgRx-Actions das Command Pattern sind — nur mit Immutability

---

## Hintergrund: Verhalten als Wert

In den 1990ern war es revolutionaer: Verhalten in Objekte kapseln und zur Laufzeit
austauschen. Java konnte das — aber es brauchte Klassen, Interfaces, Boilerplate.

Dann kam JavaScript. Funktionen sind First-Class-Citizens. Du kannst eine Funktion als
Parameter uebergeben, in einem Array speichern, aus einer anderen Funktion zurueckgeben.
Was die GoF mit Pattern-Klassen loesten, kann JavaScript direkt als Funktion.

TypeScript macht das Beste aus beiden Welten: Du bekommst die Typsicherheit von Interfaces
*und* die Flexibilitaet von Funktionen. Ein Strategy-Pattern in TypeScript kann sowohl
eine Klasse sein als auch eine einfache getypte Funktion — je nach Komplexitaet.

Das ist der Kern des heutigen Abschnitts: Behavioral Patterns sind in TypeScript oft
viel leichtgewichtiger als in Java. Manchmal sind es Klassen, manchmal Interfaces,
manchmal einfach ein Funktionstyp. Das Muster dahinter bleibt dasselbe.

> 🧠 **Erklaere dir selbst:** Was bedeutet es, "Verhalten als Wert zu behandeln"?
> Warum ist das in JavaScript/TypeScript einfacher als in Java?
> **Kernpunkte:** Funktionen sind First-Class | Closures kapseln Zustand |
> TypeScript kann Funktionstypen beschreiben | Klassen optional, nicht zwingend

---

## Strategy Pattern — Algorithmen austauschen ohne if-Kaskaden

Du baust ein Formular-Validierungssystem. Verschiedene Felder brauchen verschiedene
Regeln: E-Mail, Passwort, IBAN, Postleitzahl. Statt einer riesigen `if-else`-Kaskade
kapselt das Strategy Pattern jede Regel in ein eigenes Objekt.

```typescript annotated
// Das zentrale Interface — jede Validierungsregel implementiert es
interface ValidationStrategy<T> {
  validate(value: T): ValidationResult;
  // ^ T macht es generisch: String-Strategien, Number-Strategien, Object-Strategien
}

interface ValidationResult {
  valid: boolean;
  error?: string;  // Optional: nur vorhanden wenn valid === false
}

// Konkrete Strategien — jede kennt nur ihre eigene Regel
class EmailValidationStrategy implements ValidationStrategy<string> {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validate(email: string): ValidationResult {
    return this.emailRegex.test(email)
      ? { valid: true }
      : { valid: false, error: 'Ungueltige E-Mail-Adresse' };
  }
}

class MinLengthStrategy implements ValidationStrategy<string> {
  constructor(private readonly minLength: number) {}
  // ^ Strategien koennen konfigurierbar sein — kein Boilerplate fuer jede Laenge!

  validate(value: string): ValidationResult {
    return value.length >= this.minLength
      ? { valid: true }
      : { valid: false, error: `Mindestens ${this.minLength} Zeichen erforderlich` };
  }
}

class RangeValidationStrategy implements ValidationStrategy<number> {
  constructor(private readonly min: number, private readonly max: number) {}

  validate(value: number): ValidationResult {
    return value >= this.min && value <= this.max
      ? { valid: true }
      : { valid: false, error: `Muss zwischen ${this.min} und ${this.max} liegen` };
  }
}

// Validator-Klasse — kombiniert mehrere Strategien (Composite)
class Validator<T> {
  private strategies: ValidationStrategy<T>[] = [];

  addStrategy(strategy: ValidationStrategy<T>): this {
    // ^ Gibt this zurueck — Fluent API / Method Chaining!
    this.strategies.push(strategy);
    return this;
  }

  validate(value: T): ValidationResult[] {
    return this.strategies.map(s => s.validate(value));
    // ^ Alle Strategien werden ausgefuehrt — Ergebnis ist ein Array
  }

  isValid(value: T): boolean {
    return this.validate(value).every(r => r.valid);
    // ^ Hilfsmethode: true wenn alle Strategien bestehen
  }
}

// Verwendung — Fluent API macht den Code lesbar:
const emailValidator = new Validator<string>()
  .addStrategy(new EmailValidationStrategy())
  .addStrategy(new MinLengthStrategy(5));

const passwordValidator = new Validator<string>()
  .addStrategy(new MinLengthStrategy(8))
  .addStrategy(new NoSpacesStrategy())
  .addStrategy(new HasUppercaseStrategy());

console.log(emailValidator.isValid('max@example.com'));  // true
console.log(emailValidator.isValid('kein-at-zeichen')); // false
```

> 💭 **Denkfrage:** Was waere der Nachteil wenn du statt Klassen einfache Funktionen
> als Strategien verwendest? `type Strategy<T> = (value: T) => ValidationResult`
>
> **Antwort:** Funktionen sind oft besser — weniger Boilerplate. Der Nachteil:
> Du verlierst die Moeglichkeit, Strategien nach Typ zu identifizieren
> (`instanceof EmailValidationStrategy`) und Konfiguration als Instanzstate zu speichern.
> Beides ist selten noetig — Funktionen reichen in den meisten Faellen.

---

## Observer Pattern — ein typisierter Event-Bus ohne RxJS

RxJS ist maechtiger als alles, was du hier selbst baust. Aber manchmal willst du
keinen vollen Observable-Stream — nur simple Event-Kommunikation zwischen Komponenten.
Ein typisierter Event-Bus macht das ohne externe Dependencies.

```typescript annotated
// Event-Map: String-Schluessel auf Payload-Typen
// TypeScript prueft: welcher Schluessel welchen Payload-Typ hat
type EventMap = {
  'user:login':      { userId: string; timestamp: Date };
  'user:logout':     { userId: string };
  'order:placed':    { orderId: string; total: number; items: string[] };
  'order:cancelled': { orderId: string; reason: string };
};

class TypedEventBus<Events extends Record<string, unknown>> {
  // Interne Map: Event-Name -> Set von Listener-Funktionen
  private listeners = new Map<keyof Events, Set<(data: unknown) => void>>();

  // on<K> — K ist ein konkreter Event-Name (z.B. 'user:login')
  on<K extends keyof Events>(
    event: K,
    listener: (data: Events[K]) => void,
    // ^ listener ist typisiert: bekommt genau den richtigen Payload-Typ
  ): () => void {
    // ^ Rueckgabetyp: Unsubscribe-Funktion (Cleanup-Pattern)
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as (data: unknown) => void);

    // Gibt eine Cleanup-Funktion zurueck — kein separates off() noetig!
    return () => this.listeners.get(event)?.delete(listener as (data: unknown) => void);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    // ^ TypeScript prueft: emit('user:login', { userId: '1', timestamp: new Date() })
    // NICHT: emit('user:login', { userId: '1' })  <- timestamp fehlt -> FEHLER
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}

// Verwendung:
const bus = new TypedEventBus<EventMap>();

// TypeScript weiss: userId ist string, timestamp ist Date
const unsubscribe = bus.on('user:login', ({ userId, timestamp }) => {
  console.log(`User ${userId} hat sich um ${timestamp.toISOString()} angemeldet`);
});

bus.emit('user:login', { userId: 'u-123', timestamp: new Date() });
// bus.emit('user:login', { userId: 'u-123' });
// ^ FEHLER: Argument of type '{ userId: string; }' is not assignable...
// 'timestamp' fehlt — TypeScript faengt das ab!

unsubscribe(); // Sauber aufraumen — kein Memory Leak
```

> ⚡ **Angular-Bezug:** Dieser Event-Bus ist aehnlich wie Angular's `EventEmitter<T>`,
> aber einfacher und ohne RxJS. In deinen Angular-Projekten wirst du haeufig zwischen
> drei Ansaetzen waehlen:
>
> ```typescript
> // 1. EventEmitter (Output-gebunden — nur Parent-Child)
> @Output() userLogin = new EventEmitter<{ userId: string }>();
>
> // 2. RxJS Subject (fuer Cross-Component-Kommunikation)
> private loginSubject = new Subject<{ userId: string }>();
> login$ = this.loginSubject.asObservable();
>
> // 3. TypedEventBus (fuer einfache Cases ohne RxJS-Overhead)
> bus.on('user:login', handler);
> ```
>
> Der TypedEventBus eignet sich ideal fuer Projekte die kein RxJS verwenden,
> zum Beispiel in React-Projekten oder kleinen Node.js-Services.

---

## Command Pattern — Undo/Redo mit typsicherem History-Stack

Command kapselt eine Aktion als Objekt. Das klingt abstrakt. Konkret: Du willst in
einem Text-Editor Ctrl+Z implementieren. Oder in einem Zeichenprogramm. Oder in einem
Form-Builder, der Aenderungen rueckgaengig machen soll.

```typescript annotated
// Command Interface — jedes Command kann ausgefuehrt und rueckgaengig gemacht werden
interface Command {
  execute(): void;
  undo(): void;
  // ^ Symmetrie ist wichtig: execute() und undo() muessen genau invers sein
  readonly description: string;
  // ^ Menschenlesbarer Name fuer Debug und UI-Anzeige ("Rueckgaengig: Text einfuegen")
}

// Konkretes Command: Text einfuegen
class InsertTextCommand implements Command {
  readonly description: string;
  private insertedAt: number = 0;

  constructor(
    private readonly document: TextDocument,
    private readonly text: string,
    private readonly position: number,
  ) {
    this.description = `Text einfuegen: "${text}"`;
  }

  execute(): void {
    this.document.insert(this.position, this.text);
    this.insertedAt = this.position;
  }

  undo(): void {
    this.document.delete(this.insertedAt, this.text.length);
    // ^ Genau das Inverse von insert()
  }
}

// CommandHistory — verwaltet den History-Stack
class CommandHistory {
  private readonly history: Command[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  execute(command: Command): void {
    command.execute();
    this.history.push(command);
    // Stack-Groesse begrenzen: aelteste Commands verwerfen
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
  }

  undo(): Command | undefined {
    const command = this.history.pop();
    // ^ pop() gibt undefined zurueck wenn der Stack leer ist
    command?.undo();
    // ^ Optional Chaining: undo() wird nur aufgerufen wenn command existiert
    return command;
    // Caller kann command.description anzeigen: "Rueckgaengig: Text einfuegen"
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  getHistory(): readonly Command[] {
    return [...this.history];
    // ^ Defensive Kopie — Aufrufer kann den internen Stack nicht modifizieren
    // readonly im Rueckgabetyp: zusaetzliche Compile-Zeit-Pruefung
  }
}
```

> ⚡ **NgRx als Command Pattern:** In deinen Angular-Projekten mit NgRx ist jede
> Action ein Command:
>
> ```typescript
> // NgRx Action = Command (ohne undo — dafuer gibt es separate "Revert"-Actions)
> const addToCart = createAction('[Cart] Add Item', props<{ item: CartItem }>());
> const removeFromCart = createAction('[Cart] Remove Item', props<{ itemId: string }>());
>
> // NgRx Reducer = Command-Executor — aber immutabel und mit History ueber State-Snapshots
> const cartReducer = createReducer(initialState,
>   on(addToCart, (state, { item }) => ({ ...state, items: [...state.items, item] })),
>   on(removeFromCart, (state, { itemId }) => ({
>     ...state,
>     items: state.items.filter(i => i.id !== itemId),
>   })),
> );
> // Time-Travel-Debugging im Redux DevTool = Undo/Redo ueber den State-Stream
> ```

---

## Was du gelernt hast

- **Strategy** kapselt auswechselbare Algorithmen — in TypeScript oft als generisches
  Interface, das Klassen *und* Funktionen als Strategien erlaubt
- **Observer** ermoeglicht lose Kopplung zwischen Produzenten und Konsumenten — der
  typisierte Event-Bus zeigt, wie TypeScript-Generics die Payload-Typen sichern
- **Command** kapselt Aktionen als Objekte mit execute/undo — NgRx-Actions sind
  Commands in Reinform, aber immutabel und fuer State-Streams optimiert
- Behavioral Patterns sind in TypeScript oft leichtgewichtiger als in Java, weil
  Funktionen First-Class sind und Interfaces strukturell geprueft werden

**Kernkonzept:** Behavioral Patterns trennen das *Was* (die Aktion, das Ereignis,
der Algorithmus) vom *Wie* (der konkreten Ausfuehrung). TypeScript's Typsystem stellt
sicher, dass diese Trennung zur Compile-Zeit geprueft wird — nicht erst zur Laufzeit.

> 🧠 **Erklaere dir selbst:** Warum hat das Command Pattern eine `undo()`-Methode,
> aber NgRx keine entsprechende "undo"-Action hat? Wie loest NgRx dasselbe Problem?
> **Kernpunkte:** NgRx ist immutabel — der gesamte State-Verlauf existiert |
> Time-Travel = Replay aller Actions von Anfang | State-Snapshot-Undo vs. inverse Operation

---

> **Pausenpunkt** — Drei fundamentale Behavioral Patterns verstanden, und du hast
> ihren Fingerabdruck in Angular (NgRx, EventEmitter) erkannt.
>
> Weiter geht es mit: [Sektion 04: Repository und Data Access](./04-repository-und-data-access.md)
