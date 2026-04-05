# Sektion 6: Praxis — Eigener Linter und Code-Generator

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Diagnostics und Language Service](./05-diagnostics-und-language-service.md)
> Naechste Sektion: [Lektion 39 - Best Practices](../../39-best-practices/sections/01-haeufigste-fehler.md)

---

## Was du hier lernst

- Wie man einen **Mini-Linter** mit der Compiler API baut (mit Typ-basierten Regeln)
- Einen **Code-Generator** der aus Interfaces automatisch Validierungsfunktionen erzeugt
- Wann man die **Compiler API** statt ESLint oder Code-Gen-Tools verwenden sollte
- Die Architektur professioneller TypeScript-Tools

---

## Projekt 1: Mini-Linter mit Typ-Regeln

ESLint kann Syntax-Regeln pruefen. Aber manche Regeln brauchen
**Typ-Informationen** — und hier ist die Compiler API ueberlegen.

> 📖 **Hintergrund: @typescript-eslint unter der Haube**
>
> Das Paket `@typescript-eslint` ist der Beweis dafuer, dass die
> Compiler API unverzichtbar ist. Es nutzt `ts.createProgram` um
> den Type Checker zu bekommen und verknuepft ihn mit ESLint's
> Regel-System. Regeln wie `no-floating-promises` (unbehandelte
> Promises finden) oder `strict-boolean-expressions` (boolean in
> if-Bedingungen erzwingen) waeren ohne den Type Checker unmoeglich.
> Unser Mini-Linter macht dasselbe — nur ohne das ESLint-Framework.

```typescript annotated
import * as ts from "typescript";

interface LintResult {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

function lint(fileNames: string[]): LintResult[] {
  const program = ts.createProgram(fileNames, { strict: true });
  const checker = program.getTypeChecker();
  const results: LintResult[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;
    if (sourceFile.fileName.includes("node_modules")) continue;

    // Regel 1: Keine unbehandelten Promises
    checkFloatingPromises(sourceFile, checker, results);
    // Regel 2: Keine any-Parameter in oeffentlichen Funktionen
    checkPublicAnyParams(sourceFile, checker, results);
    // Regel 3: Keine leeren catch-Bloecke
    checkEmptyCatch(sourceFile, results);
  }

  return results;
}
```

### Regel: Unbehandelte Promises finden

```typescript annotated
function checkFloatingPromises(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  results: LintResult[]
): void {
  function visit(node: ts.Node): void {
    // Suche ExpressionStatements (Ausdruecke die als Statement stehen):
    if (ts.isExpressionStatement(node)) {
      const type = checker.getTypeAtLocation(node.expression);
      const typeStr = checker.typeToString(type);
      // ^ Nutze den Type Checker um den Typ des Ausdrucks zu pruefen

      // Pruefe ob der Typ "Promise" enthaelt:
      if (typeStr.startsWith("Promise<")) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile)
        );
        results.push({
          file: sourceFile.fileName,
          line: line + 1,
          column: character + 1,
          rule: "no-floating-promises",
          message: `Unbehandeltes Promise: ${typeStr}. Nutze await oder .catch().`,
          severity: "error",
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}
```

> 🧠 **Erklaere dir selbst:** Warum kann ein rein Syntax-basierter
> Linter (ohne Type Checker) keine unbehandelten Promises finden?
> Was braeuchte er dafuer?
> **Kernpunkte:** Syntax allein zeigt nicht ob `foo()` ein Promise
> zurueckgibt | Der Type Checker kennt den Rueckgabetyp | Ohne
> Type Checker muesste man jede Funktion manuell als async markieren

---

## Projekt 2: Code-Generator aus Interfaces

Generiere automatisch Validierungsfunktionen aus TypeScript-Interfaces:

```typescript annotated
import * as ts from "typescript";

// Eingabe: interface User { name: string; age: number; email?: string; }
// Ausgabe: function validateUser(data: unknown): data is User { ... }

function generateValidators(fileName: string): string {
  const program = ts.createProgram([fileName], { strict: true });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName)!;
  let output = "";

  ts.forEachChild(sourceFile, node => {
    if (!ts.isInterfaceDeclaration(node)) return;
    if (!hasExportModifier(node)) return;

    const name = node.name.text;
    const checks: string[] = [];

    for (const member of node.members) {
      if (!ts.isPropertySignature(member) || !member.name) continue;
      const propName = (member.name as ts.Identifier).text;
      const isOptional = !!member.questionToken;
      const type = checker.getTypeAtLocation(member);
      const typeStr = checker.typeToString(type);

      // Generiere Runtime-Check basierend auf dem Typ:
      const check = generateCheck(propName, typeStr, isOptional);
      checks.push(check);
    }

    output += `export function validate${name}(data: unknown): data is ${name} {\n`;
    output += `  if (typeof data !== "object" || data === null) return false;\n`;
    output += `  const obj = data as Record<string, unknown>;\n`;
    output += checks.map(c => `  ${c}`).join("\n") + "\n";
    output += `  return true;\n`;
    output += `}\n\n`;
  });

  return output;
}

function generateCheck(name: string, type: string, optional: boolean): string {
  const prefix = optional ? `if (obj["${name}"] !== undefined && ` : `if (`;
  switch (type) {
    case "string": return `${prefix}typeof obj["${name}"] !== "string") return false;`;
    case "number": return `${prefix}typeof obj["${name}"] !== "number") return false;`;
    case "boolean": return `${prefix}typeof obj["${name}"] !== "boolean") return false;`;
    default: return `// TODO: Complex type check for ${name}: ${type}`;
  }
}

function hasExportModifier(node: ts.Node): boolean {
  return ts.getModifiers(node)?.some(
    m => m.kind === ts.SyntaxKind.ExportKeyword
  ) ?? false;
}
```

> ⚡ **Framework-Bezug:** Dieses Pattern ist die Grundlage von
> Bibliotheken wie `zod`, `io-ts` und `typebox`. Der Unterschied:
> Diese Libraries definieren Schemas zur Laufzeit und leiten Typen
> daraus ab. Unser Generator geht den umgekehrten Weg: Er liest
> bestehende TypeScript-Interfaces und generiert Runtime-Code.
> Angular's `@angular/compiler-cli` macht etwas Aehnliches: Es
> liest `@Component`-Metadaten und generiert Factory-Code.

> 💭 **Denkfrage:** Was sind die Grenzen eines Code-Generators der
> aus Interfaces Validierung generiert? Welche Typen kann er nicht
> handlen?
>
> **Antwort:** Union Types (`string | number`), Generics (`Array<T>`),
> Conditional Types, Template Literal Types, Recursive Types.
> Je komplexer der Typ, desto schwieriger die Runtime-Validierung.
> Deshalb definieren Libraries wie Zod Schemas zur Laufzeit statt
> Typen zur Compilezeit zu lesen — das gibt ihnen volle Kontrolle
> ueber die Validierungslogik.

---

## Architektur professioneller Tools

```
Professionelles TypeScript-Tool:
├── CLI (Commander/yargs)
│     ├── Argument Parsing
│     └── File Discovery (glob)
├── Compiler Integration
│     ├── tsconfig.json laden (ts.readConfigFile)
│     ├── createProgram mit den richtigen Optionen
│     └── Watch Mode (ts.createWatchProgram)
├── Analyse/Transformation
│     ├── AST Traversierung (Visitor Pattern)
│     ├── Type Checker Abfragen
│     └── Diagnostics sammeln
├── Output
│     ├── Report (JSON, Text, SARIF)
│     ├── Generierter Code (ts.Printer)
│     └── Quick Fixes (Language Service)
└── Tests
      ├── Snapshot Tests fuer Output
      └── Fixture-Dateien fuer verschiedene Szenarien
```

### Wann Compiler API vs. ESLint vs. Code-Gen-Tools?

| Szenario | Empfehlung |
|----------|-----------|
| Syntax-Regeln (Naming, Formatting) | ESLint |
| Typ-basierte Regeln (no-floating-promises) | @typescript-eslint |
| Projekt-spezifische Typ-Regeln | Custom Diagnostics |
| Code-Generierung aus Typen | Compiler API |
| AST-Transformation im Build | Custom Transformer |
| Schema-basierte Validierung | Zod/io-ts (nicht Compiler API) |

---

## Experiment: API-Docs-Generator

Baue ein Tool das aus JSDoc-Kommentaren und Typ-Informationen
automatisch API-Dokumentation generiert:

```typescript
import * as ts from "typescript";

function generateDocs(fileName: string): string {
  const program = ts.createProgram([fileName], { strict: true });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName)!;
  let docs = "# API Documentation\n\n";

  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (!symbol) return;

      // JSDoc-Kommentar lesen:
      const jsdoc = ts.getJSDocCommentsAndTags(node);
      const description = jsdoc.length > 0
        ? jsdoc[0].getText(sourceFile)
        : "Keine Beschreibung";

      // Signatur:
      const signature = checker.getSignatureFromDeclaration(node);
      if (!signature) return;

      docs += `## ${node.name.text}\n\n`;
      docs += `${description}\n\n`;
      docs += "```typescript\n";
      docs += checker.signatureToString(signature);
      docs += "\n```\n\n";
    }
  });

  return docs;
}

// Experiment: Erweitere den Generator um auch Klassen und ihre
// Methoden zu dokumentieren. Nutze symbol.getDocumentationComment()
// fuer die JSDoc-Beschreibung.
```

---

## Was du gelernt hast

- Ein **Mini-Linter** mit Typ-basierten Regeln (z.B. no-floating-promises) geht ueber ESLint hinaus
- Ein **Code-Generator** kann aus Interfaces Runtime-Validierung erzeugen
- Professionelle Tools folgen einer klaren **Architektur**: CLI → Compiler → Analyse → Output
- Die **Compiler API** ist ideal fuer Typ-basierte Analyse und Code-Generierung
- ESLint ist besser fuer Standard-Regeln, Zod/io-ts besser fuer Schema-Validierung

> 🧠 **Erklaere dir selbst:** Du hast jetzt die gesamte Compiler API
> kennengelernt: AST, Traversierung, Type Checker, Transformers,
> Diagnostics, Language Service. Welches dieser Features wuerdest du
> als erstes in deinem Arbeitsalltag einsetzen?
> **Kernpunkte:** Fuer die meisten Projekte: @typescript-eslint
> Regeln (nutzt die API indirekt) | Fuer Libraries: Custom
> Transformers | Fuer Tools: Type Checker + AST Traversierung |
> Die API direkt nutzen lohnt sich ab mittelgrossen Projekten

**Kernkonzept der gesamten Lektion:** Die Compiler API verwandelt den Compiler von einer Black Box in ein programmierbares Werkzeug. Du kannst Code analysieren, transformieren und generieren — mit dem vollen Wissen des Type Checkers.

---

> **Pausenpunkt** — Du kennst jetzt den Compiler von innen.
> Die naechste Lektion bringt alles zusammen: Best Practices und
> Anti-Patterns fuer professionelles TypeScript.
>
> Weiter geht es mit: [Lektion 39: Best Practices & Anti-Patterns](../../39-best-practices/sections/01-haeufigste-fehler.md)
