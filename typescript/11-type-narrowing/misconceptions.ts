/**
 * Lektion 11 — Fehlkonzeption-Exercises: Type Narrowing
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
  // ─── 1: typeof null Narrowing ──────────────────────────────────────────
  {
    id: "11-typeof-null-narrowing",
    title: "typeof === 'object' schliesst null aus",
    code: `function processObject(value: object | string | null) {
  if (typeof value === "object") {
    // "value ist jetzt sicher ein Objekt"
    console.log(Object.keys(value));
  }
}

processObject(null); // ???`,
    commonBelief:
      "Nach typeof === 'object' ist null ausgeschlossen, weil null " +
      "kein Objekt ist.",
    reality:
      "typeof null gibt 'object' zurueck! Nach dem Check ist value " +
      "vom Typ object | null. Object.keys(null) wirft einen TypeError. " +
      "Loesung: Zusaetzlich value !== null pruefen.",
    concept: "typeof null Bug / Narrowing",
    difficulty: 2,
  },

  // ─── 2: instanceof mit Interfaces ─────────────────────────────────────
  {
    id: "11-instanceof-interface",
    title: "instanceof funktioniert mit Interfaces",
    code: `interface Animal {
  name: string;
  sound: string;
}

function isAnimal(value: unknown): boolean {
  return value instanceof Animal; // ???
}`,
    commonBelief:
      "instanceof kann mit Interfaces genauso wie mit Klassen " +
      "verwendet werden.",
    reality:
      "Dieser Code kompiliert NICHT! Interfaces existieren nur zur " +
      "Compilezeit (Type Erasure). Zur Laufzeit gibt es kein " +
      "Animal-Objekt. Loesung: in-Operator oder Custom Type Guard.",
    concept: "instanceof / Type Erasure",
    difficulty: 2,
  },

  // ─── 3: Truthiness narrowt zu viel ───────────────────────────────────
  {
    id: "11-truthiness-too-much",
    title: "if (x) reicht fuer null-Checks",
    code: `function formatValue(value: number | null): string {
  if (value) {
    return \`Wert: \${value}\`;
  }
  return "Kein Wert";
}

console.log(formatValue(0));    // ???
console.log(formatValue(null)); // "Kein Wert"
console.log(formatValue(42));   // "Wert: 42"`,
    commonBelief:
      "if (value) prueft ob value nicht null ist, also ist 0 " +
      "ein gueltiger Wert der durch den Check kommt.",
    reality:
      "0 ist falsy! formatValue(0) gibt 'Kein Wert' statt 'Wert: 0'. " +
      "Truthiness-Checks schliessen 0, '', false und NaN aus. " +
      "Loesung: if (value !== null) oder value ?? 'Kein Wert'.",
    concept: "Truthiness Narrowing / Falsy-Werte",
    difficulty: 2,
  },

  // ─── 4: Type Guard ohne Laufzeit-Pruefung ─────────────────────────────
  {
    id: "11-bad-type-guard",
    title: "Type Guards werden vom Compiler geprueft",
    code: `interface Admin {
  role: "admin";
  permissions: string[];
}

function isAdmin(user: unknown): user is Admin {
  return true; // "Wird schon passen"
}

function deleteUser(user: unknown) {
  if (isAdmin(user)) {
    console.log(user.permissions.join(", "));
  }
}

deleteUser({ name: "Max" }); // ???`,
    commonBelief:
      "TypeScript prueft ob der Type Guard korrekt implementiert ist. " +
      "Wenn die Logik falsch ist, gibt es einen Compile-Fehler.",
    reality:
      "TypeScript vertraut Type Guards BLIND! Wenn isAdmin immer " +
      "true zurueckgibt, wird jeder Wert als Admin behandelt. " +
      "user.permissions ist undefined, .join() crasht zur Laufzeit. " +
      "Type Guards sind wie 'as' — DU bist verantwortlich.",
    concept: "Type Predicates / Vertrauensprinzip",
    difficulty: 3,
  },

  // ─── 5: Narrowing ueber Funktionsgrenzen ──────────────────────────────
  {
    id: "11-narrowing-across-functions",
    title: "Narrowing funktioniert ueber Funktionsaufrufe",
    code: `function isNotNull(value: unknown): boolean {
  return value !== null;
}

function process(value: string | null) {
  if (isNotNull(value)) {
    // "value ist jetzt string"
    console.log(value.toUpperCase()); // ???
  }
}`,
    commonBelief:
      "Wenn isNotNull true zurueckgibt, weiss TypeScript dass value " +
      "nicht null ist, also ist value im if-Block ein string.",
    reality:
      "TypeScript narrowt NICHT ueber normale Funktionsaufrufe! " +
      "isNotNull gibt boolean zurueck — TypeScript weiss nicht, " +
      "WELCHE Pruefung die Funktion macht. value bleibt string | null. " +
      "Loesung: Type Guard mit 'is': (value: unknown): value is string.",
    concept: "Narrowing-Grenzen / Type Predicates",
    difficulty: 3,
  },

  // ─── 6: Narrowing in Callbacks ────────────────────────────────────────
  {
    id: "11-narrowing-in-callbacks",
    title: "Narrowing ueberlebt Callbacks",
    code: `function processLater(value: string | null) {
  if (value !== null) {
    // value: string — sicher!
    setTimeout(() => {
      // "value ist immer noch string"
      console.log(value.toUpperCase());
    }, 1000);
  }
}`,
    commonBelief:
      "value koennte sich aendern bevor der Callback ausgefuehrt wird, " +
      "also ist das Narrowing ungueltig.",
    reality:
      "Ueberraschung: Das funktioniert tatsaechlich! TypeScript erkennt, " +
      "dass value ein const-Parameter ist (nicht reassignable). " +
      "In der Closure wird value als string erfasst. " +
      "ABER: Bei let-Variablen waere es anders — TypeScript narrowt " +
      "let-Variablen in Closures NICHT, weil sie sich aendern koennten.",
    concept: "Narrowing in Closures / const vs let",
    difficulty: 4,
  },

  // ─── 7: Exhaustive Check vergessen ────────────────────────────────────
  {
    id: "11-missing-exhaustive",
    title: "switch ohne default ist exhaustive",
    code: `type Color = "red" | "green" | "blue";

function toHex(color: Color): string {
  switch (color) {
    case "red":   return "#ff0000";
    case "green": return "#00ff00";
    case "blue":  return "#0000ff";
  }
  // Kein default noetig — alle Faelle abgedeckt
}

// Spaeter: type Color = "red" | "green" | "blue" | "yellow";
// toHex("yellow"); // ???`,
    commonBelief:
      "TypeScript erkennt automatisch, dass alle Faelle abgedeckt sind. " +
      "Wenn man einen neuen Wert hinzufuegt, gibt es einen Fehler.",
    reality:
      "Ohne assertNever im default gibt TypeScript bei einem neuen Wert " +
      "KEINEN garantierten Fehler im switch. Die Funktion koennte " +
      "implizit undefined zurueckgeben (mit noImplicitReturns gibt es " +
      "eine Warnung, aber kein Fehler IM switch). " +
      "assertNever ist das sichere Pattern.",
    concept: "Exhaustive Checks / assertNever",
    difficulty: 3,
  },

  // ─── 8: filter mit null vor TS 5.5 ───────────────────────────────────
  {
    id: "11-filter-before-5-5",
    title: "filter entfernt null aus dem Typ (vor TS 5.5)",
    code: `// Vor TS 5.5:
const items: (string | null)[] = ["a", null, "b"];
const clean = items.filter(x => x !== null);
// "clean ist jetzt string[]"
clean.map(s => s.toUpperCase()); // ???`,
    commonBelief:
      "filter(x => x !== null) entfernt null aus dem Typ, also ist " +
      "das Ergebnis string[].",
    reality:
      "Vor TypeScript 5.5 war der Typ von clean IMMER NOCH " +
      "(string | null)[]. filter() aenderte den Typ nicht automatisch. " +
      "Man musste .filter((x): x is string => x !== null) schreiben. " +
      "Ab TS 5.5 funktioniert es automatisch (Inferred Type Predicates).",
    concept: "TS 5.5 Inferred Type Predicates / filter",
    difficulty: 3,
  },
];
