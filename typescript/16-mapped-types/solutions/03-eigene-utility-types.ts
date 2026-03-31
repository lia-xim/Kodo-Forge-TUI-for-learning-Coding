/**
 * Lektion 16 - Loesung 03: Eigene Utility Types
 */

// AUFGABE 1
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K];
};

// AUFGABE 2
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};

// AUFGABE 3
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// AUFGABE 4
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// AUFGABE 5
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// Tests:
interface TestUser {
  id: number;
  name: string;
  bio?: string;
  avatar?: string;
}

type RK = RequiredKeys<TestUser>;  // "id" | "name"
type OK = OptionalKeys<TestUser>;  // "bio" | "avatar"

type Draft = PartialBy<TestUser, "id">;
const draft: Draft = { name: "Max" };  // id ist optional
console.log("Draft:", draft);
