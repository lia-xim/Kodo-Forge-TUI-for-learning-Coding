// quiz-data.ts — L32: Type-safe APIs
// 9 MC + 3 short-answer + 2 predict-output + 1 explain-why = 15 Fragen
// MC correct-Index Verteilung: 3x0, 2x1, 2x2, 2x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "32";
export const lessonTitle = "Type-safe APIs";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (9 Fragen, correct: 0,0,0, 1,1, 2,2, 3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Trust me Problem — correct: 0 ---
  {
    question: "Was ist das Hauptproblem von HttpClient.get<User[]>('/api/users')?",
    options: [
      "TypeScript prueft nicht ob die API wirklich User[] liefert — es ist ein Compilezeit-Cast",
      "HttpClient unterstuetzt keine Generics korrekt — die Typ-Information geht bei der HTTP-Uebertragung verloren",
      "Der Browser blockiert typisierte HTTP-Anfragen aus Sicherheitsgruenden und entfernt die Typ-Annotation",
      "User[] kann nicht als Typparameter verwendet werden weil Arrays spezielle Behandlung brauchen",
    ],
    correct: 0,
    explanation:
      "HttpClient.get<T>() ist ein 'Trust me, Compiler'. TypeScript glaubt dir, aber " +
      "prueft nicht was die API tatsaechlich zurueckgibt. Wenn die API ihr Schema aendert, " +
      "kompiliert dein Code weiterhin — der Fehler tritt erst zur Laufzeit auf.",
    elaboratedFeedback: {
      whyCorrect: "Der Typparameter T wird nur zur Compilezeit verwendet. Zur Laufzeit existiert er nicht (Type Erasure). Die API koennte null, einen Error-Body oder ein komplett anderes Schema liefern.",
      commonMistake: "Viele denken, der Typparameter 'beweist' dass die Daten korrekt sind. Er 'behauptet' es nur. Der Beweis kommt erst durch Runtime-Validierung."
    }
  },

  // --- Frage 2: Derived Types — correct: 0 ---
  {
    question: "Warum sind Derived Types (Pick, Partial, Omit) besser als manuell definierte Request-Typen?",
    options: [
      "Aenderungen am Basis-Typ propagieren automatisch — kein Out-of-Sync moeglich",
      "Derived Types sind schneller zur Laufzeit weil sie keine eigenen Speicherzuweisungen benoetigen",
      "TypeScript kann nur Derived Types in HTTP-Aufrufen verwenden weil sie vom Compiler optimiert werden",
      "Derived Types haben bessere IDE-Unterstuetzung weil sie direkt vom Language Service indiziert werden",
    ],
    correct: 0,
    explanation:
      "Wenn User ein neues Feld bekommt, propagiert Pick/Partial das automatisch. " +
      "Manuelle Typen muessen manuell nachgezogen werden — und das wird vergessen.",
    elaboratedFeedback: {
      whyCorrect: "type CreateUser = Pick<User, 'name' | 'email'> — wenn User.email zu User.emailAddress umbenannt wird, bricht Pick sofort (Compile-Error). Ein manuelles Interface CreateUser { email: string } wuerde weiter kompilieren.",
      commonMistake: "Derived Types sind nicht immer besser. Bei stark unterschiedlichen Request/Response-Schemas (z.B. Backend-Transformation) sind separate Typen klarer."
    }
  },

  // --- Frage 3: Zod Schema First — correct: 0 ---
  {
    question: "Was bedeutet 'Schema First' bei der API-Typisierung mit Zod?",
    options: [
      "Zuerst das Zod-Schema definieren, dann den TypeScript-Typ mit z.infer ableiten",
      "Zuerst das TypeScript-Interface definieren, dann das Zod-Schema parallel dazu manuell schreiben",
      "Zuerst das OpenAPI-Schema definieren, dann TypeScript generieren und das Zod-Schema daraus ableiten",
      "Zuerst die Datenbank modellieren, dann die API-Typen ableiten und das Schema automatisch generieren",
    ],
    correct: 0,
    explanation:
      "Schema First: Das Zod-Schema ist die Single Source of Truth. Der TypeScript-Typ " +
      "wird mit z.infer<typeof Schema> abgeleitet. So koennen Schema (Runtime) und Typ " +
      "(Compilezeit) nie auseinanderlaufen.",
    elaboratedFeedback: {
      whyCorrect: "const UserSchema = z.object({ name: z.string() }); type User = z.infer<typeof UserSchema>; — User ist IMMER identisch zum Schema. Bei 'Typ First' koennte das Interface und die Validierung abweichen.",
      commonMistake: "Viele definieren erst das Interface und schreiben dann ein passendes Zod-Schema. Das fuehrt zu Duplikation und Inkonsistenz — genau das was Schema First verhindert."
    }
  },

  // --- Frage 4: tRPC — correct: 1 ---
  {
    question: "Wie transportiert tRPC Typen vom Server zum Client?",
    options: [
      "Durch Code-Generation in einem Build-Step der den Server-Code in den Client uebertraegt",
      "Durch 'import type' — der Client importiert nur den Router-TYP, keinen Runtime-Code",
      "Durch ein gemeinsames npm-Package mit Typen das sowohl vom Server als auch Client genutzt wird",
      "Durch JSON Schema das zur Laufzeit geprueft wird und daraus die Client-Typen automatisch generiert",
    ],
    correct: 1,
    explanation:
      "tRPC nutzt 'import type { AppRouter } from \"../server\"'. Das importiert NUR den " +
      "TypeScript-Typ — zur Laufzeit wird nichts importiert (Type Erasure). TypeScript " +
      "inferiert alle Endpunkt-Typen aus dem Router-Typ.",
    elaboratedFeedback: {
      whyCorrect: "import type ist ein rein statischer Import. Der Bundler entfernt ihn komplett. Aber der TypeScript-Compiler nutzt ihn fuer Typ-Inferenz. So 'sieht' der Client die Server-Typen ohne Server-Code ins Bundle zu laden.",
      commonMistake: "Viele denken, tRPC wuerde Typen 'ueber die Leitung senden'. Nein — die Typen existieren nur zur Compilezeit. Zur Laufzeit sendet tRPC normales JSON ueber HTTP."
    }
  },

  // --- Frage 5: safeParse — correct: 1 ---
  {
    question: "Was ist der Unterschied zwischen z.parse() und z.safeParse()?",
    options: [
      "parse() gibt undefined bei Fehler zurueck, safeParse() wirft eine Exception und beendet die Ausfuehrung",
      "parse() wirft bei ungueltigem Input, safeParse() gibt ein Result-Objekt zurueck",
      "parse() validiert nur Typen auf Compilezeit-Ebene, safeParse() validiert auch Werte zur Laufzeit",
      "Es gibt keinen Unterschied — sie sind Aliase die dieselbe Funktion mit anderem Namen aufrufen",
    ],
    correct: 1,
    explanation:
      "parse() wirft eine ZodError-Exception bei Validierungsfehler. safeParse() gibt " +
      "ein Result-Objekt zurueck: { success: true, data: T } oder { success: false, error: ZodError }. " +
      "safeParse() ist besser fuer graceful Error Handling.",
    elaboratedFeedback: {
      whyCorrect: "safeParse() ist wie das Result-Pattern aus L25: Fehler werden zu Werten statt Exceptions. Du kannst den Fehler inspizieren, Fehlermeldungen anzeigen, oder einen Fallback verwenden — alles typsicher.",
      commonMistake: "Viele verwenden parse() in API-Handlern. Das kann OK sein wenn der catch-Block den Fehler behandelt. Aber safeParse() ist expliziter und vermeidet try/catch-Bloecke."
    }
  },

  // --- Frage 6: graphql-codegen — correct: 2 ---
  {
    question: "Warum generiert graphql-codegen Typen PRO Query statt einen globalen User-Typ?",
    options: [
      "Weil GraphQL keine globalen Typen unterstuetzt und jeden Query-Typ separat definieren muss",
      "Weil globale Typen mehr Speicher brauchen und die Performance der GraphQL-Engine beeentraechtigen",
      "Weil jede Query nur bestimmte Felder anfordert — der Typ reflektiert exakt das",
      "Weil TypeScript keine globalen Typen importieren kann und sie pro Datei neu definiert werden muessen",
    ],
    correct: 2,
    explanation:
      "GraphQL erlaubt Partial Selection: query { user { id name } } laed nur id und name. " +
      "Der generierte Typ hat nur diese Felder. Wuerde man den globalen User-Typ nutzen, " +
      "koennte man auf email zugreifen — obwohl es nicht geladen wurde.",
    elaboratedFeedback: {
      whyCorrect: "Query-spezifische Typen verhindern 'undefined-Zugriffe': Wenn du role nicht anforderst, ist role nicht im Typ. Der Compiler verhindert data.user.role — statt dass es undefined ist.",
      commonMistake: "Manche finden Query-spezifische Typen umstaendlich. In der Praxis sind sie ein riesiger Vorteil: Du siehst sofort welche Felder eine Component wirklich braucht."
    }
  },

  // --- Frage 7: OpenAPI — correct: 2 ---
  {
    question: "Was passiert wenn sich die API aendert aber du vergisst die OpenAPI-Typen neu zu generieren?",
    options: [
      "TypeScript erkennt die Aenderung automatisch und aktualisiert die generierten Typen im Hintergrund",
      "Der Server verweigert Requests mit veralteten Typen weil er die Versionsnummer im Header prueft",
      "Die generierten Typen werden stale — Code kompiliert, aber stimmt nicht mit der API ueberein",
      "openapi-typescript aktualisiert sich selbst bei jedem Build und laedt das neueste Schema automatisch",
    ],
    correct: 2,
    explanation:
      "Generierte Typen sind Snapshots. Ohne Neugenerierung werden sie stale. Loesung: " +
      "Typ-Generierung in CI/CD-Pipeline einbauen, Pre-Commit-Hooks, und zusaetzlich " +
      "Runtime-Validierung als Safety Net.",
    elaboratedFeedback: {
      whyCorrect: "Das ist ein fundamentaler Nachteil von Code-Generation: Es gibt einen zeitlichen Gap zwischen Schema-Aenderung und Typ-Update. CI/CD-Integration und Runtime-Validierung schliessen diese Luecke.",
      commonMistake: "Viele verlassen sich NUR auf generierte Typen ohne Runtime-Validierung. Das kombiniert das Schlimmste aus beiden Welten: Code-Generation-Overhead PLUS falsches Sicherheitsgefuehl."
    }
  },

  // --- Frage 8: Valibot — correct: 3 ---
  {
    question: "Was ist der Hauptvorteil von Valibot gegenueber Zod?",
    options: [
      "Valibot hat eine bessere TypeScript-Integration weil es ausschliesslich fuer TypeScript entwickelt wurde",
      "Valibot unterstuetzt mehr Datentypen als Zod und deckt damit ein breiteres Spektrum an Validierungsfaellen ab",
      "Valibot hat eine schnellere Validierung weil es auf WebAssembly statt auf JavaScript basiert",
      "Valibot hat eine drastisch kleinere Bundle-Groesse (~1kb vs ~13kb)",
    ],
    correct: 3,
    explanation:
      "Valibot nutzt ein pipe-basiertes Design statt Method-Chaining. Das ermoeglicht " +
      "exzellentes Tree-Shaking: Nur die tatsaechlich genutzten Validierungen landen im " +
      "Bundle. Ergebnis: ~1kb statt ~13kb (gzip).",
    elaboratedFeedback: {
      whyCorrect: "Zod's Method-Chaining (z.string().min(1).email()) laed die gesamte Zod-Library. Valibot's Pipe (v.pipe(v.string(), v.minLength(1), v.email())) importiert nur die genutzten Funktionen — der Bundler entfernt den Rest.",
      commonMistake: "Bundle-Groesse ist nicht immer das wichtigste Kriterium. Zod hat ein viel groesseres Ecosystem (tRPC-Integration, React Hook Form, etc.). Fuer Server-Code ist die Groesse irrelevant."
    }
  },

  // --- Frage 9: Response-Validierung — correct: 3 ---
  {
    question: "Warum sollte man auch die API-RESPONSE validieren, nicht nur den Input?",
    options: [
      "Weil der Browser die Response blockieren koennte wenn die Content-Type-Header nicht uebereinstimmen",
      "Weil TypeScript Responses anders behandelt als Requests und spezielle Typparameter fuer beide Richtungen braucht",
      "Weil Responses komprimiert uebertragen werden und TypeScript die Dekomprimierung nicht korrekt handhabt",
      "Weil das Backend sein Schema aendern kann — ohne Response-Validierung merkst du es zu spaet",
    ],
    correct: 3,
    explanation:
      "Das Backend-Team koennte Felder umbenennen, Nullable machen, oder entfernen. " +
      "Ohne Response-Validierung: TypeError tief im UI. Mit Validierung: Klare Fehlermeldung " +
      "an der API-Grenze, bevor fehlerhafte Daten die App durchlaufen.",
    elaboratedFeedback: {
      whyCorrect: "Schema-Aenderungen im Backend sind haeufig — Migrationen, Refactorings, neue API-Versionen. Response-Validierung ist dein Safety Net: Der Fehler wird an der API-Grenze gefangen, nicht im UI.",
      commonMistake: "Viele validieren nur User-Input ('ist die Email gueltig?'). Aber die API-Response ist genauso unsicher wie jede andere externe Datenquelle. Treat it as unknown!"
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Wie leitet man mit Zod den TypeScript-Typ aus einem Schema ab? (z.???<typeof Schema>)",
    expectedAnswer: "z.infer",
    acceptableAnswers: ["z.infer", "infer", "z.infer<typeof Schema>"],
    explanation:
      "z.infer<typeof Schema> extrahiert den TypeScript-Typ aus einem Zod-Schema. " +
      "Es nutzt TypeScript's Conditional Types und infer unter der Haube, um den " +
      "Output-Typ des Schemas abzuleiten.",
  },

  {
    type: "short-answer",
    question: "Wie heisst das Tool das TypeScript-Typen aus GraphQL-Schemas generiert?",
    expectedAnswer: "graphql-codegen",
    acceptableAnswers: ["graphql-codegen", "GraphQL Code Generator", "@graphql-codegen/cli", "graphql code generator"],
    explanation:
      "graphql-codegen (@graphql-codegen/cli) liest GraphQL-Schemas und Queries, " +
      "und generiert TypeScript-Typen, Hooks und Services fuer verschiedene Frameworks.",
  },

  {
    type: "short-answer",
    question: "Welche TypeScript-Import-Syntax importiert NUR den Typ, ohne Runtime-Code?",
    expectedAnswer: "import type",
    acceptableAnswers: ["import type", "import type { }", "type-only import"],
    explanation:
      "import type { AppRouter } from '...' importiert nur den TypeScript-Typ. " +
      "Zur Laufzeit wird nichts importiert (Type Erasure). Das ist der Mechanismus " +
      "den tRPC nutzt, um Server-Typen im Client verfuegbar zu machen.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Was gibt safeParse zurueck wenn die Validierung fehlschlaegt?",
    code:
      "const schema = z.object({ name: z.string(), age: z.number() });\n" +
      "const result = schema.safeParse({ name: 'Max', age: 'dreissig' });\n" +
      "console.log(result.success);",
    expectedAnswer: "false",
    acceptableAnswers: ["false", "False"],
    explanation:
      "'age' erwartet number, bekommt aber string 'dreissig'. safeParse wirft nicht, " +
      "sondern gibt { success: false, error: ZodError } zurueck. result.success ist false.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat 'data' nach erfolgreicher Validierung?",
    code:
      "const UserSchema = z.object({ name: z.string(), role: z.enum(['admin', 'user']) });\n" +
      "type User = z.infer<typeof UserSchema>;\n" +
      "// Was ist User?",
    expectedAnswer: "{ name: string; role: 'admin' | 'user' }",
    acceptableAnswers: [
      "{ name: string; role: 'admin' | 'user' }",
      "{ name: string; role: \"admin\" | \"user\" }",
      "{name: string; role: 'admin' | 'user'}",
    ],
    explanation:
      "z.infer leitet den TypeScript-Typ ab: z.string() → string, z.enum(['admin', 'user']) → 'admin' | 'user'. " +
      "Das Ergebnis ist ein Objekt-Typ mit genau diesen Feldern und Typen.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist die Netzwerkgrenze (API-Aufruf) die wichtigste Stelle fuer Runtime-Validierung " +
      "in einer TypeScript-Anwendung?",
    modelAnswer:
      "TypeScript-Typen enden an der Netzwerkgrenze. Innerhalb der App garantiert der Compiler " +
      "Typ-Korrektheit — aber Daten von APIs, WebSockets, localStorage oder URL-Parametern " +
      "haben KEINE TypeScript-Typen zur Laufzeit (Type Erasure). Die Netzwerkgrenze ist der " +
      "Uebergang von 'unkontrolliert' (externe Welt) zu 'kontrolliert' (Typ-System). " +
      "Wenn du hier validierst, ist alles was danach kommt typsicher. Wenn du hier NICHT " +
      "validierst, kann ein falscher Wert durch die gesamte App propagieren.",
    keyPoints: [
      "Type Erasure: TypeScript-Typen existieren zur Laufzeit nicht",
      "API-Daten sind externe Daten — TypeScript kann sie nicht garantieren",
      "Validierung an der Grenze macht den Rest der App typsicher",
      "Ohne Validierung propagieren falsche Daten durch die gesamte App",
    ],
  },
];
