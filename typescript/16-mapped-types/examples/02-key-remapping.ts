/**
 * Lektion 16 - Beispiel 02: Key Remapping
 * Ausfuehren mit: npx tsx examples/02-key-remapping.ts
 */

// ─── Getter generieren ────────────────────────────────────────────────────

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  email: string;
  age: number;
}

// Typ-Level Ergebnis:
// { getName: () => string; getEmail: () => string; getAge: () => number; }
type UserGetters = Getters<User>;

// Runtime-Implementierung:
function createGetters<T extends Record<string, unknown>>(obj: T): Getters<T> {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const capitalKey = key.charAt(0).toUpperCase() + key.slice(1);
    result[`get${capitalKey}`] = () => (obj as any)[key];
  }
  return result;
}

const user = { name: "Max", email: "max@test.de", age: 30 };
const getters = createGetters(user);
console.log("getName():", (getters as any).getName());
console.log("getAge():", (getters as any).getAge());

// ─── Key-Filterung mit never ──────────────────────────────────────────────

type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

type StringProductProps = StringKeysOnly<Product>;
// { name: string; description: string; }

// ─── Prefix/Suffix fuer Keys ──────────────────────────────────────────────

type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}_${string & K}`]: T[K];
};

type DbUser = Prefixed<User, "user">;
// { user_name: string; user_email: string; user_age: number; }

console.log("\n--- Key-Remapping-Beispiele abgeschlossen ---");
