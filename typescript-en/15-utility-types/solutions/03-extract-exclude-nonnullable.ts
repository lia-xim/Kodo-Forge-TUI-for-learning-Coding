/**
 * Lektion 15 - Solution 03: Extract, Exclude, NonNullable
 *
 * Ausfuehren mit: npx tsx solutions/03-extract-exclude-nonnullable.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Exclude fuer HTTP-Methoden
// ═══════════════════════════════════════════════════════════════════════════

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

// Loesung: Exclude entfernt die lesenden Methoden
type UnsafeMethod = Exclude<HttpMethod, "GET" | "HEAD" | "OPTIONS">;
// ^ "POST" | "PUT" | "PATCH" | "DELETE"

function requireAuth(method: UnsafeMethod, url: string): string {
  return `[AUTH REQUIRED] ${method} ${url}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Extract bei Discriminated Unions
// ═══════════════════════════════════════════════════════════════════════════

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number }
  | { kind: "line"; length: number };

// Loesung: Exclude entfernt "line", Extract waehlt "circle" aus
type AreaShape = Exclude<Shape, { kind: "line" }>;
// ^ circle | rectangle | triangle

type RoundShape = Extract<Shape, { kind: "circle" }>;
// ^ { kind: "circle"; radius: number }

function calculateArea(shape: AreaShape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: NonNullable in der Praxis
// ═══════════════════════════════════════════════════════════════════════════

interface UserSettings {
  theme: "light" | "dark" | null;
  language: string | undefined;
  fontSize: number | null | undefined;
}

// Loesung: NonNullable entfernt null und undefined
type DefiniteTheme = NonNullable<UserSettings["theme"]>;       // "light" | "dark"
type DefiniteLanguage = NonNullable<UserSettings["language"]>; // string
type DefiniteFontSize = NonNullable<UserSettings["fontSize"]>; // number

// ResolvedSettings: Alle Felder NonNullable per Mapped Type
type ResolvedSettings = {
  [K in keyof UserSettings]: NonNullable<UserSettings[K]>;
};
// ^ { theme: "light" | "dark"; language: string; fontSize: number }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Extract mit Typ-Matching
// ═══════════════════════════════════════════════════════════════════════════

type AllTypes = string | number | boolean | string[] | number[] | Date | RegExp | null;

// Loesung: Extract mit Pattern-Matching
type ArrayTypes = Extract<AllTypes, any[]>;                      // string[] | number[]
type ObjectTypes = Extract<AllTypes, object>;                    // string[] | number[] | Date | RegExp
type Primitives = Extract<AllTypes, string | number | boolean>;  // string | number | boolean

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Exclude + Extract Pipeline
// ═══════════════════════════════════════════════════════════════════════════

type ApiEvent =
  | { type: "user.created"; userId: number }
  | { type: "user.updated"; userId: number; changes: string[] }
  | { type: "user.deleted"; userId: number }
  | { type: "order.created"; orderId: number }
  | { type: "order.shipped"; orderId: number; trackingId: string }
  | { type: "system.error"; message: string; code: number };

// Loesung: Extract/Exclude mit dem type-Discriminator
type UserEvent = Extract<ApiEvent, { type: `user.${string}` }>;
// ^ user.created | user.updated | user.deleted

type NonSystemEvent = Exclude<ApiEvent, { type: `system.${string}` }>;
// ^ Alles ausser system.error

type EventWithChanges = Extract<ApiEvent, { changes: any }>;
// ^ { type: "user.updated"; userId: number; changes: string[] }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: NonNullableDeep
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Rekursiver Typ der null/undefined auf allen Ebenen entfernt
type NonNullableDeep<T> = T extends (infer U)[]
  ? NonNullableDeep<U>[]
  : T extends object
    ? { [K in keyof T]-?: NonNullableDeep<NonNullable<T[K]>> }
    : NonNullable<T>;

interface ApiResponse {
  user: {
    name: string | null;
    email: string | undefined;
    address: {
      city: string | null;
      zip: string | null | undefined;
    } | null;
  } | null;
}

type CleanResponse = NonNullableDeep<ApiResponse>;
// ^ { user: { name: string; email: string; address: { city: string; zip: string } } }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");
console.log(requireAuth("POST", "/api/users"));
console.log(requireAuth("DELETE", "/api/users/1"));

console.log("Circle area:", calculateArea({ kind: "circle", radius: 5 }));
console.log("Rectangle area:", calculateArea({ kind: "rectangle", width: 4, height: 6 }));
console.log("Triangle area:", calculateArea({ kind: "triangle", base: 3, height: 8 }));

// NonNullable Demonstration:
const settings: ResolvedSettings = { theme: "dark", language: "de", fontSize: 16 };
console.log("Resolved settings:", settings);

console.log("\n--- Alle Tests bestanden! ---");
