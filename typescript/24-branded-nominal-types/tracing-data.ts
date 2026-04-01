// tracing-data.ts — L24: Branded/Nominal Types
// 4 Code-Tracing Exercises

export interface TracingStep {
  code: string;
  typeOf?: string;
  notes?: string;
}

export interface TracingExercise {
  id: number;
  title: string;
  code: string;
  steps: { line: number; description: string; value?: string; compileError?: boolean }[];
  expectedOutput?: string;
}

export const tracingExercises: TracingExercise[] = [
  {
    id: 1,
    title: "Subtyp-Beziehung tracing",
    code: `type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;

function createUserId(raw: string): UserId {
  return raw as UserId;
}

function getUser(id: UserId): string {
  return \`User: \${id}\`;
}

function logRaw(s: string): void {
  console.log(s);
}

const userId = createUserId("user-123"); // Zeile 1
const result = getUser(userId);          // Zeile 2
console.log(result);                     // Zeile 3
logRaw(userId);                          // Zeile 4
// logRaw erwartetes Problem: Kompiliert das? `,
    steps: [
      { line: 1, description: "createUserId() gibt 'user-123' als UserId zurück. Typ: UserId (= string & { __brand: 'UserId' })", value: "userId: UserId = 'user-123'" },
      { line: 2, description: "getUser() akzeptiert UserId ✅. Interpoliert id als string im Template.", value: "result: string = 'User: user-123'" },
      { line: 3, description: "console.log gibt die string aus.", value: "Output: 'User: user-123'" },
      { line: 4, description: "logRaw(userId) — UserId ist Subtyp von string → Upcast erlaubt ✅", value: "Output: 'user-123'" }
    ],
    expectedOutput: "User: user-123\nuser-123"
  },
  {
    id: 2,
    title: "Brand-Hierarchie und Fehler-Kontrolle",
    code: `type Email = string & { readonly __brand: 'Email' };
type VerifiedEmail = Email & { readonly __verified: true };

function sendEmail(to: Email): string {
  return \`Sende an: \${to}\`;
}

function sendCritical(to: VerifiedEmail): string {
  return \`KRITISCH an: \${to}\`;
}

const email    = "max@example.com" as Email;
const verified = "max@example.com" as VerifiedEmail;

const r1 = sendEmail(email);     // Schritt 1: valid?
const r2 = sendEmail(verified);  // Schritt 2: valid?
const r3 = sendCritical(verified); // Schritt 3: valid?
// const r4 = sendCritical(email); // Schritt 4: valid?`,
    steps: [
      { line: 13, description: "sendEmail(email): Email akzeptiert Email → ✅ OK", value: "r1 = 'Sende an: max@example.com'" },
      { line: 14, description: "sendEmail(verified): VerifiedEmail ist Subtyp von Email → Upcast → ✅ OK", value: "r2 = 'Sende an: max@example.com'" },
      { line: 15, description: "sendCritical(verified): VerifiedEmail = VerifiedEmail → ✅ OK", value: "r3 = 'KRITISCH an: max@example.com'" },
      { line: 16, description: "sendCritical(email): Email fehlt __verified → COMPILE-ERROR ❌", compileError: true, value: "Type 'Email' is not assignable to 'VerifiedEmail'" }
    ],
    expectedOutput: "Sende an: max@example.com\nSende an: max@example.com\nKRITISCH an: max@example.com\n[COMPILE-ERROR bei Schritt 4]"
  },
  {
    id: 3,
    title: "Smart Constructor mit Result-Typ tracing",
    code: `type Email = string & { readonly __brand: 'Email' };

function parseEmail(raw: string): { ok: true; value: Email } | { ok: false; error: string } {
  const normalized = raw.trim().toLowerCase();
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { ok: false, error: \`Ungültig: "\${raw}"\` };
  }
  return { ok: true, value: normalized as Email };
}

const r1 = parseEmail("  MAX@EXAMPLE.COM  ");
const r2 = parseEmail("kein-email");
const r3 = parseEmail("a@b.de");

console.log(r1.ok, r1.ok ? r1.value : r1.error);
console.log(r2.ok, r2.ok ? r2.value : r2.error);
console.log(r3.ok, r3.ok ? r3.value : r3.error);`,
    steps: [
      { line: 11, description: "parseEmail('  MAX@EXAMPLE.COM  '): trim+lower = 'max@example.com'. Regex ✅. Gibt ok:true zurück.", value: "r1 = { ok: true, value: 'max@example.com' }" },
      { line: 12, description: "parseEmail('kein-email'): Regex schlägt fehl. Gibt ok:false zurück.", value: "r2 = { ok: false, error: 'Ungültig: \"kein-email\"' }" },
      { line: 13, description: "parseEmail('a@b.de'): Regex ✅. Normalisiert bereits ok. ok:true.", value: "r3 = { ok: true, value: 'a@b.de' }" },
      { line: 15, description: "r1.ok=true → r1.value='max@example.com'", value: "Output: 'true max@example.com'" }
    ],
    expectedOutput: "true max@example.com\nfalse Ungültig: \"kein-email\"\ntrue a@b.de"
  },
  {
    id: 4,
    title: "Generischer Id-Typ und Repository tracing",
    code: `type Id<E extends string> = string & { readonly __idType: E };
type UserId   = Id<'User'>;
type ProductId = Id<'Product'>;

const userId    = 'user-001' as UserId;
const productId = 'prod-001' as ProductId;

function getUserById(id: UserId): string { return \`User: \${id}\`; }
function getProductById(id: ProductId): string { return \`Product: \${id}\`; }

// Was sind die Ausgaben? Was löst Compile-Errors aus?
const r1 = getUserById(userId);
const r2 = getProductById(productId);
// const r3 = getUserById(productId);  // ???`,
    steps: [
      { line: 5, description: "userId hat Typ Id<'User'> = string & { __idType: 'User' }. Wert: 'user-001'", value: "userId: UserId" },
      { line: 6, description: "productId hat Typ Id<'Product'> = string & { __idType: 'Product' }. Wert: 'prod-001'", value: "productId: ProductId" },
      { line: 11, description: "getUserById(userId): UserId ✅ kompatibel. Gibt 'User: user-001'", value: "r1 = 'User: user-001'" },
      { line: 12, description: "getProductById(productId): ProductId ✅ kompatibel. Gibt 'Product: prod-001'", value: "r2 = 'Product: prod-001'" },
      { line: 13, description: "getUserById(productId): ProductId.__idType='Product' ≠ UserId.__idType='User' → COMPILE-ERROR", compileError: true, value: "Type 'Id<\"Product\">' is not assignable to 'Id<\"User\">'" }
    ],
    expectedOutput: "User: user-001\nProduct: prod-001\n[COMPILE-ERROR: ProductId ≠ UserId]"
  }
];
