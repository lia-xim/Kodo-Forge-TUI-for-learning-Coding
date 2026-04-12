# Section 1: How the Compiler Works

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Type Instantiation and Depth Limits](./02-type-instantiation-und-depth-limits.md)

---

## What you'll learn here

- Which **phases** the TypeScript compiler goes through (Scanner, Parser, Binder, Checker, Emitter)
- How the **Abstract Syntax Tree (AST)** is created and why it's central
- Why the **Type Checker** is by far the most expensive phase
- How you can use this knowledge to **pinpoint performance issues**

---

## Background: Why understand the compiler?

> **Origin Story: tsc — From a one-man project to an industrial compiler**
>
> When Anders Hejlsberg introduced TypeScript in 2012, `tsc` was a relatively
> simple transpiler. Today the TypeScript compiler is one of the most
> complex open-source projects in existence: over 100,000 lines of
> hand-optimized TypeScript (yes, the compiler is written in TypeScript).
> Type-checking alone accounts for over 60% of the total compile time.
>
> Why does this matter to you? Because in large projects — Angular
> monorepos with 500+ files, React apps with complex generic types —
> compile time can grow from seconds to minutes. And if you
> understand WHERE the time is spent, you can optimize with precision.

Most developers treat `tsc` as a black box: code in, JavaScript
out. But once compile time in a project exceeds 30 seconds,
the compiler becomes a bottleneck — in CI, in watch mode, and with every IDE
action. That's when it's worth opening the black box.

---

## The 5 phases of the compiler

The TypeScript compiler goes through five phases in a fixed order.
Each phase takes the output of the previous one as its input:

```
  Source code (.ts)
       │
       ▼
  ┌─────────────┐
  │  1. Scanner  │  Source text → Token stream
  │  (Lexer)     │  "const x: number = 42"  →  [const, x, :, number, =, 42]
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  2. Parser   │  Token stream → AST (Abstract Syntax Tree)
  │              │  Tree structure of the program
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  3. Binder   │  AST → Symbol table
  │              │  Connects identifiers to declarations
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  4. Checker  │  AST + Symbol table → Type information + errors
  │  (60-80%!)   │  <<<< THIS is the expensive part
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  5. Emitter  │  AST → JavaScript + .d.ts + Source Maps
  │              │
  └─────────────┘
```

> 🧠 **Explain it to yourself:** Why is the Checker the most expensive phase? What does it do that the other phases don't?
> **Key points:** Checker must compute ALL types | Instantiate generics | Check assignability | Resolve conditional types | Overload resolution | Every expression has a type

---

## Phases 1-2: Scanner and Parser

The **Scanner** (also called Lexer) breaks the source text into tokens. This is
lightning-fast — essentially a character-by-character pass:

```typescript annotated
const greeting: string = "Hello";
// Token 1: const       (Keyword)
// Token 2: greeting    (Identifier)
// ^ The scanner recognizes keywords, identifiers, operators, literals
// Token 3: :           (ColonToken)
// Token 4: string      (Keyword)
// Token 5: =           (EqualsToken)
// Token 6: "Hello"     (StringLiteral)
// Token 7: ;           (SemicolonToken)
```

The **Parser** builds an **Abstract Syntax Tree (AST)** from the tokens.
The AST represents the hierarchical structure of your program:

```typescript annotated
// For: const greeting: string = "Hello";
// This AST node is created:
//
// VariableStatement
//   └── VariableDeclarationList (const)
//         └── VariableDeclaration
//               ├── Identifier: "greeting"
//               ├── TypeAnnotation: StringKeyword
//               └── Initializer: StringLiteral "Hello"
//
// ^ Each node has: kind, pos, end, parent, children
// ^ The AST is the central data structure for ALL subsequent phases
```

> 💭 **Think about it:** If the parser finds a syntax error (e.g. `const = 42;`),
> can the compiler continue? Or does it abort immediately?
>
> **Answer:** TypeScript's parser is **error-tolerant** — it produces a (partial) AST
> even in the presence of syntax errors. This is essential for IDE support:
> while you're typing, your code is constantly "broken", but the IDE should
> still show autocomplete and errors.

---

## Phase 3: The Binder

The Binder traverses the AST and creates a **symbol table**. It
connects every identifier (variable, function, class) to its
declaration:

```typescript annotated
function greet(name: string): string {
  // Binder creates symbol "greet" → FunctionDeclaration
  // Binder creates symbol "name" → Parameter
  const msg = `Hello ${name}`;
  // ^ Binder creates symbol "msg" → VariableDeclaration
  return msg;
  // ^ Binder connects "msg" here to the declaration above
}

greet("World");
// ^ Binder connects "greet" here to the FunctionDeclaration above
// This is called "Name Resolution"
```

The Binder also handles **scoping** — it knows that a variable
in a block is only visible within that block. And it recognizes
**Control Flow**: which paths the code can take.

---

## Phase 4: The Type Checker — the heart of the compiler

The Checker is by far the most complex and expensive phase. The file
`checker.ts` in the TypeScript source code has over **50,000 lines** — it is
the largest single file in the entire project.

What does the Checker do?

1. **Type computation:** Determine the type for every expression
2. **Assignability checking:** Is `T` assignable to `U`?
3. **Generic instantiation:** Derive `Array<string>` from `Array<T>`
4. **Overload resolution:** Which signature is the best match?
5. **Control-flow narrowing:** After `if (typeof x === "string")`, `x` is a `string`

```typescript annotated
function processData<T extends { id: string }>(items: T[]): Map<string, T> {
  // Checker verifies: Does T have an id property of type string? (Constraint)
  const map = new Map<string, T>();
  // ^ Checker instantiates Map<string, T> — a new type is created
  for (const item of items) {
    // ^ Checker infers: item is T (from items: T[])
    map.set(item.id, item);
    // ^ Checker verifies: item.id exists (because T extends { id: string })
    // ^ Checker verifies: map.set(string, T) matches the Map signature
  }
  return map;
  // ^ Checker verifies: Map<string, T> is assignable to Map<string, T>
}
```

> ⚡ **Framework connection (Angular):** In your Angular project, a lot happens
> in the Checker during compilation. Angular's template compiler (`ngc`)
> generates TypeScript code from templates, which is then checked by the Checker.
> If you use `strictTemplates: true` (recommended!), the Checker validates every
> property binding and event handler in your templates — this is powerful,
> but also expensive. An Angular monorepo with 200 components can cause 30+
> seconds of compile time from template checking alone.

---

## Phase 5: The Emitter

The Emitter is the "simplest" phase — it traverses the AST and
produces three types of output:

1. **JavaScript files** (.js) — the actual output
2. **Declaration files** (.d.ts) — type information for consumers
3. **Source maps** (.js.map) — for debugging

The Emitter **removes all type annotations** (type erasure) and
transforms TypeScript-specific syntax into JavaScript:

```typescript annotated
// Input: TypeScript
const add = (a: number, b: number): number => a + b;
// ^ Type annotations are TypeScript-specific

// Output: JavaScript (generated by the Emitter)
// const add = (a, b) => a + b;
// ^ All type annotations are gone — only pure JavaScript remains

// Output: Declaration (.d.ts, generated by the Emitter)
// declare const add: (a: number, b: number) => number;
// ^ Type information is preserved here — for library consumers
```

> 🧪 **Experiment:** Open a terminal and run the following:
>
> ```bash
> echo 'const x: number = 42; type Foo = { a: string };' > /tmp/test.ts
> npx tsc /tmp/test.ts --declaration --outDir /tmp/out
> cat /tmp/out/test.js    # Only: const x = 42;
> cat /tmp/out/test.d.ts  # declare const x: number; type Foo = { a: string };
> ```
>
> Observe: in the .js the type is gone, in the .d.ts it is preserved. The Emitter
> generates two different views of the same code.

---

## Why does this matter for performance?

Now you understand where the time goes:

| Phase | Share of compile time | Optimizable? |
|-------|:---------------------:|:------------:|
| Scanner | ~2% | Barely (already optimal) |
| Parser | ~5% | Barely (already optimal) |
| Binder | ~5% | Barely |
| **Checker** | **60-80%** | **YES — this is where the gold is** |
| Emitter | ~10% | Somewhat (skipLibCheck, isolatedModules) |

The consequence: **if you want to halve compile time, you need to
target the Checker.** And the Checker slows down due to:

- Deeply nested generics (every instantiation has a cost)
- Complex conditional types (every branch is evaluated)
- Large union types (assignability checks are O(n*m))
- Unnecessary re-checks (missing project references)

In the next sections you'll learn how to identify and solve exactly these problems.

> 🧠 **Explain it to yourself:** If the Checker consumes 70% of the time and you make it 30% faster, how much faster does the overall compilation become? (Hint: Amdahl's Law)
> **Key points:** 0.3 + 0.7 * 0.7 = 0.79 | So ~21% faster | The other phases limit the gain | Still the biggest lever

---

## What you've learned

- The TypeScript compiler has **5 phases**: Scanner, Parser, Binder, Checker, Emitter
- The **AST** (Abstract Syntax Tree) is the central data structure between phases
- The **Checker** consumes 60-80% of compile time — this is where optimization potential lies
- The parser is **error-tolerant** — essential for IDE support
- The Emitter produces **.js**, **.d.ts** and **.js.map** — three views of the same code

**Core concept to remember:** The TypeScript compiler is not a monolithic step, but a pipeline of 5 phases. Performance problems almost always lie in the Checker — not in parsing or emitting. Understanding the Checker enables targeted optimization.

---

> **Pause point** — Good moment for a break. You now have a mental
> model of how tsc works internally.
>
> Continue with: [Section 02: Type Instantiation and Depth Limits](./02-type-instantiation-und-depth-limits.md)