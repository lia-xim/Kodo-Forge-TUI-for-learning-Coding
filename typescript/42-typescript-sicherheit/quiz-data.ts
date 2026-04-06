/**
 * Lektion 42 — Quiz-Daten: TypeScript Sicherheit
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 *
 * correct-Index-Verteilung: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "42";
export const lessonTitle = "TypeScript Sicherheit";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Type Erasure und Sicherheit (correct: 0) ---
  {
    question:
      "Warum kann TypeScript einen Angriff wie den event-stream Supply-Chain-Hack von 2018 nicht verhindern?",
    options: [
      "TypeScript prueft nur zur Compile-Zeit — der Schadcode lief zur Laufzeit mit korrekten Typ-Signaturen",
      "TypeScript unterstuetzt kein Dependency-Scanning — dafuer braucht man npm audit",
      "Der Angriff nutzte JavaScript-Klassen die TypeScript nicht kennt",
      "TypeScript haette es verhindert wenn strictMode aktiviert gewesen waere",
    ],
    correct: 0,
    explanation:
      "Der event-stream-Angriff versteckte Schadcode in verschluesselten Daten " +
      "mit korrekten Typsignaturen. TypeScript prueft nur die Compile-Zeit-Struktur — " +
      "die Semantik (was der Code wirklich tut) bleibt unsichtbar.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript ist ein Compile-Zeit-Werkzeug. Wenn Typen korrekt sind " +
        "und der Code syntaktisch passt, gibt TypeScript gruen — egal was " +
        "der Code zur Laufzeit tatsaechlich macht. Sicherheit ist ein Laufzeit-Konzept.",
      commonMistake:
        "Viele glauben, 'strict: true' oder strengere Compiler-Optionen wuerden " +
        "Sicherheitsprobleme loesen. Aber strictMode prueft Typen, nicht Absichten.",
    },
  },

  // --- Frage 2: Type Guard Mechanismus (correct: 1) ---
  {
    question:
      "Was bewirkt das Type Predicate `value is User` in einer Funktion?",
    code:
      "function isUser(value: unknown): value is User {\n" +
      "  return typeof value === 'object' && value !== null\n" +
      "    && typeof (value as any).id === 'string';\n" +
      "}",
    options: [
      "Es wirft einen Fehler wenn value kein User ist",
      "TypeScript verengt den Typ von value zu User wenn die Funktion true zurueckgibt",
      "Es konvertiert value automatisch zum User-Typ",
      "Es ist nur eine Dokumentations-Annotation ohne Auswirkung auf TypeScript",
    ],
    correct: 1,
    explanation:
      "Ein Type Predicate verbindet Laufzeit-Pruefung mit Compile-Zeit-Wissen. " +
      "Wenn isUser(x) true ist, weiss TypeScript im if-Zweig: x ist User. " +
      "Das ist Narrowing durch eine benutzerdefinierte Funktion.",
    elaboratedFeedback: {
      whyCorrect:
        "Das Type Predicate (`value is User`) teilt dem Compiler mit: " +
        "'Wenn ich true zurueckgebe, ist der Typ User.' " +
        "TypeScript nutzt das fuer Control-Flow-Narrowing im aufrufenden Code.",
      commonMistake:
        "Viele glauben, das Type Predicate wuerde automatisch einen Cast durchfuehren " +
        "oder eine Exception werfen. Beides ist falsch — es ist reine Typ-Information " +
        "fuer den Compiler. Was passiert, liegt komplett in der Laufzeit-Logik der Funktion.",
    },
  },

  // --- Frage 3: Parse vs. Validate (correct: 2) ---
  {
    question:
      "Was ist der Hauptunterschied zwischen dem 'Validate'-Ansatz (boolean) und dem 'Parse'-Ansatz (T | Fehler)?",
    options: [
      "Parse ist schneller weil es keinen boolean erzeugt",
      "Validate ist sicherer weil es explizit true/false kommuniziert",
      "Beim Validate-Ansatz ist das Wissen 'gueltig' vom Objekt getrennt — es kann verloren gehen",
      "Parse und Validate sind funktional identisch, nur die Benennung unterscheidet sich",
    ],
    correct: 2,
    explanation:
      "Eine `isValid(x): boolean`-Funktion erzeugt ein getrenntes Wissen ('gueltig'). " +
      "Dieses Wissen ist nach dem if-Block verloren — du musst trotzdem casten. " +
      "Eine Parse-Funktion `parseX(x): X` verkoerpert das Wissen im Typ selbst.",
    elaboratedFeedback: {
      whyCorrect:
        "Alexis Kings Kernargument: Nach `if (isValid(x)) { const v = x as T }` " +
        "haelt TypeScript das Wissen nicht. Der Cast ist nach wie vor noetig. " +
        "Eine Parse-Funktion gibt entweder T oder Fehler zurueck — kein Zwischenzustand.",
      commonMistake:
        "Viele denken, isValid + as Cast sei gleichwertig zu parseT(). " +
        "Der Unterschied: Bei validate ist as separat und kann vergessen werden. " +
        "Bei parse ist der Typ das Ergebnis — es kann nicht 'vergessen' werden.",
    },
  },

  // --- Frage 4: Prototype Pollution (correct: 3) ---
  {
    question:
      "Warum ist `Object.assign({}, defaults, userInput)` bei unvalidiertem userInput gefaehrlich?",
    options: [
      "Weil Object.assign tiefer als eine Ebene kopiert und dabei Typen verliert",
      "Weil defaults ueberschrieben werden koennen wenn userInput gleiche Keys hat",
      "Weil TypeScript Object.assign nicht typsicher behandeln kann",
      "Weil userInput ein __proto__-Key enthalten koennte, der Object.prototype vergiftet",
    ],
    correct: 3,
    explanation:
      "Prototype Pollution: Wenn userInput `{ '__proto__': { isAdmin: true } }` enthaelt, " +
      "wird Object.prototype.isAdmin = true gesetzt. Danach haben ALLE Objekte " +
      "in der App isAdmin: true. TypeScript sieht das nicht — es ist ein Laufzeit-Effekt.",
    elaboratedFeedback: {
      whyCorrect:
        "Object.assign kopiert enumerable Properties — einschliesslich __proto__. " +
        "In manchen JavaScript-Engines setzt ein __proto__-Property den Prototyp des Ziels. " +
        "Object.create(null) als Ziel-Basis verhindert das: kein Prototyp, kein Ziel.",
      commonMistake:
        "Viele denken, defaults wuerde den Inhalt von userInput 'schuetzen'. " +
        "Aber Object.assign merged nacheinander — userInput kommt nach defaults " +
        "und kann alles ueberschreiben, inklusive Prototyp-Properties.",
    },
  },

  // --- Frage 5: JSON.parse Sicherheit (correct: 0) ---
  {
    question:
      "Welche zwei Probleme hat `JSON.parse(localStorage.getItem('config') || '{}') as AppConfig`?",
    options: [
      "JSON.parse kann eine SyntaxError-Exception werfen, und 'as AppConfig' prueft die Struktur nicht",
      "localStorage.getItem gibt null zurueck, und JSON.parse akzeptiert kein null",
      "as AppConfig macht den Wert readonly, und spaetera Aenderungen schlagen fehl",
      "JSON.parse ist asynchron und das as-Cast wartet nicht auf das Ergebnis",
    ],
    correct: 0,
    explanation:
      "Problem 1: Wenn localStorage einen ungueltigen JSON-String enthaelt (z.B. nach Korrumpierung), " +
      "wirft JSON.parse eine SyntaxError-Exception — ungefangen. " +
      "Problem 2: 'as AppConfig' ist ein Versprechen, keine Pruefung — die Struktur wird nie geprueft.",
    elaboratedFeedback: {
      whyCorrect:
        "JSON.parse wirft bei ungueltigem JSON — das ist dokumentiertes Verhalten. " +
        "Der '|| {}'-Fallback schuetzt nur gegen null/undefined, nicht gegen " +
        "korrumpierten JSON-String. Das as-Cast sagt dem Compiler 'ich weiss es besser' — " +
        "aber pruefen tut es nichts.",
      commonMistake:
        "Viele denken, der `|| '{}'`-Fallback sei ausreichende Fehlerbehandlung. " +
        "Er schuetzt gegen fehlenden Key (null), aber nicht gegen kaputten Wert (String " +
        "der kein gueltiger JSON ist, z.B. nach einem abgebrochenen Schreib-Vorgang).",
    },
  },

  // --- Frage 6: DomSanitizer (correct: 1) ---
  {
    question:
      "Wann ist `DomSanitizer.bypassSecurityTrustHtml()` in Angular legitim?",
    options: [
      "Immer, wenn der HTML-Inhalt von einer vertrauenswuerdigen API kommt",
      "Wenn der Inhalt von eigenem Code erzeugt wurde (z.B. eigener Markdown-Renderer)",
      "Immer, wenn man DomSanitizer.sanitize() vorher aufgerufen hat — bypass ist dann der zweite Schritt",
      "Wenn der Benutzer ein Admin ist und daher als vertrauenswuerdig gilt",
    ],
    correct: 1,
    explanation:
      "bypassSecurityTrustHtml() ist legitim wenn DU den Inhalt kontrollierst: " +
      "eigener Renderer, statische Strings, dein eigener Server-seitig gereinigter HTML. " +
      "Es ist NIE legitim mit direkter Nutzereingabe — auch nicht nach sanitize().",
    elaboratedFeedback: {
      whyCorrect:
        "Der Bypass deaktiviert Angulars XSS-Schutz. Das ist nur sicher wenn " +
        "du als Entwickler weisst, dass der Inhalt kein schaedliches HTML enthaelt — " +
        "weil du ihn selbst erzeugt hast. API-Antworten gelten nicht als 'vertrauenswuerdig' " +
        "in diesem Sinne, da APIs kompromittiert werden koennen.",
      commonMistake:
        "Haeufiger Fehler: sanitize() aufrufen, dann bypass() aufrufen und denken " +
        "'jetzt ist es sicher'. sanitize() ist der Schutz — bypass() danach ist " +
        "sinnlos (sanitize hat schon bereinigt) aber auch harmlos. " +
        "Das Problem ist bypass() OHNE vorheriges sanitize() bei Nutzereingaben.",
    },
  },

  // --- Frage 7: Non-null Assertion Risiko (correct: 2) ---
  {
    question:
      "Was ist das Problem mit dieser Angular-Implementierung?",
    code:
      "ngOnInit(): void {\n" +
      "  const ctx = this.canvas!.nativeElement.getContext('2d')!;\n" +
      "  ctx.fillRect(0, 0, 100, 100);\n" +
      "}",
    options: [
      "canvas muss als public deklariert sein um in ngOnInit zugaenglich zu sein",
      "getContext('2d') sollte '2d' als Konstante deklariert haben",
      "@ViewChild ist in ngOnInit noch nicht initialisiert — this.canvas ist undefined",
      "fillRect akzeptiert keine number-Parameter in TypeScript",
    ],
    correct: 2,
    explanation:
      "@ViewChild wird von Angular in ngAfterViewInit initialisiert, nicht in ngOnInit. " +
      "Das ! (Non-null Assertion) verhindert den Compile-Fehler — nicht den Runtime-Crash. " +
      "Ergebnis: TypeError: Cannot read properties of undefined.",
    elaboratedFeedback: {
      whyCorrect:
        "Angular's Component-Lifecycle: ngOnInit laeuft vor dem ersten Render, " +
        "ngAfterViewInit laeuft nach dem Rendern der View (inklusive @ViewChild). " +
        "Das ! verspricht dem Compiler, canvas sei nicht null — ein falsches Versprechen " +
        "das zur Laufzeit explodiert.",
      commonMistake:
        "Das ! wirkt wie eine Loesung — kein rotes Unterstreichen mehr. " +
        "Aber es verschiebt nur den Fehler. Richtige Loesung: Code in ngAfterViewInit " +
        "verschieben, oder canvas?.nativeElement?.getContext('2d') mit null-Check.",
    },
  },

  // --- Frage 8: "Parse at the boundary" (correct: 3) ---
  {
    question:
      "Wo sollte laut 'Parse at the boundary'-Prinzip die Runtime-Validierung stattfinden?",
    options: [
      "In jeder Funktion die das Datenobjekt verwendet — maximale Sicherheit",
      "Nur in Unit-Tests die spezifisch Validierung testen",
      "Tief im Domaenen-Code — dort wo der Wert tatsaechlich benutzt wird",
      "Direkt am Systemrand: API-Calls, localStorage, URL-Parameter — einmal, dann vertrauen",
    ],
    correct: 3,
    explanation:
      "Parse einmal an der Systemgrenze. Danach tragt der Typ selbst die Garantie. " +
      "Wenn du tief im Domaenen-Code erneut validierst, hast du entweder die " +
      "Grenze falsch gesetzt oder dem einmaligen Parsen nicht vertraut.",
    elaboratedFeedback: {
      whyCorrect:
        "Die Grenze (boundary) ist der Uebergang zwischen aussen (unsicher) und " +
        "innen (dein System). Dort wird gecheckt. Danach sind alle Typen bewiesen — " +
        "kein erneuter Check noetig. Mehrfaches Validieren ist Misstrauen gegenueber " +
        "dem eigenen Code, keine Sicherheit.",
      commonMistake:
        "Defensive Programming wird manchmal missverstanden als 'ueberal validieren'. " +
        "Das Gegenteil ist richtig: Validiere einmal gruendlich. Danach: Typ ist Beweis.",
    },
  },

  // ─── Short-Answer Fragen ──────────────────────────────────────────────────

  // --- Frage 9: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst das Prinzip aus dem Blogpost von Alexis King (2019), das besagt: " +
      "Transformiere unsichere Eingaben direkt in typisierte Werte statt sie spaeter zu pruefen?",
    expectedAnswer: "Parse, don't validate",
    acceptableAnswers: [
      "Parse, don't validate",
      "Parse dont validate",
      "parse don't validate",
      "Parse statt Validate",
      "parse not validate",
    ],
    explanation:
      "'Parse, don't validate' (Alexis King, 2019) beschreibt das Designprinzip, " +
      "Eingaben direkt in typisierte Werte zu transformieren statt boolean-Wahrheitswerte " +
      "getrennt vom Objekt zu verwalten. Das Ergebnis des Parsens ist entweder der Typ " +
      "oder ein Fehler — kein drittes 'irgendwie validiert'.",
  },

  // --- Frage 10: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welchen Typ gibt `JSON.parse()` in TypeScript zurueck? " +
      "(Antworte mit dem TypeScript-Typnamen)",
    expectedAnswer: "any",
    acceptableAnswers: ["any"],
    explanation:
      "JSON.parse() gibt `any` zurueck — bewusst, weil TypeScript zur Compile-Zeit " +
      "nicht wissen kann, was das JSON enthaelt. Das ist ein Signal: " +
      "Direkt nach JSON.parse() braucht es eine Runtime-Validierung.",
  },

  // --- Frage 11: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie nennt man den Angriff bei dem durch `{ '__proto__': { isAdmin: true } }` " +
      "alle Objekte in einer JavaScript-App eine unerwartete Property erhalten?",
    expectedAnswer: "Prototype Pollution",
    acceptableAnswers: [
      "Prototype Pollution",
      "prototype pollution",
      "Prototyp-Vergiftung",
      "Prototypenvergiftung",
    ],
    explanation:
      "Prototype Pollution nutzt JavaScripts Prototyp-Kette: " +
      "Wenn __proto__ als normales Property zugewiesen wird, " +
      "setzt das in manchen Engines den Prototyp des Zielobjekts. " +
      "Object.prototype wird 'vergiftet' — alle nachfolgend erzeugten " +
      "Objekte erben die schaedliche Property.",
  },

  // --- Frage 12: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welche ESLint-Regel verhindert, dass `any` explizit in Typen und Parametern geschrieben wird? " +
      "Antworte mit dem vollstaendigen Regelnamen.",
    expectedAnswer: "@typescript-eslint/no-explicit-any",
    acceptableAnswers: [
      "@typescript-eslint/no-explicit-any",
      "no-explicit-any",
      "@typescript-eslint/no-explicit-any: error",
    ],
    explanation:
      "'@typescript-eslint/no-explicit-any' verhindert explizites `any` in Typ-Annotationen. " +
      "Kombiniert mit 'no-unsafe-assignment' und 'no-unsafe-member-access' " +
      "bilden diese drei Regeln ein effektives Sicherheitsnetz gegen any-Ausbreitung.",
  },

  // ─── Predict-Output Fragen ────────────────────────────────────────────────

  // --- Frage 13: Predict-Output ---
  {
    type: "predict-output",
    question:
      "Was gibt dieser Code aus? Tippe die Ausgabe oder 'ERROR' wenn er wirft.",
    code:
      "function isProduct(v: unknown): v is { name: string; price: number } {\n" +
      "  if (typeof v !== 'object' || v === null) return false;\n" +
      "  const x = v as Record<string, unknown>;\n" +
      "  return typeof x['name'] === 'string' && typeof x['price'] === 'number';\n" +
      "}\n\n" +
      "const raw: unknown = { name: 'Laptop', preis: 999 };\n" +
      "if (isProduct(raw)) {\n" +
      "  console.log('Gueltig: ' + raw.name);\n" +
      "} else {\n" +
      "  console.log('Ungueltig');\n" +
      "}",
    expectedAnswer: "Ungueltig",
    acceptableAnswers: ["Ungueltig", "ungueltig"],
    explanation:
      "Das Objekt hat 'preis' (deutsch) statt 'price' (englisch). " +
      "isProduct prueft `x['price']` — das ist undefined, kein number. " +
      "Deshalb gibt isProduct false zurueck und der else-Zweig wird ausgefuehrt. " +
      "Das ist genau der Punkt: Der Type Guard faengt den Feldname-Unterschied sofort ab.",
  },

  // --- Frage 14: Predict-Output ---
  {
    type: "predict-output",
    question:
      "Was gibt `result.ok` aus?",
    code:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n\n" +
      "function parsePositiveNumber(v: unknown): Result<number, string> {\n" +
      "  if (typeof v !== 'number') return { ok: false, error: 'Kein number' };\n" +
      "  if (v <= 0) return { ok: false, error: 'Muss positiv sein' };\n" +
      "  return { ok: true, value: v };\n" +
      "}\n\n" +
      "const result = parsePositiveNumber(-5);\n" +
      "console.log(result.ok);",
    expectedAnswer: "false",
    acceptableAnswers: ["false"],
    explanation:
      "-5 ist eine number (erster Check besteht), aber nicht positiv (v <= 0 ist true). " +
      "Die Funktion gibt { ok: false, error: 'Muss positiv sein' } zurueck. " +
      "result.ok ist false.",
  },

  // --- Frage 15: Predict-Output ---
  {
    type: "predict-output",
    question:
      "Was passiert wenn dieser Code ausgefuehrt wird? " +
      "Tippe 'keine Ausgabe', 'true', 'false', oder 'ERROR'.",
    code:
      "const harmlos = {};\n" +
      "const boeseEingabe = JSON.parse('{\"__proto__\": {\"vergiftet\": true}}');\n" +
      "Object.assign(harmlos, boeseEingabe);\n" +
      "const neuesObjekt = {};\n" +
      "console.log((neuesObjekt as any).vergiftet);",
    expectedAnswer: "true",
    acceptableAnswers: ["true"],
    explanation:
      "Prototype Pollution in Aktion: Object.assign kopiert __proto__ aus boeseEingabe. " +
      "Das setzt den Prototyp von harmlos (und in manchen Engines: Object.prototype). " +
      "neuesObjekt erbt von Object.prototype — und bekommt vergiftet: true. " +
      "TypeScript hat keinen einzigen Fehler gemeldet.",
  },

  // ─── Explain-Why Fragen ───────────────────────────────────────────────────

  // --- Frage 16: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Warum ist `const user = data as User` gefaehrlich, aber am Ende einer " +
      "vollstaendigen `parseUser()`-Funktion akzeptabel? " +
      "Erklaere den entscheidenden Unterschied.",
    modelAnswer:
      "Ohne vorherige Pruefung ist 'as User' eine Behauptung: Der Compiler " +
      "vertraut dir blind, ohne dass irgendetwas ueberprueft wurde. Wenn data " +
      "tatsaechlich kein User ist, erhaeltst du einen stillen Fehler: TypeScript " +
      "denkt es ist ein User, aber zur Laufzeit fehlen Properties oder haben " +
      "falsche Typen. Am Ende von parseUser() hingegen hast du alle Properties " +
      "einzeln geprueft: id ist string, name ist string, email enthaelt '@'. " +
      "Das 'as' widerspiegelt eine bewiesene Tatsache, nicht eine Hoffnung. " +
      "Das Prinzip: 'as' ist sicher wenn du die Invariante direkt davor bewiesen hast.",
    keyPoints: [
      "'as' ohne Pruefung: Behauptung ohne Beweis",
      "'as' nach Pruefung: Formalisierung eines Beweises",
      "TypeScript kann den Unterschied nicht sehen — die Verantwortung liegt beim Entwickler",
      "Type Guard (value is T) ist die sauberste Alternative die das 'as' intern versteckt",
      "Das Risiko ohne Pruefung: stille Laufzeitfehler statt Compile-Zeit-Fehler",
    ],
  },
];
