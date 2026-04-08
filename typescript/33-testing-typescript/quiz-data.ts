// quiz-data.ts — L33: Testing TypeScript
// 9 MC + 3 short-answer + 2 predict-output + 1 explain-why = 15 Fragen
// MC correct-Index Verteilung: 3x0, 2x1, 2x2, 2x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "33";
export const lessonTitle = "Testing TypeScript";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (9 Fragen, correct: 0,0,0, 1,1, 2,2, 3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Vitest vs Jest — correct: 0 ---
  {
    question: "Was ist der Hauptvorteil von Vitest gegenueber Jest fuer TypeScript?",
    options: [
      "Native TypeScript-Unterstuetzung ohne Transformer (Zero-Config)",
      "Vitest hat mehr Matcher als Jest und deckt damit mehr Testfaelle von vornherein ab",
      "Vitest kann Tests parallel ausfuehren, Jest nicht — was bei grossen Testsuites entscheidend ist",
      "Vitest unterstuetzt nur TypeScript, nicht JavaScript — was den Fokus auf Typsicherheit erhoeht",
    ],
    correct: 0,
    explanation:
      "Vitest basiert auf Vite und versteht TypeScript nativ. Jest braucht ts-jest oder " +
      "@swc/jest als Transformer, was Konfigurationsaufwand und Performance-Overhead bedeutet.",
    elaboratedFeedback: {
      whyCorrect: "Vitest's Vite-Basis transformiert TypeScript automatisch. Kein extra Plugin, keine moduleNameMapper-Konfiguration fuer Path-Aliases, kein separates tsconfig.spec.json fuer den Transformer.",
      commonMistake: "Jest kann auch TypeScript — aber eben nicht nativ. Die Konfiguration von ts-jest (tsconfig-Pfad, ESM-Modus, Path-Aliases) ist eine haeufige Fehlerquelle."
    }
  },

  // --- Frage 2: TypeScript vs Tests — correct: 0 ---
  {
    question: "Was prueft TypeScript, was Unit-Tests NICHT pruefen koennen?",
    options: [
      "Die korrekte Form (Typen, Schnittstellen) — nicht das Verhalten",
      "Die Laufzeit-Performance von Funktionen — TypeScript misst die Ausfuehrungsgeschwindigkeit beim Kompilieren",
      "Ob eine Funktion bei bestimmten Eingaben crasht — TypeScript simuliert alle Code-Pfade durch",
      "Die korrekte Reihenfolge von Funktionsaufrufen — TypeScript validiert die Kontrollfluss-Grafen",
    ],
    correct: 0,
    explanation:
      "TypeScript prueft FORM (Typen stimmen, Schnittstellen eingehalten), Tests pruefen " +
      "VERHALTEN (richtige Ergebnisse, richtige Seiteneffekte). TypeScript kann nicht " +
      "pruefen ob add(1,2) wirklich 3 ergibt — nur dass die Signatur stimmt.",
    elaboratedFeedback: {
      whyCorrect: "add(a: number, b: number): number — TypeScript sagt: Signatur ist korrekt. Ob die Implementierung a*b statt a+b ist, kann TypeScript nicht wissen. Tests pruefen die Implementierung.",
      commonMistake: "Manche glauben, TypeScript mache Tests ueberfluessig. Es ergaenzt sie — TypeScript faengt Typ-Fehler ab, Tests fangen Logik-Fehler ab."
    }
  },

  // --- Frage 3: expect() Typen — correct: 0 ---
  {
    question: "Was passiert bei: expect(42).toBe('hello')?",
    options: [
      "Compile-Error — TypeScript prueft dass expected den gleichen Typ wie actual hat",
      "Der Test schlaegt fehl zur Laufzeit, kompiliert aber — toBe vergleicht einfach die Werte ohne Typ-Pruefung",
      "Der Test besteht weil 42 und 'hello' beide truthy sind und toBe auf Wahrheit testet",
      "TypeError zur Laufzeit wegen verschiedener Typen — JavaScript erkennt den Typ-Konflikt beim Vergleich",
    ],
    correct: 0,
    explanation:
      "expect<T>(actual: T) gibt Matchers<T> zurueck. toBe(expected: T) erwartet den " +
      "gleichen Typ. Da T = number (von 42), ist 'hello' (string) nicht zuweisbar → Compile-Error.",
    elaboratedFeedback: {
      whyCorrect: "Die generische Kette: expect(42) → T = number → Matchers<number> → toBe(expected: number). 'hello' ist string, nicht number → Compile-Error. TypeScript verhindert unsinnige Assertions.",
      commonMistake: "In aelteren Jest-Versionen oder ohne strikte Typen koennte das kompilieren. Mit aktuellen @types/jest und strict: true ist es ein Fehler."
    }
  },

  // --- Frage 4: vi.fn() Typen — correct: 1 ---
  {
    question: "Was ist der Vorteil von vi.fn<(id: string) => Promise<User>>() gegenueber vi.fn()?",
    options: [
      "vi.fn() mit Typparameter ist schneller zur Laufzeit weil der Typ zur Optimierung genutzt wird",
      "Der Typparameter erzwingt korrekte Argumente und Rueckgabewerte beim Mock",
      "vi.fn() ohne Typparameter erzeugt einen Compile-Error weil TypeScript den Typ nicht inferieren kann",
      "Der Typparameter macht den Mock thread-safe und verhindert Race Conditions in parallelen Tests",
    ],
    correct: 1,
    explanation:
      "vi.fn<Signatur>() erzeugt einen typisierten Mock. mockFn('123') ist OK (string), " +
      "mockFn(123) ist ein Compile-Error (number statt string). mockResolvedValue muss " +
      "User zurueckgeben. Ohne Typparameter ist alles 'any'.",
    elaboratedFeedback: {
      whyCorrect: "Der Typparameter macht den Mock zum Vertrag: Nur korrekte Aufrufe und korrekte Rueckgabewerte werden akzeptiert. Das faengt Mock-Fehler beim Kompilieren ab, nicht erst beim Testlauf.",
      commonMistake: "Viele nutzen vi.fn() ohne Typparameter weil es einfacher ist. Das fuehrt zu 'any'-Mocks die keine Fehler melden — der Test kompiliert, aber testet moeglicherweise das Falsche."
    }
  },

  // --- Frage 5: vi.mocked() — correct: 1 ---
  {
    question: "Was macht vi.mocked(service)?",
    options: [
      "Es erstellt einen neuen Mock des Services mit leeren Implementationen fuer alle Methoden",
      "Es castet den Service zu Mocked<T> — alle Methoden werden zu Mock-Typen",
      "Es spioniert auf alle Methoden-Aufrufe des Services und protokolliert sie automatisch mit",
      "Es ersetzt den Service durch einen automatischen Mock der alle Methodenaufrufe interceptet",
    ],
    correct: 1,
    explanation:
      "vi.mocked() ist ein reiner Typ-Cast (No-Op zur Laufzeit). Es wandelt alle " +
      "Methoden in Mock-Typen um, sodass .mockResolvedValue() etc. verfuegbar sind. " +
      "Voraussetzung: Das Modul wurde vorher mit vi.mock() gemockt.",
    elaboratedFeedback: {
      whyCorrect: "Mocked<UserService> mapped alle Methoden: getUser wird von (id: string) => Promise<User> zu MockedFunction<(id: string) => Promise<User>>. Das fuegt .mockResolvedValue, .mockReturnValue etc. hinzu.",
      commonMistake: "Viele versuchen vi.mocked() ohne vorheriges vi.mock(). Das aendert nur den Typ, nicht den Wert — die echte Methode wird weiterhin aufgerufen!"
    }
  },

  // --- Frage 6: expectTypeOf — correct: 2 ---
  {
    question: "Was ist der Unterschied zwischen expect() und expectTypeOf() in Vitest?",
    options: [
      "expect() ist fuer Vitest, expectTypeOf() ist fuer Jest — sie sind framework-spezifisch",
      "expect() ist synchron und prueft sofort, expectTypeOf() ist asynchron und braucht einen Promise",
      "expect() prueft Laufzeit-Werte, expectTypeOf() prueft Compilezeit-Typen",
      "Es gibt keinen Unterschied — sie sind Aliase die dieselbe Funktion mit anderem Namen aufrufen",
    ],
    correct: 2,
    explanation:
      "expect(value).toBe(3) prueft den WERT zur Laufzeit. expectTypeOf(value).toBeNumber() " +
      "prueft den TYP zur Compilezeit. expect faengt Logik-Fehler, expectTypeOf faengt " +
      "Typ-Regressionen (z.B. Typ wird zu 'any').",
    elaboratedFeedback: {
      whyCorrect: "expectTypeOf prueft: 'Hat dieser Ausdruck den Typ number?' — nicht 'Ist der Wert 42?'. Das ist wichtig fuer generische Funktionen und Utility Types, wo der korrekte Typ die API-Garantie ist.",
      commonMistake: "Manche denken, expectTypeOf ersetze expect. Nein — sie ergaenzen sich. TypeTests fangen Typ-Probleme, Wert-Tests fangen Logik-Probleme."
    }
  },

  // --- Frage 7: Test-Factory — correct: 2 ---
  {
    question: "Warum nimmt createTestUser() einen Parameter Partial<User> statt alle Felder einzeln?",
    options: [
      "Weil Partial<User> schneller ist als einzelne Parameter weil weniger Typ-Checks noetig sind",
      "Weil TypeScript keine Funktionen mit vielen Parametern unterstuetzt und deshalb Objekte bevorzugt",
      "Weil Tests nur die fuer sie relevanten Felder ueberschreiben — der Rest kommt von Defaults",
      "Weil Partial<User> optionale Felder automatisch auf null setzt und so Boilerplate reduziert",
    ],
    correct: 2,
    explanation:
      "createTestUser({ role: 'admin' }) sagt: 'Dieser Test ist ueber Admin-Verhalten.' " +
      "Alle anderen Felder sind irrelevant und werden von Defaults gefuellt. Das macht " +
      "Tests kuerzer, klarer und weniger anfaellig fuer Aenderungen am User-Typ.",
    elaboratedFeedback: {
      whyCorrect: "Wenn User ein neues Feld 'department' bekommt: Bei manueller Erstellung muss JEDER Test aktualisiert werden. Mit Factory: Nur die Factory bekommt einen Default-Wert. Alle Tests bleiben unveraendert.",
      commonMistake: "Manche uebergeben in jedem Test ALLE Felder 'zur Sicherheit'. Das ist Noise — der Leser kann nicht erkennen was fuer den Test relevant ist."
    }
  },

  // --- Frage 8: Angular TestBed — correct: 3 ---
  {
    question: "Warum ist Angular's jasmine.createSpyObj<T>() typsicherer als ein manueller Mock?",
    options: [
      "createSpyObj ist schneller als manuelle Mocks weil es optimierte Spy-Funktionen verwendet",
      "createSpyObj unterstuetzt mehr Methoden als manuelle Mocks und deckt das gesamte Interface ab",
      "createSpyObj erstellt automatisch Spy-Implementierungen fuer alle Methoden ohne manuellen Aufwand",
      "createSpyObj prueft die Methoden-Namen gegen das Interface — Tippfehler werden erkannt",
    ],
    correct: 3,
    explanation:
      "jasmine.createSpyObj<UserService>('UserService', ['getUsr']) — Compile-Error! " +
      "'getUsr' ist kein Methodenname von UserService. Der Typparameter prueft die " +
      "Array-Elemente gegen das Interface.",
    elaboratedFeedback: {
      whyCorrect: "Der zweite Parameter von createSpyObj ist ein Array von keyof T. TypeScript prueft jeden String gegen die Methoden des Interfaces. Tippfehler werden sofort erkannt — nicht erst wenn der Test laeuft.",
      commonMistake: "Manche mocken mit { getUser: jest.fn() } as any. Das verliert alle Typ-Sicherheit — Tippfehler in Methoden-Namen werden nicht erkannt."
    }
  },

  // --- Frage 9: MSW — correct: 3 ---
  {
    question: "Warum ist MSW (Mock Service Worker) framework-unabhaengig?",
    options: [
      "MSW nutzt keine HTTP-Bibliothek und ist damit komplett unabhaengig von externen Dependencies",
      "MSW ist in WebAssembly geschrieben was es plattformunabhaengig und framework-neutral macht",
      "MSW testet nur TypeScript-Typen, nicht Laufzeit-Code — deshalb funktioniert es mit jedem Framework",
      "MSW interceptet auf Netzwerk-Ebene — unabhaengig vom HTTP-Client (fetch, axios, HttpClient)",
    ],
    correct: 3,
    explanation:
      "MSW interceptet fetch() und XMLHttpRequest auf Netzwerk-Ebene (Service Worker im " +
      "Browser, Node.js-Interceptor im Test). Egal ob Angular's HttpClient, fetch() oder " +
      "axios — alle nutzen intern fetch/XHR. MSW faengt sie alle ab.",
    elaboratedFeedback: {
      whyCorrect: "Angular's HttpClientTestingModule mockt nur den Angular HttpClient. MSW mockt die Netzwerkschicht darunter. Deshalb funktioniert MSW mit Angular, React, Vue, Svelte — und sogar ohne Framework.",
      commonMistake: "Viele denken, man brauche framework-spezifisches HTTP-Mocking. Fuer Integration-Tests ist MSW oft die bessere Wahl — gleiche Handler fuer Angular UND React Tests."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welche Vitest-Funktion castet einen Mock-Import zu typisierten Mock-Methoden?",
    expectedAnswer: "vi.mocked",
    acceptableAnswers: ["vi.mocked", "vi.mocked()", "mocked"],
    explanation:
      "vi.mocked(service) wandelt den Typ in Mocked<T> um — alle Methoden werden " +
      "zu Mock-Funktionen. Zur Laufzeit ist es ein No-Op (reiner Typ-Cast).",
  },

  {
    type: "short-answer",
    question: "Welche Vitest-Funktion prueft TypeScript-Typen statt Laufzeit-Werte?",
    expectedAnswer: "expectTypeOf",
    acceptableAnswers: ["expectTypeOf", "expectTypeOf()", "expect-type-of"],
    explanation:
      "expectTypeOf(value).toBeString() prueft den Compilezeit-Typ, nicht den Laufzeit-Wert. " +
      "Es ist in Vitest eingebaut und braucht keine Installation.",
  },

  {
    type: "short-answer",
    question: "Welcher Utility Type wird in Test-Factories genutzt um einzelne Felder ueberschreibbar zu machen?",
    expectedAnswer: "Partial",
    acceptableAnswers: ["Partial", "Partial<T>", "partial"],
    explanation:
      "Partial<T> macht alle Properties optional. createTestUser(overrides?: Partial<User>) " +
      "erlaubt es, nur die fuer den Test relevanten Felder zu ueberschreiben.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Kompiliert dieser Code? Antworte mit 'Ja' oder 'Nein'.",
    code:
      "const mockFn = vi.fn<(id: string) => Promise<User>>();\n" +
      "mockFn(42);",
    expectedAnswer: "Nein",
    acceptableAnswers: ["Nein", "nein", "No", "no", "Compile-Error"],
    explanation:
      "vi.fn<(id: string) => Promise<User>>() erwartet einen string-Parameter. " +
      "42 ist number, nicht string. TypeScript meldet: Argument of type 'number' " +
      "is not assignable to parameter of type 'string'.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat 'result'?",
    code:
      "function createTestUser(overrides?: Partial<User>): User {\n" +
      "  return { id: '1', name: 'Test', email: 'test@test.de', role: 'user', createdAt: '2024', ...overrides };\n" +
      "}\n" +
      "const result = createTestUser({ role: 'admin' });",
    expectedAnswer: "User",
    acceptableAnswers: ["User", "user"],
    explanation:
      "createTestUser gibt immer User zurueck — unabhaengig von den Overrides. " +
      "Partial<User> erlaubt einzelne Felder zu ueberschreiben, aber der Rueckgabetyp " +
      "bleibt User. TypeScript prueft: { role: 'admin' } ist ein gueltiger Partial<User>.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum sollte man TypeScript-Typen als 'Basis-Schicht' der Test-Pyramide betrachten?",
    modelAnswer:
      "TypeScript-Typen pruefen die Korrektheit des Codes STAENDIG — bei jedem Tastendruck " +
      "in der IDE, bei jedem Build. Sie kosten keine Laufzeit (Type Erasure) und keinen " +
      "Test-Aufwand (kein Test schreiben noetig). Sie fangen eine ganze Kategorie von Fehlern " +
      "ab: falsche Argumente, fehlende Properties, inkompatible Typen. Das ist wie ein " +
      "permanenter, kostenloser Test der etwa 15% aller Bugs verhindert (laut Microsoft-Studie). " +
      "Unit-Tests, Integration-Tests und E2E-Tests bauen DARAUF auf — sie testen das Verhalten, " +
      "waehrend TypeScript die Form garantiert.",
    keyPoints: [
      "TypeScript prueft staendig — kein manueller Test-Lauf noetig",
      "Kein Laufzeit-Overhead (Type Erasure)",
      "Faengt ~15% aller Bugs ab (Microsoft-Studie)",
      "Ergaenzt Tests: Typen pruefen Form, Tests pruefen Verhalten",
    ],
  },
];
