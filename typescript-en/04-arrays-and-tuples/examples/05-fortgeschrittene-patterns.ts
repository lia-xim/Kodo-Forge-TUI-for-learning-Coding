/**
 * Lektion 04 — Beispiel 05: Fortgeschrittene Patterns
 *
 * Themen:
 *  - Kovarianz bei Arrays — das Unsoundness-Problem
 *  - noUncheckedIndexedAccess Verhalten
 *  - Variadic Tuple Types
 *  - as const + satisfies
 *  - Type Predicates mit filter()
 *  - Promise.all Tuple-Typisierung
 *
 * Fuehre aus mit: npx tsx examples/05-fortgeschrittene-patterns.ts
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Kovarianz bei Arrays — warum string[] zu (string | number)[] passt
// ═══════════════════════════════════════════════════════════════════════════════

console.log("=== Kovarianz bei Arrays ===");

// string ist ein Subtyp von string | number.
// Kovarianz bedeutet: string[] ist ein Subtyp von (string | number)[].
const strings: string[] = ["hello", "world"];
const union: (string | number)[] = strings; // OK! Kovarianz.

// Das Problem: Beide zeigen auf dasselbe Array im Speicher!
union.push(42);

console.log("strings:", strings);
// strings enthaelt jetzt ["hello", "world", 42]
// Aber TypeScript denkt immer noch, strings ist string[]!
// strings[2] hat den Typ string, ist aber zur Laufzeit 42.

console.log("strings[2]:", strings[2], "— Typ sagt string, ist aber number!");

// LOESUNG: readonly verhindert das Problem
function sichereVerarbeitung(namen: readonly string[]): void {
  // const wider: (string | number)[] = namen; // Fehler!
  // readonly string[] ist NICHT zuweisbar an (string | number)[]
  // weil man ueber die mutable Referenz mutieren koennte.
  console.log("Sicher verarbeitet:", namen.join(", "));
}

sichereVerarbeitung(["Alice", "Bob"]);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Out-of-bounds-Zugriff — das stille Problem
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Out-of-bounds-Zugriff ===");

const namen: string[] = ["Alice", "Bob"];

// OHNE noUncheckedIndexedAccess:
// const dritter = namen[99]; // Typ: string — aber Laufzeit: undefined!

// MIT noUncheckedIndexedAccess:
// const dritter = namen[99]; // Typ: string | undefined — korrekt!

// Demonstration des Problems:
const unsicherElement = namen[99]; // Standardmaessig: string
console.log("namen[99]:", unsicherElement); // undefined
// unsicherElement.toUpperCase(); // Wuerde crashen!

// Sichere Alternative: Pruefung vor Zugriff
const element = namen[0];
if (element !== undefined) {
  console.log("Sicherer Zugriff:", element.toUpperCase());
}

// Tuple-Zugriff ist IMMER sicher (Laenge bekannt):
{
  const tuple: [string, number] = ["hello", 42];
  const first = tuple[0]; // string — kein | undefined noetig!
  console.log("Tuple-Zugriff ist sicher:", first);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Type Predicates mit filter() — Typen korrekt verengen
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Type Predicates mit filter() ===");

const gemischt: (string | number | null)[] = ["hello", 42, null, "world", 7, null];

// PROBLEM: filter() verengt den Typ NICHT automatisch
const ohneNull = gemischt.filter(x => x !== null);
// Typ: (string | number | null)[] — null ist immer noch drin!
console.log("Ohne Type Predicate — Typ bleibt (string | number | null)[]");

// LOESUNG: Type Predicate verwenden
const ohneNull2 = gemischt.filter(
  (x): x is string | number => x !== null
);
// Typ: (string | number)[] — korrekt!
console.log("Mit Type Predicate:", ohneNull2);

// Noch praeziser: Nur Strings extrahieren
const nurStrings = gemischt.filter(
  (x): x is string => typeof x === "string"
);
// Typ: string[]
console.log("Nur Strings:", nurStrings);

// Noch praeziser: Nur Numbers extrahieren
const nurNumbers = gemischt.filter(
  (x): x is number => typeof x === "number"
);
// Typ: number[]
console.log("Nur Numbers:", nurNumbers);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Variadic Tuple Types — generische Tuple-Manipulation
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Variadic Tuple Types ===");

// Prepend: Element vorne anfuegen
type Prepend<Elem, T extends readonly unknown[]> = [Elem, ...T];

type WithId = Prepend<number, [string, boolean]>;
// Ergebnis: [number, string, boolean]

const withId: WithId = [1, "Alice", true];
console.log("Prepend:", withId);

// Append: Element hinten anfuegen
type Append<T extends readonly unknown[], Elem> = [...T, Elem];

type WithTimestamp = Append<[string, number], Date>;
// Ergebnis: [string, number, Date]

// Concat: Zwei Tuples zusammenfuegen
type Concat<A extends readonly unknown[], B extends readonly unknown[]> = [...A, ...B];

type Full = Concat<[string, number], [boolean, Date]>;
// Ergebnis: [string, number, boolean, Date]

// Head: Erstes Element extrahieren
type Head<T extends readonly [unknown, ...unknown[]]> =
  T extends [infer First, ...unknown[]] ? First : never;

type H = Head<[string, number, boolean]>;
// Ergebnis: string

// Tail: Alles ausser dem ersten Element
type Tail<T extends readonly unknown[]> =
  T extends [unknown, ...infer Rest] ? Rest : [];

type T2 = Tail<[string, number, boolean]>;
// Ergebnis: [number, boolean]

// Praktische Anwendung: Typesichere concat-Funktion
function concatTuples<A extends readonly unknown[], B extends readonly unknown[]>(
  a: [...A],
  b: [...B]
): [...A, ...B] {
  return [...a, ...b] as [...A, ...B];
}

const result = concatTuples(
  ["hello", 42] as [string, number],
  [true] as [boolean]
);
// Typ: [string, number, boolean]
console.log("Concat:", result);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. as const + satisfies — das Beste aus beiden Welten
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== as const + satisfies ===");

// Nur as const: Keine Typenpruefung gegen ein Interface
const routes = {
  home: "/",
  about: "/about",
  user: "/user/:id",
} as const;
// Typ: { readonly home: "/"; readonly about: "/about"; readonly user: "/user/:id" }
// KEIN Fehler wenn du z.B. 'hmoe' schreibst — es gibt keinen Zieltyp!

// as const + satisfies: Typgeprueft UND Literal-Typen beibehalten
interface RouteConfig {
  [key: string]: string;
}

const checkedRoutes = {
  home: "/",
  about: "/about",
  user: "/user/:id",
} as const satisfies RouteConfig;

// checkedRoutes.home ist Typ "/" (Literal!) — nicht string
type HomeRoute = typeof checkedRoutes.home; // "/"
console.log("Home Route:", checkedRoutes.home, "— Typ: \"/\"");

// Anwendung mit Arrays:
const statusCodes = [200, 301, 404, 500] as const satisfies readonly number[];
type StatusCode = (typeof statusCodes)[number]; // 200 | 301 | 404 | 500
console.log("Status Codes:", statusCodes);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Promise.all — warum Tuple-Typen hier entscheidend sind
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Promise.all Tuple-Typisierung ===");

// Simulierte async Funktionen
async function fetchUser(): Promise<{ name: string; id: number }> {
  return { name: "Alice", id: 1 };
}

async function fetchPosts(): Promise<string[]> {
  return ["Post 1", "Post 2"];
}

async function fetchSettings(): Promise<{ theme: string }> {
  return { theme: "dark" };
}

// Promise.all behaelt die Tuple-Struktur:
async function loadDashboard() {
  const [user, posts, settings] = await Promise.all([
    fetchUser(),      // Promise<{ name: string; id: number }>
    fetchPosts(),     // Promise<string[]>
    fetchSettings(),  // Promise<{ theme: string }>
  ]);

  // TypeScript kennt die EXAKTEN Typen:
  console.log("User:", user.name);        // user: { name: string; id: number }
  console.log("Posts:", posts.length);     // posts: string[]
  console.log("Theme:", settings.theme);   // settings: { theme: string }
}

loadDashboard();

// WARUM funktioniert das? Weil Promise.all intern Variadic Tuple Types nutzt:
// function all<T extends readonly unknown[]>(values: [...T]):
//   Promise<{ [K in keyof T]: Awaited<T[K]> }>

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Array<T> als generischer Typ — Verbindung zu Generics verstehen
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Array<T> und Generics ===");

// Array<T> ist ein generischer Typ. Du benutzt Generics bereits wenn du
// string[] schreibst — das ist nur syntaktischer Zucker fuer Array<string>.

// Eigene generische Funktionen die mit Arrays arbeiten:
function first<T>(arr: readonly T[]): T | undefined {
  return arr[0];
}

function last<T>(arr: readonly T[]): T | undefined {
  return arr[arr.length - 1];
}

function unique<T>(arr: readonly T[]): T[] {
  return [...new Set(arr)];
}

console.log("First:", first(["a", "b", "c"])); // "a", Typ: string | undefined
console.log("Last:", last([1, 2, 3]));          // 3, Typ: number | undefined
console.log("Unique:", unique([1, 2, 2, 3, 3])); // [1, 2, 3], Typ: number[]

// Generische Funktion die ein Array in Chunks teilt:
function chunk<T>(arr: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size) as T[]);
  }
  return result;
}

console.log("Chunk:", chunk([1, 2, 3, 4, 5], 2)); // [[1,2], [3,4], [5]]

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Tuple Helper Funktion — Tuples ohne Annotation erstellen
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Tuple Helper ===");

// Problem: TypeScript inferiert Arrays, keine Tuples
const notATuple = [1, "hello"]; // (string | number)[]

// Loesung: Helper-Funktion die Tuple-Inferenz erzwingt
function tuple<T extends readonly unknown[]>(...args: T): T {
  return args;
}

const isTuple = tuple(1, "hello"); // readonly [number, string]
console.log("Tuple:", isTuple);

// Das ist nützlich in Situationen wo as const zu restriktiv ist
// (as const macht Literal-Typen, tuple() behaelt die breiten Typen):
const withConst = [1, "hello"] as const;  // readonly [1, "hello"]
const withTuple = tuple(1, "hello");       // readonly [number, string]

console.log("\n✓ Alle Beispiele erfolgreich durchgelaufen!");
