// pretest-data.ts — L40: Capstone Project
// 15 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Projekt-Ueberblick ─────────────────────────────────────

  {
    sectionId: 1,
    question: "Was ist das Ziel eines Capstone-Projekts?",
    options: [
      "Alle gelernten Konzepte in einem durchgaengigen Projekt verbinden",
      "Ein neues Konzept lernen",
      "Die schnellste Implementierung finden",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Ein Capstone verbindet alles: Branded Types + DUs + Generics + Result Pattern + und mehr in einer kohaerenten Architektur.",
  },
  {
    sectionId: 1,
    question: "Was bedeutet 'End-to-End-Typsicherheit'?",
    options: [
      "Der Typ ist von der API-Definition ueber die Validierung bis zur Business Logic konsistent",
      "Alle Variablen haben einen Typ",
      "Der Code laeuft ohne Fehler",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "End-to-End: Der Typ-Vertrag gilt von der aeussersten Schicht (API) bis zur innersten (Business Logic). Kein 'any' unterbricht die Kette.",
  },
  {
    sectionId: 1,
    question: "Welche drei Prinzipien leiten die Capstone-Architektur?",
    options: [
      "DRY, SOLID, KISS",
      "Defensive Schale + Make Impossible States Impossible + Parse Don't Validate",
      "Microservices, Event Sourcing, CQRS",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Defensive Schale schuetzt Grenzen, Make Impossible States Impossible modelliert den Kern, Parse Don't Validate verbindet beides.",
  },

  // ─── Sektion 2: Domain Modeling ─────────────────────────────────────────

  {
    sectionId: 2,
    question: "Warum speichert man Geldbetraege als Cents statt Euro?",
    options: [
      "Floating-Point hat Rundungsfehler, Integer-Arithmetik mit Cents ist exakt",
      "Cents brauchen weniger Speicher",
      "TypeScript unterstuetzt keine Floats",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "0.1 + 0.2 = 0.30000000000000004 in Float. 10 + 20 = 30 in Integer. Cents vermeiden dieses Problem.",
  },
  {
    sectionId: 2,
    question: "Was ist eine Transition Map fuer einen Order-Status?",
    options: [
      "Ein Typ der fuer jeden Status die erlaubten Folgezustaende definiert",
      "Eine Datenbank-Tabelle fuer Statusaenderungen",
      "Ein UI-Element fuer Statusanzeige",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "type Transitions = { draft: 'pending' | 'cancelled'; pending: 'paid' | 'cancelled'; ... }. Ungueltige Uebergaenge → Compile-Error.",
  },
  {
    sectionId: 2,
    question: "Warum sind alle Properties im Domain Model 'readonly'?",
    options: [
      "Weil TypeScript es erfordert",
      "Weil Immutability Seiteneffekte verhindert und konsistente Daten erzwingt",
      "Weil es schneller ist",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Readonly verhindert order.items.push() ohne total zu aktualisieren. Aenderungen erfordern ein neues Objekt mit allen konsistenten Feldern.",
  },

  // ─── Sektion 3: API Layer ──────────────────────────────────────────────

  {
    sectionId: 3,
    question: "Was ist ein API-Route-Typ?",
    options: [
      "Ein Typ der Method, Path, Request-Body, Response-Body und Error-Body verbindet",
      "Ein String mit der URL",
      "Ein HTTP-Header",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "ApiRoute<'POST', '/api/orders', RequestBody, ResponseBody, ErrorBody> verbindet alles in einem Typ. Single Source of Truth.",
  },
  {
    sectionId: 3,
    question: "Warum validiert man API-Eingaben obwohl der Typ sie bereits beschreibt?",
    options: [
      "Weil Typen zur Laufzeit nicht existieren (Type Erasure) und externe Daten beliebig sein koennen",
      "Weil TypeScript-Typen fehlerhaft sein koennen",
      "Weil es eine Best Practice ist die keine technische Begruendung hat",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Typen verschwinden zur Laufzeit. Ein HTTP-Request kann beliebige Daten enthalten. Validierung ist die defensive Schale.",
  },
  {
    sectionId: 3,
    question: "Warum modelliert man API-Fehler als Discriminated Union?",
    options: [
      "Weil Exhaustive Checks sicherstellen dass jeder Fehlerfall behandelt wird",
      "Weil Discriminated Unions schneller sind als Exceptions",
      "Weil es die einzige Moeglichkeit ist Fehler in TypeScript darzustellen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "{ code: 'NOT_FOUND' } | { code: 'VALIDATION_ERROR'; fields: ... } erzwingt spezifische Behandlung pro Fehlertyp.",
  },

  // ─── Sektion 4: Business Logic ─────────────────────────────────────────

  {
    sectionId: 4,
    question: "Warum braucht der 'offensive Kern' keine Runtime-Validierung?",
    options: [
      "Weil die defensive Schale bereits validiert hat und die Typen den Beweis tragen",
      "Weil Runtime-Validierung in TypeScript nicht moeglich ist",
      "Weil der Kern keine externen Daten verarbeitet",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Die Schale validiert und erzeugt typisierte Werte (Smart Constructors). Im Kern ist der Typ der Beweis — doppelte Pruefung ist redundant.",
  },
  {
    sectionId: 4,
    question: "Was macht ein generisches Repository<T> nuetzlich?",
    options: [
      "Es abstrahiert Datenzugriff fuer beliebige Entities — Code einmal schreiben, mit verschiedenen Typen verwenden",
      "Es ist schneller als direkter Datenbankzugriff",
      "Es ersetzt ORMs vollstaendig",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Repository<User> und Repository<Order> teilen die gleiche Implementierung. Generics machen es typsicher fuer jede Entity.",
  },
  {
    sectionId: 4,
    question: "Warum ist ein Event-System mit Discriminated Unions typsicher?",
    options: [
      "Jeder Event-Typ hat spezifische Felder — Handler bekommen nur die Felder ihres Events",
      "Events sind schneller als direkte Funktionsaufrufe",
      "Discriminated Unions sind die einzige Moeglichkeit Events darzustellen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "bus.on('order:paid', (event) => event.paymentId) — TypeScript weiss dass 'order:paid' ein paymentId hat. event.trackingId → Compile-Error.",
  },

  // ─── Sektion 5: Abschluss ──────────────────────────────────────────────

  {
    sectionId: 5,
    question: "Was ist der Unterschied zwischen einem TypeScript-Nutzer und einem TypeScript-Meister?",
    options: [
      "Der Meister weiss wann einfache Typen reichen und wann komplexe noetig sind",
      "Der Meister kennt mehr Syntax",
      "Der Meister schreibt immer die komplexesten Typen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Meisterschaft ist die Balance: Der einfachste Typ der den Job erledigt ist der beste. Komplexitaet nur wenn sie Bugs verhindert.",
  },
  {
    sectionId: 5,
    question: "Welches Konzept ist am direktesten uebertragbar auf Angular und React?",
    options: [
      "Discriminated Unions fuer State Management (NgRx Actions, Redux Actions)",
      "Type-Level Programming",
      "Compiler API",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "NgRx Actions in Angular und Redux Actions in React SIND Discriminated Unions. Das Pattern ist in beiden Frameworks zentral.",
  },
  {
    sectionId: 5,
    question: "Was ist die wichtigste Erkenntnis aus 40 Lektionen TypeScript?",
    options: [
      "Der Compiler ist dein Partner — nutze ihn um Bugs vor der Laufzeit zu finden",
      "TypeScript ist zu komplex fuer kleine Projekte",
      "Man braucht immer die neueste Version",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "TypeScript verschiebt Fehler von der Laufzeit zur Compilezeit. Das ist der fundamentale Wert des gesamten Kurses.",
  },
];
