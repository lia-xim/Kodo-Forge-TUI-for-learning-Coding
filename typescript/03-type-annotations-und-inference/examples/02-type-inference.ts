/**
 * LEKTION 03 - Beispiel 2: Type Inference
 *
 * TypeScript kann Typen automatisch ableiten (infern).
 * Hier siehst du, wann und wie das funktioniert -- und wo es ueberrascht.
 *
 * TIPP: Hover ueber die Variablen in deinem Editor, um den
 * inferierten Typ zu sehen!
 */

// ============================================================================
// 1. VARIABLE INITIALIZATION INFERENCE
// ============================================================================

// TS infert den Typ aus dem Initialwert.
// Hover ueber jede Variable!

const message = "Hallo TypeScript";
// Hover ueber 'message' --> Typ: "Hallo TypeScript" (Literal wegen const!)

let greeting = "Willkommen";
// Hover ueber 'greeting' --> Typ: string (Widened wegen let!)

const count = 42;
// Hover ueber 'count' --> Typ: 42

let total = 100;
// Hover ueber 'total' --> Typ: number

const isReady = true;
// Hover ueber 'isReady' --> Typ: true

let isLoading = false;
// Hover ueber 'isLoading' --> Typ: boolean

// Arrays: TS infert den Element-Typ
const numbers = [1, 2, 3, 4, 5];
// Hover ueber 'numbers' --> Typ: number[]

const mixed = [1, "hello", true];
// Hover ueber 'mixed' --> Typ: (string | number | boolean)[]

const empty = [];
// Hover ueber 'empty' --> Typ: any[] -- Achtung!
// Leere Arrays werden als any[] infert. Spaeter wird der Typ
// erweitert, wenn du Elemente hinzufuegst.

// Objekte: TS infert jeden Property-Typ einzeln
const user = {
  name: "Matthias",
  age: 30,
  active: true,
};
// Hover ueber 'user' --> Typ: { name: string; age: number; active: boolean }
// NICHT { name: "Matthias"; age: 30; active: true } -- Properties werden geweitert!

// ============================================================================
// 2. RETURN TYPE INFERENCE
// ============================================================================

// TS infert den Return-Typ aus den return-Statements
function add(a: number, b: number) {
  return a + b;
}
// Hover ueber 'add' --> Return-Typ: number

function getGreeting(name: string) {
  return `Hallo, ${name}!`;
}
// Hover ueber 'getGreeting' --> Return-Typ: string

function maybeNull(value: string) {
  if (value.length > 0) {
    return value;
  }
  return null;
}
// Hover ueber 'maybeNull' --> Return-Typ: string | null
// TS erkennt ALLE moeglichen Return-Werte!

function throwOrReturn(x: number) {
  if (x < 0) {
    throw new Error("Negativ!");
  }
  return x;
}
// Hover ueber 'throwOrReturn' --> Return-Typ: number
// throw zaehlt nicht als Return-Wert (es ist never)

// Mehrere Returns mit verschiedenen Typen
function flexibleReturn(input: boolean) {
  if (input) {
    return "ja";
  }
  return 42;
}
// Hover ueber 'flexibleReturn' --> Return-Typ: "ja" | 42
// Ueberraschung: Literal-Typen bei Return!

// ============================================================================
// 3. INFERENCE BEI ARRAY-METHODEN
// ============================================================================

const zahlen = [10, 20, 30, 40, 50];

// map: TS infert den Output-Typ aus dem Callback
const verdoppelt = zahlen.map(n => n * 2);
// Hover ueber 'verdoppelt' --> Typ: number[]

const alsString = zahlen.map(n => n.toString());
// Hover ueber 'alsString' --> Typ: string[]

const alsObjekt = zahlen.map(n => ({ wert: n, quadrat: n * n }));
// Hover ueber 'alsObjekt' --> Typ: { wert: number; quadrat: number }[]

// filter: Typ bleibt gleich (es werden nur Elemente entfernt)
const grosseZahlen = zahlen.filter(n => n > 25);
// Hover ueber 'grosseZahlen' --> Typ: number[]

// reduce: TS infert aus dem Startwert
const summe = zahlen.reduce((acc, n) => acc + n, 0);
// Hover ueber 'summe' --> Typ: number

// find: Kann undefined sein!
const gefunden = zahlen.find(n => n > 25);
// Hover ueber 'gefunden' --> Typ: number | undefined
// WICHTIG: find() kann nichts finden, deshalb | undefined

// ============================================================================
// 4. HOVER-UEBUNGEN -- Sag den Typ voraus!
// ============================================================================

// Bevor du hoverst: Was ist der Typ?

// Uebung A:
const a = [1, 2, 3].map(n => n > 2);
// Deine Vermutung: ???
// Hover ueber 'a' fuer die Antwort!

// Uebung B:
const b = { x: 10, y: "hello" };
// Deine Vermutung: ???

// Uebung C:
const c = [1, null, 3, null, 5].filter(n => n !== null);
// Deine Vermutung: ???
// Hinweis: Ist das der Typ, den du erwartest?

// Uebung D:
const d = Math.random() > 0.5 ? "ja" : "nein";
// Deine Vermutung: ???

// Uebung E:
const e = [..."hello"];
// Deine Vermutung: ???

// Uebung F:
const f = Object.keys({ a: 1, b: 2, c: 3 });
// Deine Vermutung: ???

// Uebung G:
const g = Object.entries({ a: 1, b: 2 });
// Deine Vermutung: ???

// ============================================================================
// 5. UEBERRASCHUNGEN BEI INFERENCE
// ============================================================================

// Ueberraschung 1: Leere Arrays
const items = [];           // any[] -- gefaehrlich!
items.push("hello");        // jetzt noch any[]
items.push(42);             // immer noch any[] -- kein Fehler!

// Besser:
const safeItems: string[] = [];
safeItems.push("hello");    // OK
// safeItems.push(42);      // FEHLER -- genau richtig!

// Ueberraschung 2: Object.keys() gibt immer string[]
const obj = { x: 1, y: 2, z: 3 };
const keys = Object.keys(obj);
// Typ: string[] -- NICHT ("x" | "y" | "z")[]
// Warum? Weil Objekte in JS zur Laufzeit mehr Keys haben koennten.

// Ueberraschung 3: || Operator
const input = "";
const fallback = input || "default";
// Typ: string -- TS weiss nicht welcher Branch genommen wird

const strictFallback = input ?? "default";
// Typ: string -- gleiches Ergebnis hier

// Ueberraschung 4: Ternary mit verschiedenen Typen
const result = Math.random() > 0.5 ? 42 : "nein";
// Typ: 42 | "nein" -- nicht number | string!

// Ueberraschung 5: Array mit .push() veraendert den Typ nicht
const fixed = [1, 2, 3];   // number[]
// fixed.push("hello");     // FEHLER -- TS hat den Typ schon festgelegt!

// ============================================================================
// ZUSAMMENFASSUNG
// ============================================================================
// TypeScript infert Typen bei:
// - Variable mit Initialwert --> Typ des Wertes
// - Funktions-Return --> Union aller return-Werte
// - Array-Methoden --> Typ des Callback-Returns
// - Ausdruecke --> Ergebnis der Operation
//
// FAUSTREGEL: Wenn du den Typ durch Hovern sehen kannst und er korrekt ist,
// brauchst du keine Annotation.
