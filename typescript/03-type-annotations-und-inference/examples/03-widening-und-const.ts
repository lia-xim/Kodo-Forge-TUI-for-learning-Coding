/**
 * LEKTION 03 - Beispiel 3: Widening und `as const`
 *
 * Widening ist der Prozess, bei dem TypeScript Literal-Typen zu ihrem
 * Basistyp "erweitert". Das passiert automatisch bei `let`, aber
 * nicht bei `const`. Hier lernst du die Details.
 */

// ============================================================================
// 1. LET vs CONST -- Die Grundlage des Widening
// ============================================================================

// const: Der Wert kann sich NICHT aendern --> Literal-Typ bleibt
const greeting = "Hallo";
// Typ: "Hallo"

const magicNumber = 42;
// Typ: 42

const isDone = true;
// Typ: true

// let: Der Wert KANN sich aendern --> Typ wird zum Basistyp erweitert
let wideMessage = "Hallo";
// Typ: string (nicht "Hallo"!)

let wideCount = 42;
// Typ: number (nicht 42!)

let wideActive = true;
// Typ: boolean (nicht true!)

// WARUM? Weil let-Variablen spaeter andere Werte bekommen koennten:
wideMessage = "Tschuess";   // Erlaubt, weil Typ string ist
wideCount = 100;             // Erlaubt, weil Typ number ist
wideActive = false;          // Erlaubt, weil Typ boolean ist

// ============================================================================
// 2. WIDENING BEI OBJEKTEN
// ============================================================================

// Auch bei const-Objekten werden die PROPERTY-Typen geweitert!
const serverCfg = {
  host: "localhost",    // Typ der Property: string (nicht "localhost"!)
  port: 3000,           // Typ der Property: number (nicht 3000!)
  secure: false,        // Typ der Property: boolean (nicht false!)
};
// Gesamttyp: { host: string; port: number; secure: boolean }

// Das bedeutet: Properties koennen geaendert werden!
serverCfg.host = "production.server.com";  // Erlaubt!
serverCfg.port = 8080;                     // Erlaubt!
serverCfg.secure = true;                   // Erlaubt!

// Nur die Variable selbst kann nicht neu zugewiesen werden:
// config = { host: "x", port: 1, secure: true };  // FEHLER: const!

// ============================================================================
// 3. AS CONST -- Widening verhindern
// ============================================================================

// `as const` macht ALLES readonly und behaelt Literal-Typen:
const strictCfg = {
  host: "localhost",
  port: 3000,
  secure: false,
} as const;
// Typ: { readonly host: "localhost"; readonly port: 3000; readonly secure: false }

// Jetzt sind Properties unveraenderbar:
// strictCfg.host = "other";  // FEHLER: readonly!
// strictCfg.port = 8080;     // FEHLER: readonly!

// ============================================================================
// 4. AS CONST BEI ARRAYS
// ============================================================================

// Normales Array:
const colors = ["red", "green", "blue"];
// Typ: string[] -- geweitert!

// Mit as const:
const strictColors = ["red", "green", "blue"] as const;
// Typ: readonly ["red", "green", "blue"] -- ein readonly Tuple!

// Unterschied in der Praxis:
colors.push("yellow");       // Erlaubt -- ist ja string[]
// strictColors.push("yellow"); // FEHLER: readonly!

// Zugriff auf Elemente:
const first = colors[0];
// Typ: string

const strictFirst = strictColors[0];
// Typ: "red" -- der exakte Literal-Typ!

// ============================================================================
// 5. UNION-TYPEN AUS ARRAYS ABLEITEN
// ============================================================================

// DAS ist einer der wichtigsten Use Cases fuer `as const`:
const STATUSES = ["draft", "published", "archived"] as const;
type Status = (typeof STATUSES)[number];
// Typ: "draft" | "published" | "archived"

// Ohne `as const` waere Status einfach `string` -- nutzlos!

// Praxisbeispiel: Validierung
function isValidStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}

const input = "published";
if (isValidStatus(input)) {
  // Hier ist input vom Typ Status
  const status: Status = input;
  console.log("Gueltig:", status);
}

// ============================================================================
// 6. WIDENING BEI ENUM-AEHNLICHEN OBJEKTEN
// ============================================================================

// Ohne as const -- Property-Typen werden geweitert
const HttpStatus = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};
// Typ: { OK: number; NOT_FOUND: number; SERVER_ERROR: number }
// HttpStatus.OK koennte theoretisch 999 sein!

// Mit as const -- exakte Werte
const HttpStatusStrict = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;
// Typ: { readonly OK: 200; readonly NOT_FOUND: 404; readonly SERVER_ERROR: 500 }

type HttpStatusCode = (typeof HttpStatusStrict)[keyof typeof HttpStatusStrict];
// Typ: 200 | 404 | 500

function handleStatus(code: HttpStatusCode): string {
  switch (code) {
    case 200: return "Alles gut";
    case 404: return "Nicht gefunden";
    case 500: return "Server-Fehler";
  }
}

// ============================================================================
// 7. FUNCTION RETURN WIDENING
// ============================================================================

// Return-Werte werden bei Literal-Typen NICHT geweitert:
function getDirection() {
  return "north";
}
// Return-Typ: string -- DOCH geweitert!

// Warum? Weil der Return-Wert wie ein `let` behandelt wird.
// Der Aufrufer koennte ihn in eine let-Variable speichern.

// Loesung 1: Expliziter Return-Typ
function getDirectionExplicit(): "north" | "south" | "east" | "west" {
  return "north";
}

// Loesung 2: as const auf den Return-Wert
function getDirectionConst() {
  return "north" as const;
}
// Return-Typ: "north"

// Bei Objekten:
function createConfig() {
  return {
    host: "localhost",
    port: 3000,
  };
}
// Return-Typ: { host: string; port: number } -- geweitert!

function createConfigConst() {
  return {
    host: "localhost",
    port: 3000,
  } as const;
}
// Return-Typ: { readonly host: "localhost"; readonly port: 3000 }

// ============================================================================
// 8. SATISFIES -- WIDENING KONTROLLIEREN (TypeScript 4.9+)
// ============================================================================

// `satisfies` prueft den Typ, ohne ihn zu aendern:
type ColorMap = Record<string, [number, number, number] | string>;

const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255],
} satisfies ColorMap;

// Vorteil: TS kennt die EXAKTEN Typen der Properties!
const redValue = palette.red;
// Typ: [number, number, number] (nicht string | [number, number, number])

const greenValue = palette.green;
// Typ: string (genau, nicht der Union-Typ)

// Ohne satisfies (mit Annotation) waere jeder Wert string | [number, number, number]

// ============================================================================
// 9. PRAKTISCHE AUSWIRKUNGEN VON WIDENING
// ============================================================================

// Problem: Funktion erwartet Literal-Typ
function setTheme(theme: "light" | "dark"): void {
  console.log(`Theme: ${theme}`);
}

// Das funktioniert:
setTheme("light");

// Das funktioniert NICHT:
let userTheme = "light";
// setTheme(userTheme);  // FEHLER: string ist nicht "light" | "dark"

// Loesung 1: Annotation
let userTheme1: "light" | "dark" = "light";
setTheme(userTheme1);  // OK!

// Loesung 2: as const
const userTheme2 = "light" as const;
setTheme(userTheme2);  // OK!

// Loesung 3: const statt let (wenn Neuzuweisung nicht noetig)
const userTheme3 = "light";
setTheme(userTheme3);  // OK! (const bewahrt den Literal-Typ)

// ============================================================================
// ZUSAMMENFASSUNG: WIDENING-REGELN
// ============================================================================
//
// 1. `const` primitive        --> Literal-Typ bleibt      ("hello", 42, true)
// 2. `let` primitive          --> Widened zum Basistyp     (string, number, boolean)
// 3. `const` Objekt-Property  --> Properties werden geweitert (string, number, etc.)
// 4. `as const` auf Wert      --> Alles wird readonly + Literal
// 5. Function Return          --> Wird geweitert (wie let)
// 6. `as const` auf Return    --> Literal-Typ bleibt
//
// Faustregel: Wenn du den exakten Wert als Typ brauchst, nutze `as const`.
