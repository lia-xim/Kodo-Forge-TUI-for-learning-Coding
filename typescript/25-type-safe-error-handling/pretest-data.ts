// pretest-data.ts — L25: Type-safe Error Handling
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // Sektion 1: Das Exception-Problem
  { sectionId: 1, question: "Welche TypeScript-Funktion lügt im Rückgabetyp?",
    options: ["function safe(): string | null", "function risky(): User // kann werfen", "function async(): Promise<void>", "function option(): T | undefined"],
    correct: 1, explanation: "`User` verspricht immer ein User. Wenn die Funktion wirft, gibt sie nichts zurück." },
  { sectionId: 1, question: "Was ist Java's Lösung für das 'unsichtbare Fehler' Problem?",
    options: ["Optional<T> als Wrapper", "Checked Exceptions: `throws` im Methodensignal zwingt Caller zum catch", "try-with-resources für automatisches Schließen", "Java hat das Problem nicht — JVM fängt alle Fehler"],
    correct: 1, explanation: "Checked Exceptions in Java: `void foo() throws IOException` zwingt Caller zu try/catch. TypeScript hat kein Äquivalent." },
  { sectionId: 1, question: "Welcher Typ hat `error` im catch-Block mit `useUnknownInCatchVariables: true`?",
    options: ["any — der klassische Typ", "Error — immer ein Error-Objekt", "never — erreichbar ist unmöglich", "unknown — muss explizit geprüft werden"],
    correct: 3, explanation: "Mit useUnknownInCatchVariables (Teil von strict): error: unknown. Du musst instanceof prüfen." },

  // Sektion 2: Das Result-Pattern
  { sectionId: 2, question: "Was ist `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`?",
    options: ["Eine Wrapper-Klasse", "Eine Discriminated Union — Narrowing durch 'ok' Literal", "Ein Generic Interface", "Ein Mapped Type"],
    correct: 1, explanation: "Discriminated Union mit Discriminant `ok: true/false`. TypeScript narrowt auf den genauen Typ im if-Branch." },
  { sectionId: 2, question: "Was bewirkt `ok: true as const` bei der Result-Erstellung?",
    options: ["Macht den Wert unveränderlich", "Erzwingt Literal-Typ 'true' statt breiteren 'boolean' — ermöglicht Narrowing", "Deaktiviert Strictness für dieses Objekt", "Erzwingt Compile-Time-Evaluation"],
    correct: 1, explanation: "`as const` verhindert Type-Widening. `true` (Literal) statt `boolean` ist nötig für Discriminated Union Narrowing." },
  { sectionId: 2, question: "Was tut `flatMapResult(result, fn)` wenn result.ok === false?",
    options: ["Wirft eine Exception", "Ruft fn mit undefined auf", "Gibt result unverändert zurück (Fehler durchleiten)", "Gibt null zurück"],
    correct: 2, explanation: "flatMap: Bei Err → fn nicht aufrufen, Err durchleiten. Das ist 'Railway Oriented Programming' — Fehler fahren am Erfolgs-Track vorbei." },

  // Sektion 3: Option/Maybe Pattern
  { sectionId: 3, question: "Wann ist `User | null` besser als `Result<User, E>`?",
    options: ["Nur in JavaScript (nicht TypeScript)", "Wenn 'nicht gefunden' ein normaler Zustand ist, kein Fehler", "Wenn Performance kritisch ist", "Immer — Result ist immer Over-Engineering"],
    correct: 1, explanation: "null = normales Fehlen (nicht gefunden). Result = Fehler mit Ursache. findUser → null. createUser → Result." },
  { sectionId: 3, question: "Was macht optional chaining `user?.name`?",
    options: ["Wirft wenn user null ist", "Gibt undefined zurück wenn user null/undefined ist, sonst user.name", "Konvertiert null in undefined", "Ist identisch mit user && user.name"],
    correct: 1, explanation: "`user?.name` gibt `undefined` wenn user null/undefined ist, sonst `user.name`. Kurz für null-safe Property-Zugriff." },
  { sectionId: 3, question: "Was gibt `null ?? 'Default'` zurück?",
    options: ["null", "false", "'Default' — ?? ist Nullish Coalescing", "Throws TypeError"],
    correct: 2, explanation: "Nullish Coalescing `??`: Gibt rechte Seite zurück wenn linke Seite null oder undefined ist. `null ?? 'Default'` → 'Default'." },

  // Sektion 4: Exhaustive Error Handling
  { sectionId: 4, question: "Was ist der `never`-Typ in TypeScript?",
    options: ["Ein Alias für void", "Der Typ der immer fehler hat", "Der unmögliche Typ — kein Wert kann never haben", "Typen die nie definiert werden"],
    correct: 2, explanation: "`never` ist der Bottom-Typ: Kein Wert kann never sein. Erschöpfte Union-Typen werden zu never. assertNever(never) ist typsicher." },
  { sectionId: 4, question: "Was passiert wenn du `satisfies Record<Status, string>` verwendest und ein Key fehlt?",
    options: ["Runtime-Warnung", "Undefined wird für fehlende Keys eingesetzt", "COMPILE-ERROR: fehlender Property für den Status-Wert", "Das Objekt wird automatisch mit leerem String ergänzt"],
    correct: 2, explanation: "satisfies prüft dass alle Keys des Union-Typs vorhanden sind. Fehlt einer → TypeScript meldet: Missing key." },
  { sectionId: 4, question: "Welche TypeScript-Version führte `satisfies` ein?",
    options: ["TypeScript 4.0", "TypeScript 4.5", "TypeScript 5.0", "TypeScript 4.9"],
    correct: 3, explanation: "`satisfies` wurde in TypeScript 4.9 eingeführt. Es prüft ob ein Ausdruck einem Typ entspricht ohne den inferierter Typ zu verbreitern." },

  // Sektion 5: Error-Typen Patterns
  { sectionId: 5, question: "Warum sind Union-Typen für Fehler besser als Klassen-Hierarchien?",
    options: ["Union-Typen haben bessere Performance", "Klassen können nicht in TypeScript sein", "Union-Typen sind JSON-serialisierbar, kein instanceof nötig, flexibler für mehrere Kontexte", "Klassen haben kein Narrowing"],
    correct: 2, explanation: "Union-Typen: serialisierbar, einfach zu erstellen, Pattern-Matching. Klassen: instanceof nötig, nicht JSON-konform, ein Elternteil-Typ." },
  { sectionId: 5, question: "Was ist ein 'Anti-Corruption Layer' in der Fehler-Architektur?",
    options: ["Ein try/catch Block im Middleware", "Eine Schicht die externe Fehler-Typen in interne Domain-Typen konvertiert", "Eine TypeScript-Linter-Regel", "Eine Abstraktionsschicht für Netzwerk-Fehler"],
    correct: 1, explanation: "ACL: Externe Fehler (DB-Codes, HTTP-Status) werden zu Domain-Fehlern (UserNotFound, ValidationError) konvertiert. Jede Schicht spricht ihre eigene Sprache." },
  { sectionId: 5, question: "Was ist `readonly type = 'VALIDATION' as const` in einer Error-Klasse?",
    options: ["Es definiert einen konstanten Methodenaufruf", "Es macht die Klasse unveränderlich", "Es fügt ein Discriminant-Property hinzu das Narrowing in switch/case ermöglicht", "as const ist in Klassen nicht erlaubt"],
    correct: 2, explanation: "`type = 'VALIDATION' as const` → Literal-Typ 'VALIDATION'. Das macht Klassen-Instanzen zu discriminated union Teilnehmern — switch über `error.type` funktioniert." },

  // Sektion 6: Praxis
  { sectionId: 6, question: "Wie wrapping'st du eine Angular-HTTP-Request zu Result<User, HttpError>?",
    options: ["Durch Implementierung von HttpInterceptor", "map(user => ok(user)), catchError(e => of(err(toHttpError(e))))", "HttpClient gibt automatisch Result zurück", "Durch extends HttpClient"],
    correct: 1, explanation: ".pipe(map(user => ok(user)), catchError(err => of(err(toHttpError(err))))) wrapper den Observable in Result-Werte." },
  { sectionId: 6, question: "Für welche Situation ist `throw` bei einem fetch-Wrapper falsch?",
    options: ["Wenn der Server 500 zurückgibt", "Wenn JSON.parse fehlschlägt", "Wenn der URL-Parameter ungültig ist", "Für alle drei — fetch-Wrapper sollten immer Result zurückgeben"],
    correct: 3, explanation: "Alle drei Fehler (500, JSON-Parse, ungültige URL) sind für HTTP-operationen 'erwartet'. Der Wrapper sollte immer Result zurückgeben statt zu werfen." },
  { sectionId: 6, question: "Was ist die empfohlene Architektur für Fehler in einer SPA?",
    options: ["Eine globale try/catch in main.ts", "Result-Typen pro Schicht mit Übersetzung zwischen den Schichten", "Alle Fehler als strings serialisieren", "Error-Boundaries nur im Root-Component"],
    correct: 1, explanation: "Infra (try/catch → Result) → Repository (DB-Error → Domain-Error) → Service → Presentation (exhaustive switch). Jede Schicht spricht ihre Sprache." }
];
