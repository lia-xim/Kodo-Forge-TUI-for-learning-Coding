/**
 * Exercise 05: Typsichere Pfade — Paths und PathValue
 *
 * Implementiere typsichere Objekt-Pfad-Zugriffe.
 *
 * Ausfuehren: npx tsx exercises/05-type-safe-paths.ts
 * Hints: Siehe hints.json "exercises/05-type-safe-paths.ts"
 */

// TODO 1: Implementiere den Paths<T> Typ
// Berechnet alle moeglichen Punkt-getrennten Pfade eines Objekts
// Paths<{a: {b: string}}> = "a" | "a.b"
type Paths<T> = unknown; // ← Ersetze unknown

// TODO 2: Implementiere den PathValue<T, P> Typ
// Gibt den Typ des Wertes an einem Pfad zurueck
// PathValue<{a: {b: string}}, "a.b"> = string
type PathValue<T, P extends string> = unknown; // ← Ersetze unknown

// TODO 3: Implementiere eine typsichere get-Funktion
function get<T extends object, P extends Paths<T> & string>(
  obj: T,
  path: P
): PathValue<T, P> {
  // TODO: Implementiere den Pfad-Zugriff
  return undefined as PathValue<T, P>;
}

// TODO 4: Implementiere eine typsichere has-Funktion
// Prueft ob ein Pfad existiert und einen nicht-undefined Wert hat
function has<T extends object>(
  obj: T,
  path: string
): boolean {
  // TODO: Implementiere
  return false;
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

// Typ-Tests (hovere im Editor):
type AllPaths = Paths<FormData>;
// Erwartet: "user" | "user.firstName" | "user.lastName" | "user.email"
// | "address" | "address.street" | ... | "preferences.theme"

type EmailType = PathValue<FormData, "user.email">;
// Erwartet: string

type ThemeType = PathValue<FormData, "preferences.theme">;
// Erwartet: "light" | "dark"

// Runtime-Tests:
console.log("firstName:", get(formData, "user.firstName"));
// Erwartet: "Max"

console.log("country code:", get(formData, "address.country.code"));
// Erwartet: "DE"

console.log("theme:", get(formData, "preferences.theme"));
// Erwartet: "dark"

console.log("has user.email:", has(formData, "user.email"));
// Erwartet: true

// Diese Zeile sollte ein Compile-Error sein (auskommentiert):
// get(formData, "user.invalid");
