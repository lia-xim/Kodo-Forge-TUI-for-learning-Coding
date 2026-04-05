/**
 * Lektion 04 — Quiz-Daten: Arrays & Tuples
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "04";
export const lessonTitle = "Arrays & Tuples";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Array vs Tuple erkennen ---
  {
    question: "Welcher Typ ist ein Tuple?",
    options: [
      "string[]",
      "Array<number>",
      "[string, number, boolean]",
      "(string | number)[]",
    ],
    correct: 2,
    explanation:
      "[string, number, boolean] ist ein Tuple — es hat eine fixe Laenge (3) " +
      "und jede Position hat einen eigenen Typ. Die anderen sind alle Arrays " +
      "mit variabler Laenge.",
  },

  // --- Frage 2: Inferenz bei gemischten Werten ---
  {
    question: "Welchen Typ inferiert TypeScript fuer diese Variable?",
    code: 'const arr = [1, "hello", true];',
    options: [
      "[number, string, boolean]",
      "readonly [1, \"hello\", true]",
      "(string | number | boolean)[]",
      "any[]",
    ],
    correct: 2,
    explanation:
      "Ohne explizite Annotation oder 'as const' inferiert TypeScript ein " +
      "Array mit Union-Typ: (string | number | boolean)[]. Es wird KEIN " +
      "Tuple inferiert! Das ist eine bewusste Design-Entscheidung: TypeScript " +
      "nimmt an, dass du ein flexibles Array willst.",
  },

  // --- Frage 3: readonly Verhalten ---
  {
    question: "Welche Operation ist auf einem 'readonly string[]' erlaubt?",
    options: [
      "arr.push('neu')",
      "arr.sort()",
      "arr.filter(x => x.length > 3)",
      "arr[0] = 'geaendert'",
    ],
    correct: 2,
    explanation:
      "filter() ist erlaubt, weil es ein NEUES Array zurueckgibt und das " +
      "Original nicht veraendert. push(), sort() und Index-Zuweisung sind " +
      "blockiert, weil sie das Array mutieren wuerden.",
  },

  // --- Frage 4: T[] vs Array<T> ---
  {
    question: "Was ist der Unterschied zwischen 'number[]' und 'Array<number>'?",
    options: [
      "number[] ist schneller zur Laufzeit",
      "Array<number> unterstuetzt mehr Methoden",
      "Es gibt keinen Unterschied — beide erzeugen den gleichen Typ",
      "number[] ist ein Tuple, Array<number> ist ein Array",
    ],
    correct: 2,
    explanation:
      "number[] und Array<number> sind exakt derselbe Typ. number[] ist " +
      "syntaktischer Zucker fuer Array<number>. Array<T> ist ein generisches " +
      "Interface in lib.es5.d.ts — du benutzt also bereits Generics, " +
      "wenn du string[] schreibst!",
  },

  // --- Frage 5: Tuple push-Problem ---
  {
    question: "Was passiert bei diesem Code?",
    code: "const pair: [string, number] = [\"hello\", 42];\npair.push(true);",
    options: [
      "Compile-Fehler: push ist auf Tuples nicht erlaubt",
      "Compile-Fehler: true ist nicht string | number",
      "Kein Fehler — TypeScript erlaubt push auf mutable Tuples",
      "Laufzeit-Fehler",
    ],
    correct: 1,
    explanation:
      "push() ist auf mutable Tuples erlaubt, aber der Argument-Typ wird " +
      "geprueft. push akzeptiert nur 'string | number' (die Union der " +
      "Tuple-Elemente), und 'true' (boolean) gehoert nicht dazu. " +
      "Verwende 'readonly' Tuples um push komplett zu blockieren!",
  },

  // --- Frage 6: as const Verhalten ---
  {
    question: "Welchen Typ hat 'x'?",
    code: 'const x = ["a", 1] as const;',
    options: [
      "(string | number)[]",
      "[string, number]",
      "readonly [string, number]",
      'readonly ["a", 1]',
    ],
    correct: 3,
    explanation:
      "'as const' bewirkt zwei Dinge: (1) Das Array wird zu einem readonly " +
      "Tuple und (2) alle Werte werden zu Literal-Typen. Deshalb ist der " +
      'Typ readonly ["a", 1] — nicht readonly [string, number]! ' +
      "Das Verhindern des Widening (string statt \"a\") ist der Kern von as const.",
  },

  // --- Frage 7: Rest-Elemente ---
  {
    question: "Welche Werte sind fuer den Typ [string, ...number[]] gueltig?",
    code: "type T = [string, ...number[]];",
    options: [
      'Nur ["hello", 1, 2, 3] — mindestens eine Zahl noetig',
      'Nur ["hello"] — Rest-Element kann leer sein',
      '["hello"], ["hello", 1], ["hello", 1, 2, 3] — alle gueltig',
      '[] — leeres Array ist auch gueltig',
    ],
    correct: 2,
    explanation:
      "Ein Rest-Element (...number[]) kann auch leer sein (0 Elemente). " +
      'Daher sind alle Varianten gueltig: ["hello"] mit 0 Zahlen, ' +
      '["hello", 1] mit 1 Zahl, ["hello", 1, 2, 3] mit 3 Zahlen usw. ' +
      "Nur das erste Element (string) ist Pflicht. Ein leeres Array ist " +
      "ungueltig, weil der string fehlt.",
  },

  // --- Frage 8: Readonly Zuweisung ---
  {
    question: "Welche Zuweisung ist erlaubt?",
    code:
      "const mutable: string[] = [\"A\", \"B\"];\n" +
      "const readonly1: readonly string[] = [\"X\"];\n" +
      "// Welche Zuweisung funktioniert?",
    options: [
      "const a: string[] = readonly1;",
      "const b: readonly string[] = mutable;",
      "Beide funktionieren",
      "Keine funktioniert",
    ],
    correct: 1,
    explanation:
      "mutable -> readonly ist erlaubt (weniger Rechte geben ist sicher). " +
      "readonly -> mutable ist NICHT erlaubt (man koennte dann mutieren, " +
      "obwohl der Original-Typ das verbietet). Denk daran wie eine " +
      "Einbahnstrasse: Du kannst Faehigkeiten wegnehmen, aber nicht hinzufuegen.",
  },

  // --- Frage 9: Labeled Tuple ---
  {
    question: "Was bewirken Labels in einem Tuple-Typ?",
    code: "type Point = [x: number, y: number];",
    options: [
      "Sie erzeugen Properties — man kann point.x schreiben",
      "Sie aendern den Typ — [x: number, y: number] ist nicht gleich [number, number]",
      "Sie sind rein dokumentarisch — verbessern IDE-Tooltips und Fehlermeldungen",
      "Sie machen das Tuple readonly",
    ],
    correct: 2,
    explanation:
      "Labels in Tuples sind rein dokumentarisch. Sie beeinflussen den Typ " +
      "nicht — [x: number, y: number] und [number, number] sind identisch. " +
      "Aber sie verbessern die Entwicklererfahrung: IDE-Tooltips zeigen die " +
      "Label-Namen, und Fehlermeldungen werden verstaendlicher.",
  },

  // --- Frage 10: Spread und Tuple-Typ ---
  {
    question: "Welchen Typ hat 'result'?",
    code:
      "const tuple: [string, number] = [\"hello\", 42];\n" +
      "const result = [...tuple];",
    options: [
      "[string, number]",
      "readonly [string, number]",
      "(string | number)[]",
      "[\"hello\", 42]",
    ],
    correct: 2,
    explanation:
      "Wenn ein Tuple mit dem Spread-Operator in ein neues Array kopiert " +
      "wird, VERLIERT es den Tuple-Typ! TypeScript inferiert stattdessen " +
      "ein normales Array mit Union-Typ: (string | number)[]. " +
      "Um den Tuple-Typ zu behalten, braucht man eine explizite Annotation.",
  },

  // --- Frage 11: Kovarianz-Verstaendnis ---
  {
    question: "Warum ist dieser Code problematisch, obwohl er kompiliert?",
    code:
      "const admins: (\"admin\" | \"mod\")[] = [\"admin\", \"mod\"];\n" +
      "const users: string[] = admins;\n" +
      "users.push(\"hacker\");",
    options: [
      "Dieser Code kompiliert nicht — string[] ist nicht kompatibel mit (\"admin\" | \"mod\")[]",
      "users.push() wirft einen Laufzeit-Fehler",
      "admins enthaelt jetzt \"hacker\", aber sein Typ sagt (\"admin\" | \"mod\")[]",
      "Der Code ist korrekt und hat kein Problem",
    ],
    correct: 2,
    explanation:
      "Das ist ein Kovarianz-Problem: (\"admin\" | \"mod\")[] ist ein Subtyp " +
      "von string[] (Kovarianz). Aber nach der Zuweisung zeigen beide auf " +
      "dasselbe Array. Ueber 'users' kann man \"hacker\" pushen — das landet " +
      "dann auch in 'admins', obwohl der Typ das nicht erlaubt. " +
      "TypeScript erlaubt das aus Pragmatismus, es ist aber technisch unsound. " +
      "readonly Arrays loesen dieses Problem.",
  },

  // --- Frage 12: .length-Typ bei Tuples vs Arrays ---
  {
    question: "Was ist der Typ von 'len'?",
    code:
      "const tup: [string, number, boolean] = [\"a\", 1, true];\n" +
      "const len = tup.length;",
    options: [
      "number",
      "3",
      "1 | 2 | 3",
      "number | undefined",
    ],
    correct: 1,
    explanation:
      "Bei Tuples ist .length ein Literal-Typ! [string, number, boolean] " +
      "hat immer genau 3 Elemente, also ist tup.length vom Typ 3 (nicht number). " +
      "Bei einem normalen Array waere .length vom Typ number. " +
      "Das ist ein weiterer fundamentaler Unterschied zwischen Arrays und Tuples.",
  },

  // --- Frage 13: noUncheckedIndexedAccess ---
  {
    question: "Mit 'noUncheckedIndexedAccess: true' — welchen Typ hat 'val'?",
    code:
      "const arr: string[] = [\"hello\"];\n" +
      "const val = arr[0];",
    options: [
      "string",
      "string | undefined",
      "string | null",
      "\"hello\"",
    ],
    correct: 1,
    explanation:
      "Mit noUncheckedIndexedAccess wird JEDER Array-Index-Zugriff als " +
      "moeglicherweise undefined behandelt. arr[0] hat dann den Typ " +
      "string | undefined, auch wenn wir sehen dass das Element existiert. " +
      "ABER: Bei Tuples sind bekannte Positionen NICHT betroffen — ein " +
      "Tuple [string, number] hat an Position 0 immer den Typ string (ohne | undefined).",
  },

  // --- Frage 14: filter mit Type Predicate ---
  {
    question: "Welchen Typ hat 'result'?",
    code:
      "const arr: (string | number)[] = [\"a\", 1, \"b\", 2];\n" +
      "const result = arr.filter(x => typeof x === \"string\");",
    options: [
      "string[]",
      "(string | number)[]",
      "(string | number | undefined)[]",
      "never[]",
    ],
    correct: 0,
    explanation:
      "Ab TypeScript 5.5 erkennt filter() automatisch Type Predicates bei " +
      "einfachen typeof-Checks. Der Callback `x => typeof x === \"string\"` " +
      "wird als Type Guard inferiert, sodass das Ergebnis string[] ist. " +
      "In aelteren TypeScript-Versionen (vor 5.5) waere das Ergebnis " +
      "(string | number)[] und man brauchte ein explizites Type Predicate: " +
      "arr.filter((x): x is string => typeof x === \"string\").",
  },

  // --- Frage 15: Tiefes Verstaendnis — Warum inferiert TS kein Tuple? ---
  {
    question: "WARUM inferiert TypeScript bei 'const p = [1, 2]' kein Tuple?",
    code: "const p = [1, 2]; // Typ: number[], nicht [number, number]",
    options: [
      "Weil TypeScript Tuples nicht kennt — man muss immer annotieren",
      "Weil Arrays mutierbar sind und die Laenge sich aendern kann",
      "Weil eckige Klammern immer Arrays erzeugen, nie Tuples",
      "Weil const nur den Zeiger schuetzt, nicht den Inhalt",
    ],
    correct: 1,
    explanation:
      "TypeScript inferiert number[] statt [number, number], weil Arrays " +
      "standardmaessig MUTABLE sind. Man koennte spaeter p.push(3) oder " +
      "p.pop() aufrufen. Ein Tuple-Typ waere dann zu restriktiv und wuerde " +
      "viele gaengige Operationen blockieren. 'const' schuetzt zwar die " +
      "Variable (du kannst p nicht neu zuweisen), aber der INHALT des Arrays " +
      "bleibt aenderbar. Erst 'as const' sagt TypeScript: 'Behandle das " +
      "als unveraenderbar und verwende die engstmoeglichen Typen.'",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Neue Formate: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 16: Short-Answer — readonly-Methoden ---
  {
    type: "short-answer",
    question:
      "Welche Array-Methode ist auf 'readonly string[]' erlaubt: push(), sort() oder filter()?",
    expectedAnswer: "filter",
    acceptableAnswers: ["filter", "filter()", ".filter()", ".filter"],
    explanation:
      "filter() ist auf readonly Arrays erlaubt, weil es ein NEUES Array zurueckgibt und " +
      "das Original nicht veraendert. push() und sort() mutieren das Original und sind " +
      "daher auf readonly Arrays blockiert. Allgemein gilt: Nur nicht-mutierende Methoden " +
      "(filter, map, slice, concat, etc.) sind auf readonly Arrays verfuegbar.",
  },

  // --- Frage 17: Short-Answer — Tuple-Laenge ---
  {
    type: "short-answer",
    question:
      "Welchen Typ hat .length bei einem Tuple vom Typ [string, number, boolean]? " +
      "(Gib den exakten Typ an, nicht 'number')",
    expectedAnswer: "3",
    acceptableAnswers: ["3", "Literal 3", "literal 3"],
    explanation:
      "Bei Tuples ist .length ein Literal-Typ! Da [string, number, boolean] immer genau " +
      "3 Elemente hat, ist tup.length vom Typ 3 (nicht number). Bei einem normalen Array " +
      "waere .length vom Typ number. Das ist ein fundamentaler Unterschied zwischen " +
      "Arrays und Tuples.",
  },

  // --- Frage 18: Predict-Output — Spread-Verlust ---
  {
    type: "predict-output",
    question:
      "Was ist der von TypeScript inferierte Typ von 'copy'? " +
      "(Gib den Typ an, z.B. 'string[]' oder '[string, number]')",
    code: `const original: [string, number] = ["hello", 42];\nconst copy = [...original];`,
    expectedAnswer: "(string | number)[]",
    acceptableAnswers: ["(string | number)[]", "Array<string | number>", "(string|number)[]", "string | number[]"],
    explanation:
      "Wenn ein Tuple mit dem Spread-Operator kopiert wird, VERLIERT es den Tuple-Typ! " +
      "TypeScript inferiert stattdessen ein normales Array mit Union-Typ: (string | number)[]. " +
      "Die fixe Laenge und die positionsbezogenen Typen gehen verloren. " +
      "Fuer den Tuple-Typ braucht man eine explizite Annotation.",
  },

  // --- Frage 19: Predict-Output — as const ---
  {
    type: "predict-output",
    question: "Was ist der Typ von 'x[1]' laut TypeScript?",
    code: `const x = ["hallo", 99, true] as const;\n// typeof x[1] = ???`,
    expectedAnswer: "99",
    acceptableAnswers: ["99", "Literal 99", "literal 99"],
    explanation:
      "'as const' macht das Array zu einem readonly Tuple mit Literal-Typen: " +
      "readonly ['hallo', 99, true]. An Position 1 steht der Literal-Typ 99 " +
      "(nicht number!). Das Verhindern von Widening ist der Kern von 'as const'.",
  },

  // --- Frage 20: Short-Answer — noUncheckedIndexedAccess ---
  {
    type: "short-answer",
    question:
      "Welche tsconfig-Option macht Array-Index-Zugriffe zu 'T | undefined' statt nur 'T'?",
    expectedAnswer: "noUncheckedIndexedAccess",
    acceptableAnswers: ["noUncheckedIndexedAccess", "noUncheckedIndexedAccess: true", "nouncheckedindexedaccess"],
    explanation:
      "Mit noUncheckedIndexedAccess wird JEDER Array-Index-Zugriff als moeglicherweise " +
      "undefined behandelt. arr[0] hat dann den Typ T | undefined. Das ist sicherer, " +
      "weil der Index ausserhalb der Array-Grenzen liegen koennte. " +
      "Bei Tuples sind bekannte Positionen davon NICHT betroffen.",
  },

  // --- Frage 21: Explain-Why — Warum kein Tuple bei Array-Literalen? ---
  {
    type: "explain-why",
    question:
      "Warum inferiert TypeScript bei 'const p = [1, 2]' den Typ number[] " +
      "statt [number, number], obwohl const verwendet wird?",
    modelAnswer:
      "const schuetzt nur die Variablenbindung (p kann nicht neu zugewiesen werden), " +
      "aber nicht den Inhalt des Arrays. Man koennte p.push(3), p.pop() oder p[0] = 99 " +
      "ausfuehren. Ein Tuple-Typ [number, number] waere zu restriktiv und wuerde viele " +
      "gaengige Array-Operationen blockieren. TypeScript waehlt daher den flexibleren " +
      "number[]-Typ. Erst 'as const' signalisiert: 'Behandle das als unveraenderbar " +
      "und verwende die engstmoeglichen Typen.'",
    keyPoints: [
      "const schuetzt die Variable, nicht den Array-Inhalt",
      "push(), pop(), splice() waeren auf einem Tuple-Typ blockiert",
      "TypeScript waehlt pragmatisch den flexibleren Array-Typ",
      "'as const' ist noetig fuer echte Tuple-Inference mit Literal-Typen",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Elaboriertes Feedback — tiefere Erklaerungen pro Frage
// ═══════════════════════════════════════════════════════════════════════════════

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  // Frage 1: Array vs Tuple erkennen
  0: {
    whyCorrect:
      "Ein Tuple hat eine FIXE Laenge und jede Position hat einen eigenen Typ. " +
      "[string, number, boolean] definiert genau 3 Positionen. Die anderen " +
      "Optionen (string[], Array<number>, (string | number)[]) beschreiben " +
      "alle Arrays mit variabler Laenge und einem einheitlichen Element-Typ.",
    commonMistake:
      "Viele verwechseln (string | number | boolean)[] mit einem Tuple. " +
      "Aber ein Union-Array erlaubt beliebig viele Elemente in beliebiger " +
      "Reihenfolge — ein Tuple erzwingt die exakte Struktur.",
  },

  // Frage 2: Inferenz bei gemischten Werten
  1: {
    whyCorrect:
      "TypeScript inferiert bei Array-Literalen IMMER ein Array, nie ein Tuple. " +
      "Die Werte 1, 'hello', true werden zum Union (string | number | boolean) " +
      "zusammengefasst. Das ist eine bewusste Design-Entscheidung: Da Arrays " +
      "mutable sind, waere ein Tuple-Typ zu restriktiv.",
    commonMistake:
      "Die Verwechslung mit [number, string, boolean] liegt nahe — " +
      "die Werte SEHEN ja wie ein Tuple aus. Aber TS schaut auf die " +
      "beabsichtigte Nutzung: ein mutabler Array, nicht eine fixe Struktur. " +
      "Fuer ein Tuple brauchst du 'as const' oder eine explizite Annotation.",
  },

  // Frage 3: readonly Verhalten
  2: {
    whyCorrect:
      "filter() erstellt ein NEUES Array aus den Elementen, die den Test bestehen. " +
      "Das Original wird nicht veraendert — deshalb ist es auf readonly erlaubt. " +
      "Die ReadonlyArray-Definition in lib.es5.d.ts enthaelt filter(), map(), " +
      "slice() etc., aber NICHT push(), sort() oder pop().",
    commonMistake:
      "sort() scheint harmlos, weil man das Ergebnis 'zurueckbekommt'. " +
      "Aber sort() sortiert IN-PLACE und gibt dasselbe Array zurueck — " +
      "es mutiert das Original! Daher ist es auf readonly verboten.",
  },

  // Frage 4: T[] vs Array<T>
  3: {
    whyCorrect:
      "number[] ist rein syntaktischer Zucker. Der TypeScript-Compiler " +
      "behandelt beide Formen identisch — sie erzeugen exakt den gleichen " +
      "Typ im Type-System. In der lib.es5.d.ts ist Array<T> als generisches " +
      "Interface definiert, und T[] ist eine Kurzschreibweise dafuer.",
    commonMistake:
      "Manche glauben, Array<T> sei 'moderner' oder 'besser'. Tatsaechlich " +
      "ist es Geschmackssache. T[] ist kompakter bei einfachen Typen, " +
      "Array<T> ist lesbarer bei komplexen Typen wie Array<string | number>.",
  },

  // Frage 5: Tuple push-Problem
  4: {
    whyCorrect:
      "push() auf mutable Tuples akzeptiert die Union aller Element-Typen. " +
      "Bei [string, number] akzeptiert push() nur string | number. " +
      "true ist boolean — das gehoert nicht zur Union, also Fehler. " +
      "pair.push('world') oder pair.push(99) wuerde kompilieren.",
    commonMistake:
      "Viele denken, push() ist auf Tuples komplett verboten. Das stimmt " +
      "nur fuer READONLY Tuples. Mutable Tuples erlauben push(), aber mit " +
      "Typ-Check auf die Element-Union. Das ist eine bekannte Schwachstelle — " +
      "das Tuple hat danach mehr Elemente als sein Typ verspricht.",
  },

  // Frage 6: as const Verhalten
  5: {
    whyCorrect:
      "'as const' hat DREI Effekte: (1) readonly — das Array wird zum Tuple " +
      "und ist nicht mehr mutierbar. (2) Literal-Narrowing — 'a' bleibt " +
      "der Literal-Typ 'a' (nicht string), und 1 bleibt der Literal-Typ 1 " +
      "(nicht number). (3) Feste Laenge — das Array wird als Tuple mit " +
      "exakter Laenge behandelt. Zusammen ergibt das: readonly ['a', 1].",
    commonMistake:
      "readonly [string, number] vergisst den Literal-Narrowing-Effekt. " +
      "Viele wissen, dass 'as const' readonly macht, aber uebersehen, " +
      "dass es auch die Typen zu Literalen verengt. Das ist der eigentliche " +
      "Kern-Feature von 'as const'.",
  },

  // Frage 7: Rest-Elemente
  6: {
    whyCorrect:
      "Ein Rest-Element (...number[]) bedeutet '0 oder mehr Elemente'. " +
      "Es ist wie ein Spread in umgekehrter Richtung — es sammelt beliebig " +
      "viele (auch null) Werte auf. Nur die festen Positionen davor sind " +
      "Pflicht — hier der string an Position 0.",
    commonMistake:
      "Viele nehmen an, dass mindestens ein Element im Rest vorhanden sein " +
      "muss. Aber ...number[] ist number[] — und ein leeres Array ist ein " +
      "gueltiges number[]. Der string am Anfang ist Pflicht, die Zahlen danach nicht.",
  },

  // Frage 8: Readonly Zuweisung
  7: {
    whyCorrect:
      "mutable -> readonly ist wie 'Rechte wegnehmen': Du gibst jemandem " +
      "Lesezugriff auf etwas, das du auch schreiben koenntest. Das ist sicher. " +
      "readonly -> mutable waere 'Rechte hinzufuegen': Man koennte das Array " +
      "dann mutieren, obwohl es als readonly deklariert wurde. Unsicher!",
    commonMistake:
      "Die Denkweise 'readonly ist ein anderer Typ, also keine Richtung " +
      "funktioniert' fuehrt zu Option D. Aber readonly ist ein Subtyp-Verhaeltnis: " +
      "string[] ist ein Subtyp von readonly string[] (hat mehr Faehigkeiten).",
  },

  // Frage 9: Labeled Tuple
  8: {
    whyCorrect:
      "Labels in Tuples existieren NUR fuer die Dokumentation. Sie werden " +
      "in der .d.ts-Datei beibehalten und erscheinen in IDE-Tooltips, " +
      "aber sie erzeugen KEINE Properties. point.x gibt es nicht — " +
      "es bleibt bei point[0]. Der Typ [x: number, y: number] ist " +
      "strukturell identisch mit [number, number].",
    commonMistake:
      "Der Name 'Label' suggeriert Property-Zugriff wie bei Objekten. " +
      "Aber Tuples bleiben intern Arrays mit numerischem Index. " +
      "Wenn du .x brauchst, verwende ein Objekt { x: number, y: number }.",
  },

  // Frage 10: Spread und Tuple-Typ
  9: {
    whyCorrect:
      "Der Spread-Operator erzeugt ein NEUES Array. TypeScript kann nicht " +
      "garantieren, dass das neue Array dieselbe fixe Laenge hat wie das " +
      "Original (es koennten z.B. Spreads kombiniert werden). Daher faellt " +
      "es zurueck auf den sichersten gemeinsamen Typ: (string | number)[].",
    commonMistake:
      "Die Erwartung [string, number] liegt nahe — man kopiert ja nur. " +
      "Aber TypeScript behandelt [...tuple] wie ein frisches Array-Literal. " +
      "Seit TS 4.0 gibt es bessere Tuple-Spreads in generischen Kontexten, " +
      "aber bei konkreten Werten bleibt es ein Array.",
  },

  // Frage 11: Kovarianz-Verstaendnis
  10: {
    whyCorrect:
      "Nach der Zuweisung zeigen admins und users auf DASSELBE Array-Objekt " +
      "im Speicher. Ueber users (Typ string[]) kann man beliebige Strings pushen. " +
      "Diese landen auch in admins, obwohl der Typ ('admin' | 'mod')[] " +
      "nur diese zwei Werte erlaubt. TypeScript erkennt das Problem, erlaubt " +
      "es aber aus Pragmatismus — zu viel existierender Code wuerde brechen.",
    commonMistake:
      "Option A denkt, die Zuweisung selbst schlaegt fehl. Aber Kovarianz " +
      "erlaubt die Zuweisung (engerer Typ -> breiterer Typ). " +
      "Das Problem liegt in der anschliessenden MUTATION, nicht in der Zuweisung.",
  },

  // Frage 12: .length-Typ bei Tuples
  11: {
    whyCorrect:
      "TypeScript kennt die exakte Laenge eines Tuples. Da [string, number, boolean] " +
      "immer genau 3 Elemente hat, ist .length der Literal-Typ 3. Das ist ein " +
      "fundamentaler Unterschied zu Arrays (Typ number), weil bei Arrays die " +
      "Laenge variabel ist.",
    commonMistake:
      "'number' ist die intuitive Antwort — .length gibt ja eine Zahl zurueck. " +
      "Aber TypeScript ist praeziser als man denkt. Bei Tuples wird .length " +
      "zum Literal-Typ. Das kann in Conditional Types und Mapped Types " +
      "sehr nuetzlich sein.",
  },

  // Frage 13: noUncheckedIndexedAccess
  12: {
    whyCorrect:
      "noUncheckedIndexedAccess aendert das Verhalten von Index-Zugriffen: " +
      "Jeder Zugriff auf arr[n] hat den Typ T | undefined (statt nur T). " +
      "Das ist sicherer, weil der Index ausserhalb der Grenzen liegen koennte. " +
      "ABER: Bei Tuples sind bekannte Positionen nicht betroffen — " +
      "tup[0] bei einem [string, number] bleibt string.",
    commonMistake:
      "'string' ohne undefined ist die Standardannahme vieler Entwickler. " +
      "Ohne die Option stimmt das auch. Aber mit der Option wird TypeScript " +
      "vorsichtiger — was zur Laufzeit korrekter ist.",
  },

  // Frage 14: filter mit Type Predicate
  13: {
    whyCorrect:
      "Ab TypeScript 5.5 erkennt filter() bei einfachen typeof-Checks automatisch " +
      "Inferred Type Predicates. Der Callback `x => typeof x === \"string\"` wird " +
      "als Type Guard inferiert, sodass das Ergebnis string[] ist. " +
      "Bei komplexeren Bedingungen braucht man weiterhin explizite Type Predicates.",
    commonMistake:
      "(string | number)[] war vor TS 5.5 die korrekte Antwort. " +
      "Wer mit aelteren TypeScript-Versionen gelernt hat, erwartet noch das alte Verhalten. " +
      "Ab 5.5 ist der Compiler schlauer bei einfachen typeof/instanceof-Checks in filter().",
  },

  // Frage 15: Warum kein Tuple?
  14: {
    whyCorrect:
      "TypeScript geht davon aus, dass Arrays nach der Deklaration veraendert " +
      "werden. push(), pop(), splice() wuerden auf einem Tuple-Typ scheitern. " +
      "'const' schuetzt nur die Variable selbst (p = [3, 4] geht nicht), " +
      "aber nicht den Inhalt (p.push(3) geht). 'as const' macht beides: " +
      "readonly Tuple mit Literal-Typen.",
    commonMistake:
      "Die Verwechslung von const (Variablenbindung) mit Immutabilitaet " +
      "(Inhalt) ist einer der haeufigsten Denkfehler. In JavaScript ist " +
      "const wie ein Namensschild, das fest an der Wand haengt — " +
      "aber der Gegenstand dahinter kann sich trotzdem aendern.",
  },
};
