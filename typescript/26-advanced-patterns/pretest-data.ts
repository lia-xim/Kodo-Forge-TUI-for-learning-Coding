// pretest-data.ts — L26: Advanced Patterns
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Builder Pattern ──────────────────────────────────────────

  {
    sectionId: 1,
    question: "Was macht ein Builder Pattern?",
    options: [
      "Es erstellt komplexe Objekte Schritt fuer Schritt",
      "Es kopiert Objekte in andere Objekte",
      "Es sortiert Arrays nach Typ",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Das Builder Pattern trennt die Konstruktion eines komplexen Objekts von seiner Repraesentaiton.",
  },
  {
    sectionId: 1,
    question: "Koennte TypeScript pruefen ob alle Pflichtfelder eines Builders gesetzt wurden?",
    options: [
      "Nein, das geht nur zur Laufzeit",
      "Ja, mit Generics die tracken welche Felder gesetzt sind",
      "Nur mit externen Validierungs-Bibliotheken",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Mit Generics als 'Gedaechtnis' kann der Builder-Typ tracken welche Felder gesetzt wurden.",
  },
  {
    sectionId: 1,
    question: "Was passiert wenn man Partial<Config> fuer optionale Felder nutzt?",
    options: [
      "Alles wird readonly",
      "Alle Felder werden optional — auch Pflichtfelder",
      "TypeScript inferiert die Typen automatisch",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Partial<T> macht ALLE Felder optional. Pflichtfelder gehen verloren.",
  },

  // ─── Sektion 2: State Machine Pattern ────────────────────────────────────

  {
    sectionId: 2,
    question: "Was ist das Problem mit { isLoading: boolean; isError: boolean }?",
    options: [
      "TypeScript unterstuetzt keine boolean Properties",
      "Unmoegliche Kombinationen wie isLoading=true UND isError=true sind erlaubt",
      "Booleans sind langsamer als Strings",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Boolean-Flags erzeugen 2^n Kombinationen, von denen die meisten ungueltig sind.",
  },
  {
    sectionId: 2,
    question: "Wie kann man in TypeScript modellieren dass nur bestimmte Zustandsuebergaenge erlaubt sind?",
    options: [
      "Mit try/catch fuer jeden Uebergang",
      "Das geht in TypeScript nicht",
      "Mit einer Typ-Level Transition Map und generischen Funktionen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Eine Transition Map als Typ definiert erlaubte Uebergaenge. Der Compiler prueft automatisch.",
  },
  {
    sectionId: 2,
    question: "Was bedeutet 'Make impossible states impossible'?",
    options: [
      "Alle Fehler sollen zur Laufzeit geworfen werden",
      "Unmoegliche Zustaende sollen im Typsystem nicht ausdrueckbar sein",
      "Man soll moeglichst wenig State verwenden",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Statt unmoegliche Zustaende zur Laufzeit zu pruefen, modelliert man Typen so dass sie gar nicht erst entstehen koennen.",
  },

  // ─── Sektion 3: Phantom Types ───────────────────────────────────────────

  {
    sectionId: 3,
    question: "Was ist ein Phantom Type?",
    options: [
      "Ein Typ der zur Laufzeit Fehler verursacht",
      "Ein Typparameter der im Wert nicht vorkommt, aber im Typ existiert",
      "Ein Typ der nur in Tests verwendet wird",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Phantom Types tragen Typ-Information die zur Laufzeit nicht existiert — wie ein 'Geist' im Typsystem.",
  },
  {
    sectionId: 3,
    question: "Wie haengen Branded Types und Phantom Types zusammen?",
    options: [
      "Sie sind komplett verschiedene Konzepte",
      "Branded Types sind eine einfache Form von Phantom Types",
      "Phantom Types ersetzen Branded Types",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Das __brand-Property bei Branded Types ist ein Phantom — es existiert nur im Typ, nicht zur Laufzeit.",
  },
  {
    sectionId: 3,
    question: "Warum braucht man in TypeScript ein __phantom-Property fuer Phantom Types?",
    options: [
      "Damit der Wert zur Laufzeit den Typ kennt",
      "Weil TypeScript sonst den ungenutzten Typparameter ignoriert (strukturelles Typsystem)",
      "Weil TypeScript Phantom Types nicht nativ unterstuetzt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "TypeScript's strukturelles Typsystem ignoriert ungenutzte Typparameter. Das __phantom-Property verankert den Typ.",
  },

  // ─── Sektion 4: Fluent API Pattern ──────────────────────────────────────

  {
    sectionId: 4,
    question: "Was ist Method Chaining?",
    options: [
      "Eine Methode die andere Methoden aufruft",
      "Methoden geben 'this' zurueck, sodass man Aufrufe verketten kann",
      "Eine Vererbungskette von Methoden",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "builder.host('x').port(80).build() — jede Methode gibt den Builder zurueck, sodass der naechste Aufruf direkt folgen kann.",
  },
  {
    sectionId: 4,
    question: "Kann TypeScript die Reihenfolge von Method-Chaining-Aufrufen erzwingen?",
    options: [
      "Nein, Method Chaining hat keine Reihenfolge",
      "Ja, mit Step-Interfaces die pro Schritt nur erlaubte Methoden anbieten",
      "Nur mit Runtime-Assertions",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Step-Interfaces geben bei jedem Schritt einen anderen Typ zurueck — nur mit den Methoden die im aktuellen Schritt erlaubt sind.",
  },
  {
    sectionId: 4,
    question: "Warum ist 'this' als Rueckgabetyp besser als der konkrete Klassenname?",
    options: [
      "'this' ist schneller",
      "'this' ist polymorph — bei Vererbung gibt es den Subklassen-Typ zurueck",
      "'this' ist ein spezieller TypeScript-Typ der Chaining ermoeglicht",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "'this' in einer Basisklasse wird zum Subklassen-Typ wenn vererbt. Der Klassenname wuerde den Basistyp festnageln.",
  },

  // ─── Sektion 5: Newtype Pattern ─────────────────────────────────────────

  {
    sectionId: 5,
    question: "Was ist 'Primitive Obsession'?",
    options: [
      "Die uebertriebene Nutzung von string und number fuer alles",
      "Die Bevorzugung von Klassen gegenueber Interfaces",
      "Die Verwendung von any statt unknown",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Primitive Obsession: UserId, ProductId, Amount — alles string/number. Verwechslung ist leicht moeglich.",
  },
  {
    sectionId: 5,
    question: "Was ist ein Smart Constructor?",
    options: [
      "Ein TypeScript-Compiler-Feature fuer automatische Typerkennung",
      "Eine Funktion die validiert und einen Branded/Newtype zurueckgibt",
      "Ein Konstruktor der Generics automatisch inferiert",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Smart Constructors validieren den Rohwert und sind der offizielle Weg einen Newtype zu erstellen.",
  },
  {
    sectionId: 5,
    question: "Hat ein Newtype Laufzeit-Overhead in TypeScript?",
    options: [
      "Ja, der Wrapper-Typ braucht Speicher",
      "Nein, zur Laufzeit ist es ein normaler primitiver Wert (Type Erasure)",
      "Nur bei Verwendung von unique symbol",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Newtypes nutzen Type Erasure: Zur Laufzeit sind sie normale string/number-Werte. Kein Overhead.",
  },

  // ─── Sektion 6: Praxis-Kombination ──────────────────────────────────────

  {
    sectionId: 6,
    question: "Wann lohnt es sich mehrere Patterns zu kombinieren?",
    options: [
      "Immer — mehr Patterns = mehr Sicherheit",
      "Nie — ein Pattern pro Problem reicht",
      "Bei oeffentlichen APIs oder sicherheitskritischem Code",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Pattern-Kombination lohnt sich bei oeffentlichen APIs, Bibliotheken oder sicherheitskritischem Code. Fuer internen Code reichen einfachere Ansaetze.",
  },
  {
    sectionId: 6,
    question: "Welche zwei Patterns decken 90% der Faelle in Angular/React ab?",
    options: [
      "Builder + Fluent API",
      "Phantom Types + State Machine",
      "Branded Types + Discriminated Unions",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Branded Types fuer IDs + Discriminated Unions fuer State decken die meisten Alltagsanforderungen ab.",
  },
  {
    sectionId: 6,
    question: "Was ist ein Zeichen fuer Over-Engineering mit Typ-Patterns?",
    options: [
      "Der Code hat weniger als 100 Zeilen",
      "Die Typ-Komplexitaet uebersteigt den Business-Wert",
      "Es werden mehr als 2 Interfaces verwendet",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Wenn das Typ-System komplizierter ist als die Business-Logik, ist es Over-Engineering. KISS gilt auch fuer Typen.",
  },
];
