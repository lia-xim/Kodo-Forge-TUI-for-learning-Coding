/**
 * Lesson 42 — Quiz Data: TypeScript Security
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 *
 * correct-index distribution: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "42";
export const lessonTitle = "TypeScript Security";

export const questions: QuizQuestion[] = [
  // --- Question 1: Type Erasure and Security (correct: 0) ---
  {
    question:
      "Why can TypeScript not prevent an attack like the event-stream supply-chain hack of 2018?",
    options: [
      "TypeScript only checks at compile time — the malicious code ran at runtime with correct type signatures",
      "TypeScript does not support dependency scanning — tools like npm audit are needed for that",
      "The attack used JavaScript classes that TypeScript does not know and therefore cannot check",
      "TypeScript would have prevented it if strictMode had been enabled — strict checks block attacks",
    ],
    correct: 0,
    explanation:
      "The event-stream attack hid malicious code in encrypted data " +
      "with correct type signatures. TypeScript only checks compile-time structure — " +
      "the semantics (what the code actually does) remain invisible.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript is a compile-time tool. If types are correct " +
        "and the code is syntactically valid, TypeScript gives the green light — regardless of what " +
        "the code actually does at runtime. Security is a runtime concept.",
      commonMistake:
        "Many believe that 'strict: true' or stricter compiler options would " +
        "solve security problems. But strictMode checks types, not intentions.",
    },
  },

  // --- Question 2: Type Guard Mechanism (correct: 1) ---
  {
    question:
      "What does the type predicate `value is User` do in a function?",
    code:
      "function isUser(value: unknown): value is User {\n" +
      "  return typeof value === 'object' && value !== null\n" +
      "    && typeof (value as any).id === 'string';\n" +
      "}",
    options: [
      "It throws an error if value is not a User — the function acts like a runtime assertion",
      "TypeScript narrows the type of value to User when the function returns true",
      "It automatically converts value to the User type — the cast happens implicitly in the background",
      "It is only a documentation annotation with no effect on TypeScript — like a JSDoc comment",
    ],
    correct: 1,
    explanation:
      "A type predicate connects runtime checking with compile-time knowledge. " +
      "When isUser(x) is true, TypeScript knows inside the if-branch: x is User. " +
      "This is narrowing via a user-defined function.",
    elaboratedFeedback: {
      whyCorrect:
        "The type predicate (`value is User`) tells the compiler: " +
        "'If I return true, the type is User.' " +
        "TypeScript uses this for control-flow narrowing in the calling code.",
      commonMistake:
        "Many believe the type predicate automatically performs a cast " +
        "or throws an exception. Both are wrong — it is pure type information " +
        "for the compiler. What happens is entirely determined by the runtime logic of the function.",
    },
  },

  // --- Question 3: Parse vs. Validate (correct: 2) ---
  {
    question:
      "What is the main difference between the 'validate' approach (boolean) and the 'parse' approach (T | Error)?",
    options: [
      "Parse is faster because it does not produce a boolean — the type is returned directly",
      "Validate is safer because it explicitly communicates true/false — the boolean is clearer than a type",
      "With the validate approach, the knowledge 'valid' is separate from the object — it can be lost",
      "Parse and validate are functionally identical, only the naming differs",
    ],
    correct: 2,
    explanation:
      "An `isValid(x): boolean` function produces separate knowledge ('valid'). " +
      "This knowledge is lost after the if-block — you still have to cast. " +
      "A parse function `parseX(x): X` embodies the knowledge in the type itself.",
    elaboratedFeedback: {
      whyCorrect:
        "Alexis King's core argument: After `if (isValid(x)) { const v = x as T }` " +
        "TypeScript does not retain the knowledge. The cast is still necessary. " +
        "A parse function returns either T or an error — no intermediate state.",
      commonMistake:
        "Many think isValid + as cast is equivalent to parseT(). " +
        "The difference: with validate, 'as' is separate and can be forgotten. " +
        "With parse, the type is the result — it cannot be 'forgotten'.",
    },
  },

  // --- Question 4: Prototype Pollution (correct: 3) ---
  {
    question:
      "Why is `Object.assign({}, defaults, userInput)` dangerous with unvalidated userInput?",
    options: [
      "Because Object.assign copies deeper than one level and loses types that cannot be restored",
      "Because defaults can be overwritten if userInput has the same keys — this is a feature",
      "Because TypeScript cannot handle Object.assign in a type-safe way — it always returns any",
      "Because userInput could contain a __proto__ key that poisons Object.prototype",
    ],
    correct: 3,
    explanation:
      "Prototype Pollution: If userInput contains `{ '__proto__': { isAdmin: true } }`, " +
      "Object.prototype.isAdmin = true is set. After that, ALL objects " +
      "in the app have isAdmin: true. TypeScript does not see this — it is a runtime effect.",
    elaboratedFeedback: {
      whyCorrect:
        "Object.assign copies enumerable properties — including __proto__. " +
        "In some JavaScript engines, a __proto__ property sets the prototype of the target. " +
        "Using Object.create(null) as the target base prevents this: no prototype, no target.",
      commonMistake:
        "Many think defaults would 'protect' against the contents of userInput. " +
        "But Object.assign merges sequentially — userInput comes after defaults " +
        "and can overwrite everything, including prototype properties.",
    },
  },

  // --- Question 5: JSON.parse Security (correct: 0) ---
  {
    question:
      "What two problems does `JSON.parse(localStorage.getItem('config') || '{}') as AppConfig` have?",
    options: [
      "JSON.parse can throw a SyntaxError exception, and 'as AppConfig' does not validate the structure",
      "localStorage.getItem returns null, and JSON.parse does not accept null as input",
      "as AppConfig makes the value readonly, and later changes fail with a compile error",
      "JSON.parse is asynchronous and the as-cast does not await the result — race conditions can occur",
    ],
    correct: 0,
    explanation:
      "Problem 1: If localStorage contains an invalid JSON string (e.g. after corruption), " +
      "JSON.parse throws a SyntaxError exception — uncaught. " +
      "Problem 2: 'as AppConfig' is a promise, not a check — the structure is never validated.",
    elaboratedFeedback: {
      whyCorrect:
        "JSON.parse throws on invalid JSON — this is documented behavior. " +
        "The '|| {}' fallback only guards against null/undefined, not against " +
        "a corrupted JSON string. The as-cast tells the compiler 'I know better' — " +
        "but it checks nothing.",
      commonMistake:
        "Many think the `|| '{}'` fallback is sufficient error handling. " +
        "It guards against a missing key (null), but not against a broken value (a string " +
        "that is not valid JSON, e.g. after an interrupted write operation).",
    },
  },

  // --- Question 6: DomSanitizer (correct: 1) ---
  {
    question:
      "When is `DomSanitizer.bypassSecurityTrustHtml()` legitimate in Angular?",
    options: [
      "Always, when the HTML content comes from a trusted API — external sources are safe",
      "When the content was produced by your own code (e.g. your own Markdown renderer)",
      "Always, when DomSanitizer.sanitize() was called beforehand — bypass is then the second step",
      "When the user is an admin and is therefore considered trusted — admins cannot cause XSS",
    ],
    correct: 1,
    explanation:
      "bypassSecurityTrustHtml() is legitimate when YOU control the content: " +
      "your own renderer, static strings, your own server-side sanitized HTML. " +
      "It is NEVER legitimate with direct user input — not even after sanitize().",
    elaboratedFeedback: {
      whyCorrect:
        "The bypass disables Angular's XSS protection. This is only safe when " +
        "you as the developer know that the content contains no harmful HTML — " +
        "because you created it yourself. API responses are not considered 'trusted' " +
        "in this sense, since APIs can be compromised.",
      commonMistake:
        "Common mistake: calling sanitize(), then calling bypass() and thinking " +
        "'now it's safe'. sanitize() is the protection — bypass() afterwards is " +
        "pointless (sanitize has already cleaned) but also harmless. " +
        "The problem is bypass() WITHOUT a prior sanitize() on user input.",
    },
  },

  // --- Question 7: Non-null Assertion Risk (correct: 2) ---
  {
    question:
      "What is the problem with this Angular implementation?",
    code:
      "ngOnInit(): void {\n" +
      "  const ctx = this.canvas!.nativeElement.getContext('2d')!;\n" +
      "  ctx.fillRect(0, 0, 100, 100);\n" +
      "}",
    options: [
      "canvas must be declared as public to be accessible in ngOnInit — private properties are not visible",
      "getContext('2d') should have '2d' declared as a constant — literal types are unsafe here",
      "@ViewChild is not yet initialized in ngOnInit — this.canvas is undefined",
      "fillRect does not accept number parameters in TypeScript — they must be passed as strings",
    ],
    correct: 2,
    explanation:
      "@ViewChild is initialized by Angular in ngAfterViewInit, not in ngOnInit. " +
      "The ! (non-null assertion) suppresses the compile error — not the runtime crash. " +
      "Result: TypeError: Cannot read properties of undefined.",
    elaboratedFeedback: {
      whyCorrect:
        "Angular's component lifecycle: ngOnInit runs before the first render, " +
        "ngAfterViewInit runs after the view (including @ViewChild) has been rendered. " +
        "The ! promises the compiler that canvas is not null — a false promise " +
        "that explodes at runtime.",
      commonMistake:
        "The ! looks like a solution — no more red squiggles. " +
        "But it only defers the error. Correct fix: move the code to ngAfterViewInit, " +
        "or use canvas?.nativeElement?.getContext('2d') with a null check.",
    },
  },

  // --- Question 8: "Parse at the boundary" (correct: 3) ---
  {
    question:
      "According to the 'parse at the boundary' principle, where should runtime validation happen?",
    options: [
      "In every function that uses the data object — maximum safety through redundant checks",
      "Only in unit tests that specifically test validation — production code should trust types",
      "Deep in domain code — where the value is actually used, that is where the check is most meaningful",
      "Directly at the system boundary: API calls, localStorage, URL parameters — once, then trust",
    ],
    correct: 3,
    explanation:
      "Parse once at the system boundary. Afterwards the type itself carries the guarantee. " +
      "If you validate again deep in domain code, you have either placed the boundary incorrectly " +
      "or do not trust the single parse.",
    elaboratedFeedback: {
      whyCorrect:
        "The boundary is the transition between outside (untrusted) and " +
        "inside (your system). That is where checking happens. Afterwards all types are proven — " +
        "no further check needed. Validating multiple times means distrusting " +
        "your own code, not achieving security.",
      commonMistake:
        "Defensive programming is sometimes misunderstood as 'validate everywhere'. " +
        "The opposite is true: validate once thoroughly. Afterwards: the type is proof.",
    },
  },

  // ─── Short-Answer Questions ───────────────────────────────────────────────

  // --- Question 9: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the name of the principle from Alexis King's blog post (2019) that states: " +
      "transform unsafe inputs directly into typed values instead of checking them later?",
    expectedAnswer: "Parse, don't validate",
    acceptableAnswers: [
      "Parse, don't validate",
      "Parse dont validate",
      "parse don't validate",
      "Parse statt Validate",
      "parse not validate",
    ],
    explanation:
      "'Parse, don't validate' (Alexis King, 2019) describes the design principle of " +
      "transforming inputs directly into typed values instead of managing boolean truth values " +
      "separately from the object. The result of parsing is either the type " +
      "or an error — no third 'somehow validated' state.",
  },

  // --- Question 10: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What type does `JSON.parse()` return in TypeScript? " +
      "(Answer with the TypeScript type name)",
    expectedAnswer: "any",
    acceptableAnswers: ["any"],
    explanation:
      "JSON.parse() returns `any` — intentionally, because TypeScript cannot know at compile time " +
      "what the JSON contains. This is a signal: " +
      "immediately after JSON.parse() a runtime validation is needed.",
  },

  // --- Question 11: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the name of the attack where `{ '__proto__': { isAdmin: true } }` causes " +
      "all objects in a JavaScript app to receive an unexpected property?",
    expectedAnswer: "Prototype Pollution",
    acceptableAnswers: [
      "Prototype Pollution",
      "prototype pollution",
      "Prototyp-Vergiftung",
      "Prototypenvergiftung",
    ],
    explanation:
      "Prototype Pollution exploits JavaScript's prototype chain: " +
      "when __proto__ is assigned as a regular property, " +
      "some engines set the prototype of the target object. " +
      "Object.prototype is 'poisoned' — all subsequently created " +
      "objects inherit the harmful property.",
  },

  // --- Question 12: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which ESLint rule prevents `any` from being written explicitly in types and parameters? " +
      "Answer with the full rule name.",
    expectedAnswer: "@typescript-eslint/no-explicit-any",
    acceptableAnswers: [
      "@typescript-eslint/no-explicit-any",
      "no-explicit-any",
      "@typescript-eslint/no-explicit-any: error",
    ],
    explanation:
      "'@typescript-eslint/no-explicit-any' prevents explicit `any` in type annotations. " +
      "Combined with 'no-unsafe-assignment' and 'no-unsafe-member-access', " +
      "these three rules form an effective safety net against any-spreading.",
  },

  // ─── Predict-Output Questions ─────────────────────────────────────────────

  // --- Question 13: Predict-Output ---
  {
    type: "predict-output",
    question:
      "What does this code output? Type the output or 'ERROR' if it throws.",
    code:
      "function isProduct(v: unknown): v is { name: string; price: number } {\n" +
      "  if (typeof v !== 'object' || v === null) return false;\n" +
      "  const x = v as Record<string, unknown>;\n" +
      "  return typeof x['name'] === 'string' && typeof x['price'] === 'number';\n" +
      "}\n\n" +
      "const raw: unknown = { name: 'Laptop', preis: 999 };\n" +
      "if (isProduct(raw)) {\n" +
      "  console.log('Gueltig: ' + raw.name);\n" +
      "} else {\n" +
      "  console.log('Ungueltig');\n" +
      "}",
    expectedAnswer: "Ungueltig",
    acceptableAnswers: ["Ungueltig", "ungueltig"],
    explanation:
      "The object has 'preis' (German) instead of 'price' (English). " +
      "isProduct checks `x['price']` — that is undefined, not a number. " +
      "Therefore isProduct returns false and the else-branch executes. " +
      "That is exactly the point: the type guard catches the field name mismatch immediately.",
  },

  // --- Question 14: Predict-Output ---
  {
    type: "predict-output",
    question:
      "What does `result.ok` output?",
    code:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n\n" +
      "function parsePositiveNumber(v: unknown): Result<number, string> {\n" +
      "  if (typeof v !== 'number') return { ok: false, error: 'Kein number' };\n" +
      "  if (v <= 0) return { ok: false, error: 'Muss positiv sein' };\n" +
      "  return { ok: true, value: v };\n" +
      "}\n\n" +
      "const result = parsePositiveNumber(-5);\n" +
      "console.log(result.ok);",
    expectedAnswer: "false",
    acceptableAnswers: ["false"],
    explanation:
      "-5 is a number (first check passes), but not positive (v <= 0 is true). " +
      "The function returns { ok: false, error: 'Muss positiv sein' }. " +
      "result.ok is false.",
  },

  // --- Question 15: Predict-Output ---
  {
    type: "predict-output",
    question:
      "What happens when this code is executed? " +
      "Type 'no output', 'true', 'false', or 'ERROR'.",
    code:
      "const harmlos = {};\n" +
      "const boeseEingabe = JSON.parse('{\"__proto__\": {\"vergiftet\": true}}');\n" +
      "Object.assign(harmlos, boeseEingabe);\n" +
      "const neuesObjekt = {};\n" +
      "console.log((neuesObjekt as any).vergiftet);",
    expectedAnswer: "true",
    acceptableAnswers: ["true"],
    explanation:
      "Prototype Pollution in action: Object.assign copies __proto__ from boeseEingabe. " +
      "This sets the prototype of harmlos (and in some engines: Object.prototype). " +
      "neuesObjekt inherits from Object.prototype — and gets vergiftet: true. " +
      "TypeScript did not report a single error.",
  },

  // ─── Explain-Why Questions ────────────────────────────────────────────────

  // --- Question 16: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why is `const user = data as User` dangerous, but acceptable at the end of a " +
      "complete `parseUser()` function? " +
      "Explain the decisive difference.",
    modelAnswer:
      "Without a prior check, 'as User' is an assertion: the compiler " +
      "trusts you blindly, without anything having been verified. If data " +
      "is not actually a User, you get a silent error: TypeScript " +
      "thinks it is a User, but at runtime properties are missing or have " +
      "wrong types. At the end of parseUser(), on the other hand, you have checked all properties " +
      "individually: id is a string, name is a string, email contains '@'. " +
      "The 'as' reflects a proven fact, not a hope. " +
      "The principle: 'as' is safe when you have proven the invariant directly before it.",
    keyPoints: [
      "'as' without a check: assertion without proof",
      "'as' after a check: formalizing a proof",
      "TypeScript cannot see the difference — the responsibility lies with the developer",
      "Type guard (value is T) is the cleanest alternative that hides the 'as' internally",
      "The risk without a check: silent runtime errors instead of compile-time errors",
    ],
  },
];