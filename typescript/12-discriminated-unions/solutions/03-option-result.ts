/**
 * Lektion 12 - Solution 03: Option & Result Typen
 *
 * Ausfuehren mit: npx tsx solutions/03-option-result.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Option<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Option ist eine Discriminated Union mit "tag" als Diskriminator.
// Some traegt einen Wert, None nicht.
type Option<T> =
  | { tag: "some"; value: T }
  | { tag: "none" };

function some<T>(value: T): Option<T> {
  return { tag: "some", value };
}

function none<T>(): Option<T> {
  return { tag: "none" };
}

// unwrapOr gibt den Wert zurueck wenn Some, sonst den Default.
// Das vermeidet null-Checks und macht den Default explizit.
function unwrapOr<T>(option: Option<T>, defaultValue: T): T {
  if (option.tag === "some") {
    return option.value;
  }
  return defaultValue;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Option<T> anwenden
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: safeParseInt gibt Some(zahl) oder None zurueck.
// parseInt allein kann NaN zurueckgeben — Option macht das explizit.
function safeParseInt(input: string): Option<number> {
  const num = parseInt(input, 10);
  return isNaN(num) ? none() : some(num);
}

// safeDivide gibt None bei Division durch 0 zurueck.
// Kein Error, kein Infinity — ein sicherer Typ.
function safeDivide(a: number, b: number): Option<number> {
  if (b === 0) {
    return none();
  }
  return some(a / b);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Result<T, E> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Result ist eine Discriminated Union mit "ok" als Boolean-Diskriminator.
// Ok traegt den Erfolgs-Wert, Err den Fehler-Wert.
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Result<T, E> anwenden
// ═══════════════════════════════════════════════════════════════════════════

type EmailError =
  | { kind: "empty" }
  | { kind: "no_at"; input: string }
  | { kind: "no_domain"; input: string };

// Loesung: validateEmail prueft drei Fehler-Bedingungen
// und gibt jeweils einen spezifischen EmailError zurueck.
// Der Aufrufer MUSS den Fehlerfall behandeln — der Compiler erzwingt es.
function validateEmail(email: string): Result<string, EmailError> {
  if (email.length === 0) {
    return err({ kind: "empty" });
  }

  if (!email.includes("@")) {
    return err({ kind: "no_at", input: email });
  }

  const parts = email.split("@");
  if (parts[1].length === 0) {
    return err({ kind: "no_domain", input: email });
  }

  return ok(email);
}

// formatEmailError nutzt den Diskriminator "kind" um
// die passende Fehlermeldung zu erzeugen.
function formatEmailError(error: EmailError): string {
  switch (error.kind) {
    case "empty":
      return "E-Mail darf nicht leer sein";
    case "no_at":
      return `"${error.input}" enthaelt kein @-Zeichen`;
    case "no_domain":
      return `"${error.input}" hat keine Domain nach dem @`;
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== Aufgabe 1: Option ===");
console.log(unwrapOr(some(42), 0));
console.log(unwrapOr(none<number>(), 0));

console.log("\n=== Aufgabe 2: Option anwenden ===");
console.log(safeParseInt("42"));
console.log(safeParseInt("abc"));
console.log(safeDivide(10, 3));
console.log(safeDivide(10, 0));

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

console.log("\n--- Alle Loesungen erfolgreich! ---");
