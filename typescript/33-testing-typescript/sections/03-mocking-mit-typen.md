# Sektion 3: Mocking mit Typen — vi.fn, jest.Mock, Partial<T>

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Typing von Tests](./02-typing-von-tests.md)
> Naechste Sektion: [04 - Type-Testing](./04-type-testing.md)

---

## Was du hier lernst

- Wie `vi.fn()` und `jest.fn()` typisierte Mock-Funktionen erstellen
- Das Pattern `Partial<T>` fuer teilweise gemockte Objekte
- Wie du Dependencies typsicher mocken kannst (Module, Services, APIs)
- Warum Mocking und TypeScript sich gegenseitig beissen — und wie du das loest

---

## Das Grundproblem: Mocks brechen Typen

Mocking bedeutet: Du ersetzt echte Implementierungen durch Fakes.
Aber TypeScript erwartet die **echte** Typsignatur. Das fuehrt zu
einem fundamentalen Konflikt:

```typescript
// Der echte Service
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(input: CreateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

// Du willst nur getUser mocken — aber TypeScript will ALLE Methoden:
const mock: UserService = {
  getUser: vi.fn(),
  // createUser fehlt! → Compile-Error
  // deleteUser fehlt! → Compile-Error
};
```

> 📖 **Hintergrund: Structural Typing vs Mocking**
>
> TypeScript's strukturelles Typsystem verlangt, dass ein Objekt ALLE
> Properties seines Typs hat. Mocking braucht aber oft nur einen Teil.
> In Java/C# kann ein Framework wie Mockito automatisch alle Methoden
> mit Stubs fuellen. In TypeScript gibt es kein automatisches Stubbing
> — du musst explizit sein.
>
> Verschiedene Loesungen haben sich entwickelt: Partial<T>,
> Mocking-Libraries (vitest-mock-extended, jest-mock-extended),
> Dependency Injection, und "Ports and Adapters" (nur Interfaces
> mocken, nicht Implementierungen).

---

## vi.fn() und jest.fn(): Typisierte Mocks

```typescript annotated
// vi.fn() ohne Typparameter — ergibt Mock<any>
const mockFn = vi.fn();
mockFn("anything"); // OK — keine Typ-Pruefung!
// Das ist wie 'any' — unsicher.

// vi.fn() MIT Typparameter — typsicher
const mockGetUser = vi.fn<(id: string) => Promise<User>>();
// ^ Signatur wird durch den Typparameter definiert
mockGetUser("123");       // ✓ id ist string
// mockGetUser(123);       // ✗ Compile-Error: number ist nicht string
// mockGetUser();           // ✗ Compile-Error: id fehlt

// Mock-Rueckgabewert setzen — muss zum Rueckgabetyp passen
mockGetUser.mockResolvedValue({ id: "1", name: "Max", email: "max@test.de", role: "user", createdAt: "2024-01-01" });
// ^ Muss ALLE User-Felder haben — TypeScript prueft!

// mockGetUser.mockResolvedValue({ name: "Max" });
// ^ Compile-Error: id, email, role fehlen!
```

### jest.Mock — Aehnlich, andere Syntax

```typescript annotated
// Jest-Aequivalent
const mockGetUser = jest.fn<Promise<User>, [string]>();
// ^ <Rueckgabetyp, Parameter-Tupel>
// Beachte: Jest und Vitest haben leicht verschiedene Generics!

// Vitest: vi.fn<(id: string) => Promise<User>>()
// Jest:   jest.fn<Promise<User>, [string]>()
```

> 💭 **Denkfrage:** Warum haben Vitest und Jest verschiedene
> Mock-Signaturen? Ist das ein Problem?
>
> **Antwort:** Historisch gewachsen. Jest kam zuerst (2014) mit einer
> einfachen Generics-Signatur. Vitest (2022) nutzte eine modernere
> Form: die Funktion als einzelner Typparameter. In der Praxis ist
> Vitest's Signatur ergonomischer — `vi.fn<typeof realFunction>()`
> funktioniert direkt.

---

## Pattern 1: Partial Mock mit Type Assertion

Die pragmatischste Loesung fuer das "alle Methoden"-Problem:

```typescript annotated
// Service-Interface
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(input: CreateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<User[]>;
}

// Partial Mock — nur die Methoden die du brauchst
const mockService = {
  getUser: vi.fn<(id: string) => Promise<User>>(),
} as unknown as UserService;
// ^ Doppelter Cast: Objekt → unknown → UserService
// ACHTUNG: Nicht-gemockte Methoden sind undefined zur Laufzeit!

// Verwendung:
mockService.getUser.mockResolvedValue(testUser);
const result = await mockService.getUser("1");
// ^ result: User — typsicher

// Sicherere Alternative: Partial<T>
function createMockUserService(overrides: Partial<UserService> = {}): UserService {
  return {
    getUser: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
    listUsers: vi.fn(),
    ...overrides,
    // ^ Defaults + Overrides — alles ist ein Mock
  } as UserService;
}

const mock = createMockUserService({
  getUser: vi.fn<(id: string) => Promise<User>>().mockResolvedValue(testUser),
});
// Jetzt existieren ALLE Methoden (als leere Mocks)
```

---

## Pattern 2: vi.mocked() fuer Module

```typescript annotated
// Modul mocken
vi.mock('./user-service', () => ({
  UserService: vi.fn().mockImplementation(() => ({
    getUser: vi.fn(),
    createUser: vi.fn(),
  })),
}));

// PROBLEM: TypeScript kennt den Mock-Typ nicht
import { UserService } from './user-service';
const service = new UserService();
// ^ service: UserService — aber getUser ist ein Mock!
// service.getUser.mockResolvedValue(...) — Compile-Error!
// TypeScript sieht getUser als regulaere Methode, nicht als Mock.

// LOESUNG: vi.mocked() / jest.mocked()
const mockedService = vi.mocked(service);
// ^ mockedService: Mocked<UserService> — alle Methoden sind Mock-Typen!
mockedService.getUser.mockResolvedValue(testUser);
// ^ Jetzt OK! .mockResolvedValue ist verfuegbar
```

> 🧠 **Erklaere dir selbst:** Was macht `vi.mocked()` intern?
> Wie kann es den Typ von `UserService` in `Mocked<UserService>`
> umwandeln, ohne den Laufzeit-Wert zu aendern?
>
> **Kernpunkte:** vi.mocked() ist ein reiner Typ-Cast (zur Laufzeit
> ein No-Op) | Es ersetzt alle Methoden-Typen durch Mock-Typen |
> Mocked<T> ist ein Mapped Type der jede Methode in eine Mock-Funktion
> umwandelt | Das funktioniert nur wenn das Modul vorher mit
> vi.mock() gemockt wurde!

---

## Pattern 3: Dependency Injection und Mocking

In Angular ist DI native — und ideal fuer Mocking:

```typescript annotated
// Angular Test mit DI und Mock
describe('UserComponent', () => {
  let component: UserComponent;
  let mockUserService: jasmine.SpyObj<UserService>;
  // ^ SpyObj<T> ist Angulars typisierter Mock-Typ

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj<UserService>('UserService', ['getUser', 'listUsers']);
    // ^ createSpyObj erstellt ein Objekt mit Spy-Methoden
    // Die Array-Elemente MUESSEN Methoden von UserService sein!
    // ['getUsr'] → Compile-Error (Tippfehler erkannt!)

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: mockUserService },
        // ^ DI ersetzt den echten Service durch den Mock
      ],
    });

    component = TestBed.inject(UserComponent);
  });

  it('loads user on init', async () => {
    mockUserService.getUser.and.returnValue(Promise.resolve(testUser));
    // ^ Typsicher: returnValue muss Promise<User> sein

    await component.ngOnInit();
    expect(mockUserService.getUser).toHaveBeenCalledWith('1');
    // ^ Typsicher: toHaveBeenCalledWith prueft die Argumente
  });
});
```

> ⚡ **Praxis-Tipp fuer Angular:** `jasmine.createSpyObj<T>()` mit
> dem Typparameter ist die sicherste Art in Angular zu mocken. Es
> prueft die Methoden-Namen gegen das Interface — Tippfehler werden
> sofort erkannt. Seit Angular 16+ mit Jest: `jest.mocked()` ist
> die Alternative.

---

## Pattern 4: API-Mocking mit MSW

Mock Service Worker (MSW) mockt auf Netzwerk-Ebene:

```typescript annotated
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Handler definieren — typsicher mit Generics
const handlers = [
  http.get<never, never, User[]>('/api/users', () => {
    // ^ <Params, RequestBody, ResponseBody>
    return HttpResponse.json([
      { id: '1', name: 'Max', email: 'max@test.de', role: 'user', createdAt: '2024-01-01' },
    ]);
    // ^ TypeScript prueft: Das Array muss User[] entsprechen
  }),

  http.post<never, CreateUserInput, User>('/api/users', async ({ request }) => {
    const body = await request.json();
    // ^ body: CreateUserInput — typsicher!
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

> 🔬 **Experiment:** Erstelle einen typsicheren Mock fuer einen
> Service mit drei Methoden. Vergleiche die Ansaetze:
>
> ```typescript
> interface ApiClient {
>   get<T>(url: string): Promise<T>;
>   post<T>(url: string, body: unknown): Promise<T>;
>   delete(url: string): Promise<void>;
> }
>
> // Ansatz 1: Partial + cast
> const mock1 = { get: vi.fn() } as unknown as ApiClient;
>
> // Ansatz 2: Factory mit Defaults
> const mock2 = createMock<ApiClient>({ get: vi.fn() });
>
> // Ansatz 3: vi.mocked nach vi.mock
> vi.mock('./api-client');
> const mock3 = vi.mocked(new ApiClient());
>
> // Frage: Welcher Ansatz gibt die beste Typ-Sicherheit?
> // Antwort: Ansatz 3 (vi.mocked) — alle Methoden sind typisierte Mocks
> ```

---

## Was du gelernt hast

- `vi.fn<Signatur>()` und `jest.fn<Return, Params>()` erstellen typisierte Mocks
- Partial Mock mit `as unknown as T` ist pragmatisch aber verliert Typ-Sicherheit fuer nicht-gemockte Methoden
- `vi.mocked()` / `jest.mocked()` wandelt Modul-Importe in typisierte Mock-Objekte um
- Angular's `jasmine.createSpyObj<T>()` prueft Methoden-Namen gegen das Interface
- MSW mockt auf Netzwerk-Ebene mit typisierten Request/Response-Generics

**Kernkonzept zum Merken:** Mocking und TypeScript stehen in natuerlicher Spannung: Mocks sind "Teilimplementierungen", TypeScript will "Vollstaendigkeit". Die Loesung: Factory-Funktionen die alle Methoden als leere Mocks bereitstellen, und vi.mocked() fuer Modul-Mocks. Niemals `as any` — das zerstoert den Sinn von typisierten Tests.

---

> **Pausenpunkt** — Mocking ist gemeistert. Die naechste Sektion
> bringt etwas Neues: Tests die TYPEN pruefen, nicht Werte.
>
> Weiter geht es mit: [Sektion 04: Type-Testing](./04-type-testing.md)
