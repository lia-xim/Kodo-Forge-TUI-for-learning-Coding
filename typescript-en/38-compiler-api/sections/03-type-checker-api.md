# Section 3: Type Checker API

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Traversing Nodes](./02-nodes-traversieren.md)
> Next section: [04 - Custom Transformers](./04-custom-transformers.md)

---

## What you'll learn here

- How to query the type of any expression using **getTypeAtLocation**
- **getSymbolAtLocation** for name resolution and declaration lookup
- The difference between **type as string** and **type as object** in the API
- Practical example: automatically finding unused exports

---

## The Type Checker: The Brain of the Compiler

The parser produces the AST (syntax). But the AST alone doesn't
know that `greeting` is of type `string` — only the
**Type Checker** knows that. It is the most powerful component of the Compiler API.

> 📖 **Background: How the Type Checker works**
>
> The Type Checker was implemented personally by Anders Hejlsberg
> and is by far the most complex component of the
> TypeScript compiler (~50,000 lines in `checker.ts`). It
> traverses the AST in multiple passes and computes the type
> for every expression.
>
> The process is not linear: the Checker uses **Lazy Evaluation**.
> It computes types only when they are needed — not
> on the first pass. This is important for circular references:
> if class A has a method that returns class B, and class
> B has a method that returns class A, a naive checker
> would fall into an infinite loop. Lazy Evaluation prevents this.
>
> In doing so, it resolves generics, performs type narrowing (Control
> Flow Analysis), checks assignment compatibility, and much more.
> The `checker.ts` file in the TypeScript repository is one of the
> largest single files in the open-source world — and it grows
> with every release. A learning goal: if you understand why `checker.ts`
> is so complex, you also understand why TypeScript features like
> Template Literal Types or Conditional Types took so long
> to implement.

---

## getTypeAtLocation: What type does this expression have?

```typescript annotated
import * as ts from "typescript";

const program = ts.createProgram(["src/main.ts"], { strict: true });
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile("src/main.ts")!;

// Find all variables and print their type:
function printVariableTypes(node: ts.Node): void {
  if (ts.isVariableDeclaration(node) && node.name) {
    const type = checker.getTypeAtLocation(node);
    // ^ Returns the RESOLVED type (after inference, narrowing, etc.)
    const typeString = checker.typeToString(type);
    // ^ Converts the type into a human-readable string
    console.log(`${node.name.getText(sourceFile)}: ${typeString}`);
  }
  ts.forEachChild(node, printVariableTypes);
}

printVariableTypes(sourceFile!);
// Output e.g.:
// greeting: string
// numbers: number[]
// config: { host: string; port: number }
```

### Inspecting type objects

```typescript annotated
// The Type Checker returns Type objects — not just strings:
const type = checker.getTypeAtLocation(someNode);

// Check if it is a union type:
if (type.isUnion()) {
  console.log("Union members:");
  for (const member of type.types) {
    console.log("  -", checker.typeToString(member));
  }
}

// List properties of an object type:
const properties = type.getProperties();
// ^ Returns an array of Symbol objects
for (const prop of properties) {
  const propType = checker.getTypeOfSymbolAtLocation(prop, someNode);
  console.log(`  ${prop.getName()}: ${checker.typeToString(propType)}`);
}

// Check if one type is assignable to another:
const isAssignable = checker.isTypeAssignableTo(typeA, typeB);
// ^ Like: "Can I assign A to a variable of type B?"
```

> 🧠 **Explain to yourself:** Why does `getTypeAtLocation` return the
> **resolved** type and not the annotated type?
> What is the difference for `const x = [1, 2, 3]`?
> **Key points:** The annotated type might be absent (inference) |
> The resolved type takes narrowing and context into account |
> For `const x = [1, 2, 3]` the resolved type is `number[]`
> (not `(number)[]` or `[number, number, number]`)

---

## getSymbolAtLocation: What does this name mean?

```typescript annotated
import * as ts from "typescript";

// A Symbol represents a named entity:
// variable, function, class, property, parameter, etc.

function findSymbolInfo(node: ts.Node): void {
  if (ts.isIdentifier(node)) {
    const symbol = checker.getSymbolAtLocation(node);
    // ^ Resolves the name — follows imports, aliases, etc.
    if (symbol) {
      console.log(`Name: ${symbol.getName()}`);

      // Where was it declared?
      const declarations = symbol.getDeclarations();
      if (declarations && declarations.length > 0) {
        const decl = declarations[0];
        const file = decl.getSourceFile().fileName;
        const pos = decl.getSourceFile().getLineAndCharacterOfPosition(decl.getStart());
        console.log(`  Declared in: ${file}:${pos.line + 1}`);
      }

      // What type does it have?
      const type = checker.getTypeOfSymbolAtLocation(symbol, node);
      console.log(`  Type: ${checker.typeToString(type)}`);

      // Is it exported?
      const flags = symbol.getFlags();
      console.log(`  Flags: ${ts.SymbolFlags[flags]}`);
    }
  }
  ts.forEachChild(node, findSymbolInfo);
}
```

> ⚡ **Framework connection: Symbols in your Angular day-to-day**
>
> Every time you click on a name in your Angular component in VS Code
> and press F12, the following code runs behind the scenes:
>
> ```
> cursor-position → getNodeAt(position) → ts.isIdentifier(node)?
>   → checker.getSymbolAtLocation(node)
>   → symbol.getDeclarations()[0]
>   → open file, jump to position
> ```
>
> This applies to template bindings as well: Angular's Language Service
> (`@angular/language-service`) extends exactly this mechanism.
> When you press F12 on `{{ user.name }}` in an HTML template, the
> Angular Language Service uses the TypeScript Checker to resolve the symbol
> `user` and then look up the property `name` on it.
>
> "Find All References" (Shift+F12) does the same in reverse: find
> all identifiers that point to the same symbol. This is especially
> useful when you rename a service method — all usages in
> templates and components are found because they all point to the same
> symbol.

---

## Practice: Finding Unused Exports

```typescript annotated
import * as ts from "typescript";

function findUnusedExports(program: ts.Program): string[] {
  const checker = program.getTypeChecker();
  const unused: string[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    // Skip node_modules and .d.ts:
    if (sourceFile.isDeclarationFile) continue;
    if (sourceFile.fileName.includes("node_modules")) continue;

    ts.forEachChild(sourceFile, node => {
      // Find exported declarations:
      const modifiers = ts.getModifiers(node);
      const isExported = modifiers?.some(
        m => m.kind === ts.SyntaxKind.ExportKeyword
      );
      if (!isExported) return;

      // Get the symbol:
      let name: string | undefined;
      if (ts.isFunctionDeclaration(node) && node.name) name = node.name.text;
      if (ts.isClassDeclaration(node) && node.name) name = node.name.text;
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) name = decl.name.text;
        }
      }

      if (!name) return;

      // Check if the symbol is imported in other files:
      // (simplified — a full implementation would need symbol references)
      const symbol = checker.getSymbolAtLocation(
        (node as any).name || (node as any).declarationList?.declarations[0]?.name
      );
      // In practice: checker.findReferences() or custom import analysis
      if (symbol) {
        unused.push(`${sourceFile.fileName}: ${name}`);
      }
    });
  }

  return unused;
}
```

> 💭 **Think about it:** The Type Checker is the most expensive component of the
> compiler in terms of runtime. Why should you call `createProgram`
> only once and reuse the checker — instead of creating a new program
> for each analysis?
>
> **Answer:** `createProgram` parses all files and computes all
> types. This can take seconds on large projects. The Checker
> caches results internally. A second call to `getTypeAtLocation`
> for the same node is nearly free. For watch mode there is
> `ts.createWatchProgram` which only re-checks changed files.

---

## Experiment: Type Report Generator

Build a tool that outputs the complete type report for every exported function:

```typescript
import * as ts from "typescript";

function generateTypeReport(fileName: string): void {
  const program = ts.createProgram([fileName], { strict: true });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName)!;

  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const signature = checker.getSignatureFromDeclaration(node);
      if (!signature) return;

      const returnType = checker.getReturnTypeOfSignature(signature);
      const params = signature.getParameters();

      console.log(`function ${node.name.text}(`);
      for (const param of params) {
        const paramType = checker.getTypeOfSymbolAtLocation(param, node);
        console.log(`  ${param.getName()}: ${checker.typeToString(paramType)}`);
      }
      console.log(`): ${checker.typeToString(returnType)}`);
    }
  });

  // Experiment: Extend the report to also output classes and their
  // methods. Use ts.isClassDeclaration and
  // iterate over node.members.
}
```

---

## What you've learned

- **getTypeAtLocation** returns the resolved type of an expression — after inference and narrowing
- **getSymbolAtLocation** resolves a name to its declaration — the foundation for "Go to Definition"
- **Type objects** have methods like `isUnion()`, `getProperties()`, `isTypeAssignableTo()`
- The Type Checker is the **most expensive** component — create it once, reuse it often
- VS Code, ESLint, and Angular all use the same API for type-based features

> 🧠 **Explain to yourself:** What happens when you apply `getTypeAtLocation`
> to an `if` block inside a function where
> type narrowing takes place? Does the type account for the narrowing?
> **Key points:** Yes! The Type Checker takes control flow into account |
> Inside `if (typeof x === "string")`, getTypeAtLocation
> returns `string` for x, not `string | number` |
> This is the same analysis VS Code uses for hover tooltips

**Core concept to remember:** Node = "where is it in the code?", Symbol = "what does this name mean?", Type = "what type does it have?". These three form the backbone of every Compiler API analysis.

---

> **Pause point** — Type Checker understood. Now comes the
> crown jewel: AST transformation with Custom Transformers.
>
> Continue with: [Section 04: Custom Transformers](./04-custom-transformers.md)