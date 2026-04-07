/**
 * Lektion 30 — Pre-Test-Fragen: Review Challenge Phase 3
 *
 * 3 Fragen pro Sektion. Mischung aus Wissens- und Selbsteinschaetzungsfragen.
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Sektion 1: Phase 3 Ueberblick ─────────────────────────────────────

  {
    sectionIndex: 1,
    question: "Was sind die drei roten Faeden von Phase 3? (L21-L29)",
    options: [
      "Performance, Testing, Deployment",
      "Typsicherheit durch Design, Abstraktion/Wiederverwendung, Integration/Konfiguration",
      "Classes, Functions, Modules",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Typsicherheit durch Design (L21,L24,L25), Abstraktion (L22,L23,L26), Integration (L27,L28,L29).",
  },
  {
    sectionIndex: 1,
    question: "Was bedeutet 'Make Illegal States Unrepresentable'?",
    options: [
      "Alle States muessen dokumentiert werden",
      "Das Typsystem verhindert ungueltigen Zustand zur Compile-Zeit",
      "Runtime-Validierung fuer alles",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Wenn das Typsystem ungueltigen Zustand nicht darstellen KANN, brauchst du keine Runtime-Checks.",
  },
  {
    sectionIndex: 1,
    question: "Was ist der Unterschied zwischen Phase 2 und Phase 3?",
    options: [
      "Phase 2: Typen transformieren. Phase 3: mit Typen designen.",
      "Kein Unterschied",
      "Phase 3 ist einfacher",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Phase 2: 'Wie transformiere ich Typen?' Phase 3: 'Wie designe ich mit Typen?' — vom Nutzer zum Architekten.",
  },

  // ─── Sektion 2: Pattern-Kombination ─────────────────────────────────────

  {
    sectionIndex: 2,
    question: "Kannst du Branded Types (L24) und das Result-Pattern (L25) kombinieren?",
    options: [
      "Ja, sicher",
      "Ich glaube schon",
      "Unsicher",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Smart Constructor gibt Result<BrandedType, ValidationError> zurueck. Brand wird nur bei Erfolg vergeben.",
  },
  {
    sectionIndex: 2,
    question: "Verstehst du warum ReadRepository<out T> kovariant ist? (L22)",
    options: [
      "Ja, T erscheint nur in Return-Positionen",
      "Teilweise",
      "Nein",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "ReadRepository gibt T zurueck (out-Position). ReadRepository<Dog> ist ReadRepository<Animal> zuweisbar.",
  },
  {
    sectionIndex: 2,
    question: "Kannst du Phantom Types fuer State Machines nutzen? (L26)",
    options: [
      "Ja, sicher",
      "Ich glaube schon",
      "Unsicher",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Document<Draft> → Document<Review> → Document<Published>. Ungueltige Uebergaenge = Compile-Fehler.",
  },

  // ─── Sektion 3: Typ-Level-Programmierung ────────────────────────────────

  {
    sectionIndex: 3,
    question: "Kannst du rekursive Conditional Types schreiben? (L23 + L17)",
    options: [
      "Teilweise",
      "Ja",
      "Nein",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "DeepReadonly, DeepBrand, Flatten — rekursive Typen die sich selbst referenzieren.",
  },
  {
    sectionIndex: 3,
    question: "Verstehst du wie Template Literal Types Route-Parameter extrahieren? (L18 + L23)",
    options: [
      "Teilweise",
      "Ja",
      "Nein",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "ExtractParams<'/users/:id'> nutzt infer in Template Literals: `${string}:${infer Param}` → 'id'.",
  },
  {
    sectionIndex: 3,
    question: "Wo liegt die Grenze der Typ-Level-Programmierung?",
    options: [
      "Bei 10 Typ-Parametern",
      "Es gibt keine Grenze",
      "Bei der Compile-Zeit und Lesbarkeit — zu komplexe Typ-Logik wird unleserlich",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "TypeScripts Typsystem ist Turing-vollstaendig, aber: Compile-Zeit explodiert und Fehlermeldungen werden unleserlich.",
  },

  // ─── Sektion 4: Framework-Integration ───────────────────────────────────

  {
    sectionIndex: 4,
    question: "Welches Phase-3-Konzept hat das beste Aufwand-Nutzen-Verhaeltnis fuer ein bestehendes Projekt?",
    options: [
      "Decorators (L28) — nur fuer neue Features",
      "Phantom Types (L26) — grosser Umbau",
      "tsconfig-Flags (L29) — 5 Minuten, sofort weniger Bugs",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "strict: true + noUncheckedIndexedAccess aktivieren dauert 5 Minuten und findet sofort Bugs.",
  },
  {
    sectionIndex: 4,
    question: "Sind Discriminated Unions als NgRx Actions UND React Reducer Actions verwendbar?",
    options: [
      "Nur in React",
      "Nur in Angular",
      "Ja, das Pattern ist framework-agnostisch",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "Discriminated Unions sind reines TypeScript. { type: 'SET_ADDRESS', address } funktioniert in NgRx und useReducer identisch.",
  },
  {
    sectionIndex: 4,
    question: "Warum hat Angular noEmit: false aber React noEmit: true? (L29)",
    options: [
      "React braucht keinen JS-Output",
      "Kein Grund, Zufall",
      "Angular CLI steuert den Build anders als Vite — Angular braucht TypeScript-Output fuer Templates",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "React/Vite: esbuild transpiliert. Angular: der Angular Compiler braucht TypeScript-Output fuer den Template-Compiler.",
  },

  // ─── Sektion 5: Abschluss-Challenge ─────────────────────────────────────

  {
    sectionIndex: 5,
    question: "Kannst du alle Phase-3-Konzepte in einem Domain-Modell kombinieren?",
    options: [
      "Ich weiss es nicht",
      "Ich glaube schon",
      "Unsicher",
      "Ja, sicher",
    ],
    correct: 3,
    briefExplanation: "Branded IDs (L24) + Phantom States (L26) + Result Errors (L25) + Recursive Trees (L23) + Repository (L21+L22) + Augmentation (L27) + tsconfig (L29).",
  },
  {
    sectionIndex: 5,
    question: "Wuerdest du dein TypeScript-Level als 'fortgeschritten' oder 'meisterhaft' einschaetzen?",
    options: [
      "Ich bin unsicher",
      "Fortgeschritten — die meisten Konzepte sitzen, manche brauchen Wiederholung",
      "Grundlegend — vieles ist noch neu",
      "Meisterhaft — ich kann alle Phase-3-Konzepte erklaeren und anwenden",
    ],
    correct: 3,
    briefExplanation: "Ehrliche Selbsteinschaetzung ist der erste Schritt zur Meisterschaft. Nutze den Review-Runner fuer Wiederholung.",
  },
  {
    sectionIndex: 5,
    question: "Auf welche Phase-4-Lektion freust du dich am meisten?",
    options: [
      "L40: Capstone Project",
      "L33: Testing TypeScript",
      "L37: Type-Level Programming",
      "L32: Type-safe APIs (tRPC, Zod)",
    ],
    correct: 3,
    briefExplanation: "Alle sind gute Wahlen! L32 und L33 sind am unmittelbar nuetzlichsten fuer die taegliche Arbeit.",
  },
];
