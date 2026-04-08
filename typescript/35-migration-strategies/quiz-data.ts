// quiz-data.ts — L35: Migration Strategies
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "35";
export const lessonTitle = "Migration Strategies";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Strategie-Wahl — correct: 0 ---
  {
    question: "Welche Migrationsstrategie ist fuer grosse Projekte mit aktiver Feature-Arbeit empfohlen?",
    options: [
      "Graduelle Migration (allowJs + schrittweise .js→.ts)",
      "Big Bang (alle Dateien auf einmal umbenennen und alle Fehler auf einmal beheben)",
      "Gar nicht migrieren — JavaScript reicht fuer moderne Webentwicklung vollkommen aus",
      "Komplett neu schreiben in TypeScript — das ist der empfohlene Weg fuer alle Projekte",
    ],
    correct: 0,
    explanation:
      "Graduelle Migration erlaubt Feature-Arbeit parallel zur Migration. Jeder PR ist " +
      "klein und reviewbar. Das Risiko ist minimal — Fehler betreffen nur migrierte Dateien.",
    elaboratedFeedback: {
      whyCorrect: "Big Bang blockiert alle andere Arbeit und erzeugt riesige unreviewbare PRs. Graduelle Migration laesst beides parallel laufen: neue Features in .ts, bestehende Dateien schrittweise migrieren.",
      commonMistake: "Manche denken, 'alles auf einmal' sei schneller. In der Realitaet dauert es LAENGER, weil die Fehlersuche in einem riesigen Diff viel schwieriger ist als in kleinen PRs."
    }
  },

  // --- Frage 2: Migrationsreihenfolge — correct: 0 ---
  {
    question: "In welcher Reihenfolge solltest du Dateien bei einer graduellen Migration umstellen?",
    options: [
      "Blaetter zuerst (Dateien ohne Abhaengigkeiten), dann nach innen",
      "Die groessten Dateien zuerst — sie haben den groessten Einfluss auf die Code-Qualitaet",
      "Alphabetisch nach Dateiname — das ist neutral und verhindert bewusste Auswahl",
      "Zufaellig — die Reihenfolge spielt keine Rolle, alle Dateien sind gleich wichtig",
    ],
    correct: 0,
    explanation:
      "Blaetter (Dateien ohne Imports) zuerst, weil sie keine untypisierten Abhaengigkeiten haben. " +
      "Jede migrierte Datei verbessert die Typen fuer alle Dateien die sie importieren.",
    elaboratedFeedback: {
      whyCorrect: "Wenn du types.ts zuerst migrierst, profitieren ALLE importierenden Dateien sofort von den Typen. Wenn du eine Wurzel-Datei (z.B. App.tsx) zuerst migrierst, sind deren Importe alle noch 'any'.",
      commonMistake: "Manche migrieren die 'wichtigsten' Dateien zuerst (z.B. die Hauptkomponente). Das ergibt viele any-Imports. Besser: Von den Blaettern zur Wurzel arbeiten."
    }
  },

  // --- Frage 3: allowJs — correct: 0 ---
  {
    question: "Was ermoeglicht 'allowJs: true' in der tsconfig?",
    options: [
      "JavaScript-Dateien (.js) und TypeScript-Dateien (.ts) koexistieren im selben Projekt",
      "JavaScript-Dateien werden automatisch zu TypeScript konvertiert ohne manuellen Eingriff",
      "TypeScript-Fehler in .js-Dateien werden ignoriert und nicht im Output angezeigt",
      "JavaScript-Dateien werden mit Strict Mode kompiliert und erhalten volle Typsicherheit",
    ],
    correct: 0,
    explanation:
      "allowJs erlaubt gemischte Projekte — .js und .ts Dateien koennen sich gegenseitig importieren. " +
      "Das ist die Grundlage fuer graduelle Migration.",
    elaboratedFeedback: {
      whyCorrect: "Ohne allowJs ignoriert der Compiler .js-Dateien komplett. Mit allowJs werden sie einbezogen — Imports funktionieren, TypeScript inferiert Typen (wenn auch oft 'any').",
      commonMistake: "allowJs prueft .js-Dateien NICHT auf Typfehler. Dafuer brauchst du zusaetzlich checkJs: true oder @ts-check in einzelnen Dateien."
    }
  },

  // --- Frage 4: ts-expect-error — correct: 0 ---
  {
    question: "Warum ist '@ts-expect-error' besser als '@ts-ignore' bei Migrationen?",
    options: [
      "Es meldet einen Fehler wenn die unterdrueckte Zeile KEINEN Fehler mehr hat — raeumt sich selbst auf",
      "Es ist schneller fuer den Compiler weil es weniger Overhead bei der Verarbeitung erzeugt",
      "Es funktioniert auch in JavaScript-Dateien — @ts-ignore funktioniert ausschliesslich in TypeScript",
      "Es unterdrueckt nur bestimmte Fehlertypen und laesst alle anderen Compiler-Fehler weiterhin zu",
    ],
    correct: 0,
    explanation:
      "@ts-expect-error ERWARTET einen Fehler. Wenn der Fehler gefixt wird (z.B. durch Migration), " +
      "meldet TypeScript: 'Unused @ts-expect-error directive'. So findest du automatisch alle " +
      "Stellen die nicht mehr unterdrueckt werden muessen.",
    elaboratedFeedback: {
      whyCorrect: "@ts-ignore bleibt fuer immer still — auch wenn der Fehler laengst gefixt ist. @ts-expect-error sagt dir aktiv: 'Hier war ein Problem, das jetzt geloest ist — entferne mich.' Das ist Gold wert bei Migrationen.",
      commonMistake: "Viele verwenden @ts-ignore aus Gewohnheit. In Migrations-PRs sollte ausschliesslich @ts-expect-error verwendet werden — jedes @ts-ignore ist ein Code-Review-Kommentar wert."
    }
  },

  // --- Frage 5: JSDoc-Typen — correct: 1 ---
  {
    question: "Welche JSDoc-Syntax gibt einer JavaScript-Funktion Parametertypen?",
    options: [
      "@type {function(string, number): boolean} — annotiert die gesamte Funktionssignatur auf einmal",
      "@param {string} name — und @returns {boolean}",
      "@typedef {Object} FunctionType — definiert einen wiederverwendbaren Funktions-Typ",
      "@template T — fuer generische Funktionen mit dynamischen Typ-Parametern",
    ],
    correct: 1,
    explanation:
      "@param {Typ} name annotiert einzelne Parameter, @returns {Typ} den Rueckgabetyp. " +
      "TypeScript erkennt diese JSDoc-Tags und verwendet sie fuer Type-Checking.",
    elaboratedFeedback: {
      whyCorrect: "/** @param {string} name @param {number} age @returns {User} */ — das ist die Standard-JSDoc-Syntax die TypeScript mit checkJs versteht. Sogar Generics funktionieren mit @template T.",
      commonMistake: "@type wird fuer Variablen verwendet, nicht fuer Funktionsparameter. @typedef definiert einen wiederverwendbaren Typ, nicht eine Funktionssignatur."
    }
  },

  // --- Frage 6: strictNullChecks — correct: 1 ---
  {
    question: "Warum ist strictNullChecks das schwierigste Strict-Flag bei Migrationen?",
    options: [
      "Es ist nur fuer TypeScript 5.0+ verfuegbar und funktioniert in aelteren Versionen nicht",
      "Es aendert fundamental wie null/undefined behandelt werden und erzeugt die meisten Fehler",
      "Es ist inkompatibel mit Angular-Projekten und fuehrt zu unloesbaren Template-Fehlern",
      "Es verlangsamt die Compile-Zeit um 50% weil mehr Typ-Checks durchgefuehrt werden muessen",
    ],
    correct: 1,
    explanation:
      "Ohne strictNullChecks ist undefined in JEDEM Typ implizit enthalten. Mit strictNullChecks " +
      "muss jede moegliche null/undefined-Stelle explizit behandelt werden. Das betrifft " +
      "find(), getElementById(), optionale Properties — ueberall.",
    elaboratedFeedback: {
      whyCorrect: "strictNullChecks macht null und undefined zu eigenen Typen statt sie in jeden Typ einzuschliessen. Array.find() gibt T | undefined statt T zurueck. Das erzeugt Hunderte Fehler in typischen Projekten.",
      commonMistake: "Manche denken, strictNullChecks sei optional. Es ist das WICHTIGSTE Flag — es verhindert die haeufigste Fehlerklasse in JavaScript: 'Cannot read property of undefined'."
    }
  },

  // --- Frage 7: esModuleInterop — correct: 1 ---
  {
    question: "Was loest 'esModuleInterop: true' bei der Migration?",
    options: [
      "Es konvertiert CommonJS automatisch zu ES Modules ohne manuelle Anpassungen",
      "Es erlaubt 'import x from \"pkg\"' statt 'import * as x from \"pkg\"' fuer CommonJS-Module",
      "Es deaktiviert Module-Resolution und verwendet stattdessen ausschliesslich relative Pfade",
      "Es aktiviert Tree-Shaking fuer CommonJS-Module und entfernt ungenutzte Exporte automatisch",
    ],
    correct: 1,
    explanation:
      "CommonJS-Module haben keinen 'default export'. Ohne esModuleInterop muss man " +
      "'import * as' verwenden. Mit esModuleInterop generiert TypeScript einen Helper " +
      "der Default-Imports ermoeglicht.",
    elaboratedFeedback: {
      whyCorrect: "Express, Lodash und viele andere Pakete nutzen module.exports (CommonJS). esModuleInterop erzeugt einen __importDefault Helper der CommonJS-Exports als Default-Import verfuegbar macht.",
      commonMistake: "esModuleInterop aendert den generierten JavaScript-Code (fuegt Helpers hinzu). Das ist bei Bundler-Projekten (webpack, Vite) egal, aber bei directem Node.js-Ausfuehren relevant."
    }
  },

  // --- Frage 8: declare module — correct: 1 ---
  {
    question: "Wie gibst du einem untypisierten npm-Paket minimale Typen?",
    options: [
      "Das Paket manuell in node_modules bearbeiten und die Typ-Definitionen selbst hinzufuegen",
      "'declare module \"paketname\";' in einer .d.ts-Datei — alles wird 'any'",
      "Den TypeScript-Compiler mit --ignorePackage konfigurieren und das Paket ausschliessen",
      "Das Paket durch eine typisierte Alternative ersetzen — das ist die einzig saubere Loesung",
    ],
    correct: 1,
    explanation:
      "'declare module \"paketname\";' ohne Body macht alle Importe aus diesem Modul zu 'any'. " +
      "Das ist das Minimum — kein Typfehler, aber auch kein Typ-Schutz. Schrittweise " +
      "verfeinern mit Funktions-Deklarationen.",
    elaboratedFeedback: {
      whyCorrect: "Eine einzelne Zeile reicht um den Compiler ruhig zu stellen. Danach kannst du schrittweise Typen hinzufuegen: declare module \"pkg\" { export function x(s: string): void; }",
      commonMistake: "Manche editieren Dateien in node_modules. Das wird beim naechsten npm install ueberschrieben. Immer in einer eigenen .d.ts-Datei deklarieren."
    }
  },

  // --- Frage 9: Strict-Reihenfolge — correct: 2 ---
  {
    question: "Welches Strict-Flag solltest du als ERSTES aktivieren?",
    options: [
      "strictNullChecks (das wichtigste) — es sollte sofort aktiviert werden fuer maximale Sicherheit",
      "noImplicitAny (das haeufigste) — es betrifft die meisten Stellen und liefert schnellen Fortschritt",
      "alwaysStrict (das einfachste — fast nie Fehler)",
      "strictPropertyInitialization (fuer Klassen) — es ist der logische Startpunkt fuer OOP-Projekte",
    ],
    correct: 2,
    explanation:
      "alwaysStrict fuegt nur 'use strict' hinzu — das erzeugt fast nie Fehler und ist " +
      "in modernem JavaScript ohnehin Standard. Danach: strictBindCallApply, noImplicitThis " +
      "(wenige Fehler), dann noImplicitAny, dann strictNullChecks.",
    elaboratedFeedback: {
      whyCorrect: "Die Reihenfolge folgt dem Prinzip 'Low Risk, High Value zuerst': alwaysStrict hat nahezu null Risiko. strictNullChecks hat das hoechste Risiko (meiste Fehler) und sollte zuletzt kommen.",
      commonMistake: "Manche aktivieren strict: true sofort und kaempfen mit Tausenden Fehlern. Besser: Flag fuer Flag aktivieren, Fehler fixen, naechstes Flag."
    }
  },

  // --- Frage 10: Non-null Assertion — correct: 2 ---
  {
    question: "Wann ist die Non-null Assertion (!) ein akzeptabler Uebergangsmechanismus?",
    options: [
      "Immer — ! ist sicherer als explizite Pruefungen weil es zur Laufzeit nichts kostet",
      "Nie — ! sollte generell verboten werden weil es die Typsicherheit komplett umgeht",
      "Bei der Aktivierung von strictNullChecks als temporaere Loesung mit TODO-Markierung",
      "Nur in Test-Dateien — in Produktionscode ist ! generell nicht akzeptabel",
    ],
    correct: 2,
    explanation:
      "Bei der Aktivierung von strictNullChecks koennen Hunderte Fehler auftreten. ! als " +
      "temporaerer Fix mit '// TODO: Remove ! after migration' ist akzeptabel — solange " +
      "die !-Stellen systematisch abgebaut werden.",
    elaboratedFeedback: {
      whyCorrect: "Die Alternative waere, strictNullChecks nicht zu aktivieren bis ALLE Stellen gefixt sind. Das kann Monate dauern. ! als Uebergang erlaubt sofortige Aktivierung mit geplantem Abbau.",
      commonMistake: "! ohne TODO-Kommentar und ohne Plan zum Abbau ist ein Antipattern. Jedes ! ist technische Schuld — es muss getrackt und priorisiert werden."
    }
  },

  // --- Frage 11: checkJs — correct: 2 ---
  {
    question: "Was ist der Unterschied zwischen checkJs: true in tsconfig und @ts-check in einer Datei?",
    options: [
      "checkJs ist schneller, @ts-check ist genauer — beide aktivieren die Typ-Pruefung auf unterschiedliche Weise",
      "Es gibt keinen Unterschied — beide aktivieren die Typ-Pruefung fuer dasselbe Dateiset",
      "checkJs aktiviert Pruefung fuer ALLE .js-Dateien, @ts-check nur fuer die eine Datei",
      "checkJs funktioniert nur mit allowJs: false — @ts-check funktioniert immer unabhaengig davon",
    ],
    correct: 2,
    explanation:
      "checkJs: true prueft ALLE .js-Dateien global. @ts-check aktiviert die Pruefung nur " +
      "fuer die spezifische Datei. Bei der Migration ist @ts-check pro Datei praeziser — " +
      "du aktivierst es nur fuer bereits bereinigte Dateien.",
    elaboratedFeedback: {
      whyCorrect: "checkJs: true → alle .js-Dateien → Hunderte Fehler sofort. @ts-check → eine Datei → wenige, handhabbare Fehler. Der Datei-fuer-Datei-Ansatz ist kontrollierter.",
      commonMistake: "Wenn checkJs: true aktiv ist, kannst du einzelne Dateien mit @ts-nocheck ausnehmen. Das ist die Umkehr: Global an, einzeln aus (statt global aus, einzeln an)."
    }
  },

  // --- Frage 12: Dynamic Properties — correct: 2 ---
  {
    question: "Was ist die typsichere Loesung fuer dynamische Property-Zugriffe bei der Migration?",
    options: [
      "as any fuer das Objekt — das ist der einfachste und am weitesten verbreitete Workaround",
      "Object.defineProperty verwenden — das erlaubt dynamische Properties mit voller Typsicherheit",
      "Record<string, unknown> oder ein Interface mit Index Signature",
      "eval() fuer dynamische Ausdruecke — das ist die empfohlene Loesung in TypeScript-Projekten",
    ],
    correct: 2,
    explanation:
      "Record<string, unknown> erlaubt beliebige String-Keys mit dem sicheren Typ 'unknown'. " +
      "Fuer bekannte + dynamische Keys: Interface mit Index Signature und expliziten Properties.",
    elaboratedFeedback: {
      whyCorrect: "Record<string, unknown> ist die sichere Variante: Du kannst beliebige Keys setzen, musst aber den Wert vor Verwendung pruefen (weil unknown). Record<string, any> waere unsicher.",
      commonMistake: "Viele verwenden 'as any' als Quick-Fix. Das deaktiviert den Typscheck komplett. Record<string, unknown> ist genauso flexibel aber sicher."
    }
  },

  // --- Frage 13: Migration-Metriken — correct: 3 ---
  {
    question: "Welche 4 Metriken messen den Migrations-Fortschritt am besten?",
    options: [
      "Lines of Code, Commit-Frequenz, Build-Zeit, Test-Coverage — klassische Metriken die den allgemeinen Fortschritt zeigen",
      "Anzahl Dateien, Anzahl Klassen, Anzahl Funktionen, Anzahl Importe — strukturelle Metriken die den Code-Umfang messen",
      "Compile-Zeit, Bundle-Groesse, Memory-Verbrauch, CPU-Auslastung — Performance-Metriken die die Build-Qualitaet zeigen",
      "TS-Dateien-Anteil, any-Count, ts-ignore-Count, Strict-Fehler-Count",
    ],
    correct: 3,
    explanation:
      "TS-Anteil zeigt den Gesamtfortschritt. any-Count die Typ-Qualitaet. ts-ignore/ts-expect-error " +
      "die unterdrueckten Fehler. Strict-Fehler-Count den Abstand zum Ziel (strict: true).",
    elaboratedFeedback: {
      whyCorrect: "Diese 4 Zahlen geben ein vollstaendiges Bild: Wie viel ist migriert? Wie gut ist die Qualitaet? Was ist unterdrueckt? Wie weit bis zum Ziel? — Messbar, trackbar, reportbar.",
      commonMistake: "Lines of Code oder Build-Zeit sind keine guten Migrations-Metriken. Eine Datei kann 1000 Zeilen haben und trotzdem voller 'any' sein."
    }
  },

  // --- Frage 14: useState-Migration — correct: 3 ---
  {
    question: "Warum braucht useState(null) in React einen expliziten Typparameter?",
    options: [
      "React-Hooks funktionieren nicht mit null — das ist eine React-Einschraenkung die useState betrifft",
      "TypeScript kann null nicht als Typ verwenden — es erfordert immer einen konkreten Objekt-Typ",
      "useState ist nicht generisch und kann deshalb keine Union-Typen mit null inferieren",
      "TypeScript inferiert den Typ 'null' — nicht 'User | null' wie gewuenscht",
    ],
    correct: 3,
    explanation:
      "TypeScript inferiert den engsten Typ. useState(null) → Typ ist 'null'. " +
      "Du musst useState<User | null>(null) schreiben damit TypeScript weiss, " +
      "dass der State spaeter auch User-Werte enthalten kann.",
    elaboratedFeedback: {
      whyCorrect: "Inferenz basiert auf dem Initialwert. null ist null, nicht User | null. Ohne expliziten Generic: setUser(userData) → FEHLER: 'User' is not assignable to 'null'.",
      commonMistake: "Gleiches Problem bei useState([]): Typ ist never[] statt User[]. Loesung: useState<User[]>([])."
    }
  },

  // --- Frage 15: Angular strictTemplates — correct: 3 ---
  {
    question: "Was prueft Angulars 'strictTemplates: true' das ohne diese Option NICHT geprueft wird?",
    options: [
      "Die Laufzeit-Performance von Templates — wie schnell sie gerendert und aktualisiert werden",
      "Ob Templates valides HTML sind — falsche Tags und Attribute werden zur Compilezeit erkannt",
      "Die Korrektheit von CSS-Klassen in Templates — ungültige Klassen werden vom Compiler gemeldet",
      "Property-Bindings, Event-Handler und Pipe-Rueckgabetypen in Templates",
    ],
    correct: 3,
    explanation:
      "strictTemplates aktiviert Template Type Checking: [value]=\"expr\" wird auf den " +
      "korrekten Typ geprueft, (click)=\"handler($event)\" auf die korrekte Event-Signatur, " +
      "und Pipes auf korrekte Rueckgabetypen.",
    elaboratedFeedback: {
      whyCorrect: "Ohne strictTemplates sind Angular-Templates eine 'Type-Free Zone' — alles wird akzeptiert, Fehler treten erst zur Laufzeit auf. Mit strictTemplates prueft der Compiler Templates wie TypeScript-Code.",
      commonMistake: "strictTemplates ist NICHT dasselbe wie strict in tsconfig. strictTemplates ist eine Angular-Compiler-Option, strict eine TypeScript-Option. Beide sollten aktiv sein."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welches tsconfig-Flag erlaubt JavaScript-Dateien (.js) in einem TypeScript-Projekt?",
    expectedAnswer: "allowJs",
    acceptableAnswers: ["allowJs", "allowJs: true", "allow-js", "allowjs"],
    explanation:
      "allowJs: true erlaubt gemischte .js/.ts-Projekte. Es ist die Grundlage " +
      "fuer graduelle Migration — ohne allowJs muesstest du alle Dateien auf einmal umbenennen.",
  },

  {
    type: "short-answer",
    question: "Welcher JSDoc-Tag annotiert einen Funktionsparameter mit einem Typ?",
    expectedAnswer: "@param",
    acceptableAnswers: ["@param", "param", "@param {type} name"],
    explanation:
      "@param {Typ} name — annotiert einen Parameter mit einem Typ. " +
      "TypeScript erkennt diesen JSDoc-Tag und verwendet ihn fuer Type-Checking in .js-Dateien.",
  },

  {
    type: "short-answer",
    question: "Wie heisst das Strict-Flag das null und undefined zu eigenen Typen macht?",
    expectedAnswer: "strictNullChecks",
    acceptableAnswers: ["strictNullChecks", "strict-null-checks", "strictnullchecks"],
    explanation:
      "strictNullChecks macht null und undefined zu eigenstaendigen Typen statt sie " +
      "in jeden Typ implizit einzuschliessen. Es ist das wichtigste und aufwendigste Strict-Flag.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Kompiliert dieser Code mit strictNullChecks: true? Antworte 'Ja' oder 'Nein'.",
    code:
      "function getFirst(items: string[]): string {\n" +
      "  return items.find(i => i.startsWith('A'));\n" +
      "}",
    expectedAnswer: "Nein",
    acceptableAnswers: ["Nein", "nein", "No", "no"],
    explanation:
      "Array.find() gibt string | undefined zurueck (mit strictNullChecks). " +
      "Die Funktion verspricht string als Rueckgabe — undefined ist nicht string. " +
      "Fix: Rueckgabetyp auf string | undefined aendern oder Non-null Assertion (!) verwenden.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat 'data' in diesem JavaScript-Code mit @ts-check?",
    code:
      "// @ts-check\n" +
      "function process(data) {\n" +
      "  return data.length;\n" +
      "}",
    expectedAnswer: "any",
    acceptableAnswers: ["any", "implicit any", "implicitly any"],
    explanation:
      "Ohne JSDoc-Annotation oder Typinferenz-Quelle ist 'data' implizit 'any'. " +
      "@ts-check allein reicht nicht — du brauchst @param {string[]} data oder aehnliche " +
      "Annotationen damit TypeScript den Typ kennt.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist die graduelle Migration (allowJs → checkJs → strict) sicherer " +
      "als ein Big Bang (alle Dateien auf einmal umbenennen)?",
    modelAnswer:
      "Graduelle Migration reduziert Risiko durch kleine, reviewbare Schritte. Jeder PR migriert " +
      "wenige Dateien — Fehler sind leicht lokalisierbar. Feature-Arbeit laeuft parallel weiter, " +
      "das Team wird nicht blockiert. allowJs erlaubt Koexistenz von .js und .ts, sodass nicht " +
      "alles gleichzeitig aendern muss. Bei Big Bang entsteht ein riesiger PR der nicht sinnvoll " +
      "reviewbar ist, Feature-Arbeit wird blockiert, und Regressions betreffen die gesamte Codebase.",
    keyPoints: [
      "Kleine PRs sind reviewbar, grosse nicht",
      "Feature-Arbeit laeuft parallel weiter",
      "Fehler betreffen nur migrierte Dateien, nicht alles",
      "allowJs ermoeglicht Koexistenz waehrend der Migration",
      "Big Bang blockiert das gesamte Team fuer Tage/Wochen",
    ],
  },
];
