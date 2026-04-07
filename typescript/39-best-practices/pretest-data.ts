// pretest-data.ts — L39: Best Practices & Anti-Patterns
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Haeufigste Fehler ──────────────────────────────────────

  {
    sectionId: 1,
    question: "Was ist das Problem mit 'as User' bei API-Responses?",
    options: [
      "Der Compiler prueft nicht ob die Daten wirklich ein User sind — Runtime-Crash moeglich",
      "Es ist langsamer als ein Type Guard",
      "Es funktioniert nicht mit strict: true",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "'as' ist ein 'Trust me' an den Compiler. Wenn die API etwas anderes liefert, crasht der Code zur Laufzeit.",
  },
  {
    sectionId: 1,
    question: "Was passiert wenn man 'any' fuer eine Variable verwendet und dann auf ein Property zugreift?",
    options: [
      "TypeScript prueft den Zugriff und gibt eine Warnung",
      "Der Zugriff ergibt wieder 'any' — keine Pruefung, 'any' ist ansteckend",
      "Der Zugriff ergibt 'unknown'",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Jeder Zugriff auf any ergibt any. Das breitet sich durch die gesamte Aufrufkette aus.",
  },
  {
    sectionId: 1,
    question: "Wie erzwingt man dass ein switch-Statement alle Faelle einer Union abdeckt?",
    options: [
      "Mit einer speziellen Compiler-Option",
      "Mit einem default-Case der den Wert an 'never' zuweist — Compile-Error bei fehlendem Case",
      "Das geht in TypeScript nicht",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Der never-Trick: const _: never = value im default. Wenn ein Case fehlt, ist value nicht never → Compile-Error.",
  },

  // ─── Sektion 2: any vs unknown vs never ─────────────────────────────────

  {
    sectionId: 2,
    question: "Wann sollte man 'unknown' statt 'any' verwenden?",
    options: [
      "Nur bei Funktionsparametern",
      "Fast immer — unknown erzwingt Pruefung, any nicht",
      "Nur bei API-Responses",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "In 95% der Faelle wo man any schreiben wuerde ist unknown die richtige Wahl. Die 5% Ausnahmen: Migration, Double Cast, Library-Internals.",
  },
  {
    sectionId: 2,
    question: "Was sind die drei Hauptrollen von 'never' in TypeScript?",
    options: [
      "Fehlerbehandlung, Logging, Testing",
      "Exhaustive Checks, unmoegliche Funktionen, Typ-Level-Filterung",
      "Validierung, Parsing, Serialisierung",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "never: (1) Exhaustive switch, (2) Funktionen die nie zurueckkehren (throw), (3) Typen filtern (T extends string ? never : T).",
  },
  {
    sectionId: 2,
    question: "Was gibt es fuer einen Entscheidungsbaum bei 'any vs unknown vs never'?",
    options: [
      "Immer unknown verwenden",
      "Externe Daten → unknown, generische Container → Generic T, nie zurueckkehren → never, sonst → unknown",
      "Immer any verwenden und spaeter refactoren",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Der Entscheidungsbaum: unknown fuer unbekannte Daten, Generic T fuer Container, never fuer Unmoegliches, any nur bei Migration.",
  },

  // ─── Sektion 3: Overengineering vermeiden ───────────────────────────────

  {
    sectionId: 3,
    question: "Wann ist ein Generic Over-Engineering?",
    options: [
      "Wenn der Typparameter T nur einmal vorkommt (kein Zusammenhang zwischen Input und Output)",
      "Wenn er einen Constraint hat",
      "Wenn er mit extends verwendet wird",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Ein Generic der nur einmal vorkommt verbindet nichts. function log<T>(msg: T): void → besser: function log(msg: unknown): void.",
  },
  {
    sectionId: 3,
    question: "Was ist YAGNI?",
    options: [
      "You Aren't Gonna Need It — implementiere keine Komplexitaet die du nicht jetzt brauchst",
      "Eine TypeScript-Compiler-Option",
      "Yet Another Generic Naming Issue",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "YAGNI gilt auch fuer Typen: Ein einfaches Interface ist besser als ein verschachtelter Conditional Type wenn beides den Job erledigt.",
  },
  {
    sectionId: 3,
    question: "Wann sind Branded Types Over-Engineering?",
    options: [
      "Fuer lokale Formularfelder die nur in einer Komponente existieren",
      "Immer",
      "Fuer Entity-IDs wie UserId und OrderId",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Branded Types lohnen sich wenn Verwechslung echte Bugs verursacht. Lokale Formularfelder werden nicht zwischen Modulen ausgetauscht.",
  },

  // ─── Sektion 4: Type Assertions vs Type Guards ─────────────────────────

  {
    sectionId: 4,
    question: "Was ist der fundamentale Unterschied zwischen 'as User' und einem Type Guard?",
    options: [
      "'as' ist ein 'Trust me' (keine Pruefung), Type Guard ist ein 'Prove it' (Runtime-Pruefung)",
      "'as' prueft zur Runtime, Type Guard prueft zur Compilezeit",
      "Kein Unterschied",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Type Assertion = Compiler glaubt dir blind. Type Guard = Du lieferst den Beweis mit Runtime-Checks.",
  },
  {
    sectionId: 4,
    question: "Was macht 'asserts value is T' anders als 'value is T'?",
    options: [
      "Kein Unterschied",
      "'asserts' ist nur fuer Klassen",
      "'asserts' wirft bei Fehler — der Typ gilt danach direkt ohne if",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "is → boolean (fuer if/else). asserts → void oder throw. Nach asserts gilt der Typ sofort im Scope.",
  },
  {
    sectionId: 4,
    question: "Wann ist 'as' (Type Assertion) akzeptabel?",
    options: [
      "Bei jeder API-Response",
      "Immer wenn der Compiler meckert",
      "In Test-Code (Mocks), bei DOM-Zugriff (getElementById) und bei Typ-System-Grenzen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "In Tests sind partielle Mocks OK. Bei DOM weisst du welches Element es ist. Bei Typ-Grenzen: Double Cast mit Kommentar.",
  },

  // ─── Sektion 5: Defensive vs Offensive Typing ──────────────────────────

  {
    sectionId: 5,
    question: "Was ist die 'Defensive Schale, offensiver Kern' Architektur?",
    options: [
      "Alles defensiv typisieren",
      "Nur Tests defensiv schreiben",
      "An Systemgrenzen Runtime-validieren, im Kern dem Typsystem vertrauen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Systemgrenzen (API, User-Input): unknown + Validierung. Kern (Services, Logik): Typsystem reicht.",
  },
  {
    sectionId: 5,
    question: "Ist HttpClient.get<User>() in Angular echte Typsicherheit?",
    options: [
      "Ja, der Generic prueft den Response",
      "Nur mit strict: true",
      "Nein, es ist eine getarnte Assertion — die API koennte etwas anderes liefern",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "<User> wird zur Laufzeit entfernt (Type Erasure). Es ist ein 'Trust me' an den Compiler, keine Pruefung.",
  },
  {
    sectionId: 5,
    question: "Was bedeutet 'Parse, Don't Validate'?",
    options: [
      "JSON.parse statt regulaere Ausdruecke verwenden",
      "Ich weiss es nicht",
      "Parsing ist immer schneller als Validierung",
      "Validiere UND transformiere in einen staerkeren Typ — der Typ beweist die Validierung",
    ],
    correct: 3,
    explanation: "parseEmail(s): Email statt validateEmail(s): boolean. Nach dem Parse IST der Typ der Beweis.",
  },

  // ─── Sektion 6: Praxis ─────────────────────────────────────────────────

  {
    sectionId: 6,
    question: "Was ist die wichtigste Metrik fuer TypeScript-Qualitaet?",
    options: [
      "Anzahl der Generics",
      "Ich weiss es nicht",
      "Anzahl der Dateien",
      "any-Dichte: Anzahl 'any' pro 1000 Zeilen (Ziel: < 1)",
    ],
    correct: 3,
    explanation: "any-Dichte ist direkt messbar und korreliert mit der Anzahl der Runtime-Bugs durch fehlende Typpruefung.",
  },
  {
    sectionId: 6,
    question: "Welches Refactoring-Pattern hat den groessten Impact?",
    options: [
      "Alle Strings mit Branded Types versehen",
      "Ich weiss es nicht",
      "Alle Kommentare entfernen",
      "Boolean-Flags durch Discriminated Unions ersetzen (verhindert unmoegliche Zustaende)",
    ],
    correct: 3,
    explanation: "Boolean-Flags → DU eliminiert ganze Klassen von Bugs: unmoegliche Zustaende, korrelierte Nullability, vergessene Cases.",
  },
  {
    sectionId: 6,
    question: "Was ist die einzelne wichtigste TypeScript Best Practice?",
    options: [
      "Moeglichst viele Generics verwenden",
      "Ich weiss es nicht",
      "Jede Variable explizit annotieren",
      "Dem Compiler vertrauen und 'as'/'any' nicht als Loesung verwenden",
    ],
    correct: 3,
    explanation: "Der Compiler ist dein Partner. Wenn er meckert, hat er meistens recht. 'as' und 'any' unterdrücken nur Symptome.",
  },
];
