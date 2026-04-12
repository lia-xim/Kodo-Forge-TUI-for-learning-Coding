# Cheatsheet: Testing TypeScript

Quick reference for Lesson 33.

---

## Test Setup

```bash
# Vitest (recommended for TS projects)
npm install -D vitest

# Jest + TypeScript
npm install -D jest ts-jest @types/jest
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: { globals: true, environment: 'node' },
});

// jest.config.ts
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

---

## expect() Types

```typescript
expect(42).toBe(42);             // T = number ✓
expect("hello").toBe("hello");   // T = string ✓
// expect(42).toBe("hello");     // Compile error: string ≠ number

expect([1,2,3]).toContain(2);    // Element type number ✓
expect(user).toEqual({ name: "Max", age: 30 }); // Structural check
```

---

## Mocking

```typescript
// Typed mock
const mockFn = vi.fn<(id: string) => Promise<User>>();
mockFn.mockResolvedValue(testUser); // Must be User!

// Mock module + type cast
vi.mock('./user-service');
const service = vi.mocked(new UserService());
service.getUser.mockResolvedValue(testUser); // Now type-safe!

// Partial mock (pragmatic)
const mock = {
  getUser: vi.fn(),
} as unknown as UserService;

// Angular SpyObj
const spy = jasmine.createSpyObj<UserService>('svc', ['getUser', 'listUsers']);
```

---

## Type Testing

```typescript
import { expectTypeOf } from 'vitest';

// Exact type check
expectTypeOf(result).toEqualTypeOf<string>();
expectTypeOf(result).not.toBeAny();

// Assignability
expectTypeOf<string>().toMatchTypeOf<string | number>(); // ✓

// Function checks
expectTypeOf(add).returns.toBeNumber();
expectTypeOf(add).parameter(0).toBeNumber();

// tsd (for libraries)
import { expectType, expectError } from 'tsd';
expectType<string>(identity("hello"));
expectError(identity()); // Checks: DOES NOT COMPILE
```

---

## Test Factories

```typescript
// Factory with Partial<T>
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2024-01-01',
    ...overrides,
  };
}

// Usage
const admin = createTestUser({ role: 'admin' });
// Only override what's relevant!

// Generic factory
function createFactory<T>(defaults: T): (overrides?: Partial<T>) => T {
  return (overrides) => ({ ...defaults, ...overrides });
}
```

---

## Test Builder

```typescript
class TestUserBuilder {
  private data: User = { /* defaults */ };
  withRole(role: User['role']): this { this.data.role = role; return this; }
  asAdmin(): this { this.data.role = 'admin'; return this; }
  build(): User { return { ...this.data }; }
}

const admin = new TestUserBuilder().asAdmin().build();
```

---

## Framework Tests

```typescript
// Angular TestBed
const fixture = TestBed.createComponent(UserComponent);
const component = fixture.componentInstance; // UserComponent
mockService.getUser.mockResolvedValue(testUser);
fixture.detectChanges();

// React Testing Library
render(<UserList users={[testUser]} />);
expect(screen.getByText('Max')).toBeInTheDocument();
await userEvent.click(screen.getByRole('button'));

// MSW (framework-agnostic)
const handlers = [
  http.get('/api/users', () => HttpResponse.json([testUser])),
];
const server = setupServer(...handlers);
```

---

## Decision Guide

| Question | Answer |
|---|---|
| Vitest or Jest? | Vitest for new TS projects, Jest for Angular |
| Write type tests? | Yes for libraries and utility types |
| vi.fn() or vi.fn<T>()? | ALWAYS vi.fn<T>() — avoids any |
| Mocking: Partial or vi.mocked? | vi.mocked for modules, Partial for DI |
| MSW or HttpClientTestingModule? | MSW for framework-agnostic tests |

---

## Common Mistakes

| Mistake | Problem | Solution |
|---|---|---|
| vi.fn() without type parameter | Mock is any — no checking | vi.fn<Signature>() |
| Manual test data in every test | Duplication, maintenance overhead | Factory functions |
| describe with async | Compile error or runtime error | beforeAll for async setup |
| expect() doesn't narrow | expect(x).not.toBeNull() doesn't change the type | Explicit if-narrowing |
| strict: false in tests | any sneaks in | Always strict: true |