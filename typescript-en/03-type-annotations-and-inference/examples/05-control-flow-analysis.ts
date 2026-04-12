/**
 * LEKTION 03 - Beispiel 5: Control Flow Analysis
 *
 * TypeScript verfolgt den Code-Fluss und verengt (narrowt) Typen basierend
 * auf Bedingungen. Das aendert, welchen Typ eine Variable an einer bestimmten
 * Stelle im Code hat -- und beeinflusst damit direkt die Inference.
 *
 * WARUM ist das relevant fuer Annotations?
 * Weil Control Flow Analysis oft dafuer sorgt, dass du NICHT annotieren musst.
 * TS weiss an der richtigen Stelle im Code den exakten Typ.
 */

// ============================================================================
// 1. TYPEOF-CHECKS -- Die Grundlage
// ============================================================================

function printValue(value: string | number) {
  // Hier ist value: string | number

  if (typeof value === "string") {
    // TS hat verengt: value ist jetzt string
    console.log(value.toUpperCase());     // string-Methode erlaubt!
    console.log(value.length);            // string-Property erlaubt!
  } else {
    // TS hat verengt: value ist jetzt number
    console.log(value.toFixed(2));        // number-Methode erlaubt!
  }

  // Nach dem if/else ist value wieder: string | number
}

// ============================================================================
// 2. TRUTHINESS NARROWING
// ============================================================================

function processName(name: string | null | undefined) {
  // name: string | null | undefined

  if (name) {
    // TS hat null UND undefined UND "" ausgeschlossen
    // name: string  (und nicht leer, aber TS kennt nur den Typ, nicht den Wert)
    console.log(name.toUpperCase());
  }

  // Vorsicht: Truthy-Checks schliessen auch 0 und "" aus!
  // Das ist nicht immer gewuenscht.
}

function processCount(count: number | null) {
  if (count) {
    // count: number  -- ABER: 0 wird auch ausgeschlossen!
    // Das ist ein haeufiger Bug: if (count) filtert auch 0 weg
    console.log(count * 2);
  }

  // Besser:
  if (count !== null) {
    // count: number  -- 0 ist erlaubt!
    console.log(count * 2);
  }
}

// ============================================================================
// 3. INSTANCEOF-CHECKS
// ============================================================================

function handleError(error: Error | string) {
  if (error instanceof Error) {
    // error: Error
    console.log(error.message);
    console.log(error.stack);
  } else {
    // error: string
    console.log(error.toUpperCase());
  }
}

// Eigene Klassen funktionieren genauso:
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

class ValidationError extends Error {
  constructor(public fields: string[], message: string) {
    super(message);
  }
}

function handleAppError(error: ApiError | ValidationError | Error) {
  if (error instanceof ApiError) {
    // error: ApiError
    console.log(`API Error ${error.statusCode}: ${error.message}`);
  } else if (error instanceof ValidationError) {
    // error: ValidationError
    console.log(`Validation: ${error.fields.join(", ")}`);
  } else {
    // error: Error (alles was uebrig bleibt)
    console.log(error.message);
  }
}

// ============================================================================
// 4. DISCRIMINATED UNIONS -- Das maechtigste Pattern
// ============================================================================

// Ein gemeinsames Feld ("Discriminant") bestimmt, welcher Typ vorliegt:

type LoadingState = { status: "loading" };
type SuccessState = { status: "success"; data: string[] };
type ErrorState = { status: "error"; message: string };

type AppState = LoadingState | SuccessState | ErrorState;

function renderState(state: AppState): string {
  switch (state.status) {
    case "loading":
      // state: LoadingState
      return "Lade...";

    case "success":
      // state: SuccessState
      // TS weiss: data existiert!
      return `${state.data.length} Eintraege geladen`;

    case "error":
      // state: ErrorState
      // TS weiss: message existiert!
      return `Fehler: ${state.message}`;
  }
}

// ============================================================================
// 5. IN-OPERATOR NARROWING
// ============================================================================

interface Dog {
  bark(): void;
  breed: string;
}

interface Cat {
  meow(): void;
  indoor: boolean;
}

function makeSound(animal: Dog | Cat) {
  if ("bark" in animal) {
    // animal: Dog
    animal.bark();
    console.log(animal.breed);
  } else {
    // animal: Cat
    animal.meow();
    console.log(animal.indoor);
  }
}

// ============================================================================
// 6. EXHAUSTIVENESS CHECKING MIT NEVER
// ============================================================================

// Wenn du alle Faelle eines Union-Typs behandelst, ist der Rest 'never'.
// Das kannst du nutzen, um sicherzustellen, dass du keinen Fall vergisst:

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // shape ist hier 'never' -- alle Faelle sind behandelt!
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// Wenn du spaeter einen neuen Shape hinzufuegst (z.B. "pentagon"),
// ohne den Switch zu aktualisieren, gibt es einen Compile-Fehler
// bei `const _exhaustive: never = shape` -- weil shape dann nicht
// never ist, sondern { kind: "pentagon"; ... }.

// ============================================================================
// 7. TYPE PREDICATES (User-Defined Type Guards)
// ============================================================================

// Manchmal reichen die eingebauten Checks nicht aus.
// Mit Type Predicates definierst du eigene Narrowing-Regeln:

interface User {
  name: string;
  age: number;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "age" in value &&
    typeof (value as User).name === "string" &&
    typeof (value as User).age === "number"
  );
}

function processData(data: unknown) {
  if (isUser(data)) {
    // data: User  (dank Type Predicate!)
    console.log(data.name, data.age);
  }
}

// Praktisches Beispiel: Array.filter() mit Type Predicate
const mixed: (string | null | undefined)[] = ["hello", null, "world", undefined];

// Ohne Type Predicate:
const filtered1 = mixed.filter(item => item != null);
// Typ: (string | null | undefined)[]  <-- TS verengt nicht automatisch bei filter!

// Mit Type Predicate:
const filtered2 = mixed.filter((item): item is string => item != null);
// Typ: string[]  <-- Korrekt verengt!

// ============================================================================
// 8. ASSERTION FUNCTIONS
// ============================================================================

// assertion functions schmeissen einen Error wenn die Bedingung nicht erfuellt ist,
// und narrowen den Typ danach:

function assertDefined<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (value == null) {
    throw new Error(msg ?? "Value is null or undefined");
  }
}

function processUser(user: User | null) {
  // user: User | null
  assertDefined(user, "User darf nicht null sein");
  // user: User  (nach dem assert ist null ausgeschlossen!)
  console.log(user.name);
}

// ============================================================================
// 9. CONTROL FLOW UND ZUWEISUNGEN
// ============================================================================

// TS verfolgt auch Zuweisungen und verengt den Typ entsprechend:

let value: string | number;

value = "hello";
// Hier ist value: string (TS weiss, was zugewiesen wurde)
console.log(value.toUpperCase());  // OK!

value = 42;
// Hier ist value: number
console.log(value.toFixed(2));     // OK!

// Aber nach einer Verzweigung, die den Wert aendern KOENNTE:
function mayChange(x: string | number): string | number {
  return x;
}
value = mayChange(value);
// Hier ist value wieder: string | number

// ============================================================================
// ZUSAMMENFASSUNG
// ============================================================================
//
// Control Flow Analysis erlaubt es TypeScript, den Typ einer Variable
// im Verlauf des Codes zu VERENGEN. Das ist relevant fuer Inference, weil:
//
// 1. Du musst NICHT annotieren, wenn TS den Typ durch Narrowing kennt
// 2. Discriminated Unions + switch sind das sauberste Pattern
// 3. Type Predicates erweitern das Narrowing fuer eigene Logik
// 4. Exhaustiveness Checking mit never verhindert vergessene Faelle
// 5. Assertion Functions narrowen nach dem Assert-Aufruf
//
// FAUSTREGEL: Nutze das Typ-System um unmogliche Zustaende auszuschliessen,
// statt sie zur Laufzeit zu pruefen.
