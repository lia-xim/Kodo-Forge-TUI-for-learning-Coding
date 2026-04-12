/**
 * Lektion 15 - Example 03: Extract, Exclude, NonNullable
 *
 * Ausfuehren mit: npx tsx examples/03-extract-exclude-nonnullable.ts
 *
 * Union-Type-Manipulation: Mitglieder filtern und entfernen.
 */

// ─── EXCLUDE<T, U> — MITGLIEDER ENTFERNEN ──────────────────────────────────

type AllPrimitives = string | number | boolean | null | undefined;

// null und undefined entfernen:
type DefinedPrimitives = Exclude<AllPrimitives, null | undefined>;
// ^ string | number | boolean

// Nur strings behalten (alles andere excluden):
type OnlyStrings = Exclude<AllPrimitives, number | boolean | null | undefined>;
// ^ string

console.log("Exclude entfernt Mitglieder aus Unions");

// ─── EXCLUDE BEI HTTP-METHODEN ──────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

// Schreibende Methoden (alles ausser Lesende):
type WritingMethod = Exclude<HttpMethod, "GET" | "HEAD" | "OPTIONS">;
// ^ "POST" | "PUT" | "PATCH" | "DELETE"

// Nur Standard-CRUD:
type CrudMethod = Exclude<HttpMethod, "HEAD" | "OPTIONS" | "PATCH">;
// ^ "GET" | "POST" | "PUT" | "DELETE"

function handleWrite(method: WritingMethod, url: string): void {
  console.log(`${method} ${url} — schreibender Zugriff`);
}

handleWrite("POST", "/api/users");
handleWrite("DELETE", "/api/users/1");
// handleWrite("GET", "/api/users"); // Error! GET ist kein WritingMethod

// ─── EXTRACT<T, U> — MITGLIEDER BEHALTEN ───────────────────────────────────

type AllEvents = "click" | "dblclick" | "scroll" | "keydown" | "keyup" | "focus" | "blur";

// Nur Keyboard-Events:
type KeyEvents = Extract<AllEvents, "keydown" | "keyup">;
// ^ "keydown" | "keyup"

// Nur Maus-Events:
type MouseEvents = Extract<AllEvents, "click" | "dblclick">;
// ^ "click" | "dblclick"

function onKeyEvent(event: KeyEvents): void {
  console.log(`Key event: ${event}`);
}

onKeyEvent("keydown");
// onKeyEvent("click"); // Error!

// ─── EXTRACT MIT PATTERN-MATCHING ───────────────────────────────────────────

type MixedTypes = string | number | boolean | string[] | number[] | Date | null;

// Nur Arrays:
type ArrayTypes = Extract<MixedTypes, any[]>;
// ^ string[] | number[]

// Nur Objekte (nicht-primitive, nicht null):
type ObjectTypes = Extract<MixedTypes, object>;
// ^ string[] | number[] | Date

console.log("Extract behaelt nur zuweisbare Mitglieder");

// ─── EXTRACT BEI DISCRIMINATED UNIONS ───────────────────────────────────────

type ApiResponse =
  | { type: "user"; data: { id: number; name: string } }
  | { type: "product"; data: { id: number; price: number } }
  | { type: "error"; message: string; code: number }
  | { type: "loading" };

// Nur die User-Response:
type UserResponse = Extract<ApiResponse, { type: "user" }>;
// ^ { type: "user"; data: { id: number; name: string } }

// Nur Responses mit data:
type DataResponse = Extract<ApiResponse, { data: any }>;
// ^ { type: "user"; ... } | { type: "product"; ... }

// Responses ohne data:
type NonDataResponse = Exclude<ApiResponse, { data: any }>;
// ^ { type: "error"; ... } | { type: "loading" }

function handleUserResponse(response: UserResponse): void {
  console.log(`User: ${response.data.name}`);
}

function handleError(response: Extract<ApiResponse, { type: "error" }>): void {
  console.log(`Error ${response.code}: ${response.message}`);
}

// ─── NONNULLABLE<T> ────────────────────────────────────────────────────────

type MaybeUser = { name: string; email: string } | null | undefined;

type DefiniteUser = NonNullable<MaybeUser>;
// ^ { name: string; email: string }

// Praktisch bei optionalen Properties:
interface Config {
  apiUrl: string;
  timeout?: number;
  retries?: number;
}

type DefiniteTimeout = NonNullable<Config["timeout"]>;
// ^ number (nicht number | undefined)

// ─── NONNULLABLE IN DER PRAXIS ─────────────────────────────────────────────

function getEnvVar(name: string): string | undefined {
  const envVars: Record<string, string> = {
    NODE_ENV: "production",
    PORT: "3000",
  };
  return envVars[name];
}

function requireEnvVar(name: string): NonNullable<ReturnType<typeof getEnvVar>> {
  const value = getEnvVar(name);
  if (value === undefined) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value; // Typ: string (nicht string | undefined)
}

const port = requireEnvVar("PORT");
console.log(`Port: ${port}`); // port ist string, nicht string | undefined

// ─── ZUSAMMENSPIEL ──────────────────────────────────────────────────────────

type Input = string | number | boolean | null | undefined | string[];

// Schritt 1: null/undefined entfernen
type Step1 = NonNullable<Input>;
// ^ string | number | boolean | string[]

// Schritt 2: Nur Primitives behalten
type Step2 = Extract<Step1, string | number | boolean>;
// ^ string | number | boolean

// Schritt 3: boolean entfernen
type Step3 = Exclude<Step2, boolean>;
// ^ string | number

console.log("Union-Filterung in drei Schritten demonstriert");

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
