/**
 * Lesson 14 — Quiz Data: Generic Patterns
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "14";
export const lessonTitle = "Generic Patterns";

export const questions: QuizQuestion[] = [
  // --- Question 1: Generic Factory Basics ---
  {
    question: "What does the type `new () => T` describe in a Generic Factory?",
    options: [
      "A Constructor Signature — something that can be called with new and produces T",
      "A function that takes T as a parameter",
      "An interface for T",
      "An abstract class",
    ],
    correct: 0,
    explanation:
      "`new () => T` is a Constructor Signature. It describes " +
      "everything that can be called with the `new` keyword and returns " +
      "an instance of T. These are typically classes.",
  },

  // --- Question 2: Builder Pattern ---
  {
    question: "How does the Generic Builder track the growing type with each `.set()` call?",
    options: [
      "Through an array of types",
      "Through Intersection Types: T & Record<K, V> on each call",
      "Through an external Type Map",
      "Through Runtime Type Checking",
    ],
    correct: 1,
    explanation:
      "Each `.set(key, value)` call returns `Builder<T & Record<K, V>>`. " +
      "The intersection extends the type with the new field. " +
      "At the end, `.build()` has the exact type of all added fields.",
    code: "new Builder()\n  .set('name', 'Max')     // Builder<{} & Record<'name', string>>\n  .set('age', 30)          // Builder<... & Record<'age', number>>",
  },

  // --- Question 3: Stack<T> Return Types ---
  {
    question: "Why does `Stack<T>.pop()` return type `T | undefined` instead of `T`?",
    options: [
      "Because TypeScript does not support generic return types",
      "Because T is always optional",
      "Because the stack can be empty and then there is no element to return",
      "Because pop() does not modify the stack",
    ],
    correct: 2,
    explanation:
      "An empty stack has no element to return. `undefined` " +
      "signals this case. Without `undefined` in the type, you would have to " +
      "throw an exception or lie (both worse).",
  },

  // --- Question 4: pipe() Overloads ---
  {
    question: "Why does `pipe()` need overloads instead of a single generic type?",
    options: [
      "Because pipe only works with overloads",
      "Because generics do not support function parameters",
      "Because overloads are faster than generics",
      "Because each step has a DIFFERENT type and TypeScript cannot infer arbitrarily many type parameters from rest parameters",
    ],
    correct: 3,
    explanation:
      "pipe(value, fn1, fn2, fn3) has different types at each step: " +
      "A -> B -> C -> D. TypeScript cannot infer arbitrarily many different " +
      "type parameters from a rest parameter. Overloads define " +
      "the type transitions for each length explicitly.",
  },

  // --- Question 5: compose vs pipe ---
  {
    question: "What is the main difference between pipe() and compose()?",
    options: [
      "compose returns a function, pipe executes immediately; the order is reversed",
      "pipe is type-safe, compose is not",
      "pipe only works with arrays",
      "compose does not need generics",
    ],
    correct: 0,
    explanation:
      "pipe(value, f, g) executes immediately: g(f(value)). " +
      "compose(g, f) returns a new function: (x) => g(f(x)). " +
      "With compose, the reading order is reversed (right to left, " +
      "as in mathematics).",
  },

  // --- Question 6: Conditional Constraints ---
  {
    question: "What does `T extends string ? X : Y` do in a Conditional Constraint?",
    options: [
      "It checks at runtime whether T is a string",
      "It selects type X or Y depending on whether T is a subtype of string",
      "It converts T to string",
      "It creates a union of X and Y",
    ],
    correct: 1,
    explanation:
      "Conditional Types are a compile-time decision. If T " +
      "is a subtype of string, X is chosen; otherwise Y. This " +
      "enables context-dependent return types.",
    code: "type Result<T> = T extends string ? string : number;\n// Result<'hello'> = string\n// Result<42> = number",
  },

  // --- Question 7: Recursive Constraints ---
  {
    question: "What does `interface TreeNode<T> { value: T; children: TreeNode<T>[]; }` describe?",
    options: [
      "A flat array type",
      "A circular reference error",
      "A recursive tree node — each node has the same type for value and children",
      "A Union Type",
    ],
    correct: 2,
    explanation:
      "TreeNode<T> references itself in the children property. " +
      "This does not cause an error — TypeScript supports recursive types. " +
      "Each node has a value of type T and any number of children " +
      "of the same type TreeNode<T>.",
  },

  // --- Question 8: const Type Parameters ---
  {
    question: "What does `<const T>` (TS 5.0) do with a type parameter?",
    options: [
      "T becomes immutable (readonly)",
      "T becomes a constant",
      "T only accepts const variables",
      "TypeScript infers the most precise literal type — as if the caller had written as const",
    ],
    correct: 3,
    explanation:
      "`<const T>` enforces literal inference at the call site. Without const " +
      "['a', 'b'] is inferred as string[]. With const it becomes " +
      "readonly ['a', 'b']. The caller does not need to write `as const`.",
    code: "function f<const T>(x: T): T { return x; }\nf(['a', 'b']) // readonly ['a', 'b'] instead of string[]",
  },

  // --- Question 9: DeepPartial ---
  {
    question: "What does `DeepPartial<T>` do differently than `Partial<T>`?",
    options: [
      "Nothing, they are identical",
      "DeepPartial also makes nested properties optional — at ALL levels",
      "DeepPartial removes properties",
      "DeepPartial is faster",
    ],
    correct: 1,
    explanation:
      "Partial<T> only makes the first level optional. DeepPartial<T> " +
      "is recursive: it checks whether a property is an object and then applies " +
      "ITSELF to it. This makes all levels optional.",
    code: "type DeepPartial<T> = {\n  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];\n};",
  },

  // --- Question 10: Repository Pattern ---
  {
    question: "Why does the Repository<T> interface use `Omit<T, 'id'>` for `create()`?",
    options: [
      "Because the id is automatically generated by the repository — the caller should not set it",
      "Because id is optional",
      "Because Omit is faster",
      "Because id is a reserved word",
    ],
    correct: 0,
    explanation:
      "With `create(data: Omit<T, 'id'>)`, the caller must provide all properties " +
      "of T EXCEPT id. The id is generated internally by the repository. " +
      "This prevents ID conflicts and duplicate IDs.",
  },

  // --- Question 11: EventEmitter Type Safety ---
  {
    question: "How does TypedEventEmitter<Events> ensure that event name and payload match?",
    options: [
      "Through runtime validation",
      "Through separate interfaces per event",
      "Through an interface that maps event names to payload types — K extends keyof Events links them",
      "Through string matching",
    ],
    correct: 2,
    explanation:
      "The Events interface maps event names to payload types. " +
      "With `emit<K extends keyof Events>(event: K, data: Events[K])` " +
      "TypeScript infers K from the event name and derives " +
      "the matching payload type Events[K] from it.",
  },

  // --- Question 12: DI Container Token ---
  {
    question: "Why does the DI Container use `Token<T>` instead of simple strings as keys?",
    options: [
      "Strings are too slow",
      "Strings cannot be used as Map keys",
      "Token<T> carries the service type as a phantom type — resolve() can derive T from it",
      "Token is a built-in TypeScript type",
    ],
    correct: 2,
    explanation:
      "Token<T> is a phantom type carrier. Token<DatabaseService> and " +
      "Token<LoggerService> are different types. With container.resolve(token) " +
      "TypeScript derives T from the token — no explicit cast needed.",
  },

  // --- Question 13: Currying ---
  {
    question: "What does `curry((a: number, b: number) => a + b)` do?",
    options: [
      "It executes the function immediately",
      "It creates a function (a) => (b) => a + b — Partial Application through nested calls",
      "It changes the return type to string",
      "It caches the result",
    ],
    correct: 1,
    explanation:
      "Currying transforms f(a, b) into f(a)(b). The advantage: you can " +
      "create partial applications. curry(add)(5) returns a function " +
      "that adds 5 to any argument. Each step is type-safe.",
  },

  // --- Question 14: Mapped Constraints ---
  {
    question: "How does `EventMap[K]` work when K is constrained by `keyof EventMap`?",
    options: [
      "TypeScript looks up the concrete type for key K in the map — completely type-safe",
      "It always returns unknown",
      "It creates a union of all values",
      "It returns the key as a string",
    ],
    correct: 0,
    explanation:
      "Indexed Access Types: EventMap[K] looks up the value for the " +
      "concrete key K. When K = 'click', EventMap['click'] is resolved. " +
      "Since K is constrained by keyof EventMap, only valid keys are allowed.",
  },

  // --- Question 15: memoize with Generics ---
  {
    question: "Why does the generic `memoize<Args, R>()` function need `JSON.stringify(args)` as a cache key?",
    options: [
      "Because Map only accepts strings as keys",
      "Because JSON is faster",
      "Because TypeScript requires it",
      "Because different argument combinations need different cache entries and arrays are not directly comparable",
    ],
    correct: 3,
    explanation:
      "JavaScript compares arrays/objects by reference, not by value. " +
      "[1, 2] !== [1, 2]. JSON.stringify creates a string that represents the " +
      "CONTENT — identical arguments produce the same string and hit the same cache entry.",
  },

  // ─── Additional Question Formats ────────────────────────────────────────────

  // --- Question 16: Short-Answer ---
  {
    type: "short-answer",
    question: "What is the name of the type `new () => T` in TypeScript — a type that describes that something can be called with new?",
    expectedAnswer: "Constructor Signature",
    acceptableAnswers: ["Constructor Signature", "Constructor Type", "Construct Signature"],
    explanation:
      "new () => T is a Constructor Signature. It describes everything " +
      "that can be called with the new keyword and returns an instance " +
      "of T. This is the foundation for Generic Factories.",
  },

  // --- Question 17: Short-Answer ---
  {
    type: "short-answer",
    question: "Which TS 5.0 feature causes TypeScript to automatically infer the most precise literal type at the call site — without the caller having to write 'as const'?",
    expectedAnswer: "const Type Parameters",
    acceptableAnswers: ["const Type Parameters", "const T", "<const T>", "const type parameter"],
    explanation:
      "<const T> shifts the as-const responsibility from the caller to the " +
      "API designer. Without const, ['a', 'b'] is inferred as string[], " +
      "with const as readonly ['a', 'b']. The caller is unaware of this.",
  },

  // --- Question 18: Short-Answer ---
  {
    type: "short-answer",
    question: "What is the name of the programming pattern where f(a, b) is transformed into f(a)(b) — each call fixes one parameter?",
    expectedAnswer: "Currying",
    acceptableAnswers: ["Currying", "Curry", "Partial Application"],
    explanation:
      "Currying transforms a function with multiple parameters into a " +
      "chain of functions each with one parameter. curry(add)(5) returns " +
      "a function that adds 5 to any argument. " +
      "Each step is fully type-safe with generics.",
  },

  // --- Question 19: Predict-Output ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "type Result<T> = T extends string ? 'text' : 'other';\ntype A = Result<'hello'>;\ntype B = Result<42>;\nconst a: A = 'text';\nconst b: B = 'other';\nconsole.log(a, b);",
    expectedAnswer: "text other",
    acceptableAnswers: ["text other", "'text' 'other'", "text, other"],
    explanation:
      "Result<'hello'>: 'hello' extends string is true, so 'text' is chosen. " +
      "Result<42>: 42 extends string is false, so 'other' is chosen. " +
      "Conditional Types are pure compile-time decisions.",
  },

  // --- Question 20: Predict-Output ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "interface TreeNode<T> {\n  value: T;\n  children: TreeNode<T>[];\n}\nconst tree: TreeNode<string> = {\n  value: 'root',\n  children: [\n    { value: 'child1', children: [] },\n    { value: 'child2', children: [{ value: 'grandchild', children: [] }] }\n  ]\n};\nconsole.log(tree.children[1].children[0].value);",
    expectedAnswer: "grandchild",
    acceptableAnswers: ["grandchild", "'grandchild'", "\"grandchild\""],
    explanation:
      "tree.children[1] is the second child node ('child2'). " +
      "Its children[0] is the grandchild node with value 'grandchild'. " +
      "Recursive types like TreeNode<T> allow arbitrarily deep nesting.",
  },

  // --- Question 21: Explain-Why ---
  {
    type: "explain-why",
    question: "Why does the Builder Pattern in TypeScript use Intersection Types (T & Record<K, V>) instead of Union Types with each .set() call?",
    modelAnswer:
      "Intersection Types (&) are additive — they EXTEND the existing type " +
      "with new properties. With each .set('name', 'Max'), Record<'name', string> " +
      "is added to the existing type. Union Types would be OR-connections " +
      "(one or the other), which does not match the goal: the Builder should have all " +
      "previous AND the new property.",
    keyPoints: [
      "Intersection (&) = AND: all properties combined",
      "Union (|) = OR: one or the other",
      "Each .set() call extends the type additively",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Constructor Signatures describe the 'blueprint' of an object. " +
      "`new () => T` means: call with new, no parameters, returns T.",
    commonMistake:
      "Confusion with normal function signatures. The `new` keyword " +
      "makes the difference — without new it would be a call signature.",
  },
  1: {
    whyCorrect:
      "Intersection Types (T & Record<K, V>) are additive — they EXTEND " +
      "the existing type with new properties without losing the old ones.",
    commonMistake:
      "Many expect Union Types instead of Intersection. Unions would be OR " +
      "(one or the other), Intersections are AND (both at the same time).",
  },
  2: {
    whyCorrect:
      "An empty stack has no element. undefined is the honest answer. " +
      "This forces the caller to handle the empty case.",
    commonMistake:
      "Some would throw an exception. That is less ergonomic — " +
      "undefined can be handled elegantly with Optional Chaining.",
  },
  3: {
    whyCorrect:
      "Overloads are the only way to define different type parameters for " +
      "variable argument lists. Each overload signature " +
      "specifies the exact type transitions.",
    commonMistake:
      "Many try a single rest parameter generic. That does not work " +
      "because TypeScript cannot know that fns[0] maps A->B and fns[1] maps B->C.",
  },
  4: {
    whyCorrect:
      "compose creates a reusable pipeline. pipe executes immediately. " +
      "The order with compose is reversed (mathematical notation).",
    commonMistake:
      "Many confuse the execution order. compose(f, g)(x) " +
      "= f(g(x)), NOT g(f(x)).",
  },
  5: {
    whyCorrect:
      "Conditional Types are a compile-time decision based on " +
      "the extends relationship. No runtime code — purely static.",
    commonMistake:
      "Confusion with runtime type guards (typeof, instanceof). " +
      "Conditional Types only exist at the type level.",
  },
  6: {
    whyCorrect:
      "Recursive types are explicitly supported in TypeScript. Interfaces " +
      "can reference themselves — that is not an error but a feature.",
    commonMistake:
      "Fear of circular references. With interfaces, self-reference " +
      "is safe because they are evaluated lazily.",
  },
  7: {
    whyCorrect:
      "const Type Parameters (TS 5.0) shift the 'as const' responsibility " +
      "from the caller to the API designer. The caller does not need to know anything.",
    commonMistake:
      "Confusion with readonly. const T does not make readonly — it forces " +
      "TypeScript to infer the most precise type.",
  },
  8: {
    whyCorrect:
      "DeepPartial is recursive: for each object property, DeepPartial " +
      "is applied again. Partial is only one level deep.",
    commonMistake:
      "Many think Partial is already deep. Partial<{ a: { b: string } }> " +
      "makes a optional, but b remains REQUIRED.",
  },
  9: {
    whyCorrect:
      "Omit<T, 'id'> removes the id property. The repository generates " +
      "the id internally — the caller CANNOT set it.",
    commonMistake:
      "Some simply make id optional (?). That is weaker — optional " +
      "still allows setting the id, Omit prevents it entirely.",
  },
  10: {
    whyCorrect:
      "The Events interface is the 'source of truth'. K extends keyof Events " +
      "ensures that only known event names are allowed, and " +
      "Events[K] provides the matching payload.",
    commonMistake:
      "Many try separate on-methods per event. That does not scale " +
      "and loses the central type connection.",
  },
  11: {
    whyCorrect:
      "Phantom Types carry type information without runtime overhead. " +
      "Token<T> exists at runtime only as a string name, but " +
      "TypeScript knows T for type checking.",
    commonMistake:
      "Many use string keys and then cast manually. " +
      "Token<T> makes the cast unnecessary — TypeScript knows the type.",
  },
  12: {
    whyCorrect:
      "Currying is Partial Application: each call 'fixes' one " +
      "parameter and returns a function for the next.",
    commonMistake:
      "Confusion with immediate execution. curry(fn) does NOT execute fn " +
      "— it creates a new function.",
  },
  13: {
    whyCorrect:
      "Indexed Access Types (EventMap[K]) are TypeScript's mechanism " +
      "for dynamic type lookup. Like an object access, but at the type level.",
    commonMistake:
      "Many think EventMap[K] returns a union of all values. No — " +
      "it returns the CONCRETE type for the concrete key K.",
  },
  14: {
    whyCorrect:
      "JSON.stringify creates a deterministic string representation. " +
      "Same arguments = same string = cache hit.",
    commonMistake:
      "Many forget that [1,2] !== [1,2] in JavaScript. Without " +
      "serialization, the cache would never hit.",
  },
};