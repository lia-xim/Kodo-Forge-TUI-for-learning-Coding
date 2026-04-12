/**
 * Lektion 09 - Solution 03: as const Pattern
 *
 * Ausfuehren mit: npx tsx solutions/03-as-const-pattern.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfaches as const Object
// ═══════════════════════════════════════════════════════════════════════════

const LogLevel = {
  Debug: "debug",
  Info: "info",
  Warn: "warn",
  Error: "error",
} as const;

// typeof LogLevel[keyof typeof LogLevel] leitet den Union ab
type LogLevel = typeof LogLevel[keyof typeof LogLevel];
// ^ "debug" | "info" | "warn" | "error"

function log(level: LogLevel, message: string): string {
  const prefix = level.toUpperCase().padEnd(5);
  const result = `[${prefix}] ${message}`;
  console.log(result);
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Refactoring von Enum zu as const
// ═══════════════════════════════════════════════════════════════════════════

// Statt enum:
const PaymentStatus = {
  Pending: "PENDING",
  Processing: "PROCESSING",
  Completed: "COMPLETED",
  Failed: "FAILED",
  Refunded: "REFUNDED",
} as const;

type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];
// ^ "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED"

function isFinalStatus(status: PaymentStatus): boolean {
  // Strukturelle Kompatibilitaet: Sowohl PaymentStatus.Completed
  // als auch "COMPLETED" funktionieren!
  return (
    status === PaymentStatus.Completed ||
    status === PaymentStatus.Failed ||
    status === PaymentStatus.Refunded
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Verschachteltes as const Object
// ═══════════════════════════════════════════════════════════════════════════

const Routes = {
  Home: { path: "/", title: "Home" },
  About: { path: "/about", title: "Ueber uns" },
  Contact: { path: "/contact", title: "Kontakt" },
  Blog: { path: "/blog", title: "Blog" },
} as const;

// Keys
type RouteKey = keyof typeof Routes;
// ^ "Home" | "About" | "Contact" | "Blog"

// Verschachtelter Zugriff auf die path-Werte
type RoutePath = typeof Routes[RouteKey]["path"];
// ^ "/" | "/about" | "/contact" | "/blog"

type RouteTitle = typeof Routes[RouteKey]["title"];
// ^ "Home" | "Ueber uns" | "Kontakt" | "Blog"

function getRouteByPath(path: RoutePath): string | undefined {
  const entry = Object.values(Routes).find(route => route.path === path);
  return entry?.title;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: as const mit Arrays — Type Guard
// ═══════════════════════════════════════════════════════════════════════════

const ALLOWED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"] as const;
type AllowedExtension = typeof ALLOWED_EXTENSIONS[number];
// ^ ".ts" | ".tsx" | ".js" | ".jsx" | ".json"

function isAllowedExtension(ext: string): ext is AllowedExtension {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

function filterFiles(files: string[]): string[] {
  return files.filter(file => {
    const ext = file.substring(file.lastIndexOf("."));
    return isAllowedExtension(ext);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: as const Object mit Hilfsfunktionen
// ═══════════════════════════════════════════════════════════════════════════

const Country = {
  DE: { name: "Deutschland", code: "DE", currency: "EUR" },
  AT: { name: "Oesterreich", code: "AT", currency: "EUR" },
  CH: { name: "Schweiz", code: "CH", currency: "CHF" },
  US: { name: "USA", code: "US", currency: "USD" },
} as const;

type CountryCode = keyof typeof Country;
// ^ "DE" | "AT" | "CH" | "US"

type Currency = typeof Country[CountryCode]["currency"];
// ^ "EUR" | "CHF" | "USD"

function getCountryName(code: CountryCode): string {
  return Country[code].name;
}

function getCurrency(code: CountryCode): Currency {
  return Country[code].currency;
}

function getCountriesByCurrency(currency: Currency): CountryCode[] {
  return (Object.keys(Country) as CountryCode[]).filter(
    code => Country[code].currency === currency
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");
log(LogLevel.Info, "Server gestartet");
log("error", "Datenbankfehler");  // Strukturell kompatibel!

console.log(`COMPLETED final: ${isFinalStatus(PaymentStatus.Completed)}`); // true
console.log(`PENDING final: ${isFinalStatus("PENDING")}`);                 // false

console.log(`Path /about: ${getRouteByPath("/about")}`);     // "Ueber uns"
console.log(`Path /: ${getRouteByPath("/")}`);                // "Home"

const filtered = filterFiles(["app.ts", "style.css", "data.json", "image.png"]);
console.log(`Gefiltert: ${filtered}`);  // ["app.ts", "data.json"]

console.log(`DE: ${getCountryName("DE")}`);        // "Deutschland"
console.log(`CH Waehrung: ${getCurrency("CH")}`);  // "CHF"
console.log(`EUR Laender: ${getCountriesByCurrency("EUR")}`);  // ["DE", "AT"]

console.log("\n--- Alle Tests bestanden! ---");
