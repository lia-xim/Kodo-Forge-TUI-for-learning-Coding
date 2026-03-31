/**
 * Lektion 12 — Quiz-Daten: Discriminated Unions
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "12";
export const lessonTitle = "Discriminated Unions";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Grundlagen ---
  {
    question: "Was sind die drei Zutaten einer Discriminated Union?",
    options: [
      "Interface, extends, implements",
      "Tag-Property mit Literal Type, Union Type, Narrowing",
      "class, abstract, instanceof",
      "enum, switch, default",
    ],
    correct: 1,
    explanation:
      "Eine Discriminated Union braucht: (1) ein gemeinsames Tag-Property mit " +
      "unterschiedlichen Literal-Werten pro Variante, (2) einen Union Type, " +
      "und (3) Narrowing durch Pruefen des Diskriminators.",
  },

  // --- Frage 2: Diskriminator-Typ ---
  {
    question: "Welcher Wert ist NICHT als Diskriminator gueltig?",
    options: [
      '"circle" (String Literal)',
      "200 (Number Literal)",
      "true (Boolean Literal)",
      'string (allgemeiner Typ)',
    ],
    correct: 3,
    explanation:
      "Der Diskriminator muss ein LITERAL Type sein — ein einzelner, " +
      "konkreter Wert. 'string' ist zu breit: TypeScript kann damit " +
      "nicht zwischen Varianten unterscheiden. String/Number/Boolean " +
      "Literals funktionieren alle.",
  },

  // --- Frage 3: Narrowing ---
  {
    question: "Was passiert im else-Branch nach `if (msg.kind === 'text')`?",
    code: 'type Message = { kind: "text"; content: string } | { kind: "image"; url: string };\nif (msg.kind === "text") { ... } else { ... }',
    options: [
      "msg hat Typ Message",
      'msg hat Typ { kind: "image"; url: string }',
      "msg hat Typ never",
      "msg hat Typ unknown",
    ],
    correct: 1,
    explanation:
      "TypeScript eliminiert die 'text'-Variante im else-Branch. " +
      "Da nur 'image' uebrig bleibt, ist msg automatisch der ImageMessage-Typ. " +
      "Das ist Narrowing by Elimination — dasselbe Prinzip wie in L11.",
  },

  // --- Frage 4: assertNever ---
  {
    question: "Wann zeigt assertNever(shape) im default-Branch einen Compile-Error?",
    options: [
      "Immer — assertNever wirft immer einen Error",
      "Wenn ALLE Faelle im switch behandelt sind",
      "Wenn NICHT alle Faelle behandelt sind",
      "Nur bei String-Diskriminatoren",
    ],
    correct: 2,
    explanation:
      "assertNever erwartet den Typ 'never'. Wenn alle Faelle behandelt sind, " +
      "ist der Wert im default-Branch tatsaechlich 'never' — kein Error. " +
      "Fehlt ein Fall, hat der Wert noch einen konkreten Typ und ist " +
      "NICHT 'never' zuweisbar — Compile-Error!",
    code: "function assertNever(value: never): never {\n  throw new Error(`Unbehandelt: ${value}`);\n}",
  },

  // --- Frage 5: Exhaustive Check ---
  {
    question: "Was passiert, wenn du einen neuen Typ zur Union hinzufuegst und assertNever verwendest?",
    options: [
      "Nichts — der neue Typ wird ignoriert",
      "Laufzeit-Fehler beim naechsten Aufruf",
      "Compile-Error an jeder Stelle mit assertNever wo der neue Typ nicht behandelt wird",
      "TypeScript fuegt automatisch einen case-Branch hinzu",
    ],
    correct: 2,
    explanation:
      "Das ist die Staerke des Exhaustive Checks: Jeder switch mit assertNever " +
      "im default zeigt einen Compile-Error wenn ein neuer Typ nicht behandelt wird. " +
      "Der Compiler fuehrt dich zu ALLEN Stellen die aktualisiert werden muessen.",
  },

  // --- Frage 6: Option<T> ---
  {
    question: "Was ist der Vorteil von Option<T> gegenueber T | null?",
    options: [
      "Option<T> ist schneller zur Laufzeit",
      "Option<T> erzwingt die Pruefung beider Faelle durch den Diskriminator",
      "Option<T> braucht weniger Speicher",
      "Option<T> funktioniert mit Generics, T | null nicht",
    ],
    correct: 1,
    explanation:
      "Option<T> mit dem Tag 'some'/'none' erzwingt eine explizite Pruefung: " +
      "Du kannst auf value nicht zugreifen, ohne vorher den Tag zu pruefen. " +
      "Bei T | null kannst du den null-Check vergessen — der Compiler warnt " +
      "nur mit strictNullChecks.",
    code: 'type Option<T> = { tag: "some"; value: T } | { tag: "none" };',
  },

  // --- Frage 7: Result<T, E> ---
  {
    question: "Was ist der Hauptvorteil von Result<T, E> gegenueber try/catch?",
    options: [
      "Result ist schneller",
      "Der Fehlertyp E ist Teil der Funktionssignatur",
      "Result kann async sein",
      "try/catch funktioniert nicht mit Discriminated Unions",
    ],
    correct: 1,
    explanation:
      "Bei try/catch ist der Error-Typ 'unknown' — die Signatur verraet nicht, " +
      "welche Fehler auftreten koennen. Bei Result<T, E> ist der Fehlertyp E " +
      "explizit in der Signatur — der Aufrufer WEISS was schiefgehen kann " +
      "und MUSS es behandeln.",
    code: "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };",
  },

  // --- Frage 8: Sum Type vs Product Type ---
  {
    question: "Was ist ein Sum Type in TypeScript?",
    options: [
      "Ein Interface mit vielen Properties",
      "Eine Discriminated Union (ODER-Verknuepfung)",
      "Ein Tuple mit fester Laenge",
      "Eine generische Klasse",
    ],
    correct: 1,
    explanation:
      "Sum Type = ODER-Verknuepfung: Genau EINE Variante ist aktiv. " +
      "Product Type = UND-Verknuepfung: ALLE Properties gleichzeitig. " +
      "Ein Interface ist ein Product Type. Eine Discriminated Union ist " +
      "ein Sum Type. Zusammen bilden sie Algebraische Datentypen (ADTs).",
  },

  // --- Frage 9: Impossible States ---
  {
    question: 'Was bedeutet "Make impossible states impossible"?',
    options: [
      "Alle Variablen readonly machen",
      "Zustaende so modellieren, dass ungueltige Kombinationen vom Typsystem verhindert werden",
      "Jeden Error mit try/catch abfangen",
      "Alle Inputs validieren",
    ],
    correct: 1,
    explanation:
      "Statt { isLoading: boolean; data: T | null; error: string | null } " +
      "(16 Kombinationen, die meisten ungueltig) verwendet man eine " +
      "Discriminated Union mit genau den gueltigen Zustaenden. " +
      "Der Compiler verhindert dann unsinnige Kombinationen.",
  },

  // --- Frage 10: AsyncState ---
  {
    question: "Wie viele gueltige Zustaende hat AsyncState<T> als Discriminated Union?",
    code: 'type AsyncState<T> =\n  | { status: "idle" }\n  | { status: "loading" }\n  | { status: "error"; error: string }\n  | { status: "success"; data: T };',
    options: [
      "2 (loading/success)",
      "3 (loading/error/success)",
      "4 (idle/loading/error/success)",
      "Unendlich viele",
    ],
    correct: 2,
    explanation:
      "Genau 4 Zustaende — alle sinnvoll. Zum Vergleich: Eine flache " +
      "Struktur mit { isLoading: boolean; isError: boolean; data: T | null; " +
      "error: string | null } hat 2^4 = 16 Kombinationen, von denen " +
      "die meisten ungueltig sind.",
  },

  // --- Frage 11: Destrukturierung und Narrowing ---
  {
    question: "Was passiert beim Narrowing nach Destrukturierung des Diskriminators?",
    code: 'const { kind } = shape;\nif (kind === "circle") {\n  // shape.radius? \n}',
    options: [
      "shape wird korrekt zu Circle narrowed",
      "TypeScript verliert die Verbindung — shape bleibt Shape",
      "Compile-Error bei der Destrukturierung",
      "kind hat Typ never",
    ],
    correct: 1,
    explanation:
      "Bei Destrukturierung geht die Verbindung zwischen der Variable " +
      "'kind' und dem Original-Objekt 'shape' verloren. TypeScript kann " +
      "shape nicht narrowen, auch wenn kind gecheckt wird. " +
      "Loesung: Direkt shape.kind pruefen statt destrukturieren.",
  },

  // --- Frage 12: Redux Actions ---
  {
    question: "Was ist der Diskriminator bei Redux/NgRx Action Types?",
    options: [
      'Das Property "action"',
      'Das Property "type"',
      'Das Property "kind"',
      'Das Property "payload"',
    ],
    correct: 1,
    explanation:
      "Redux/NgRx verwenden konventionell 'type' als Diskriminator " +
      "fuer Actions. Jede Action hat einen eindeutigen type-String " +
      "(z.B. 'ADD_TODO', 'SET_FILTER'). Das payload ist der " +
      "variantenspezifische Datenteil.",
    code: 'type Action = { type: "INCREMENT" } | { type: "ADD"; payload: { amount: number } };',
  },

  // --- Frage 13: Extract Utility ---
  {
    question: "Was ergibt Extract<Shape, { kind: 'circle' }>?",
    code: 'type Shape = { kind: "circle"; radius: number } | { kind: "rectangle"; width: number; height: number };',
    options: [
      "Shape (unveraendert)",
      '{ kind: "circle"; radius: number }',
      '{ kind: "rectangle"; width: number; height: number }',
      "never",
    ],
    correct: 1,
    explanation:
      "Extract<T, U> zieht aus einem Union T alle Mitglieder heraus, " +
      "die U zuweisbar sind. Extract<Shape, { kind: 'circle' }> " +
      "extrahiert die Circle-Variante. Das Gegenteil ist " +
      "Exclude<Shape, { kind: 'circle' }> — das gibt Rectangle zurueck.",
  },

  // --- Frage 14: Tag-Property Name ---
  {
    question: "Welchen Namen sollte das Tag-Property haben?",
    options: [
      'Es MUSS "type" heissen',
      'Es MUSS "kind" heissen',
      "Der Name ist frei waehlbar — Konsistenz ist wichtig",
      'Es MUSS "__tag" heissen',
    ],
    correct: 2,
    explanation:
      "TypeScript schreibt keinen bestimmten Namen vor. Gaengige " +
      "Konventionen sind 'type', 'kind', 'tag', 'status'. Wichtig ist " +
      "nur Konsistenz innerhalb des Projekts. Redux verwendet 'type', " +
      "viele Libraries verwenden 'kind'.",
  },

  // --- Frage 15: Herkunft ---
  {
    question: "Aus welcher Programmier-Tradition stammen Discriminated Unions?",
    options: [
      "Objektorientierte Programmierung (Java, C#)",
      "Funktionale Programmierung (Haskell, ML, Rust)",
      "Prozedurale Programmierung (C, Pascal)",
      "Logische Programmierung (Prolog)",
    ],
    correct: 1,
    explanation:
      "Discriminated Unions (Sum Types / Algebraische Datentypen) kommen " +
      "aus ML (1973) und wurden in Haskell perfektioniert. Rust hat sie " +
      "mainstream-tauglich gemacht. TypeScript braucht keine neue Syntax — " +
      "Union Types + Literal Types + Control Flow Analysis reichen.",
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
      "Die drei Zutaten sind unverzichtbar: Ohne Tag-Property kein Narrowing, " +
      "ohne Union keine Fallunterscheidung, ohne Narrowing kein Zugriff auf " +
      "variantenspezifische Properties.",
    commonMistake:
      "Viele denken an class/extends/instanceof. Das ist OOP-Polymorphismus — " +
      "nicht dasselbe wie Discriminated Unions.",
  },
  1: {
    whyCorrect:
      "TypeScript braucht KONKRETE Werte um Varianten zu unterscheiden. " +
      "'string' ist zu breit — TS kann nicht wissen welche Variante gemeint ist.",
    commonMistake:
      "Manche verwenden 'type: string' und wundern sich, warum das " +
      "Narrowing nicht funktioniert. Der Diskriminator muss literal sein.",
  },
  2: {
    whyCorrect:
      "Control Flow Analysis eliminiert die 'text'-Variante im else-Branch. " +
      "Was uebrig bleibt ist automatisch der verbleibende Typ.",
    commonMistake:
      "Viele erwarten, dass msg im else-Branch noch Message ist. " +
      "TypeScript ist praeziser — es schraenkt auf die verbleibenden Varianten ein.",
  },
  3: {
    whyCorrect:
      "assertNever erwartet 'never'. Wenn ein case fehlt, hat der Wert " +
      "im default noch einen konkreten Typ — nicht 'never'. " +
      "Deshalb der Compile-Error.",
    commonMistake:
      "Manche denken, assertNever zeigt IMMER einen Error. Es zeigt nur " +
      "dann einen Error, wenn nicht alle Faelle behandelt sind.",
  },
  4: {
    whyCorrect:
      "Der Exhaustive Check ist ein Sicherheitsnetz fuer die gesamte " +
      "Codebasis. Jeder switch mit assertNever wird vom Compiler " +
      "ueberprueft wenn die Union erweitert wird.",
    commonMistake:
      "Viele glauben, man muesste alle switch-Stellen manuell suchen. " +
      "assertNever macht das automatisch — der Compiler findet sie alle.",
  },
  5: {
    whyCorrect:
      "Option<T> mit Diskriminator erzwingt die Pruefung. " +
      "Du MUSST den Tag pruefen bevor du auf value zugreifst.",
    commonMistake:
      "Manche halten Option fuer ueberfluessig weil T | null existiert. " +
      "Der Unterschied: Option erzwingt die Pruefung strukturell.",
  },
  6: {
    whyCorrect:
      "Der Fehlertyp in der Signatur macht Fehlerbehandlung zum " +
      "First-Class-Konzept. Der Aufrufer sieht WELCHE Fehler " +
      "auftreten koennen.",
    commonMistake:
      "Viele denken, try/catch reiche aus. Aber der Error-Typ in catch " +
      "ist 'unknown' — man weiss nicht was schiefging.",
  },
  7: {
    whyCorrect:
      "Sum Type = ODER: Genau eine Variante ist aktiv. " +
      "Product Type = UND: Alle Properties sind gleichzeitig da. " +
      "Die Namen kommen aus der Kardinalitaet der moeglichen Werte.",
    commonMistake:
      "Sum und Product werden verwechselt. Merkhilfe: " +
      "Union = Addition (Sum), Interface = Multiplikation (Product).",
  },
  8: {
    whyCorrect:
      "Discriminated Unions eliminieren unsinnige Zustandskombinationen. " +
      "Der Typ REPRAESENTIERT nur gueltige Zustaende.",
    commonMistake:
      "Manche verwechseln Input-Validierung mit Typsicherheit. " +
      "Validierung ist Laufzeit, Discriminated Unions sind Compile-Zeit.",
  },
  9: {
    whyCorrect:
      "4 explizite Varianten statt 16 implizite Kombinationen. " +
      "Jede Variante hat genau die Properties die sinnvoll sind.",
    commonMistake:
      "Manche zaehlen nur loading/error/success und vergessen 'idle'. " +
      "Der Anfangszustand vor dem ersten Laden ist wichtig.",
  },
  10: {
    whyCorrect:
      "Destrukturierung trennt den Wert vom Objekt. TypeScript kann " +
      "die separate Variable nicht zurueck zum Objekt verfolgen.",
    commonMistake:
      "Viele destrukturieren gewohnheitsmaessig und wundern sich " +
      "dann, warum das Narrowing nicht funktioniert.",
  },
  11: {
    whyCorrect:
      "'type' ist die Konvention bei Redux/NgRx — jede Action hat " +
      "einen eindeutigen type-String als Diskriminator.",
    commonMistake:
      "Manche verwechseln 'type' (Diskriminator) mit 'payload' (Daten). " +
      "payload ist der variantenspezifische Teil, nicht der Diskriminator.",
  },
  12: {
    whyCorrect:
      "Extract<T, U> filtert den Union T auf Mitglieder die zu U passen. " +
      "Hier: Nur die Variante mit kind='circle' bleibt uebrig.",
    commonMistake:
      "Extract wird mit Exclude verwechselt. " +
      "Extract = behalten was passt, Exclude = entfernen was passt.",
  },
  13: {
    whyCorrect:
      "TypeScript schreibt keinen Namen vor. Konsistenz im Projekt " +
      "ist wichtiger als der konkrete Name.",
    commonMistake:
      "Manche glauben, nur 'type' funktioniere als Diskriminator. " +
      "Jeder Name funktioniert — solange die Werte Literal Types sind.",
  },
  14: {
    whyCorrect:
      "ML (1973) fuehrte algebraische Datentypen ein. Haskell, Rust " +
      "und TypeScript uebernahmen das Konzept.",
    commonMistake:
      "Manche verwechseln Discriminated Unions mit OOP-Vererbung. " +
      "Beide loesen aehnliche Probleme, aber mit voellig verschiedenen Ansaetzen.",
  },
};
