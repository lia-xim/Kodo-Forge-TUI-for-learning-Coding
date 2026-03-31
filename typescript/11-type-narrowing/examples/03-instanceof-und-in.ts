/**
 * Lektion 11 - Example 03: instanceof und in-Operator
 *
 * Ausfuehren mit: npx tsx examples/03-instanceof-und-in.ts
 *
 * Zeigt Narrowing mit instanceof (Klassen) und in (Properties/Interfaces).
 */

// ─── INSTANCEOF MIT EINGEBAUTEN KLASSEN ────────────────────────────────────

console.log("--- instanceof mit eingebauten Klassen ---");

function formatiereDatum(wert: string | Date | number): string {
  if (wert instanceof Date) {
    // wert: Date
    return wert.toLocaleDateString("de-DE");
  }
  if (typeof wert === "number") {
    // wert: number — Timestamp
    return new Date(wert).toLocaleDateString("de-DE");
  }
  // wert: string
  return wert;
}

console.log(formatiereDatum(new Date()));
console.log(formatiereDatum(1711843200000));
console.log(formatiereDatum("31.03.2026"));

// ─── INSTANCEOF MIT EIGENEN KLASSEN ────────────────────────────────────────

class ApiError {
  constructor(public statusCode: number, public message: string) {}
}

class ValidationError {
  constructor(public field: string, public message: string) {}
}

class NetworkError {
  constructor(public url: string, public message: string) {}
}

type AppError = ApiError | ValidationError | NetworkError;

function handleError(error: AppError): string {
  if (error instanceof ApiError) {
    // error: ApiError — statusCode verfuegbar
    return `API Error ${error.statusCode}: ${error.message}`;
  }
  if (error instanceof ValidationError) {
    // error: ValidationError — field verfuegbar
    return `Validation Error (${error.field}): ${error.message}`;
  }
  // error: NetworkError (uebrig)
  return `Network Error (${error.url}): ${error.message}`;
}

console.log("\n--- instanceof mit eigenen Klassen ---");
console.log(handleError(new ApiError(404, "Nicht gefunden")));
console.log(handleError(new ValidationError("email", "Ungueltig")));
console.log(handleError(new NetworkError("https://api.example.com", "Timeout")));

// ─── IN-OPERATOR: GRUNDLAGEN ───────────────────────────────────────────────

console.log("\n--- in-Operator Grundlagen ---");

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

function area(shape: Shape): number {
  if ("radius" in shape) {
    // shape: Circle — nur Circle hat "radius"
    return Math.PI * shape.radius ** 2;
  }
  if ("width" in shape) {
    // shape: Rectangle — nur Rectangle hat "width"
    return shape.width * shape.height;
  }
  // shape: Triangle (uebrig)
  return (shape.base * shape.height) / 2;
}

console.log(`Kreis (r=5):       ${area({ kind: "circle", radius: 5 }).toFixed(2)}`);
console.log(`Rechteck (3x4):    ${area({ kind: "rectangle", width: 3, height: 4 })}`);
console.log(`Dreieck (b=6,h=3): ${area({ kind: "triangle", base: 6, height: 3 })}`);

// ─── IN-OPERATOR: DISCRIMINATED UNIONS ─────────────────────────────────────

console.log("\n--- Discriminated Unions mit in ---");

interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: string[];
}

interface ErrorState {
  status: "error";
  errorMessage: string;
}

type AppState = LoadingState | SuccessState | ErrorState;

function renderState(state: AppState): string {
  // Hier verwenden wir den Discriminant ("status") direkt:
  if (state.status === "loading") {
    return "[Spinner] Laden...";
  }
  if ("data" in state) {
    // state: SuccessState — nur dieser hat "data"
    return `[Liste] ${state.data.join(", ")}`;
  }
  // state: ErrorState
  return `[Fehler] ${state.errorMessage}`;
}

console.log(renderState({ status: "loading" }));
console.log(renderState({ status: "success", data: ["A", "B", "C"] }));
console.log(renderState({ status: "error", errorMessage: "Netzwerk-Fehler" }));

// ─── IN-OPERATOR MIT UNKNOWN ───────────────────────────────────────────────

console.log("\n--- in-Operator mit unknown ---");

function describeUnknown(value: unknown): string {
  // Schritt 1: Ist es ein Objekt? (und nicht null)
  if (typeof value !== "object" || value === null) {
    return `Primitiv: ${String(value)}`;
  }
  // value: object

  // Schritt 2: Hat es bestimmte Properties?
  if ("name" in value && "age" in value) {
    // value hat name und age — wir koennen sicher darauf zugreifen
    const v = value as { name: unknown; age: unknown };
    return `Person: ${v.name}, ${v.age} Jahre`;
  }

  if ("length" in value) {
    return `Hat length-Property`;
  }

  return `Objekt ohne bekannte Properties`;
}

console.log(describeUnknown({ name: "Max", age: 30 }));
console.log(describeUnknown([1, 2, 3]));
console.log(describeUnknown({}));
console.log(describeUnknown("hallo"));

// ─── WARUM INSTANCEOF NICHT MIT INTERFACES FUNKTIONIERT ────────────────────

console.log("\n--- instanceof vs. Interfaces ---");

interface User {
  name: string;
  email: string;
}

// Das geht NICHT:
// function isUser(x: unknown): boolean {
//   return x instanceof User;  // Error: 'User' only refers to a type
// }
// Interfaces existieren zur Laufzeit nicht (Type Erasure)!

// Stattdessen: in-Operator oder Type Guard (Sektion 05)
function isUserLike(x: unknown): x is User {
  return (
    typeof x === "object" &&
    x !== null &&
    "name" in x &&
    typeof (x as Record<string, unknown>).name === "string" &&
    "email" in x &&
    typeof (x as Record<string, unknown>).email === "string"
  );
}

const testData = [
  { name: "Max", email: "max@test.de" },
  { name: "Anna" },
  "kein Objekt",
  null,
];

for (const item of testData) {
  console.log(`  ${JSON.stringify(item)}: isUser = ${isUserLike(item)}`);
}

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
