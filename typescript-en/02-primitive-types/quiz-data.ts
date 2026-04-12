```typescript
/**
 * Lesson 02 — Quiz Data: Primitive Types
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "02";
export const lessonTitle = "Primitive Types";

export const questions: QuizQuestion[] = [
  // --- Question 1: Basics ---
  {
    question: "Which type should you use in TypeScript for a text value?",
    options: [
      "String (uppercase)",
      "string (lowercase)",
      "str",
      "text",
    ],
    correct: 1,
    explanation:
      "Always use 'string' (lowercase). 'String' (uppercase) is a " +
      "wrapper object from JavaScript and leads to subtle bugs. The rule " +
      "also applies to number/Number and boolean/Boolean.",
  },

  // --- Question 2: number precision ---
  {
    question: "What is the result of 0.1 + 0.2 === 0.3 in TypeScript?",
    options: [
      "true",
      "false",
      "Compile Error",
      "undefined",
    ],
    correct: 1,
    explanation:
      "false! Due to IEEE 754 floating-point arithmetic, 0.1 + 0.2 yields " +
      "0.30000000000000004, not exactly 0.3. This is not a TypeScript problem, " +
      "but a fundamental issue with floating-point representation.",
    code: "const ergebnis = 0.1 + 0.2 === 0.3;\nconsole.log(ergebnis); // ???",
  },

  // --- Question 3: null vs undefined ---
  {
    question: "What does typeof null return in JavaScript/TypeScript?",
    options: [
      '"null"',
      '"undefined"',
      '"object"',
      '"NaN"',
    ],
    correct: 2,
    explanation:
      '"object" — this is a notorious bug from the early days of ' +
      "JavaScript (1995). It was never fixed because too much existing code " +
      'depends on it. typeof undefined, however, correctly returns "undefined".',
  },

  // --- Question 4: any vs unknown — assignment ---
  {
    question: "Which assignment causes a TypeScript error?",
    options: [
      "let a: any = \"hallo\"; let b: string = a;",
      "let a: unknown = \"hallo\"; let b: string = a;",
      "let a: unknown = 42; let b: any = a;",
      "let a: any = true; let b: unknown = a;",
    ],
    correct: 1,
    explanation:
      "unknown CANNOT be directly assigned to another type — " +
      "you must check first (type narrowing). any, on the other hand, can be " +
      "assigned anywhere (unsafe!). unknown → any and any → unknown are OK.",
    code: 'let a: unknown = "hallo";\nlet b: string = a; // Error?',
  },

  // --- Question 5: any is contagious ---
  {
    question: "What is the type of 'ergebnis' in this code?",
    options: [
      "string",
      "number",
      "any",
      "unknown",
    ],
    correct: 2,
    explanation:
      "any is contagious! If quelle is 'any', then quelle.name is also 'any', " +
      "and name.length is also 'any', and laenge + 1 is also 'any'. " +
      "The entire chain loses type safety. This is one of the main reasons " +
      "to avoid any.",
    code:
      "let quelle: any = { name: \"Max\" };\n" +
      "let name = quelle.name;\n" +
      "let laenge = name.length;\n" +
      "let ergebnis = laenge + 1;",
  },

  // --- Question 6: never type ---
  {
    question: "Which return type fits this function?",
    options: [
      "void",
      "undefined",
      "never",
      "any",
    ],
    correct: 2,
    explanation:
      "never, because the function NEVER returns — it always throws an error. " +
      "void means 'returns nothing meaningful', but the function still returns. " +
      "never means 'NEVER returns'.",
    code:
      "function fail(msg: string): ??? {\n" +
      "  throw new Error(msg);\n" +
      "}",
  },

  // --- Question 7: void vs undefined ---
  {
    question: "Which statement about void is CORRECT?",
    options: [
      "void and undefined are the same",
      "A void function may not have a return statement",
      "Callbacks with void type may still return values",
      "void can be assigned null",
    ],
    correct: 2,
    explanation:
      "Callbacks typed as void may return values — " +
      "they are simply ignored. That's why, for example, " +
      "arr.forEach(v => arr.push(v)) works, even though push returns a number " +
      "and forEach expects (value) => void.",
  },

  // --- Question 8: Type hierarchy ---
  {
    question: "Which statement about the TypeScript type hierarchy is CORRECT?",
    options: [
      "any is the top type",
      "unknown is the bottom type",
      "never is assignable to every type",
      "never is not assignable to any type",
    ],
    correct: 2,
    explanation:
      "never (bottom type) is assignable to every type — because a never value " +
      "never exists, the assignment is always 'safe'. unknown is the top type " +
      "(not any!). any breaks the rules and is neither top nor bottom. " +
      "Option D is wrong: never IS assignable to every type (that's why C is correct).",
  },

  // --- Question 9: Nullish Coalescing ---
  {
    question: "What is the difference between || and ?? ?",
    options: [
      "No difference, both are the same",
      "|| checks for null/undefined, ?? checks for all falsy values",
      "?? only checks for null/undefined, || checks for all falsy values",
      "?? only works with strings",
    ],
    correct: 2,
    explanation:
      "?? (Nullish Coalescing) returns the right-hand value only for null or undefined. " +
      "|| (logical OR) returns the right-hand value for ALL falsy values " +
      "(0, \"\", false, null, undefined, NaN). So 0 ?? 42 = 0, but 0 || 42 = 42.",
    code: "const a = 0 || 42;   // ???\nconst b = 0 ?? 42;   // ???",
  },

  // --- Question 10: Symbol ---
  {
    question: "What is the result of this comparison?",
    options: [
      "true, because both have the same description",
      "false, because every Symbol is unique",
      "Compile Error",
      "undefined",
    ],
    correct: 1,
    explanation:
      "Every Symbol created with Symbol() is UNIQUE — even if the " +
      "description is identical. The description is only for debugging. " +
      "If you need the same symbol, you must use Symbol.for(): " +
      "Symbol.for('id') === Symbol.for('id') would be true.",
    code:
      'const a = Symbol("id");\n' +
      'const b = Symbol("id");\n' +
      "console.log(a === b); // ???",
  },

  // --- Question 11: Type Widening ---
  {
    question: "What type does the variable 'x' have in this code?",
    options: [
      'string',
      '"hallo"',
      'unknown',
      'any',
    ],
    correct: 1,
    explanation:
      'const variables with primitive values get a LITERAL TYPE. ' +
      'Because const can never change, TypeScript knows: x is EXACTLY "hallo" ' +
      'and nothing else. With "let x = \'hallo\'" the type would be "string", ' +
      'because let could change. This is called type widening.',
    code: 'const x = "hallo";\n// Was ist der Typ von x?',
  },

  // --- Question 12: Type Widening with objects ---
  {
    question: "Why does this assignment NOT compile?",
    options: [
      'Because "GET" is not a valid string',
      'Because method is inferred as string (type widening with let)',
      'Because const objects cannot be modified',
      'Because config.method is readonly',
    ],
    correct: 1,
    explanation:
      'Even though config is declared with "const", the PROPERTIES of an ' +
      'object are mutable (you could write config.method = "POST"). ' +
      'Therefore TypeScript infers method as "string" (wide), not as "GET" ' +
      '(literal). The fix: "as const" on the value or an explicit type annotation.',
    code:
      'type HttpMethod = "GET" | "POST";\n' +
      'const config = { method: "GET" };\n' +
      'function send(m: HttpMethod) {}\n' +
      'send(config.method); // Error!',
  },

  // --- Question 13: Type Erasure ---
  {
    question: "What happens to TypeScript types at runtime?",
    options: [
      "They are converted into JavaScript classes",
      "They are kept as comments in the code",
      "They are completely removed (type erasure)",
      "They are converted into typeof checks",
    ],
    correct: 2,
    explanation:
      "TypeScript types exist ONLY at compile time. During compilation, " +
      "ALL type annotations, interfaces and type aliases are removed. What remains " +
      "is plain JavaScript. This is called type erasure. That's why " +
      "you can't write 'if (x instanceof MyInterface)' — interfaces " +
      "don't exist at runtime.",
  },

  // --- Question 14: ?? vs || trap ---
  {
    question: "What is the value of 'port' in this code?",
    options: [
      "0",
      "3000",
      "undefined",
      "NaN",
    ],
    correct: 1,
    explanation:
      "The || operator checks for ALL falsy values (0, '', false, null, undefined, NaN). " +
      "Because 0 is falsy, || returns the right-hand value: 3000. " +
      "With ?? the result would be 0, because ?? ONLY checks for null and undefined. " +
      "This is a classic bug with port numbers and counts!",
    code:
      "const config = { port: 0 };\n" +
      "const port = config.port || 3000;\n" +
      "// port = ???",
  },

  // --- Question 15: as const ---
  {
    question: "What is the type of 'farben' in this code?",
    options: [
      'string[]',
      '("rot" | "gruen" | "blau")[]',
      'readonly ["rot", "gruen", "blau"]',
      'readonly string[]',
    ],
    correct: 2,
    explanation:
      '"as const" does three things: (1) The array becomes readonly, ' +
      '(2) all elements get literal types, and (3) the length is fixed. ' +
      'The type is therefore a readonly tuple with exactly three literal elements. ' +
      'Without "as const" the type would just be string[]. ' +
      'With "typeof farben[number]" you can derive the union type "rot" | "gruen" | "blau" from it.',
    code: 'const farben = ["rot", "gruen", "blau"] as const;',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // New Formats: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 16: Short-Answer — typeof null ---
  {
    type: "short-answer",
    question: "What does typeof null return in JavaScript?",
    expectedAnswer: "object",
    acceptableAnswers: ["object", "'object'", "\"object\""],
    explanation:
      "typeof null === 'object' is a notorious bug from the early days " +
      "of JavaScript (1995). In the first JS implementation, values were stored as " +
      "a type tag + value. null had the tag 0 (like objects), hence 'object'. " +
      "The bug was never fixed because too much existing code depends on it.",
  },

  // --- Question 17: Short-Answer — Bottom Type ---
  {
    type: "short-answer",
    question: "Which TypeScript type is the bottom type that is assignable to every other type?",
    expectedAnswer: "never",
    acceptableAnswers: ["never", "Never"],
    explanation:
      "never is the bottom type in TypeScript. A never value never exists — " +
      "therefore it is trivially assignable to every type (you cannot assign " +
      "something that doesn't exist). never arises in functions that never return " +
      "(throw, infinite loop) and in impossible branches in control flow.",
  },

  // --- Question 18: Short-Answer — Nullish Coalescing ---
  {
    type: "short-answer",
    question: "Which operator checks ONLY for null and undefined (not other falsy values like 0 or '')?",
    expectedAnswer: "??",
    acceptableAnswers: ["??", "Nullish Coalescing", "nullish coalescing", "Nullish Coalescing Operator"],
    explanation:
      "The ?? (Nullish Coalescing) operator returns the right-hand value only for null or undefined. " +
      "Unlike ||, the values 0, '' and false are NOT treated as 'empty'. " +
      "Therefore: 0 ?? 42 = 0, but 0 || 42 = 42.",
  },

  // --- Question 19: Predict-Output — Falsy trap ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: `const count = 0;\nconst display = count || "keine";\nconsole.log(display);`,
    expectedAnswer: "keine",
    acceptableAnswers: ["keine", "'keine'", "\"keine\""],
    explanation:
      "The || operator checks for ALL falsy values. 0 is falsy, so || " +
      "returns the right-hand value: 'keine'. This is a classic bug — with " +
      "?? the result would be 0, because 0 is neither null nor undefined.",
  },

  // --- Question 20: Predict-Output — any contagion ---
  {
    type: "predict-output",
    question: "What is the type of 'result' as inferred by TypeScript? (Give the type name)",
    code: `let data: any = { value: 42 };\nlet result = data.value + 1;`,
    expectedAnswer: "any",
    acceptableAnswers: ["any"],
    explanation:
      "any is contagious! data is any, so data.value is also any, " +
      "and any + 1 is any again. The entire chain loses type safety. " +
      "At runtime the result would be 43 (number), but TypeScript only sees 'any'. " +
      "This shows why you should avoid any — it undermines the entire type system.",
  },

  // --- Question 21: Explain-Why — string vs String ---
  {
    type: "explain-why",
    question: "Why should you use 'string' (lowercase) instead of 'String' (uppercase) in TypeScript?",
    modelAnswer:
      "'string' is the primitive type in TypeScript/JavaScript. 'String' (uppercase) is a " +
      "wrapper object (new String('x')) that causes subtle bugs. typeof new String('x') " +
      "returns 'object', not 'string'. Additionally, 'string' is not assignable to 'String' " +
      "in strict mode. The same rule applies to number/Number and boolean/Boolean.",
    keyPoints: [
      "string (lowercase) = primitive type, String (uppercase) = wrapper object",
      "typeof new String('x') === 'object', not 'string'",
      "Wrapper objects cause subtle comparison bugs",
      "Same rule for number/Number and boolean/Boolean",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Additional explanations for each question: why the correct answer
// is correct and which misconception is most common.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "`string` (lowercase) is the primitive type in TypeScript. " +
      "`String` (uppercase) is a JavaScript wrapper object that causes subtle bugs: " +
      "`typeof new String('x')` returns 'object', not 'string'.",
    commonMistake:
      "Coming from Java or C#, many write `String` uppercase. " +
      "In TypeScript/JavaScript that is the wrapper object type — " +
      "ALWAYS use lowercase: string, number, boolean.",
  },
  1: {
    whyCorrect:
      "IEEE 754 floating point: 0.1 and 0.2 cannot be represented exactly in binary. " +
      "Their sum is 0.30000000000000004. This applies to ALL languages with IEEE 754 " +
      "(JavaScript, Python, Java, C++, etc.).",
    commonMistake:
      "Many think this is a JavaScript or TypeScript bug. " +
      "It is a fundamental problem of floating-point representation that occurs in almost " +
      "every programming language. Solution: for monetary amounts, use integer arithmetic (cents).",
  },
  2: {
    whyCorrect:
      "`typeof null` returns `\"object\"` — a bug from JavaScript 1.0 (1995). " +
      "In the first JS implementation, values were stored as a type tag + value. " +
      "null had the tag 0 (like objects), hence 'object'.",
    commonMistake:
      "Almost everyone expects `\"null\"`. This bug is so old and well-known " +
      "that it has become a 'feature' — it will never be fixed " +
      "because too much existing code depends on it.",
  },
  3: {
    whyCorrect:
      "`unknown` CANNOT be directly assigned to a specific type. " +
      "You must first perform type narrowing (e.g., typeof check). " +
      "This is the core difference from `any`, which bypasses all checks.",
    commonMistake:
      "Many confuse the assignment direction: " +
      "EVERYTHING can be assigned to `unknown` (receiving), but `unknown` " +
      "CANNOT be assigned to specific types (passing on) — " +
      "without prior checking.",
  },
  4: {
    whyCorrect:
      "`any` is contagious: every expression derived from an `any` value " +
      "is again `any`. The entire chain loses type safety. " +
      "This is the main reason why `any` is so dangerous.",
    commonMistake:
      "Many think TypeScript would infer the type `string` for `quelle.name`, " +
      "because at runtime there actually is a string in there. " +
      "But TypeScript only sees the DECLARED type (`any`), not the runtime value.",
  },
  5: {
    whyCorrect:
      "`never` means 'NEVER returns'. The function ALWAYS throws an error — " +
      "it never reaches the end. `void` means 'returns nothing meaningful', " +
      "but the function still returns.",
    commonMistake:
      "The most common mistake: confusing `void` and `never`. `void` = returns " +
      "(with undefined). `never` = NEVER returns (throw, infinite loop).",
  },
  6: {
    whyCorrect:
      "Callbacks with a void return type may return values — they are simply ignored. " +
      "That's why `arr.forEach(v => arr.push(v))` works: push returns a number, " +
      "but forEach expects void — and that's OK.",
    commonMistake:
      "Many think void callbacks may NOT return any value. " +
      "But that would break many common patterns. " +
      "void as a callback return type means: 'I don't care what you return.'",
  },
  7: {
    whyCorrect:
      "`never` (bottom type) is assignable to every type — this is logically correct, " +
      "because a never value never exists. You cannot assign something that never exists. " +
      "`unknown` is the top type (not `any`!). `any` breaks the type rules.",
    commonMistake:
      "Most people think `any` is the top type. `any` is neither top nor bottom — " +
      "it is a 'cheat code' that bypasses the type hierarchy. " +
      "`unknown` is the true top type.",
  },
  8: {
    whyCorrect:
      "`??` (Nullish Coalescing) returns the right-hand value ONLY for null or undefined. " +
      "`||` returns the right-hand value for ALL falsy values (0, '', false, null, undefined, NaN). " +
      "Therefore: 0 ?? 42 = 0, but 0 || 42 = 42.",
    commonMistake:
      "Many habitually use `||` for default values. " +
      "It often works, but breaks with 0, '' or false. " +
      "The classic bug: `port || 3000` returns 3000 even when port is 0.",
  },
  9: {
    whyCorrect:
      "Every symbol created with `Symbol()` is UNIQUE. The description " +
      "is only for debugging — it does not make symbols equal. " +
      "`Symbol.for('id')` would return a shared symbol from the global registry.",
    commonMistake:
      "Intuition: 'Same description = same value'. " +
      "For strings that's true, for symbols it's not. " +
      "Uniqueness is the entire point of symbols.",
  },
  10: {
    whyCorrect:
      "const variables with primitive values get a literal type. " +
      "Since `const x` can never change, TypeScript knows: x is EXACTLY \"hallo\" " +
      "and nothing else. With `let` the type would be `string` (widening).",
    commonMistake:
      "Many expect `string`, because 'string is the type of text values'. " +
      "But the literal type `\"hallo\"` is more PRECISE — and with const, precision is possible.",
  },
  11: {
    whyCorrect:
      "Even though `config` is declared with const, object properties are mutable. " +
      "You could write `config.method = 'POST'`. Therefore TypeScript widens " +
      "the type of `method` to `string`, not `\"GET\"`. This is property widening.",
    commonMistake:
      "Almost everyone expects const to also 'freeze' the properties. " +
      "const only protects the variable (no reassignment of the object), " +
      "not its contents. Fix: `as const` or Object.freeze().",
  },
  12: {
    whyCorrect:
      "ALL TypeScript types are removed during compilation (type erasure). " +
      "Interfaces, type aliases, generics, type annotations — all gone. " +
      "At runtime everything is plain JavaScript.",
    commonMistake:
      "Some think types are converted into typeof checks or comments. " +
      "No — they are COMPLETELY removed. No trace remains.",
  },
  13: {
    whyCorrect:
      "`||` checks for ALL falsy values. Since 0 is falsy, `0 || 3000` returns 3000. " +
      "With `??` the result would be 0, because 0 is neither null nor undefined. " +
      "The classic port bug!",
    commonMistake:
      "Many see `config.port || 3000` as a safe default value. " +
      "It works — except when port is intentionally 0 (OS picks a free port). " +
      "ALWAYS use `??` for numeric and boolean defaults.",
  },
  14: {
    whyCorrect:
      "`as const` does three things: (1) readonly array, (2) literal types for elements, " +
      "(3) fixed length (tuple). The type is `readonly [\"rot\", \"gruen\", \"blau\"]`. " +
      "With `typeof farben[number]` you get the union `\"rot\" | \"gruen\" | \"blau\"`.",
    commonMistake:
      "Some think `as const` only makes things readonly. " +
      "The literal type preservation and the tuple conversion " +
      "are often overlooked — but they are the real main benefit.",
  },
};
```