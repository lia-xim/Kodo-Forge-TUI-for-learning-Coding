# Section 2: Traversing Nodes — forEachChild and Visitors

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - ts.createProgram and the AST](./01-createprogram-und-ast.md)
> Next section: [03 - Type Checker API](./03-type-checker-api.md)

---

## What you'll learn here

- The two traversal methods: **ts.forEachChild** and **ts.visitEachChild**
- How to write a **recursive visitor** that finds specific nodes
- **Visitor pattern** for AST analysis — why it's better than manual recursion
- Practical example: Finding all functions in a file

---

## Walking the tree

An AST is a tree. To analyze it, you need to **walk** (traverse) it.
TypeScript provides two main methods for this:

### Method 1: ts.forEachChild (direct children)

```typescript annotated
import * as ts from "typescript";

// forEachChild visits only the DIRECT children of a node:
function printChildren(node: ts.Node, sourceFile: ts.SourceFile): void {
  ts.forEachChild(node, child => {
    console.log(ts.SyntaxKind[child.kind], child.getText(sourceFile));
    // ^ Prints the type and source text of each child
  });
}

// For a SourceFile, the direct children are the top-level statements:
// SourceFile
//   ├── ImportDeclaration      (direct child)
//   ├── FunctionDeclaration    (direct child)
//   │     ├── Identifier       (child of child — NOT visited!)
//   │     └── Block            (child of child — NOT visited!)
//   └── ClassDeclaration       (direct child)
```

### Method 2: Recursive traversal (deep walk)

```typescript annotated
// To visit ALL nodes, you need recursion:
function walk(node: ts.Node, sourceFile: ts.SourceFile): void {
  // Process this node
  if (ts.isFunctionDeclaration(node) && node.name) {
    console.log(`Function found: ${node.name.getText(sourceFile)}`);
  }

  // Visit all children (recursively)
  ts.forEachChild(node, child => walk(child, sourceFile));
  // ^ Each child is also passed to walk() — this is how you go deeper
}

// Start:
walk(sourceFile, sourceFile);
```

> 📖 **Background: Why forEachChild and not node.children?**
>
> In many AST libraries (e.g. Babel, ESTree), nodes have a
> `children` array. TypeScript's AST does not. Instead, each
> node has specific properties: `FunctionDeclaration.name`,
> `FunctionDeclaration.parameters`, `FunctionDeclaration.body`.
> `ts.forEachChild` knows the structure of every node type and visits
> all relevant children in the correct order. The advantage:
> No generic `children` array that might contain comments and whitespace.
> The disadvantage: You have to use `forEachChild` instead of
> simply iterating over an array.

---

## The Visitor Pattern

For more complex analyses, the visitor pattern is better than
manual recursion:

```typescript annotated
// A visitor that handles specific node types:
interface ASTVisitor {
  visitFunctionDeclaration?(node: ts.FunctionDeclaration): void;
  visitClassDeclaration?(node: ts.ClassDeclaration): void;
  visitCallExpression?(node: ts.CallExpression): void;
  visitIdentifier?(node: ts.Identifier): void;
}

function visitNode(node: ts.Node, visitor: ASTVisitor): void {
  // Dispatch based on node type:
  if (ts.isFunctionDeclaration(node) && visitor.visitFunctionDeclaration) {
    visitor.visitFunctionDeclaration(node);
  }
  if (ts.isClassDeclaration(node) && visitor.visitClassDeclaration) {
    visitor.visitClassDeclaration(node);
  }
  if (ts.isCallExpression(node) && visitor.visitCallExpression) {
    visitor.visitCallExpression(node);
  }
  if (ts.isIdentifier(node) && visitor.visitIdentifier) {
    visitor.visitIdentifier(node);
  }

  // Recursively visit all children:
  ts.forEachChild(node, child => visitNode(child, visitor));
}
```

### Using the visitor

```typescript annotated
const functionNames: string[] = [];
const classNames: string[] = [];

visitNode(sourceFile, {
  visitFunctionDeclaration(node) {
    if (node.name) functionNames.push(node.name.text);
    // ^ node.name.text is the name as a string
  },
  visitClassDeclaration(node) {
    if (node.name) classNames.push(node.name.text);
  },
});

console.log("Functions:", functionNames);
console.log("Classes:", classNames);
```

> 🧠 **Explain to yourself:** Why is the visitor pattern better
> than a large `switch` statement over `node.kind`? What happens
> when you want to handle a new node type?
> **Key points:** Separation of concerns — each visitor handles
> one specific concern | Easy to extend (new property in the
> interface) | Multiple visitors can traverse the same tree |
> switch becomes unmanageable with 300+ SyntaxKinds

---

## Practical example: Finding all exports

```typescript annotated
import * as ts from "typescript";

interface ExportInfo {
  name: string;
  kind: string;
  isDefault: boolean;
}

function findExports(sourceFile: ts.SourceFile): ExportInfo[] {
  const exports: ExportInfo[] = [];

  ts.forEachChild(sourceFile, node => {
    // Check whether the node has an export modifier:
    const modifiers = ts.getModifiers(node);
    const isExported = modifiers?.some(
      m => m.kind === ts.SyntaxKind.ExportKeyword
    );
    const isDefault = modifiers?.some(
      m => m.kind === ts.SyntaxKind.DefaultKeyword
    );

    if (!isExported) return;

    if (ts.isFunctionDeclaration(node) && node.name) {
      exports.push({ name: node.name.text, kind: "function", isDefault: !!isDefault });
    }
    if (ts.isClassDeclaration(node) && node.name) {
      exports.push({ name: node.name.text, kind: "class", isDefault: !!isDefault });
    }
    if (ts.isInterfaceDeclaration(node)) {
      exports.push({ name: node.name.text, kind: "interface", isDefault: false });
    }
    if (ts.isTypeAliasDeclaration(node)) {
      exports.push({ name: node.name.text, kind: "type", isDefault: false });
    }
  });

  return exports;
}
```

> ⚡ **Framework connection:** Angular's `@angular/compiler-cli` traverses
> the AST to find `@Component`, `@Injectable`, and other decorators.
> The Angular compiler is essentially a visitor that reacts to
> specific node types: Decorator → read metadata →
> generate factory code. ESLint rules like `@typescript-eslint/
> no-floating-promises` traverse the AST to find unhandled promises —
> using exactly this visitor pattern.

> 💭 **Think about it:** When you traverse the AST of a large file (10,000 lines),
> the visitor visits every single node. How could you
> optimize the traversal if you're only looking for certain
> node types?
>
> **Answer:** You could exit early: if you're only looking for top-level
> declarations, you don't need to descend into function bodies.
> `ts.forEachChild` allows this — you simply don't call `walk()`
> recursively for nodes you're not interested in.
> ESLint uses "selectors" that only visit specific node types.

---

## ts.visitEachChild: For transformations

For **read-only** analysis, `forEachChild` is sufficient. For **transformations**
(modifying the AST), there is `ts.visitEachChild`:

```typescript annotated
import * as ts from "typescript";

// Transformer: Replace all string literals with UPPERCASE
function uppercaseStrings(context: ts.TransformationContext) {
  return (sourceFile: ts.SourceFile): ts.SourceFile => {
    function visitor(node: ts.Node): ts.Node {
      if (ts.isStringLiteral(node)) {
        // Replace the string with its uppercase version:
        return ts.factory.createStringLiteral(node.text.toUpperCase());
      }
      // For all other nodes: visit the children
      return ts.visitEachChild(node, visitor, context);
      // ^ visitEachChild returns a NEW node (immutable!)
    }
    return ts.visitEachChild(sourceFile, visitor, context);
  };
}
```

---

## Experiment: Find all TODO comments

Write a visitor that finds all TODO comments in a file:

```typescript
import * as ts from "typescript";

function findTodos(sourceFile: ts.SourceFile): { line: number; text: string }[] {
  const todos: { line: number; text: string }[] = [];

  // Comments are NOT in the AST — they are "trivia" (attached to nodes)
  function scanTrivia(node: ts.Node): void {
    const leadingComments = ts.getLeadingCommentRanges(
      sourceFile.getFullText(),
      node.getFullStart()
    );

    if (leadingComments) {
      for (const comment of leadingComments) {
        const text = sourceFile.getFullText().slice(comment.pos, comment.end);
        if (text.includes("TODO")) {
          const line = sourceFile.getLineAndCharacterOfPosition(comment.pos).line + 1;
          todos.push({ line, text: text.trim() });
        }
      }
    }

    ts.forEachChild(node, scanTrivia);
  }

  scanTrivia(sourceFile);
  return todos;
}

// Experiment: Extend the finder to also recognize FIXME and HACK.
// Bonus: Print which function/class the comment is located in.
```

---

## What you've learned

- **ts.forEachChild** visits direct children — recursion is needed for analysis
- The **visitor pattern** separates traversal from analysis — cleaner and more extensible
- **ts.visitEachChild** is for transformations — it returns new (immutable) nodes
- Comments are **trivia** — not in the AST, but accessible via `getLeadingCommentRanges`
- Angular, ESLint, and VS Code all use this traversal pattern

> 🧠 **Explain to yourself:** What is the difference between
> `ts.forEachChild` (for analysis) and `ts.visitEachChild` (for
> transformation)? Why are there two separate methods?
> **Key points:** forEachChild returns void — read only |
> visitEachChild returns a new node — for modifications |
> Immutability: The AST is never modified directly, always copied

**Core concept to remember:** AST traversal = recursion over the tree. For analysis: `forEachChild` + your own recursion. For transformation: `visitEachChild` + `ts.factory`. The visitor decides, the traverser navigates.

---

> **Pause point** — You can now traverse the AST and find nodes.
> Next step: The Type Checker API for type information.
>
> Continue with: [Section 03: Type Checker API](./03-type-checker-api.md)