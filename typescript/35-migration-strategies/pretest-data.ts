// pretest-data.ts — L35: Migration Strategies
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Migrationspfade im Ueberblick ───────────────────────────

  {
    sectionId: 1,
    question: "Was ist eine 'Big Bang'-Migration?",
    options: [
      "Alle Dateien auf einmal von JavaScript zu TypeScript umstellen",
      "Nur die wichtigsten Dateien migrieren",
      "TypeScript-Fehler ignorieren",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Big Bang bedeutet: Alles auf einmal umstellen — hoher Aufwand, hohes Risiko, aber sauberer Schnitt.",
  },
  {
    sectionId: 1,
    question: "In welcher Reihenfolge solltest du Dateien migrieren?",
    options: [
      "Groesste Dateien zuerst",
      "Blaetter zuerst (Dateien ohne Abhaengigkeiten)",
      "Zufaellig",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Blaetter zuerst — sie haben keine untypisierten Abhaengigkeiten und verbessern die Typen fuer alle Importe.",
  },
  {
    sectionId: 1,
    question: "Wann ist eine Big-Bang-Migration sinnvoll?",
    options: [
      "Bei kleinen Projekten mit weniger als 50 Dateien",
      "Bei grossen Monorepos mit 500+ Dateien",
      "Nie — graduelle Migration ist immer besser",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Bei kleinen Projekten ist Big Bang machbar — die Migration ist an einem Tag erledigt.",
  },

  // ─── Sektion 2: allowJs und checkJs ─────────────────────────────────────

  {
    sectionId: 2,
    question: "Was macht 'allowJs: true' in der tsconfig?",
    options: [
      "Erlaubt .js und .ts Dateien im selben Projekt",
      "Konvertiert .js automatisch zu .ts",
      "Deaktiviert TypeScript-Fehler",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "allowJs erlaubt gemischte Projekte — die Grundlage fuer graduelle Migration.",
  },
  {
    sectionId: 2,
    question: "Was bewirkt der Kommentar '@ts-check' am Anfang einer .js-Datei?",
    options: [
      "Konvertiert die Datei zu TypeScript",
      "Aktiviert Type-Checking fuer diese spezifische .js-Datei",
      "Deaktiviert alle Warnungen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "@ts-check aktiviert TypeScript-Pruefung fuer eine einzelne .js-Datei — praeziser als globales checkJs.",
  },
  {
    sectionId: 2,
    question: "Kann man in JavaScript-Dateien Typen angeben ohne sie umzubenennen?",
    options: [
      "Nein, das geht nur in .ts-Dateien",
      "Ja, mit JSDoc-Kommentaren (@param, @returns, etc.)",
      "Ja, mit speziellen TypeScript-Kommentaren",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "JSDoc-Annotationen geben JavaScript echte Typen — TypeScript erkennt @param, @returns, @type und mehr.",
  },

  // ─── Sektion 3: Strict Mode stufenweise aktivieren ──────────────────────

  {
    sectionId: 3,
    question: "Was aktiviert 'strict: true' in TypeScript?",
    options: [
      "Nur strictNullChecks",
      "Alle Strict-Flags gleichzeitig (9 Stueck)",
      "Nur noImplicitAny",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "strict: true buendelt 9 Einzelflags und inkludiert automatisch zukuenftige neue Strict-Flags.",
  },
  {
    sectionId: 3,
    question: "Was aendert strictNullChecks an der Typbehandlung?",
    options: [
      "null und undefined werden zu eigenen Typen statt implizit in jedem Typ enthalten zu sein",
      "null wird verboten",
      "Variablen koennen nicht mehr null sein",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Ohne strictNullChecks ist undefined in JEDEM Typ enthalten. Mit strictNullChecks muss es explizit angegeben werden.",
  },
  {
    sectionId: 3,
    question: "Welches Strict-Flag erzeugt bei Migrationen typischerweise die meisten Fehler?",
    options: [
      "alwaysStrict",
      "strictBindCallApply",
      "strictNullChecks",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "strictNullChecks betrifft jede Stelle wo null/undefined moeglich ist — find(), getElementById(), optionale Properties.",
  },

  // ─── Sektion 4: Declaration Files fuer Legacy-Code ──────────────────────

  {
    sectionId: 4,
    question: "Was ist eine .d.ts-Datei?",
    options: [
      "Eine Typ-Deklarationsdatei die Typen beschreibt ohne Implementation",
      "Eine komprimierte TypeScript-Datei",
      "Eine Debug-Datei fuer TypeScript",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: ".d.ts-Dateien deklarieren Typen ohne Implementation — wie ein Vertrag zwischen TypeScript und untypisiertem Code.",
  },
  {
    sectionId: 4,
    question: "Wie gibst du einem untypisierten npm-Paket minimale Typen?",
    options: [
      "Das Paket in node_modules bearbeiten",
      "declare module 'paketname'; in einer .d.ts-Datei",
      "Das Paket deinstallieren",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "declare module 'paketname'; macht alle Importe zu 'any' — das Minimum fuer typenlose Pakete.",
  },
  {
    sectionId: 4,
    question: "Was braucht man am Ende einer .d.ts-Datei die 'declare global' verwendet?",
    options: [
      "Nichts besonderes",
      "export default — fuer den Standard-Export",
      "export {} — um die Datei zum Modul zu machen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "declare global funktioniert nur in Modul-Dateien. export {} ist der kuerzeste Weg eine Datei zum Modul zu machen.",
  },

  // ─── Sektion 5: Typische Migrationsprobleme ─────────────────────────────

  {
    sectionId: 5,
    question: "Was ist das haeufigste Problem bei JS→TS-Migrationen?",
    options: [
      "Fehlende npm-Pakete",
      "Zu grosse Dateien",
      "Dynamische Property-Zugriffe (obj.newProp = value)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "JavaScript erlaubt dynamische Properties, TypeScript nicht. Das erzeugt die meisten Fehler bei Migrationen.",
  },
  {
    sectionId: 5,
    question: "Was loest 'esModuleInterop: true'?",
    options: [
      "Aktiviert Tree-Shaking",
      "Konvertiert CommonJS zu ES Modules",
      "Erlaubt Default-Imports von CommonJS-Modulen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "esModuleInterop erlaubt 'import x from \"pkg\"' statt 'import * as x from \"pkg\"' fuer CommonJS-Module.",
  },
  {
    sectionId: 5,
    question: "Warum gibt Object.keys() string[] statt (keyof T)[]?",
    options: [
      "Ich weiss es nicht",
      "Weil TypeScript Object.keys nicht kennt",
      "Weil es ein Bug in TypeScript ist",
      "Weil Objekte zur Laufzeit zusaetzliche Properties haben koennen (strukturelles Typsystem)",
    ],
    correct: 3,
    explanation: "TypeScript's strukturelles Typsystem erlaubt zusaetzliche Properties. string[] ist technisch korrekt — konservativ aber sicher.",
  },

  // ─── Sektion 6: Praxis — Framework-Migration ───────────────────────────

  {
    sectionId: 6,
    question: "Wo liegt die groesste 'Type-Free Zone' in Angular-Projekten?",
    options: [
      "Ich weiss es nicht",
      "In den Services",
      "In den Routing-Dateien",
      "In den Templates — ohne strictTemplates gibt es dort kein Type-Checking",
    ],
    correct: 3,
    explanation: "Ohne strictTemplates sind Angular-Templates eine Type-Free Zone — Property-Bindings und Events werden nicht geprueft.",
  },
  {
    sectionId: 6,
    question: "Was passiert bei useState(null) in React ohne expliziten Typparameter?",
    options: [
      "Ich weiss es nicht",
      "TypeScript inferiert any",
      "TypeScript inferiert unknown",
      "TypeScript inferiert null statt User | null",
    ],
    correct: 3,
    explanation: "TypeScript inferiert den engsten Typ: null. Du musst useState<User | null>(null) schreiben.",
  },
  {
    sectionId: 6,
    question: "Was ist das letzte Ziel einer erfolgreichen Migration?",
    options: [
      "Ich weiss es nicht",
      "Moeglichst viele .ts-Dateien",
      "Keine Compile-Fehler",
      "strict: true und allowJs: false — volle Typsicherheit",
    ],
    correct: 3,
    explanation: "strict: true (maximale Sicherheit) + allowJs: false (keine .js-Dateien mehr) = Migration abgeschlossen.",
  },
];
