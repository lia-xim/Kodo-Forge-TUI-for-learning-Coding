/**
 * Lesson 16 — Misconception Exercises: Mapped Types
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
    id: "16-modifier-stacking",
    title: "Modifiers can be stacked arbitrarily",
    code: `type DoubleOptional<T> = {
  [K in keyof T]+?+?: T[K]; // Double optional?
};`,
    commonBelief: "You can apply modifiers multiple times for a stronger effect.",
    reality:
      "Each modifier can only appear once per position. +? or -? — " +
      "that's all there is. Double ? is a syntax error. " +
      "Optional is binary: either yes or no.",
    concept: "Mapped Type Modifier",
    difficulty: 1,
  },
  {
    id: "16-mapped-runtime",
    title: "Mapped Types generate runtime code",
    code: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

// "Now getName() and getEmail() exist as functions"`,
    commonBelief: "Mapped Types automatically generate runtime implementations.",
    reality:
      "Mapped Types exist ONLY at the type level. They describe " +
      "the SHAPE of a type but generate no runtime code. " +
      "The implementation must be written separately. " +
      "TypeScript types are completely removed during compilation.",
    concept: "Type-Level vs Runtime",
    difficulty: 2,
  },
  {
    id: "16-never-value-vs-key",
    title: "never in the value type removes the property",
    code: `type RemoveStrings<T> = {
  [K in keyof T]: T[K] extends string ? never : T[K];
};

// Expected: Properties with string value disappear
// Reality: Properties remain but have type 'never'`,
    commonBelief: "never as a value type removes the property from the type.",
    reality:
      "never as a VALUE type makes the property unusable (nothing can " +
      "be assigned to never), but the property still EXISTS. " +
      "To remove properties you need never in KEY remapping: " +
      "`[K in keyof T as T[K] extends string ? never : K]`.",
    concept: "never in Key vs Value",
    difficulty: 3,
  },
  {
    id: "16-keyof-string-only",
    title: "keyof always returns string",
    code: `interface NumericKeys {
  0: 'zero';
  1: 'one';
  [Symbol.iterator]: () => Iterator<string>;
}

type Keys = keyof NumericKeys;
// Expected: "0" | "1" | "Symbol.iterator"
// Reality: 0 | 1 | typeof Symbol.iterator`,
    commonBelief: "keyof T always returns string keys.",
    reality:
      "keyof can return string, number AND symbol. " +
      "Array indices are number keys, symbols are symbol keys. " +
      "That's why you need `string & K` in Template Literal Types — " +
      "to ensure only string keys are used.",
    concept: "keyof Return Type",
    difficulty: 3,
  },
  {
    id: "16-deep-partial-functions",
    title: "DeepPartial also makes functions optional",
    code: `type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface Service {
  config: { timeout: number };
  process: (data: string) => void;
}

type DP = DeepPartial<Service>;
// process becomes DeepPartial<(data: string) => void> — broken!`,
    commonBelief: "DeepPartial works automatically correctly for all types.",
    reality:
      "Functions are also 'object' in TypeScript. Without a " +
      "function check, DeepPartial is applied recursively to functions " +
      "and produces nonsensical types. The solution: " +
      "`T[K] extends Function ? T[K] : DeepPartial<T[K]>` — " +
      "pass functions through, only process 'real' objects recursively.",
    concept: "Recursive Mapped Types / Function Guard",
    difficulty: 4,
  },
  {
    id: "16-homomorphic-misunderstanding",
    title: "All Mapped Types preserve modifiers",
    code: `type FromUnion = {
  [K in 'a' | 'b' | 'c']: string;
};
// No readonly, no optional — regardless of what the original had`,
    commonBelief: "Mapped Types always preserve readonly and optional from the source type.",
    reality:
      "Only HOMOMORPHIC Mapped Types (that use `keyof T` as source) " +
      "preserve modifiers. When the source is a string union instead of " +
      "keyof T, all modifiers are lost. " +
      "`[K in keyof T]` = homomorphic. `[K in 'a' | 'b']` = not homomorphic.",
    concept: "Homomorphic vs non-homomorphic Mapped Types",
    difficulty: 3,
  },
  {
    id: "16-conditional-key-vs-value",
    title: "Conditional in Key and in Value are the same",
    code: `// In KEY (filters properties):
type A<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };

// In VALUE (transforms type):
type B<T> = { [K in keyof T]: T[K] extends string ? K : never };

// A and B are VERY different!`,
    commonBelief: "It makes no difference whether the conditional is in the key or value.",
    reality:
      "Conditional in KEY (as-clause) FILTERS properties — never removes the key. " +
      "Conditional in VALUE transforms the type — never as value makes the property " +
      "unusable but it still exists. " +
      "A removes non-string properties. B keeps all properties but gives " +
      "non-string properties the type never.",
    concept: "Key Filtering vs Value Transformation",
    difficulty: 4,
  },
  {
    id: "16-mapped-type-widening",
    title: "Mapped Types prevent type widening",
    code: `type Exact<T> = { [K in keyof T]: T[K] };

const obj: Exact<{ name: string }> = {
  name: "Max",
  extra: "oops", // Error? No — Excess Property Check applies, NOT Mapped Type
};`,
    commonBelief: "Mapped Types prevent additional properties from being specified.",
    reality:
      "Excess Property Checking is a separate mechanism that applies to " +
      "direct object literals. Mapped Types alone do not prevent " +
      "additional properties in assignments from variables. " +
      "For strict 'exact types' there is no built-in mechanism in TypeScript yet " +
      "(as of TS 5.x).",
    concept: "Excess Property Checking vs Type System",
    difficulty: 4,
  },
];