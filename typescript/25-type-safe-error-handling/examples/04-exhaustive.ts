// Example 04: Exhaustive Error Handling mit assertNever
// Ausführen: npx tsx examples/04-exhaustive.ts

function assertNever(x: never, msg?: string): never {
  throw new Error(msg ?? `Unhandled case: ${JSON.stringify(x)}`);
}

// --- Ampel-Demo (für Übungszwecke) ---
type TrafficLight = 'RED' | 'YELLOW' | 'GREEN';

const lightActions = {
  RED:    'Warten',
  YELLOW: 'Bremsen vorbereiten',
  GREEN:  'Fahren',
} satisfies Record<TrafficLight, string>;

function getLightAction(light: TrafficLight): string {
  return lightActions[light];
}

console.log('--- TrafficLight Record ---');
(['RED', 'YELLOW', 'GREEN'] as TrafficLight[]).forEach(l => {
  console.log(`${l}: ${getLightAction(l)}`);
});

// --- API Error exhaustive switch ---
type ApiError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'RATE_LIMITED'; retryAfter: number }
  | { type: 'SERVER_ERROR'; status: number };

function handleApiError(error: ApiError): string {
  switch (error.type) {
    case 'NOT_FOUND':    return `404: ${error.message}`;
    case 'UNAUTHORIZED': return `401: ${error.message}`;
    case 'RATE_LIMITED': return `429: Retry in ${error.retryAfter}s`;
    case 'SERVER_ERROR': return `${error.status}: Serverfehler`;
    default:             return assertNever(error);
  }
}

console.log('\n--- API Error Exhaustive Switch ---');
const errors: ApiError[] = [
  { type: 'NOT_FOUND', message: 'User nicht gefunden' },
  { type: 'UNAUTHORIZED', message: 'Token ungültig' },
  { type: 'RATE_LIMITED', retryAfter: 60 },
  { type: 'SERVER_ERROR', status: 500 },
];

for (const e of errors) {
  console.log(handleApiError(e));
}

// --- Result mit exhaustivem Error ---
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type ParseError =
  | { type: 'EMPTY' }
  | { type: 'TOO_SHORT'; min: number }
  | { type: 'INVALID' };

function parseUsername(raw: string): Result<string, ParseError> {
  if (!raw.trim()) return { ok: false, error: { type: 'EMPTY' } };
  if (raw.trim().length < 3) return { ok: false, error: { type: 'TOO_SHORT', min: 3 } };
  if (!/^[a-z0-9_]+$/i.test(raw)) return { ok: false, error: { type: 'INVALID' } };
  return { ok: true, value: raw.trim() };
}

function displayParsed(result: Result<string, ParseError>): string {
  if (result.ok) return `Benutzername: ${result.value}`;
  switch (result.error.type) {
    case 'EMPTY':     return 'Benutzername darf nicht leer sein';
    case 'TOO_SHORT': return `Mindestens ${result.error.min} Zeichen`;
    case 'INVALID':   return 'Nur Buchstaben, Zahlen und _ erlaubt';
    default:          return assertNever(result.error);
  }
}

console.log('\n--- Exhaustive Result-Parsing ---');
['Max', '', 'ab', 'max!name'].forEach(input => {
  const r = parseUsername(input);
  console.log(`"${input}": ${displayParsed(r)}`);
});

console.log('\n✅ Exhaustive Error Handling Demo fertig!');
