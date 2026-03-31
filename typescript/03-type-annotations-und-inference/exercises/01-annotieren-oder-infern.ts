/**
 * LEKTION 03 - Exercise 1: Annotieren oder Infern?
 *
 * In jeder Aufgabe musst du entscheiden:
 *   - Soll eine Annotation HINZUGEFUEGT werden? (weil noetig/sinnvoll)
 *   - Soll eine Annotation ENTFERNT werden? (weil ueberfluessig)
 *   - Soll `as const` verwendet werden? (weil Literal-Typ gebraucht wird)
 *   - Muss der Typ KORRIGIERT werden? (weil Inference den falschen Typ ergibt)
 *
 * Lies die Kommentare und aendere den Code entsprechend.
 * Die console.assert()-Aufrufe am Ende pruefen deine Aenderungen zur Laufzeit.
 *
 * Ausfuehren: npx tsx 03-type-annotations-und-inference/exercises/01-annotieren-oder-infern.ts
 */

// ============================================================================
// AUFGABE 1: Ueberfluessige Annotation entfernen
// Die Annotation ist unnoetig, weil TS den Typ aus dem Wert infern kann.
// Entferne die Annotation, damit der Code sauberer wird.
// ============================================================================

const username: string = "Matthias";
const age: number = 30;
const isActive: boolean = true;

// ============================================================================
// AUFGABE 2: Fehlende Annotation hinzufuegen
// Diese Variable hat keinen Initialwert. Ohne Annotation wird sie `any`.
// Fuege den richtigen Typ hinzu.
// ============================================================================

let errorMessage;  // TODO: Welcher Typ sollte das sein?
errorMessage = "Etwas ist schiefgelaufen";

// ============================================================================
// AUFGABE 3: Parameter annotieren
// Funktionsparameter koennen NICHT infert werden. Fuege Annotationen hinzu.
// ============================================================================

// @ts-expect-error -- Parameter brauchen Annotationen!
function calculateArea(width, height) {
  return width * height;
}

// ============================================================================
// AUFGABE 4: Ueberfluessige Callback-Annotationen entfernen
// Die Parameter-Annotationen im Callback sind unnoetig (Contextual Typing).
// ============================================================================

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n: number): number => n * 2);
const filtered = numbers.filter((n: number): boolean => n > 2);

// ============================================================================
// AUFGABE 5: Return-Typ annotieren (exportierte Funktion)
// Diese Funktion wird exportiert. Fuege einen expliziten Return-Typ hinzu.
// ============================================================================

export function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(2)} EUR`;
}

// ============================================================================
// AUFGABE 6: `as const` verwenden
// Die Funktion erwartet einen Literal-Typ, aber der Wert wird geweitert.
// Behebe das Problem.
// ============================================================================

type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction): string {
  return `Bewege nach ${direction}`;
}

let currentDirection = "north";
// @ts-expect-error -- currentDirection ist string, nicht Direction
move(currentDirection);

// TODO: Aendere die Zeile oben so, dass der Fehler verschwindet.
// (Es gibt mehrere Loesungen -- waehle die beste!)

// ============================================================================
// AUFGABE 7: Array-Typ korrigieren
// Das leere Array wird als any[] infert. Fuege den richtigen Typ hinzu.
// ============================================================================

const results = [];  // TODO: Welcher Typ?
results.push("Erfolg");
results.push("Fehler");
// results.push(42);  // Das soll ein Fehler sein!

// ============================================================================
// AUFGABE 8: Object-Typ annotieren oder infern lassen?
// Entscheide: Ist die Annotation hier sinnvoll oder unnoetig?
// ============================================================================

const person: { name: string; age: number; city: string } = {
  name: "Matthias",
  age: 30,
  city: "Muenchen",
};

// ============================================================================
// AUFGABE 9: Union-Typ noetig
// Die Variable soll verschiedene Typen annehmen koennen.
// Fuege den richtigen Union-Typ hinzu.
// ============================================================================

let response;  // TODO: Welcher Typ, damit beides funktioniert?
response = { data: [1, 2, 3], error: null };
response = { data: null, error: "Netzwerkfehler" };

// ============================================================================
// AUFGABE 10: Destructuring annotieren
// Fuege die fehlende Typ-Annotation fuer das Destructuring hinzu.
// ============================================================================

// @ts-expect-error -- Parameter braucht Annotation
function greetUser({ name, age }) {
  return `${name} ist ${age} Jahre alt`;
}

// ============================================================================
// AUFGABE 11: `as const` fuer Enum-Ableitung
// Aendere das Objekt so, dass StatusCode ein Union aus den exakten Zahlen ist.
// ============================================================================

const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404,
  ERROR: 500,
};

type StatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
// TODO: StatusCode ist aktuell `number`. Es soll `200 | 404 | 500` sein.

// ============================================================================
// AUFGABE 12: Inference korrigieren
// Die Funktion gibt string | number zurueck, aber sie sollte NUR string geben.
// Korrigiere den Return-Typ oder den Code.
// ============================================================================

function getValue(key: string) {
  const data: Record<string, string> = {
    name: "Matthias",
    city: "Muenchen",
  };
  return data[key] || 0;  // TODO: Warum gibt das string | number zurueck?
}

// ============================================================================
// AUFGABE 13: Generic Inference nutzen
// Entferne die unnoetige explizite Typ-Angabe beim Aufruf.
// ============================================================================

function identity<T>(value: T): T {
  return value;
}

const result1 = identity<string>("hello");
const result2 = identity<number>(42);
const result3 = identity<boolean>(true);

// ============================================================================
// AUFGABE 14: Readonly Tuple mit as const
// Erstelle ein Tuple, das als Typ fuer die Funktion verwendet werden kann.
// ============================================================================

function setPosition(pos: readonly [number, number]): void {
  console.log(`Position: ${pos[0]}, ${pos[1]}`);
}

const myPosition = [48.137, 11.576];
// @ts-expect-error -- myPosition ist number[], nicht readonly [number, number]
setPosition(myPosition);

// TODO: Aendere myPosition so, dass es funktioniert.

// ============================================================================
// AUFGABE 15: Best Practice anwenden
// Diese Funktion hat zu viele Annotationen. Entferne die ueberfluessigen,
// behalte die noetige.
// ============================================================================

function processData(items: string[]): string[] {
  const upper: string[] = items.map((item: string): string => item.toUpperCase());
  const filtered: string[] = upper.filter((s: string): boolean => s.length > 3);
  const result: string[] = filtered.sort((a: string, b: string): number => a.localeCompare(b));
  return result;
}

// ============================================================================
// RUNTIME-CHECKS
// ============================================================================

console.log("--- Runtime Checks ---");

console.assert(typeof calculateArea === "function", "Aufgabe 3: calculateArea existiert");
console.assert(formatPrice(1999) === "19.99 EUR", "Aufgabe 5: formatPrice funktioniert");
console.assert(typeof processData === "function", "Aufgabe 15: processData existiert");
console.assert(
  JSON.stringify(processData(["ab", "hello", "typescript", "hi"])) ===
    JSON.stringify(["HELLO", "TYPESCRIPT"]),
  "Aufgabe 15: processData gibt korrekte Ergebnisse"
);

console.log("Alle Runtime-Checks bestanden!");
