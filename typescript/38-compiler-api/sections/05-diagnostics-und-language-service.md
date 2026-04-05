# Sektion 5: Diagnostics und Language Service

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Custom Transformers](./04-custom-transformers.md)
> Naechste Sektion: [06 - Praxis: Eigener Linter und Code-Generator](./06-praxis-linter-codegen.md)

---

## Was du hier lernst

- Wie **Diagnostics** funktionieren — Fehler, Warnungen und Vorschlaege programmatisch lesen
- Den **Language Service** fuer IDE-aehnliche Features (Autocomplete, Rename, Quick Fixes)
- **Custom Diagnostics** erstellen: Eigene Compiler-Warnungen und -Fehler
- Wie VS Code mit TypeScript kommuniziert

---

## Diagnostics: Fehler als Daten

Compiler-Fehler sind keine Strings — sie sind **strukturierte Objekte**
mit Position, Kategorie, Code und Nachricht.

```typescript annotated
import * as ts from "typescript";

const program = ts.createProgram(["src/main.ts"], { strict: true });

// Alle Diagnostics sammeln:
const allDiagnostics = ts.getPreEmitDiagnostics(program);
// ^ Syntax-Fehler + Typ-Fehler + semantische Fehler

for (const diag of allDiagnostics) {
  // Kategorie: Fehler, Warnung, Nachricht, Vorschlag
  const category = ts.DiagnosticCategory[diag.category];
  // ^ "Error" | "Warning" | "Message" | "Suggestion"

  // Fehlercode (z.B. 2322 = "Type 'X' is not assignable to type 'Y'")
  const code = diag.code;

  // Nachricht (kann verschachtelt sein):
  const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");

  // Position im Quellcode:
  if (diag.file && diag.start !== undefined) {
    const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
    console.log(`${diag.file.fileName}:${line + 1}:${character + 1}`);
    console.log(`  [${category}] TS${code}: ${message}`);
  }
}
```

> 📖 **Hintergrund: TypeScript-Fehlercodes und warum sie stabil sind**
>
> Jeder TypeScript-Fehler hat einen eindeutigen Code: TS2322 (Type
> not assignable), TS2345 (Argument not assignable), TS7006 (Parameter
> implicitly has 'any' type). Diese Codes sind stabil ueber Releases
> hinweg — du kannst sie in `tsconfig.json` mit `--skipLibCheck` oder
> in Kommentaren mit `// @ts-expect-error` referenzieren.
>
> Die Codes sind nicht zufaellig vergeben:
> - **1xxx**: Syntax-Fehler (Code kann nicht geparst werden)
> - **2xxx**: Semantik-Fehler (Code ist syntaktisch korrekt, aber Typen passen nicht)
> - **4xxx**: Deklarationsdatei-Fehler (.d.ts Probleme)
> - **5xxx**: Compiler-Options-Fehler (unbekannte tsconfig-Option)
> - **6xxx**: Nachrichten und Informationen (kein Fehler)
> - **7xxx**: `noImplicitAny`-Fehler
>
> Das Diagnostics-System ist bewusst programmatisch — weil Tools wie
> ESLint, VS Code und CI-Pipelines Fehler verarbeiten muessen, nicht
> nur anzeigen. Der strukturierte Zugang erlaubt es dir zum Beispiel,
> nur bestimmte Fehlerkategorien zu filtern, Fehler in andere Formate
> zu exportieren (z.B. SARIF fuer GitHub Code Scanning), oder eigene
> Fehlercodes mit demselben Anzeige-System zu verwenden.
>
> Das TypeScript-Wiki auf GitHub hat eine vollstaendige Liste aller
> Fehlercodes mit Erklaerungen.

---

## Custom Diagnostics: Eigene Warnungen

Du kannst eigene Compiler-Warnungen erstellen fuer dein Projekt:

```typescript annotated
function checkNoConsoleLog(sourceFile: ts.SourceFile): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];

  function visit(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "console" &&
      node.expression.name.text === "log"
    ) {
      diagnostics.push({
        file: sourceFile,
        start: node.getStart(sourceFile),
        length: node.getWidth(sourceFile),
        messageText: "console.log ist in Produktionscode nicht erlaubt. Nutze den Logger-Service.",
        category: ts.DiagnosticCategory.Warning,
        code: 90001,  // Eigener Code (>= 90000 fuer Custom)
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return diagnostics;
}
```

> 🧠 **Erklaere dir selbst:** Warum sind Custom Diagnostics nuetzlich
> obwohl ESLint-Regeln das Gleiche koennen? Was ist der Vorteil?
> **Kernpunkte:** Custom Diagnostics haben Zugang zum Type Checker |
> ESLint-Regeln auch (mit @typescript-eslint) | Vorteil von
> Diagnostics: Gleiche Fehlerdarstellung wie echte Compiler-Fehler —
> VS Code zeigt sie als rote Wellenlinien, genau wie TS2322 |
> Nachteil: Kein Plugin-System wie ESLint, kein Auto-Fix-Mechanismus |
> In der Praxis: ESLint fuer Standard-Regeln, Custom Diagnostics fuer
> Typ-basierte Checks die in den Build-Prozess integriert werden sollen

### Diagnostics in der Praxis: Drei Kategorien

```typescript annotated
// Kategorie 1: Syntax-Diagnostics (Parser-Fehler)
const syntaxDiags = program.getSyntacticDiagnostics(sourceFile);
// ^ Schnell — keine Typ-Analyse noetig. Nur Parser-Fehler.
// ^ Beispiel: TS1005 "')' expected"

// Kategorie 2: Semantik-Diagnostics (Typ-Fehler)
const semanticDiags = program.getSemanticDiagnostics(sourceFile);
// ^ Teuer — Type Checker muss alle Typen aufloesen
// ^ Beispiel: TS2322 "Type 'string' is not assignable to type 'number'"

// Kategorie 3: Vorschlaege (nicht-Fehler)
const suggestionDiags = program.getSuggestionDiagnostics(sourceFile);
// ^ Informativ — z.B. "Dieser Code kann vereinfacht werden"

// Alles zusammen (das brauchst du meistens):
const allDiags = ts.getPreEmitDiagnostics(program, sourceFile);
```

---

## Der Language Service: IDE-Features

Der Language Service ist die Schnittstelle zwischen TypeScript und
IDEs. Er bietet Autocomplete, Hover, Rename und Quick Fixes.

```typescript annotated
import * as ts from "typescript";

// Language Service erstellen (statt createProgram):
const serviceHost: ts.LanguageServiceHost = {
  getScriptFileNames: () => ["src/main.ts"],
  getScriptVersion: () => "1",
  getScriptSnapshot: (fileName) => {
    const content = ts.sys.readFile(fileName);
    return content ? ts.ScriptSnapshot.fromString(content) : undefined;
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => ({ strict: true }),
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
};

const service = ts.createLanguageService(serviceHost);

// Autocomplete an einer bestimmten Position:
const completions = service.getCompletionsAtPosition(
  "src/main.ts",
  42,  // Cursor-Position (Offset im String)
  { includeCompletionsForModuleExports: true }
);

if (completions) {
  for (const entry of completions.entries) {
    console.log(`${entry.name} (${ts.ScriptElementKind[entry.kind]})`);
  }
}
```

### Weitere Language-Service-Features

```typescript annotated
// Hover-Information:
const quickInfo = service.getQuickInfoAtPosition("src/main.ts", 42);
if (quickInfo) {
  console.log(ts.displayPartsToString(quickInfo.displayParts));
  // ^ z.B. "const greeting: string"
}

// "Go to Definition":
const definitions = service.getDefinitionAtPosition("src/main.ts", 42);
// ^ Gibt Dateipfad und Position der Deklaration zurueck

// "Find All References":
const references = service.findReferences("src/main.ts", 42);
// ^ Alle Stellen im Projekt die auf dieses Symbol verweisen

// "Rename Symbol":
const renameLocations = service.findRenameLocations(
  "src/main.ts", 42, false, false
);
// ^ Alle Stellen die umbenannt werden muessen
```

> ⚡ **Framework-Bezug: VS Code und der Language Service**
>
> VS Code startet pro Projekt einen TypeScript Language Service
> (`tsserver`) als separaten Prozess. Kommunikation laeuft per IPC
> (Inter-Process Communication). Jeder Tastendruck in einer `.ts`-
> Datei loest einen Language-Service-Aufruf aus:
>
> - Tippst du einen Buchstaben: `getCompletionsAtPosition`
> - Hooverst du ueber einen Namen: `getQuickInfoAtPosition`
> - Drueckst du F12: `getDefinitionAtPosition`
> - Aenderst du eine Datei: Inkrementelles Re-Parsing
>
> Angular's Language Service Plugin (`@angular/language-service`)
> erweitert den TypeScript Language Service um Template-spezifische
> Features. Es registriert sich als TypeScript Language Service Plugin
> und "hoert" auf `.html`-Dateien und Template-Strings in `@Component`.
> Autocomplete in `{{ user.` zeigt dann Angular-spezifische Vorschlaege.
>
> Du kannst selbst Language Service Plugins schreiben — das erfordert
> ein `typescript.plugins`-Eintrag in `tsconfig.json`. Grosse
> Libraries wie Prisma nutzen das um Query-Autocomplete direkt in
> VS Code zu integrieren.

> 💭 **Denkfrage:** Der Language Service muss bei jedem Tastendruck
> antworten — meist in unter 100ms. Wie schafft er das bei grossen
> Projekten mit tausenden Dateien?
>
> **Antwort:** Inkrementelles Parsing und Caching. Der Service
> merkt sich den vorherigen AST und aktualisiert nur die geaenderten
> Teile. `getScriptVersion()` im Host teilt dem Service mit welche
> Dateien sich geaendert haben. Nur fuer diese Dateien wird der
> AST und Type-Check neu berechnet. Trotzdem kann es bei sehr
> grossen Projekten langsam werden — deshalb gibt es Project
> References (L29) fuer Monorepos.

---

## Experiment: Quick-Fix-Generator

Baue einen Service der automatische Fixes vorschlaegt:

```typescript
// Finde alle 'any'-Annotationen und schlage 'unknown' vor:
function suggestUnknownInsteadOfAny(
  sourceFile: ts.SourceFile
): { start: number; length: number; replacement: string; message: string }[] {
  const suggestions: { start: number; length: number; replacement: string; message: string }[] = [];

  function visit(node: ts.Node): void {
    // Finde type annotations die 'any' sind:
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const parent = node.parent;
      // Pruefe ob es eine explizite Annotation ist (nicht inferiert):
      if (parent && (
        ts.isParameter(parent) ||
        ts.isVariableDeclaration(parent) ||
        ts.isPropertyDeclaration(parent)
      )) {
        suggestions.push({
          start: node.getStart(sourceFile),
          length: node.getWidth(sourceFile),
          replacement: "unknown",
          message: "Ersetze 'any' durch 'unknown' fuer Typsicherheit",
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return suggestions;
}

// Experiment: Erweitere den Generator um auch implizite 'any'-Parameter
// zu finden (Funktion ohne Typ-Annotation). Nutze den Type Checker:
// checker.getTypeAtLocation(param).flags & ts.TypeFlags.Any
```

---

## Was du gelernt hast

- **Diagnostics** sind strukturierte Fehlerobjekte mit Position, Kategorie und Code
- **Custom Diagnostics** ermoelichen eigene Compiler-Warnungen (z.B. kein console.log)
- Der **Language Service** bietet IDE-Features: Autocomplete, Hover, Rename, Quick Fixes
- VS Code kommuniziert ueber den Language Service mit TypeScript
- **Inkrementelles Parsing** macht den Service bei jedem Tastendruck schnell genug

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen dem
> Language Service und dem Compiler (createProgram)? Wann wuerdest
> du welchen verwenden?
> **Kernpunkte:** Compiler = einmaliger Durchlauf (Build) |
> Language Service = interaktiv, inkrementell (IDE) | Compiler
> fuer CLI-Tools und Build-Pipelines | Language Service fuer
> Editor-Plugins und interaktive Tools

**Kernkonzept zum Merken:** Diagnostics sind die strukturierte Form von Compiler-Fehlern. Der Language Service ist der "IDE-Modus" des Compilers — interaktiv, inkrementell und auf Geschwindigkeit optimiert.

---

> **Pausenpunkt** — Du kennst jetzt die gesamte Compiler-API-Landschaft.
> In der letzten Sektion bauen wir damit echte Tools.
>
> Weiter geht es mit: [Sektion 06: Praxis — Eigener Linter und Code-Generator](./06-praxis-linter-codegen.md)
