/**
 * Lektion 06 - Solution 03: Type Guards und Assertions
 *
 * Ausfuehren mit: npx tsx solutions/03-type-guards-und-assertions.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfacher Type Guard
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Generischer Type Guard, der null UND undefined filtert.
// Das "value is T" sagt TypeScript: "Wenn true, ist es T (ohne null/undefined)"
function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Type Guard fuer Interface
// ═══════════════════════════════════════════════════════════════════════════

interface Tier {
  name: string;
  beine: number;
  laut: string;
}

// Loesung: Schritt fuer Schritt pruefen:
// 1. Ist es ein Objekt? (typeof + !== null)
// 2. Hat es alle Properties? (in-Operator)
// 3. Haben die Properties die richtigen Typen? (typeof)
function isTier(value: unknown): value is Tier {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "beine" in value &&
    "laut" in value &&
    typeof (value as Tier).name === "string" &&
    typeof (value as Tier).beine === "number" &&
    typeof (value as Tier).laut === "string"
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Assertion Function
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Assertion Function mit "asserts value is number".
// Wirft einen beschreibenden Error wenn die Bedingung nicht erfuellt ist.
// Hinweis: "asserts value is number" ist hier etwas vereinfacht —
// streng genommen narrowt es nur wenn es einen spezifischeren Typ gaebe.
// In der Praxis nutzt man Assertions hauptsaechlich fuer null-Checks.
function assertPositive(value: number, name: string): asserts value is number {
  if (value <= 0) {
    throw new Error(`${name} muss positiv sein, erhalten: ${value}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Discriminated Union Type Guard
// ═══════════════════════════════════════════════════════════════════════════

type ApiResponse =
  | { status: "success"; data: unknown }
  | { status: "error"; message: string }
  | { status: "loading" };

// Loesung: Jeder Guard prueft das Discriminant-Feld "status".
// Das ist einfach, weil Discriminated Unions ein gemeinsames Feld haben.
function isSuccess(r: ApiResponse): r is { status: "success"; data: unknown } {
  return r.status === "success";
}

function isError(r: ApiResponse): r is { status: "error"; message: string } {
  return r.status === "error";
}

function isLoading(r: ApiResponse): r is { status: "loading" } {
  return r.status === "loading";
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Assertion + Narrowing kombiniert
// ═══════════════════════════════════════════════════════════════════════════

interface Config {
  host: string;
  port: number;
  debug: boolean;
}

// Loesung: assertIsObject prueft ob der Wert ein Objekt ist.
// parseConfig nutzt dann assertIsObject und prueft jede Property einzeln.
function assertIsObject(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Erwartet Objekt, erhalten: ${typeof value}`);
  }
}

function parseConfig(data: unknown): Config {
  assertIsObject(data);
  // Ab hier: data ist Record<string, unknown>

  if (typeof data.host !== "string") {
    throw new Error(`host muss ein String sein`);
  }
  if (typeof data.port !== "number") {
    throw new Error(`port muss eine Zahl sein`);
  }
  if (typeof data.debug !== "boolean") {
    throw new Error(`debug muss ein Boolean sein`);
  }

  return {
    host: data.host,
    port: data.port,
    debug: data.debug,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Aufgabe 1
const mixed = [1, null, 2, undefined, 3];
const clean = mixed.filter(isNonNull);
console.assert(JSON.stringify(clean) === "[1,2,3]", "A1: isNonNull");

// Aufgabe 2
console.assert(isTier({ name: "Hund", beine: 4, laut: "Wuff" }) === true, "A2: gueltiges Tier");
console.assert(isTier({ name: "Hund" }) === false, "A2: unvollstaendig");
console.assert(isTier(null) === false, "A2: null");
console.assert(isTier({ name: 123, beine: 4, laut: "Wuff" }) === false, "A2: falscher Typ");

// Aufgabe 3
try {
  assertPositive(5, "wert");
  console.assert(true, "A3: positiv OK");
} catch { console.assert(false, "A3: positiv sollte nicht werfen"); }
try {
  assertPositive(-1, "wert");
  console.assert(false, "A3: negativ sollte werfen");
} catch { console.assert(true, "A3: negativ Error geworfen"); }

// Aufgabe 4
const success: ApiResponse = { status: "success", data: [1, 2] };
const error: ApiResponse = { status: "error", message: "Fail" };
const loading: ApiResponse = { status: "loading" };
console.assert(isSuccess(success) === true, "A4: success");
console.assert(isError(error) === true, "A4: error");
console.assert(isLoading(loading) === true, "A4: loading");
console.assert(isSuccess(error) === false, "A4: not success");

// Aufgabe 5
const config = parseConfig({ host: "localhost", port: 3000, debug: true });
console.assert(config.host === "localhost", "A5: host");
console.assert(config.port === 3000, "A5: port");
console.assert(config.debug === true, "A5: debug");
try {
  parseConfig({ host: "localhost" });
  console.assert(false, "A5: sollte bei fehlendem port werfen");
} catch { console.assert(true, "A5: Error bei fehlendem port"); }

console.log("Alle Tests bestanden!");
