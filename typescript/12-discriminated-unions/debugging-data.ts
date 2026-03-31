/**
 * Lektion 12 — Debugging Challenges: Discriminated Unions
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L12-D1",
    title: "Diskriminator ist kein Literal Type",
    buggyCode: [
      "type Dog = { animal: string; breed: string };",
      "type Cat = { animal: string; lives: number };",
      "type Pet = Dog | Cat;",
      "",
      "function describe(pet: Pet): string {",
      '  if (pet.animal === "dog") {',
      "    return `Hund: ${pet.breed}`;  // Error! breed existiert nicht auf Pet",
      "  }",
      '  return `Katze: ${pet.lives} Leben`;  // Error!',
      "}",
    ].join("\n"),
    errorMessage: "Property 'breed' does not exist on type 'Pet'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "animal ist 'string' statt einem Literal Type — TypeScript kann nicht narrowen",
      "if/else funktioniert nicht mit Discriminated Unions",
      "Pet braucht eine gemeinsame Basis-Klasse",
      "describe muss async sein",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat 'animal' in beiden Varianten?",
      "'animal: string' ist zu breit — TypeScript kann 'dog' nicht von 'cat' unterscheiden.",
      "Loesung: animal: 'dog' und animal: 'cat' als Literal Types.",
    ],
    fixedCode: [
      '// Literal Types als Diskriminator:',
      'type Dog = { animal: "dog"; breed: string };',
      'type Cat = { animal: "cat"; lives: number };',
      "type Pet = Dog | Cat;",
    ].join("\n"),
    explanation:
      "Discriminated Unions brauchen LITERAL Types als Diskriminator. " +
      "'string' ist zu breit — TypeScript kann nicht wissen welche " +
      "Variante vorliegt. Erst 'dog' und 'cat' als String Literals " +
      "ermoeglichen das Narrowing.",
    concept: "literal-discriminator",
    difficulty: 2,
  },

  {
    id: "L12-D2",
    title: "Destrukturierung bricht Narrowing",
    buggyCode: [
      "type Shape =",
      '  | { kind: "circle"; radius: number }',
      '  | { kind: "rect"; width: number; height: number };',
      "",
      "function area(shape: Shape): number {",
      "  const { kind } = shape;",
      '  if (kind === "circle") {',
      "    return Math.PI * shape.radius ** 2;  // Error!",
      "  }",
      "  return shape.width * shape.height;  // Error!",
      "}",
    ].join("\n"),
    errorMessage: "Property 'radius' does not exist on type 'Shape'.",
    bugType: "type-error",
    bugLine: 6,
    options: [
      "Destrukturierung bricht die Verbindung — shape wird nicht narrowed",
      "kind muss const sein",
      "switch ist pflicht bei Discriminated Unions",
      "Shape hat ein Tippfehler",
    ],
    correctOption: 0,
    hints: [
      "Was passiert wenn du kind in eine separate Variable destrukturierst?",
      "TypeScript verliert die Verbindung zwischen der Variable 'kind' und 'shape'.",
      "Loesung: Direkt shape.kind pruefen statt destrukturieren.",
    ],
    fixedCode: [
      "function area(shape: Shape): number {",
      "  // Direkt auf shape.kind pruefen — kein Destrukturieren!",
      '  if (shape.kind === "circle") {',
      "    return Math.PI * shape.radius ** 2;  // OK!",
      "  }",
      "  return shape.width * shape.height;  // OK!",
      "}",
    ].join("\n"),
    explanation:
      "Destrukturierung trennt den Wert vom Objekt. TypeScript kann " +
      "eine separate Variable nicht zurueck zum Original-Objekt verfolgen. " +
      "Loesung: Immer direkt shape.kind pruefen.",
    concept: "destructuring-narrowing",
    difficulty: 3,
  },

  {
    id: "L12-D3",
    title: "Fehlender Exhaustive Check",
    buggyCode: [
      "type Status = ",
      '  | { type: "active"; since: Date }',
      '  | { type: "inactive"; reason: string }',
      '  | { type: "banned"; until: Date };',
      "",
      "function statusText(status: Status): string {",
      "  switch (status.type) {",
      '    case "active": return `Aktiv seit ${status.since}`;',
      '    case "inactive": return `Inaktiv: ${status.reason}`;',
      "    // 'banned' fehlt!",
      "  }",
      "  // Kein assertNever — der Compiler warnt nicht deutlich",
      "}",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 10,
    options: [
      "Der case 'banned' fehlt und es gibt keinen Exhaustive Check mit assertNever",
      "switch funktioniert nicht mit Discriminated Unions",
      "Status braucht eine default-Variante",
      "statusText muss void zurueckgeben",
    ],
    correctOption: 0,
    hints: [
      "Was passiert wenn status.type === 'banned' ist?",
      "Ohne assertNever gibt TypeScript keine klare Warnung fuer fehlende Faelle.",
      "Fuegebassertever im default-Branch hinzu — dann zeigt der Compiler den fehlenden Fall.",
    ],
    fixedCode: [
      "function assertNever(value: never): never {",
      "  throw new Error(`Unbehandelt: ${JSON.stringify(value)}`);",
      "}",
      "",
      "function statusText(status: Status): string {",
      "  switch (status.type) {",
      '    case "active": return `Aktiv seit ${status.since}`;',
      '    case "inactive": return `Inaktiv: ${status.reason}`;',
      '    case "banned": return `Gesperrt bis ${status.until}`;',
      "    default: return assertNever(status);",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "Ohne assertNever zeigt TypeScript den fehlenden case nicht immer " +
      "deutlich an. Mit assertNever im default-Branch gibt es einen " +
      "klaren Compile-Error der den fehlenden Typ benennt.",
    concept: "exhaustive-check",
    difficulty: 2,
  },

  {
    id: "L12-D4",
    title: "Unmoeglicher Zustand durch Booleans",
    buggyCode: [
      "type FormState = {",
      "  isSubmitting: boolean;",
      "  isSuccess: boolean;",
      "  isError: boolean;",
      "  data: string | null;",
      "  error: string | null;",
      "};",
      "",
      "// Bug: Dieser Zustand sollte unmoegliche sein!",
      "const bug: FormState = {",
      "  isSubmitting: true,",
      "  isSuccess: true,   // Laden UND Erfolg gleichzeitig?!",
      "  isError: true,     // UND Fehler?!",
      "  data: 'result',    // UND Daten?!",
      "  error: 'oops',     // UND Fehlermeldung?!",
      "};",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 1,
    options: [
      "Booleans erlauben unmoegliche Zustandskombinationen — Discriminated Union verwenden",
      "isSubmitting muss readonly sein",
      "FormState braucht Validierung",
      "null-Checks fehlen",
    ],
    correctOption: 0,
    hints: [
      "Wie viele Kombinationen erlaubt diese Struktur?",
      "2^3 * 2 * 2 = 32 moegliche Zustaende — die meisten unsinnig.",
      'Modelliere mit Discriminated Union: { status: "idle" | "submitting" | "success" | "error"; ... }',
    ],
    fixedCode: [
      "type FormState =",
      '  | { status: "idle" }',
      '  | { status: "submitting" }',
      '  | { status: "success"; data: string }',
      '  | { status: "error"; error: string };',
      "",
      "// Jetzt sind nur gueltige Zustaende darstellbar!",
    ].join("\n"),
    explanation:
      "Boolean-Flags erlauben unsinnige Kombinationen (submitting + success + error). " +
      "Mit einer Discriminated Union hat jeder Zustand genau die Properties " +
      "die sinnvoll sind. 'Make impossible states impossible.'",
    concept: "impossible-states",
    difficulty: 3,
  },

  {
    id: "L12-D5",
    title: "Result<T, E> ohne Typ-Pruefung",
    buggyCode: [
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };",
      "",
      "function divide(a: number, b: number): Result<number, string> {",
      "  if (b === 0) return { ok: false, error: 'Division durch 0' };",
      "  return { ok: true, value: a / b };",
      "}",
      "",
      "const result = divide(10, 0);",
      "console.log(result.value);  // Error! value existiert nicht auf dem Error-Fall",
    ].join("\n"),
    errorMessage: "Property 'value' does not exist on type '{ ok: false; error: string }'.",
    bugType: "type-error",
    bugLine: 9,
    options: [
      "Man muss result.ok pruefen bevor man auf result.value zugreift",
      "divide muss try/catch verwenden",
      "Result braucht immer beide Properties",
      "const result muss den Typ angeben",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat result nach divide(10, 0)?",
      "result ist Result<number, string> — es koennte ok oder error sein.",
      "Loesung: if (result.ok) { result.value } else { result.error }",
    ],
    fixedCode: [
      "const result = divide(10, 0);",
      "if (result.ok) {",
      "  console.log(result.value);  // Sicher — TypeScript hat narrowed",
      "} else {",
      "  console.log(result.error);  // Sicher — der Fehlerfall",
      "}",
    ].join("\n"),
    explanation:
      "Result<T, E> erzwingt die Pruefung des Diskriminators 'ok'. " +
      "Ohne Pruefung weiss TypeScript nicht ob value oder error existiert. " +
      "Das ist der ganze Sinn von Result — erzwungene Fehlerbehandlung.",
    concept: "result-narrowing",
    difficulty: 2,
  },
];
