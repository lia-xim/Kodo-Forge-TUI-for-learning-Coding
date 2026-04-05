// quiz-data.ts — L31: Async TypeScript
// 9 MC + 3 short-answer + 2 predict-output + 1 explain-why = 15 Fragen
// MC correct-Index Verteilung: 3x0, 2x1, 2x2, 2x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "31";
export const lessonTitle = "Async TypeScript";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (9 Fragen, correct: 0,0,0, 1,1, 2,2, 3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Promise<T> — correct: 0 ---
  {
    question: "Was beschreibt der Typparameter T in Promise<T>?",
    options: [
      "Den Typ des aufgeloesten Werts (Erfolgsfall)",
      "Den Typ des abgelehnten Werts (Fehlerfall)",
      "Den Typ von resolve UND reject",
      "Den Typ des Promise-Objekts selbst",
    ],
    correct: 0,
    explanation:
      "Promise<T> trackt nur den Erfolgsfall. T ist der Typ den resolve() uebergibt. " +
      "Der Fehlertyp (reason in reject/catch) ist immer 'any' — TypeScript kann ihn nicht tracken.",
    elaboratedFeedback: {
      whyCorrect: "In der Promise-Definition: then(onfulfilled?: (value: T) => ...). T fliesst in den onfulfilled-Callback. Der onrejected-Callback hat reason: any.",
      commonMistake: "Viele denken, Promise<T> wuerde auch den Fehlertyp beschreiben. Das ist nicht der Fall — und genau das ist die groesste Luecke im Async-Typsystem."
    }
  },

  // --- Frage 2: PromiseLike — correct: 0 ---
  {
    question: "Was ist der Unterschied zwischen Promise<T> und PromiseLike<T>?",
    options: [
      "PromiseLike hat nur then(), Promise hat zusaetzlich catch() und finally()",
      "Promise ist fuer Async-Code, PromiseLike fuer synchronen Code",
      "PromiseLike ist deprecated seit ES2020",
      "Es gibt keinen Unterschied — sie sind Aliase fuereinander",
    ],
    correct: 0,
    explanation:
      "PromiseLike<T> ist das minimale Interface mit nur then(). Es akzeptiert jedes 'thenable' — " +
      "auch Bibliotheks-Promises (Bluebird, Q) die nicht von nativem Promise erben.",
    elaboratedFeedback: {
      whyCorrect: "PromiseLike definiert: then<TResult1, TResult2>(...): PromiseLike<TResult1 | TResult2>. Kein catch(), kein finally(). Das macht es kompatibel mit jedem Objekt das eine then()-Methode hat.",
      commonMistake: "Viele ignorieren PromiseLike und nutzen immer Promise. Fuer eigenen Code ist das OK — aber wenn du eine Library schreibst, solltest du PromiseLike in Parametern akzeptieren."
    }
  },

  // --- Frage 3: Awaited<T> — correct: 0 ---
  {
    question: "Was ist das Ergebnis von Awaited<Promise<Promise<string>>>?",
    options: [
      "string — Awaited entpackt rekursiv alle Promise-Schichten",
      "Promise<string> — nur eine Schicht wird entpackt",
      "Promise<Promise<string>> — Awaited aendert nichts",
      "unknown — verschachtelte Promises sind nicht unterstuetzt",
    ],
    correct: 0,
    explanation:
      "Awaited<T> entpackt rekursiv: Awaited<Promise<Promise<string>>> → Awaited<Promise<string>> → string. " +
      "Das bildet das JavaScript-Verhalten ab, wo Promise.resolve(Promise.resolve('x')) zu 'x' aufloest.",
    elaboratedFeedback: {
      whyCorrect: "Awaited ist ein rekursiver Conditional Type: type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T. Solange T ein PromiseLike ist, wird weiter entpackt.",
      commonMistake: "Vor TS 4.5 gab es Awaited nicht. Promise.all() hatte Probleme mit verschachtelten Promises. Awaited loeste dieses lang bestehende Issue."
    }
  },

  // --- Frage 4: async Rueckgabetyp — correct: 1 ---
  {
    question: "Was ist der Rueckgabetyp von: async function f() { return 42; }?",
    options: [
      "number — async aendert den Rueckgabetyp nicht",
      "Promise<number> — async wrappt IMMER in Promise",
      "Promise<number> | number — abhaengig vom Aufrufkontext",
      "Awaited<number> — async nutzt Awaited intern",
    ],
    correct: 1,
    explanation:
      "Jede async-Funktion gibt Promise<T> zurueck, egal was du returnst. " +
      "'return 42' in einer async-Funktion wird zu Promise.resolve(42). " +
      "Der Rueckgabetyp ist IMMER Promise<T>.",
    elaboratedFeedback: {
      whyCorrect: "Das ist JavaScript-Spezifikation, nicht TypeScript-spezifisch. async function f() { return 42; } — f() gibt ein Promise zurueck. TypeScript bildet das korrekt ab.",
      commonMistake: "Manche denken, wenn kein await in der Funktion ist, wuerde TypeScript den Typ nicht wrappen. Doch — async allein reicht."
    }
  },

  // --- Frage 5: catch-Typ — correct: 1 ---
  {
    question: "Welchen Typ hat 'error' in einem catch-Block mit useUnknownInCatchVariables: true?",
    options: [
      "Error — catch faengt immer Error-Objekte",
      "unknown — TypeScript weiss nicht was geworfen wurde",
      "any — catch-Variablen sind immer any",
      "never — der catch-Block ist unerreichbar",
    ],
    correct: 1,
    explanation:
      "Mit useUnknownInCatchVariables: true (Teil von strict seit TS 4.4) ist die catch-Variable 'unknown'. " +
      "Du musst Type Narrowing verwenden (z.B. instanceof Error) bevor du auf Properties zugreifen kannst.",
    elaboratedFeedback: {
      whyCorrect: "JavaScript kann ALLES werfen: Strings, Zahlen, Objekte, undefined. TypeScript kann nicht statisch analysieren was geworfen wird. 'unknown' erzwingt eine Pruefung — das ist sicherer als 'any'.",
      commonMistake: "Ohne useUnknownInCatchVariables ist error 'any'. Das bedeutet: error.message kompiliert ohne Fehler, auch wenn error ein String oder undefined ist."
    }
  },

  // --- Frage 6: Promise.all Typ — correct: 2 ---
  {
    question: "Welchen Typ hat das Ergebnis von: await Promise.all([fetchUser(), fetchPosts()])?",
    options: [
      "(User | Post[])[] — ein Array der Union",
      "Promise<[User, Post[]]> — das Promise ist nicht aufgeloest",
      "[User, Post[]] — ein Tupel mit exakten Typen pro Position",
      "User & Post[] — eine Intersection",
    ],
    correct: 2,
    explanation:
      "Promise.all() mit einem Array-Literal erzeugt einen Tupel-Typ. Jede Position " +
      "im Ergebnis entspricht dem aufgeloesten Typ des Promises an dieser Position. " +
      "await entpackt das aeussere Promise.",
    elaboratedFeedback: {
      whyCorrect: "Promise.all hat Overloads fuer Tupel: all<T extends readonly unknown[]>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>. Das mapped ueber das Tupel und entpackt jedes Element.",
      commonMistake: "Viele erwarten ein Array der Union. Das waere der Fall bei Promise.all(array), aber bei Promise.all([a, b]) erkennt TypeScript das Array-Literal als Tupel."
    }
  },

  // --- Frage 7: forEach mit async — correct: 2 ---
  {
    question: "Was ist das Problem mit: ids.forEach(async id => { await deleteUser(id); })?",
    options: [
      "forEach akzeptiert keine async-Callbacks",
      "deleteUser wird synchron statt asynchron aufgerufen",
      "Die Promises werden nicht gesammelt — die Funktion kehrt zurueck bevor alle fertig sind",
      "Der Typ von ids wird zu Promise<string>[] geaendert",
    ],
    correct: 2,
    explanation:
      "forEach ignoriert den Rueckgabetyp des Callbacks. Da async Callbacks Promise<void> " +
      "zurueckgeben, werden die Promises erzeugt aber nie awaited. Die aeussere Funktion " +
      "kehrt zurueck waehrend die Deletes noch laufen. Loesung: for...of oder Promise.all.",
    elaboratedFeedback: {
      whyCorrect: "forEach hat die Signatur: forEach(callback: (item: T) => void): void. Der void-Rueckgabetyp bedeutet: was der Callback zurueckgibt wird ignoriert. Die Promises verschwinden ins Nirgendwo.",
      commonMistake: "Das ist ein haeufiger Bug der schwer zu finden ist, weil kein Compile-Error entsteht. TypeScript erlaubt async Callbacks in forEach — es warnt nur nicht, dass die Promises verloren gehen."
    }
  },

  // --- Frage 8: retry Pattern — correct: 3 ---
  {
    question: "Warum nimmt retry() eine Funktion () => Promise<T> statt direkt ein Promise<T>?",
    options: [
      "Weil Funktionen weniger Speicher brauchen als Promises",
      "Weil TypeScript Generics nur mit Funktionen inferieren kann",
      "Weil Promises in TypeScript nicht als Parameter uebergeben werden koennen",
      "Weil ein Promise sofort startet — mit einer Funktion kann retry bei jedem Versuch neu starten",
    ],
    correct: 3,
    explanation:
      "Ein Promise beginnt seine Ausfuehrung sofort bei Erstellung. Wuerde retry ein " +
      "Promise<T> nehmen, koennte es die Operation nicht wiederholen — das Promise ist " +
      "schon gestartet. Mit () => Promise<T> kann retry die Funktion bei jedem Versuch " +
      "neu aufrufen.",
    elaboratedFeedback: {
      whyCorrect: "retry(fetchUser('123'), ...) — fetchUser ist schon aufgerufen, das Promise laeuft. retry(() => fetchUser('123'), ...) — fetchUser wird erst bei jedem Versuch aufgerufen.",
      commonMistake: "Das ist ein fundamentaler Unterschied zwischen 'eagerer' und 'lazy' Ausfuehrung. Promises sind eager (starten sofort), Funktionen sind lazy (starten bei Aufruf)."
    }
  },

  // --- Frage 9: AsyncGenerator — correct: 3 ---
  {
    question: "Was hat der Typparameter 'Y' in AsyncGenerator<Y, R, N> fuer eine Bedeutung?",
    options: [
      "Den Typ des Yielded Values bei 'done: true'",
      "Den Typ der in next() reingegeben wird",
      "Den Typ des finalen return-Werts",
      "Den Typ der Werte die bei jedem yield geliefert werden",
    ],
    correct: 3,
    explanation:
      "AsyncGenerator<Y, R, N>: Y = Yield-Typ (was bei yield zurueckgegeben wird), " +
      "R = Return-Typ (was bei return zurueckgegeben wird), N = Next-Typ (was in next() " +
      "reingegeben wird). for-await-of iteriert ueber Y-Werte.",
    elaboratedFeedback: {
      whyCorrect: "async function* gen(): AsyncGenerator<string, number, boolean> — yield 'hello' liefert string (Y), return 42 liefert number (R), gen.next(true) akzeptiert boolean (N).",
      commonMistake: "Die meisten Generator-Nutzungen brauchen nur Y: AsyncGenerator<string>. R und N haben Defaults (any und unknown). Nur bei bidirektionaler Kommunikation (next mit Wert) braucht man N."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welcher Utility Type entpackt verschachtelte Promises rekursiv (seit TS 4.5)?",
    expectedAnswer: "Awaited",
    acceptableAnswers: ["Awaited", "Awaited<T>", "awaited"],
    explanation:
      "Awaited<T> entpackt rekursiv: Awaited<Promise<Promise<string>>> = string. " +
      "Es bildet das JavaScript-Verhalten ab, wo verschachtelte Promises automatisch " +
      "aufgeloest werden.",
  },

  {
    type: "short-answer",
    question: "Welche tsconfig-Option macht catch-Variablen zu 'unknown' statt 'any'?",
    expectedAnswer: "useUnknownInCatchVariables",
    acceptableAnswers: ["useUnknownInCatchVariables", "useunknownincatchvariables"],
    explanation:
      "useUnknownInCatchVariables (seit TS 4.4, Teil von strict) aendert den Typ der " +
      "catch-Variable von 'any' zu 'unknown'. Das erzwingt Type Narrowing vor dem Zugriff " +
      "auf Properties.",
  },

  {
    type: "short-answer",
    question: "Wie heisst das minimale Promise-Interface das nur then() hat?",
    expectedAnswer: "PromiseLike",
    acceptableAnswers: ["PromiseLike", "PromiseLike<T>", "promiselike"],
    explanation:
      "PromiseLike<T> definiert nur then() — kein catch(), kein finally(). Es ist " +
      "kompatibel mit jedem 'thenable' Objekt, also auch mit Bibliotheks-Promises " +
      "die nicht von nativem Promise erben.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Kompiliert dieser Code? Antworte mit 'Ja' oder 'Nein'.",
    code:
      "async function f(): Promise<string> {\n" +
      "  return 42;\n" +
      "}",
    expectedAnswer: "Nein",
    acceptableAnswers: ["Nein", "nein", "No", "no", "Compile-Error", "Fehler"],
    explanation:
      "Die Funktion deklariert Promise<string> als Rueckgabetyp, gibt aber 42 (number) " +
      "zurueck. TypeScript meldet: Type 'number' is not assignable to type 'string'. " +
      "async wrappt 42 in Promise.resolve(42), aber Promise<number> ist nicht Promise<string>.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat 'result'?",
    code:
      "const p1 = Promise.resolve(42);\n" +
      "const p2 = Promise.resolve('hello');\n" +
      "const result = await Promise.all([p1, p2]);",
    expectedAnswer: "[number, string]",
    acceptableAnswers: [
      "[number, string]",
      "[ number, string ]",
      "readonly [number, string]",
    ],
    explanation:
      "Promise.all mit einem Array-Literal erzeugt einen Tupel-Typ. p1 ist Promise<number>, " +
      "p2 ist Promise<string>. await Promise.all([p1, p2]) entpackt zu [number, string]. " +
      "Die Reihenfolge bleibt erhalten.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist HttpClient.get<User[]>('/api/users') in Angular ein 'Trust me, Compiler' " +
      "und keine echte Typsicherheit? Was fehlt?",
    modelAnswer:
      "HttpClient.get<T>() ist ein generischer Cast: Du sagst dem Compiler, dass die API " +
      "T zurueckgibt. TypeScript prueft aber NICHT, ob die API wirklich T liefert. Der " +
      "Typ-Parameter ist ein Compilezeit-Versprechen ohne Laufzeit-Garantie. Wenn die API " +
      "ihr Schema aendert (z.B. 'name' wird zu 'fullName'), kompiliert der Code weiterhin " +
      "fehlerfrei — der Fehler tritt erst zur Laufzeit auf. Was fehlt: Runtime-Validierung " +
      "mit Zod, Valibot oder einem aehnlichen Schema-Validator, der die tatsaechliche " +
      "API-Antwort gegen den erwarteten Typ prueft.",
    keyPoints: [
      "HttpClient.get<T>() ist ein Compilezeit-Cast, keine Laufzeit-Pruefung",
      "Die API kann beliebige Daten liefern — TypeScript sieht sie nicht",
      "Schema-Aenderungen der API brechen den Code erst zur Laufzeit",
      "Loesung: Runtime-Validierung mit Zod/Valibot (L32)",
    ],
  },
];
