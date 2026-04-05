/**
 * Lektion 18 — Quiz-Daten: Template Literal Types
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "18";
export const lessonTitle = "Template Literal Types";

export const questions: QuizQuestion[] = [
  { question: "Was erzeugt `type T = \\`${A}${B}\\`` wenn A und B Unions sind?", options: ["A | B", "Das kartesische Produkt aller Kombinationen von A und B", "A & B", "Einen Fehler"], correct: 1, explanation: "Template Literal Types bilden das kartesische Produkt. 2 Werte in A x 3 in B = 6 Kombinationen." },
  { question: "Was macht Capitalize<'hello'>?", options: ["'HELLO'", "'Hello' (nur erster Buchstabe gross)", "'hello'", "'hELLO'"], correct: 1, explanation: "Capitalize macht nur den ERSTEN Buchstaben gross. Uppercase<T> macht ALLES gross." },
  { question: "Was macht Uppercase<'hello'>?", options: ["'Hello'", "'HELLO' (alles gross)", "'hello'", "'hELLO'"], correct: 1, explanation: "Uppercase konvertiert ALLE Buchstaben zu Grossbuchstaben." },
  { question: "Was extrahiert `T extends \\`${infer P}_${string}\\` ? P : never` aus 'user_name'?", options: ["'user_name'", "'user'", "'name'", "never"], correct: 1, explanation: "infer P matcht alles VOR dem ersten Unterstrich. P = 'user'." },
  { question: "Was macht Split<'a.b.c', '.'> (rekursiver Typ)?", options: ["'a.b.c'", "['a', 'b', 'c']", "'a' | 'b' | 'c'", "['a.b.c']"], correct: 1, explanation: "Split parst den String rekursiv am Trennzeichen und erzeugt ein Tuple." },
  { question: "Was erzeugt `type T = \\`on${Capitalize<'click' | 'scroll'>}\\``?", options: ["'onClick' | 'onScroll'", "'onclick' | 'onscroll'", "'onClick'", "'onClickScroll'"], correct: 0, explanation: "Capitalize macht den ersten Buchstaben gross. Union-Expansion: 'onClick' | 'onScroll'." },
  { question: "Was ist `type CssLength = \\`${number}${'px' | 'em' | 'rem'}\\``?", options: ["Nur number", "String-Typ der Zahlen mit CSS-Einheiten akzeptiert: '100px', '2rem'", "Nur string", "number | string"], correct: 1, explanation: "Template Literal mit number erzeugt Strings wie '100px', '2.5em', etc." },
  { question: "Wie extrahiert man Route-Parameter aus '/users/:id/posts/:postId'?", options: ["Regex", "Rekursives Pattern Matching mit infer: :${infer Param}", "Runtime-Parsing", "Nicht moeglich"], correct: 1, explanation: "Template Literal Types mit infer koennen ':param'-Patterns rekursiv extrahieren." },
  { question: "Was erzeugt EventMap<T> mit Key Remapping \\`${K}Changed\\`?", options: ["Kopiert T", "Generiert Change-Events fuer jede Property mit previousValue/newValue", "Entfernt Properties", "Macht alles optional"], correct: 1, explanation: "Template Literal im Key Remapping generiert neue Event-Namen: nameChanged, ageChanged, etc." },
  { question: "Was ist der Unterschied zwischen Capitalize und Uppercase?", options: ["Kein Unterschied", "Capitalize: nur 1. Buchstabe gross. Uppercase: ALLE Buchstaben gross", "Capitalize: alles gross. Uppercase: nur 1. Buchstabe", "Capitalize fuer Strings, Uppercase fuer Zahlen"], correct: 1, explanation: "Capitalize<'hello'> = 'Hello'. Uppercase<'hello'> = 'HELLO'. Wichtiger Unterschied!" },
  { question: "Koennen Template Literal Types zur Laufzeit verwendet werden?", options: ["Ja", "Nein — sie existieren nur zur Compile-Zeit", "Nur in Node.js", "Nur mit as const"], correct: 1, explanation: "Wie alle TypeScript-Typen werden Template Literal Types beim Compilieren entfernt." },
  { question: "Was macht ReplaceAll<'a.b.c', '.', '/'> (rekursiv)?", options: ["'a.b/c'", "'a/b/c' (alle Punkte ersetzt)", "'a.b.c'", "Fehler"], correct: 1, explanation: "ReplaceAll ersetzt rekursiv ALLE Vorkommen. Replace (ohne All) nur das erste." },
  { question: "Warum braucht man `string & K` in Template Literal Keys?", options: ["Performance", "keyof kann number/symbol enthalten — Template Literals brauchen string", "Nicht noetig", "Weil K immer number ist"], correct: 1, explanation: "keyof T gibt string | number | symbol. Template Literals akzeptieren nur string. Die Intersection filtert." },
  { question: "Was ist `type SemVer = \\`${number}.${number}.${number}\\``?", options: ["Ein Array", "Ein String-Typ fuer semantische Versionierung: '1.2.3'", "Ein number", "Ein Objekt"], correct: 1, explanation: "Template Literal mit number erzeugt String-Patterns wie '1.0.0', '2.3.1', etc." },
  { question: "Welches Framework-Pattern nutzt Template Literal Types am haeufigsten?", options: ["Array-Methoden", "Event-Handler-Namen: on${Capitalize<EventName>}", "For-Schleifen", "Import-Pfade"], correct: 1, explanation: "React, Vue und andere Frameworks nutzen on${Capitalize<>} fuer Event-Props: onClick, onMouseMove, etc." },

  // ─── Neue Frageformate (Short-Answer, Predict-Output, Explain-Why) ─────────

  {
    type: "short-answer",
    question: "Welcher eingebaute String-Utility-Type macht ALLE Buchstaben gross?",
    expectedAnswer: "Uppercase",
    acceptableAnswers: ["Uppercase", "Uppercase<T>", "Uppercase<>"],
    explanation: "Uppercase<T> konvertiert alle Buchstaben zu Grossbuchstaben. Capitalize<T> macht nur den ersten Buchstaben gross — ein haeufiger Verwechslungsfehler.",
  },
  {
    type: "short-answer",
    question: "Wie nennt man das Ergebnis wenn ein Template Literal Type zwei Union-Typen kombiniert? (mathematischer Begriff)",
    expectedAnswer: "kartesisches Produkt",
    acceptableAnswers: ["kartesisches Produkt", "Kartesisches Produkt", "cartesian product", "cross product", "Kreuzprodukt"],
    explanation: "Template Literal Types bilden das kartesische Produkt aller Union-Member. Bei 2 x 3 Werten entstehen 6 String-Kombinationen.",
  },
  {
    type: "predict-output",
    question: "Was ist der resultierende Typ?",
    code: "type Result = `${'get' | 'set'}${Capitalize<'name' | 'age'>}`;",
    expectedAnswer: "'getName' | 'getAge' | 'setName' | 'setAge'",
    acceptableAnswers: ["'getName' | 'getAge' | 'setName' | 'setAge'", "getName | getAge | setName | setAge", "'getAge' | 'getName' | 'setAge' | 'setName'"],
    explanation: "Kartesisches Produkt: 2 Prefixe x 2 capitalized Names = 4 Kombinationen. Capitalize macht den ersten Buchstaben gross.",
  },
  {
    type: "predict-output",
    question: "Was ist der resultierende Typ?",
    code: "type ExtractPrefix<T> = T extends `${infer P}_${string}` ? P : never;\ntype Result = ExtractPrefix<'user_name' | 'user_email' | 'order_id'>;",
    expectedAnswer: "'user' | 'order'",
    acceptableAnswers: ["'user' | 'order'", "user | order", "'order' | 'user'"],
    explanation: "infer P matcht alles vor dem ersten Unterstrich. Distributiv ueber den Union: 'user' (2x dedupliziert) | 'order'. Ergebnis: 'user' | 'order'.",
  },
  {
    type: "short-answer",
    question: "Welcher eingebaute Utility-Type macht nur den ERSTEN Buchstaben klein?",
    expectedAnswer: "Uncapitalize",
    acceptableAnswers: ["Uncapitalize", "Uncapitalize<T>", "Uncapitalize<>"],
    explanation: "Uncapitalize<T> ist das Gegenstueck zu Capitalize<T>. Es macht nur den ersten Buchstaben klein, der Rest bleibt unveraendert.",
  },
  {
    type: "explain-why",
    question: "Warum sind Template Literal Types besonders wertvoll fuer die Typisierung von Framework-APIs wie React-Event-Handler oder Express-Routen?",
    modelAnswer: "Template Literal Types ermoeglichen es, String-basierte APIs typsicher zu machen, die frueher nur mit 'string' typisiert werden konnten. Bei React generiert on${Capitalize<EventName>} automatisch onClick, onMouseMove etc. mit korrekten Event-Typen. Bei Express koennen Route-Parameter wie '/users/:id' statisch extrahiert werden, sodass req.params.id typsicher ist. Das eliminiert eine ganze Klasse von Laufzeitfehlern durch Tippfehler in String-basierten APIs.",
    keyPoints: ["String-basierte APIs werden typsicher statt nur 'string'", "Automatische Generierung von Event-Handler-Namen mit korrekten Typen", "Statische Extraktion von Route-Parametern", "Tippfehler werden zur Compile-Zeit statt zur Laufzeit erkannt"],
  },
];

export interface ElaboratedFeedback { whyCorrect: string; commonMistake: string; }

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Kartesisches Produkt: Jede Kombination aus A und B wird gebildet.", commonMistake: "Erwartung eines Union aus A | B statt des kartesischen Produkts." },
  1: { whyCorrect: "Capitalize aendert nur den ersten Buchstaben. Der Rest bleibt unveraendert.", commonMistake: "Verwechslung mit Uppercase (das ALLE Buchstaben aendert)." },
  2: { whyCorrect: "Uppercase konvertiert jeden einzelnen Buchstaben zu Grossschreibung.", commonMistake: "Verwechslung mit Capitalize (das nur den ersten aendert)." },
  3: { whyCorrect: "infer P steht VOR dem Unterstrich — es matched alles bis zum ersten _.", commonMistake: "Erwartung dass der gesamte String extrahiert wird." },
  4: { whyCorrect: "Rekursion: Bei jedem Schritt wird ein Segment abgespalten bis kein Trennzeichen mehr da ist.", commonMistake: "Vergessen der Rekursion — dann wird nur der erste Split gemacht." },
  5: { whyCorrect: "Capitalize + Union = jedes Member einzeln capitalized. Ergebnis ist ein Union.", commonMistake: "Annahme dass die Unions konkateniert statt einzeln verarbeitet werden." },
  6: { whyCorrect: "number in Template Literals erzeugt String-Repraesentationen von Zahlen mit angehaengter Einheit.", commonMistake: "Erwartung dass der Typ number bleibt. Es ist ein String-Typ!" },
  7: { whyCorrect: "Rekursives infer-Pattern extrahiert :param-Segmente aus dem Pfad-String.", commonMistake: "Versuch mit Runtime-Regex statt Type-Level-Parsing." },
  8: { whyCorrect: "Template Literal im Key Remapping erzeugt neue Key-Namen mit dem Changed-Suffix.", commonMistake: "Vergessen dass das Mapped Type + Key Remapping Kombination noetig ist." },
  9: { whyCorrect: "Capitalize = erster Buchstabe. Uppercase = alle Buchstaben. Zwei verschiedene Operationen.", commonMistake: "Die beiden verwechseln. Merkhilfe: Capitalize = Capital letter (ein Grossbuchstabe)." },
  10: { whyCorrect: "Alle TypeScript-Typen werden beim Compilieren entfernt. Template Literal Types sind keine Ausnahme.", commonMistake: "Annahme dass String-Constraints zur Laufzeit geprueft werden." },
  11: { whyCorrect: "Rekursion: Nach jedem Replace wird geprueft ob noch ein Vorkommen existiert.", commonMistake: "Vergessen dass Replace ohne Rekursion nur das ERSTE Vorkommen ersetzt." },
  12: { whyCorrect: "keyof kann number und symbol enthalten. Template Literals brauchen string.", commonMistake: "Annahme dass keyof immer nur string zurueckgibt." },
  13: { whyCorrect: "Template Literal mit number erzeugt String-Patterns fuer Versionen.", commonMistake: "Erwartung eines numerischen Typs statt eines String-Typs." },
  14: { whyCorrect: "on${Capitalize<>} ist DAS Pattern fuer Event-Props in React, Vue, etc.", commonMistake: "Denken dass Template Literal Types nur akademisch sind — sie sind allgegenwaertig." },
};
