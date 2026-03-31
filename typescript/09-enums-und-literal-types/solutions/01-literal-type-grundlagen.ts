/**
 * Lektion 09 - Solution 01: Literal Type Grundlagen
 *
 * Ausfuehren mit: npx tsx solutions/01-literal-type-grundlagen.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Union Literal Type fuer Wochentage
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Union von String Literal Types
// Jeder Wert ist ein eigener Typ — nur diese fuenf sind erlaubt.
type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

function isWorkday(day: Weekday): boolean {
  // Da Weekday nur Werktage enthaelt, ist es immer true.
  // In der Praxis wuerde man eher "Day" mit Weekend verwenden.
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Number Literal Types fuer Bewertungen
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Number Literal Union
type Rating = 1 | 2 | 3 | 4 | 5;

function getStars(rating: Rating): string {
  // repeat() erzeugt die richtige Anzahl voller/leerer Sterne
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: as const mit Arrays
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: as const macht das Array readonly und behaelt Literal Types
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

// typeof HTTP_METHODS[number] greift auf alle Elemente zu und bildet Union
type HttpMethod = typeof HTTP_METHODS[number];
// ^ "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

function isValidMethod(method: string): method is HttpMethod {
  // as readonly string[] ist noetig, weil .includes() sonst
  // nur Literal Types als Parameter akzeptiert
  return (HTTP_METHODS as readonly string[]).includes(method);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: as const mit Objekten
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Deep readonly mit Literal Types
const CONFIG = {
  maxRetries: 3,
  timeout: 5000,
  environment: "production",
  features: {
    darkMode: true,
    notifications: false,
  },
} as const;

// Abgeleitete Typen mit typeof und Index Access
type Environment = typeof CONFIG["environment"];
// ^ "production" (Literal Type, nicht string!)

type MaxRetries = typeof CONFIG["maxRetries"];
// ^ 3 (Literal Type, nicht number!)

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Type Widening verhindern
// ═══════════════════════════════════════════════════════════════════════════

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme): string {
  return `Applied theme: ${theme}`;
}

// Loesung 1: Explizite Annotation — der direkteste Weg
let theme1: Theme = "dark";

// Loesung 2: as const auf dem Wert — erzeugt Literal Type "light"
let theme2 = "light" as const;

// Loesung 3: Type Assertion — sagt "vertrau mir, das ist Theme"
let theme3 = "system" as Theme;

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Boolean Literal Types
// ═══════════════════════════════════════════════════════════════════════════

interface CachedResponse {
  data: string;
  fromCache: true;
  cachedAt: Date;
}

interface FreshResponse {
  data: string;
  fromCache: false;
  fetchedAt: Date;
}

// Loesung: Overloads mit Boolean Literal Types
function fetchData(url: string, cache: true): CachedResponse;
function fetchData(url: string, cache: false): FreshResponse;
function fetchData(url: string, cache: boolean): CachedResponse | FreshResponse {
  if (cache) {
    return {
      data: `Cached data from ${url}`,
      fromCache: true,
      cachedAt: new Date(),
    };
  }
  return {
    data: `Fresh data from ${url}`,
    fromCache: false,
    fetchedAt: new Date(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");
console.log(isWorkday("Monday"));     // true
console.log(getStars(4));              // "★★★★☆"
console.log(getStars(1));              // "★☆☆☆☆"
console.log(isValidMethod("GET"));    // true
console.log(isValidMethod("PATCH2")); // false
console.log(`maxRetries Typ: ${typeof CONFIG.maxRetries}`);

console.log(applyTheme(theme1));  // "Applied theme: dark"
console.log(applyTheme(theme2));  // "Applied theme: light"
console.log(applyTheme(theme3));  // "Applied theme: system"

const cached = fetchData("/api", true);
console.log(`fromCache: ${cached.fromCache}, cachedAt: ${cached.cachedAt}`);

const fresh = fetchData("/api", false);
console.log(`fromCache: ${fresh.fromCache}, fetchedAt: ${fresh.fetchedAt}`);

console.log("\n--- Alle Tests bestanden! ---");
