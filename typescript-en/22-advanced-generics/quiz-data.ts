/**
 * Lesson 22 — Quiz Data: Advanced Generics
 *
 * Exports only the questions (without calling runQuiz),
 * so that the review runner can import them.
 *
 * correct-index distribution: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "22";
export const lessonTitle = "Advanced Generics";

export const questions: QuizQuestion[] = [
  // --- Question 1: Limits of Simple Generics (correct: 0) ---
  {
    question: "Why can't you write `type Apply<F, A> = F<A>` in TypeScript?",
    options: [
      "TypeScript does not support Higher-Kinded Types — type parameters cannot themselves be generic",
      "The syntax is wrong, the correct form would be `type Apply<F, A> = F(A)` with parentheses instead of angle brackets",
      "It works from TypeScript 5.0 onwards, the feature was introduced with the new type system update",
      "You need to write `type Apply<F extends Function, A> = F<A>` to constrain the type parameter",
    ],
    correct: 0,
    explanation:
      "TypeScript has no native concept of Higher-Kinded Types. " +
      "A type parameter like `F` cannot itself accept type parameters. " +
      "This is a fundamental limitation of the type system.",
    elaboratedFeedback: {
      whyCorrect:
        "In TypeScript, a type parameter is always a concrete type (like `string` or `number`), " +
        "not a type constructor (like `Array` or `Promise`). `F<A>` would require " +
        "F to itself be generic — that is not possible.",
      commonMistake:
        "Some think you just need the right constraint. But even " +
        "`F extends SomeGeneric` does not make F a type constructor.",
    },
  },

  // --- Question 2: HKT Emulation (correct: 1) ---
  {
    question: "How are Higher-Kinded Types most commonly emulated in TypeScript?",
    options: [
      "With `eval()` at runtime to dynamically generate type information",
      "With interface maps (URItoKind pattern) or Conditional Types",
      "With Template Literal Types that use type names as string keys",
      "Not at all — you need Haskell or another language with native Higher-Kinded Types",
    ],
    correct: 1,
    explanation:
      "The most common pattern is an interface map that maps string URIs to " +
      "concrete types. Libraries like fp-ts use this pattern. " +
      "Alternatively, Conditional Types can be used as dispatch.",
    code: `interface URItoKind<A> {
  Array: Array<A>;
  Promise: Promise<A>;
}
type Kind<URI extends keyof URItoKind<any>, A> = URItoKind<A>[URI];
// Kind<"Array", string> = string[]`,
    elaboratedFeedback: {
      whyCorrect:
        "The interface map acts as a 'lookup table' for type constructors. " +
        "Instead of `F<A>` you write `Kind<F, A>` and use the map as indirection.",
      commonMistake:
        "Many believe there is no way, since TypeScript has no HKTs. " +
        "The emulation is less elegant than in Haskell, but it works.",
    },
  },

  // --- Question 3: Covariance (correct: 2) ---
  {
    question: "If `Cat extends Animal`, which statement about covariance is correct?",
    options: [
      "`Consumer<Cat> extends Consumer<Animal>` (Cat-Consumer is a subtype)",
      "`Array<Cat>` is always a subtype of `Array<Animal>`",
      "`Producer<Cat> extends Producer<Animal>` (Producer is covariant in T)",
      "Covariance means that subtype relationships are always reversed",
    ],
    correct: 2,
    explanation:
      "With covariance, the subtype direction is preserved: if Cat is a subtype " +
      "of Animal, then Producer<Cat> is a subtype of Producer<Animal>. " +
      "This applies to types that only 'produce' T (output position).",
    elaboratedFeedback: {
      whyCorrect:
        "A Producer<Cat> can be used anywhere a Producer<Animal> " +
        "is expected — returning a cat is always fine when an animal is expected.",
      commonMistake:
        "Array<Cat> is NOT always a subtype of Array<Animal>, because arrays can also " +
        "be written to (push). That makes them invariant, not covariant.",
    },
  },

  // --- Question 4: Contravariance (correct: 3) ---
  {
    question: "Why are function parameters contravariant (with strictFunctionTypes)?",
    options: [
      "Because TypeScript arbitrarily chose a direction",
      "Because it is a compiler bug that was never fixed",
      "Because function parameters are not checked at runtime",
      "Because a function that accepts `Animal` can also handle `Cat`, but not the other way around",
    ],
    correct: 3,
    explanation:
      "A function `(a: Animal) => void` can handle any animal, including cats. " +
      "But a function `(c: Cat) => void` can only handle cats — a dog would " +
      "crash. Therefore `(a: Animal) => void` is a subtype of `(c: Cat) => void`.",
    code: `type Handler<T> = (item: T) => void;
// Handler<Animal> extends Handler<Cat>  ✓ (contravariant)
// Handler<Cat> extends Handler<Animal>  ✗`,
    elaboratedFeedback: {
      whyCorrect:
        "In the input position (parameter) the type must become 'wider' to be safe. " +
        "Whoever can handle Animal can also handle Cat — that is contravariance.",
      commonMistake:
        "Many intuitively think that Handler<Cat> should be a subtype of Handler<Animal> " +
        "(covariant). But that would be unsafe — the Cat-handler could call .meow().",
    },
  },

  // --- Question 5: Invariance (correct: 0) ---
  {
    question: "When is a generic type invariant?",
    options: [
      "When the type parameter is used in both input and output position",
      "When the type parameter is never used and therefore no variance relationship exists",
      "When the type is readonly and therefore does not allow write operations",
      "When the type only has methods but no defined properties",
    ],
    correct: 0,
    explanation:
      "Invariance occurs when T is both read (out) and written (in). " +
      "Array<T> is invariant because you can both read AND add elements. " +
      "Only Array<Cat> = Array<Cat> is allowed, not Array<Cat> = Array<Animal>.",
    elaboratedFeedback: {
      whyCorrect:
        "Reading requires covariance (out), writing requires contravariance (in). " +
        "When both are needed, there is no safe direction — hence invariance.",
      commonMistake:
        "Many think readonly makes a type invariant. In fact, readonly " +
        "makes the type more covariant, because the write position is removed.",
    },
  },

  // --- Question 6: in/out Modifier (correct: 1) ---
  {
    question: "What does `interface Producer<out T> { get(): T; }` do?",
    options: [
      "It changes the runtime behavior and adds variance checks to the generated code",
      "It annotates T as covariant and TypeScript checks that T only appears in output position",
      "It makes T optional and allows undefined as a default value for the type parameter",
      "It is syntax for TypeScript 6.0 and does not yet work in current versions",
    ],
    correct: 1,
    explanation:
      "The `out` modifier (TS 4.7+) explicitly declares that T is only used in output position " +
      "(covariant). TypeScript verifies this and throws an error if " +
      "T appears in an input position. It also speeds up type checking.",
    elaboratedFeedback: {
      whyCorrect:
        "`out T` is an annotation that declares covariance. TypeScript verifies " +
        "the annotation and can thereby perform variance checks faster " +
        "(no more structural comparison needed).",
      commonMistake:
        "The modifiers do NOT change behavior — they only annotate intent. " +
        "If the code violates the annotation, there will be a compile error.",
    },
  },

  // --- Question 7: in Modifier (correct: 2) ---
  {
    question: "Which code is correct with `interface Comparer<in T>`?",
    options: [
      "`interface Comparer<in T> { get(): T; }`",
      "`interface Comparer<in T> { value: T; }`",
      "`interface Comparer<in T> { compare(a: T, b: T): number; }`",
      "`interface Comparer<in T> { clone(): Comparer<T>; }`",
    ],
    correct: 2,
    explanation:
      "`in T` declares contravariance — T may only appear in input position (parameters). " +
      "A `compare(a: T, b: T): number` uses T only as input. " +
      "A `get(): T` method would be an error, since T there is in output position.",
    elaboratedFeedback: {
      whyCorrect:
        "Contravariance (`in T`) means: T is only 'consumed', never 'produced'. " +
        "Parameters are input positions — perfect for `in T`.",
      commonMistake:
        "A property `value: T` is both readable and writable, " +
        "meaning both in and out — that violates the `in` constraint.",
    },
  },

  // --- Question 8: Distributive Conditional Types (correct: 3) ---
  {
    question: "When does a Conditional Type distribute over a union?",
    code: `type IsString<T> = T extends string ? true : false;
type Result = IsString<string | number>; // ???`,
    options: [
      "Always, with every use of a Conditional Type",
      "Never — Conditional Types always work on the entire type",
      "Only when the Conditional Type is in a generic context",
      "Only when T is a 'naked' (unwrapped) type parameter",
    ],
    correct: 3,
    explanation:
      "Distributive behavior only occurs when the type being checked is a " +
      "'naked' type parameter (`T extends ...`). For `string | number extends string` " +
      "(no type parameter) there is no distribution. Wrapping with `[T]` also prevents it.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript distributes the union only when T appears directly as a naked type parameter. " +
        "`IsString<string | number>` becomes `IsString<string> | IsString<number>` = `true | false`.",
      commonMistake:
        "Many assume that distribution always happens. But `[T] extends [string]` " +
        "prevents distribution — the union is checked as a whole.",
    },
  },

  // --- Question 9: Intersection Constraints (correct: 0) ---
  {
    question: "What does `T extends Serializable & Loggable` mean?",
    options: [
      "T must implement BOTH interfaces simultaneously",
      "T must implement ONE of the two interfaces",
      "T must be a union of Serializable and Loggable",
      "It is a syntax error — you need two separate extends",
    ],
    correct: 0,
    explanation:
      "An intersection constraint `T extends A & B` requires T to " +
      "have all properties of A AND B. It is like an AND: " +
      "The type must fulfill both contracts.",
    elaboratedFeedback: {
      whyCorrect:
        "Intersection (`&`) in constraints works like with normal types: " +
        "All properties of both types must be present. " +
        "Unlike in Java, there is no `T extends A, B` syntax.",
      commonMistake:
        "Some confuse `&` (Intersection = AND) with `|` (Union = OR). " +
        "In TypeScript you cannot use `T extends A | B` for 'either-or' — " +
        "that means 'T is a subtype of the union', which is almost always true.",
    },
  },

  // --- Question 10: Recursive Constraints (correct: 1) ---
  {
    question: "What does `T extends Comparable<T>` do?",
    code: `interface Comparable<T> {
  compareTo(other: T): number;
}
function sort<T extends Comparable<T>>(arr: T[]): T[] { /* ... */ }`,
    options: [
      "It creates an infinite loop in the compiler that causes a crash",
      "T must be able to compare to itself — the F-bounded Polymorphism pattern",
      "T is constrained to Comparable and the recursive type parameter is ignored",
      "It is invalid syntax and generates a compile error due to circular reference",
    ],
    correct: 1,
    explanation:
      "This is F-bounded Polymorphism: T references itself in the constraint. " +
      "It ensures that T has a `compareTo` method that accepts OTHER T instances " +
      "— not just any Comparable, but exactly the same type.",
    elaboratedFeedback: {
      whyCorrect:
        "F-bounded Polymorphism (known from Java as `T extends Comparable<T>`) " +
        "ensures that apples are only compared with apples, not with pears. " +
        "The type references itself in the constraint.",
      commonMistake:
        "Many think this creates an infinite loop. TypeScript handles recursive " +
        "constraints correctly — the recursion is at the type level, not at runtime.",
    },
  },

  // --- Question 11: Generics vs Overloads (correct: 2) ---
  {
    question: "When are Function Overloads better than Generics?",
    options: [
      "Overloads are always better because they are more readable",
      "Overloads are never better — Generics can do everything",
      "When a finite set of concrete input-output relationships exists",
      "Only with more than 5 type parameters",
    ],
    correct: 2,
    explanation:
      "Overloads are better when you have a fixed set of input-output relationships: " +
      "`f(string): number` and `f(number): string`. Generics are better when the " +
      "relationship is parametric: `f<T>(x: T): T`.",
    code: `// Overloads better:
function parse(input: string): number;
function parse(input: number): string;
// Generic better:
function identity<T>(x: T): T;`,
    elaboratedFeedback: {
      whyCorrect:
        "Overloads map discrete relationships (if string, then number). " +
        "Generics map parametric relationships (the output type depends " +
        "on the input type, but in a uniform way).",
      commonMistake:
        "Many use Generics for everything, even when a simple overload " +
        "would be clearer. 'Generics are a tool, not a goal.'",
    },
  },

  // --- Question 12: Default Type Parameters (correct: 2) ---
  {
    question: "What happens when a Generic with a default type parameter is called?",
    code: `function fetch<T = unknown>(url: string): Promise<T> { /* ... */ }
const result = fetch("/api/users"); // type of result?`,
    options: [
      "Compile error — T must be specified explicitly",
      "T is inferred as `any`",
      "T becomes the default `unknown`, so `Promise<unknown>`",
      "T is inferred as `string` because url is a string",
    ],
    correct: 2,
    explanation:
      "When TypeScript cannot infer T from context and no explicit " +
      "type parameter is given, the default kicks in. Here T becomes `unknown`, " +
      "so result is of type `Promise<unknown>`.",
    elaboratedFeedback: {
      whyCorrect:
        "Default type parameters are fallbacks: TypeScript first tries to infer, " +
        "then falls back to the default. Here there is no inference candidate for T, " +
        "so the default `unknown` is used.",
      commonMistake:
        "Some think inference always takes priority. That is true — IF there is " +
        "an inference candidate. Without a candidate, the default applies.",
    },
  },

  // --- Question 13: Performance of in/out (correct: 0) ---
  {
    question: "Why do `in`/`out` modifiers improve TypeScript performance?",
    options: [
      "TypeScript no longer needs to compute variance structurally but reads the annotation",
      "They reduce the size of the compiled JavaScript code by eliminating check code",
      "They activate a special JIT compiler that optimizes generic types at runtime",
      "They have no performance effect — they serve exclusively for type correctness",
    ],
    correct: 0,
    explanation:
      "Without `in`/`out`, TypeScript must compute variance structurally: " +
      "every use of T is examined to determine whether the type is covariant, " +
      "contravariant, or invariant. With the annotation, this analysis is eliminated.",
    elaboratedFeedback: {
      whyCorrect:
        "Structural variance computation is expensive: TypeScript must go through all members " +
        "and check where T appears. The annotation directly says 'covariant' " +
        "or 'contravariant' — a simple lookup instead of an analysis.",
      commonMistake:
        "Many think the modifiers are purely cosmetic. In fact they bring " +
        "measurable compile-time improvements in large projects.",
    },
  },

  // --- Question 14: Generic Constraints and keyof (correct: 3) ---
  {
    question: "What is the type of `key` in this function?",
    code: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Max", age: 30 };
const name = getProperty(user, "name"); // type of name?`,
    options: [
      "`string | number` — because T has properties of both types",
      "`unknown` — because TypeScript does not know the concrete type",
      "`'name' | 'age'` — because keyof yields the union of all keys",
      "`string` — because TypeScript resolves 'name' to `T[K]` and `T['name']` is string",
    ],
    correct: 3,
    explanation:
      "TypeScript infers K as the literal type `'name'` (not the entire keyof union). " +
      "Then `T[K]` = `{ name: string, age: number }['name']` = `string`. " +
      "That is the magic of Generics with keyof — precise return types.",
    elaboratedFeedback: {
      whyCorrect:
        "K is inferred as `'name'` (Literal Type), not as `'name' | 'age'`. " +
        "This makes T[K] precisely `string` and not `string | number`.",
      commonMistake:
        "Some think K would always be the entire keyof union. But TypeScript " +
        "infers the narrowest matching type — here the literal `'name'`.",
    },
  },

  // --- Question 15: API Design Anti-Pattern (correct: 1) ---
  {
    question: "Which is a common anti-pattern in generic APIs?",
    code: `// Which variant is an anti-pattern?
function a<T>(x: T): T { return x; }
function b<T>(x: T): void { console.log(x); }
function c(x: unknown): void { console.log(x); }`,
    options: [
      "Function a — identity is pointless",
      "Function b — T is only used once and carries no information",
      "Function c — unknown is always wrong",
      "None of them is an anti-pattern",
    ],
    correct: 1,
    explanation:
      "When a type parameter appears only once (here only in the parameter, not in the return), " +
      "it carries no information and can be replaced with `unknown`. " +
      "The TypeScript documentation calls this the 'Rule of Two': a Generic should appear at least " +
      "twice.",
    elaboratedFeedback: {
      whyCorrect:
        "A type parameter that appears only once correlates nothing. " +
        "`<T>(x: T): void` is functionally identical to `(x: unknown): void`. " +
        "The Generic only adds complexity without gaining type safety.",
      commonMistake:
        "Many add Generics 'prophylactically' hoping for more flexibility. " +
        "But an unnecessary type parameter confuses users of the API.",
    },
  },

  // ─── New Question Formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  // --- Question 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the property called when, given `Cat extends Animal`, " +
      "`Producer<Cat> extends Producer<Animal>` also holds (subtype direction is preserved)?",
    expectedAnswer: "Covariance",
    acceptableAnswers: [
      "Covariance", "covariance", "covariant",
    ],
    explanation:
      "Covariance means: the subtype direction is preserved. " +
      "If Cat is a subtype of Animal, then Producer<Cat> " +
      "is a subtype of Producer<Animal>. This applies to types in output position.",
  },

  // --- Question 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the TypeScript rule that a type parameter should appear at least " +
      "twice in a signature to be meaningful?",
    expectedAnswer: "Rule of Two",
    acceptableAnswers: [
      "Rule of Two", "rule of two", "Rule-of-Two",
    ],
    explanation:
      "The 'Rule of Two' states: a type parameter must appear at least twice " +
      "(e.g. in the parameter AND in the return type) to establish a " +
      "correlation. Single-use type parameters can be replaced with 'unknown'.",
  },

  // --- Question 18: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which two TypeScript keywords (since TS 4.7) explicitly annotate the variance " +
      "of a type parameter? Name both, separated by a comma.",
    expectedAnswer: "in, out",
    acceptableAnswers: [
      "in, out", "in and out", "in/out", "out, in", "out and in", "in out",
    ],
    explanation:
      "'in' declares contravariance (T only in input position), " +
      "'out' declares covariance (T only in output position). " +
      "TypeScript verifies the annotation and thereby speeds up type checking.",
  },

  // --- Question 19: Predict-Output ---
  {
    type: "predict-output",
    question: "What type does `result` have?",
    code:
      "type IsString<T> = T extends string ? 'ja' : 'nein';\n" +
      "type Result = IsString<string | number>;",
    expectedAnswer: "'ja' | 'nein'",
    acceptableAnswers: [
      "'ja' | 'nein'", "\"ja\" | \"nein\"", "ja | nein",
      "'nein' | 'ja'", "\"nein\" | \"ja\"", "nein | ja",
    ],
    explanation:
      "Since T is a naked type parameter, the Conditional Type " +
      "distributes over the union: IsString<string> | IsString<number> = 'ja' | 'nein'. " +
      "That is Distributive Behavior.",
  },

  // --- Question 20: Predict-Output ---
  {
    type: "predict-output",
    question: "What type does `name` have?",
    code:
      "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n" +
      "  return obj[key];\n" +
      "}\n" +
      "const user = { name: 'Max', age: 30 };\n" +
      "const name = getProperty(user, 'name');",
    expectedAnswer: "string",
    acceptableAnswers: ["string", "String"],
    explanation:
      "TypeScript infers K as the literal type 'name'. " +
      "T[K] = { name: string; age: number }['name'] = string. " +
      "That is the strength of Generics with keyof — precise return types.",
  },

  // --- Question 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why are function parameters contravariant, while return values " +
      "are covariant? Explain using an example with an animal hierarchy " +
      "(Animal/Cat) why the reversed direction would be unsafe.",
    modelAnswer:
      "A function (Animal) => void can handle any animal, including cats. " +
      "Therefore it is safe where (Cat) => void is expected. Conversely, " +
      "(Cat) => void would be unsafe as (Animal) => void, because it could not " +
      "handle a dog. For return values the opposite applies: a function " +
      "that returns Cat can be used anywhere Animal is expected, " +
      "because every cat is also an animal.",
    keyPoints: [
      "Parameter: wider type is safer (contravariant)",
      "Return value: narrower type is safer (covariant)",
      "Unsafe case: Cat-handler could call .meow()",
      "Liskov Substitution Principle",
    ],
  },
];