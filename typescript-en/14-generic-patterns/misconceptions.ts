/**
 * Lesson 14 — Misconception Exercises: Generic Patterns
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  {
    id: "14-builder-this-mutation",
    title: "Builder can mutate this and track the type",
    code: `class Builder<T = {}> {
  set<K extends string, V>(key: K, value: V): Builder<T & Record<K, V>> {
    (this as any)[key] = value;
    return this as any; // Does this work?
  }
}`,
    commonBelief: "You can return `this` and still extend the type.",
    reality:
      "TypeScript cannot change the type of `this` after the fact. " +
      "The builder must return a NEW instance (immutable builder) " +
      "for the extended type `T & Record<K, V>` to be correct. " +
      "With `return this` the type stays Builder<T> — without the new field.",
    concept: "Immutable Builder / Type Growth",
    difficulty: 4,
  },

  {
    id: "14-pipe-single-generic",
    title: "pipe() works with a single type parameter",
    code: `// Why doesn't this work?
function pipe<T>(value: T, ...fns: ((v: T) => T)[]): T {
  return fns.reduce((v, fn) => fn(v), value);
}
// pipe("hello", s => s.length); // Error! number !== string`,
    commonBelief: "A single type parameter T is enough for pipe().",
    reality:
      "pipe() changes the type at each step: string -> number -> boolean. " +
      "A single type parameter T forces ALL steps to have the same type. " +
      "For real pipe() you need overloads with separate " +
      "type parameters per step (A -> B -> C -> D).",
    concept: "pipe() / Multi-Step Type Transitions",
    difficulty: 3,
  },

  {
    id: "14-conditional-type-narrowing",
    title: "Conditional Types are narrowed by if/else",
    code: `type Result<T> = T extends string ? string : number;

function process<T extends string | number>(v: T): Result<T> {
  if (typeof v === "string") {
    return v.toUpperCase(); // Error!
  }
  return v * 2; // Error!
}`,
    commonBelief: "TypeScript narrows Conditional Types through Control Flow Analysis.",
    reality:
      "TypeScript CANNOT narrow Conditional Types through if/else. " +
      "Even when `typeof v === 'string'` is true, the compiler doesn't know " +
      "that Result<T> is now 'string'. You need a cast: " +
      "`return v.toUpperCase() as Result<T>`. This is a known " +
      "limitation of the type system.",
    concept: "Conditional Types / Control Flow Limitation",
    difficulty: 4,
  },

  {
    id: "14-generic-collections-any-array",
    title: "any[] is just as good as Stack<T>",
    code: `const stack: any[] = [];
stack.push(42);
stack.push("oops"); // No error!
const value = stack.pop(); // Type: any`,
    commonBelief: "any[] works exactly like Stack<T> — you just have to be careful.",
    reality:
      "any[] loses ALL type information. You get no compile errors " +
      "for wrong types, no autocomplete, and bugs only become visible " +
      "at runtime. Stack<T> guarantees: what goes in (push) has " +
      "the same type as what comes out (pop). That's the difference between " +
      "'being careful' and 'the compiler is careful for you'.",
    concept: "Type Safety vs any",
    difficulty: 1,
  },

  {
    id: "14-const-type-param-readonly",
    title: "const T makes the value readonly",
    code: `function f<const T>(x: T): T { return x; }
const result = f([1, 2, 3]);
// result is readonly [1, 2, 3] — but the VARIABLE result is not const!`,
    commonBelief: "const type parameter makes the value immutable.",
    reality:
      "const T only affects TYPE INFERENCE, not runtime behavior. " +
      "It forces TypeScript to infer the most precise literal type " +
      "(readonly [1, 2, 3] instead of number[]). But the variable `result` can " +
      "still be assigned to a new variable — readonly only affects " +
      "array mutation, not the variable.",
    concept: "const Type Parameters / Inference vs Immutability",
    difficulty: 3,
  },

  {
    id: "14-recursive-type-infinite",
    title: "Recursive types cause infinite recursion",
    code: `interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}
// Doesn't TypeScript stop here?`,
    commonBelief: "Recursive types lead to infinite recursion and errors.",
    reality:
      "TypeScript explicitly supports recursive types. Interfaces and type " +
      "aliases are evaluated 'lazily' — the compiler only resolves the reference " +
      "when it's needed. For concrete values, the recursion is always finite " +
      "(leaves have children: []). " +
      "Only certain conditional types have recursion limits.",
    concept: "Recursive Types / Lazy Evaluation",
    difficulty: 2,
  },

  {
    id: "14-phantom-type-runtime",
    title: "Token<T> has T as runtime information",
    code: `class Token<T> {
  constructor(public name: string) {}
}
const DB = new Token<DatabaseService>("db");
console.log(DB); // Token { name: "db" } — where is DatabaseService?`,
    commonBelief: "Token<DatabaseService> stores the type DatabaseService at runtime.",
    reality:
      "TypeScript has type erasure: all type information is removed at " +
      "compilation. Token<DatabaseService> and Token<LoggerService> " +
      "are IDENTICAL at runtime — both are just { name: string }. " +
      "The type parameter T exists ONLY at compile time for " +
      "type inference with resolve<T>().",
    concept: "Phantom Types / Type Erasure",
    difficulty: 3,
  },

  {
    id: "14-event-emitter-string-key",
    title: "EventEmitter doesn't need a type interface — string is enough",
    code: `emitter.on("usr:login", handler); // Typo: "usr" instead of "user"
emitter.emit("user:login", { wrong: true }); // Wrong payload`,
    commonBelief: "String-based event names are flexible enough.",
    reality:
      "Without a type interface, typos in event names and wrong " +
      "payloads are only caught at RUNTIME. With an Events interface, " +
      "TypeScript validates: (1) Only known event names are allowed, " +
      "(2) the payload must match the event type. " +
      "'usr:login' would produce a compile error.",
    concept: "TypedEventEmitter / Type Safety",
    difficulty: 2,
  },
];