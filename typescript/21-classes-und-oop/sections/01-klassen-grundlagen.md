# Sektion 1: Klassen-Grundlagen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Access Modifiers](./02-access-modifiers.md)

---

## Was du hier lernst

- Wie die **class-Syntax** in TypeScript funktioniert und was sie von reinem JavaScript unterscheidet
- Warum der **Constructor** mit typisierten Parametern das Herzstuck jeder Klasse ist
- Was **strictPropertyInitialization** bedeutet und warum TypeScript uninitialisierte Felder verbietet
- Wie **Methoden** und der **this-Kontext** in Klassen zusammenspielen

---

## Die Geschichte der Klassen in JavaScript

Bevor wir eine einzige Zeile Code schreiben, muessen wir verstehen,
**woher Klassen in JavaScript kommen** — denn das erklaert viele
ihrer Eigenheiten.

> **Hintergrund: Von Prototypen zu Klassen**
>
> JavaScript wurde 1995 von Brendan Eich in 10 Tagen entworfen.
> Er waehlte **Prototype-basierte Vererbung** statt der klassischen
> Klassen-Vererbung von Java oder C++. In JavaScript hatte jedes Objekt
> eine versteckte `[[Prototype]]`-Referenz auf ein anderes Objekt —
> das war die gesamte "OOP".
>
> Erst **ES2015 (ES6)** brachte 2015 das `class`-Schluesselwort.
> Aber Achtung: Das ist **nur syntaktischer Zucker** ueber dem
> Prototype-System! Unter der Haube passiert genau dasselbe wie vorher.
> TypeScript ging einen Schritt weiter: Es fuegt **Typ-Annotationen**,
> **Access Modifiers** und **Interfaces** hinzu — alles Compilezeit-Features,
> die zur Laufzeit verschwinden (Type Erasure, Lektion 02).
>
> ```javascript
> // SO sah OOP vor ES2015 aus:
> function Person(name, age) {
>   this.name = name;
>   this.age = age;
> }
> Person.prototype.greet = function() {
>   return "Hallo, ich bin " + this.name;
> };
>
> // SO sieht es seit ES2015 aus:
> class Person {
>   constructor(name, age) {
>     this.name = name;
>     this.age = age;
>   }
>   greet() {
>     return `Hallo, ich bin ${this.name}`;
>   }
> }
> // Unter der Haube: DASSELBE Prototype-System!
> ```

---

## Deine erste TypeScript-Klasse

<!-- section:summary -->
TypeScript-Klassen erfordern explizite Feld-Deklarationen mit Typ-Annotationen und zwingen via `strictPropertyInitialization` zur korrekten Initialisierung — alles Compilezeit-Sicherheit, die zur Laufzeit verschwindet.
<!-- depth:standard -->
In TypeScript deklarierst du Felder **mit Typ-Annotationen** — etwas,
das reines JavaScript nicht kennt. TypeScript prueft dann zur Compilezeit,
ob du die Felder korrekt initialisierst und verwendest.

```typescript annotated
class User {
  name: string;
  // ^ Feld-Deklaration MIT Typ. In JavaScript nicht noetig, in TypeScript Pflicht.
  age: number;
  // ^ Jedes Feld braucht einen Typ. TypeScript inferiert NICHT aus dem Constructor.
  email: string;

  constructor(name: string, age: number, email: string) {
  // ^ Der Constructor empfaengt typisierte Parameter.
    this.name = name;
    // ^ 'this' verweist auf die aktuelle Instanz.
    this.age = age;
    this.email = email;
    // ^ Alle Felder MUESSEN im Constructor initialisiert werden
    //   (oder einen Default-Wert haben), sonst: Compile-Error!
  }

  greet(): string {
  // ^ Methoden koennen einen Rueckgabetyp haben.
    return `Hallo, ich bin ${this.name} (${this.age} Jahre)`;
  }

  isAdult(): boolean {
    return this.age >= 18;
  }
}

const user = new User("Anna", 28, "anna@example.com");
// ^ 'new' erstellt eine Instanz. TypeScript prueft die Argument-Typen.
console.log(user.greet()); // "Hallo, ich bin Anna (28 Jahre)"
```

### Warum muessen Felder deklariert werden?

In JavaScript kannst du jederzeit `this.wasAuchImmer = 42` schreiben —
JavaScript beschwert sich nicht. TypeScript hingegen verlangt, dass du
**alle Felder in der Klasse deklarierst**, bevor du sie im Constructor
oder in Methoden verwendest. Das verhindert Tippfehler wie
`this.naem = name` (statt `this.name`).

<!-- depth:vollstaendig -->
> **Hintergrund: Von Prototypen zu Klassen**
>
> JavaScript wurde 1995 von Brendan Eich in 10 Tagen entworfen.
> Er waehlte **Prototype-basierte Vererbung** statt der klassischen
> Klassen-Vererbung von Java oder C++. In JavaScript hatte jedes Objekt
> eine versteckte `[[Prototype]]`-Referenz auf ein anderes Objekt —
> das war die gesamte "OOP".
>
> Erst **ES2015 (ES6)** brachte 2015 das `class`-Schluesselwort.
> Aber Achtung: Das ist **nur syntaktischer Zucker** ueber dem
> Prototype-System! Unter der Haube passiert genau dasselbe wie vorher.
> TypeScript ging einen Schritt weiter: Es fuegt **Typ-Annotationen**,
> **Access Modifiers** und **Interfaces** hinzu — alles Compilezeit-Features,
> die zur Laufzeit verschwinden (Type Erasure, Lektion 02).
>
> ```javascript
> // SO sah OOP vor ES2015 aus:
> function Person(name, age) {
>   this.name = name;
>   this.age = age;
> }
> Person.prototype.greet = function() {
>   return "Hallo, ich bin " + this.name;
> };
>
> // SO sieht es seit ES2015 aus:
> class Person {
>   constructor(name, age) {
>     this.name = name;
>     this.age = age;
>   }
>   greet() {
>     return `Hallo, ich bin ${this.name}`;
>   }
> }
> // Unter der Haube: DASSELBE Prototype-System!
> ```

> **Analogie:** Eine TypeScript-Klasse ist wie ein Bauplan mit praezisen
> Materialvorgaben. JavaScript akzeptiert "irgendwas das haelt", TypeScript
> besteht auf "Beton Klasse C20/25, Stahl B500B". Der Bauplan (Typen)
> verschwindet nach der Abnahme — das Gebaeude (JS-Code) bleibt.

> **Experiment:** Erstelle eine Klasse ohne Feld-Deklarationen und aktiviere
> `strict: true`. Welche Fehlermeldungen siehst du? Loese sie nacheinander
> mit den vier Wegen aus dem naechsten Abschnitt.

> **Framework-Referenz (Angular):** Angular Components sind Klassen mit dem
> `@Component`-Decorator. Jedes `@Injectable()` Service ist eine Klasse.
> Angular nutzt Klassen intensiv fuer Dependency Injection — der
> DI-Container identifiziert Services anhand ihrer Klasse (als Token).
> TypeScript's Structural Typing spielt hier normalerweise keine Rolle,
> weil Angular's DI nominal arbeitet (ueber die Konstruktorreferenz).
>
> ```typescript
> @Injectable({ providedIn: 'root' })
> class UserService {
>   private users: User[] = [];
>   getAll(): User[] { return this.users; }
> }
>
> @Component({ selector: 'app-user-list', template: '...' })
> class UserListComponent {
>   constructor(private userService: UserService) {}
>   // ^ Angular injiziert hier die KLASSE UserService — nicht irgendein
>   //   Objekt mit der gleichen Struktur.
> }
> ```

> **Selbsterklaerung:** Wenn TypeScript Structural Typing verwendet, warum
> braucht man dann ueberhaupt Klassen? Koennte man nicht alles mit Interfaces
> und Objekt-Literalen machen? Was bieten Klassen, das Interfaces nicht koennen?
>
> **Kernpunkte:** Klassen existieren zur Laufzeit (instanceof) |
> Klassen haben Konstruktoren fuer Initialisierungslogik |
> Klassen koennen private Felder (#) haben |
> Klassen ermoeglichen Vererbung mit konkretem Code

<!-- /depth -->

---

## strictPropertyInitialization — TypeScript passt auf

<!-- section:summary -->
`strictPropertyInitialization` verhindert uninitialisierte Felder — vier Loesungswege: Constructor-Zuweisung, Default-Wert, optional (`?`), oder Definite Assignment Assertion (`!`).
<!-- depth:standard -->
Mit `strict: true` in deiner `tsconfig.json` (was du seit Lektion 01
verwendest) ist automatisch `strictPropertyInitialization` aktiv.
Das bedeutet: **Jedes Feld muss im Constructor initialisiert werden**
oder einen Default-Wert haben.

```typescript
class BrokenUser {
  name: string;
  // ^ FEHLER: Property 'name' has no initializer and is not
  //   definitely assigned in the constructor. (TS2564)
}
```

Es gibt **vier Wege**, das zu loesen:

```typescript annotated
// Weg 1: Im Constructor zuweisen
class A {
  name: string;
  constructor(name: string) {
    this.name = name;
    // ^ Direkte Zuweisung im Constructor
  }
}

// Weg 2: Default-Wert
class B {
  name: string = "Unbekannt";
  // ^ Default-Wert direkt bei der Deklaration
}

// Weg 3: Optional (undefined erlaubt)
class C {
  name?: string;
  // ^ Optional: Typ ist string | undefined
}

// Weg 4: Definite Assignment Assertion (!)
class D {
  name!: string;
  // ^ "Vertrau mir, wird spaeter gesetzt" — VORSICHT: unsicher!
  // Nutze das nur wenn du WIRKLICH weisst was du tust
  // (z.B. bei Framework-Initialisierung wie Angular's ngOnInit)
}
```

<!-- depth:vollstaendig -->
> **Denkfrage:** Warum ist `class Foo { name: string }` in TypeScript
> ein Fehler ohne Initialisierung (`strictPropertyInitialization`)? Was wuerde
> passieren, wenn TypeScript das zuliesse — welchen Wert haette `name` zur
> Laufzeit?
>
> **Kernpunkte:** Ohne Initialisierung waere `name` zur Laufzeit `undefined` |
> TypeScript wuerde aber denken, es sei `string` | Das waere eine Luege im Typsystem |
> `strictPropertyInitialization` verhindert genau diese Luege

> **Analogie:** `strictPropertyInitialization` ist wie ein Sicherheitsgurt-
> Sensor: Das Auto faehrt auch ohne, aber das Warnpiepen erinnert dich daran,
> dass etwas fehlt. Der `!`-Operator ist wie den Sensor ausschalten — du
> weisst was du tust, aber die Verantwortung liegt bei dir.

> **Framework-Referenz (Angular):** Der `!`-Operator (Definite Assignment)
> ist in Angular bei `@ViewChild()` und `@ContentChild()` haeufig:
>
> ```typescript
> @Component({ ... })
> class MyComponent {
>   @ViewChild('myInput') inputRef!: ElementRef;
>   // ^ Angular setzt das erst in ngAfterViewInit.
>   //   TypeScript kann das nicht wissen, also !
> }
> ```

<!-- /depth -->

---

## Methoden und der this-Kontext

<!-- section:summary -->
Methoden haben Zugriff auf `this`, aber dieser geht bei Callback-Uebergabe verloren — Arrow-Functions als Klassen-Felder loesen das Problem durch lexikalisches Binding.
<!-- depth:standard -->
Methoden in Klassen haben Zugriff auf `this` — aber dieser Zugriff
kann **verloren gehen**, wenn du eine Methode als Callback uebergibst.
Das ist eine der haeufigsten Fehlerquellen in TypeScript/JavaScript:

```typescript annotated
class Counter {
  count: number = 0;

  increment(): void {
    this.count++;
    // ^ 'this' verweist auf die Counter-Instanz — solange
    //   die Methode als counter.increment() aufgerufen wird.
  }

  // Arrow-Function als Klassen-Feld: 'this' ist IMMER gebunden
  incrementSafe = (): void => {
    this.count++;
    // ^ Hier ist 'this' durch die Arrow-Function automatisch
    //   an die Instanz gebunden. Funktioniert auch als Callback.
  };

  getCount(): number {
    return this.count;
  }
}

const counter = new Counter();
counter.increment();   // OK: this = counter
console.log(counter.getCount()); // 1

// GEFAHR: Methode als Callback
const fn = counter.increment;
// fn(); // RUNTIME ERROR: Cannot read property 'count' of undefined
// ^ 'this' ist verloren! Die Funktion hat keinen Bezug mehr zu counter.

const safeFn = counter.incrementSafe;
safeFn(); // OK! Arrow-Function behaelt 'this'.
console.log(counter.getCount()); // 2
```

<!-- depth:vollstaendig -->
> **Denkfrage:** Was ist der Unterschied zwischen einem Interface und einer Klasse?
> Beide definieren eine Struktur — aber Interfaces existieren nur zur Compilezeit
> (Type Erasure), waehrend Klassen zur Laufzeit als JavaScript-Konstruktorfunktionen
> existieren. Interfaces koennen nicht instanziiert werden; Klassen schon.
> Was bedeutet das fuer `instanceof`?
>
> **Antwort:** `instanceof` funktioniert nur mit Klassen, weil es zur Laufzeit
> die Prototype-Kette prueft. Interfaces existieren zur Laufzeit nicht —
> `value instanceof MyInterface` waere ein Fehler.

> **Analogie:** `this` ist wie ein Namensschild. Wenn du `counter.increment()`
> rufst, traegt die Methode das Schild "Counter". Wenn du sie als Callback
> uebergibst, verliert sie das Schild — sie weiss nicht mehr, wer sie ist.
> Die Arrow-Function naeht das Namensschild fest an die Jacke.

> **Framework-Referenz (React):** In React Class Components war dieses
> Problem allgegenwaertig. Einer der Hauptgruende fuer den Wechsel zu Hooks
> war die ständige `this`-Verwirrung:
>
> ```typescript
> // React Class Component — das beruechtigte this-Problem
> class MyButton extends React.Component {
>   state = { count: 0 };
>   // Loesung: Arrow-Function als Klassen-Feld
>   handleClick = () => { this.setState({ count: this.state.count + 1 }); };
>   render() { return <button onClick={this.handleClick}>Click</button>; }
> }
> // Hooks loesen das komplett:
> function MyButton() {
>   const [count, setCount] = useState(0);
>   const handleClick = () => setCount(count + 1); // Kein this-Problem!
>   return <button onClick={handleClick}>Click</button>;
> }
> ```

<!-- /depth -->

---

## Klassen und Typen: Structural Typing

<!-- section:summary -->
TypeScript verwendet Structural Typing auch fuer Klassen: Ein Objekt mit passender Struktur kann als Klassen-Instanz behandelt werden — im Gegensatz zu nominalem Typing in Java oder C#.
<!-- depth:standard -->
Einer der ueberraschendsten Aspekte von TypeScript ist, dass Klassen
dem **Structural Typing** unterliegen — genau wie Interfaces.
Das erinnerst du vielleicht aus L05 (Objekt-Typen) und L08 (Type Aliases): TypeScript prueft nie den *Namen* eines Typs, sondern seine *Struktur*. Klassen sind da keine Ausnahme.
Das bedeutet: Wenn ein Objekt die gleiche Struktur hat wie eine
Klasse, kann es als diese Klasse behandelt werden.

```typescript annotated
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

function printPoint(p: Point): void {
  console.log(`(${p.x}, ${p.y})`);
}

// Das funktioniert OHNE 'new Point'!
printPoint({ x: 10, y: 20 });
// ^ Structural Typing: Das Objekt hat x: number und y: number,
//   also passt es zum Typ 'Point'. Kein extends, kein implements noetig.
```

<!-- depth:vollstaendig -->
> **Experiment:** Erstelle eine Klasse `Dog` mit einem Feld `name: string`
> und einer Methode `bark(): string`. Dann erstelle ein einfaches Objekt
> `{ name: "Bello", bark: () => "Wuff!" }` und uebergib es an eine Funktion
> die `Dog` erwartet. Kompiliert das? Warum?

Das ist ein fundamentaler Unterschied zu Java oder C#, wo Klassen
**nominal** getypt sind: Dort muesste ein Objekt explizit von `Point`
erben oder `Point` implementieren.

<!-- /depth -->

---

## Der Typ einer Klasse: Instanz-Typ vs. Konstruktor-Typ

<!-- section:summary -->
TypeScript unterscheidet den Instanz-Typ (`Animal`) vom Konstruktor-Typ (`typeof Animal`) — ersteres beschreibt Objekte, letzteres die Klasse selbst als Parameter.
<!-- depth:standard -->
TypeScript unterscheidet zwei Arten von Typen bei Klassen — ein
Detail, das oft uebersehen wird aber wichtig ist:

```typescript annotated
class Animal {
  constructor(public name: string) {}
  // ^ Parameter Property Kurzschreibweise (dazu mehr in Sektion 05)
}

// 1. Instanz-Typ: Der Typ einer Instanz
let pet: Animal = new Animal("Kitty");
// ^ 'Animal' als Typ = der Instanz-Typ (hat name, etc.)

// 2. Konstruktor-Typ: Der Typ der Klasse SELBST
let AnimalClass: typeof Animal = Animal;
// ^ 'typeof Animal' = der Typ des Konstruktors
//   (hat .prototype, kann mit 'new' aufgerufen werden)

const pet2 = new AnimalClass("Buddy");
// ^ Funktioniert! AnimalClass ist der Konstruktor.
```

<!-- depth:vollstaendig -->
> **Analogie:** Der Instanz-Typ ist wie der Grundriss eines fertigen Hauses —
> du beschreibst, was im Haus ist (Zimmer, Tueren). Der Konstruktor-Typ
> ist wie der Bauplan + die Baufirma — er beschreibt, WIE man das Haus baut.

Das wird wichtig, wenn du **Klassen als Parameter** uebergeben willst —
etwa in einer Factory-Funktion (mehr dazu in Sektion 05).

<!-- /depth -->

---

## Zusammenfassung: class in TypeScript vs JavaScript

| Feature | JavaScript | TypeScript |
|---|---|---|
| Feld-Deklaration | Optional | Pflicht (mit Typ) |
| Feld-Initialisierung | Egal | Pflicht (`strict`) |
| Typ-Pruefung im Constructor | Nein | Ja |
| Methoden-Rueckgabetyp | Nein | Optional (Annotation) |
| Access Modifiers (private) | `#private` (ES2022) | `private`, `protected`, `readonly` |
| Interfaces implementieren | Nein | `implements` |
| Abstract Classes | Nein | `abstract class` |

---

## Was du gelernt hast

- Klassen in TypeScript sind **syntaktischer Zucker** ueber dem Prototype-System,
  ergaenzt um Typ-Annotationen und strikte Initialisierungspruefungen
- **strictPropertyInitialization** erzwingt, dass jedes Feld initialisiert wird —
  vier Wege: Constructor, Default-Wert, optional (`?`), Definite Assignment (`!`)
- **this** kann in Methoden verloren gehen, wenn sie als Callback uebergeben werden —
  Arrow-Functions als Klassen-Felder loesen das Problem
- TypeScript's **Structural Typing** gilt auch fuer Klassen: Ein Objekt mit der
  gleichen Struktur kann als Klassen-Instanz behandelt werden

> **Erklaere dir selbst:** Wenn TypeScript Structural Typing verwendet, warum
> braucht man dann ueberhaupt Klassen? Koennte man nicht alles mit Interfaces
> und Objekt-Literalen machen? Was bieten Klassen, das Interfaces nicht koennen?
>
> **Kernpunkte:** Klassen existieren zur Laufzeit (instanceof) |
> Klassen haben Konstruktoren fuer Initialisierungslogik |
> Klassen koennen private Felder (#) haben |
> Klassen ermoeglichen Vererbung mit konkretem Code

**Kernkonzept zum Merken:** TypeScript-Klassen sind JavaScript-Klassen mit
Typ-Sicherheit. Die Typen verschwinden zur Laufzeit (Type Erasure), aber
die Klasse selbst bleibt als JavaScript-Konstruktorfunktion bestehen.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt die
> Grundlagen der class-Syntax in TypeScript.
>
> Weiter geht es mit: [Sektion 02: Access Modifiers](./02-access-modifiers.md)
