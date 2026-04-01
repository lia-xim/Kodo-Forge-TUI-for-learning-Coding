// pretest-data.ts — L24: Branded/Nominal Types
// Pre-Test Fragen: 3 pro Sektion = 18 Fragen gesamt

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Das Nominal-Typing-Problem ─────────────────────
  {
    sectionId: 1,
    question: "Was ist TypeScript's Typing-Ansatz?",
    options: [
      "Nominal Typing (wie Java) — Typen werden durch Namen identifiziert",
      "Structural Typing — Typen werden durch ihre Struktur identifiziert",
      "Duck Typing nur zur Laufzeit, keine Compilezeit-Typen",
      "Hybrid: Nominal für Klassen, Structural für Interfaces"
    ],
    correct: 1,
    explanation: "TypeScript nutzt Structural Typing: Ist die Struktur (Felder/Methoden) kompatibel, sind die Typen kompatibel — unabhängig vom Namen."
  },
  {
    sectionId: 1,
    question: "Was passiert mit diesem Code? `type A = string; type B = string; function f(x: A): void {} f('b' as B)`",
    options: [
      "Compile-Error: B ist nicht A",
      "Kein Fehler: A und B sind strukturell identisch (beide = string)",
      "Laufzeit-Fehler: Cast ist ungültig",
      "Warnung: Implizite Typkonvertierung"
    ],
    correct: 1,
    explanation: "Structural Typing: `A = B = string`. Alle drei sind kompatibel. Type Aliases vergeben neue Namen, aber keine neuen Typen."
  },
  {
    sectionId: 1,
    question: "In Java: Kann `new OrderId('abc')` an `void getUser(UserId id)` übergeben werden, wenn beide nur `String` enthalten?",
    options: [
      "Ja, weil Java ebenfalls Structural Typing nutzt",
      "Nein — Java's Nominal Typing macht `UserId` und `OrderId` inkompatibel",
      "Ja, aber nur mit explizitem Cast `(UserId) orderId`",
      "Nein, weil Java keine generischen Wrapper-Klassen unterstützt"
    ],
    correct: 1,
    explanation: "Java nutzt Nominal Typing: Zwei Klassen sind verschieden, auch wenn sie identische Felder haben. TypeScript hingegen: gleiche Struktur = kompatibel."
  },

  // ─── Sektion 2: Die Brand-Technik ──────────────────────────────
  {
    sectionId: 2,
    question: "Was bedeutet `A & B` in TypeScript?",
    options: [
      "Ein-of-oder-der-andere (Union, wie `A | B`)",
      "A oder B, je nachdem welcher Typ besser passt",
      "A und B zugleich — muss ALLE Properties beider Typen haben",
      "B erweitert A (equivalent zu `B extends A`)"
    ],
    correct: 2,
    explanation: "Intersection Type `A & B` bedeutet: Ein Wert muss BEIDES erfüllen — alle Properties von A UND alle Properties von B."
  },
  {
    sectionId: 2,
    question: "Welche Property macht `string & { readonly __brand: 'UserId' }` zu einem 'Branded Type'?",
    options: [
      "Das `string`-Keyword allein ist ausreichend",
      "Das `readonly`-Keyword verhindert Mutation",
      "Das `__brand: 'UserId'`-Property macht den Typ strukturell einzigartig",
      "Der `&`-Operator erzeugt automatisch Nominal Typing"
    ],
    correct: 2,
    explanation: "Das `__brand`-Property (mit einem string-Literal als Wert) macht den Typ strukturell von anderen Brands verschieden. Normaler `string` hat kein `__brand`."
  },
  {
    sectionId: 2,
    question: "Was ist der Vorteil von `as UserId` NUR im Smart Constructor zu verwenden?",
    options: [
      "Es verbessert die Laufzeit-Performance",
      "Es verhindert dass der Compiler Fehler meldet",
      "Zentralisierung: Alle `as`-Casts an einer validierten Stelle — leicht auditierbar",
      "TypeScript erzwingt das syntaktisch — es gibt keine Alternative"
    ],
    correct: 2,
    explanation: "Wenn `as UserId` überall erlaubt ist, kann der Schutz unbewusst umgangen werden. Zentralisier in Smart Constructors: Ein Ort, validiert, leicht zu auditieren."
  },

  // ─── Sektion 3: Smart Constructors & Opaque Types ─────────────
  {
    sectionId: 3,
    question: "Was ist der Unterschied zwischen `createEmail(): Email` (throw) und `tryCreateEmail(): Email | null`?",
    options: [
      "throw-Variante ist schneller; null-Variante ist typsicherer",
      "Beide sind identisch — TypeScript behandelt sie gleich",
      "null-Variante erzwingt durch den Typ, dass der Fehlerfall behandelt wird; throw nicht",
      "throw-Variante ist nur in async-Funktionen erlaubt"
    ],
    correct: 2,
    explanation: "Bei `Email | null` erzwingt TypeScript: Du musst auf `null` prüfen bevor du `Email` verwendest. Bei `throw` kann der Caller den Fehler ignorieren — kein Compile-Error."
  },
  {
    sectionId: 3,
    question: "Was ist `declare const x: unique symbol` in TypeScript?",
    options: [
      "Eine Variable mit einem zufälligen Wert der zur Laufzeit generiert wird",
      "Eine ambient declaration — existiert nur zur Compilezeit, erzeugt einen einzigartigen Symbol-Typ",
      "Eine globale Konstante die nicht reassignable ist",
      "Syntaktischer Zucker für `const x = Symbol('x')`"
    ],
    correct: 1,
    explanation: "`declare const` ist eine ambient declaration ohne Runtime-Wert (wird nicht kompiliert, Type Erasure). `unique symbol` erzeugt für jede Deklaration einen eigenen, unverwechselbaren Typ."
  },
  {
    sectionId: 3,
    question: "Gegeben: `type Brand<T, B extends string> = T & { readonly __brand: B }`. Was ist `Brand<number, 'Meter'>`?",
    options: [
      "`number & { readonly __brand: 'Meter' }` — ein number mit einzigartigem Brand",
      "`{ __brand: 'Meter' }` — ein reines Brand-Objekt ohne number",
      "`Meter extends number` — Nominal Subtyp von number",
      "`number | { readonly __brand: 'Meter' }` — Union aus number und Brand"
    ],
    correct: 0,
    explanation: "`Brand<number, 'Meter'>` expandiert zu `number & { readonly __brand: 'Meter' }`. Das ist ein Intersection: verhält sich wie `number` (Arithmetik, Methoden), hat aber das einzigartige Brand-Property."
  },

  // ─── Sektion 4: Mehrere Brands & Hierarchien ──────────────────
  {
    sectionId: 4,
    question: "Ist `VerifiedEmail = Email & { __verified: true }` ein Subtyp oder Supertyp von `Email`?",
    options: [
      "Supertyp — weil VerifiedEmail mehr Properties hat",
      "Subtyp — weil VerifiedEmail alle Properties von Email hat plus mehr",
      "Weder noch — Intersection erzeugt keinen Sub/Supertyp",
      "Supertyp für Instanzierung, Subtyp für Zuweisbarkeit (komplex)"
    ],
    correct: 1,
    explanation: "Subtyp: `VerifiedEmail` hat alle Properties von `Email` plus `__verified`. Deshalb kann `VerifiedEmail` überall eingesetzt werden wo `Email` erwartet wird — aber nicht umgekehrt."
  },
  {
    sectionId: 4,
    question: "Welche Eigenschaft garantiert `type SearchQuery = string & Trimmed & NonEmpty & Lowercase`?",
    options: [
      "Nur dass der String keine Leerzeichen enthält (Trimmed)",
      "Nur dass der String nicht leer ist (NonEmpty)",
      "Genau einen der drei Zustände — je nach Kontext",
      "Dass der String getrimmt, nicht leer, und kleingeschrieben ist — alle drei garantiert"
    ],
    correct: 3,
    explanation: "Intersection-Kombination: `SearchQuery` muss ALLE drei Properties haben. Das garantiert: getrimmt UND nicht leer UND kleingeschrieben. Alle drei Transformationen wurden durchgeführt."
  },
  {
    sectionId: 4,
    question: "Der Mars Climate Orbiter ging verloren weil Schubkraft in falschen Einheiten übergeben wurde. Welcher TypeScript-Ansatz hätte das verhindert?",
    options: [
      "Defensive Programmierung mit `if (unit === 'Newton')` zur Laufzeit",
      "Code Reviews — TypeScript kann keine physikalischen Einheiten modellieren",
      "Alle Zahlen als `any` typen damit die Berechnung nicht schlägt",
      "Branded Types wie `NewtonSeconds` vs `PoundForceSeconds` mit Compile-Time-Check"
    ],
    correct: 3,
    explanation: "Mit `type NewtonSeconds = Brand<number, 'Newton'>` und `type PoundSeconds = Brand<number, 'Pound'>` wäre die falsche Übergabe ein Compile-Error — nicht ein 327-Millionen-Dollar-Orbiter-Verlust."
  },

  // ─── Sektion 5: Praktische Patterns ───────────────────────────
  {
    sectionId: 5,
    question: "Warum modelliert man Geldbeträge als positive Integer (Cents) statt als Dezimalzahlen (Euro)?",
    options: [
      "Weil TypeScript keine Dezimalzahlen als Branded Types unterstützt",
      "Wegen JavaScript's Floating-Point-Darstellung: `0.1 + 0.2 !== 0.3`",
      "Weil internationale Währungen keine Dezimalstellen haben",
      "Aus Performance-Gründen — Integer-Operationen sind schneller"
    ],
    correct: 1,
    explanation: "IEEE 754 Floating-Point (JavaScript's Zahlenformat) ist ungenau bei Dezimalzahlen. `0.1 + 0.2 = 0.30000000000000004`. Cents als Integer haben dieses Problem nicht."
  },
  {
    sectionId: 5,
    question: "Was modelliert `type Id<Entity extends string> = string & { readonly __idType: Entity }`?",
    options: [
      "Eine Factory-Funktion die IDs validiert",
      "Ein Interface für alle Repository-Operationen",
      "Einen Singleton-Typ für globale IDs",
      "Einen generischen ID-Brand der für jede Entity eine eigene ID-Variante erzeugt"
    ],
    correct: 3,
    explanation: "`Id<'User'>` und `Id<'Order'>` haben verschiedene `__idType`-Werte ('User' vs 'Order'). Damit sind sie strukturell verschieden — eine robuste generische ID-Hierarchie."
  },
  {
    sectionId: 5,
    question: "Welche Funktion macht `AbsolutePath` und `RelativePath` zu verschiedenen Typen?",
    options: [
      "`/`-Präfix verbietet in `RelativePath`, erlaubt in `AbsolutePath`",
      "`__pathType: 'absolute'` vs `__pathType: 'relative'` als Brand-Property",
      "Klassen-Vererbung: `class AbsolutePath extends RelativePath`",
      "Runtime-Check: `path.isAbsolute()` bestimmt den Typ"
    ],
    correct: 1,
    explanation: "Brand-Typen: `AbsolutePath = string & { __pathType: 'absolute' }` und `RelativePath = string & { __pathType: 'relative' }`. Die verschiedenen Literal-Typen machen sie inkompatibel."
  },

  // ─── Sektion 6: Praxis ─────────────────────────────────────────
  {
    sectionId: 6,
    question: "In einem Angular-Service: Wo sollte der `as UserId`-Cast stattfinden?",
    options: [
      "In jeder Component die die ID verwendet",
      "Im HTTP-Interceptor bevor der Request herausgeht",
      "Nirgendwo — Angular macht das automatisch",
      "Im Mapper/Anti-Corruption Layer der HTTP-Responses zu Domain-Typen konvertiert"
    ],
    correct: 3,
    explanation: "Anti-Corruption Layer Prinzip: HTTP-Response (raw string) → Mapper (createUserId) → Domain Entity (UserId). Danach: Kein `as`-Cast mehr nötig im restlichen Code."
  },
  {
    sectionId: 6,
    question: "Wann sollte man Branded Types NICHT verwenden?",
    options: [
      "Bei Datenbankentitäten — das ist Sache des ORM",
      "Bei HTTP API-Responses — diese brauchen keine Typsicherheit",
      "Bei Authentifizierungs-Tokens — zu viel Runtime-Overhead",
      "Bei lokalen Berechnungen mit wenigen, klar benannten Variablen — Over-Engineering"
    ],
    correct: 3,
    explanation: "YAGNI: Wenn lokale Variablen im gleichen Scope (`width`, `height`) keine Verwechslung ermöglichen, ist ein Brand-Typ unnötige Komplexität ohne Sicherheitsgewinn."
  }
];
