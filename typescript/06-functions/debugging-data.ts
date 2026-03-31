/**
 * Lektion 06 — Debugging Challenges: Functions
 *
 * 5 Challenges zu Overloads, void-Callbacks, this-Verlust,
 * Type Guards und Destructuring-Typisierung.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: Overload-Reihenfolge ────────────────────────────────
  {
    id: "L06-D1",
    title: "Overload-Reihenfolge fuehrt zu falschem Typ",
    buggyCode: [
      "function process(value: string | number): number;",
      "function process(value: string): string;",
      "function process(value: string | number): string | number {",
      "  if (typeof value === 'string') return value.toUpperCase();",
      "  return value * 2;",
      "}",
      "",
      "const result = process('hello');",
      "// result hat Typ: number — aber es ist ein string!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 1,
    options: [
      "Der breite Overload steht VOR dem spezifischen — falsche Reihenfolge",
      "Die Implementation Signature ist falsch typisiert",
      "process braucht einen dritten Overload fuer number",
      "typeof-Check ist nicht zuverlaessig",
    ],
    correctOption: 0,
    hints: [
      "In welcher Reihenfolge prueft TypeScript die Overloads?",
      "TypeScript prueft von oben nach unten und nimmt den ERSTEN Treffer.",
      "'string' passt auf 'string | number' — der breite Overload matcht zuerst. " +
        "Loesung: Spezifische Overloads ZUERST.",
    ],
    fixedCode: [
      "function process(value: string): string;",
      "function process(value: string | number): number;",
      "function process(value: string | number): string | number {",
      "  if (typeof value === 'string') return value.toUpperCase();",
      "  return value * 2;",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript prueft Overloads von oben nach unten. Der breite Overload " +
      "(string | number) matchte zuerst auf 'hello' (ein string). Dadurch bekam " +
      "result den Typ number statt string. Regel: Spezifische Overloads immer " +
      "VOR breiteren platzieren.",
    concept: "overload-ordering",
    difficulty: 3,
  },

  // ─── Challenge 2: this-Verlust bei Event-Handler ──────────────────────
  {
    id: "L06-D2",
    title: "this geht beim Event-Handler verloren",
    buggyCode: [
      "class Counter {",
      "  count = 0;",
      "",
      "  increment() {",
      "    this.count++;",
      "    console.log(`Count: ${this.count}`);",
      "  }",
      "}",
      "",
      "const counter = new Counter();",
      "const btn = document.querySelector('button');",
      "btn?.addEventListener('click', counter.increment);",
      "// Klick -> 'Count: NaN' statt 'Count: 1'",
    ].join("\n"),
    bugType: "runtime-error",
    bugLine: 12,
    options: [
      "counter.increment verliert this beim Uebergeben als Callback",
      "addEventListener erwartet keinen Return-Wert",
      "querySelector gibt null zurueck",
      "count muss als static deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Was ist 'this' wenn eine Methode als Callback uebergeben wird?",
      "Beim Uebergeben von counter.increment wird nur die Funktion " +
        "extrahiert — ohne this-Binding.",
      "Loesungen: Arrow Function als Wrapper, .bind(counter), oder " +
        "increment als Arrow-Property deklarieren.",
    ],
    fixedCode: [
      "class Counter {",
      "  count = 0;",
      "",
      "  // Loesung 1: Arrow Property (bindet this automatisch)",
      "  increment = () => {",
      "    this.count++;",
      "    console.log(`Count: ${this.count}`);",
      "  };",
      "}",
      "",
      "const counter = new Counter();",
      "const btn = document.querySelector('button');",
      "btn?.addEventListener('click', counter.increment);",
    ].join("\n"),
    explanation:
      "Wenn man counter.increment als Callback uebergibt, wird nur die " +
      "Funktionsreferenz extrahiert — das this-Binding geht verloren. " +
      "Beim Aufruf durch addEventListener ist this das Button-Element, " +
      "nicht die Counter-Instanz. Arrow Functions als Class Properties " +
      "loesen das Problem, weil sie this lexikalisch binden.",
    concept: "this-binding-callbacks",
    difficulty: 3,
  },

  // ─── Challenge 3: Destructuring-Typ falsch ────────────────────────────
  {
    id: "L06-D3",
    title: "Destructuring-Parameter falsch typisiert",
    buggyCode: [
      "function createUser({ name: string, age: number }) {",
      "  console.log(name, age);",
      "}",
      "",
      "createUser({ name: 'Max', age: 30 });",
    ].join("\n"),
    errorMessage:
      "Cannot find name 'name'. Cannot find name 'age'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "name: string ist eine UMBENENNUNG, kein Typ — string wird zur Variable",
      "Destructuring funktioniert nicht in Funktionsparametern",
      "createUser braucht einen generischen Typ",
      "name und age muessen mit let deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Was bedeutet { key: value } in Destructuring-Syntax?",
      "In Destructuring ist { name: string } eine UMBENENNUNG: " +
        "Die Property 'name' wird in eine Variable namens 'string' umbenannt.",
      "Richtig: { name, age }: { name: string; age: number }. " +
        "Der Typ kommt NACH dem gesamten Destructuring-Pattern.",
    ],
    fixedCode: [
      "function createUser({ name, age }: { name: string; age: number }) {",
      "  console.log(name, age);",
      "}",
      "",
      "createUser({ name: 'Max', age: 30 });",
    ].join("\n"),
    explanation:
      "In JavaScript-Destructuring bedeutet { name: string } dass die Property " +
      "'name' in eine Variable namens 'string' umbenannt wird — es ist KEINE " +
      "Typ-Annotation! Der Typ muss NACH dem gesamten Pattern stehen: " +
      "{ name, age }: { name: string; age: number }.",
    concept: "destructuring-type-syntax",
    difficulty: 2,
  },

  // ─── Challenge 4: Type Guard gibt immer true ──────────────────────────
  {
    id: "L06-D4",
    title: "Fehlerhafter Type Guard — keine Laufzeitpruefung",
    buggyCode: [
      "interface Admin {",
      "  name: string;",
      "  permissions: string[];",
      "}",
      "",
      "function isAdmin(user: unknown): user is Admin {",
      "  return typeof user === 'object' && user !== null;",
      "}",
      "",
      "const data: unknown = { name: 'Max' };",
      "if (isAdmin(data)) {",
      "  console.log(data.permissions.join(', '));",
      "  // Laufzeitfehler: Cannot read property 'join' of undefined",
      "}",
    ].join("\n"),
    bugType: "runtime-error",
    bugLine: 7,
    options: [
      "Der Type Guard prueft nur ob es ein Objekt ist, nicht ob permissions existiert",
      "isAdmin sollte eine Assertion Function sein",
      "unknown kann nicht mit typeof geprueft werden",
      "permissions muss als optional deklariert werden",
    ],
    correctOption: 0,
    hints: [
      "Was prueft der Type Guard tatsaechlich?",
      "Er prueft nur: Ist es ein nicht-null Objekt? Das reicht nicht fuer Admin.",
      "Der Guard muss auch 'permissions' in value pruefen und den Typ " +
        "von permissions als Array verifizieren.",
    ],
    fixedCode: [
      "function isAdmin(user: unknown): user is Admin {",
      "  return (",
      "    typeof user === 'object' &&",
      "    user !== null &&",
      "    'name' in user &&",
      "    'permissions' in user &&",
      "    Array.isArray((user as Admin).permissions)",
      "  );",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript prueft NICHT ob ein Type Guard korrekt implementiert ist. " +
      "Es vertraut dem Entwickler. Der urspruengliche Guard prueft nur ob " +
      "user ein Objekt ist — aber nicht ob es die Admin-Properties hat. " +
      "Bei einem fehlerhaften Guard entstehen Laufzeitfehler die TypeScript " +
      "nicht verhindern kann.",
    concept: "type-guard-correctness",
    difficulty: 4,
  },

  // ─── Challenge 5: Default-Parameter-Position ──────────────────────────
  {
    id: "L06-D5",
    title: "Optionaler Parameter vor Pflichtparameter",
    buggyCode: [
      "function formatPrice(currency?: string, amount: number): string {",
      "  return `${amount} ${currency ?? 'EUR'}`;",
      "}",
      "",
      "formatPrice(9.99);",
      "// Erwartet: '9.99 EUR'",
    ].join("\n"),
    errorMessage:
      "A required parameter cannot follow an optional parameter.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "Optionale Parameter muessen NACH Pflichtparametern stehen",
      "currency braucht einen Default-Wert statt ?",
      "formatPrice muss als Arrow Function geschrieben werden",
      "amount muss auch optional sein",
    ],
    correctOption: 0,
    hints: [
      "In welcher Reihenfolge muessen optionale und Pflichtparameter stehen?",
      "JavaScript-Argumente sind positionsbasiert. Wenn ein optionaler " +
        "Parameter vor einem Pflichtparameter steht, muesste man undefined " +
        "als Platzhalter uebergeben.",
      "Loesung: Reihenfolge umdrehen oder ein Options-Objekt verwenden.",
    ],
    fixedCode: [
      "function formatPrice(amount: number, currency?: string): string {",
      "  return `${amount} ${currency ?? 'EUR'}`;",
      "}",
      "",
      "formatPrice(9.99); // '9.99 EUR'",
    ].join("\n"),
    explanation:
      "Optionale Parameter muessen NACH Pflichtparametern stehen. JavaScript-Argumente " +
      "sind positionsbasiert — wenn currency optional ist und vor amount steht, " +
      "muesste man formatPrice(undefined, 9.99) schreiben. TypeScript verhindert " +
      "dieses Anti-Pattern. Alternative: Options-Objekt.",
    concept: "parameter-ordering",
    difficulty: 2,
  },
];
