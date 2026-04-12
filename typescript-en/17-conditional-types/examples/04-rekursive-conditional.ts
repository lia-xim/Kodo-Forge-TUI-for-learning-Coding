/**
 * Lektion 17 - Beispiel 04: Rekursive Conditional Types
 * Ausfuehren mit: npx tsx examples/04-rekursive-conditional.ts
 */

// ─── Flatten: Arrays beliebig tief aufloesen ──────────────────────────────

type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

type A = Flatten<string[]>;      // string
type B = Flatten<string[][]>;    // string
type C = Flatten<string[][][]>;  // string

// ─── DeepAwaited: Promises komplett entpacken ─────────────────────────────

type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;

type D = DeepAwaited<Promise<Promise<Promise<string>>>>;  // string

// ─── Rekursive Object-Transformation ──────────────────────────────────────

type DeepPartial<T> = T extends object
  ? T extends Function
    ? T
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface Config {
  db: { host: string; credentials: { user: string; pass: string } };
  port: number;
}

type PartialConfig = DeepPartial<Config>;
// Alle Ebenen sind optional

// ─── JSON-Typ ─────────────────────────────────────────────────────────────

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const valid: JsonValue = {
  name: "Max",
  scores: [1, 2, 3],
  metadata: { nested: { deep: true } },
};

console.log("Recursive Types loaded.");
console.log("JSON value:", JSON.stringify(valid));
