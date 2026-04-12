# Section 5: Diagnostics and Language Service

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Custom Transformers](./04-custom-transformers.md)
> Next section: [06 - Practice: Custom Linter and Code Generator](./06-praxis-linter-codegen.md)

---

## What you'll learn here

- How **Diagnostics** work — reading errors, warnings, and suggestions programmatically
- The **Language Service** for IDE-like features (autocomplete, rename, quick fixes)
- Creating **Custom Diagnostics**: your own compiler warnings and errors
- How VS Code communicates with TypeScript

---

## Diagnostics: Errors as Data

Compiler errors are not strings — they are **structured objects**
with position, category, code, and message.

```typescript annotated
import * as ts from "typescript";

const program = ts.createProgram(["src/main.ts"], { strict: true });

// Collect all diagnostics:
const allDiagnostics = ts.getPreEmitDiagnostics(program);
// ^ Syntax errors + type errors + semantic errors

for (const diag of allDiagnostics) {
  // Category: error, warning, message, suggestion
  const category = ts.DiagnosticCategory[diag.category];
  // ^ "Error" | "Warning" | "Message" | "Suggestion"

  // Error code (e.g. 2322 = "Type 'X' is not assignable to type 'Y'")
  const code = diag.code;

  // Message (can be nested):
  const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");

  // Position in source code:
  if (diag.file && diag.start !== undefined) {
    const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
    console.log(`${diag.file.fileName}:${line + 1}:${character + 1}`);
    console.log(`  [${category}] TS${code}: ${message}`);
  }
}
```

> 📖 **Background: TypeScript error codes and why they're stable**
>
> Every TypeScript error has a unique code: TS2322 (type not
> assignable), TS2345 (argument not assignable), TS7006 (parameter
> implicitly has 'any' type). These codes are stable across releases
> — you can reference them in `tsconfig.json` with `--skipLibCheck` or
> in comments with `// @ts-expect-error`.
>
> The codes are not assigned arbitrarily:
> - **1xxx**: Syntax errors (code cannot be parsed)
> - **2xxx**: Semantic errors (code is syntactically correct, but types don't match)
> - **4xxx**: Declaration file errors (.d.ts issues)
> - **5xxx**: Compiler option errors (unknown tsconfig option)
> - **6xxx**: Messages and information (not an error)
> - **7xxx**: `noImplicitAny` errors
>
> The diagnostics system is deliberately programmatic — because tools
> like ESLint, VS Code, and CI pipelines need to process errors, not
> just display them. The structured access lets you, for example,
> filter only certain error categories, export errors to other formats
> (e.g. SARIF for GitHub Code Scanning), or use your own error codes
> with the same display system.
>
> The TypeScript wiki on GitHub has a complete list of all error codes
> with explanations.

---

## Custom Diagnostics: Your Own Warnings

You can create your own compiler warnings for your project:

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
        messageText: "console.log is not allowed in production code. Use the logger service.",
        category: ts.DiagnosticCategory.Warning,
        code: 90001,  // Custom code (>= 90000 for custom)
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return diagnostics;
}
```

> 🧠 **Explain to yourself:** Why are custom diagnostics useful even
> though ESLint rules can do the same thing? What is the advantage?
> **Key points:** Custom diagnostics have access to the type checker |
> ESLint rules do too (with @typescript-eslint) | Advantage of
> diagnostics: same error display as real compiler errors —
> VS Code shows them as red squiggles, just like TS2322 |
> Disadvantage: no plugin system like ESLint, no auto-fix mechanism |
> In practice: ESLint for standard rules, custom diagnostics for
> type-based checks that should be integrated into the build process

### Diagnostics in Practice: Three Categories

```typescript annotated
// Category 1: Syntactic diagnostics (parser errors)
const syntaxDiags = program.getSyntacticDiagnostics(sourceFile);
// ^ Fast — no type analysis needed. Parser errors only.
// ^ Example: TS1005 "')' expected"

// Category 2: Semantic diagnostics (type errors)
const semanticDiags = program.getSemanticDiagnostics(sourceFile);
// ^ Expensive — type checker must resolve all types
// ^ Example: TS2322 "Type 'string' is not assignable to type 'number'"

// Category 3: Suggestions (non-errors)
const suggestionDiags = program.getSuggestionDiagnostics(sourceFile);
// ^ Informational — e.g. "This code can be simplified"

// Everything together (what you usually need):
const allDiags = ts.getPreEmitDiagnostics(program, sourceFile);
```

---

## The Language Service: IDE Features

The Language Service is the interface between TypeScript and IDEs.
It provides autocomplete, hover, rename, and quick fixes.

```typescript annotated
import * as ts from "typescript";

// Create language service (instead of createProgram):
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

// Autocomplete at a specific position:
const completions = service.getCompletionsAtPosition(
  "src/main.ts",
  42,  // Cursor position (offset in the string)
  { includeCompletionsForModuleExports: true }
);

if (completions) {
  for (const entry of completions.entries) {
    console.log(`${entry.name} (${ts.ScriptElementKind[entry.kind]})`);
  }
}
```

### More Language Service Features

```typescript annotated
// Hover information:
const quickInfo = service.getQuickInfoAtPosition("src/main.ts", 42);
if (quickInfo) {
  console.log(ts.displayPartsToString(quickInfo.displayParts));
  // ^ e.g. "const greeting: string"
}

// "Go to Definition":
const definitions = service.getDefinitionAtPosition("src/main.ts", 42);
// ^ Returns file path and position of the declaration

// "Find All References":
const references = service.findReferences("src/main.ts", 42);
// ^ All places in the project that reference this symbol

// "Rename Symbol":
const renameLocations = service.findRenameLocations(
  "src/main.ts", 42, false, false
);
// ^ All places that need to be renamed
```

> ⚡ **Framework connection: VS Code and the Language Service**
>
> VS Code starts one TypeScript Language Service (`tsserver`) per
> project as a separate process. Communication runs via IPC
> (Inter-Process Communication). Every keystroke in a `.ts` file
> triggers a Language Service call:
>
> - You type a character: `getCompletionsAtPosition`
> - You hover over a name: `getQuickInfoAtPosition`
> - You press F12: `getDefinitionAtPosition`
> - You change a file: incremental re-parsing
>
> Angular's Language Service plugin (`@angular/language-service`)
> extends the TypeScript Language Service with template-specific
> features. It registers itself as a TypeScript Language Service plugin
> and "listens" to `.html` files and template strings in `@Component`.
> Autocomplete in `{{ user.` then shows Angular-specific suggestions.
>
> You can write Language Service plugins yourself — this requires a
> `typescript.plugins` entry in `tsconfig.json`. Large libraries like
> Prisma use this to integrate query autocomplete directly into VS Code.

> 💭 **Think about it:** The Language Service must respond on every
> keystroke — usually in under 100ms. How does it manage this with
> large projects containing thousands of files?
>
> **Answer:** Incremental parsing and caching. The service remembers
> the previous AST and only updates the changed parts.
> `getScriptVersion()` in the host tells the service which files have
> changed. Only for those files is the AST and type check recalculated.
> Even so, it can slow down in very large projects — that's why
> Project References (L29) exist for monorepos.

---

## Experiment: Quick-Fix Generator

Build a service that suggests automatic fixes:

```typescript
// Find all 'any' annotations and suggest 'unknown' instead:
function suggestUnknownInsteadOfAny(
  sourceFile: ts.SourceFile
): { start: number; length: number; replacement: string; message: string }[] {
  const suggestions: { start: number; length: number; replacement: string; message: string }[] = [];

  function visit(node: ts.Node): void {
    // Find type annotations that are 'any':
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const parent = node.parent;
      // Check if it's an explicit annotation (not inferred):
      if (parent && (
        ts.isParameter(parent) ||
        ts.isVariableDeclaration(parent) ||
        ts.isPropertyDeclaration(parent)
      )) {
        suggestions.push({
          start: node.getStart(sourceFile),
          length: node.getWidth(sourceFile),
          replacement: "unknown",
          message: "Replace 'any' with 'unknown' for type safety",
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return suggestions;
}

// Experiment: Extend the generator to also find implicitly typed 'any'
// parameters (functions without type annotations). Use the type checker:
// checker.getTypeAtLocation(param).flags & ts.TypeFlags.Any
```

---

## What you've learned

- **Diagnostics** are structured error objects with position, category, and code
- **Custom Diagnostics** enable your own compiler warnings (e.g. no console.log)
- The **Language Service** provides IDE features: autocomplete, hover, rename, quick fixes
- VS Code communicates with TypeScript via the Language Service
- **Incremental parsing** makes the service fast enough on every keystroke

> 🧠 **Explain to yourself:** What is the difference between the
> Language Service and the compiler (createProgram)? When would you
> use which?
> **Key points:** Compiler = single pass (build) |
> Language Service = interactive, incremental (IDE) | Compiler
> for CLI tools and build pipelines | Language Service for
> editor plugins and interactive tools

**Core concept to remember:** Diagnostics are the structured form of compiler errors. The Language Service is the "IDE mode" of the compiler — interactive, incremental, and optimized for speed.

---

> **Pause point** — You now know the entire Compiler API landscape.
> In the final section, we'll use it to build real tools.
>
> Continue with: [Section 06: Practice — Custom Linter and Code Generator](./06-praxis-linter-codegen.md)