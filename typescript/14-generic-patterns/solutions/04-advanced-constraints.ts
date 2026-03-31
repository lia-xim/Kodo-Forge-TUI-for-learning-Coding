/**
 * Lektion 14 - Solution 04: Advanced Constraints
 *
 * Ausfuehren mit: npx tsx solutions/04-advanced-constraints.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Conditional Return Type
// ═══════════════════════════════════════════════════════════════════════════

function serialize<T extends string | number | object>(value: T): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: DeepReadonly
// ═══════════════════════════════════════════════════════════════════════════

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};

interface Nested {
  a: { b: { c: string } };
  d: number[];
}

// Test: Alle Properties sind deep readonly
const deepObj: DeepReadonly<Nested> = {
  a: { b: { c: "hello" } },
  d: [1, 2, 3],
};
// deepObj.a.b.c = "world"; // Error! Cannot assign to 'c' because it is a read-only property
// deepObj.d.push(4);       // Error! Property 'push' does not exist on type 'readonly number[]'

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: TreeNode mit map()
// ═══════════════════════════════════════════════════════════════════════════

interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

function mapTree<T, U>(
  node: TreeNode<T>,
  fn: (value: T) => U
): TreeNode<U> {
  return {
    value: fn(node.value),
    children: node.children.map(child => mapTree(child, fn)),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: const Type Parameters
// ═══════════════════════════════════════════════════════════════════════════

function createAction<const T extends string>(type: T): { type: T } {
  return { type };
}

function defineEnum<const T extends readonly string[]>(
  values: T
): { [K in T[number]]: K } {
  const result = {} as { [K in T[number]]: K };
  for (const value of values) {
    (result as any)[value] = value;
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Mapped Constraint — Validator
// ═══════════════════════════════════════════════════════════════════════════

type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K]) => string | null;
};

function validate<T>(data: T, rules: ValidationRules<T>): string[] {
  const errors: string[] = [];

  for (const key in rules) {
    const rule = rules[key];
    if (rule) {
      const error = rule(data[key]);
      if (error) errors.push(error);
    }
  }

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

console.log("Serialize string:", serialize("hello"));    // "hello"
console.log("Serialize number:", serialize(42));          // "42"
console.log("Serialize object:", serialize({ a: 1 }));   // '{"a":1}'

console.log("\nDeepReadonly created (compile-time check)");

const numTree: TreeNode<number> = {
  value: 1,
  children: [
    { value: 2, children: [] },
    {
      value: 3,
      children: [{ value: 4, children: [] }],
    },
  ],
};

const stringTree = mapTree(numTree, n => `Node(${n})`);
console.log("\nMapTree:", JSON.stringify(stringTree, null, 2));

const inc = createAction("INCREMENT");
const dec = createAction("DECREMENT");
console.log("\nActions:", inc, dec);
// inc.type hat den Literal-Typ "INCREMENT" — nicht string

const directions = defineEnum(["UP", "DOWN", "LEFT", "RIGHT"] as const);
console.log("Enum:", directions);
// directions.UP === "UP", directions.DOWN === "DOWN", etc.

interface UserForm {
  name: string;
  age: number;
  email: string;
}

const errors = validate<UserForm>(
  { name: "", age: -5, email: "invalid" },
  {
    name: (v) => v.length === 0 ? "Name ist leer" : null,
    age: (v) => v < 0 ? "Alter darf nicht negativ sein" : null,
    email: (v) => !v.includes("@") ? "Keine gueltige Email" : null,
  }
);
console.log("\nValidation errors:", errors);
// ["Name ist leer", "Alter darf nicht negativ sein", "Keine gueltige Email"]

const noErrors = validate<UserForm>(
  { name: "Max", age: 30, email: "max@test.de" },
  {
    name: (v) => v.length === 0 ? "Name ist leer" : null,
    age: (v) => v < 0 ? "Alter darf nicht negativ sein" : null,
  }
);
console.log("No errors:", noErrors); // []

console.log("\n--- Alle Tests bestanden! ---");
