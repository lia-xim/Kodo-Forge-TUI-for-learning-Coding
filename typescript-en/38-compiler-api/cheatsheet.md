# Cheatsheet: Compiler API

Quick reference for Lesson 38.

---

## Getting Started: Creating a Program

```typescript
import * as ts from "typescript";

// From files:
const program = ts.createProgram(["src/main.ts"], { strict: true });
const sourceFile = program.getSourceFile("src/main.ts")!;
const checker = program.getTypeChecker();

// From a string (syntax only, no type checker):
const sf = ts.createSourceFile("x.ts", "const a = 1;", ts.ScriptTarget.Latest, true);
```

---

## The Three Core Concepts

| Concept | Description | Access |
|---------|-------------|--------|
| **Node** | Syntax node in the AST | `sourceFile`, `ts.forEachChild()` |
| **Symbol** | Named entity (variable, function) | `checker.getSymbolAtLocation(node)` |
| **Type** | Resolved type | `checker.getTypeAtLocation(node)` |

---

## AST Traversal

```typescript
// Direct children only:
ts.forEachChild(node, child => { /* ... */ });

// Entire tree (recursive):
function walk(node: ts.Node): void {
  // ... process node ...
  ts.forEachChild(node, walk);
}

// Type guards:
if (ts.isFunctionDeclaration(node)) { /* node.name, node.parameters */ }
if (ts.isClassDeclaration(node)) { /* node.members */ }
if (ts.isCallExpression(node)) { /* node.expression, node.arguments */ }
```

---

## Type Checker

```typescript
const checker = program.getTypeChecker();

// Type of a node:
const type = checker.getTypeAtLocation(node);
const typeStr = checker.typeToString(type);

// Symbol (name resolution):
const symbol = checker.getSymbolAtLocation(identifier);
symbol?.getDeclarations();  // Where is it declared?
symbol?.getName();          // Name as string

// Function signature:
const sig = checker.getSignatureFromDeclaration(funcDecl);
checker.getReturnTypeOfSignature(sig!);
sig!.getParameters();

// Check assignability:
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

// Execute:
program.emit(undefined, undefined, undefined, false, { before: [transformer] });

// Or manually:
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

## ts.factory — Common Methods

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

## When to Use Which Tool?

| Task | Tool |
|------|------|
| Syntax rules (naming, imports) | ESLint |
| Type-based rules | @typescript-eslint (uses Compiler API) |
| Code generation from types | Compiler API directly |
| AST transformation in the build | Custom Transformer |
| IDE features (autocomplete, rename) | Language Service |
| Formatting | Prettier (own parser) |