# Sektion 6: Klassen in der Praxis

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Static Members und Patterns](./05-static-und-patterns.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wann du **Klassen vs. Funktionen** verwenden solltest — und warum die Antwort sich aendert
- Das **Composition-over-Inheritance**-Prinzip mit konkreten TypeScript-Beispielen
- Wie **Mixins** funktionieren und wann sie Vererbung ersetzen
- Warum der **this-Kontext** in Callbacks verloren geht — und drei Wege, das zu loesen

---

## Klassen vs. Funktionen: Wann was?
<!-- section:summary -->
Die zentrale Frage in modernem TypeScript: **Wann schreibst du eine

<!-- depth:standard -->
Die zentrale Frage in modernem TypeScript: **Wann schreibst du eine
Klasse, und wann reichen Funktionen + Closures?**

```typescript annotated
// --- Ansatz 1: Klasse ---
class Counter {
  private count: number = 0;

  increment(): void { this.count++; }
  decrement(): void { this.count--; }
  getCount(): number { return this.count; }
}

const counter1 = new Counter();
counter1.increment();
console.log(counter1.getCount()); // 1

// --- Ansatz 2: Closure (funktional) ---
function createCounter() {
  let count = 0;
  // ^ 'count' ist durch die Closure privat — nicht einmal mit 'as any' zugaenglich!

  return {
    increment: () => { count++; },
    decrement: () => { count--; },
    getCount: () => count,
  };
}

const counter2 = createCounter();
counter2.increment();
console.log(counter2.getCount()); // 1
```

### Entscheidungshilfe: Wann Klasse, wann Funktion?

| Kriterium | Klasse | Funktion/Closure |
|---|---|---|
| `instanceof` noetig? | **Ja** | Nein |
| Vererbungshierarchie? | **Ja** | Nein (aber Komposition!) |
| Dekoratoren noetig? | **Ja** (Angular!) | Nein |
| Dependency Injection? | **Ja** (Angular!) | Moeglich, aber unueblich |
| Privater Zustand? | `private` / `#private` | Closure (echter Schutz) |
| Serialisierung noetig? | Schwieriger | Einfacher (Plain Objects) |
| Framework-Anforderung? | Angular: **Ja** | React (Hooks): **Ja** |

<!-- depth:vollstaendig -->
> **Hintergrund: React's Wechsel von Class Components zu Hooks (React 16.8, 2019)**
>
> Bis React 16.8 (Februar 2019) wurden React-Komponenten als **Klassen**
> geschrieben. `class MyComponent extends React.Component` war der Standard.
> Dann kamen **Hooks** — und aenderten alles.
>
> Warum der Wechsel? React's Team identifizierte drei Probleme mit Klassen:
>
> 1. **this-Binding-Verwirrung**: `onClick={this.handleClick}` verliert den
>    this-Kontext (genau das Problem aus Sektion 01). Jeder neue React-
>    Entwickler stolperte darueber.
>
> 2. **Code-Organisation**: In Klassen-Komponenten war verwandte Logik
>    ueber verschiedene Lifecycle-Methoden verstreut (componentDidMount,
>    componentDidUpdate, componentWillUnmount). Hooks buendeln zusammengehoerige
>    Logik.
>
> 3. **Code-Sharing**: Mixins waren problematisch, Higher-Order Components
>    fuehrten zu "Wrapper Hell". Custom Hooks loesten dieses Problem elegant.
>
> ```typescript
> // VORHER: Class Component
> class UserList extends React.Component<Props, State> {
>   state = { users: [] };
>   componentDidMount() { this.fetchUsers(); }
>   componentWillUnmount() { /* cleanup */ }
>   handleClick = () => { /* this-Binding! */ };
>   // ...
> }
>
> // NACHHER: Function Component + Hooks
> function UserList({ userId }: Props) {
>   const [users, setUsers] = useState<User[]>([]);
>   useEffect(() => { fetchUsers(); return () => cleanup(); }, []);
>   const handleClick = () => { /* kein this-Problem! */ };
>   // ...
> }
> ```
>
> **Aber:** Angular bleibt bei Klassen! Angular's Architektur basiert auf
> Dependency Injection und Dekoratoren — beides erfordert Klassen. Seit
> Angular 16+ gibt es Signals als Ergaenzung, aber Klassen bleiben zentral.

---

<!-- /depth -->
## Composition over Inheritance: Das Praxis-Beispiel
<!-- section:summary -->
Stell dir vor, du baust ein Spiel mit verschiedenen Charakteren:

<!-- depth:standard -->
Stell dir vor, du baust ein Spiel mit verschiedenen Charakteren:
Krieger, Magier, Heiler. Jeder kann kaempfen, zaubern oder heilen —
in verschiedenen Kombinationen.

```typescript annotated
// SCHLECHT: Vererbung fuehrt zur "Diamond Problem" Explosion
class Character { name: string = ""; }
class Fighter extends Character { fight() { return "Kaempfe!"; } }
class Wizard extends Character { cast() { return "Zaubere!"; } }
// class BattleMage extends Fighter, Wizard { }
// ^ GEHT NICHT! TypeScript erlaubt nur EINE Elternklasse.
// Was wenn ein BattleMage kaempfen UND zaubern koennen soll?
```

Die Loesung: **Komposition** — Faehigkeiten als separate Objekte:

```typescript annotated
// GUT: Komposition — Faehigkeiten als separate Module
interface CanFight {
  fight(): string;
}
interface CanCast {
  cast(): string;
}
interface CanHeal {
  heal(): string;
}

// Implementierungen als einfache Objekte
const fighter: CanFight = {
  fight() { return "Schwertstreich!"; }
};
const wizard: CanCast = {
  cast() { return "Feuerball!"; }
};
const healer: CanHeal = {
  heal() { return "Heilung!"; }
};

// Charaktere KOMBINIEREN Faehigkeiten (statt zu erben)
class BattleMage implements CanFight, CanCast {
  constructor(
    public name: string,
    private fightAbility: CanFight = fighter,
    private castAbility: CanCast = wizard
    // ^ Faehigkeiten werden INJIZIERT, nicht geerbt!
    //   Das ist Komposition: "hat-ein" statt "ist-ein".
  ) {}

  fight(): string { return this.fightAbility.fight(); }
  cast(): string { return this.castAbility.cast(); }
}

const mage = new BattleMage("Gandalf");
console.log(mage.fight()); // "Schwertstreich!"
console.log(mage.cast());  // "Feuerball!"
```

**Warum ist Komposition besser?**
- **Flexibel**: Neue Kombinationen ohne neue Klassen
- **Testbar**: Mock-Faehigkeiten einfach injizierbar
- **Erweiterbar**: Neue Faehigkeit? Neues Interface + Objekt, keine Hierarchie-Aenderung
- **Keine Kopplung**: Aenderung in `fighter` bricht nicht `BattleMage`

---

<!-- /depth -->
## Mixins: Klassen-Features dynamisch hinzufuegen
<!-- section:summary -->
Mixins sind ein TypeScript-Pattern, das **Vererbung von mehreren

<!-- depth:standard -->
Mixins sind ein TypeScript-Pattern, das **Vererbung von mehreren
Quellen** ermoeglicht — etwas, das `extends` allein nicht kann.
Es nutzt Funktionen, die Klassen erweitern:

```typescript annotated
// Typ fuer einen Konstruktor (beliebige Klasse)
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin 1: Fuegt Timestamp-Funktionalitaet hinzu
function WithTimestamp<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    // ^ Gibt eine NEUE Klasse zurueck, die Base erweitert.
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    touch(): void {
      this.updatedAt = new Date();
    }
  };
}

// Mixin 2: Fuegt Logging-Funktionalitaet hinzu
function WithLogging<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    log(message: string): void {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  };
}

// Basis-Klasse
class User {
  constructor(public name: string) {}
}

// Mixins anwenden: User + Timestamp + Logging
const EnhancedUser = WithLogging(WithTimestamp(User));
// ^ Mixin-Kette: User → +Timestamp → +Logging

const user = new EnhancedUser("Anna");
console.log(user.name);      // "Anna" (von User)
console.log(user.createdAt); // Date (von WithTimestamp)
user.log("Eingeloggt");      // "[...] Eingeloggt" (von WithLogging)
user.touch();                // Aktualisiert updatedAt (von WithTimestamp)
```

<!-- depth:vollstaendig -->
> **Experiment:** Erstelle einen Mixin `WithValidation` der eine Methode
> `validate(): boolean` hinzufuegt. Wende ihn zusammen mit `WithTimestamp`
> auf eine `Product`-Klasse an. Beobachte: Beide Mixins fuegen
> unabhaengig Funktionalitaet hinzu — keine Vererbungshierarchie noetig!

---

<!-- /depth -->
## Der this-Kontext: Das groesste Stolperproblem
<!-- section:summary -->
Dies ist vermutlich die haeufigste Fehlerquelle bei Klassen in

<!-- depth:standard -->
Dies ist vermutlich die haeufigste Fehlerquelle bei Klassen in
JavaScript/TypeScript. Wir haben es in Sektion 01 kurz angesprochen —
hier die volle Erklaerung:

```typescript annotated
class Timer {
  seconds: number = 0;

  start(): void {
    setInterval(this.tick, 1000);
    // ^ PROBLEM: 'this.tick' verliert den this-Kontext!
    //   Wenn setInterval 'tick' aufruft, ist 'this' nicht mehr Timer.
    //   'this' ist dann 'globalThis' (im strikten Modus: undefined).
  }

  tick(): void {
    this.seconds++;
    // ^ RUNTIME ERROR: Cannot read properties of undefined (reading 'seconds')
    console.log(this.seconds);
  }
}
```

<!-- depth:vollstaendig -->
> **Erklaere dir selbst:** Warum verliert eine Methode ihren this-Kontext
> als Callback? Was genau passiert, wenn du `const fn = obj.method`
> schreibst und dann `fn()` aufrufst?
>
> **Kernpunkte:** In JavaScript haengt 'this' vom AUFRUF-Kontext ab |
> `obj.method()` → this = obj | `const fn = obj.method; fn()` → this = undefined |
> Die Methode wird "losgeloest" vom Objekt | Nur der Aufruf-Punkt bestimmt this

### Drei Loesungen fuer das this-Problem

```typescript annotated
class Timer {
  seconds: number = 0;

  // Loesung 1: Arrow-Function als Klassen-Feld
  tick = (): void => {
    this.seconds++;
    console.log(this.seconds);
    // ^ Arrow-Functions haben KEIN eigenes 'this'.
    //   Sie "fangen" das 'this' der umgebenden Klasse ein (lexical this).
    //   NACHTEIL: Jede Instanz bekommt eine EIGENE Kopie der Funktion
    //   (mehr Speicher bei vielen Instanzen).
  };

  // Loesung 2: bind() im Constructor
  tick2(this: Timer): void {
    this.seconds++;
    // ^ this-Parameter (TS-only): Dokumentiert, dass 'this' ein Timer sein muss.
  }

  constructor() {
    this.tick2 = this.tick2.bind(this);
    // ^ bind() erstellt eine neue Funktion mit fixiertem 'this'.
    //   Die neue Funktion hat IMMER 'this' = diese Timer-Instanz.
  }

  // Loesung 3: Arrow-Function bei der Uebergabe
  start(): void {
    setInterval(() => this.tick2(), 1000);
    // ^ Arrow-Function als Wrapper: 'this' wird korrekt weitergegeben.
    //   VORTEIL: tick2 bleibt eine normale Methode (auf dem Prototype).
  }
}
```

| Loesung | Vorteil | Nachteil |
|---|---|---|
| Arrow-Field `tick = () => {}` | Einfach, sicher | Kopie pro Instanz (Speicher) |
| `bind()` im Constructor | Auf Prototype, effizient | Mehr Code, leicht vergessbar |
| Arrow bei Uebergabe `() => this.tick()` | Flexibel, effizient | Jedes Mal neu |

> **Denkfrage:** Wann ist eine Klasse die bessere Wahl gegenueber einer Funktion?
>
> **Antwort:** Verwende Klassen wenn:
> - Ein Framework es verlangt (Angular: Services, Components)
> - Du `instanceof` brauchst (Type Guards zur Laufzeit)
> - Du Vererbungshierarchien brauchst
> - Du Dekoratoren brauchst
>
> Verwende Funktionen/Closures wenn:
> - Du einfachen Zustand kapseln willst
> - Du keinen `this`-Kontext brauchst
> - Du React Hooks verwendest
> - Du serialisierbare Daten verarbeitest

---

<!-- /depth -->
## Klassen und Type Narrowing
<!-- section:summary -->
Klassen sind die einzigen TypeScript-Typen, die `instanceof` fuer

<!-- depth:standard -->
Klassen sind die einzigen TypeScript-Typen, die `instanceof` fuer
Type Narrowing unterstuetzen (weil sie zur Laufzeit existieren):

```typescript annotated
class HttpError {
  constructor(public statusCode: number, public message: string) {}
}

class ValidationError {
  constructor(public field: string, public message: string) {}
}

function handleError(error: HttpError | ValidationError): void {
  if (error instanceof HttpError) {
    console.log(`HTTP ${error.statusCode}: ${error.message}`);
    // ^ TypeScript weiss: error ist HttpError. statusCode ist verfuegbar.
  } else {
    console.log(`Validation: ${error.field} — ${error.message}`);
    // ^ TypeScript weiss: error ist ValidationError. field ist verfuegbar.
  }
}
```

Das funktioniert NICHT mit Interfaces — weil Interfaces zur Laufzeit
nicht existieren (Type Erasure, Lektion 02). Wenn du `instanceof` brauchst,
muessen es Klassen sein.

<!-- depth:vollstaendig -->
> **In React** verwendest du Klassen seltener, aber fuer Error Boundaries
> sind sie **immer noch erforderlich**. React hat keine Hook-basierte
> Alternative fuer Error Boundaries — `componentDidCatch` erfordert eine
> Class Component. Auch in neuem React-Code brauchst du mindestens
> EINE Klasse fuer Error Handling.
>
> **In Angular** bleiben Klassen das Rueckgrat: Services, Components,
> Directives, Pipes, Guards — alles Klassen mit Dekoratoren.
> Angular's Signals (ab v16) ergaenzen, ersetzen aber keine Klassen.

---

<!-- /depth -->
## Best Practices: Klassen in TypeScript
<!-- section:summary -->
1. **Bevorzuge Komposition** ueber Vererbung. Nutze Interfaces + Injection.

<!-- depth:standard -->
1. **Bevorzuge Komposition** ueber Vererbung. Nutze Interfaces + Injection.
2. **Parameter Properties** verwenden — weniger Code, weniger Fehler.
3. **readonly** fuer alles, was sich nicht aendern soll.
4. **`override`** keyword immer verwenden (+ `noImplicitOverride`).
5. **Arrow-Fields** fuer Methoden, die als Callbacks uebergeben werden.
6. **Maximal 2-3 Vererbungsstufen** — tiefer = zu komplex.
7. **Interfaces fuer Vertraege**, Abstract Classes fuer gemeinsamen Code.
8. **private** als Default — nur `public` was wirklich noetig ist.

---

<!-- /depth -->
## Was du gelernt hast

- **Klassen vs. Funktionen**: Klassen fuer Frameworks (Angular), `instanceof`,
  Vererbung; Funktionen fuer einfachen Zustand, React, Serialisierung
- **Composition over Inheritance**: Faehigkeiten als Objekte injizieren statt
  durch Vererbungsketten schleppen
- **Mixins** erlauben "Mehrfach-Vererbung" durch Funktionen, die Klassen erweitern
- **this-Binding** ist die haeufigste Fehlerquelle: Arrow-Fields, bind() oder
  Arrow-Wrapper loesen das Problem

> **Erklaere dir selbst:** Warum hat React von Klassen zu Hooks gewechselt,
> waehrend Angular bei Klassen bleibt? Was sagt das ueber die
> Architektur-Philosophie der beiden Frameworks?
>
> **Kernpunkte:** React: UI als Funktion von State, kein DI noetig |
> Angular: DI + Dekoratoren erfordern Klassen |
> React's Hooks vermeiden this-Probleme | Angular's Klassen-basierter DI ist maechtiger |
> Verschiedene Probleme, verschiedene Loesungen

**Kernkonzept zum Merken:** Klassen sind ein Werkzeug, kein Selbstzweck.
Verwende sie, wenn ein Framework es verlangt oder wenn du Vererbung,
`instanceof` oder Dekoratoren brauchst. In allen anderen Faellen
sind Funktionen und Plain Objects oft die einfachere Wahl.

---

> **Ende der Lektion** -- Herzlichen Glueckwunsch! Du hast alle sechs
> Sektionen zu Classes & OOP in TypeScript abgeschlossen.
>
> **Empfohlener naechster Schritt:**
> 1. Schau dir die Konzepte noch einmal im cheatsheet.md an
> 2. Teste dein Wissen direkt im TUI ueber den Punkt "Quiz starten"
> 3. Mach erst nach einer Pause mit dem naechsten Thema weiter
>
> Zurueck zur Uebersicht: [README.md](../README.md)
