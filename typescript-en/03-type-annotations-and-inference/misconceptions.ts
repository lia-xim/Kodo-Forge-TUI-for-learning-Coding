/**
 * Lesson 03 — Misconception Exercises: Type Annotations & Inference
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
  // ─── 1: const object has literal properties ─────────────────────────────
  {
    id: "03-const-object-literal",
    title: "const Object Infers Literal Types for Properties",
    code: `const settings = {
  mode: "dark",
  fontSize: 14,
  language: "de",
};

// What type does settings.mode have?
// Answer: "dark"? Or string?`,
    commonBelief:
      '`const settings` means that `settings.mode` has the type `"dark"` — ' +
      "because const variables retain their literal type.",
    reality:
      "`settings.mode` has the type `string`, NOT `\"dark\"`. " +
      "With primitive const variables (`const x = 'dark'`) the literal type is preserved. " +
      "But with objects, properties are widened because you " +
      "could write `settings.mode = 'light'` — the object " +
      "is const, its properties are not. " +
      "Solution: `as const` on the entire object.",
    concept: "Property Widening / const vs. as const",
    difficulty: 2,
  },

  // ─── 2: Object.keys returns (keyof T)[] ──────────────────────────
  {
    id: "03-object-keys-keyof",
    title: "Object.keys() Returns Typed Keys",
    code: `interface User {
  name: string;
  age: number;
  email: string;
}

const user: User = { name: "Max", age: 30, email: "max@test.de" };

// "Type-safe iteration over all keys:"
const keys = Object.keys(user);
// keys is ("name" | "age" | "email")[]  ... or?

keys.forEach(key => {
  console.log(user[key]); // Error!
});`,
    commonBelief:
      "`Object.keys(user)` returns `(keyof User)[]`, so " +
      "`('name' | 'age' | 'email')[]`. This allows type-safe " +
      "access to the properties.",
    reality:
      "`Object.keys()` ALWAYS returns `string[]` — not `(keyof T)[]`. " +
      "TypeScript is intentionally conservative: an object could have " +
      "more keys at runtime than the type describes (e.g., through " +
      "inheritance or dynamic assignment). `('name' | 'age' | 'email')[]` " +
      "would be technically unsound. Accessing `user[key]` with `key: string` " +
      "generates a compiler error.",
    concept: "Object.keys() / Structural Typing / Soundness",
    difficulty: 3,
  },

  // ─── 3: Redundant Annotations ─────────────────────────────────────────
  {
    id: "03-redundant-annotations",
    title: "More Annotations = Better Code",
    code: `const name: string = "Max";
const age: number = 30;
const isActive: boolean = true;
const items: string[] = ["a", "b", "c"];

function getLength(text: string): number {
  const len: number = text.length;
  return len;
}`,
    commonBelief:
      "The more type annotations, the safer the code. You should " +
      "explicitly annotate EVERY variable.",
    reality:
      "Most annotations here are redundant and only make the " +
      "code harder to read. TypeScript correctly infers all these types: " +
      "`'Max'` → string, `30` → number, `text.length` → number. " +
      "Redundant annotations can even be HARMFUL: " +
      "`const name: string` loses the literal type `\"Max\"`. " +
      "Only annotate where inference fails or clarity is needed.",
    concept: "Inference / When to Annotate?",
    difficulty: 2,
  },

  // ─── 4: Contextual Typing is Lost ────────────────────────────────
  {
    id: "03-contextual-typing-lost",
    title: "Contextual Typing Works Everywhere",
    code: `// Define handler separately:
const clickHandler = (event) => {
  console.log(event.clientX, event.clientY);
};

// Use later:
document.addEventListener("click", clickHandler);`,
    commonBelief:
      "TypeScript knows that `clickHandler` will be passed to `addEventListener`, " +
      "so `event` automatically has the type " +
      "`MouseEvent` — even when the handler is defined beforehand.",
    reality:
      "`event` has the type `any`! Contextual typing only works " +
      "when the callback is passed DIRECTLY as an argument. " +
      "With a separately defined function, TypeScript has no context " +
      "at the point of definition. The connection to `addEventListener` " +
      "happens later — too late for inference. " +
      "Solution: inline callback or explicit annotation " +
      "`(event: MouseEvent) =>`.",
    concept: "Contextual Typing / Inference Limits",
    difficulty: 3,
  },

  // ─── 5: as const on Individual Properties ────────────────────────────────
  {
    id: "03-as-const-partial",
    title: "as const Only Makes Values Readonly",
    code: `const config = {
  apiUrl: "https://api.example.com",
  retries: 3,
  method: "GET" as const,
} as const;

// "as const" makes the object immutable:
config.retries = 5;       // Error! (expected)
config.apiUrl = "other";  // Error! (expected)

// But what is the type of config?`,
    commonBelief:
      "`as const` only makes the values readonly — the types " +
      "remain `string` and `number`.",
    reality:
      "`as const` does THREE things: (1) All properties become `readonly`, " +
      "(2) all values retain their literal types (" +
      '`"https://api.example.com"`, `3`, `"GET"`), and ' +
      "(3) arrays become readonly tuples. " +
      "The type of `config` is " +
      "`{ readonly apiUrl: \"https://api.example.com\"; readonly retries: 3; readonly method: \"GET\" }` — " +
      "extremely precise. This is more powerful than just readonly.",
    concept: "as const / Literal Types / readonly",
    difficulty: 3,
  },

  // ─── 6: satisfies Replaces Annotation ────────────────────────────────────
  {
    id: "03-satisfies-replaces-annotation",
    title: "satisfies and Annotation Are Interchangeable",
    code: `type Theme = Record<string, string | number[]>;

// With annotation:
const themeA: Theme = {
  primary: "#007bff",
  spacing: [4, 8, 16],
};

// With satisfies:
const themeB = {
  primary: "#007bff",
  spacing: [4, 8, 16],
} satisfies Theme;

// Same?
themeA.primary.toUpperCase();  // ???
themeB.primary.toUpperCase();  // ???`,
    commonBelief:
      "`satisfies` and `: Type` do the same thing — both validate " +
      "against the type. It is just a different syntax.",
    reality:
      "With `themeA.primary` (annotation) the type is `string | number[]` — " +
      "the full union from `Theme`. `.toUpperCase()` generates an error " +
      "because `number[]` has no `.toUpperCase()` method. " +
      "With `themeB.primary` (satisfies) the type is `string` — the " +
      "specific inferred type. `.toUpperCase()` works! " +
      "`satisfies` validates against the type but retains precise " +
      "inference. That is the key difference.",
    concept: "satisfies vs. Annotation / Precise Inference",
    difficulty: 4,
  },

  // ─── 7: Always Infer Return Type ─────────────────────────────────
  {
    id: "03-always-infer-return",
    title: "Inference for Return Types Is Always Sufficient",
    code: `// Version 1: Returns string | null
export function findUser(id: number) {
  const users = [{ id: 1, name: "Max" }, { id: 2, name: "Anna" }];
  const user = users.find(u => u.id === id);
  return user ? user.name : null;
}

// Changed later: (forgot that the type changes!)
export function findUserV2(id: number) {
  const users = [{ id: 1, name: "Max" }, { id: 2, name: "Anna" }];
  const user = users.find(u => u.id === id);
  if (!user) return;  // undefined instead of null!
  return user.name;
}`,
    commonBelief:
      "You should NEVER annotate return types — TypeScript always infers " +
      "the correct type, and that is good enough.",
    reality:
      "In `findUserV2` the return type silently changed from " +
      "`string | null` to `string | undefined` — because " +
      "`return;` (without a value) returns `undefined`, not `null`. " +
      "All callers checking `=== null` now have a bug. " +
      "For exported functions, an explicit return type " +
      "(`): string | null`) is best practice: it makes the intent clear " +
      "and prevents accidental type changes.",
    concept: "Return Type Annotation / API Stability",
    difficulty: 3,
  },

  // ─── 8: Empty Array Becomes never[] ──────────────────────────────────────
  {
    id: "03-empty-array-type",
    title: "Empty Arrays Become never[]",
    code: `function collectItems() {
  const items = [];

  items.push("hello");
  items.push(42);
  items.push(true);

  return items;
}

const result = collectItems();
// What is the type of result?`,
    commonBelief:
      "An empty array `const items = []` gets the type `never[]`, " +
      "and TypeScript reports an error when you add something.",
    reality:
      "Inside a function, TypeScript uses 'Evolving Arrays': " +
      "the empty array starts as `any[]` and the type 'grows' with " +
      "each `.push()`. In the end `result` has the type `(string | number | boolean)[]`. " +
      "This works, but is unsafe — the `any[]` starting type bypasses " +
      "type checking. Better: `const items: string[] = []` with " +
      "explicit annotation.",
    concept: "Empty Arrays / Evolving Types / any[]",
    difficulty: 4,
  },
];