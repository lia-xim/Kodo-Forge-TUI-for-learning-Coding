// Example 01: Das Exception-Problem — Unsichtbare Fehler
// Ausführen: npx tsx examples/01-exception-problem.ts

// Problem: Funktionen die werfen ohne es im Typ zu zeigen
function parseUserFromJson(jsonString: string): { id: string; name: string } {
  const data = JSON.parse(jsonString) as Record<string, unknown>;
  if (!data['id'] || !data['name']) throw new Error('Ungültige Daten');
  return { id: data['id'] as string, name: data['name'] as string };
}

// Caller sieht nichts vom Fehlerrisiko im Typ:
console.log('--- Problem: Unsichtbare Fehler ---');
try {
  const user = parseUserFromJson('{"id":"1","name":"Max"}');
  console.log(`User: ${user.name}`); // OK
} catch (e) {
  console.log('Fehler:', (e as Error).message);
}

try {
  parseUserFromJson('{invalid json'); // SyntaxError!
} catch (e) {
  console.log('Gute Erwartung erfüllt:', (e as Error).message.substring(0, 30));
}

// Lösung: Result-Typ
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

function parseUserSafe(jsonString: string): Result<{ id: string; name: string }> {
  try {
    const data = JSON.parse(jsonString) as Record<string, unknown>;
    if (!data['id'] || !data['name']) return { ok: false, error: 'Fehlende Felder' };
    return { ok: true, value: { id: String(data['id']), name: String(data['name']) } };
  } catch {
    return { ok: false, error: 'Ungültiges JSON' };
  }
}

console.log('\n--- Lösung: Result-Typ ---');
const r1 = parseUserSafe('{"id":"1","name":"Max"}');
const r2 = parseUserSafe('{invalid}');
const r3 = parseUserSafe('{"id":"1"}'); // fehlendes name

if (r1.ok) console.log(`User: ${r1.value.name}`);          // Max
if (!r2.ok) console.log(`Fehler r2: ${r2.error}`);         // Ungültiges JSON
if (!r3.ok) console.log(`Fehler r3: ${r3.error}`);         // Fehlende Felder

// useUnknownInCatchVariables Demo:
console.log('\n--- unknown in catch ---');
try {
  throw new Error('Test');
} catch (e: unknown) {
  // e.message → COMPILE-ERROR (einkommtiert)
  if (e instanceof Error) {
    console.log(`Error: ${e.message}`); // TypeScript weiß: Error-Objekt
  }
}

console.log('\n✅ Exception-Problem Beispiel fertig!');
