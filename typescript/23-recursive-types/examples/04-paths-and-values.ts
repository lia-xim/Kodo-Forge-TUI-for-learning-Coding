/**
 * Example 04: Paths und PathValue — Typsichere Objekt-Pfade
 *
 * Ausfuehren: npx tsx examples/04-paths-and-values.ts
 */

// ─── Paths: Alle moeglichen Pfade eines Objekts ─────────────────────────────

type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
  : never;

// ─── PathValue: Typ des Wertes an einem Pfad ────────────────────────────────

type PathValue<T, P extends string> =
  P extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      : never
    : P extends keyof T
      ? T[P]
      : never;

// ─── Test-Typ ────────────────────────────────────────────────────────────────

type UserProfile = {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
    zip: string;
    country: {
      code: string;
      name: string;
    };
  };
  settings: {
    theme: "light" | "dark";
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
};

// Alle Pfade:
type AllPaths = Paths<UserProfile>;
// "name" | "age" | "address" | "address.street" | "address.city" |
// "address.zip" | "address.country" | "address.country.code" |
// "address.country.name" | "settings" | "settings.theme" |
// "settings.notifications" | "settings.notifications.email" |
// "settings.notifications.push"

// Wert-Typen:
type NameType = PathValue<UserProfile, "name">;                          // string
type ThemeType = PathValue<UserProfile, "settings.theme">;               // "light" | "dark"
type CountryCodeType = PathValue<UserProfile, "address.country.code">;   // string
type EmailType = PathValue<UserProfile, "settings.notifications.email">; // boolean

// ─── Typsichere get-Funktion ─────────────────────────────────────────────────

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

// ─── Verwendung ──────────────────────────────────────────────────────────────

const user: UserProfile = {
  name: "Max Mustermann",
  age: 30,
  address: {
    street: "Hauptstrasse 1",
    city: "Berlin",
    zip: "10115",
    country: { code: "DE", name: "Deutschland" },
  },
  settings: {
    theme: "dark",
    notifications: { email: true, push: false },
  },
};

console.log("Name:", get(user, "name"));
console.log("Theme:", get(user, "settings.theme"));
console.log("Country:", get(user, "address.country.name"));
console.log("Push:", get(user, "settings.notifications.push"));

// Diese Zeile wuerde einen Compile-Error geben:
// get(user, "address.invalid");
// TS Error: '"address.invalid"' is not assignable

// ─── Typsichere set-Funktion (Bonus) ────────────────────────────────────────

function set<T extends object, P extends Paths<T> & string>(
  obj: T,
  path: P,
  value: PathValue<T, P>
): T {
  const keys = path.split(".");
  const result = structuredClone(obj);
  let current: Record<string, unknown> = result as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

const updated = set(user, "settings.theme", "light");
console.log("\nUpdated theme:", get(updated, "settings.theme"));
// → "light"

// Type-Safety: Falscher Wert-Typ wird abgelehnt:
// set(user, "settings.theme", "blue");
// Error: '"blue"' is not assignable to type '"light" | "dark"'
