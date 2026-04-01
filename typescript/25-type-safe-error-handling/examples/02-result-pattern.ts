// Example 02: Result-Pattern vollständig
// Ausführen: npx tsx examples/02-result-pattern.ts

type Ok<T>  = { readonly ok: true;  readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
type Result<T, E = string> = Ok<T> | Err<E>;

function ok<T>(value: T): Ok<T>  { return { ok: true,  value }; }
function err<E>(e: E):   Err<E>  { return { ok: false, error: e }; }

// Email-Typen:
type Email = string & { readonly __brand: 'Email' };
type ParseError =
  | { type: 'EMPTY'; message: string }
  | { type: 'INVALID_FORMAT'; message: string; input: string };

function parseEmail(raw: string): Result<Email, ParseError> {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return err({ type: 'EMPTY', message: 'E-Mail leer' });
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(normalized)) return err({
    type: 'INVALID_FORMAT', message: 'Ungültiges Format', input: raw
  });
  return ok(normalized as Email);
}

// map und flatMap:
function mapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return r.ok ? ok(fn(r.value)) : r;
}

function flatMapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {
  return r.ok ? fn(r.value) : r;
}

// Demo:
console.log('--- Result-Pattern Demo ---');
const tests = ['max@example.com', '', 'invalid', '  MAX@TEST.DE  '];

for (const test of tests) {
  const result = parseEmail(test);
  if (result.ok) {
    console.log(`✅ "${test}" → "${result.value}"`);
  } else {
    const e = result.error;
    switch (e.type) {
      case 'EMPTY':          console.log(`❌ Leer: ${e.message}`); break;
      case 'INVALID_FORMAT': console.log(`❌ Format: "${e.input}"`); break;
    }
  }
}

console.log('\n--- Map/FlatMap Chaining ---');
const emailResult = parseEmail('max@example.com');

const uppercase = mapResult(emailResult, e => e.toUpperCase());
console.log('Uppercase:', uppercase.ok ? uppercase.value : 'ERROR');

const lengthCheck = flatMapResult(
  parseEmail('x@y.z'),
  email => email.length > 5 ? ok(email.length) : err({ type: 'EMPTY' as const, message: 'Zu kurz' })
);
console.log('LengthCheck (x@y.z):', lengthCheck.ok ? lengthCheck.value : `Err: ${lengthCheck.error.type}`);

console.log('\n✅ Result-Pattern Demo fertig!');
