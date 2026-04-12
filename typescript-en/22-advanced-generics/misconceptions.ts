/**
 * Lesson 22 — Misconception Exercises: Advanced Generics
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
  // ─── 1: Array<Cat> is always a subtype of Array<Animal> ───────────────
  {
    id: "22-array-covariance",
    title: "Array<Cat> is always a subtype of Array<Animal>",
    code: `interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

function addAnimal(animals: Animal[]) {
  animals.push({ name: "Dog" }); // Not a Cat!
}

const cats: Cat[] = [{ name: "Minka", meow() {} }];
addAnimal(cats); // Does TypeScript allow this?
// cats[1].meow(); // Runtime: .meow is not a function`,
    commonBelief:
      "Since Cat is a subtype of Animal, Array<Cat> should always be a " +
      "subtype of Array<Animal>. That would be logical.",
    reality:
      "Arrays are INVARIANT when mutated. TypeScript allows the assignment " +
      "(out of pragmatism), but it is unsafe: addAnimal can push a non-Cat " +
      "object into a Cat array. Only ReadonlyArray<Cat> would be safely covariant.",
    concept: "Covariance vs Invariance with mutable Collections",
    difficulty: 3,
  },

  // ─── 2: Covariance means "the type gets bigger" ───────────────────────
  {
    id: "22-covariance-meaning",
    title: "Covariance means the type gets bigger",
    code: `interface Producer<T> { get(): T; }

// If Cat extends Animal:
// Producer<Cat> extends Producer<Animal>  ← covariant

// "Covariance = the type gets broader"?
type Test = Producer<Cat> extends Producer<Animal> ? true : false;
// Result: true`,
    commonBelief:
      "Covariance means that the inner type becomes 'broader' or 'bigger'. " +
      "Producer<Animal> is 'bigger' than Producer<Cat>.",
    reality:
      "Covariance means that the subtype relationship is PRESERVED: " +
      "Cat extends Animal → Producer<Cat> extends Producer<Animal>. " +
      "It is not about size, but about the DIRECTION of the subtype relationship. " +
      "Producer<Cat> is the NARROWER (more specific) type.",
    concept: "Covariance = subtype direction stays the same",
    difficulty: 3,
  },

  // ─── 3: in/out Modifiers change behavior ──────────────────────────────
  {
    id: "22-in-out-behavior",
    title: "in/out Modifiers change the behavior of the type",
    code: `// Without modifier:
interface BoxA<T> { value: T; }

// With modifier:
interface BoxB<in out T> { value: T; }

// Are BoxA and BoxB different?
type Test1 = BoxA<string> extends BoxB<string> ? true : false; // true
type Test2 = BoxB<string> extends BoxA<string> ? true : false; // true`,
    commonBelief:
      "The `in`/`out` modifiers change how the type behaves. " +
      "With `out T` the type becomes covariant, without it, it would not be.",
    reality:
      "The modifiers change NO behavior — they are pure ANNOTATIONS. " +
      "TypeScript computes variance structurally anyway. The modifiers " +
      "only declare the intent and TypeScript checks whether the declaration " +
      "is correct. The advantage is clarity and performance (no structural checking needed).",
    concept: "in/out are annotations, not behavior changes",
    difficulty: 2,
  },

  // ─── 4: Generics are always better than Unions ────────────────────────
  {
    id: "22-generics-always-better",
    title: "Generics are always better than Unions",
    code: `// "Generic version" (over-engineered):
function formatGeneric<T extends string | number>(value: T): string {
  return String(value);
}

// Simple Union version:
function formatUnion(value: string | number): string {
  return String(value);
}

// Both do the same thing — but which is better?`,
    commonBelief:
      "Generics are always the better choice because they are more flexible. " +
      "You should always use Generics when possible.",
    reality:
      "Here the Generic is pointless: T is only used once (as a parameter) " +
      "and does not appear in the return type. The Union version is identical " +
      "in functionality but simpler to read and understand. " +
      "Rule: Generics only when the type parameter establishes a RELATIONSHIP.",
    concept: "Rule of Two: Use type parameter at least 2 times",
    difficulty: 2,
  },

  // ─── 5: T extends A | B = T must be A OR B ───────────────────────────
  {
    id: "22-extends-union",
    title: "T extends A | B means T must be A OR B",
    code: `type IsStringOrNumber<T> = T extends string | number ? "yes" : "no";

// What is the result?
type Test1 = IsStringOrNumber<string>;       // "yes"
type Test2 = IsStringOrNumber<42>;           // "yes"
type Test3 = IsStringOrNumber<"hello" | 42>; // ???
type Test4 = IsStringOrNumber<boolean>;      // ???`,
    commonBelief:
      "`T extends string | number` checks whether T is exactly `string` OR exactly `number`. " +
      "Boolean should result in 'no'.",
    reality:
      "`extends` checks the subtype relationship: Every subtype of `string | number` " +
      "satisfies the constraint. `42` (literal) is a subtype of `number`, so 'yes'. " +
      "For `boolean` it is 'no'. But for `string | number` (as a naked type parameter) " +
      "the Conditional Type DISTRIBUTES: `IsStringOrNumber<string> | IsStringOrNumber<number>` = 'yes'.",
    concept: "extends with Unions and Distributive Behavior",
    difficulty: 4,
  },

  // ─── 6: Distributive Conditionals always distribute ───────────────────
  {
    id: "22-always-distributive",
    title: "Distributive Conditional Types always distribute",
    code: `// Version 1: Distributive
type IsString1<T> = T extends string ? true : false;
type R1 = IsString1<string | number>; // true | false

// Version 2: Non-distributive
type IsString2<T> = [T] extends [string] ? true : false;
type R2 = IsString2<string | number>; // false

// Why is R1 !== R2?`,
    commonBelief:
      "Conditional Types always distribute over Unions. " +
      "`IsString1` and `IsString2` should produce the same result.",
    reality:
      "Distribution only occurs when T is a 'naked' (unwrapped) type parameter. " +
      "With `[T] extends [string]`, T is wrapped in a tuple — no distribution. " +
      "Then `string | number` is checked as a whole against `string` → false.",
    concept: "Naked vs wrapped type parameters with Conditionals",
    difficulty: 4,
  },

  // ─── 7: Function parameters are covariant ─────────────────────────────
  {
    id: "22-function-params-covariant",
    title: "Function parameters are covariant",
    code: `interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

type AnimalHandler = (a: Animal) => void;
type CatHandler = (c: Cat) => void;

// Which assignment is safe?
const handler1: CatHandler = (a: Animal) => console.log(a.name); // OK?
const handler2: AnimalHandler = (c: Cat) => c.meow(); // OK?`,
    commonBelief:
      "Function parameters are covariant: Since Cat extends Animal, " +
      "CatHandler should be a subtype of AnimalHandler.",
    reality:
      "With `strictFunctionTypes` function parameters are CONTRAVARIANT: " +
      "AnimalHandler is a subtype of CatHandler (not the other way around!). " +
      "handler1 is safe (Animal handler can process Cats), " +
      "handler2 is unsafe (Cat handler expects .meow(), " +
      "but might receive a dog).",
    concept: "Contravariance of function parameters",
    difficulty: 3,
  },

  // ─── 8: Generic Defaults are always used ──────────────────────────────
  {
    id: "22-generic-defaults",
    title: "Generic Defaults are always used",
    code: `function createBox<T = string>(value: T): { value: T } {
  return { value };
}

// What is the type?
const box1 = createBox("hello");  // { value: string } or { value: "hello" }?
const box2 = createBox(42);       // { value: string } or { value: number }?
const box3 = createBox<string>(42); // Error?`,
    commonBelief:
      "The default `T = string` is always used. `box1` has type " +
      "`{ value: string }` and `box2` should produce an error.",
    reality:
      "Inference takes PRECEDENCE over defaults. For `box1` TS infers `T = string` " +
      "(coincidence, matches the default). For `box2` TS infers `T = number` — " +
      "the default is ignored! The default only applies when NO inference is possible. " +
      "`box3` gives an error because T is explicitly string but 42 is not a string.",
    concept: "Inference takes precedence over default type parameters",
    difficulty: 2,
  },
];