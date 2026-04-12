# Lesson 17: Conditional Types

> **Prerequisite:** Lesson 16 (Mapped Types) completed.
> **Goal:** Master conditional types, the infer keyword, and distributive types — the most powerful tools in the TypeScript type system.
> **Core question of this lesson:** How do I make type decisions at compile time based on the structure of other types?
> **Total duration:** ~50 minutes (5 sections of ~10 minutes each)

---

## Learning Path

### Sections

| # | Section | Duration | What you'll learn |
|---|---|---|---|
| 01 | [Extends Condition](./sections/01-extends-condition.md) | ~10 min | T extends U ? X : Y syntax, nested conditionals |
| 02 | [Infer Keyword](./sections/02-infer-keyword.md) | ~10 min | Type extraction with infer, return types, Promise unwrapping |
| 03 | [Distributive Types](./sections/03-distributive-types.md) | ~10 min | Distribution over unions, control with [T] |
| 04 | [Recursive Conditionals](./sections/04-recursive-conditionals.md) | ~10 min | Recursive types, Flatten, DeepAwaited |
| 05 | [Practical Patterns](./sections/05-practical-patterns.md) | ~10 min | UnpackPromise, DeepPartial, real-world scenarios |

---

## Recommended Learning Path

```
Read sections 01-05 (each ~10 min, breaks in between are fine)
        |
        v
Work through examples in examples/ and experiment
        |
        v
Solve exercises in exercises/ (TODO tasks)
        |
        v
Test with "npx tsx quiz.ts"
        |
        v
Compare with solutions in solutions/
```

---

## The 10 Most Important Insights (Spoilers!)

<details>
<summary>Expand summary</summary>

1. **Conditional types are ternaries for types**: `T extends U ? X : Y` — chooses X or Y based on extends.

2. **infer extracts parts of a type**: `T extends Promise<infer U> ? U : T` — retrieves the inner type of a Promise.

3. **Distributive conditional types distribute over unions**: `T extends X ? Y : Z` is evaluated individually for each union member.

4. **[T] prevents distribution**: `[T] extends [X] ? Y : Z` — evaluates the entire union as a whole.

5. **infer can appear at any position**: parameter, return type, array element, object property — anywhere a type appears.

6. **Recursive conditional types unwrap nested structures**: `Flatten<T>` unpacks arrays of arbitrary depth.

7. **never is the empty union**: Distribution over never always yields never — an important special case.

8. **Multiple infer in one pattern**: `T extends (a: infer A, b: infer B) => infer R` extracts all parts of a function.

9. **TypeScript has built-in conditional types**: ReturnType, Parameters, Awaited — all use infer internally.

10. **Conditional types are the foundation of type-level programming**: Together with mapped types you can build arbitrarily complex type transformations.

</details>

---

> **Start here:** [Section 01 - Extends Condition](./sections/01-extends-condition.md)
>
> **Next lesson:** 18 — Template Literal Types