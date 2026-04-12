/**
 * Lesson 08 — Misconception Exercises: Type Aliases vs Interfaces
 *
 * 8 misconceptions around type vs interface, Declaration Merging,
 * extends vs &, decision rules.
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
    id: "08-type-creates-new-type",
    title: "Type Alias Creates a New Type",
    code: `type UserID = string;
type ProductID = string;

const userId: UserID = "abc";
const productId: ProductID = userId; // Error?`,
    commonBelief:
      "UserID and ProductID are different types. The assignment should be an error.",
    reality:
      "Type Aliases are just NAMES for existing types. UserID and ProductID " +
      "are both string — TypeScript treats them identically (structural typing). " +
      "For nominal typing you need Branded Types.",
    concept: "Type Alias / Structural Typing",
    difficulty: 2,
  },

  {
    id: "08-interface-only-for-objects",
    title: "Interfaces Cannot Describe Functions",
    code: `// "Interface = objects only, type = for everything"
// So this can't work... or can it?
interface Formatter {
  (input: string): string;
}`,
    commonBelief:
      "Interfaces are only for object shapes. For function types you need type.",
    reality:
      "Interfaces CAN describe functions — using the call signature syntax. " +
      "interface Formatter { (input: string): string } is perfectly valid. " +
      "In practice type Formatter = (input: string) => string " +
      "is more common, but both work.",
    concept: "Interface Call Signature",
    difficulty: 2,
  },

  {
    id: "08-extends-equals-intersection",
    title: "extends and & Are Identical",
    code: `interface A { x: string; }

// Variant 1: extends
interface B1 extends A { x: number; }
// Compile error!

// Variant 2: &
type B2 = A & { x: number };
// No error — but x is never!`,
    commonBelief:
      "interface extends and type & are interchangeable — they do the same thing.",
    reality:
      "extends reports conflicts DIRECTLY as a compile error. & silently produces " +
      "never properties. extends is also faster " +
      "for the compiler (gets cached). For object inheritance " +
      "extends is safer.",
    concept: "extends vs & / Conflicts",
    difficulty: 3,
  },

  {
    id: "08-declaration-merging-is-bug",
    title: "Declaration Merging Is a Bug",
    code: `interface Window {
  myCustomProperty: string;
}

// Now window.myCustomProperty has type string!
window.myCustomProperty = "hello";`,
    commonBelief:
      "Two interfaces with the same name should produce an error. " +
      "Declaration Merging is an oversight by the TypeScript designers.",
    reality:
      "Declaration Merging is an INTENTIONAL feature. It enables " +
      "library augmentation: you can extend types from libraries " +
      "without changing their source code. Express.Request, Window, " +
      "process.env — all usable through Declaration Merging.",
    concept: "Declaration Merging / Module Augmentation",
    difficulty: 3,
  },

  {
    id: "08-implements-inherits",
    title: "implements Inherits Methods into the Class",
    code: `interface Serializable {
  serialize(): string;
}

class User implements Serializable {
  name = "Max";
  // serialize() should be there automatically... right?
}`,
    commonBelief:
      "implements inherits the interface's methods into the class, " +
      "similar to extends with classes.",
    reality:
      "implements inherits NOTHING. It is a pure compile-time check: " +
      "TypeScript verifies whether the class satisfies the interface shape. " +
      "Without your own serialize() implementation it is a compile error. " +
      "Inheritance only exists with extends (on classes).",
    concept: "implements / Compile-Time Check",
    difficulty: 2,
  },

  {
    id: "08-type-always-better",
    title: "type Is Always Better Than interface",
    code: `// "type can do everything interface can, and more.
// So you should ALWAYS use type."

type User = {
  name: string;
  age: number;
};`,
    commonBelief:
      "type can do everything interface can, plus Union, Mapped, Conditional Types. " +
      "Interface is superfluous.",
    reality:
      "Interfaces have advantages: (1) Declaration Merging for library augmentation, " +
      "(2) extends is faster and safer than &, (3) better error messages " +
      "on conflicts, (4) Angular and many teams prefer interfaces " +
      "for object types. There is no 'always better' — consistency matters.",
    concept: "type vs interface / Decision",
    difficulty: 2,
  },

  {
    id: "08-intersection-always-works",
    title: "Intersection Always Works as Expected",
    code: `type Admin = { role: "admin"; canDelete: true };
type User = { role: "user"; canDelete: false };
type AdminUser = Admin & User;

// What is AdminUser.role? What is AdminUser.canDelete?`,
    commonBelief:
      "AdminUser has role and canDelete from both types — " +
      "it is an 'Admin-and-User' at the same time.",
    reality:
      "role is 'admin' & 'user' = never. canDelete is true & false = never. " +
      "AdminUser is technically valid but no value can ever be assigned to it — " +
      "it is practically never. This is not an error for the compiler, " +
      "but a logical bug. Use Union (|) for variants.",
    concept: "Intersection Conflicts / Literal Types",
    difficulty: 4,
  },

  {
    id: "08-mapped-with-interface",
    title: "Mapped Types Work with Interface Too",
    code: `interface User {
  name: string;
  age: number;
  email: string;
}

// "I'll make all properties optional with Interface:"
interface PartialUser {
  [K in keyof User]?: User[K]; // Does this work?
}`,
    commonBelief:
      "Mapped Types should work inside interfaces too — " +
      "the syntax looks similar.",
    reality:
      "Mapped Types ([K in keyof T]) work ONLY with type. " +
      "Interfaces do not support Mapped Type syntax. " +
      "For Partial, Readonly, Pick etc. you must use type: " +
      "type PartialUser = Partial<User>;",
    concept: "Mapped Types / type-only Feature",
    difficulty: 3,
  },
];