/**
 * Lektion 12 - Exercise 03: Option & Result Typen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-option-result.ts
 *
 * 4 Aufgaben zu Option<T> und Result<T, E> Patterns.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Option<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere den Option<T> Typ als Discriminated Union
// mit den Varianten { tag: "some"; value: T } und { tag: "none" }
// type Option<T> = ...

// TODO: Erstelle Konstruktor-Funktionen some() und none()
// function some<T>(value: T): Option<T> { ... }
// function none<T>(): Option<T> { ... }

// TODO: Erstelle eine Funktion "unwrapOr" die den Wert zurueckgibt
// oder einen Default-Wert falls None:
// function unwrapOr<T>(option: Option<T>, defaultValue: T): T { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Option<T> anwenden
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Funktion "safeParseInt" die einen String parst
// und Option<number> zurueckgibt (none wenn NaN):
// function safeParseInt(input: string): Option<number> { ... }

// TODO: Erstelle eine Funktion "safeDivide" die zwei Zahlen dividiert
// und Option<number> zurueckgibt (none bei Division durch 0):
// function safeDivide(a: number, b: number): Option<number> { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Result<T, E> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere den Result<T, E> Typ als Discriminated Union
// mit { ok: true; value: T } und { ok: false; error: E }
// type Result<T, E> = ...

// TODO: Erstelle Konstruktor-Funktionen ok() und err()
// function ok<T>(value: T): Result<T, never> { ... }
// function err<E>(error: E): Result<never, E> { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Result<T, E> anwenden
// ═══════════════════════════════════════════════════════════════════════════

type EmailError =
  | { kind: "empty" }
  | { kind: "no_at"; input: string }
  | { kind: "no_domain"; input: string };

// TODO: Erstelle eine Funktion "validateEmail" die eine E-Mail-Adresse
// validiert und Result<string, EmailError> zurueckgibt:
// - Leerer String -> err({ kind: "empty" })
// - Kein "@" enthalten -> err({ kind: "no_at", input })
// - Nichts nach dem "@" -> err({ kind: "no_domain", input })
// - Sonst -> ok(email)
//
// function validateEmail(email: string): Result<string, EmailError> { ... }

// TODO: Erstelle eine Funktion "formatEmailError" die einen EmailError
// als lesbaren String formatiert:
// function formatEmailError(error: EmailError): string { ... }


// ═══════════════════════════════════════════════════════════════════════════
// TESTS (nicht aendern!)
// ═══════════════════════════════════════════════════════════════════════════

/*
// Entkommentiere nach dem Loesen:

console.log("=== Aufgabe 1: Option ===");
console.log(unwrapOr(some(42), 0));          // 42
console.log(unwrapOr(none<number>(), 0));     // 0

console.log("\n=== Aufgabe 2: Option anwenden ===");
console.log(safeParseInt("42"));              // { tag: "some", value: 42 }
console.log(safeParseInt("abc"));             // { tag: "none" }
console.log(safeDivide(10, 3));               // { tag: "some", value: 3.33... }
console.log(safeDivide(10, 0));               // { tag: "none" }

console.log("\n=== Aufgabe 3+4: Result ===");
const valid = validateEmail("user@example.com");
if (valid.ok) console.log(`Gueltig: ${valid.value}`);

const errors = [
  validateEmail(""),
  validateEmail("invalid"),
  validateEmail("user@"),
];
for (const result of errors) {
  if (!result.ok) console.log(`Fehler: ${formatEmailError(result.error)}`);
}
*/
