// quiz-data.ts — L39: Best Practices & Anti-Patterns
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "39";
export const lessonTitle = "Best Practices & Anti-Patterns";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: as-Casts — correct: 0 ---
  {
    question: "Warum sind Type Assertions (`as`) bei externen Daten (API-Responses) gefaehrlich?",
    options: [
      "Der Compiler prueft NICHT ob die Daten tatsaechlich dem Typ entsprechen — falsche Daten fuehren zu Runtime-Crashes",
      "Type Assertions sind langsamer als Type Guards weil sie zur Laufzeit den Typ ueberpruefen muessen",
      "Type Assertions funktionieren nicht mit async/await — sie brechen die Promise-Kette",
      "Type Assertions werden in JavaScript-Code uebersetzt und verlangsamen die Ausfuehrung messbar",
    ],
    correct: 0,
    explanation:
      "Type Assertions sind reine Compilezeit-Anweisungen. Zur Laufzeit existieren sie nicht. " +
      "Wenn die API ein anderes Format liefert, merkt der Code es nicht — bis etwas crashed.",
    elaboratedFeedback: {
      whyCorrect: "'as User' ist ein 'Trust me' an den Compiler. Wenn die API statt {name: string} ein {error: string} liefert, greift der Code auf undefined zu — ohne Warnung.",
      commonMistake: "Viele denken 'as' fuege eine Runtime-Pruefung hinzu. Nein — es ist REINE Typ-Information und wird bei der Kompilierung komplett entfernt (Type Erasure)."
    }
  },

  // --- Frage 2: any Ansteckung — correct: 0 ---
  {
    question: "Was bedeutet es dass `any` 'ansteckend' ist?",
    options: [
      "Jeder Zugriff auf einen any-Wert ergibt wieder any — es breitet sich durch die gesamte Aufrufkette aus",
      "any verlangsamt den Compiler fuer das gesamte Projekt weil die Typ-Inferenz komplexer wird",
      "any verhindert dass andere Dateien korrekt typisiert werden — der Fehler breitet sich ueber Imports aus",
      "any macht den gesamten Code zu JavaScript — alle Typ-Informationen werden unwiderruflich geloescht",
    ],
    correct: 0,
    explanation:
      "'const x: any = ...; const y = x.foo; const z = y.bar;' — y und z sind auch any. " +
      "Ein einziges any in einer Utility-Funktion kann das Typsystem fuer hunderte Aufrufer aushebeln.",
    elaboratedFeedback: {
      whyCorrect: "any + jede Operation = any. Das ist anders als unknown: unknown + Operation = Compile-Error. any 'fliesst' durch Property-Zugriffe, Funktionsaufrufe und Return-Werte.",
      commonMistake: "Manche denken any beschraenkt sich auf die Variable. Nein — es infiziert alles was damit interagiert. Deshalb ist 'no-explicit-any' die wichtigste ESLint-Regel."
    }
  },

  // --- Frage 3: Exhaustive Check — correct: 0 ---
  {
    question: "Wie erzwingt man exhaustive Switch-Statements mit TypeScript?",
    options: [
      "Mit einem default-Case der den Wert an never zuweist — Compile-Error wenn ein Case fehlt",
      "Mit einer speziellen Compiler-Option 'exhaustiveSwitch' die in der tsconfig aktiviert werden muss",
      "Mit @ts-expect-error ueber dem Switch — der Compiler ignoriert fehlende Cases",
      "Das geht nur mit ESLint, nicht mit dem Compiler — TypeScript hat keine native Unterstuetzung",
    ],
    correct: 0,
    explanation:
      "Nach allen Cases ist der Typ auf never eingeengt. 'const _: never = value' " +
      "erzeugt einen Compile-Error wenn ein Case fehlt — weil der Wert nicht never ist.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript's Control Flow Analysis verengt den Typ in jedem case. Wenn alle Cases abgedeckt sind, ist der Rest never. Ein neuer Union-Member erzeugt sofort einen Compile-Error.",
      commonMistake: "Einfach 'default: return ...' ist KEIN exhaustive Check. Es faengt neue Cases ab, aber der Compiler warnt nicht. Der never-Trick ist der einzige Weg fuer Compile-Zeit-Sicherheit."
    }
  },

  // --- Frage 4: Return Types — correct: 0 ---
  {
    question: "Warum sollten exportierte Funktionen einen expliziten Return Type haben?",
    options: [
      "Der Return Type ist ein Vertrag — Implementierungsaenderungen die den Typ veraendern werden sofort erkannt",
      "TypeScript kann Return Types nicht inferieren — es braucht immer eine explizite Annotation",
      "Explizite Return Types machen den Code schneller weil der Compiler weniger Inferenz-Arbeit hat",
      "Es ist eine reine Konvention ohne technischen Vorteil — der Compiler ignoriert explizite Return Types",
    ],
    correct: 0,
    explanation:
      "Ohne expliziten Return Type aendert sich der Typ stillschweigend wenn sich die " +
      "Implementierung aendert. Mit explizitem Typ bekommt der AUTOR den Fehler — nicht die Aufrufer.",
    elaboratedFeedback: {
      whyCorrect: "Explizite Return Types sind ein Vertrag: 'Diese Funktion gibt User | undefined zurueck.' Wenn jemand die Implementierung aendert und ploetzlich User[] zurueckgibt, bricht der Vertrag sichtbar.",
      commonMistake: "Fuer interne (nicht-exportierte) Funktionen reicht Inferenz voellig aus. Die Regel gilt nur fuer die oeffentliche API — dort wo andere Module sich auf den Typ verlassen."
    }
  },

  // --- Frage 5: unknown vs any — correct: 1 ---
  {
    question: "Wann ist unknown NICHT die richtige Wahl und any akzeptabel?",
    options: [
      "Bei jeder API-Response — unknown ist immer die sicherste Wahl fuer externe Daten",
      "Bei temporaerer JS→TS Migration mit TODO-Kommentar und ESLint-Ausnahme",
      "Bei allen Funktionsparametern — unknown ist immer die bessere Wahl als any",
      "Bei Discriminated Unions — dort ist any manchmal noetig fuer die Typ-Inferenz",
    ],
    correct: 1,
    explanation:
      "Waehrend einer schrittweisen Migration ist temporaeres any akzeptabel — " +
      "mit TODO-Kommentar, ESLint-Ausnahme und dem Plan es spaeter zu beheben.",
    elaboratedFeedback: {
      whyCorrect: "Migration ist ein Prozess. Alles sofort typisieren ist unrealistisch bei grossen Codebases. any mit TODO ist ehrlich — es sagt 'hier ist noch Arbeit'. Ohne TODO ist es Nachlaeassigkeit.",
      commonMistake: "Manche migrieren nie — das TODO bleibt ewig. Setze einen Zeitraum: 'TODO: Type by Q2 2024'. Und aktiviere 'no-explicit-any: warn' damit es sichtbar bleibt."
    }
  },

  // --- Frage 6: Generic-Faustregel — correct: 1 ---
  {
    question: "Wann ist ein Generic Over-Engineering?",
    options: [
      "Wenn T in mehreren Parametern und im Return-Typ vorkommt — dann verbindet es die Typen korrekt",
      "Wenn T nur einmal vorkommt und keinen Zusammenhang zwischen Input und Output herstellt",
      "Wenn T einen Constraint hat — dann ist ein Generic immer angemessen",
      "Wenn die Funktion mehr als 2 Parameter hat — dann braucht man Generics fuer die Typ-Sicherheit",
    ],
    correct: 1,
    explanation:
      "Ein Generic der nur einmal vorkommt stellt keinen Zusammenhang her. " +
      "'function log<T>(msg: T): void' — T wird nur einmal verwendet. " +
      "'function log(msg: unknown): void' ist einfacher und gleichwertig.",
    elaboratedFeedback: {
      whyCorrect: "Generics verbinden Typen: Input mit Output, Parameter miteinander. Ein einzelnes T hat nichts zum Verbinden. Es fuegt Komplexitaet hinzu ohne Typ-Sicherheit zu gewinnen.",
      commonMistake: "Manche verwenden Generics um 'generisch zu wirken'. Aber ein unnoetiger Generic verwirrt: 'Was ist T? Warum brauche ich es?' — Einfachheit schlaegt Generalitaet."
    }
  },

  // --- Frage 7: YAGNI — correct: 1 ---
  {
    question: "Was bedeutet YAGNI fuer TypeScript-Typen?",
    options: [
      "TypeScript sollte nicht verwendet werden — YAGNI bedeutet 'verwende das einfachste Tool'",
      "Schreibe den einfachsten Typ der den Job erledigt — nicht den allgemeinsten moeglichen",
      "Verwende nie Generics — sie sind immer Over-Engineering fuer die meisten Anwendungsfaelle",
      "Verwende nur primitive Typen — komplexe Typen sind ein Zeichen von schlechtem Design",
    ],
    correct: 1,
    explanation:
      "YAGNI = You Aren't Gonna Need It. Implementiere keine Typ-Komplexitaet " +
      "die du nicht jetzt brauchst. Ein Interface reicht oft wo ein Conditional Type overkill waere.",
    elaboratedFeedback: {
      whyCorrect: "Ueber-generische Typen haben Kosten: Compiler-Laufzeit, Lesbarkeit, Fehlermeldungen. Ein konkretes Interface ist schneller zu verstehen als ein verschachtelter Conditional Type.",
      commonMistake: "'Aber was wenn wir spaeter...' — dann refactored man. TypeScript macht Refactoring sicher (der Compiler zeigt alle Stellen). Voraus-Engineering lohnt sich selten bei Typen."
    }
  },

  // --- Frage 8: Parse Don't Validate — correct: 1 ---
  {
    question: "Was ist der Unterschied zwischen 'Validate' und 'Parse' im Kontext von TypeScript?",
    options: [
      "Kein Unterschied — beides prueft Daten zur Compilezeit und zur Laufzeit gleichermassen",
      "Validate gibt boolean zurueck, Parse gibt den staerkeren Typ zurueck — der Typ BEWEIST die Validierung",
      "Parse ist fuer JSON, Validate ist fuer Formulare — sie haben verschiedene Anwendungsbereiche",
      "Parse ist schneller, Validate ist sicherer — sie sind Trade-offs zwischen Performance und Sicherheit",
    ],
    correct: 1,
    explanation:
      "validateEmail(s): boolean — danach ist s immer noch string. " +
      "parseEmail(s): Email | null — der Email-Typ BEWEIST die Validierung. " +
      "Parse, Don't Validate (Alexis King, 2019).",
    elaboratedFeedback: {
      whyCorrect: "Nach Validierung: Du WEISST es ist gueltig, aber der TYP sagt das nicht. Nach Parsing: Der Typ IST der Beweis. Branded Types (L24) setzen dieses Prinzip um: Der Brand ist der Beweis.",
      commonMistake: "Manche validieren und casten danach: if (isEmail(s)) { const e = s as Email }. Besser: Die Parse-Funktion gibt direkt Email zurueck. Kein Cast noetig."
    }
  },

  // --- Frage 9: Defensive Schale — correct: 2 ---
  {
    question: "Wo sollte Runtime-Validierung (defensive Typing) stattfinden?",
    options: [
      "In jeder Funktion — defensive Programmierung sollte immer oberste Prioritaet haben",
      "Nur in Test-Code — Produktionscode sollte sich auf das Typsystem verlassen",
      "An Systemgrenzen: API-Handler, Formulare, JSON.parse, externe Datenquellen",
      "Nirgendwo — das Typsystem reicht vollstaendig aus um alle Fehler abzufangen",
    ],
    correct: 2,
    explanation:
      "Systemgrenzen sind die Stellen wo Daten von AUSSEN kommen — dort kann das " +
      "Typsystem nichts garantieren. Innerhalb des Systems reicht das Typsystem.",
    elaboratedFeedback: {
      whyCorrect: "Defensive Schale + offensiver Kern: An der Grenze validieren und in typisierte Werte umwandeln. Im Kern dem Typsystem vertrauen. Das ist effizient und sicher zugleich.",
      commonMistake: "In JEDER Funktion zu validieren ist paranoid und langsam. Im Kern sind die Typen durch die Schale garantiert — doppelte Pruefung ist redundant."
    }
  },

  // --- Frage 10: is vs asserts — correct: 2 ---
  {
    question: "Was ist der Unterschied zwischen `value is T` und `asserts value is T`?",
    options: [
      "Kein Unterschied — beides ist ein Type Guard und funktioniert exakt gleich zur Laufzeit",
      "'is' ist fuer Klassen, 'asserts' ist fuer Interfaces — sie haben verschiedene Anwendungsbereiche",
      "'is' gibt boolean zurueck (fuer if/else), 'asserts' wirft bei Fehler (Typ gilt danach direkt)",
      "'is' funktioniert nur mit typeof, 'asserts' mit instanceof — verschiedene Pruefungsmechanismen",
    ],
    correct: 2,
    explanation:
      "'is' ist optionales Narrowing — du entscheidest im if/else. " +
      "'asserts' ist erzwungenes Narrowing — die Funktion wirft oder der Typ gilt. " +
      "Kein if noetig nach asserts.",
    elaboratedFeedback: {
      whyCorrect: "isUser(data) → boolean. In if: data ist User. assertUser(data) → void (oder throw). Danach: data ist User. asserts ist 'fail fast': Entweder der Typ stimmt oder es knallt.",
      commonMistake: "Manche verwechseln asserts mit try/catch. asserts WIRFT wenn ungueltig — es gibt kein 'false' zurueck. Der Aufrufer muss mit dem Fehler umgehen oder ihn propagieren lassen."
    }
  },

  // --- Frage 11: HttpClient — correct: 2 ---
  {
    question: "Warum ist `HttpClient.get<User>('/api/users')` in Angular keine echte Typsicherheit?",
    options: [
      "HttpClient unterstuetzt keine Generics — die Syntax ist nur aus Gruenden der Abwaertskompatibilitaet vorhanden",
      "Der Generic wird zur Laufzeit entfernt und kann nicht fuer Runtime-Checks verwendet werden",
      "Der Generic ist eine getarnte Assertion — TypeScript prueft NICHT ob die API wirklich User liefert",
      "HttpClient gibt immer string zurueck — der Generic wird ignoriert und hat keine Auswirkung",
    ],
    correct: 2,
    explanation:
      "Der Generic <User> sagt dem Compiler: 'Glaub mir, die API gibt User zurueck.' " +
      "Das ist dasselbe wie 'as User'. Sicher waere: get<unknown>() + Zod-Validierung.",
    elaboratedFeedback: {
      whyCorrect: "Type Erasure: <User> verschwindet zur Laufzeit. Wenn die API {error: 'not found'} zurueckgibt, sagt TypeScript trotzdem 'das ist ein User'. Gefaehrliche Illusion von Sicherheit.",
      commonMistake: "Viele Angular-Devs vertrauen HttpClient.get<T> blind. Es ist KEIN Beweis — es ist ein Versprechen. Und Versprechen koennen gebrochen werden (API-Aenderung, Netzwerk-Fehler)."
    }
  },

  // --- Frage 12: Branded Types Wann — correct: 2 ---
  {
    question: "Wann sind Branded Types NICHT sinnvoll?",
    options: [
      "Fuer Entity-IDs die verwechselt werden koennten — hier sind Brands immer sinnvoll",
      "Fuer Waehrungsbetraege verschiedener Waehrungen — USD und EUR sollten nicht vertauscht werden",
      "Fuer lokale Formularfelder die nur in einer Komponente existieren",
      "Fuer validierte Werte wie Email oder URL — hier schuetzt der Brand vor falschen Zuweisungen",
    ],
    correct: 2,
    explanation:
      "Branded Types lohnen sich wenn Verwechslung echte Bugs verursacht. " +
      "Formularfelder in einer Komponente werden nicht verwechselt — " +
      "ein einfaches Interface reicht.",
    elaboratedFeedback: {
      whyCorrect: "Die Frage: 'Was passiert im schlimmsten Fall wenn die Werte vertauscht werden?' Bei Entity-IDs: falscher User. Bei Formularfeldern: nichts Schlimmes — sie bleiben in der Komponente.",
      commonMistake: "Manche branden ALLES. Das macht den Code verbos und schwer zu verwenden. Brands sind fuer Werte die ZWISCHEN Modulen/Services wandern, nicht fuer lokale Variablen."
    }
  },

  // --- Frage 13: Refactoring — correct: 3 ---
  {
    question: "Welches Refactoring-Pattern hat den groessten Impact auf Typsicherheit?",
    options: [
      "String-IDs → Branded Types — verhindert ID-Verwechslungen aber betrifft nur wenige Stellen",
      "Optional Chaining statt Non-null Assertion — entfernt Runtime-Crash-Risiken aber ist syntaktisch",
      "Index Signature → Record/Map — verbessert die Typ-Sicherheit von Dictionary-Objekten",
      "Boolean-Flags → Discriminated Union (verhindert unmoegliche Zustaende)",
    ],
    correct: 3,
    explanation:
      "Boolean-Flags → Discriminated Union eliminiert ganze Klassen von Bugs: " +
      "unmoegliche Zustaende, vergessene Null-Checks, korrelierte Daten. " +
      "Kein anderes Refactoring hat diesen Impact.",
    elaboratedFeedback: {
      whyCorrect: "{ isLoading: true, isError: true, data: null } ist ein unmoeglicher Zustand der mit Booleans existieren kann. Mit DU: { status: 'loading' } kann keinen Error-Zustand haben. Ganze Fehlerkategorie eliminiert.",
      commonMistake: "Branded Types sind wichtig, aber sie verhindern nur Verwechslungen. DUs verhindern ganze KLASSEN von Bugs — Zustandsexplosion, korrelierte Nullability, vergessene Cases."
    }
  },

  // --- Frage 14: Metriken — correct: 3 ---
  {
    question: "Was ist eine sinnvolle Metrik fuer TypeScript-Code-Qualitaet?",
    options: [
      "Anzahl der Zeilen TypeScript-Code — mehr Code bedeutet automatisch bessere Typ-Abdeckung",
      "Anzahl der verwendeten Generics — viele Generics zeigen fortgeschrittene Typ-Nutzung",
      "Anzahl der Type Guards pro Datei — je mehr Guards desto besser die Laufzeit-Sicherheit",
      "any-Dichte: Anzahl 'any' pro 1000 Zeilen (Ziel: < 1 in neuem Code)",
    ],
    correct: 3,
    explanation:
      "Die any-Dichte misst direkt wie viel vom Code untypisiert ist. " +
      "Weniger any = mehr Compiler-Schutz = weniger Runtime-Bugs.",
    elaboratedFeedback: {
      whyCorrect: "any-Dichte ist messbar, actionable und korreliert mit Bug-Rate. 'grep -c any *.ts' / Zeilen = Metrik. Ziel: 0 in neuem Code, < 1/1000 in Legacy-Code.",
      commonMistake: "Zeilen-Anzahl, Generic-Anzahl oder Type-Guard-Anzahl sind keine Qualitaets-Metriken. Mehr Generics ≠ besser. Weniger any = fast immer besser."
    }
  },

  // --- Frage 15: Ein Rat — correct: 3 ---
  {
    question: "Was ist die wichtigste einzelne Best Practice fuer TypeScript?",
    options: [
      "Moeglichst viele Generics verwenden — das zeigt fortgeschrittene TypeScript-Kenntnisse",
      "Jeden Typ explizit annotieren — Inferenz ist faul und sollte vermieden werden",
      "Immer die neueste TypeScript-Version verwenden — alte Versionen sind unsicher",
      "Dem Compiler vertrauen — 'as' und 'any' nicht nutzen um ihn zum Schweigen zu bringen",
    ],
    correct: 3,
    explanation:
      "Der Compiler ist dein Partner. Wenn er meckert, hat er meistens recht. " +
      "'as' und 'any' sind Symptom-Unterdrueckung, nicht Problemloesung.",
    elaboratedFeedback: {
      whyCorrect: "Jedes 'as' und 'any' ist eine Stelle wo du sagst: 'Ich weiss es besser als der Compiler.' Meistens stimmt das nicht. Die wenigen Ausnahmen sollten mit Kommentar dokumentiert werden.",
      commonMistake: "Manche annotieren ALLES explizit — auch wo Inferenz besser waere. Das ist das andere Extrem. Balance: Inferenz fuer lokale Variablen, explizite Typen fuer oeffentliche APIs."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Wie heisst das Prinzip 'Validiere UND transformiere in einen staerkeren Typ, statt nur boolean zurueckzugeben'?",
    expectedAnswer: "Parse, Don't Validate",
    acceptableAnswers: ["Parse, Don't Validate", "Parse Don't Validate", "parse dont validate"],
    explanation:
      "Parse, Don't Validate (Alexis King, 2019): parseEmail(s): Email statt validateEmail(s): boolean. " +
      "Der Typ ist der Beweis der Validierung.",
  },

  {
    type: "short-answer",
    question: "Wie heisst die TypeScript-Assertion-Syntax die nach dem Aufruf den Typ direkt einengt (ohne if)?",
    expectedAnswer: "asserts",
    acceptableAnswers: ["asserts", "asserts value is T", "assertion function"],
    explanation:
      "asserts value is User: Die Funktion wirft wenn ungueltig, danach ist value: User. " +
      "Kein if noetig — der Typ gilt direkt nach dem Aufruf.",
  },

  {
    type: "short-answer",
    question: "Wie nennt man die Architektur mit Runtime-Validierung an Systemgrenzen und Typ-Vertrauen im Kern?",
    expectedAnswer: "Defensive Schale, offensiver Kern",
    acceptableAnswers: ["Defensive Schale", "defensive Schale offensiver Kern", "defensive shell", "defensive shell offensive core"],
    explanation:
      "Defensive Schale validiert externe Daten (API, User-Input). " +
      "Offensiver Kern vertraut dem Typsystem — keine redundanten Runtime-Checks.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Kompiliert dieser Code mit strict: true?",
    code:
      "function greet(name: string) {\n" +
      "  if (name) {\n" +
      "    return 'Hello ' + name;\n" +
      "  }\n" +
      "}\n\n" +
      "const result: string = greet('World');",
    expectedAnswer: "Fehler",
    acceptableAnswers: ["Fehler", "Nein", "Compile Error", "Error"],
    explanation:
      "greet() hat keinen expliziten Return Type. Der inferierte Typ ist 'string | undefined' " +
      "(weil der else-Branch kein return hat). Zuweisung an 'string' schlaegt fehl.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat 'value' nach dem Assertion-Aufruf?",
    code:
      "function assertString(v: unknown): asserts v is string {\n" +
      "  if (typeof v !== 'string') throw new Error('Not a string');\n" +
      "}\n\n" +
      "const value: unknown = 'hello';\n" +
      "assertString(value);\n" +
      "// Welcher Typ ist value hier?",
    expectedAnswer: "string",
    acceptableAnswers: ["string"],
    explanation:
      "Nach assertString(value) ist value auf 'string' eingeengt. " +
      "asserts veraendert den Typ im umgebenden Scope — ohne if noetig.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist die Kombination aus 'Defensive Schale + offensiver Kern' die optimale Architektur " +
      "fuer TypeScript-Projekte?",
    modelAnswer:
      "An Systemgrenzen (API, User-Input, JSON.parse) kann TypeScript keine Garantien geben — " +
      "die Daten kommen von aussen. Dort braucht man Runtime-Validierung (Zod, Type Guards). " +
      "Im Kern des Systems sind die Daten durch die Schale validiert und typisiert. Hier " +
      "waeren erneute Runtime-Checks redundant und wuerden den Code aufblaahen. Das Typsystem " +
      "garantiert Korrektheit — Compile-Fehler statt Runtime-Crashes. Diese Architektur ist " +
      "effizient (minimale Runtime-Checks) und sicher (Grenzen sind geschuetzt).",
    keyPoints: [
      "Systemgrenzen: Daten sind unknown — Runtime-Validierung noetig",
      "Kern: Daten sind typisiert — Compiler garantiert Korrektheit",
      "Keine doppelten Checks — effizient",
      "Parse, Don't Validate: Validierung ergibt staerkere Typen fuer den Kern",
    ],
  },
];
