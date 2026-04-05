# Cheatsheet: Compiler API

Schnellreferenz fuer Lektion 38.

---

## Einstieg: Program erstellen

```typescript
import * as ts from "typescript";

// Aus Dateien:
const program = ts.createProgram(["src/main.ts"], { strict: true });
const sourceFile = program.getSourceFile("src/main.ts")!;
const checker = program.getTypeChecker();

// Aus einem String (nur Syntax, kein Type Checker):
const sf = ts.createSourceFile("x.ts", "const a = 1;", ts.ScriptTarget.Latest, true);
```

---

## Die drei Kernkonzepte

| Konzept | Beschreibung | Zugriff |
|---------|-------------|---------|
| **Node** | Syntax-Knoten im AST | `sourceFile`, `ts.forEachChild()` |
| **Symbol** | Benannte Entity (Variable, Funktion) | `checker.getSymbolAtLocation(node)` |
| **Type** | Aufgeloester Typ | `checker.getTypeAtLocation(node)` |

---

## AST Traversierung

```typescript
// Nur Direktkinder:
ts.forEachChild(node, child => { /* ... */ });

// Gesamter Baum (rekursiv):
function walk(node: ts.Node): void {
  // ... verarbeite node ...
  ts.forEachChild(node, walk);
}

// Type Guards:
if (ts.isFunctionDeclaration(node)) { /* node.name, node.parameters */ }
if (ts.isClassDeclaration(node)) { /* node.members */ }
if (ts.isCallExpression(node)) { /* node.expression, node.arguments */ }
```

---

## Type Checker

```typescript
const checker = program.getTypeChecker();

// Typ eines Nodes:
const type = checker.getTypeAtLocation(node);
const typeStr = checker.typeToString(type);

// Symbol (Name-Resolution):
const symbol = checker.getSymbolAtLocation(identifier);
symbol?.getDeclarations();  // Wo deklariert?
symbol?.getName();          // Name als String

// Funktions-Signatur:
const sig = checker.getSignatureFromDeclaration(funcDecl);
checker.getReturnTypeOfSignature(sig!);
sig!.getParameters();

// Zuweisbarkeit pruefen:
checker.isTypeAssignableTo(typeA, typeB);
```

---

## Custom Transformers

```typescript
const transformer: ts.TransformerFactory<ts.SourceFile> =
  (context) => (sourceFile) => {
    function visitor(node: ts.Node): ts.Node {
      if (ts.isStringLiteral(node)) {
        return ts.factory.createStringLiteral(node.text.toUpperCase());
      }
      return ts.visitEachChild(node, visitor, context);
    }
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };

// Ausfuehren:
program.emit(undefined, undefined, undefined, false, { before: [transformer] });

// Oder manuell:
const result = ts.transform(sourceFile, [transformer]);
const printer = ts.createPrinter();
console.log(printer.printFile(result.transformed[0] as ts.SourceFile));
result.dispose();
```

---

## Diagnostics

```typescript
const diagnostics = ts.getPreEmitDiagnostics(program);
for (const d of diagnostics) {
  const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
  const cat = ts.DiagnosticCategory[d.category];  // Error | Warning | ...
  if (d.file && d.start !== undefined) {
    const pos = d.file.getLineAndCharacterOfPosition(d.start);
    console.log(`${d.file.fileName}:${pos.line + 1}:${pos.character + 1} [${cat}] TS${d.code}: ${msg}`);
  }
}
```

---

## ts.factory — Haeufige Methoden

```typescript
const f = ts.factory;
f.createStringLiteral("hello");
f.createNumericLiteral(42);
f.createIdentifier("myVar");
f.createCallExpression(expr, typeArgs, args);
f.createPropertyAccessExpression(obj, prop);
f.createVariableStatement(modifiers, declList);
f.createFunctionDeclaration(modifiers, asterisk, name, typeParams, params, type, body);
```

---

## Wann welches Tool?

| Aufgabe | Tool |
|---------|------|
| Syntax-Regeln (Naming, Imports) | ESLint |
| Typ-basierte Regeln | @typescript-eslint (nutzt Compiler API) |
| Code-Generierung aus Typen | Compiler API direkt |
| AST-Transformation im Build | Custom Transformer |
| IDE-Features (Autocomplete, Rename) | Language Service |
| Formatierung | Prettier (eigener Parser) |
