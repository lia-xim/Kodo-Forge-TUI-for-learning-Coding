/**
 * Lektion 02 - Example 04: never und void
 *
 * Ausfuehren mit: npx tsx examples/04-never-und-void.ts
 *
 * void = "gibt nichts Nuetzliches zurueck"
 * never = "kommt nie zurueck" / "kann nie passieren"
 */

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 1: void — kein Rueckgabewert
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== TEIL 1: void ===\n");

// void: Die Funktion gibt nichts Sinnvolles zurueck
function logNachricht(nachricht: string): void {
  console.log(`[LOG] ${nachricht}`);
  // Kein return noetig
}

logNachricht("Server gestartet");

// void-Funktionen KOENNEN return verwenden, aber ohne Wert:
function logMitBedingung(nachricht: string, level: number): void {
  if (level < 1) {
    return;  // Fruehes return — OK bei void
  }
  console.log(`[${level}] ${nachricht}`);
}

logMitBedingung("Debug-Info", 0);  // Gibt nichts aus
logMitBedingung("Wichtig!", 2);    // "[2] Wichtig!"

// void ist NICHT undefined:
function gibVoid(): void {}
function gibUndefined(): undefined {
  return undefined;  // MUSS explizit undefined zurueckgeben
}

const v = gibVoid();
const u = gibUndefined();
console.log(`\nvoid-Ergebnis: ${v}`);       // undefined (zur Laufzeit)
console.log(`undefined-Ergebnis: ${u}`);     // undefined

// ─── CALLBACK-SONDERREGEL ──────────────────────────────────────────────────

console.log("\n--- Callback-Sonderregel ---");

// Wenn ein Callback void zurueckgibt, darf die Implementierung
// trotzdem einen Wert zurueckgeben — er wird einfach ignoriert.

// Beispiel: Array.forEach erwartet (value) => void
const zahlen = [1, 2, 3];

// Array.push gibt number zurueck, aber forEach erwartet void.
// Trotzdem kein Error! Das ist ein bewusstes Design von TypeScript.
const neuesArray: number[] = [];
zahlen.forEach(z => neuesArray.push(z));  // push gibt number zurueck — OK!

console.log(`neuesArray: [${neuesArray}]`);

// Diese Flexibilitaet ist wichtig, weil viele bestehende JavaScript-
// Callbacks Werte zurueckgeben, die nie verwendet werden.

// ─── void-Variable ─────────────────────────────────────────────────────────

// Man kann eine Variable als void deklarieren, aber das ist selten sinnvoll:
let voidVar: void = undefined;
// voidVar = null;     // Error mit strictNullChecks
// voidVar = "hallo";  // Error

console.log(`void-Variable: ${voidVar}`);

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 2: never — das Unmoegliche
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 2: never ===\n");

// ─── Fall 1: Funktion die IMMER einen Error wirft ─────────────────────────

function werfeFehler(nachricht: string): never {
  throw new Error(nachricht);
  // Code nach throw wird nie erreicht → never
}

// Aufruf:
try {
  // werfeFehler("Etwas ist schiefgelaufen!");
  console.log("werfeFehler() wuerde hier einen Error werfen");
} catch (e) {
  // ...
}

// ─── Fall 2: Endlosschleife ────────────────────────────────────────────────

function endlosSchleife(): never {
  while (true) {
    // Laeuft fuer immer — die Funktion kehrt nie zurueck
  }
}

// (Nicht ausfuehren — wuerde das Programm blockieren!)
console.log("endlosSchleife() wuerde hier fuer immer laufen");

// ─── Fall 3: Exhaustive Check (VORSCHAU) ───────────────────────────────────

console.log("\n--- Exhaustive Check ---");

// Das ist eines der maechtigsten Patterns mit never:

type Farbe = "rot" | "gruen" | "blau";

function farbeZuHex(farbe: Farbe): string {
  switch (farbe) {
    case "rot":
      return "#ff0000";
    case "gruen":
      return "#00ff00";
    case "blau":
      return "#0000ff";
    default:
      // Wenn alle Faelle behandelt sind, ist farbe hier "never"
      const _exhaustive: never = farbe;
      return _exhaustive;
  }
}

console.log(`rot → ${farbeZuHex("rot")}`);
console.log(`gruen → ${farbeZuHex("gruen")}`);
console.log(`blau → ${farbeZuHex("blau")}`);

// Warum ist das nuetzlich?
// Wenn jemand spaeter "gelb" zu Farbe hinzufuegt:
//   type Farbe = "rot" | "gruen" | "blau" | "gelb";
// ... dann gibt die default-Zeile einen COMPILE-ERROR:
//   Type 'string' is not assignable to type 'never'
// → Man kann nicht vergessen, den neuen Fall zu behandeln!

// ─── VISUALISIERUNG: void vs never ─────────────────────────────────────────

console.log("\n--- void vs never: Der Unterschied ---");

/*
  ┌──────────────────────────────────────────────────────────────┐
  │                    void vs never                              │
  ├───────────────┬──────────────────────────────────────────────┤
  │     void      │  "Gibt nichts Nuetzliches zurueck"           │
  │               │  → Die Funktion kehrt ZURUECK, aber          │
  │               │    ohne sinnvollen Wert                      │
  │               │  → Beispiel: console.log()                   │
  ├───────────────┼──────────────────────────────────────────────┤
  │     never     │  "Kehrt NIEMALS zurueck"                     │
  │               │  → Die Funktion beendet sich NIE normal      │
  │               │  → Entweder: throw, Endlosschleife,          │
  │               │    oder unmoeglicher Zustand                 │
  │               │  → Beispiel: throw new Error()               │
  └───────────────┴──────────────────────────────────────────────┘

  Zeitlinie:
    void:  ──────────────→ return (undefined)
    never: ──────────────→ 💥 (throw) oder ∞ (Endlosschleife)
*/

// ─── never als Bottom Type ─────────────────────────────────────────────────

console.log("--- never als Bottom Type ---");

// never ist JEDEM Typ zuweisbar (aber nur in Theorie,
// weil man nie einen never-Wert hat):
function gibNever(): never {
  throw new Error("!");
}

// Alle diese Zuweisungen sind gueltig — weil gibNever() nie zurueckkehrt:
// const s: string = gibNever();   // OK (theoretisch)
// const n: number = gibNever();   // OK (theoretisch)
// const b: boolean = gibNever();  // OK (theoretisch)

// ABER: Nichts ist never zuweisbar (ausser never selbst):
// const x: never = "hallo";  // Error!
// const y: never = 42;       // Error!
// const z: never = true;     // Error!

console.log("never ist der Bottom Type:");
console.log("  → Jedem Typ zuweisbar (Subtyp von allem)");
console.log("  → Nichts ist never zuweisbar (nichts ist sein Subtyp)");

// ─── PRAXISBEISPIEL: Error-Handling ────────────────────────────────────────

console.log("\n--- Praxis: Error-Handling mit never ---");

class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
  }
}

// Hilfsfunktion die nie zurueckkehrt:
function fail(message: string, code: string): never {
  throw new AppError(message, code);
}

// Nutzung — TypeScript weiss, dass nach fail() nichts mehr kommt:
function getConfigValue(key: string): string {
  const config: Record<string, string> = {
    host: "localhost",
    port: "3000",
  };

  const value = config[key];
  if (value === undefined) {
    fail(`Config-Schluessel "${key}" nicht gefunden`, "CONFIG_MISSING");
    // Kein return noetig! TypeScript weiss: fail() kehrt nie zurueck
  }
  return value;
}

console.log(`host: ${getConfigValue("host")}`);
console.log(`port: ${getConfigValue("port")}`);

try {
  getConfigValue("database");
} catch (e) {
  if (e instanceof AppError) {
    console.log(`Fehler [${e.code}]: ${e.message}`);
  }
}

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
