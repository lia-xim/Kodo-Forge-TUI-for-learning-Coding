# Sektion 6: Funktions-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Der this-Parameter](./05-this-parameter.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wie man **Type Guards** (benutzerdefinierte Typ-Einschraenkungen) schreibt
- Was **Assertion Functions** sind und wie `asserts` funktioniert
- Wie **Constructor Signatures** und **Factory Functions** typisiert werden
- Das **Currying-Pattern** und warum es in TypeScript maechtiger ist als erwartet

---

## Type Guards: Benutzerdefinierte Typ-Einschraenkungen

Du kennst `typeof` und `instanceof` fuer Type Narrowing. Aber was,
wenn du einen eigenen Check brauchst?

```typescript annotated
// Type Guard: Rueckgabetyp "value is Type"
function isString(value: unknown): value is string {
//                                 ^^^^^^^^^^^^^^^^
//                                 "Wenn true, ist value ein string"
  return typeof value === "string";
}

// Verwendung: TypeScript vertraut dem Guard
function process(input: unknown) {
  if (isString(input)) {
    console.log(input.toUpperCase());
//              ^^^^^ TypeScript weiss: input ist string
  }
}
```

### Type Guards fuer komplexe Typen

```typescript annotated
interface User {
  name: string;
  email: string;
  age: number;
}

function isUser(value: unknown): value is User {
//                                ^^^^^^^^^^^^ Custom Type Guard
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value &&
    "age" in value &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string" &&
    typeof (value as User).age === "number"
  );
}

// Jetzt kann man API-Daten sicher pruefen:
function handleApiResponse(data: unknown) {
  if (isUser(data)) {
    // TypeScript weiss: data ist User
    console.log(`${data.name} (${data.email})`);
  } else {
    console.log("Ungueltige Daten!");
  }
}
```

> 📖 **Hintergrund: Warum braucht man Type Guards?**
>
> TypeScript hat eine Einschraenkung: Es kann nur mit eingebauten
> Typ-Pruefungen (`typeof`, `instanceof`, `in`) automatisch narrowen.
> Fuer komplexe Pruefungen (z.B. "hat dieses Objekt bestimmte
> Properties mit bestimmten Typen?") braucht man eine eigene Funktion.
> Der `value is Type`-Syntax sagt TypeScript: "Vertraue mir —
> wenn diese Funktion true zurueckgibt, ist der Wert von diesem Typ."
>
> **Achtung:** TypeScript **prueft nicht**, ob dein Guard korrekt ist!
> Wenn du `return true` schreibst, glaubt TypeScript dir — auch wenn
> der Wert gar kein User ist. Type Guards sind ein **Vertrag** zwischen
> dir und dem Compiler.

---

## Assertion Functions

Assertion Functions gehen einen Schritt weiter: Sie werfen einen Error,
wenn die Bedingung nicht erfuellt ist — und danach ist der Typ garantiert:

```typescript annotated
function assertIsString(value: unknown): asserts value is string {
//                                       ^^^^^^^^^^^^^^^^^^^^^^^^
//                                       "Nach diesem Aufruf IST value ein string"
//                                       "Oder diese Funktion hat einen Error geworfen"
  if (typeof value !== "string") {
    throw new Error(`Erwartet string, erhalten: ${typeof value}`);
  }
}

function process(input: unknown) {
  assertIsString(input);
  // Ab hier: TypeScript weiss, input ist string
  console.log(input.toUpperCase());
//            ^^^^^ Typ: string — garantiert nach assertIsString
}
```

### assert ohne Typ-Einschraenkung

```typescript annotated
function assert(condition: unknown, message: string): asserts condition {
//                                                    ^^^^^^^^^^^^^^^^^
//                                                    "condition ist truthy nach dem Aufruf"
  if (!condition) {
    throw new Error(message);
  }
}

function divide(a: number, b: number): number {
  assert(b !== 0, "Division durch null!");
  // TypeScript weiss: b !== 0 ist true
  return a / b;
}
```

> 💭 **Denkfrage:** Was ist der Unterschied zwischen einem Type Guard
> (`value is T`) und einer Assertion Function (`asserts value is T`)?
>
> **Antwort:** Ein Type Guard gibt `boolean` zurueck — der Aufrufer
> entscheidet mit `if`. Eine Assertion Function wirft bei Misserfolg
> und der Code danach laeuft **nur bei Erfolg** weiter. Type Guards
> sind fuer Verzweigungen, Assertion Functions fuer Garantien.

---

## Constructor Signatures

Manchmal braucht man einen Typ fuer "etwas, das man mit `new` aufrufen kann":

```typescript annotated
// Constructor Signature: new (...args) => Instance
type Constructor<T> = new (...args: unknown[]) => T;
//                    ^^^
//                    "new" macht es zu einer Constructor Signature

function createInstance<T>(ctor: Constructor<T>): T {
//                               ^^^^^^^^^^^^^^
//                               Akzeptiert eine Klasse als Argument
  return new ctor();
}

class User {
  name = "Default User";
}

const user = createInstance(User);
//    ^^^^  Typ: User
console.log(user.name);  // "Default User"
```

### Callable und Constructable

```typescript annotated
interface DateConstructor {
  // Callable: Date("...") gibt string zurueck
  (value: string): string;
  // Constructable: new Date("...") gibt Date zurueck
  new(value: string): Date;
}
// Date ist beides — man kann es mit und ohne new aufrufen.
// (Das ist ein JavaScript-Sonderfall, nicht nachmachen!)
```

---

## Factory Functions

Factories erstellen Objekte ohne `new`:

```typescript annotated
interface Logger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

function createLogger(prefix: string): Logger {
//                    ^^^^^^^^^^^^^^^  ^^^^^^
//                    Konfiguration     Return ist ein Interface
  return {
    log(message) {
      console.log(`[${prefix}] ${message}`);
    },
    warn(message) {
      console.warn(`[${prefix}] WARN: ${message}`);
    },
    error(message) {
      console.error(`[${prefix}] ERROR: ${message}`);
    },
  };
}

const appLogger = createLogger("App");
appLogger.log("Gestartet");    // [App] Gestartet
appLogger.warn("Langsam");     // [App] WARN: Langsam
```

> 🔍 **Tieferes Wissen: Factory vs. Class**
>
> In JavaScript/TypeScript gibt es eine aktive Debatte: Factory Functions
> vs. Classes. Factory Functions haben Vorteile:
> - Kein `this`-Problem (Closures statt Instanz)
> - Echte Kapselung (private Variablen durch Closures)
> - Einfacher zu testen (keine Vererbung)
>
> Classes haben Vorteile:
> - `instanceof`-Checks funktionieren
> - Prototype-basiert (effizienter bei vielen Instanzen)
> - Vertraute Syntax fuer OOP-Entwickler
>
> In Angular werden Classes bevorzugt (Services, Components). In React
> dominieren Factory Functions (Hooks, funktionale Components).

---

## Currying-Pattern

Currying verwandelt eine Funktion mit mehreren Parametern in eine
Kette von Funktionen mit je einem Parameter:

```typescript annotated
// Ohne Currying:
function add(a: number, b: number): number {
  return a + b;
}
add(1, 2); // 3

// Mit Currying:
function curriedAdd(a: number): (b: number) => number {
//                               ^^^^^^^^^^^^^^^^^^^^^^^^
//                               Gibt eine FUNKTION zurueck
  return (b) => a + b;
}

const add5 = curriedAdd(5);
//    ^^^^  Typ: (b: number) => number
add5(3);   // 8
add5(10);  // 15
```

### Generisches Currying fuer Konfiguration

```typescript annotated
function createFormatter(locale: string): (amount: number) => string {
//                       ^^^^^^                    ^^^^^^     ^^^^^^
//                       Konfiguration             Input      Output
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "de-DE" ? "EUR" : "USD",
  });
  return (amount) => formatter.format(amount);
}

const formatEuro = createFormatter("de-DE");
const formatUsd = createFormatter("en-US");

formatEuro(1234.56);  // "1.234,56 EUR"
formatUsd(1234.56);   // "$1,234.56"
```

> 🧠 **Erklaere dir selbst:** Warum ist Currying in TypeScript besonders nuetzlich? Denke an die Kombination von Currying mit Type Inference und generischen Typen.
> **Kernpunkte:** TypeScript inferiert alle Zwischentypen automatisch | Jeder Schritt hat praezise Typen | Konfiguration und Ausfuehrung getrennt | Generics fliessen durch die Kette

---

## Was du gelernt hast

- **Type Guards** (`value is T`) ermoeglichen benutzerdefiniertes Type Narrowing
- **Assertion Functions** (`asserts value is T`) garantieren einen Typ — oder werfen
- **Constructor Signatures** (`new (...args) => T`) typisieren Klassen als Werte
- **Factory Functions** erstellen Objekte ohne `new` — ideal fuer Konfiguration und Closures
- **Currying** trennt Konfiguration und Ausfuehrung — TypeScript inferiert alle Zwischentypen

> **Experiment:** Schreibe einen eigenen Type Guard `isNonNull<T>(value: T | null): value is T`
> und teste ihn mit einem Array: `[1, null, 2, null, 3].filter(isNonNull)`.
> Was ist der Typ des gefilterten Arrays?

**Kernkonzept zum Merken:** Type Guards und Assertion Functions sind dein Werkzeug, um TypeScript's Type Narrowing zu erweitern. Sie bauen die Bruecke zwischen Laufzeit-Pruefung und Compilezeit-Wissen.

---

## Lektion abgeschlossen!

Du hast alle 6 Sektionen der Functions-Lektion geschafft. Hier ist
dein naechster Schritt:

1. Arbeite die **Examples** in `examples/` durch
2. Loese die **Exercises** in `exercises/`
3. Teste dein Wissen mit dem **Quiz** (`npx tsx quiz.ts`)
4. Behalte das **Cheatsheet** als Referenz

> **Zurueck zum Start:** [README.md](../README.md)
