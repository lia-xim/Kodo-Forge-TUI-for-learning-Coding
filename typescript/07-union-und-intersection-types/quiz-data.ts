/**
 * Lektion 07 — Quiz-Daten: Union & Intersection Types
 *
 * 15 Fragen zu | Operator, Type Guards, Discriminated Unions,
 * & Operator, Union vs Intersection, Praxis-Patterns.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "07";
export const lessonTitle = "Union & Intersection Types";

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const questions: QuizQuestion[] = [
  // --- Frage 1: Union Basics ---
  {
    question: "Welche Operationen sind auf `string | number` erlaubt?",
    options: [
      "Alle string-Methoden UND alle number-Methoden",
      "Nur Operationen die BEIDE Typen gemeinsam haben",
      "Keine Operationen — man muss erst narrowen",
      "Nur typeof-Checks",
    ],
    correct: 1,
    explanation:
      "Bei einem Union Type erlaubt TypeScript nur Operationen die fuer ALLE " +
      "Mitglieder des Unions sicher sind. toString() geht, aber toUpperCase() " +
      "nicht — denn number hat kein toUpperCase(). Man muss erst narrowen.",
  },

  // --- Frage 2: typeof Narrowing ---
  {
    question: "Was ist der Typ von `x` nach `if (typeof x === 'string')`?",
    code: "function f(x: string | number) {\n  if (typeof x === 'string') {\n    // x ist ???\n  }\n}",
    options: [
      "string",
      "string | number",
      "unknown",
      "any",
    ],
    correct: 0,
    explanation:
      "TypeScript's Control Flow Analysis verengt den Typ automatisch. " +
      "Nach typeof x === 'string' weiss TypeScript, dass x ein string sein MUSS. " +
      "Das nennt man Type Narrowing.",
  },

  // --- Frage 3: Discriminated Union ---
  {
    question: "Was ist eine Discriminated Union?",
    options: [
      "Ein Union von Primitives mit Literal Types",
      "Ein Union der automatisch diskriminiert wird",
      "Ein Union von Objekten mit einer gemeinsamen Tag-Property die den Typ identifiziert",
      "Ein Union mit mehr als 3 Mitgliedern",
    ],
    correct: 2,
    explanation:
      "Eine Discriminated Union besteht aus Objekt-Typen die eine gemeinsame " +
      "Tag-Property (Diskriminator) haben — z.B. { type: 'circle', radius: number } | " +
      "{ type: 'rect', width: number }. Der Tag identifiziert eindeutig welcher Typ vorliegt.",
  },

  // --- Frage 4: Exhaustive Check ---
  {
    question: "Was passiert wenn du den never-Trick im default-Case verwendest und ein neues Union-Mitglied hinzufuegst?",
    code: "function area(shape: Shape): number {\n  switch (shape.type) {\n    case 'circle': return ...;\n    case 'rect': return ...;\n    default: const _exhaustive: never = shape; // ???\n  }\n}",
    options: [
      "Nichts — der Code funktioniert weiter",
      "Laufzeit-Error im default-Case",
      "TypeScript ignoriert den never-Check",
      "Compile-Error: Das neue Mitglied ist nicht 'never' zuweisbar",
    ],
    correct: 3,
    explanation:
      "Wenn alle Cases behandelt sind, ist shape im default-Block 'never'. " +
      "Fuegst du ein neues Mitglied hinzu (z.B. 'triangle'), ist shape im " +
      "default-Block NICHT mehr never — und die Zuweisung an never scheitert. " +
      "Das zwingt dich, den neuen Case zu behandeln. Compile-Zeit-Sicherheitsnetz!",
  },

  // --- Frage 5: Intersection Basics ---
  {
    question: "Was ergibt `{ name: string } & { age: number }`?",
    options: [
      "Entweder name ODER age",
      "Ein Objekt das SOWOHL name als auch age haben MUSS",
      "Ein leeres Objekt",
      "never — die Typen sind inkompatibel",
    ],
    correct: 1,
    explanation:
      "Intersection Types (&) kombinieren alle Properties: Das Ergebnis-Objekt " +
      "muss ALLE Properties aus BEIDEN Typen haben. Es ist die Schnittmenge " +
      "der WERTE — ein Wert muss beide Typen gleichzeitig erfuellen.",
  },

  // --- Frage 6: Intersection-Konflikt ---
  {
    question: "Was ergibt `string & number`?",
    options: [
      "never — kein Wert ist gleichzeitig string UND number",
      "string | number",
      "any",
      "unknown",
    ],
    correct: 0,
    explanation:
      "Kein Wert kann gleichzeitig string UND number sein. Die Intersection " +
      "von inkompatiblen Primitives ergibt 'never' — den leeren Typ, der " +
      "keine Werte enthaelt.",
  },

  // --- Frage 7: in-Operator Narrowing ---
  {
    question: "Was passiert mit dem Typ nach `if ('email' in user)`?",
    code: "type User = { name: string } | { name: string; email: string };\nfunction f(user: User) {\n  if ('email' in user) { /* user ist ??? */ }\n}",
    options: [
      "User — unveraendert",
      "{ email: string } — nur die email-Property",
      "{ name: string; email: string } — der Typ mit email",
      "never",
    ],
    correct: 2,
    explanation:
      "Der 'in'-Operator verengt auf das Union-Mitglied das die " +
      "gepruefte Property hat. Nach 'email' in user weiss TypeScript, " +
      "dass user der Typ mit email sein muss.",
  },

  // --- Frage 8: TS 5.5 Inferred Type Predicates ---
  {
    question: "Was ist neu bei filter() in TypeScript 5.5+?",
    code: "const arr = [1, null, 2, null, 3];\nconst filtered = arr.filter(x => x !== null);",
    options: [
      "filter() existierte vorher nicht",
      "filter() gibt jetzt ein Set zurueck",
      "Nichts — man brauchte schon immer keinen Type Guard",
      "TypeScript inferiert automatisch den Type Guard — filtered ist number[]",
    ],
    correct: 3,
    explanation:
      "Ab TS 5.5 erkennt TypeScript automatisch Type Predicates in filter-Callbacks. " +
      "x => x !== null wird als Type Guard erkannt — filtered ist number[] statt " +
      "(number | null)[]. Vorher brauchte man einen expliziten Type Guard.",
  },

  // --- Frage 9: Union bei Werten vs Properties ---
  {
    question: "Was ist der Unterschied zwischen Union bei Werten und Properties?",
    options: [
      "Kein Unterschied",
      "Union macht die Wertemenge GROESSER aber die zugreifbaren Properties WENIGER",
      "Union macht beides groesser",
      "Union macht beides kleiner",
    ],
    correct: 1,
    explanation:
      "Union Types machen die Wertemenge GROESSER (mehr Werte passen), " +
      "aber die zugreifbaren Properties WENIGER (nur gemeinsame Properties). " +
      "Intersection ist das Gegenteil: WENIGER Werte passen, aber MEHR Properties " +
      "sind zugreifbar.",
  },

  // --- Frage 10: extends vs & ---
  {
    question: "Was ist der Hauptunterschied zwischen `interface B extends A` und `type B = A & Extra`?",
    options: [
      "Kein Unterschied",
      "extends funktioniert nur mit Klassen",
      "extends ist schneller fuer den Compiler und meldet Konflikte als Fehler",
      "& ist veraltet seit TS 5.0",
    ],
    correct: 2,
    explanation:
      "extends ist fuer den Compiler effizienter und meldet Property-Konflikte " +
      "direkt als Fehler. & erzeugt bei Konflikten stillschweigend 'never'-Properties. " +
      "Fuer Objekt-Erweiterung ist extends besser, & fuer Ad-hoc-Kombinationen.",
  },

  // --- Frage 11: Literal Union ---
  {
    question: "Welcher Typ ist praeziser und sicherer?",
    code: "type A = string;\ntype B = 'GET' | 'POST' | 'PUT' | 'DELETE';",
    options: [
      "A — akzeptiert mehr Werte",
      "Beide gleich — TypeScript behandelt sie identisch",
      "A — weniger Tippaufwand",
      "B — nur gueltige HTTP-Methoden erlaubt, Autocomplete inklusive",
    ],
    correct: 3,
    explanation:
      "Literal Unions wie 'GET' | 'POST' | 'PUT' | 'DELETE' sind praeziser " +
      "als string. Sie erlauben nur gueltige Werte, bieten IDE-Autocomplete, " +
      "und fangen Tippfehler zur Compilezeit ab.",
  },

  // --- Frage 12: Truthiness Narrowing ---
  {
    question: "Was ist der Typ von `name` nach `if (name)`?",
    code: "function f(name: string | null | undefined) {\n  if (name) {\n    // name ist ???\n  }\n}",
    options: [
      "string — null, undefined und '' sind falsy",
      "string | null | undefined",
      "string | null",
      "unknown",
    ],
    correct: 0,
    explanation:
      "Truthiness-Check entfernt alle falsy-Werte: null, undefined, '' (leerer String), " +
      "0 und false. Nach if (name) ist name vom Typ string. " +
      "Achtung: Auch der leere String '' wird gefiltert!",
  },

  // --- Frage 13: Result-Pattern ---
  {
    question: "Was ist das Result-Pattern?",
    code: "type Result<T> = { success: true; data: T } | { success: false; error: string };",
    options: [
      "Ein Pattern fuer asynchrone Operationen",
      "Eine Discriminated Union die Erfolg und Fehler typsicher modelliert",
      "Ein Design Pattern aus Java",
      "Ein Pattern nur fuer API-Responses",
    ],
    correct: 1,
    explanation:
      "Das Result-Pattern ist eine Discriminated Union mit 'success' als Diskriminator. " +
      "Bei success: true existiert data, bei success: false existiert error. " +
      "TypeScript verengt den Typ automatisch nach dem Check — typsicheres Error-Handling.",
  },

  // --- Frage 14: Distributives Verhalten ---
  {
    question: "Was ergibt `(A | B) & C` bei Objekt-Typen?",
    options: [
      "(A & C) | (B & C) — distributiv",
      "A | B | C",
      "never",
      "(A | B) & C — bleibt unveraendert",
    ],
    correct: 0,
    explanation:
      "Intersection verteilt sich ueber Union (distributives Gesetz): " +
      "(A | B) & C = (A & C) | (B & C). Jedes Union-Mitglied wird " +
      "einzeln mit C kombiniert. Das ist ein mathematisches Gesetz " +
      "aus der Mengenlehre.",
  },

  // --- Frage 15: State Machine Pattern ---
  {
    question: "Warum sind Discriminated Unions ideal fuer State Machines?",
    options: [
      "Weil sie schneller sind als Klassen",
      "Weil State Machines immer genau 2 Zustaende haben",
      "Weil der Compiler ungueltige Zustaende und fehlende State-Behandlung verhindert",
      "Weil TypeScript State Machines nativ unterstuetzt",
    ],
    correct: 2,
    explanation:
      "Discriminated Unions modellieren Zustaende als eigene Typen mit " +
      "zustandsspezifischen Properties. Der Compiler verhindert Zugriff auf " +
      "Properties die im aktuellen Zustand nicht existieren und der " +
      "Exhaustive Check stellt sicher, dass ALLE Zustaende behandelt werden.",
  },
];

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Bei Unions sind nur gemeinsame Operationen sicher. TypeScript " +
      "muss fuer JEDEN moeglichen Typ des Unions sicherstellen, " +
      "dass die Operation existiert.",
    commonMistake:
      "Viele denken, ein Union gibt Zugang zu ALLEN Methoden beider Typen. " +
      "Das Gegenteil ist wahr — nur die Schnittmenge der Methoden.",
  },
  1: {
    whyCorrect:
      "Control Flow Analysis verfolgt den Typ durch if/else-Bloecke. " +
      "typeof === 'string' verengt string | number auf string.",
    commonMistake:
      "Manche erwarten, dass der Typ unveraendert bleibt. TypeScript " +
      "analysiert den Kontrollfluss und verengt automatisch.",
  },
  2: {
    whyCorrect:
      "Die Tag-Property (z.B. type: 'circle') identifiziert eindeutig " +
      "welcher Typ vorliegt. TypeScript erkennt das und verengt automatisch.",
    commonMistake:
      "Viele verwechseln Discriminated Unions mit normalen Unions. " +
      "Der Schluessel ist die gemeinsame Tag-Property mit Literal-Typen.",
  },
  3: {
    whyCorrect:
      "Wenn alle Cases behandelt sind, ist der Typ im default-Block 'never'. " +
      "Ein neues Mitglied bricht diesen Zustand — Compile-Zeit-Warnung.",
    commonMistake:
      "Manche denken, der never-Check ist optional. Er ist das wichtigste " +
      "Sicherheitsnetz bei Discriminated Unions.",
  },
  4: {
    whyCorrect:
      "Intersection kombiniert alle Properties. Ein Wert muss ALLE Typen " +
      "gleichzeitig erfuellen — das ist die Schnittmenge der Werte.",
    commonMistake:
      "Die Intuition 'Schnittmenge' fuehrt in die Irre: Es ist die " +
      "Schnittmenge der WERTE, nicht der Properties. Mehr Properties " +
      "= weniger gueltige Werte.",
  },
  5: {
    whyCorrect:
      "Kein Wert kann gleichzeitig string UND number sein. " +
      "Die Intersection inkompatiblen Primitives ergibt never.",
    commonMistake:
      "Einige erwarten string | number als Ergebnis. " +
      "& ist nicht | — es ist UND, nicht ODER.",
  },
  6: {
    whyCorrect:
      "Der in-Operator verengt auf das Union-Mitglied das die Property hat. " +
      "TypeScript erkennt welche Mitglieder die Property deklarieren.",
    commonMistake:
      "Manche verwechseln in-Narrowing mit typeof-Narrowing. " +
      "in prueft Properties, typeof prueft Primitive.",
  },
  7: {
    whyCorrect:
      "TS 5.5 erkennt automatisch Type Predicates in filter-Callbacks. " +
      "x => x !== null wird als (x): x is NonNullable<T> erkannt.",
    commonMistake:
      "Vor TS 5.5 brauchte man einen expliziten Type Guard oder einen Cast. " +
      "Viele kennen das neue Feature noch nicht.",
  },
  8: {
    whyCorrect:
      "Union = mehr Werte, weniger Properties. " +
      "Intersection = weniger Werte, mehr Properties. " +
      "Das ist das duale Verhaeltnis.",
    commonMistake:
      "Die Intuition ist umgekehrt: 'Union = vereinigen = mehr Properties'. " +
      "Falsch! Union vereinigt die WERTE, nicht die Properties.",
  },
  9: {
    whyCorrect:
      "extends ist statisch aufloesbar und meldet Konflikte. " +
      "& erzeugt bei Konflikten never-Properties ohne Warnung.",
    commonMistake:
      "Viele denken extends und & sind austauschbar. " +
      "extends ist fuer den Compiler besser optimierbar.",
  },
  10: {
    whyCorrect:
      "Literal Unions erlauben nur gueltige Werte und bieten " +
      "IDE-Autocomplete. Tippfehler werden zur Compilezeit erkannt.",
    commonMistake:
      "Manche bevorzugen string weil es 'einfacher' ist. " +
      "Aber string akzeptiert auch Tippfehler — 'GETT' waere gueltig.",
  },
  11: {
    whyCorrect:
      "Truthiness entfernt null, undefined, '', 0, false und NaN. " +
      "Nach if (name) ist name garantiert ein nicht-leerer string.",
    commonMistake:
      "Viele vergessen, dass '' (leerer String) auch falsy ist. " +
      "Truthiness-Narrowing filtert MEHR als nur null/undefined.",
  },
  12: {
    whyCorrect:
      "Das Result-Pattern nutzt Discriminated Unions: success " +
      "als Tag bestimmt ob data oder error existiert.",
    commonMistake:
      "Manche verwechseln es mit try/catch. Das Result-Pattern " +
      "ist eine Alternative die Fehler explizit im Typsystem modelliert.",
  },
  13: {
    whyCorrect:
      "Intersection verteilt sich ueber Union — das distributive Gesetz. " +
      "Jedes Union-Mitglied wird einzeln mit dem Intersection-Typ kombiniert.",
    commonMistake:
      "Viele erwarten, dass (A | B) & C einfach 'flach' bleibt. " +
      "Die distributive Aufloesung ist wichtig fuer die Typ-Analyse.",
  },
  14: {
    whyCorrect:
      "Discriminated Unions modellieren Zustaende mit zustandsspezifischen " +
      "Properties. Der Compiler verhindert ungueltige Zugriffe und " +
      "der Exhaustive Check erzwingt Vollstaendigkeit.",
    commonMistake:
      "Manche modellieren State Machines mit optionalen Properties " +
      "statt Discriminated Unions. Das verliert die Typsicherheit.",
  },
};
