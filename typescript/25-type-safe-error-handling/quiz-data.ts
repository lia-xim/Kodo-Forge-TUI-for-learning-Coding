// quiz-data.ts — L25: Type-safe Error Handling
// 15 Fragen, correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  elaboratedFeedback: { whyCorrect: string; commonMistake: string };
}

export const lessonId = "25";
export const lessonTitle = "Type-safe Error Handling";

export const questions: QuizQuestion[] = [
  // correct: 0 (1-4)
  {
    id: 1,
    question: "Was ist das Hauptproblem mit `function parseUser(): User` wenn die Funktion werfen kann?",
    options: [
      "Der Rückgabetyp 'lügt' — er verspricht User, kann aber gar nichts zurückgeben",
      "TypeScript kompiliert solche Funktionen grundsätzlich nicht",
      "throw funktioniert nicht in Funktionen mit explizitem Rückgabetyp",
      "User-Typen können keine Fehler repräsentieren"
    ],
    correct: 0,
    explanation: "Der Typ `User` verspricht: immer ein User. throw = gar nichts. Das ist eine Lüge im Typsystem die der Caller nicht sehen kann.",
    elaboratedFeedback: {
      whyCorrect: "Der Rückgabetyp ist ein Versprechen an den Caller. `User` → 'Ich gebe immer einen User zurück'. Wenn die Funktion werfen kann, hält sie dieses Versprechen nicht — manchmal gibt sie gar nichts zurück. TypeScript prüft das nicht.",
      commonMistake: "Viele denken, TypeScript würde sie schützen wenn sie try/catch vergessen. Nein — ohne Checked Exceptions gibt es keinen Compiler-Schutz. Der Fehler zeigt sich erst zur Laufzeit."
    }
  },
  {
    id: 2,
    question: "Was ist der 'Discriminant' in einem Result-Discriminated-Union?",
    options: [
      "Das `ok`-Property mit dem Literal-Typ `true` oder `false` — ermöglicht TypeScript-Narrowing",
      "Die Methode `.isOk()` die den Typ zur Laufzeit prüft",
      "Der Typ-Parameter `T` in `Result<T, E>`",
      "Das optionale `error`-Property das nur bei Fehler gesetzt ist"
    ],
    correct: 0,
    explanation: "Der Discriminant ist `ok: true | false` als Literal-Typ. Im `if(result.ok)` Branch narrowt TypeScript auf `{ ok: true; value: T }` — TypeScript weiß value existiert.",
    elaboratedFeedback: {
      whyCorrect: "Discriminated Unions brauchen ein gemeinsames Property mit Literal-Werten. `ok: true` und `ok: false` sind Literals (nicht `boolean`!). TypeScript nutzt diese Literals für Narrowing: Im `if(result.ok)` Zweig → TypeScript weiß `ok` ist ausschließlich `true`.",
      commonMistake: "Häufiger Fehler: `{ ok: boolean, value: T }` statt `{ ok: true, value: T }`. Boolean ist zu breit für Narrowing — TypeScript kann nicht wissen ob ok true oder false ist ohne `as const`."
    }
  },
  {
    id: 3,
    question: "Warum braucht man `ok: true as const` und nicht einfach `ok: true`?",
    options: [
      "Ohne `as const` inferiert TypeScript `ok: boolean` statt `ok: true` — kein Narrowing möglich",
      "`as const` ist in TypeScript 5.0 Pflicht für alle boolean Properties",
      "`true` ist kein gültiger Literal-Typ in TypeScript — nur `as const` macht es gültig",
      "Ohne `as const` würde der Wert zur Laufzeit zu `false` konvertiert"
    ],
    correct: 0,
    explanation: "TypeScript inferiert `{ ok: true }` als `{ ok: boolean }` — zu breit für Narrowing. `as const` (oder Helper-Funktion) erzwingt den Literal-Typ `true`.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript widened Literal-Typen standardmäßig. `{ ok: true }` → `{ ok: boolean }`. Das ist gut für Flexibilität, aber schlecht für Discriminated Unions. `as const` ('constant assertion') verhindert Widening: `ok: true as const` → Typ ist `true` (Literal), nicht `boolean`.",
      commonMistake: "Viele schreiben Helper-Funktionen richtig (`ok: true as const`) aber dann vergessen es im direkten Objekt-Literal. Empfehlung: Immer Helper-Funktionen `ok()` und `err()` verwenden, nie direkte Objekte."
    }
  },
  {
    id: 4,
    question: "Was macht `function assertNever(x: never): never`?",
    options: [
      "Erzwingt exhaustive Behandlung: wenn x nicht 'never' ist, gibt es einen Compile-Error",
      "Deaktiviert TypeScript-Typprüfung für den Parameter x",
      "Wirft einen Laufzeitfehler wenn x undefined ist",
      "Konvertiert x in einen anderen Typ zur Laufzeit"
    ],
    correct: 0,
    explanation: "`never` Parameter: Nur ein Wert vom Typ `never` darf übergeben werden. Wenn alle Union-Varianten behandelt wurden, ist der Rest-Typ `never`. Wenn nicht → Compile-Error.",
    elaboratedFeedback: {
      whyCorrect: "Im `default`-Branch eines switch über `ApiError`: Wenn alle Cases behandelt, ist `error` unmöglich → Typ `never`. `assertNever(error)` ist OK. Wenn ein Case fehlt: `error` hat noch echten Typ → `never`-Parameter akzeptiert ihn nicht → COMPILE-ERROR. Das ist der Exhaustive-Check-Trick.",
      commonMistake: "Viele denken assertNever ist nur für Runtime-Sicherheit. Es ist primär ein Compile-Time-Check. Wenn der Code korrekt ist, wird assertNever nie aufgerufen — der Typ `never` garantiert das."
    }
  },

  // correct: 1 (5-8)
  {
    id: 5,
    question: "Was ist der Unterschied zwischen `Option<T>` und `Result<T, E>`?",
    options: [
      "Option enthält immer einen Fehlertyp; Result kann auch ohne Fehler sein",
      "Option = 'vielleicht ein Wert' (kein Fehler); Result = Operation die scheitern kann (mit Fehlerdetails)",
      "Option und Result sind identisch — nur unterschiedliche Namenskonventionen",
      "Option wird nur in React verwendet; Result in Angular"
    ],
    correct: 1,
    explanation: "Option (T|null) = normales Fehlen ohne Details. Result = Fehler der erklärt werden muss. Beispiel: findUser (Option) vs. createUser (Result mit Validierungsfehler).",
    elaboratedFeedback: {
      whyCorrect: "`Option<T>` = `T | null`. null bedeutet: kein Wert — das ist normal und braucht keine Erklärung. `Result<T, E>` enthält einen spezifischen Fehler-Typ E. Für findUser: null = 'nicht gefunden' (normal). Für createUser: Err = 'Validierung fehlgeschlagen' (braucht Details warum).",
      commonMistake: "Häufiger Fehler: `Result<User, null>` statt `User | null`. Result mit null als E macht keinen Sinn — dann lieber direkt `T | null`. Result lohnt sich nur wenn E wirklich Fehler-Information enthält."
    }
  },
  {
    id: 6,
    question: "Was gibt `strictNullChecks: true` einer TypeScript-Codebasis?",
    options: [
      "Verhindert dass null-Werte in TypeScript-Code verwendet werden",
      "Erzwingt explizite Behandlung von null/undefined — effektiv ein eingebautes Option-System",
      "Wandelt alle null-Werte automatisch in undefined um",
      "Ermöglicht nur primitive Typen null zuzuweisen"
    ],
    correct: 1,
    explanation: "strictNullChecks macht null und undefined zu eigenen Typen. `string` ≠ `string | null`. Damit muss jeder optionale Wert explizit behandelt werden — wie in Option-Typen.",
    elaboratedFeedback: {
      whyCorrect: "Ohne strictNullChecks: `string` enthält implizit `null | undefined`. Mit strictNullChecks: `string` ist NUR string. Um null zu erlauben: `string | null`. Das erzwingt explizite null-Prüfung überall — genau das was Option-Pattern bieten soll.",
      commonMistake: "Viele aktivieren strictNullChecks nicht wegen der 'vielen Compile-Fehler'. Das ist ein Fehler. strictNullChecks ist das wichtigste TypeScript-Setting — ohne es gibt es keinen Schutz vor null-Reference-Exceptions."
    }
  },
  {
    id: 7,
    question: "Was macht `satisfies Record<Status, string>` anders als `: Record<Status, string>`?",
    options: [
      "satisfies ist nur in React verfügbar; Record-Annotation für alle Frameworks",
      "satisfies prüft Vollständigkeit OHNE den Inferenz-Typ zu verbreitern — spezifische Typen bleiben erhalten",
      "satisfies ist veraltet (TypeScript 5.0+) und sollte nicht mehr verwendet werden",
      "satisfies erlaubt zusätzliche Keys die nicht in Status sind"
    ],
    correct: 1,
    explanation: "`satisfies` = Vollständigkeitsprüfung (alle Keys) + behält spezifische Typen. `: Record<Status, V>` = Vollständigkeitsprüfung aber verliert spezifische Typen (alles wird zu V).",
    elaboratedFeedback: {
      whyCorrect: "Mit `: Record<Status, string>` weiß TypeScript nur: alle Values sind `string`. Mit `satisfies Record<Status, string>`: TypeScript weiß alle Keys sind vorhanden PLUS behält die spezifischen String-Literal-Typen (z.B. `'NOT_FOUND'` statt nur `string`). Bestes aus beiden Welten.",
      commonMistake: "Manche denken satisfies ist nur syntaktischer Zucker. Nein — es ändert den Inferenz-Typ. Besonders wichtig für Lookup-Tabellen die nachher mit ihren spezifischen Typen weiterverarbeitet werden."
    }
  },
  {
    id: 8,
    question: "Für welche Situationen ist `throw` weiterhin die richtige Wahl?",
    options: [
      "Für alle Fehler — throw immer verwenden, Result ist Over-Engineering",
      "Für Initialisierungsfehler, Bugs/Invariant-Verletzungen, und als Wrapper für externe Systeme die werfen",
      "Niemals — Result<T, E> sollte in allen Fällen verwendet werden",
      "Nur in async-Funktionen — in synchronen immer Result verwenden"
    ],
    correct: 1,
    explanation: "throw = richtig für: Bugs (Division durch Null), Initialisierung (fehlende Env-Vars), unrecoverable states. Result = richtig für erwartete Fehler (Validierung, Netzwerk, nicht gefunden).",
    elaboratedFeedback: {
      whyCorrect: "Die Faustregel: 'Kann ein korrektes Programm in diese Situation kommen?' Nein → throw (es ist ein Bug). Ja → Result (es ist erwartbar). Netzwerkfehler? Erwartet → Result. Null-Pointer in internem Modul? Bug → throw.",
      commonMistake: "Result für absolut alles zu verwenden ist Over-Engineering. `JSON.parse` wirft — du wrappst es einmal in eine Result-Funktion. Intern nutzst du dann Result. Aber die innerste Ebene (JSON.parse selbst) darf werfen."
    }
  },

  // correct: 2 (9-12)
  {
    id: 9,
    question: "Was ist `mapResult<T, U, E>(result, fn): Result<U, E>`?",
    options: [
      "Eine Funktion die das Error-Objekt transformiert ohne T zu verändern",
      "Eine Funktion die TypeScript-Errors in JavaScript-Errors konvertiert",
      "Eine Funktion die bei Ok den Value transformiert; bei Err den Fehler unverändert durchleitet",
      "Ein TypeScript 5.0 eingebauter Operator ähnlich wie `.then()` bei Promises"
    ],
    correct: 2,
    explanation: "`mapResult` wendet `fn` auf `result.value` an wenn `result.ok === true`. Bei false → Fehler unverändert zurück. Wie `.then()` aber für Result statt Promise.",
    elaboratedFeedback: {
      whyCorrect: "mapResult ist analog zu Array.map() — über den Erfolgs-Wert. Bei Err: fn wird nicht aufgerufen, Fehler wird durchgeleitet. Das ermöglicht Chaining: `mapResult(parseEmail(raw), email => email.length)` — nur im Erfolgsfall wird length berechnet.",
      commonMistake: "flatMapResult vs mapResult: map → fn gibt U zurück. flatMap → fn gibt Result<U, E> zurück. Wenn fn selbst fehlschlagen kann (wieder ein Result zurückgibt), braucht man flatMap statt map."
    }
  },
  {
    id: 10,
    question: "Warum ist Error-Konvertierung zwischen Schichten (DB → Domain → HTTP) wichtig?",
    options: [
      "Weil TypeScript ohne Konvertierung Compile-Errors wirft",
      "Weil verschiedene Fehlertypen nicht in der selben Variable gespeichert werden können",
      "Um Entkopplung zu gewährleisten: jede Schicht spricht ihre eigene 'Sprache' ohne Implementierungsdetails zu leaken",
      "Weil JSON.stringify verschiedene Fehlertypen unterschiedlich serialisiert"
    ],
    correct: 2,
    explanation: "DB-Fehler (ORA-12345) gehören nicht in Business-Logik. Service-Fehler nicht in HTTP-Responses. Jede Schicht übersetzt: DB → Domain → HTTP. Entkopplung ermöglicht Technologiewechsel ohne Kaskadenfehler.",
    elaboratedFeedback: {
      whyCorrect: "Anti-Corruption Layer Prinzip: Der Service soll nicht wissen ob du PostgreSQL oder MySQL nutzt. Er kennt nur UserError (Domain-Sprache). Das Repository übersetzt DB-Fehlercodes zu Domain-Fehlern. Context-spezifisch und wartbar.",
      commonMistake: "Fehler direkt durchzuleiten ('throw dbError durch alle Schichten') führt dazu dass alle Schichten DB-Implementierungsdetails kennen müssen. Bei DB-Wechsel → Änderungen überall."
    }
  },
  {
    id: 11,
    question: "Was ist der Unterschied zwischen `null` und `undefined` in TypeScript?",
    options: [
      "Beide sind identisch — TypeScript behandelt sie gleich",
      "undefined ist ein Typ, null ist nur ein Wert (kein Typ)",
      "null = bewusst gesetzt 'kein Wert'; undefined = nicht initialisiert/fehlendes optionales Property",
      "null kann nur mit primitiven Typen kombiniert werden; undefined mit Objekt-Typen"
    ],
    correct: 2,
    explanation: "Konvention: null = explizit 'kein Wert' (bewusst). undefined = fehlend (nicht initialisiert, optionales Property fehlt). Array.find() gibt undefined → historisch (JS-Kompatibilität).",
    elaboratedFeedback: {
      whyCorrect: "In TypeScript: `null` ist ein semantisch besetzter Wert ('es gibt nichts hier'). `undefined` signalisiert eher 'das Ding existiert nicht' oder 'not yet assigned'. Für Option<T> ist null besser: es kommuniziert einen bewussten Zustand.",
      commonMistake: "Viele verwenden null und undefined austauschbar. Das führt zu inkonsistentem Code. Besser: Einige auf null als 'kein Wert', undefined für optionale Properties. `??` behandelt beide gleich (nullish coalescing)."
    }
  },
  {
    id: 12,
    question: "Was ist Haskell's `Either a b` und wie verhält es sich zu TypeScript's `Result<T, E>`?",
    options: [
      "Either ist Haskell's Fehler-Monad, Result ist das TypeScript-Äquivalent ohne Monaden-Eigenschaften",
      "Either und Result sind identisch — beide kommen aus funktionaler Programmierung",
      "Either ist der mathematische Ursprung (Left=Fehler, Right=Erfolg) dem TypeScript's Result<T,E> nachempfunden ist",
      "Either = binäre Wahl ohne Semantik; Result = immer mit ok/error Feldern und Typsicherheit"
    ],
    correct: 2,
    explanation: "Haskell's `Either a b` = Either Left(a) oder Right(b). Konvention: Left=Fehler, Right=Erfolg ('right'=richtig). TypeScript's Result<T,E> = semantisch gleich, aber mit ok/value/error statt Left/Right.",
    elaboratedFeedback: {
      whyCorrect: "'Either a b' in Haskell ist entweder `Left a` (Fehler) oder `Right b` (Erfolg). Die Konvention Left=Error, Right=Success kommt daher: 'right' = Richtig/Korrekt. TypeScript's `{ ok: true; value: T } | { ok: false; error: E }` ist die pragmatische TS-Version des gleichen Konzepts.",
      commonMistake: "Haskell's Either hat Monaden-Operationen (>>=, fmap) eingebaut. TypeScript hat die nicht nativ — man schreibt mapResult/flatMapResult selbst. Bibliotheken wie 'neverthrow' bieten diese als fluent API."
    }
  },

  // correct: 3 (13-15) — 3x3
  {
    id: 13,
    question: "Welche tsconfig-Option ist für `useUnknownInCatchVariables` zuständig?",
    options: [
      "`strict: true` macht es optional; separat muss `catchUnknown: true` gesetzt werden",
      "`noImplicitAny: true` ist genug um catch-Variablen zu typisieren",
      "`useUnknownInCatchVariables: true` ist ein separates Setting außerhalb von strict",
      "`useUnknownInCatchVariables` ist standardmäßig in `strict: true` enthalten (seit TS 4.4)"
    ],
    correct: 3,
    explanation: "Seit TypeScript 4.4 ist `useUnknownInCatchVariables: true` Teil von `strict: true`. catch-Variablen haben Typ `unknown` statt implizit `any`.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript 4.4 fügte `useUnknownInCatchVariables` als Teil des `strict`-Bundles hinzu. Zuvor war `e` in catch implizit `any`. Jetzt: `e: unknown` — du musst `instanceof Error` oder andere Type Guards verwenden bevor du auf Properties zugreifst.",
      commonMistake: "Manche denken sie brauchen es separat zu setzen. Mit `strict: true` läuft es automatisch — das ist das TypeScript-Empfehlung für alle neuen Projekte."
    }
  },
  {
    id: 14,
    question: "Warum ist `Record<ApiError, string>` ein exhaustiver Check?",
    options: [
      "Weil Record eine eingebaute Exhaustivitäts-Garantie in TypeScript hat",
      "Weil ApiError als string-Union alle Keys definiert die im Record vorkommen müssen",
      "Weil TypeScript automatisch Switch-Statements für Record-Types generiert",
      "Record<K, V> erzwingt dass ALLE Werte von K als Keys vorhanden sein müssen — fehlt einer → COMPILE-ERROR"
    ],
    correct: 3,
    explanation: "`Record<K, V>` definiert: Für JEDEN Wert von K muss ein Key mit Value V existieren. Ist ApiError = 'A' | 'B' | 'C', müssen alle drei vorhanden sein. Fehlt 'C' → COMPILE-ERROR.",
    elaboratedFeedback: {
      whyCorrect: "`Record<'A' | 'B' | 'C', string>` fordert: Das Objekt MUSS genau die Keys 'A', 'B', 'C' haben — alle drei. Fehlt einer → TypeScript-Fehler. Das macht Record-Maps zu natürlichem exhaustiven Check ohne switch+assertNever.",
      commonMistake: "Viele sehen Record nur als 'Map mit Typen'. Aber Record mit Union als Key-Typ ist auch ein Exhaustivitäts-Instrument. `satisfies Record<Union, V>` ist oft die eleganteste Lösung."
    }
  },
  {
    id: 15,
    question: "Was bringt der `flatMapResult`-Helfer gegenüber verschachtelten `if(result.ok)`-Blöcken?",
    options: [
      "flatMapResult ist schneller — weniger function calls zur Laufzeit",
      "flatMapResult macht Fehler-Informationen detaillierter",
      "Kein Unterschied — beides ist semantisch identisch",
      "Flache Kette statt Verschachtelung: Fehler aus jedem Schritt werden automatisch durchgeleitet"
    ],
    correct: 3,
    explanation: "flatMapResult ermöglicht `flatMap(parseA, a => flatMap(parseB(a), b => ...))` statt `if(a.ok) { if(b.ok) { ... } }`. Weniger Verschachtelung, besser lesbar.",
    elaboratedFeedback: {
      whyCorrect: "Ohne flatMap: Jedes Fehler-Check führt zu tieferer Einrückung. Mit flatMap: lineare Kette. `flatMapResult(parseEmail(raw), email => flatMapResult(validateDomain(email), domain => ok(domain.toUpperCase())))` — Fehler aus jedem Step propagiert automatisch.",
      commonMistake: "Manche verwenden map statt flatMap wenn die fn-Funktion wieder ein Result zurückgibt. Das führt zu `Result<Result<T, E>, E>` statt `Result<T, E>`. flatMap 'flacht' das verschachtelte Result ein."
    }
  }
];
