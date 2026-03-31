/**
 * Lektion 11 — Debugging Challenges: Type Narrowing
 *
 * 5 Challenges zu Narrowing-Fehlern:
 * typeof null, Truthiness-Falle, fehlerhafte Type Guards,
 * Narrowing ueber Funktionsgrenzen, fehlender Exhaustive Check.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: typeof null Narrowing ─────────────────────────────────
  {
    id: "L11-D1",
    title: "typeof null vergessen",
    buggyCode: [
      "function getKeys(value: object | string | null): string[] {",
      "  if (typeof value === 'object') {",
      "    return Object.keys(value);",
      "  }",
      "  return [];",
      "}",
      "",
      "console.log(getKeys({ a: 1 }));  // erwartet: ['a']",
      "console.log(getKeys(null));       // erwartet: [] — crasht!",
    ].join("\n"),
    errorMessage: "TypeError: Cannot convert null to object",
    bugType: "runtime-error",
    bugLine: 3,
    options: [
      "Object.keys funktioniert nicht mit einfachen Objekten",
      "typeof null gibt 'object' zurueck — null kommt durch den Check",
      "Der Rueckgabetyp string[] ist falsch",
      "typeof value === 'object' ist nie true",
    ],
    correctOption: 1,
    hints: [
      "Was gibt typeof null zurueck? Ist es 'null' oder etwas anderes?",
      "typeof null === 'object' ist true — ein historischer JavaScript-Bug.",
      "Fuege einen null-Check hinzu: if (typeof value === 'object' && value !== null).",
    ],
    fixedCode: [
      "function getKeys(value: object | string | null): string[] {",
      "  if (typeof value === 'object' && value !== null) {",
      "    return Object.keys(value);",
      "  }",
      "  return [];",
      "}",
      "",
      "console.log(getKeys({ a: 1 }));  // ['a']",
      "console.log(getKeys(null));       // []",
    ].join("\n"),
    explanation:
      "typeof null gibt 'object' zurueck — ein beruechtigter JavaScript-Bug " +
      "seit 1995. TypeScript narrowt nach typeof === 'object' zu object | null, " +
      "nicht nur object. Man muss null IMMER separat pruefen.",
    concept: "typeof-null",
    difficulty: 1,
  },

  // ─── Challenge 2: Truthiness-Falle bei 0 ───────────────────────────────
  {
    id: "L11-D2",
    title: "Truthiness eliminiert gueltige Werte",
    buggyCode: [
      "interface Settings {",
      "  volume: number;",
      "  brightness: number;",
      "}",
      "",
      "function applySettings(s: Partial<Settings>): Settings {",
      "  return {",
      "    volume: s.volume || 50,",
      "    brightness: s.brightness || 75,",
      "  };",
      "}",
      "",
      "const result = applySettings({ volume: 0, brightness: 0 });",
      "console.log(result.volume);     // erwartet: 0, erhaelt: 50",
      "console.log(result.brightness); // erwartet: 0, erhaelt: 75",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 8,
    options: [
      "Partial macht die Werte immer undefined",
      "|| behandelt 0 als falsy und nimmt den Fallback-Wert",
      "volume und brightness koennen nicht 0 sein",
      "Die Reihenfolge der Properties ist falsch",
    ],
    correctOption: 1,
    hints: [
      "Welche Werte sind in JavaScript 'falsy'? Ist 0 dabei?",
      "0 ist falsy! 0 || 50 ergibt 50. 0 ?? 50 ergibt 0.",
      "Ersetze || durch ?? (Nullish Coalescing) — es prueft nur null/undefined.",
    ],
    fixedCode: [
      "interface Settings {",
      "  volume: number;",
      "  brightness: number;",
      "}",
      "",
      "function applySettings(s: Partial<Settings>): Settings {",
      "  return {",
      "    volume: s.volume ?? 50,",
      "    brightness: s.brightness ?? 75,",
      "  };",
      "}",
      "",
      "const result = applySettings({ volume: 0, brightness: 0 });",
      "console.log(result.volume);     // 0",
      "console.log(result.brightness); // 0",
    ].join("\n"),
    explanation:
      "Der ||-Operator prueft auf alle falsy-Werte (0, '', false, null, " +
      "undefined, NaN). Da 0 falsy ist, gibt 0 || 50 den Wert 50 zurueck. " +
      "Der ?? Operator (Nullish Coalescing) prueft nur auf null/undefined, " +
      "sodass 0 ?? 50 korrekt 0 zurueckgibt.",
    concept: "truthiness-narrowing",
    difficulty: 2,
  },

  // ─── Challenge 3: Narrowing ueberlebt Funktionsaufrufe nicht ──────────
  {
    id: "L11-D3",
    title: "Narrowing ueber Funktionsgrenzen",
    buggyCode: [
      "function isString(value: unknown): boolean {",
      "  return typeof value === 'string';",
      "}",
      "",
      "function process(input: string | number) {",
      "  if (isString(input)) {",
      "    console.log(input.toUpperCase());",
      "  }",
      "}",
    ].join("\n"),
    errorMessage: "Property 'toUpperCase' does not exist on type 'string | number'",
    bugType: "type-error",
    bugLine: 7,
    options: [
      "isString gibt den falschen Wert zurueck",
      "TypeScript narrowt nicht ueber normale boolean-Funktionen — Type Guard noetig",
      "input muss zuerst unknown sein",
      "toUpperCase ist keine gueltige Methode",
    ],
    correctOption: 1,
    hints: [
      "Was ist der Rueckgabetyp von isString? Nur boolean — kein Narrowing!",
      "TypeScript sieht nur 'boolean', nicht WELCHE Pruefung gemacht wurde.",
      "Aendere den Rueckgabetyp zu 'value is string' — das ist ein Type Predicate.",
    ],
    fixedCode: [
      "function isString(value: unknown): value is string {",
      "  return typeof value === 'string';",
      "}",
      "",
      "function process(input: string | number) {",
      "  if (isString(input)) {",
      "    console.log(input.toUpperCase()); // input: string",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript narrowt NICHT ueber normale Funktionsaufrufe. Eine Funktion " +
      "die boolean zurueckgibt, sagt dem Compiler nichts ueber den Typ des " +
      "Parameters. Man muss ein Type Predicate verwenden (value is string), " +
      "damit TypeScript den Parameter nach dem Aufruf narrowen kann.",
    concept: "type-predicates",
    difficulty: 3,
  },

  // ─── Challenge 4: Fehlerhafter Type Guard ──────────────────────────────
  {
    id: "L11-D4",
    title: "Type Guard prueft nicht alle Felder",
    buggyCode: [
      "interface Product {",
      "  id: number;",
      "  name: string;",
      "  price: number;",
      "}",
      "",
      "function isProduct(data: unknown): data is Product {",
      "  return typeof data === 'object' && data !== null && 'name' in data;",
      "}",
      "",
      "const apiData: unknown = { name: 'Laptop' };",
      "if (isProduct(apiData)) {",
      "  console.log(apiData.price.toFixed(2)); // Crash!",
      "}",
    ].join("\n"),
    errorMessage: "TypeError: Cannot read property 'toFixed' of undefined",
    bugType: "runtime-error",
    bugLine: 8,
    options: [
      "Der in-Operator funktioniert nicht mit unknown",
      "Der Type Guard prueft nur 'name', nicht 'id' und 'price' — unvollstaendig",
      "toFixed funktioniert nicht mit dem Product-Typ",
      "typeof data === 'object' schliesst Arrays nicht aus",
    ],
    correctOption: 1,
    hints: [
      "Welche Properties prueft isProduct? Und welche braucht Product?",
      "isProduct prueft nur 'name'. 'id' und 'price' werden nicht geprueft.",
      "Pruefe alle Felder: 'id' in data, 'name' in data, 'price' in data, plus typeof-Checks.",
    ],
    fixedCode: [
      "interface Product {",
      "  id: number;",
      "  name: string;",
      "  price: number;",
      "}",
      "",
      "function isProduct(data: unknown): data is Product {",
      "  if (typeof data !== 'object' || data === null) return false;",
      "  const obj = data as Record<string, unknown>;",
      "  return (",
      "    typeof obj.id === 'number' &&",
      "    typeof obj.name === 'string' &&",
      "    typeof obj.price === 'number'",
      "  );",
      "}",
      "",
      "const apiData: unknown = { name: 'Laptop' };",
      "if (isProduct(apiData)) {",
      "  console.log(apiData.price.toFixed(2));",
      "}",
    ].join("\n"),
    explanation:
      "TypeScript vertraut Type Guards blind. Wenn der Guard nur 'name' " +
      "prueft aber nicht 'id' und 'price', ist das Objekt laut TypeScript " +
      "ein vollstaendiges Product — obwohl 'price' fehlt. " +
      "apiData.price ist undefined, .toFixed() crasht. " +
      "ALLE Felder muessen in einem Type Guard geprueft werden.",
    concept: "type-predicates",
    difficulty: 3,
  },

  // ─── Challenge 5: Fehlender Exhaustive Check ──────────────────────────
  {
    id: "L11-D5",
    title: "Neuer Union-Wert ohne Case",
    buggyCode: [
      "type Status = 'active' | 'inactive' | 'suspended' | 'deleted';",
      "",
      "function getLabel(status: Status): string {",
      "  switch (status) {",
      "    case 'active':    return 'Aktiv';",
      "    case 'inactive':  return 'Inaktiv';",
      "    case 'suspended': return 'Gesperrt';",
      "    // 'deleted' vergessen!",
      "  }",
      "  // Was wird bei 'deleted' zurueckgegeben?",
      "}",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 9,
    options: [
      "TypeScript meldet automatisch dass 'deleted' fehlt",
      "Die Funktion gibt undefined zurueck bei 'deleted' — kein Compile-Fehler",
      "switch funktioniert nicht mit Union Types",
      "'deleted' wird als 'active' behandelt",
    ],
    correctOption: 1,
    hints: [
      "Was passiert wenn kein case matched und kein default existiert?",
      "Die Funktion laeuft ueber das switch hinaus und gibt implizit undefined zurueck.",
      "Fuege einen default mit assertNever hinzu: default: return assertNever(status);",
    ],
    fixedCode: [
      "function assertNever(value: never): never {",
      "  throw new Error(`Unbehandelter Fall: ${value}`);",
      "}",
      "",
      "type Status = 'active' | 'inactive' | 'suspended' | 'deleted';",
      "",
      "function getLabel(status: Status): string {",
      "  switch (status) {",
      "    case 'active':    return 'Aktiv';",
      "    case 'inactive':  return 'Inaktiv';",
      "    case 'suspended': return 'Gesperrt';",
      "    case 'deleted':   return 'Geloescht';",
      "    default:          return assertNever(status);",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "Ohne assertNever im default gibt TypeScript bei fehlenden Faellen " +
      "keinen garantierten Fehler. Die Funktion gibt bei 'deleted' implizit " +
      "undefined zurueck — obwohl der Rueckgabetyp string ist. " +
      "Mit assertNever meldet TypeScript sofort: " +
      "'Type \"deleted\" is not assignable to type \"never\"'.",
    concept: "exhaustive-checks",
    difficulty: 2,
  },
];
