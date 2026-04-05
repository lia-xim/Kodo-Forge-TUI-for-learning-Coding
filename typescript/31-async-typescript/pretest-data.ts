// pretest-data.ts — L31: Async TypeScript
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Promise-Typen ──────────────────────────────────────────

  {
    sectionId: 1,
    question: "Was beschreibt der Typparameter in Promise<string>?",
    options: [
      "Den Typ des aufgeloesten Werts",
      "Den Typ des Fehlers",
      "Den Typ des Promise-Objekts selbst",
      "Ich weiss es nicht",
    ],
    correct: 0,
    explanation: "Promise<T> beschreibt den Typ des Werts der bei resolve() uebergeben wird.",
  },
  {
    sectionId: 1,
    question: "Was macht Awaited<Promise<Promise<number>>>?",
    options: [
      "Ergibt Promise<number>",
      "Ergibt number — entpackt rekursiv alle Promise-Schichten",
      "Compile-Error — verschachtelte Promises nicht unterstuetzt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Awaited<T> entpackt rekursiv alle Promise-Schichten bis zum Basistyp.",
  },
  {
    sectionId: 1,
    question: "Was ist PromiseLike<T>?",
    options: [
      "Ein Alias fuer Promise<T>",
      "Das minimale Interface mit nur then() — fuer 'thenable' Objekte",
      "Ein deprecated Typ aus alten TypeScript-Versionen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "PromiseLike<T> hat nur then() und ist kompatibel mit jedem Objekt das eine then()-Methode hat.",
  },

  // ─── Sektion 2: async/await und Typinferenz ────────────────────────────

  {
    sectionId: 2,
    question: "Was ist der Rueckgabetyp einer async-Funktion die 'return 42' hat?",
    options: [
      "number",
      "Promise<number>",
      "Promise<number> | number",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "async-Funktionen wrappen den Rueckgabetyp IMMER in Promise<T>.",
  },
  {
    sectionId: 2,
    question: "Was gibt response.json() in fetch zurueck?",
    options: [
      "Promise<unknown>",
      "Promise<any> — ein Typ-Loch",
      "Den geparsten JSON-Typ",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "json() gibt Promise<any> zurueck. Das 'any' infiziert alle abgeleiteten Typen.",
  },
  {
    sectionId: 2,
    question: "Was passiert wenn man 'await' vor einem Nicht-Promise-Wert schreibt?",
    options: [
      "Compile-Error",
      "Der Wert wird unveraendert zurueckgegeben (No-Op im Typ)",
      "Der Wert wird in ein Promise gewrappt und sofort aufgeloest",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "await auf einem Nicht-Promise gibt den Wert direkt zurueck. Im Typ: Awaited<number> = number.",
  },

  // ─── Sektion 3: Error Handling in Async ────────────────────────────────

  {
    sectionId: 3,
    question: "Welchen Typ hat die catch-Variable mit 'strict: true' seit TS 4.4?",
    options: [
      "Error",
      "any",
      "unknown",
      "Ich weiss es nicht",
    ],
    correct: 2,
    explanation: "Mit useUnknownInCatchVariables (Teil von strict) ist die catch-Variable 'unknown'.",
  },
  {
    sectionId: 3,
    question: "Warum kann TypeScript den Fehlertyp in catch nicht genau bestimmen?",
    options: [
      "Weil catch nur Error-Objekte faengt",
      "Weil JavaScript throw mit JEDEM Wert erlaubt",
      "Weil TypeScript keine Exception-Typen unterstuetzt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "throw kann Strings, Zahlen, Objekte, undefined werfen. TypeScript muesste alle throw-Pfade tracken.",
  },
  {
    sectionId: 3,
    question: "Was ist das Async Result Pattern?",
    options: [
      "Eine spezielle try/catch-Syntax fuer Async",
      "Ein Pattern das Promise<T> in Promise<Result<T>> konvertiert",
      "Ein Angular-spezifisches Error-Handling-Pattern",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "trySafe<T>(promise) faengt Fehler und gibt Result<T> zurueck — Fehler werden im Typ sichtbar.",
  },

  // ─── Sektion 4: Generische Async-Patterns ──────────────────────────────

  {
    sectionId: 4,
    question: "Warum nimmt eine retry-Funktion () => Promise<T> statt Promise<T>?",
    options: [
      "Weil TypeScript sonst den Typ nicht inferieren kann",
      "Weil ein Promise sofort startet — die Funktion ermoeglicht Wiederholung",
      "Weil Promises nicht als Parameter uebergeben werden koennen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Promises sind eager (starten sofort). Eine Funktion ist lazy und kann bei jedem Retry neu aufgerufen werden.",
  },
  {
    sectionId: 4,
    question: "Was macht AbortController bei einem Timeout besser als Promise.race?",
    options: [
      "AbortController ist schneller",
      "AbortController bricht die Operation tatsaechlich ab, race laesst sie weiterlaufen",
      "AbortController hat bessere Typen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Promise.race gibt das schnellste Ergebnis zurueck, aber das langsame Promise laeuft weiter. AbortController bricht ab.",
  },
  {
    sectionId: 4,
    question: "Warum verschwindet 'never' in Promise.race([Promise<T>, Promise<never>])?",
    options: [
      "never ist ein Fehler-Typ",
      "never ist die leere Menge — T | never = T",
      "TypeScript ignoriert Promise<never>",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "never ist der Bottom Type (leere Menge). In einer Union verschwindet er: T | never = T.",
  },

  // ─── Sektion 5: AsyncIterable und Generators ──────────────────────────

  {
    sectionId: 5,
    question: "Was bedeutet 'async function*' in TypeScript?",
    options: [
      "Eine Funktion die Promises erzeugt",
      "Ein Async Generator der Werte asynchron yielden kann",
      "Eine Funktion mit Stern-Operator fuer Multiplikation",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "async function* definiert einen Async Generator. Er kann Werte mit yield asynchron liefern.",
  },
  {
    sectionId: 5,
    question: "Was ist IteratorResult<T, TReturn>?",
    options: [
      "Ein Promise das T zurueckgibt",
      "Eine Discriminated Union: { done: false; value: T } | { done: true; value: TReturn }",
      "Ein Error-Typ fuer Iterator-Fehler",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "IteratorResult ist eine Discriminated Union. 'done' ist die Diskriminante — value hat je nach done verschiedene Typen.",
  },
  {
    sectionId: 5,
    question: "Was passiert bei 'break' in einer for-await-of-Schleife?",
    options: [
      "Der Generator laeuft im Hintergrund weiter",
      "Es wird automatisch gen.return() aufgerufen",
      "Es gibt einen Compile-Error",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "break ruft implizit return() auf dem Iterator auf. Der Generator wird sauber beendet.",
  },

  // ─── Sektion 6: Praxis — Frameworks ────────────────────────────────────

  {
    sectionId: 6,
    question: "Was ist das Problem mit HttpClient.get<User[]>('/api/users') in Angular?",
    options: [
      "Der Typ ist falsch — es sollte Observable<User[]> sein",
      "Es ist ein 'Trust me, Compiler' — keine Runtime-Pruefung ob die API wirklich User[] liefert",
      "HttpClient akzeptiert keine Generics",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "HttpClient.get<T>() ist ein Compilezeit-Versprechen. TypeScript prueft nicht was die API tatsaechlich liefert.",
  },
  {
    sectionId: 6,
    question: "Was ist der Vorteil von Typed API Routes als zentrale Typ-Map?",
    options: [
      "Sie machen HTTP-Aufrufe schneller",
      "Autocomplete und Typ-Sicherheit fuer alle Endpunkte an einer Stelle",
      "Sie ersetzen REST durch GraphQL",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Eine zentrale Typ-Map definiert alle Endpunkte mit ihren Request/Response-Typen. IDE-Autocomplete und Compile-Pruefung inklusive.",
  },
  {
    sectionId: 6,
    question: "Was schliesst die Luecke zwischen TypeScript-Typen und tatsaechlichen API-Daten?",
    options: [
      "Strengere tsconfig-Optionen",
      "Runtime-Validierung mit Zod, Valibot oder aehnlichen Bibliotheken",
      "Mehr Generics im Code",
      "Ich weiss es nicht",
    ],
    correct: 1,
    explanation: "Runtime-Validierung prueft die tatsaechlichen Daten gegen ein Schema — nicht nur den TypeScript-Typ.",
  },
];
