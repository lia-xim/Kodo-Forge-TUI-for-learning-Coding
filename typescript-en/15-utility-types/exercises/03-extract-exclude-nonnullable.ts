/**
 * Lektion 15 - Exercise 03: Extract, Exclude, NonNullable
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-extract-exclude-nonnullable.ts
 *
 * 6 Aufgaben zu Union-Type-Manipulation.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Exclude fuer HTTP-Methoden
// ═══════════════════════════════════════════════════════════════════════════

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

// TODO: Erstelle einen Typ "UnsafeMethod" der nur die schreibenden Methoden
// enthaelt (alles AUSSER GET, HEAD, OPTIONS)
// type UnsafeMethod = ...

// TODO: Erstelle eine Funktion "requireAuth" die nur UnsafeMethod akzeptiert
// function requireAuth(method: UnsafeMethod, url: string): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Extract bei Discriminated Unions
// ═══════════════════════════════════════════════════════════════════════════

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number }
  | { kind: "line"; length: number };

// TODO: Erstelle einen Typ "AreaShape" der nur Shapes MIT Flaeche enthaelt
// (alles ausser "line" — eine Linie hat keine Flaeche)
// Verwende Exclude!
// type AreaShape = ...

// TODO: Erstelle einen Typ "RoundShape" der nur "circle" enthaelt
// Verwende Extract!
// type RoundShape = ...

// TODO: Erstelle eine Funktion "calculateArea" die nur AreaShape akzeptiert
// function calculateArea(shape: AreaShape): number { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: NonNullable in der Praxis
// ═══════════════════════════════════════════════════════════════════════════

interface UserSettings {
  theme: "light" | "dark" | null;
  language: string | undefined;
  fontSize: number | null | undefined;
}

// TODO: Erstelle fuer jedes Feld den NonNullable-Typ:
// type DefiniteTheme = ...    // "light" | "dark"
// type DefiniteLanguage = ... // string
// type DefiniteFontSize = ... // number

// TODO: Erstelle einen Typ "ResolvedSettings" wo ALLE Felder NonNullable sind
// (Tipp: Du kannst einen Mapped Type verwenden oder manuell definieren)
// type ResolvedSettings = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Extract mit Typ-Matching
// ═══════════════════════════════════════════════════════════════════════════

type AllTypes = string | number | boolean | string[] | number[] | Date | RegExp | null;

// TODO: Erstelle folgende Typen mit Extract:
// type ArrayTypes = ...    // string[] | number[]
// type ObjectTypes = ...   // string[] | number[] | Date | RegExp
// type Primitives = ...    // string | number | boolean

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

// TODO: Erstelle einen Typ "UserEvent" — alle Events mit type "user.*"
// (Verwende Extract mit dem passenden Pattern)
// type UserEvent = ...

// TODO: Erstelle einen Typ "NonSystemEvent" — alle Events AUSSER system.*
// type NonSystemEvent = ...

// TODO: Erstelle einen Typ "EventWithChanges" — Events die ein "changes"-Feld haben
// type EventWithChanges = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Eigenen NonNullableDeep bauen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ "NonNullableDeep<T>" der null und undefined
// rekursiv aus ALLEN Properties entfernt (auch verschachtelten)
// type NonNullableDeep<T> = ...

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

// type CleanResponse = NonNullableDeep<ApiResponse>;
// Erwartet: alle null/undefined rekursiv entfernt

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// console.log(requireAuth("POST", "/api/users"));
// console.log(requireAuth("DELETE", "/api/users/1"));
//
// console.log("Circle area:", calculateArea({ kind: "circle", radius: 5 }));
// console.log("Rectangle area:", calculateArea({ kind: "rectangle", width: 4, height: 6 }));

console.log("Exercise 03 geladen. Ersetze die TODOs!");
