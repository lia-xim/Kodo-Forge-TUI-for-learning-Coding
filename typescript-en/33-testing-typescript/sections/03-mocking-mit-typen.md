# Section 3: Mocking with Types — vi.fn, jest.Mock, Partial<T>

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Typing Tests](./02-typing-von-tests.md)
> Next section: [04 - Type Testing](./04-type-testing.md)

---

## What you'll learn here

- How `vi.fn()` and `jest.fn()` create typed mock functions
- The `Partial<T>` pattern for partially mocked objects
- How to mock dependencies in a type-safe way (modules, services, APIs)
- Why mocking and TypeScript clash — and how to resolve it

---

## The core problem: Mocks break types

Mocking means: you replace real implementations with fakes.
But TypeScript expects the **real** type signature. This leads to
a fundamental conflict:

```typescript
// The real service
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(input: CreateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

// You only want to mock getUser — but TypeScript wants ALL methods:
const mock: UserService = {
  getUser: vi.fn(),
  // createUser missing! → Compile error
  // deleteUser missing! → Compile error
};
```

> 📖 **Background: Structural Typing vs Mocking**
>
> TypeScript's structural type system requires that an object has ALL
> properties of its type. Mocking often only needs a subset.
> In Java/C#, a framework like Mockito can automatically fill all methods
> with stubs. In TypeScript there is no automatic stubbing
> — you have to be explicit.
>
> Various solutions have emerged: Partial<T>,
> mocking libraries (vitest-mock-extended, jest-mock-extended),
> dependency injection, and "Ports and Adapters" (only mock interfaces,
> not implementations).

---

## vi.fn() and jest.fn(): Typed Mocks

```typescript annotated
// vi.fn() without type parameter — yields Mock<any>
const mockFn = vi.fn();
mockFn("anything"); // OK — no type checking!
// This is like 'any' — unsafe.

// vi.fn() WITH type parameter — type-safe
const mockGetUser = vi.fn<(id: string) => Promise<User>>();
// ^ Signature is defined by the type parameter
mockGetUser("123");       // ✓ id is string
// mockGetUser(123);       // ✗ Compile error: number is not string
// mockGetUser();           // ✗ Compile error: id missing

// Set mock return value — must match the return type
mockGetUser.mockResolvedValue({ id: "1", name: "Max", email: "max@test.de", role: "user", createdAt: "2024-01-01" });
// ^ Must have ALL User fields — TypeScript checks!

// mockGetUser.mockResolvedValue({ name: "Max" });
// ^ Compile error: id, email, role missing!
```

### jest.Mock — Similar, different syntax

```typescript annotated
// Jest equivalent
const mockGetUser = jest.fn<Promise<User>, [string]>();
// ^ <ReturnType, ParameterTuple>
// Note: Jest and Vitest have slightly different generics!

// Vitest: vi.fn<(id: string) => Promise<User>>()
// Jest:   jest.fn<Promise<User>, [string]>()
```

> 💭 **Think about it:** Why do Vitest and Jest have different
> mock signatures? Is this a problem?
>
> **Answer:** Historical growth. Jest came first (2014) with a
> simple generics signature. Vitest (2022) used a more modern
> form: the function as a single type parameter. In practice,
> Vitest's signature is more ergonomic — `vi.fn<typeof realFunction>()`
> works directly.

---

## Pattern 1: Partial Mock with Type Assertion

The most pragmatic solution to the "all methods" problem:

```typescript annotated
// Service interface
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(input: CreateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<User[]>;
}

// Partial mock — only the methods you need
const mockService = {
  getUser: vi.fn<(id: string) => Promise<User>>(),
} as unknown as UserService;
// ^ Double cast: object → unknown → UserService
// WARNING: Un-mocked methods are undefined at runtime!

// Usage:
mockService.getUser.mockResolvedValue(testUser);
const result = await mockService.getUser("1");
// ^ result: User — type-safe

// Safer alternative: Partial<T>
function createMockUserService(overrides: Partial<UserService> = {}): UserService {
  return {
    getUser: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
    listUsers: vi.fn(),
    ...overrides,
    // ^ Defaults + overrides — everything is a mock
  } as UserService;
}

const mock = createMockUserService({
  getUser: vi.fn<(id: string) => Promise<User>>().mockResolvedValue(testUser),
});
// Now ALL methods exist (as empty mocks)
```

---

## Pattern 2: vi.mocked() for Modules

```typescript annotated
// Mock a module
vi.mock('./user-service', () => ({
  UserService: vi.fn().mockImplementation(() => ({
    getUser: vi.fn(),
    createUser: vi.fn(),
  })),
}));

// PROBLEM: TypeScript doesn't know the mock type
import { UserService } from './user-service';
const service = new UserService();
// ^ service: UserService — but getUser is a mock!
// service.getUser.mockResolvedValue(...) — Compile error!
// TypeScript sees getUser as a regular method, not a mock.

// SOLUTION: vi.mocked() / jest.mocked()
const mockedService = vi.mocked(service);
// ^ mockedService: Mocked<UserService> — all methods are mock types!
mockedService.getUser.mockResolvedValue(testUser);
// ^ Now OK! .mockResolvedValue is available
```

> 🧠 **Explain it to yourself:** What does `vi.mocked()` do internally?
> How can it convert the type of `UserService` to `Mocked<UserService>`
> without changing the runtime value?
>
> **Key points:** vi.mocked() is a pure type cast (a no-op at runtime)
> | It replaces all method types with mock types |
> Mocked<T> is a mapped type that converts each method into a mock function
> | This only works if the module was previously mocked with
> vi.mock()!

---

## Pattern 3: Dependency Injection and Mocking

In Angular, DI is native — and ideal for mocking:

```typescript annotated
// Angular test with DI and mock
describe('UserComponent', () => {
  let component: UserComponent;
  let mockUserService: jasmine.SpyObj<UserService>;
  // ^ SpyObj<T> is Angular's typed mock type

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj<UserService>('UserService', ['getUser', 'listUsers']);
    // ^ createSpyObj creates an object with spy methods
    // The array elements MUST be methods of UserService!
    // ['getUsr'] → Compile error (typo detected!)

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: mockUserService },
        // ^ DI replaces the real service with the mock
      ],
    });

    component = TestBed.inject(UserComponent);
  });

  it('loads user on init', async () => {
    mockUserService.getUser.and.returnValue(Promise.resolve(testUser));
    // ^ Type-safe: returnValue must be Promise<User>

    await component.ngOnInit();
    expect(mockUserService.getUser).toHaveBeenCalledWith('1');
    // ^ Type-safe: toHaveBeenCalledWith checks the arguments
  });
});
```

> ⚡ **Practical tip for Angular:** `jasmine.createSpyObj<T>()` with
> the type parameter is the safest way to mock in Angular. It
> checks method names against the interface — typos are
> caught immediately. Since Angular 16+ with Jest: `jest.mocked()` is
> the alternative.

---

## Pattern 4: API Mocking with MSW

Mock Service Worker (MSW) mocks at the network level:

```typescript annotated
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define handlers — type-safe with generics
const handlers = [
  http.get<never, never, User[]>('/api/users', () => {
    // ^ <Params, RequestBody, ResponseBody>
    return HttpResponse.json([
      { id: '1', name: 'Max', email: 'max@test.de', role: 'user', createdAt: '2024-01-01' },
    ]);
    // ^ TypeScript checks: the array must match User[]
  }),

  http.post<never, CreateUserInput, User>('/api/users', async ({ request }) => {
    const body = await request.json();
    // ^ body: CreateUserInput — type-safe!
    return HttpResponse.json({
      id: '2', ...body, role: body.role ?? 'user', createdAt: new Date().toISOString(),
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

> 🔬 **Experiment:** Create a type-safe mock for a service with three
> methods. Compare the approaches:
>
> ```typescript
> interface ApiClient {
>   get<T>(url: string): Promise<T>;
>   post<T>(url: string, body: unknown): Promise<T>;
>   delete(url: string): Promise<void>;
> }
>
> // Approach 1: Partial + cast
> const mock1 = { get: vi.fn() } as unknown as ApiClient;
>
> // Approach 2: Factory with defaults
> const mock2 = createMock<ApiClient>({ get: vi.fn() });
>
> // Approach 3: vi.mocked after vi.mock
> vi.mock('./api-client');
> const mock3 = vi.mocked(new ApiClient());
>
> // Question: Which approach gives the best type safety?
> // Answer: Approach 3 (vi.mocked) — all methods are typed mocks
> ```

---

## What you've learned

- `vi.fn<Signature>()` and `jest.fn<Return, Params>()` create typed mocks
- Partial mock with `as unknown as T` is pragmatic but loses type safety for un-mocked methods
- `vi.mocked()` / `jest.mocked()` converts module imports into typed mock objects
- Angular's `jasmine.createSpyObj<T>()` checks method names against the interface
- MSW mocks at the network level with typed request/response generics

**Core concept to remember:** Mocking and TypeScript are in natural tension: mocks are "partial implementations", TypeScript wants "completeness". The solution: factory functions that provide all methods as empty mocks, and vi.mocked() for module mocks. Never use `as any` — it defeats the purpose of typed tests.

---

> **Pause point** — Mocking is mastered. The next section
> brings something new: tests that check TYPES, not values.
>
> Continue with: [Section 04: Type Testing](./04-type-testing.md)