// Lösung 02: Email-Validierung mit Smart Constructor
// ==================================================

type Brand<T, B extends string> = T & { readonly __brand: B };

type Email = Brand<string, 'Email'>;

// Helper-Funktion für Email-Validierung
function isValidEmail(value: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(value.trim());
}

// Variante a: throw bei Fehler
function createEmailOrThrow(raw: string): Email {
  const normalized = raw.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    throw new Error(`"${raw}" ist keine gültige E-Mail-Adresse`);
  }
  return normalized as Email;
}

// Variante b: null bei Fehler
function tryCreateEmail(raw: string): Email | null {
  const normalized = raw.trim().toLowerCase();
  if (!isValidEmail(normalized)) return null;
  return normalized as Email;
}

// Variante c: Result-Typ
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseEmail(raw: string): Result<Email> {
  const normalized = raw.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    return { ok: false, error: `"${raw}" ist keine gültige E-Mail-Adresse` };
  }
  return { ok: true, value: normalized as Email };
}

// Funktion die nur Email akzeptiert:
function sendMarketingEmail(to: Email): void {
  console.log(`Sende Marketing-E-Mail an ${to}`);
}

// Tests:
console.log('--- Variante a: throw ---');
try {
  const email = createEmailOrThrow("  Max.M@Test.DE  ");
  console.log(`Erstellt: ${email}`); // max.m@test.de (normalisiert!)
  sendMarketingEmail(email); // ✅
} catch (e) {
  console.error((e as Error).message);
}

try {
  createEmailOrThrow("kein-email");
} catch (e) {
  console.log(`Fehler (erwartet): ${(e as Error).message}`);
}

console.log('\n--- Variante b: null ---');
const valid   = tryCreateEmail("user@example.com");
const invalid = tryCreateEmail("invalid");

if (valid !== null) {
  sendMarketingEmail(valid);
  console.log(`Gültig: ${valid}`);
}
if (invalid === null) {
  console.log("Ungültig: null erhalten (erwartet)");
}

console.log('\n--- Variante c: Result ---');
const r1 = parseEmail("a@b.de");
const r2 = parseEmail("");
const r3 = parseEmail("@example.com");

console.log(`r1.ok: ${r1.ok} → ${r1.ok ? r1.value : r1.error}`);
console.log(`r2.ok: ${r2.ok} → ${r2.ok ? r2.value : r2.error}`);
console.log(`r3.ok: ${r3.ok} → ${r3.ok ? r3.value : r3.error}`);

if (r1.ok) {
  sendMarketingEmail(r1.value); // TypeScript weiß: value ist Email ✅
}

// COMPILE-ERRORS (zum Testen einkommentieren):
// sendMarketingEmail("raw@string.com"); // ❌ string ≠ Email

// Erklärung: Welche Variante wann?
// - throw: Wenn ungültige Eingabe "niemals" vorkommen sollte (Invariante)
// - null: Wenn Fehler erwartet werden und einfaches Handling reicht
// - Result: Wenn Fehler strukturiert verarbeitet werden sollen

console.log('\n✅ Lösung 02 erfolgreich!');
