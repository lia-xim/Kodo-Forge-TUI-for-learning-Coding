# Section 2: Typing Tests — describe, it, expect

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Test Setup](./01-test-setup.md)
> Next section: [03 - Mocking with Types](./03-mocking-mit-typen.md)

---

## What you'll learn here

- How `describe`, `it`, `expect` are typed internally
- Why `expect()` returns a typed matcher chain
- How TypeScript uses generic matchers like `toEqual<T>()`
- How to create your own type-safe matchers (Custom Matchers)

---

## The types behind describe and it

Test functions have precise TypeScript definitions:

```typescript annotated
// Simplified Vitest types:
type TestFunction = (name: string, fn: () => void | Promise<void>, timeout?: number) => void;
//                    ^ Test name    ^ Test body (sync or async!)    ^ Optional timeout

// describe — groups tests
declare function describe(name: string, fn: () => void): void;
// ^ fn is synchronous — describe must NOT be async!
// Why? Because the test runner must build the structure synchronously.

// it / test — defines a single test
declare function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
// ^ fn can be async — tests are allowed to be asynchronous
// ^ timeout is optional (default: 5000ms in Vitest)
```

> 📖 **Background: Why describe must be synchronous**
>
> Test runners first build a "test tree" (all describes and its are
> registered), then execute the tests. If describe were async, the runner
> would have to wait for each describe before registering the next block —
> this would destroy parallelization. So: describe is always synchronous,
> it can be async.
>
> If you need an async call inside a describe block (e.g. database setup),
> use `beforeAll()` instead of the describe body.

---

## expect(): The typed matcher chain

`expect()` is the most powerful type definition in test frameworks:

```typescript annotated
// Simplified type definition:
interface Expect {
  <T>(actual: T): Matchers<T>;
  // ^ T is inferred from the passed value
  // ^ Return value: Matchers<T> — the type flows into the matchers
}

interface Matchers<T> {
  toBe(expected: T): void;
  // ^ expected must have the SAME type as actual
  // expect(42).toBe("hello") → Compile error!

  toEqual(expected: T): void;
  // ^ Deep equality — same type check

  toContain(expected: T extends (infer U)[] ? U : T extends string ? string : never): void;
  // ^ If T is an array: single element. If T is a string: substring.

  toBeGreaterThan(expected: number): void;
  // ^ Only when T extends number — otherwise not available
  // (In practice: Vitest always allows it, but TS checks the type)

  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  // ^ These matchers require no argument
}
```

### Type inference in practice

```typescript annotated
// TypeScript infers the type from expect():
expect(42).toBe(42);           // T = number ✓
expect("hello").toBe("hello"); // T = string ✓
// expect(42).toBe("hello");   // T = number, but "hello" is string → Compile error!

expect([1, 2, 3]).toContain(2);        // T = number[], element = number ✓
expect("TypeScript").toContain("Type"); // T = string, substring ✓
// expect([1,2,3]).toContain("hello");  // T = number[], but "hello" is string → Compile error!

// Object comparison:
interface User { name: string; age: number }
const user: User = { name: "Max", age: 30 };

expect(user).toEqual({ name: "Max", age: 30 });    // ✓
// expect(user).toEqual({ name: "Max" });            // Missing properties → Error
// expect(user).toEqual({ name: "Max", age: "30" }); // age: string instead of number → Error
```

> 💭 **Think about it:** Why does TypeScript check `expect(user).toEqual()`
> against the same properties as the `User` interface? What happens
> when the API returns an additional field?
>
> **Answer:** TypeScript checks structurally: the argument to toEqual
> must match T. Missing properties are an error. Additional properties
> are allowed or rejected (depending on configuration).
> This is valuable in tests: if User gets a new field, toEqual tests
> will fail — you notice immediately.

---

## Async tests and types

```typescript annotated
// Async tests — Promise<void> as return type
it('fetches users', async () => {
  const users = await fetchUsers();
  // ^ users: User[] — TypeScript infers the type

  expect(users).toHaveLength(3);
  expect(users[0].name).toBe("Max");
  // ^ users[0]: User — array access is type-safe
});

// CAUTION: Forgotten await
it('dangerous test', () => {
  // NOT async!
  const promise = fetchUsers();
  // ^ promise: Promise<User[]> — NOT User[]!
  expect(promise).toHaveLength(3);
  // ^ WRONG: You're testing a Promise object, not the array!
  // TypeScript warns: Promise has no 'length' property
  // → Always use async/await in async tests!
});
```

---

## Creating custom matchers with type safety

Vitest and Jest allow custom matchers:

```typescript annotated
// custom-matchers.ts
import { expect } from 'vitest';

// 1. Implement custom matcher
expect.extend({
  toBeValidEmail(received: string) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be a valid email`
        : `Expected ${received} to be a valid email`,
    };
  },

  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `Expected ${received} to be within [${floor}, ${ceiling}]`,
    };
  },
});

// 2. Declare TypeScript types (Declaration Merging!)
interface CustomMatchers<R = unknown> {
  toBeValidEmail(): R;
  toBeWithinRange(floor: number, ceiling: number): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// 3. Usage — full autocomplete!
expect("test@example.com").toBeValidEmail(); // ✓
expect(50).toBeWithinRange(1, 100);          // ✓
// expect(50).toBeValidEmail();               // Compile error? No — TypeScript cannot
// restrict the type of 'received' in the matcher. Runtime error possible.
```

> 🧠 **Explain to yourself:** Why do Custom Matchers use
> "Declaration Merging" (declare module) instead of a new class?
> What would happen if you created a new class?
>
> **Key points:** expect() always returns Assertion<T> — you can't
> change the return type | Declaration Merging extends the existing
> interface | A new class would break the expect() chain |
> This is the same pattern as in L27 (Declaration Merging)

---

## Type narrowing in tests

```typescript annotated
// Tests can use type narrowing:
it('handles union types', () => {
  const result: string | null = getOptionalName();

  // Without narrowing:
  // expect(result.length).toBe(3);
  // ^ Compile error: result could be null!

  // With narrowing:
  expect(result).not.toBeNull();
  // CAUTION: TypeScript does NOT know after expect().not.toBeNull()
  // that result is non-null! expect() does not narrow.

  // Solution: Explicit narrowing
  if (result === null) throw new Error("Expected non-null");
  expect(result.length).toBe(3);
  // ^ Now OK — TypeScript knows: result is string

  // Alternative: Non-null assertion (only in tests!)
  expect(result!.length).toBe(3);
  // ^ ! says: "I know it's not null". Acceptable in tests.
});
```

> ⚡ **Practical tip for Angular:** In Angular tests with TestBed
> you encounter the narrowing problem constantly:
>
> ```typescript
> const fixture = TestBed.createComponent(UserComponent);
> const component = fixture.componentInstance;
> // component: UserComponent — directly type-safe!
>
> // But: DOM queries are unknown:
> const element = fixture.nativeElement.querySelector('.user-name');
> // element: Element | null — must be narrowed!
> expect(element).toBeTruthy();
> expect(element!.textContent).toContain('Max');
> ```

---

## Generic test helpers

```typescript annotated
// Type-safe test factory
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
    // ^ Partial<User> allows individual fields to be overridden
  };
}

// Usage:
it('handles admin users', () => {
  const admin = createTestUser({ role: 'admin' });
  // ^ admin: User — full type, only role overridden
  expect(admin.role).toBe('admin');
  expect(admin.name).toBe('Test User'); // Default value
});
```

> 🔬 **Experiment:** Create a generic `createTestEntity` function
> that works for any type:
>
> ```typescript
> function createTestEntity<T>(defaults: T, overrides?: Partial<T>): T {
>   return { ...defaults, ...overrides };
> }
>
> const user = createTestEntity(
>   { id: '1', name: 'Test', email: 'test@test.de', role: 'user' as const },
>   { name: 'Max' }
> );
> // What is the type of user? Is it User?
> // Answer: { id: string; name: string; email: string; role: 'user' }
> // role is 'user' (not string) because of 'as const'!
> ```

---

## What you've learned

- `expect<T>(actual)` infers T and returns typed matchers
- `describe` must be synchronous, `it` can be async
- Custom matchers use Declaration Merging to extend Vitest/Jest
- `expect().not.toBeNull()` does NOT narrow the TypeScript type — explicit narrowing required
- Generic test factories with `Partial<T>` avoid test duplication

**Core concept to remember:** expect() is a generic function that carries the type of the `actual` value into the matcher chain. This means: if your production code is type-safe, your tests automatically are too — TypeScript prevents nonsensical assertions like `expect(42).toBe("hello")`.

---

> **Pause point** — You now understand the type fundamentals of tests.
> Next up: Mocking — where types get most complex.
>
> Continue with: [Section 03: Mocking with Types](./03-mocking-mit-typen.md)