/**
 * LEKTION 03 - Exercise 3: satisfies und Control Flow
 *
 * Diese Uebung kombiniert zwei Konzepte:
 * 1. Den satisfies-Operator korrekt einsetzen
 * 2. Control Flow Analysis verstehen und nutzen
 *
 * Pruefen: npx tsc --noEmit
 * Ausfuehren: npx tsx 03-type-annotations-und-inference/exercises/03-satisfies-und-control-flow.ts
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

// ============================================================================
// TEIL A: satisfies
// ============================================================================

// ============================================================================
// AUFGABE 1: Annotation durch satisfies ersetzen
//
// Das Problem: Die Annotation (: ColorConfig) verliert die spezifischen Typen.
// palette.primary ist `string | [number, number, number]` statt nur `string`.
//
// Aendere den Code so, dass:
// - Der Typ gegen ColorConfig validiert wird (Tippfehler erkannt)
// - palette.primary den Typ `string` hat (nicht den Union-Typ)
// - palette.accent den Typ `[number, number, number]` hat
// ============================================================================

type ColorConfig = Record<string, string | [number, number, number]>;

const palette: ColorConfig = {
  primary: "#007bff",
  secondary: "#6c757d",
  accent: [255, 165, 0],
};

// TODO: Diese Tests sollen bestehen (aktuell schlagen sie fehl!)
// Entkommentiere sie, nachdem du den Code oben geaendert hast:
//
// type Test_1a = Expect<Equal<typeof palette.primary, string>>;
// type Test_1b = Expect<Equal<typeof palette.accent, [number, number, number]>>;

// ============================================================================
// AUFGABE 2: as const + satisfies kombinieren
//
// Erstelle ein ROUTES-Objekt, das:
// - Gegen Record<string, string> validiert wird
// - Alle Werte als Literal-Typen erhalten bleiben (nicht string)
// - readonly ist
// ============================================================================

// TODO: Definiere ROUTES mit den richtigen Modifiern
const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  profile: "/profile",
  settings: "/settings",
};

// Dieser Typ soll ein Union der Literal-Pfade sein:
type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

// TODO: Entkommentiere diesen Test, wenn ROUTES korrekt definiert ist:
// type Test_2 = Expect<Equal<RoutePath, "/" | "/dashboard" | "/profile" | "/settings">>;

// ============================================================================
// AUFGABE 3: satisfies fuer Formular-Konfiguration
//
// Definiere eine FormConfig und nutze satisfies, damit:
// - Die Konfiguration gegen das Schema validiert wird
// - Die exakten Feld-Namen als Union-Typ ableitbar sind
// ============================================================================

interface FieldConfig {
  type: "text" | "number" | "email" | "password";
  label: string;
  required: boolean;
}

// TODO: Fuege satisfies hinzu, damit die Tests bestehen
const registrationForm = {
  username: { type: "text", label: "Benutzername", required: true },
  email: { type: "email", label: "E-Mail", required: true },
  age: { type: "number", label: "Alter", required: false },
  password: { type: "password", label: "Passwort", required: true },
};

type FormFields = keyof typeof registrationForm;

// TODO: Entkommentiere:
// type Test_3 = Expect<Equal<FormFields, "username" | "email" | "age" | "password">>;

// ============================================================================
// TEIL B: Control Flow Analysis
// ============================================================================

// ============================================================================
// AUFGABE 4: Discriminated Union verarbeiten
//
// Schreibe die Funktion describeShape, die fuer jede Form eine
// Beschreibung zurueckgibt. Nutze exhaustiveness checking.
// ============================================================================

type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };

type Shape = Circle | Rectangle | Triangle;

function describeShape(shape: Shape): string {
  // TODO: Implementiere mit switch + exhaustiveness checking
  // Gib zurueck:
  // - "Kreis mit Radius {radius}" fuer Circle
  // - "Rechteck {width}x{height}" fuer Rectangle
  // - "Dreieck mit Basis {base} und Hoehe {height}" fuer Triangle
  return "";  // Ersetze diese Zeile
}

// ============================================================================
// AUFGABE 5: Type Predicate schreiben
//
// Schreibe eine Type Guard Funktion, die prueft ob ein Wert ein
// gueltiger User ist. Danach soll TS den Typ korrekt verengen.
// ============================================================================

interface UserProfile {
  name: string;
  email: string;
  age: number;
}

// TODO: Implementiere isUserProfile als Type Predicate
function isUserProfile(value: unknown): boolean {
  // Pruefe ob value ein Objekt mit name (string), email (string), age (number) ist
  return false;  // Ersetze diese Zeile
}

function processApiResponse(data: unknown): string {
  if (isUserProfile(data)) {
    // TODO: Wenn dein Type Predicate korrekt ist, sollte TS hier
    //       wissen, dass data ein UserProfile ist.
    //       Dann kannst du data.name, data.email, data.age verwenden.
    return `User: unbekannt`;  // Ersetze diese Zeile
  }
  return "Ungueltiges Format";
}

// ============================================================================
// AUFGABE 6: Array.filter() mit Type Predicate
//
// Filtere null/undefined aus dem Array und stelle sicher,
// dass der resultierende Typ korrekt ist (string[], nicht (string | null)[]).
// ============================================================================

const rawData: (string | null | undefined)[] = [
  "Angular",
  null,
  "React",
  undefined,
  "Vue",
  null,
  "Svelte",
];

// TODO: Schreibe den Filter so, dass frameworks den Typ string[] hat.
// Aktuell ist es (string | null | undefined)[] -- das ist falsch!
const frameworks = rawData.filter(item => item != null);

// TODO: Entkommentiere:
// type Test_6 = Expect<Equal<typeof frameworks, string[]>>;

// ============================================================================
// AUFGABE 7: Control Flow mit Zuweisungen
//
// Die Variable 'result' soll verschiedene Typen durchlaufen.
// Annotiere sie so, dass alle Zuweisungen erlaubt sind,
// und nutze dann Control Flow fuer type-safe Zugriff.
// ============================================================================

// TODO: Welcher Typ muss result haben, damit alles funktioniert?
let result;  // Annotiere den Typ!

result = "Initialisiert";
// Hier soll TS wissen, dass result ein string ist:
// console.log(result.toUpperCase());

result = 42;
// Hier soll TS wissen, dass result eine number ist:
// console.log(result.toFixed(2));

result = { success: true, data: [1, 2, 3] };
// Hier soll TS wissen, dass result ein Objekt ist:
// console.log(result.data.length);

// ============================================================================
// AUFGABE 8: Exhaustiveness mit nie vergessenen Faellen
//
// Fuege den Typ "pending" zum Status hinzu und beobachte,
// was passiert. Dann behandle den neuen Fall.
// ============================================================================

type OrderStatus = "placed" | "shipped" | "delivered" | "cancelled";
// TODO: Fuege "pending" hinzu: type OrderStatus = ... | "pending";

function getStatusMessage(status: OrderStatus): string {
  switch (status) {
    case "placed":
      return "Bestellung aufgegeben";
    case "shipped":
      return "Unterwegs";
    case "delivered":
      return "Zugestellt";
    case "cancelled":
      return "Storniert";
    default:
      // Exhaustiveness check: Wenn alle Faelle behandelt sind,
      // ist status hier 'never'. Wenn nicht, gibt es einen Compile-Fehler.
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

// ============================================================================
// RUNTIME-CHECKS
// ============================================================================

console.log("--- Runtime Checks ---");

// Shape tests
console.assert(
  describeShape({ kind: "circle", radius: 5 }) === "Kreis mit Radius 5",
  "Aufgabe 4: Circle"
);
console.assert(
  describeShape({ kind: "rectangle", width: 10, height: 20 }) === "Rechteck 10x20",
  "Aufgabe 4: Rectangle"
);
console.assert(
  describeShape({ kind: "triangle", base: 8, height: 6 }) === "Dreieck mit Basis 8 und Hoehe 6",
  "Aufgabe 4: Triangle"
);

// Type Predicate test
console.assert(
  processApiResponse({ name: "Max", email: "max@test.de", age: 30 }) === "User: Max (max@test.de, 30)",
  "Aufgabe 5: isUserProfile erkennt gueltigen User"
);
console.assert(
  processApiResponse("nicht ein user") === "Ungueltiges Format",
  "Aufgabe 5: isUserProfile lehnt String ab"
);
console.assert(
  processApiResponse({ name: "Max" }) === "Ungueltiges Format",
  "Aufgabe 5: isUserProfile lehnt unvollstaendiges Objekt ab"
);

// Order status test
console.assert(
  getStatusMessage("placed") === "Bestellung aufgegeben",
  "Aufgabe 8: placed"
);

console.log("Alle Runtime-Checks bestanden!");
