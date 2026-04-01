// Example 05: Error-Typen Patterns — Hierarchien & Konvertierung
// Ausführen: npx tsx examples/05-error-types.ts

function assertNever(x: never): never { throw new Error(`Unhandled: ${JSON.stringify(x)}`); }
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
function ok<T>(v: T): { ok: true; value: T } { return { ok: true, value: v }; }
function err<E>(e: E): { ok: false; error: E } { return { ok: false, error: e }; }

// --- Schichten-Fehler-Typen ---
type DbError =
  | { type: 'DB_CONSTRAINT'; constraint: string }
  | { type: 'DB_CONNECTION'; message: string }
  | { type: 'DB_TIMEOUT'; timeoutMs: number };

type UserError =
  | { type: 'USER_NOT_FOUND'; userId: string }
  | { type: 'USER_ALREADY_EXISTS'; email: string }
  | { type: 'USER_SERVICE_UNAVAILABLE'; message: string };

// Konvertierung DB → User (anti-corruption layer):
function mapDbToUserError(dbErr: DbError, ctx: { email?: string; userId?: string }): UserError {
  switch (dbErr.type) {
    case 'DB_CONSTRAINT':
      return { type: 'USER_ALREADY_EXISTS', email: ctx.email ?? 'unknown' };
    case 'DB_CONNECTION':
      return { type: 'USER_SERVICE_UNAVAILABLE', message: dbErr.message };
    case 'DB_TIMEOUT':
      return { type: 'USER_SERVICE_UNAVAILABLE', message: `Timeout nach ${dbErr.timeoutMs}ms` };
    default:
      return assertNever(dbErr);
  }
}

// Simulierter Repository:
function simulateCreateUser(email: string): Result<{ id: string; email: string }, DbError> {
  if (email.includes('existing')) {
    return err({ type: 'DB_CONSTRAINT', constraint: 'users_email_unique' });
  }
  if (email.includes('slow')) {
    return err({ type: 'DB_TIMEOUT', timeoutMs: 5000 });
  }
  return ok({ id: `u-${Date.now()}`, email });
}

// Repository Layer (übersetzt DB → Domain):
function createUserRepo(email: string): Result<{ id: string; email: string }, UserError> {
  const dbResult = simulateCreateUser(email);
  if (!dbResult.ok) {
    return err(mapDbToUserError(dbResult.error, { email }));
  }
  return dbResult;
}

// Presentation (exhaustive handling):
function displayResult(email: string): void {
  const result = createUserRepo(email);
  if (result.ok) {
    console.log(`✅ Erstellt: ${result.value.email} (ID: ${result.value.id})`);
  } else {
    switch (result.error.type) {
      case 'USER_NOT_FOUND':
        console.log(`❌ Nicht gefunden: ${result.error.userId}`); break;
      case 'USER_ALREADY_EXISTS':
        console.log(`❌ Bereits vorhanden: ${result.error.email}`); break;
      case 'USER_SERVICE_UNAVAILABLE':
        console.log(`❌ Nicht verfügbar: ${result.error.message}`); break;
      default:
        return assertNever(result.error);
    }
  }
}

console.log('--- Schichten-Fehler Demo ---');
displayResult('max@example.com');
displayResult('existing@example.com');
displayResult('slow@example.com');

// FormError mit exhaustivem Switch:
type FormError =
  | { type: 'REQUIRED'; field: string }
  | { type: 'MIN_LENGTH'; field: string; min: number }
  | { type: 'MAX_LENGTH'; field: string; max: number }
  | { type: 'PATTERN'; field: string; pattern: string };

function getFormErrorMessage(e: FormError): string {
  switch (e.type) {
    case 'REQUIRED':    return `${e.field} ist Pflichtfeld`;
    case 'MIN_LENGTH':  return `${e.field}: mind. ${e.min} Zeichen`;
    case 'MAX_LENGTH':  return `${e.field}: max. ${e.max} Zeichen`;
    case 'PATTERN':     return `${e.field}: Format ${e.pattern} erwartet`;
    default:            return assertNever(e);
  }
}

console.log('\n--- FormError ---');
const formErrors: FormError[] = [
  { type: 'REQUIRED', field: 'email' },
  { type: 'MIN_LENGTH', field: 'password', min: 8 },
  { type: 'PATTERN', field: 'phone', pattern: '+49...' },
];
formErrors.forEach(e => console.log(getFormErrorMessage(e)));

console.log('\n✅ Error-Types Demo fertig!');
