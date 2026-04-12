/**
 * Lesson 13 — Transfer Tasks: Generics Basics
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "13-generic-form-validator",
    title: "Generic Form Validator",
    prerequisiteLessons: [13],
    scenario:
      "You are building a form system for a web app. So far each form " +
      "has its own hand-written validator. The logic is always the same — " +
      "only the fields and rules differ. Pure code duplication.",
    task:
      "Create a generic validation system:\n\n" +
      "1. Define a generic interface ValidationRule<T> that knows the type of the " +
      "   form and defines rules per field\n" +
      "2. Write a generic validate<T> function that takes an object and " +
      "   rules and returns errors per field\n" +
      "3. Use keyof constraints so that only valid fields can be validated\n" +
      "4. Show how the same system works for User, Product, and Address forms",
    starterCode: [
      "// TODO: ValidationRule<T> Interface",
      "// TODO: ValidationErrors<T> Type",
      "// TODO: validate<T>() Function",
      "// TODO: Examples for different forms",
    ].join("\n"),
    solutionCode: [
      "// Validation rule for a single field",
      "interface FieldRule<T> {",
      "  required?: boolean;",
      "  minLength?: number;",
      "  maxLength?: number;",
      "  custom?: (value: T) => string | null;",
      "}",
      "",
      "// Rules for the entire form — only valid keys allowed!",
      "type ValidationRules<T> = {",
      "  [K in keyof T]?: FieldRule<T[K]>;",
      "};",
      "",
      "// Errors per field",
      "type ValidationErrors<T> = Partial<Record<keyof T, string[]>>;",
      "",
      "// Generic validation function",
      "function validate<T extends Record<string, unknown>>(data: T, rules: ValidationRules<T>): ValidationErrors<T> {",
      "  const errors: ValidationErrors<T> = {};",
      "",
      "  for (const key of Object.keys(rules) as (keyof T)[]) {",
      "    const rule = rules[key] as FieldRule<unknown> | undefined;",
      "    if (!rule) continue;",
      "    const value = data[key];",
      "    const fieldErrors: string[] = [];",
      "",
      "    if (rule.required && (value === undefined || value === null || value === '')) {",
      "      fieldErrors.push('Required field');",
      "    }",
      "    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {",
      "      fieldErrors.push(`At least ${rule.minLength} characters`);",
      "    }",
      "    if (rule.custom) {",
      "      const msg = rule.custom(value);",
      "      if (msg) fieldErrors.push(msg);",
      "    }",
      "    if (fieldErrors.length > 0) errors[key] = fieldErrors;",
      "  }",
      "  return errors;",
      "}",
      "",
      "// Usage for different forms:",
      "interface UserForm { name: string; email: string; age: number; }",
      "const userErrors = validate<UserForm>(",
      "  { name: '', email: 'bad', age: 15 },",
      "  { name: { required: true }, email: { custom: v => String(v).includes('@') ? null : 'Not a valid email' } }",
      ");",
    ].join("\n"),
    conceptsBridged: [
      "Generic functions with Record constraint",
      "keyof for type-safe field validation",
      "Mapped Types for rule objects",
      "One validator for all form types",
    ],
    hints: [
      "ValidationRules<T> uses keyof T as keys — so only valid fields are allowed.",
      "validate<T> takes both the data and the rules as T-dependent.",
      "The errors are Partial<Record<keyof T, string[]>> — not every field has errors.",
    ],
    difficulty: 4,
  },

  {
    id: "13-data-pipeline",
    title: "Generic Data Pipeline",
    prerequisiteLessons: [13],
    scenario:
      "Your data team processes CSV imports of various types: user data, " +
      "transactions, product catalogs. Each import has its own code for " +
      "parsing, validation, and transformation. The pipelines are identically " +
      "structured — only the types differ.",
    task:
      "Create a generic data pipeline:\n\n" +
      "1. Interface Pipeline<TInput, TOutput> with the steps parse, validate, transform\n" +
      "2. A generic pipe function that chains the steps together\n" +
      "3. Show how the same pipeline structure works for a User import and " +
      "   a Transaction import\n" +
      "4. Use generics so that type errors are caught when steps are chained incorrectly",
    starterCode: [
      "// TODO: PipelineStep<TIn, TOut> Interface",
      "// TODO: Pipeline<TRaw, TFinal> Builder",
      "// TODO: User Import Pipeline",
      "// TODO: Transaction Import Pipeline",
    ].join("\n"),
    solutionCode: [
      "interface PipelineStep<TIn, TOut> {",
      "  name: string;",
      "  execute(input: TIn): TOut;",
      "}",
      "",
      "function createPipeline<TIn, TOut>(steps: [PipelineStep<TIn, TOut>]): (input: TIn) => TOut;",
      "function createPipeline<TIn, TMid, TOut>(steps: [PipelineStep<TIn, TMid>, PipelineStep<TMid, TOut>]): (input: TIn) => TOut;",
      "function createPipeline(steps: PipelineStep<any, any>[]): (input: any) => any {",
      "  return (input) => steps.reduce((acc, step) => step.execute(acc), input);",
      "}",
      "",
      "// User pipeline: string[] -> RawUser -> ValidUser",
      "interface RawUser { name: string; ageStr: string; }",
      "interface ValidUser { name: string; age: number; }",
      "",
      "const parseUser: PipelineStep<string[], RawUser[]> = {",
      "  name: 'parse',",
      "  execute: (rows) => rows.map(r => {",
      "    const [name, ageStr] = r.split(',');",
      "    return { name, ageStr };",
      "  }),",
      "};",
    ].join("\n"),
    conceptsBridged: [
      "PipelineStep<TIn, TOut> for type-safe chaining",
      "Generics connect the output of one step to the input of the next",
      "Same pipeline structure for different data types",
      "Compile-time errors for incorrect step ordering",
    ],
    hints: [
      "PipelineStep<TIn, TOut> has execute(input: TIn): TOut — input and output are different types.",
      "The pipeline chains steps: output of step 1 = input of step 2.",
      "Generics ensure that types match between steps.",
    ],
    difficulty: 5,
  },

  {
    id: "13-generic-cache-with-ttl",
    title: "Generic Cache with TTL and Type-Safe Keys",
    prerequisiteLessons: [13],
    scenario:
      "Your app caches different data types: user profiles, API responses, " +
      "configurations. Each cache entry has a different type. Currently " +
      "you use Map<string, any> — get() always returns any. " +
      "Typos in keys are not caught.",
    task:
      "Create a type-safe cache:\n\n" +
      "1. Define a CacheMap as a generic interface that maps keys to types\n" +
      "2. Write a generic TypedCache class that makes get() and set() " +
      "   type-safe with keyof constraints\n" +
      "3. Implement TTL (Time-To-Live) per entry\n" +
      "4. Show how invalid keys and wrong value types are caught at compile time",
    starterCode: [
      "// TODO: CacheSchema Interface (defines which keys have which types)",
      "// TODO: TypedCache<TSchema> Class",
      "// TODO: get() and set() with keyof constraint",
      "// TODO: TTL mechanism",
    ].join("\n"),
    solutionCode: [
      "// Schema defines: key -> value type",
      "interface AppCache {",
      "  'user:profile': { name: string; age: number };",
      "  'config:theme': 'light' | 'dark';",
      "  'api:products': { id: number; title: string }[];",
      "}",
      "",
      "class TypedCache<TSchema extends Record<string, unknown>> {",
      "  private store = new Map<string, { value: unknown; expiresAt: number }>();",
      "",
      "  get<K extends keyof TSchema & string>(key: K): TSchema[K] | undefined {",
      "    const entry = this.store.get(key);",
      "    if (!entry) return undefined;",
      "    if (Date.now() > entry.expiresAt) {",
      "      this.store.delete(key);",
      "      return undefined;",
      "    }",
      "    return entry.value as TSchema[K];",
      "  }",
      "",
      "  set<K extends keyof TSchema & string>(key: K, value: TSchema[K], ttlMs = 60_000): void {",
      "    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });",
      "  }",
      "}",
      "",
      "const cache = new TypedCache<AppCache>();",
      "cache.set('user:profile', { name: 'Max', age: 30 });",
      "const profile = cache.get('user:profile'); // { name: string; age: number } | undefined",
      "// cache.set('user:profile', 'wrong'); // Error! string !== { name: string; age: number }",
      "// cache.get('unknown:key'); // Error! Not a valid key",
    ].join("\n"),
    conceptsBridged: [
      "Schema interface for type-safe key-value relationships",
      "keyof constraint for valid cache keys",
      "Indexed Access TSchema[K] for precise value types",
      "Generic class with schema parameter",
    ],
    hints: [
      "The schema interface defines: each key has a specific value type.",
      "get<K extends keyof TSchema>(key: K): TSchema[K] — the return type is precise per key.",
      "set<K extends keyof TSchema>(key: K, value: TSchema[K]) — value type is checked per key.",
    ],
    difficulty: 4,
  },
];