/**
 * Lektion 04 — Beispiel 03: Tuples
 *
 * Themen:
 *  - Grundlegende Tuple-Erstellung und Zugriff
 *  - Named / Labeled Tuples
 *  - Optionale Elemente
 *  - Rest-Elemente
 *  - Destructuring von Tuples
 *  - Tuple-Inferenz mit as const
 *
 * Fuehre aus mit: npx tsx examples/03-tuples.ts
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Grundlegende Tuples
// ═══════════════════════════════════════════════════════════════════════════════

// Ein Tuple hat eine feste Laenge und definierte Typen pro Position
const person: [string, number] = ["Alice", 30];

// TypeScript kennt den Typ JEDER Position:
const name1: string = person[0];   // string — nicht string | number!
const alter: number = person[1];   // number — nicht string | number!

// Zugriff ausserhalb der Laenge ist ein Fehler:
// const x = person[2];  // Fehler: Tuple type '[string, number]' has no element at index '2'

console.log("=== Grundlegende Tuples ===");
console.log(`${name1} ist ${alter} Jahre alt`);

// Verschiedene Tuple-Laengen:
const paar: [string, string] = ["links", "rechts"];
const triple: [number, number, number] = [255, 128, 0]; // RGB-Farbe
const mixed: [string, number, boolean] = ["aktiv", 42, true];

console.log("Paar:", paar);
console.log("Triple (RGB):", triple);
console.log("Mixed:", mixed);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Named / Labeled Tuples (ab TypeScript 4.0)
// ═══════════════════════════════════════════════════════════════════════════════

// Ohne Labels — unklar was jede Position bedeutet
type PunktOhne = [number, number];

// Mit Labels — selbstdokumentierend!
type Punkt = [x: number, y: number];

// Die Labels beeinflussen NICHT den Typ — sie sind rein dokumentarisch
const p1: Punkt = [10, 20];
const p2: PunktOhne = [10, 20];
// p1 und p2 sind typ-kompatibel!

console.log("\n=== Named Tuples ===");
console.log("Punkt:", p1);

// Komplexeres Beispiel mit Labels:
type HTTPResponse = [
  status: number,
  body: string,
  headers: Record<string, string>
];

const response: HTTPResponse = [
  200,
  '{"data": "ok"}',
  { "Content-Type": "application/json" }
];

console.log("HTTP Status:", response[0]);
console.log("HTTP Body:", response[1]);

// Labels verbessern die IDE-Unterstuetzung bei Funktionen:
type Koordinate = [lat: number, lng: number, alt?: number];

function zeigePosition(pos: Koordinate): void {
  // Beim Aufrufen zeigt die IDE: lat, lng, alt
  console.log(`Lat: ${pos[0]}, Lng: ${pos[1]}, Alt: ${pos[2] ?? "N/A"}`);
}

zeigePosition([48.1351, 11.5820]);         // Muenchen
zeigePosition([48.1351, 11.5820, 519]);    // Muenchen mit Hoehe

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Optionale Tuple-Elemente
// ═══════════════════════════════════════════════════════════════════════════════

// Das '?' macht ein Element optional
type FlexPunkt = [x: number, y: number, z?: number];

const punkt2D: FlexPunkt = [10, 20];       // ok — z weggelassen
const punkt3D: FlexPunkt = [10, 20, 30];   // ok — z angegeben

console.log("\n=== Optionale Elemente ===");
console.log("2D Punkt:", punkt2D, "Laenge:", punkt2D.length);
console.log("3D Punkt:", punkt3D, "Laenge:", punkt3D.length);

// Optionale Elemente muessen am Ende stehen!
// type Falsch = [a?: string, b: number]; // Fehler!

// Der Typ des optionalen Elements enthaelt undefined:
const zWert: number | undefined = punkt2D[2]; // undefined, weil nicht gesetzt
console.log("Z-Wert von 2D:", zWert);

// Mehrere optionale Elemente:
type Adresse = [
  strasse: string,
  hausnummer: number,
  zusatz?: string,
  stockwerk?: number
];

const adr1: Adresse = ["Hauptstr.", 42];
const adr2: Adresse = ["Hauptstr.", 42, "a"];
const adr3: Adresse = ["Hauptstr.", 42, "a", 3];

console.log("Adressen:", adr1, adr2, adr3);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Rest-Elemente in Tuples
// ═══════════════════════════════════════════════════════════════════════════════

// Rest-Element am Ende: feste Anfangsstruktur, variable Laenge danach
type LogEntry = [timestamp: string, level: number, ...messages: string[]];

const log1: LogEntry = ["2024-01-01", 1, "Server gestartet"];
const log2: LogEntry = ["2024-01-01", 3, "Fehler", "in Modul X", "Zeile 42"];
const log3: LogEntry = ["2024-01-01", 0]; // 0 messages — auch ok!

console.log("\n=== Rest-Elemente ===");
console.log("Log 1:", log1);
console.log("Log 2:", log2);
console.log("Log 3:", log3);

// Rest-Element in der Mitte (ab TypeScript 4.2):
type Sandwich = [kopf: string, ...mitte: number[], fuss: string];

const sandwich1: Sandwich = ["START", 1, 2, 3, "ENDE"];
const sandwich2: Sandwich = ["START", "ENDE"]; // 0 Zahlen in der Mitte
console.log("Sandwich 1:", sandwich1);
console.log("Sandwich 2:", sandwich2);

// Mehrere Rest-Elemente sind NICHT erlaubt:
// type Falsch = [string, ...number[], ...boolean[]]; // Fehler!

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Destructuring von Tuples
// ═══════════════════════════════════════════════════════════════════════════════

// Einfaches Destructuring
const farbe: [number, number, number] = [255, 128, 0];
const [rot, gruen, blau] = farbe;

console.log("\n=== Destructuring ===");
console.log(`RGB: ${rot}, ${gruen}, ${blau}`);
// TypeScript weiss: rot, gruen, blau sind alle number

// Destructuring mit Rest
const logEintrag: [string, number, ...string[]] = [
  "2024-01-01", 2, "Warnung", "Speicher knapp", "75% belegt"
];
const [datum, level, ...nachrichten] = logEintrag;
// datum: string, level: number, nachrichten: string[]
console.log("Datum:", datum);
console.log("Level:", level);
console.log("Nachrichten:", nachrichten);

// Werte ueberspringen mit _
const position: [x: number, y: number, z: number] = [10, 20, 30];
const [_x, _y, z] = position;
console.log("Nur Z-Wert:", z);

// Swap-Pattern mit Tuples
let a = 1;
let b = 2;
[a, b] = [b, a]; // Swap!
console.log("Nach Swap: a =", a, "b =", b);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Tuple-Inferenz und as const
// ═══════════════════════════════════════════════════════════════════════════════

// OHNE expliziten Typ: TypeScript inferiert ein ARRAY, kein Tuple!
const ohneAnnotation = [1, "hello"];
// Typ: (string | number)[]  — NICHT [number, string]!

// MIT explizitem Typ:
const mitAnnotation: [number, string] = [1, "hello"];
// Typ: [number, string]

// MIT as const: TypeScript inferiert ein readonly Tuple mit Literal-Typen!
const mitConst = [1, "hello"] as const;
// Typ: readonly [1, "hello"]
// Position 0 ist exakt '1' (nicht number)
// Position 1 ist exakt '"hello"' (nicht string)

console.log("\n=== Inferenz und as const ===");
console.log("Ohne Annotation:", ohneAnnotation, "— Typ: (string | number)[]");
console.log("Mit Annotation:", mitAnnotation, "— Typ: [number, string]");
console.log("Mit as const:", mitConst, '— Typ: readonly [1, "hello"]');

// as const macht verschachtelte Strukturen komplett readonly:
const config = {
  server: ["localhost", 8080] as const,
  features: ["auth", "logging", "cache"] as const,
} as const;
// Typ: {
//   readonly server: readonly ["localhost", 8080];
//   readonly features: readonly ["auth", "logging", "cache"];
// }

console.log("Config:", config);
console.log("Server Port:", config.server[1]); // Typ: 8080 (Literal!)

// as const vs Tuple-Annotation:
const a1: [string, number] = ["test", 42];
// a1[0] ist string, a1[1] ist number

const a2 = ["test", 42] as const;
// a2[0] ist "test" (Literal), a2[1] ist 42 (Literal)

// a1 ist mutable:
a1[0] = "geaendert"; // ok
// a2 ist readonly:
// a2[0] = "geaendert"; // Fehler! readonly

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Tuple vs Array — der Laengen-Check
// ═══════════════════════════════════════════════════════════════════════════════

const arr: number[] = [1, 2, 3];
const tup: [number, number, number] = [1, 2, 3];

// Array: Beliebige Laenge
arr.push(4);          // ok
arr.push(5, 6, 7);    // ok
console.log("\n=== Laengen-Check ===");
console.log("Array nach push:", arr);

// ACHTUNG: push auf Tuple ist leider erlaubt!
tup.push(4);           // Kein Compile-Fehler!
console.log("Tuple nach push:", tup); // [1, 2, 3, 4]
// TypeScript "weiss" aber nicht von dem vierten Element:
// tup[3] ist ein Compile-Fehler, obwohl der Wert existiert

// LOESUNG: Verwende readonly Tuples!
const sicherTup: readonly [number, number, number] = [10, 20, 30];
// sicherTup.push(40); // Jetzt ein Fehler!
console.log("Sicheres Tuple:", sicherTup);

console.log("\n✓ Alle Beispiele erfolgreich durchgelaufen!");
