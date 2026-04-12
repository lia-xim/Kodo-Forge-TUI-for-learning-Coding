// completion-problems.ts — L25: Type-safe Error Handling
export const completionProblems = [
  {
    id: 1,
    title: "Define Result type",
    description: "Complete the definition of the Result type using Discriminated Unions.",
    template: `type Ok<T>  = { readonly ___: true;  readonly value: ___ };
type Err<E> = { readonly ___: false; readonly ___: E };
type Result<___, E = string> = Ok<T> | Err<___>;`,
    blanks: ["ok", "T", "ok", "error", "T", "E"],
    solution: `type Ok<T>  = { readonly ok: true;  readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
type Result<T, E = string> = Ok<T> | Err<E>;`,
    hint: "A Discriminated Union needs a shared property, here 'ok'. Err has 'error', Ok has 'value'."
  },
  {
    id: 2,
    title: "ok helper with as const",
    description: "Complete the ok helper so that the literal type is preserved.",
    template: `function ok<T>(value: T) {
  return { ok: ___ as ___, value };
}`,
    blanks: ["true", "const"],
    solution: `function ok<T>(value: T) {
  return { ok: true as const, value };
}`,
    hint: "Without as const, 'ok' is inferred as boolean instead of the literal true."
  },
  {
    id: 3,
    title: "mapResult Function",
    description: "Complete the mapResult function for the Result pattern.",
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
    hint: "map applies fn to the existing T value and returns a new Result with U."
  },
  {
    id: 4,
    title: "assertNever Function",
    description: "Complete the assertNever function for exhaustive checks.",
    template: `function assertNever(x: ___): ___ {
  throw new Error(\`Unhandled case: \${JSON.stringify(___)}\`);
}`,
    blanks: ["never", "never", "x"],
    solution: `function assertNever(x: never): never {
  throw new Error(\`Unhandled case: \${JSON.stringify(x)}\`);
}`,
    hint: "assertNever takes the bottom type, which represents impossible states."
  },
  {
    id: 5,
    title: "Exhaustive Switch",
    description: "Complete the switch block with assertNever.",
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
    hint: "The default branch must call assertNever to let the compiler check exhaustiveness."
  },
  {
    id: 6,
    title: "Record satisfies",
    description: "Use satisfies for an exhaustive mapping.",
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
    hint: "satisfies checks the type (here: all Status keys present) without losing the inferred literal type."
  }
];