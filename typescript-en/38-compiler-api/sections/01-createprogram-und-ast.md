# Section 1: ts.createProgram and the AST

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Traversing Nodes](./02-nodes-traversieren.md)

---

## What you'll learn here

- What the **Abstract Syntax Tree (AST)** is and why it forms the heart of the compiler
- How to programmatically load a TypeScript program with **ts.createProgram**
- The most important **Node types** in the AST and how they relate to each other
- When you need the Compiler API — and when you don't

---

## The Compiler as a Tool

Up to now you've learned TypeScript as a language. But the
TypeScript compiler (`tsc`) is not just a translation tool —
it's a **programming library**. You can use it in your own
code to analyze, transform, and generate TypeScript files.

> 📖 **Background: Why TypeScript has a public API**
>
> Most compilers are black boxes — you put code in and
> get output. GCC, Clang, javac — they all hide their
> internal structures. TypeScript is fundamentally different. The team
> around Anders Hejlsberg (inventor of Turbo Pascal, Delphi, and C#)
> decided from the very beginning to expose the compiler internals as a
> public API.
>
> The reason was pragmatic: Microsoft didn't want to be the only
> company building TypeScript tools. They wanted an ecosystem. The
> decision was revolutionary — because a compiler that offers itself
> as a library becomes a platform.
>
> You can see the result today: VS Code communicates directly with the
> TypeScript compiler core (tsserver). ESLint with `@typescript-eslint`
> uses `ts.createProgram` to check type-based rules — something
> that would simply be impossible without this API. Bundlers like esbuild
> and Vite parse TypeScript with the same infrastructure. Code
> generators like GraphQL-Codegen read TypeScript types and automatically
> generate client code.
>
> The API is directly available under `typescript` (the npm package) —
> no separate package needed. The same `typescript` dependency
> that runs `tsc` also gives you access to the entire compiler core.

---

## The Abstract Syntax Tree (AST)

When the compiler reads your code, it produces a **tree** that
represents the structure of the code. This tree is called the AST.

```typescript annotated
// This code...
const greeting = "hello";

// ...becomes this AST (simplified):
// SourceFile
//   └── VariableStatement
//         └── VariableDeclarationList (const)
//               └── VariableDeclaration
//                     ├── Identifier: "greeting"
//                     └── StringLiteral: "hello"
// ^ Every "node" in the tree is a Node object with type, position, and children
```

### Why the AST matters

The AST is the **common language** of all tools:

```
Source code (string)
    │
    ▼
  Parser → AST (tree structure)
    │
    ├── Type Checker: Checks types against the AST
    ├── Emitter: Generates JavaScript from the AST
    ├── Language Service: Autocomplete, hover, rename
    ├── ESLint: Checks rules on the AST
    └── YOUR tool: Analyzes/transforms the AST
```

> 💭 **Think about it:** Why do all tools work on the AST instead of
> directly on the source code string? What would be the problem with
> string-based analysis?
>
> **Answer:** Strings are unstructured. To know whether
> `greeting` is a variable or a property, you'd have to parse the
> entire context. The AST already has this information —
> every node knows its type, its position, and its context.
> String-based tools (RegExp) break on comments, strings-
> within-strings, and nested code.
>
> Imagine you want to find all calls to `console.log`.
> With RegExp: `/console\.log\(/g` — but what about
> `// console.log(...)` in a comment? Or `"console.log("` in
> a string literal? Or `console\n.log(` with a line break? Every
> edge case makes the RegExp more complex and error-prone.
> The AST doesn't have these problems — `ts.isCallExpression(node)` and
> `ts.isPropertyAccessExpression(node.expression)` are exact and
> context-safe.

---

## ts.createProgram: Your Entry Point

```typescript annotated
import * as ts from "typescript";

// Step 1: Create the program
const program = ts.createProgram(
  ["src/main.ts"],                    // Files
  { strict: true, target: ts.ScriptTarget.ES2022 }  // Compiler options
);
// ^ createProgram reads the files, parses them, and creates the AST

// Step 2: Get the SourceFile (= AST of a file)
const sourceFile = program.getSourceFile("src/main.ts");
// ^ SourceFile is the root node of the AST for this file

// Step 3: Get the Type Checker
const checker = program.getTypeChecker();
// ^ The Type Checker has access to ALL type information

// Step 4: Check diagnostics (errors)
const diagnostics = ts.getPreEmitDiagnostics(program);
diagnostics.forEach(d => {
  const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
  console.log(`Error: ${message}`);
});
```

### The most important objects

| Object | Description | Created by |
|--------|-------------|----------------|
| `Program` | Represents the entire project | `ts.createProgram()` |
| `SourceFile` | AST of a single file | `program.getSourceFile()` |
| `TypeChecker` | Knows all types in the project | `program.getTypeChecker()` |
| `Node` | A node in the AST | Contained in the SourceFile |
| `Symbol` | Represents a named entity | `checker.getSymbolAtLocation()` |
| `Type` | A resolved type | `checker.getTypeAtLocation()` |

> 🧠 **Explain it to yourself:** What is the difference between a
> `Node`, a `Symbol`, and a `Type` in the Compiler API?
> Why do you need all three?
> **Key points:** Node = syntax (where in the code is it?) | Symbol =
> semantics (what does this name mean?) | Type = type information
> (what type does this expression have?) | An Identifier node points
> to a Symbol, and the Symbol has a Type

---

## Node Types: The Building Blocks of the AST

TypeScript has over 300 Node types. The most important ones:

```typescript annotated
// SyntaxKind is an enum with all Node types:
ts.SyntaxKind.SourceFile           // Root
ts.SyntaxKind.VariableStatement    // const/let/var ...
ts.SyntaxKind.FunctionDeclaration  // function foo() {}
ts.SyntaxKind.ClassDeclaration     // class Foo {}
ts.SyntaxKind.InterfaceDeclaration // interface Foo {}
ts.SyntaxKind.TypeAliasDeclaration // type Foo = ...
ts.SyntaxKind.Identifier           // A name (e.g. "greeting")
ts.SyntaxKind.StringLiteral        // "hello"
ts.SyntaxKind.NumericLiteral       // 42
ts.SyntaxKind.CallExpression       // foo()
ts.SyntaxKind.PropertyAccessExpression  // obj.prop

// Type Guards for Nodes:
if (ts.isVariableStatement(node)) {
  // TypeScript knows: node is a VariableStatement
  // node.declarationList is available
}
if (ts.isFunctionDeclaration(node)) {
  // node.name, node.parameters, node.body are available
}
```

> ⚡ **Framework connection: Angular and the Compiler API**
>
> In your Angular project, the Compiler API is everywhere,
> even if you never see it directly. When you run `ng build`,
> the following happens:
>
> 1. `@angular/compiler-cli` calls `ts.createProgram` — exactly as
>    shown in Section 1
> 2. Angular-specific transformers search the AST for
>    `@Component`, `@Injectable`, `@NgModule` decorators
> 3. For each component, template code is read, analyzed, and
>    converted into optimized JavaScript code (Ivy instructions)
> 4. Dependency injection factories are automatically generated —
>    the `ɵfac` property you see in compiled Angular code
>
> That's why Angular needs its own build step (`ngc`)
> instead of plain `tsc`. The Angular compiler is one of
> the largest and most complex Compiler API applications in the
> open-source world. Your knowledge of `ts.createProgram` and the AST
> transfers directly to Angular's inner workings.
>
> ESLint with `@typescript-eslint/parser` also parses the AST —
> that's why it can check type-based rules like `no-floating-promises`
> that would simply be impossible without the Type Checker.

---

## Experiment: AST Explorer

Write a mini script that outputs the AST of a TypeScript file:

```typescript
import * as ts from "typescript";

// Create an AST directly from a string (without a file):
const source = `
  const name: string = "TypeScript";
  function greet(who: string): string {
    return "Hello " + who;
  }
`;

const sourceFile = ts.createSourceFile(
  "example.ts",
  source,
  ts.ScriptTarget.Latest,
  true  // setParentNodes = true (important for traversal!)
  // ^ Without setParentNodes: node.parent is undefined!
  // ^ With setParentNodes: every Node knows its parent Node
);

// Output all top-level nodes:
sourceFile.forEachChild(node => {
  console.log(
    ts.SyntaxKind[node.kind],     // Node type as string (e.g. "VariableStatement")
    node.getFullText(sourceFile)  // Source code of this node
  );
});

// Exploration: Go deeper into the tree
sourceFile.forEachChild(node => {
  if (ts.isFunctionDeclaration(node)) {
    console.log("Function:", node.name?.text);
    // Output parameters:
    node.parameters.forEach(param => {
      console.log("  Parameter:", param.name.getText(sourceFile));
      if (param.type) {
        console.log("  Type:", ts.SyntaxKind[param.type.kind]);
      }
    });
  }
});

// Experiment: Change the source string and observe how
// the AST changes. What happens with a syntax error?
// Tip: ts.createSourceFile attempts error-tolerant parsing —
// even invalid code produces an (incomplete) AST.
// What happens with an interface? A class? An enum?
```

---

## What you've learned

- The **AST** is a tree structure that represents the code — all tools work on it
- **ts.createProgram** loads files and produces the AST, Type Checker, and diagnostics
- **Node**, **Symbol**, and **Type** are the three core concepts: syntax, semantics, type information
- TypeScript has over **300 Node types** — Type Guards like `ts.isFunctionDeclaration()` help when working with them
- The Compiler API is the foundation for IDEs, linters, bundlers, and code generators

> 🧠 **Explain it to yourself:** Why is `ts.createSourceFile` (parses
> a string) different from `ts.createProgram` (parses a project)?
> When would you use which one?
> **Key points:** createSourceFile only parses syntax (no Type
> Checker) | createProgram loads imports, resolves types |
> For syntax analysis: createSourceFile | For type analysis:
> createProgram

**Core concept to remember:** The AST is the bridge between source code and tools. Every tool that understands TypeScript — from VS Code to ESLint — works on the AST. The Compiler API gives you access to that bridge.

---

> **Pause point** — You now know the AST and ts.createProgram.
> Next you'll learn to traverse the tree.
>
> Continue with: [Section 02: Traversing Nodes](./02-nodes-traversieren.md)