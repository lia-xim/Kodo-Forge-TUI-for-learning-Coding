# Sektion 5: Test-Patterns — Fixtures, Factories, Builder

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Type-Testing](./04-type-testing.md)
> Naechste Sektion: [06 - Praxis: Angular TestBed, React Testing Library](./06-praxis-frameworks.md)

---

## Was du hier lernst

- Wie du typsichere Test-Fixtures mit Factories erstellst
- Das Builder-Pattern fuer komplexe Test-Daten (aus L26, hier fuer Tests)
- Wie Faker.js und @faker-js/faker mit TypeScript zusammenarbeiten
- Patterns fuer wiederverwendbare Test-Utilities

---

## Das Problem: Test-Daten Boilerplate

Jeder Test braucht Daten. Ohne System entsteht Duplikation:

```typescript
// SCHLECHT: Daten in jedem Test manuell
it('test 1', () => {
  const user = { id: '1', name: 'Max', email: 'max@test.de', role: 'user' as const, createdAt: '2024-01-01' };
  // ^ 5 Felder, in JEDEM Test wiederholt
});
it('test 2', () => {
  const user = { id: '2', name: 'Anna', email: 'anna@test.de', role: 'admin' as const, createdAt: '2024-01-01' };
  // ^ Fast identisch — nur name, email, role anders
});
```

> 📖 **Hintergrund: Test Data Patterns**
>
> Das Problem ist so alt wie Unit-Testing selbst. Martin Fowler
> beschrieb "Object Mother" (2006) — eine zentrale Klasse die
> Test-Objekte erzeugt. Spaeter kamen "Test Data Builders" auf,
> inspiriert vom Builder-Pattern (GoF). In der TypeScript-Welt
> haben sich **Factory-Funktionen** mit `Partial<T>` als
> pragmatischster Ansatz durchgesetzt — sie sind einfach, typsicher,
> und brauchen keine Library.

---

## Pattern 1: Factory-Funktionen mit Partial<T>

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
    // ^ Partial<User> erlaubt jedes Feld zu ueberschreiben
    // TypeScript prueft: Nur User-Felder sind erlaubt!
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

// Verwendung — minimal, typsicher, klar:
it('admin can delete posts', () => {
  const admin = createTestUser({ role: 'admin' });
  // ^ Nur das was fuer den Test relevant ist!
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

> 💭 **Denkfrage:** Warum nutzt `createTestUser` `Partial<User>`
> statt `Pick<User, 'role'>` fuer den overrides-Parameter? Was
> waere der Vorteil von Pick?
>
> **Antwort:** Partial<User> ist flexibler — jeder Test kann jedes
> Feld ueberschreiben. Pick<User, 'role'> wuerde nur 'role' erlauben.
> Der Nachteil von Partial: Du koenntest versehentlich ein Feld
> vergessen das fuer den Test wichtig ist. In der Praxis ist Partial
> pragmatischer — die Defaults decken die meisten Faelle ab.

---

## Pattern 2: Typsicherer Test-Builder

Fuer komplexe Test-Szenarien mit Beziehungen:

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
    // ^ 'this' als Rueckgabetyp fuer Method-Chaining (L26!)
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withRole(role: User['role']): this {
    // ^ User['role'] statt string — nur gueltige Rollen!
    this.data.role = role;
    return this;
  }

  asAdmin(): this {
    // ^ Convenience-Methode — semantisch klarer als withRole('admin')
    this.data.role = 'admin';
    this.data.email = `admin-${this.data.id}@example.com`;
    return this;
  }

  build(): User {
    return { ...this.data };
    // ^ Kopie zurueckgeben — Builder bleibt wiederverwendbar
  }
}

export const aUser = () => new TestUserBuilder();

// Verwendung — liest sich wie Prosa:
const admin = aUser().asAdmin().withName('Max').build();
const viewer = aUser().withRole('viewer').build();
```

---

## Pattern 3: Fixtures mit Kontext

Fuer Tests die zusammenhaengende Daten brauchen:

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

// Verwendung:
describe('Comment Moderation', () => {
  const fixture = createTestFixture();

  it('admin can delete any comment', () => {
    expect(canDeleteComment(fixture.admin, fixture.comments[0])).toBe(true);
    // ^ fixture.admin: User, fixture.comments[0]: Comment — typsicher!
  });

  it('user can only delete own comments', () => {
    expect(canDeleteComment(fixture.regularUser, fixture.comments[0])).toBe(true);
    expect(canDeleteComment(fixture.regularUser, fixture.comments[1])).toBe(false);
    // ^ comments[1] ist vom Admin — Regular User darf nicht loeschen
  });
});
```

> 🧠 **Erklaere dir selbst:** Warum ist ein `TestFixture`-Interface
> besser als lose Variablen (`const admin = ...`, `const post = ...`)?
>
> **Kernpunkte:** Fixture ist ein zusammenhaengendes Ganzes — IDs
> referenzieren sich gegenseitig | TypeScript prueft die Konsistenz |
> Fixtures sind wiederverwendbar ueber Tests hinweg | Destrukturierung
> macht Tests lesbar: `const { admin, userPost } = createTestFixture()`

---

## Pattern 4: Faker.js fuer realistische Daten

```typescript annotated
import { faker } from '@faker-js/faker';

// Factory mit Faker — jeder Aufruf erzeugt einzigartige Daten
export function createRandomUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    // ^ Einzigartiger UUID bei jedem Aufruf
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['admin', 'user', 'viewer'] as const),
    // ^ Zufaellige Rolle — 'as const' fuer den Literal-Typ!
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// Deterministische Tests mit Seed:
faker.seed(42);
const user1 = createRandomUser(); // Immer gleiche Daten mit Seed 42
faker.seed(42);
const user2 = createRandomUser(); // Identisch zu user1!
```

> ⚡ **Praxis-Tipp:** Faker.js hat exzellente TypeScript-Typen.
> `faker.helpers.arrayElement()` inferiert den Rueckgabetyp korrekt:
>
> ```typescript
> const role = faker.helpers.arrayElement(['admin', 'user'] as const);
> // ^ role: 'admin' | 'user' — nicht string!
> // Ohne 'as const': role waere string
> ```

---

## Pattern 5: Generische Factory-Funktion

Eine Factory die fuer JEDEN Typ funktioniert:

```typescript annotated
function createFactory<T>(defaults: T): (overrides?: Partial<T>) => T {
  return (overrides) => ({ ...defaults, ...overrides });
  // ^ Generisch: T wird aus defaults inferiert
  // ^ Rueckgabe: Funktion mit Partial<T> Parameter
}

// Einmalige Definition:
const createUser = createFactory<User>({
  id: '1', name: 'Test', email: 'test@test.de', role: 'user', createdAt: '2024-01-01',
});
const createPost = createFactory<Post>({
  id: '1', title: 'Test', content: 'Lorem', authorId: '1', published: false,
});

// Verwendung:
const user = createUser({ name: 'Max' });
// ^ user: User — volle Typ-Sicherheit
const post = createPost({ authorId: user.id, published: true });
// ^ post: Post
```

> 🔬 **Experiment:** Erweitere die generische Factory um eine
> "with"-Methode fuer Method-Chaining:
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
> // Was ist der Typ von user? Ist role 'admin' oder User['role']?
> // Antwort: User — build() gibt T zurueck. role ist User['role'] = 'admin' | 'user' | 'viewer'
> ```

---

## Was du gelernt hast

- Factory-Funktionen mit `Partial<T>` sind der pragmatischste Ansatz fuer Test-Daten
- Test-Builder (Method-Chaining) eignen sich fuer komplexe Szenarien mit Beziehungen
- Fixtures buendeln zusammenhaengende Daten mit konsistenten Referenzen
- Faker.js erzeugt realistische Daten mit korrekten TypeScript-Typen
- Generische Factory-Funktionen (`createFactory<T>`) vermeiden Boilerplate

**Kernkonzept zum Merken:** Gute Test-Daten zeigen NUR was fuer den Test relevant ist. `createTestUser({ role: 'admin' })` sagt: "Dieser Test prueft Admin-Verhalten." Alle anderen Felder sind irrelevant — die Factory fuellt sie mit sinnvollen Defaults.

---

> **Pausenpunkt** — Du hast eine solide Toolbox fuer Test-Daten.
> Die letzte Sektion bringt alles in den Framework-Kontext.
>
> Weiter geht es mit: [Sektion 06: Praxis — Angular TestBed, React Testing Library](./06-praxis-frameworks.md)
