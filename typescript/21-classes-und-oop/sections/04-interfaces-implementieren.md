# Sektion 4: Interfaces implementieren

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Vererbung und Abstract Classes](./03-vererbung-und-abstract.md)
> Naechste Sektion: [05 - Static Members und Patterns](./05-static-und-patterns.md)

---

## Was du hier lernst

- Wie `implements` funktioniert und was es **wirklich** prueft
- Warum du **mehrere Interfaces** gleichzeitig implementieren kannst
- Den Unterschied zwischen **Structural Typing** und **Nominal Typing**
- Warum `implements` technisch **optional** ist — und trotzdem wichtig

---

## implements: Der explizite Vertrag

Wenn eine Klasse ein Interface mit `implements` angiebt, verspricht sie:
"Ich habe ALLE Felder und Methoden, die das Interface verlangt."
TypeScript prueft das zur Compilezeit.

```typescript annotated
interface Serializable {
  serialize(): string;
  // ^ Das Interface verlangt: Jede Klasse die 'Serializable' ist,
  //   muss eine serialize()-Methode mit Rueckgabe string haben.
}

interface Loggable {
  log(level: string): void;
}

class User implements Serializable, Loggable {
  // ^ Eine Klasse kann MEHRERE Interfaces implementieren! (Komma-getrennt)
  //   Das ist ein Vorteil gegenueber Vererbung (nur ein extends moeglich).

  constructor(
    public name: string,
    public email: string
  ) {}

  serialize(): string {
    return JSON.stringify({ name: this.name, email: this.email });
    // ^ MUSS vorhanden sein, sonst: Compile-Error
  }

  log(level: string): void {
    console.log(`[${level}] User: ${this.name}`);
    // ^ Auch diese Methode MUSS vorhanden sein (durch Loggable)
  }
}
```

### Was passiert bei fehlenden Methoden?

```typescript
interface Printable {
  print(): void;
  getPreview(): string;
}

class Document implements Printable {
  print(): void {
    console.log("Drucke...");
  }
  // FEHLER: Class 'Document' incorrectly implements interface 'Printable'.
  //   Property 'getPreview' is missing in type 'Document'.
}
```

> **Hintergrund: Structural Typing — "If it walks like a duck..."**
>
> TypeScript verwendet **Structural Typing** (auch "Duck Typing" genannt):
> Wenn ein Objekt die gleiche Struktur hat wie ein Typ, PASST es —
> egal ob es den Typ explizit implementiert oder nicht.
>
> Der Name kommt von einem alten Sprichwort: "If it looks like a duck,
> swims like a duck, and quacks like a duck, then it probably is a duck."
>
> Das steht im krassen Gegensatz zu **Nominal Typing** (Java, C#):
> Dort muss eine Klasse EXPLIZIT ein Interface implementieren —
> egal ob die Struktur passt oder nicht.
>
> TypeScript's Ansatz ist flexibler: Du kannst mit Objekten arbeiten,
> die zufaellig die richtige Form haben, ohne sie zwanghaft in eine
> Klassen-Hierarchie pressen zu muessen.

---

## Structural Typing in Aktion

Hier wird es spannend — und fuer Java/C#-Entwickler ueberraschend:

```typescript annotated
interface HasLength {
  length: number;
}

function printLength(item: HasLength): void {
  console.log(`Laenge: ${item.length}`);
}

// Alle diese Aufrufe sind gueltig — ohne 'implements HasLength'!
printLength("Hallo");        // String hat .length
printLength([1, 2, 3]);      // Array hat .length
printLength({ length: 42 }); // Objekt-Literal hat .length

class MyList {
  length: number = 0;
  // ^ MyList implementiert HasLength NICHT explizit,
  //   aber es hat die richtige Struktur!
}

printLength(new MyList());   // OK! Structural Typing
```

> **Denkfrage:** Wenn TypeScript strukturell prueft, warum braucht man dann
> `implements` ueberhaupt? Koennte man es nicht einfach weglassen?
>
> **Antwort:** Ja, technisch funktioniert es ohne `implements`! Aber:
>
> 1. **Fruehe Fehlermeldung**: Mit `implements` bekommst du den Fehler
>    direkt bei der Klasse ("fehlt Methode X"), nicht erst wenn du
>    die Klasse irgendwo als Serializable uebergibst.
>
> 2. **Dokumentation**: `implements Serializable` sagt sofort, was die
>    Klasse verspricht. Ohne implements muss man die gesamte Klasse lesen.
>
> 3. **Refactoring-Sicherheit**: Wenn sich das Interface aendert, zeigt
>    TypeScript sofort alle Klassen an, die nicht mehr passen.

---

## implements vs extends: Der Vergleich

Ein haeufiger Fehler ist die Verwechslung von `implements` und `extends`:

```typescript annotated
interface Flyable {
  fly(): void;
}

class Bird {
  eat(): void { console.log("Nom nom"); }
}

// extends: ERBT Code (Felder + Methoden mit Body)
class Penguin extends Bird {
  swim(): void { console.log("Schwimm!"); }
  // Penguin HAT automatisch eat() von Bird.
}

// implements: VERSPRICHT Struktur (kein Code geerbt!)
class Airplane implements Flyable {
  fly(): void { console.log("Fliege!"); }
  // ^ Airplane MUSS fly() selbst implementieren.
  //   implements gibt KEINEN Code weiter!
}
```

**Wichtig:** `implements` erbt **keinen Code**! Du musst alles selbst
schreiben. `extends` erbt alles. Du kannst beides kombinieren:

```typescript annotated
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class Animal {
  name: string;
  constructor(name: string) { this.name = name; }
}

class Duck extends Animal implements Flyable, Swimmable {
  // ^ EINE Elternklasse (extends) + MEHRERE Interfaces (implements)
  fly(): void { console.log(`${this.name} fliegt!`); }
  swim(): void { console.log(`${this.name} schwimmt!`); }
}
```

> **Experiment:** Erstelle ein Interface `Printable` mit einer Methode
> `print(): void`. Dann erstelle eine Klasse `Report` die `Printable`
> implementiert. Jetzt ENTFERNE das `implements Printable` — kompiliert
> der Code immer noch, wenn Report weiterhin eine `print()`-Methode hat?
> Das demonstriert Structural Typing in Aktion.

---

## Interface-Implementierung mit Generics

Interfaces koennen generisch sein (Lektion 13-14), und Klassen koennen
sie mit konkreten Typen implementieren:

```typescript annotated
interface Repository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(entity: T): void;
  delete(id: string): boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

class InMemoryUserRepository implements Repository<User> {
  // ^ Implementiert Repository mit T = User.
  //   Alle Methoden muessen User statt T verwenden.
  private users: Map<string, User> = new Map();

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findAll(): User[] {
    return [...this.users.values()];
  }

  save(entity: User): void {
    this.users.set(entity.id, entity);
  }

  delete(id: string): boolean {
    return this.users.delete(id);
  }
}
```

Das ist das **Repository Pattern** — eines der haeufigsten Patterns
in Backend-Anwendungen. Das Interface definiert den Vertrag,
die Implementierung kann austauschbar sein (InMemory, PostgreSQL, MongoDB...).

---

## Klassen als Interfaces

Eine Eigenheit von TypeScript: Du kannst eine **Klasse auch als Interface**
verwenden — sowohl mit `implements` als auch als Typ:

```typescript annotated
class Point {
  x: number = 0;
  y: number = 0;
}

// Eine Klasse als Interface verwenden!
class Point3D implements Point {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  // ^ Point3D verspricht: "Ich habe alles was Point hat (+ mehr)."
  //   TypeScript extrahiert die Struktur aus der Klasse.
}

// Auch als Typ funktioniert eine Klasse:
function printPoint(p: Point): void {
  console.log(`(${p.x}, ${p.y})`);
}

printPoint(new Point3D()); // OK: Point3D hat x und y
printPoint({ x: 1, y: 2 }); // OK: Structural Typing
```

> **Achtung:** Wenn die Klasse `private` oder `protected` Felder hat,
> funktioniert das NICHT — nur Klassen die tatsaechlich von ihr erben
> koennen private Felder teilen.

---

## Interfaces in Frameworks

> **In deinem Angular-Projekt** begegnest du Interfaces staendig als
> **Lifecycle Hooks**: `OnInit`, `OnDestroy`, `OnChanges`, `AfterViewInit`.
> Diese Interfaces definieren, welche Methoden Angular an bestimmten
> Zeitpunkten aufruft:
>
> ```typescript
> // Angular: Lifecycle-Hook-Interfaces
> @Component({ selector: 'app-user', template: '...' })
> class UserComponent implements OnInit, OnDestroy {
>   ngOnInit(): void {
>     // Wird nach dem Constructor aufgerufen
>     // Hier: Daten laden, Subscriptions starten
>   }
>
>   ngOnDestroy(): void {
>     // Wird beim Entfernen der Komponente aufgerufen
>     // Hier: Subscriptions beenden, Cleanup
>   }
> }
> ```
>
> **In React** werden Interfaces anders verwendet — naemlich fuer
> **Props und State**:
>
> ```typescript
> // React: Props als Interface
> interface ButtonProps {
>   label: string;
>   onClick: () => void;
>   disabled?: boolean;
> }
>
> function Button({ label, onClick, disabled }: ButtonProps) {
>   return <button onClick={onClick} disabled={disabled}>{label}</button>;
> }
> ```
>
> Der Unterschied: Angular nutzt Interfaces fuer **Verhaltensdefinition**
> (was kann die Klasse?), React nutzt sie fuer **Datendefinition**
> (welche Props erwartet die Komponente?).

---

## Index Signatures in implementierten Interfaces

Interfaces koennen Index Signatures haben (Lektion 16), und Klassen
koennen diese implementieren:

```typescript annotated
interface StringMap {
  [key: string]: string;
  // ^ Jeder String-Key muss einen String-Value haben
}

class Environment implements StringMap {
  [key: string]: string;
  // ^ Die Klasse muss die Index Signature uebernehmen

  NODE_ENV: string = "development";
  // ^ Explizite Properties muessen zum Index Signature passen
}

const env = new Environment();
env.NODE_ENV = "production";
env["CUSTOM_VAR"] = "custom"; // Auch dynamische Keys moeglich
```

> **Erklaere dir selbst:** Wenn TypeScript strukturell prueft (Structural Typing),
> warum zeigen IDEs trotzdem `implements` als Vorschlag an, wenn du eine
> Klasse schreibst? Was ist der praktische Nutzen von `implements`?
>
> **Kernpunkte:** Fruehe Fehlermeldung (beim Schreiben, nicht beim Verwenden) |
> Bessere Autovervollstaendigung in der IDE |
> Dokumentation der Absicht | Refactoring-Sicherheit

---

## Zusammenfassung: implements-Checkliste

| Frage | Antwort |
|---|---|
| Erbt `implements` Code? | **Nein** — nur Strukturpruefung |
| Erbt `extends` Code? | **Ja** — alle Felder und Methoden |
| Kann man mehrere Interfaces implementieren? | **Ja** (`implements A, B, C`) |
| Kann man mehrere Klassen erben? | **Nein** (nur `extends` EINE Klasse) |
| Muss man `implements` schreiben? | Nein (Structural Typing), aber empfohlen |
| Existieren Interfaces zur Laufzeit? | **Nein** (Type Erasure) |
| Existieren Klassen zur Laufzeit? | **Ja** |

---

## Was du gelernt hast

- **implements** ist ein Vertrag: Die Klasse verspricht, alle Interface-Mitglieder
  zu haben — TypeScript prueft das zur Compilezeit
- **Structural Typing** macht `implements` technisch optional — ein Objekt mit
  der richtigen Struktur passt auch ohne `implements`
- **Mehrere Interfaces** koennen implementiert werden (im Gegensatz zu
  nur einer Elternklasse bei `extends`)
- **implements erbt keinen Code** — das ist der Kernunterschied zu `extends`
- Du kannst **Klassen als Interfaces** verwenden und **Generics mit Interfaces**
  kombinieren fuer maechtige Patterns wie das Repository Pattern

> **Erklaere dir selbst:** Du designst ein Plugin-System. Plugins muessen
> `init()`, `execute()` und `cleanup()` implementieren. Wuerdest du ein
> Interface oder eine Abstract Class verwenden? Was wenn du einen Default
> fuer `cleanup()` bereitstellen willst (die meisten Plugins brauchen kein
> Cleanup)?
>
> **Kernpunkte:** Interface fuer den Vertrag | Abstract Class wenn Default-Code noetig |
> Default-cleanup() in abstract class, spezifische init()/execute() als abstract |
> Oder: Interface + Default via Mixin (Sektion 06)

**Kernkonzept zum Merken:** `implements` ist ein Compile-Zeit-Versprechen,
kein Laufzeit-Mechanismus. Es dokumentiert Absicht, erzwingt Vollstaendigkeit
und verbessert die Fehlermeldungen — aber es ist Structural Typing, das die
eigentliche Kompatibilitaetspruefung macht.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt
> wie Interfaces und Klassen in TypeScript zusammenspielen.
>
> Weiter geht es mit: [Sektion 05: Static Members und Patterns](./05-static-und-patterns.md)
