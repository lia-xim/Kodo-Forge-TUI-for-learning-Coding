/**
 * Lektion 03 -- Transfer Tasks: Type Annotations & Inference
 *
 * Diese Tasks nehmen die Konzepte aus der Annotations/Inference-Lektion
 * und wenden sie in komplett neuen Kontexten an:
 *
 *  1. Config-Objekt mit mehreren Environments (satisfies, as const)
 *  2. Funktions-Refactoring fuer bessere Inference
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Config-Objekt mit Environments ────────────────────────────
  {
    id: "03-config-environments",
    title: "Typsichere App-Konfiguration mit Environments",
    prerequisiteLessons: [3],
    scenario:
      "Deine App laeuft in drei Environments: development, staging, production. " +
      "Jedes hat eine eigene API-URL, Log-Level und Feature-Flags. " +
      "Aktuell ist die Config ein riesiges 'any'-Objekt und letzte Woche " +
      "hat jemand in Production den Debug-Modus aktiviert, weil es kein " +
      "Typsystem gab das den Fehler abgefangen haette.",
    task:
      "Erstelle eine typsichere Konfiguration mit TypeScript-Inference.\n\n" +
      "1. Definiere ein Config-Interface mit den Feldern: apiUrl (string), " +
      "   logLevel ('debug' | 'info' | 'warn' | 'error'), " +
      "   features (Objekt mit boolean-Flags)\n" +
      "2. Erstelle ein configs-Objekt mit 'as const satisfies' das alle " +
      "   drei Environments enthaelt\n" +
      "3. Erklaere: Warum 'as const satisfies' statt nur 'as const' oder " +
      "   nur eine Typ-Annotation?\n" +
      "4. Schreibe eine getConfig-Funktion die das richtige Environment " +
      "   zurueckgibt — mit voller Literal-Type-Praezision",
    starterCode: [
      "// Dein Config-Interface",
      "interface AppConfig {",
      "  // TODO",
      "}",
      "",
      "// Konfiguration fuer alle Environments",
      "const configs = {",
      "  development: { /* TODO */ },",
      "  staging:     { /* TODO */ },",
      "  production:  { /* TODO */ },",
      "};",
      "",
      "// Funktion die Config fuer ein Environment zurueckgibt",
      "function getConfig(env: ???) {",
      "  // TODO",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Config-Interface: Die Struktur-Vorgabe ═══",
      "interface AppConfig {",
      "  apiUrl: string;",
      "  logLevel: 'debug' | 'info' | 'warn' | 'error';",
      "  features: {",
      "    darkMode: boolean;",
      "    betaFeatures: boolean;",
      "    analytics: boolean;",
      "  };",
      "}",
      "",
      "// ═══ as const satisfies: Sicherheit + Praezision ═══",
      "const configs = {",
      "  development: {",
      "    apiUrl: 'http://localhost:3000',",
      "    logLevel: 'debug',",
      "    features: { darkMode: true, betaFeatures: true, analytics: false },",
      "  },",
      "  staging: {",
      "    apiUrl: 'https://staging.example.com',",
      "    logLevel: 'info',",
      "    features: { darkMode: true, betaFeatures: true, analytics: true },",
      "  },",
      "  production: {",
      "    apiUrl: 'https://api.example.com',",
      "    logLevel: 'warn',",
      "    features: { darkMode: true, betaFeatures: false, analytics: true },",
      "  },",
      "} as const satisfies Record<string, AppConfig>;",
      "",
      "// ═══ Warum 'as const satisfies'? ═══",
      "//",
      "// Nur 'as const':",
      "//   + Literal Types bleiben erhalten ('debug' statt string)",
      "//   - Keine Pruefung ob die Struktur stimmt",
      "//   - Tippfehler wie 'logLeve' werden nicht erkannt",
      "//",
      "// Nur Type-Annotation (: Record<string, AppConfig>):",
      "//   + Struktur wird geprueft",
      "//   - Literal Types gehen verloren ('debug' wird zu string)",
      "//   - Environment-Namen werden zu string (kein Autocomplete)",
      "//",
      "// 'as const satisfies':",
      "//   + Struktur wird geprueft (satisfies)",
      "//   + Literal Types bleiben erhalten (as const)",
      "//   + Beste aus beiden Welten",
      "",
      "// ═══ Typsichere getConfig-Funktion ═══",
      "type Environment = keyof typeof configs;",
      "",
      "function getConfig<E extends Environment>(env: E): typeof configs[E] {",
      "  return configs[env];",
      "}",
      "",
      "// Nutzung:",
      "// const dev = getConfig('development');",
      "// dev.logLevel  // Typ: 'debug' (nicht string!)",
      "// dev.apiUrl    // Typ: 'http://localhost:3000' (nicht string!)",
      "",
      "// getConfig('invalid');  // Compile-Fehler!",
    ].join("\n"),
    conceptsBridged: [
      "as const",
      "satisfies-Operator",
      "Literal Types",
      "keyof typeof",
      "Generics mit Inference",
      "Widening vermeiden",
    ],
    hints: [
      "Das Problem mit einer normalen Typ-Annotation (const configs: Record<string, AppConfig>) ist Widening: 'debug' wird zu string, 'development' wird zu string. Du verlierst Praezision.",
      "'as const' allein bewahrt die Literal Types, aber prueft nicht ob die Struktur dem Interface entspricht. 'as const satisfies Record<string, AppConfig>' tut beides.",
      "Fuer die getConfig-Funktion: Nutze einen Generic-Parameter E extends keyof typeof configs. Dann ist der Return-Type typeof configs[E] — mit voller Literal-Praezision.",
    ],
    difficulty: 4,
  },

  // ─── Task 2: Funktions-Refactoring fuer Inference ──────────────────────
  {
    id: "03-inference-refactoring",
    title: "Ueber-annotierte Funktion schlank machen",
    prerequisiteLessons: [3],
    scenario:
      "Ein Junior-Entwickler hat eine Utility-Bibliothek geschrieben. " +
      "Jede Funktion hat explizite Typ-Annotationen an JEDER Stelle — " +
      "Variablen, Return-Types, sogar offensichtliche Literal-Zuweisungen. " +
      "Der Code ist dreimal so lang wie noetig und schwer zu warten, " +
      "weil jede Aenderung an drei Stellen angepasst werden muss.",
    task:
      "Refactore den folgenden Code: Entferne unnoetige Annotationen " +
      "und behalte nur die, die wirklich noetig sind.\n\n" +
      "1. Welche Annotationen kann TypeScript selbst inferieren?\n" +
      "2. Wo sind Annotationen unverzichtbar?\n" +
      "3. Wende das Prinzip 'Annotate at boundaries, infer inside' an\n" +
      "4. Stelle sicher dass der resultierende Code GENAUSO typsicher ist",
    starterCode: [
      "// VORHER: Ueber-annotiert",
      "function filterPositive(numbers: number[]): number[] {",
      "  const result: number[] = [];",
      "  const length: number = numbers.length;",
      "  for (let i: number = 0; i < length; i++) {",
      "    const current: number = numbers[i];",
      "    const isPositive: boolean = current > 0;",
      "    if (isPositive) {",
      "      result.push(current);",
      "    }",
      "  }",
      "  return result;",
      "}",
      "",
      "function createPair(first: string, second: number): { first: string; second: number } {",
      "  const pair: { first: string; second: number } = {",
      "    first: first,",
      "    second: second",
      "  };",
      "  return pair;",
      "}",
      "",
      "function getStatus(code: number): string {",
      "  const isOk: boolean = code >= 200 && code < 300;",
      "  const statusText: string = isOk ? 'OK' : 'Fehler';",
      "  return statusText;",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ NACHHER: Nur noetige Annotationen ═══",
      "",
      "// Parameter-Typen: BEHALTEN (Boundary-Regel)",
      "// Return-Type: BEHALTEN (public API)",
      "// Lokale Variablen: ENTFERNT (Inference reicht)",
      "function filterPositive(numbers: number[]): number[] {",
      "  return numbers.filter(n => n > 0);",
      "}",
      "",
      "// Parameter-Typen: BEHALTEN (Boundary)",
      "// Return-Type: ENTFERNT (wird korrekt inferiert)",
      "// Lokale Variable 'pair': ENTFERNT (ueberfluessig)",
      "function createPair(first: string, second: number) {",
      "  return { first, second };",
      "}",
      "// Inferierter Return-Type: { first: string; second: number }",
      "",
      "// Parameter-Typ: BEHALTEN (Boundary)",
      "// Return-Type: BEHALTEN (public API, macht Intent klar)",
      "// Lokale Variablen: ENTFERNT",
      "function getStatus(code: number): string {",
      "  return code >= 200 && code < 300 ? 'OK' : 'Fehler';",
      "}",
      "",
      "// ═══ Die Goldene Regel ═══",
      "// 'Annotate at boundaries, infer inside'",
      "//",
      "// BEHALTEN:                     ENTFERNEN:",
      "// - Funktions-Parameter         - Lokale Variablen",
      "// - Export-Return-Types         - Offensichtliche Zuweisungen",
      "// - Interface/Type Definitionen - Temporaere Werte",
      "// - Public API Contracts        - Literale (const x = 5)",
      "//",
      "// Warum?",
      "// - Weniger Code = leichter wartbar",
      "// - Inference ist praeziser als manuelle Annotationen",
      "// - Aenderungen muessen nur an einer Stelle gemacht werden",
      "// - Der Compiler finded Fehler die man bei manuellen Typen uebersieht",
    ].join("\n"),
    conceptsBridged: [
      "Type Inference",
      "Boundary-Regel",
      "Ueber-Annotation",
      "Return-Type Inference",
      "Wartbarkeit",
    ],
    hints: [
      "Frage bei jeder Annotation: 'Wuerde TypeScript hier den gleichen Typ inferieren, wenn ich die Annotation entferne?' Wenn ja, ist sie ueberfluessig.",
      "Die Boundary-Regel: Parameter brauchen Annotationen (TypeScript kann sie nicht inferieren). Lokale Variablen die aus Ausdruecken initialisiert werden brauchen fast nie Annotationen.",
    ],
    difficulty: 2,
  },
];
