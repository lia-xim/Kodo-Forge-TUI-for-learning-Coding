/**
 * Lektion 01 — Quiz-Daten: Setup & Erste Schritte
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "01";
export const lessonTitle = "Setup & Erste Schritte";

export const questions: QuizQuestion[] = [
  // -----------------------------------------------------------
  // Frage 1: Was erzeugt der TypeScript-Compiler?
  // -----------------------------------------------------------
  {
    question: "Was erzeugt der TypeScript-Compiler (tsc) als Ausgabe?",
    options: [
      "Maschinencode, der direkt vom Prozessor ausgefuehrt wird",
      "Bytecode fuer die Node.js Virtual Machine",
      "JavaScript-Code, in dem alle Typ-Annotationen entfernt wurden",
      "Eine ausfuehrbare .exe-Datei",
    ],
    correct: 2,
    explanation:
      "TypeScript ist ein Transpiler: Er uebersetzt TypeScript in JavaScript. " +
      "Alle Typ-Annotationen, Interfaces und andere TypeScript-spezifische " +
      "Konstrukte werden dabei komplett entfernt (Type Erasure). Das Ergebnis " +
      "ist normaler JavaScript-Code, der in jeder JS-Umgebung laeuft.",
  },

  // -----------------------------------------------------------
  // Frage 2: Type Erasure -- Tiefes Verstaendnis
  // -----------------------------------------------------------
  {
    question:
      "Du hast diesen Code:\n" +
      "  interface Logger { log(msg: string): void; }\n" +
      "  class ConsoleLogger implements Logger {\n" +
      "    log(msg: string) { console.log(msg); }\n" +
      "  }\n" +
      "  const x = new ConsoleLogger();\n\n" +
      "Welche dieser Pruefungen funktioniert zur Laufzeit?",
    options: [
      "x instanceof Logger",
      "x instanceof ConsoleLogger",
      "typeof x === 'Logger'",
      "Keine davon funktioniert",
    ],
    correct: 1,
    explanation:
      "'x instanceof ConsoleLogger' funktioniert, weil Klassen zur Laufzeit " +
      "existieren (sie sind JavaScript-Features). 'x instanceof Logger' " +
      "funktioniert NICHT, weil Logger ein Interface ist und zur Laufzeit " +
      "nicht existiert. 'typeof x' gibt 'object' zurueck, nicht 'Logger' -- " +
      "JavaScript kennt nur primitive typeof-Ergebnisse.",
  },

  // -----------------------------------------------------------
  // Frage 3: Compiler-Pipeline
  // -----------------------------------------------------------
  {
    question: "In welcher Reihenfolge arbeitet der TypeScript-Compiler?",
    options: [
      "Type Checking --> Parsing --> Emit",
      "Parsing --> Emit --> Type Checking",
      "Parsing --> Type Checking --> Emit",
      "Emit --> Type Checking --> Parsing",
    ],
    correct: 2,
    explanation:
      "Zuerst wird der Quellcode in einen Abstract Syntax Tree (AST) geparst. " +
      "Dann durchlaeuft der Type Checker den AST und prueft die Typen. " +
      "Zum Schluss erzeugt der Emitter den JavaScript-Output. Wichtig: " +
      "Type Checking und Emit sind unabhaengig -- der Emit kann auch bei " +
      "Typ-Fehlern stattfinden.",
  },

  // -----------------------------------------------------------
  // Frage 4: Denkfrage -- Compiler-Verhalten bei Fehlern
  // -----------------------------------------------------------
  {
    question:
      "TypeScript erzeugt standardmaessig JavaScript, auch wenn Typ-Fehler " +
      "vorhanden sind. Was ist der TIEFERE Grund dafuer?",
    options: [
      "Es ist ein Bug im Compiler, der nie behoben wurde",
      "Weil Typen das Laufzeitverhalten nicht beeinflussen -- Type Checking " +
        "und Code-Erzeugung sind konzeptionell unabhaengig",
      "Damit Anfaenger leichter starten koennen",
      "Weil JavaScript keine Typen unterstuetzt",
    ],
    correct: 1,
    explanation:
      "Das ist kein Bug, sondern eine fundamentale Designentscheidung. " +
      "Da TypeScript-Typen zur Laufzeit nicht existieren (Type Erasure), " +
      "haben Typ-Fehler keinen Einfluss auf den erzeugten JavaScript-Code. " +
      "Der JavaScript-Output ist mit oder ohne Typ-Fehler identisch. " +
      "Wenn du dieses Verhalten nicht willst, setze 'noEmitOnError: true'.",
  },

  // -----------------------------------------------------------
  // Frage 5: Laufzeit-Szenario
  // -----------------------------------------------------------
  {
    question:
      "Du hast eine Funktion 'function add(a: number, b: number): number'. " +
      "Jemand ruft sie zur Laufzeit mit add('hello', 'world') auf " +
      "(z.B. durch ungepruefte API-Daten). Was passiert?",
    options: [
      "Ein Laufzeitfehler: 'TypeError: string is not a number'",
      "TypeScript verhindert den Aufruf automatisch",
      "Die Funktion gibt NaN zurueck",
      "Die Funktion gibt 'helloworld' zurueck (String-Verkettung)",
    ],
    correct: 3,
    explanation:
      "Zur Laufzeit existieren keine TypeScript-Typen! Die Funktion " +
      "ist einfach 'function add(a, b) { return a + b; }'. JavaScript " +
      "verwendet den +-Operator, und bei zwei Strings macht er " +
      "String-Verkettung: 'hello' + 'world' = 'helloworld'. TypeScript " +
      "haette den Fehler zur Compile-Zeit gemeldet, aber zur Laufzeit " +
      "greift kein Schutz. Das ist warum Validierung fuer externe Daten " +
      "(API-Responses, User-Input) trotzdem noetig ist!",
  },

  // -----------------------------------------------------------
  // Frage 6: tsconfig -- strict
  // -----------------------------------------------------------
  {
    question:
      "Warum empfehlen alle TypeScript-Experten 'strict: true'? " +
      "Was ist der wichtigste Einzelgrund?",
    options: [
      "Es macht den Code schneller",
      "Es aktiviert strictNullChecks, was null/undefined-Fehler findet -- " +
        "die haeufigste Fehlerquelle in JavaScript",
      "Es verhindert die Nutzung von var statt const",
      "Es erzwingt, dass alle Variablen einen Typ haben",
    ],
    correct: 1,
    explanation:
      "Obwohl strict: true viele Pruefungen aktiviert, ist strictNullChecks " +
      "die wertvollste Einzeloption. Ohne sie kann JEDE Variable null oder " +
      "undefined sein, ohne dass TypeScript warnt. 'Cannot read property " +
      "of undefined' ist der haeufigste JavaScript-Fehler ueberhaupt. " +
      "strictNullChecks zwingt dich, null-Faelle explizit zu behandeln.",
  },

  // -----------------------------------------------------------
  // Frage 7: Werkzeuge
  // -----------------------------------------------------------
  {
    question:
      "Du arbeitest an einem Next.js-Projekt. Welches Tool fuehrt " +
      "die TypeScript-Kompilierung durch?",
    options: [
      "tsc kompiliert den gesamten Code",
      "tsx fuehrt den Code direkt aus",
      "SWC entfernt die Typen; tsc laeuft separat nur fuer Type Checking",
      "esbuild kompiliert und prueft gleichzeitig",
    ],
    correct: 2,
    explanation:
      "Next.js nutzt SWC (einen in Rust geschriebenen Compiler) fuer " +
      "die eigentliche Kompilierung. SWC ist extrem schnell, fuehrt " +
      "aber KEIN Type Checking durch -- es entfernt nur die TypeScript-Syntax. " +
      "tsc laeuft separat (via 'tsc --noEmit' oder im Editor) nur fuer " +
      "die Typenpruefung. Das ist der gleiche Ansatz wie bei tsx/esbuild.",
  },

  // -----------------------------------------------------------
  // Frage 8: Denkfrage -- Source Maps
  // -----------------------------------------------------------
  {
    question:
      "Warum braucht man Source Maps, obwohl man TypeScript schreibt " +
      "und nicht JavaScript?",
    options: [
      "Source Maps machen den Code schneller",
      "Weil der Browser/Node.js JavaScript ausfuehrt, nicht TypeScript. " +
        "Ohne Source Maps zeigen Fehlermeldungen auf Zeilen in .js-Dateien, " +
        "die du nie geschrieben hast",
      "Source Maps sind nur fuer Legacy-Browser noetig",
      "Ohne Source Maps funktioniert TypeScript nicht",
    ],
    correct: 1,
    explanation:
      "Zur Laufzeit wird JavaScript ausgefuehrt, nicht TypeScript. Wenn " +
      "ein Fehler in Zeile 47 von user.js auftritt, musst du herausfinden, " +
      "welche Zeile in user.ts das ist. Source Maps loesen genau dieses " +
      "Problem: Sie ordnen jede Zeile im .js-Output der entsprechenden " +
      "Zeile im .ts-Quellcode zu. Browser DevTools und Node.js nutzen " +
      "diese Information automatisch.",
  },

  // -----------------------------------------------------------
  // Frage 9: Denkfrage -- Type Assertion
  // -----------------------------------------------------------
  {
    question:
      "Was ist der Unterschied zwischen 'as string' (Type Assertion) " +
      "und String() (Konvertierung)?",
    options: [
      "Kein Unterschied -- beides konvertiert den Wert zu einem String",
      "'as string' ist schneller als String()",
      "'as string' existiert nur zur Compile-Zeit und aendert den Wert " +
        "nicht; String() ist eine echte Laufzeit-Konvertierung",
      "'as string' ist sicherer als String()",
    ],
    correct: 2,
    explanation:
      "'as string' ist eine Type Assertion -- sie sagt dem Compiler " +
      "'vertrau mir, das ist ein String', aendert aber den Wert zur " +
      "Laufzeit NICHT. Wenn der Wert kein String ist, crasht der Code. " +
      "String() ist eine JavaScript-Funktion, die den Wert tatsaechlich " +
      "in einen String konvertiert. Type Assertions sind ein haeufiger " +
      "Stolperstein: Sie fliegen bei Type Erasure raus und bieten " +
      "KEINEN Laufzeitschutz.",
  },

  // -----------------------------------------------------------
  // Frage 10: Praxis-Szenario -- tsconfig
  // -----------------------------------------------------------
  {
    question:
      "Du setzt 'target: \"ES5\"' in der tsconfig.json. " +
      "Dein Code nutzt Array.prototype.flat() (ES2019). " +
      "Was passiert?",
    options: [
      "TypeScript meldet einen Fehler: flat() existiert nicht in ES5",
      "TypeScript wandelt flat() in ES5-kompatiblen Code um",
      "Der Code kompiliert ohne Fehler, aber crasht zur Laufzeit " +
        "in aelteren Umgebungen, die flat() nicht haben",
      "TypeScript fuegt automatisch ein Polyfill fuer flat() hinzu",
    ],
    correct: 0,
    explanation:
      "Mit target: ES5 kennt TypeScript nur die APIs, die in ES5 " +
      "verfuegbar sind. Array.flat() (ES2019) ist nicht dabei, also " +
      "meldet der Compiler einen Fehler. Das target bestimmt, welche " +
      "lib-Deklarationen geladen werden. Loesung: target hoeher setzen, " +
      "oder 'lib: [\"ES2019\"]' explizit angeben. WICHTIG: TypeScript " +
      "wandelt SYNTAX um (const -> var, => -> function), aber nicht APIS. " +
      "Polyfills sind nicht TypeScripts Job.",
  },

  // -----------------------------------------------------------
  // Frage 11: Declaration Files
  // -----------------------------------------------------------
  {
    question:
      "Wofuer braucht man .d.ts-Dateien (Declaration Files)?",
    options: [
      "Sie machen den Code schneller",
      "Sie liefern Typ-Informationen fuer JavaScript-Libraries, " +
        "damit TypeScript-Nutzer Autocomplete und Type Checking bekommen",
      "Sie sind die kompilierten Versionen von .ts-Dateien",
      "Sie werden nur fuer interne Projekte gebraucht",
    ],
    correct: 1,
    explanation:
      ".d.ts-Dateien enthalten NUR Typ-Informationen -- keinen " +
      "ausfuehrbaren Code. Sie dienen als 'Schnittstellen-Beschreibung' " +
      "fuer JavaScript-Libraries. Deshalb gibt es @types/react und " +
      "@types/node: React und Node.js sind in JS geschrieben, aber " +
      "die .d.ts-Dateien liefern die Typen nach. Wenn du selbst eine " +
      "Library schreibst, erzeugst du .d.ts-Dateien mit 'declaration: true'.",
  },

  // -----------------------------------------------------------
  // Frage 12: Gesamtverstaendnis
  // -----------------------------------------------------------
  {
    question:
      "Ein Kollege sagt: 'TypeScript fuegt Laufzeit-Typenpruefungen " +
      "hinzu, deshalb ist unser Code sicherer.' Was antwortest du?",
    options: [
      "Stimmt genau!",
      "Stimmt teilweise -- nur bei Enums und Klassen",
      "Falsch. TypeScript prueft Typen NUR zur Compile-Zeit. Zur Laufzeit " +
        "ist alles pures JavaScript ohne Typenpruefungen. Der Code ist " +
        "trotzdem sicherer, weil Fehler VOR dem Ausfuehren gefunden werden",
      "Falsch. TypeScript macht den Code weder sicherer noch unsicherer",
    ],
    correct: 2,
    explanation:
      "Das ist das haeufigste Missverstaendnis ueber TypeScript! " +
      "TypeScript fuegt KEINE Laufzeit-Pruefungen hinzu. Alle Typen " +
      "werden bei der Kompilierung entfernt (Type Erasure). Der Code " +
      "ist trotzdem sicherer, weil der Compiler Fehler VOR der " +
      "Ausfuehrung findet -- aehnlich wie eine Rechtschreibpruefung " +
      "Fehler findet, bevor der Text abgeschickt wird. Aber zur " +
      "Laufzeit ist kein Sicherheitsnetz mehr da.",
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Zusaetzliche Erklaerungen fuer jede Frage: Warum die richtige Antwort
// richtig ist und welche Fehlkonzeption am haeufigsten vorkommt.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "TypeScript ist ein Transpiler: Er uebersetzt TypeScript-Code in JavaScript-Code. " +
      "Dabei werden alle Typ-Annotationen, Interfaces und andere TS-spezifische Konstrukte " +
      "komplett entfernt (Type Erasure). Das Ergebnis ist normaler JavaScript-Code.",
    commonMistake:
      "Viele denken, TypeScript erzeugt Maschinencode oder Bytecode, aehnlich wie Java oder C#. " +
      "In Wahrheit ist TypeScript 'nur' ein Typ-Layer ueber JavaScript — der Output ist immer JS.",
  },
  1: {
    whyCorrect:
      "`x instanceof ConsoleLogger` funktioniert, weil Klassen zur Laufzeit existieren — " +
      "sie sind echte JavaScript-Features mit einer prototype-Kette. Interfaces dagegen " +
      "sind reine Compile-Zeit-Konstrukte und verschwinden bei Type Erasure komplett.",
    commonMistake:
      "Der haeufigste Fehler ist `x instanceof Logger` zu schreiben. " +
      "In Sprachen wie Java funktioniert das, weil Interfaces zur Laufzeit existieren. " +
      "In TypeScript nicht — Interfaces sind KEINE JavaScript-Werte.",
  },
  2: {
    whyCorrect:
      "Die Compiler-Pipeline ist: Parsing (Quellcode → AST), dann Type Checking " +
      "(AST analysieren und Typen pruefen), dann Emit (AST → JavaScript). " +
      "Der Emitter kann ohne Type Checker laufen — deshalb funktioniert der Output auch bei Fehlern.",
    commonMistake:
      "Viele nehmen an, Type Checking kommt vor dem Parsing. Aber der Compiler " +
      "muss den Code zuerst verstehen (parsen), bevor er Typen pruefen kann.",
  },
  3: {
    whyCorrect:
      "Da TypeScript-Typen zur Laufzeit nicht existieren (Type Erasure), haben Typ-Fehler " +
      "keinen Einfluss auf den erzeugten JavaScript-Code. Der JS-Output ist mit oder ohne " +
      "Typ-Fehler identisch. Type Checking und Code-Erzeugung sind konzeptionell unabhaengig.",
    commonMistake:
      "Der Reflex ist zu denken 'Fehler = kein Output'. In den meisten Compilern stimmt das, " +
      "aber TypeScript trennt bewusst Pruefung und Ausgabe. `noEmitOnError: true` aendert das.",
  },
  4: {
    whyCorrect:
      "Zur Laufzeit ist die Funktion `function add(a, b) { return a + b; }`. " +
      "JavaScript's +-Operator macht bei zwei Strings String-Verkettung: " +
      "'hello' + 'world' = 'helloworld'. TypeScript haette den Fehler zur Compile-Zeit gemeldet, " +
      "aber zur Laufzeit greift kein Schutz.",
    commonMistake:
      "Viele erwarten einen TypeError oder NaN. Aber JavaScript's + ist polymorph: " +
      "Bei Strings verkettet er, bei Numbers addiert er. Kein Laufzeitfehler!",
  },
  5: {
    whyCorrect:
      "`strictNullChecks` ist die wertvollste Einzeloption: Ohne sie kann JEDE Variable " +
      "null oder undefined sein, ohne dass TypeScript warnt. 'Cannot read property of undefined' " +
      "ist der haeufigste JavaScript-Fehler ueberhaupt.",
    commonMistake:
      "Viele denken, `strict: true` erzwingt Typ-Annotationen ueberall. " +
      "Es aktiviert mehrere Pruefungen, aber der wichtigste Einzeleffekt ist strictNullChecks.",
  },
  6: {
    whyCorrect:
      "Next.js nutzt SWC fuer die Kompilierung (schnell, aber kein Type Checking). " +
      "`tsc` laeuft separat mit `--noEmit` nur fuer Typenpruefung. " +
      "Dieses Prinzip (schneller Compiler + separates Type Checking) ist weit verbreitet.",
    commonMistake:
      "Der haeufigste Irrtum: `tsc` macht alles. In modernen Projekten trennt man " +
      "Kompilierung (SWC/esbuild/swc) und Type Checking (tsc) fuer bessere Performance.",
  },
  7: {
    whyCorrect:
      "Zur Laufzeit wird JavaScript ausgefuehrt. Wenn ein Fehler in Zeile 47 von user.js " +
      "auftritt, zeigt die Source Map auf die entsprechende Zeile in user.ts. " +
      "Browser-DevTools und Node.js nutzen diese Zuordnung automatisch.",
    commonMistake:
      "Manche denken, Source Maps machen den Code schneller oder sind nur fuer alte Browser. " +
      "Sie sind ein reines Debugging-Werkzeug, das TS-Zeilen den JS-Zeilen zuordnet.",
  },
  8: {
    whyCorrect:
      "`as string` ist eine Type Assertion, die NUR dem Compiler sagt 'vertrau mir'. " +
      "Sie wird bei der Kompilierung entfernt und aendert den Wert NICHT. " +
      "`String()` ist eine echte JavaScript-Funktion, die den Wert konvertiert.",
    commonMistake:
      "Der Reflex aus anderen Sprachen: 'Casting konvertiert den Wert'. " +
      "In TypeScript ist ein Cast (Type Assertion) keine Konvertierung, " +
      "sondern eine Compile-Zeit-Anweisung die zur Laufzeit nicht existiert.",
  },
  9: {
    whyCorrect:
      "Mit target: ES5 laedt TypeScript nur die ES5-Lib-Deklarationen. " +
      "Array.flat() (ES2019) ist darin nicht enthalten, also meldet der Compiler einen Fehler. " +
      "TypeScript wandelt SYNTAX um (const → var), aber nicht APIS — Polyfills sind nicht TS' Job.",
    commonMistake:
      "Viele erwarten, dass TypeScript Polyfills hinzufuegt. " +
      "TypeScript ist kein Polyfill-System — es wandelt nur Syntax um. " +
      "Fuer fehlende APIs braucht man core-js oder andere Polyfill-Libraries.",
  },
  10: {
    whyCorrect:
      ".d.ts-Dateien enthalten NUR Typ-Informationen — keinen ausfuehrbaren Code. " +
      "Sie dienen als 'Schnittstellen-Beschreibung' fuer JavaScript-Libraries. " +
      "@types/react liefert Typen fuer das in JS geschriebene React nach.",
    commonMistake:
      "Der haeufigste Irrtum: .d.ts-Dateien sind die kompilierten Versionen von .ts-Dateien. " +
      "Sie sind das Gegenteil: Sie enthalten NUR die Typen, der Code ist entfernt.",
  },
  11: {
    whyCorrect:
      "TypeScript prueft Typen NUR zur Compile-Zeit. Alle Typen werden bei der Kompilierung " +
      "entfernt (Type Erasure). Der Code ist trotzdem sicherer, weil Fehler VOR dem " +
      "Ausfuehren gefunden werden — aber es gibt keinen Laufzeitschutz.",
    commonMistake:
      "Das haeufigste Missverstaendnis ueber TypeScript! Viele glauben, TS fuegt " +
      "automatische Laufzeit-Pruefungen hinzu. In Wahrheit ist zur Laufzeit " +
      "alles pures JavaScript ohne jegliche Typenpruefung.",
  },
};
