/**
 * Lektion 09 - Example 03: String Enums
 *
 * Ausfuehren mit: npx tsx examples/03-string-enums.ts
 *
 * Kein Reverse Mapping, lesbare Debug-Ausgaben, sichere Iteration.
 */

// ─── GRUNDLAGEN ─────────────────────────────────────────────────────────────

enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warning = "WARNING",
  Error = "ERROR",
}

console.log("--- String Enum Grundlagen ---");
console.log(`LogLevel.Debug = "${LogLevel.Debug}"`);     // "DEBUG"
console.log(`LogLevel.Error = "${LogLevel.Error}"`);     // "ERROR"

// ─── KEIN REVERSE MAPPING ───────────────────────────────────────────────────

console.log("\n--- Kein Reverse Mapping ---");
console.log("Enum-Objekt:", LogLevel);
// { Debug: "DEBUG", Info: "INFO", Warning: "WARNING", Error: "ERROR" }
// Nur einseitige Eintraege — KEIN "DEBUG": "Debug"!

// Object.keys und Object.values funktionieren sauber:
console.log("Keys:", Object.keys(LogLevel));
// ["Debug", "Info", "Warning", "Error"]

console.log("Values:", Object.values(LogLevel));
// ["DEBUG", "INFO", "WARNING", "ERROR"]

// ─── VERGLEICH MIT NUMERISCHEM ENUM ─────────────────────────────────────────

enum NumericLogLevel {
  Debug,    // 0
  Info,     // 1
  Warning,  // 2
  Error,    // 3
}

console.log("\n--- Vergleich: Debug-Ausgaben ---");

interface LogEntry {
  level: LogLevel;
  numericLevel: NumericLogLevel;
  message: string;
}

const entry: LogEntry = {
  level: LogLevel.Warning,
  numericLevel: NumericLogLevel.Warning,
  message: "Etwas stimmt nicht",
};

console.log("String Enum:", JSON.stringify({ level: entry.level, message: entry.message }));
// {"level":"WARNING","message":"Etwas stimmt nicht"} — sofort lesbar!

console.log("Numeric Enum:", JSON.stringify({ level: entry.numericLevel, message: entry.message }));
// {"level":2,"message":"Etwas stimmt nicht"} — was ist 2?!

// ─── SWITCH MIT STRING ENUMS ────────────────────────────────────────────────

enum Theme {
  Light = "LIGHT",
  Dark = "DARK",
  System = "SYSTEM",
}

function describeTheme(theme: Theme): string {
  switch (theme) {
    case Theme.Light:
      return "Heller Hintergrund, dunkler Text";
    case Theme.Dark:
      return "Dunkler Hintergrund, heller Text";
    case Theme.System:
      return "Automatisch nach Systemeinstellung";
  }
}

console.log("\n--- Switch mit String Enums ---");
console.log(`Light: ${describeTheme(Theme.Light)}`);
console.log(`Dark: ${describeTheme(Theme.Dark)}`);
console.log(`System: ${describeTheme(Theme.System)}`);

// ─── ENUM ALS PARAMETER ────────────────────────────────────────────────────

enum ApiEnvironment {
  Development = "https://dev.api.example.com",
  Staging = "https://staging.api.example.com",
  Production = "https://api.example.com",
}

function getBaseUrl(env: ApiEnvironment): string {
  return env;  // Der Enum-Wert IST die URL
}

console.log("\n--- Enum als Parameter ---");
console.log(`Dev URL: ${getBaseUrl(ApiEnvironment.Development)}`);
console.log(`Prod URL: ${getBaseUrl(ApiEnvironment.Production)}`);

// ─── SICHERE ITERATION ──────────────────────────────────────────────────────

enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
  Yellow = "YELLOW",
}

console.log("\n--- Sichere Iteration ---");

// Alle Farben ausgeben:
for (const [name, value] of Object.entries(Color)) {
  console.log(`  ${name} -> ${value}`);
}
// Red -> RED
// Green -> GREEN
// Blue -> BLUE
// Yellow -> YELLOW

// Pruefen ob ein Wert im Enum ist:
function isValidColor(value: string): value is Color {
  return Object.values(Color).includes(value as Color);
}

console.log(`"RED" ist Color: ${isValidColor("RED")}`);     // true
console.log(`"PINK" ist Color: ${isValidColor("PINK")}`);   // false

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
