/**
 * Lektion 09 - Exercise 01: Literal Type Grundlagen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-literal-type-grundlagen.ts
 *
 * 6 Aufgaben zu String, Number und Boolean Literal Types.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Definiere einen Union Literal Type fuer Wochentage
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ "Weekday" der nur die fuenf Wochentage
// als String Literals erlaubt: "Monday", "Tuesday", "Wednesday",
// "Thursday", "Friday"
// type Weekday = ...

// TODO: Erstelle eine Funktion "isWorkday" die einen Weekday nimmt
// und true zurueckgibt
// function isWorkday(day: Weekday): boolean { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Number Literal Types fuer Bewertungen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ "Rating" der nur die Werte 1, 2, 3, 4, 5 erlaubt
// type Rating = ...

// TODO: Erstelle eine Funktion "getStars" die einen Rating-Wert nimmt
// und die entsprechende Anzahl Sterne als String zurueckgibt
// z.B. getStars(3) -> "★★★☆☆"
// function getStars(rating: Rating): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: as const mit Arrays
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Array von HTTP-Methoden MIT as const
// const HTTP_METHODS = ... as const;

// TODO: Leite einen Union Type "HttpMethod" daraus ab
// type HttpMethod = ...

// TODO: Erstelle eine Funktion "isValidMethod" die prueft ob ein
// String eine gueltige HTTP-Methode ist
// function isValidMethod(method: string): method is HttpMethod { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: as const mit Objekten
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Konfigurations-Objekt mit as const:
// const CONFIG = {
//   maxRetries: 3,
//   timeout: 5000,
//   environment: "production",
//   features: {
//     darkMode: true,
//     notifications: false,
//   },
// } as const;

// TODO: Leite folgende Typen ab:
// type Environment = ... (Typ des environment-Feldes)
// type MaxRetries = ... (Typ des maxRetries-Feldes)

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Type Widening verhindern
// ═══════════════════════════════════════════════════════════════════════════

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme): string {
  return `Applied theme: ${theme}`;
}

// TODO: Korrigiere die folgenden drei Variablen, sodass applyTheme
// sie akzeptiert. Verwende drei verschiedene Loesungsansaetze:

// Loesung 1: Explizite Annotation
let theme1 = "dark";
// applyTheme(theme1);  // Error! Mach das zum Laufen

// Loesung 2: as const
let theme2 = "light";
// applyTheme(theme2);  // Error! Mach das zum Laufen

// Loesung 3: Type Assertion
let theme3 = "system";
// applyTheme(theme3);  // Error! Mach das zum Laufen

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Boolean Literal Types
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle Overload-Signaturen fuer eine Funktion "fetchData":
// - Wenn cache=true, gibt sie CachedResponse zurueck
// - Wenn cache=false, gibt sie FreshResponse zurueck

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

// TODO: Implementiere die Funktion mit Overloads
// function fetchData(url: string, cache: true): CachedResponse;
// function fetchData(url: string, cache: false): FreshResponse;
// function fetchData(url: string, cache: boolean): CachedResponse | FreshResponse { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// console.log(isWorkday("Monday"));  // true
// console.log(getStars(4));           // "★★★★☆"
// console.log(isValidMethod("GET")); // true
// console.log(isValidMethod("PATCH2")); // false
// console.log(typeof CONFIG.maxRetries); // "number"
// console.log(applyTheme(theme1));
// console.log(applyTheme(theme2));
// console.log(applyTheme(theme3));

// const cached = fetchData("/api", true);
// console.log(cached.fromCache);  // true
// console.log(cached.cachedAt);   // Date

// const fresh = fetchData("/api", false);
// console.log(fresh.fromCache);   // false
// console.log(fresh.fetchedAt);   // Date

console.log("Exercise 01 geladen. Ersetze die TODOs!");
