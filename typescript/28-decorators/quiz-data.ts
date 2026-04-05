// quiz-data.ts — L28: Decorators (Legacy & Stage 3)
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "28";
export const lessonTitle = "Decorators";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- correct: 0 ---
  {
    question: "Was ist ein Decorator in TypeScript?",
    options: [
      "Eine Funktion die eine Klasse, Methode oder Property transformiert oder annotiert",
      "Ein spezieller TypeScript-Typ der nur zur Compilezeit existiert",
      "Ein CSS-aehnliches Styling-System fuer TypeScript-Klassen",
      "Ein Build-Tool das TypeScript in JavaScript konvertiert",
    ],
    correct: 0,
    explanation:
      "Ein Decorator ist eine regulaere Funktion die mit @name vor einer Deklaration steht. " +
      "Sie kann das Verhalten aendern, Metadaten hinzufuegen oder den Wert komplett ersetzen.",
    elaboratedFeedback: {
      whyCorrect: "Decorators sind syntaktischer Zucker fuer Higher-Order Functions. @log ueber einer Methode ist dasselbe wie log(methode) — nur lesbarer und deklarativer.",
      commonMistake: "Manche denken, Decorators seien ein reines TypeScript-Feature. Stage 3 Decorators sind ein TC39-Proposal — sie kommen in JavaScript selbst."
    }
  },

  {
    question: "Was ist der Unterschied zwischen @Decorator und @Decorator()?",
    options: [
      "@Decorator wendet die Funktion direkt an, @Decorator() ruft eine Factory auf die den Decorator zurueckgibt",
      "@Decorator ist fuer Klassen, @Decorator() ist fuer Methoden",
      "@Decorator() ist die Legacy-Syntax, @Decorator die Stage-3-Syntax",
      "Es gibt keinen Unterschied — beide sind identisch",
    ],
    correct: 0,
    explanation:
      "@Decorator = die Funktion selbst wird als Decorator verwendet. " +
      "@Decorator() = eine Factory-Funktion wird aufgerufen, die den eigentlichen Decorator " +
      "zurueckgibt. Klammern = Decorator Factory mit Parametern.",
    elaboratedFeedback: {
      whyCorrect: "@Sealed → Sealed ist der Decorator. @Component({...}) → Component({...}) gibt den Decorator zurueck. Der Unterschied: fn vs fn() — die Funktion selbst vs. ein Aufruf.",
      commonMistake: "Viele vergessen die Klammern bei Decorator Factories und schreiben @Component statt @Component({...}). Das fuehrt zu kryptischen Fehlern."
    }
  },

  {
    question: "In welcher Reihenfolge werden gestapelte Decorators angewandt?",
    options: [
      "Bottom-up: Der naechste zum Code wird zuerst angewandt",
      "Top-down: Der oberste wird zuerst angewandt",
      "Alphabetisch nach Decorator-Name",
      "Zufaellig — die Reihenfolge ist nicht garantiert",
    ],
    correct: 0,
    explanation:
      "Decorators werden bottom-up angewandt: @First @Second class X → Second wird " +
      "zuerst angewandt, dann First. Bei Factories: Evaluierung top-down, Anwendung bottom-up.",
    elaboratedFeedback: {
      whyCorrect: "Man kann sich das wie Funktionskomposition vorstellen: First(Second(class)). Die innerste Funktion (Second, naechste zum Code) wird zuerst angewandt.",
      commonMistake: "Die doppelte Regel bei Factories ist verwirrend: Factory-Evaluierung (top-down) vs. Decorator-Anwendung (bottom-up). Die Evaluierung sammelt die Decorators, die Anwendung wendet sie an."
    }
  },

  {
    question: "Warum koennen Parameter Decorators den Parameterwert NICHT aendern?",
    options: [
      "Parameter Decorators laufen VOR dem Funktionsaufruf — der Wert existiert noch nicht",
      "TypeScript verbietet Wertaenderungen in Decorators generell",
      "Parameter Decorators existieren nur in Stage 3",
      "Parameter sind unveraenderbar in JavaScript",
    ],
    correct: 0,
    explanation:
      "Parameter Decorators werden bei der Klassen-Definition ausgefuehrt, nicht beim " +
      "Funktionsaufruf. Sie koennen nur Metadaten UEBER den Parameter speichern — " +
      "der Wert wird erst beim Aufruf bestimmt.",
    elaboratedFeedback: {
      whyCorrect: "Parameter Decorators laufen einmal bei Klassen-Definition. Der Parameterwert existiert erst beim Methodenaufruf. Deshalb: nur Metadaten speichern (Position, Name, Token), kein Wert-Zugriff.",
      commonMistake: "Manche erwarten, dass @Param('id') den Wert extrahiert. Nein — der Decorator MARKIERT den Parameter. Das Framework (NestJS) liest spaeter die Markierung und injiziert den Wert."
    }
  },

  // --- correct: 1 ---
  {
    question: "Was macht emitDecoratorMetadata in tsconfig.json?",
    options: [
      "Es aktiviert Stage 3 Decorators",
      "Es emittiert Typ-Information als Laufzeit-Metadaten (Reflect.metadata)",
      "Es generiert .d.ts-Dateien fuer Decorators",
      "Es deaktiviert Type Erasure fuer dekorierte Klassen",
    ],
    correct: 1,
    explanation:
      "emitDecoratorMetadata generiert Reflect.metadata()-Aufrufe die Typ-Information " +
      "(Konstruktor-Parameter-Typen, Property-Typen) als Laufzeit-Werte speichern. " +
      "Angular's DI nutzt das um zu wissen welche Services injiziert werden muessen.",
    elaboratedFeedback: {
      whyCorrect: "emitDecoratorMetadata ist eine Ausnahme von Type Erasure: TypeScript generiert Code der Typ-Information als Laufzeit-Werte speichert. __metadata('design:paramtypes', [HttpClient, Logger]) — Angular liest das.",
      commonMistake: "Manche denken, emitDecoratorMetadata bewahrt ALLE Typen. Nein — nur Klassen-basierte Typen. Interfaces werden zu Object (da sie zur Laufzeit nicht existieren)."
    }
  },

  {
    question: "Welches Feature hat Stage 3 das Legacy Decorators NICHT haben?",
    options: [
      "Parameter Decorators",
      "Auto-Accessor ('accessor' Keyword) und context.addInitializer()",
      "Methoden Decorators",
      "Class Decorators mit Parametern",
    ],
    correct: 1,
    explanation:
      "Stage 3 bringt 'accessor' (Auto-Getter/Setter) und context.addInitializer() " +
      "(Initialisierungscode ohne Konstruktor-Wrapping). Legacy hat dafuer Parameter " +
      "Decorators und emitDecoratorMetadata — die Stage 3 nicht hat.",
    elaboratedFeedback: {
      whyCorrect: "'accessor name: string' erzeugt automatisch get/set. Accessor Decorators koennen dann get/set anpassen. addInitializer() registriert Code der bei Instanzierung laeuft. Beides gab es bei Legacy nicht.",
      commonMistake: "Manche denken Stage 3 sei eine Obermenge von Legacy. Nein — Stage 3 hat Features die Legacy nicht hat (accessor, addInitializer), aber auch Features die fehlen (Parameter Decorators, emitDecoratorMetadata)."
    }
  },

  {
    question: "Was speichert Angular's @Component() Decorator?",
    options: [
      "Den kompilierten JavaScript-Code der Komponente",
      "Metadaten (selector, template, styles) die der Angular-Compiler liest",
      "Eine Referenz auf die DOM-Elemente der Komponente",
      "Die Change-Detection-Strategie als Laufzeit-Flag",
    ],
    correct: 1,
    explanation:
      "@Component() ist ein Decorator Factory die Metadaten an die Klasse heftet. " +
      "Der Angular-Compiler (ngc) liest diese Metadaten und generiert den " +
      "Rendering-Code, Change-Detection-Code und DI-Setup.",
    elaboratedFeedback: {
      whyCorrect: "@Component({ selector: 'app-root', template: '...' }) speichert diese Konfiguration als Metadaten. Der Angular-Compiler transformiert die Klasse basierend auf diesen Metadaten in optimierten Code.",
      commonMistake: "Manche denken @Component() generiert direkt DOM-Elemente. Nein — es speichert nur Metadaten. Die eigentliche Code-Generierung passiert durch den Angular-Compiler, nicht durch den Decorator selbst."
    }
  },

  {
    question: "Welcher Legacy Method Decorator-Parameter enthaelt die Methode selbst?",
    options: [
      "target (erster Parameter)",
      "descriptor.value (im dritten Parameter)",
      "propertyKey (zweiter Parameter)",
      "this (implizit)",
    ],
    correct: 1,
    explanation:
      "Legacy: target = Prototyp, propertyKey = Methodenname, descriptor.value = die Methode. " +
      "Man aendert descriptor.value um die Methode zu wrappen. Stage 3: target IST die Methode.",
    elaboratedFeedback: {
      whyCorrect: "PropertyDescriptor hat: value (die Methode), writable, enumerable, configurable. Man speichert descriptor.value in einer Variable, ersetzt es durch eine Wrapper-Funktion, und ruft das Original darin auf.",
      commonMistake: "Viele verwechseln target (Prototyp) mit der Methode. In Legacy ist target der Prototyp der Klasse — NICHT die Methode! Die Methode steckt in descriptor.value."
    }
  },

  // --- correct: 2 ---
  {
    question: "Was ist die Angular-empfohlene Alternative zu @Input() ab Angular 17.1+?",
    options: [
      "@Prop() aus Vue",
      "this.inputs.get('name')",
      "input<string>() — Signal-basierte Inputs (Stage-3-kompatibel)",
      "constructor(private name: string) mit DI",
    ],
    correct: 2,
    explanation:
      "Angular 17.1+ empfiehlt input<T>() als Signal-basierte Alternative zu @Input(). " +
      "Vorteile: Kein Decorator noetig, Stage-3-kompatibel, reactive (Signal).",
    elaboratedFeedback: {
      whyCorrect: "name = input<string>('') ersetzt @Input() name = ''. input() gibt ein Signal zurueck (reactive), braucht keinen Decorator, und ist kompatibel mit Stage 3 Decorators.",
      commonMistake: "Manche denken, @Input() sei deprecated. Es funktioniert weiterhin, aber input() ist die empfohlene Zukunft. Migration ist optional aber empfohlen."
    }
  },

  {
    question: "Was ist Aspektorientierte Programmierung (AOP)?",
    options: [
      "Ein Programmierparadigma fuer asynchronen Code",
      "Die Trennung von Business-Logik und UI-Code",
      "Cross-Cutting Concerns (Logging, Caching, Auth) deklarativ an beliebige Methoden anhaengen",
      "Ein Design Pattern fuer Microservices",
    ],
    correct: 2,
    explanation:
      "AOP trennt Querschnittsbelange (Logging, Sicherheit, Caching) vom Kerncode. " +
      "Decorators implementieren AOP: @log, @cache, @retry koennen an jede Methode " +
      "angeheftet werden ohne den Methodencode zu aendern.",
    elaboratedFeedback: {
      whyCorrect: "Logging ist ein typischer Cross-Cutting Concern: Jede Methode koennte Logging brauchen, aber Logging hat nichts mit der Business-Logik zu tun. Ein @log Decorator trennt beides sauber.",
      commonMistake: "Manche verwechseln AOP mit OOP. AOP ergaenzt OOP — es loest das Problem von Code der quer durch viele Klassen verstreut ist (Logging in jeder Methode, Auth in jedem Controller)."
    }
  },

  {
    question: "Warum gibt es in Stage 3 KEINE Parameter Decorators?",
    options: [
      "JavaScript unterstuetzt keine Funktionsparameter",
      "Parameter Decorators wurden durch Proxy-Objekte ersetzt",
      "TC39 entschied: Zu komplex, Alternativen wie inject() sind einfacher",
      "Stage 3 unterstuetzt nur Class Decorators",
    ],
    correct: 2,
    explanation:
      "TC39 entschied, Parameter Decorators wegen Komplexitaet und limitiertem Nutzen " +
      "(koennen nur Metadaten speichern) nicht in Stage 3 aufzunehmen. " +
      "Alternativen wie Angular's inject() loesen das DI-Problem ohne Parameter Decorators.",
    elaboratedFeedback: {
      whyCorrect: "Parameter Decorators koennen den Wert nicht aendern — nur Metadaten speichern. emitDecoratorMetadata (noetig fuer DI) koppelt Typsystem an Laufzeit — kontrovers. inject() ist eine einfachere, universellere Loesung.",
      commonMistake: "Manche denken, Angular werde ohne Parameter Decorators nicht funktionieren. Angular's inject()-Funktion ersetzt Konstruktor-DI bereits vollstaendig — kein Parameter Decorator noetig."
    }
  },

  {
    question: "Welches tsconfig-Flag aktiviert Legacy Decorators?",
    options: [
      "decorators: true",
      "useDecorators: 'legacy'",
      "experimentalDecorators: true",
      "enableDecorators: true",
    ],
    correct: 2,
    explanation:
      "'experimentalDecorators: true' aktiviert Legacy Decorators. Ohne dieses Flag " +
      "und mit target >= ES2022 sind Stage 3 Decorators aktiv. Angular/NestJS setzen " +
      "experimentalDecorators standardmaessig auf true.",
    elaboratedFeedback: {
      whyCorrect: "Das Flag heisst 'experimental' weil Legacy Decorators nie ueber Stage 2 hinauskamen. Stage 3 ist der offizielle Standard — Legacy bleibt 'experimentell'.",
      commonMistake: "Manche setzen experimentalDecorators auf true fuer neue Projekte. Fuer neue Projekte ohne Angular/NestJS: Stage 3 (kein Flag noetig) ist die bessere Wahl."
    }
  },

  // --- correct: 3 ---
  {
    question: "Was ist ein Anti-Pattern bei der Decorator-Nutzung?",
    options: [
      "Decorators fuer Logging und Caching verwenden",
      "Decorator Factories mit Parametern nutzen",
      "Mehrere Decorators auf eine Methode stapeln",
      "Business-Logik oder globalen State in Decorators implementieren",
    ],
    correct: 3,
    explanation:
      "Decorators sollten kurz, deklarativ und seiteneffektfrei sein. Business-Logik " +
      "gehoert in Services, globaler State in State Management. Decorators sind fuer " +
      "Cross-Cutting Concerns: Logging, Caching, Auth, Validierung.",
    elaboratedFeedback: {
      whyCorrect: "Ein Decorator mit 200 Zeilen Business-Logik ist schwer zu testen, debuggen und verstehen. Decorators sollten eine Sache tun: wrappen, annotieren oder validieren. Alles andere gehoert in separate Module.",
      commonMistake: "Manche packen komplexe Transformationen in Decorators weil es 'elegant' aussieht. Das fuehrt zu versteckter Logik die schwer nachzuvollziehen ist — das Gegenteil von Eleganz."
    }
  },

  {
    question: "Wie funktioniert Angular's Dependency Injection intern?",
    options: [
      "Angular analysiert den Quellcode zur Laufzeit mit eval()",
      "Angular nutzt Template-Metadaten fuer DI",
      "Angular liest Parameter-Namen aus dem JavaScript-Code",
      "emitDecoratorMetadata liefert Konstruktor-Parameter-Typen, Angular's DI liest sie",
    ],
    correct: 3,
    explanation:
      "emitDecoratorMetadata generiert Reflect.metadata('design:paramtypes', [...]) — " +
      "Angular liest diese Metadaten und weiss welche Services injiziert werden muessen. " +
      "Fuer primitive Typen oder Tokens braucht man @Inject().",
    elaboratedFeedback: {
      whyCorrect: "constructor(private http: HttpClient) → emitDecoratorMetadata → Reflect.metadata('design:paramtypes', [HttpClient]). Angular's Injector liest das und liefert die HttpClient-Instanz. Elegant aber an ein experimentelles Feature gebunden.",
      commonMistake: "Manche denken Angular parsed den TypeScript-Quellcode. Nein — zur Laufzeit gibt es keinen TypeScript-Code. Die Typ-Information wird von emitDecoratorMetadata als JavaScript-Werte gespeichert."
    }
  },

  {
    question: "Was ist NestJS's SetMetadata()-Helfer?",
    options: [
      "Ein Typ-Utility fuer generische Metadaten",
      "Ein ORM-Feature fuer Datenbank-Metadaten",
      "Ein interner Compiler-Mechanismus",
      "Ein Decorator-Helfer der Metadaten an Klassen/Methoden heftet fuer Guards und Interceptors",
    ],
    correct: 3,
    explanation:
      "SetMetadata('key', value) erzeugt einen Decorator der Metadaten speichert. " +
      "Guards und Interceptors lesen die Metadaten mit Reflector.get(). " +
      "Das ist die Basis fuer @Roles(), @Public() und aehnliche Custom Decorators.",
    elaboratedFeedback: {
      whyCorrect: "const Roles = (...roles: string[]) => SetMetadata('roles', roles). Dann: @Roles('admin'). Im Guard: reflector.get('roles', handler). So trennt NestJS Deklaration (Decorator) von Pruefung (Guard).",
      commonMistake: "Manche schreiben die Guard-Logik direkt in den Decorator. Besser: Decorator setzt nur Metadaten, Guard liest und prueft. Separation of Concerns."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Welches tsconfig-Flag aktiviert Legacy Decorators in TypeScript?",
    expectedAnswer: "experimentalDecorators",
    acceptableAnswers: ["experimentalDecorators", "experimentalDecorators: true", "\"experimentalDecorators\": true"],
    explanation:
      "'experimentalDecorators: true' aktiviert die Legacy-Decorator-Spezifikation. " +
      "Ohne dieses Flag sind ab TypeScript 5.0 Stage 3 Decorators aktiv.",
  },

  {
    type: "short-answer",
    question: "In welcher Reihenfolge werden gestapelte Decorators angewandt? (top-down oder bottom-up)",
    expectedAnswer: "bottom-up",
    acceptableAnswers: ["bottom-up", "bottom up", "von unten nach oben"],
    explanation:
      "Decorators werden bottom-up angewandt: Der naechste zum Code wird zuerst " +
      "ausgefuehrt. Bei @A @B class X: B wird zuerst angewandt, dann A. " +
      "Wie Funktionskomposition: A(B(X)).",
  },

  {
    type: "short-answer",
    question: "Wie heisst Angular's neue Alternative zu @Input() ab Angular 17.1+?",
    expectedAnswer: "input()",
    acceptableAnswers: ["input()", "input", "input<T>()"],
    explanation:
      "input<T>() gibt ein Signal zurueck und braucht keinen Decorator. " +
      "Es ist Stage-3-kompatibel und die empfohlene Zukunft fuer Angular-Inputs.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "In welcher Reihenfolge erscheinen die Logs?",
    code:
      "function A(c: Function) { console.log('A angewandt'); }\n" +
      "function B(c: Function) { console.log('B angewandt'); }\n\n" +
      "@A\n@B\nclass MyClass {}",
    expectedAnswer: "B angewandt, A angewandt",
    acceptableAnswers: [
      "B angewandt, A angewandt",
      "B angewandt\nA angewandt",
      "B, A",
    ],
    explanation:
      "Bottom-up Reihenfolge: @B ist naeher am Code → wird zuerst angewandt. " +
      "Dann @A. Ausgabe: 'B angewandt', dann 'A angewandt'.",
  },

  {
    type: "predict-output",
    question: "Was gibt dieser Code aus wenn calc.add(2, 3) aufgerufen wird?",
    code:
      "function Log(t: any, k: string, d: PropertyDescriptor) {\n" +
      "  const orig = d.value;\n" +
      "  d.value = function(...args: any[]) {\n" +
      "    console.log(`${k} called`);\n" +
      "    return orig.apply(this, args);\n" +
      "  };\n" +
      "  return d;\n" +
      "}\n\n" +
      "class Calc {\n" +
      "  @Log add(a: number, b: number) { return a + b; }\n" +
      "}\n\n" +
      "new Calc().add(2, 3);",
    expectedAnswer: "add called",
    acceptableAnswers: ["add called", "'add called'", "\"add called\""],
    explanation:
      "Der @Log Decorator wrapped add() mit einer Funktion die 'add called' loggt " +
      "bevor die Original-Methode aufgerufen wird. Die Methode gibt 5 zurueck, " +
      "aber nur der Log wird ausgegeben.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist emitDecoratorMetadata eine 'Ausnahme' von TypeScript's Type Erasure, " +
      "und warum ist das kontrovers?",
    modelAnswer:
      "TypeScript's Grundprinzip ist Type Erasure: Alle Typen werden beim Kompilieren entfernt. " +
      "emitDecoratorMetadata bricht dieses Prinzip — es generiert Laufzeit-Code (Reflect.metadata) " +
      "der Typ-Information als Werte speichert. Das ist kontrovers weil: 1. Es koppelt das " +
      "Typsystem an die Laufzeit. 2. Interfaces werden zu 'Object' (da sie zur Laufzeit nicht " +
      "existieren). 3. Es funktioniert nur mit Klassen, nicht mit Type Aliases. 4. Es haengt " +
      "an einer experimentellen Polyfill (reflect-metadata). Stage 3 hat es bewusst nicht uebernommen.",
    keyPoints: [
      "Type Erasure: Typen verschwinden beim Kompilieren — emitDecoratorMetadata ist die Ausnahme",
      "Generiert Reflect.metadata() — speichert Typen als Laufzeit-WERTE",
      "Interfaces werden zu Object (existieren nicht zur Laufzeit)",
      "Kontrovers: Koppelt Typ-System an Laufzeit, abhaengig von reflect-metadata Polyfill",
    ],
  },
];
