// debugging-data.ts — L25: Type-safe Error Handling
export const debuggingChallenges = [
  {
    id: 1,
    title: "Boolean vs Literal Narrowing",
    description: "The code uses a Discriminated Union, but TypeScript throws a compile error when accessing result.value.",
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
  return { ok: true as const, value: n }; // <-- as const here
}`,
    explanation: "Without as const, TypeScript infers `{ ok: boolean, value: number }`. boolean means ok could be true or false. With `as const` it infers `{ ok: true, value: number }` (literal type). Only literal types enable narrowing in the `if(r.ok)` block."
  },
  {
    id: 2,
    title: "Incomplete Error Switch",
    description: "Someone added a new error type 'C' but forgot it in the switch. TypeScript reports no error.",
    buggyCode: `type AppError = 'A' | 'B' | 'C';

function getMessage(e: AppError): string {
  switch (e) {
    case 'A': return 'Error A';
    case 'B': return 'Error B';
    // C is missing! But it compiles.
  }
  return 'Unbekannt';
}`,
    errorMessage: "No error at compile time, but faulty behavior at runtime (returns 'Unbekannt' for C).",
    fix: `function assertNever(x: never): never { throw new Error('Unhandled'); }

function getMessage(e: AppError): string {
  switch (e) {
    case 'A': return 'Error A';
    case 'B': return 'Error B';
    case 'C': return 'Error C'; // Must be added!
    default: return assertNever(e); // This forces the compile error when C is missing
  }
}`,
    explanation: "Without assertNever in the default branch, TypeScript does not check whether all cases in the switch were handled. assertNever(x: never) requires the never type. If C is not handled, the remaining type is 'C', not 'never', which leads to the type error."
  },
  {
    id: 3,
    title: "Satisfies vs Type Annotation",
    description: "The developer wanted to verify that all statuses are available, but ended up losing the specific types.",
    buggyCode: `type Status = 'ON' | 'OFF';
const config: Record<Status, { color: 'green' | 'red' }> = {
  ON: { color: 'green' },
  OFF: { color: 'red' }
};

// ERROR: Type 'string' is not assignable to type '"green"'.
const colorOn: 'green' = config.ON.color;`,
    errorMessage: "Type 'string' is not assignable to type '\"green\"'. (or similar when literal narrowing is missing)",
    fix: `type Status = 'ON' | 'OFF';
const config = {
  ON: { color: 'green' as const },
  OFF: { color: 'red' as const }
} satisfies Record<Status, { color: 'green' | 'red' }>;

const colorOn: 'green' = config.ON.color; // ✅ Works!`,
    explanation: "The type annotation `: Record<...>` intentionally widens the type to exactly the interface. `satisfies` only checks whether it is compatible, but retains the exact structure (e.g. that ON has exactly 'green')."
  },
  {
    id: 4,
    title: "Option vs Undefined Check",
    description: "Array.find() returns undefined, which causes problems with explicit optional types when `strictNullChecks` is enabled.",
    buggyCode: `type Option<T> = T | null;

const nums = [1, 2, 3];
// find() returns number | undefined
const found: Option<number> = nums.find(x => x > 2);
// ERROR: Type 'number | undefined' is not assignable to type 'number | null'.`,
    errorMessage: "Type 'number | undefined' is not assignable to type 'Option<number>'.",
    fix: `const found: Option<number> = nums.find(x => x > 2) ?? null;`,
    explanation: "In TypeScript, find() returns `undefined`, not `null`. A clean `Option<T>` type classically uses `null`. The `??` (Nullish Coalescing) operator is ideal for converting undefined to null."
  },
  {
    id: 5,
    title: "Unknown Catch Variable",
    description: "In try/catch with useUnknownInCatchVariables there are problems with logging.",
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
    explanation: "With `strict: true` (or `useUnknownInCatchVariables: true`), `e` in a catch block is `unknown`. This is safer because in JS you can throw anything (e.g. `throw 'string'`). You must perform type checks (type guards)."
  }
];