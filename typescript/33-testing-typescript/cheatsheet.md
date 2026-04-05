# Cheatsheet: Testing TypeScript

Schnellreferenz fuer Lektion 33.

---

## Test-Setup

```bash
# Vitest (empfohlen fuer TS-Projekte)
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

## expect() Typen

```typescript
expect(42).toBe(42);             // T = number ✓
expect("hello").toBe("hello");   // T = string ✓
// expect(42).toBe("hello");     // Compile-Error: string ≠ number

expect([1,2,3]).toContain(2);    // Element-Typ number ✓
expect(user).toEqual({ name: "Max", age: 30 }); // Struktureller Check
```

---

## Mocking

```typescript
// Typisierter Mock
const mockFn = vi.fn<(id: string) => Promise<User>>();
mockFn.mockResolvedValue(testUser); // Muss User sein!

// Modul mocken + Typ casten
vi.mock('./user-service');
const service = vi.mocked(new UserService());
service.getUser.mockResolvedValue(testUser); // Jetzt typsicher!

// Partial Mock (pragmatisch)
const mock = {
  getUser: vi.fn(),
} as unknown as UserService;

// Angular SpyObj
const spy = jasmine.createSpyObj<UserService>('svc', ['getUser', 'listUsers']);
```

---

## Type-Testing

```typescript
import { expectTypeOf } from 'vitest';

// Exakter Typ-Check
expectTypeOf(result).toEqualTypeOf<string>();
expectTypeOf(result).not.toBeAny();

// Zuweisbarkeit
expectTypeOf<string>().toMatchTypeOf<string | number>(); // ✓

// Funktion-Checks
expectTypeOf(add).returns.toBeNumber();
expectTypeOf(add).parameter(0).toBeNumber();

// tsd (fuer Libraries)
import { expectType, expectError } from 'tsd';
expectType<string>(identity("hello"));
expectError(identity()); // Prueft: KOMPILIERT NICHT
```

---

## Test-Factories

```typescript
// Factory mit Partial<T>
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

// Verwendung
const admin = createTestUser({ role: 'admin' });
// Nur das Relevante ueberschreiben!

// Generische Factory
function createFactory<T>(defaults: T): (overrides?: Partial<T>) => T {
  return (overrides) => ({ ...defaults, ...overrides });
}
```

---

## Test-Builder

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

## Framework-Tests

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

// MSW (framework-unabhaengig)
const handlers = [
  http.get('/api/users', () => HttpResponse.json([testUser])),
];
const server = setupServer(...handlers);
```

---

## Entscheidungshilfe

| Frage | Antwort |
|---|---|
| Vitest oder Jest? | Vitest fuer neue TS-Projekte, Jest fuer Angular |
| Typ-Tests schreiben? | Ja fuer Libraries und Utility Types |
| vi.fn() oder vi.fn<T>()? | IMMER vi.fn<T>() — vermeidet any |
| Mocking: Partial oder vi.mocked? | vi.mocked fuer Module, Partial fuer DI |
| MSW oder HttpClientTestingModule? | MSW fuer framework-unabhaengige Tests |

---

## Haeufige Fehler

| Fehler | Problem | Loesung |
|---|---|---|
| vi.fn() ohne Typparameter | Mock ist any — keine Pruefung | vi.fn<Signatur>() |
| Test-Daten in jedem Test manuell | Duplikation, Wartungsaufwand | Factory-Funktionen |
| describe mit async | Compile-Error oder Laufzeitfehler | beforeAll fuer async Setup |
| expect() narrowt nicht | expect(x).not.toBeNull() aendert den Typ nicht | Explizites if-Narrowing |
| strict: false in Tests | any schleicht sich ein | Immer strict: true |
