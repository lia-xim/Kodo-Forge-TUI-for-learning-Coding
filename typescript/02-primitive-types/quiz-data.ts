/**
 * Lektion 02 — Quiz-Daten: Primitive Types
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "02";
export const lessonTitle = "Primitive Types";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Grundlagen ---
  {
    question: "Welchen Typ sollte man in TypeScript fuer einen Textwert verwenden?",
    options: [
      "String (gross)",
      "string (klein)",
      "str",
      "text",
    ],
    correct: 1,
    explanation:
      "Immer 'string' (Kleinbuchstabe) verwenden. 'String' (gross) ist ein " +
      "Wrapper-Objekt aus JavaScript und fuehrt zu subtilen Bugs. Die Regel " +
      "gilt auch fuer number/Number und boolean/Boolean.",
  },

  // --- Frage 2: number-Praezision ---
  {
    question: "Was ist das Ergebnis von 0.1 + 0.2 === 0.3 in TypeScript?",
    options: [
      "true",
      "false",
      "Compile Error",
      "undefined",
    ],
    correct: 1,
    explanation:
      "false! Wegen IEEE 754 Gleitkomma-Arithmetik ergibt 0.1 + 0.2 den Wert " +
      "0.30000000000000004, nicht exakt 0.3. Das ist kein TypeScript-Problem, " +
      "sondern ein grundlegendes Problem der Gleitkommadarstellung.",
    code: "const ergebnis = 0.1 + 0.2 === 0.3;\nconsole.log(ergebnis); // ???",
  },

  // --- Frage 3: null vs undefined ---
  {
    question: "Was gibt typeof null in JavaScript/TypeScript zurueck?",
    options: [
      '"null"',
      '"undefined"',
      '"object"',
      '"NaN"',
    ],
    correct: 2,
    explanation:
      '"object" — das ist ein beruehmt-beruechtigter Bug aus den Anfaengen von ' +
      "JavaScript (1995). Er wurde nie behoben, weil zu viel existierender Code " +
      "davon abhaengt. typeof undefined gibt dagegen korrekt \"undefined\" zurueck.",
  },

  // --- Frage 4: any vs unknown — Zuweisung ---
  {
    question: "Welche Zuweisung verursacht einen TypeScript-Fehler?",
    options: [
      "let a: any = \"hallo\"; let b: string = a;",
      "let a: unknown = \"hallo\"; let b: string = a;",
      "let a: unknown = 42; let b: any = a;",
      "let a: any = true; let b: unknown = a;",
    ],
    correct: 1,
    explanation:
      "unknown kann NICHT direkt einem anderen Typ zugewiesen werden — " +
      "man muss erst pruefen (Type Narrowing). any dagegen kann ueberall " +
      "zugewiesen werden (unsicher!). unknown → any und any → unknown sind OK.",
    code: 'let a: unknown = "hallo";\nlet b: string = a; // Error?',
  },

  // --- Frage 5: any ist ansteckend ---
  {
    question: "Was ist der Typ von 'ergebnis' in diesem Code?",
    options: [
      "string",
      "number",
      "any",
      "unknown",
    ],
    correct: 2,
    explanation:
      "any ist ansteckend! Wenn quelle 'any' ist, dann ist quelle.name auch 'any', " +
      "und name.length ist auch 'any', und laenge + 1 ist auch 'any'. " +
      "Die gesamte Kette verliert den Typschutz. Das ist einer der Hauptgruende, " +
      "warum man any vermeiden sollte.",
    code:
      "let quelle: any = { name: \"Max\" };\n" +
      "let name = quelle.name;\n" +
      "let laenge = name.length;\n" +
      "let ergebnis = laenge + 1;",
  },

  // --- Frage 6: never-Typ ---
  {
    question: "Welcher Rueckgabetyp passt zu dieser Funktion?",
    options: [
      "void",
      "undefined",
      "never",
      "any",
    ],
    correct: 2,
    explanation:
      "never, weil die Funktion NIEMALS zurueckkehrt — sie wirft immer einen Error. " +
      "void bedeutet 'gibt nichts Sinnvolles zurueck', aber die Funktion kehrt " +
      "trotzdem zurueck. never bedeutet 'kehrt NIE zurueck'.",
    code:
      "function fail(msg: string): ??? {\n" +
      "  throw new Error(msg);\n" +
      "}",
  },

  // --- Frage 7: void vs undefined ---
  {
    question: "Welche Aussage ueber void ist KORREKT?",
    options: [
      "void und undefined sind dasselbe",
      "Eine void-Funktion darf kein return haben",
      "Callbacks mit void-Typ duerfen trotzdem Werte zurueckgeben",
      "void kann null zugewiesen werden",
    ],
    correct: 2,
    explanation:
      "Callbacks die als void typisiert sind, duerfen Werte zurueckgeben — " +
      "sie werden nur ignoriert. Deshalb funktioniert z.B. " +
      "arr.forEach(v => arr.push(v)), obwohl push eine number zurueckgibt " +
      "und forEach (value) => void erwartet.",
  },

  // --- Frage 8: Typ-Hierarchie ---
  {
    question: "Welche Aussage ueber die TypeScript-Typhierarchie ist RICHTIG?",
    options: [
      "any ist der Top Type",
      "unknown ist der Bottom Type",
      "never ist jedem Typ zuweisbar",
      "never ist keinem Typ zuweisbar",
    ],
    correct: 2,
    explanation:
      "never (Bottom Type) ist jedem Typ zuweisbar — weil ein never-Wert " +
      "nie existiert, ist die Zuweisung immer 'sicher'. unknown ist der Top Type " +
      "(nicht any!). any bricht die Regeln und ist weder Top noch Bottom. " +
      "Option D ist falsch: never IST jedem Typ zuweisbar (deshalb ist C richtig).",
  },

  // --- Frage 9: Nullish Coalescing ---
  {
    question: "Was ist der Unterschied zwischen || und ?? ?",
    options: [
      "Kein Unterschied, beide sind gleich",
      "|| prueft auf null/undefined, ?? prueft auf alle falsy-Werte",
      "?? prueft nur auf null/undefined, || prueft auf alle falsy-Werte",
      "?? funktioniert nur mit Strings",
    ],
    correct: 2,
    explanation:
      "?? (Nullish Coalescing) gibt den rechten Wert nur bei null oder undefined zurueck. " +
      "|| (logisches Oder) gibt den rechten Wert bei ALLEN falsy-Werten zurueck " +
      "(0, \"\", false, null, undefined, NaN). Deshalb ist 0 ?? 42 = 0, aber 0 || 42 = 42.",
    code: "const a = 0 || 42;   // ???\nconst b = 0 ?? 42;   // ???",
  },

  // --- Frage 10: Symbol ---
  {
    question: "Was ist das Ergebnis dieses Vergleichs?",
    options: [
      "true, weil beide die gleiche Beschreibung haben",
      "false, weil jedes Symbol einzigartig ist",
      "Compile Error",
      "undefined",
    ],
    correct: 1,
    explanation:
      "Jedes mit Symbol() erstellte Symbol ist EINZIGARTIG — auch wenn die " +
      "Beschreibung identisch ist. Die Beschreibung dient nur dem Debugging. " +
      "Wenn man gleiche Symbols braucht, muss man Symbol.for() verwenden: " +
      "Symbol.for('id') === Symbol.for('id') waere true.",
    code:
      'const a = Symbol("id");\n' +
      'const b = Symbol("id");\n' +
      "console.log(a === b); // ???",
  },

  // --- Frage 11: Type Widening ---
  {
    question: "Welchen Typ hat die Variable 'x' in diesem Code?",
    options: [
      'string',
      '"hallo"',
      'unknown',
      'any',
    ],
    correct: 1,
    explanation:
      'const-Variablen mit primitiven Werten bekommen einen LITERAL TYPE. ' +
      'Weil const sich nie aendern kann, weiss TypeScript: x ist GENAU "hallo" ' +
      'und nichts anderes. Bei "let x = \'hallo\'" waere der Typ dagegen "string", ' +
      'weil let sich aendern koennte. Das nennt man Type Widening.',
    code: 'const x = "hallo";\n// Was ist der Typ von x?',
  },

  // --- Frage 12: Type Widening bei Objekten ---
  {
    question: "Warum kompiliert diese Zuweisung NICHT?",
    options: [
      'Weil "GET" kein gueltiger string ist',
      'Weil method als string inferiert wird (Type Widening bei let)',
      'Weil const-Objekte nicht veraendert werden koennen',
      'Weil config.method readonly ist',
    ],
    correct: 1,
    explanation:
      'Obwohl config mit "const" deklariert ist, sind die PROPERTIES eines ' +
      'Objekts veraenderbar (man koennte config.method = "POST" schreiben). ' +
      'Deshalb inferiert TypeScript method als "string" (breit), nicht als "GET" ' +
      '(literal). Die Loesung: "as const" auf dem Wert oder eine explizite Typ-Annotation.',
    code:
      'type HttpMethod = "GET" | "POST";\n' +
      'const config = { method: "GET" };\n' +
      'function send(m: HttpMethod) {}\n' +
      'send(config.method); // Error!',
  },

  // --- Frage 13: Type Erasure ---
  {
    question: "Was passiert mit TypeScript-Typen zur Laufzeit?",
    options: [
      "Sie werden in JavaScript-Klassen umgewandelt",
      "Sie werden als Kommentare im Code beibehalten",
      "Sie werden komplett entfernt (Type Erasure)",
      "Sie werden in typeof-Pruefungen umgewandelt",
    ],
    correct: 2,
    explanation:
      "TypeScript-Typen existieren NUR zur Compilezeit. Beim Kompilieren werden " +
      "ALLE Typ-Annotationen, Interfaces und Type Aliases entfernt. Was uebrig " +
      "bleibt ist normales JavaScript. Das nennt man Type Erasure. Deshalb kann " +
      "man z.B. nicht 'if (x instanceof MyInterface)' schreiben — Interfaces " +
      "existieren zur Laufzeit nicht.",
  },

  // --- Frage 14: ?? vs || Falle ---
  {
    question: "Was ist der Wert von 'port' in diesem Code?",
    options: [
      "0",
      "3000",
      "undefined",
      "NaN",
    ],
    correct: 1,
    explanation:
      "Der ||-Operator prueft auf ALLE falsy-Werte (0, '', false, null, undefined, NaN). " +
      "Weil 0 falsy ist, gibt || den rechten Wert zurueck: 3000. " +
      "Mit ?? waere das Ergebnis 0, weil ?? NUR auf null und undefined prueft. " +
      "Das ist ein klassischer Bug bei Portnummern und Anzahlen!",
    code:
      "const config = { port: 0 };\n" +
      "const port = config.port || 3000;\n" +
      "// port = ???",
  },

  // --- Frage 15: as const ---
  {
    question: "Was ist der Typ von 'farben' in diesem Code?",
    options: [
      'string[]',
      '("rot" | "gruen" | "blau")[]',
      'readonly ["rot", "gruen", "blau"]',
      'readonly string[]',
    ],
    correct: 2,
    explanation:
      '"as const" macht drei Dinge: (1) Das Array wird readonly, ' +
      '(2) alle Elemente bekommen Literal Types, und (3) die Laenge wird fest. ' +
      'Der Typ ist also ein readonly Tuple mit exakt drei literal Elementen. ' +
      'Ohne "as const" waere der Typ nur string[]. ' +
      'Mit "typeof farben[number]" kann man daraus den Union Type "rot" | "gruen" | "blau" ableiten.',
    code: 'const farben = ["rot", "gruen", "blau"] as const;',
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
      "`string` (klein) ist der primitive Typ in TypeScript. " +
      "`String` (gross) ist ein JavaScript-Wrapper-Objekt, das subtile Bugs verursacht: " +
      "`typeof new String('x')` gibt 'object' zurueck, nicht 'string'.",
    commonMistake:
      "Aus Java oder C# kommend schreiben viele `String` gross. " +
      "In TypeScript/JavaScript ist das der Wrapper-Objekt-Typ — " +
      "IMMER die Kleinschreibung verwenden: string, number, boolean.",
  },
  1: {
    whyCorrect:
      "IEEE 754 Gleitkomma: 0.1 und 0.2 sind im Binaersystem nicht exakt darstellbar. " +
      "Ihre Summe ist 0.30000000000000004. Das gilt fuer ALLE Sprachen mit IEEE 754 " +
      "(JavaScript, Python, Java, C++, etc.).",
    commonMistake:
      "Viele denken, das sei ein JavaScript- oder TypeScript-Bug. " +
      "Es ist ein fundamentales Problem der Gleitkommadarstellung, das in fast " +
      "allen Programmiersprachen auftritt. Loesung: Fuer Geldbetraege Ganzzahl-Arithmetik (Cent) verwenden.",
  },
  2: {
    whyCorrect:
      "`typeof null` gibt `\"object\"` zurueck — ein Bug aus JavaScript 1.0 (1995). " +
      "In der ersten JS-Implementierung wurden Werte als Typ-Tag + Wert gespeichert. " +
      "null hatte das Tag 0 (wie Objekte), daher 'object'.",
    commonMistake:
      "Fast jeder erwartet `\"null\"`. Dieser Bug ist so alt und bekannt, " +
      "dass er zum 'Feature' geworden ist — er wird nie behoben, " +
      "weil zu viel existierender Code davon abhaengt.",
  },
  3: {
    whyCorrect:
      "`unknown` kann NICHT direkt einem spezifischen Typ zugewiesen werden. " +
      "Man muss erst Type Narrowing durchfuehren (z.B. typeof-Check). " +
      "Das ist der Kernunterschied zu `any`, das alle Pruefungen umgeht.",
    commonMistake:
      "Viele verwechseln die Zuweisung in beide Richtungen: " +
      "ALLES kann `unknown` zugewiesen werden (Empfang), aber `unknown` " +
      "kann NICHT an spezifische Typen zugewiesen werden (Weitergabe) — " +
      "ohne vorherige Pruefung.",
  },
  4: {
    whyCorrect:
      "`any` ist ansteckend: Jeder Ausdruck, der von einem `any`-Wert abgeleitet wird, " +
      "ist wieder `any`. Die gesamte Kette verliert den Typschutz. " +
      "Das ist der Hauptgrund, warum `any` so gefaehrlich ist.",
    commonMistake:
      "Viele denken, TypeScript wuerde bei `quelle.name` den Typ `string` infern, " +
      "weil zur Laufzeit tatsaechlich ein String drin steckt. " +
      "Aber TypeScript sieht nur den DEKLARIERTEN Typ (`any`), nicht den Laufzeitwert.",
  },
  5: {
    whyCorrect:
      "`never` bedeutet 'kehrt NIE zurueck'. Die Funktion wirft IMMER einen Error — " +
      "sie erreicht nie das Ende. `void` dagegen bedeutet 'gibt nichts Sinnvolles zurueck', " +
      "aber die Funktion kehrt trotzdem zurueck.",
    commonMistake:
      "Der haeufigste Fehler: `void` und `never` verwechseln. `void` = kommt zurueck " +
      "(mit undefined). `never` = kommt NIE zurueck (throw, Endlosschleife).",
  },
  6: {
    whyCorrect:
      "Callbacks mit void-Return-Typ duerfen Werte zurueckgeben — sie werden nur ignoriert. " +
      "Deshalb funktioniert `arr.forEach(v => arr.push(v))`: push gibt number zurueck, " +
      "aber forEach erwartet void — und das ist OK.",
    commonMistake:
      "Viele denken, void-Callbacks duerfen KEINEN Wert zurueckgeben. " +
      "Das wuerde aber viele gaengige Patterns brechen. " +
      "void als Callback-Return bedeutet: 'Mir ist egal was du zurueckgibst.'",
  },
  7: {
    whyCorrect:
      "`never` (Bottom Type) ist jedem Typ zuweisbar — das ist logisch korrekt, " +
      "weil ein never-Wert nie existiert. Man kann nichts zuweisen, was es nie gibt. " +
      "`unknown` ist der Top Type (nicht `any`!). `any` bricht die Typ-Regeln.",
    commonMistake:
      "Die meisten denken `any` sei der Top Type. `any` ist weder Top noch Bottom — " +
      "es ist ein 'Cheat Code' der die Typhierarchie umgeht. " +
      "`unknown` ist der echte Top Type.",
  },
  8: {
    whyCorrect:
      "`??` (Nullish Coalescing) gibt den rechten Wert NUR bei null oder undefined zurueck. " +
      "`||` gibt den rechten Wert bei ALLEN falsy-Werten (0, '', false, null, undefined, NaN). " +
      "Deshalb: 0 ?? 42 = 0, aber 0 || 42 = 42.",
    commonMistake:
      "Viele benutzen `||` gewohnheitsmaessig fuer Default-Werte. " +
      "Das funktioniert oft, aber bricht bei 0, '' oder false. " +
      "Der klassische Bug: `port || 3000` gibt 3000 auch bei Port 0.",
  },
  9: {
    whyCorrect:
      "Jedes mit `Symbol()` erstellte Symbol ist EINZIGARTIG. Die Beschreibung " +
      "dient nur dem Debugging — sie macht Symbols nicht gleich. " +
      "`Symbol.for('id')` wuerde ein geteiltes Symbol aus der globalen Registry zurueckgeben.",
    commonMistake:
      "Intuition: 'Gleiche Beschreibung = gleicher Wert'. " +
      "Bei Strings stimmt das, bei Symbols nicht. " +
      "Die Einzigartigkeit ist der ganze Sinn von Symbols.",
  },
  10: {
    whyCorrect:
      "const-Variablen mit primitiven Werten bekommen einen Literal Type. " +
      "Da `const x` sich nie aendern kann, weiss TypeScript: x ist GENAU \"hallo\" " +
      "und nichts anderes. Bei `let` waere der Typ `string` (Widening).",
    commonMistake:
      "Viele erwarten `string`, weil 'string ist der Typ von Textwerten'. " +
      "Der Literal Type `\"hallo\"` ist aber PRAEZISER — und bei const ist Praezision moeglich.",
  },
  11: {
    whyCorrect:
      "Obwohl `config` mit const deklariert ist, sind Objekt-Properties veraenderbar. " +
      "Man koennte `config.method = 'POST'` schreiben. Deshalb erweitert TypeScript " +
      "den Typ von `method` zu `string`, nicht `\"GET\"`. Das ist Property Widening.",
    commonMistake:
      "Fast jeder erwartet, dass const auch die Properties 'einfriert'. " +
      "const schuetzt nur die Variable (keine Neuzuweisung des Objekts), " +
      "nicht dessen Inhalt. Loesung: `as const` oder Object.freeze().",
  },
  12: {
    whyCorrect:
      "ALLE TypeScript-Typen werden bei der Kompilierung entfernt (Type Erasure). " +
      "Interfaces, Type Aliases, Generics, Typ-Annotationen — alles weg. " +
      "Zur Laufzeit ist alles pures JavaScript.",
    commonMistake:
      "Manche denken, Typen werden in typeof-Pruefungen oder Kommentare umgewandelt. " +
      "Nein — sie werden KOMPLETT entfernt. Keine Spur bleibt uebrig.",
  },
  13: {
    whyCorrect:
      "`||` prueft auf ALLE falsy-Werte. Da 0 falsy ist, gibt `0 || 3000` den Wert 3000 zurueck. " +
      "Mit `??` waere das Ergebnis 0, weil 0 weder null noch undefined ist. " +
      "Der klassische Port-Bug!",
    commonMistake:
      "Viele sehen `config.port || 3000` als sicheren Default-Wert. " +
      "Es funktioniert — ausser wenn der Port bewusst 0 ist (OS waehlt freien Port). " +
      "IMMER `??` fuer numerische und boolesche Defaults verwenden.",
  },
  14: {
    whyCorrect:
      "`as const` macht drei Dinge: (1) readonly Array, (2) Literal Types fuer Elemente, " +
      "(3) feste Laenge (Tuple). Der Typ ist `readonly [\"rot\", \"gruen\", \"blau\"]`. " +
      "Mit `typeof farben[number]` erhaelt man den Union `\"rot\" | \"gruen\" | \"blau\"`.",
    commonMistake:
      "Manche denken, `as const` macht nur readonly. " +
      "Die Literal-Typ-Beibehaltung und die Tuple-Konvertierung " +
      "werden oft uebersehen — sie sind aber der eigentliche Hauptnutzen.",
  },
};
