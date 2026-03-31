/**
 * Lektion 11 — Quiz-Daten: Type Narrowing
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "11";
export const lessonTitle = "Type Narrowing";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Grundkonzept ---
  {
    question: "Was ist Type Narrowing in TypeScript?",
    options: [
      "Das Umwandeln eines Typs in einen anderen mit 'as'",
      "Das Verengen eines Typs innerhalb eines Code-Blocks durch Checks",
      "Das Erstellen neuer Typen aus bestehenden",
      "Das Entfernen von Typen zur Laufzeit (Type Erasure)",
    ],
    correct: 1,
    explanation:
      "Type Narrowing ist der Prozess, bei dem TypeScript den Typ einer Variable " +
      "innerhalb eines Code-Blocks verengt — basierend auf Laufzeit-Checks wie " +
      "typeof, instanceof oder Equality. Es ist kein Type Casting (as).",
  },

  // --- Frage 2: typeof-Ergebnisse ---
  {
    question: "Welchen Wert gibt typeof null zurueck?",
    options: [
      '"null"',
      '"undefined"',
      '"object"',
      '"boolean"',
    ],
    correct: 2,
    explanation:
      'typeof null gibt "object" zurueck — ein beruehmt-beruechtigter Bug aus ' +
      "JavaScript 1.0 (1995). TypeScript beruecksichtigt das: Nach " +
      'typeof x === "object" ist der Typ object | null, nicht nur object.',
  },

  // --- Frage 3: typeof-Narrowing ---
  {
    question: "Welchen Typ hat 'wert' im else-Zweig?",
    options: [
      "string | number",
      "number",
      "string",
      "never",
    ],
    correct: 1,
    explanation:
      "Im if-Zweig wird string behandelt (typeof === 'string'). " +
      "Im else-Zweig bleibt nur number uebrig — TypeScript eliminiert " +
      "string aus dem Union Type.",
    code:
      "function f(wert: string | number) {\n" +
      "  if (typeof wert === 'string') {\n" +
      "    // wert: string\n" +
      "  } else {\n" +
      "    // wert: ???\n" +
      "  }\n" +
      "}",
  },

  // --- Frage 4: instanceof ---
  {
    question: "Warum funktioniert instanceof nicht mit Interfaces?",
    options: [
      "Interfaces haben keinen Prototyp — sie existieren nur zur Compilezeit",
      "instanceof funktioniert nur mit primitiven Typen",
      "Interfaces koennen nicht in instanceof-Ausdruecken verwendet werden (Syntax-Fehler)",
      "instanceof prueft nur den typeof-Wert",
    ],
    correct: 0,
    explanation:
      "Interfaces werden bei der Kompilierung entfernt (Type Erasure). " +
      "Zur Laufzeit gibt es kein Interface-Objekt, gegen das instanceof " +
      "pruefen koennte. instanceof braucht eine Klasse mit Prototyp-Kette.",
  },

  // --- Frage 5: in-Operator ---
  {
    question: "Was ist der Typ von 'form' nach dem in-Check?",
    options: [
      "Kreis | Rechteck",
      "Kreis",
      "Rechteck",
      "object",
    ],
    correct: 1,
    explanation:
      'Der in-Operator prueft ob "radius" auf dem Objekt existiert. ' +
      "Nur Kreis hat eine radius-Property, also narrowt TypeScript zu Kreis.",
    code:
      "interface Kreis { radius: number }\n" +
      "interface Rechteck { breite: number; hoehe: number }\n" +
      "type Form = Kreis | Rechteck;\n\n" +
      "function f(form: Form) {\n" +
      '  if ("radius" in form) {\n' +
      "    // form: ???\n" +
      "  }\n" +
      "}",
  },

  // --- Frage 6: Equality Narrowing ---
  {
    question: "Was passiert bei 'if (a === b)' wenn a: string | number und b: string | boolean?",
    options: [
      "Beide werden zu unknown",
      "Beide werden zu string (einziger gemeinsamer Typ)",
      "Nur a wird genarrowed",
      "TypeScript meldet einen Fehler",
    ],
    correct: 1,
    explanation:
      "Bei === analysiert TypeScript, welche Typen auf beiden Seiten " +
      "ueberlappen koennen. string ist der einzige gemeinsame Typ, " +
      "also werden BEIDE Seiten zu string genarrowed.",
  },

  // --- Frage 7: Truthiness-Falle ---
  {
    question: "Welche gueltige Portnummer wird von 'if (port)' faelschlicherweise ausgeschlossen?",
    options: [
      "1",
      "0",
      "80",
      "Keine — alle Zahlen sind truthy",
    ],
    correct: 1,
    explanation:
      "0 ist in JavaScript falsy! 'if (port)' schliesst Port 0 aus, " +
      "obwohl 0 ein gueltiger Port ist (OS waehlt einen freien Port). " +
      "Verwende 'if (port !== null && port !== undefined)' oder 'port ?? 3000'.",
    code: "function start(port: number | null) {\n  if (port) {\n    listen(port);\n  }\n}",
  },

  // --- Frage 8: != null ---
  {
    question: "Was prueft 'x != null' in TypeScript?",
    options: [
      "Nur ob x nicht null ist",
      "Ob x nicht null UND nicht undefined ist",
      "Ob x truthy ist",
      "Ob x ein Objekt ist",
    ],
    correct: 1,
    explanation:
      "Die lose Gleichheit (==) behandelt null und undefined als gleich: " +
      "null == undefined ist true. Daher prueft 'x != null' auf BEIDES. " +
      "Das ist einer der wenigen guten Anwendungsfaelle fuer ==.",
  },

  // --- Frage 9: Type Predicate ---
  {
    question: "Was bedeutet der Rueckgabetyp 'x is string'?",
    options: [
      "Die Funktion gibt einen String zurueck",
      "Die Funktion wirft wenn x kein String ist",
      "Wenn die Funktion true zurueckgibt, ist x ein string",
      "x wird zur Laufzeit zu string konvertiert",
    ],
    correct: 2,
    explanation:
      "Ein Type Predicate (parameter is Type) sagt TypeScript: " +
      "'Wenn diese Funktion true zurueckgibt, hat parameter den Typ Type.' " +
      "TypeScript vertraut dir — es prueft nicht, ob deine Logik stimmt.",
  },

  // --- Frage 10: Assertion Function ---
  {
    question: "Was ist der Unterschied zwischen 'x is string' und 'asserts x is string'?",
    options: [
      "Kein Unterschied — beide sind Type Guards",
      "'is' gibt boolean zurueck, 'asserts' wirft einen Error oder gibt void zurueck",
      "'asserts' ist deprecated seit TS 5.0",
      "'is' funktioniert nur mit typeof, 'asserts' mit allem",
    ],
    correct: 1,
    explanation:
      "Type Guards (is) geben boolean zurueck und werden in if-Bedingungen genutzt. " +
      "Assertion Functions (asserts) geben void zurueck oder werfen einen Error. " +
      "Der Vorteil: asserts narrowt den gesamten restlichen Scope, nicht nur einen if-Block.",
  },

  // --- Frage 11: TS 5.5 Inferred Type Predicates ---
  {
    question: "Was ist der Typ von 'result' in diesem Code (TS 5.5+)?",
    options: [
      "(string | null)[]",
      "string[]",
      "(string | undefined)[]",
      "unknown[]",
    ],
    correct: 1,
    explanation:
      "Ab TypeScript 5.5 erkennt der Compiler automatisch, dass " +
      "filter(x => x !== null) ein Type Predicate ist. Der Ergebnis-Typ " +
      "ist string[] — null wird automatisch entfernt. Vorher war es " +
      "(string | null)[] und man musste manuell casten.",
    code:
      "const items: (string | null)[] = ['a', null, 'b'];\n" +
      "const result = items.filter(x => x !== null);\n" +
      "// Typ von result in TS 5.5+?",
  },

  // --- Frage 12: never und Exhaustive Checks ---
  {
    question: "Was passiert wenn du einen neuen Wert zum Union hinzufuegst aber keinen case?",
    options: [
      "Kein Fehler — der default faengt alles ab",
      "Laufzeit-Fehler bei dem neuen Wert",
      "Compile-Fehler: Der neue Wert ist nicht 'never' zuweisbar",
      "TypeScript ignoriert den neuen Wert",
    ],
    correct: 2,
    explanation:
      "Wenn ein neuer Wert zum Union kommt und kein case dafuer existiert, " +
      "hat die Variable im default NICHT den Typ never — sondern den neuen Wert. " +
      "Die Zuweisung an never schlaegt fehl, und TypeScript meldet den Fehler " +
      "mit dem genauen Typ der fehlt.",
    code:
      "type T = 'a' | 'b' | 'c';\n" +
      "function f(x: T) {\n" +
      "  switch (x) {\n" +
      "    case 'a': return 1;\n" +
      "    case 'b': return 2;\n" +
      "    // case 'c' fehlt!\n" +
      "    default: const _: never = x; // Fehler?\n" +
      "  }\n" +
      "}",
  },

  // --- Frage 13: assertNever ---
  {
    question: "Warum ist assertNever besser als ein leerer default-Zweig?",
    options: [
      "assertNever ist schneller",
      "assertNever gibt Compile-Schutz UND Laufzeit-Schutz",
      "assertNever ist die einzige Moeglichkeit fuer exhaustive Checks",
      "assertNever wird von ESLint erzwungen",
    ],
    correct: 1,
    explanation:
      "assertNever bietet ZWEI Sicherheitsnetze: (1) Compile-Fehler wenn ein " +
      "Fall im Union fehlt, (2) Laufzeit-Error wenn ein unerwarteter Wert " +
      "(z.B. von einer API) durchkommt. Ein leerer default bietet keins von beidem.",
  },

  // --- Frage 14: Control Flow Analysis ---
  {
    question: "Welchen Typ hat 'x' nach dem return-Statement?",
    options: [
      "string | null",
      "null",
      "string",
      "never",
    ],
    correct: 2,
    explanation:
      "Nach dem early return (if x === null) weiss TypeScript: Wenn wir " +
      "weiter im Code sind, kann x nicht null sein. Also: string. " +
      "Das ist 'Narrowing by Elimination' — die Grundlage von CFA.",
    code:
      "function f(x: string | null) {\n" +
      "  if (x === null) return;\n" +
      "  // x hat hier welchen Typ?\n" +
      "}",
  },

  // --- Frage 15: Narrowing vs. as ---
  {
    question: "Was ist der fundamentale Unterschied zwischen Narrowing und 'as' (Type Assertion)?",
    options: [
      "Narrowing ist langsamer weil es Laufzeit-Checks macht",
      "Narrowing ist ein Beweis (Laufzeit-Check), as ist ein Versprechen (kein Check)",
      "as funktioniert nur mit primitiven Typen",
      "Narrowing funktioniert nur in if-Statements",
    ],
    correct: 1,
    explanation:
      "Narrowing fuehrt einen echten Laufzeit-Check durch und BEWEIST dem Compiler " +
      "den Typ. 'as' ist ein Versprechen an den Compiler ohne Laufzeit-Pruefung. " +
      "Wenn das Versprechen falsch ist, crasht der Code zur Laufzeit. " +
      "Narrowing kann nie falsch sein — es ist immer sicher.",
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Narrowing verengt einen Union Type in einem Block. TypeScript's " +
      "Control Flow Analysis erkennt typeof, instanceof, in, === und " +
      "andere Checks und passt den Typ automatisch an.",
    commonMistake:
      "Viele verwechseln Narrowing mit Type Assertions (as). " +
      "as ist kein Narrowing — es ueberspringt die Pruefung.",
  },
  1: {
    whyCorrect:
      'typeof null gibt "object" zurueck — ein historischer Bug. ' +
      "TypeScript beruecksichtigt das und narrowt nach typeof === 'object' " +
      "zu object | null, nicht nur object.",
    commonMistake:
      "Viele vergessen den null-Check nach typeof === 'object' und " +
      "greifen auf Properties zu, was bei null crasht.",
  },
  2: {
    whyCorrect:
      "TypeScript eliminiert string aus dem Union (wurde im if behandelt). " +
      "Im else bleibt nur number uebrig. Das ist kumulatives Narrowing.",
    commonMistake:
      "Manche denken, der Typ im else waere immer noch string | number. " +
      "Aber TypeScript merkt sich, was im if bereits behandelt wurde.",
  },
  3: {
    whyCorrect:
      "Interfaces werden durch Type Erasure entfernt. Zur Laufzeit gibt " +
      "es kein Interface-Objekt. instanceof braucht eine Klasse mit Prototyp.",
    commonMistake:
      "Aus Java/C# kommend erwarten viele, dass instanceof auch mit " +
      "Interfaces funktioniert. In TypeScript muss man stattdessen " +
      "den in-Operator oder Custom Type Guards verwenden.",
  },
  4: {
    whyCorrect:
      "Der in-Operator prueft ob eine Property existiert. Nur Kreis hat " +
      "radius, also narrowt TypeScript den Typ zu Kreis.",
    commonMistake:
      "Manche denken, in prueft den Wert der Property. Es prueft nur " +
      "die EXISTENZ — auch undefined-Properties werden gefunden.",
  },
  5: {
    whyCorrect:
      "Bei === analysiert TypeScript den Schnittpunkt der Typen beider " +
      "Seiten. Der einzige Typ der sowohl in string | number als auch " +
      "in string | boolean vorkommt, ist string.",
    commonMistake:
      "Viele denken, nur eine Seite wird genarrowed. Tatsaechlich " +
      "werden BEIDE Seiten auf den gemeinsamen Typ eingeschraenkt.",
  },
  6: {
    whyCorrect:
      "0 ist in JavaScript falsy. if (port) schliesst 0 aus, obwohl " +
      "Port 0 gueltig ist. Verwende port != null oder port ?? 3000.",
    commonMistake:
      "Die Truthiness-Falle ist einer der haeufigsten Bugs. " +
      "Viele verwenden if (x) als Kurzform fuer null-Checks, " +
      "vergessen aber dass 0, '' und false auch falsy sind.",
  },
  7: {
    whyCorrect:
      "In JavaScript gilt null == undefined als true (lose Gleichheit). " +
      "x != null prueft daher sowohl auf null als auch undefined.",
    commonMistake:
      "Manche denken, != null prueft nur auf null. Es prueft auf beides " +
      "dank der speziellen Regel von == fuer null und undefined.",
  },
  8: {
    whyCorrect:
      "Ein Type Predicate ist ein Vertrag: 'Wenn true, dann ist x vom Typ T.' " +
      "TypeScript vertraut dem Vertrag und narrowt entsprechend.",
    commonMistake:
      "Viele denken, TypeScript PRUEFT ob der Type Guard korrekt ist. " +
      "Das tut es NICHT — du bist verantwortlich fuer die Korrektheit.",
  },
  9: {
    whyCorrect:
      "'is' gibt boolean zurueck (if-Bedingung). 'asserts' gibt void zurueck " +
      "oder wirft (Vorbedingung). asserts narrowt den gesamten Scope.",
    commonMistake:
      "Viele verwechseln wann man welches verwendet. is: wenn der Aufrufer " +
      "entscheiden soll. asserts: wenn der Fehler-Fall ein Error sein soll.",
  },
  10: {
    whyCorrect:
      "TS 5.5 erkennt filter(x => x !== null) automatisch als Type Predicate. " +
      "Vorher musste man manuell (x): x is string => x !== null schreiben.",
    commonMistake:
      "Manche denken, das haette immer funktioniert. Vor TS 5.5 war der " +
      "Typ nach filter immer noch (string | null)[] — ein haeufiger Frust-Punkt.",
  },
  11: {
    whyCorrect:
      "Wenn ein Fall fehlt, ist die Variable im default nicht never, sondern " +
      "der fehlende Typ. Die Zuweisung an never schlaegt fehl — Compile-Fehler.",
    commonMistake:
      "Manche denken, assertNever feuert nur zur Laufzeit. Der Hauptvorteil " +
      "ist der COMPILE-Fehler — er zeigt genau welcher Fall fehlt.",
  },
  12: {
    whyCorrect:
      "assertNever bietet Compile-Schutz (fehlender Fall) UND Laufzeit-Schutz " +
      "(unerwarteter Wert von API). Doppeltes Sicherheitsnetz.",
    commonMistake:
      "Manche lassen den default-Zweig einfach weg. Das gibt keinen " +
      "Compile-Fehler bei fehlenden Faellen und keinen Laufzeit-Schutz.",
  },
  13: {
    whyCorrect:
      "Early return eliminiert null aus dem Union. Danach kann x nicht " +
      "mehr null sein — TypeScript's CFA erkennt das automatisch.",
    commonMistake:
      "Manche denken, man muss nach dem return nochmal pruefen. " +
      "TypeScript merkt sich: wenn wir hier ankommen, wurde null schon eliminiert.",
  },
  14: {
    whyCorrect:
      "Narrowing macht einen Laufzeit-Check und beweist den Typ. " +
      "as ueberspringt den Check — wenn es falsch ist, crasht es.",
    commonMistake:
      "Viele benutzen as aus Bequemlichkeit statt Narrowing. " +
      "Das ist wie ein Versprechen ohne Beweis — gefaehrlich.",
  },
};
