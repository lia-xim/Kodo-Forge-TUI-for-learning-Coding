/**
 * Lektion 16 - Beispiel 04: Bedingte Mapped Types
 * Ausfuehren mit: npx tsx examples/04-bedingte-mapped-types.ts
 */

// ─── Typ-basierte Transformation ──────────────────────────────────────────

type Stringify<T> = {
  [K in keyof T]: T[K] extends number ? string : T[K];
};

interface Stats {
  name: string;
  score: number;
  active: boolean;
  points: number;
}

type StringifiedStats = Stringify<Stats>;
// { name: string; score: string; active: boolean; points: string; }

// ─── OmitByType / PickByType ─────────────────────────────────────────────

type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface Mixed {
  name: string;
  count: number;
  active: boolean;
  label: string;
}

type WithoutStrings = OmitByType<Mixed, string>;
// { count: number; active: boolean; }

type OnlyNumbers = PickByType<Mixed, number>;
// { count: number; }

// ─── Validatoren generieren ───────────────────────────────────────────────

type Validators<T> = {
  [K in keyof T]: T[K] extends string
    ? (value: string) => boolean
    : T[K] extends number
    ? (value: number) => boolean
    : (value: unknown) => boolean;
};

interface SignupForm {
  username: string;
  age: number;
  terms: boolean;
}

const validators: Validators<SignupForm> = {
  username: (v) => v.length >= 3,
  age: (v) => v >= 18,
  terms: (v) => v === true,
};

console.log("Username valid:", validators.username("Max"));
console.log("Age valid:", validators.age(17));
console.log("Terms valid:", validators.terms(true));

console.log("\n--- Bedingte Mapped Types abgeschlossen ---");
