/**
 * Lektion 07 - Example 03: Discriminated Unions
 *
 * Ausfuehren mit: npx tsx examples/03-discriminated-unions.ts
 *
 * Tag-Property, Exhaustive Check, assertNever, ADTs.
 */

// ─── GRUNDLAGEN: TAG-PROPERTY ───────────────────────────────────────────────

interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

// TypeScript narrowt automatisch ueber das Tag:
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 10, height: 3 },
  { kind: "triangle", base: 8, height: 4 },
];

console.log("Discriminated Unions — Flaechen:");
for (const s of shapes) {
  console.log(`  ${s.kind}: ${area(s).toFixed(2)}`);
}

// ─── EXHAUSTIVE CHECK MIT NEVER ─────────────────────────────────────────────

function assertNever(value: never): never {
  throw new Error(`Unerwarteter Wert: ${JSON.stringify(value)}`);
}

function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return `Kreis mit Radius ${shape.radius}`;
    case "rectangle":
      return `Rechteck ${shape.width}x${shape.height}`;
    case "triangle":
      return `Dreieck mit Basis ${shape.base}`;
    default:
      // Wenn alle Faelle abgedeckt sind, ist shape "never"
      return assertNever(shape);
      // Fuege einen neuen Shape-Typ hinzu und sieh den Compile-Fehler!
  }
}

console.log("\nExhaustive Check:");
for (const s of shapes) {
  console.log(`  ${describe(s)}`);
}

// ─── PRAXISBEISPIEL: API RESPONSE ───────────────────────────────────────────

type ApiResponse<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T; timestamp: Date }
  | { status: "error"; error: string; code: number };

interface User {
  id: string;
  name: string;
}

function renderResponse(response: ApiResponse<User[]>): string {
  switch (response.status) {
    case "idle":
      return "[Idle] Noch nichts geladen.";
    case "loading":
      return "[Loading] Bitte warten...";
    case "success":
      return `[Success] ${response.data.length} User geladen (${response.timestamp.toISOString()})`;
    case "error":
      return `[Error ${response.code}] ${response.error}`;
  }
}

const responses: ApiResponse<User[]>[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "success", data: [{ id: "1", name: "Alice" }], timestamp: new Date() },
  { status: "error", error: "Server nicht erreichbar", code: 503 },
];

console.log("\nAPI Response Pattern:");
for (const r of responses) {
  console.log(`  ${renderResponse(r)}`);
}

// ─── PRAXISBEISPIEL: RESULT TYPE ────────────────────────────────────────────

type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return err("Division durch Null!");
  }
  return ok(a / b);
}

function parseAge(input: string): Result<number> {
  const age = parseInt(input, 10);
  if (Number.isNaN(age)) {
    return err(`"${input}" ist keine Zahl`);
  }
  if (age < 0 || age > 150) {
    return err(`Alter ${age} ist nicht zwischen 0 und 150`);
  }
  return ok(age);
}

console.log("\nResult Type Pattern:");
const divResult = divide(10, 3);
if (divResult.ok) {
  console.log(`  10 / 3 = ${divResult.value.toFixed(2)}`);
}

const divByZero = divide(10, 0);
if (!divByZero.ok) {
  console.log(`  10 / 0 = Error: ${divByZero.error}`);
}

for (const input of ["25", "abc", "-5", "200"]) {
  const result = parseAge(input);
  if (result.ok) {
    console.log(`  parseAge("${input}") = ${result.value}`);
  } else {
    console.log(`  parseAge("${input}") = Error: ${result.error}`);
  }
}

// ─── IF STATT SWITCH ────────────────────────────────────────────────────────

function perimeter(shape: Shape): number {
  if (shape.kind === "circle") {
    return 2 * Math.PI * shape.radius;
  }
  if (shape.kind === "rectangle") {
    return 2 * (shape.width + shape.height);
  }
  // shape: Triangle
  // Vereinfacht: Annahme gleichschenkliges Dreieck
  const side = Math.sqrt((shape.base / 2) ** 2 + shape.height ** 2);
  return shape.base + 2 * side;
}

console.log("\nUmfaenge (if statt switch):");
for (const s of shapes) {
  console.log(`  ${s.kind}: ${perimeter(s).toFixed(2)}`);
}

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
