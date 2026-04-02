// debugging-data.ts — L25: Type-safe Error Handling
export const debuggingChallenges = [
  {
    id: 1,
    title: "Boolean vs Literal Narrowing",
    description: "Der Code verwendet ein Discriminated Union, aber TypeScript wirft einen Compile-Error beim Zugriff auf result.value.",
    buggyCode: `type Result<T, E> = { ok: true, value: T } | { ok: false, error: E };

function parse(s: string): Result<number, string> {
  const n = parseInt(s);
  if (isNaN(n)) return { ok: false, error: 'NaN' };
  return { ok: true, value: n };
}

const r = parse("42");
if (r.ok) {
  // ERROR: Property 'value' does not exist on type '{ ok: false; error: string; } | { ok: true; value: number; }'
  console.log(r.value);
}`,
    errorMessage: "Property 'value' does not exist on type '{ ok: false; error: string; } | { ok: true; value: number; }'",
    fix: `function parse(s: string): Result<number, string> {
  const n = parseInt(s);
  if (isNaN(n)) return { ok: false, error: 'NaN' };
  return { ok: true as const, value: n }; // <-- as const hier
}`,
    explanation: "Ohne as const inferiert TypeScript `{ ok: boolean, value: number }`. boolean bedeutet ok könnte true oder false sein. Mit `as const` inferiert es `{ ok: true, value: number }` (Literal-Typ). Nur Literal-Typen ermöglichen Narrowing im `if(r.ok)` Block."
  },
  {
    id: 2,
    title: "Lückenhaftes Error-Switch",
    description: "Jemand hat einen neuen Error-Typ 'C' hinzugefügt, ihn aber im Switch vergessen. TypeScript meldet keinen Fehler.",
    buggyCode: `type AppError = 'A' | 'B' | 'C';

function getMessage(e: AppError): string {
  switch (e) {
    case 'A': return 'Error A';
    case 'B': return 'Error B';
    // C fehlt! Aber es kompiliert.
  }
  return 'Unbekannt';
}`,
    errorMessage: "Kein Fehler beim Kompilieren, aber zur Laufzeit fehlerhaftes Verhalten (gibt 'Unbekannt' für C zurück).",
    fix: `function assertNever(x: never): never { throw new Error('Unhandled'); }

function getMessage(e: AppError): string {
  switch (e) {
    case 'A': return 'Error A';
    case 'B': return 'Error B';
    case 'C': return 'Error C'; // Muss hinzugefügt werden!
    default: return assertNever(e); // Das erzwingt den Compile-Error wenn C fehlt
  }
}`,
    explanation: "Ohne assertNever im default-Zweig prüft TypeScript nicht, ob alle Fälle im Switch behandelt wurden. assertNever(x: never) verlangt den never-Typ. Wenn C nicht behandelt wird, ist der Rest-Typ 'C', nicht 'never', was zum Typfehler führt."
  },
  {
    id: 3,
    title: "Satisfies vs Typ-Annotation",
    description: "Der Entwickler wollte prüfen, dass alle Status verfügbar sind, hat sich aber die spezifischen Typen ruiniert.",
    buggyCode: `type Status = 'ON' | 'OFF';
const config: Record<Status, { color: 'green' | 'red' }> = {
  ON: { color: 'green' },
  OFF: { color: 'red' }
};

// ERROR: Type 'string' is not assignable to type '"green"'.
const colorOn: 'green' = config.ON.color;`,
    errorMessage: "Type 'string' is not assignable to type '\"green\"'. (oder ähnlich bei fehlendem Literal narrowing)",
    fix: `type Status = 'ON' | 'OFF';
const config = {
  ON: { color: 'green' as const },
  OFF: { color: 'red' as const }
} satisfies Record<Status, { color: 'green' | 'red' }>;

const colorOn: 'green' = config.ON.color; // ✅ Geht!`,
    explanation: "Die Typ-Annotation `: Record<...>` Verbreitert den Typ absichtlich auf genau das Interface. `satisfies` prüft nur, ob es kompatibel ist, ODER behält die genaue Struktur (zB dass ON exact 'green' hat)."
  },
  {
    id: 4,
    title: "Option vs Undefined Check",
    description: "Array.find() gibt undefined zurück, was mit `strictNullChecks` zu Problemen mit expliziten Optional Typen führt.",
    buggyCode: `type Option<T> = T | null;

const nums = [1, 2, 3];
// find() gibt number | undefined
const found: Option<number> = nums.find(x => x > 2);
// ERROR: Type 'number | undefined' is not assignable to type 'number | null'.`,
    errorMessage: "Type 'number | undefined' is not assignable to type 'Option<number>'.",
    fix: `const found: Option<number> = nums.find(x => x > 2) ?? null;`,
    explanation: "In TypeScript gibt find() `undefined` zurück, nicht `null`. Ein sauberer `Option<T>`-Typ verwendet klassischerweise `null`. Der Operator `??` (Nullish Coalescing) ist ideal, um undefined in null umzuwandeln."
  },
  {
    id: 5,
    title: "Unknown Catch Variable",
    description: "In try/catch mit useUnknownInCatchVariables gibt es Probleme beim Logging.",
    buggyCode: `try {
  throw new Error("Kaputt");
} catch (e) {
  // ERROR: 'e' is of type 'unknown'.
  console.log(e.message);
}`,
    errorMessage: "'e' is of type 'unknown'.",
    fix: `try {
  throw new Error("Kaputt");
} catch (e) {
  if (e instanceof Error) {
    console.log(e.message);
  } else {
    console.log(e);
  }
}`,
    explanation: "Mit `strict: true` (oder `useUnknownInCatchVariables: true`) ist `e` in einem catch-Block `unknown`. Das ist sicherer, denn in JS kann man alles werfen (zB `throw 'string'`). Man muss Typüberprüfungen (Type Guards) durchführen."
  }
];
