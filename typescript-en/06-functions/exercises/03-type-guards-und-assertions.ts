/**
 * Lektion 06 - Exercise 03: Type Guards und Assertions
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-type-guards-und-assertions.ts
 *
 * 5 Aufgaben zu Type Guards, Assertion Functions und Narrowing-Patterns.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfacher Type Guard
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe einen Type Guard "isNonNull" der null UND undefined
// herausfiltert. Nutze ihn dann um ein Array zu saeubern.

// function isNonNull<T>(value: T | null | undefined): value is T { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Type Guard fuer Interface
// ═══════════════════════════════════════════════════════════════════════════

interface Tier {
  name: string;
  beine: number;
  laut: string;
}

// TODO: Schreibe einen Type Guard "isTier" der prueft ob ein unknown-Wert
// ein gueltiges Tier-Objekt ist. Pruefe alle drei Properties!

// function isTier(value: unknown): value is Tier { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Assertion Function
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Assertion Function "assertPositive" die prueft ob
// eine Zahl positiv ist (> 0). Wenn nicht, wirf einen Error.

// function assertPositive(value: number, name: string): asserts value is number { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Discriminated Union Type Guard
// ═══════════════════════════════════════════════════════════════════════════

type ApiResponse =
  | { status: "success"; data: unknown }
  | { status: "error"; message: string }
  | { status: "loading" };

// TODO: Schreibe Type Guards fuer jeden Status:
// function isSuccess(r: ApiResponse): r is { status: "success"; data: unknown }
// function isError(r: ApiResponse): r is { status: "error"; message: string }
// function isLoading(r: ApiResponse): r is { status: "loading" }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Assertion + Narrowing kombiniert
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "parseConfig" die einen unknown-Wert nimmt
// und ein Config-Objekt zurueckgibt. Nutze Assertion Functions um jeden
// Schritt zu validieren.

interface Config {
  host: string;
  port: number;
  debug: boolean;
}

// function assertIsObject(value: unknown): asserts value is Record<string, unknown> { ... }
// function parseConfig(data: unknown): Config { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese nach dem Loesen
// ═══════════════════════════════════════════════════════════════════════════

/*
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
*/
