/**
 * Lesson 18 — Quiz Data: Template Literal Types
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "18";
export const lessonTitle = "Template Literal Types";

export const questions: QuizQuestion[] = [
  { question: "What does `type T = \\`${A}${B}\\`` produce when A and B are unions?", options: ["A | B", "A & B", "The cartesian product of all combinations of A and B", "An error"], correct: 2, explanation: "Template Literal Types form the cartesian product. 2 values in A x 3 in B = 6 combinations." },
  { question: "What does Capitalize<'hello'> produce?", options: ["'HELLO'", "'Hello' (only first letter uppercase)", "'hello'", "'hELLO'"], correct: 1, explanation: "Capitalize only capitalizes the FIRST letter. Uppercase<T> makes EVERYTHING uppercase." },
  { question: "What does Uppercase<'hello'> produce?", options: ["'Hello'", "'hello'", "'hELLO'", "'HELLO' (all uppercase)"], correct: 3, explanation: "Uppercase converts ALL letters to uppercase." },
  { question: "What does `T extends \\`${infer P}_${string}\\` ? P : never` extract from 'user_name'?", options: ["'user'", "'user_name'", "'name'", "never"], correct: 0, explanation: "infer P matches everything BEFORE the first underscore. P = 'user'." },
  { question: "What does Split<'a.b.c', '.'> (recursive type) produce?", options: ["'a.b.c'", "'a' | 'b' | 'c'", "['a', 'b', 'c']", "['a.b.c']"], correct: 2, explanation: "Split recursively parses the string at the delimiter and produces a tuple." },
  { question: "What does `type T = \\`on${Capitalize<'click' | 'scroll'>}\\`` produce?", options: ["'onClick' | 'onScroll'", "'onclick' | 'onscroll'", "'onClick'", "'onClickScroll'"], correct: 0, explanation: "Capitalize capitalizes the first letter. Union expansion: 'onClick' | 'onScroll'." },
  { question: "What is `type CssLength = \\`${number}${'px' | 'em' | 'rem'}\\``?", options: ["Only number", "A string type that accepts numbers with CSS units: '100px', '2rem'", "Only string", "number | string"], correct: 1, explanation: "Template Literal with number produces strings like '100px', '2.5em', etc." },
  { question: "How do you extract route parameters from '/users/:id/posts/:postId'?", options: ["Regex", "Runtime parsing", "Not possible", "Recursive pattern matching with infer: :${infer Param}"], correct: 3, explanation: "Template Literal Types with infer can recursively extract ':param' patterns." },
  { question: "What does EventMap<T> with Key Remapping `${K}Changed` produce?", options: ["Generates change events for each property with previousValue/newValue", "Copies T", "Removes properties", "Makes everything optional"], correct: 0, explanation: "Template Literal in Key Remapping generates new event names: nameChanged, ageChanged, etc." },
  { question: "What is the difference between Capitalize and Uppercase?", options: ["No difference", "Capitalize: only 1st letter uppercase. Uppercase: ALL letters uppercase", "Capitalize: all uppercase. Uppercase: only 1st letter", "Capitalize for strings, Uppercase for numbers"], correct: 1, explanation: "Capitalize<'hello'> = 'Hello'. Uppercase<'hello'> = 'HELLO'. Important difference!" },
  { question: "Can Template Literal Types be used at runtime?", options: ["Yes", "Only in Node.js", "No — they only exist at compile time", "Only with as const"], correct: 2, explanation: "Like all TypeScript types, Template Literal Types are erased during compilation." },
  { question: "What does ReplaceAll<'a.b.c', '.', '/'> (recursive) produce?", options: ["'a.b/c'", "'a.b.c'", "Error", "'a/b/c' (all dots replaced)"], correct: 3, explanation: "ReplaceAll recursively replaces ALL occurrences. Replace (without All) only the first." },
  { question: "Why do you need `string & K` in Template Literal Keys?", options: ["Performance", "keyof can contain number/symbol — Template Literals need string", "Not needed", "Because K is always number"], correct: 1, explanation: "keyof T returns string | number | symbol. Template Literals only accept string. The intersection filters this." },
  { question: "What is `type SemVer = \\`${number}.${number}.${number}\\``?", options: ["A string type for semantic versioning: '1.2.3'", "An array", "A number", "An object"], correct: 0, explanation: "Template Literal with number produces string patterns like '1.0.0', '2.3.1', etc." },
  { question: "Which framework pattern uses Template Literal Types most often?", options: ["Array methods", "For loops", "Event handler names: on${Capitalize<EventName>}", "Import paths"], correct: 2, explanation: "React, Vue and other frameworks use on${Capitalize<>} for event props: onClick, onMouseMove, etc." },

  // ─── New question formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  {
    type: "short-answer",
    question: "Which built-in string utility type makes ALL letters uppercase?",
    expectedAnswer: "Uppercase",
    acceptableAnswers: ["Uppercase", "Uppercase<T>", "Uppercase<>"],
    explanation: "Uppercase<T> converts all letters to uppercase. Capitalize<T> only capitalizes the first letter — a common source of confusion.",
  },
  {
    type: "short-answer",
    question: "What is the result called when a Template Literal Type combines two union types? (mathematical term)",
    expectedAnswer: "cartesian product",
    acceptableAnswers: ["cartesian product", "Cartesian product", "cross product"],
    explanation: "Template Literal Types form the cartesian product of all union members. With 2 x 3 values, 6 string combinations are produced.",
  },
  {
    type: "predict-output",
    question: "What is the resulting type?",
    code: "type Result = `${'get' | 'set'}${Capitalize<'name' | 'age'>}`;",
    expectedAnswer: "'getName' | 'getAge' | 'setName' | 'setAge'",
    acceptableAnswers: ["'getName' | 'getAge' | 'setName' | 'setAge'", "getName | getAge | setName | setAge", "'getAge' | 'getName' | 'setAge' | 'setName'"],
    explanation: "Cartesian product: 2 prefixes x 2 capitalized names = 4 combinations. Capitalize capitalizes the first letter.",
  },
  {
    type: "predict-output",
    question: "What is the resulting type?",
    code: "type ExtractPrefix<T> = T extends `${infer P}_${string}` ? P : never;\ntype Result = ExtractPrefix<'user_name' | 'user_email' | 'order_id'>;",
    expectedAnswer: "'user' | 'order'",
    acceptableAnswers: ["'user' | 'order'", "user | order", "'order' | 'user'"],
    explanation: "infer P matches everything before the first underscore. Distributive over the union: 'user' (deduplicated 2x) | 'order'. Result: 'user' | 'order'.",
  },
  {
    type: "short-answer",
    question: "Which built-in utility type makes only the FIRST letter lowercase?",
    expectedAnswer: "Uncapitalize",
    acceptableAnswers: ["Uncapitalize", "Uncapitalize<T>", "Uncapitalize<>"],
    explanation: "Uncapitalize<T> is the counterpart to Capitalize<T>. It only lowercases the first letter; the rest remains unchanged.",
  },
  {
    type: "explain-why",
    question: "Why are Template Literal Types particularly valuable for typing framework APIs like React event handlers or Express routes?",
    modelAnswer: "Template Literal Types make it possible to give string-based APIs proper type safety that previously could only be typed as 'string'. In React, on${Capitalize<EventName>} automatically generates onClick, onMouseMove etc. with correct event types. In Express, route parameters like '/users/:id' can be statically extracted so that req.params.id is type-safe. This eliminates an entire class of runtime errors caused by typos in string-based APIs.",
    keyPoints: ["String-based APIs become type-safe instead of just 'string'", "Automatic generation of event handler names with correct types", "Static extraction of route parameters", "Typos are caught at compile time instead of runtime"],
  },
];

export interface ElaboratedFeedback { whyCorrect: string; commonMistake: string; }

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Cartesian product: every combination of A and B is formed.", commonMistake: "Expecting a union of A | B instead of the cartesian product." },
  1: { whyCorrect: "Capitalize only changes the first letter. The rest remains unchanged.", commonMistake: "Confusion with Uppercase (which changes ALL letters)." },
  2: { whyCorrect: "Uppercase converts every single letter to uppercase.", commonMistake: "Confusion with Capitalize (which only changes the first one)." },
  3: { whyCorrect: "infer P stands BEFORE the underscore — it matches everything up to the first _.", commonMistake: "Expecting the entire string to be extracted." },
  4: { whyCorrect: "Recursion: at each step a segment is split off until no delimiter remains.", commonMistake: "Forgetting the recursion — then only the first split is performed." },
  5: { whyCorrect: "Capitalize + Union = each member capitalized individually. Result is a union.", commonMistake: "Assuming unions are concatenated instead of processed individually." },
  6: { whyCorrect: "number in Template Literals produces string representations of numbers with an appended unit.", commonMistake: "Expecting the type to remain number. It is a string type!" },
  7: { whyCorrect: "Recursive infer pattern extracts :param segments from the path string.", commonMistake: "Attempting to use runtime regex instead of type-level parsing." },
  8: { whyCorrect: "Template Literal in Key Remapping generates new key names with the Changed suffix.", commonMistake: "Forgetting that the Mapped Type + Key Remapping combination is needed." },
  9: { whyCorrect: "Capitalize = first letter. Uppercase = all letters. Two different operations.", commonMistake: "Confusing the two. Mnemonic: Capitalize = Capital letter (one uppercase letter)." },
  10: { whyCorrect: "All TypeScript types are erased during compilation. Template Literal Types are no exception.", commonMistake: "Assuming string constraints are checked at runtime." },
  11: { whyCorrect: "Recursion: after each replacement it checks whether another occurrence exists.", commonMistake: "Forgetting that Replace without recursion only replaces the FIRST occurrence." },
  12: { whyCorrect: "keyof can contain number and symbol. Template Literals need string.", commonMistake: "Assuming keyof always returns only string." },
  13: { whyCorrect: "Template Literal with number generates string patterns for versions.", commonMistake: "Expecting a numeric type instead of a string type." },
  14: { whyCorrect: "on${Capitalize<>} is THE pattern for event props in React, Vue, etc.", commonMistake: "Thinking Template Literal Types are only academic — they are ubiquitous." },
};