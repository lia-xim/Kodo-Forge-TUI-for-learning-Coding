/**
 * Lektion 23 — Quiz-Daten: Recursive Types
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 *
 * correct-Index-Verteilung: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "23";
export const lessonTitle = "Recursive Types";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Grundlagen (correct: 0) ---
  {
    question: "Was ist ein rekursiver Typ in TypeScript?",
    options: [
      "Ein Typ der sich selbst in seiner Definition referenziert",
      "Ein Typ der generische Parameter verwendet",
      "Ein Typ der nur zur Laufzeit existiert",
      "Ein Typ der mit typeof erstellt wird",
    ],
    correct: 0,
    explanation:
      "Ein rekursiver Typ referenziert sich selbst in seiner Definition, " +
      "z.B. type LinkedList<T> = { value: T; next: LinkedList<T> | null }. " +
      "Der Schluessel ist die Selbstreferenz kombiniert mit einer Abbruchbedingung.",
    elaboratedFeedback: {
      whyCorrect:
        "Rekursive Typen zeichnen sich durch Selbstreferenz aus — " +
        "der Typname taucht in seiner eigenen Definition auf. " +
        "LinkedList, Tree und JSON-Typ sind klassische Beispiele.",
      commonMistake:
        "Generics allein machen keinen Typ rekursiv. " +
        "type Wrapper<T> = { value: T } ist generisch, aber nicht rekursiv.",
    },
  },

  // --- Frage 2: LinkedList (correct: 1) ---
  {
    question: "Welche Abbruchbedingung hat type LinkedList<T> = { value: T; next: LinkedList<T> | null }?",
    options: [
      "Das leere Array []",
      "Der Union-Member null (next kann null sein)",
      "Der generische Parameter T",
      "Es gibt keine Abbruchbedingung",
    ],
    correct: 1,
    explanation:
      "| null ist die Abbruchbedingung. Wenn next = null ist, " +
      "endet die Rekursion. Ohne | null waere die Kette endlos " +
      "und kein endliches Objekt koennte den Typ erfuellen.",
    elaboratedFeedback: {
      whyCorrect:
        "Die null in der Union LinkedList<T> | null markiert das " +
        "Ende der Kette. Sie ist das Aequivalent zum Base Case " +
        "in einer rekursiven Funktion.",
      commonMistake:
        "Manche denken, der generische Parameter T sei die Abbruchbedingung. " +
        "T ist aber nur der Wert-Typ, nicht die Rekursionsbremse.",
    },
  },

  // --- Frage 3: JSON-Typ (correct: 2) ---
  {
    question: "Welche Art von Rekursion zeigt der JSON-Typ (JsonValue → JsonArray → JsonValue)?",
    options: [
      "Direkte Rekursion",
      "Keine Rekursion",
      "Indirekte Rekursion (ueber einen anderen Typ)",
      "Lazy Rekursion",
    ],
    correct: 2,
    explanation:
      "JsonValue referenziert nicht direkt sich selbst, sondern " +
      "geht ueber JsonArray und JsonObject, die wiederum JsonValue " +
      "referenzieren. Das ist indirekte Rekursion (A → B → A).",
    elaboratedFeedback: {
      whyCorrect:
        "Indirekte Rekursion bedeutet: Typ A verweist auf Typ B, " +
        "und Typ B verweist zurueck auf Typ A. JsonValue → JsonArray → JsonValue " +
        "ist ein klassisches Beispiel dafuer.",
      commonMistake:
        "Direkte Rekursion waere type X = { child: X | null }. " +
        "Beim JSON-Typ geht die Referenz ueber Zwischen-Typen.",
    },
  },

  // --- Frage 4: DeepPartial (correct: 3) ---
  {
    question: "Warum hat TypeScript kein eingebautes DeepPartial<T>?",
    options: [
      "Weil TypeScript keine rekursiven Typen unterstuetzt",
      "Weil DeepPartial zu langsam fuer den Compiler waere",
      "Weil DeepPartial ein Sicherheitsrisiko darstellt",
      "Weil die Semantik kontextabhaengig ist (Arrays, Date, Map, etc.)",
    ],
    correct: 3,
    explanation:
      "Das TypeScript-Team hat bewusst entschieden, kein DeepPartial einzubauen. " +
      "Der Grund: Soll Date aufgeloest werden? Soll Map<K,V> rekursiv behandelt " +
      "werden? Jedes Projekt hat andere Anforderungen. TypeScript bietet die " +
      "Bausteine (Mapped Types + Conditional Types + Rekursion), nicht die fertige Loesung.",
    elaboratedFeedback: {
      whyCorrect:
        "Anders Hejlsberg hat in GitHub-Issues erklaert, dass Deep-Operationen " +
        "projektspezifisch sind. Es gibt keine universell korrekte Antwort auf " +
        "'Wie behandelt DeepPartial Arrays/Date/Map?'.",
      commonMistake:
        "TypeScript unterstuetzt definitiv rekursive Typen (seit TS 3.7+). " +
        "Das Fehlen von DeepPartial ist eine bewusste Designentscheidung.",
    },
  },

  // --- Frage 5: Array-Problem (correct: 0) ---
  {
    question:
      "Was passiert mit type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] } " +
      "bei einem Array-Feld (z.B. tags: string[])?",
    options: [
      "Das Array wird als Objekt behandelt und seine Properties (length, push, etc.) werden aufgeloest",
      "Das Array bleibt unveraendert",
      "Es gibt einen Compile-Error",
      "Das Array wird zu einem Tuple",
    ],
    correct: 0,
    explanation:
      "Arrays sind in JavaScript Objekte (typeof [] === 'object'). " +
      "Ohne spezielle Array-Behandlung wird DeepPartial die Array-Properties " +
      "(length, push, pop, etc.) als optionale Felder behandeln. " +
      "Die Loesung: Arrays mit (infer U)[] separat abfangen.",
    elaboratedFeedback: {
      whyCorrect:
        "Da extends object fuer Arrays true ergibt, wird DeepPartial " +
        "rekursiv auf das Array angewendet. Das erzeugt ein Objekt mit " +
        "optionalem length?, push?, etc. statt eines Arrays.",
      commonMistake:
        "Viele erwarten, dass Arrays einfach unveraendert bleiben. " +
        "Man muss Arrays explizit mit (infer U)[] erkennen und separat behandeln.",
    },
  },

  // --- Frage 6: Paths (correct: 1) ---
  {
    question: "Was berechnet Paths<{ a: { b: string }; c: number }>?",
    options: [
      "'a' | 'b' | 'c'",
      "'a' | 'a.b' | 'c'",
      "'a.b' | 'c'",
      "'a' | 'c'",
    ],
    correct: 1,
    explanation:
      "Paths berechnet ALLE moeglichen Punkt-getrennten Pfade: " +
      "'a' (das Objekt selbst), 'a.b' (die Property darin), " +
      "und 'c' (ein primitiver Wert auf oberster Ebene). " +
      "'b' allein ist kein gueltiger Pfad auf dem Root-Objekt.",
    elaboratedFeedback: {
      whyCorrect:
        "Paths generiert sowohl Zwischen-Pfade ('a') als auch " +
        "Blatt-Pfade ('a.b', 'c'). Jeder Schluessel auf jeder " +
        "Ebene wird mit seinem vollstaendigen Pfad abgebildet.",
      commonMistake:
        "Manche vergessen die Zwischen-Pfade: 'a' ist ein gueltiger " +
        "Pfad der auf das verschachtelte Objekt {b: string} zeigt.",
    },
  },

  // --- Frage 7: PathValue (correct: 2) ---
  {
    question: "Was ergibt PathValue<{ x: { y: { z: boolean } } }, 'x.y.z'>?",
    options: [
      "{ z: boolean }",
      "{ y: { z: boolean } }",
      "boolean",
      "string",
    ],
    correct: 2,
    explanation:
      "PathValue zerlegt den Pfad 'x.y.z' rekursiv: " +
      "x → { y: { z: boolean } } → y → { z: boolean } → z → boolean. " +
      "Am Ende bleibt der Blatt-Typ: boolean.",
    elaboratedFeedback: {
      whyCorrect:
        "PathValue nutzt Template Literal Types um den Pfad an Punkten " +
        "aufzutrennen und navigiert Schritt fuer Schritt tiefer in den Typ. " +
        "Bei 'x.y.z' werden drei Rekursionsschritte durchgefuehrt.",
      commonMistake:
        "Manche verwechseln PathValue mit dem Typ des Zwischen-Knotens. " +
        "PathValue<T, 'x.y'> waere { z: boolean }, aber 'x.y.z' geht bis zum Blatt.",
    },
  },

  // --- Frage 8: Rekursionslimit (correct: 3) ---
  {
    question: "Was ist das Standard-Rekursionslimit fuer TypeScript-Typen (ohne Tail Recursion)?",
    options: [
      "10 Ebenen",
      "100 Ebenen",
      "Unbegrenzt",
      "Circa 50 Ebenen",
    ],
    correct: 3,
    explanation:
      "TypeScript bricht bei ca. 50 Rekursionsebenen ab mit der Meldung " +
      "'Type instantiation is excessively deep and possibly infinite'. " +
      "Mit Tail Recursion Optimization (TS 4.5+) erhoehst sich das auf ~1000.",
    elaboratedFeedback: {
      whyCorrect:
        "Das Limit von ~50 ist im TypeScript-Compiler hart codiert " +
        "und schuetzt vor Endlosschleifen und Speicherueberlauf " +
        "bei der stack-basierten Typ-Auswertung.",
      commonMistake:
        "Das Limit ist NICHT konfigurierbar ueber tsconfig.json. " +
        "Es ist ein internes Compiler-Limit.",
    },
  },

  // --- Frage 9: Tail Recursion (correct: 0) ---
  {
    question: "Wann nutzt TypeScript (ab 4.5) Tail Recursion Optimization fuer Typen?",
    options: [
      "Wenn der rekursive Aufruf in Tail-Position steht (letzter Ausdruck im Conditional-Zweig)",
      "Immer bei rekursiven Conditional Types",
      "Nur bei Mapped Types mit Rekursion",
      "Nur wenn man einen speziellen Compiler-Flag aktiviert",
    ],
    correct: 0,
    explanation:
      "Tail Recursion Optimization greift automatisch, wenn der rekursive " +
      "Typ-Aufruf das LETZTE ist was im true/false-Zweig eines Conditional " +
      "Type passiert. Dann kann TypeScript den Stack-Frame wiederverwenden " +
      "und bis ~1000 Ebenen rekursieren.",
    elaboratedFeedback: {
      whyCorrect:
        "Genau wie bei Runtime-Funktionen: Wenn nach dem rekursiven " +
        "Aufruf nichts mehr passiert (Tail Position), kann der aktuelle " +
        "Frame wiederverwendet werden statt einen neuen aufzubauen.",
      commonMistake:
        "Es ist keine opt-in-Feature — es wird automatisch erkannt. " +
        "Aber der Aufruf MUSS in Tail-Position stehen.",
    },
  },

  // --- Frage 10: Flatten (correct: 1) ---
  {
    question: "Was ergibt Flatten<number[][]> mit type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T?",
    options: [
      "number[][]",
      "number",
      "number[]",
      "never",
    ],
    correct: 1,
    explanation:
      "Flatten entfernt ALLE Array-Ebenen rekursiv: " +
      "number[][] → Flatten<number[]> → Flatten<number> → number. " +
      "Da number kein Array ist, ist die Abbruchbedingung erreicht.",
    elaboratedFeedback: {
      whyCorrect:
        "Flatten prueft rekursiv ob T ein Array ist, extrahiert den Element-Typ " +
        "und prueft erneut. number[][] → number[] → number → kein Array mehr → fertig.",
      commonMistake:
        "Manche erwarten number[] (nur eine Ebene entfernt). Aber Flatten " +
        "rekursiert bis zum Nicht-Array-Typ. Fuer eine Ebene brauchst du FlatN<T, 1>.",
    },
  },

  // --- Frage 11: Performance (correct: 2) ---
  {
    question: "Welches Pattern fuehrt zu exponentieller Compile-Zeit bei rekursiven Typen?",
    options: [
      "Mapped Types mit Rekursion",
      "Tail-rekursive Conditional Types",
      "Distributive Conditional Types mit Rekursion",
      "DeepPartial auf flachen Objekten",
    ],
    correct: 2,
    explanation:
      "Distributive Conditional Types verteilen sich ueber Union-Mitglieder. " +
      "Bei T extends object ? Foo<T[keyof T]> : T wird T[keyof T] (eine Union " +
      "aller Werte) distributiv aufgeteilt — jedes Mitglied wird SEPARAT " +
      "rekursiert, was zu exponentiellem Wachstum fuehrt.",
    elaboratedFeedback: {
      whyCorrect:
        "Distribution + Rekursion = exponentiell. Wenn ein Objekt 3 Properties " +
        "hat und 5 Ebenen tief ist, erzeugt Distribution 3^5 = 243 separate " +
        "Typ-Auswertungen statt 3*5 = 15 bei einem Mapped Type.",
      commonMistake:
        "Mapped Types mit Rekursion sind NICHT exponentiell — sie iterieren " +
        "linear ueber Schluessel. Das Problem entsteht durch Distribution.",
    },
  },

  // --- Frage 12: z.lazy (correct: 3) ---
  {
    question: "Warum braucht Zod z.lazy() fuer rekursive Schemas?",
    options: [
      "Weil TypeScript keine rekursiven Typen unterstuetzt",
      "Weil z.lazy() schneller ist als direkte Referenz",
      "Weil Zod intern nur Strings verwendet",
      "Weil Laufzeit-Objekte sofort erstellt werden und sich nicht vor der Fertigstellung selbst referenzieren koennen",
    ],
    correct: 3,
    explanation:
      "TypeScript-Typen werden lazy (faul) ausgewertet. " +
      "Aber JavaScript-Objekte werden sofort erstellt. " +
      "Ohne z.lazy() wuerde das Schema sich selbst referenzieren, " +
      "bevor es fertig definiert ist — eine Endlosschleife.",
    elaboratedFeedback: {
      whyCorrect:
        "Der fundamentale Unterschied: Typen existieren nur zur Compilezeit " +
        "und werden bei Bedarf entfaltet. Schemas sind Laufzeit-Objekte die " +
        "beim Erstellen alle Referenzen aufloesen muessen. z.lazy(() => schema) " +
        "verzoegert diese Aufloesung.",
      commonMistake:
        "TypeScript unterstuetzt rekursive Typen sehr gut. Das Problem " +
        "liegt nicht bei TypeScript, sondern bei der Laufzeit-Natur von Schemas.",
    },
  },

  // --- Frage 13: Direkte Zirkularitaet (correct: 2) ---
  {
    question: "Was passiert bei type X = X | string?",
    options: [
      "X wird zu string aufgeloest",
      "X wird zu never",
      "TypeScript meldet 'Type alias circularly references itself'",
      "X wird zu unknown",
    ],
    correct: 2,
    explanation:
      "Direkte Zirkularitaet ohne Conditional Type ist verboten. " +
      "type X = X | string ist kein rekursiver Typ — es ist eine " +
      "ungueltige zirkulaere Referenz. Rekursion braucht einen " +
      "Conditional oder Mapped Type als 'Bremse'.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript erlaubt Rekursion nur in bestimmten Kontexten: " +
        "Property-Typen, Conditional Types, Mapped Types. " +
        "Direkte Union-Selbstreferenz (type X = X | Y) ist verboten.",
      commonMistake:
        "Manche denken, X wuerde einfach zu string aufgeloest. " +
        "Aber TypeScript kann das nicht berechnen und meldet einen Fehler.",
    },
  },

  // --- Frage 14: Tuple-Zaehler (correct: 1) ---
  {
    question: "Wie implementiert man Type-Level-Arithmetik (z.B. Addition) in TypeScript?",
    options: [
      "Mit dem + Operator auf Type-Level",
      "Ueber Tuple-Laenge: Tuples zusammenspreaden und .length lesen",
      "Mit einer speziellen Compiler-API",
      "Das ist in TypeScript nicht moeglich",
    ],
    correct: 1,
    explanation:
      "TypeScript hat keine echte Arithmetik auf Type-Level. Der Workaround: " +
      "Tuples als Zaehler verwenden. Add<3, 4> = [...BuildTuple<3>, ...BuildTuple<4>]['length'] = 7. " +
      "Die Laenge eines Tuples ist eine Zahl-Literal die TypeScript kennt.",
    elaboratedFeedback: {
      whyCorrect:
        "Der Tuple-Trick nutzt aus, dass TypeScript die exakte Laenge " +
        "von Tuples trackt. [unknown, unknown, unknown]['length'] = 3. " +
        "Durch Spreaden zweier Tuples kann man 'addieren'.",
      commonMistake:
        "Es gibt keinen + Operator fuer Typen. Der Tuple-Trick ist der " +
        "einzige Weg fuer Arithmetik auf Type-Level.",
    },
  },

  // --- Frage 15: Praxis-Entscheidung (correct: 0) ---
  {
    question: "Wann solltest du rekursive Typen NICHT verwenden?",
    options: [
      "Wenn die IDE durch den Typ merklich langsamer wird oder Kollegen den Typ nicht verstehen",
      "Wenn du JSON-Daten typisieren willst",
      "Wenn du verschachtelte Konfigurationen modellierst",
      "Wenn du DeepPartial oder DeepReadonly brauchst",
    ],
    correct: 0,
    explanation:
      "Rekursive Typen sollten vermieden werden, wenn sie die IDE " +
      "verlangsamen oder zu komplex fuer das Team sind. JSON, " +
      "Konfigurationen und Deep-Utilities sind dagegen klassische " +
      "und sinnvolle Anwendungsfaelle.",
    elaboratedFeedback: {
      whyCorrect:
        "Die Faustregel: Wenn der Typ die Compile-Zeit merklich " +
        "erhoehst oder niemand im Team ihn versteht, ist er zu komplex. " +
        "Typsicherheit ist wertlos wenn sie das Team ausbremst.",
      commonMistake:
        "JSON, Konfigurationen und Deep-Utilities sind genau die " +
        "Faelle wo rekursive Typen glaenzen. Problematisch werden " +
        "sie bei uebertriebener Type-Level-Programmierung.",
    },
  },

  // ─── Neue Frageformate (Short-Answer, Predict-Output, Explain-Why) ─────────

  // --- Frage 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst das Pattern, bei dem ein Typ sich NICHT direkt selbst referenziert, " +
      "sondern ueber einen anderen Typ (A → B → A)?",
    expectedAnswer: "Indirekte Rekursion",
    acceptableAnswers: [
      "Indirekte Rekursion", "indirekte Rekursion", "Indirect Recursion",
      "indirect recursion", "Mutual Recursion", "mutual recursion",
    ],
    explanation:
      "Bei indirekter Rekursion verweist Typ A auf Typ B, und Typ B " +
      "verweist zurueck auf Typ A. Das klassische Beispiel ist der JSON-Typ: " +
      "JsonValue → JsonArray → JsonValue.",
  },

  // --- Frage 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie hoch ist ungefaehr das Standard-Rekursionslimit fuer TypeScript-Typen " +
      "OHNE Tail Recursion Optimization? (Zahl angeben)",
    expectedAnswer: "50",
    acceptableAnswers: ["50", "~50", "ca. 50", "circa 50", "ungefaehr 50"],
    explanation:
      "TypeScript bricht bei ca. 50 Rekursionsebenen ab mit " +
      "'Type instantiation is excessively deep and possibly infinite'. " +
      "Mit Tail Recursion Optimization (TS 4.5+) steigt das auf ~1000.",
  },

  // --- Frage 18: Predict-Output ---
  {
    type: "predict-output",
    question: "Welchen Typ ergibt `Flatten<string[][][]>`?",
    code:
      "type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;\n" +
      "type Result = Flatten<string[][][]>;",
    expectedAnswer: "string",
    acceptableAnswers: ["string", "String"],
    explanation:
      "Flatten entfernt ALLE Array-Ebenen rekursiv: " +
      "string[][][] → Flatten<string[][]> → Flatten<string[]> → " +
      "Flatten<string> → string (kein Array mehr → Abbruchbedingung).",
  },

  // --- Frage 19: Predict-Output ---
  {
    type: "predict-output",
    question: "Kompiliert dieser Code oder gibt es einen Fehler?",
    code: "type X = X | string;",
    expectedAnswer: "Fehler",
    acceptableAnswers: [
      "Fehler", "Error", "Compile Error", "Compile-Error", "Nein",
      "Type alias circularly references itself",
    ],
    explanation:
      "Direkte Zirkularitaet ohne Conditional oder Mapped Type ist verboten. " +
      "'type X = X | string' ist kein rekursiver Typ, sondern eine ungueltige " +
      "zirkulaere Referenz. TypeScript meldet: 'Type alias circularly references itself'.",
  },

  // --- Frage 20: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welche Zod-Funktion braucht man, um rekursive Schemas zu definieren, " +
      "weil JavaScript-Objekte nicht lazy wie TypeScript-Typen ausgewertet werden?",
    expectedAnswer: "z.lazy",
    acceptableAnswers: [
      "z.lazy", "z.lazy()", "lazy", "Lazy",
    ],
    explanation:
      "z.lazy(() => schema) verzoegert die Auswertung des Schemas. " +
      "Ohne z.lazy() wuerde das Schema sich beim Erstellen selbst referenzieren " +
      "bevor es fertig definiert ist — eine Endlosschleife.",
  },

  // --- Frage 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Warum fuehren Distributive Conditional Types in Kombination mit Rekursion " +
      "zu exponentiellem Wachstum der Compile-Zeit, waehrend Mapped Types mit " +
      "Rekursion linear bleiben?",
    modelAnswer:
      "Distributive Conditional Types verteilen sich ueber Union-Mitglieder: " +
      "Jedes Mitglied wird SEPARAT rekursiert. Bei einem Objekt mit 3 Properties " +
      "und 5 Ebenen Tiefe entstehen 3^5 = 243 separate Auswertungen. " +
      "Mapped Types iterieren dagegen linear ueber Schluessel und erzeugen " +
      "nur 3*5 = 15 Auswertungen, weil sie alle Keys in einem Durchgang abarbeiten.",
    keyPoints: [
      "Distribution spaltet Unions in separate Auswertungen",
      "Exponentielles Wachstum durch Rekursion ueber verteilte Unions",
      "Mapped Types iterieren linear ueber Keys",
      "Loesung: [T] Wrapping verhindert Distribution",
    ],
  },
];
