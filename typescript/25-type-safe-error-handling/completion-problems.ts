// completion-problems.ts — L25: Type-safe Error Handling
export const completionProblems = [
  {
    id: 1,
    title: "Result-Typ definieren",
    description: "Vervollständige die Definition des Result-Typs mit Discriminated Unions.",
    template: `type Ok<T>  = { readonly ___: true;  readonly value: ___ };
type Err<E> = { readonly ___: false; readonly ___: E };
type Result<___, E = string> = Ok<T> | Err<___>;`,
    blanks: ["ok", "T", "ok", "error", "T", "E"],
    solution: `type Ok<T>  = { readonly ok: true;  readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
type Result<T, E = string> = Ok<T> | Err<E>;`,
    hint: "Discriminated Union braucht ein gemeinsames Property, hier 'ok'. Err hat 'error', Ok hat 'value'."
  },
  {
    id: 2,
    title: "ok-Helfer mit as const",
    description: "Vervollständige den ok-Helfer damit der Literal-Typ erhalten bleibt.",
    template: `function ok<T>(value: T) {
  return { ok: ___ as ___, value };
}`,
    blanks: ["true", "const"],
    solution: `function ok<T>(value: T) {
  return { ok: true as const, value };
}`,
    hint: "Ohne as const wird 'ok' als boolean inferiert statt als Literal true."
  },
  {
    id: 3,
    title: "mapResult Funktion",
    description: "Vervollständige die mapResult Funktion für das Result-Pattern.",
    template: `function mapResult<T, U, E>(
  result: Result<___, E>,
  fn: (value: ___) => U
): Result<___, E> {
  if (!result.___) return result;
  return ok(fn(result.___));
}`,
    blanks: ["T", "T", "U", "ok", "value"],
    solution: `function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (!result.ok) return result;
  return ok(fn(result.value));
}`,
    hint: "map wendet fn auf den existierenden T-Value an und gibt ein neues Result mit U zurück."
  },
  {
    id: 4,
    title: "assertNever Funktion",
    description: "Vervollständige die assertNever Funktion für Exhaustive Checks.",
    template: `function assertNever(x: ___): ___ {
  throw new Error(\`Unhandled case: \${JSON.stringify(___)}\`);
}`,
    blanks: ["never", "never", "x"],
    solution: `function assertNever(x: never): never {
  throw new Error(\`Unhandled case: \${JSON.stringify(x)}\`);
}`,
    hint: "assertNever nimmt den Bottom-Type an, der unmögliche Zustände repräsentiert."
  },
  {
    id: 5,
    title: "Exhaustive Switch",
    description: "Vervollständige den Switch-Block mit assertNever.",
    template: `type Error = 'A' | 'B';
function handle(e: ___): string {
  switch (e) {
    case 'A': return 'A';
    case 'B': return 'B';
    ___: return ___(e);
  }
}`,
    blanks: ["Error", "default", "assertNever"],
    solution: `type Error = 'A' | 'B';
function handle(e: Error): string {
  switch (e) {
    case 'A': return 'A';
    case 'B': return 'B';
    default: return assertNever(e);
  }
}`,
    hint: "Der default-Branch muss assertNever aufrufen um den Compiler prüfen zu lassen."
  },
  {
    id: 6,
    title: "Record satisfies",
    description: "Nutze satisfies für ein exhaustives Mapping.",
    template: `type Status = 'ON' | 'OFF';
const config = {
  ON:  '🟢',
  OFF: '🔴'
} ___ Record<___, string>;`,
    blanks: ["satisfies", "Status"],
    solution: `type Status = 'ON' | 'OFF';
const config = {
  ON:  '🟢',
  OFF: '🔴'
} satisfies Record<Status, string>;`,
    hint: "satisfies prüft den Typ (hier: alle Status-Keys vorhanden) ohne den abgeleiteten Literal-Typ zu verlieren."
  }
];
