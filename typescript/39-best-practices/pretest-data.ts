// pretest-data.ts — L39: Best Practices & Anti-Patterns
// 18 Fragen (3 pro Sektion)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Sektion 1: Die 10 haeufigsten Fehler ──────────────────────────────

  { sectionId: 1, question: "Was ist das Problem mit 'as User' bei API-Responses?", options: ["Es ist langsamer", "TypeScript prueft nicht ob die Daten tatsaechlich dem Typ entsprechen", "Es funktioniert nicht mit Generics", "Ich weiss es nicht"], correct: 1, explanation: "'as' ist ein 'Trust me' an den Compiler — keine Runtime-Pruefung." },
  { sectionId: 1, question: "Was passiert wenn man in einem switch ueber eine Union einen Case vergisst?", options: ["Der Compiler zeigt immer einen Fehler", "Kein Fehler — ausser man nutzt einen Exhaustive Check mit never", "TypeScript ergaenzt den fehlenden Case automatisch", "Ich weiss es nicht"], correct: 1, explanation: "Ohne never-Check im default gibt es keinen Compile-Error bei fehlendem Case." },
  { sectionId: 1, question: "Warum sollten exportierte Funktionen einen expliziten Return Type haben?", options: ["Performance-Verbesserung", "Der Return Type ist ein Vertrag — Aenderungen werden sofort erkannt", "TypeScript kann Return Types nicht inferieren", "Ich weiss es nicht"], correct: 1, explanation: "Explizite Return Types verhindern dass Implementierungsaenderungen den oeffentlichen Typ stillschweigend aendern." },

  // ─── Sektion 2: any vs unknown vs never ─────────────────────────────────

  { sectionId: 2, question: "Wann sollte man 'any' statt 'unknown' verwenden?", options: ["Bei allen API-Responses", "Fast nie — nur bei Migration oder Typ-System-Grenzen", "Immer wenn man den Typ nicht kennt", "Ich weiss es nicht"], correct: 1, explanation: "unknown ist in 95% der Faelle die richtige Wahl. any nur temporaer bei Migration." },
  { sectionId: 2, question: "Was bedeutet 'any ist ansteckend'?", options: ["any verlangsamt den Compiler", "Jeder Zugriff auf any ergibt wieder any — es breitet sich aus", "any veraendert andere Typen im Projekt", "Ich weiss es nicht"], correct: 1, explanation: "const x: any; const y = x.foo; → y ist auch any. Das propagiert durch die gesamte Aufrufkette." },
  { sectionId: 2, question: "Welche drei Rollen hat 'never' in TypeScript?", options: ["Nur fuer Fehler", "Exhaustive Check, unmoegliche Funktion (throw), Typ-Level-Filterung", "Nur als Bottom-Type", "Ich weiss es nicht"], correct: 1, explanation: "never hat drei Hauptrollen: Exhaustive Checks, Funktionen die nie zurueckkehren, und Typ-Filterung (in Conditional Types)." },

  // ─── Sektion 3: Overengineering vermeiden ───────────────────────────────

  { sectionId: 3, question: "Was ist YAGNI?", options: ["You Aren't Gonna Need It — implementiere nichts bis du es brauchst", "Yet Another Generic Notation Interface", "Ein TypeScript-Compiler-Flag", "Ich weiss es nicht"], correct: 0, explanation: "YAGNI (Kent Beck, 1999): Schreibe den einfachsten Code der funktioniert. Gilt auch fuer Typen." },
  { sectionId: 3, question: "Wann ist ein Generic Over-Engineering?", options: ["Wenn T einen Constraint hat", "Wenn T nur einmal vorkommt und keinen Zusammenhang herstellt", "Wenn die Funktion weniger als 3 Zeilen hat", "Ich weiss es nicht"], correct: 1, explanation: "Generics verbinden Typen. Ein einzelnes T verbindet nichts — unknown ist einfacher und gleichwertig." },
  { sectionId: 3, question: "Wann lohnen sich Branded Types?", options: ["Immer fuer jeden String", "Wenn Verwechslung gleichfoermiger Werte echte Bugs verursachen wuerde", "Nur fuer Zahlen", "Ich weiss es nicht"], correct: 1, explanation: "Branded Types lohnen sich wenn UserId und OrderId verwechselt werden koennten — nicht fuer lokale Formularfelder." },

  // ─── Sektion 4: Type Assertions vs Type Guards ─────────────────────────

  { sectionId: 4, question: "Was ist der fundamentale Unterschied zwischen 'as User' und 'isUser(data)'?", options: ["Kein Unterschied", "'as' ist ein Trust-me ohne Pruefung, Type Guard ist ein Prove-it mit Runtime-Check", "'as' ist schneller", "Ich weiss es nicht"], correct: 1, explanation: "Assertions: Keine Runtime-Pruefung. Type Guards: Runtime-Pruefung. Assertions sind unsicher bei externen Daten." },
  { sectionId: 4, question: "Was macht eine Assertion Function (asserts value is T)?", options: ["Gibt boolean zurueck", "Wirft bei ungueltigem Wert und engt den Typ danach ein — ohne if noetig", "Konvertiert den Wert zur Laufzeit", "Ich weiss es nicht"], correct: 1, explanation: "asserts wirft bei Fehler. Danach ist der Typ eingeengt — kein if/else noetig." },
  { sectionId: 4, question: "Wann ist 'as' akzeptabel?", options: ["Bei jeder API-Response", "In Tests (Partial-Mocks) und bei Typ-System-Grenzen (Double Cast)", "Nie", "Ich weiss es nicht"], correct: 1, explanation: "In Tests, bei DOM-Zugriff mit instanceof-Check, und bei Double Casts an Typ-System-Grenzen." },

  // ─── Sektion 5: Defensive vs Offensive Typing ──────────────────────────

  { sectionId: 5, question: "Was ist 'Defensive Typing'?", options: ["Typen die Fehler verhindern", "Runtime-Validierung an Systemgrenzen wo das Typsystem nicht greifen kann", "Typen mit vielen Constraints", "Ich weiss es nicht"], correct: 1, explanation: "Defensive Typing prueft Daten zur Laufzeit an Stellen wo TypeScript keine Garantie geben kann (API, JSON.parse)." },
  { sectionId: 5, question: "Was ist 'Parse, Don't Validate'?", options: ["JSON.parse statt JSON.stringify", "Validiere UND transformiere in einen staerkeren Typ statt nur boolean zurueckzugeben", "Nutze regulaere Ausdruecke statt Typ-Guards", "Ich weiss es nicht"], correct: 1, explanation: "parseEmail(s): Email statt validateEmail(s): boolean. Der Typ ist der Beweis der Validierung." },
  { sectionId: 5, question: "Warum ist HttpClient.get<User>() problematisch?", options: ["HttpClient ist veraltet", "Der Generic ist eine getarnte Assertion — keine Runtime-Pruefung ob die API wirklich User liefert", "HttpClient unterstuetzt keine Generics", "Ich weiss es nicht"], correct: 1, explanation: "<User> verschwindet zur Laufzeit (Type Erasure). Wenn die API ein anderes Format liefert, merkt es niemand." },

  // ─── Sektion 6: Praxis ─────────────────────────────────────────────────

  { sectionId: 6, question: "Welches Refactoring hat den groessten Impact auf Typsicherheit?", options: ["Alle Strings durch Template Literals ersetzen", "Boolean-Flags durch Discriminated Unions ersetzen", "Alle Interfaces durch Types ersetzen", "Ich weiss es nicht"], correct: 1, explanation: "Boolean-Flags → Discriminated Union eliminiert unmoegliche Zustaende — ganze Fehlerkategorien verschwinden." },
  { sectionId: 6, question: "Was ist eine sinnvolle Metrik fuer TypeScript-Qualitaet?", options: ["Anzahl der Zeilen", "any-Dichte: Anzahl 'any' pro 1000 Zeilen", "Anzahl der Interfaces", "Ich weiss es nicht"], correct: 1, explanation: "Weniger any = mehr Compiler-Schutz = weniger Runtime-Bugs. Messbar und actionable." },
  { sectionId: 6, question: "Was sollte die wichtigste ESLint-Regel fuer TypeScript sein?", options: ["no-console", "@typescript-eslint/no-explicit-any", "prefer-const", "Ich weiss es nicht"], correct: 1, explanation: "no-explicit-any verhindert das haeufigste Anti-Pattern: das Typsystem per any zu deaktivieren." },
];
