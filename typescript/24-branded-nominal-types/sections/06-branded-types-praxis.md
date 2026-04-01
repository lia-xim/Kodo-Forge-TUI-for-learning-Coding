# Sektion 6: Branded Types in Angular & React — Praxis

> Geschätzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Praktische Patterns](./05-praktische-patterns.md)
> Nächste Sektion: -- (Ende von L24)

---

## Was du hier lernst

- Wie Branded Types in **Angular-Services und HTTP-Clients** eingesetzt werden
- **React Query / React Hook Form** mit Branded Types
- Wann Branded Types sich **nicht** lohnen (Over-Engineering Warning)
- Eine komplette **Architektur-Entscheidung** für ein echtes Projekt

---

## Branded Types in Angular-Services

Angular-Services sind ein natürlicher Ort für Branded Types — sie definieren
die Grenze zwischen externen Daten (HTTP-Responses) und internem typsicherem Code.

> **Hintergrund: Domain-Driven Design und Anti-Corruption Layers**
>
> In Domain-Driven Design (DDD) gibt es das Konzept des **Anti-Corruption Layers
> (ACL)**: Eine Schicht die externe Daten (APIs, Datenbanken) in interne,
> domänen-spezifische Typen konvertiert.
>
> Eric Evans beschreibt in "Domain-Driven Design" (2003):
> *"Use an acyclic layer to separate domain from infrastructure. The layer
> translates between the two models."*
>
> Branded Types sind ein modernes TypeScript-Werkzeug für genau diesen ACL:
> Am Rand der Anwendung (Services, Adapters) werden externe Strings zu typisierten
> Brands. Im Inneren der Anwendung existiert nur noch typsicherer Code.

```typescript annotated
// user.types.ts — Domain Typen
type Brand<T, B> = T & { readonly __brand: B };

export type UserId    = Brand<string, 'UserId'>;
export type Email     = Brand<string, 'Email'>;
export type UserName  = Brand<string, 'UserName'>;

// Validierungs-Funktionen:
export function createUserId(raw: string): UserId {
  if (!raw.startsWith('user-') || raw.length < 10) {
    throw new Error(`Ungültige UserId: "${raw}"`);
  }
  return raw as UserId;
}

// api-response.types.ts — Raw API Response (noch nicht typisiert!)
interface RawUserApiResponse {
  id: string;       // Noch plain string — kommt von der API
  email: string;    // Noch plain string
  name: string;
}

// user-mapper.ts — Anti-Corruption Layer
function mapUserFromApi(raw: RawUserApiResponse): User {
  return {
    id: createUserId(raw.id),     // string → UserId (validiert!)
    email: raw.email as Email,   // Einfacher Cast — TODO: Email validieren
    name: raw.name as UserName,
  };
}

interface User {
  id: UserId;
  email: Email;
  name: UserName;
}
```

Jetzt der Angular-Service:

```typescript annotated
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  // Gibt immer getipte User zurück, nie RawApiResponse:
  getUser(id: UserId): Observable<User> {
    // 'id' verhält sich wie string im Template Literal:
    return this.http.get<RawUserApiResponse>(`/api/users/${id}`)
      .pipe(map(raw => mapUserFromApi(raw)));
      // ^ Anti-Corruption Layer: raw → User mit Brands
  }

  // Nur UserId akzeptiert — nicht irgendein string:
  deleteUser(id: UserId): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }

  // Kein Aufruf möglich mit falscher ID:
  // service.getUser(orderId); // ❌ COMPILE-ERROR
}

// In der component:
@Component({ /* ... */ })
export class UserDetailComponent {
  user$: Observable<User>;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.user$ = this.route.params.pipe(
      map(params => createUserId(params['id'])),
      // ^ Route-Parameter wird sofort zu UserId konvertiert
      switchMap(userId => this.userService.getUser(userId))
    );
  }
}
```

> 🧠 **Erkläre dir selbst:** Warum erstellen wir in `UserDetailComponent` den
> `UserId` aus dem Route-Parameter, statt es im Service zu tun? Was ist der Vorteil?
>
> **Kernpunkte:** Konversion so früh wie möglich | Component ist "Eintrittspunkt"
> der User-Eingabe (Route-Params) | Service arbeitet nur noch mit validierten Typen |
> Fehler (ungültige ID) werden explizit behandelt — nicht heimlich ignoriert

---

## Branded Types mit React Query und React Hook Form

In React-Projekten glänzen Branded Types besonders in Query-Keys und Form-Handling:

```typescript annotated
// React Query mit typsicheren Query-Keys
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

// Query-Key Factory — verhindert Key-Verwechslungen:
const userKeys = {
  all: ['users'] as const,
  detail: (id: UserId) => ['users', id] as const,  // UserId im Key-Array!
  posts: (id: UserId) => ['users', id, 'posts'] as const,
};

// Hooks mit typisierten Parametern:
function useUser(userId: UserId) {
  return useQuery({
    queryKey: userKeys.detail(userId),  // ✅ UserId required
    queryFn: () => fetchUser(userId),
  });
}

function useUserPosts(userId: UserId) {
  return useQuery({
    queryKey: userKeys.posts(userId),
    queryFn: () => fetchUserPosts(userId),
  });
}

// Verwendung in Component:
function UserProfile({ userId }: { userId: UserId }) {
  const { data: user } = useUser(userId);      // ✅
  const { data: posts } = useUserPosts(userId); // ✅

  return <div>{user?.name}</div>;
  // 'userId' funktioniert direkt als string in JSX-Props!
}

// React Hook Form mit Branded Types:
type Email = Brand<string, 'Email'>;

interface RegisterFormValues {
  email: string;  // Im Form: plain string (User tippt)
  name: string;
}

interface RegisterCommand {
  email: Email;   // Nach Validierung: Branded
  name: UserName;
}

function RegisterForm() {
  const { register, handleSubmit } = useForm<RegisterFormValues>();

  const onSubmit = (values: RegisterFormValues) => {
    // Validierung + Konversion:
    const cmd: RegisterCommand = {
      email: values.email as Email, // TODO: Validierung hinzufügen
      name: values.name as UserName,
    };
    registerUser(cmd);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      <button type="submit">Registrieren</button>
    </form>
  );
}
```

> **Experiment:** Öffne `examples/04-angular-react.ts` und implementiere:
> 1. Einen vollständigen `ProductService` mit `ProductId = Brand<string, 'ProductId'>`.
> 2. `getProduct(id: ProductId)` und `deleteProduct(id: ProductId)`.
> 3. Versuche im Kommentar den Service mit `orderId` aufzurufen — was passiert?

---

## Wann Branded Types sich NICHT lohnen

Over-Engineering Warning: Nicht überall sind Branded Types sinnvoll.

```typescript annotated
// ❌ Over-Engineering — hier nicht sinnvoll:
type Width  = number & { __brand: 'Width' };
type Height = number & { __brand: 'Height' };
type Area   = number & { __brand: 'Area' };

function area(w: Width, h: Height): Area {
  return (w * h) as Area;
}

// Problem: Woher kommen Width und Height?
const w = 800 as Width;   // Ständige As-Casts → nervend!
const h = 600 as Height;
const a = area(w, h);

// Hier wäre das simpler:
function simpleArea(w: number, h: number): number {
  return w * h;
}
// Keine verwechslungsgefahr bei 2 lokalen Variablen!
```

**Faustregel:** Branded Types lohnen sich wenn:

| Kriterium | Ja → Brand | Nein → Plain Type |
|-----------|:---------:|:-----------------:|
| Können Typen verwechselt werden? | ✅ | ❌ |
| Gibt es Validierung die immer laufen soll? | ✅ | ❌ |
| Wird der Wert durch APIs propagiert? | ✅ | ❌ |
| Ist der Code sicherheitskritisch? | ✅ | ❌ |
| Ist es eine kleine, lokale Berechnung? | ❌ | ✅ |
| Werden Brands überall als-Gecastet? | ❌ | ✅ |

> 💭 **Denkfrage:** Wann hört nützliche Abstraktion auf und fängt Over-Engineering
> an? Bei Branded Types ist die Grenze: "Würde ein Verwechsler ohne Brand einen
> echten Bug verursachen?" Wenn ja → Brand. Wenn nein → Plain Type.
>
> **Antwort:** Das YAGNI-Prinzip ("You Ain't Gonna Need It") gilt auch hier.
> Füge Brands hinzu wenn ein konkretes Problem besteht, nicht vorsichtshalber.
> Dependencies und TypeScript-Komplexität sind auch Kosten.

---

## Vollständige Architektur-Entscheidung

Hier ist eine pragmatische Strategie für ein echtes Projekt:

```typescript
// SCHICHT 1: Domain Types (Brands verwenden)
// ─────────────────────────────────────────
// Verwende Brands für alles was durch APIs/Datenbanken fließt:
export type UserId    = Brand<string, 'UserId'>;
export type Email     = Brand<string, 'Email'>;
export type OrderId   = Brand<string, 'OrderId'>;

// SCHICHT 2: Application Layer (Smart Constructors)
// ─────────────────────────────────────────────────
// Nur Services und Mapper direkt mit Brands arbeiten:
function mapUserFromDb(row: DbUserRow): User {
  return {
    id: row.id as UserId,        // DB liefert valid IDs
    email: createEmail(row.email), // Email validieren
  };
}

// SCHICHT 3: UI Layer (Brands transparent)
// ─────────────────────────────────────────
// Components empfangen bereits getipte Daten von Services:
function UserCard({ user }: { user: User }) {
  // user.id ist UserId — kann direkt als string in JSX verwendet werden:
  return <div key={user.id}>{user.email}</div>;
  // Kein Casten nötig — JSX akzeptiert 'UserId extends string'
}

// SCHICHT 4: Events/Commands (Brands in Commands)
// ─────────────────────────────────────────────────
interface DeleteUserCommand {
  userId: UserId; // Command enthält Branded ID
}
```

> **In deinem Angular-Projekt** kannst du das sofort anwenden:
>
> ```typescript
> // Schritt 1: types/domain.ts — alle Branded Types
> export type UserId = Brand<string, 'UserId'>;
> export type Email  = Brand<string, 'Email'>;
>
> // Schritt 2: services/user.service.ts — Smart Constructors + Mapping
> // Schritt 3: components/ — empfangen bereits getipte User-Objekte
>
> // Das Resultat: Die Component hat NIEMALS Kontakt mit rohen API-Strings.
> // Compile-Errors zeigen genau wo Typ-Verwechslungen auftreten könnten.
> ```

---

## Zusammenfassung: Branded Types — Wann was?

| Situation | Empfehlung |
|-----------|-----------|
| Entity-IDs (UserId, OrderId) | ✅ Immer Brand |
| Währungen und Einheiten | ✅ Immer Brand bei Mischgefahr |
| E-Mail, URL, UUID | ✅ Brand + Validierung im Constructor |
| Tokens, API-Keys | ✅ Immer Brand (Sicherheit!) |
| Lokale Berechnungen | ❌ Plain number reicht |
| Intern verwendete Helper-Strings | ❌ Oft Over-Engineering |

---

## Was du gelernt hast

- Branded Types gehören in den **Anti-Corruption Layer** — am Rand der Anwendung
  (Services, Mapper), nicht überall
- **Angular-Services**: `mapUserFromApi()` konvertiert raw strings zu Brands;
  danach arbeitet der gesamte interne Code typsicher
- **React Query**: Typisierte Query-Keys mit Brand-IDs verhindern Cache-Fehler
- **Over-Engineering Warning**: Brands wo lokale Variablen ausreichen → Kosten ohne Nutzen

> 🧠 **Erkläre dir selbst:** Was ist die Grenze zwischen "nützliche Abstraktion"
> und "Over-Engineering" bei Branded Types? Nenne ein Beispiel wo Brands helfen
> und eines wo sie schaden.
>
> **Kernpunkte:** Hilft: Entity-IDs, Währungen, externe Daten |
> Schadet: Lokale Berechnungen, 2 Parameter Funktionen |
> Frage: "Wäre eine Verwechslung ein echter Bug in Production?" |
> Wenn nein → Plain Type bevorzugen

**Kernkonzept zum Merken:** Branded Types sind ein **Architektur-Werkzeug**,
kein Syntax-Feature. Ihr Wert entsteht durch konsequentes Anwenden an den
richtigen Stellen — nicht durch Verwendung überall.

---

> **Pausenpunkt** -- Du hast L24 abgeschlossen! Exzellent.
>
> Du verstehst jetzt Branded/Nominal Types vollständig: Das Problem,
> die Brand-Technik, Smart Constructors, Brand-Hierarchien und reale Patterns
> in Angular/React-Projekten.
>
> Weiter geht es mit: [L25 — Type-safe Error Handling](../../25-type-safe-error-handling/sections/01-das-exception-problem.md)
