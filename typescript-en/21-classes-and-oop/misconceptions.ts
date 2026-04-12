/**
 * Lesson 21 — Misconception Exercises: Classes & OOP
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
  // ─── 1: private prevents runtime access ────────────────────────────────
  {
    id: "21-private-runtime",
    title: "private prevents access at runtime",
    code: `class Secret {
  private apiKey: string = "sk-12345";
}

const s = new Secret();
// "private protects the data from unauthorized access"
console.log((s as any).apiKey); // ???`,
    commonBelief:
      "`private` protects fields at runtime — nobody can access " +
      "`apiKey` because it is private.",
    reality:
      "`(s as any).apiKey` returns 'sk-12345'! TypeScript's `private` " +
      "is a pure compile-time feature (Type Erasure). At runtime, the " +
      "field is a completely normal JavaScript property. For real " +
      "runtime protection, `#apiKey` (ES2022 Private Fields) must be used.",
    concept: "Type Erasure / private vs #private",
    difficulty: 2,
  },

  // ─── 2: Abstract classes have ONLY abstract methods ──────────────────
  {
    id: "21-abstract-only-abstract",
    title: "Abstract classes can only have abstract methods",
    code: `abstract class Base {
  // "Everything in an abstract class must be abstract"
  abstract doWork(): void;

  // Is THIS allowed?
  log(message: string): void {
    console.log(\`[Base] \${message}\`);
  }
}`,
    commonBelief:
      "If a class is `abstract`, ALL its methods must also be " +
      "`abstract` — an abstract class may not contain any " +
      "concrete code.",
    reality:
      "Completely allowed! Abstract classes can have both abstract methods " +
      "(without body — must be implemented by subclasses) as well as " +
      "concrete methods (with body — are inherited). That is exactly " +
      "their advantage over interfaces: They can provide shared " +
      "code AND enforce implementations.",
    concept: "Abstract Classes / concrete vs abstract methods",
    difficulty: 2,
  },

  // ─── 3: implements checks more than structural compatibility ────────────
  {
    id: "21-implements-structural",
    title: "implements is stricter than Structural Typing",
    code: `interface Printable {
  print(): void;
}

class Report {
  print(): void {
    console.log("Printing Report...");
  }
}

function printAll(items: Printable[]) {
  items.forEach(i => i.print());
}

// Without 'implements Printable' — does this work?
printAll([new Report()]);`,
    commonBelief:
      "Without `implements Printable`, `Report` cannot be used as " +
      "`Printable` — you MUST write `implements`.",
    reality:
      "It compiles and works! TypeScript uses Structural Typing: " +
      "Report has a `print(): void` method, so it matches Printable. " +
      "`implements` is optional — it provides earlier error messages and " +
      "documentation, but is not required for compatibility.",
    concept: "Structural Typing / implements is optional",
    difficulty: 3,
  },

  // ─── 4: Inheritance is always better than Composition ─────────────────────
  {
    id: "21-inheritance-always-better",
    title: "Inheritance is always the best solution for code sharing",
    code: `// "Share code through inheritance"
class Animal { move() { /* ... */ } }
class SwimmingAnimal extends Animal { swim() { /* ... */ } }
class FlyingAnimal extends Animal { fly() { /* ... */ } }
// Duck: can swim AND fly?
// class Duck extends SwimmingAnimal, FlyingAnimal ???
// ERROR: Only ONE parent class allowed!`,
    commonBelief:
      "Inheritance is the primary method to share code between classes. " +
      "The more inheritance levels, the better organized.",
    reality:
      "TypeScript only allows ONE parent class (no multiple inheritance). " +
      "Even if it were possible: deep inheritance hierarchies create tight " +
      "coupling and are hard to maintain. The Gang of Four already " +
      "recommended in 1994: 'Favor composition over inheritance'. " +
      "Better: Interfaces + composition or mixins.",
    concept: "Composition over Inheritance",
    difficulty: 2,
  },

  // ─── 5: Static methods and this like instance methods ──────────────────
  {
    id: "21-static-this",
    title: "Static methods access instance fields",
    code: `class Counter {
  count: number = 0;

  static increment(): void {
    this.count++;
    // "this.count increments the instance counter"
  }
}

Counter.increment();
console.log(new Counter().count); // ???`,
    commonBelief:
      "`this` in a static method refers to the current " +
      "instance, just like in normal methods.",
    reality:
      "In static methods, `this` refers to the CLASS, not to " +
      "an instance. `this.count++` creates or increments `Counter.count` " +
      "(a static property on the class), not the instance field. " +
      "`new Counter().count` is still 0 — the instance field was " +
      "never touched. Static and Instance Members are separate worlds.",
    concept: "Static vs Instance Members / this in static",
    difficulty: 3,
  },

  // ─── 6: #private and private are the same ─────────────────────────────
  {
    id: "21-hash-private-same",
    title: "#private and private are the same",
    code: `class A {
  private tsPrivate: string = "ts";
  #jsPrivate: string = "js";
}

const a = new A();

// Attempt 1: TypeScript private
console.log((a as any).tsPrivate); // ???

// Attempt 2: JavaScript #private
// console.log((a as any).#jsPrivate); // ???`,
    commonBelief:
      "`private` and `#private` are two ways of writing the same feature — " +
      "both protect fields from external access.",
    reality:
      "`(a as any).tsPrivate` returns 'ts' — TypeScript's `private` " +
      "is removed during compilation! " +
      "`(a as any).#jsPrivate` is a syntax error — `#` fields are genuinely " +
      "private at runtime, not even accessible with `as any`. " +
      "They also don't show up in `Object.keys()` or `JSON.stringify()`.",
    concept: "TypeScript private vs JavaScript #private",
    difficulty: 3,
  },

  // ─── 7: Arrow functions as class fields are always better ───────────
  {
    id: "21-arrow-class-fields",
    title: "Arrow functions as class fields are always better",
    code: `class Button {
  label: string;
  constructor(label: string) { this.label = label; }

  // "Arrow functions solve all this-binding problems!"
  onClick = () => {
    console.log(\`Clicked: \${this.label}\`);
  };
}

// Creating 10,000 buttons:
const buttons = Array.from({ length: 10000 },
  (_, i) => new Button(\`Button \${i}\`));`,
    commonBelief:
      "Arrow functions as class fields are always the best solution " +
      "for this-binding — there is no downside.",
    reality:
      "Arrow functions as class fields solve the this problem, " +
      "but have a downside: Each INSTANCE gets its own copy " +
      "of the function (it resides on the instance, not on the prototype). " +
      "With 10,000 buttons = 10,000 copies of onClick in memory. " +
      "Prototype methods (normal methods) are stored only once " +
      "and shared by all instances.",
    concept: "Arrow Fields vs Prototype Methods / Memory",
    difficulty: 4,
  },

  // ─── 8: Classes are reference types, interfaces are value types ─────────
  {
    id: "21-class-reference-interface-value",
    title: "Classes are reference types, interfaces are value types",
    code: `interface Point {
  x: number;
  y: number;
}

class PointClass {
  constructor(public x: number, public y: number) {}
}

const a: Point = { x: 1, y: 2 };
const b: Point = a;
b.x = 99;
console.log(a.x); // ???

const c = new PointClass(1, 2);
const d = c;
d.x = 99;
console.log(c.x); // ???`,
    commonBelief:
      "Interface-typed objects are value types (are copied), " +
      "class instances are reference types (are referenced). " +
      "Therefore `b.x = 99` does not change the value of `a.x`.",
    reality:
      "BOTH output 99! In JavaScript ALL objects are reference types — " +
      "regardless of whether they were created via class, interface, or object literal. " +
      "The interface type does not change the runtime behavior. " +
      "`const b = a` copies the REFERENCE, not the object. " +
      "Interfaces do not exist at runtime (Type Erasure).",
    concept: "Reference Types / Interface = no runtime concept",
    difficulty: 3,
  },
];