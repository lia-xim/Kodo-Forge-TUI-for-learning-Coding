# Sektion 1: Creational Patterns — Objekte mit Absicht erzeugen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Structural Patterns](./02-structural-patterns.md)

---

## Was du hier lernst

- Warum die **Gang of Four** Patterns aus Java kommen, aber in TypeScript viel sicherer werden
- Wie **Factory Method** und **Abstract Factory** typsichere Objektfamilien erzeugen
- Warum **Singleton** oft ein Anti-Pattern ist — und wie Angular es besser macht
- Wann du welches Creational Pattern wirklich brauchst

---

## Hintergrund: Das Buch das alles veraenderte

Im Jahr 1994 erschien ein Buch, das die Softwareentwicklung nachhaltig praegen sollte:
**"Design Patterns: Elements of Reusable Object-Oriented Software"** von Erich Gamma,
Richard Helm, Ralph Johnson und John Vlissides — die sogenannte **Gang of Four (GoF)**.

Das Buch beschrieb 23 wiederkehrende Loesungen fuer haeufige Entwurfsprobleme in
objektorientierten Sprachen. Die Patterns wurden in Java und C++ demonstriert. Und da
entstehen die Probleme: Java hatte keine Union Types, kein strukturelles Typsystem, keine
Literal Types. Die Patterns mussten sich mit `instanceof`-Checks, Reflection und
Boilerplate behelfen.

Dreissig Jahre spaeter schreiben wir TypeScript. Das strukturelle Typsystem, Discriminated
Unions, Generics und Conditional Types machen viele dieser Patterns auf eine Art moeglich,
die in Java schlicht undenkbar war. Manchmal ersetzen sie Patterns komplett — ein
TypeScript-Union-Type macht das State-Pattern oft ueberfluessig.

Die Lektion heute ist nicht: "Lerne die 23 GoF-Patterns auswendig." Sie ist:
**Verstehe, welches Problem ein Pattern loest, und erkenne, wann TypeScript dir eine
elegantere Loesung gibt.**

> 🧠 **Erklaere dir selbst:** Warum koennen TypeScript-Union-Types manche Patterns
> aus dem GoF-Buch ueberfluessig machen? Denke an das State-Pattern, das explizite
> Zustands-Objekte erfordert.
> **Kernpunkte:** Union Types sind Compile-Zeit-Abstraktion | Kein instanceof-Overhead |
> Exhaustive Checking mit switch | TypeScript erzwingt alle Faelle zu behandeln

---

## Factory Method — der richtige Typ zur richtigen Zeit

Die Factory Method loest ein klassisches Problem: Du willst ein Objekt erzeugen, aber
der konkrete Typ soll zur Laufzeit entschieden werden. Der Aufrufer soll nur das
Interface kennen, nicht die Implementierungsklasse.

```typescript annotated
interface Logger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(`[LOG] ${message}`); }
  warn(message: string) { console.warn(`[WARN] ${message}`); }
  error(message: string) { console.error(`[ERROR] ${message}`); }
}

class SilentLogger implements Logger {
  log(_message: string) { /* Test-Logger: verwirft alle Ausgaben */ }
  warn(_message: string) { }
  error(_message: string) { }
}

// Factory Method: Der Rueckgabetyp ist das Interface, nicht die Klasse
// TypeScript erzwingt: alle Faelle im switch muessen abgedeckt sein
function createLogger(type: 'console' | 'silent' | 'remote'): Logger {
  // ^ Union Type statt string — Tippfehler werden sofort rot
  switch (type) {
    case 'console': return new ConsoleLogger();
    case 'silent':  return new SilentLogger();
    case 'remote':  return new RemoteLogger();
    // TypeScript weiss: alle Faelle sind abgedeckt — kein default noetig
    // Wenn du 'file' hinzufuegst ohne case: COMPILE-FEHLER
  }
}

// Aufrufer kennt nur Logger — nicht ConsoleLogger oder RemoteLogger
const logger: Logger = createLogger('console');
// ^ Korrekt: Typ ist Logger (Interface), nicht ConsoleLogger (Klasse)
logger.log('App gestartet');
```

Der entscheidende TypeScript-Vorteil: Der Union Type `'console' | 'silent' | 'remote'`
ist **exhaustiv**. Wenn du einen neuen Logger-Typ erstellst und ihn zur Union hinzufuegst,
ohne einen `case` im Switch zu haben, zeigt TypeScript sofort einen Fehler. In Java
braettest du eine String-Konstante hinzufuegen und hoffen, dass du den Switch nicht
vergessen hast.

> 💭 **Denkfrage:** Was passiert in der Funktion `createLogger`, wenn du den Switch
> durch einen Record ersetzt: `const creators: Record<LoggerType, () => Logger> = {...}`?
> Ist das besser oder schlechter?
>
> **Antwort:** Ein Record ist oft besser — er ist deklarativer, alle Eintraege muessen
> vorhanden sein (sonst Compile-Fehler), und du kannst ihn zur Laufzeit inspizieren.
> Nachteil: Der Record wird einmal erstellt (immer) statt nur bei Aufruf.

---

## Abstract Factory — Familien von zusammengehoerenden Objekten

Stell dir vor, du baust ein UI-Framework, das verschiedene Design-Systeme unterstuetzt:
Material Design, Bootstrap, oder ein eigenes Corporate Design. Jedes Design-System hat
seine eigene Implementierung von `Button`, `Input`, `Dialog`. Du willst sicherstellen,
dass nie ein Material-Button mit einem Bootstrap-Dialog gemischt wird.

Das ist das Problem der Abstract Factory: **Familien zusammengehoeriger Objekte erzeugen,
ohne konkrete Klassen zu kennen.**

```typescript annotated
// Abstrakte Produkt-Interfaces
interface Button {
  render(): string;
  onClick(handler: () => void): void;
}

interface Input {
  render(): string;
  getValue(): string;
}

// Abstrakte Factory — ein Vertrag fuer ganze UI-Familien
interface UIFactory {
  createButton(label: string): Button;
  createInput(placeholder: string): Input;
}

// Konkrete Factory 1: Material Design
class MaterialUIFactory implements UIFactory {
  createButton(label: string): Button {
    return new MaterialButton(label);
    // MaterialButton hat Ripple-Effekt, Elevation-Schatten etc.
  }
  createInput(placeholder: string): Input {
    return new MaterialInput(placeholder);
    // MaterialInput hat Floating-Label-Animation
  }
}

// Konkrete Factory 2: Bootstrap
class BootstrapUIFactory implements UIFactory {
  createButton(label: string): Button {
    return new BootstrapButton(label);
  }
  createInput(placeholder: string): Input {
    return new BootstrapInput(placeholder);
  }
}

// Verwendung — kennt nur UIFactory, nie die konkreten Klassen
function buildLoginForm(factory: UIFactory): void {
  const emailInput = factory.createInput('E-Mail-Adresse');
  // ^ Egal welche Factory: createInput liefert immer Input
  const passwordInput = factory.createInput('Passwort');
  const submitButton = factory.createButton('Anmelden');
  // ^ TypeScript garantiert: emailInput, passwordInput, submitButton sind kompatibel
  // Sie kommen aus DERSELBEN Factory — nie Material + Bootstrap gemischt
}
```

> ⚡ **Angular-Bezug:** In deinen Angular-Projekten kennst du dieses Pattern bereits
> als **Dependency Injection mit Tokens**:
>
> ```typescript
> // Abstract Factory als Injection Token:
> const UI_FACTORY = new InjectionToken<UIFactory>('UIFactory');
>
> // Modul A liefert Material:
> { provide: UI_FACTORY, useClass: MaterialUIFactory }
>
> // Modul B liefert Bootstrap:
> { provide: UI_FACTORY, useClass: BootstrapUIFactory }
>
> // Komponente kennt nur das Token, nie die konkrete Klasse:
> constructor(@Inject(UI_FACTORY) private factory: UIFactory) {}
> ```
>
> Das ist Abstract Factory in Angular-Idiom. Wenn du zwischen Themes wechselst,
> tauschst du nur die Factory im Modul aus — alle Komponenten bleiben unveraendert.

---

## Singleton — und warum es oft ein Anti-Pattern ist

Das Singleton-Pattern stellt sicher, dass eine Klasse nur eine einzige Instanz hat
und bietet einen globalen Zugriffspunkt darauf. Klingt sinnvoll. Ist es oft nicht.

```typescript annotated
class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private connectionCount = 0;

  // Private Konstruktor: new DatabaseConnection() ist verboten
  private constructor(private readonly url: string) {}

  // Einziger Zugriffspunkt — erstellt Instanz bei Erstaufruf
  static getInstance(url: string): DatabaseConnection {
    // Nullish Coalescing Assignment (ES2021): erstellt nur wenn null
    DatabaseConnection.instance ??= new DatabaseConnection(url);
    return DatabaseConnection.instance;
    // PROBLEM: url wird beim zweiten Aufruf ignoriert!
    // Wer entscheidet, welche URL gewinnt? Der erste Aufrufer — zufaellig.
  }

  connect(): void {
    this.connectionCount++;
    console.log(`Verbindung ${this.connectionCount} zu ${this.url}`);
  }
}

// In Tests ist das ein Albtraum:
// Test A erstellt DatabaseConnection.getInstance('test-db')
// Test B erwartet eine saubere Instanz — bekommt aber die von Test A
// Reihenfolge der Tests bestimmt das Verhalten — nicht deterministisch!
```

**Warum Singleton gefaehrlich ist:**

1. **Globaler Zustand:** Versteckte Abhaengigkeiten — jeder kann die Instanz aendern
2. **Nicht testbar:** Du kannst keine Mock-Instanz injizieren
3. **Threading:** In Multi-Thread-Umgebungen braucht es Locks (nicht Thema in Node.js)
4. **Sequenzabhaengigkeit:** Wer die Instanz zuerst erstellt, gewinnt

> ⚡ **Angular-Alternative:** `@Injectable({ providedIn: 'root' })` ist technisch ein
> Singleton — aber ohne die Probleme. Angular's DI-Container verwaltet die Instanz,
> du kannst sie in Tests durch `TestBed.overrideProvider()` ersetzen. Das ist
> **Singleton-Verhalten ohne Singleton-Anti-Pattern**: Der Container kontrolliert
> die Lebenszeit, nicht die Klasse selbst.

---

## Experiment-Box: Factory mit Exhaustive Switch

Fuege diesen Code direkt in den TypeScript Playground ein und beobachte das Verhalten:

```typescript
type Environment = 'development' | 'staging' | 'production';

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

function createApiConfig(env: Environment): ApiConfig {
  switch (env) {
    case 'development':
      return { baseUrl: 'http://localhost:3000', timeout: 30000, retries: 0 };
    case 'staging':
      return { baseUrl: 'https://api.staging.example.com', timeout: 10000, retries: 2 };
    case 'production':
      return { baseUrl: 'https://api.example.com', timeout: 5000, retries: 3 };
  }
  // TypeScript weiss: dieser Code ist unerreichbar (never)
  // Fuege 'preview' zum Union hinzu OHNE neuen case — sieh den Fehler!
}

// Probiere: Aendere Environment zu 'development' | 'staging' | 'production' | 'preview'
// TypeScript meldet sofort: Function lacks ending return statement and return type
// does not include 'undefined'.
// Das ist exhaustive checking — dein Sicherheitsnetz!

const devConfig = createApiConfig('development');
console.log(devConfig.baseUrl); // http://localhost:3000
```

Dieses Muster ist fundamental: Ein Union Type als Eingabe, ein Switch, der exhaustiv
alle Faelle behandelt. TypeScript meldet sofort, wenn du einen neuen Wert zum Union
hinzufuegst ohne den Switch zu aktualisieren.

---

## Was du gelernt hast

- **Factory Method** erzeugt Objekte hinter einem Interface — TypeScript macht das
  mit Union Types und exhaustiven Switches typsicher
- **Abstract Factory** erzeugt Familien zusammengehoeriger Objekte — in Angular
  kennst du das als DI mit Tokens
- **Singleton** hat echte Probleme (globaler Zustand, Testbarkeit) — Angular's
  `providedIn: 'root'` loest dasselbe Problem ohne dieselben Gefahren
- Das GoF-Buch stammt aus einer Zeit ohne Union Types und strukturelles Typsystem —
  TypeScript verbessert viele dieser Patterns erheblich

**Kernkonzept:** Creational Patterns entkoppeln "was erzeugt wird" von "wer erzeugt".
TypeScript's Union Types und erschoepfende Pruefung machen diese Entkopplung
sicherer als in Java jemals moeglich war.

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen Factory Method und
> Abstract Factory? Wann brauchst du eine ganze Factory-Familie statt einer
> einzelnen Factory-Funktion?
> **Kernpunkte:** Factory Method erzeugt einen Typ | Abstract Factory erzeugt
> zusammengehoeriger Objekte als Familie | Abstract Factory verhindert Mischung
> kompatibler Typen aus verschiedenen Systemen

---

> **Pausenpunkt** — Du hast verstanden, wie TypeScript Creational Patterns
> sicherer und praeziser macht als in Java. Singleton ist oft ein Anti-Pattern —
> merke dir, warum.
>
> Weiter geht es mit: [Sektion 02: Structural Patterns](./02-structural-patterns.md)
