# Section 6: Practice — Angular TestBed, React Testing Library

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Test Patterns](./05-test-patterns.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- How Angular's TestBed uses TypeScript types and where its limits are
- How React Testing Library works with TypeScript
- Type-safe component tests in both frameworks
- Patterns that work in Angular AND React

---

## Angular TestBed: Type-Safe Component Tests

Angular's TestBed is strongly typed — but with some gaps:

```typescript annotated
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from './user.service';

describe('UserListComponent', () => {
  let component: UserListComponent;
  // ^ Type is exactly UserListComponent — full autocomplete
  let fixture: ComponentFixture<UserListComponent>;
  // ^ ComponentFixture<T> is generic — T determines the component type
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(async () => {
    mockUserService = {
      getUsers: jest.fn(),
      getUser: jest.fn(),
      createUser: jest.fn(),
      deleteUser: jest.fn(),
    } as jest.Mocked<UserService>;

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      // ^ Standalone components are imported
      providers: [
        { provide: UserService, useValue: mockUserService },
        // ^ DI replaces the real service — type is preserved
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    // ^ createComponent<T>() returns ComponentFixture<T>
    component = fixture.componentInstance;
    // ^ componentInstance: UserListComponent — type-safe!
  });

  it('should display users', async () => {
    const testUsers = [
      createTestUser({ name: 'Max' }),
      createTestUser({ name: 'Anna', id: 'user-2' }),
    ];

    mockUserService.getUsers.mockResolvedValue(testUsers);
    // ^ mockResolvedValue only accepts User[] (inferred from the service type)

    fixture.detectChanges();
    await fixture.whenStable();

    const userElements = fixture.nativeElement.querySelectorAll('.user-name');
    // ^ userElements: NodeListOf<Element> — DOM queries are generic
    expect(userElements.length).toBe(2);
    expect(userElements[0].textContent).toContain('Max');
  });
});
```

> 📖 **Background: TestBed's Type Limits**
>
> Angular's TestBed is excellently typed for component instances
> and services. But: DOM queries (`querySelector`, `querySelectorAll`)
> return generic `Element` types — not component-specific types.
> That is a fundamental HTML limitation, not an Angular problem.
> Harness APIs (ComponentHarness) partially address this.

---

## Angular ComponentHarness: Type-Safe DOM Interaction

```typescript annotated
// Angular CDK Component Harnesses provide type-safe DOM access:
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('UserListComponent with Harness', () => {
  let loader: HarnessLoader;

  beforeEach(() => {
    // ... TestBed setup ...
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should have a delete button for each user', async () => {
    const buttons = await loader.getAllHarnesses(MatButtonHarness.with({
      text: /Delete/,
    }));
    // ^ buttons: MatButtonHarness[] — type-safe!

    expect(buttons.length).toBe(2);
    await buttons[0].click();
    // ^ click() is a type-safe method on MatButtonHarness
    // No querySelector('.mat-button') needed!
  });
});
```

> 💭 **Think about it:** Why are Component Harnesses more type-safe than
> `querySelector`? Both interact with the DOM.
>
> **Answer:** Harnesses encapsulate DOM details behind a typed API.
> `MatButtonHarness.click()` is type-safe — `querySelector('.btn').click()`
> could be null (element doesn't exist) and has the generic Element type.
> Harnesses also abstract away DOM structure changes.

---

## React Testing Library: Type-Safe Tests

React Testing Library (@testing-library/react) has solid TypeScript support:

```typescript annotated
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserList } from './UserList';

describe('UserList', () => {
  it('renders users', async () => {
    const testUsers = [
      createTestUser({ name: 'Max' }),
      createTestUser({ name: 'Anna', id: 'user-2' }),
    ];

    render(<UserList users={testUsers} />);
    // ^ render() accepts ReactElement — TypeScript checks the props!
    // render(<UserList />); → Compile error: 'users' is missing!

    expect(screen.getByText('Max')).toBeInTheDocument();
    // ^ getByText() returns HTMLElement — type-safe
    expect(screen.getByText('Anna')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn<(id: string) => void>();
    // ^ Mock with typed signature

    render(
      <UserList
        users={[createTestUser()]}
        onDelete={onDelete}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /delete/i }));
    // ^ getByRole is type-safe — 'button' is a valid ARIA role

    expect(onDelete).toHaveBeenCalledWith('user-1');
    // ^ Argument is checked against the mock signature
  });
});
```

### Type-Safe Custom Render

```typescript annotated
// test-utils.tsx — Custom render with providers
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface CustomRenderOptions extends RenderOptions {
  queryClient?: QueryClient;
  // ^ Optional QueryClient for tests
}

function customRender(
  ui: React.ReactElement,
  // ^ ReactElement — type-safe
  options?: CustomRenderOptions
) {
  const queryClient = options?.queryClient ?? new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
    ...options,
  });
}

export { customRender as render };
// ^ Re-export as 'render' — drop-in replacement
```

> ⚡ **Practical tip:** In your project: Create a `test-utils` module
> that wraps all providers. Import `render` from there instead of
> directly from `@testing-library/react`. That way you don't need to
> manually wrap providers in every test.

---

## Cross-Framework Patterns

Patterns that work in Angular AND React:

### Pattern 1: Abstract and test service/hook logic

```typescript annotated
// Independent of the framework: the logic is the same
interface UserActions {
  loadUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  canDelete(user: User, currentUser: User): boolean;
}

// Tests for the LOGIC — framework-independent:
describe('canDelete', () => {
  it('admin can delete any user', () => {
    const admin = createTestUser({ role: 'admin' });
    const user = createTestUser({ id: 'user-2' });
    expect(canDelete(admin, user)).toBe(true);
  });

  it('user cannot delete others', () => {
    const user1 = createTestUser({ id: 'user-1' });
    const user2 = createTestUser({ id: 'user-2' });
    expect(canDelete(user1, user2)).toBe(false);
  });
});
// ^ These tests are identical in Angular and React!
```

### Pattern 2: API Mock Layer

```typescript annotated
// Centralized API mocking — for Angular AND React tests
import { http, HttpResponse } from 'msw';

export const userHandlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      createTestUser({ name: 'Max' }),
      createTestUser({ name: 'Anna', id: 'user-2' }),
    ]);
  }),
  http.delete<{ id: string }>('/api/users/:id', ({ params }) => {
    return new HttpResponse(null, { status: 204 });
  }),
];

// In Angular tests:
const server = setupServer(...userHandlers);
// In React tests:
const server = setupServer(...userHandlers);
// ^ Identical! MSW mocks at the network level.
```

> 🧠 **Explain it to yourself:** Why is MSW (Mock Service Worker)
> framework-independent, while Angular's HttpClientTestingModule
> and React's fetch-mocking are framework-specific?
>
> **Key points:** MSW operates at the network level — it intercepts
> fetch/XHR before the browser/Node executes them | Angular's
> HttpClientTestingModule mocks the Angular-specific HttpClient |
> MSW works with any HTTP client: fetch, axios, HttpClient

---

## Testing Strategy: The Pyramid with TypeScript

```typescript
// The test pyramid for TypeScript projects:
//
//                    /\
//                   /  \
//                  / E2E \          ← Cypress/Playwright (few)
//                 /--------\
//                /Integration\      ← Component tests, API tests
//               /--------------\
//              /    Unit Tests   \   ← Logic, utilities, types
//             /--------------------\
//            /     TypeScript Types  \ ← Compile-time checking (0 cost!)
//           /________________________\
//
// TypeScript IS the bottom layer: type checks are the cheapest "tests"
```

> 🔬 **Experiment:** Refactor an existing test in your project
> using the patterns from this lesson:
>
> ```typescript
> // BEFORE:
> it('test', () => {
>   const user = { id: '1', name: 'Max', email: 'max@test.de', role: 'admin' as const, createdAt: '2024' };
>   const post = { id: 'p1', title: 'Hello', content: '...', authorId: '1', published: true };
>   expect(canEditPost(user, post)).toBe(true);
> });
>
> // AFTER:
> it('admin can edit any post', () => {
>   const admin = createTestUser({ role: 'admin' });
>   const post = createTestPost({ authorId: 'other-user' });
>   expect(canEditPost(admin, post)).toBe(true);
> });
> // Clearer, shorter, only relevant data visible
> ```

---

## What you've learned

- Angular's TestBed is strongly typed — `ComponentFixture<T>` and DI mocking
- React Testing Library checks component props and ARIA roles in a type-safe way
- MSW is framework-independent and mocks at the network level
- Business logic should be tested in a framework-independent way
- TypeScript types are the "base layer" of the test pyramid — free checking

**Core concept to remember:** The best testing strategy with TypeScript: test logic framework-independently (unit), test components with Testing Library (integration), mock APIs with MSW (everywhere). TypeScript's types are your constantly running, free "test" — use them as a foundation, not as a replacement.

---

> **Pause point** — You have completed Lesson 33! You can now
> test TypeScript code at every level — from unit tests and type tests
> to framework-specific component tests.
>
> **Next lesson:** [L34: Performance & Compiler](../34-performance-compiler/sections/01-type-instantiation-limits.md)