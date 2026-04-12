# Section 1: Test Setup — Vitest/Jest with TypeScript

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Typing Tests](./02-typing-von-tests.md)

---

## What you'll learn here

- How Vitest and Jest work together with TypeScript
- The difference between "compiling TypeScript tests" and "running TypeScript tests"
- Why Vitest has native TypeScript support while Jest needs a transformer
- How to configure an optimal test setup for TypeScript projects

---

## The Story: Testing and TypeScript

Testing in JavaScript was long a battle with types. Jest, released by
Facebook (Meta) in 2014, became the standard — but without native
TypeScript support. You needed `ts-jest` or `babel-jest` with a
TypeScript plugin to process `.ts` files.

In 2022, **Vitest** changed the game. Anthony Fu (Vue core team) built
a test runner on top of Vite — with native TypeScript support,
ESM support, and a Jest-compatible API.

> 📖 **Background: Why native TS support matters so much**
>
> Jest compiles only JavaScript by default. For TypeScript it needs
> a "transformer" (ts-jest or @swc/jest) that converts `.ts` files
> to JavaScript before execution. This has two problems:
> (1) Configuration overhead — tsconfig compatibility, path aliases,
> ESM mode. (2) Performance — every file is transformed individually.
>
> Vitest uses Vite's plugin system, which understands TypeScript natively.
> No extra configuration, no transformers. Just write `.ts` files
> and run them. This is the main reason why Vitest became so popular
> in the TypeScript community so quickly.

---

## Vitest: Setup in 5 Minutes

```typescript annotated
// 1. Installation
// npm install -D vitest

// 2. vitest.config.ts (optional — Vitest uses vite.config.ts)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // ^ describe, it, expect available without import (like Jest)
    environment: 'node',
    // ^ 'node' for backend, 'jsdom' for browser APIs, 'happy-dom' for faster DOM
    include: ['src/**/*.{test,spec}.ts'],
    // ^ Which files are tests?
    coverage: {
      provider: 'v8',
      // ^ v8 is faster, istanbul has more features
      reporter: ['text', 'json', 'html'],
    },
  },
});

// 3. TypeScript types for globals (tsconfig.json or vitest.d.ts)
// /// <reference types="vitest/globals" />
// OR in tsconfig.json:
// "types": ["vitest/globals"]
```

### The First Test

```typescript annotated
// src/utils/add.ts
export function add(a: number, b: number): number {
  return a + b;
  // ^ Simple function — but the type matters!
}

// src/utils/add.test.ts
import { describe, it, expect } from 'vitest';
// ^ Explicit import (alternative: globals: true)
import { add } from './add';

describe('add', () => {
  it('should add two numbers', () => {
    const result = add(1, 2);
    // ^ result: number — TypeScript infers from the function
    expect(result).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
    // ^ TypeScript checks: -1 and -2 are number ✓
  });

  // TypeScript prevents faulty tests:
  // add("1", "2");
  // ^ Compile error: Argument of type 'string' is not assignable to 'number'
  // This test simply cannot be written in the first place!
});
```

> 💭 **Think about it:** If TypeScript already checks that `add(1, 2)`
> is correctly typed, do you even need unit tests?
>
> **Answer:** Yes! TypeScript checks TYPES, not LOGIC. `add(a, b)`
> could be implemented as `a * b` and TypeScript would report no error —
> the signature is correct after all. Tests check BEHAVIOR,
> TypeScript checks SHAPE. Together they provide real safety.

> 💭 **Bonus question:** How does the Result pattern from L25 help with testing? If your function returns `Result<T, E>` instead of throwing, you can write `expect(result.ok).toBe(true)` directly — no try/catch needed. That's testability through type design.

---

## Jest: Setup with TypeScript

```typescript annotated
// 1. Installation
// npm install -D jest ts-jest @types/jest

// 2. jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  // ^ ts-jest transformer: compiles .ts → .js before the test
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // ^ Path aliases must be mirrored here!
    // This is one of the pain points with Jest + TypeScript.
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.spec.json',
      // ^ Separate tsconfig for tests (can have different options)
    }],
  },
};

export default config;

// 3. tsconfig.spec.json
// {
//   "extends": "./tsconfig.json",
//   "compilerOptions": {
//     "types": ["jest"]
//   },
//   "include": ["src/**/*.spec.ts"]
// }
```

### Vitest vs Jest: Decision Guide

| Criterion | Vitest | Jest |
|---|---|---|
| TypeScript support | Native (zero-config) | ts-jest / @swc/jest required |
| ESM support | Native | Experimental |
| Performance | Very fast (Vite) | Slower with TS |
| API compatibility | Jest-compatible | Standard |
| Ecosystem | Growing | Huge |
| Angular | Not official | Official (replaces Karma) |
| React (Vite) | Default choice | Alternative |

> ⚡ **Practical tip for Angular:** Since v16, Angular uses Jest instead
> of Karma as its test runner. The setup is configured in `angular.json`
> — you don't need to set up `ts-jest` manually. In Angular projects
> Jest is the standard choice. For standalone TypeScript projects
> or React+Vite, Vitest is often better.

---

## TypeScript-Specific Test Configuration

```typescript annotated
// tsconfig for tests: What's different?

// tsconfig.spec.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals"],
    // ^ Make test globals (describe, it, expect) available

    "strict": true,
    // ^ Strict in tests too — no exceptions!

    "noUnusedLocals": false,
    // ^ Tests often have variables that exist only for assertions

    "noUnusedParameters": false,
    // ^ Mock callbacks often have unused parameters
  },
  "include": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

> 🧠 **Explain to yourself:** Why should `strict: true` apply in
> test files too? Wouldn't it be simpler to disable strict checks in tests?
>
> **Key points:** Tests TEST the code — if tests aren't strict,
> they test with wrong assumptions | An `any` in a test can hide real
> errors | If a test is hard to type, the production API is often
> too complex — the test reveals the problem

---

## Watch Mode and Debugging

```typescript
// Vitest watch mode (default)
// npx vitest          ← starts in watch mode
// npx vitest run      ← run once (for CI)

// Debugging with TypeScript
// launch.json (VS Code):
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--reporter=verbose", "${relativeFile}"],
  "console": "integratedTerminal"
}
```

> 🔬 **Experiment:** Set up a minimal Vitest project and
> observe the TypeScript integration:
>
> ```bash
> mkdir ts-test-demo && cd ts-test-demo
> npm init -y
> npm install -D typescript vitest
> ```
>
> ```typescript
> // src/greet.ts
> export function greet(name: string): string {
>   return `Hello, ${name}!`;
> }
>
> // src/greet.test.ts
> import { expect, test } from 'vitest';
> import { greet } from './greet';
>
> test('greets by name', () => {
>   expect(greet('World')).toBe('Hello, World!');
> });
>
> // Run with: npx vitest run
> // Question: What happens when you write greet(42)?
> // Answer: Compile error in the test — TypeScript protects you!
> ```

---

## What you learned

- Vitest has native TypeScript support — no transformer needed
- Jest needs ts-jest or @swc/jest for TypeScript files
- TypeScript in tests checks TYPES (shape), tests check BEHAVIOR (logic)
- `strict: true` should apply in tests too — no exceptions
- Angular uses Jest, React+Vite uses Vitest as the default

**Core concept to remember:** TypeScript and tests complement each other perfectly. TypeScript ensures your code has the right SHAPE (correct types, correct interfaces). Tests ensure your code has the right BEHAVIOR (correct results, correct side effects). Together they provide real safety.

---

> **Pause point** — You have the setup. In the next section we'll look
> at how the test functions themselves are typed.
>
> Continue with: [Section 02: Typing Tests](./02-typing-von-tests.md)