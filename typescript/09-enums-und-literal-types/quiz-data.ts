/**
 * Lektion 09 — Quiz-Daten: Enums & Literal Types
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "09";
export const lessonTitle = "Enums & Literal Types";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Literal Types Grundlagen ---
  {
    question: "Was ist der Typ von `const x = 'hello'` in TypeScript?",
    options: [
      "string",
      '"hello"',
      "any",
      "unknown",
    ],
    correct: 1,
    explanation:
      "const-Variablen mit primitiven Werten bekommen einen Literal Type. " +
      "Da const sich nie aendern kann, ist der Typ exakt \"hello\" — nicht string. " +
      "Bei let waere der Typ string (Type Widening).",
  },

  // --- Frage 2: as const Effekte ---
  {
    question: "Was macht `as const` bei einem Array?",
    options: [
      "Nur readonly (keine Aenderungen)",
      "Nur Literal Types (praezise Werte)",
      "readonly + Literal Types + Tuple (feste Laenge)",
      "Nichts, as const gilt nur fuer Objekte",
    ],
    correct: 2,
    explanation:
      "as const hat drei Effekte: (1) Das Array wird readonly, " +
      "(2) alle Elemente bekommen Literal Types, (3) es wird ein Tuple " +
      "mit fester Laenge. Aus `['a', 'b']` wird `readonly ['a', 'b']`.",
    code: 'const arr = ["GET", "POST"] as const;\n// Typ: readonly ["GET", "POST"]',
  },

  // --- Frage 3: Enum Reverse Mapping ---
  {
    question: "Was gibt `Direction[0]` zurueck, wenn `enum Direction { Up, Down, Left, Right }`?",
    options: [
      '"Up"',
      "0",
      "undefined",
      "Error — Enums unterstuetzen keinen Index-Zugriff",
    ],
    correct: 0,
    explanation:
      "Numerische Enums haben Reverse Mapping: Direction[0] gibt den " +
      "String-Namen 'Up' zurueck. Das generierte JavaScript-Objekt hat " +
      "doppelte Eintraege: { 0: 'Up', Up: 0, 1: 'Down', Down: 1, ... }.",
    code: "enum Direction { Up, Down, Left, Right }\nconsole.log(Direction[0]); // ???",
  },

  // --- Frage 4: String Enum Vergleich ---
  {
    question: "Welche Zuweisung kompiliert OHNE Fehler?",
    options: [
      'const s: StatusEnum = "ACTIVE";',
      "const s: StatusEnum = StatusEnum.Active;",
      "const s: StatusEnum = 42;",
      'const s: StatusEnum = StatusEnum.Active as "ACTIVE";',
    ],
    correct: 1,
    explanation:
      "String Enums sind nominal typisiert — nur Enum-Mitglieder koennen " +
      "zugewiesen werden. Direkte Strings ('ACTIVE'), Zahlen und Assertions " +
      "funktionieren nicht. Das unterscheidet Enums von Union Literal Types.",
    code: 'enum StatusEnum { Active = "ACTIVE", Inactive = "INACTIVE" }',
  },

  // --- Frage 5: Numerisches Enum Soundness ---
  {
    question: "Kompiliert `const d: Direction = 42`? (enum Direction { Up, Down, Left, Right })",
    options: [
      "Nein, 42 ist kein gueltiger Direction-Wert",
      "Nur mit as-Assertion",
      "Nur wenn 42 ein definierter Wert waere",
      "Ja, TypeScript erlaubt jede Zahl bei numerischen Enums",
    ],
    correct: 3,
    explanation:
      "Das ist ein bekanntes Soundness-Loch: TypeScript erlaubt JEDE Zahl " +
      "als numerischen Enum-Wert. Der Grund: Bitwise-Flags wie " +
      "`Permission.Read | Permission.Write` erzeugen Werte die nicht im " +
      "Enum definiert sind (z.B. 3). String Enums haben dieses Problem nicht.",
    code: "enum Direction { Up, Down, Left, Right }\nconst d: Direction = 42; // ???",
  },

  // --- Frage 6: Object.keys bei numerischem Enum ---
  {
    question: "Wie viele Eintraege hat `Object.keys(Color)` bei `enum Color { Red, Green, Blue }`?",
    options: [
      "3 — nur die Namen",
      "9 — Namen, Werte und Reverse-Mappings",
      "6 — Namen und Zahlenwerte",
      "0 — Enums haben keine Keys",
    ],
    correct: 2,
    explanation:
      "Bei numerischen Enums hat das generierte Objekt DOPPELTE Eintraege: " +
      "Die Namen als Keys (Red, Green, Blue) UND die Zahlen als Keys (0, 1, 2). " +
      "Object.keys gibt daher 6 zurueck: ['0', '1', '2', 'Red', 'Green', 'Blue']. " +
      "Bei String Enums waeren es nur 3.",
    code: "enum Color { Red, Green, Blue }\nconsole.log(Object.keys(Color).length); // ???",
  },

  // --- Frage 7: Union Type aus as const ---
  {
    question: "Welcher Ausdruck leitet den Union Type aus einem as const Array ab?",
    options: [
      "typeof arr",
      "typeof arr[0]",
      "typeof arr[number]",
      "keyof typeof arr",
    ],
    correct: 2,
    explanation:
      "typeof arr[number] greift mit dem Index-Typ 'number' auf ALLE " +
      "Positionen des Tuples zu und erzeugt den Union aller Elemente. " +
      "typeof arr waere der gesamte Tuple-Typ, typeof arr[0] nur das erste " +
      "Element, keyof typeof arr die Tuple-Methoden und Index-Keys.",
    code: 'const arr = ["GET", "POST", "PUT"] as const;\ntype Method = typeof arr[number]; // ???',
  },

  // --- Frage 8: Template Literal Types ---
  {
    question: "Wie viele Mitglieder hat der Typ `\\`${A}-${B}\\`` wenn A 3 und B 4 Werte hat?",
    options: [
      "7 (3 + 4)",
      "12 (3 × 4)",
      "3 (nur A)",
      "4 (nur B)",
    ],
    correct: 1,
    explanation:
      "Template Literal Types erzeugen das kartesische Produkt aller " +
      "Kombinationen. Bei 3 A-Werten und 4 B-Werten ergeben sich 3 × 4 = 12 " +
      "einzigartige String-Literal-Typen. Das ist distributiv — jede " +
      "Kombination wird einzeln erzeugt.",
  },

  // --- Frage 9: Capitalize<T> ---
  {
    question: 'Was ist der Typ von `Capitalize<"click" | "scroll">`?',
    options: [
      '"Click" | "Scroll"',
      '"CLICK" | "SCROLL"',
      '"Click" | "click" | "Scroll" | "scroll"',
      '"clickClick" | "scrollScroll"',
    ],
    correct: 0,
    explanation:
      "Capitalize macht nur den ersten Buchstaben gross. Es wird distributiv " +
      "auf jedes Union-Mitglied einzeln angewendet: 'click' wird zu 'Click', " +
      "'scroll' wird zu 'Scroll'. Die Anzahl der Mitglieder bleibt gleich. " +
      "Fuer ALLES gross: Uppercase<T>.",
  },

  // --- Frage 10: const enum ---
  {
    question: "Was ist das Hauptproblem von `const enum`?",
    options: [
      "Es ist nicht mit isolatedModules kompatibel",
      "Es erzeugt zu viel Laufzeit-Code",
      "Es unterstuetzt keine String-Werte",
      "Es hat kein Reverse Mapping",
    ],
    correct: 0,
    explanation:
      "const enum wird inline ersetzt — der Compiler muss also die " +
      "Enum-Definition in der Quelldatei kennen. Mit isolatedModules " +
      "(Standard bei Vite, esbuild, swc, Next.js) wird jede Datei einzeln " +
      "kompiliert — cross-file const enum funktioniert dann nicht. " +
      "Die Alternative: as const Objects.",
  },

  // --- Frage 11: Branding ---
  {
    question: "Was verhindert ein Branded Type wie `type EUR = number & { __brand: 'EUR' }`?",
    options: [
      "Dass der Wert negativ wird",
      "Dass eine normale number als EUR verwendet wird",
      "Dass der Wert zur Laufzeit geaendert wird",
      "Dass der Wert serialisiert wird",
    ],
    correct: 1,
    explanation:
      "Branded Types verhindern, dass semantisch verschiedene Werte " +
      "verwechselt werden. Eine normale number ist nicht 'EUR' zuweisbar — " +
      "man muss explizit durch eine Konstruktor-Funktion gehen. " +
      "Zur Laufzeit existiert die __brand-Property nicht — es ist rein " +
      "ein Compile-Zeit-Mechanismus.",
    code: "type EUR = number & { __brand: 'EUR' };\nconst betrag: EUR = 100; // Error!",
  },

  // --- Frage 12: Enum vs Union Literal ---
  {
    question: "Welcher Vorteil gehoert zu Union Literal Types, NICHT zu Enums?",
    options: [
      "Reverse Mapping (Wert zu Name)",
      "Nominale Typisierung",
      "Kein Laufzeit-Code (Tree-Shakeable)",
      "Iteration ueber alle Werte",
    ],
    correct: 2,
    explanation:
      "Union Literal Types erzeugen KEINEN JavaScript-Code — sie verschwinden " +
      "komplett bei der Kompilierung (Type Erasure). Das macht sie " +
      "Tree-Shakeable. Enums erzeugen ein Laufzeit-Objekt. Reverse Mapping " +
      "und Iteration sind Enum-Vorteile. Nominale Typisierung ist ebenfalls " +
      "ein Enum-Feature.",
  },

  // --- Frage 13: as const Object ---
  {
    question: "Koennen Wert und Typ in TypeScript denselben Namen haben?",
    options: [
      "Nein, das erzeugt einen Namenskonflikt",
      "Nur bei Enums",
      "Nur bei Klassen",
      "Ja, sie leben in verschiedenen Namensraeumen",
    ],
    correct: 3,
    explanation:
      "TypeScript hat separate Namensraeume fuer Werte und Typen. " +
      "Man kann `const X = { ... } as const` und `type X = typeof X[...]` " +
      "deklarieren — TypeScript weiss aus dem Kontext welches gemeint ist. " +
      "Enums und Klassen nutzen das gleiche Prinzip: Sie sind gleichzeitig " +
      "Wert und Typ.",
    code: "const Status = { Active: 'ACTIVE' } as const;\ntype Status = typeof Status[keyof typeof Status];",
  },

  // --- Frage 14: String Enum Iteration ---
  {
    question: "Wie viele Eintraege hat `Object.keys()` bei einem String Enum mit 5 Mitgliedern?",
    options: [
      "5",
      "10",
      "0",
      "Abhaengig von den Werten",
    ],
    correct: 0,
    explanation:
      "String Enums haben KEIN Reverse Mapping. Das generierte Objekt hat " +
      "nur einseitige Eintraege: Name -> Wert. Bei 5 Mitgliedern gibt " +
      "Object.keys() genau 5 zurueck. Das ist ein grosser Vorteil gegenueber " +
      "numerischen Enums (die wuerden 10 zurueckgeben).",
  },

  // --- Frage 15: Template Literal Type Pattern ---
  {
    question: "Was beschreibt der Typ `\\`on${string}\\`` am besten?",
    options: [
      'Nur den String "on"',
      'Jeden String der "on" enthaelt',
      'Nur "onClick", "onScroll", "onFocus"',
      'Jeden String der mit "on" anfaengt',
    ],
    correct: 3,
    explanation:
      "`on${string}` ist ein Template Literal Type der JEDEN String " +
      "akzeptiert, der mit 'on' anfaengt. ${string} ist ein Wildcard fuer " +
      "beliebige String-Suffixe. 'onClick', 'onFoo', 'on' — alles passt. " +
      "'click' oder 'myOnClick' passen NICHT.",
    code: 'type EventName = `on${string}`;\nconst a: EventName = "onClick";  // OK\n// const b: EventName = "click"; // Error!',
  },

  // ─── Zusaetzliche Formate ────────────────────────────────────────────────────

  // --- Frage 16: Short-Answer — const Literal Type ---
  {
    type: "short-answer",
    question: "Welcher Typ wird `const x = 'hello'` zugewiesen — string oder \"hello\"?",
    expectedAnswer: '"hello"',
    acceptableAnswers: ['"hello"', "'hello'", "hello", "Literal Type hello", "\"hello\" (Literal Type)"],
    explanation:
      "const-Variablen mit primitiven Werten bekommen einen Literal Type. " +
      "Da sich const nie aendern kann, ist der Typ exakt \"hello\" — nicht string. " +
      "Bei let waere der Typ string (Type Widening).",
  },

  // --- Frage 17: Short-Answer — as const Effekte ---
  {
    type: "short-answer",
    question: "Nenne die drei Effekte von `as const` auf ein Array (Stichworte genuegen).",
    expectedAnswer: "readonly, Literal Types, Tuple",
    acceptableAnswers: [
      "readonly, Literal Types, Tuple",
      "readonly, literal, tuple",
      "Tuple, readonly, Literal Types",
      "readonly Tuple mit Literal Types",
      "immutable, literal types, tuple",
    ],
    explanation:
      "as const hat drei simultane Effekte: (1) readonly — keine Mutationen, " +
      "(2) Literal Types — praezise Werte statt breiter Typen, " +
      "(3) Tuple — feste Laenge statt dynamischem Array.",
  },

  // --- Frage 18: Short-Answer — Enum Soundness ---
  {
    type: "short-answer",
    question: "Welche Art von Enum hat ein Soundness-Loch bei dem jede Zahl zuweisbar ist — string oder numerisch?",
    expectedAnswer: "numerisch",
    acceptableAnswers: ["numerisch", "numerische", "numeric", "Numerisch", "numerische Enums", "number"],
    explanation:
      "Numerische Enums erlauben JEDE Zahl — auch Werte die nicht im Enum definiert sind. " +
      "Der Grund: Bitwise-Flags erzeugen Werte ausserhalb der Enum-Definition. " +
      "String Enums sind dagegen nominal typisiert und haben dieses Problem nicht.",
  },

  // --- Frage 19: Predict-Output — Reverse Mapping ---
  {
    type: "predict-output",
    question: "Was gibt dieser Code aus?",
    code: "enum Color { Red, Green, Blue }\nconsole.log(Color[1]);",
    expectedAnswer: "Green",
    acceptableAnswers: ["Green", "'Green'", "\"Green\""],
    explanation:
      "Numerische Enums haben Reverse Mapping: Color[1] gibt den String-Namen 'Green' " +
      "zurueck. Das generierte JavaScript-Objekt hat doppelte Eintraege — " +
      "sowohl Name→Wert als auch Wert→Name.",
  },

  // --- Frage 20: Predict-Output — Object.keys bei numerischem Enum ---
  {
    type: "predict-output",
    question: "Was gibt dieser Code aus?",
    code: "enum Dir { Up, Down }\nconsole.log(Object.keys(Dir).length);",
    expectedAnswer: "4",
    acceptableAnswers: ["4"],
    explanation:
      "Numerische Enums haben durch Reverse Mapping doppelte Eintraege: " +
      "Die Namen (Up, Down) UND die Zahlen (0, 1) als Keys. " +
      "2 Mitglieder × 2 = 4 Keys: ['0', '1', 'Up', 'Down'].",
  },

  // --- Frage 21: Explain-Why — as const vs Enum ---
  {
    type: "explain-why",
    question: "Warum empfehlen viele Teams `as const` Objects statt Enums? Welche Vorteile bieten sie?",
    modelAnswer:
      "as const Objects vermeiden die Sonderregeln von Enums: kein Reverse Mapping, " +
      "kein Soundness-Loch bei Zahlen, kompatibel mit isolatedModules/esbuild/Vite. " +
      "Sie erzeugen normales JavaScript das Tree-Shakeable ist. Man kann mit " +
      "typeof obj[keyof typeof obj] den Union Type ableiten und behaelt gleichzeitig " +
      "ein Laufzeit-Objekt fuer Iteration.",
    keyPoints: [
      "Kompatibel mit isolatedModules und modernen Build-Tools",
      "Kein Soundness-Loch wie bei numerischen Enums",
      "Tree-Shakeable, normales JavaScript",
      "Union Type ableitbar mit typeof",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Zusaetzliche Erklaerungen fuer jede Frage: Warum die richtige Antwort
// richtig ist und welche Fehlkonzeption am haeufigsten vorkommt.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "const-Variablen mit primitiven Werten erhalten einen Literal Type, weil " +
      "sich ihr Wert nie aendern kann. TypeScript nutzt die praeziseste " +
      "moegliche Typisierung.",
    commonMistake:
      "Viele erwarten 'string', weil Texte eben Strings sind. " +
      "Aber der Literal Type '\"hello\"' ist ein SUBTYP von string — praeziser.",
  },
  1: {
    whyCorrect:
      "as const hat drei simultane Effekte: readonly, Literal Types, und " +
      "Tuple statt Array. Alle drei zusammen machen den Wert vollstaendig " +
      "unveraenderlich und praezise typisiert.",
    commonMistake:
      "Viele denken, as const macht nur readonly. Die Literal-Typ-Beibehaltung " +
      "und die Tuple-Konvertierung werden oft uebersehen.",
  },
  2: {
    whyCorrect:
      "Numerische Enums haben Reverse Mapping: Das generierte Objekt " +
      "enthaelt sowohl Name→Wert als auch Wert→Name Eintraege. " +
      "Direction[0] greift auf das Reverse Mapping zu.",
    commonMistake:
      "Manche erwarten 0 (den Wert selbst) oder undefined. " +
      "Das Reverse Mapping ist einzigartig fuer numerische Enums — " +
      "String Enums haben es nicht.",
  },
  3: {
    whyCorrect:
      "String Enums sind nominal typisiert. Nur Enum-Mitglieder " +
      "(StatusEnum.Active) koennen zugewiesen werden. Direkte Strings " +
      "sind nicht kompatibel, auch wenn der Wert identisch ist.",
    commonMistake:
      "Viele erwarten, dass '\"ACTIVE\"' funktioniert, weil der Enum-Wert " +
      "genau 'ACTIVE' ist. Aber Enums sind nominal — der Name zaehlt, " +
      "nicht die Struktur.",
  },
  4: {
    whyCorrect:
      "Numerische Enums erlauben jede Zahl — ein bewusstes Zugestaendnis " +
      "fuer Bitwise-Flag-Kombinationen. Das ist ein bekanntes Soundness-Loch.",
    commonMistake:
      "Fast jeder erwartet einen Fehler. Das Soundness-Loch existiert " +
      "bewusst fuer Bitwise-Operationen und ist der Hauptgrund, " +
      "warum String Enums bevorzugt werden.",
  },
  5: {
    whyCorrect:
      "Numerische Enums haben doppelte Eintraege durch Reverse Mapping. " +
      "3 Namen + 3 Zahlen = 6 Keys. String Enums haetten nur 3.",
    commonMistake:
      "Die meisten erwarten 3, weil sie an die 3 Farben denken. " +
      "Das Reverse Mapping wird oft vergessen.",
  },
  6: {
    whyCorrect:
      "typeof arr[number] nutzt den Index-Typ 'number' um auf ALLE " +
      "Positionen zuzugreifen. Das Ergebnis ist der Union aller Elemente.",
    commonMistake:
      "Viele verwechseln typeof arr (der ganze Tuple-Typ) mit " +
      "typeof arr[number] (Union der Elemente). keyof typeof arr gibt " +
      "die Tuple-Methoden zurueck, nicht die Werte.",
  },
  7: {
    whyCorrect:
      "Template Literal Types sind distributiv — sie erzeugen das " +
      "kartesische Produkt aller Kombinationen. 3 × 4 = 12.",
    commonMistake:
      "Viele denken an Addition (7) statt Multiplikation (12). " +
      "Jede A-Variante wird mit jeder B-Variante kombiniert.",
  },
  8: {
    whyCorrect:
      "Capitalize macht NUR den ersten Buchstaben gross. Es wird " +
      "distributiv auf jedes Union-Mitglied angewendet.",
    commonMistake:
      "Capitalize wird mit Uppercase verwechselt. " +
      "Capitalize: erster Buchstabe gross. Uppercase: ALLES gross.",
  },
  9: {
    whyCorrect:
      "const enum ist inkompatibel mit isolatedModules weil der " +
      "Compiler die Definition in einer anderen Datei lesen muesste " +
      "um den Wert inline einzusetzen.",
    commonMistake:
      "Manche denken, const enum erzeugt zu viel Code. " +
      "Das Gegenteil ist wahr — es erzeugt KEINEN Code (inline). " +
      "Das Problem ist die Build-Tool-Kompatibilitaet.",
  },
  10: {
    whyCorrect:
      "Branded Types nutzen eine __brand-Intersection die zur " +
      "Compilezeit verschiedene semantische Typen unterscheidet, " +
      "aber zur Laufzeit nicht existiert.",
    commonMistake:
      "Viele denken, die __brand-Property existiert zur Laufzeit. " +
      "Sie ist rein ein Compile-Zeit-Mechanismus — der Wert bleibt " +
      "eine normale Zahl/String.",
  },
  11: {
    whyCorrect:
      "Union Literal Types verschwinden komplett bei der Kompilierung " +
      "(Type Erasure). Sie erzeugen null Bytes JavaScript-Code.",
    commonMistake:
      "Manche glauben, auch Union Types erzeugen Laufzeit-Code. " +
      "Nur Enums und as const Objects haben Laufzeit-Repraesentationen.",
  },
  12: {
    whyCorrect:
      "TypeScript hat separate Namensraeume fuer Werte und Typen. " +
      "Aus dem Kontext erkennt der Compiler ob der Wert oder der Typ gemeint ist.",
    commonMistake:
      "Viele erwarten einen Namenskonflikt. Das funktioniert bei " +
      "Enums genauso — jedes Enum ist gleichzeitig Wert und Typ.",
  },
  13: {
    whyCorrect:
      "String Enums haben kein Reverse Mapping. Das Objekt hat nur " +
      "einseitige Eintraege: 5 Mitglieder = 5 Keys.",
    commonMistake:
      "Erfahrene Entwickler die numerische Enums kennen, erwarten " +
      "10. Das Reverse Mapping existiert nur bei numerischen Enums.",
  },
  14: {
    whyCorrect:
      "`on${string}` akzeptiert jeden String mit dem Praefix 'on'. " +
      "${string} ist ein Wildcard — nicht begrenzt auf bestimmte Events.",
    commonMistake:
      "Manche denken, ${string} akzeptiert nur bekannte Event-Namen. " +
      "${string} ist voellig offen — es akzeptiert JEDEN String als Suffix.",
  },
};
