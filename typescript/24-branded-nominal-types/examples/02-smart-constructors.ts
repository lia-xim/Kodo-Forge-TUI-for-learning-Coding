// Beispiel 02: Smart Constructors — Validierung + Brand vergabe
// =============================================================
// Zeigt: Verschiedene Smart Constructor Varianten
// Ausführen: npx tsx examples/02-smart-constructors.ts

type Brand<T, B extends string> = T & { readonly __brand: B };

// ─── Email mit verschiedenen Smart Constructor Varianten ──────

type Email = Brand<string, 'Email'>;

// Variante 1: throw (simple)
function createEmail(value: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalized = value.trim().toLowerCase();
  if (!emailRegex.test(normalized)) {
    throw new Error(`Ungültige E-Mail: "${value}"`);
  }
  return normalized as Email;
}

// Variante 2: null (expliziter Fehlerfall)
function tryCreateEmail(value: string): Email | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalized = value.trim().toLowerCase();
  if (!emailRegex.test(normalized)) return null;
  return normalized as Email;
}

// Variante 3: Result-Typ
type Result<T, E = string> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseEmail(value: string): Result<Email> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalized = value.trim().toLowerCase();
  if (!emailRegex.test(normalized)) {
    return { ok: false, error: `Ungültige E-Mail: "${value}"` };
  }
  return { ok: true, value: normalized as Email };
}

// Verwendung:
function sendWelcomeEmail(to: Email): void {
  console.log(`Sende Willkommens-E-Mail an: ${to}`);
}

// Variante 1:
try {
  const email = createEmail("  Max.Mustermann@Example.COM  ");
  console.log(`Erstellt (Variante 1): ${email}`); // normalisiert!
  sendWelcomeEmail(email); // ✅
} catch (e) {
  console.error((e as Error).message);
}

// Variante 2:
const maybeEmail = tryCreateEmail("kein-email");
if (maybeEmail !== null) {
  sendWelcomeEmail(maybeEmail);
} else {
  console.log("Variante 2: E-Mail ungültig"); // Erwartetes Ergebnis
}

// Variante 3:
const result = parseEmail("anna@example.de");
if (result.ok) {
  sendWelcomeEmail(result.value); // ✅ TypeScript weiß: value ist Email
  console.log(`Gespeichert: ${result.value}`);
} else {
  console.error(`Fehler: ${result.error}`);
}

// sendWelcomeEmail("raw@string.com"); // ❌ COMPILE-ERROR

// ─── Physikalische Einheiten ────────────────────────────────────

type Meter    = Brand<number, 'Meter'>;
type Kilogram = Brand<number, 'Kilogram'>;

const meter = (n: number): Meter => {
  if (n < 0) throw new Error("Negative Länge nicht erlaubt");
  return n as Meter;
};

const kg = (n: number): Kilogram => {
  if (n <= 0) throw new Error("Gewicht muss positiv sein");
  return n as Kilogram;
};

function calculateBMI(weight: Kilogram, height: Meter): number {
  return Number((weight / (height * height)).toFixed(2));
}

const myWeight = kg(75);
const myHeight = meter(1.80);
console.log(`BMI: ${calculateBMI(myWeight, myHeight)}`); // 23.15

// calculateBMI(myHeight, myWeight); // ❌ COMPILE-ERROR — Meter ≠ Kilogram

// ─── Multi-Step Validierung ─────────────────────────────────────

type Trimmed   = { readonly __trimmed: true };
type NonEmpty  = { readonly __nonEmpty: true };
type Lowercase = { readonly __lowercase: true };
type SearchQuery = string & Trimmed & NonEmpty & Lowercase;

function createSearchQuery(input: string): SearchQuery | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  const lower = trimmed.toLowerCase();
  return lower as SearchQuery;
}

function search(query: SearchQuery): void {
  console.log(`Suche: "${query}"`);
}

const q = createSearchQuery("  TypeScript Generics  ");
if (q) {
  search(q); // ✅ "typescript generics"
  console.log(`Query länge: ${q.length}`);
}

// search("typescript") // ❌ COMPILE-ERROR — string ≠ SearchQuery

console.log("\n✅ Alle Smart Constructor Beispiele erfolgreich!");
