// quiz-data.ts — L24: Branded/Nominal Types
// Quiz mit 15 Fragen, correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export interface MCQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number; // 0-basierter Index der richtigen Antwort
  explanation: string;
  elaboratedFeedback: {
    whyCorrect: string;
    commonMistake: string;
  };
}

export const quizData: (MCQuizQuestion | QuizQuestion)[] = [
  // correct: 0 (Frage 1, 2, 3, 4)
  {
    id: 1,
    question: "Was ist das Hauptproblem mit `type UserId = string` in TypeScript?",
    options: [
      "Es bietet keine Typsicherheit — `UserId` und `string` sind strukturell identisch",
      "Es verursacht Runtime-Overhead durch zusätzliche Objekt-Allokation",
      "TypeScript erlaubt keine Type Aliases für primitive Typen",
      "Es funktioniert nur mit `strict: true` in tsconfig.json"
    ],
    correct: 0,
    explanation: "Type Aliases sind nur Umbenennung, kein neuer Typ. TypeScript prüft Struktur — und `UserId = string` ist strukturell identisch mit `string`.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript's Structural Typing bedeutet: Zwei Typen sind kompatibel wenn sie die gleiche Struktur haben. `type UserId = string` erzeugt keinen neuen Typ — es benennt `string` nur um. Jeder `string` ist damit als `UserId` verwendbar.",
      commonMistake: "Viele denken, Type Aliases würden Nominal Typing erzeugen wie in Java. Aber TypeScript prüft Struktur, nicht Namen. `type UserId = string` ist dokumentarisch hilfreich, aber bietet keine Typsicherheit."
    }
  },
  {
    id: 2,
    question: "Wie wird ein Brand-Typ in TypeScript definiert?",
    options: [
      "`type UserId = string & { readonly __brand: 'UserId' }`",
      "`type UserId = class UserId extends String {}`",
      "`type UserId = Nominal<string, 'UserId'>`",
      "`type UserId = string implements 'UserId'`"
    ],
    correct: 0,
    explanation: "Brand-Typen nutzen Intersection mit einem einzigartigen Property. Das `readonly __brand` Property macht die Typen strukturell verschieden.",
    elaboratedFeedback: {
      whyCorrect: "Der Intersection-Operator `&` kombiniert Typen. `string & { readonly __brand: 'UserId' }` erzeugt einen Typ der sowohl `string`-Eigenschaften als auch das `__brand`-Property hat. Ein normaler `string` hat kein `__brand` → Compile-Error bei Verwechslung.",
      commonMistake: "TypeScript hat kein eingebautes `Nominal<>` oder `Opaque<>`. Die Brand-Technik mit `& { readonly __brand: ... }` ist der Standard-Workaround für Nominal Typing."
    }
  },
  {
    id: 3,
    question: "Was ist ein Smart Constructor?",
    options: [
      "Eine Funktion die Roheingaben validiert und dann einen Brand-Typ vergibt",
      "Ein TypeScript-Decorator der Klassen-Konstruktoren modifiziert",
      "Ein TypeScript 5.0 Feature für typsichere Factory-Methoden",
      "Ein Design Pattern das nur mit Klassen, nicht mit Type Aliases funktioniert"
    ],
    correct: 0,
    explanation: "Smart Constructors zentralisieren `as`-Casts und können Validierung einbauen. Sie sind der einzige erlaubte Ort wo `as Brand` verwendet wird.",
    elaboratedFeedback: {
      whyCorrect: "Ein Smart Constructor kombiniert Validierung und Typ-Vergabe: `function createEmail(raw: string): Email { validate(raw); return raw as Email; }`. Der `as`-Cast ist hier sicher weil er nach Validierung passiert — und er ist zentralisiert, nicht überall im Code verstreut.",
      commonMistake: "Smart Constructor ist kein TypeScript-Keyword oder -Feature, sondern ein Design-Pattern. Es ist ein Naming-Convention und eine Architektur-Entscheidung."
    }
  },
  {
    id: 4,
    question: "Warum hat `UserId = string & { __brand: 'UserId' }` Zero Runtime Overhead?",
    options: [
      "Das `__brand`-Property ist nur ein Compilezeit-Konstrukt und wird nach Type Erasure entfernt",
      "TypeScript optimiert Brand-Typen intern zu primitiven JavaScript-Typen",
      "Das `__brand`-Property ist als `readonly` deklariert und wird nicht gespeichert",
      "JavaScript wurde so modifiziert dass Brand-Properties automatisch ignoriert werden"
    ],
    correct: 0,
    explanation: "Alle TypeScript-Typ-Informationen (inklusive Brand-Properties) werden bei der Kompilierung entfernt (Type Erasure). Ein `UserId`-Wert ist zur Laufzeit ein normaler JavaScript-String.",
    elaboratedFeedback: {
      whyCorrect: "Type Erasure (Lektion 02) bedeutet: TypeScript-Typen existieren nur zur Compilezeit. `const id: UserId = createUserId('user-123')` wird zu `const id = 'user-123'` kompiliert. Das `__brand`-Property existiert nie zur Laufzeit.",
      commonMistake: "Manche denken, das `__brand`-Property wird als echtes JavaScript-Objekt-Property gespeichert. Das ist falsch — es ist ein rein typtheoretisches Konstrukt, das nur dem TypeScript-Compiler bekannt ist."
    }
  },

  // correct: 1 (Frage 5, 6, 7, 8)
  {
    id: 5,
    question: "Was ist der Unterschied zwischen Structural Typing und Nominal Typing?",
    options: [
      "Structural Typing prüft Namen, Nominal Typing prüft Struktur",
      "Structural Typing prüft Struktur (Felder/Methoden), Nominal Typing prüft Namen",
      "Structural Typing ist nur in JavaScript möglich, Nominal Typing in TypeScript",
      "Es gibt keinen praktischen Unterschied — beide prüfen Typen zur Compilezeit"
    ],
    correct: 1,
    explanation: "TypeScript nutzt Structural Typing: Typen sind kompatibel wenn ihre Struktur übereinstimmt. Java/C# nutzen Nominal Typing: Typen müssen explizit deklariert werden.",
    elaboratedFeedback: {
      whyCorrect: "In TypeScript gilt: Wenn Typ A alle Properties von Typ B hat, ist A kompatibel mit B — egal wie die Typen heißen. Das ist Structural Typing. In Java gilt: `class UserId` und `class OrderId` sind verschiedene Typen, auch wenn beide nur `String` enthalten — das ist Nominal Typing.",
      commonMistake: "Eine verbreitete Verwechslung: 'Structural' bedeutet NICHT 'flexibler' oder 'schwächer'. Structural Typing kann sehr streng sein. Es bedeutet nur: Die Prüfung basiert auf der Form (Felder, Methoden), nicht auf dem Namen."
    }
  },
  {
    id: 6,
    question: "Welche TypeScript-Version hat Nominal Typing eingebaut?",
    options: [
      "TypeScript 5.0 mit dem `nominal` Keyword",
      "Keine — TypeScript hat kein eingebautes Nominal Typing; Brand-Typen sind ein Workaround",
      "TypeScript 4.9 mit `satisfies`-Operator als Nominal Type Guard",
      "TypeScript 5.3 mit dem `opaque type` Feature"
    ],
    correct: 1,
    explanation: "TypeScript hat bis heute kein natives Nominal Typing. Die Brand-Technik ist ein Community-Workaround der Nominal Typing im Structural Type System simuliert.",
    elaboratedFeedback: {
      whyCorrect: "Nominal Typing wurde mehrfach in TypeScript GitHub Issues (z.B. #202) diskutiert, aber nie eingebaut. Der Hauptgrund: Kompatibilität mit JavaScript und dem bestehenden Structural Typing-System. Brand-Typen sind die standardisierte Workaround-Lösung.",
      commonMistake: "Der `satisfies`-Operator (TS 4.9) hat nichts mit Nominal Typing zu tun — er prüft ob ein Ausdruck einem Typ entspricht dabei ohne den Typ zu 'verbreitern'. Das `opaque type` Feature existiert nicht."
    }
  },
  {
    id: 7,
    question: "Gegeben: `type Meter = number & { __brand: 'Meter' }; type Second = number & { __brand: 'Second' }`. Welche Operation wird TypeScript ablehnen?",
    options: [
      "Einen `Meter`-Wert als Template Literal verwenden: `` `${distance} m` ``",
      "Einen `Meter`-Wert an eine Funktion übergeben die `Second` erwartet",
      "Einen `Meter`-Wert mit `+` mit einer `number` addieren",
      "Einen `Meter`-Wert mit `.toFixed(2)` formatieren"
    ],
    correct: 1,
    explanation: "TypeScript lehnt verschiedene Brands ab: `Meter.__brand` ist `'Meter'`, `Second.__brand` ist `'Second'`. Die Literale sind verschieden → Compile-Error.",
    elaboratedFeedback: {
      whyCorrect: "Branded Types verhalten sich arithmetisch und string-mäßig wie die Basis-Typen (number/string). Template Literals, Arithmetik, und String-Methoden funktionieren alle. Aber: Verschiedene Brands sind nicht kompatibel — `Meter` an eine `Second`-Funktion → COMPILE-ERROR.",
      commonMistake: "Man könnte denken, dass Brands alle Operationen blockieren. Nein: Nur die Typ-Zuweisbarkeit wird eingeschränkt. Arithmetik (+ - * /) und String-Operationen funktionieren wie normal."
    }
  },
  {
    id: 8,
    question: "Was macht `type Newtype<A, Brand> = A & { readonly [phantom]: Brand }` wo `phantom: unique symbol`?",
    options: [
      "Es erzeugt einen Wrapper-Typ der einen JavaScript-Proxy erstellt",
      "Es erzeugt einen Typ der strukturell von allen anderen Newtypes verschieden ist, weil `unique symbol` als Property-Key einzigartig ist",
      "Es fügt dem Wert zur Laufzeit ein verstecktes `phantom`-Property hinzu",
      "Es ist syntaktischer Zucker für `class Newtype<A, Brand> extends A {}`"
    ],
    correct: 1,
    explanation: "`unique symbol` erzeugt einen Typ der für jede `declare const`-Deklaration einzigartig ist. Als Computed Property Key macht er das Brand-Property für externe Module unzugänglich.",
    elaboratedFeedback: {
      whyCorrect: "In TypeScript ist `declare const x: unique symbol` eine ambient declaration — kein Runtime-Wert. Jede `unique symbol`-Deklaration erzeugt einen eigenen Typ. Als `[phantom]: Brand` Computed Key ist das Property für externe Module unsichtbar (sie kennen das Symbol nicht), was maximale Kapselung bietet.",
      commonMistake: "Viele denken, Symbols erstellen Runtime-Overhead. Nein: `declare const` mit `unique symbol` existiert nur zur Compilezeit (Type Erasure!). Zur Laufzeit ist der Wert wieder ein normaler string/number."
    }
  },

  // correct: 2 (Frage 9, 10, 11, 12)
  {
    id: 9,
    question: "Welches der folgenden Statements ist über `type UserId = string & { __brand: 'UserId' }` korrekt?",
    options: [
      "Ein `UserId`-Wert KANN NICHT als `string` verwendet werden (strenge Isolation)",
      "Ein normaler `string`-Wert KANN als `UserId` übergeben werden",
      "Ein `UserId`-Wert KANN als `string` verwendet werden, aber ein `string` NICHT als `UserId`",
      "Beide Richtungen (`string → UserId` und `UserId → string`) sind erlaubt"
    ],
    correct: 2,
    explanation: "`UserId` ist ein Subtyp von `string` (es hat alle string-Properties + mehr). Subtypen können überall verwendet werden wo Supertypen erwartet werden — aber nicht umgekehrt.",
    elaboratedFeedback: {
      whyCorrect: "Subtyp-Beziehung: `UserId = string & { __brand: 'UserId' }` hat mehr als `string` allein. Deshalb ist `UserId` ein Subtyp von `string` → kann überall wo `string` erwartet wird verwendet werden (Upcasting). Aber `string` hat kein `__brand` → kann nicht als `UserId` verwendet werden (Downcasting verboten).",
      commonMistake: "Brands isolieren nicht vollständig von der Basis. Ein `UserId` kann als `string` übergeben werden — das ist bewusstes Design (Template Literals, API-Calls, etc. sollen weiter funktionieren)."
    }
  },
  {
    id: 10,
    question: "Was sind `Brand-Hierarchien` bei Brands?",
    options: [
      "Vererbungsketten von Brand-Klassen wie `class VerifiedEmail extends Email`",
      "TypeScript-Interfaces die Brands in einer Reihenfolge definieren",
      "Intersection-Typen wie `VerifiedEmail = Email & { __verified: true }` bei denen ein Brand Subtyp eines anderen ist",
      "Eine externe Bibliothek die Nominal Typing für TypeScript implementiert"
    ],
    correct: 2,
    explanation: "Brand-Hierarchien nutzen Intersection: `VerifiedEmail = Email & { __verified: true }` ist ein Subtyp von `Email`. Überall wo `Email` erwartet wird, funktioniert `VerifiedEmail`.",
    elaboratedFeedback: {
      whyCorrect: "Wenn `VerifiedEmail = Email & { __verified: true }`, dann hat `VerifiedEmail` alle Properties von `Email` plus `__verified`. Deshalb ist `VerifiedEmail` ein Subtyp von `Email` — es kann überall als `Email` verwendet werden. Das Umgekehrte gilt nicht: Ein gewöhnliches `Email` fehlt `__verified`.",
      commonMistake: "Brand-Hierarchien haben nichts mit Klassen-Vererbung zu tun. Es sind Typ-Level-Subtyp-Beziehungen durch Intersection — compiletime-only, kein Runtime-Code."
    }
  },
  {
    id: 11,
    question: "Warum sollte man Geldbeträge als Cents (Integer) statt als Euro (Dezimal) modellieren?",
    options: [
      "Weil TypeScript keine Dezimalzahlen als Branded Types unterstützt",
      "Weil Cents als `number`-Brand einfacher zu definieren sind als Dezimalzahlen",
      "Weil JavaScript Dezimalzahlen mit Floating-Point-Fehlern speichert (0.1 + 0.2 ≠ 0.3)",
      "Weil Cents internationaler sind und keine Währungskonversion nötig"
    ],
    correct: 2,
    explanation: "JavaScript nutzt IEEE 754 Floating-Point für alle Zahlen. `0.1 + 0.2` ergibt `0.30000000000000004`. Ganzzahl-Cents haben dieses Problem nicht.",
    elaboratedFeedback: {
      whyCorrect: "Floating-Point-Arithmetik ist in JavaScript inhärent ungenau bei Dezimalzahlen. `0.1 + 0.2 === 0.3` ist `false` in JavaScript! Geldbeträge müssen exakt sein → Ganzzahl-Cents (Integer). `1999` Cent = `19.99€` — keine Rundungsfehler.",
      commonMistake: "Viele Entwickler ignorieren Floating-Point-Fehler und rechnen direkt mit Euro-Beträgen. Das funktioniert scheinbar für einfache Fälle, führt aber bei Steuern, Rabatten und Summen zu Centbeträgen-Rundungsfehlern."
    }
  },
  {
    id: 12,
    question: "Was ist die empfohlene Architektur-Strategie für Branded Types in Angular/React-Projekten?",
    options: [
      "Brands überall verwenden — in jeder Komponente, jedem Service, jedem Hook",
      "Brands nur in Tests verwenden, in Production-Code plain strings/numbers nutzen",
      "Brands am Rand der Anwendung (Services/Mapper) vergeben; intern mit Brand-Typen arbeiten",
      "Brands ersetzen vollständig Validierungslogik — kein weiteres Error-Handling nötig"
    ],
    correct: 2,
    explanation: "Anti-Corruption Layer Prinzip: Externe Daten (API) am Eintrittspunkt validieren und Brand vergeben. Interne Business-Logik arbeitet nur mit typisierten Brands.",
    elaboratedFeedback: {
      whyCorrect: "Der Anti-Corruption Layer (ACL) ist das richtige Architektur-Pattern: Externe Daten (HTTP-Responses, Route-Parameter) am Rand konvertieren (string → UserId via createUserId()). Services/Repositories erhalten und geben Brand-Typen zurück. Komponenten arbeiten mit bereits getippten Entities.",
      commonMistake: "Brands überall zu verwenden (inkl. Template-Literals, lokale Variablen) führt zu Over-Engineering mit ständigen `as`-Casts. Das Ziel ist: Mehr Typsicherheit an Systemgrenzen, nicht mehr Casts innerhalb der Business-Logik."
    }
  },

  // correct: 3 (Frage 13, 14, 15)
  {
    id: 13,
    question: "Was ist `type Id<E extends string> = string & { readonly __idType: E }` für ein Pattern?",
    options: [
      "Ein Recursive Type der E rekursiv expandiert",
      "Ein Mapped Type der alle string-Literale in E zu ID-Typen macht",
      "Eine generische Utility Function für ID-Konvertierung",
      "Ein generischer Brand-Typ der es erlaubt ID-Typen per Type-Parameter zu unterscheiden"
    ],
    correct: 3,
    explanation: "`Id<E>` generiert verschiedene ID-Typen per Parameter. `Id<'User'>` und `Id<'Order'>` haben `__idType: 'User'` bzw. `'Order'` — strukturell verschieden, also nicht kompatibel.",
    elaboratedFeedback: {
      whyCorrect: "Der generische `Id<E extends string>`-Typ erzeugt für jeden Parameter-Wert einen eigenen Typ. `Id<'User'>` hat `{ __idType: 'User' }`, `Id<'Order'>` hat `{ __idType: 'Order' }`. Diese Literal-Types sind verschieden → TypeScript erkennt sie als inkompatibel. Eleganter als für jede Entity separate Brand-Typen zu schreiben.",
      commonMistake: "Man könnte denken, generische Typen sind schwerer verständlich als konkrete. Im Gegenteil: `Id<'User'>` ist selbstdokumentierend — der Name enthält die Entity. Und das Repository-Interface `Repository<T, TId>` wird viel sauberer mit diesem Muster."
    }
  },
  {
    id: 14,
    question: "Wann sollte man Branded Types NICHT verwenden?",
    options: [
      "Bei API-Keys und Session-Tokens — diese sind zu sicherheitskritisch für Brands",
      "Bei Datenbankentitäten — Brands passen nicht zum Repository-Pattern",
      "Bei Währungsbeträgen — Dezimalzahlen lassen sich nicht branden",
      "Bei lokalen Berechnungen mit 2-3 Variablen — der Komplexitäts-Overhead lohnt sich nicht"
    ],
    correct: 3,
    explanation: "YAGNI: Bands fügen Komplexität hinzu. Bei lokalen Berechnungen (2-3 Variable, klar benamt) lohnt sich die Abstraktion nicht — da passieren keine Verwechslungen.",
    elaboratedFeedback: {
      whyCorrect: "Brands sind am wertvollsten wenn: (1) Typen verwechselt werden können, (2) der Wert durch APIs propagiert wird, (3) Sicherheitskritikalität besteht. Bei lokalen Berechnungen (z.B. `const width = 800; const height = 600; const area = width * height`) wäre `Width` und `Height` als Brand Over-Engineering — niemand verwechselt sie in 5 Zeilen.",
      commonMistake: "Viele Entwickler branden alles nach dem Motto 'mehr Typsicherheit = besser'. Aber Brands bedeuten auch: Mehr `as`-Casts, mehr Boilerplate, steilere Lernkurve. Die Kosten müssen durch den Nutzen gerechtfertigt sein."
    }
  },
  {
    id: 15,
    question: "Welche Aussage über den Mars Climate Orbiter Unfall (1999) und TypeScript-Brands stimmt?",
    options: [
      "Brands hätten den Bug verhindert, weil Mars-Missions-Software in TypeScript geschrieben ist",
      "Brands hätten den Bug nicht verhindert — Einheitenfehler entstehen nur durch falsche Konstanten",
      "Brands hätten den Bug verhindert durch Kompatibilitätskontrolle zur Runtime",
      "Brands hätten den Bug zur Compilezeit erkannt, weil `Pound_Force_Seconds` ≠ `Newton_Seconds`"
    ],
    correct: 3,
    explanation: "Mit `type PoundForceSeconds = number & { __unit: 'PoundForceSeconds' }` hätte TypeScript zur Compilezeit einen Fehler ausgegeben wenn `Newton_Seconds` übergeben wurde.",
    elaboratedFeedback: {
      whyCorrect: "Das Problem: Ein Team berechnete Schubkraft in Pound-force·seconds, das andere erwartete Newton·seconds. Mit Branded Types: `function applyThrust(thrust: NewtonSeconds): void`. Beim Übergeben von `PoundForceSeconds` → COMPILE-ERROR. Der Bug wäre im Editor sichtbar gewesen, nicht in der Marsumlaufbahn.",
      commonMistake: "Natürlich wurde die NASA-Mission nicht in TypeScript geschrieben. Aber das Prinzip — Einheiten typisieren — ist direkt auf TypeScript anwendbar. Das zeigt: Branded Types lösen eine Klasse realer Engineering-Probleme, nicht nur akademische."
    }
  },

  // ─── Neue Frageformate (Short-Answer, Predict-Output, Explain-Why) ─────────

  // --- Frage 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst das Design-Pattern, bei dem eine Funktion Roheingaben validiert " +
      "und dann einen Brand-Typ vergibt (z.B. createEmail)?",
    expectedAnswer: "Smart Constructor",
    acceptableAnswers: [
      "Smart Constructor", "smart constructor", "Smart-Constructor",
      "SmartConstructor", "Smart Konstruktor",
    ],
    explanation:
      "Ein Smart Constructor zentralisiert den 'as'-Cast an einer einzigen Stelle. " +
      "Er validiert die Eingabe und gibt bei Erfolg den Branded Type zurueck. " +
      "So wird sichergestellt, dass der Cast nur nach Validierung passiert.",
  },

  // --- Frage 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welches Typsystem-Modell nutzt TypeScript: Structural Typing oder Nominal Typing?",
    expectedAnswer: "Structural Typing",
    acceptableAnswers: [
      "Structural Typing", "structural typing", "Strukturelle Typisierung",
      "strukturelle Typisierung", "Structural", "structural",
    ],
    explanation:
      "TypeScript nutzt Structural Typing: Zwei Typen sind kompatibel wenn " +
      "ihre Struktur uebereinstimmt, unabhaengig vom Namen. Branded Types " +
      "sind ein Workaround, um Nominal-Typing-aehnliches Verhalten zu simulieren.",
  },

  // --- Frage 18: Predict-Output ---
  {
    type: "predict-output",
    question: "Kompiliert dieser Code?",
    code:
      "type Brand<T, B> = T & { readonly __brand: B };\n" +
      "type EUR = Brand<number, 'EUR'>;\n" +
      "type USD = Brand<number, 'USD'>;\n" +
      "const price: EUR = 10 as EUR;\n" +
      "const converted: USD = price;",
    expectedAnswer: "Nein",
    acceptableAnswers: [
      "Nein", "nein", "Fehler", "Error", "Compile Error", "Compile-Error",
    ],
    explanation:
      "EUR und USD sind inkompatible Branded Types. EUR hat __brand: 'EUR', " +
      "USD hat __brand: 'USD'. Die String-Literale sind verschieden, " +
      "daher ist die Zuweisung ein Compile-Error.",
  },

  // --- Frage 19: Predict-Output ---
  {
    type: "predict-output",
    question: "Kompiliert dieser Code?",
    code:
      "type UserId = string & { readonly __brand: 'UserId' };\n" +
      "function greet(name: string): void { console.log('Hi ' + name); }\n" +
      "const id = 'user-42' as UserId;\n" +
      "greet(id);",
    expectedAnswer: "Ja",
    acceptableAnswers: ["Ja", "ja", "Yes", "yes", "Kompiliert"],
    explanation:
      "UserId ist ein Subtyp von string (es hat alle string-Properties plus __brand). " +
      "Subtypen koennen ueberall verwendet werden wo Supertypen erwartet werden. " +
      "Ein UserId-Wert kann also als string uebergeben werden — aber nicht umgekehrt.",
  },

  // --- Frage 20: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst das Architektur-Prinzip, bei dem externe Daten am Rand der " +
      "Anwendung validiert und in Brand-Typen konvertiert werden?",
    expectedAnswer: "Anti-Corruption Layer",
    acceptableAnswers: [
      "Anti-Corruption Layer", "anti-corruption layer", "ACL",
      "Anti Corruption Layer", "Anticorruption Layer",
    ],
    explanation:
      "Das Anti-Corruption Layer Prinzip besagt: Externe Daten (API-Responses, " +
      "Route-Parameter) werden am Eintrittspunkt validiert und in Brand-Typen " +
      "konvertiert. Intern arbeitet die Business-Logik nur mit typisierten Brands.",
  },

  // --- Frage 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Warum sind Branded Types noetig, obwohl TypeScript ein strukturelles " +
      "Typsystem hat? Erklaere anhand eines konkreten Beispiels " +
      "(z.B. UserId vs. OrderId), welches Problem sie loesen.",
    modelAnswer:
      "In TypeScript's Structural Typing sind 'type UserId = string' und " +
      "'type OrderId = string' identisch — eine UserId kann versehentlich " +
      "als OrderId verwendet werden ohne Compile-Error. Branded Types fuegen " +
      "ein unsichtbares __brand-Property hinzu, das die Typen strukturell " +
      "verschieden macht. So erkennt der Compiler Verwechslungen zur Compilezeit.",
    keyPoints: [
      "Structural Typing macht Type Aliases austauschbar",
      "Brands erzeugen strukturelle Verschiedenheit",
      "Verwechslungen werden zur Compilezeit erkannt",
      "Zero Runtime Overhead durch Type Erasure",
    ],
  },
];
