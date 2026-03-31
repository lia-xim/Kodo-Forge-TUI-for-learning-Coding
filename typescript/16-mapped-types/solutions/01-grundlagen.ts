/**
 * Lektion 16 - Loesung 01: Mapped Types Grundlagen
 */

// AUFGABE 1
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

// AUFGABE 2
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// AUFGABE 3
type Nullable<T> = { [K in keyof T]: T[K] | null };

// AUFGABE 4
type AllString<T> = { [K in keyof T]: string };

// AUFGABE 5
type WritableRequired<T> = { -readonly [K in keyof T]-?: T[K] };

interface TestConfig {
  readonly host: string;
  readonly port?: number;
  debug?: boolean;
}

// Test:
type Result = WritableRequired<TestConfig>;
// { host: string; port: number; debug: boolean; }

const cfg: Result = { host: "localhost", port: 3000, debug: true };
console.log("WritableRequired:", cfg);
