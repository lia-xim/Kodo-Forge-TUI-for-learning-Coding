/**
 * Lektion 04 -- Fehlkonzeptionen: Arrays & Tuples
 *
 * Code-Snippets die "offensichtlich richtig" aussehen, aber subtil falsch sind.
 * Jede Misconception deckt einen haeufigen Denkfehler auf.
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number; // 1 = leicht zu erkennen, 5 = sehr subtil
}

export const misconceptions: Misconception[] = [
  // ─── 1: readonly verhindert push() zur Laufzeit ────────────────────────────
  {
    id: "04-mc-01",
    title: "readonly verhindert Mutation zur Laufzeit",
    code: `const names: readonly string[] = ["Alice", "Bob"];

// Irgendwo spaeter im Code...
(names as string[]).push("Charlie");

console.log(names); // Was wird ausgegeben?`,
    commonBelief:
      "readonly schuetzt das Array auch zur Laufzeit. Der push()-Aufruf " +
      "sollte einen Fehler werfen oder still ignoriert werden.",
    reality:
      "Type Erasure! 'readonly' existiert nur im Typ-System und wird bei " +
      "der Kompilierung komplett entfernt. Zur Laufzeit ist es ein normales " +
      "JavaScript-Array. Der Type-Assert 'as string[]' umgeht den Compile-Check, " +
      "und push() funktioniert einwandfrei. Ausgabe: ['Alice', 'Bob', 'Charlie']. " +
      "readonly ist ein Compile-Zeit-Vertrag, keine Laufzeit-Garantie.",
    concept: "Type Erasure / readonly ist compile-time only",
    difficulty: 2,
  },

  // ─── 2: const inferiert ein Tuple ──────────────────────────────────────────
  {
    id: "04-mc-02",
    title: "const erzeugt automatisch ein Tuple",
    code: `const point = [10, 20];

// Erwartung: point ist [number, number]
// Also sollte das ein Fehler sein:
point.push(30);`,
    commonBelief:
      "'const' macht die Variable unveraenderlich, also sollte TypeScript " +
      "ein Tuple [number, number] inferieren und push() verbieten.",
    reality:
      "TypeScript inferiert number[], NICHT [number, number]. Der Grund: " +
      "'const' schuetzt nur die Variable-Bindung (du kannst 'point' nicht " +
      "neu zuweisen), aber der INHALT des Arrays bleibt mutable. Da push() " +
      "moeglich ist, waere ein Tuple-Typ falsch — er wuerde gaengige " +
      "Operationen blockieren. Fuer ein Tuple brauchst du eine explizite " +
      "Annotation oder 'as const'.",
    concept: "const schuetzt nur die Bindung, nicht den Inhalt",
    difficulty: 2,
  },

  // ─── 3: filter mit komplexen Bedingungen verengt NICHT ─────────────────────
  {
    id: "04-mc-03",
    title: "filter() mit komplexen Bedingungen verengt nicht automatisch",
    code: `const items: (string | null)[] = ["a", null, "", null, "hello"];
const cleaned = items.filter(x => x !== null && x.length > 0);

// Erwartung: cleaned ist string[]
// Aber was sagt TypeScript?
const first: string = cleaned[0]; // Fehler?`,
    commonBelief:
      "TypeScript erkennt die kombinierte Bedingung '!== null && .length > 0' " +
      "im filter-Callback und schlussfolgert, dass das Ergebnis string[] ist.",
    reality:
      "Ab TypeScript 5.5 erkennt filter() einfache Type Guards automatisch " +
      "(z.B. `x => x !== null`). ABER bei komplexeren Bedingungen wie " +
      "`x => x !== null && x.length > 0` greift die automatische Inferenz " +
      "NICHT — das Ergebnis bleibt (string | null)[]. Die Loesung: " +
      "items.filter((x): x is string => x !== null && x.length > 0) — das " +
      "explizite Type Predicate 'x is string' sagt TypeScript, dass die " +
      "Funktion als Type Guard fungiert.",
    concept: "Type Predicates / Inferred Type Predicates Grenzen",
    difficulty: 3,
  },

  // ─── 4: Spread bewahrt den Tuple-Typ ──────────────────────────────────────
  {
    id: "04-mc-04",
    title: "Spread bewahrt den Tuple-Typ",
    code: `const original: [string, number] = ["hello", 42];
const copy = [...original];

// Erwartung: copy ist [string, number]
function greet(name: string, age: number) {}
greet(...copy); // Funktioniert das?`,
    commonBelief:
      "Der Spread-Operator kopiert das Tuple, also sollte 'copy' " +
      "ebenfalls den Typ [string, number] haben und als Spread-Argument " +
      "funktionieren.",
    reality:
      "Spread auf ein Tuple VERLIERT den Tuple-Typ! TypeScript inferiert " +
      "(string | number)[] fuer 'copy'. Das bedeutet: greet(...copy) schlaegt " +
      "fehl, weil TypeScript nicht mehr weiss, dass Position 0 ein string " +
      "und Position 1 eine number ist. Loesung: " +
      "const copy = [...original] as [string, number]; oder besser noch: " +
      "arbeite direkt mit dem Original.",
    concept: "Spread-Operator verliert Tuple-Information",
    difficulty: 3,
  },

  // ─── 5: Kovarianz ist sicher ───────────────────────────────────────────────
  {
    id: "04-mc-05",
    title: "Zuweisung von engem Array zu weitem Array ist sicher",
    code: `const admins: ("admin" | "mod")[] = ["admin", "mod"];
const users: string[] = admins; // Kompiliert!

users.push("hacker"); // Kein Compile-Fehler!

// Was steht jetzt in admins?
console.log(admins); // ["admin", "mod", "hacker"]
// Aber admins hat den Typ ("admin" | "mod")[]...`,
    commonBelief:
      "Wenn TypeScript die Zuweisung erlaubt, ist sie sicher. " +
      "admins kann nur 'admin' oder 'mod' enthalten.",
    reality:
      "Das ist ein Kovarianz-Problem und eine bekannte Unsoundness in " +
      "TypeScript! Nach der Zuweisung zeigen 'admins' und 'users' auf " +
      "DASSELBE Array. Ueber 'users' kann man beliebige Strings pushen, " +
      "die dann auch in 'admins' landen — obwohl der Typ das verbietet. " +
      "TypeScript erlaubt das aus Pragmatismus (zu viel Code wuerde brechen). " +
      "Loesung: readonly Arrays verhindern Mutation ueber beide Referenzen.",
    concept: "Array-Kovarianz ist unsound bei mutablen Arrays",
    difficulty: 4,
  },

  // ─── 6: as const macht deep-immutable ──────────────────────────────────────
  {
    id: "04-mc-06",
    title: "'as const' macht Arrays zur Laufzeit unveraenderlich",
    code: `const config = {
  ports: [3000, 3001, 3002],
  host: "localhost",
} as const;

// TypeScript sagt: readonly [3000, 3001, 3002]
// Also ist das Array eingefroren, richtig?

// Zur Laufzeit:
(config.ports as number[]).push(9999); // Was passiert?`,
    commonBelief:
      "'as const' friert das Objekt und alle verschachtelten Arrays ein, " +
      "aehnlich wie Object.freeze() mit deep-freeze Semantik.",
    reality:
      "'as const' ist REIN ein Typ-System-Feature. Es erzeugt readonly-Typen " +
      "und Literal-Typen zur Compile-Zeit, hat aber KEINEN Effekt zur Laufzeit. " +
      "Der Type-Assert 'as number[]' umgeht den Compile-Check, und push() " +
      "funktioniert. Fuer echte Laufzeit-Immutabilitaet brauchst du " +
      "Object.freeze() (shallow) oder eine Library wie Immer.",
    concept: "as const ist compile-time only, nicht runtime",
    difficulty: 3,
  },

  // ─── 7: Array-Index-Zugriff ist immer sicher ──────────────────────────────
  {
    id: "04-mc-07",
    title: "Array-Index-Zugriff gibt immer den Element-Typ zurueck",
    code: `const names: string[] = ["Alice", "Bob"];
const third = names[2]; // Typ: string

// TypeScript sagt: third ist string
// Aber was ist der tatsaechliche Wert?
console.log(third.toUpperCase()); // Runtime: ???`,
    commonBelief:
      "TypeScript garantiert, dass names[2] ein string ist. " +
      "Wenn der Typ 'string' sagt, kann ich .toUpperCase() sicher aufrufen.",
    reality:
      "Ohne 'noUncheckedIndexedAccess: true' gibt TypeScript bei " +
      "Array-Index-Zugriff IMMER den Element-Typ zurueck (hier: string), " +
      "auch wenn der Index ausserhalb der Grenzen liegt. names[2] ist " +
      "tatsaechlich undefined, und .toUpperCase() wirft einen Runtime-Fehler. " +
      "Mit noUncheckedIndexedAccess waere der Typ 'string | undefined', " +
      "und TypeScript wuerde dich zu einem Check zwingen.",
    concept: "noUncheckedIndexedAccess / Out-of-bounds Zugriff",
    difficulty: 2,
  },

  // ─── 8: Tuple-Destructuring bewahrt Literal-Typen ─────────────────────────
  {
    id: "04-mc-08",
    title: "Destructuring bewahrt die Typen aus 'as const'",
    code: `const CONFIG = ["localhost", 3000] as const;
// Typ: readonly ["localhost", 3000]

const [host, port] = CONFIG;
// Erwartung: host ist "localhost", port ist 3000

let mutableHost = host;
// Was ist der Typ von mutableHost?`,
    commonBelief:
      "Destructuring uebertraegt die Literal-Typen. 'mutableHost' sollte " +
      'den Typ "localhost" haben, da CONFIG "as const" ist.',
    reality:
      "Das Destructuring bewahrt die Literal-Typen tatsaechlich: " +
      "'host' hat den Typ \"localhost\" und 'port' hat den Typ 3000. " +
      "ABER: 'let mutableHost = host' bewirkt Widening! Da mutableHost " +
      "mit 'let' deklariert wird, weitet TypeScript den Typ zu 'string'. " +
      "Nur bei 'const' bleiben Literal-Typen erhalten. " +
      "Das ist nicht 'as const'-spezifisch, sondern allgemeines Widening-Verhalten.",
    concept: "let-Widening bei Literal-Typen",
    difficulty: 4,
  },
];
