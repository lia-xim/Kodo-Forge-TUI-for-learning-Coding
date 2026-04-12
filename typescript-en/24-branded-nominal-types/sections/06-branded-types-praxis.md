# Section 6: Branded Types in Angular & React — Practice

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Practical Patterns](./05-praktische-patterns.md)
> Next section: -- (End of L24)

---

## What you'll learn here

- How Branded Types are used in **Angular services and HTTP clients**
- **React Query / React Hook Form** with Branded Types
- When Branded Types are **not** worth it (Over-Engineering Warning)
- A complete **architecture decision** for a real project

---

## Branded Types in Angular Services
<!-- section:summary -->
Angular services are a natural place for Branded Types — they define

<!-- depth:standard -->
Angular services are a natural place for Branded Types — they define
the boundary between external data (HTTP responses) and internal type-safe code.

<!-- depth:vollstaendig -->
> **Background: Domain-Driven Design and Anti-Corruption Layers**
>
> In Domain-Driven Design (DDD) there is the concept of the **Anti-Corruption Layer
> (ACL)**: A layer that converts external data (APIs, databases) into internal,
> domain-specific types.
>
> Eric Evans describes in "Domain-Driven Design" (2003):
> *"Use an acyclic layer to separate domain from infrastructure. The layer
> translates between the two models."*
>
> Branded Types are a modern TypeScript tool for exactly this ACL:
> At the edge of the application (services, adapters) external strings become typed
> brands. Inside the application only type-safe code exists.

```typescript annotated
// user.types.ts — Domain types
type Brand<T, B> = T & { readonly __brand: B };

export type UserId    = Brand<string, 'UserId'>;
export type Email     = Brand<string, 'Email'>;
export type UserName  = Brand<string, 'UserName'>;

// Validation functions:
export function createUserId(raw: string): UserId {
  if (!raw.startsWith('user-') || raw.length < 10) {
    throw new Error(`Invalid UserId: "${raw}"`);
  }
  return raw as UserId;
}

// api-response.types.ts — Raw API response (not yet typed!)
interface RawUserApiResponse {
  id: string;       // Still plain string — comes from the API
  email: string;    // Still plain string
  name: string;
}

// user-mapper.ts — Anti-Corruption Layer
function mapUserFromApi(raw: RawUserApiResponse): User {
  return {
    id: createUserId(raw.id),     // string → UserId (validated!)
    email: raw.email as Email,   // Simple cast — TODO: validate email
    name: raw.name as UserName,
  };
}

interface User {
  id: UserId;
  email: Email;
  name: UserName;
}
```

Now the Angular service:

```typescript annotated
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  // Always returns typed User, never RawApiResponse:
  getUser(id: UserId): Observable<User> {
    // 'id' behaves like string in template literals:
    return this.http.get<RawUserApiResponse>(`/api/users/${id}`)
      .pipe(map(raw => mapUserFromApi(raw)));
      // ^ Anti-Corruption Layer: raw → User with brands
  }

  // Only accepts UserId — not just any string:
  deleteUser(id: UserId): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }

  // Cannot be called with the wrong ID type:
  // service.getUser(orderId); // ❌ COMPILE-ERROR
}

// In the component:
@Component({ /* ... */ })
export class UserDetailComponent {
  user$: Observable<User>;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.user$ = this.route.params.pipe(
      map(params => createUserId(params['id'])),
      // ^ Route parameter is immediately converted to UserId
      switchMap(userId => this.userService.getUser(userId))
    );
  }
}
```

> 🧠 **Explain to yourself:** Why do we create the `UserId` from the route parameter
> in `UserDetailComponent` rather than doing it in the service? What is the advantage?
>
> **Key points:** Convert as early as possible | Component is the "entry point"
> for user input (route params) | Service only works with validated types |
> Errors (invalid ID) are handled explicitly — not silently ignored

---

<!-- /depth -->
## Branded Types with React Query and React Hook Form
<!-- section:summary -->
In React projects, Branded Types shine especially in query keys and form handling:

<!-- depth:standard -->
In React projects, Branded Types shine especially in query keys and form handling:

```typescript annotated
// React Query with type-safe query keys
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

// Query key factory — prevents key mix-ups:
const userKeys = {
  all: ['users'] as const,
  detail: (id: UserId) => ['users', id] as const,  // UserId in key array!
  posts: (id: UserId) => ['users', id, 'posts'] as const,
};

// Hooks with typed parameters:
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

// Usage in component:
function UserProfile({ userId }: { userId: UserId }) {
  const { data: user } = useUser(userId);      // ✅
  const { data: posts } = useUserPosts(userId); // ✅

  return <div>{user?.name}</div>;
  // 'userId' works directly as string in JSX props!
}

// React Hook Form with Branded Types:
type Email = Brand<string, 'Email'>;

interface RegisterFormValues {
  email: string;  // In the form: plain string (user types)
  name: string;
}

interface RegisterCommand {
  email: Email;   // After validation: branded
  name: UserName;
}

function RegisterForm() {
  const { register, handleSubmit } = useForm<RegisterFormValues>();

  const onSubmit = (values: RegisterFormValues) => {
    // Validation + conversion:
    const cmd: RegisterCommand = {
      email: values.email as Email, // TODO: add validation
      name: values.name as UserName,
    };
    registerUser(cmd);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      <button type="submit">Register</button>
    </form>
  );
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Open `examples/04-angular-react.ts` and implement:
> 1. A complete `ProductService` with `ProductId = Brand<string, 'ProductId'>`.
> 2. `getProduct(id: ProductId)` and `deleteProduct(id: ProductId)`.
> 3. Try calling the service with `orderId` in a comment — what happens?

---

<!-- /depth -->
## When Branded Types Are NOT Worth It
<!-- section:summary -->
Over-Engineering Warning: Branded Types are not appropriate everywhere.

<!-- depth:standard -->
Over-Engineering Warning: Branded Types are not appropriate everywhere.

```typescript annotated
// ❌ Over-engineering — not useful here:
type Width  = number & { __brand: 'Width' };
type Height = number & { __brand: 'Height' };
type Area   = number & { __brand: 'Area' };

function area(w: Width, h: Height): Area {
  return (w * h) as Area;
}

// Problem: Where do Width and Height come from?
const w = 800 as Width;   // Constant as-casts → annoying!
const h = 600 as Height;
const a = area(w, h);

// This would be simpler:
function simpleArea(w: number, h: number): number {
  return w * h;
}
// No risk of confusion with 2 local variables!
```

**Rule of thumb:** Branded Types are worth it when:

| Criterion | Yes → Brand | No → Plain Type |
|-----------|:-----------:|:---------------:|
| Can types be confused with each other? | ✅ | ❌ |
| Is there validation that should always run? | ✅ | ❌ |
| Is the value propagated through APIs? | ✅ | ❌ |
| Is the code security-critical? | ✅ | ❌ |
| Is it a small, local calculation? | ❌ | ✅ |
| Are brands being cast everywhere? | ❌ | ✅ |

> 💭 **Think about it:** When does useful abstraction end and over-engineering
> begin? With Branded Types the line is: "Would a mix-up without a brand cause
> a real bug?" If yes → Brand. If no → Plain Type.
>
> **Answer:** The YAGNI principle ("You Ain't Gonna Need It") applies here too.
> Add brands when a concrete problem exists, not as a precaution.
> Dependencies and TypeScript complexity are costs too.

---

<!-- /depth -->
## Complete Architecture Decision
<!-- section:summary -->
Here is a pragmatic strategy for a real project:

<!-- depth:standard -->
Here is a pragmatic strategy for a real project:

```typescript
// LAYER 1: Domain Types (use brands)
// ───────────────────────────────────
// Use brands for everything that flows through APIs/databases:
export type UserId    = Brand<string, 'UserId'>;
export type Email     = Brand<string, 'Email'>;
export type OrderId   = Brand<string, 'OrderId'>;

// LAYER 2: Application Layer (Smart Constructors)
// ────────────────────────────────────────────────
// Only services and mappers work directly with brands:
function mapUserFromDb(row: DbUserRow): User {
  return {
    id: row.id as UserId,        // DB delivers valid IDs
    email: createEmail(row.email), // Validate email
  };
}

// LAYER 3: UI Layer (brands transparent)
// ──────────────────────────────────────
// Components receive already-typed data from services:
function UserCard({ user }: { user: User }) {
  // user.id is UserId — can be used directly as string in JSX:
  return <div key={user.id}>{user.email}</div>;
  // No casting needed — JSX accepts 'UserId extends string'
}

// LAYER 4: Events/Commands (brands in commands)
// ─────────────────────────────────────────────
interface DeleteUserCommand {
  userId: UserId; // Command contains branded ID
}
```

<!-- depth:vollstaendig -->
> **In your Angular project** you can apply this immediately:
>
> ```typescript
> // Step 1: types/domain.ts — all Branded Types
> export type UserId = Brand<string, 'UserId'>;
> export type Email  = Brand<string, 'Email'>;
>
> // Step 2: services/user.service.ts — Smart Constructors + Mapping
> // Step 3: components/ — receive already-typed User objects
>
> // The result: The component NEVER comes into contact with raw API strings.
> // Compile errors show exactly where type mix-ups could occur.
> ```

---

<!-- /depth -->
## Summary: Branded Types — When to Use What?

| Situation | Recommendation |
|-----------|---------------|
| Entity IDs (UserId, OrderId) | ✅ Always brand |
| Currencies and units | ✅ Always brand when mixing is possible |
| Email, URL, UUID | ✅ Brand + validation in constructor |
| Tokens, API keys | ✅ Always brand (security!) |
| Local calculations | ❌ Plain number is sufficient |
| Internally used helper strings | ❌ Often over-engineering |

---

## What you've learned

- Branded Types belong in the **Anti-Corruption Layer** — at the edge of the application
  (services, mappers), not everywhere
- **Angular services**: `mapUserFromApi()` converts raw strings to brands;
  after that the entire internal code works type-safely
- **React Query**: Typed query keys with brand IDs prevent cache errors
- **Over-Engineering Warning**: Brands where local variables suffice → costs without benefit

> 🧠 **Explain to yourself:** What is the boundary between "useful abstraction"
> and "over-engineering" with Branded Types? Give an example where brands help
> and one where they cause harm.
>
> **Key points:** Helps: entity IDs, currencies, external data |
> Harms: local calculations, 2-parameter functions |
> Ask: "Would a mix-up be a real bug in production?" |
> If no → prefer Plain Type

**Core concept to remember:** Branded Types are an **architecture tool**,
not a syntax feature. Their value comes from consistent application in the
right places — not from using them everywhere.

---

> **Pause point** -- You've completed L24! Excellent.
>
> You now fully understand Branded/Nominal Types: the problem,
> the brand technique, Smart Constructors, brand hierarchies, and real patterns
> in Angular/React projects.
>
> Continue with: [L25 — Type-safe Error Handling](../../25-type-safe-error-handling/sections/01-das-exception-problem.md)