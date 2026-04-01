/**
 * Example 02: JSON als rekursiver Typ
 *
 * Ausfuehren: npx tsx examples/02-json-typ.ts
 */

// ─── Der JSON-Typ ────────────────────────────────────────────────────────────

type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type JsonValue = JsonPrimitive | JsonArray | JsonObject;

// ─── Gueltige JSON-Werte ─────────────────────────────────────────────────────

const primitive: JsonValue = "hallo";
const num: JsonValue = 42;
const bool: JsonValue = true;
const nil: JsonValue = null;

const nested: JsonValue = {
  database: {
    host: "localhost",
    port: 5432,
    credentials: {
      user: "admin",
      password: "secret",
    },
  },
  features: ["auth", "logging", ["nested", "array"]],
  metadata: null,
};

console.log("Nested JSON:", JSON.stringify(nested, null, 2));

// ─── Ungueltige JSON-Werte (auskommentiert — wuerden Error geben) ────────────

// const bad1: JsonValue = undefined;     // Error! undefined ist kein JSON
// const bad2: JsonValue = new Date();    // Error! Date ist kein JSON
// const bad3: JsonValue = () => {};      // Error! Funktionen sind kein JSON
// const bad4: JsonValue = Symbol("x");   // Error! Symbols sind kein JSON

// ─── JSON-sichere Serialisierung ─────────────────────────────────────────────

function toJson(value: JsonValue): string {
  return JSON.stringify(value);
}

function fromJson(text: string): JsonValue {
  return JSON.parse(text) as JsonValue;
}

const serialized = toJson(nested);
const deserialized = fromJson(serialized);

console.log("\nRoundtrip erfolgreich:", typeof deserialized === "object");

// ─── JSON-Typ fuer Konfigurationen ──────────────────────────────────────────

type AppConfig = {
  name: string;
  version: string;
  database: {
    host: string;
    port: number;
    options: {
      ssl: boolean;
      pool: { min: number; max: number };
    };
  };
};

// AppConfig IST ein Subtyp von JsonObject:
const config: AppConfig = {
  name: "mein-projekt",
  version: "1.0.0",
  database: {
    host: "localhost",
    port: 5432,
    options: {
      ssl: true,
      pool: { min: 2, max: 10 },
    },
  },
};

// Das funktioniert weil AppConfig nur JSON-kompatible Werte hat:
const configAsJson: JsonValue = config;
console.log("\nConfig als JSON:", toJson(configAsJson));
