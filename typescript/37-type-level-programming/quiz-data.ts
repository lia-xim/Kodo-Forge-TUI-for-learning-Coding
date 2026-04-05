// quiz-data.ts — L37: Type-Level Programming
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "37";
export const lessonTitle = "Type-Level Programming";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Turing-Vollstaendigkeit — correct: 0 ---
  {
    question: "Was bedeutet es dass TypeScript's Typsystem Turing-vollstaendig ist?",
    options: [
      "Es kann jede berechenbare Funktion als Typ ausdruecken — mit Conditional Types, Rekursion und Mapped Types",
      "Es kann JavaScript-Code schneller ausfuehren als andere Compiler",
      "Es unterstuetzt alle JavaScript-Features ohne Einschraenkungen",
      "Es kann Runtime-Typpruefungen durchfuehren",
    ],
    correct: 0,
    explanation:
      "Turing-Vollstaendigkeit bedeutet dass das Typsystem Variablen (Type Aliases), " +
      "Bedingungen (Conditional Types), Schleifen (Rekursion) und Datenstrukturen (Tuples) hat.",
    elaboratedFeedback: {
      whyCorrect: "Das Typsystem hat alle Bausteine einer Programmiersprache: Variablen, Bedingungen, Schleifen, Datenstrukturen und Funktionen. Es kann theoretisch jeden Algorithmus ausdruecken.",
      commonMistake: "Turing-Vollstaendigkeit hat nichts mit Runtime-Performance zu tun. Es ist eine Eigenschaft des Typsystems, nicht der Laufzeit."
    }
  },

  // --- Frage 2: Tuple-Length-Trick — correct: 0 ---
  {
    question: "Wie repraesentiert man Zahlen auf Type-Level in TypeScript?",
    options: [
      "Durch Tuple-Laengen — ein Tuple [unknown, unknown, unknown] hat die Literal-Laenge 3",
      "Durch numerische Literal Types wie type Three = 3",
      "Durch String-Parsing von Zahlenwerten",
      "TypeScript kann keine Zahlen auf Type-Level darstellen",
    ],
    correct: 0,
    explanation:
      "Der Tuple-Length-Trick nutzt die Tatsache dass TypeScript die exakte Laenge von " +
      "Tuples kennt. Durch Manipulation der Tuple-Laenge (Elemente hinzufuegen/entfernen) " +
      "kann man Arithmetik simulieren.",
    elaboratedFeedback: {
      whyCorrect: "Tuples haben Literal-Laengen: [unknown, unknown]['length'] = 2 (nicht number). Addition = Tuples zusammenfuegen, Subtraktion = Elemente entfernen via infer.",
      commonMistake: "Numerische Literal Types (type Three = 3) repraesentieren die Zahl, aber man kann damit nicht rechnen. 3 + 4 geht nicht direkt — nur ueber Tuples."
    }
  },

  // --- Frage 3: String-Parsing — correct: 0 ---
  {
    question: "Welche TypeScript-Features ermoeglichen String-Parsing auf Type-Level?",
    options: [
      "Template Literal Types kombiniert mit infer in Conditional Types",
      "Regulaere Ausdruecke auf Type-Level",
      "Die String.prototype Methoden in Type Utilities",
      "Spezielle Compiler-Flags fuer String-Analyse",
    ],
    correct: 0,
    explanation:
      "Template Literal Types + infer ist die Kombination: " +
      "S extends `${infer Head}/${infer Tail}` zerlegt einen String an '/'. " +
      "Rekursion ermoeglicht beliebig tiefes Parsing.",
    elaboratedFeedback: {
      whyCorrect: "Template Literal Types machen Strings strukturiert: `${infer A}:${infer B}` matcht 'key:value' und extrahiert A='key', B='value'. Zusammen mit Rekursion kann man ganze Parser bauen.",
      commonMistake: "TypeScript hat keine RegExp auf Type-Level. String-Parsing funktioniert ausschliesslich ueber Template Literal Types und Pattern Matching mit infer."
    }
  },

  // --- Frage 4: BuildTuple — correct: 0 ---
  {
    question: "Warum braucht BuildTuple<N> einen Accumulator-Parameter?",
    options: [
      "Weil TypeScript N-1 auf Type-Level nicht berechnen kann — der Accumulator zaehlt ueber seine Laenge",
      "Weil TypeScript keine Rekursion ohne Accumulator unterstuetzt",
      "Weil der Accumulator die Performance verbessert",
      "Weil der Compiler sonst die Typinferenz nicht durchfuehren kann",
    ],
    correct: 0,
    explanation:
      "TypeScript kann nicht 'N minus 1' berechnen. Stattdessen fuegt der Accumulator " +
      "ein Element pro Rekursionsschritt hinzu und prueft ob Acc['length'] === N.",
    elaboratedFeedback: {
      whyCorrect: "BuildTuple<5> startet mit Acc=[]. Jeder Schritt: [...Acc, unknown]. Abbruch wenn Acc['length'] extends 5. Das umgeht die fehlende Subtraktion auf Type-Level.",
      commonMistake: "Der Accumulator verbessert nicht die Performance direkt — er ermoeglicht Tail-Call-Optimierung durch den Compiler (seit TS 4.5), was die Rekursionstiefe von ~50 auf ~1000 erhoeht."
    }
  },

  // --- Frage 5: infer — correct: 1 ---
  {
    question: "Was ist der Unterschied zwischen `T extends U ? X : Y` und `T extends infer U ? X : Y`?",
    options: [
      "Es gibt keinen Unterschied",
      "Ohne infer prueft man gegen einen bekannten Typ U — mit infer wird U aus T extrahiert",
      "infer macht den Typ nullable",
      "infer ist nur fuer Funktionstypen verfuegbar",
    ],
    correct: 1,
    explanation:
      "Ohne infer ist U ein fester Typ zum Vergleich. Mit infer wird U zur Typ-Variable " +
      "die aus der Struktur von T extrahiert wird — wie Destructuring auf Type-Level.",
    elaboratedFeedback: {
      whyCorrect: "T extends Array<infer U> extrahiert U aus T. T extends Array<string> prueft nur ob T ein string-Array ist. infer = 'binde diese Variable an den passenden Typ'.",
      commonMistake: "infer ist nicht auf Funktionstypen beschraenkt. Es funktioniert ueberall in Conditional Types: Arrays, Objekte, Template Literals, Tuples."
    }
  },

  // --- Frage 6: infer mit Constraint — correct: 1 ---
  {
    question: "Was bewirkt `infer K extends string` (seit TypeScript 4.7)?",
    options: [
      "Es erzwingt dass K ein String-Literal sein muss",
      "K wird inferiert UND muss gleichzeitig den Constraint string erfuellen",
      "Es ist syntaktischer Zucker fuer eine Union mit string",
      "Es schraenkt die Rekursionstiefe ein",
    ],
    correct: 1,
    explanation:
      "infer K extends string kombiniert Inferenz und Constraint in einer Zeile. " +
      "Ohne den Constraint: `infer K` gefolgt von `K extends string ? K : never`.",
    elaboratedFeedback: {
      whyCorrect: "Statt zwei verschachtelte Conditional Types (infer K, dann K extends string) genuegt einer. Der Compiler prueft den Constraint direkt bei der Inferenz.",
      commonMistake: "Es erzwingt nicht dass K ein String-LITERAL ist — es erzwingt dass K dem Typ string zuweisbar ist. Das schliesst string-Literals ein, aber auch den Typ string selbst."
    }
  },

  // --- Frage 7: Rekursionslimit — correct: 1 ---
  {
    question: "Seit welcher TypeScript-Version wurde die Rekursionstiefe fuer Typen von ~50 auf ~1000 erhoeht?",
    options: [
      "TypeScript 4.1 mit Template Literal Types",
      "TypeScript 4.5 mit Tail-Call Elimination fuer Conditional Types",
      "TypeScript 5.0 mit Decorators",
      "TypeScript 3.7 mit Recursive Type Aliases",
    ],
    correct: 1,
    explanation:
      "TypeScript 4.5 fuehrte Tail-Call Elimination fuer Conditional Types ein. " +
      "Wenn der rekursive Aufruf die letzte Operation ist, optimiert der Compiler.",
    elaboratedFeedback: {
      whyCorrect: "TS 4.5 erkennt tail-recursive Conditional Types und vermeidet den Stack-Aufbau. Vorher brach die Rekursion bei ~50 ab. Das Accumulator-Pattern profitiert direkt davon.",
      commonMistake: "TS 3.7 erlaubte rekursive Type Aliases, aber die Tiefe blieb bei ~50. TS 4.1 brachte Template Literals. Erst TS 4.5 brachte die Tiefenoptimierung."
    }
  },

  // --- Frage 8: PathOf — correct: 1 ---
  {
    question: "Was erzeugt PathOf<{ a: { b: { c: string } } }>?",
    options: [
      "Nur den tiefsten Pfad: 'a.b.c'",
      "Alle Pfade als Union: 'a' | 'a.b' | 'a.b.c'",
      "Ein Array aller Pfade: ['a', 'a.b', 'a.b.c']",
      "Nur die Blaetter: 'c'",
    ],
    correct: 1,
    explanation:
      "PathOf erzeugt eine Union aller moeglichen Pfade — von der Wurzel bis zu jedem " +
      "verschachtelten Property. Das ermoeglicht Autocomplete fuer get(obj, 'a.b.c').",
    elaboratedFeedback: {
      whyCorrect: "PathOf ist rekursiv: Fuer jedes Property wird sowohl der aktuelle Pfad ('a') als auch die verschachtelten Pfade ('a.b', 'a.b.c') in die Union aufgenommen.",
      commonMistake: "PathOf gibt keine Arrays zurueck — es erzeugt eine String-Literal-Union. Das ist wichtig fuer Typ-Narrowing und Autocomplete in IDEs."
    }
  },

  // --- Frage 9: NTuple — correct: 2 ---
  {
    question: "Was ist der Typ von NTuple<number, 3>?",
    options: [
      "number[]",
      "Array<number>",
      "[number, number, number]",
      "[3, 3, 3]",
    ],
    correct: 2,
    explanation:
      "NTuple<T, N> erzeugt ein Tuple mit exakt N Elementen vom Typ T. " +
      "NTuple<number, 3> = [number, number, number] — ein Tuple, kein Array.",
    elaboratedFeedback: {
      whyCorrect: "Der Unterschied ist entscheidend: [number, number, number] hat die Literal-Laenge 3. number[] hat die Laenge 'number' (unbekannt). Nur Tuples erzwingen die exakte Elementanzahl.",
      commonMistake: "Manche verwechseln [3, 3, 3] (ein Tuple mit drei Literal-Werten 3) mit [number, number, number] (ein Tuple mit drei number-Slots). NTuple erzeugt Letzteres."
    }
  },

  // --- Frage 10: UnionToIntersection — correct: 2 ---
  {
    question: "Wie funktioniert UnionToIntersection<A | B> technisch?",
    options: [
      "Durch spezielle Compiler-Unterstuetzung fuer Union-Typen",
      "Durch Mapped Types die ueber die Union iterieren",
      "Durch kontravariante Position — Funktions-Parameter werden bei Union zu Intersection",
      "Durch Template Literal Types die Unions zusammenfuegen",
    ],
    correct: 2,
    explanation:
      "Funktions-Parameter sind kontravariant. (x: A) => void | (x: B) => void ergibt " +
      "bei infer: x muss sowohl A als auch B erfuellen → A & B.",
    elaboratedFeedback: {
      whyCorrect: "Der Trick nutzt Varianz (L22): In kontravarianter Position wird eine Union zu einer Intersection. Das ist kein Bug — es ist mathematisch korrekt und vom Compiler beabsichtigt.",
      commonMistake: "Viele denken UnionToIntersection sei ein spezieller Compiler-Trick. Es ist reines Typ-System-Verhalten basierend auf Kontravarianz — keine Magie, nur Mathematik."
    }
  },

  // --- Frage 11: Replace — correct: 2 ---
  {
    question: "Was ergibt Replace<'hello-world-foo', '-', '_'>?",
    options: [
      "'hello_world_foo' — alle Vorkommen ersetzt",
      "'hello_world-foo' — nur erstes Vorkommen ersetzt",
      "'hello-world_foo' — nur letztes Vorkommen ersetzt",
      "Ein Compile-Error",
    ],
    correct: 1,
    explanation:
      "Replace ersetzt nur das ERSTE Vorkommen. Fuer alle Vorkommen braucht man " +
      "ReplaceAll mit Rekursion: Nach dem Ersetzen weitersuchen bis nichts mehr matcht.",
    elaboratedFeedback: {
      whyCorrect: "S extends `${infer Before}-${infer After}` matcht den ERSTEN '-'. Before='hello', After='world-foo'. Ergebnis: 'hello_world-foo'. Fuer alle: Rekursion noetig.",
      commonMistake: "Viele erwarten dass Replace alle Vorkommen ersetzt — wie String.replaceAll(). Nein: Das Pattern matcht nur das erste Vorkommen. ReplaceAll braucht explizite Rekursion."
    }
  },

  // --- Frage 12: DeepReadonly — correct: 2 ---
  {
    question: "Warum muessen Funktionen in DeepReadonly<T> ausgenommen werden?",
    options: [
      "Weil Funktionen nicht readonly sein koennen",
      "Weil der Compiler Funktionen nicht rekursiv verarbeiten kann",
      "Weil DeepReadonly die Funktionssignatur kaputt machen wuerde (length, name Properties)",
      "Weil Funktionen immer immutable sind",
    ],
    correct: 2,
    explanation:
      "Funktionen haben Properties wie length und name. DeepReadonly wuerde deren " +
      "Signatur veraendern und sie unbrauchbar machen. Funktionen werden durchgelassen.",
    elaboratedFeedback: {
      whyCorrect: "Eine Funktion als 'object' behandeln wuerde { readonly length: number; readonly name: string; readonly [Symbol.hasInstance]: ... } erzeugen — das ist keine aufrufbare Funktion mehr.",
      commonMistake: "Funktionen sind NICHT automatisch immutable. Man kann fn.customProp = 'x' schreiben. Aber DeepReadonly soll Daten-Objekte schuetzen, nicht Funktionen umbauen."
    }
  },

  // --- Frage 13: Tail-Call — correct: 3 ---
  {
    question: "Was ist der Unterschied zwischen `[...Reverse<Rest>, First]` und `Reverse<Rest, [First, ...Acc]>`?",
    options: [
      "Kein Unterschied — beide erzeugen dasselbe Ergebnis",
      "Das erste ist schneller, das zweite ist korrekt",
      "Das erste funktioniert nur mit Arrays, das zweite mit Tuples",
      "Das erste ist nicht tail-recursive, das zweite ist es — was eine 20x hoehere Rekursionstiefe ermoeglicht",
    ],
    correct: 3,
    explanation:
      "Bei [...Reverse<Rest>, First] wird das Ergebnis noch verarbeitet (Spread). " +
      "Bei Reverse<Rest, [First, ...Acc]> ist die Rekursion die letzte Operation — " +
      "der Compiler erkennt den Tail-Call und optimiert.",
    elaboratedFeedback: {
      whyCorrect: "Tail-Call = der rekursive Aufruf IST das Ergebnis. Wenn drumherum noch [..., First] passiert, ist es kein Tail-Call. Mit Accumulator wandert das Ergebnis in den Parameter.",
      commonMistake: "Beide erzeugen dasselbe Ergebnis — der Unterschied ist die Rekursionstiefe. Ohne TCO: ~50, mit TCO: ~1000. Bei langen Listen macht das den Unterschied zwischen funktioniert und Compile-Error."
    }
  },

  // --- Frage 14: Praxis-Einsatz — correct: 3 ---
  {
    question: "Welches Type-Level-Pattern hat den hoechsten ROI in einem typischen Angular/React-Projekt?",
    options: [
      "Type-Level SQL-Parser fuer Datenbankzugriffe",
      "Arithmetik auf Type-Level fuer mathematische Operationen",
      "Rekursive DeepReadonly fuer alle Objekte",
      "Route-Parameter-Extraktion aus URL-Pfad-Strings",
    ],
    correct: 3,
    explanation:
      "Route-Parameter aus Pfad-Strings zu extrahieren ist sofort nutzbar, hat " +
      "geringen Komplexitaets-Overhead und verhindert echte Bugs (Tippfehler in " +
      "Parameternamen). Die anderen Optionen sind entweder Over-Engineering oder zu nischig.",
    elaboratedFeedback: {
      whyCorrect: "Jede Angular/React-App hat Routes. Parameter-Extraktion verhindert Bugs die erst zur Laufzeit auffallen wuerden. Bibliotheken wie typesafe-routes machen genau das.",
      commonMistake: "DeepReadonly fuer ALLE Objekte ist Over-Engineering. Es verlangsamt den Compiler und macht Code unflexibel. Gezielter Einsatz bei Configs und State ist besser."
    }
  },

  // --- Frage 15: Type-Level-Grenzen — correct: 3 ---
  {
    question: "Was ist die wichtigste Faustregel fuer Type-Level Programming in Produktion?",
    options: [
      "Moeglichst viel Logik auf Type-Level verschieben fuer maximale Sicherheit",
      "Type-Level Code nur verwenden wenn er in 5 Zeilen passt",
      "Nur fuer interne APIs verwenden, nie fuer oeffentliche",
      "Typisiere Schnittstellen (APIs, Router, ORMs), nicht Business-Logik",
    ],
    correct: 3,
    explanation:
      "Type-Level Programming hat den hoechsten ROI an Schnittstellen — dort wo " +
      "verschiedene Teile des Systems kommunizieren. Business-Logik gehoert auf " +
      "die Werteebene mit einfachen Typen.",
    elaboratedFeedback: {
      whyCorrect: "Schnittstellen sind stabil und werden oft aufgerufen — Type-Level-Sicherheit dort verhindert viele Bugs. Business-Logik aendert sich haeufig — komplexe Typen dort bremsen die Entwicklung.",
      commonMistake: "Maximale Typsicherheit ueberall klingt gut, ist aber kontraproduktiv. Compiler wird langsam, Fehlermeldungen werden unlesbar, neue Entwickler verstehen den Code nicht."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welches Keyword extrahiert Teile eines Typs in Conditional Types?",
    expectedAnswer: "infer",
    acceptableAnswers: ["infer"],
    explanation:
      "infer ist das TypeScript-Keyword fuer Type-Level Pattern Matching. " +
      "T extends Array<infer U> extrahiert den Element-Typ U aus einem Array-Typ.",
  },

  {
    type: "short-answer",
    question: "Wie heisst das mathematische Zahlensystem das nur Null und Nachfolger kennt und die Basis fuer Type-Level-Arithmetik ist?",
    expectedAnswer: "Peano-Arithmetik",
    acceptableAnswers: ["Peano-Arithmetik", "Peano Arithmetik", "Peano", "peano"],
    explanation:
      "Die Peano-Arithmetik definiert natuerliche Zahlen ueber Null und die Nachfolger-Funktion. " +
      "In TypeScript: Ein leeres Tuple ist 0, jedes hinzugefuegte Element ist ein Nachfolger.",
  },

  {
    type: "short-answer",
    question: "Welcher Utility-Typ wandelt eine Union A | B in eine Intersection A & B um?",
    expectedAnswer: "UnionToIntersection",
    acceptableAnswers: ["UnionToIntersection", "uniontointersection"],
    explanation:
      "UnionToIntersection nutzt kontravariante Funktions-Parameter: " +
      "(x: A) => void | (x: B) => void ergibt bei infer: A & B.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Welchen Typ hat Result?",
    code:
      "type Split<S extends string, D extends string> =\n" +
      "  S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];\n\n" +
      "type Result = Split<'a/b/c', '/'>;",
    expectedAnswer: "[\"a\", \"b\", \"c\"]",
    acceptableAnswers: [
      "[\"a\", \"b\", \"c\"]",
      "['a', 'b', 'c']",
      "[a, b, c]",
    ],
    explanation:
      "Split zerlegt 'a/b/c' an '/': H='a', T='b/c'. Rekursiv: H='b', T='c'. " +
      "Basisfall: [S]=['c']. Ergebnis: ['a', 'b', 'c'].",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat Sum?",
    code:
      "type BuildTuple<N extends number, A extends unknown[] = []> =\n" +
      "  A['length'] extends N ? A : BuildTuple<N, [...A, unknown]>;\n\n" +
      "type Add<A extends number, B extends number> =\n" +
      "  [...BuildTuple<A>, ...BuildTuple<B>]['length'];\n\n" +
      "type Sum = Add<5, 3>;",
    expectedAnswer: "8",
    acceptableAnswers: ["8"],
    explanation:
      "BuildTuple<5> = [unknown x5], BuildTuple<3> = [unknown x3]. " +
      "Zusammen: [unknown x8]. Laenge: 8.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist Type-Level Programming am wertvollsten an Schnittstellen (APIs, Router, ORMs) " +
      "und nicht fuer Business-Logik?",
    modelAnswer:
      "Schnittstellen sind stabil, werden oft aufgerufen und sind fehleranfaellig (Tippfehler, " +
      "falsche Typen). Type-Level-Sicherheit dort verhindert ganze Fehlerkategorien. " +
      "Business-Logik aendert sich haeufig — komplexe Typen dort verlangsamen die Entwicklung, " +
      "machen Refactoring schwieriger und erzeugen unlesbare Fehlermeldungen. " +
      "Ausserdem verlangsamen komplexe Typ-Berechnungen den Compiler. Die Faustregel: " +
      "Je stabiler und oeffentlicher eine Schnittstelle, desto mehr lohnt sich Type-Level-Arbeit.",
    keyPoints: [
      "Schnittstellen sind stabil — Type-Level-Investition zahlt sich lange aus",
      "Business-Logik aendert sich oft — komplexe Typen bremsen Refactoring",
      "Compiler-Performance leidet bei tiefer Typ-Rekursion",
      "Unlesbare Fehlermeldungen verschlechtern die Developer Experience",
    ],
  },
];
