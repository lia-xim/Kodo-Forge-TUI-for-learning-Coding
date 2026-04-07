// pretest-data.ts — L28: Decorators (Legacy & Stage 3)
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Decorator-Grundlagen ─────────────────────────────────────

  {
    sectionId: 1,
    question: "Was ist ein TypeScript Decorator?",
    options: [
      "Ein spezielles CSS-Property",
      "Eine Funktion die mit @ vor einer Deklaration steht und sie transformiert",
      "Ein TypeScript-Compiler-Plugin",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Decorators sind Funktionen die Klassen, Methoden oder Properties transformieren oder annotieren.",
  },
  {
    sectionId: 1,
    question: "Gibt es in TypeScript verschiedene Decorator-Standards?",
    options: [
      "Nein, es gibt nur einen Standard",
      "Ja, Legacy (experimentalDecorators) und Stage 3 (ab TS 5.0)",
      "Ja, aber nur Stage 3 funktioniert",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Legacy (experimentalDecorators) wird von Angular/NestJS genutzt. Stage 3 ist der zukuenftige TC39-Standard.",
  },
  {
    sectionId: 1,
    question: "Welches Framework nutzt Decorators am intensivsten?",
    options: [
      "React — @Component fuer alle Komponenten",
      "Angular — @Component, @Injectable, @Input etc.",
      "Vue — @Setup fuer die Composition API",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Angular basiert fundamental auf Decorators: @Component, @Injectable, @Input, @Output, @ViewChild, etc.",
  },

  // ─── Sektion 2: Class Decorators ────────────────────────────────────────

  {
    sectionId: 2,
    question: "Was bekommt ein Class Decorator als Parameter?",
    options: [
      "Eine Instanz der Klasse",
      "Den Konstruktor der Klasse",
      "Den TypeScript-Compiler",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Class Decorators bekommen den Konstruktor — sie koennen die Klasse transformieren, versiegeln oder erweitern.",
  },
  {
    sectionId: 2,
    question: "Was ist eine Decorator Factory?",
    options: [
      "Eine Fabrik die Klassen erstellt",
      "Eine Funktion die einen Decorator zurueckgibt — ermoeglicht Parameter",
      "Ein Design Pattern fuer Fabriken",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "@Component({...}) — Component() ist die Factory, der Rueckgabewert ist der Decorator.",
  },
  {
    sectionId: 2,
    question: "In welcher Reihenfolge werden @A @B class X Decorators angewandt?",
    options: [
      "B zuerst, dann A (bottom-up)",
      "A zuerst, dann B (top-down)",
      "Gleichzeitig",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Bottom-up: B (naeher am Code) wird zuerst angewandt, dann A.",
  },

  // ─── Sektion 3: Method und Property Decorators ──────────────────────────

  {
    sectionId: 3,
    question: "Wofuer eignen sich Method Decorators besonders gut?",
    options: [
      "Fuer Cross-Cutting Concerns wie Logging, Caching und Retry",
      "Fuer Datenbankzugriffe",
      "Fuer die Definition von Klassen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Method Decorators wrappen Methoden — ideal fuer Aspekte die quer durch den Code auftreten.",
  },
  {
    sectionId: 3,
    question: "Was bekommt ein Legacy Method Decorator als dritten Parameter?",
    options: [
      "Einen PropertyDescriptor mit der Methode in 'value'",
      "Den Rueckgabewert der Methode",
      "Die Klasse als Ganzes",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "PropertyDescriptor hat value (die Methode), writable, enumerable, configurable.",
  },
  {
    sectionId: 3,
    question: "Was ist der Unterschied zwischen Method und Property Decorators?",
    options: [
      "Method Decorators bekommen einen PropertyDescriptor, Property Decorators nicht",
      "Kein Unterschied — beide funktionieren gleich",
      "Property Decorators koennen nur auf Klassen angewandt werden",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Method Decorators bekommen den Descriptor (koennen wrappen), Property Decorators nicht (muessen Object.defineProperty nutzen).",
  },

  // ─── Sektion 4: Parameter Decorators ────────────────────────────────────

  {
    sectionId: 4,
    question: "Koennen Parameter Decorators den Parameterwert aendern?",
    options: [
      "Nein, sie koennen nur Metadaten speichern",
      "Ja, wie alle Decorators",
      "Nur in Stage 3",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Parameter Decorators laufen bei Klassen-Definition, nicht beim Aufruf. Sie speichern nur Metadaten.",
  },
  {
    sectionId: 4,
    question: "Was macht emitDecoratorMetadata?",
    options: [
      "Es generiert .d.ts-Dateien",
      "Es aktiviert Stage 3 Decorators",
      "Es emittiert Typ-Information als Laufzeit-Metadaten fuer DI",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "emitDecoratorMetadata generiert Reflect.metadata()-Aufrufe die Typ-Information als Werte speichern.",
  },
  {
    sectionId: 4,
    question: "Wann braucht man @Inject() in Angular?",
    options: [
      "Immer — bei jedem Konstruktor-Parameter",
      "Nie — Angular erkennt alle Typen automatisch",
      "Wenn der Typ nicht eindeutig ist (primitive Typen oder InjectionTokens)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "@Inject() ist nur noetig wenn emitDecoratorMetadata den Typ nicht erkennen kann (z.B. string, InjectionToken).",
  },

  // ─── Sektion 5: Stage 3 vs Legacy ──────────────────────────────────────

  {
    sectionId: 5,
    question: "Was ist der Hauptunterschied der Stage-3-API gegenueber Legacy?",
    options: [
      "Stage 3 ist langsamer",
      "Stage 3 funktioniert nur in Node.js",
      "Stage 3 hat 2 Parameter (target, context) statt 3 und ein strukturiertes Context-Objekt",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Stage 3: target + context (strukturiert). Legacy: target + propertyKey + descriptor (3 separate Werte).",
  },
  {
    sectionId: 5,
    question: "Was ist das 'accessor' Keyword in Stage 3 Decorators?",
    options: [
      "Ein Alias fuer 'get'",
      "Ich weiss es nicht",
      "Ein neuer Zugriffsmodifier wie private",
      "Erzeugt automatisch Getter/Setter fuer eine Property — ermoeglicht Accessor Decorators",
    ],
    correct: 3,
    explanation: "'accessor name: string' erzeugt auto-get/set. Accessor Decorators koennen dann get/set anpassen.",
  },
  {
    sectionId: 5,
    question: "Hat Stage 3 Parameter Decorators?",
    options: [
      "Ja, verbesserte Version",
      "Ich weiss es nicht",
      "Nur fuer Konstruktor-Parameter",
      "Nein, TC39 hat sie aus der Spezifikation entfernt",
    ],
    correct: 3,
    explanation: "Stage 3 hat keine Parameter Decorators. Alternativen: inject()-Funktion, Tokens, explizite Metadaten.",
  },

  // ─── Sektion 6: Praxis (Angular/NestJS) ─────────────────────────────────

  {
    sectionId: 6,
    question: "Was ist das empfohlene Pattern fuer eigene NestJS-Decorators?",
    options: [
      "Business-Logik direkt im Decorator implementieren",
      "Ich weiss es nicht",
      "Globalen State im Decorator verwalten",
      "Metadaten mit SetMetadata() setzen und in Guards/Interceptors auslesen",
    ],
    correct: 3,
    explanation: "Decorator = Metadaten setzen. Guard = Metadaten lesen und pruefen. Separation of Concerns.",
  },
  {
    sectionId: 6,
    question: "Warum sind Decorators in React weniger verbreitet als in Angular?",
    options: [
      "React unterstuetzt Decorators technisch nicht",
      "Ich weiss es nicht",
      "React hat ein eigenes Decorator-System",
      "React ist funktions-basiert → Hooks sind natuerlicher als Klassen-Decorators",
    ],
    correct: 3,
    explanation: "React nutzt funktionale Komponenten + Hooks. Decorators passen zu Klassen (Angular), Hooks zu Funktionen (React).",
  },
  {
    sectionId: 6,
    question: "Was sollte ein Decorator NICHT enthalten?",
    options: [
      "Logging und Caching",
      "Validierung und Metadaten",
      "Komplexe Business-Logik und globalen State",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Decorators sollten kurz und deklarativ sein. Business-Logik gehoert in Services, globaler State in State Management.",
  },
];
