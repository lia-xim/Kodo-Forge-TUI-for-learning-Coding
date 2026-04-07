/**
 * Lektion 11 — Pre-Test-Fragen: Type Narrowing
 *
 * 3 Fragen pro Sektion, die VOR dem Lesen gestellt werden.
 * Ziel: Das Gehirn fuer die kommende Erklaerung "primen".
 */

export interface PretestQuestion {
  /** Auf welche Sektion sich die Frage bezieht (1-basiert) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Kurze Erklaerung (wird erst NACH der Sektion relevant) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Sektion 1: Was ist Narrowing? ──────────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Du hast eine Variable vom Typ string | number. Kannst du " +
      "direkt .toUpperCase() darauf aufrufen?",
    code: "function f(x: string | number) {\n  x.toUpperCase(); // ???\n}",
    options: [
      "Ja, TypeScript probiert es einfach",
      "Nein, TypeScript meldet einen Fehler",
      "Nur wenn x zur Laufzeit ein String ist",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript meldet einen Fehler, weil number kein toUpperCase hat. " +
      "Du musst erst BEWEISEN, dass x ein string ist (Type Narrowing).",
  },
  {
    sectionIndex: 1,
    question:
      "Welchen Typ hat x nach dem null-Check mit early return?",
    code: "function f(x: string | null) {\n  if (x === null) return;\n  // x hat welchen Typ?\n}",
    options: [
      "string | null",
      "string",
      "null",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Nach dem early return (if null, return) ist null eliminiert. " +
      "TypeScript weiss: wenn wir weiter im Code sind, ist x string.",
  },
  {
    sectionIndex: 1,
    question:
      "Was ist sicherer: 'wert as string' oder 'if (typeof wert === \"string\")'?",
    options: [
      "'as' ist sicherer weil es den Compiler informiert",
      "'typeof' ist sicherer weil es einen Laufzeit-Check macht",
      "Beide sind gleich sicher",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "typeof macht einen echten Laufzeit-Check (Beweis). " +
      "as ist nur ein Versprechen an den Compiler ohne Pruefung — " +
      "wenn es falsch ist, crasht der Code zur Laufzeit.",
  },

  // ─── Sektion 2: typeof Guards ───────────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Wie viele verschiedene Strings kann typeof zurueckgeben?",
    options: [
      "5 (string, number, boolean, object, undefined)",
      "6 (+ function)",
      "8 (+ symbol, bigint)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "typeof gibt genau 8 verschiedene Strings zurueck: string, number, " +
      "boolean, undefined, object, function, symbol, bigint.",
  },
  {
    sectionIndex: 2,
    question:
      "Was ist das Problem mit typeof x === 'object' beim Narrowing?",
    code: "function f(x: object | null) {\n  if (typeof x === 'object') {\n    // x hat welchen Typ?\n  }\n}",
    options: [
      "x ist hier sicher object (null ist weg)",
      "x koennte immer noch null sein",
      "typeof funktioniert nicht mit object",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "typeof null gibt 'object' zurueck! Nach typeof === 'object' " +
      "ist der Typ object | null. Du musst null separat ausschliessen.",
  },
  {
    sectionIndex: 2,
    question:
      "Kann typeof zwischen verschiedenen Objekttypen unterscheiden? " +
      "(z.B. Array vs. Date vs. RegExp)",
    options: [
      "Ja, typeof gibt den Klassennamen zurueck",
      "Nein, typeof gibt fuer alle Objekte 'object' zurueck",
      "Nur bei Arrays: typeof [] === 'array'",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "typeof gibt fuer ALLE Objekte (Array, Date, RegExp, etc.) den " +
      "Wert 'object' zurueck. Fuer feinere Unterscheidungen braucht " +
      "man instanceof, Array.isArray() oder den in-Operator.",
  },

  // ─── Sektion 3: instanceof und in ──────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "Kann instanceof mit TypeScript-Interfaces verwendet werden?",
    code: "interface User { name: string }\n// if (x instanceof User) ???",
    options: [
      "Nein, Interfaces existieren nur zur Compilezeit",
      "Ja, instanceof funktioniert mit allen Typen",
      "Nur wenn das Interface eine Klasse erweitert",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Interfaces werden durch Type Erasure entfernt. Zur Laufzeit " +
      "gibt es kein Interface-Objekt. instanceof braucht eine Klasse.",
  },
  {
    sectionIndex: 3,
    question:
      "Was macht der in-Operator in TypeScript?",
    code: "if ('name' in obj) { ... }",
    options: [
      "Prueft ob die Property 'name' auf dem Objekt existiert",
      "Prueft ob der Wert von obj.name truthy ist",
      "Prueft ob 'name' ein gueltiger Typ ist",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Der in-Operator prueft ob eine PROPERTY auf dem Objekt existiert " +
      "(nicht den Wert!). TypeScript nutzt das fuer Narrowing.",
  },
  {
    sectionIndex: 3,
    question:
      "Was ist eine 'Discriminated Union'?",
    options: [
      "Ein Union mit einer gemeinsamen Property die verschiedene Literal-Werte hat",
      "Ein Union aus nur zwei Typen",
      "Ein Union der readonly ist",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Eine Discriminated Union hat eine gemeinsame Property (z.B. 'type') " +
      "mit unterschiedlichen Literal-Werten (z.B. 'success' | 'error'). " +
      "TypeScript kann darauf perfekt narrowen.",
  },

  // ─── Sektion 4: Equality und Truthiness ─────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Welche Werte sind in JavaScript 'falsy'?",
    options: [
      "Nur null und undefined",
      "null, undefined, false",
      "false, 0, '', null, undefined, NaN",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Falsy-Werte: false, 0, -0, 0n, '', null, undefined, NaN. " +
      "ALLES andere ist truthy — auch [], {} und '0'!",
  },
  {
    sectionIndex: 4,
    question:
      "Was ist der Unterschied zwischen 'if (x)' und 'if (x != null)'?",
    options: [
      "Kein Unterschied — beide pruefen auf null",
      "'if (x != null)' ist langsamer",
      "'if (x)' schliesst auch 0, '' und false aus",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "if (x) schliesst ALLE falsy-Werte aus (null, undefined, 0, '', false, NaN). " +
      "if (x != null) schliesst nur null und undefined aus. " +
      "Wenn 0, '' oder false gueltig sind, verwende != null.",
  },
  {
    sectionIndex: 4,
    question:
      "Ist 'null == undefined' in JavaScript true oder false?",
    options: [
      "true",
      "false",
      "TypeError",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "null == undefined ist true (lose Gleichheit). " +
      "null === undefined ist false (strikte Gleichheit). " +
      "Deshalb prueft x != null auf beides gleichzeitig.",
  },

  // ─── Sektion 5: Type Predicates ─────────────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "Was passiert wenn du einen falschen Type Guard schreibst?",
    code: "function isString(x: unknown): x is string {\n  return true; // immer true!\n}",
    options: [
      "TypeScript meldet einen Fehler",
      "Ich weiss es nicht",
      "Der Guard wird ignoriert",
      "TypeScript vertraut dem Guard blind — Laufzeit-Crash moeglich",
    ],
    correct: 3,
    briefExplanation:
      "TypeScript prueft NICHT ob dein Type Guard korrekt ist. " +
      "Wenn du immer true zurueckgibst, vertraut der Compiler dir " +
      "und der Code crasht bei nicht-Strings zur Laufzeit.",
  },
  {
    sectionIndex: 5,
    question:
      "Musstest du vor TS 5.5 beim filter() einen manuellen Type Guard angeben?",
    code: "const x: (string | null)[] = ['a', null];\nconst y = x.filter(v => v !== null);\n// Typ von y?",
    options: [
      "Nein, filter narrowte schon immer automatisch",
      "Ich weiss es nicht",
      "filter() konnte gar nicht mit null-Werten umgehen",
      "Ja, der Typ war (string | null)[] ohne manuellen Guard",
    ],
    correct: 3,
    briefExplanation:
      "Vor TS 5.5 war der Typ nach filter immer noch (string | null)[]. " +
      "Man musste .filter((v): v is string => v !== null) schreiben. " +
      "Ab TS 5.5 inferiert TypeScript das automatisch.",
  },
  {
    sectionIndex: 5,
    question:
      "Was ist der Unterschied zwischen einem Type Guard und einer Assertion Function?",
    options: [
      "Type Guard gibt boolean, Assertion wirft oder gibt void",
      "Type Guard ist schneller",
      "Assertion funktioniert nur mit Klassen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Type Guards (is) geben boolean zurueck — der Aufrufer entscheidet. " +
      "Assertion Functions (asserts) werfen bei Fehler — der Aufrufer " +
      "muss sich nicht kuemmern, der Scope wird automatisch genarrowed.",
  },

  // ─── Sektion 6: Exhaustive Checks ──────────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "Was ist der Typ einer Variable im default-Zweig, wenn " +
      "alle Faelle eines Union Types behandelt wurden?",
    options: [
      "unknown",
      "any",
      "never",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Wenn alle Faelle abgedeckt sind, bleibt nichts uebrig: " +
      "der Typ ist never (der leere Typ). Deshalb kann man " +
      "const _: never = x schreiben — es wird nie erreicht.",
  },
  {
    sectionIndex: 6,
    question:
      "Was passiert wenn du assertNever(x) aufrufst aber x NICHT never ist?",
    options: [
      "Laufzeit-Error",
      "Ich weiss es nicht",
      "assertNever gibt undefined zurueck",
      "Compile-Error: x ist nicht never zuweisbar",
    ],
    correct: 3,
    briefExplanation:
      "assertNever erwartet never als Parameter. Wenn x nicht never ist " +
      "(weil ein Fall fehlt), meldet TypeScript einen Compile-Fehler: " +
      "'Type X is not assignable to type never'.",
  },
  {
    sectionIndex: 6,
    question:
      "Gibt es eine Alternative zu switch + assertNever fuer exhaustive Checks?",
    options: [
      "Nein, switch ist die einzige Moeglichkeit",
      "Ich weiss es nicht",
      "Ja, if/else Ketten sind immer exhaustive",
      "Ja, Record<UnionType, Value> mit satisfies",
    ],
    correct: 3,
    briefExplanation:
      "Record<UnionType, Value> mit satisfies stellt sicher, dass fuer " +
      "JEDEN Union-Wert ein Eintrag existiert. Wenn ein Wert fehlt, " +
      "meldet TypeScript einen Fehler. Elegante Alternative zu switch.",
  },
];
