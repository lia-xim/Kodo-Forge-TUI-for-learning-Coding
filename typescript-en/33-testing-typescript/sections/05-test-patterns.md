# Section 5: Test Patterns — Fixtures, Factories, Builder

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Type Testing](./04-type-testing.md)
> Next section: [06 - Practice: Angular TestBed, React Testing Library](./06-praxis-frameworks.md)

---

## What you'll learn here

- How to create type-safe test fixtures with factories
- The Builder pattern for complex test data (from L26, applied to tests here)
- How Faker.js and @faker-js/faker work with TypeScript
- Patterns for reusable test utilities

---

## The Problem: Test Data Boilerplate

Every test needs data. Without a system, duplication creeps in:

```typescript
// BAD: Manually defining data in every test
it('test 1', () => {
  const user = { id: '1', name: 'Max', email: 'max@test.de', role: 'user' as const, createdAt: '2024-01-01' };
  // ^ 5 fields, repeated in EVERY test
});
it('test 2', () => {
  const user = { id: '2', name: 'Anna', email: 'anna@test.de', role: 'admin' as const, createdAt: '2024-01-01' };
  // ^ Nearly identical — only name, email, role differ
});
```

> 📖 **Background: Test Data Patterns**
>
> This problem is as old as unit testing itself. Martin Fowler
> described "Object Mother" (2006) — a central class that
> produces test objects. Later came "Test Data Builders,"
> inspired by the Builder pattern (GoF). In the TypeScript world,
> **factory functions** with `Partial<T>` have established themselves
> as the most pragmatic approach — they're simple, type-safe,
> and require no library.

---

## Pattern 1: Factory Functions with Partial<T>

```typescript annotated
// test-factories.ts
import type { User, Post, Comment } from '../types';

export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
    // ^ Partial<User> allows any field to be overridden
    // TypeScript checks: only User fields are allowed!
  };
}

export function createTestPost(overrides?: Partial<Post>): Post {
  return {
    id: 'post-1',
    title: 'Test Post',
    content: 'Lorem ipsum...',
    authorId: 'user-1',
    published: false,
    ...overrides,
  };
}

// Usage — minimal, type-safe, clear:
it('admin can delete posts', () => {
  const admin = createTestUser({ role: 'admin' });
  // ^ Only what's relevant for the test!
  const post = createTestPost({ authorId: admin.id });

  expect(canDelete(admin, post)).toBe(true);
});

it('user cannot delete others posts', () => {
  const user = createTestUser({ id: 'user-2' });
  const post = createTestPost({ authorId: 'user-1' });
  // ^ authorId != user.id

  expect(canDelete(user, post)).toBe(false);
});
```

> 💭 **Think about it:** Why does `createTestUser` use `Partial<User>`
> instead of `Pick<User, 'role'>` for the overrides parameter? What
> would be the advantage of Pick?
>
> **Answer:** Partial<User> is more flexible — every test can override any
> field. Pick<User, 'role'> would only allow 'role'. The downside of
> Partial: you could accidentally omit a field that matters for the test.
> In practice, Partial is more pragmatic — the defaults cover most cases.

---

## Pattern 2: Type-Safe Test Builder

For complex test scenarios with relationships:

```typescript annotated
// test-builder.ts
class TestUserBuilder {
  private data: User = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z',
  };

  withId(id: string): this {
    this.data.id = id;
    return this;
    // ^ 'this' as return type for method chaining (L26!)
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withRole(role: User['role']): this {
    // ^ User['role'] instead of string — only valid roles!
    this.data.role = role;
    return this;
  }

  asAdmin(): this {
    // ^ Convenience method — semantically clearer than withRole('admin')
    this.data.role = 'admin';
    this.data.email = `admin-${this.data.id}@example.com`;
    return this;
  }

  build(): User {
    return { ...this.data };
    // ^ Return a copy — builder remains reusable
  }
}

export const aUser = () => new TestUserBuilder();

// Usage — reads like prose:
const admin = aUser().asAdmin().withName('Max').build();
const viewer = aUser().withRole('viewer').build();
```

---

## Pattern 3: Fixtures with Context

For tests that need related data:

```typescript annotated
// test-fixtures.ts
interface TestFixture {
  admin: User;
  regularUser: User;
  adminPost: Post;
  userPost: Post;
  comments: Comment[];
}

export function createTestFixture(overrides?: Partial<TestFixture>): TestFixture {
  const admin = createTestUser({ id: 'admin-1', role: 'admin', name: 'Admin' });
  const regularUser = createTestUser({ id: 'user-1', name: 'Regular User' });

  return {
    admin,
    regularUser,
    adminPost: createTestPost({ authorId: admin.id, title: 'Admin Post' }),
    userPost: createTestPost({ authorId: regularUser.id, title: 'User Post' }),
    comments: [
      { id: 'c-1', postId: 'post-1', authorId: regularUser.id, text: 'Nice!' },
      { id: 'c-2', postId: 'post-1', authorId: admin.id, text: 'Thanks!' },
    ],
    ...overrides,
  };
}

// Usage:
describe('Comment Moderation', () => {
  const fixture = createTestFixture();

  it('admin can delete any comment', () => {
    expect(canDeleteComment(fixture.admin, fixture.comments[0])).toBe(true);
    // ^ fixture.admin: User, fixture.comments[0]: Comment — type-safe!
  });

  it('user can only delete own comments', () => {
    expect(canDeleteComment(fixture.regularUser, fixture.comments[0])).toBe(true);
    expect(canDeleteComment(fixture.regularUser, fixture.comments[1])).toBe(false);
    // ^ comments[1] belongs to the admin — regular user cannot delete it
  });
});
```

> 🧠 **Explain it to yourself:** Why is a `TestFixture` interface
> better than loose variables (`const admin = ...`, `const post = ...`)?
>
> **Key points:** A fixture is a cohesive whole — IDs reference each
> other | TypeScript checks consistency | Fixtures are reusable across
> tests | Destructuring makes tests readable: `const { admin, userPost } = createTestFixture()`

---

## Pattern 4: Faker.js for Realistic Data

```typescript annotated
import { faker } from '@faker-js/faker';

// Factory with Faker — every call produces unique data
export function createRandomUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    // ^ Unique UUID on every call
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['admin', 'user', 'viewer'] as const),
    // ^ Random role — 'as const' for the literal type!
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// Deterministic tests with seed:
faker.seed(42);
const user1 = createRandomUser(); // Always the same data with seed 42
faker.seed(42);
const user2 = createRandomUser(); // Identical to user1!
```

> ⚡ **Practical tip:** Faker.js has excellent TypeScript types.
> `faker.helpers.arrayElement()` infers the return type correctly:
>
> ```typescript
> const role = faker.helpers.arrayElement(['admin', 'user'] as const);
> // ^ role: 'admin' | 'user' — not string!
> // Without 'as const': role would be string
> ```

---

## Pattern 5: Generic Factory Function

A factory that works for ANY type:

```typescript annotated
function createFactory<T>(defaults: T): (overrides?: Partial<T>) => T {
  return (overrides) => ({ ...defaults, ...overrides });
  // ^ Generic: T is inferred from defaults
  // ^ Returns: a function with a Partial<T> parameter
}

// One-time definition:
const createUser = createFactory<User>({
  id: '1', name: 'Test', email: 'test@test.de', role: 'user', createdAt: '2024-01-01',
});
const createPost = createFactory<Post>({
  id: '1', title: 'Test', content: 'Lorem', authorId: '1', published: false,
});

// Usage:
const user = createUser({ name: 'Max' });
// ^ user: User — full type safety
const post = createPost({ authorId: user.id, published: true });
// ^ post: Post
```

> 🔬 **Experiment:** Extend the generic factory with a
> "with" method for method chaining:
>
> ```typescript
> function createChainableFactory<T>(defaults: T) {
>   return {
>     with(overrides: Partial<T>) {
>       return createChainableFactory({ ...defaults, ...overrides });
>     },
>     build(): T {
>       return { ...defaults };
>     },
>   };
> }
>
> const user = createChainableFactory<User>({ /* defaults */ })
>   .with({ name: 'Max' })
>   .with({ role: 'admin' })
>   .build();
> // What is the type of user? Is role 'admin' or User['role']?
> // Answer: User — build() returns T. role is User['role'] = 'admin' | 'user' | 'viewer'
> ```

---

## What you've learned

- Factory functions with `Partial<T>` are the most pragmatic approach to test data
- Test builders (method chaining) suit complex scenarios with relationships
- Fixtures bundle related data with consistent references
- Faker.js generates realistic data with correct TypeScript types
- Generic factory functions (`createFactory<T>`) eliminate boilerplate

**Core concept to remember:** Good test data shows ONLY what's relevant for the test. `createTestUser({ role: 'admin' })` says: "This test checks admin behavior." All other fields are irrelevant — the factory fills them in with sensible defaults.

---

> **Pause point** — You now have a solid toolbox for test data.
> The final section brings everything into a framework context.
>
> Continue with: [Section 06: Practice — Angular TestBed, React Testing Library](./06-praxis-frameworks.md)