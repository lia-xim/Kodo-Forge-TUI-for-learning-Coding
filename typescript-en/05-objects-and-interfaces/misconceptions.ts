/**
 * Lesson 05 -- Misconceptions: Objects & Interfaces
 *
 * Code snippets that look "obviously correct" but are subtly wrong.
 * Each misconception exposes a common mental error.
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number; // 1 = easy to spot, 5 = very subtle
}

export const misconceptions: Misconception[] = [
  // ─── 1: Excess Property Check always applies ────────────────────────────────
  {
    id: "05-mc-01",
    title: "Excess Property Check always applies",
    code: `interface HasName { name: string; }

function greet(person: HasName) {
  console.log("Hello " + person.name);
}

const data = { name: "Max", age: 30, email: "max@test.de" };
greet(data); // Does this compile?`,
    commonBelief:
      "TypeScript reports an error because 'data' has extra properties " +
      "(age, email) that HasName doesn't know about.",
    reality:
      "No error! The Excess Property Check only applies to fresh object " +
      "literals (written directly). Here a VARIABLE is passed — " +
      "TypeScript then only checks via Structural Typing: 'Does data have at least " +
      "name: string?' Yes, so it fits. Only greet({ name: 'Max', age: 30 }) " +
      "would trigger the error (fresh literal).",
    concept: "Excess Property Check only on fresh object literals",
    difficulty: 2,
  },

  // ─── 2: Intersection conflicts produce a compile error ─────────────────────
  {
    id: "05-mc-02",
    title: "Intersection with conflict produces a compile error",
    code: `interface A { value: string; }
interface B { value: number; }

type C = A & B;

// Expectation: TypeScript reports an error at the definition of C
// Because value can't be both string and number at the same time

const c: C = { value: ??? }; // What can you put here?`,
    commonBelief:
      "TypeScript detects the contradiction at the type definition and " +
      "reports a compile error at 'type C = A & B'.",
    reality:
      "NO error at the type definition! TypeScript creates C with " +
      "value: string & number = never. The type C exists, but there is " +
      "no value that satisfies it. The error only comes when you try to " +
      "create an object of type C — because nothing is both string " +
      "AND number at once. This is a design decision: TypeScript allows " +
      "abstract type definitions even if they are unusable.",
    concept: "Intersection produces 'never' on conflicts, not an error",
    difficulty: 3,
  },

  // ─── 3: readonly makes an object deep-immutable ─────────────────────────────
  {
    id: "05-mc-03",
    title: "'readonly' on an object makes it deep-immutable",
    code: `interface User {
  readonly name: string;
  readonly address: {
    city: string;
    zip: string;
  };
}

const u: User = {
  name: "Alice",
  address: { city: "Berlin", zip: "10115" },
};

u.address.city = "Hamburg"; // Error or no error?`,
    commonBelief:
      "Since 'address' is readonly, all nested properties are also " +
      "protected. 'u.address.city = ...' should be a compile error.",
    reality:
      "NO error! readonly is SHALLOW — it only protects the direct " +
      "property assignment. 'u.address = { ... }' would be an error (the reference " +
      "is readonly), but 'u.address.city = ...' modifies the nested " +
      "object, not the reference. For deep-immutable you need: " +
      "readonly address: { readonly city: string; readonly zip: string; } " +
      "or a recursive DeepReadonly<T> utility type.",
    concept: "readonly is shallow, not deep",
    difficulty: 2,
  },

  // ─── 4: Empty interface accepts nothing ────────────────────────────────────
  {
    id: "05-mc-04",
    title: "An empty interface {} accepts nothing",
    code: `interface Empty {}

const a: Empty = { x: 1 };     // A
const b: Empty = 42;            // B
const c: Empty = "hello";       // C
const d: Empty = [1, 2, 3];     // D
const e: Empty = null;           // E
const f: Empty = undefined;      // F

// Which ones compile?`,
    commonBelief:
      "An empty interface has no properties, so nothing can be assigned " +
      "to it — or at best only empty objects {}.",
    reality:
      "Surprise! B, C, D all compile! An empty interface requires " +
      "NOTHING — and everything except null and undefined satisfies 'no requirements'. " +
      "Numbers, strings and arrays have no MISSING properties. " +
      "A fails the Excess Property Check (fresh object literal with x). " +
      "E and F fail because null/undefined don't match {} under strictNullChecks. " +
      "Conclusion: {} is essentially equivalent to NonNullable<unknown>.",
    concept: "Empty interface / Structural Typing edge case",
    difficulty: 4,
  },

  // ─── 5: interface A extends B overrides properties ─────────────────────────
  {
    id: "05-mc-05",
    title: "'extends' overrides properties of the parent",
    code: `interface Base {
  id: string;
  value: string | number;
}

interface Derived extends Base {
  value: boolean; // Can I change the type?
}`,
    commonBelief:
      "'extends' allows completely overriding properties of the parent interface " +
      "— just like methods in classes.",
    reality:
      "Compile error! With 'extends', the child interface must correctly " +
      "honor the parent properties. 'value: boolean' is NOT compatible with " +
      "'value: string | number'. You can only NARROW the type " +
      "(make it more specific): 'value: string' would be OK (string is a subtype of " +
      "string | number). But 'value: boolean' is a completely different type. " +
      "With intersection (&) instead: value becomes " +
      "(string | number) & boolean = never.",
    concept: "extends requires compatible (narrower) types",
    difficulty: 3,
  },

  // ─── 6: Declaration Merging works with type too ─────────────────────────────
  {
    id: "05-mc-06",
    title: "Declaration Merging works with 'type' too",
    code: `// With interface — works:
interface Config { host: string; }
interface Config { port: number; }
// Config has host AND port

// With type — works too?
type Settings = { theme: string; };
type Settings = { language: string; }; // ???`,
    commonBelief:
      "If Declaration Merging works with 'interface', it should also " +
      "work with 'type'. Both define object types after all.",
    reality:
      "Compile error: 'Duplicate identifier Settings'. Declaration Merging " +
      "is an EXCLUSIVE feature of interfaces. Type aliases cannot be " +
      "reopened. This is one of the few real differences " +
      "between interface and type. If you need to extend library types " +
      "(e.g. Window, ProcessEnv), you need an interface.",
    concept: "Declaration Merging is interface-exclusive",
    difficulty: 2,
  },

  // ─── 7: Optional property and undefined property are identical ──────────────
  {
    id: "05-mc-07",
    title: "Optional (?) and 'undefined' are the same thing",
    code: `interface A { x?: number; }
interface B { x: number | undefined; }

const objA: A = {};          // A: Valid?
const objB: B = {};          // B: Valid?

function checkA(o: A) {
  if ("x" in o) {
    console.log(o.x); // Type of o.x here?
  }
}`,
    commonBelief:
      "'x?: number' and 'x: number | undefined' are identical — " +
      "in both cases x can be undefined.",
    reality:
      "objA compiles, objB does NOT! With 'x?: number' the property " +
      "may be completely ABSENT — the object doesn't need to have x at all. With " +
      "'x: number | undefined' the property MUST be present, but the " +
      "value may be undefined. So: {} fits A, but not B. " +
      "Since TypeScript 4.4 (exactOptionalPropertyTypes) the difference " +
      "can become even sharper: then x?: number truly only means 'absent' and " +
      "not 'is undefined'.",
    concept: "Optional Property vs. | undefined",
    difficulty: 3,
  },

  // ─── 8: readonly prevents assignment during initialization ─────────────────
  {
    id: "05-mc-08",
    title: "'readonly' prevents assignment during initialization",
    code: `interface Config {
  readonly host: string;
  readonly port: number;
}

// Can you even create a readonly object?
const config: Config = {
  host: "localhost",  // Assignment to readonly property?!
  port: 3000,
};

// And what about this?
const mutable = { host: "localhost", port: 3000 };
const readonlyConfig: Config = mutable;
mutable.host = "0.0.0.0"; // Does config.host change too?`,
    commonBelief:
      "'readonly' should forbid assignment entirely — even during " +
      "initialization. Also, assigning 'mutable' " +
      "should create a deep copy.",
    reality:
      "readonly only forbids RE-assignment, not the INITIAL assignment. " +
      "The object literal at const config = { ... } is the initialization — " +
      "that is allowed. After that, config.host = 'xyz' is an error. " +
      "BUT: 'readonlyConfig' and 'mutable' point to the SAME object! " +
      "mutable.host = '0.0.0.0' modifies the object — and readonlyConfig " +
      "sees the change because it is the same reference. " +
      "readonly only protects the ACCESS PATH, not the object itself.",
    concept: "readonly protects the path, not the object",
    difficulty: 4,
  },
];