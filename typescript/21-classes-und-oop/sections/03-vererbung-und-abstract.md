# Sektion 3: Vererbung und Abstract Classes

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Access Modifiers](./02-access-modifiers.md)
> Naechste Sektion: [04 - Interfaces implementieren](./04-interfaces-implementieren.md)

---

## Was du hier lernst

- Wie **Vererbung** mit `extends` und `super()` in TypeScript funktioniert
- Was **Abstract Classes** sind und warum man sie nicht instanziieren kann
- Wie **Method Overriding** mit dem `override`-Keyword funktioniert (seit TS 4.3)
- Wann du **abstract** einsetzen solltest — und wann besser nicht

---

## Vererbung mit extends

Vererbung ist das Konzept, dass eine Klasse die Eigenschaften und
Methoden einer anderen Klasse uebernimmt. In TypeScript nutzt du
dafuer das `extends`-Schluesselwort:

```typescript annotated
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  move(distance: number): void {
    console.log(`${this.name} bewegt sich ${distance}m`);
  }
}

class Dog extends Animal {
  // ^ Dog ERBT alle Felder und Methoden von Animal.
  //   Dog hat automatisch 'name' und 'move()'.
  breed: string;

  constructor(name: string, breed: string) {
    super(name);
    // ^ super() ruft den Constructor der Elternklasse auf.
    //   MUSS als ERSTE Anweisung im Constructor stehen!
    this.breed = breed;
  }

  bark(): string {
    return `${this.name} bellt: Wuff!`;
    // ^ Neue Methode, die nur Dog hat.
  }
}

const dog = new Dog("Rex", "Schaeferhund");
dog.move(10);        // "Rex bewegt sich 10m" (geerbt von Animal)
console.log(dog.bark()); // "Rex bellt: Wuff!" (eigene Methode)
```

### Die super()-Regel

Wenn deine Subklasse einen Constructor hat, **muss** `super()` die
**erste Anweisung** sein — noch vor dem Zugriff auf `this`.
Das ist keine TypeScript-Eigenheit, sondern eine JavaScript-Regel:

```typescript
class Cat extends Animal {
  indoor: boolean;

  constructor(name: string, indoor: boolean) {
    // this.indoor = indoor; // FEHLER: 'super' muss zuerst aufgerufen werden
    super(name);             // Zuerst die Elternklasse initialisieren!
    this.indoor = indoor;    // Dann eigene Felder
  }
}
```

> **Hintergrund: "Favor composition over inheritance" — Gang of Four 1994**
>
> Das Buch "Design Patterns" (Gamma, Helm, Johnson, Vlissides — die
> **Gang of Four**) praegte 1994 einen der einflussreichsten Saetze der
> Softwareentwicklung: "Favor object composition over class inheritance."
>
> Der Grund: Vererbung erzeugt **enge Kopplung**. Wenn sich die
> Elternklasse aendert, koennen alle Subklassen kaputt gehen.
> Komposition — das Zusammenstecken von Objekten — ist flexibler.
>
> Das bedeutet nicht, dass Vererbung immer schlecht ist! Aber du
> solltest sie bewusst einsetzen: Wenn eine echte "ist-ein"-Beziehung
> besteht (ein Dog IST ein Animal), ist Vererbung sinnvoll.
> Wenn du nur Code teilen willst, ist Komposition besser
> (mehr dazu in Sektion 06).

---

## Method Overriding: Methoden ueberschreiben

Eine Subklasse kann Methoden der Elternklasse **ueberschreiben**,
um eigenes Verhalten zu definieren. Seit TypeScript 4.3 gibt es
das `override`-Keyword, das Tippfehler verhindert:

```typescript annotated
class Shape {
  area(): number {
    return 0;
  }

  describe(): string {
    return `Flaeche: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
    // ^ override: Signalisiert BEWUSST, dass eine Eltern-Methode
    //   ueberschrieben wird. Wenn 'area()' in Shape umbenannt wird,
    //   meldet TypeScript hier einen Fehler!
  }

  // override aera(): number { ... }
  // ^ FEHLER mit noImplicitOverride: 'aera' existiert nicht in Shape.
  //   Ohne 'override' wuerde der Tippfehler unbemerkt bleiben!
}

const circle = new Circle(5);
console.log(circle.describe()); // "Flaeche: 78.539..."
// ^ describe() ruft this.area() auf — und bekommt Circle's Version!
//   Das ist Polymorphie: Die RICHTIGE Methode wird zur Laufzeit gewaehlt.
```

> **Tipp:** Aktiviere `noImplicitOverride: true` in deiner `tsconfig.json`.
> Dann MUSS jede ueberschriebene Methode das `override`-Keyword haben.
> Das verhindert versehentliches Ueberschreiben und Tippfehler.

---

## Abstract Classes: Die Blaupause

Manchmal willst du eine Klasse definieren, die **nicht direkt
instanziiert werden darf** — sie dient nur als Vorlage fuer Subklassen.
Genau dafuer gibt es `abstract class`:

```typescript annotated
abstract class DatabaseConnection {
  // ^ 'abstract' bedeutet: Diese Klasse kann NICHT mit 'new' erstellt werden.
  //   Sie definiert eine Vorlage, die Subklassen ausfuellen muessen.

  abstract connect(): Promise<void>;
  // ^ abstract method: Hat KEINEN Body! Subklassen MUESSEN sie implementieren.
  abstract query(sql: string): Promise<unknown[]>;
  abstract disconnect(): Promise<void>;

  // Konkrete Methode: Hat einen Body und wird vererbt.
  async executeQuery(sql: string): Promise<unknown[]> {
    await this.connect();
    // ^ Ruft die abstract-Methode auf — welche Subklasse liefert die Implementierung
    const result = await this.query(sql);
    await this.disconnect();
    return result;
  }
}

// const db = new DatabaseConnection();
// ^ FEHLER: Cannot create an instance of an abstract class.

class PostgresConnection extends DatabaseConnection {
  override async connect(): Promise<void> {
    console.log("Verbinde mit PostgreSQL...");
  }

  override async query(sql: string): Promise<unknown[]> {
    console.log(`SQL: ${sql}`);
    return [];
  }

  override async disconnect(): Promise<void> {
    console.log("Verbindung getrennt");
  }
}

const db = new PostgresConnection();
// ^ OK! PostgresConnection ist nicht abstract und hat alle Methoden implementiert.
await db.executeQuery("SELECT * FROM users");
// Ausgabe: Verbinde... -> SQL: SELECT... -> Verbindung getrennt
```

> **Erklaere dir selbst:** Warum kann man eine `abstract class` nicht instanziieren?
> Was wuerde passieren, wenn TypeScript das zuliesse — und jemand eine abstrakte
> Methode aufruft, die keinen Body hat?
>
> **Kernpunkte:** Abstrakte Methoden haben keinen Code |
> Instanziierung wuerde zu einem Laufzeit-Fehler fuehren |
> TypeScript verhindert das zur Compilezeit |
> Nur Subklassen mit ALLEN implementierten Methoden sind instanziierbar

---

## Abstract Classes: Konkret + Abstract gemischt

Das Maechtige an abstrakten Klassen ist, dass sie **sowohl konkrete
als auch abstrakte Methoden** haben koennen. Das ist ein Kernunterschied
zu Interfaces (die nur Signaturen haben, keinen Code):

```typescript annotated
abstract class UIComponent {
  private visible: boolean = true;

  // Konkrete Methode: Wird vererbt
  show(): void { this.visible = true; }
  hide(): void { this.visible = false; }
  isVisible(): boolean { return this.visible; }

  // Abstrakte Methode: Muss implementiert werden
  abstract render(): string;
  // ^ Jede Subklasse entscheidet SELBST, wie sie gerendert wird.

  // Template Method Pattern: Nutzt abstract + konkret zusammen
  display(): void {
    if (this.visible) {
      console.log(this.render());
      // ^ Ruft die abstrakte Methode auf, die die Subklasse definiert.
      //   Das ist das "Template Method" Pattern (GoF).
    }
  }
}

class Button extends UIComponent {
  constructor(private label: string) { super(); }

  override render(): string {
    return `[ ${this.label} ]`;
  }
}

class TextInput extends UIComponent {
  constructor(private placeholder: string) { super(); }

  override render(): string {
    return `[____${this.placeholder}____]`;
  }
}

const btn = new Button("OK");
btn.display(); // "[ OK ]"
btn.hide();
btn.display(); // (nichts — hide() kommt aus UIComponent)
```

> **Denkfrage:** Angular's `AbstractControl` ist abstract — warum?
>
> In Angular Forms gibt es die Hierarchie:
> `AbstractControl` (abstract) → `FormControl`, `FormGroup`, `FormArray`
>
> `AbstractControl` definiert die gemeinsame API (value, valid, errors,
> setValue, patchValue, etc.) aber KANN nicht direkt instanziiert werden.
> Warum? Weil es keinen Sinn ergibt, ein "abstraktes" Formularelement
> zu haben — es muss entweder ein einzelnes Feld (`FormControl`),
> eine Gruppe (`FormGroup`) oder ein Array (`FormArray`) sein.
>
> Das ist genau das Muster: Die Basisklasse definiert die Schnittstelle
> und gemeinsame Logik, die Subklassen liefern die spezifische
> Implementierung.

---

## Vererbungsketten und super fuer Methoden

Du kannst nicht nur den Constructor, sondern auch Methoden
der Elternklasse mit `super` aufrufen:

```typescript annotated
class Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class TimestampLogger extends Logger {
  override log(message: string): void {
    const time = new Date().toISOString();
    super.log(`${time} — ${message}`);
    // ^ super.log() ruft die ELTERN-Version von log() auf.
    //   So erweiterst du Verhalten, statt es komplett zu ersetzen.
  }
}

class PrefixLogger extends TimestampLogger {
  constructor(private prefix: string) { super(); }

  override log(message: string): void {
    super.log(`[${this.prefix}] ${message}`);
    // ^ Ruft TimestampLogger.log() auf, die wiederum Logger.log() aufruft.
    //   Die Kette: PrefixLogger → TimestampLogger → Logger
  }
}

const logger = new PrefixLogger("AUTH");
logger.log("User logged in");
// [LOG] 2024-01-15T10:30:00.000Z — [AUTH] User logged in
```

> **Experiment:** Erstelle eine `abstract class Shape` mit einer abstrakten
> Methode `area(): number`. Dann erstelle `Circle`, `Rectangle` und `Triangle`
> als Subklassen. Was passiert, wenn du in einer Subklasse die `area()`-Methode
> "vergisst"? Wie reagiert der TypeScript-Compiler?

---

## Wann Abstract Class, wann Interface?

| Kriterium | Abstract Class | Interface |
|---|---|---|
| Kann konkreten Code enthalten | **Ja** | Nein |
| Mehrfach-Erweiterung | Nein (nur extends 1) | **Ja** (implements N) |
| Existiert zur Laufzeit | **Ja** (Prototype-Kette) | Nein (Type Erasure) |
| `instanceof` moeglich | **Ja** | Nein |
| Felder mit Default-Werten | **Ja** | Nein |
| Constructor | **Ja** | Nein |
| Access Modifiers | **Ja** | Nein (alles public) |

**Faustregel:**
- **Interface**: Wenn du nur eine **Form** (Struktur) definieren willst
- **Abstract Class**: Wenn du **gemeinsamen Code** teilen willst UND
  bestimmte Methoden von Subklassen implementieren lassen willst

> **In deinem Angular-Projekt** begegnest du beiden:
> - **Interfaces**: `OnInit`, `OnDestroy`, `CanActivate` — reine Vertraege
> - **Abstract Classes**: `AbstractControl`, `HttpInterceptor` (in aelteren
>   Versionen) — mit gemeinsamem Code
>
> In React sind Interfaces haeufiger als Abstract Classes, weil React
> seit Hooks kaum noch Klassen verwendet. Aber die Konzepte sind universell.

---

## Was du gelernt hast

- **extends** erstellt Subklassen, die Felder und Methoden erben
- **super()** ruft den Eltern-Constructor auf und MUSS die erste Anweisung sein
- **override** (TS 4.3+) markiert bewusst ueberschriebene Methoden und
  verhindert Tippfehler
- **abstract class** kann nicht instanziiert werden — sie definiert eine
  Vorlage mit konkreten und abstrakten Methoden
- **Abstract vs Interface**: Abstract Classes koennen Code enthalten,
  existieren zur Laufzeit und unterstuetzen Access Modifiers

> **Erklaere dir selbst:** Du hast eine Klasse `Logger` mit einer Methode
> `log()`. Du willst zwei Varianten: `ConsoleLogger` und `FileLogger`.
> Wuerdest du eine abstract class oder ein Interface verwenden? Was wenn
> beide Logger gemeinsamen Code fuer Log-Level-Filterung teilen sollen?
>
> **Kernpunkte:** Gemeinsamer Code → abstract class |
> Nur Vertrag → Interface | Gemeinsame Log-Level-Logik gehoert in die Basisklasse |
> Die spezifische Ausgabe (console vs. file) ist abstract

**Kernkonzept zum Merken:** Abstract Classes sind Blaupausen mit Luecken.
Die konkreten Methoden liefern gemeinsame Logik; die abstrakten Methoden
definieren, was jede Subklasse SELBST entscheiden muss.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt
> Vererbung und Abstract Classes in TypeScript.
>
> Weiter geht es mit: [Sektion 04: Interfaces implementieren](./04-interfaces-implementieren.md)
