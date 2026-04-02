// LÖSUNG 01: Result-Typ implementieren

type Ok<T>  = { readonly ok: true;  readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
type Result<T, E = string> = Ok<T> | Err<E>;

function ok<T>(value: T): Ok<T> { return { ok: true, value }; }
function err<E>(e: E): Err<E>   { return { ok: false, error: e }; }

function parseAge(raw: string): Result<number, string> {
  const n = parseInt(raw, 10);
  if (isNaN(n)) return err(`'${raw}' ist keine gültige Zahl`);
  if (n < 0 || n > 150) return err(`Alter ${n} ist nicht zwischen 0 und 150`);
  return ok(n);
}

function mapResult<T, U, E>(result: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

// Test:
const r1 = parseAge("30");
const r2 = parseAge("abc");
if (r1.ok) console.log(r1.value); // 30
if (!r2.ok) console.log(r2.error); // 'abc' ist keine gültige Zahl
