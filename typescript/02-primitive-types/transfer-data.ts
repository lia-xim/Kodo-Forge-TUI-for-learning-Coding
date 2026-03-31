/**
 * Lektion 02 -- Transfer Tasks: Primitive Types
 *
 * Diese Tasks nehmen die Konzepte aus der Primitive-Types-Lektion und wenden
 * sie in komplett neuen Kontexten an:
 *
 *  1. Geldbetraege korrekt modellieren (number-Fallen)
 *  2. API-Daten von any zu unknown refactoren
 *  3. Eingabe-Validierung mit Typschutz
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Geldbetraege modellieren ──────────────────────────────────
  {
    id: "02-geldbetraege",
    title: "Geldbetraege korrekt modellieren",
    prerequisiteLessons: [2],
    scenario:
      "Du arbeitest an einem Online-Shop. Ein Kunde beschwert sich, dass " +
      "seine Bestellung 19.99 + 5.01 = 25.009999999999998 Euro kostet. " +
      "Ein anderer Entwickler hat ueberall 'number' fuer Geldbetraege " +
      "verwendet und rechnet in Euro mit Dezimalstellen.",
    task:
      "Modelliere Geldbetraege typsicher in TypeScript.\n\n" +
      "1. Warum ist 'number' fuer Geld gefaehrlich? (IEEE 754)\n" +
      "2. Erstelle einen Typ 'Cents' der Geldbetraege als ganze Zahlen " +
      "   in Cent repraesentiert (1999 statt 19.99)\n" +
      "3. Schreibe eine Funktion 'addMoney' die zwei Cent-Werte addiert\n" +
      "4. Schreibe eine Funktion 'formatEuro' die Cents als Euro-String " +
      "   formatiert (z.B. 1999 -> '19,99 EUR')\n" +
      "5. Bonus: Koennte 'bigint' hier helfen? Wann wuerde man es einsetzen?",
    starterCode: [
      "// Dein Typ fuer Geldbetraege",
      "type Cents = ???;",
      "",
      "function addMoney(a: Cents, b: Cents): Cents {",
      "  // TODO",
      "}",
      "",
      "function formatEuro(cents: Cents): string {",
      "  // TODO: 1999 -> '19,99 EUR'",
      "}",
      "",
      "// Test:",
      "// addMoney(1999, 501)  sollte 2500 ergeben",
      "// formatEuro(2500)     sollte '25,00 EUR' ergeben",
    ].join("\n"),
    solutionCode: [
      "// ═══ Warum number fuer Geld gefaehrlich ist ═══",
      "// JavaScript nutzt IEEE 754 double-precision floats.",
      "// 0.1 + 0.2 === 0.30000000000000004  (nicht 0.3!)",
      "// 19.99 + 5.01 === 25.009999999999998 (nicht 25.00!)",
      "//",
      "// Loesung: Immer in der kleinsten Einheit rechnen (Cent).",
      "// Ganzzahlen haben dieses Problem nicht.",
      "",
      "// Branded Type: Verhindert versehentliche Verwechslung",
      "// mit normalen Zahlen",
      "type Cents = number & { readonly __brand: 'Cents' };",
      "",
      "// Helper um eine Zahl als Cents zu markieren",
      "function asCents(value: number): Cents {",
      "  if (!Number.isInteger(value)) {",
      "    throw new Error('Cents muessen ganzzahlig sein: ' + value);",
      "  }",
      "  return value as Cents;",
      "}",
      "",
      "function addMoney(a: Cents, b: Cents): Cents {",
      "  return asCents(a + b);",
      "}",
      "",
      "function formatEuro(cents: Cents): string {",
      "  const euro = Math.floor(cents / 100);",
      "  const rest = Math.abs(cents % 100);",
      "  const restStr = rest < 10 ? '0' + rest : '' + rest;",
      "  return euro + ',' + restStr + ' EUR';",
      "}",
      "",
      "// ═══ Test ═══",
      "// const preis = asCents(1999);",
      "// const versand = asCents(501);",
      "// const total = addMoney(preis, versand); // 2500",
      "// formatEuro(total); // '25,00 EUR'",
      "",
      "// ═══ Wann bigint? ═══",
      "// Bei sehr grossen Betraegen (z.B. Kryptowaehrungen,",
      "// Interbanken-Transfers). number ist sicher bis",
      "// Number.MAX_SAFE_INTEGER (9007199254740991 Cent =",
      "// ca. 90 Billionen Euro). Fuer die meisten Apps reicht number.",
    ].join("\n"),
    conceptsBridged: [
      "number / IEEE 754",
      "Branded Types",
      "bigint vs number",
      "Ganzzahl-Arithmetik",
    ],
    hints: [
      "Denke an IEEE 754: Warum ist 0.1 + 0.2 !== 0.3 in JavaScript? Welche Konsequenz hat das fuer Geldbetraege?",
      "Wenn du in Cent rechnest (ganze Zahlen), umgehst du das Fliesskomma-Problem komplett. 1999 Cent statt 19.99 Euro.",
      "Ein 'Branded Type' (type Cents = number & { __brand: 'Cents' }) verhindert, dass du versehentlich normale Zahlen als Cents behandelst.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: API-Daten any zu unknown ──────────────────────────────────
  {
    id: "02-any-zu-unknown",
    title: "API-Daten: von any zu unknown refactoren",
    prerequisiteLessons: [2],
    scenario:
      "Du uebernimmst ein Projekt in dem die fetch-Aufrufe so aussehen:\n" +
      "  const data: any = await response.json();\n" +
      "  showUser(data.name, data.age);\n\n" +
      "Letzte Woche gab es einen Bug: Die API hat das Feld 'name' in " +
      "'displayName' umbenannt. Niemand hat den Fehler bemerkt bis " +
      "Kunden 'undefined' auf dem Bildschirm sahen.",
    task:
      "Refactore den Code von 'any' zu 'unknown' und baue eine " +
      "sichere Validierung ein.\n\n" +
      "1. Warum hat 'any' den Bug verschleiert?\n" +
      "2. Schreibe eine Funktion 'parseUser' die einen unknown-Wert " +
      "   entgegennimmt und entweder einen validierten User oder " +
      "   einen Fehler zurueckgibt\n" +
      "3. Nutze Type Guards (typeof, 'in'-Operator) um die Struktur " +
      "   zur Laufzeit zu pruefen\n" +
      "4. Erklaere warum unknown hier besser ist als any",
    starterCode: [
      "interface User {",
      "  displayName: string;",
      "  age: number;",
      "  email: string;",
      "}",
      "",
      "// VORHER (unsicher):",
      "// const data: any = await response.json();",
      "// showUser(data.name, data.age); // Bug: name -> displayName",
      "",
      "// NACHHER (sicher):",
      "function parseUser(data: unknown): User {",
      "  // TODO: Validiere dass data ein User ist",
      "  // Wirf einen Fehler wenn die Struktur nicht passt",
      "}",
    ].join("\n"),
    solutionCode: [
      "interface User {",
      "  displayName: string;",
      "  age: number;",
      "  email: string;",
      "}",
      "",
      "// ═══ Warum any den Bug verschleiert ═══",
      "// 'any' schaltet das Typsystem komplett ab.",
      "// data.name -> kein Fehler, obwohl 'name' nicht existiert",
      "// data.wasAuchImmer -> kein Fehler, TypeScript prueft nichts",
      "//",
      "// 'unknown' dagegen erzwingt eine Pruefung VOR dem Zugriff.",
      "// Man MUSS beweisen, dass die Daten die richtige Struktur haben.",
      "",
      "function isObject(value: unknown): value is Record<string, unknown> {",
      "  return typeof value === 'object' && value !== null && !Array.isArray(value);",
      "}",
      "",
      "function parseUser(data: unknown): User {",
      "  if (!isObject(data)) {",
      "    throw new Error('User-Daten muessen ein Objekt sein, erhalten: ' + typeof data);",
      "  }",
      "",
      "  if (typeof data.displayName !== 'string') {",
      "    throw new Error('displayName fehlt oder ist kein String');",
      "  }",
      "  if (typeof data.age !== 'number' || !Number.isFinite(data.age)) {",
      "    throw new Error('age fehlt oder ist keine gueltige Zahl');",
      "  }",
      "  if (typeof data.email !== 'string') {",
      "    throw new Error('email fehlt oder ist kein String');",
      "  }",
      "",
      "  return {",
      "    displayName: data.displayName,",
      "    age: data.age,",
      "    email: data.email,",
      "  };",
      "}",
      "",
      "// ═══ Warum unknown besser ist ═══",
      "// 1. unknown erzwingt Validierung — kein Zugriff ohne Pruefung",
      "// 2. Fehler werden sofort erkannt, nicht erst beim Kunden",
      "// 3. Die Fehlermeldungen sagen genau WAS fehlt",
      "// 4. Der Compiler hilft: data.name wuerde einen Fehler geben",
    ].join("\n"),
    conceptsBridged: [
      "any vs unknown",
      "Type Guards",
      "Laufzeit-Validierung",
      "typeof / in-Operator",
    ],
    hints: [
      "any schaltet das Typsystem ab — du kannst auf jedes Feld zugreifen ohne Fehler. unknown dagegen verlangt eine Pruefung vor jedem Zugriff.",
      "Bevor du auf Felder zugreifen kannst, musst du beweisen, dass es ein Objekt ist (typeof === 'object' && !== null). Dann kannst du einzelne Felder pruefen.",
      "Nutze typeof fuer Primitives (string, number) und den 'in'-Operator oder direkte Feld-Checks fuer Objekt-Eigenschaften.",
    ],
    difficulty: 3,
  },

  // ─── Task 3: Eingabe-Validierung ───────────────────────────────────────
  {
    id: "02-eingabe-validierung",
    title: "Formular-Validierung mit Typ-Narrowing",
    prerequisiteLessons: [2],
    scenario:
      "Du baust ein Registrierungsformular. Die Eingaben kommen als " +
      "Strings aus den Input-Feldern. Bevor du die Daten speicherst, " +
      "musst du sicherstellen: Alter ist eine gueltige Zahl (16-120), " +
      "E-Mail enthaelt ein @, Passwort hat mindestens 8 Zeichen. " +
      "Aktuell gibt die App nur 'Ungueltige Eingabe' zurueck — " +
      "kein Nutzer weiss, was falsch ist.",
    task:
      "Baue eine typsichere Validierung die konkrete Fehlermeldungen gibt.\n\n" +
      "1. Definiere einen Ergebnis-Typ: entweder Erfolg (mit Daten) " +
      "   oder Fehler (mit Fehlerliste)\n" +
      "2. Schreibe eine validate-Funktion die alle Felder prueft\n" +
      "3. Nutze null/undefined korrekt mit strictNullChecks\n" +
      "4. Zeige wie der Aufrufer das Ergebnis sicher nutzen kann " +
      "   (Typ-Narrowing auf das Result)",
    starterCode: [
      "// Definiere einen Result-Typ: Erfolg oder Fehler",
      "type ValidationResult = ???;",
      "",
      "interface RegistrationData {",
      "  username: string;",
      "  age: number;",
      "  email: string;",
      "}",
      "",
      "function validateRegistration(",
      "  username: string | null,",
      "  ageStr: string | null,",
      "  email: string | null,",
      "  password: string | null",
      "): ValidationResult {",
      "  // TODO: Validiere alle Felder, sammle alle Fehler",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Discriminated Union fuer das Ergebnis ═══",
      "type ValidationResult =",
      "  | { success: true; data: RegistrationData }",
      "  | { success: false; errors: string[] };",
      "",
      "interface RegistrationData {",
      "  username: string;",
      "  age: number;",
      "  email: string;",
      "}",
      "",
      "function validateRegistration(",
      "  username: string | null,",
      "  ageStr: string | null,",
      "  email: string | null,",
      "  password: string | null",
      "): ValidationResult {",
      "  const errors: string[] = [];",
      "",
      "  // Username: nicht null, nicht leer",
      "  if (username === null || username === undefined || username.trim().length === 0) {",
      "    errors.push('Benutzername darf nicht leer sein');",
      "  }",
      "",
      "  // Alter: gueltige Zahl zwischen 16 und 120",
      "  let age: number | undefined;",
      "  if (ageStr === null || ageStr === undefined) {",
      "    errors.push('Alter ist erforderlich');",
      "  } else {",
      "    age = Number(ageStr);",
      "    if (Number.isNaN(age)) {",
      "      errors.push('Alter muss eine Zahl sein');",
      "    } else if (age < 16 || age > 120) {",
      "      errors.push('Alter muss zwischen 16 und 120 liegen');",
      "    }",
      "  }",
      "",
      "  // E-Mail: nicht null, muss @ enthalten",
      "  if (email === null || email === undefined) {",
      "    errors.push('E-Mail ist erforderlich');",
      "  } else if (!email.includes('@')) {",
      "    errors.push('E-Mail muss ein @-Zeichen enthalten');",
      "  }",
      "",
      "  // Passwort: mindestens 8 Zeichen",
      "  if (password === null || password === undefined) {",
      "    errors.push('Passwort ist erforderlich');",
      "  } else if (password.length < 8) {",
      "    errors.push('Passwort muss mindestens 8 Zeichen haben');",
      "  }",
      "",
      "  if (errors.length > 0) {",
      "    return { success: false, errors };",
      "  }",
      "",
      "  // Hier weiss TypeScript noch nicht, dass alle Werte da sind.",
      "  // Wir wissen es aber, weil wir alle Fehler oben abgefangen haben.",
      "  return {",
      "    success: true,",
      "    data: {",
      "      username: username!.trim(),",
      "      age: age!,",
      "      email: email!,",
      "    },",
      "  };",
      "}",
      "",
      "// ═══ Nutzung mit Typ-Narrowing ═══",
      "// const result = validateRegistration('Anna', '25', 'anna@mail.de', 'geheim123');",
      "// if (result.success) {",
      "//   // TypeScript weiss: result.data existiert",
      "//   console.log(result.data.username);",
      "// } else {",
      "//   // TypeScript weiss: result.errors existiert",
      "//   console.log(result.errors.join(', '));",
      "// }",
    ].join("\n"),
    conceptsBridged: [
      "null / undefined",
      "strictNullChecks",
      "Discriminated Unions",
      "Typ-Narrowing",
      "string | null Parameter",
    ],
    hints: [
      "Definiere das Ergebnis als Discriminated Union: { success: true, data: ... } | { success: false, errors: string[] }. Das gemeinsame Feld 'success' erlaubt sicheres Narrowing.",
      "Jeder Parameter ist string | null. Du musst erst pruefen ob der Wert null ist, bevor du auf String-Methoden wie .includes() oder .trim() zugreifen kannst.",
    ],
    difficulty: 3,
  },
];
