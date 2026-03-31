/**
 * Lektion 01 — Fehlkonzeption-Exercises: Setup & Erste Schritte
 *
 * Code der "offensichtlich richtig" aussieht aber subtil falsch ist.
 * Der Lernende muss den Bug finden.
 */

export interface Misconception {
  id: string;
  title: string;
  /** Der "offensichtlich korrekte" Code */
  code: string;
  /** Was die meisten Leute denken */
  commonBelief: string;
  /** Was tatsaechlich passiert */
  reality: string;
  /** Welches Konzept getestet wird */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: as string konvertiert ────────────────────────────────────────────
  {
    id: "01-as-converts",
    title: "Type Assertion als Konvertierung",
    code: `function getAge(input: unknown): string {
  // "Konvertiere" den Wert zu einem String:
  const result = input as string;
  return result.toUpperCase();
}

// Aufruf:
getAge(42);`,
    commonBelief:
      "`as string` konvertiert den Wert zu einem String, also ist " +
      "`result` nach dem Cast garantiert ein String.",
    reality:
      "`as string` ist eine Type Assertion, die NUR zur Compile-Zeit existiert. " +
      "Sie wird bei Type Erasure komplett entfernt und aendert den Wert NICHT. " +
      "Zur Laufzeit ist `result` immer noch `42` (eine number), und " +
      "`.toUpperCase()` crasht mit einem TypeError.",
    concept: "Type Erasure / Type Assertions vs. Konvertierung",
    difficulty: 2,
  },

  // ─── 2: instanceof mit Interface ─────────────────────────────────────────
  {
    id: "01-instanceof-interface",
    title: "Interface mit instanceof pruefen",
    code: `interface User {
  name: string;
  email: string;
}

function isUser(obj: unknown): boolean {
  return obj instanceof User;
}

const data = { name: "Max", email: "max@example.com" };
console.log(isUser(data));`,
    commonBelief:
      "Man kann mit `instanceof` pruefen ob ein Objekt ein bestimmtes " +
      "Interface implementiert, genau wie in Java oder C#.",
    reality:
      "Dieser Code kompiliert nicht einmal! TypeScript meldet: " +
      "'User' only refers to a type, but is being used as a value here. " +
      "Interfaces existieren zur Laufzeit nicht (Type Erasure). " +
      "`instanceof` funktioniert nur mit Klassen, weil diese auch " +
      "zur Laufzeit als JavaScript-Konstruktorfunktionen existieren.",
    concept: "Type Erasure / Interfaces vs. Klassen",
    difficulty: 2,
  },

  // ─── 3: Typ-Fehler verhindert Ausfuehrung ──────────────────────────────
  {
    id: "01-errors-prevent-execution",
    title: "Typ-Fehler stoppt die Kompilierung",
    code: `// team-lead sagt: "Solange TypeScript Fehler zeigt,
// kann der Code nicht ausfuehren."

function add(a: number, b: number): number {
  return a + b;
}

// Fehlerhafter Aufruf:
add("hello", "world");

// "Der Code wird nie laufen, weil tsc den Fehler meldet."`,
    commonBelief:
      "Wenn TypeScript einen Typ-Fehler meldet, wird kein JavaScript " +
      "erzeugt und der Code kann nicht ausgefuehrt werden.",
    reality:
      "Standardmaessig erzeugt `tsc` JavaScript AUCH bei Typ-Fehlern! " +
      "Type Checking und Emit sind konzeptionell unabhaengig. " +
      "Der erzeugte Code waere `add('hello', 'world')`, was zur Laufzeit " +
      "'helloworld' zurueckgibt (String-Verkettung). " +
      "Nur mit `noEmitOnError: true` in der tsconfig wird die Ausgabe " +
      "bei Fehlern unterdrueckt.",
    concept: "Compiler-Pipeline / Type Checking vs. Emit",
    difficulty: 3,
  },

  // ─── 4: tsc kompiliert alles ────────────────────────────────────────────
  {
    id: "01-tsc-compiles-everything",
    title: "tsc uebernimmt die gesamte Kompilierung",
    code: `// In deinem Next.js-Projekt:
// "Unser Build nutzt tsc fuer die Kompilierung."

// package.json:
// "build": "tsc && next build"

// tsconfig.json:
// { "compilerOptions": { "target": "ES5" } }`,
    commonBelief:
      "In einem Next.js-Projekt uebernimmt `tsc` die gesamte " +
      "Kompilierung des TypeScript-Codes zu JavaScript.",
    reality:
      "Next.js nutzt SWC (einen Rust-basierten Compiler) fuer die " +
      "eigentliche Kompilierung. SWC entfernt nur die TypeScript-Syntax — " +
      "es fuehrt KEIN Type Checking durch. `tsc` laeuft separat " +
      "(oft mit `--noEmit`) NUR fuer die Typenpruefung. " +
      "Das gleiche Prinzip gilt fuer esbuild, tsx und Vite.",
    concept: "Werkzeuge / Build-Pipeline",
    difficulty: 3,
  },

  // ─── 5: target bestimmt APIs ────────────────────────────────────────────
  {
    id: "01-target-polyfills",
    title: "target fuegt Polyfills hinzu",
    code: `// tsconfig.json:
// { "compilerOptions": { "target": "ES5" } }

const numbers = [1, [2, 3], [4, [5]]];
const flat = numbers.flat(2);
console.log(flat); // [1, 2, 3, 4, 5]

// "target: ES5 sorgt dafuer, dass .flat() auch in
// aelteren Browsern funktioniert."`,
    commonBelief:
      "Das `target` in tsconfig.json sorgt dafuer, dass moderne APIs " +
      "wie `Array.flat()` in aelteren Umgebungen funktionieren, " +
      "weil TypeScript Polyfills einfuegt.",
    reality:
      "TypeScript wandelt nur SYNTAX um (z.B. `const` → `var`, " +
      "`=>` → `function`), aber NICHT APIs. `Array.flat()` (ES2019) " +
      "existiert in ES5 nicht, und TypeScript fuegt kein Polyfill hinzu. " +
      "Mit `target: ES5` meldet der Compiler sogar einen Fehler, " +
      "weil `flat()` in den ES5-Typ-Deklarationen nicht existiert. " +
      "Polyfills sind NICHT TypeScripts Aufgabe.",
    concept: "tsconfig / target vs. lib / Syntax vs. APIs",
    difficulty: 4,
  },

  // ─── 6: .d.ts sind kompilierte .ts ──────────────────────────────────────
  {
    id: "01-dts-compiled",
    title: "Declaration Files sind kompilierter Code",
    code: `// Ein Kollege sagt:
// "Die .d.ts-Dateien in node_modules/@types/react
// sind die kompilierten Versionen von React's TypeScript-Code."

// node_modules/@types/react/index.d.ts:
// declare function createElement(...): ReactElement;`,
    commonBelief:
      ".d.ts-Dateien (Declaration Files) sind die kompilierten " +
      "Versionen von TypeScript-Quellcode, aehnlich wie .js-Dateien.",
    reality:
      ".d.ts-Dateien enthalten NUR Typ-Informationen — keinen " +
      "ausfuehrbaren Code. Sie sind die Typ-Beschreibung fuer " +
      "JavaScript-Libraries. React selbst ist in JS geschrieben; " +
      "@types/react liefert lediglich die Typen NACH, damit " +
      "TypeScript-Nutzer Autocomplete und Type Checking bekommen. " +
      "Man kann .d.ts auch selbst erzeugen mit `declaration: true`.",
    concept: "Compiler-Output / Declaration Files",
    difficulty: 2,
  },

  // ─── 7: TypeScript-Laufzeitschutz ───────────────────────────────────────
  {
    id: "01-runtime-safety",
    title: "TypeScript schuetzt zur Laufzeit",
    code: `interface ApiResponse {
  data: { userId: number; name: string };
  status: number;
}

async function fetchUser(): Promise<ApiResponse> {
  const res = await fetch("/api/user");
  const json: ApiResponse = await res.json();
  // "TypeScript garantiert, dass json die richtige Struktur hat"
  console.log(json.data.name.toUpperCase());
  return json;
}`,
    commonBelief:
      "Da `json` als `ApiResponse` typisiert ist, garantiert TypeScript, " +
      "dass die Daten die richtige Struktur haben. Wenn die API " +
      "falsche Daten liefert, wird TypeScript das auffangen.",
    reality:
      "TypeScript prueft NUR zur Compile-Zeit. `res.json()` gibt " +
      "zur Laufzeit `any` zurueck (oder was auch immer die API liefert). " +
      "Wenn die API ein anderes Format hat, crasht der Code. " +
      "Die Type Annotation `ApiResponse` ist nur eine Behauptung — " +
      "keine Validierung. Fuer echte Laufzeit-Sicherheit braucht man " +
      "Validierungs-Libraries wie Zod, io-ts oder Valibot.",
    concept: "Type Erasure / Compile-Zeit vs. Laufzeit",
    difficulty: 3,
  },

  // ─── 8: Source Maps in Produktion ───────────────────────────────────────
  {
    id: "01-sourcemaps-production",
    title: "Source Maps werden immer mitgeliefert",
    code: `// tsconfig.json:
// { "compilerOptions": { "sourceMap": true } }

// "Source Maps sind automatisch aktiv, also sehen
// Nutzer im Browser immer den TypeScript-Quellcode
// in den DevTools."`,
    commonBelief:
      "Mit `sourceMap: true` sehen Endnutzer automatisch den " +
      "TypeScript-Quellcode in den Browser-DevTools.",
    reality:
      "Source Maps werden als separate .js.map-Dateien erzeugt. " +
      "In Produktion sollte man sie NICHT ausliefern (oder nur " +
      "intern verfuegbar machen), weil sie den Quellcode offenlegen. " +
      "Viele Deployment-Pipelines entfernen Source Maps oder laden " +
      "sie nur in Error-Tracking-Tools wie Sentry hoch. " +
      "Ohne die .map-Datei sieht der Nutzer nur minifiziertes JS.",
    concept: "Compiler-Output / Source Maps",
    difficulty: 2,
  },
];
