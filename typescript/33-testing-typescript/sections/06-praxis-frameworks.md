# Sektion 6: Praxis — Angular TestBed, React Testing Library

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Test-Patterns](./05-test-patterns.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wie Angular's TestBed TypeScript-Typen nutzt und wo die Grenzen sind
- Wie React Testing Library mit TypeScript zusammenarbeitet
- Typsichere Component-Tests in beiden Frameworks
- Patterns die in Angular UND React funktionieren

---

## Angular TestBed: Typsichere Component-Tests

Angular's TestBed ist stark typisiert — aber mit einigen Luecken:

```typescript annotated
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from './user.service';

describe('UserListComponent', () => {
  let component: UserListComponent;
  // ^ Typ ist exakt UserListComponent — volle Autocomplete
  let fixture: ComponentFixture<UserListComponent>;
  // ^ ComponentFixture<T> ist generisch — T bestimmt den Component-Typ
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
      // ^ Standalone Components werden importiert
      providers: [
        { provide: UserService, useValue: mockUserService },
        // ^ DI ersetzt den echten Service — Typ bleibt erhalten
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    // ^ createComponent<T>() gibt ComponentFixture<T> zurueck
    component = fixture.componentInstance;
    // ^ componentInstance: UserListComponent — typsicher!
  });

  it('should display users', async () => {
    const testUsers = [
      createTestUser({ name: 'Max' }),
      createTestUser({ name: 'Anna', id: 'user-2' }),
    ];

    mockUserService.getUsers.mockResolvedValue(testUsers);
    // ^ mockResolvedValue akzeptiert nur User[] (vom Service-Typ inferiert)

    fixture.detectChanges();
    await fixture.whenStable();

    const userElements = fixture.nativeElement.querySelectorAll('.user-name');
    // ^ userElements: NodeListOf<Element> — DOM-Queries sind generisch
    expect(userElements.length).toBe(2);
    expect(userElements[0].textContent).toContain('Max');
  });
});
```

> 📖 **Hintergrund: TestBed's Typ-Grenzen**
>
> Angular's TestBed ist hervorragend typisiert fuer Component-Instanzen
> und Services. Aber: DOM-Queries (`querySelector`, `querySelectorAll`)
> geben generische `Element`-Typen zurueck — nicht komponentenspezifische
> Typen. Das ist eine fundamentale HTML-Limitierung, nicht ein Angular-
> Problem. Harness-APIs (ComponentHarness) loesen das teilweise.

---

## Angular ComponentHarness: Typ-sichere DOM-Interaktion

```typescript annotated
// Angular CDK Component Harnesses bieten typsichere DOM-Zugriffe:
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
    // ^ buttons: MatButtonHarness[] — typsicher!

    expect(buttons.length).toBe(2);
    await buttons[0].click();
    // ^ click() ist eine typsichere Methode auf MatButtonHarness
    // Kein querySelector('.mat-button') noetig!
  });
});
```

> 💭 **Denkfrage:** Warum sind Component Harnesses typsicherer als
> `querySelector`? Beide interagieren mit dem DOM.
>
> **Antwort:** Harnesses kapseln DOM-Details hinter einer typisierten
> API. `MatButtonHarness.click()` ist typsicher — `querySelector('.btn').click()`
> koennte null sein (Element existiert nicht) und hat den generischen
> Element-Typ. Harnesses abstrahieren auch DOM-Struktur-Aenderungen.

---

## React Testing Library: Typsichere Tests

React Testing Library (@testing-library/react) hat solide TypeScript-Unterstuetzung:

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
    // ^ render() akzeptiert ReactElement — TypeScript prueft die Props!
    // render(<UserList />); → Compile-Error: 'users' fehlt!

    expect(screen.getByText('Max')).toBeInTheDocument();
    // ^ getByText() gibt HTMLElement zurueck — typsicher
    expect(screen.getByText('Anna')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn<(id: string) => void>();
    // ^ Mock mit typisierter Signatur

    render(
      <UserList
        users={[createTestUser()]}
        onDelete={onDelete}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /delete/i }));
    // ^ getByRole ist typsicher — 'button' ist ein gueltiger ARIA-Role

    expect(onDelete).toHaveBeenCalledWith('user-1');
    // ^ Argument wird gegen die Mock-Signatur geprueft
  });
});
```

### Typsichere Custom Render

```typescript annotated
// test-utils.tsx — Custom Render mit Providern
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface CustomRenderOptions extends RenderOptions {
  queryClient?: QueryClient;
  // ^ Optionaler QueryClient fuer Tests
}

function customRender(
  ui: React.ReactElement,
  // ^ ReactElement — typsicher
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
// ^ Re-exportiere als 'render' — Drop-in-Replacement
```

> ⚡ **Praxis-Tipp:** In deinem Projekt: Erstelle ein `test-utils`-
> Modul das alle Provider wrappt. Importiere `render` von dort statt
> direkt von `@testing-library/react`. So brauchst du Provider nicht
> in jedem Test manuell wrappen.

---

## Cross-Framework Patterns

Patterns die in Angular UND React funktionieren:

### Pattern 1: Service/Hook abstrahieren und testen

```typescript annotated
// Unabhaengig vom Framework: Die Logik ist gleich
interface UserActions {
  loadUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  canDelete(user: User, currentUser: User): boolean;
}

// Tests fuer die LOGIK — framework-unabhaengig:
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
// ^ Diese Tests sind identisch in Angular und React!
```

### Pattern 2: API-Mock-Layer

```typescript annotated
// Zentrales API-Mocking — fuer Angular UND React Tests
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

// In Angular-Tests:
const server = setupServer(...userHandlers);
// In React-Tests:
const server = setupServer(...userHandlers);
// ^ Identisch! MSW mockt auf Netzwerk-Ebene.
```

> 🧠 **Erklaere dir selbst:** Warum ist MSW (Mock Service Worker)
> framework-unabhaengig, waehrend Angular's HttpClientTestingModule
> und React's fetch-Mocking framework-spezifisch sind?
>
> **Kernpunkte:** MSW operiert auf Netzwerk-Ebene — es interceptet
> fetch/XHR bevor der Browser/Node sie ausfuehrt | Angular's
> HttpClientTestingModule mockt den Angular-spezifischen HttpClient |
> MSW funktioniert mit jedem HTTP-Client: fetch, axios, HttpClient

---

## Testing-Strategie: Die Pyramide mit TypeScript

```typescript
// Die Test-Pyramide fuer TypeScript-Projekte:
//
//                    /\
//                   /  \
//                  / E2E \          ← Cypress/Playwright (wenige)
//                 /--------\
//                /Integration\      ← Component Tests, API Tests
//               /--------------\
//              /    Unit Tests   \   ← Logik, Utilities, Typen
//             /--------------------\
//            /     TypeScript-Typen  \ ← Compilezeit-Pruefung (0 Kosten!)
//           /________________________\
//
// TypeScript IST die unterste Schicht: Type-Checks sind die billigsten "Tests"
```

> 🔬 **Experiment:** Refactore einen bestehenden Test in deinem Projekt
> mit den Patterns aus dieser Lektion:
>
> ```typescript
> // VORHER:
> it('test', () => {
>   const user = { id: '1', name: 'Max', email: 'max@test.de', role: 'admin' as const, createdAt: '2024' };
>   const post = { id: 'p1', title: 'Hello', content: '...', authorId: '1', published: true };
>   expect(canEditPost(user, post)).toBe(true);
> });
>
> // NACHHER:
> it('admin can edit any post', () => {
>   const admin = createTestUser({ role: 'admin' });
>   const post = createTestPost({ authorId: 'other-user' });
>   expect(canEditPost(admin, post)).toBe(true);
> });
> // Klarer, kuerzer, nur relevante Daten sichtbar
> ```

---

## Was du gelernt hast

- Angular's TestBed ist stark typisiert — `ComponentFixture<T>` und DI-Mocking
- React Testing Library prueft Component-Props und ARIA-Roles typsicher
- MSW ist framework-unabhaengig und mockt auf Netzwerk-Ebene
- Business-Logik sollte framework-unabhaengig getestet werden
- TypeScript-Typen sind die "Basis-Schicht" der Test-Pyramide — kostenlose Pruefung

**Kernkonzept zum Merken:** Die beste Teststrategie mit TypeScript: Logik framework-unabhaengig testen (Unit), Components mit Testing Library testen (Integration), APIs mit MSW mocken (ueberall). TypeScript's Typen sind dein staendig laufender, kostenloser "Test" — nutze sie als Fundament, nicht als Ersatz.

---

> **Pausenpunkt** — Du hast Lektion 33 abgeschlossen! Du kannst jetzt
> TypeScript-Code auf jeder Ebene testen — von Unit-Tests ueber Typ-Tests
> bis hin zu Framework-spezifischen Component-Tests.
>
> **Naechste Lektion:** [L34: Performance & Compiler](../34-performance-compiler/sections/01-type-instantiation-limits.md)
