// quiz-data.ts — L40: Capstone Project
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3
// Fragen verbinden Konzepte aus L01-L39.

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "40";
export const lessonTitle = "Capstone Project";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Architektur — correct: 0 ---
  {
    question: "Was ist die 'Defensive Schale, offensiver Kern' Architektur?",
    options: [
      "An Systemgrenzen Runtime-validieren (unknown → typisiert), im Kern dem Typsystem vertrauen (keine Checks)",
      "Alles mit try/catch umwickeln",
      "Jeden Parameter in jeder Funktion validieren",
      "Nur in Tests defensive Typen verwenden",
    ],
    correct: 0,
    explanation:
      "Systemgrenzen (API, User-Input) empfangen unknown und validieren. " +
      "Im Kern sind Daten durch die Schale typisiert — keine redundanten Checks noetig.",
    elaboratedFeedback: {
      whyCorrect: "Die Schale ist der Uebergang von 'unvertrauenswuerdig' zu 'vertrauenswuerdig'. Der Kern vertraut — weil die Schale bewiesen hat dass die Daten korrekt sind.",
      commonMistake: "In jeder Funktion zu validieren ist paranoid und redundant. Die Typen SIND der Beweis — wenn userId: UserId ist, wurde es validiert (Smart Constructor)."
    }
  },

  // --- Frage 2: Domain Modeling — correct: 0 ---
  {
    question: "Warum sind Branded IDs (UserId, OrderId) besser als einfache strings?",
    options: [
      "Sie verhindern die Verwechslung von IDs verschiedener Entities zur Compilezeit",
      "Sie sind schneller zur Laufzeit",
      "Sie brauchen weniger Speicher",
      "Sie sind die einzige Moeglichkeit IDs in TypeScript zu verwenden",
    ],
    correct: 0,
    explanation:
      "function transfer(from: UserId, to: UserId) statt (from: string, to: string). " +
      "Vertauschung mit einer OrderId → Compile-Error statt Runtime-Bug.",
    elaboratedFeedback: {
      whyCorrect: "Branded Types fuegen einen unsichtbaren Brand hinzu: UserId ≠ OrderId, obwohl beides string ist. Das strukturelle Typsystem wuerde sie sonst als gleich behandeln.",
      commonMistake: "Zur Laufzeit SIND beide einfache Strings (Type Erasure). Der Schutz ist rein zur Compilezeit. Das reicht — denn die meisten Verwechslungen passieren beim Programmieren, nicht zur Laufzeit."
    }
  },

  // --- Frage 3: Money-Typ — correct: 0 ---
  {
    question: "Warum speichert man Geldbetraege als Cents (Integer) statt als Euro (Float)?",
    options: [
      "Floating-Point-Arithmetik hat Rundungsfehler — 19.99 * 0.19 ergibt NICHT exakt 3.80",
      "Integers sind schneller als Floats in JavaScript",
      "TypeScript unterstuetzt keine Float-Typen",
      "Das ist eine veraltete Konvention aus der COBOL-Zeit",
    ],
    correct: 0,
    explanation:
      "IEEE 754 Floating-Point kann 0.1 nicht exakt darstellen. " +
      "0.1 + 0.2 = 0.30000000000000004. Mit Cents (Integers) gibt es keine Rundungsfehler.",
    elaboratedFeedback: {
      whyCorrect: "1999 Cents * 0.19 → Math.round(379.81) = 380 Cents = 3.80 EUR. Exakt. 19.99 * 0.19 → 3.7981000000000003. Nicht exakt. Bei Millionen Transaktionen summieren sich die Fehler.",
      commonMistake: "Es ist keine veraltete Konvention — Stripe, PayPal und jede Bank-API verwenden Cents/Minor Units. Es ist die KORREKTE Darstellung fuer Geld in jedem Computer-System."
    }
  },

  // --- Frage 4: State Machine — correct: 0 ---
  {
    question: "Was verhindert die Transition Map im Order-Status?",
    options: [
      "Ungueltige Zustandsuebergaenge werden zu Compile-Fehlern — z.B. 'draft' direkt zu 'shipped'",
      "Performance-Probleme bei vielen Zustaenden",
      "Doppelte Event-Emittierung",
      "Memory Leaks bei zirkulaeren Uebergaengen",
    ],
    correct: 0,
    explanation:
      "Die Transition Map definiert fuer jeden Status die erlaubten Folgezustaende. " +
      "transitionOrder(draftOrder, 'shipped') → Compile-Error, nicht Runtime-Error.",
    elaboratedFeedback: {
      whyCorrect: "OrderTransitions['draft'] = 'pending' | 'cancelled'. 'shipped' ist nicht in dieser Union → Compile-Error. Der Bug wird VOR dem Ausfuehren gefunden.",
      commonMistake: "Ohne Transition Map koennte man jeden Status auf jeden anderen setzen. Das fuehrt zu ungueltigen Zustaenden: Eine unbezahlte Order wird als 'shipped' markiert."
    }
  },

  // --- Frage 5: Repository<T> — correct: 1 ---
  {
    question: "Warum verwendet Repository<T> den Typ T['id'] statt 'string' fuer den ID-Parameter?",
    options: [
      "Weil T['id'] laenger ist und damit klarer",
      "Weil T['id'] den spezifischen ID-Typ extrahiert — Repository<User>.findById erwartet UserId, nicht string",
      "Weil TypeScript 'string' als ID-Typ nicht unterstuetzt",
      "Weil T['id'] schneller ist als string",
    ],
    correct: 1,
    explanation:
      "Indexed Access Type T['id'] extrahiert den konkreten ID-Typ. " +
      "Bei User ist das UserId, bei Order ist das OrderId. Verwechslung unmoeglich.",
    elaboratedFeedback: {
      whyCorrect: "Repository<User>.findById(orderId) → Compile-Error! orderId ist OrderId, erwartet wird UserId. Ohne T['id'] (also mit 'string') waere der Aufruf gueltig — und falsch.",
      commonMistake: "Manche verwenden immer 'string' fuer IDs. Das ist Primitive Obsession (L24). Branded Types + Indexed Access Types machen Generics typsicher bis ins Detail."
    }
  },

  // --- Frage 6: Event System — correct: 1 ---
  {
    question: "Was macht Extract<DomainEvent, { type: 'order:paid' }> im Event-System?",
    options: [
      "Es loescht alle Events ausser 'order:paid'",
      "Es filtert die Discriminated Union auf die Variante mit type: 'order:paid' — mit allen zugehoerigen Feldern",
      "Es erstellt ein neues Event",
      "Es konvertiert den Event-Typ in einen String",
    ],
    correct: 1,
    explanation:
      "Extract ist ein Utility Type (L15) der aus einer Union die Members filtert " +
      "die dem gegebenen Typ zuweisbar sind. Ergebnis: { type: 'order:paid'; orderId: OrderId; paymentId: string; timestamp: Date }.",
    elaboratedFeedback: {
      whyCorrect: "Extract<U, T> gibt alle Members von U zurueck die T erweitern. Bei DomainEvent und { type: 'order:paid' } bleibt genau die 'order:paid'-Variante uebrig — mit allen Feldern.",
      commonMistake: "Manche verwechseln Extract mit Pick. Pick waehlt Properties aus einem Objekt. Extract filtert Members aus einer Union. Beides sind Utility Types, aber fuer verschiedene Zwecke."
    }
  },

  // --- Frage 7: Result Pattern — correct: 1 ---
  {
    question: "Warum gibt createOrder() ein Result<Order, 'empty-cart'> zurueck statt zu werfen?",
    options: [
      "Weil Exceptions in TypeScript nicht unterstuetzt werden",
      "Weil der Fehler im Typ sichtbar ist — der Aufrufer MUSS den Fehlerfall behandeln",
      "Weil Result schneller ist als throw",
      "Weil throw den Event-Bus stoert",
    ],
    correct: 1,
    explanation:
      "Das Result-Pattern (L25) macht Fehler zum Teil des Return-Typs. " +
      "Der Compiler erzwingt die Fehlerbehandlung — bei throw ist der Fehler unsichtbar im Typ.",
    elaboratedFeedback: {
      whyCorrect: "const result = await orderService.createOrder(...); if (!result.ok) { /* MUSS behandelt werden */ }. Bei throw: const order = await orderService.createOrder(...); — kein Hinweis auf moeglichen Fehler im Typ.",
      commonMistake: "Result ist NICHT immer besser als throw. Fuer unerwartete Fehler (Netzwerk-Timeout, Out of Memory) ist throw richtig. Result ist fuer ERWARTETE Geschaeftsfehler ('empty-cart', 'not-found')."
    }
  },

  // --- Frage 8: Parse Don't Validate — correct: 1 ---
  {
    question: "Was ist der Zusammenhang zwischen Smart Constructors, Parse Don't Validate und der defensiven Schale?",
    options: [
      "Kein Zusammenhang — drei unabhaengige Konzepte",
      "Smart Constructors SIND das Parse-Pattern — sie validieren und geben den staerkeren Typ zurueck. Die Schale nutzt sie.",
      "Smart Constructors ersetzen die defensive Schale",
      "Parse Don't Validate ist nur fuer JSON-Parsing",
    ],
    correct: 1,
    explanation:
      "createUserId(raw): UserId validiert UND gibt den staerkeren Typ zurueck. " +
      "Die defensive Schale ruft Smart Constructors auf — der Kern erhaelt typisierte Werte.",
    elaboratedFeedback: {
      whyCorrect: "Smart Constructor = Parse-Funktion = Uebergang von 'untypisiert' zu 'typisiert'. Die Schale nutzt sie um externe Daten in Domain-Typen umzuwandeln. Der Kern arbeitet nur mit den Domain-Typen.",
      commonMistake: "Smart Constructors ersetzen die Schale NICHT — sie sind ein TEIL der Schale. Die Schale validiert die gesamte Eingabe, Smart Constructors validieren einzelne Werte."
    }
  },

  // --- Frage 9: Readonly — correct: 2 ---
  {
    question: "Warum sind alle Properties im Domain Model 'readonly'?",
    options: [
      "Weil TypeScript readonly als Default erfordert",
      "Weil readonly den Code schneller macht",
      "Weil Immutability Seiteneffekte verhindert — Aenderungen erzwingen ein neues Objekt mit konsistenten Daten",
      "Weil readonly die Compiler-Fehlermeldungen verbessert",
    ],
    correct: 2,
    explanation:
      "Ohne readonly koennte jemand order.items.push(item) aufrufen ohne total " +
      "zu aktualisieren. Readonly erzwingt: Neues Objekt mit neuem total.",
    elaboratedFeedback: {
      whyCorrect: "Immutability = konsistente Daten. Wenn items und total zusammen aktualisiert werden muessen, verhindert readonly dass items allein geaendert wird. Das neue Objekt MUSS beides enthalten.",
      commonMistake: "Readonly ist kein Runtime-Schutz — es wird zur Laufzeit entfernt (Type Erasure). Es ist ein Compilezeit-Schutz der die Intention dokumentiert und versehentliche Mutation verhindert."
    }
  },

  // --- Frage 10: End-to-End — correct: 2 ---
  {
    question: "Was bedeutet 'End-to-End-Typsicherheit' in der TypeShop-Architektur?",
    options: [
      "Dass alle Tests bestehen",
      "Dass jede Variable einen Typ hat",
      "Dass der Typ von der API-Route-Definition ueber die Validierung bis zur Business Logic konsistent ist",
      "Dass der Code in allen Browsern laeuft",
    ],
    correct: 2,
    explanation:
      "Die API-Route-Definition bestimmt den Typ. Die Validierung produziert diesen Typ. " +
      "Die Business Logic konsumiert ihn. Ein Bruch irgendwo → Compile-Error.",
    elaboratedFeedback: {
      whyCorrect: "Route → Handler → Validator → Service → Repository: Jede Schicht gibt typisierte Daten an die naechste weiter. Aenderungen am Typ propagieren automatisch durch alle Schichten.",
      commonMistake: "End-to-End ist NICHT dasselbe wie 'strict: true'. Strict Mode prueft einzelne Dateien. End-to-End-Typsicherheit prueft die Konsistenz ZWISCHEN Schichten."
    }
  },

  // --- Frage 11: Exhaustive Check — correct: 2 ---
  {
    question: "Was passiert wenn ein neuer OrderStatus ('refunded') hinzugefuegt wird?",
    options: [
      "Nichts — der neue Status funktioniert automatisch",
      "Ein Laufzeitfehler in der Transition Map",
      "Compile-Fehler an JEDER Stelle die einen exhaustive switch ueber OrderStatus hat",
      "Nur die Transition Map muss aktualisiert werden",
    ],
    correct: 2,
    explanation:
      "Jeder exhaustive switch (mit never-Check) erzeugt einen Compile-Error. " +
      "Das erzwingt dass alle Handler den neuen Status behandeln. Kein Fall wird vergessen.",
    elaboratedFeedback: {
      whyCorrect: "Der Compiler zeigt ALLE betroffenen Stellen: getOrderDisplayText, mapErrorToStatus, Event-Handler. Das ist die Kraft von Discriminated Unions + Exhaustive Checks.",
      commonMistake: "Nur die Transition Map zu aktualisieren reicht nicht. Alle switch-Statements, Event-Handler und Renderer muessen den neuen Status kennen. Exhaustive Checks finden sie alle."
    }
  },

  // --- Frage 12: Generics Kombination — correct: 2 ---
  {
    question: "Wie viele verschiedene TypeScript-Konzepte arbeiten im Capstone-Projekt zusammen?",
    options: [
      "3-5 (Branded Types, Generics, Discriminated Unions)",
      "5-8 (plus Conditional Types, Mapped Types, Template Literals)",
      "10+ (plus Result Pattern, Exhaustive Checks, Readonly, Indexed Access, Extract, Phantom Types)",
      "Alle 40 Lektionen",
    ],
    correct: 2,
    explanation:
      "Branded Types, Discriminated Unions, Generics, Indexed Access, Mapped Types, " +
      "Conditional Types, Template Literals, Extract, Readonly, Result Pattern, " +
      "Exhaustive Checks, Phantom Types — mindestens 12 verschiedene Konzepte.",
    elaboratedFeedback: {
      whyCorrect: "Jedes Konzept hat seinen Platz: Branded Types fuer IDs, DUs fuer Status, Generics fuer Repository, Extract fuer Events, Result fuer Fehler. Keines ist redundant.",
      commonMistake: "Nicht ALLE 40 Lektionen kommen direkt vor — L01 (Setup) oder L28 (Decorators) nicht. Aber die Konzepte aus ca. 25 Lektionen fliessen direkt ein."
    }
  },

  // --- Frage 13: Meisterschaft — correct: 3 ---
  {
    question: "Was ist der wichtigste Unterschied zwischen einem TypeScript-Nutzer und einem TypeScript-Meister?",
    options: [
      "Der Meister kennt mehr Syntax",
      "Der Meister schreibt komplexere Typen",
      "Der Meister verwendet immer die neueste Version",
      "Der Meister weiss wann einfache Typen reichen und wann komplexe noetig sind — die Balance",
    ],
    correct: 3,
    explanation:
      "Meisterschaft ist nicht maximale Komplexitaet sondern optimale Komplexitaet. " +
      "Der einfachste Typ der den Job erledigt ist der beste Typ.",
    elaboratedFeedback: {
      whyCorrect: "Ein Meister nutzt Branded Types wo sie Bugs verhindern — und einfache strings wo sie reichen. Er schreibt Type-Level Code fuer Libraries — und simple Interfaces fuer Business Logic.",
      commonMistake: "Viele denken Meisterschaft = komplexe Typen. Nein — Meisterschaft = die richtige Entscheidung in jeder Situation. Manchmal ist 'string' die richtige Antwort."
    }
  },

  // --- Frage 14: Framework — correct: 3 ---
  {
    question: "Welches TypeScript-Konzept aus diesem Kurs ist am DIREKTESTEN uebertragbar auf Angular und React?",
    options: [
      "Type-Level Programming (L37)",
      "Compiler API (L38)",
      "Template Literal Types (L18)",
      "Discriminated Unions fuer State Management (L12) — NgRx Actions, Redux Actions, useReducer",
    ],
    correct: 3,
    explanation:
      "Discriminated Unions sind das State-Management-Pattern in BEIDEN Frameworks. " +
      "NgRx Actions in Angular und Redux Actions in React SIND Discriminated Unions.",
    elaboratedFeedback: {
      whyCorrect: "type Action = { type: 'add'; item: Item } | { type: 'remove'; id: string } — das ist eine DU. Jeder Reducer/Effect handelt einen Case. Exhaustive Checks verhindern vergessene Actions.",
      commonMistake: "Type-Level Programming und Compiler API sind fortgeschritten und werden in Framework-Code selten direkt verwendet. DUs sind UEBERALL in State Management."
    }
  },

  // --- Frage 15: Ein Rat — correct: 3 ---
  {
    question: "Was ist die wichtigste Erkenntnis aus 40 Lektionen TypeScript?",
    options: [
      "TypeScript ist kompliziert und braucht viel Uebung",
      "Man sollte immer die neuesten Features verwenden",
      "Typen sind nur fuer grosse Projekte sinnvoll",
      "Der Compiler ist dein Partner — nutze ihn um Bugs zur Compilezeit zu finden statt in Produktion",
    ],
    correct: 3,
    explanation:
      "TypeScript verschiebt Fehler von der Laufzeit zur Compilezeit. " +
      "Das ist der fundamentale Wert — nicht die Syntax, nicht die Features, " +
      "sondern die Faehigkeit Bugs VOR dem Ausfuehren zu finden.",
    elaboratedFeedback: {
      whyCorrect: "Studien zeigen: Statische Typsysteme verhindern ca. 15% aller Bugs. Bei grossen Projekten sind das Tausende von Fehlern. Der Compiler findet sie in Sekunden — statt in Stunden manuellen Testens.",
      commonMistake: "TypeScript ist nicht 'kompliziert' — es ist maechtig. Die Komplexitaet ist optional: Man kann mit string, number, interface starten und nur bei Bedarf zu Generics und Conditional Types greifen."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Wie heisst das Architektur-Prinzip 'Unmoegliche Zustaende sollen vom Typsystem verhindert werden'?",
    expectedAnswer: "Make impossible states impossible",
    acceptableAnswers: ["Make impossible states impossible", "make impossible states impossible"],
    explanation:
      "Statt unmoegliche Zustaende zur Laufzeit zu pruefen, modelliert man den Typ so " +
      "dass sie gar nicht erst ausdrueckbar sind. Discriminated Unions sind die Umsetzung.",
  },

  {
    type: "short-answer",
    question: "Welcher Utility Type filtert aus einer Union die Members die einem bestimmten Typ zuweisbar sind?",
    expectedAnswer: "Extract",
    acceptableAnswers: ["Extract", "Extract<U, T>"],
    explanation:
      "Extract<DomainEvent, { type: 'order:paid' }> gibt die 'order:paid'-Variante " +
      "der DomainEvent-Union zurueck — mit allen zugehoerigen Feldern.",
  },

  {
    type: "short-answer",
    question: "Wie nennt man eine Funktion die einen Rohwert validiert und als Branded Type zurueckgibt?",
    expectedAnswer: "Smart Constructor",
    acceptableAnswers: ["Smart Constructor", "smart constructor", "Smart constructor"],
    explanation:
      "Smart Constructors sind die einzige Stelle die einen Brand vergibt — nach Validierung. " +
      "createUserId(raw): UserId prueft und castet. Andere Module muessen den Constructor verwenden.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Kompiliert dieser Code?",
    code:
      "type UserId = string & { __brand: 'UserId' };\n" +
      "type OrderId = string & { __brand: 'OrderId' };\n\n" +
      "function findUser(id: UserId): void {}\n\n" +
      "const orderId = 'ord_123' as OrderId;\n" +
      "findUser(orderId);",
    expectedAnswer: "Nein",
    acceptableAnswers: ["Nein", "Fehler", "Kompiliert nicht", "Error"],
    explanation:
      "OrderId hat __brand: 'OrderId', UserId erwartet __brand: 'UserId'. " +
      "Obwohl beides string-basiert ist, sind die Brands verschieden → Compile-Error.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat 'total' nach diesem Code?",
    code:
      "type Cents = number & { __brand: 'Cents' };\n" +
      "const a: Cents = 100 as Cents;\n" +
      "const b: Cents = 200 as Cents;\n" +
      "const total = a + b;\n" +
      "// Welcher Typ ist total?",
    expectedAnswer: "number",
    acceptableAnswers: ["number"],
    explanation:
      "a + b ergibt 'number', NICHT 'Cents'. Der Brand geht bei arithmetischen " +
      "Operationen verloren. Man braucht eine Funktion addCents(a, b): Cents.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum ist eine typsichere Architektur (Defensive Schale + Domain Model + offensiver Kern) " +
      "mehr wert als die Summe ihrer Teile?",
    modelAnswer:
      "Einzelne Typen schuetzen nur lokal — eine Funktion, ein Modul. Eine durchgaengige " +
      "Architektur schuetzt ZWISCHEN den Schichten: API-Vertrag → Validierung → Domain-Typ → " +
      "Business Logic → Event System. Aenderungen an einem Typ propagieren automatisch durch " +
      "alle Schichten — der Compiler zeigt ALLE betroffenen Stellen. Das ist End-to-End-" +
      "Typsicherheit: Kein 'any' unterbricht die Kette. Fehler die normalerweise erst in " +
      "Produktion auffallen (falsche ID, fehlender Status-Case, ungueltige Transition) werden " +
      "zu Compile-Fehlern. Die Architektur macht den Compiler zum automatisierten Code-Reviewer.",
    keyPoints: [
      "Einzelne Typen schuetzen lokal, Architektur schuetzt ZWISCHEN Schichten",
      "Typ-Aenderungen propagieren automatisch — der Compiler findet alle Stellen",
      "Kein 'any' unterbricht die Kette — End-to-End-Konsistenz",
      "Compile-Fehler statt Production-Bugs — der Compiler als Code-Reviewer",
    ],
  },
];
