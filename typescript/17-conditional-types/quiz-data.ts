/**
 * Lektion 17 — Quiz-Daten: Conditional Types
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "17";
export const lessonTitle = "Conditional Types";

export const questions: QuizQuestion[] = [
  { question: "Was beschreibt `T extends U ? X : Y`?", options: ["Runtime-Check", "Compile-Zeit-Entscheidung: wenn T Subtyp von U, waehle X, sonst Y", "Type Guard", "Typ-Konvertierung"], correct: 1, explanation: "Conditional Types sind Ternary-Operatoren auf Type-Level. extends prueft Subtyp-Beziehung zur Compile-Zeit." },
  { question: "Was macht das `infer`-Keyword?", options: ["Inferiert Variablen-Typen", "Deklariert eine Typ-Variable im Conditional die TypeScript aus dem Pattern extrahiert", "Erstellt Type Guards", "Konvertiert Typen"], correct: 1, explanation: "infer deklariert einen Platzhalter-Typ den TypeScript aus dem extends-Pattern ableitet." },
  { question: "Was gibt `T extends Promise<infer U> ? U : T` bei `Promise<string>` zurueck?", options: ["Promise<string>", "string", "never", "unknown"], correct: 1, explanation: "Promise<string> matcht das Pattern Promise<infer U>, also wird U = string und zurueckgegeben." },
  { question: "Was passiert bei `IsString<string | number>` mit `type IsString<T> = T extends string ? true : false`?", options: ["true", "false", "true | false (distributiv)", "boolean"], correct: 2, explanation: "Distributiv: IsString<string> = true, IsString<number> = false. Ergebnis: true | false." },
  { question: "Wie verhindert man Distribution bei Conditional Types?", options: ["Mit as const", "Mit [T] extends [U] — Tuple-Wrapping", "Mit readonly", "Nicht moeglich"], correct: 1, explanation: "[T] extends [U] packt T in ein Tuple. Der Conditional wird dann nicht ueber Union-Member verteilt." },
  { question: "Was ist `IsString<never>` bei `type IsString<T> = T extends string ? true : false`?", options: ["true", "false", "never", "boolean"], correct: 2, explanation: "never ist der leere Union. Distribution ueber leeren Union = never. Eine wichtige Sonderregel!" },
  { question: "Wie erkennt man never zuverlaessig?", options: ["T extends never", "[T] extends [never] ? true : false", "typeof T === 'never'", "T === never"], correct: 1, explanation: "[T] extends [never] verhindert Distribution und prueft ob T wirklich never ist." },
  { question: "Was macht `type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T`?", options: ["Entfernt eine Array-Ebene", "Entpackt Arrays REKURSIV bis kein Array mehr uebrig ist", "Macht T zu einem Array", "Gibt never zurueck"], correct: 1, explanation: "Rekursion: Solange T ein Array ist, wird weiter entpackt. Erst wenn T kein Array mehr ist, terminiert die Rekursion." },
  { question: "Wie extrahiert man den Return-Type einer Funktion?", options: ["typeof fn()", "T extends (...args: any[]) => infer R ? R : never", "ReturnType ist eingebaut, kein Pattern noetig", "fn.returnType"], correct: 1, explanation: "infer R im Return-Position extrahiert den Rueckgabetyp. TypeScripts eingebauter ReturnType nutzt genau dieses Pattern." },
  { question: "Was macht `type Methods<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] }`?", options: ["Entfernt alle Methoden", "Behaelt nur Function-Properties und filtert Daten-Properties heraus", "Macht alle Properties zu Funktionen", "Kopiert T"], correct: 1, explanation: "Conditional im Key Remapping: Function-Properties behalten (K), andere entfernen (never)." },
  { question: "Was extrahiert `type FirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never`?", options: ["Alle Parameter", "Den ersten Parameter einer Funktion", "Den Return-Type", "Die Funktion selbst"], correct: 1, explanation: "infer P an der Position des ersten Parameters extrahiert genau diesen Typ." },
  { question: "Was ist der Unterschied zwischen Extract<T, U> und Exclude<T, U>?", options: ["Kein Unterschied", "Extract BEHAELT U-Member, Exclude ENTFERNT U-Member — beides distributiv", "Extract ist rekursiv, Exclude nicht", "Extract fuer Objekte, Exclude fuer Unions"], correct: 1, explanation: "Extract = T extends U ? T : never (behalten). Exclude = T extends U ? never : T (entfernen). Beide nutzen Distribution." },
  { question: "Was macht `type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T`?", options: ["Entpackt ein Promise", "Entpackt VERSCHACHTELTE Promises rekursiv bis kein Promise mehr uebrig ist", "Gibt Promise<T> zurueck", "Erzeugt einen Fehler"], correct: 1, explanation: "Rekursion: Promise<Promise<Promise<string>>> -> DeepAwaited<Promise<Promise<string>>> -> ... -> string." },
  { question: "Was passiert wenn ein rekursiver Typ zu tief wird?", options: ["Stack Overflow", "TypeScript gibt den Fehler 'Type instantiation is excessively deep'", "Automatisch never", "Kein Problem"], correct: 1, explanation: "TypeScript hat ein Rekursions-Limit (~50-100 Ebenen). Bei Ueberschreitung gibt es einen Compile-Fehler." },
  { question: "Was kombiniert `type Promisify<T> = { [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : T[K] }`?", options: ["Mapped Types allein", "Mapped Types + Conditional Types + infer — wandelt Methoden in async-Versionen um", "Nur Conditional Types", "Runtime-Transformation"], correct: 1, explanation: "Mapped Type iteriert, Conditional prueft ob Function, infer extrahiert Args und Return, Promise<R> wrappt den Return-Type." },
];

export interface ElaboratedFeedback { whyCorrect: string; commonMistake: string; }

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "extends auf Type-Level ist NICHT Runtime. Es prueft Subtyp-Beziehungen zur Compile-Zeit.", commonMistake: "Verwechslung mit instanceof/typeof. Conditional Types erzeugen keinen Code." },
  1: { whyCorrect: "infer ist wie ein Platzhalter/Wildcard den TypeScript mit dem konkreten Typ fuellt.", commonMistake: "Versuch infer ausserhalb von Conditional Types zu verwenden — geht nicht." },
  2: { whyCorrect: "Pattern Matching: Promise<string> matcht Promise<infer U>, also U = string.", commonMistake: "Vergessen dass bei nicht-matchenden Typen der Else-Branch (T) greift." },
  3: { whyCorrect: "Distribution: jedes Union-Member wird einzeln ausgewertet, Ergebnisse werden wieder vereint.", commonMistake: "Erwartung dass der Union als Ganzes geprueft wird. Distributive Conditionals verteilen!" },
  4: { whyCorrect: "[T] packt T in ein Tuple. Tuples verteilen nicht — der Union wird als Ganzes geprueft.", commonMistake: "Andere Versuche wie T & {} funktionieren fuer manche Faelle, aber [T] ist zuverlaessig." },
  5: { whyCorrect: "never = leerer Union. Distribution ueber nichts = nichts = never.", commonMistake: "Erwartung dass never extends string false ergibt. Bei Distribution ist die Antwort never." },
  6: { whyCorrect: "[T] extends [never] verhindert Distribution und prueft T direkt gegen never.", commonMistake: "T extends never direkt verwenden — das distributiert und gibt bei never immer never zurueck." },
  7: { whyCorrect: "Rekursion terminiert wenn T kein Array mehr ist. Beliebige Verschachtelungstiefe.", commonMistake: "Nur eine Ebene entpacken ohne Rekursion — dann bleiben verschachtelte Arrays uebrig." },
  8: { whyCorrect: "infer R an der Return-Position ist DAS Standard-Pattern fuer Return-Type-Extraktion.", commonMistake: "typeof fn() aufrufen — das fuehrt die Funktion aus! ReturnType nutzt rein statische Analyse." },
  9: { whyCorrect: "Conditional im Key Remapping (as) filtert Properties. never = Property entfernt.", commonMistake: "Conditional im Wert-Typ statt im Key Remapping — das aendert den Typ, entfernt aber nicht." },
  10: { whyCorrect: "infer P an der gewuenschten Position im Funktions-Pattern extrahiert genau diesen Typ.", commonMistake: "Vergessen dass bei keinem Parameter (z.B. () => void) der Else-Branch (never) greift." },
  11: { whyCorrect: "Extract behaelt Union-Member die U matchen. Exclude entfernt sie. Beide sind distributiv.", commonMistake: "Verwechslung der Richtung: Extract behaelt, Exclude entfernt. Die Namen helfen als Eselsbruecke." },
  12: { whyCorrect: "Rekursion entpackt Schicht fuer Schicht bis der Basis-Fall (kein Promise) erreicht ist.", commonMistake: "Nur eine Ebene entpacken. Ohne Rekursion bleibt Promise<Promise<T>> bei Promise<T> stehen." },
  13: { whyCorrect: "TypeScript schuetzt vor Endlos-Rekursion mit einem eingebauten Limit.", commonMistake: "Annehmen dass TypeScript endlos rekurrieren kann. In der Praxis reichen 3-5 Ebenen." },
  14: { whyCorrect: "Drei Konzepte kombiniert: Mapped Types iterieren, Conditional prueft, infer extrahiert.", commonMistake: "Versuch alles mit nur einem Konzept zu loesen. Die Staerke liegt in der Kombination." },
};
