/**
 * Lektion 09 - Exercise 03: as const Pattern
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-as-const-pattern.ts
 *
 * 5 Aufgaben zum as const Object Pattern als Enum-Alternative.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfaches as const Object
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein as const Object "LogLevel" mit:
// Debug = "debug", Info = "info", Warn = "warn", Error = "error"
// const LogLevel = { ... } as const;

// TODO: Leite den Union Type ab
// type LogLevel = ...

// TODO: Erstelle eine Funktion "log" die ein LogLevel und eine
// Nachricht nimmt und sie formatiert ausgibt
// function log(level: LogLevel, message: string): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Refactoring von Enum zu as const
// ═══════════════════════════════════════════════════════════════════════════

// Dieses Enum soll zu einem as const Object refactored werden:
enum PaymentStatusEnum {
  Pending = "PENDING",
  Processing = "PROCESSING",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Refunded = "REFUNDED",
}

// TODO: Erstelle das equivalente as const Object
// const PaymentStatus = { ... } as const;
// type PaymentStatus = ...;

// TODO: Erstelle eine Funktion "isFinalStatus" die true zurueckgibt
// wenn der Status "COMPLETED", "FAILED" oder "REFUNDED" ist.
// Sie soll sowohl mit dem Objekt-Zugriff (PaymentStatus.Completed)
// als auch mit direkten Strings ("COMPLETED") funktionieren.
// function isFinalStatus(status: PaymentStatus): boolean { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Verschachteltes as const Object
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein verschachteltes as const Object fuer Routen:
// const Routes = {
//   Home: { path: "/", title: "Home" },
//   About: { path: "/about", title: "Ueber uns" },
//   Contact: { path: "/contact", title: "Kontakt" },
//   Blog: { path: "/blog", title: "Blog" },
// } as const;

// TODO: Leite folgende Typen ab:
// type RouteKey = ... (die Keys: "Home" | "About" | "Contact" | "Blog")
// type RoutePath = ... (die Pfade: "/" | "/about" | "/contact" | "/blog")
// type RouteTitle = ... (die Titel: "Home" | "Ueber uns" | "Kontakt" | "Blog")

// TODO: Erstelle eine Funktion "getRouteByPath" die einen Pfad nimmt
// und den passenden Titel zurueckgibt (oder undefined)
// function getRouteByPath(path: RoutePath): string | undefined { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: as const mit Arrays — Type Guard
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein as const Array mit erlaubten Dateiendungen
// const ALLOWED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"] as const;
// type AllowedExtension = ...

// TODO: Erstelle einen Type Guard "isAllowedExtension"
// function isAllowedExtension(ext: string): ext is AllowedExtension { ... }

// TODO: Erstelle eine Funktion "filterFiles" die ein Array von
// Dateinamen nimmt und nur Dateien mit erlaubten Endungen zurueckgibt
// function filterFiles(files: string[]): string[] { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: as const Object mit Hilfsfunktionen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein as const Object fuer Laendercodes mit zusaetzlicher Info:
// const Country = {
//   DE: { name: "Deutschland", code: "DE", currency: "EUR" },
//   AT: { name: "Oesterreich", code: "AT", currency: "EUR" },
//   CH: { name: "Schweiz", code: "CH", currency: "CHF" },
//   US: { name: "USA", code: "US", currency: "USD" },
// } as const;

// TODO: Leite ab:
// type CountryCode = ... (die Keys: "DE" | "AT" | "CH" | "US")
// type Currency = ... (die Waehrungen: "EUR" | "CHF" | "USD")

// TODO: Erstelle Hilfsfunktionen:
// function getCountryName(code: CountryCode): string { ... }
// function getCurrency(code: CountryCode): Currency { ... }
// function getCountriesByCurrency(currency: Currency): CountryCode[] { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// console.log(log(LogLevel.Info, "Server gestartet"));
// console.log(log("error", "Datenbankfehler"));  // Auch direkt mit String!

// console.log(isFinalStatus(PaymentStatus.Completed)); // true
// console.log(isFinalStatus("PENDING"));               // false

// console.log(getRouteByPath("/about"));    // "Ueber uns"
// console.log(getRouteByPath("/"));         // "Home"

// console.log(filterFiles(["app.ts", "style.css", "data.json", "image.png"]));
// // ["app.ts", "data.json"]

// console.log(getCountryName("DE"));  // "Deutschland"
// console.log(getCurrency("CH"));     // "CHF"
// console.log(getCountriesByCurrency("EUR")); // ["DE", "AT"]

console.log("Exercise 03 geladen. Ersetze die TODOs!");
