# Section 4: Type Testing — expectTypeOf and tsd

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Mocking with Types](./03-mocking-mit-typen.md)
> Next section: [05 - Test Patterns](./05-test-patterns.md)

---

## What you'll learn here

- Why you should test types — not just values
- How `expectTypeOf` works in Vitest and what it tests
- How `tsd` works as an external type-testing library
- When type tests make sense and when they don't

---

## Why Type Tests?

Regular tests check **runtime behavior**: `expect(add(1, 2)).toBe(3)`.
Type tests check **compile-time behavior**: "Does `add(1, 2)` have the type `number`?"

Why does this matter? Because TypeScript code sometimes returns the **right values**
but has the **wrong types**:

```typescript
// Example: The function works correctly...
function identity<T>(value: T): T {
  return value;
}

// ...but what if someone refactors it to:
function identity(value: any): any {
  return value;
}
// Runtime tests all pass! add(1,2) still returns 3.
// But the type is broken: identity("hello") now returns 'any' instead of 'string'.
// Type tests catch this.
```

> 📖 **Background: Type Testing in the Open-Source World**
>
> Type testing became popular through library authors. When you develop a
> library like lodash, zod, or tRPC, the TYPES are part of the
> public API. A type regression bug (e.g. a field becoming `any`
> instead of `string`) breaks all users' code — even if the
> runtime continues to work correctly.
>
> `tsd` was developed in 2018 by Sam Verschueren, specifically for
> DefinitelyTyped (@types/*) packages. Vitest integrated type testing
> with `expectTypeOf` directly into the test runner — inspired by
> `expect-type` by Matt Pocock.

---

## expectTypeOf: Type Tests in Vitest

Vitest has `expectTypeOf` built in — no installation needed:

```typescript annotated
import { expectTypeOf, describe, it } from 'vitest';

describe('Type Tests', () => {
  it('identity preserves type', () => {
    const result = identity("hello");

    expectTypeOf(result).toBeString();
    // ^ PASS: typeof result === string

    expectTypeOf(result).not.toBeAny();
    // ^ PASS: result is NOT any

    expectTypeOf(result).toEqualTypeOf<string>();
    // ^ PASS: result is exactly string (not string | number etc.)
  });

  it('Promise.all returns tuple', () => {
    const p = Promise.all([
      Promise.resolve(42),
      Promise.resolve("hello"),
    ]);

    expectTypeOf(p).toEqualTypeOf<Promise<[number, string]>>();
    // ^ PASS: tuple type is correctly inferred
  });

  it('generic function preserves type parameter', () => {
    function wrap<T>(value: T): { wrapped: T } {
      return { wrapped: value };
    }

    expectTypeOf(wrap(42)).toEqualTypeOf<{ wrapped: number }>();
    // ^ PASS: T is inferred as number

    expectTypeOf(wrap).parameter(0).toBeNumber();
    // ^ Check the type of the first parameter
    // NOTE: parameter(0) checks the type WHEN a number is passed
  });
});
```

### Key expectTypeOf Methods

```typescript annotated
// Exact type comparison
expectTypeOf<string>().toEqualTypeOf<string>();          // ✓
expectTypeOf<string>().toEqualTypeOf<string | number>(); // ✗

// Assignability check (broader than Equal)
expectTypeOf<string>().toMatchTypeOf<string | number>(); // ✓ string ⊂ string|number
expectTypeOf<string | number>().toMatchTypeOf<string>(); // ✗ string|number ⊄ string

// Primitive checks
expectTypeOf("hello").toBeString();
expectTypeOf(42).toBeNumber();
expectTypeOf(true).toBeBoolean();
expectTypeOf(null).toBeNull();
expectTypeOf(undefined).toBeVoid();

// Negation
expectTypeOf("hello").not.toBeNumber();
expectTypeOf(undefined).not.toBeNull();

// Function checks
expectTypeOf(add).toBeFunction();
expectTypeOf(add).returns.toBeNumber();
// ^ Checks the return type
expectTypeOf(add).parameter(0).toBeNumber();
// ^ Checks the type of the first parameter
```

> 💭 **Think about it:** What is the difference between `toEqualTypeOf`
> and `toMatchTypeOf`? When would you use which one?
>
> **Answer:** `toEqualTypeOf` checks exact equality (bidirectional
> assignability). `toMatchTypeOf` only checks whether the actual type is
> assignable to the expected type (unidirectional). Use `toEqual`
> when you want to guarantee the exact type, `toMatch` when you only
> want to check "is at least as broad as X".

---

## tsd: Type Testing for Libraries

`tsd` is a standalone library, ideal for package authors:

```typescript annotated
// __tests__/types.test-d.ts (tsd file extension: .test-d.ts)
import { expectType, expectNotType, expectError, expectAssignable } from 'tsd';
import { identity, createUser } from '../src';

// Type assertions
expectType<string>(identity("hello"));
// ^ PASS: identity("hello") has the type string

expectNotType<any>(identity("hello"));
// ^ PASS: identity("hello") is NOT any

// Error assertions — check that something does NOT compile!
expectError(identity());
// ^ PASS: identity() without an argument is a compile error

// Assignability
expectAssignable<string | number>(identity(42));
// ^ PASS: number is assignable to string | number
```

### tsd vs expectTypeOf

| Criterion | expectTypeOf (Vitest) | tsd |
|---|---|---|
| Integration | Built into Vitest | Separate CLI tool |
| Execution | During the test run | Separate type check |
| Error testing | Not possible | `expectError()` available |
| Setup | Zero-config (Vitest) | Own configuration |
| Recommendation | App code, quick checks | Library authors, package tests |

> 🧠 **Explain it to yourself:** Why can `expectTypeOf` not test
> "expected compile errors", but `tsd` can? What is the
> technical difference?
>
> **Key points:** expectTypeOf runs AT RUNTIME — if the code
> doesn't compile, it doesn't run | tsd analyzes code
> STATICALLY (like the compiler) — it can check whether code does NOT
> compile | tsd uses the TypeScript Compiler API directly

---

## Practical Type Test Patterns

### Pattern 1: Testing Utility Types

```typescript annotated
import { expectTypeOf } from 'vitest';

// Testing your own utility types:
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

it('DeepReadonly makes nested properties readonly', () => {
  type Input = { a: { b: string } };
  type Result = DeepReadonly<Input>;

  expectTypeOf<Result>().toEqualTypeOf<{
    readonly a: { readonly b: string };
  }>();
  // ^ Checks that BOTH levels are readonly
});
```

### Pattern 2: Testing API Types

```typescript annotated
it('API client returns correct types', () => {
  const client = createApiClient({ baseUrl: '' });

  // Check that get() returns the correct generic type
  expectTypeOf(client.get<User[]>('/users')).toEqualTypeOf<Promise<User[]>>();

  // Check that the client has the correct signature
  expectTypeOf(client.post).parameter(1).toEqualTypeOf<unknown>();
  // ^ body is unknown — not any!
});
```

### Pattern 3: Testing Discriminated Unions

```typescript annotated
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

it('Result narrows correctly', () => {
  const result: Result<string> = { ok: true, value: "hello" };

  if (result.ok) {
    expectTypeOf(result.value).toBeString();
    // ^ After ok check: value is string
  } else {
    expectTypeOf(result.error).toEqualTypeOf<Error>();
    // ^ After !ok check: error is Error
  }
});
```

> ⚡ **Practical tip for Angular and React:** Type tests are especially
> valuable for:
>
> ```typescript
> // Angular: Check that a service returns the correct Observable type
> expectTypeOf(userService.getUsers()).toEqualTypeOf<Observable<User[]>>();
>
> // React: Check that a hook returns the correct type
> expectTypeOf(useUser('1')).toMatchTypeOf<{
>   data: User | undefined;
>   isLoading: boolean;
> }>();
> ```

---

## When to Write Type Tests?

```typescript
// ✅ Type tests make sense for:
// - Library APIs (public interfaces)
// - Utility types (DeepReadonly, DeepPartial, etc.)
// - Generic functions (identity, pipe, compose)
// - Discriminated unions (testing narrowing)
// - API client types (response types)

// ❌ Type tests are overkill for:
// - Simple functions with obvious types
// - Internal implementation details
// - Code that changes frequently
// - When runtime tests implicitly verify the type
```

> 🔬 **Experiment:** Write type tests for your own utility function:
>
> ```typescript
> function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
>   const result = {} as Pick<T, K>;
>   keys.forEach(k => { result[k] = obj[k]; });
>   return result;
> }
>
> // Type tests:
> const user = { name: 'Max', age: 30, email: 'max@test.com' };
> const picked = pick(user, ['name', 'age']);
>
> expectTypeOf(picked).toEqualTypeOf<{ name: string; age: number }>();
> // Does the type only have name and age? Or also email?
> // Answer: Only name and age — Pick<T, K> removes the other keys.
> ```

---

## What you've learned

- Type tests check COMPILE-TIME behavior, not runtime behavior
- `expectTypeOf` in Vitest checks types as part of normal tests
- `tsd` is a standalone tool that can also test "expected errors"
- `toEqualTypeOf` checks exact equality, `toMatchTypeOf` checks assignability
- Type tests are especially valuable for libraries, utility types, and generic APIs

**Core concept to remember:** Type tests are the "unit tests for your type system". They ensure that refactoring doesn't accidentally degrade types to `any` or break generics. For library code they are indispensable — for application code a nice-to-have.

---

> **Pause point** — Type testing is a powerful technique.
> The next section shows proven test patterns.
>
> Continue with: [Section 05: Test Patterns](./05-test-patterns.md)