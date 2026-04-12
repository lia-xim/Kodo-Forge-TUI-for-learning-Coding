// quiz-data.ts — L26: Advanced Patterns (Builder, State Machine, Phantom Types)
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Questions
// MC correct-index distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "26";
export const lessonTitle = "Advanced Patterns";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Questions, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Question 1: Builder Pattern — correct: 0 ---
  {
    question: "What is the main advantage of a type-safe builder over a classic builder?",
    options: [
      "Required fields are checked at compile time, not at runtime",
      "It generates faster JavaScript code through optimized compiler generation",
      "It requires less memory than a classic builder at runtime",
      "It only works with classes, not with functions or factory patterns",
    ],
    correct: 0,
    explanation:
      "The type-safe builder uses generics as 'memory' to track which fields have been set. " +
      "build() only becomes available when all required fields are included in the generic set. " +
      "The classic builder only checks this at runtime.",
    elaboratedFeedback: {
      whyCorrect: "Generics accumulate information: Each method call adds a type to the set. build() has a 'this' parameter that requires all required fields. If one is missing → Compile-Error.",
      commonMistake: "Many think the advantage is performance. No — the entire type overhead disappears at runtime (Type Erasure). The advantage is purely compile-time safety."
    }
  },

  // --- Question 2: State Machine — correct: 0 ---
  {
    question: "Why are boolean flags for state an antipattern?",
    options: [
      "n booleans create 2^n combinations, most of which are invalid",
      "Booleans are slower than strings in JavaScript and impact performance",
      "TypeScript cannot use booleans in switch statements and shows an error",
      "Boolean flags require more memory than discriminated unions at runtime",
    ],
    correct: 0,
    explanation:
      "4 boolean flags = 16 combinations. Typical states: idle, loading, success, error = 4. " +
      "12 of 16 combinations are invalid. A discriminated union allows exactly the 4 valid ones.",
    elaboratedFeedback: {
      whyCorrect: "The problem is combinatorial explosion: Each boolean doubles the number of possible states. Discriminated unions model exactly the valid states — no more, no less.",
      commonMistake: "Common mistake: treating 'isLoading && isError' as valid. Loading AND error at the same time? That makes no sense — but booleans allow it."
    }
  },

  // --- Question 3: Phantom Types — correct: 0 ---
  {
    question: "What happens to the __phantom property of a phantom type at runtime?",
    options: [
      "It does not exist — Type Erasure removes it completely",
      "It is stored as an undefined property and consumes minimal memory",
      "It is converted to a symbol that is not enumerable at runtime",
      "It is stored as metadata in the prototype and is accessible via reflection",
    ],
    correct: 0,
    explanation:
      "Phantom types use TypeScript's Type Erasure as a feature: The __phantom property " +
      "only exists in the type system, not at runtime. No runtime overhead.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript removes all type annotations during compilation. The __phantom property is part of the type definition, not the value. At runtime, a Phantom<string, 'Email'> is simply a normal string.",
      commonMistake: "Some think the intersection type (&) actually adds properties to the value. No — & is a type operation, not a value operation."
    }
  },

  // --- Question 4: Fluent API — correct: 0 ---
  {
    question: "What is the advantage of step interfaces over simple 'return this' in method chaining?",
    options: [
      "Step interfaces enforce the correct order — impossible calls do not exist in the type",
      "Step interfaces are faster than 'return this' because they generate fewer method calls",
      "Step interfaces enable inheritance while 'return this' does not support it",
      "Step interfaces are the only way to implement method chaining in TypeScript",
    ],
    correct: 0,
    explanation:
      "With step interfaces, each step only shows the methods allowed in the current state. " +
      "IDE autocomplete only shows valid next steps. Impossible calls are not a runtime error — " +
      "they simply do not exist in the type.",
    elaboratedFeedback: {
      whyCorrect: "SelectStep only has select(). FromStep only has from(). WhereOrBuildStep has where(), orderBy() and build(). Each step returns the next step type — not 'this' with all methods.",
      commonMistake: "Many think 'return this' is always enough. For internal APIs yes — but for public APIs step interfaces are more valuable, because the IDE shows the user what is possible next."
    }
  },

  // --- Question 5: Newtype — correct: 1 ---
  {
    question: "What is a 'Smart Constructor' in the newtype pattern?",
    options: [
      "A constructor that automatically infers generics and adopts the type of the input",
      "A function that validates the raw value and returns it as a newtype",
      "A TypeScript decorator that validates and extends class constructors",
      "A special compiler mode for branded types that activates strict checks",
    ],
    correct: 1,
    explanation:
      "A Smart Constructor validates the raw value and returns it as a newtype. " +
      "It is the ONLY official way to create the newtype. Without validation one could " +
      "cast invalid values as the newtype.",
    elaboratedFeedback: {
      whyCorrect: "function UserId(raw: string): UserId { validate(raw); return raw as UserId; } — the Smart Constructor encapsulates the unsafe 'as' cast behind a validation. Other modules only use the Smart Constructor.",
      commonMistake: "Many bypass the Smart Constructor with 'as UserId' directly in code. This undermines the validation. In code reviews, 'as BrandedType' outside of Smart Constructors should be rejected."
    }
  },

  // --- Question 6: Builder Generic — correct: 1 ---
  {
    question: "What initial value does the generic parameter 'Set' have in the type-safe builder?",
    options: [
      "string — the most general type",
      "never — nothing is set",
      "unknown — everything is possible",
      "void — empty",
    ],
    correct: 1,
    explanation:
      "'never' means: The set of configured fields is empty. With each call, a field is added " +
      "to the set (Set | 'host'). When Set contains all required fields, build() becomes available.",
    elaboratedFeedback: {
      whyCorrect: "never is the empty set in the type system. 'never | \"host\"' = '\"host\"'. 'never | \"host\" | \"port\"' = '\"host\" | \"port\"'. This is how the generic type accumulates information.",
      commonMistake: "Some confuse never (empty set) with unknown (set of all values). never | X = X, but unknown | X = unknown. never is the correct initial value."
    }
  },

  // --- Question 7: State Machine Transition — correct: 1 ---
  {
    question: "How do you prevent impossible state transitions at compile time?",
    options: [
      "With try/catch around every transition that throws an error at runtime",
      "With a type-level transition map that defines allowed transitions",
      "With runtime assertions in every method that check the transition at runtime",
      "With the TypeScript decorator @ValidTransition that automatically recognizes valid transitions",
    ],
    correct: 1,
    explanation:
      "A transition map as a type defines the allowed subsequent states for each state. " +
      "The transition() function only accepts transitions defined in the map. " +
      "Everything else is a compile error.",
    elaboratedFeedback: {
      whyCorrect: "type Transitions = { idle: 'loading'; loading: 'success' | 'error' }. function transition<C extends keyof Transitions>(current: C, next: Transitions[C]). The second parameter is constrained to allowed values.",
      commonMistake: "Many implement state machines only with runtime checks: if (current !== 'loading') throw. That does not prevent the bug — it only reports it at runtime."
    }
  },

  // --- Question 8: Phantom vs Branded — correct: 1 ---
  {
    question: "What is the relationship between branded types (L24) and phantom types?",
    options: [
      "They are completely different concepts with nothing in common and are implemented differently",
      "Branded types are a simple form of phantom types — the brand only exists in the type",
      "Phantom types are an extension of branded types with additional runtime data",
      "Branded types only work with classes, phantom types exclusively with primitives",
    ],
    correct: 1,
    explanation:
      "The __brand property in branded types only exists in the type, not at runtime — " +
      "it is a 'phantom'. Phantom types generalize the concept: Any type parameter that " +
      "has no runtime value is a phantom.",
    elaboratedFeedback: {
      whyCorrect: "type UserId = string & { __brand: 'UserId' }. The __brand is a phantom — it does not exist at runtime. The only difference: 'Phantom Type' is the general term, 'Branded Type' is the specific TypeScript pattern.",
      commonMistake: "Some think branded types have a real __brand property. No — the intersection type (&) does not add any property to the value. It is pure type information."
    }
  },

  // --- Question 9: this return type — correct: 2 ---
  {
    question: "Why is 'this' as a return type better than the class name in method chaining?",
    options: [
      "'this' is faster at runtime than the class name and consumes less memory",
      "'this' allows access to private methods that would otherwise be unreachable",
      "'this' is polymorphic — subclasses return their own type",
      "'this' prevents circular dependencies and improves module structure",
    ],
    correct: 2,
    explanation:
      "When SubClass extends BaseClass, 'this' in BaseClass methods returns the SubClass type. " +
      "With the class name, BaseClass would be returned and SubClass methods would be " +
      "'invisible' after chaining.",
    elaboratedFeedback: {
      whyCorrect: "class ExtendedBuilder extends QueryBuilder { limit(n: number): this { ... } }. When select() returns 'this', the type after select() = ExtendedBuilder — limit() is available. With QueryBuilder as the return type, limit() would be gone.",
      commonMistake: "Many think 'this' and the class name are the same. In non-polymorphic code they are — but as soon as inheritance comes into play, 'this' makes the decisive difference."
    }
  },

  // --- Question 10: Discriminated Union vs Boolean — correct: 2 ---
  {
    question: "What is the type-level advantage of a discriminated union over boolean flags for state?",
    options: [
      "Discriminated unions require less memory",
      "Discriminated unions are faster in switch statements",
      "State-specific data is only accessible in the matching state",
      "Discriminated unions prevent race conditions",
    ],
    correct: 2,
    explanation:
      "With { status: 'success'; data: T } TypeScript knows: data only exists when " +
      "status === 'success'. With boolean flags, data would always have to be T | null — " +
      "even when isSuccess === true, because TypeScript does not correlate booleans.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript can narrow switch(state.status): In the case 'success', state.data is guaranteed to be T. With booleans: if (state.isSuccess && state.data) — the correlation is not encoded in the type.",
      commonMistake: "Some believe if (isLoading) is sufficient as narrowing. TypeScript narrows isLoading to true, but does NOT correlate that with data or error. That is the fundamental boolean problem."
    }
  },

  // --- Question 11: unique symbol — correct: 2 ---
  {
    question: "Why use 'unique symbol' instead of string literals as the brand in newtypes?",
    options: [
      "unique symbol is faster at runtime and consumes less memory",
      "String literals cannot be used as type parameters and generate an error",
      "unique symbol is guaranteed to be unique — no collision between modules possible",
      "unique symbol is specially optimized by the TypeScript compiler and speeds up type checking",
    ],
    correct: 2,
    explanation:
      "Every 'declare const XBrand: unique symbol' creates a type that is GUARANTEED to be " +
      "unique — even if two modules use the same name. String literals like '__brand: \"UserId\"' " +
      "could theoretically collide.",
    elaboratedFeedback: {
      whyCorrect: "unique symbol is a type that is only identical to itself. Two different 'unique symbol' declarations are DIFFERENT types, even if they have the same variable name. String brands could collide in large monorepos.",
      commonMistake: "For small projects, string brands are completely sufficient. unique symbol is only worthwhile for large codebases or when modules come from different teams."
    }
  },

  // --- Question 12: Over-Engineering — correct: 2 ---
  {
    question: "When is a type-safe builder over-engineering?",
    options: [
      "When the object has more than 10 fields",
      "When the builder is used in a library",
      "When the object only has 3-4 fields and all are required",
      "When TypeScript 5.0 or newer is used",
    ],
    correct: 2,
    explanation:
      "With few required fields, a simple interface is sufficient. The builder is only worthwhile " +
      "from 5+ fields with a mix of required and optional, or for incremental construction. " +
      "A simple 'createConfig({ host, port, ssl })' is clearer than a builder.",
    elaboratedFeedback: {
      whyCorrect: "The pragmatic rule: If an object literal with type annotation is clear and readable, you do not need a builder. Builders are worthwhile for complex validation, many optional fields, or when order matters.",
      commonMistake: "Some use builders everywhere because they find the pattern cool. That leads to unnecessary code. KISS (Keep It Simple) applies to type patterns too."
    }
  },

  // --- Question 13: Transition Map — correct: 3 ---
  {
    question: "What does 'never' represent as a value in a transition map?",
    options: [
      "An error in the type definition",
      "A state that can be skipped",
      "A reset to the initial state",
      "A terminal state — no transition possible",
    ],
    correct: 3,
    explanation:
      "In a transition map like { submitted: never }, 'never' means: There is NO allowed " +
      "subsequent state. This is a terminal state — the state machine cannot proceed from here. " +
      "Compile error on any transition() call.",
    elaboratedFeedback: {
      whyCorrect: "transition('submitted', ???) — the second parameter would have to be 'never', but no value has the type 'never'. That is why the call is impossible — exactly right for a terminal state.",
      commonMistake: "Some use 'void' or '' (empty string) as a terminal state marker. That is wrong — void and '' are valid types. Only 'never' is truly impossible."
    }
  },

  // --- Question 14: Opaque Types — correct: 3 ---
  {
    question: "What is an opaque type in TypeScript?",
    options: [
      "A type that can only be used in generic functions and not directly",
      "A type that is automatically inferred by TypeScript without explicit annotation",
      "A type with runtime validation that is automatically generated by the compiler",
      "A newtype whose internal structure is only known within a module",
    ],
    correct: 3,
    explanation:
      "An opaque type exports the type, but not the ability to create it. " +
      "Other modules can use UserId, but only the user-id module can create " +
      "UserId values (via Smart Constructor).",
    elaboratedFeedback: {
      whyCorrect: "The module exports: type UserId and function createUserId(). It does NOT export the brand or the 'as' cast. Other modules must use the Smart Constructor — they cannot 'forge' a UserId.",
      commonMistake: "Technically one can write 'as UserId' in other modules too. Opaque types are a convention, not a hard compiler enforcement. Code reviews and linting rules enforce the convention."
    }
  },

  // --- Question 15: Pattern choice — correct: 3 ---
  {
    question: "Which pattern combination covers 90% of use cases in Angular/React projects?",
    options: [
      "Builder + Fluent API",
      "Phantom Types + Newtype",
      "State Machine + Fluent API",
      "Branded Types + Discriminated Unions",
    ],
    correct: 3,
    explanation:
      "Branded types for entity IDs and discriminated unions for state management cover most cases. " +
      "Builders, phantom types, and newtypes are for special situations — not for everyday use.",
    elaboratedFeedback: {
      whyCorrect: "In typical Angular/React apps: UserId/OrderId as branded types prevent ID mix-ups. LoadState<T> as a discriminated union prevents impossible states. That is enough for most services and components.",
      commonMistake: "Some think advanced patterns must be used everywhere. No — they are tools for specific problems. 'When all you have is a hammer...' applies to type patterns too."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "What is the name of the principle 'Impossible states should be prevented by the type system'?",
    expectedAnswer: "Make impossible states impossible",
    acceptableAnswers: ["Make impossible states impossible", "make impossible states impossible", "impossible states impossible"],
    explanation:
      "'Make impossible states impossible' is a design principle from functional programming. " +
      "Instead of checking for impossible states at runtime, the type is modeled such that " +
      "they cannot be expressed at all.",
  },

  {
    type: "short-answer",
    question: "What type does a generic parameter have as an initial value when it should express 'nothing is set'?",
    expectedAnswer: "never",
    acceptableAnswers: ["never", "Never"],
    explanation:
      "'never' is the empty set in the type system — no value belongs to it. As an initial " +
      "value for accumulating generics, never is ideal: never | 'host' = 'host'. This way " +
      "the set grows with each method call.",
  },

  {
    type: "short-answer",
    question: "What is a type parameter called that does not appear in the value but exists in the type?",
    expectedAnswer: "Phantom Type",
    acceptableAnswers: ["Phantom Type", "phantom type", "Phantom", "phantom"],
    explanation:
      "A phantom type is a type parameter that does not appear in the value. In TypeScript " +
      "a __phantom property is needed as an 'anchor', because the structural type system " +
      "would otherwise ignore unused parameters.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Does this code compile? Answer with 'Yes' or 'No' and briefly explain.",
    code:
      "type Transitions = { idle: 'loading'; loading: 'success' | 'error'; success: 'idle'; error: 'idle' | 'loading' };\n" +
      "function go<C extends keyof Transitions>(c: C, n: Transitions[C]): void {}\n" +
      "go('idle', 'success');",
    expectedAnswer: "No",
    acceptableAnswers: ["No", "no", "Nein", "nein", "Compile-Error", "Error"],
    explanation:
      "Transitions['idle'] = 'loading'. The second parameter must be 'loading', not 'success'. " +
      "TypeScript reports: '\"success\"' is not assignable to '\"loading\"'.",
  },

  {
    type: "predict-output",
    question: "What type does 'result' have after this call?",
    code:
      "class Builder<Set extends string = never> {\n" +
      "  host(): Builder<Set | 'host'> { return this as any; }\n" +
      "  port(): Builder<Set | 'port'> { return this as any; }\n" +
      "}\n" +
      "const result = new Builder().host().port();",
    expectedAnswer: "Builder<'host' | 'port'>",
    acceptableAnswers: [
      "Builder<'host' | 'port'>",
      "Builder<\"host\" | \"port\">",
      "Builder<'port' | 'host'>",
      "Builder<\"port\" | \"host\">",
    ],
    explanation:
      "Start: Builder<never>. After host(): Builder<never | 'host'> = Builder<'host'>. " +
      "After port(): Builder<'host' | 'port'>. The generic accumulates the configured fields.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Question)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why do all 5 patterns in this lesson (Builder, State Machine, Phantom Types, " +
      "Fluent API, Newtype) have zero runtime overhead?",
    modelAnswer:
      "All 5 patterns use TypeScript's Type Erasure: All type information is removed " +
      "during compilation. Branded types, phantom types, and newtypes have no runtime " +
      "representation — at runtime they are normal string/number values. " +
      "Builder generics and state machine types only exist in the type system. The compiler " +
      "checks correctness, but the generated JavaScript code is identical to code " +
      "without these patterns.",
    keyPoints: [
      "Type Erasure: All types are removed during compilation",
      "Branded/Phantom/Newtype: Normal primitives at runtime (string, number)",
      "Builder generics: Only exist in the type system, not in JavaScript",
      "Compile-time checking without runtime costs is TypeScript's strength",
    ],
  },
];

// ─── Elaborated Feedback (for MC questions without inline elaboratedFeedback) ────
// All MC questions already have elaboratedFeedback inline.