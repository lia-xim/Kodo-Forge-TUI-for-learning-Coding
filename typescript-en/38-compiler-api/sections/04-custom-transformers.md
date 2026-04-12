# Section 4: Custom Transformers — AST Manipulation

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Type Checker API](./03-type-checker-api.md)
> Next section: [05 - Diagnostics and Language Service](./05-diagnostics-und-language-service.md)

---

## What you'll learn here

- How **Custom Transformers** modify the AST — before or after type checking
- The **ts.factory** API for creating new AST nodes
- **Before-** and **After-Transformers** and when to use which
- Practical example: Injecting automatic logging into functions

---

## Transformers: Changing Code at Compile Time

Custom Transformers are functions that modify the AST **before output**.
They are the most powerful feature of the Compiler API — with them
you can generate, remove, or rewrite code.

> 📖 **Background: Transformers in the TypeScript Ecosystem**
>
> TypeScript itself uses transformers internally: the compiler converts
> `async/await` into Promises, removes type annotations, and
> compiles `enum` into JavaScript objects — all via internal
> transformers.
>
> The public transformer API was made available starting with TypeScript 2.3 (2017).
> It was a deliberate move: Microsoft wanted to enable tools like Angular,
> Babel, and webpack to hook into the build process without needing
> to write their own parsers.
>
> Concrete applications today:
> - **Angular `@angular/compiler-cli`**: Generates Ivy render functions
>   and DI factories from component decorators
> - **`ts-auto-mock`**: Automatically generates type-safe mock objects at
>   compile time — with zero runtime overhead
> - **`typescript-plugin-css-modules`**: Converts CSS class names into
>   TypeScript types — you get autocomplete for CSS classes
> - **`@swc/core`**: The fast TypeScript transpiler (in Rust)
>   implements the same transformation semantics
>
> The key difference from other compile-time tools (Babel,
> SWC): TypeScript transformers have access to the Type Checker. That
> makes them more powerful — and more complex.

---

## The Anatomy of a Transformer

```typescript annotated
import * as ts from "typescript";

// A transformer is a function that receives a TransformationContext
// and returns a function that transforms SourceFiles:
const myTransformer: ts.TransformerFactory<ts.SourceFile> =
  (context: ts.TransformationContext) => {
    // Context contains compiler options and helper functions
    return (sourceFile: ts.SourceFile): ts.SourceFile => {
      // Visitor function that visits every node:
      function visitor(node: ts.Node): ts.Node {
        // Here: decide whether the node should be changed
        if (ts.isStringLiteral(node)) {
          // Create a NEW node (immutable!):
          return ts.factory.createStringLiteral(
            node.text.toUpperCase()
          );
        }
        // For unchanged nodes: visit the children
        return ts.visitEachChild(node, visitor, context);
        // ^ visitEachChild returns a new tree
      }
      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };
```

### The ts.factory API

```typescript annotated
// ts.factory creates new AST nodes:
const factory = ts.factory;

// New string:
const str = factory.createStringLiteral("hello");

// New function call: console.log("hello")
const logCall = factory.createCallExpression(
  factory.createPropertyAccessExpression(
    factory.createIdentifier("console"),
    factory.createIdentifier("log")
  ),
  undefined,  // Type Arguments
  [factory.createStringLiteral("hello")]  // Arguments
);

// New variable statement: const x = 42
const varDecl = factory.createVariableStatement(
  undefined,  // Modifier
  factory.createVariableDeclarationList(
    [factory.createVariableDeclaration(
      "x",
      undefined,  // Type annotation
      undefined,  // Type
      factory.createNumericLiteral(42)
    )],
    ts.NodeFlags.Const
  )
);
```

> 🧠 **Explain to yourself:** Why are AST nodes immutable?
> Why does `ts.factory` always create NEW nodes instead of
> modifying existing ones?
> **Key points:** Immutability makes the compiler reliable |
> Multiple transformers can read the same AST without
> interfering with each other | Debugging: you can compare the state before
> and after each transformer | Like Immer's produce()
> or Redux's state
>
> The analogy to React is apt: just as React state should never
> be directly mutated (`state.value = x` is wrong), the
> AST must never be directly mutated. Instead, `ts.factory` returns
> new nodes and `visitEachChild` builds a new subtree.
> The compiler then decides which parts of the tree can be
> reused (structural sharing).

---

## In Practice: Injecting Automatic Logging

A transformer that inserts a `console.log` at the start of every function:

```typescript annotated
function createLoggingTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile) => {
    function visitor(node: ts.Node): ts.Node {
      if (ts.isFunctionDeclaration(node) && node.name && node.body) {
        const funcName = node.name.text;

        // Create: console.log("Entering functionName", arguments)
        const logStatement = ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("console"),
              ts.factory.createIdentifier("log")
            ),
            undefined,
            [
              ts.factory.createStringLiteral(`Entering ${funcName}`),
            ]
          )
        );

        // New function body: log statement + original statements
        const newBody = ts.factory.createBlock(
          [logStatement, ...node.body.statements],
          true  // multiLine
        );

        // Return a new FunctionDeclaration:
        return ts.factory.updateFunctionDeclaration(
          node,
          node.modifiers,        // Preserve modifiers
          node.asteriskToken,    // Generator token
          node.name,             // Preserve name
          node.typeParameters,   // Generics
          node.parameters,       // Parameters
          node.type,             // Return type
          newBody                // New body with logging
        );
      }
      return ts.visitEachChild(node, visitor, context);
    }
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };
}
```

### Running the Transformer

```typescript annotated
// Method 1: With ts.emit (recommended for build pipelines)
const result = program.emit(
  undefined,  // All files
  undefined,  // Default writeFile
  undefined,  // Cancellation token
  false,      // emitOnlyDtsFiles
  {
    before: [createLoggingTransformer()],  // BEFORE type removal
    // after: [...],                        // AFTER type removal
    // afterDeclarations: [...],            // For .d.ts files
  }
);

// Method 2: Transform only (without output)
const transformed = ts.transform(sourceFile, [createLoggingTransformer()]);
const printer = ts.createPrinter();
const output = printer.printFile(transformed.transformed[0] as ts.SourceFile);
console.log(output);
transformed.dispose();  // Release resources!
```

> ⚡ **Framework connection:** Angular's build process uses exactly
> this pattern. The `@angular/compiler-cli` registers before-
> transformers that generate template code and dependency injection factories.
> When you run `ng build` in your Angular project,
> several custom transformers run: the template compiler,
> i18n transformer, Ivy renderer factories. That's the reason
> Angular needs its own compiler — `tsc` alone isn't enough.

> 💭 **Think about it:** When should you use a before-transformer (before
> type removal) and when an after-transformer (after type
> removal)?
>
> **Answer:** Before: when you need type information (e.g.
> "Is this variable an Observable?") or when you're generating new code
> that should still be checked by the type checker.
> After: when you only want to manipulate JavaScript output (e.g.
> minification, inserting polyfills). After-transformers no longer
> see any TypeScript syntax.

---

## Experiment: Dead-Code Remover

Build a transformer that removes `if (false) { ... }` blocks:

```typescript
function createDeadCodeRemover(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile) => {
    function visitor(node: ts.Node): ts.Node | undefined {
      if (ts.isIfStatement(node)) {
        // Check whether the condition is "false":
        if (node.expression.kind === ts.SyntaxKind.FalseKeyword) {
          // Is there an else? If so, keep the else block:
          if (node.elseStatement) {
            return ts.visitNode(node.elseStatement, visitor);
          }
          // No else → remove the entire if block:
          return undefined;  // undefined = remove node
        }
        // Check whether the condition is "true":
        if (node.expression.kind === ts.SyntaxKind.TrueKeyword) {
          // Keep only the then block:
          return ts.visitNode(node.thenStatement, visitor);
        }
      }
      return ts.visitEachChild(node, visitor, context);
    }
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };
}

// Experiment: Extend the remover to also recognize `if (0)` and
// `if ("")` as dead code.
// Bonus: Recognize `if (process.env.NODE_ENV === "development")` in a
// production build as dead code.
```

---

## What you've learned

- Custom transformers modify the AST **before output** — code generation at compile time
- The **ts.factory** API creates new immutable AST nodes
- **Before-transformers** have access to types, **after-transformers** only see JavaScript
- Execution via `program.emit()` (build pipeline) or `ts.transform()` (manual)
- Angular, ts-auto-mock, and many libraries use custom transformers

> 🧠 **Explain to yourself:** If transformers can modify the AST,
> why not use transformers instead of Babel plugins
> for code transformations?
> **Key points:** TypeScript transformers are more powerful (have
> type information) | But: smaller ecosystem than Babel |
> No plugin system like Babel | For pure JS transformations
> Babel is better | For TS-specific ones: transformers are ideal

**Core concept to remember:** Transformers are "code that writes code". They operate on the AST, not on strings — that's what makes them reliable. The factory API is verbose but precise.

---

> **Pause point** — You can now not only read the AST
> but also modify it. Next step: Diagnostics and the
> Language Service.
>
> Continue with: [Section 05: Diagnostics and Language Service](./05-diagnostics-und-language-service.md)