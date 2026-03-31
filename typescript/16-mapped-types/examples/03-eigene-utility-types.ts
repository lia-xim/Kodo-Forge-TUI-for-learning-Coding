/**
 * Lektion 16 - Beispiel 03: Eigene Utility Types
 * Ausfuehren mit: npx tsx examples/03-eigene-utility-types.ts
 */

// ─── Nullable<T> ──────────────────────────────────────────────────────────

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface UserForm {
  name: string;
  email: string;
  age: number;
}

const formData: Nullable<UserForm> = {
  name: "Max",
  email: null,  // OK — null erlaubt
  age: null,    // OK — null erlaubt
};
console.log("Nullable Form:", formData);

// ─── DeepReadonly<T> ──────────────────────────────────────────────────────

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};

interface AppConfig {
  db: {
    host: string;
    credentials: { user: string; pass: string };
  };
  port: number;
}

const config: DeepReadonly<AppConfig> = {
  db: { host: "localhost", credentials: { user: "admin", pass: "secret" } },
  port: 3000,
};
// config.db.credentials.user = "x"; // Error: deep readonly!
console.log("DeepReadonly Config:", config);

// ─── PartialBy<T, K> ─────────────────────────────────────────────────────

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: number;
  name: string;
  email: string;
}

// id wird optional, name und email bleiben Pflicht
type UserDraft = PartialBy<User, "id">;

const draft: UserDraft = { name: "Max", email: "max@test.de" };
// id ist optional!
console.log("User Draft:", draft);

// ─── RequiredKeys<T> und OptionalKeys<T> ──────────────────────────────────

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface Mixed {
  id: number;
  name: string;
  nickname?: string;
  bio?: string;
}

type RKeys = RequiredKeys<Mixed>; // "id" | "name"
type OKeys = OptionalKeys<Mixed>; // "nickname" | "bio"

console.log("\n--- Eigene Utility Types abgeschlossen ---");
