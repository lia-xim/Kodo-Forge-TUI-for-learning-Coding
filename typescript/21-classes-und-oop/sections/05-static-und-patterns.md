# Sektion 5: Static Members und Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Interfaces implementieren](./04-interfaces-implementieren.md)
> Naechste Sektion: [06 - Klassen in der Praxis](./06-klassen-in-der-praxis.md)

---

## Was du hier lernst

- Wie **static** Felder und Methoden funktionieren und wann sie sinnvoll sind
- Was **Parameter Properties** sind und wie sie Code drastisch verkuerzen
- Das **Singleton-Pattern** und warum es kontrovers ist
- Das **Factory-Pattern** als elegante Alternative zu Konstruktoren

---

## Static Members: Gehoert der Klasse, nicht der Instanz
<!-- section:summary -->
Normale Felder und Methoden gehoeren zu einer **Instanz** — jedes

<!-- depth:standard -->
Normale Felder und Methoden gehoeren zu einer **Instanz** — jedes
`new MyClass()` hat seine eigene Kopie. **Static** Felder und Methoden
gehoeren zur **Klasse selbst** und existieren nur einmal:

```typescript annotated
class MathHelper {
  static PI: number = 3.14159265358979;
  // ^ static: Existiert auf der KLASSE, nicht auf Instanzen.
  //   Zugriff: MathHelper.PI (nicht new MathHelper().PI)

  static add(a: number, b: number): number {
    return a + b;
  }

  static multiply(a: number, b: number): number {
    return a * b;
  }
}

// Zugriff OHNE new — direkt ueber die Klasse
console.log(MathHelper.PI);           // 3.14159...
console.log(MathHelper.add(2, 3));    // 5
console.log(MathHelper.multiply(4, 5)); // 20

// const helper = new MathHelper();
// helper.PI; // FEHLER: Property 'PI' does not exist on type 'MathHelper'
// ^ Static Members existieren NICHT auf Instanzen!
```

### this in static-Methoden

In einer `static`-Methode verweist `this` auf die **Klasse**, nicht auf
eine Instanz. Das ist ein haeufiger Stolperstein:

```typescript annotated
class Config {
  static defaults = { timeout: 3000, retries: 3 };

  static getTimeout(): number {
    return this.defaults.timeout;
    // ^ 'this' = die Klasse Config, NICHT eine Instanz.
    //   Aequivalent zu Config.defaults.timeout
  }
}

console.log(Config.getTimeout()); // 3000
```

<!-- depth:vollstaendig -->
> **Hintergrund: Das Singleton-Pattern — GoF 1995**
>
> Die Gang of Four beschrieb 1995 das **Singleton-Pattern**: Eine Klasse,
> von der es **genau eine Instanz** gibt. Es war eines der einfachsten
> Patterns im Buch — und wurde eines der **kontroversesten**.
>
> Warum kontrovers? Singletons sind im Grunde **globaler Zustand**
> mit einem schoenen Namen. Sie machen Unit-Tests schwierig (weil man
> den globalen Zustand nicht einfach zuruecksetzen kann), erzeugen
> versteckte Abhaengigkeiten und verhindern Parallelitaet.
>
> Trotzdem sind Singletons manchmal sinnvoll: Datenbankverbindungs-Pools,
> Konfigurationsobjekte oder Logging-Systeme. Der Trick ist, sie
> **bewusst** einzusetzen — nicht als Default-Loesung.

---

<!-- /depth -->
## Das Singleton-Pattern in TypeScript
<!-- section:summary -->
So implementierst du ein klassisches Singleton:

<!-- depth:standard -->
So implementierst du ein klassisches Singleton:

```typescript annotated
class Database {
  private static instance: Database | null = null;
  // ^ static: Die eine Instanz wird auf der KLASSE gespeichert.

  private constructor(
    private connectionString: string
  ) {
    // ^ private constructor: Verhindert 'new Database()' von aussen!
    //   Nur die Klasse selbst kann sich instanziieren.
    console.log("Datenbankverbindung hergestellt");
  }

  static getInstance(): Database {
    if (Database.instance === null) {
      Database.instance = new Database("postgresql://localhost/mydb");
      // ^ Lazy Initialization: Nur beim ersten Aufruf wird die Instanz erstellt.
    }
    return Database.instance;
  }

  query(sql: string): void {
    console.log(`Query: ${sql}`);
  }
}

// const db = new Database("..."); // FEHLER: Constructor is private
const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true — DIESELBE Instanz!
```

<!-- depth:vollstaendig -->
> **Denkfrage:** Angular nutzt `providedIn: 'root'` statt das
> Singleton-Pattern direkt. Warum?
>
> **Antwort:** Angular's Dependency Injection System ist maechtigter:
> - Es verwaltet den Lebenszyklus automatisch (Lazy Creation, Cleanup)
> - Es erlaubt verschiedene Instanzen in verschiedenen Injector-Scopes
> - Es macht Unit-Tests einfach (Mock-Services injizieren)
> - Der Service muss nicht wissen, dass er ein Singleton ist
>
> `providedIn: 'root'` macht einen Service zum Singleton — aber
> durch DI verwaltet, nicht durch den Service selbst.

---

<!-- /depth -->
## Parameter Properties: Die Kurzschreibweise
<!-- section:summary -->
Dieses Feature spart dir enorm viel Boilerplate. Statt Felder zu

<!-- depth:standard -->
Dieses Feature spart dir enorm viel Boilerplate. Statt Felder zu
deklarieren UND im Constructor zuzuweisen, machst du beides in
einem Schritt:

```typescript annotated
// VORHER: Ausfuehrlich (18 Zeilen)
class UserVerbose {
  public name: string;
  private email: string;
  readonly id: number;

  constructor(name: string, email: string, id: number) {
    this.name = name;
    this.email = email;
    this.id = id;
  }
}

// NACHHER: Parameter Properties (4 Zeilen!)
class UserCompact {
  constructor(
    public name: string,
    private email: string,
    readonly id: number
    // ^ Modifier VOR dem Parameter = automatische Feld-Deklaration + Zuweisung!
    //   'public name: string' im Constructor = Feld 'name' + this.name = name
  ) {}
  // ^ Leerer Constructor-Body — alles wird automatisch erledigt.
}

// Beide Klassen verhalten sich IDENTISCH:
const user = new UserCompact("Anna", "anna@mail.de", 42);
console.log(user.name);  // "Anna"
console.log(user.id);    // 42
// user.email;            // FEHLER: private
```

<!-- depth:vollstaendig -->
> **Erklaere dir selbst:** Warum ist `constructor(private name: string)` eine
> Kurzschreibweise? Was genau passiert hinter den Kulissen — welche drei
> Dinge erledigt TypeScript fuer dich?
>
> **Kernpunkte:** 1. Feld-Deklaration (private name: string) |
> 2. Constructor-Parameter (name: string) |
> 3. Zuweisung (this.name = name) — alles in EINEM Schritt

Du kannst Parameter Properties mit normalen Parametern mischen:

```typescript
class Product {
  constructor(
    public name: string,        // Parameter Property
    public price: number,       // Parameter Property
    discountPercent: number     // Normaler Parameter (KEIN Modifier = kein Feld!)
  ) {
    // discountPercent ist NUR im Constructor verfuegbar,
    // es wird NICHT als Feld gespeichert.
    if (discountPercent > 0) {
      this.price *= (1 - discountPercent / 100);
    }
  }
}
```

---

<!-- /depth -->
## Das Factory-Pattern: Kluge Konstruktion
<!-- section:summary -->
Manchmal reicht ein einfacher Constructor nicht aus — du brauchst

<!-- depth:standard -->
Manchmal reicht ein einfacher Constructor nicht aus — du brauchst
**verschiedene Wege**, ein Objekt zu erstellen. Hier kommt das
Factory-Pattern:

```typescript annotated
class Color {
  private constructor(
    public readonly r: number,
    public readonly g: number,
    public readonly b: number
  ) {
    // ^ private constructor: Nur die Factory-Methoden koennen Color erstellen.
  }

  // Factory-Methoden: Verschiedene Wege, eine Color zu erstellen
  static fromRGB(r: number, g: number, b: number): Color {
    return new Color(r, g, b);
    // ^ Greift auf den private Constructor zu — das geht NUR innerhalb der Klasse.
  }

  static fromHex(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return new Color(r, g, b);
    // ^ Komplexe Parsing-Logik — gehoert nicht in den Constructor.
  }

  static fromName(name: string): Color {
    const colors: Record<string, [number, number, number]> = {
      red: [255, 0, 0],
      green: [0, 255, 0],
      blue: [0, 0, 255],
    };
    const [r, g, b] = colors[name] ?? [0, 0, 0];
    return new Color(r, g, b);
  }

  toString(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}

// Drei verschiedene Wege, eine Color zu erstellen:
const red = Color.fromRGB(255, 0, 0);
const blue = Color.fromHex("#0000FF");
const green = Color.fromName("green");
// const c = new Color(1, 2, 3); // FEHLER: Constructor is private
```

**Vorteile des Factory-Patterns:**
- **Sprechende Namen**: `fromHex()` ist klarer als `new Color("hex", "#FF0000")`
- **Validierung**: Fehlerpruefung vor der Instanziierung
- **Caching**: Factories koennen Instanzen wiederverwenden
- **Polymorphie**: Die Factory kann verschiedene Subklassen zurueckgeben

<!-- depth:vollstaendig -->
> **Experiment:** Erweitere die `Color`-Klasse um eine Factory-Methode
> `Color.fromHSL(h, s, l)`. Du musst HSL zu RGB konvertieren — die
> genaue Formel ist hier nicht wichtig. Wichtig ist: Die Konvertierungslogik
> gehoert in die Factory, NICHT in den Constructor.

---

<!-- /depth -->
## Static Blocks: Initialisierung (TS 4.6+)
<!-- section:summary -->
Seit TypeScript 4.6 kannst du **static Blocks** verwenden — Code,

<!-- depth:standard -->
Seit TypeScript 4.6 kannst du **static Blocks** verwenden — Code,
der einmal beim Laden der Klasse ausgefuehrt wird:

```typescript annotated
class Environment {
  static readonly mode: string;
  static readonly isProduction: boolean;

  static {
    // ^ Static Block: Wird einmal ausgefuehrt, wenn die Klasse geladen wird.
    //   Perfekt fuer komplexe Initialisierung.
    const env = process.env.NODE_ENV ?? "development";
    this.mode = env;
    this.isProduction = env === "production";
    console.log(`Environment: ${this.mode}`);
  }
}

// Beim Import der Datei wird der Static Block ausgefuehrt:
// "Environment: development"
console.log(Environment.isProduction); // false
```

---

<!-- /depth -->
## Klassen als Typ-Parameter uebergeben
<!-- section:summary -->
Manchmal brauchst du eine Funktion, die **eine Klasse selbst** als

<!-- depth:standard -->
Manchmal brauchst du eine Funktion, die **eine Klasse selbst** als
Parameter akzeptiert — nicht eine Instanz:

```typescript annotated
// Der Typ 'new (...args: any[]) => T' beschreibt einen Konstruktor
type Constructor<T> = new (...args: any[]) => T;

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args);
  // ^ ctor ist eine Klasse (Konstruktorfunktion), die mit 'new' aufgerufen wird.
}

class User {
  constructor(public name: string) {}
}

class Product {
  constructor(public title: string, public price: number) {}
}

const user = createInstance(User, "Anna");
// ^ TypeScript inferiert: T = User, Rueckgabe = User
console.log(user.name); // "Anna"

const product = createInstance(Product, "TypeScript-Buch", 29.99);
console.log(product.title); // "TypeScript-Buch"
```

<!-- depth:vollstaendig -->
> **In deinem Angular-Projekt** nutzt das DI-System genau dieses Muster:
> Du uebergibst eine KLASSE als Token an den Injector, und der Injector
> erstellt die Instanz fuer dich:
>
> ```typescript
> // Angular DI nutzt Klassen als Tokens:
> constructor(private userService: UserService) {}
> // ^ Angular sieht "UserService" (die Klasse), erstellt eine Instanz
> //   und injiziert sie. Das ist das Factory-Pattern via DI-Container.
> ```
>
> In React ist dieses Pattern seltener, weil React auf Funktionen
> statt Klassen setzt. Aber in React-Testing-Libraries wie
> `testing-library` findest du aehnliche Factory-Funktionen.

---

<!-- /depth -->
## Zusammenfassung: Static + Parameter Properties

| Feature | Was es tut | Beispiel |
|---|---|---|
| `static field` | Feld auf der Klasse | `static count = 0` |
| `static method` | Methode auf der Klasse | `static create()` |
| `static {}` | Initialisierungsblock | Komplexe Static-Setup-Logik |
| Parameter Property | Feld-Deklaration + Zuweisung | `constructor(public name: string)` |
| Private Constructor | Verhindert `new` von aussen | Singleton, Factory |

---

## Was du gelernt hast

- **static** Felder und Methoden gehoeren der Klasse, nicht Instanzen —
  Zugriff ueber `ClassName.member`, nicht `instance.member`
- **Parameter Properties** verkuerzen Klassen drastisch: `public name: string`
  im Constructor deklariert das Feld und weist es zu
- Das **Singleton-Pattern** nutzt private Constructor + static getInstance() —
  kontrovers, weil es globalen Zustand erzeugt
- Das **Factory-Pattern** nutzt private Constructor + static Factory-Methoden —
  flexibler und testbarer als direkte Instanziierung

> **Erklaere dir selbst:** Warum nutzt Angular `providedIn: 'root'` statt
> das Singleton-Pattern direkt? Was sind die Vorteile von DI gegenueber
> einem manuellen Singleton?
>
> **Kernpunkte:** DI verwaltet Lebenszyklus automatisch |
> Mock-Injection fuer Tests | Verschiedene Scopes moeglich |
> Service muss nicht wissen, dass er Singleton ist |
> Keine globale Variable, kein privater Constructor noetig

**Kernkonzept zum Merken:** Static Members gehoeren der Klasse, nicht den
Instanzen. Parameter Properties sind syntaktischer Zucker fuer das haeufigste
Muster: Feld deklarieren + im Constructor zuweisen. Factories bieten
kontrollierte Instanziierung.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du kennst jetzt Static
> Members, Parameter Properties und die wichtigsten Class Patterns.
>
> Weiter geht es mit: [Sektion 06: Klassen in der Praxis](./06-klassen-in-der-praxis.md)
