/**
 * Solution 05: Typsichere Pfade — Paths und PathValue
 */

// Loesung 1: Paths-Typ
type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
  : never;

// Loesung 2: PathValue-Typ
type PathValue<T, P extends string> =
  P extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      : never
    : P extends keyof T
      ? T[P]
      : never;

// Loesung 3: Typsichere get-Funktion
function get<T extends object, P extends Paths<T> & string>(
  obj: T,
  path: P
): PathValue<T, P> {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined as PathValue<T, P>;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current as PathValue<T, P>;
}

// Loesung 4: has-Funktion
function has<T extends object>(
  obj: T,
  path: string
): boolean {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return false;
    }
    if (!(key in (current as Record<string, unknown>))) {
      return false;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current !== undefined;
}

// ─── Test-Typ ────────────────────────────────────────────────────────────────

type FormData = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    country: {
      code: string;
      name: string;
    };
  };
  preferences: {
    newsletter: boolean;
    theme: "light" | "dark";
  };
};

// ─── Tests ───────────────────────────────────────────────────────────────────

const formData: FormData = {
  user: { firstName: "Max", lastName: "Mustermann", email: "max@test.de" },
  address: {
    street: "Hauptstr. 1",
    city: "Berlin",
    country: { code: "DE", name: "Deutschland" },
  },
  preferences: { newsletter: true, theme: "dark" },
};

console.log("=== Type-Safe Paths Tests ===");

console.log("firstName:", get(formData, "user.firstName"));       // "Max"
console.log("country code:", get(formData, "address.country.code")); // "DE"
console.log("theme:", get(formData, "preferences.theme"));         // "dark"

console.log("has user.email:", has(formData, "user.email"));       // true
console.log("has user.invalid:", has(formData, "user.invalid"));   // false
