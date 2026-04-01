/**
 * Solution 02: JSON-Validator — Rekursiver JSON-Typ
 */

// Loesung 1: Vollstaendiger JSON-Typ
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Loesung 2: Rekursive Validierung
function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true;
  if (typeof value === "string") return true;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === "object") {
    // Pruefen ob es ein "normales" Objekt ist (kein Date, RegExp, etc.)
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      return false;
    }
    return Object.values(value as Record<string, unknown>).every(isJsonValue);
  }

  return false;
}

// Loesung 3: Typsichere Parse-Funktion
function safeJsonParse(text: string): JsonValue | Error {
  try {
    const parsed = JSON.parse(text);
    if (isJsonValue(parsed)) {
      return parsed;
    }
    return new Error("Parsed value is not valid JSON");
  } catch (e) {
    return new Error(`Invalid JSON: ${(e as Error).message}`);
  }
}

// Loesung 4: Pfade eines JSON-Objekts auflisten
function getJsonPaths(value: JsonValue, prefix?: string): string[] {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return prefix ? [prefix] : [];
  }

  const paths: string[] = [];
  for (const key of Object.keys(value)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    paths.push(fullPath);

    const childPaths = getJsonPaths(value[key], fullPath);
    // Nur die tieferen Pfade hinzufuegen (nicht den aktuellen nochmal)
    for (const childPath of childPaths) {
      if (childPath !== fullPath) {
        paths.push(childPath);
      }
    }
  }

  return paths;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log("=== JSON Validator Tests ===");

console.log("string:", isJsonValue("hello"));         // true
console.log("number:", isJsonValue(42));               // true
console.log("null:", isJsonValue(null));               // true
console.log("nested:", isJsonValue({ a: { b: 1 } })); // true
console.log("undefined:", isJsonValue(undefined));     // false
console.log("function:", isJsonValue(() => {}));       // false
console.log("Date:", isJsonValue(new Date()));         // false

const parsed = safeJsonParse('{"name": "Max", "age": 30}');
console.log("\nParsed:", parsed);

const invalid = safeJsonParse("not json");
console.log("Invalid:", invalid instanceof Error); // true

const testObj: JsonValue = {
  name: "Max",
  address: {
    street: "Hauptstr. 1",
    city: "Berlin",
    country: { code: "DE" },
  },
};
console.log("\nPaths:", getJsonPaths(testObj));
// ["name", "address", "address.street", "address.city",
//  "address.country", "address.country.code"]
