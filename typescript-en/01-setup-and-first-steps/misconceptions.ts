/**
 * Lesson 01 — Misconception Exercises: Setup & First Steps
 *
 * Code that looks "obviously correct" but is subtly wrong.
 * The learner must find the bug.
 */

export interface Misconception {
  id: string;
  title: string;
  /** The "obviously correct" code */
  code: string;
  /** What most people think */
  commonBelief: string;
  /** What actually happens */
  reality: string;
  /** Which concept is being tested */
  concept: string;
  /** Difficulty 1-5 */
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: as string converts ───────────────────────────────────────────────
  {
    id: "01-as-converts",
    title: "Type Assertion as Conversion",
    code: `function getAge(input: unknown): string {
  // "Convert" the value to a string:
  const result = input as string;
  return result.toUpperCase();
}

// Call:
getAge(42);`,
    commonBelief:
      "`as string` converts the value to a string, so " +
      "`result` is guaranteed to be a string after the cast.",
    reality:
      "`as string` is a Type Assertion that only exists at compile time. " +
      "It is completely removed during Type Erasure and does NOT change the value. " +
      "At runtime, `result` is still `42` (a number), and " +
      "`.toUpperCase()` crashes with a TypeError.",
    concept: "Type Erasure / Type Assertions vs. Conversion",
    difficulty: 2,
  },

  // ─── 2: instanceof with Interface ────────────────────────────────────────
  {
    id: "01-instanceof-interface",
    title: "Checking Interface with instanceof",
    code: `interface User {
  name: string;
  email: string;
}

function isUser(obj: unknown): boolean {
  return obj instanceof User;
}

const data = { name: "Max", email: "max@example.com" };
console.log(isUser(data));`,
    commonBelief:
      "You can use `instanceof` to check whether an object implements a specific " +
      "interface, just like in Java or C#.",
    reality:
      "This code doesn't even compile! TypeScript reports: " +
      "'User' only refers to a type, but is being used as a value here. " +
      "Interfaces don't exist at runtime (Type Erasure). " +
      "`instanceof` only works with classes, because these also " +
      "exist at runtime as JavaScript constructor functions.",
    concept: "Type Erasure / Interfaces vs. Classes",
    difficulty: 2,
  },

  // ─── 3: Type error prevents execution ────────────────────────────────────
  {
    id: "01-errors-prevent-execution",
    title: "Type Error Stops Compilation",
    code: `// team-lead says: "As long as TypeScript shows errors,
// the code cannot execute."

function add(a: number, b: number): number {
  return a + b;
}

// Erroneous call:
add("hello", "world");

// "The code will never run because tsc reports the error."`,
    commonBelief:
      "If TypeScript reports a type error, no JavaScript is generated " +
      "and the code cannot be executed.",
    reality:
      "By default, `tsc` generates JavaScript EVEN with type errors! " +
      "Type Checking and Emit are conceptually independent. " +
      "The generated code would be `add('hello', 'world')`, which returns " +
      "'helloworld' at runtime (string concatenation). " +
      "Only with `noEmitOnError: true` in the tsconfig is output " +
      "suppressed on errors.",
    concept: "Compiler Pipeline / Type Checking vs. Emit",
    difficulty: 3,
  },

  // ─── 4: tsc compiles everything ──────────────────────────────────────────
  {
    id: "01-tsc-compiles-everything",
    title: "tsc handles all Compilation",
    code: `// In your Next.js project:
// "Our build uses tsc for compilation."

// package.json:
// "build": "tsc && next build"

// tsconfig.json:
// { "compilerOptions": { "target": "ES5" } }`,
    commonBelief:
      "In a Next.js project, `tsc` handles the entire " +
      "compilation of TypeScript code to JavaScript.",
    reality:
      "Next.js uses SWC (a Rust-based compiler) for the " +
      "actual compilation. SWC only removes TypeScript syntax — " +
      "it performs NO Type Checking. `tsc` runs separately " +
      "(often with `--noEmit`) ONLY for type checking. " +
      "The same principle applies to esbuild, tsx, and Vite.",
    concept: "Tooling / Build Pipeline",
    difficulty: 3,
  },

  // ─── 5: target determines APIs ───────────────────────────────────────────
  {
    id: "01-target-polyfills",
    title: "target adds Polyfills",
    code: `// tsconfig.json:
// { "compilerOptions": { "target": "ES5" } }

const numbers = [1, [2, 3], [4, [5]]];
const flat = numbers.flat(2);
console.log(flat); // [1, 2, 3, 4, 5]

// "target: ES5 ensures that .flat() works even in
// older browsers."`,
    commonBelief:
      "The `target` in tsconfig.json ensures that modern APIs " +
      "like `Array.flat()` work in older environments, " +
      "because TypeScript inserts polyfills.",
    reality:
      "TypeScript only transforms SYNTAX (e.g. `const` → `var`, " +
      "`=>` → `function`), but NOT APIs. `Array.flat()` (ES2019) " +
      "doesn't exist in ES5, and TypeScript adds no polyfill. " +
      "With `target: ES5`, the compiler even reports an error " +
      "because `flat()` doesn't exist in the ES5 type declarations. " +
      "Polyfills are NOT TypeScript's job.",
    concept: "tsconfig / target vs. lib / Syntax vs. APIs",
    difficulty: 4,
  },

  // ─── 6: .d.ts are compiled .ts ───────────────────────────────────────────
  {
    id: "01-dts-compiled",
    title: "Declaration Files are Compiled Code",
    code: `// A colleague says:
// "The .d.ts files in node_modules/@types/react
// are the compiled versions of React's TypeScript code."

// node_modules/@types/react/index.d.ts:
// declare function createElement(...): ReactElement;`,
    commonBelief:
      ".d.ts files (Declaration Files) are the compiled " +
      "versions of TypeScript source code, similar to .js files.",
    reality:
      ".d.ts files contain ONLY type information — no " +
      "executable code. They are the type description for " +
      "JavaScript libraries. React itself is written in JS; " +
      "@types/react merely provides the types retroactively so that " +
      "TypeScript users get autocomplete and type checking. " +
      "You can also generate .d.ts yourself with `declaration: true`.",
    concept: "Compiler Output / Declaration Files",
    difficulty: 2,
  },

  // ─── 7: TypeScript Runtime Protection ────────────────────────────────────
  {
    id: "01-runtime-safety",
    title: "TypeScript protects at Runtime",
    code: `interface ApiResponse {
  data: { userId: number; name: string };
  status: number;
}

async function fetchUser(): Promise<ApiResponse> {
  const res = await fetch("/api/user");
  const json: ApiResponse = await res.json();
  // "TypeScript guarantees that json has the correct structure"
  console.log(json.data.name.toUpperCase());
  return json;
}`,
    commonBelief:
      "Since `json` is typed as `ApiResponse`, TypeScript guarantees " +
      "that the data has the correct structure. If the API " +
      "returns wrong data, TypeScript will catch it.",
    reality:
      "TypeScript checks ONLY at compile time. `res.json()` returns " +
      "`any` at runtime (or whatever the API delivers). " +
      "If the API has a different format, the code crashes. " +
      "The type annotation `ApiResponse` is only an assertion — " +
      "not a validation. For real runtime safety, you need " +
      "validation libraries like Zod, io-ts, or Valibot.",
    concept: "Type Erasure / Compile Time vs. Runtime",
    difficulty: 3,
  },

  // ─── 8: Source Maps in Production ────────────────────────────────────────
  {
    id: "01-sourcemaps-production",
    title: "Source Maps are always included",
    code: `// tsconfig.json:
// { "compilerOptions": { "sourceMap": true } }

// "Source Maps are automatically active, so
// users in the browser always see the TypeScript source code
// in the DevTools."`,
    commonBelief:
      "With `sourceMap: true`, end users automatically see the " +
      "TypeScript source code in the browser DevTools.",
    reality:
      "Source Maps are generated as separate .js.map files. " +
      "In production, you should NOT ship them (or only make " +
      "them available internally), because they expose the source code. " +
      "Many deployment pipelines remove Source Maps or only upload " +
      "them to error-tracking tools like Sentry. " +
      "Without the .map file, the user only sees minified JS.",
    concept: "Compiler Output / Source Maps",
    difficulty: 2,
  },
];