/**
 * Lektion 09 - Example 01: Literal Types
 *
 * Ausfuehren mit: npx tsx examples/01-literal-types.ts
 *
 * String, Number und Boolean Literal Types — die Grundlage fuer
 * praezise Typisierung in TypeScript.
 */

// ─── STRING LITERAL TYPES ───────────────────────────────────────────────────

// const erzeugt automatisch Literal Types bei Primitives:
const method = "GET";
// ^ Typ: "GET" — nicht string!

let method2 = "GET";
// ^ Typ: string — let koennte sich aendern

// Explizite Literal Type Annotation:
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function sendRequest(method: HttpMethod, url: string) {
  console.log(`${method} ${url}`);
}

sendRequest("GET", "/api/users");     // OK
sendRequest("POST", "/api/users");    // OK
// sendRequest("PATCH2", "/api/users"); // Error! "PATCH2" ist nicht HttpMethod

// ─── NUMBER LITERAL TYPES ───────────────────────────────────────────────────

type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

function rollDice(): DiceRoll {
  return (Math.floor(Math.random() * 6) + 1) as DiceRoll;
}

const roll = rollDice();
console.log(`Gewuerfelt: ${roll}`);

// HTTP Status Codes als Literal Types:
type SuccessCode = 200 | 201 | 204;
type ClientError = 400 | 401 | 403 | 404;
type ServerError = 500 | 502 | 503;

type StatusCode = SuccessCode | ClientError | ServerError;

function isSuccess(code: StatusCode): boolean {
  return code >= 200 && code < 300;
}

console.log(`200 ist Erfolg: ${isSuccess(200)}`);  // true
console.log(`404 ist Erfolg: ${isSuccess(404)}`);  // false

// ─── BOOLEAN LITERAL TYPES ──────────────────────────────────────────────────

// boolean ist eigentlich true | false:
type StrictBoolean = true | false;  // === boolean

// Boolean Literal Types in Overloads:
function format(value: string, uppercase: true): string;
function format(value: string, uppercase: false): string;
function format(value: string, uppercase: boolean): string {
  return uppercase ? value.toUpperCase() : value.toLowerCase();
}

const upper = format("hello", true);   // Typ: string
const lower = format("hello", false);  // Typ: string
console.log(`Upper: ${upper}, Lower: ${lower}`);

// ─── AS CONST ───────────────────────────────────────────────────────────────

// Ohne as const: Properties werden breit inferiert
const configBreit = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
};
// ^ { apiUrl: string; timeout: number; retries: number }

// Mit as const: Alles wird fixiert
const configFix = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
} as const;
// ^ { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000; readonly retries: 3 }

// as const bei Arrays:
const farben = ["rot", "gruen", "blau"] as const;
// ^ readonly ["rot", "gruen", "blau"] — ein Tuple!

// Union Type aus as const Array ableiten:
type Farbe = typeof farben[number];
// ^ "rot" | "gruen" | "blau"

console.log(`Farben: ${farben.join(", ")}`);

// ─── VERSCHACHTELTES AS CONST ───────────────────────────────────────────────

const routes = {
  home: { path: "/", title: "Home" },
  about: { path: "/about", title: "Ueber uns" },
  contact: { path: "/contact", title: "Kontakt" },
} as const;
// ^ Deep readonly — auch innere Objekte sind fixiert

type RoutePath = typeof routes[keyof typeof routes]["path"];
// ^ "/" | "/about" | "/contact"

console.log(`Verfuegbare Pfade: ${Object.values(routes).map(r => r.path).join(", ")}`);

// ─── WIDENING IN DER PRAXIS ────────────────────────────────────────────────

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  console.log(`Theme: ${theme}`);
}

// const funktioniert:
const theme1 = "dark";
applyTheme(theme1);  // OK — Typ ist "dark"

// let funktioniert NICHT ohne Annotation:
let theme2 = "dark";
// applyTheme(theme2);  // Error! string ist nicht Theme

// Drei Loesungen:
let theme3: Theme = "dark";       // Explizite Annotation
let theme4 = "dark" as const;     // as const auf dem Wert
let theme5 = "dark" as Theme;     // Type Assertion

applyTheme(theme3);  // OK
applyTheme(theme4);  // OK
applyTheme(theme5);  // OK

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
