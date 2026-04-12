/**
 * LEKTION 03 - Exercise 5: Fehlermeldungen lesen
 *
 * TypeScript-Fehlermeldungen sind praezise -- aber sie zu LESEN ist eine Faehigkeit,
 * die man ueben muss. In dieser Uebung lernst du, Inference-bezogene Fehler
 * zu interpretieren und zu beheben.
 *
 * ANLEITUNG:
 * 1. Lies die Fehlermeldung (als Kommentar unter dem Code)
 * 2. Erklaere in eigenen Worten, was sie bedeutet (schreibe es in den TODO-Kommentar)
 * 3. Behebe den Fehler
 * 4. Pruefe mit: npx tsc --noEmit
 *
 * WICHTIG: Es geht nicht nur darum, den Fehler zu fixen -- sondern zu VERSTEHEN,
 * warum TypeScript diesen Fehler meldet. Die Fehlermeldung hat immer einen Grund.
 */

// ============================================================================
// FEHLER 1: "Argument of type 'string' is not assignable to parameter
//            of type '"north" | "south" | "east" | "west"'"
//
// Das ist der haeufigste Inference-Fehler ueberhaupt.
// ============================================================================

type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction, steps: number): string {
  return `Moving ${direction} by ${steps} steps`;
}

// Dieser Code produziert einen Fehler:
let userDirection = "north";
// move(userDirection, 5);
// ^^^^^^^^^^^^
// FEHLER: Argument of type 'string' is not assignable to
//         parameter of type '"north" | "south" | "east" | "west"'

// TODO: Erklaere in 1-2 Saetzen: Warum ist userDirection 'string' und nicht '"north"'?
// DEINE ERKLAERUNG: _______________________________________________

// TODO: Behebe den Fehler auf DREI verschiedene Arten:
// (Entkommentiere jeweils die passende Zeile)

// Fix 1 (const statt let):
// ???

// Fix 2 (Typ-Annotation):
// ???

// Fix 3 (as const beim Wert):
// ???

// ============================================================================
// FEHLER 2: "Property 'toUpperCase' does not exist on type 'string | number'"
//
// TypeScript laesst dich nur Methoden aufrufen, die auf ALLEN Typen
// einer Union existieren.
// ============================================================================

function processInput(value: string | number) {
  // Dieser Code produziert einen Fehler:
  // const upper = value.toUpperCase();
  // FEHLER: Property 'toUpperCase' does not exist on type 'string | number'.
  //         Property 'toUpperCase' does not exist on type 'number'.

  // TODO: Erklaere: Warum laesst TS diesen Aufruf nicht zu, obwohl
  //       value KOENNTE ein string sein?
  // DEINE ERKLAERUNG: _______________________________________________

  // TODO: Behebe den Fehler mit einem Narrowing-Guard:
  // ???
}

// ============================================================================
// FEHLER 3: "Type '(string | null)[]' is not assignable to type 'string[]'.
//            Type 'string | null' is not assignable to type 'string'.
//            Type 'null' is not assignable to type 'string'."
//
// Der Klassiker bei Array.filter() -- warum narrowt filter() nicht?
// ============================================================================

const rawData: (string | null)[] = ["Angular", null, "React", null, "Vue"];

// Dieser Code produziert einen Fehler:
// const frameworks: string[] = rawData.filter(item => item !== null);
// FEHLER: Type '(string | null)[]' is not assignable to type 'string[]'.

// TODO: Erklaere: Warum weiss TypeScript nicht, dass nach dem Filter
//       nur noch Strings uebrig sind?
// DEINE ERKLAERUNG: _______________________________________________

// TODO: Behebe den Fehler mit einem Type Predicate im filter-Callback:
// const frameworks: string[] = rawData.filter(???);

// ============================================================================
// FEHLER 4: "Object is possibly 'undefined'."
//
// TypeScript ist strenger als du denkst bei optionalen Zugriffen.
// ============================================================================

interface User {
  name: string;
  address?: {
    street: string;
    city: string;
  };
}

function getCity(user: User): string {
  // Dieser Code produziert einen Fehler:
  // return user.address.city;
  // FEHLER: Object is possibly 'undefined'.

  // TODO: Erklaere: Warum ist user.address moeglicherweise undefined?
  //       Was bedeutet das '?' in der Interface-Definition fuer den Typ?
  // DEINE ERKLAERUNG: _______________________________________________

  // TODO: Behebe den Fehler auf ZWEI verschiedene Arten:

  // Fix 1 (Optional Chaining + Fallback):
  // ???

  // Fix 2 (Narrowing mit if-Check):
  // ???

  return ""; // Ersetze diese Zeile durch deinen Fix
}

// ============================================================================
// FEHLER 5: "Type 'string' is not assignable to type '"text" | "number"'.
//            The 'satisfies' constraint ensures a more specific type."
//
// satisfies-Fehlermeldungen sind neu und anders formuliert.
// ============================================================================

interface FieldConfig {
  type: "text" | "number" | "email";
  label: string;
  required: boolean;
}

// Dieser Code produziert einen Fehler:
// const loginForm = {
//   username: { type: "texxt", label: "Name", required: true },
//   age: { type: "number", label: "Alter", required: false },
// } satisfies Record<string, FieldConfig>;
// FEHLER bei "texxt": Type '"texxt"' is not assignable to type '"text" | "number" | "email"'.

// TODO: Erklaere: Warum erkennt satisfies den Tippfehler "texxt"?
//       Wuerde eine reine Inference (ohne satisfies) diesen Fehler auch erkennen?
// DEINE ERKLAERUNG: _______________________________________________

// TODO: Behebe den Fehler und stelle sicher, dass die spezifischen
//       Typen erhalten bleiben (d.h. verwende satisfies, nicht : Annotation):
const loginForm = {
  username: { type: "text", label: "Name", required: true },
  age: { type: "number", label: "Alter", required: false },
};

// ============================================================================
// FEHLER 6: "Type 'number' is not assignable to type 'never'.
//            An empty array without annotation becomes never[]."
//
// Das passiert, wenn TypeScript keine Information ueber den Array-Inhalt hat.
// ============================================================================

function collectResults(count: number) {
  // Dieser Code produziert einen Fehler (mit strict mode):
  const results = [];

  for (let i = 0; i < count; i++) {
    // results.push(i * 2);
    // FEHLER (mit noImplicitAny): Variable 'results' implicitly has type 'any[]'.
  }

  return results;
}

// TODO: Erklaere: Warum kann TypeScript den Typ des leeren Arrays nicht
//       aus den spaeter gepushten Werten ableiten?
//       (Hinweis: TypeScript analysiert LOKAL, nicht vorausschauend)
// DEINE ERKLAERUNG: _______________________________________________

// TODO: Behebe den Fehler:
function collectResultsFixed(count: number) {
  // Fuege die richtige Annotation hinzu:
  const results = []; // TODO: Annotiere den Typ

  for (let i = 0; i < count; i++) {
    results.push(i * 2);
  }

  return results;
}

// ============================================================================
// BONUS: Fehlermeldungen-Cheatsheet
//
// Hier sind die haeufigsten Inference-Fehlermeldungen und was sie bedeuten:
//
// | Fehlermeldung | Bedeutung | Typische Ursache |
// |---------------|-----------|------------------|
// | "X is not assignable to Y" | X passt nicht in Y | Widening, fehlende Annotation |
// | "Property X does not exist on type Y" | Y hat kein X | Fehlender Narrowing-Guard |
// | "Object is possibly undefined/null" | Optional-Chain fehlt | Optional Property ohne Check |
// | "Implicitly has type 'any'" | TS kann Typ nicht infern | Leeres Array, kein Initialwert |
// | "Cannot assign to X because it is readonly" | as const oder Readonly | Versuch, readonly zu aendern |
// | "Argument of type X..." | Parameter-Typ passt nicht | Widening bei let-Variable |
//
// TIPP: Lies Fehlermeldungen IMMER von unten nach oben. Die letzte Zeile
// sagt dir, was genau nicht passt. Die Zeilen darueber erklaeren den Kontext.
// ============================================================================
