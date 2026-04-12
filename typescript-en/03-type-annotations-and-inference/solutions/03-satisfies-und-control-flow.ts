/**
 * LEKTION 03 - Loesung 3: satisfies und Control Flow
 *
 * Ausfuehrliche Loesungen mit Erklaerungen.
 *
 * Pruefen: npx tsc --noEmit
 * Ausfuehren: npx tsx 03-type-annotations-und-inference/solutions/03-satisfies-und-control-flow.ts
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

// ============================================================================
// AUFGABE 1: Annotation durch satisfies ersetzen
// LOESUNG: `: ColorConfig` durch `satisfies ColorConfig` ersetzen
// WARUM: Annotation verliert die spezifischen Property-Typen.
//        satisfies validiert gegen ColorConfig UND behaelt die Praezision.
//        palette.primary ist jetzt `string` (nicht `string | [n,n,n]`).
// ============================================================================

type ColorConfig = Record<string, string | [number, number, number]>;

const palette = {
  primary: "#007bff",
  secondary: "#6c757d",
  accent: [255, 165, 0],
} satisfies ColorConfig;

type Test_1a = Expect<Equal<typeof palette.primary, string>>;
type Test_1b = Expect<Equal<typeof palette.accent, [number, number, number]>>;

// ============================================================================
// AUFGABE 2: as const + satisfies kombinieren
// LOESUNG: `as const satisfies Record<string, string>`
// WARUM: `as const` macht alle Werte zu Literal-Typen + readonly.
//        `satisfies` validiert, dass alle Werte strings sind.
//        Die Kombination gibt dir: Literal-Typen + Validierung + readonly.
// REIHENFOLGE: `as const` kommt VOR `satisfies` -- erst Literale machen,
//              dann gegen den Typ validieren.
// ============================================================================

const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  profile: "/profile",
  settings: "/settings",
} as const satisfies Record<string, string>;

type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

type Test_2 = Expect<Equal<RoutePath, "/" | "/dashboard" | "/profile" | "/settings">>;

// ============================================================================
// AUFGABE 3: satisfies fuer Formular-Konfiguration
// LOESUNG: `satisfies Record<string, FieldConfig>`
// WARUM: Ohne satisfies wuerde `FormFields` korrekt infert werden, aber es
//        gaebe keine Validierung gegen FieldConfig. Ein Tippfehler wie
//        `type: "texxt"` wuerde nicht erkannt. Mit satisfies bekommst du
//        beides: Validierung + praezise Feld-Namen.
// ============================================================================

interface FieldConfig {
  type: "text" | "number" | "email" | "password";
  label: string;
  required: boolean;
}

const registrationForm = {
  username: { type: "text", label: "Benutzername", required: true },
  email: { type: "email", label: "E-Mail", required: true },
  age: { type: "number", label: "Alter", required: false },
  password: { type: "password", label: "Passwort", required: true },
} satisfies Record<string, FieldConfig>;

type FormFields = keyof typeof registrationForm;

type Test_3 = Expect<Equal<FormFields, "username" | "email" | "age" | "password">>;

// ============================================================================
// AUFGABE 4: Discriminated Union verarbeiten
// LOESUNG: switch auf shape.kind mit exhaustiveness checking
// WARUM: Discriminated Unions + switch ist das sauberste Pattern fuer
//        verschiedene Varianten eines Typs. Der never-Check im default
//        stellt sicher, dass du keinen Fall vergisst.
// ============================================================================

type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };

type Shape = Circle | Rectangle | Triangle;

function describeShape(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      // shape: Circle (TS hat verengt)
      return `Kreis mit Radius ${shape.radius}`;
    case "rectangle":
      // shape: Rectangle (TS hat verengt)
      return `Rechteck ${shape.width}x${shape.height}`;
    case "triangle":
      // shape: Triangle (TS hat verengt)
      return `Dreieck mit Basis ${shape.base} und Hoehe ${shape.height}`;
    default:
      // shape: never (alle Faelle behandelt)
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// ============================================================================
// AUFGABE 5: Type Predicate schreiben
// LOESUNG: Return-Typ ist `value is UserProfile`
// WARUM: Ein normales `boolean` Return teilt TS nicht mit, dass der Typ
//        verengt wurde. `value is UserProfile` ist ein Type Predicate --
//        es sagt TS: "Wenn diese Funktion true zurueckgibt, ist value
//        ein UserProfile." Danach kann TS im if-Block darauf zugreifen.
//
// WICHTIG: Die Runtime-Checks muessen korrekt sein! Ein falsches Type
//          Predicate kann den Compiler belügen und Runtime-Fehler verursachen.
// ============================================================================

interface UserProfile {
  name: string;
  email: string;
  age: number;
}

function isUserProfile(value: unknown): value is UserProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as UserProfile).name === "string" &&
    "email" in value &&
    typeof (value as UserProfile).email === "string" &&
    "age" in value &&
    typeof (value as UserProfile).age === "number"
  );
}

function processApiResponse(data: unknown): string {
  if (isUserProfile(data)) {
    // data: UserProfile (dank Type Predicate!)
    return `User: ${data.name} (${data.email}, ${data.age})`;
  }
  return "Ungueltiges Format";
}

// ============================================================================
// AUFGABE 6: Array.filter() mit Type Predicate
// LOESUNG: Type Predicate im filter-Callback
// WARUM: Array.filter() verengt den Typ NICHT automatisch, weil TS
//        nicht weiss, dass `item != null` den Typ veraendert.
//        Mit einem Type Predicate `(item): item is string` sagst du
//        TS explizit: "Wenn true, ist item ein string."
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

const frameworks = rawData.filter((item): item is string => item != null);
// Typ: string[]  (korrekt verengt!)

type Test_6 = Expect<Equal<typeof frameworks, string[]>>;

// ============================================================================
// AUFGABE 7: Control Flow mit Zuweisungen
// LOESUNG: Union-Typ der alle moeglichen Werte abdeckt
// WARUM: Die Variable durchlaeuft verschiedene Typen. Du musst einen
//        Union-Typ angeben, der alle Zuweisungen erlaubt.
//        TS verengt den Typ nach jeder Zuweisung automatisch.
//
// ACHTUNG: Das ist kein typischer Praxis-Code! In der Realitaet wuerdest
//          du separate Variablen verwenden. Dieses Beispiel dient dazu,
//          Control Flow bei Zuweisungen zu demonstrieren.
// ============================================================================

let result: string | number | { success: boolean; data: number[] };

result = "Initialisiert";
// TS weiss: result ist jetzt string
console.log(result.toUpperCase());

result = 42;
// TS weiss: result ist jetzt number
console.log(result.toFixed(2));

result = { success: true, data: [1, 2, 3] };
// TS weiss: result ist jetzt { success: boolean; data: number[] }
console.log(result.data.length);

// ============================================================================
// AUFGABE 8: Exhaustiveness mit nie vergessenen Faellen
// LOESUNG: "pending" zum Typ und zum Switch hinzufuegen
// WARUM: Wenn du "pending" zum OrderStatus-Union hinzufuegst aber den
//        Switch NICHT anpasst, gibt es einen Compile-Fehler bei
//        `const _exhaustive: never = status`. Denn status waere dann
//        nicht never, sondern "pending" -- und "pending" ist nicht
//        assignable to never.
//
//        Das ist der Kern von Exhaustiveness Checking: Der Compiler
//        ZWINGT dich, jeden neuen Fall zu behandeln.
// ============================================================================

type OrderStatus = "placed" | "shipped" | "delivered" | "cancelled" | "pending";

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
    case "pending":
      return "In Bearbeitung";
    default:
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

// ============================================================================
// RUNTIME-CHECKS
// ============================================================================

console.log("--- Runtime Checks ---");

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

console.assert(
  getStatusMessage("placed") === "Bestellung aufgegeben",
  "Aufgabe 8: placed"
);
console.assert(
  getStatusMessage("pending") === "In Bearbeitung",
  "Aufgabe 8: pending"
);

console.assert(
  frameworks.length === 4,
  "Aufgabe 6: frameworks hat 4 Eintraege"
);
console.assert(
  JSON.stringify(frameworks) === JSON.stringify(["Angular", "React", "Vue", "Svelte"]),
  "Aufgabe 6: frameworks enthaelt korrekte Werte"
);

console.log("Alle Runtime-Checks bestanden!");
