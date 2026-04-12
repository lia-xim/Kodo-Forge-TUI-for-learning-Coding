/**
 * Lektion 12 - Example 03: Option & Result Typen (ADTs)
 *
 * Ausfuehren mit: npx tsx examples/03-option-result.ts
 *
 * Option<T> (Some/None) und Result<T, E> (Ok/Err) als
 * algebraische Datentypen in TypeScript.
 */

// ─── OPTION<T>: TYPSICHERE NULL-ALTERNATIVE ────────────────────────────────

type Option<T> =
  | { tag: "some"; value: T }
  | { tag: "none" };

function some<T>(value: T): Option<T> {
  return { tag: "some", value };
}

function none<T>(): Option<T> {
  return { tag: "none" };
}

// Utility: Map ueber den Option-Wert
function mapOption<T, U>(option: Option<T>, fn: (value: T) => U): Option<U> {
  if (option.tag === "some") {
    return some(fn(option.value));
  }
  return none();
}

// Utility: Default-Wert fuer None
function unwrapOr<T>(option: Option<T>, defaultValue: T): T {
  if (option.tag === "some") {
    return option.value;
  }
  return defaultValue;
}

// ─── OPTION IN DER PRAXIS ──────────────────────────────────────────────────

type User = { id: string; name: string; email: string };

// Simulierte Datenbank
const users: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
];

function findUser(id: string): Option<User> {
  const user = users.find(u => u.id === id);
  return user ? some(user) : none();
}

console.log("=== Option<T> ===");

const found = findUser("1");
if (found.tag === "some") {
  console.log(`Gefunden: ${found.value.name} (${found.value.email})`);
}

const notFound = findUser("999");
console.log(`Gefunden? ${notFound.tag}`); // "none"

// Map: Name extrahieren
const userName = mapOption(findUser("2"), user => user.name);
console.log(`User-Name: ${unwrapOr(userName, "Unbekannt")}`);

// ─── RESULT<T, E>: TYPSICHERE FEHLERBEHANDLUNG ────────────────────────────

type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Utility: Map ueber den Erfolgs-Wert
function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

// Utility: Ergebnis entpacken mit Default
function unwrapResultOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.ok) {
    return result.value;
  }
  return defaultValue;
}

// ─── RESULT IN DER PRAXIS ──────────────────────────────────────────────────

type ParseError =
  | { kind: "not_a_number"; input: string }
  | { kind: "out_of_range"; value: number; min: number; max: number };

function parseAge(input: string): Result<number, ParseError> {
  const num = parseInt(input, 10);

  if (isNaN(num)) {
    return err({ kind: "not_a_number", input });
  }
  if (num < 0 || num > 150) {
    return err({ kind: "out_of_range", value: num, min: 0, max: 150 });
  }

  return ok(num);
}

function formatParseError(error: ParseError): string {
  switch (error.kind) {
    case "not_a_number":
      return `"${error.input}" ist keine gueltige Zahl`;
    case "out_of_range":
      return `${error.value} liegt nicht zwischen ${error.min} und ${error.max}`;
  }
}

console.log("\n=== Result<T, E> ===");

const inputs = ["25", "abc", "-5", "200", "42"];

for (const input of inputs) {
  const result = parseAge(input);
  if (result.ok) {
    console.log(`  "${input}" -> Alter: ${result.value}`);
  } else {
    console.log(`  "${input}" -> Fehler: ${formatParseError(result.error)}`);
  }
}

// ─── VERKETTUNG (CHAINING) ─────────────────────────────────────────────────

function parseAndDouble(input: string): Result<number, ParseError> {
  const result = parseAge(input);
  return mapResult(result, age => age * 2);
}

console.log("\n=== Result Chaining ===");
const doubled = parseAndDouble("20");
if (doubled.ok) {
  console.log(`20 verdoppelt: ${doubled.value}`);
}

const failed = parseAndDouble("abc");
if (!failed.ok) {
  console.log(`Fehler durchgereicht: ${formatParseError(failed.error)}`);
}

// ─── OPTION UND RESULT KOMBINIERT ──────────────────────────────────────────

function findUserAge(id: string, ageInput: string): Result<string, string> {
  const userOpt = findUser(id);
  if (userOpt.tag === "none") {
    return err(`User ${id} nicht gefunden`);
  }

  const ageResult = parseAge(ageInput);
  if (!ageResult.ok) {
    return err(formatParseError(ageResult.error));
  }

  return ok(`${userOpt.value.name} ist ${ageResult.value} Jahre alt`);
}

console.log("\n=== Option + Result kombiniert ===");
console.log(findUserAge("1", "30"));   // Ok
console.log(findUserAge("999", "30")); // Err: User nicht gefunden
console.log(findUserAge("1", "abc"));  // Err: Keine gueltige Zahl

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
