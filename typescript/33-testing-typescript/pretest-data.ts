// pretest-data.ts — L33: Testing TypeScript
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Test-Setup ─────────────────────────────────────────────

  {
    sectionId: 1,
    question: "Was braucht Jest um TypeScript-Dateien ausfuehren zu koennen?",
    options: [
      "Nichts — Jest unterstuetzt TypeScript nativ",
      "Einen Transformer wie ts-jest oder @swc/jest",
      "Eine spezielle TypeScript-Version",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Jest versteht nur JavaScript. ts-jest oder @swc/jest transformieren .ts-Dateien vor der Ausfuehrung.",
  },
  {
    sectionId: 1,
    question: "Was ist der Hauptvorteil von Vitest gegenueber Jest fuer TypeScript?",
    options: [
      "Mehr Matcher verfuegbar",
      "Native TypeScript-Unterstuetzung ohne Transformer",
      "Bessere IDE-Integration",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Vitest basiert auf Vite und transformiert TypeScript nativ. Kein ts-jest, keine extra Konfiguration.",
  },
  {
    sectionId: 1,
    question: "Sollte strict: true auch in Test-Dateien gelten?",
    options: [
      "Nein — Tests sollten flexibler sein",
      "Ja — Tests mit laxen Typen koennen echte Fehler verbergen",
      "Nur fuer Integration-Tests",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "strict: true in Tests verhindert dass 'any' sich einschleicht. Ein 'any' im Test kann echte Fehler maskieren.",
  },

  // ─── Sektion 2: Typing von Tests ──────────────────────────────────────

  {
    sectionId: 2,
    question: "Was ist der Rueckgabetyp von expect(42)?",
    options: [
      "number",
      "Matchers<number> — typisierte Matcher-Chain",
      "boolean — ob der Test bestanden hat",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "expect<T>(actual: T) gibt Matchers<T> zurueck. Bei expect(42) ist T = number, also Matchers<number>.",
  },
  {
    sectionId: 2,
    question: "Warum darf describe() nicht async sein?",
    options: [
      "Weil TypeScript async describe nicht unterstuetzt",
      "Weil der Test-Runner die Struktur synchron aufbauen muss",
      "Weil describe keine Rueckgabewerte hat",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Der Test-Runner registriert zuerst alle describes/its synchron. Async wuerde die Parallelisierung zerstoeren.",
  },
  {
    sectionId: 2,
    question: "Wie erweitert man Vitest/Jest um eigene Matcher?",
    options: [
      "Durch expect.extend() und Declaration Merging (declare module)",
      "Durch Vererbung von der Matcher-Klasse",
      "Durch Installation eines Plugins",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "expect.extend() registriert den Matcher. Declaration Merging erweitert das Assertion-Interface um die TypeScript-Typen.",
  },

  // ─── Sektion 3: Mocking mit Typen ─────────────────────────────────────

  {
    sectionId: 3,
    question: "Was ist das Grundproblem beim Mocking mit TypeScript?",
    options: [
      "TypeScript verlangt alle Properties des Typs — Mocks sind aber Teilimplementierungen",
      "TypeScript unterstuetzt keine Mock-Funktionen",
      "Mocks funktionieren nur mit Klassen, nicht mit Interfaces",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "TypeScript's strukturelles Typsystem verlangt Vollstaendigkeit. Ein Mock der nur eine von 5 Methoden hat, passt nicht zum Interface.",
  },
  {
    sectionId: 3,
    question: "Was macht vi.mocked()?",
    options: [
      "Es erstellt einen neuen Mock",
      "Es spioniert auf alle Aufrufe",
      "Es castet den Typ zu Mocked<T> — Methoden werden zu Mock-Typen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "vi.mocked() ist ein reiner Typ-Cast. Es macht .mockResolvedValue() etc. verfuegbar ohne den Wert zu aendern.",
  },
  {
    sectionId: 3,
    question: "Was ist Angular's jasmine.createSpyObj<T>()?",
    options: [
      "Ein Factory fuer typsichere Mock-Objekte die Methoden-Namen gegen das Interface pruefen",
      "Ein Decorator fuer Test-Klassen",
      "Ein Tool zum Generieren von Test-Daten",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "createSpyObj<UserService>('svc', ['getUser']) prueft ob 'getUser' eine Methode von UserService ist.",
  },

  // ─── Sektion 4: Type-Testing ──────────────────────────────────────────

  {
    sectionId: 4,
    question: "Was testen Type-Tests im Unterschied zu normalen Tests?",
    options: [
      "Die Performance von Typen",
      "Ob der Code kompiliert",
      "Das Compilezeit-Verhalten (korrekte Typen), nicht das Laufzeit-Verhalten",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Type-Tests pruefen: Hat dieser Ausdruck den richtigen Typ? Z.B. 'Ist identity(42) vom Typ number und nicht any?'",
  },
  {
    sectionId: 4,
    question: "Was macht expectTypeOf(value).toEqualTypeOf<string>()?",
    options: [
      "Es prueft ob value den Wert 'string' hat",
      "Es konvertiert value zu einem String",
      "Es prueft ob der TypeScript-TYP von value exakt string ist",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "expectTypeOf prueft den Compilezeit-Typ, nicht den Wert. toEqualTypeOf prueft exakte Typ-Gleichheit.",
  },
  {
    sectionId: 4,
    question: "Was kann tsd, was expectTypeOf nicht kann?",
    options: [
      "Schnellere Type-Checks",
      "Mehr Typ-Vergleiche",
      "Testen ob Code NICHT kompiliert (expectError)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "tsd analysiert Code statisch und kann pruefen ob ein Ausdruck einen Compile-Error verursacht. expectTypeOf laeuft zur Laufzeit — nicht-kompilierender Code erreicht es nie.",
  },

  // ─── Sektion 5: Test-Patterns ─────────────────────────────────────────

  {
    sectionId: 5,
    question: "Was ist eine Test-Factory-Funktion?",
    options: [
      "Eine Funktion die Test-Dateien automatisch generiert",
      "Ich weiss es nicht",
      "Eine Funktion die Tests parallel ausfuehrt",
      "Eine Funktion die Test-Daten mit sinnvollen Defaults erzeugt und Partial<T> fuer Overrides akzeptiert",
    ],
    correct: 3,
    explanation: "createTestUser({ role: 'admin' }) — Defaults fuer alles ausser role. Nur das Relevante wird ueberschrieben.",
  },
  {
    sectionId: 5,
    question: "Was ist der Vorteil eines Test-Fixtures gegenueber einzelnen Factory-Aufrufen?",
    options: [
      "Fixtures sind schneller",
      "Ich weiss es nicht",
      "Fixtures brauchen weniger Speicher",
      "Fixtures buendeln zusammenhaengende Daten mit konsistenten Referenzen (IDs etc.)",
    ],
    correct: 3,
    explanation: "Ein Fixture enthaelt admin, user, posts, comments — mit korrekten Referenzen zueinander. Einzelne Factories wuessen die IDs manuell synchronisieren.",
  },
  {
    sectionId: 5,
    question: "Wie erzeugt faker.helpers.arrayElement(['a', 'b'] as const) einen Literal-Typ?",
    options: [
      "'as const' macht das Array readonly — der Rueckgabetyp wird 'a' | 'b' statt string",
      "Faker hat eine spezielle TypeScript-Integration",
      "Das funktioniert nur mit Faker v9+",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Ohne 'as const': ['a', 'b'] hat den Typ string[]. Mit 'as const': readonly ['a', 'b']. arrayElement inferiert dann 'a' | 'b'.",
  },

  // ─── Sektion 6: Praxis — Angular & React ──────────────────────────────

  {
    sectionId: 6,
    question: "Was macht Angular's ComponentFixture<T> typsicher?",
    options: [
      "T bestimmt den Component-Typ — componentInstance ist exakt T",
      "T beschraenkt die verfuegbaren Templates",
      "T erzwingt bestimmte Test-Methoden",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "ComponentFixture<UserComponent>.componentInstance gibt UserComponent zurueck — mit voller Autocomplete fuer Properties und Methoden.",
  },
  {
    sectionId: 6,
    question: "Was ist MSW (Mock Service Worker)?",
    options: [
      "Ein framework-spezifischer HTTP-Mock fuer Angular",
      "Ich weiss es nicht",
      "Ein TypeScript Compiler-Plugin fuer Tests",
      "Ein framework-unabhaengiger Netzwerk-Mock der fetch/XHR interceptet",
    ],
    correct: 3,
    explanation: "MSW interceptet auf Netzwerk-Ebene — funktioniert mit Angular, React, Vue, und ohne Framework.",
  },
  {
    sectionId: 6,
    question: "Warum ist TypeScript die 'Basis-Schicht' der Test-Pyramide?",
    options: [
      "Weil TypeScript die meisten Bugs findet",
      "Ich weiss es nicht",
      "Weil TypeScript Unit-Tests ersetzt",
      "Weil Typ-Checks staendig laufen, keine Laufzeit kosten und ~15% aller Bugs verhindern",
    ],
    correct: 3,
    explanation: "TypeScript prueft bei jedem Tastendruck. Keine Test-Ausfuehrung noetig. Kostenlose, permanente Sicherheitspruefung.",
  },
];
