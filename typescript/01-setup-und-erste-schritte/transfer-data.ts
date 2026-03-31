/**
 * Lektion 01 — Transfer Tasks: Setup & Erste Schritte
 *
 * Diese Tasks nehmen die Konzepte aus der Setup-Lektion und wenden
 * sie in komplett neuen Kontexten an:
 *
 *  1. Migration eines bestehenden JavaScript-Projekts
 *  2. Argumentation ueber TypeScript-Performance (Type Erasure)
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: JS-Projekt migrieren ────────────────────────────────────
  {
    id: "01-migration-strategy",
    title: "JavaScript-Projekt migrieren",
    prerequisiteLessons: [1],
    scenario:
      "Du erbst ein JavaScript-Projekt mit 50 Dateien von einem Kollegen, " +
      "der das Unternehmen verlassen hat. Es gibt keine Tests, keine Dokumentation, " +
      "und einige Funktionen haben subtile Bugs die erst zur Laufzeit auftreten. " +
      "Dein Chef moechte, dass du das Projekt 'sicherer' machst.",
    task:
      "Erstelle eine schrittweise Migrationsstrategie von JavaScript zu TypeScript.\n\n" +
      "Beantworte dabei:\n" +
      "1. Welche tsconfig.json-Optionen wuerdest du im ERSTEN Schritt setzen?\n" +
      "2. Warum nicht sofort `strict: true`?\n" +
      "3. Wie nutzt du `allowJs` und `checkJs` fuer eine sanfte Migration?\n" +
      "4. In welcher Reihenfolge wuerdest du die 50 Dateien migrieren?",
    starterCode: [
      "// tsconfig.json — Phase 1: Dein Startpunkt",
      "{",
      '  "compilerOptions": {',
      "    // TODO: Welche Optionen fuer den sanften Einstieg?",
      "  },",
      '  "include": ["src/**/*"]',
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Phase 1: Koexistenz (Woche 1-2) ═══",
      "// tsconfig.json",
      "{",
      '  "compilerOptions": {',
      '    "target": "ES2020",',
      '    "module": "commonjs",',
      '    "allowJs": true,         // JS-Dateien bleiben erstmal JS',
      '    "checkJs": true,          // Aber TypeScript prueft sie trotzdem!',
      '    "strict": false,          // Noch nicht strict — zu viele Fehler',
      '    "noEmit": true,           // Nur pruefen, nicht kompilieren',
      '    "esModuleInterop": true',
      "  }",
      "}",
      "",
      "// ═══ Phase 2: Schrittweise Umbenennung (Woche 3-6) ═══",
      "// Reihenfolge: Utility-Dateien zuerst (wenig Abhaengigkeiten),",
      "// dann Datenmodelle, dann Business-Logik, zuletzt Entry-Points.",
      "//",
      "// Pro Datei:",
      "// 1. .js → .ts umbenennen",
      '// 2. Offensichtliche Typen hinzufuegen (Parameter, Return-Types)',
      "// 3. `any` fuer unklare Stellen (vorerst)",
      "// 4. Testen ob alles noch funktioniert",
      "",
      "// ═══ Phase 3: Strict Mode (Woche 7+) ═══",
      "{",
      '  "compilerOptions": {',
      '    "strict": true,            // Jetzt einschalten',
      '    "allowJs": false,          // Alle Dateien sind jetzt .ts',
      '    "noImplicitAny": true,     // Keine versteckten any mehr',
      '    "strictNullChecks": true   // null/undefined Sicherheit',
      "  }",
      "}",
      "",
      "// ═══ Warum nicht sofort strict? ═══",
      "// Bei 50 Dateien wuerden sofort Hunderte Fehler auftreten.",
      "// Das ist demoralisierend und macht Code-Reviews unmoeglich.",
      "// allowJs + checkJs gibt sofort Wert (Fehlerfinden) ohne",
      "// dass man jede Datei anfassen muss.",
      "//",
      "// Kernkonzept: TypeScript ist INKREMENTELL einfuehrbar.",
      "// Das ist einer seiner groessten Vorteile gegenueber anderen",
      "// Typsystemen.",
    ].join("\n"),
    conceptsBridged: [
      "allowJs",
      "checkJs",
      "strict-Mode",
      "tsconfig.json",
      "inkrementelle Migration",
    ],
    hints: [
      "Denke an `allowJs` und `checkJs` — damit kann TypeScript auch .js-Dateien pruefen, ohne dass du sie umbenennen musst.",
      "Starte mit den Dateien die am wenigsten Abhaengigkeiten haben (Utility-Funktionen, Konstanten). Arbeite dich dann nach 'oben' zu den Entry-Points.",
      "strict: true aktiviert gleichzeitig noImplicitAny, strictNullChecks, strictFunctionTypes und mehr. Bei einem Legacy-Projekt wuerde das Hunderte Fehler auf einmal erzeugen.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: TypeScript Performance-Argument ─────────────────────────
  {
    id: "01-typescript-performance",
    title: "TypeScript ist langsamer als JavaScript — oder?",
    prerequisiteLessons: [1],
    scenario:
      "In einem Team-Meeting sagt dein Kollege: 'TypeScript ist langsamer als " +
      "JavaScript. Wir sollten bei JavaScript bleiben, weil Performance wichtig " +
      "ist fuer unsere App.' Einige Team-Mitglieder nicken zustimmend.",
    task:
      "Schreibe eine kurze, technisch praezise Erklaerung (als Kommentar-Block), " +
      "warum diese Aussage falsch ist.\n\n" +
      "Erklaere dabei:\n" +
      "1. Was ist Type Erasure und was bedeutet es fuer die Laufzeit?\n" +
      "2. Was genau passiert beim Kompilieren?\n" +
      "3. Wo koennte TypeScript tatsaechlich 'langsamer' sein (und warum " +
      "   ist das irrelevant fuer die Laufzeit-Performance)?\n" +
      "4. Gibt es Faelle wo TypeScript sogar zu BESSEREM Code fuehrt?",
    solutionCode: [
      "/**",
      " * Warum 'TypeScript ist langsamer' falsch ist:",
      " *",
      " * 1. TYPE ERASURE — Der Kern des Arguments",
      " *    TypeScript-Code wird zu JavaScript KOMPILIERT.",
      " *    Dabei werden ALLE Typ-Annotationen, Interfaces, Type-Aliases",
      " *    und generische Typparameter KOMPLETT ENTFERNT.",
      " *",
      " *    Das heisst: Zur Laufzeit existiert kein TypeScript mehr.",
      " *    Was ausgefuehrt wird ist pures JavaScript.",
      " *",
      " * 2. WAS BEIM KOMPILIEREN PASSIERT",
      " *    Vorher:  function add(a: number, b: number): number { return a + b; }",
      " *    Nachher: function add(a, b) { return a + b; }",
      " *",
      " *    Die Typen werden entfernt — sonst aendert sich NICHTS.",
      " *    Der generierte JS-Code ist identisch mit handgeschriebenem JS.",
      " *",
      " * 3. WO TYPESCRIPT 'LANGSAMER' IST",
      " *    - Compile-Zeit: tsc braucht Zeit zum Pruefen (Sekunden bis Minuten)",
      " *    - IDE: Der Language Server braucht RAM und CPU fuer Typ-Analyse",
      " *    - Build-Pipeline: Ein Extra-Schritt in der CI/CD Pipeline",
      " *",
      " *    Aber: Das ist alles DEVELOPMENT-TIME, nicht RUNTIME.",
      " *    Der Nutzer der App merkt davon nichts.",
      " *",
      " * 4. WO TYPESCRIPT SOGAR HILFT",
      " *    - Weniger Runtime-Bugs = weniger Error-Handling-Code",
      " *    - Bessere IDE-Unterstuetzung = schnellere Entwicklung",
      " *    - Fruehere Fehlererkennung = weniger Debug-Sessions in Produktion",
      " *    - Erzwingt klarere Datenstrukturen = oft effizienterer Code",
      " *",
      " * Fazit: TypeScript hat exakt die gleiche Runtime-Performance wie",
      " * JavaScript, weil es zur Laufzeit JavaScript IST.",
      " */",
    ].join("\n"),
    conceptsBridged: [
      "Type Erasure",
      "Compile-Zeit vs. Laufzeit",
      "Transpilation",
    ],
    hints: [
      "Denke an Type Erasure: Was passiert mit den Typ-Annotationen wenn TypeScript kompiliert wird? Was bleibt uebrig?",
      "Unterscheide klar zwischen Compile-Zeit (Entwicklung) und Laufzeit (Produktion). TypeScript existiert nur bei der Entwicklung.",
    ],
    difficulty: 2,
  },
];
