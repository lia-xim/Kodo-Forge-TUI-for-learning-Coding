/**
 * Lektion 07 - Example 01: Union Types Grundlagen
 *
 * Ausfuehren mit: npx tsx examples/01-union-types.ts
 *
 * Union Types: Der | Operator, Literal Unions,
 * Union vs Enum, und as const.
 */

// ─── GRUNDLAGEN: Der | Operator ─────────────────────────────────────────────

// Ein Wert kann mehrere Typen haben:
function formatId(id: string | number): string {
  return `ID: ${id}`;
}

console.log(formatId("abc-123"));  // "ID: abc-123"
console.log(formatId(42));          // "ID: 42"
// formatId(true);  // Error! boolean ist nicht string | number

// ─── GEMEINSAME OPERATIONEN ─────────────────────────────────────────────────

// Ohne Narrowing: Nur gemeinsame Methoden erlaubt
function demo(value: string | number): string {
  // value.toString() — OK (beide haben toString)
  // value.toUpperCase() — Error! (nur string hat das)
  // value.toFixed() — Error! (nur number hat das)
  return value.toString();
}

console.log(`\nGemeinsame Methoden: ${demo("hallo")}, ${demo(42)}`);

// ─── LITERAL UNIONS ─────────────────────────────────────────────────────────

// Statt allgemeiner Typen: Konkrete Werte als Typen
type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction, steps: number): string {
  return `Moving ${steps} steps ${direction}`;
}

console.log(`\n${move("north", 3)}`);
// move("up", 1);  // Error! "up" ist nicht in Direction

// Nummer-Literal-Union
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
const wurf: DiceValue = 4;
console.log(`Wuerfel: ${wurf}`);

// Gemischte Literal-Union
type StatusCode = 200 | 301 | 404 | 500 | "unknown";
const code: StatusCode = 404;
console.log(`Status: ${code}`);

// ─── UNION VON UNIONS ───────────────────────────────────────────────────────

// Unions sind zusammensetzbar — das geht mit enum NICHT so einfach!
type ReadMethod = "GET" | "HEAD" | "OPTIONS";
type WriteMethod = "POST" | "PUT" | "PATCH" | "DELETE";
type HttpMethod = ReadMethod | WriteMethod;

function isReadOnly(method: HttpMethod): boolean {
  // Hier nutzen wir einen Trick: Literal Unions + Type Guard
  const readMethods: ReadMethod[] = ["GET", "HEAD", "OPTIONS"];
  return (readMethods as string[]).includes(method);
}

console.log(`\nGET is read-only: ${isReadOnly("GET")}`);
console.log(`POST is read-only: ${isReadOnly("POST")}`);

// ─── UNION MIT AS CONST ─────────────────────────────────────────────────────

// Union Type aus einem Array ableiten
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = typeof ROLES[number];  // "admin" | "editor" | "viewer"

function isValidRole(input: string): input is Role {
  return (ROLES as readonly string[]).includes(input);
}

console.log(`\n"admin" ist gueltige Rolle: ${isValidRole("admin")}`);
console.log(`"hacker" ist gueltige Rolle: ${isValidRole("hacker")}`);

// Ohne as const:
const BROKEN_ROLES = ["admin", "editor", "viewer"];
type BrokenRole = typeof BROKEN_ROLES[number];  // string — zu breit!

// ─── UNION UND DIE TYPHIERARCHIE ────────────────────────────────────────────

// Aufwaerts: Mitglied → Union (immer OK)
const x: string | number = "hallo";

// Abwaerts: Union → Mitglied (FEHLER)
const s: string | number = "hallo";
// const y: string = s;  // Error! string | number ist nicht string

// Aber mit Narrowing:
if (typeof s === "string") {
  const y: string = s;  // OK nach typeof-Check
  console.log(`\nNach Narrowing: ${y.toUpperCase()}`);
}

// ─── UNION VS ENUM ──────────────────────────────────────────────────────────

// enum erzeugt Laufzeit-Code
enum ColorEnum {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
console.log(`\nenum-Objekt existiert zur Laufzeit:`, ColorEnum);

// Literal Union erzeugt KEINEN Laufzeit-Code
type ColorUnion = "RED" | "GREEN" | "BLUE";
// Nichts zur Laufzeit — nur Compile-Zeit-Pruefung!

// Wenn du trotzdem ein Array brauchst (Laufzeit + Typ):
const COLORS = ["RED", "GREEN", "BLUE"] as const;
type Color = typeof COLORS[number];

console.log(`\nFarben-Array (Laufzeit):`, COLORS);
// Typ Color = "RED" | "GREEN" | "BLUE" (Compilezeit)

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
