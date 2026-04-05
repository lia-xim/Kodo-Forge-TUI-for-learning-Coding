// quiz-data.ts — L34: Performance & Compiler
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "34";
export const lessonTitle = "Performance & Compiler";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Compiler-Phasen — correct: 0 ---
  {
    question: "Welche Phase des TypeScript-Compilers verbraucht typischerweise 60-80% der Compile-Zeit?",
    options: [
      "Der Type Checker",
      "Der Parser (AST-Erstellung)",
      "Der Emitter (JavaScript-Generierung)",
      "Der Scanner (Lexing)",
    ],
    correct: 0,
    explanation:
      "Der Type Checker (checker.ts, ueber 50.000 Zeilen) muss fuer jede Expression den Typ berechnen, " +
      "Zuweisbarkeit pruefen, Generics instantiieren und Overloads aufloesen. Das ist bei weitem " +
      "die aufwendigste Phase.",
    elaboratedFeedback: {
      whyCorrect: "Scanner und Parser sind im Wesentlichen lineare Durchlaeufe — schnell. Der Emitter gibt nur den AST als Text aus. Aber der Checker muss komplexe Typ-Berechnungen durchfuehren, die exponentiell wachsen koennen.",
      commonMistake: "Viele denken, das Parsen sei teuer (weil es 'komplex aussieht'). Parsing ist in der Praxis blitzschnell — Compiler-Autoren optimieren Parser seit Jahrzehnten."
    }
  },

  // --- Frage 2: AST — correct: 0 ---
  {
    question: "Was ist der Abstract Syntax Tree (AST) im TypeScript-Compiler?",
    options: [
      "Eine Baumstruktur die die hierarchische Struktur des Quellcodes repraesentiert",
      "Eine flache Liste aller Typen im Programm",
      "Die generierte JavaScript-Ausgabe in Baumform",
      "Ein Optimierungsformat das TypeScript intern fuer Caching nutzt",
    ],
    correct: 0,
    explanation:
      "Der AST wird vom Parser erzeugt und repraesentiert die hierarchische Struktur " +
      "des Programms. Jeder Knoten hat einen 'kind' (z.B. VariableDeclaration), Position, " +
      "und Kinder. Er ist die zentrale Datenstruktur fuer Binder, Checker und Emitter.",
    elaboratedFeedback: {
      whyCorrect: "Der AST transformiert linearen Text in eine Baumstruktur. 'const x: number = 42' wird zu: VariableStatement → VariableDeclarationList → VariableDeclaration mit children Identifier('x'), TypeAnnotation, Initializer.",
      commonMistake: "Der AST ist NICHT die Typ-Information — die kommt erst vom Checker. Der AST repraesentiert die SYNTAX, nicht die SEMANTIK."
    }
  },

  // --- Frage 3: Type Instantiation — correct: 0 ---
  {
    question: "Warum koennen rekursive Typen exponentiell viele Type Instantiations erzeugen?",
    options: [
      "Weil jede Rekursionsebene die Anzahl der Instantiierungen verdoppelt oder vervielfacht",
      "Weil TypeScript rekursive Typen nicht cachen kann",
      "Weil der Scanner bei Rekursion langsamer wird",
      "Weil .d.ts-Dateien bei Rekursion groesser werden",
    ],
    correct: 0,
    explanation:
      "Ein Typ wie Tree<T> mit left: Tree<T> und right: Tree<T> verdoppelt die " +
      "Instantiierungen pro Ebene: 1, 2, 4, 8, 16... Bei Tiefe 20 sind es ueber " +
      "eine Million. Das ist der Grund fuer das Depth Limit von 50.",
    elaboratedFeedback: {
      whyCorrect: "Exponentielles Wachstum entsteht durch Verzweigung: Jeder Knoten erzeugt 2+ neue Instantiierungen. 2^50 = 1.125.899.906.842.624 — weit ueber dem Instantiation Limit.",
      commonMistake: "Nicht ALLE rekursiven Typen sind problematisch. Lineare Rekursion (z.B. TrimLeft<string>) waechst nur linear. Nur verzweigte Rekursion explodiert."
    }
  },

  // --- Frage 4: skipLibCheck — correct: 0 ---
  {
    question: "Was macht die tsconfig-Option 'skipLibCheck: true'?",
    options: [
      "Sie ueberspringt das Type-Checking von .d.ts-Dateien und spart 10-30% Compile-Zeit",
      "Sie ueberspringt den gesamten Type-Check und erzeugt nur JavaScript",
      "Sie ignoriert alle node_modules beim Kompilieren",
      "Sie deaktiviert die Pruefung von Bibliotheks-Importen",
    ],
    correct: 0,
    explanation:
      "skipLibCheck ueberspringt die Typueberpruefung von Deklarationsdateien (.d.ts). " +
      "Da @types-Pakete und Library-Deklarationen selten Fehler haben, ist das in fast " +
      "allen Projekten sicher und spart erheblich Compile-Zeit.",
    elaboratedFeedback: {
      whyCorrect: "Der Compiler prueft normalerweise auch die .d.ts-Dateien aus node_modules/@types. skipLibCheck sagt: 'Vertraue diesen Dateien'. Das ist in 99.9% der Faelle korrekt.",
      commonMistake: "skipLibCheck ueberspringt nicht das Checking DEINES Codes gegen die Library-Typen. Es ueberspringt nur die interne Konsistenzpruefung DER Library-Dateien selbst."
    }
  },

  // --- Frage 5: Interface vs Intersection — correct: 1 ---
  {
    question: "Warum ist 'interface A extends B, C {}' schneller als 'type A = B & C'?",
    options: [
      "Intersections erzeugen kleinere .d.ts-Dateien",
      "Interfaces werden vom Compiler eagerly evaluiert und gecacht, Intersections werden lazy bei jeder Verwendung neu berechnet",
      "Interfaces brauchen weniger Speicher zur Laufzeit",
      "Intersections koennen nicht mit Generics verwendet werden",
    ],
    correct: 1,
    explanation:
      "Der Compiler berechnet die Property-Liste eines Interface einmal und speichert sie. " +
      "Bei Intersection Types muss der Compiler die Properties bei jeder Zuweisbarkeits-Pruefung " +
      "neu zusammenmergen — ohne Cache.",
    elaboratedFeedback: {
      whyCorrect: "Interface-Properties werden in einer festen Liste gespeichert. Bei 'type A = B & C & D' muss der Checker bei jeder Verwendung: B-Properties lesen + C-Properties lesen + D-Properties lesen + mergen + Konflikte aufloesen. Das passiert JEDES Mal.",
      commonMistake: "Fuer kleine Typen (2-3 Properties) ist der Unterschied vernachlaessigbar. Der Effekt wird erst bei vielen Properties oder haeufiger Verwendung messbar."
    }
  },

  // --- Frage 6: generateTrace — correct: 1 ---
  {
    question: "In welchem Format speichert --generateTrace die Analyse-Daten?",
    options: [
      "In einem TypeScript-spezifischen Binaerformat",
      "Im Chrome Trace Event Format (JSON), lesbar mit chrome://tracing",
      "Als HTML-Report mit Diagrammen",
      "Als CSV-Datei fuer Excel-Analyse",
    ],
    correct: 1,
    explanation:
      "--generateTrace erzeugt trace.json im Chrome Trace Event Format. Du kannst es " +
      "in chrome://tracing oder Perfetto oeffnen und siehst eine Timeline aller Compiler-" +
      "Operationen — pro Datei, pro Typ, pro Instantiierung.",
    elaboratedFeedback: {
      whyCorrect: "Das Chrome Trace Format ist ein Industriestandard. Das TypeScript-Team musste kein eigenes Visualisierungstool bauen — Chrome DevTools, Perfetto und andere Tools koennen es direkt lesen.",
      commonMistake: "Die trace.json kann sehr gross werden (100MB+). Fuer grosse Projekte ist Perfetto besser als chrome://tracing, weil es effizienter mit grossen Dateien umgeht."
    }
  },

  // --- Frage 7: tsBuildInfo — correct: 1 ---
  {
    question: "Welche zwei Arten von Hashes speichert die .tsBuildInfo-Datei pro Datei?",
    options: [
      "Quellcode-Hash und Dateigroesse-Hash",
      "Version-Hash (Dateiinhalt) und Signature-Hash (oeffentliche API)",
      "Import-Hash und Export-Hash",
      "TypeScript-Version-Hash und Compiler-Options-Hash",
    ],
    correct: 1,
    explanation:
      "Der Version-Hash aendert sich bei jeder Datei-Aenderung. Der Signature-Hash " +
      "aendert sich nur wenn die oeffentliche API (.d.ts) sich aendert. Aenderungen im " +
      "Funktionskoerper aendern die Version aber nicht die Signatur — Abhaengige muessen " +
      "dann NICHT neu kompiliert werden.",
    elaboratedFeedback: {
      whyCorrect: "Diese Trennung ist der Schluessel: Wenn du den Koerper einer Funktion aenderst aber die Signatur gleich bleibt, muessen alle importierenden Dateien nicht neu gecheckt werden. Das spart enorm viel Arbeit.",
      commonMistake: "Viele committen .tsbuildinfo in Git. Das ist falsch — die Datei ist maschinenspezifisch und sollte in .gitignore stehen. In CI wird sie gecacht, nicht committed."
    }
  },

  // --- Frage 8: Depth Limit — correct: 1 ---
  {
    question: "Wie lautet der TypeScript-Fehler wenn ein rekursiver Typ das Depth Limit ueberschreitet?",
    options: [
      "TS1337: Maximum call stack size exceeded",
      "TS2589: Type instantiation is excessively deep and possibly infinite",
      "TS7023: Type too complex to represent",
      "TS2321: Recursive type reference detected",
    ],
    correct: 1,
    explanation:
      "TS2589 ist der Standardfehler bei zu tiefer Typ-Rekursion. Das Depth Limit liegt " +
      "bei 50. Der Fehler sagt: 'Dieser Typ koennte endlos sein — ich breche nach 50 Ebenen ab.'",
    elaboratedFeedback: {
      whyCorrect: "TS2589 ist spezifisch fuer Typ-Rekursion. Der Fehlertext 'excessively deep and possibly infinite' ist ein Hinweis darauf, dass der Compiler nicht sicher ist ob der Typ jemals terminiert.",
      commonMistake: "TS2589 ist kein Bug in deinem Code — es ist ein Schutzmechanismus. Manchmal ist der Typ korrekt aber einfach zu tief. Loesungen: Counter-basierter Abbruch oder Tail-Rekursion."
    }
  },

  // --- Frage 9: Union Performance — correct: 2 ---
  {
    question: "Warum sind grosse Union-Types ein Performance-Problem fuer den Checker?",
    options: [
      "Unions brauchen mehr Speicher als Interfaces",
      "Unions koennen nicht in .d.ts-Dateien geschrieben werden",
      "Zuweisbarkeits-Pruefungen bei Unions sind O(n*m) — jedes Member gegen jedes andere",
      "Der Scanner muss Unions zeichenweise parsen",
    ],
    correct: 2,
    explanation:
      "Wenn der Checker prueft ob Union A an Union B zuweisbar ist, muss er jedes " +
      "Member von A gegen jedes Member von B pruefen. Bei 100 Members: 100 * 100 = " +
      "10.000 Vergleiche. Bei Mapped Types waere es ein einziger Lookup.",
    elaboratedFeedback: {
      whyCorrect: "O(n*m) bedeutet: Die Laufzeit waechst mit dem Produkt beider Union-Groessen. 50-Member-Union gegen 50-Member-Union = 2.500 Vergleiche. Das summiert sich bei haeufiger Verwendung.",
      commonMistake: "Kleine Unions (5-10 Members) sind kein Problem. Die Performance wird erst bei 50+ Members spuerbar. Die Loesung: Gruppierte Sub-Unions oder Mapped Types mit Lookup."
    }
  },

  // --- Frage 10: isolatedModules — correct: 2 ---
  {
    question: "Was ermoeglicht die Option 'isolatedModules: true'?",
    options: [
      "Sie isoliert Module voneinander damit sie nicht aufeinander zugreifen koennen",
      "Sie erzeugt separate JavaScript-Bundles pro Modul",
      "Sie erzwingt Einschraenkungen die schnelle Transpiler wie esbuild und swc unterstuetzen",
      "Sie deaktiviert Module-Resolution und verwendet stattdessen relative Pfade",
    ],
    correct: 2,
    explanation:
      "isolatedModules erzwingt, dass jede Datei unabhaengig transpiliert werden kann. " +
      "Das ist Voraussetzung fuer esbuild, swc und Babel — diese Tools transpilieren " +
      "Datei fuer Datei ohne Cross-File-Analyse.",
    elaboratedFeedback: {
      whyCorrect: "esbuild und swc sind 10-100x schneller als tsc, weil sie keine Typ-Analyse machen. Aber sie brauchen die Garantie, dass jede Datei allein stehen kann — isolatedModules gibt diese Garantie.",
      commonMistake: "isolatedModules macht tsc selbst nicht schneller. Es ermoeglicht aber den Workflow: esbuild fuer schnelle Transpilierung + tsc --noEmit fuer Type-Checking."
    }
  },

  // --- Frage 11: Conditional Types — correct: 2 ---
  {
    question: "Was ist eine performantere Alternative zu verschachtelten Conditional Types fuer Property-Zugriff?",
    options: [
      "Switch-Statements im Type-Level",
      "Rekursive Mapped Types",
      "Constraints mit direktem Lookup (T extends { id: unknown } → T['id'])",
      "Template Literal Types mit Pattern Matching",
    ],
    correct: 2,
    explanation:
      "Wenn du weisst, dass T ein bestimmtes Property hat, nutze einen Constraint " +
      "(extends) und greife direkt zu (T['id']). Das ist ein Lookup statt eines " +
      "Conditional — keine Verzweigung, keine infer-Auflosung.",
    elaboratedFeedback: {
      whyCorrect: "type ExtractId<T extends { id: unknown }> = T['id'] ist ein direkter Lookup. type ExtractId<T> = T extends { id: infer Id } ? Id : never braucht: Pattern-Match + infer + Conditional-Evaluation. Lookup ist immer schneller.",
      commonMistake: "Conditional Types sind nicht 'schlecht' — sie sind noetig fuer Faelle wo du den Typ nicht mit einem Constraint einschraenken kannst. Aber wenn ein Constraint moeglich ist, bevorzuge ihn."
    }
  },

  // --- Frage 12: Project References — correct: 2 ---
  {
    question: "Was ist die Voraussetzung damit ein Projekt als Project Reference verwendet werden kann?",
    options: [
      "Es muss 'incremental: true' in der tsconfig haben",
      "Es muss ein package.json mit 'main'-Feld haben",
      "'composite: true' muss in der tsconfig gesetzt sein",
      "Es muss mindestens eine .d.ts-Datei exportieren",
    ],
    correct: 2,
    explanation:
      "composite: true ist Pflicht fuer referenzierte Projekte. Es erzwingt " +
      "declaration: true und stellt sicher, dass alle Dateien in 'include' " +
      "aufgelistet sind — der Compiler braucht diese Garantien fuer inkrementelles Build.",
    elaboratedFeedback: {
      whyCorrect: "composite: true sagt dem Compiler: 'Dieses Projekt ist eine eigenstaendige Compilation Unit mit definierten Ein-/Ausgaben.' Ohne das kann tsc --build nicht bestimmen, ob ein Rebuild noetig ist.",
      commonMistake: "composite: true impliziert declaration: true — du musst es nicht extra setzen. Aber du brauchst ein 'outDir', sonst landen .d.ts neben den .ts-Dateien."
    }
  },

  // --- Frage 13: noEmit — correct: 3 ---
  {
    question: "Was ist der empfohlene Workflow fuer schnelles Development mit TypeScript?",
    options: [
      "tsc --watch fuer Type-Checking und JavaScript-Generierung gleichzeitig",
      "Nur esbuild verwenden und auf Type-Checking verzichten",
      "TypeScript durch Babel ersetzen und Typen manuell pruefen",
      "esbuild/swc fuer schnelle Transpilierung + tsc --noEmit fuer Type-Checking im Background",
    ],
    correct: 3,
    explanation:
      "Schnelle Transpiler (esbuild, swc) erzeugen JavaScript in Millisekunden, " +
      "prufen aber keine Typen. tsc --noEmit prueft Typen ohne JavaScript zu erzeugen. " +
      "Zusammen: schnelles Hot Reload + sichere Typen.",
    elaboratedFeedback: {
      whyCorrect: "Vite (React), Next.js (SWC) und Angular 17+ (esbuild) nutzen alle diesen Ansatz. Die Transpilierung ist 10-100x schneller weil sie keine Typ-Analyse macht. Type-Checking laeuft parallel im Hintergrund.",
      commonMistake: "Manche lassen tsc --noEmit ganz weg und verlassen sich nur auf die IDE. Das ist riskant — IDE-Errors sind manchmal unvollstaendig. tsc --noEmit im CI ist ein Muss."
    }
  },

  // --- Frage 14: Compile-Zeit Anteil — correct: 3 ---
  {
    question: "Wenn --extendedDiagnostics 'Check time: 40s' und 'Total time: 50s' zeigt, was ist der Checker-Anteil?",
    options: [
      "40%",
      "50%",
      "90%",
      "80%",
    ],
    correct: 3,
    explanation:
      "40s von 50s = 80%. Das bedeutet: Der Checker dominiert die Compile-Zeit. " +
      "Optimierungen am Checker (performantere Typen) haben den groessten Effekt. " +
      "Die restlichen 20% verteilen sich auf Scanner, Parser, Binder und Emitter.",
    elaboratedFeedback: {
      whyCorrect: "40/50 = 0.8 = 80%. Bei typischen Projekten liegt der Checker-Anteil zwischen 60% und 80%. Wenn er ueber 80% liegt, hast du wahrscheinlich besonders komplexe Typen.",
      commonMistake: "Manche verwechseln Check time mit Total time. Check time ist ein TEIL von Total time — die anderen Phasen kommen noch dazu."
    }
  },

  // --- Frage 15: tsc --build — correct: 3 ---
  {
    question: "Was macht 'tsc --build' anders als normales 'tsc'?",
    options: [
      "Es kompiliert nur JavaScript ohne Type-Checking",
      "Es erzeugt optimiertes JavaScript mit Tree-Shaking",
      "Es aktiviert automatisch den strengsten Strict-Mode",
      "Es baut Projekte in Abhaengigkeitsreihenfolge und ueberspringt unveraenderte",
    ],
    correct: 3,
    explanation:
      "tsc --build (oder tsc -b) nutzt Project References um den Abhaengigkeitsgraph " +
      "zu analysieren. Projekte werden in der richtigen Reihenfolge gebaut, und " +
      "unveraenderte Projekte werden uebersprungen (inkrementell).",
    elaboratedFeedback: {
      whyCorrect: "In einem Monorepo mit shared → api → web baut tsc --build: erst shared, dann api (weil es shared braucht), dann web. Wenn nur web geaendert wurde: shared und api werden uebersprungen.",
      commonMistake: "tsc --build funktioniert NUR mit Project References. Ohne 'references' und 'composite' in den tsconfigs verhaelt es sich wie normales tsc."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Wie heisst die Datei die TypeScript bei 'incremental: true' erzeugt, um Build-Info zu speichern?",
    expectedAnswer: ".tsbuildinfo",
    acceptableAnswers: [".tsbuildinfo", "tsbuildinfo", "*.tsbuildinfo"],
    explanation:
      "Die .tsbuildinfo-Datei speichert Hashes und Diagnostics pro Datei. " +
      "Beim naechsten Build vergleicht der Compiler die aktuellen Hashes mit den " +
      "gespeicherten und kompiliert nur geaenderte Dateien neu.",
  },

  {
    type: "short-answer",
    question: "Wie lautet die TypeScript-Fehlernummer fuer 'Type instantiation is excessively deep'?",
    expectedAnswer: "TS2589",
    acceptableAnswers: ["TS2589", "2589", "ts2589"],
    explanation:
      "TS2589 ist der Fehler der bei zu tiefer Typ-Rekursion auftritt. " +
      "Das Depth Limit liegt bei 50 Rekursionsebenen. Tail-rekursive Typen " +
      "koennen dieses Limit umgehen (seit TypeScript 4.5).",
  },

  {
    type: "short-answer",
    question: "Auf welchen Wert ist das Depth Limit fuer Typ-Rekursion in TypeScript gesetzt?",
    expectedAnswer: "50",
    acceptableAnswers: ["50", "fuenfzig"],
    explanation:
      "Das Depth Limit von 50 schuetzt den Compiler vor endloser Rekursion. " +
      "In der Praxis braucht man selten mehr als 5-10 Ebenen. Wenn du an 50 " +
      "herankommst, ist der Typ wahrscheinlich zu komplex.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Kompiliert dieser Typ ohne Fehler? Antworte mit 'Ja' oder 'Nein'.",
    code:
      "type Repeat<S extends string, N extends number, Acc extends string = '', C extends 0[] = []> =\n" +
      "  C['length'] extends N ? Acc : Repeat<S, N, `${Acc}${S}`, [...C, 0]>;\n" +
      "type Result = Repeat<'a', 5>;",
    expectedAnswer: "Ja",
    acceptableAnswers: ["Ja", "ja", "Yes", "yes"],
    explanation:
      "Repeat<'a', 5> erzeugt 'aaaaa'. Die Rekursionstiefe ist 5 — weit unter dem " +
      "Limit von 50. Der Counter C waechst von [] bis [0,0,0,0,0] und bricht dann ab.",
  },

  {
    type: "predict-output",
    question: "Was zeigt '--extendedDiagnostics' als teuerstes Element in einem typischen Projekt?",
    code:
      "// npx tsc --extendedDiagnostics\n" +
      "// Parse time:  0.52s\n" +
      "// Bind time:   0.21s\n" +
      "// Check time:  8.34s\n" +
      "// Emit time:   0.89s\n" +
      "// Total time:  9.96s",
    expectedAnswer: "Check time",
    acceptableAnswers: ["Check time", "check time", "Checker", "checker", "Check", "check"],
    explanation:
      "Check time: 8.34s von 9.96s total = 83.7%. Der Type Checker dominiert die Compile-Zeit. " +
      "Optimierungen sollten hier ansetzen: performantere Typen, skipLibCheck, Project References.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist 'interface A extends B, C, D {}' performanter als 'type A = B & C & D', " +
      "obwohl beide dasselbe Ergebnis produzieren?",
    modelAnswer:
      "Interface extends wird vom Compiler eager evaluiert: Die Property-Liste wird einmal " +
      "berechnet und in einem Cache gespeichert. Bei jeder Verwendung von A greift der Compiler " +
      "auf den Cache zu. Intersection Types (B & C & D) werden lazy evaluiert: Bei jeder " +
      "Zuweisbarkeits-Pruefung muss der Compiler die Properties von B, C und D neu zusammenmergen. " +
      "In einem Projekt mit 100 Verwendungen von A bedeutet das: 1 Berechnung vs. 100 Merge-Operationen.",
    keyPoints: [
      "Interface: eagerly evaluiert, Property-Liste gecacht",
      "Intersection: lazy evaluiert, bei jeder Verwendung neu gemergt",
      "Der Unterschied wird bei haeufiger Verwendung messbar",
      "In grossen Projekten kann das den Checker um 10-20% entlasten",
    ],
  },
];
