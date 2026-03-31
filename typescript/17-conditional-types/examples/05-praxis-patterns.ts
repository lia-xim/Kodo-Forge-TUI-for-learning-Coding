/**
 * Lektion 17 - Beispiel 05: Praxis-Patterns
 * Ausfuehren mit: npx tsx examples/05-praxis-patterns.ts
 */

// ─── Methods vs Data extrahieren ──────────────────────────────────────────

type Methods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

type Data<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

interface UserService {
  name: string;
  email: string;
  save(): Promise<void>;
  validate(): boolean;
}

type M = Methods<UserService>;  // { save: ...; validate: ...; }
type D = Data<UserService>;     // { name: string; email: string; }

// ─── Smart Overloads mit Conditional Types ────────────────────────────────

type ParseResult<T extends string> =
  T extends `${number}` ? number :
  T extends "true" | "false" ? boolean :
  string;

function smartParse<T extends string>(input: T): ParseResult<T> {
  if (input === "true" || input === "false") return (input === "true") as ParseResult<T>;
  const num = Number(input);
  if (!isNaN(num)) return num as ParseResult<T>;
  return input as ParseResult<T>;
}

const a = smartParse("42");     // number
const b = smartParse("true");   // boolean
const c = smartParse("hello");  // string

console.log("Parse results:", a, b, c);

// ─── WithDefault ──────────────────────────────────────────────────────────

type WithDefault<T, D> = T extends undefined | null ? D : T;

function withDefault<T, D>(value: T, defaultValue: D): WithDefault<T, D> {
  return (value ?? defaultValue) as WithDefault<T, D>;
}

const d = withDefault("hello" as string | undefined, "fallback");
console.log("WithDefault:", d);

console.log("\n--- Praxis-Patterns abgeschlossen ---");
