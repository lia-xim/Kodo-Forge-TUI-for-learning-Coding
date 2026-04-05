// pretest-data.ts — L32: Type-safe APIs
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: REST API Typing ────────────────────────────────────────

  {
    sectionId: 1,
    question: "Warum ist fetch('/api/users').then(r => r.json()) as User[] problematisch?",
    options: [
      "Weil fetch() keine Generics unterstuetzt",
      "Weil 'as User[]' ein Compilezeit-Cast ist — keine Laufzeit-Pruefung",
      "Weil json() nur Strings zurueckgibt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "'as User[]' sagt TypeScript 'Glaub mir, das ist User[]'. Keine Pruefung ob es stimmt.",
  },
  {
    sectionId: 1,
    question: "Was sind Derived Types wie Pick<User, 'name' | 'email'>?",
    options: [
      "Typen die von einem Basis-Typ abgeleitet werden — Aenderungen propagieren automatisch",
      "Typen die zur Laufzeit berechnet werden",
      "Spezielle Typen fuer Datenbanken",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Derived Types nutzen Utility Types um aus einem Basis-Typ neue Typen abzuleiten. Aenderungen am Basis-Typ fliessen automatisch.",
  },
  {
    sectionId: 1,
    question: "Was ist eine API-Typ-Map?",
    options: [
      "Ein Mapping von API-URLs zu Request/Response-Typen in einem Interface",
      "Eine Datenstruktur die API-Aufrufe cached",
      "Eine Map die API-Fehler zu Error-Codes zuordnet",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Eine API-Typ-Map definiert fuer jeden Endpunkt die Request- und Response-Typen in einem zentralen Interface.",
  },

  // ─── Sektion 2: Zod/Valibot Runtime-Validierung ───────────────────────

  {
    sectionId: 2,
    question: "Was macht z.infer<typeof UserSchema>?",
    options: [
      "Es validiert einen Wert zur Laufzeit",
      "Es leitet den TypeScript-Typ aus einem Zod-Schema ab",
      "Es generiert ein JSON Schema aus dem Zod-Schema",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "z.infer extrahiert den TypeScript-Typ aus dem Zod-Schema. So sind Schema und Typ immer synchron.",
  },
  {
    sectionId: 2,
    question: "Was ist der Unterschied zwischen parse() und safeParse()?",
    options: [
      "parse() wirft bei Fehler, safeParse() gibt ein Result zurueck",
      "parse() ist schneller als safeParse()",
      "safeParse() validiert strenger als parse()",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "parse() wirft ZodError, safeParse() gibt { success, data/error } zurueck. safeParse ist besser fuer graceful Error Handling.",
  },
  {
    sectionId: 2,
    question: "Was ist der Hauptvorteil von Valibot gegenueber Zod?",
    options: [
      "Bessere TypeScript-Integration",
      "Drastisch kleinere Bundle-Groesse durch Tree-Shaking",
      "Schnellere Validierung",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Valibot nutzt pipe-basiertes Design: ~1kb gzip vs ~13kb fuer Zod. Nur genutzte Funktionen im Bundle.",
  },

  // ─── Sektion 3: End-to-End Type Safety ─────────────────────────────────

  {
    sectionId: 3,
    question: "Was bedeutet 'End-to-End Type Safety'?",
    options: [
      "Typen fliessen automatisch vom Backend zum Frontend — ohne manuelles Synchronisieren",
      "Jede Funktion hat explizite Rueckgabetypen",
      "Alle Variablen haben Typ-Annotationen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "End-to-End: Typen vom Server propagieren direkt zum Client. Keine manuelle Typ-Definition noetig.",
  },
  {
    sectionId: 3,
    question: "Wie transportiert tRPC die Typen vom Server zum Client?",
    options: [
      "Durch JSON Schema in der HTTP-Response",
      "Durch 'import type' — nur der Typ wird importiert, kein Runtime-Code",
      "Durch ein gemeinsames npm-Package",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "import type importiert nur den TypeScript-Typ. Type Erasure entfernt ihn zur Laufzeit.",
  },
  {
    sectionId: 3,
    question: "Wann ist tRPC NICHT geeignet?",
    options: [
      "Wenn das Frontend React nutzt",
      "Wenn das Backend nicht TypeScript ist oder externe Konsumenten existieren",
      "Wenn die API mehr als 10 Endpunkte hat",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "tRPC braucht TypeScript auf beiden Seiten (Monorepo). Nicht-TS-Backends und externe Konsumenten sind ausgeschlossen.",
  },

  // ─── Sektion 4: GraphQL und Code Generation ────────────────────────────

  {
    sectionId: 4,
    question: "Warum ist GraphQL von Natur aus besser fuer Typ-Sicherheit geeignet als REST?",
    options: [
      "GraphQL hat ein eingebautes Schema — jeder Server MUSS es definieren",
      "GraphQL ist schneller als REST",
      "GraphQL nutzt TypeScript nativ",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "GraphQL erzwingt ein Schema. REST APIs koennen ohne jede Spezifikation existieren. Das Schema ist die Basis fuer Code-Generation.",
  },
  {
    sectionId: 4,
    question: "Was macht graphql-codegen?",
    options: [
      "Es kompiliert GraphQL zu SQL",
      "Es generiert TypeScript-Typen und Hooks aus GraphQL-Schemas und Queries",
      "Es ersetzt den GraphQL-Server durch TypeScript-Code",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "graphql-codegen liest Schema + Queries und generiert TypeScript-Typen, React Hooks oder Angular Services.",
  },
  {
    sectionId: 4,
    question: "Was ist der Vorteil von Query-spezifischen Typen gegenueber globalen Schema-Typen?",
    options: [
      "Globale Typen brauchen mehr Speicher",
      "Query-Typen reflektieren exakt die angeforderten Felder — kein Zugriff auf nicht-geladene Felder",
      "Query-Typen sind schneller zu kompilieren",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Wenn du nur { id, name } abfragst, hat der Typ nur id und name. Zugriff auf email waere ein Compile-Error.",
  },

  // ─── Sektion 5: OpenAPI/Swagger → TypeScript ──────────────────────────

  {
    sectionId: 5,
    question: "Was ist OpenAPI (frueher Swagger)?",
    options: [
      "Der Standard fuer REST API-Dokumentation und Schema-Definition",
      "Ein JavaScript-Framework fuer API-Entwicklung",
      "Eine Alternative zu GraphQL",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "OpenAPI ist eine maschinenlesbare Spezifikation fuer REST APIs. Die meisten Backend-Frameworks generieren sie automatisch.",
  },
  {
    sectionId: 5,
    question: "Was generiert openapi-typescript?",
    options: [
      "Einen kompletten HTTP-Client mit Validierung",
      "NUR TypeScript-Typen aus einer OpenAPI-Spezifikation",
      "Eine neue OpenAPI-Spec aus TypeScript-Code",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "openapi-typescript generiert TypeScript-Typen (.d.ts) aus einer OpenAPI-Spec. Kein Client, keine Hooks — nur Typen.",
  },
  {
    sectionId: 5,
    question: "Was ist das Hauptrisiko bei generierten Typen?",
    options: [
      "Sie koennen stale werden wenn die API sich aendert und nicht neu generiert wird",
      "Sie sind langsamer als handgeschriebene Typen",
      "Sie funktionieren nicht mit strict: true",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Generierte Typen sind Snapshots. Ohne Neugenerierung stimmen sie nicht mehr mit der API ueberein. CI/CD-Integration hilft.",
  },

  // ─── Sektion 6: Praxis — Angular & React ──────────────────────────────

  {
    sectionId: 6,
    question: "Wie macht man Angular's HttpClient wirklich typsicher?",
    options: [
      "Durch striktere tsconfig-Optionen",
      "Durch get<unknown>() und Zod-Validierung der Response",
      "Durch Verwendung von HttpClient v2",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "get<unknown>() statt get<User[]>() — dann Zod-Validierung. So ist der Typ BEWIESEN, nicht nur behauptet.",
  },
  {
    sectionId: 6,
    question: "Was ist ein generischer ValidatedHttpService?",
    options: [
      "Ein Service der alle HTTP-Aufrufe cached",
      "Ein Wrapper um HttpClient der Zod-Schemas fuer automatische Validierung akzeptiert",
      "Ein Service der HTTP-Aufrufe loggt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "ValidatedHttpService.get(url, schema) validiert die Response mit dem Zod-Schema und gibt Result<T> zurueck.",
  },
  {
    sectionId: 6,
    question: "Was ist der pragmatischste Ansatz fuer die meisten Projekte?",
    options: [
      "Immer tRPC verwenden",
      "Zod-Schemas definieren, Typen ableiten, jede Response validieren",
      "Nur TypeScript-Interfaces verwenden",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Zod-Schemas als Source of Truth, z.infer fuer Typen, Response-Validierung an der API-Grenze. Funktioniert unabhaengig vom Backend.",
  },
];
