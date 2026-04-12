// misconceptions.ts — L24: Branded/Nominal Types
// 8 common misconceptions with corrections

export interface Misconception {
  id: number;
  concept: string;
  misconception: string;
  correction: string;
  example?: string;
}

export const misconceptions: Misconception[] = [
  {
    id: 1,
    concept: "type-alias-vs-brand",
    misconception: "`type UserId = string` makes `UserId` a different type than `string`. Error when passing a `string` to a `UserId` function.",
    correction: "Type aliases are just renaming, not a new type. TypeScript checks structure — `type UserId = string` means `UserId IS string`. No difference for the compiler. Brands (`& { __brand: ... }`) are necessary to get real protection.",
    example: `// EXPECTATION (wrong):
type UserId = string;
function getUser(id: UserId) {}
getUser("arbitrary"); // You might think: error — but it's not an error!

// REALITY:
// TypeScript allows this — UserId = string (alias, not a new type)

// SOLUTION:
type UserId = string & { readonly __brand: 'UserId' };
// Now: getUser("arbitrary") → COMPILE-ERROR ✅`
  },
  {
    id: 2,
    concept: "brand-runtime-overhead",
    misconception: "The `__brand` property exists at runtime in the object and causes memory overhead.",
    correction: "Type Erasure: All TypeScript type information is removed during compilation. The `__brand` property exists ONLY at compile time. At runtime, a `UserId` value is a normal JavaScript string with no overhead.",
    example: `// TypeScript (compile time):
const id: UserId = createUserId("user-123");
// The compiled JavaScript:
const id = "user-123"; // Normal string! __brand is gone.

// Zero Runtime Overhead: No object, no allocation, no runtime check`
  },
  {
    id: 3,
    concept: "brand-blocks-all-operations",
    misconception: "A Branded Type `UserId = string & { __brand: 'UserId' }` cannot be used in string operations — `.length`, `.toUpperCase()`, template literals are all blocked.",
    correction: "Wrong: Branded types inherit all operations from the base type. `UserId` is a subtype of `string` → has all string properties. `.length`, `.toUpperCase()`, template literals all work. Only assignability to other types is restricted.",
    example: `type UserId = string & { readonly __brand: 'UserId' };
const id = createUserId("user-123");

// Everything works:
id.toUpperCase();     // "USER-123" ✅
id.length;            // 8 ✅
\`ID: \${id}\`;         // "ID: user-123" ✅
id.startsWith('user-'); // true ✅

// Only assignability is restricted:
function f(x: UserId) {}
f("user-123"); // ❌ COMPILE-ERROR — string ≠ UserId`
  },
  {
    id: 4,
    concept: "as-cast-safety",
    misconception: "When I use `as UserId`, the code is unsafe because the compiler allows it without checking. Brand types offer no real safety.",
    correction: "`as`-casts are a deliberate 'I promise the compiler'. In Smart Constructors this is safe: validation comes BEFORE the cast. The problem only arises when `as Brand` is allowed everywhere. Strategy: `as`-cast ONLY in Smart Constructors. Then: one validated, auditable place instead of 100 unchecked spots.",
    example: `// UNSAFE: as everywhere
function processUser(id: string) {
  getUser(id as UserId); // Uncontrolled cast — dangerous!
}

// SAFE: as only in Smart Constructor
function createUserId(raw: string): UserId {
  validate(raw); // Validate first!
  return raw as UserId; // Then cast — safe.
}
// processUser must now use: createUserId(id) ✅`
  },
  {
    id: 5,
    concept: "structural-vs-nominal-confusion",
    misconception: "TypeScript's Structural Typing and Nominal Typing are two opt-in choices. You can switch to Nominal Typing in tsconfig.json.",
    correction: "No — TypeScript has ONLY Structural Typing. There is no tsconfig option for Nominal Typing. Brand types are the only way to emulate nominal-like behavior. The TypeScript designers deliberately chose Structural Typing (compatibility with JavaScript).",
    example: `// There is NO TypeScript option like:
// "nominalTyping": true  ← DOES NOT EXIST

// Brand technique is the only solution:
type UserId = string & { readonly __brand: 'UserId' };
// ← This simulates Nominal Typing within the Structural system`
  },
  {
    id: 6,
    concept: "brand-subtype-direction",
    misconception: "A `UserId` cannot be passed as a `string` because it is a 'stronger' type and TypeScript forbids downcasting.",
    correction: "The opposite: `UserId` is a subtype of `string` (has all string properties + more). Subtypes can be used anywhere supertypes are expected — that is Liskov's Substitution Principle. `string → UserId` (downcast) is forbidden. `UserId → string` (upcast) is allowed.",
    example: `type UserId = string & { readonly __brand: 'UserId' };
const id: UserId = createUserId("user-123");

// Upcast (UserId → string): ALLOWED
function logRaw(s: string) { console.log(s); }
logRaw(id); // ✅ OK — subtype can be used as supertype

// Downcast (string → UserId): FORBIDDEN
const raw = "user-123";
logUserId(raw); // ❌ COMPILE-ERROR — no brand`
  },
  {
    id: 7,
    concept: "currency-brand-prevents-all-errors",
    misconception: "With `type EurCents = number & { __currency: 'EUR' }` I can no longer make incorrect calculations — TypeScript checks everything.",
    correction: "Brands protect against type mix-ups, but not against logical errors. `eur * 2` yields `number` (not `EurCents`) — TypeScript cannot know whether that is meaningful. Brands protect the boundaries: 'EUR to USD function' → COMPILE-ERROR. But internal calculations require human review.",
    example: `type EurCents = number & { __currency: 'EUR', __cents: true };

// Brand protects:
function chargeUsd(amount: UsdCents) { /* ... */ }
// chargeUsd(eurAmount) → ❌ COMPILE-ERROR ✅

// Brand does NOT protect:
const price: EurCents = 1999 as EurCents;
const taxRate = 0.19;
const tax = price * taxRate; // Does NOT yield EurCents — yields number
// TypeScript does not know: is the result valid cents?`
  },
  {
    id: 8,
    concept: "brand-replaces-validation",
    misconception: "When I have an `Email` brand type, I no longer need to write email validation — TypeScript checks it automatically.",
    correction: "Brands are compile-time only. TypeScript checks NO content, only types. A browser can trivially send `'noemail' as Email` — TypeScript will not complain at compile time. Validation is the JOB of the Smart Constructor, a separate step. Brand = guarantee that the Smart Constructor was called; Validation = WHAT the Smart Constructor checks.",
    example: `type Email = string & { readonly __brand: 'Email' };

// Without validation in Smart Constructor:
function createEmail(raw: string): Email {
  return raw as Email; // No error — but 'noemail' is accepted!
}

const broken: Email = createEmail("noemail"); // ← Accepted!

// Correct: Validation IS part of the Smart Constructor:
function createEmail(raw: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(raw.trim())) throw new Error('Invalid');
  return raw as Email; // Now safe!
}`
  }
];