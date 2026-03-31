/**
 * Lektion 06 — Quiz-Daten: Functions
 *
 * 15 Fragen zu Parameter-Typen, Return-Typen, Overloads, Callbacks,
 * this-Parameter, Arrow vs Function, Type Guards, Assertion Functions.
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "06";
export const lessonTitle = "Functions";

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const questions: QuizQuestion[] = [
  // --- Frage 1: Return-Typ-Inference ---
  {
    question: "Muss man den Return-Typ einer rekursiven Funktion explizit angeben?",
    options: [
      "Nein, TypeScript inferiert ihn wie bei jeder Funktion",
      "Ja, weil TypeScript den Typ nicht aus einem Zirkelbezug ableiten kann",
      "Nur wenn die Funktion exportiert wird",
      "Nur bei mehr als einem rekursiven Aufruf",
    ],
    correct: 1,
    explanation:
      "Bei rekursiven Funktionen entsteht ein Zirkelproblem: Der Return-Typ " +
      "haengt vom Rueckgabewert ab, der den Aufruf der Funktion selbst enthaelt. " +
      "TypeScript kann diesen Zirkel nicht aufloesen und verlangt eine explizite Annotation.",
  },

  // --- Frage 2: void vs undefined ---
  {
    question: "Was ist der Unterschied zwischen `void` und `undefined` als Return-Typ?",
    options: [
      "void bedeutet 'Rueckgabewert irrelevant', undefined bedeutet 'gibt konkret undefined zurueck'",
      "Kein Unterschied — beide bedeuten 'kein Rueckgabewert'",
      "undefined ist veraltet, void ist die moderne Variante",
      "void ist fuer Callbacks, undefined fuer normale Funktionen",
    ],
    correct: 0,
    explanation:
      "void sagt 'der Rueckgabewert ist irrelevant' — besonders wichtig bei Callbacks, " +
      "wo void-Callbacks trotzdem Werte zurueckgeben duerfen. undefined ist ein konkreter " +
      "Wert-Typ. Eine Variable vom Typ void kann NICHT an undefined zugewiesen werden.",
  },

  // --- Frage 3: Optionale Parameter ---
  {
    question: "Was ist der Unterschied zwischen `x?: string` und `x: string | undefined`?",
    options: [
      "Kein Unterschied",
      "x?: string akzeptiert auch null",
      "Bei x?: string kann man das Argument weglassen, bei x: string | undefined muss man es uebergeben",
      "x: string | undefined ist nur in Interfaces erlaubt",
    ],
    correct: 2,
    explanation:
      "Bei x?: string kann der Aufrufer das Argument komplett weglassen: f(). " +
      "Bei x: string | undefined MUSS man es uebergeben: f(undefined). " +
      "Beide machen x intern zu string | undefined, aber die Aufrufsignatur unterscheidet sich.",
  },

  // --- Frage 4: Default-Parameter ---
  {
    question: "Was passiert bei `function f(x?: number = 42) {}`?",
    options: [
      "x hat den Typ number und den Default 42",
      "x hat den Typ number | undefined",
      "Compile-Error: Parameter darf nicht gleichzeitig optional und Default haben",
      "x hat den Typ 42 (Literal Type)",
    ],
    correct: 2,
    explanation:
      "Ein Parameter kann nicht gleichzeitig `?` (optional) und einen Default-Wert haben. " +
      "Ein Default-Wert macht den Parameter automatisch optional — das `?` ist redundant " +
      "und TypeScript verbietet die Kombination.",
  },

  // --- Frage 5: Rest-Parameter ---
  {
    question: "Welchen Typ hat `args` in `function log(...args: string[])`?",
    options: [
      "string",
      "...string[]",
      "Array<string> | string",
      "string[]",
    ],
    correct: 3,
    explanation:
      "Rest-Parameter sammeln alle uebergebenen Argumente in ein Array. " +
      "Der Typ von args ist string[] — ein normales Array. Die Spread-Syntax " +
      "(...) ist Teil der Parameter-Deklaration, nicht des Typs.",
  },

  // --- Frage 6: Function Type Expression ---
  {
    question: "Muessen die Parameternamen im Function Type mit der Implementation uebereinstimmen?",
    code: "type Formatter = (input: string) => string;\nconst shout: Formatter = (text) => text.toUpperCase();",
    options: [
      "Ja, 'text' muss 'input' heissen",
      "Nein, nur die Typen muessen uebereinstimmen, Namen sind egal",
      "Ja, ausser bei Arrow Functions",
      "Nur bei exportierten Funktionen",
    ],
    correct: 1,
    explanation:
      "Parameternamen in Function Type Expressions sind nur Dokumentation — sie muessen " +
      "nicht mit der Implementation uebereinstimmen. TypeScript prueft nur die " +
      "Typ-Kompatibilitaet (Parametertypen und Return-Typ).",
  },

  // --- Frage 7: Overload-Signatur ---
  {
    question: "Kann ein Aufrufer die Implementation Signature einer ueberladenen Funktion direkt aufrufen?",
    code: "function format(x: string): string;\nfunction format(x: number): string;\nfunction format(x: string | number): string { return String(x); }\n\nformat(true); // ???",
    options: [
      "Nein, die Implementation Signature ist fuer Aufrufer unsichtbar",
      "Ja, die Implementation akzeptiert string | number also auch boolean",
      "Ja, wenn man explizit castet",
      "Nur innerhalb desselben Moduls",
    ],
    correct: 0,
    explanation:
      "Die Implementation Signature ist fuer Aufrufer unsichtbar. Nur die Overload-Signaturen " +
      "definieren, wie die Funktion aufgerufen werden kann. format(true) scheitert, " +
      "weil kein Overload boolean akzeptiert — obwohl die Implementation theoretisch " +
      "string | number enthaelt.",
  },

  // --- Frage 8: Overload-Reihenfolge ---
  {
    question: "In welcher Reihenfolge sollte man Overload-Signaturen schreiben?",
    options: [
      "Breiteste zuerst, spezifischste zuletzt",
      "Die Reihenfolge ist egal",
      "Spezifischste zuerst, breiteste zuletzt",
      "Alphabetisch nach Parametertyp",
    ],
    correct: 2,
    explanation:
      "TypeScript prueft Overloads von oben nach unten und nimmt den ersten Treffer. " +
      "Spezifische Overloads muessen VOR breiteren stehen, sonst wuerde der breite " +
      "Overload zuerst matchen und den spezifischen Typ verschlucken.",
  },

  // --- Frage 9: void-Callback ---
  {
    question: "Kompiliert dieser Code?",
    code: "type VoidCallback = () => void;\nconst fn: VoidCallback = () => 42;",
    options: [
      "Nein, 42 ist nicht void",
      "Nur mit explizitem return",
      "Nur wenn VoidCallback als Interface definiert ist",
      "Ja, void-Callbacks duerfen Werte zurueckgeben — der Wert wird ignoriert",
    ],
    correct: 3,
    explanation:
      "Void-Callbacks sind absichtlich tolerant: Sie duerfen Werte zurueckgeben. " +
      "Das basiert auf dem Substitutability Principle — eine Funktion die 'mehr' " +
      "kann (Wert zurueckgibt) ist ueberall nutzbar wo 'weniger' erwartet wird. " +
      "Ohne diese Regel waere forEach(n => arr.push(n)) ein Fehler.",
  },

  // --- Frage 10: void bei Deklaration ---
  {
    question: "Kompiliert `function doSomething(): void { return 42; }`?",
    options: [
      "Nein, bei direkter Funktionsdeklaration ist void STRENG",
      "Ja, void erlaubt beliebige Rueckgabewerte",
      "Ja, aber nur in strict mode",
      "Nein, void-Funktionen duerfen kein return haben",
    ],
    correct: 0,
    explanation:
      "Bei DIREKTEN Funktionsdeklarationen ist void streng — return 42 ist ein Fehler. " +
      "Nur bei Callback-Typen (z.B. type Cb = () => void) ist void tolerant. " +
      "Der Unterschied: Bei Deklarationen kontrollierst DU den Return-Typ, " +
      "bei Callbacks definiert jemand ANDERES die Schnittstelle.",
  },

  // --- Frage 11: this-Parameter ---
  {
    question: "Was passiert mit dem this-Parameter zur Laufzeit?",
    code: "function greet(this: { name: string }): string {\n  return `Hallo, ${this.name}`;\n}",
    options: [
      "Er wird als normaler erster Parameter uebergeben",
      "Er wird zu einem Property auf dem Funktions-Objekt",
      "Er wird in einen Closure umgewandelt",
      "Er verschwindet komplett (Type Erasure)",
    ],
    correct: 3,
    explanation:
      "Der this-Parameter ist ein reines Compilezeit-Feature. Durch Type Erasure " +
      "verschwindet er im kompilierten JavaScript komplett. Er dient nur dazu, " +
      "TypeScript den Typ von this mitzuteilen — ohne Laufzeit-Overhead.",
  },

  // --- Frage 12: Arrow vs regulaere Funktion ---
  {
    question: "Warum erben Arrow Functions `this` vom umgebenden Scope?",
    options: [
      "Weil sie einen versteckten this-Parameter haben",
      "Weil sie kein eigenes this binden — this wird lexikalisch aufgeloest",
      "Weil sie automatisch .bind(this) aufrufen",
      "Weil Arrow Functions immer im strict mode laufen",
    ],
    correct: 1,
    explanation:
      "Arrow Functions haben kein eigenes this-Binding. Stattdessen wird this " +
      "lexikalisch aufgeloest — es kommt vom umgebenden Scope. Das ist der " +
      "Hauptgrund fuer ihre Einfuehrung in ES2015: Das this-Problem zu loesen.",
  },

  // --- Frage 13: Type Guard ---
  {
    question: "Was bedeutet `value is string` als Return-Typ einer Funktion?",
    code: "function isString(value: unknown): value is string {\n  return typeof value === 'string';\n}",
    options: [
      "Wenn die Funktion true gibt, weiss TypeScript dass value ein string ist",
      "Die Funktion gibt einen String zurueck",
      "Die Funktion wirft einen Error wenn value kein string ist",
      "value wird zur Laufzeit in einen String konvertiert",
    ],
    correct: 0,
    explanation:
      "Ein Type Guard mit 'value is Type' sagt TypeScript: 'Wenn diese Funktion " +
      "true zurueckgibt, ist value von diesem Typ.' Der Compiler vertraut dem Guard " +
      "und verengt den Typ nach einem if-Check automatisch. Achtung: TypeScript " +
      "prueft NICHT, ob der Guard korrekt implementiert ist!",
  },

  // --- Frage 14: Assertion Function ---
  {
    question: "Was ist der Unterschied zwischen einem Type Guard und einer Assertion Function?",
    options: [
      "Kein Unterschied, nur andere Syntax",
      "Type Guard ist fuer Primitives, Assertion Function fuer Objekte",
      "Type Guard gibt boolean zurueck (if-Verzweigung), Assertion Function wirft bei Misserfolg",
      "Assertion Functions existieren erst ab TS 5.0",
    ],
    correct: 2,
    explanation:
      "Ein Type Guard gibt boolean zurueck — der Aufrufer entscheidet mit if/else. " +
      "Eine Assertion Function (asserts value is T) wirft einen Error bei Misserfolg — " +
      "der Code danach laeuft nur bei Erfolg. Type Guards fuer Verzweigungen, " +
      "Assertion Functions fuer Garantien.",
  },

  // --- Frage 15: Currying ---
  {
    question: "Was gibt `curriedAdd(5)` zurueck?",
    code: "function curriedAdd(a: number): (b: number) => number {\n  return (b) => a + b;\n}",
    options: [
      "5",
      "Eine Funktion vom Typ (b: number) => number",
      "NaN",
      "undefined",
    ],
    correct: 1,
    explanation:
      "Currying gibt eine neue Funktion zurueck, die den naechsten Parameter erwartet. " +
      "curriedAdd(5) gibt (b: number) => number zurueck — eine Funktion die 5 + b " +
      "berechnet. TypeScript inferiert alle Zwischentypen automatisch.",
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Rekursive Funktionen erzeugen einen Zirkelbezug: Der Return-Typ " +
      "haengt vom Rueckgabewert ab, der den Aufruf derselben Funktion enthaelt. " +
      "Der Compiler braucht den Typ den er gerade bestimmen will.",
    commonMistake:
      "Viele denken, TypeScript kann rekursive Typen immer aufloesen. " +
      "Bei Typ-Definitionen (type Tree = ...) geht das, bei Return-Typ-Inference nicht.",
  },
  1: {
    whyCorrect:
      "void = Rueckgabewert irrelevant (Callback-Kompatibilitaet). " +
      "undefined = konkreter Wert. void bei Side-Effect-Funktionen, " +
      "undefined wenn der Aufrufer den Wert braucht.",
    commonMistake:
      "Die meisten behandeln void und undefined als synonym. " +
      "Der Unterschied wird erst bei Callbacks relevant, wo void-Callbacks " +
      "Werte zurueckgeben duerfen.",
  },
  2: {
    whyCorrect:
      "x?: string macht das Argument weglassbar: f(). " +
      "x: string | undefined erzwingt ein Argument: f(undefined). " +
      "Beide ergeben intern string | undefined, aber die Aufrufseite unterscheidet sich.",
    commonMistake:
      "Viele halten beide Schreibweisen fuer identisch. " +
      "Der Unterschied liegt in der Aufrufsignatur, nicht im internen Typ.",
  },
  3: {
    whyCorrect:
      "Ein Default-Wert macht den Parameter automatisch optional — " +
      "das ? ist redundant. TypeScript verbietet die Kombination " +
      "um Verwirrung zu vermeiden.",
    commonMistake:
      "Manche denken, ? + Default gibt dem Parameter zwei 'Schichten' " +
      "von Optionalitaet. In Wahrheit ist beides dasselbe.",
  },
  4: {
    whyCorrect:
      "Rest-Parameter sammeln alle uebergebenen Argumente in ein echtes Array. " +
      "Der Typ ist string[] — die Spread-Syntax ist Teil der Deklaration, nicht des Typs.",
    commonMistake:
      "Einige verwechseln den Rest-Parameter-Typ mit dem Spread-Operator " +
      "und erwarten einen speziellen Spread-Typ.",
  },
  5: {
    whyCorrect:
      "Parameternamen in Function Type Expressions sind reine Dokumentation. " +
      "TypeScript prueft nur die Typ-Kompatibilitaet, nicht die Namen.",
    commonMistake:
      "Aus Java/C# kommende Entwickler erwarten, dass Parameternamen " +
      "uebereinstimmen muessen. In TypeScript sind sie frei waehlbar.",
  },
  6: {
    whyCorrect:
      "Die Implementation Signature ist fuer Aufrufer unsichtbar — sie " +
      "dient nur der internen Implementierung. Aufrufer sehen nur die Overload-Signaturen.",
    commonMistake:
      "Viele denken, die Implementation Signature erweitert die " +
      "aufrufbaren Typen. Sie ist aber rein intern.",
  },
  7: {
    whyCorrect:
      "TypeScript prueft Overloads top-down. Spezifische zuerst verhindert, " +
      "dass ein breiter Overload praezisere Typen verschluckt.",
    commonMistake:
      "Manche schreiben Overloads in beliebiger Reihenfolge. " +
      "Das kann dazu fuehren, dass der falsche Overload matcht.",
  },
  8: {
    whyCorrect:
      "Void-Callbacks basieren auf dem Substitutability Principle: " +
      "Eine Funktion die 'mehr' kann (Wert zurueckgibt) ersetzt eine " +
      "die 'weniger' kann (void).",
    commonMistake:
      "Die void-Toleranz bei Callbacks vs. void-Strenge bei " +
      "Deklarationen verwirrt viele Entwickler. Merke: Kontext entscheidet.",
  },
  9: {
    whyCorrect:
      "Bei direkten Funktionsdeklarationen kontrollierst DU den Return-Typ. " +
      "Wenn du void sagst, meinst du es. Bei Callbacks definiert " +
      "jemand ANDERES die Schnittstelle.",
    commonMistake:
      "Wer die void-Callback-Toleranz kennt, wendet sie faelschlich " +
      "auch auf direkte Funktionsdeklarationen an.",
  },
  10: {
    whyCorrect:
      "Der this-Parameter ist ein reines Compilezeit-Feature (Type Erasure). " +
      "Er verschwindet im JavaScript — kein Laufzeit-Overhead.",
    commonMistake:
      "Manche erwarten, dass der this-Parameter als erster Funktionsparameter " +
      "im generierten JavaScript auftaucht. Das ist nicht der Fall.",
  },
  11: {
    whyCorrect:
      "Arrow Functions haben kein eigenes this. Sie loesen this " +
      "lexikalisch auf — vom umgebenden Scope. Das war der Hauptgrund " +
      "fuer ihre Einfuehrung in ES2015.",
    commonMistake:
      "Einige denken, Arrow Functions rufen intern .bind(this) auf. " +
      "In Wahrheit haben sie gar kein this-Binding.",
  },
  12: {
    whyCorrect:
      "value is Type ist ein Vertrag: 'Wenn true, dann ist value von diesem Typ.' " +
      "TypeScript vertraut dem Guard blind — die Korrektheit liegt beim Entwickler.",
    commonMistake:
      "Viele glauben, TypeScript prueft ob der Type Guard korrekt ist. " +
      "Das tut er nicht — ein return true wuerde immer als Guard akzeptiert.",
  },
  13: {
    whyCorrect:
      "Type Guard = boolean (if-Verzweigung). " +
      "Assertion Function = wirft bei Misserfolg. " +
      "Verschiedene Kontrollfluss-Strategien.",
    commonMistake:
      "Manche verwechseln asserts mit assert-Libraries. " +
      "asserts ist ein TypeScript-Keyword fuer den Compiler, " +
      "nicht eine externe Bibliothek.",
  },
  14: {
    whyCorrect:
      "Currying gibt eine neue Funktion zurueck. TypeScript inferiert " +
      "den Typ (b: number) => number automatisch. Konfiguration und " +
      "Ausfuehrung werden getrennt.",
    commonMistake:
      "Anfaenger erwarten einen Wert statt einer Funktion. " +
      "Currying gibt immer eine Funktion zurueck bis alle Parameter gesetzt sind.",
  },
};
