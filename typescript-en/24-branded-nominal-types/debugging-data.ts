// debugging-data.ts — L24: Branded/Nominal Types
// 5 Debugging Challenges

export interface DebuggingChallenge {
  id: number;
  title: string;
  description: string;
  buggyCode: string;
  errorMessage: string;
  fix: string;
  explanation: string;
}

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: 1,
    title: "Type Alias provides no protection",
    description: "The code is supposed to prevent OrderId from being passed to getUser(). But it compiles without errors. Find the bug.",
    buggyCode: `type UserId  = string;  // Just an alias
type OrderId = string;  // Identical!

function getUser(id: UserId): string {
  return \`User: \${id}\`;
}

const orderId: OrderId = "order-456";
console.log(getUser(orderId)); // No error! Bug!`,
    errorMessage: "No compile error even though OrderId is used — the protection is completely missing.",
    fix: `type UserId  = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function getUser(id: UserId): string {
  return \`User: \${id}\`;
}

function createOrderId(raw: string): OrderId {
  return raw as OrderId;
}

const orderId = createOrderId("order-456");
// getUser(orderId); // ← Now: COMPILE-ERROR ✅`,
    explanation: "Type aliases are just renames, not new types. For real protection: brand intersection `& { readonly __brand: '...' }` is required."
  },
  {
    id: 2,
    title: "as-cast too early, before validation",
    description: "The smart constructor casts before validation. Find and fix the problem.",
    buggyCode: `type Email = string & { readonly __brand: 'Email' };

function createEmail(raw: string): Email {
  const email = raw as Email; // Cast before validation!
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(raw.trim())) {
    throw new Error(\`Invalid email: "\${raw}"\`);
  }
  return email;
}

// BUG: email was already cast as 'Email',
// even though the subsequent validation could still fail.
// The Email object exists as an 'Email' brand before validation occurs.`,
    errorMessage: "The cast happens before validation — conceptually wrong (the type 'promises' validation, but performs it only after).",
    fix: `function createEmail(raw: string): Email {
  const normalized = raw.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new Error(\`Invalid email: "\${raw}"\`);
  }
  return normalized as Email; // Cast AFTER validation — correct!
}`,
    explanation: "The as-cast should always happen AFTER validation. The type 'Email' promises: 'This value is a valid email'. That promise must be kept."
  },
  {
    id: 3,
    title: "Wrong direction: supertype as subtype",
    description: "The function accepts `Email` but `sendCritical` requires `VerifiedEmail`. Find the type error.",
    buggyCode: `type Email         = string & { readonly __brand: 'Email' };
type VerifiedEmail = Email & { readonly __verified: true };

function sendCriticalNotification(to: VerifiedEmail): void {
  console.log(\`Critical to: \${to}\`);
}

function processUserEmail(email: Email): void {
  // BUG: Email is NOT a VerifiedEmail — missing check
  sendCriticalNotification(email as VerifiedEmail); // Unsafe cast!
}`,
    errorMessage: "The as-cast bypasses brand protection. An `Email` is not yet VERIFIED — the critical function may receive an unverified email.",
    fix: `function verifyEmail(email: Email): VerifiedEmail | null {
  // Simulates email verification process:
  // Check in DB whether this email has been verified
  const isVerified = checkEmailVerified(email); // external check
  return isVerified ? email as VerifiedEmail : null;
}

function processUserEmail(email: Email): void {
  const verified = verifyEmail(email);
  if (!verified) {
    console.log('Email not verified — no critical messages');
    return;
  }
  sendCriticalNotification(verified); // ✅ Safe — truly verified
}

function checkEmailVerified(_email: Email): boolean { return true; }`,
    explanation: "Brand hierarchies are not a free pass for unsafe casts. If `VerifiedEmail` has a real meaning (verified), the verification must actually take place."
  },
  {
    id: 4,
    title: "Unit confusion without brand protection",
    description: "The function calculates velocity, but is called with wrong units. The bug is invisible without brands.",
    buggyCode: `// Without brands — all plain numbers
function velocity(distanceMeter: number, timeSecond: number): number {
  return distanceMeter / timeSecond;
}

const distanceFoot   = 328; // Feet (not meters!)
const timeMillisecond = 10000; // Milliseconds (not seconds!)

// No error — wrong units are accepted!
const v = velocity(distanceFoot, timeMillisecond);
console.log(\`v = \${v} m/s\`); // Wrong! 0.0328 instead of 10`,
    errorMessage: "No compile-time check — wrong units are accepted and silently produce the wrong result.",
    fix: `type Brand<T, B extends string> = T & { readonly __brand: B };
type Meter  = Brand<number, 'Meter'>;
type Foot   = Brand<number, 'Foot'>;
type Second = Brand<number, 'Second'>;
type MeterPerSecond = Brand<number, 'MeterPerSecond'>;

function velocity(distance: Meter, time: Second): MeterPerSecond {
  return (distance / time) as MeterPerSecond;
}

function footToMeter(f: Foot): Meter { return (f * 0.3048) as Meter; }

const distanceFoot = 328 as Foot;
const timeSec      = 10 as Second;
const distanceMeter = footToMeter(distanceFoot); // Explicit conversion!

const v = velocity(distanceMeter, timeSec);
// velocity(distanceFoot, timeSec) → ❌ COMPILE-ERROR`,
    explanation: "With brands, unit confusion becomes a compile error. The Mars Orbiter bug would have been visible in the editor with this approach."
  },
  {
    id: 5,
    title: "Currency bug: different currencies added together",
    description: "Two monetary amounts are added — but they have different currencies!",
    buggyCode: `type EurCents = number & { readonly __brand: 'EurCents' };
type UsdCents = number & { readonly __brand: 'UsdCents' };

// BUG: function accepts number instead of typed amounts
function addAmounts(a: number, b: number): number {
  return a + b;
}

const eurPrice = 1999 as EurCents;
const usdTax   = 150  as UsdCents;

// Can be added "accidentally" — brands are bypassed by 'number'!
const total = addAmounts(eurPrice, usdTax); // EUR + USD = ???
console.log(\`Total: \${total}\`); // 2149 — wrong!`,
    errorMessage: "The addAmounts function accepts `number` instead of typed brands — the brand protection is bypassed.",
    fix: `type Currency = 'EUR' | 'USD';
type MoneyAmount<C extends Currency> = number & {
  readonly __currency: C;
  readonly __cents: true;
};
type EurCents = MoneyAmount<'EUR'>;
type UsdCents = MoneyAmount<'USD'>;

// Generic function enforces same currency:
function addMoney<C extends Currency>(a: MoneyAmount<C>, b: MoneyAmount<C>): MoneyAmount<C> {
  return (a + b) as MoneyAmount<C>;
}

const eurPrice = 1999 as EurCents;
const eurTax   = 380  as EurCents;
const usdTax   = 150  as UsdCents;

const total = addMoney(eurPrice, eurTax); // ✅ EUR + EUR
// addMoney(eurPrice, usdTax); // ❌ COMPILE-ERROR — EUR ≠ USD`,
    explanation: "Brand protection only works when the functions themselves use brands. `addAmounts(a: number)` bypasses the protection. The solution: generic `addMoney<C extends Currency>`."
  }
];