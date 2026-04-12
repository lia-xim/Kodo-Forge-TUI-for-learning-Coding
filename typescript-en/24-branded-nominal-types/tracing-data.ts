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
    title: "Subtype Relationship Tracing",
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

const userId = createUserId("user-123"); // Line 1
const result = getUser(userId);          // Line 2
console.log(result);                     // Line 3
logRaw(userId);                          // Line 4
// logRaw expected problem: Does this compile? `,
    steps: [
      { line: 1, description: "createUserId() returns 'user-123' as UserId. Type: UserId (= string & { __brand: 'UserId' })", value: "userId: UserId = 'user-123'" },
      { line: 2, description: "getUser() accepts UserId ✅. Interpolates id as string in template.", value: "result: string = 'User: user-123'" },
      { line: 3, description: "console.log outputs the string.", value: "Output: 'User: user-123'" },
      { line: 4, description: "logRaw(userId) — UserId is subtype of string → upcast allowed ✅", value: "Output: 'user-123'" }
    ],
    expectedOutput: "User: user-123\nuser-123"
  },
  {
    id: 2,
    title: "Brand Hierarchy and Error Control",
    code: `type Email = string & { readonly __brand: 'Email' };
type VerifiedEmail = Email & { readonly __verified: true };

function sendEmail(to: Email): string {
  return \`Sending to: \${to}\`;
}

function sendCritical(to: VerifiedEmail): string {
  return \`CRITICAL to: \${to}\`;
}

const email    = "max@example.com" as Email;
const verified = "max@example.com" as VerifiedEmail;

const r1 = sendEmail(email);     // Step 1: valid?
const r2 = sendEmail(verified);  // Step 2: valid?
const r3 = sendCritical(verified); // Step 3: valid?
// const r4 = sendCritical(email); // Step 4: valid?`,
    steps: [
      { line: 13, description: "sendEmail(email): Email accepts Email → ✅ OK", value: "r1 = 'Sending to: max@example.com'" },
      { line: 14, description: "sendEmail(verified): VerifiedEmail is subtype of Email → upcast → ✅ OK", value: "r2 = 'Sending to: max@example.com'" },
      { line: 15, description: "sendCritical(verified): VerifiedEmail = VerifiedEmail → ✅ OK", value: "r3 = 'CRITICAL to: max@example.com'" },
      { line: 16, description: "sendCritical(email): Email missing __verified → COMPILE-ERROR ❌", compileError: true, value: "Type 'Email' is not assignable to 'VerifiedEmail'" }
    ],
    expectedOutput: "Sending to: max@example.com\nSending to: max@example.com\nCRITICAL to: max@example.com\n[COMPILE-ERROR at Step 4]"
  },
  {
    id: 3,
    title: "Smart Constructor with Result Type Tracing",
    code: `type Email = string & { readonly __brand: 'Email' };

function parseEmail(raw: string): { ok: true; value: Email } | { ok: false; error: string } {
  const normalized = raw.trim().toLowerCase();
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { ok: false, error: \`Invalid: "\${raw}"\` };
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
      { line: 11, description: "parseEmail('  MAX@EXAMPLE.COM  '): trim+lower = 'max@example.com'. Regex ✅. Returns ok:true.", value: "r1 = { ok: true, value: 'max@example.com' }" },
      { line: 12, description: "parseEmail('kein-email'): Regex fails. Returns ok:false.", value: "r2 = { ok: false, error: 'Invalid: \"kein-email\"' }" },
      { line: 13, description: "parseEmail('a@b.de'): Regex ✅. Already normalized. ok:true.", value: "r3 = { ok: true, value: 'a@b.de' }" },
      { line: 15, description: "r1.ok=true → r1.value='max@example.com'", value: "Output: 'true max@example.com'" }
    ],
    expectedOutput: "true max@example.com\nfalse Invalid: \"kein-email\"\ntrue a@b.de"
  },
  {
    id: 4,
    title: "Generic Id Type and Repository Tracing",
    code: `type Id<E extends string> = string & { readonly __idType: E };
type UserId   = Id<'User'>;
type ProductId = Id<'Product'>;

const userId    = 'user-001' as UserId;
const productId = 'prod-001' as ProductId;

function getUserById(id: UserId): string { return \`User: \${id}\`; }
function getProductById(id: ProductId): string { return \`Product: \${id}\`; }

// What are the outputs? What triggers compile errors?
const r1 = getUserById(userId);
const r2 = getProductById(productId);
// const r3 = getUserById(productId);  // ???`,
    steps: [
      { line: 5, description: "userId has type Id<'User'> = string & { __idType: 'User' }. Value: 'user-001'", value: "userId: UserId" },
      { line: 6, description: "productId has type Id<'Product'> = string & { __idType: 'Product' }. Value: 'prod-001'", value: "productId: ProductId" },
      { line: 11, description: "getUserById(userId): UserId ✅ compatible. Returns 'User: user-001'", value: "r1 = 'User: user-001'" },
      { line: 12, description: "getProductById(productId): ProductId ✅ compatible. Returns 'Product: prod-001'", value: "r2 = 'Product: prod-001'" },
      { line: 13, description: "getUserById(productId): ProductId.__idType='Product' ≠ UserId.__idType='User' → COMPILE-ERROR", compileError: true, value: "Type 'Id<\"Product\">' is not assignable to 'Id<\"User\">'" }
    ],
    expectedOutput: "User: user-001\nProduct: prod-001\n[COMPILE-ERROR: ProductId ≠ UserId]"
  }
];