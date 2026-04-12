# Section 6: Practice — Custom Linter and Code Generator

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Diagnostics and Language Service](./05-diagnostics-und-language-service.md)
> Next section: [Lesson 39 - Best Practices](../../39-best-practices/sections/01-haeufigste-fehler.md)

---

## What you'll learn here

- How to build a **mini-linter** with the Compiler API (with type-based rules)
- A **code generator** that automatically produces validation functions from interfaces
- When to use the **Compiler API** instead of ESLint or code-gen tools
- The architecture of professional TypeScript tools

---

## Project 1: Mini-Linter with Type Rules

ESLint can check syntax rules. But some rules require
**type information** — and this is where the Compiler API excels.

> 📖 **Background: @typescript-eslint under the hood**
>
> The `@typescript-eslint` package is proof that the
> Compiler API is indispensable. It uses `ts.createProgram` to
> get the type checker and connects it to ESLint's rule system.
> Rules like `no-floating-promises` (finding unhandled promises)
> or `strict-boolean-expressions` (enforcing booleans in if
> conditions) would be impossible without the type checker.
> Our mini-linter does the same thing — just without the ESLint framework.

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

    // Rule 1: No unhandled promises
    checkFloatingPromises(sourceFile, checker, results);
    // Rule 2: No any parameters in public functions
    checkPublicAnyParams(sourceFile, checker, results);
    // Rule 3: No empty catch blocks
    checkEmptyCatch(sourceFile, results);
  }

  return results;
}
```

### Rule: Finding Unhandled Promises

```typescript annotated
function checkFloatingPromises(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  results: LintResult[]
): void {
  function visit(node: ts.Node): void {
    // Search for ExpressionStatements (expressions standing as statements):
    if (ts.isExpressionStatement(node)) {
      const type = checker.getTypeAtLocation(node.expression);
      const typeStr = checker.typeToString(type);
      // ^ Use the type checker to inspect the type of the expression

      // Check whether the type contains "Promise":
      if (typeStr.startsWith("Promise<")) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile)
        );
        results.push({
          file: sourceFile.fileName,
          line: line + 1,
          column: character + 1,
          rule: "no-floating-promises",
          message: `Unhandled promise: ${typeStr}. Use await or .catch().`,
          severity: "error",
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}
```

> 🧠 **Explain to yourself:** Why can a purely syntax-based
> linter (without a type checker) not find unhandled promises?
> What would it need to do so?
> **Key points:** Syntax alone doesn't show whether `foo()` returns a promise | The type checker knows the return type | Without a type checker you'd have to manually mark every function as async

---

## Project 2: Code Generator from Interfaces

Automatically generate validation functions from TypeScript interfaces:

```typescript annotated
import * as ts from "typescript";

// Input: interface User { name: string; age: number; email?: string; }
// Output: function validateUser(data: unknown): data is User { ... }

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

      // Generate runtime check based on the type:
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

> ⚡ **Framework connection:** This pattern is the foundation of
> libraries like `zod`, `io-ts`, and `typebox`. The difference:
> these libraries define schemas at runtime and derive types from
> them. Our generator takes the opposite approach: it reads
> existing TypeScript interfaces and generates runtime code.
> Angular's `@angular/compiler-cli` does something similar: it
> reads `@Component` metadata and generates factory code.

> 💭 **Think about it:** What are the limits of a code generator that
> produces validation from interfaces? Which types can it not handle?
>
> **Answer:** Union types (`string | number`), generics (`Array<T>`),
> conditional types, template literal types, recursive types.
> The more complex the type, the harder the runtime validation.
> That's why libraries like Zod define schemas at runtime instead of
> reading types at compile time — that gives them full control
> over validation logic.

---

## Architecture of Professional Tools

```
Professional TypeScript tool:
├── CLI (Commander/yargs)
│     ├── Argument parsing
│     └── File discovery (glob)
├── Compiler integration
│     ├── Load tsconfig.json (ts.readConfigFile)
│     ├── createProgram with the right options
│     └── Watch mode (ts.createWatchProgram)
├── Analysis/transformation
│     ├── AST traversal (visitor pattern)
│     ├── Type checker queries
│     └── Collecting diagnostics
├── Output
│     ├── Report (JSON, text, SARIF)
│     ├── Generated code (ts.Printer)
│     └── Quick fixes (language service)
└── Tests
      ├── Snapshot tests for output
      └── Fixture files for various scenarios
```

### When to use Compiler API vs. ESLint vs. Code-Gen Tools?

| Scenario | Recommendation |
|----------|---------------|
| Syntax rules (naming, formatting) | ESLint |
| Type-based rules (no-floating-promises) | @typescript-eslint |
| Project-specific type rules | Custom diagnostics |
| Code generation from types | Compiler API |
| AST transformation in build | Custom transformer |
| Schema-based validation | Zod/io-ts (not Compiler API) |

---

## Experiment: API Docs Generator

Build a tool that automatically generates API documentation
from JSDoc comments and type information:

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

      // Read JSDoc comment:
      const jsdoc = ts.getJSDocCommentsAndTags(node);
      const description = jsdoc.length > 0
        ? jsdoc[0].getText(sourceFile)
        : "No description";

      // Signature:
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

// Experiment: Extend the generator to also document classes and their
// methods. Use symbol.getDocumentationComment()
// for the JSDoc description.
```

---

## What you learned

- A **mini-linter** with type-based rules (e.g. no-floating-promises) goes beyond what ESLint can do
- A **code generator** can produce runtime validation from interfaces
- Professional tools follow a clear **architecture**: CLI → Compiler → Analysis → Output
- The **Compiler API** is ideal for type-based analysis and code generation
- ESLint is better for standard rules, Zod/io-ts better for schema validation

> 🧠 **Explain to yourself:** You've now seen the entire Compiler API:
> AST, traversal, type checker, transformers,
> diagnostics, language service. Which of these features would you
> use first in your day-to-day work?
> **Key points:** For most projects: @typescript-eslint
> rules (use the API indirectly) | For libraries: custom
> transformers | For tools: type checker + AST traversal |
> Using the API directly pays off from mid-sized projects onward

**Core concept of the entire lesson:** The Compiler API turns the compiler from a black box into a programmable tool. You can analyze, transform, and generate code — with the full knowledge of the type checker.

---

> **Pause point** — You now know the compiler from the inside.
> The next lesson brings everything together: best practices and
> anti-patterns for professional TypeScript.
>
> Continue with: [Lesson 39: Best Practices & Anti-Patterns](../../39-best-practices/sections/01-haeufigste-fehler.md)