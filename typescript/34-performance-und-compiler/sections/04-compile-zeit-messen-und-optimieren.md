# Sektion 4: Compile-Zeit messen und optimieren

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Performante Typen schreiben](./03-performante-typen-schreiben.md)
> Naechste Sektion: [05 - Inkrementelle Kompilierung](./05-inkrementelle-kompilierung.md)

---

## Was du hier lernst

- Wie du mit `--extendedDiagnostics` die Compile-Zeit **in Zahlen** siehst
- Wie `--generateTrace` eine **detaillierte Analyse** pro Datei liefert
- Wie du den **Chrome DevTools Profiler** fuer TypeScript-Traces nutzt
- Konkrete Schritte um die **langsamsten Dateien** zu identifizieren und zu fixen

---

## Hintergrund: Messen statt raten

> **Origin Story: --generateTrace**
>
> Bis TypeScript 4.1 (2020) war Compiler-Performance ein Mysterium.
> Entwickler wussten, dass ihre Builds langsam waren, aber nicht WARUM.
> Das TypeScript-Team selbst nutzte intern ein Tracing-Tool, das nie
> oeffentlich war. Nach jahrelangen Community-Anfragen wurde `--generateTrace`
> in TypeScript 4.1 eingefuehrt — es gibt dir dieselben Informationen,
> die das TypeScript-Team intern zur Optimierung nutzt.
>
> Ryan Cavanaugh (TypeScript Lead) sagte dazu: "Wir haetten das viel
> frueher machen sollen. Die meisten Performance-Bugs die uns gemeldet
> werden, haetten die Entwickler selbst finden koennen — wenn sie die
> Werkzeuge gehabt haetten."

Die erste Regel der Optimierung: **Messen, nicht raten.** Du denkst
vielleicht, dass eine bestimmte Datei langsam ist — aber oft liegt das
Problem woanders. TypeScript gibt dir die Werkzeuge um das herauszufinden.

---

## Schritt 1: --extendedDiagnostics

Der einfachste Einstieg. Fuege `--extendedDiagnostics` zu deinem
tsc-Aufruf hinzu:

```typescript annotated
// Terminal-Befehl:
// npx tsc --extendedDiagnostics
//
// Output (Beispiel):
//
// Files:              342
// Lines:              98,234
// ^ Gesamte Codebase-Groesse
//
// Parse time:         0.82s
// ^ Scanner + Parser (selten das Problem)
// Bind time:          0.34s
// ^ Binder (fast nie das Problem)
// Check time:         12.45s
// ^ <<< DER CHECKER — hier liegt fast immer das Problem
// Emit time:          1.23s
// ^ Emitter (manchmal optimierbar mit skipLibCheck)
//
// Total time:         14.84s
//
// Memory used:        412,345K
// ^ Speicherverbrauch — bei >1GB hast du ein Problem
```

Die wichtigsten Zahlen:

- **Check time**: Sollte unter 70% der Total time liegen. Darueber: komplexe Typen
- **Memory used**: Unter 500MB ist normal. Ueber 1GB: zu viele Typ-Instantiierungen
- **Files**: Pruefe ob node_modules mitgeprueft werden (sollten sie nicht!)

> 🧠 **Erklaere dir selbst:** Wenn "Parse time" 0.8s und "Check time" 12s betraegt, welchen Anteil hat das Parsen an der Gesamtzeit? Was sagt dir das ueber Optimierungsansaetze?
> **Kernpunkte:** Parse ist ~5% der Gesamtzeit | Selbst wenn du Parsing um 50% schneller machst: 0.4s gespart | Checker um 10% schneller: 1.2s gespart | Fokussiere immer auf den groessten Anteil

---

## Schritt 2: --generateTrace

Fuer die detaillierte Analyse:

```typescript annotated
// Terminal-Befehl:
// npx tsc --generateTrace ./trace-output
//
// Erzeugt im Ordner ./trace-output:
// ├── trace.json        ← Chrome DevTools Trace
// ├── types.json        ← Alle Typ-Instantiierungen
// └── legend.json       ← Legende fuer die Trace-Datei
//
// trace.json oeffnen:
// 1. Chrome oeffnen
// 2. chrome://tracing aufrufen
// 3. trace.json laden (Drag & Drop)
// ^ Du siehst eine Timeline mit allen Compiler-Phasen
// ^ Jede Datei, jeder Typ, jede Instantiierung ist sichtbar
```

In der Chrome-Trace-Ansicht siehst du:

- **Breite Balken** = langsame Operationen (die musst du optimieren)
- **Tiefe Verschachtelung** = rekursive Typ-Aufloesungen
- **Wiederholte gleiche Operationen** = fehlende Caching-Moeglichkeiten

> 💭 **Denkfrage:** Warum nutzt TypeScript das Chrome-Trace-Format und nicht
> ein eigenes Format?
>
> **Antwort:** Das Chrome Trace Format (auch "Trace Event Format") ist ein
> Industriestandard. Chrome DevTools, Perfetto, und viele andere Tools
> koennen es lesen. Das TypeScript-Team musste kein eigenes Visualisierungs-
> Tool bauen — sie nutzen einfach die existierende Infrastruktur.

---

## Schritt 3: Die langsamsten Dateien finden

Mit dem Trace findest du die "Hotspots". Aber es gibt auch einen
schnelleren Weg:

```typescript annotated
// Terminal-Befehl fuer die Top-10 langsamsten Dateien:
// npx tsc --generateTrace ./trace && node -e "
//   const trace = require('./trace/trace.json');
//   const checks = trace
//     .filter(e => e.name === 'checkSourceFile')
//     .map(e => ({ file: e.args.path, ms: (e.dur / 1000).toFixed(0) }))
//     .sort((a, b) => b.ms - a.ms)
//     .slice(0, 10);
//   console.table(checks);
// "
//
// Output (Beispiel):
// ┌─────────┬─────────────────────────────────┬────────┐
// │ (index) │ file                            │ ms     │
// ├─────────┼─────────────────────────────────┼────────┤
// │ 0       │ src/api/complex-types.ts        │ '3421' │
// │ 1       │ src/forms/all-forms.ts          │ '2108' │
// │ 2       │ src/store/root-state.ts         │ '1876' │
// └─────────┴─────────────────────────────────┴────────┘
// ^ Diese 3 Dateien verursachen 50% der Check-Time!
```

> ⚡ **Framework-Bezug (Angular):** In Angular-Projekten sind die
> langsamsten Dateien oft die generierten `.ngtypecheck.ts`-Dateien
> (Template Type Checking). Du siehst sie im Trace als `ngtypecheck`
> Eintraege. Wenn eine Komponente besonders langsam ist, hat sie oft
> ein komplexes Template mit vielen *ngFor, *ngIf und Pipe-Aufrufen.
> Angular 16+ mit Signals und dem neuen Control Flow (`@if`, `@for`)
> ist hier deutlich schneller als die Directive-Syntax.

---

## Schritt 4: skipLibCheck und isolatedModules

Zwei tsconfig-Optionen die sofort helfen:

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,
    // ^ Ueberspringt Type-Checking von .d.ts-Dateien
    // ^ Spart 10-30% Compile-Zeit in Projekten mit vielen @types/*
    // ^ EMPFOHLEN: Fast alle grossen Projekte nutzen das
    // ^ Nachteil: Fehler in .d.ts werden nicht erkannt (extrem selten)

    "isolatedModules": true
    // ^ Jede Datei wird als eigenstaendiges Modul behandelt
    // ^ Aktiviert Einschraenkungen die schnellere Transpiler ermoeglichen
    // ^ Pflicht fuer: esbuild, swc, Babel (sie koennen kein Cross-File-Checking)
    // ^ EMPFOHLEN: Sollte in allen modernen Projekten an sein
  }
}
```

Die Kombination dieser beiden Optionen kann 20-40% Compile-Zeit sparen,
ohne dass du einen einzigen Typ aendern musst.

> 🧪 **Experiment:** Fuehre in deinem Projekt folgendes aus:
>
> ```bash
> # Baseline messen:
> time npx tsc --noEmit --extendedDiagnostics
>
> # Mit skipLibCheck:
> time npx tsc --noEmit --extendedDiagnostics --skipLibCheck
>
> # Vergleiche "Check time" in beiden Outputs
> # Die Differenz = Zeit die fuer .d.ts-Pruefung draufging
> ```
>
> In Projekten mit vielen Dependencies (Angular hat allein ~20 @types-Pakete)
> kann skipLibCheck 5-10 Sekunden sparen.

---

## Schritt 5: tsc --noEmit fuer schnelles Feedback

Fuer den Entwicklungsalltag: Trenne Type-Checking von der Code-Generierung:

```typescript annotated
// NUR Type-Checking (kein JavaScript erzeugen):
// npx tsc --noEmit
// ^ Spart die Emitter-Phase komplett
// ^ Ideal fuer CI: "Sind die Typen korrekt?"

// Code-Generierung mit schnellem Transpiler:
// npx esbuild src/index.ts --bundle --outdir=dist
// ^ esbuild transpiliert TypeScript → JavaScript in Millisekunden
// ^ ABER: esbuild prueft KEINE Typen! (isolatedModules-Modus)

// Kombinierter Workflow:
// 1. esbuild fuer schnelle Transpilierung (Development)
// 2. tsc --noEmit im CI fuer Type-Checking
// ^ Best of both worlds: schnelles Dev + sichere Types
```

> ⚡ **Framework-Bezug (React):** Vite (der Standard-Bundler fuer React)
> nutzt genau diesen Ansatz: esbuild transpiliert TypeScript blitzschnell
> (kein Type-Checking!), und `tsc --noEmit` laeuft separat im Background
> oder CI. Next.js macht es aehnlich mit SWC als Transpiler. Das Ergebnis:
> Hot Reload in Millisekunden statt Sekunden.

---

## Checkliste: Compile-Zeit optimieren

Bevor du einzelne Typen optimierst, pruefe diese Low-Hanging Fruits:

1. **skipLibCheck: true** — sofort 10-30% schneller
2. **isolatedModules: true** — ermoeglicht schnelle Transpiler
3. **Keine versehentlichen includes** — pruefe `include` und `exclude` in tsconfig
4. **node_modules nicht pruefen** — `"exclude": ["node_modules"]`
5. **Incremental Build** — `"incremental": true` (naechste Sektion!)
6. **Project References** — fuer Monorepos (naechste Sektion!)

Erst wenn diese Basics stimmen, lohnt es sich die teuersten Typen zu optimieren
(Sektion 3).

---

## Was du gelernt hast

- `--extendedDiagnostics` zeigt dir **wo die Zeit draufgeht** (Check time vs. Parse time)
- `--generateTrace` erzeugt eine **detaillierte Trace-Datei** fuer Chrome DevTools
- **skipLibCheck** und **isolatedModules** sparen sofort 20-40% Compile-Zeit
- Trenne **Type-Checking** (tsc --noEmit) von **Transpilierung** (esbuild/swc) fuer schnelles Dev
- Die langsamsten **3-5 Dateien** verursachen oft 50%+ der Compile-Zeit

**Kernkonzept zum Merken:** Messen, nicht raten. `--extendedDiagnostics` fuer den Ueberblick, `--generateTrace` fuer die Details. Und die billigsten Optimierungen (skipLibCheck, isolatedModules) zuerst — bevor du auch nur eine Zeile Typ-Code aenderst.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du hast jetzt die
> Werkzeuge um Performance-Probleme zu finden.
>
> Weiter geht es mit: [Sektion 05: Inkrementelle Kompilierung](./05-inkrementelle-kompilierung.md)
