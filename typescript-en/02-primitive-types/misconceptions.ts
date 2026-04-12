The file doesn't exist yet on disk — this is a translation task on provided source text. Here is the translated file:

```typescript
/**
 * Lektion 02 — Fehlkonzeption-Exercises: Primitive Types
 *
 * Code der "offensichtlich richtig" aussieht aber subtil falsch ist.
 * Der Lernende muss den Bug finden.
 */

export interface Misconception {
  id: string;
  title: string;
  /** Der "offensichtlich korrekte" Code */
  code: string;
  /** Was die meisten Leute denken */
  commonBelief: string;
  /** Was tatsaechlich passiert */
  reality: string;
  /** Welches Konzept getestet wird */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: typeof null ─────────────────────────────────────────────────────
  {
    id: "02-typeof-null",
    title: "typeof null returns 'null'",
    code: `function isNull(value: unknown): boolean {
  return typeof value === "null";
}

console.log(isNull(null));      // ???
console.log(isNull(undefined)); // ???`,
    commonBelief:
      "`typeof null` returns `\"null\"`, so you can use it " +
      "to check for null.",
    reality:
      "`typeof null` returns `\"object\"` — an infamous " +
      "bug from JavaScript 1.0 (1995) that was never fixed. " +
      "The function therefore always returns `false`, even for `null`! " +
      "Correct would be `value === null` (strict equality).",
    concept: "null / typeof-Bug",
    difficulty: 2,
  },

  // ─── 2: NaN Gleichheit ──────────────────────────────────────────────────
  {
    id: "02-nan-equality",
    title: "NaN equals NaN",
    code: `function isInvalid(value: number): boolean {
  return value === NaN;
}

const result = parseInt("hello");
console.log(isInvalid(result)); // ???`,
    commonBelief:
      "`NaN === NaN` is `true`, so you can use `=== NaN` " +
      "to check for invalid numbers.",
    reality:
      "`NaN === NaN` is `false`! NaN is the only value in JavaScript " +
      "that is NOT equal to itself. The function always returns `false`. " +
      "Correct: `Number.isNaN(value)` or `isNaN(value)`. " +
      "Alternatively: `value !== value` is only `true` for NaN.",
    concept: "number / NaN-Quirk",
    difficulty: 2,
  },

  // ─── 3: any und unknown austauschbar ────────────────────────────────────
  {
    id: "02-any-unknown-interchangeable",
    title: "any and unknown are interchangeable",
    code: `function processValue(value: unknown) {
  // "unknown ist wie any, aber moderner"
  console.log(value.toUpperCase());
  console.log(value.length);
  console.log(value + 1);
}`,
    commonBelief:
      "`unknown` and `any` are both the 'accepts everything' type " +
      "and can be used interchangeably.",
    reality:
      "This code does NOT compile! `unknown` allows any " +
      "assignment (just like `any`), but you can't do ANYTHING " +
      "with an `unknown` value without checking first. " +
      "No property access, no methods, no operations. " +
      "You must first do Type Narrowing (e.g. `typeof value === 'string'`). " +
      "That's the crucial safety advantage.",
    concept: "any vs unknown / Type Safety",
    difficulty: 2,
  },

  // ─── 4: String-Wrapper ──────────────────────────────────────────────────
  {
    id: "02-string-wrapper",
    title: "String and string are the same",
    code: `function greet(name: String) {
  return \`Hallo, \${name}!\`;
}

const username: string = "Max";
greet(username); // Funktioniert das?`,
    commonBelief:
      "`String` (uppercase) and `string` (lowercase) are " +
      "interchangeable in TypeScript — capitalization doesn't matter.",
    reality:
      "The code works by coincidence, but `String` (uppercase) is a " +
      "JavaScript wrapper object, not the primitive type. " +
      "The reverse does NOT work: `let x: string = new String('hello')` " +
      "throws an error. TypeScript warns: " +
      "'Don't use String as a type, use string instead'. " +
      "Rule of thumb: ALWAYS use lowercase.",
    concept: "Primitive vs. Wrapper Objects",
    difficulty: 1,
  },

  // ─── 5: void ist undefined ──────────────────────────────────────────────
  {
    id: "02-void-is-undefined",
    title: "void and undefined are the same",
    code: `function logMessage(msg: string): void {
  console.log(msg);
}

// "void gibt undefined zurueck, also kann ich es so verwenden:"
const result: undefined = logMessage("Hallo");`,
    commonBelief:
      "`void` and `undefined` are the same — a void function " +
      "returns `undefined`, so the type is `undefined`.",
    reality:
      "This code does NOT compile! `void` and `undefined` are different " +
      "types. `void` means 'the return value should be ignored', " +
      "not 'returns undefined'. At runtime a void function does actually " +
      "return `undefined`, but TypeScript treats the types differently. " +
      "You cannot assign `void` to `undefined`.",
    concept: "void vs undefined",
    difficulty: 3,
  },

  // ─── 6: Falsy-Pruefung fuer 0 ──────────────────────────────────────────
  {
    id: "02-falsy-zero",
    title: "|| as default for numbers",
    code: `interface ServerConfig {
  port: number;
  timeout: number;
}

function startServer(config: Partial<ServerConfig>) {
  const port = config.port || 3000;
  const timeout = config.timeout || 5000;
  console.log(\`Port: \${port}, Timeout: \${timeout}\`);
}

// Port 0 ist ein gueltiger Port (OS waehlt einen freien Port):
startServer({ port: 0, timeout: 0 });
// Erwartung: Port: 0, Timeout: 0`,
    commonBelief:
      "`config.port || 3000` only returns 3000 when `port` is " +
      "`undefined` or `null` — making it a perfect default value.",
    reality:
      "`||` checks for ALL falsy values: `0`, `''`, `false`, `null`, " +
      "`undefined`, `NaN`. Since `0` is falsy, `0 || 3000` returns " +
      "`3000` — even though `0` is a valid port! " +
      "Correct: `config.port ?? 3000` (Nullish Coalescing). " +
      "`??` checks ONLY for `null` and `undefined`.",
    concept: "Nullish Coalescing (??) vs. Logical OR (||)",
    difficulty: 2,
  },

  // ─── 7: never ist void ─────────────────────────────────────────────────
  {
    id: "02-never-is-void",
    title: "never and void are interchangeable",
    code: `function handleError(message: string): void {
  throw new Error(message);
}

function process(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else if (typeof value === "number") {
    console.log(value.toFixed(2));
  } else {
    // value ist hier never — alle Faelle sind abgedeckt
    handleError(\`Unerwarteter Typ: \${value}\`);
  }
}`,
    commonBelief:
      "The function `handleError` is correctly typed as `void` " +
      "because it doesn't return anything meaningful.",
    reality:
      "`handleError` should return `never`, not `void`. " +
      "A function that ALWAYS throws an error never returns. " +
      "The difference matters for Control Flow Analysis: " +
      "With `void` TypeScript thinks the code after the call " +
      "could continue running. With `never` TypeScript knows that " +
      "the path ends there — this improves Type Narrowing.",
    concept: "never vs void / Control Flow",
    difficulty: 4,
  },

  // ─── 8: Type Widening bei const-Objekten ────────────────────────────────
  {
    id: "02-const-object-widening",
    title: "const objects have literal types",
    code: `type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction) {
  console.log(\`Moving \${direction}\`);
}

const config = {
  startDirection: "north",
  speed: 10,
};

move(config.startDirection);`,
    commonBelief:
      "Since `config` is declared with `const`, " +
      '`config.startDirection` retains the literal type `"north"` — ' +
      "just like with `const x = 'north'`.",
    reality:
      "The code generates a compiler error! `const` only protects " +
      "the variable itself from reassignment, not the properties. " +
      "You could write `config.startDirection = 'banana'`. " +
      "That's why `startDirection` is widened to `string`, " +
      "and `string` doesn't match `Direction`. " +
      'Solution: `as const` or explicit annotation: `startDirection: "north" as const`.',
    concept: "Type Widening / const vs. as const",
    difficulty: 3,
  },
];
```

**Translation notes:**

- All `code` template literals left untouched (including German comments inside them like `// "unknown ist wie any, aber moderner"`)
- JSDoc and section comments left untouched (not string values)
- `"NaN-Besonderheit"` → `"NaN-Quirk"` (natural English equivalent)
- `"Primitive vs. Wrapper-Objekte"` → `"Primitive vs. Wrapper Objects"`
- `"null / typeof-Bug"` kept as-is (technical term)
- All other `concept` strings were already in English