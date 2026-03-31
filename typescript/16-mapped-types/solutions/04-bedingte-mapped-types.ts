/**
 * Lektion 16 - Loesung 04: Bedingte Mapped Types
 */

// AUFGABE 1
type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

// AUFGABE 2
type Validators<T> = {
  [K in keyof T]: T[K] extends string
    ? (value: string) => boolean
    : T[K] extends number
    ? (value: number) => boolean
    : (value: unknown) => boolean;
};

// AUFGABE 3
type NullableOptionals<T> = {
  [K in keyof T]: undefined extends T[K]
    ? T[K] | null
    : T[K];
};

// AUFGABE 4
type Stringify<T> = {
  [K in keyof T]: T[K] extends number | boolean ? string : T[K];
};

// AUFGABE 5
type DeepReadonlyWithArrays<T> = {
  readonly [K in keyof T]: T[K] extends (infer U)[]
    ? readonly DeepReadonlyWithArrays<U>[]
    : T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonlyWithArrays<T[K]>
    : T[K];
};

// Tests:
interface Mixed { name: string; count: number; active: boolean; label: string; }
type WithoutStrings = OmitByType<Mixed, string>;
// { count: number; active: boolean; }

interface User { id: number; name: string; bio?: string; }
type NullUser = NullableOptionals<User>;
// { id: number; name: string; bio?: string | null; }

console.log("Bedingte Mapped Types Solutions compiled successfully.");
