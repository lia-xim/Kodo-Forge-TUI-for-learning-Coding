# Section 4: Framework Integration — Angular and React

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Type-Level Programming](./03-typ-level-programmierung.md)
> Next section: [05 - Final Challenge](./05-abschluss-challenge.md)

---

## What you'll learn here

- How Phase 3 concepts are applied concretely in Angular projects
- How React projects benefit from the same patterns
- Which concepts apply across frameworks
- Concrete refactoring suggestions for your Angular project

---

## Angular: Phase 3 Concepts in Practice
<!-- section:summary -->
### Branded Types for Angular Services (L24)

<!-- depth:standard -->
### Branded Types for Angular Services (L24)

In your Angular project you likely have services that work with
various IDs. Without Branded Types, all IDs are interchangeable —
a dangerous bug:

```typescript annotated
// BEFORE — unsafe:
class OrderService {
  getOrder(orderId: string): Observable<Order> { /* ... */ }
  // ^ Any string is accepted — even a userId!
}

// AFTER — with Branded Types (L24):
type OrderId = string & { readonly __brand: 'OrderId' };
type CustomerId = string & { readonly __brand: 'CustomerId' };

class OrderService {
  getOrder(orderId: OrderId): Observable<Order> { /* ... */ }
  getCustomerOrders(customerId: CustomerId): Observable<Order[]> { /* ... */ }
}

// Usage:
const orderId = createOrderId('ord-123');   // OrderId
const customerId = createCustomerId('cust-456'); // CustomerId

this.orderService.getOrder(orderId);      // OK
// this.orderService.getOrder(customerId); // Error! CustomerId ≠ OrderId
```

> 📖 **Background: Why mixing up IDs is a real problem**
>
> In 2019, a large e-commerce company reported a bug in their order
> processing where customer IDs were used as order IDs — because both
> were `string`. The bug went undetected for months because the IDs
> were formatted similarly. With Branded Types the error would have
> been a compile error — immediately visible, not after months.

### Result Pattern for HTTP Calls (L25)

```typescript annotated
// Angular service with Result pattern:
type HttpResult<T> = Result<T, HttpError>;

type HttpError =
  | { kind: 'network'; message: string }
  | { kind: 'not-found'; url: string }
  | { kind: 'unauthorized' }
  | { kind: 'validation'; errors: Record<string, string[]> };

@Injectable({ providedIn: 'root' })
class UserApiService {
  constructor(private http: HttpClient) {}

  getUser(id: UserId): Observable<HttpResult<User>> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      map(user => ({ ok: true, value: user } as const)),
      // ^ Success → Result.ok
      catchError(error => of(this.mapError(error)))
      // ^ HTTP error → typed HttpError
    );
  }

  private mapError(error: HttpErrorResponse): HttpResult<never> {
    if (error.status === 0) {
      return { ok: false, error: { kind: 'network', message: 'No connection' } };
    }
    if (error.status === 404) {
      return { ok: false, error: { kind: 'not-found', url: error.url ?? '' } };
    }
    if (error.status === 401) {
      return { ok: false, error: { kind: 'unauthorized' } };
    }
    return {
      ok: false,
      error: { kind: 'validation', errors: error.error?.errors ?? {} }
    };
  }
}
```

> 🧠 **Explain to yourself:** Why is `HttpResult<never>` the
> return type of `mapError`? What does `never` mean here?
> **Key points:** never as T in Result<T,E> means: "no success
> possible" | mapError ALWAYS returns an error | never is assignable
> to every type (bottom type from L02!) | That's why
> HttpResult<never> is assignable to HttpResult<User>

### Module Augmentation for Angular (L27)

```typescript annotated
// Extending the Angular Router with typed data:
declare module '@angular/router' {
  interface Route {
    data?: {
      title?: string;
      roles?: ('admin' | 'user' | 'moderator')[];
      // ^ Type-safe role system instead of any
      breadcrumb?: string;
    };
  }
}
```

> 💭 **Think about it:** Which Phase 3 concept would you introduce
> first in an existing Angular project? Why?
>
> **Consideration:** Branded Types (L24) have the best
> effort-to-benefit ratio: minimal code change, maximum
> safety gain. You only need to write the Smart Constructors once
> and update the service signatures.

---

<!-- /depth -->
## React: Phase 3 Concepts in Practice
<!-- section:summary -->
### Generic Components with Variance (L22)

<!-- depth:standard -->
### Generic Components with Variance (L22)

```typescript annotated
// A generic Select with correct variance:
interface SelectProps<T> {
  items: readonly T[];
  // ^ readonly = covariant: SelectProps<Dog> assignable to SelectProps<Animal>
  onSelect: (item: T) => void;
  // ^ Callback = contravariant for T in parameter position
  renderItem: (item: T) => React.ReactNode;
}

function Select<T>({ items, onSelect, renderItem }: SelectProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i} onClick={() => onSelect(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Usage with Branded Types:
type ProductId = string & { readonly __brand: 'ProductId' };
type Product = { id: ProductId; name: string; price: number };

<Select<Product>
  items={products}
  onSelect={(p) => navigate(`/products/${p.id}`)}
  // ^ p.id is ProductId, not string!
  renderItem={(p) => `${p.name} — ${p.price}€`}
/>
```

### State Machine in React (L26)

```typescript annotated
// State machine for a checkout flow:
type CheckoutState =
  | { step: 'cart'; items: CartItem[] }
  | { step: 'address'; items: CartItem[]; address?: Address }
  | { step: 'payment'; items: CartItem[]; address: Address }
  | { step: 'confirmation'; orderId: OrderId };
  // ^ Each step has exactly the data it needs
  // address is REQUIRED in 'payment', OPTIONAL in 'address'

type CheckoutAction =
  | { type: 'SET_ADDRESS'; address: Address }
  | { type: 'CONFIRM_PAYMENT'; orderId: OrderId }
  | { type: 'BACK' };

function checkoutReducer(
  state: CheckoutState,
  action: CheckoutAction
): CheckoutState {
  switch (state.step) {
    case 'address':
      if (action.type === 'SET_ADDRESS') {
        return { step: 'payment', items: state.items, address: action.address };
        // ^ Only possible 'address' → 'payment' — with required address!
      }
      break;
    case 'payment':
      if (action.type === 'CONFIRM_PAYMENT') {
        return { step: 'confirmation', orderId: action.orderId };
      }
      if (action.type === 'BACK') {
        return { step: 'address', items: state.items, address: state.address };
      }
      break;
  }
  return state;
}
```

> ⚡ **Practical tip:** This reducer pattern with Discriminated
> Unions is directly usable with NgRx in Angular. The actions
> are Discriminated Unions (L12), the reducer is an exhaustive
> switch. In React with useReducer it's the same pattern.
> The TypeScript compiler verifies in both cases that all
> state combinations are handled.

---

<!-- /depth -->
## Cross-Framework Patterns
<!-- section:summary -->
Some Phase 3 concepts are framework-agnostic:

<!-- depth:standard -->
Some Phase 3 concepts are framework-agnostic:

### tsconfig Optimization (L29)

```typescript annotated
// Immediately usable in every project:
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    // ^ Array access returns T | undefined — prevents out-of-bounds errors
    "verbatimModuleSyntax": true,
    // ^ Explicit import type — fewer bundle size surprises
    "noImplicitOverride": true
    // ^ override keyword required for class inheritance
  }
}
```

### Utility Types with Phase 3 Knowledge (L23 + L16)

```typescript annotated
// DeepReadonly — works in Angular AND React:
type DeepReadonly<T> =
  T extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
  : T extends Function
    ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// In Angular: Immutable state for services
// In React: Immutable props for components
// In both: Prevents accidental mutation
```

> 🔬 **Experiment:** Think about your current project: Which
> three changes from Phase 3 would have the greatest impact?
>
> Suggestions to prioritize:
>
> | Priority | Change | Effort | Impact |
> |----------|--------|--------|--------|
> | 1 | tsconfig flags (L29) | 5 min | Fewer bugs immediately |
> | 2 | Branded IDs (L24) | 1 hour | No ID mix-ups |
> | 3 | Result pattern (L25) | 2 hours | Explicit error handling |
> | 4 | Module augmentation (L27) | 30 min | Type-safe route data |
> | 5 | State machine (L26) | 4 hours | No invalid states |

---

<!-- /depth -->
## Angular vs React: Where Are the Differences?
<!-- section:summary -->
| Concept | Angular-specific | React-specific |

<!-- depth:standard -->
| Concept | Angular-specific | React-specific |
|---------|------------------|----------------|
| Decorators (L28) | Core feature (@Component etc.) | Not used (Hooks instead of decorators) |
| DI + Classes (L21) | Central (Services, @Injectable) | Rare (functions + hooks dominate) |
| State machine (L26) | NgRx with actions/reducers | useReducer or Zustand/XState |
| Module augmentation (L27) | Router data, HttpInterceptor | Global window, Next.js config |
| tsconfig (L29) | experimentalDecorators required | jsx: react-jsx required |

> 📖 **Background: Why Angular uses classes, React uses functions**
>
> Angular was designed in 2016 for enterprise applications — at a
> time when OOP and dependency injection were the standard. Classes,
> decorators, and a DI container were the natural choice.
> React switched from classes to functions in 2019 with Hooks —
> because functions are easier to compose and have less boilerplate.
> Both approaches make full use of TypeScript's type system —
> but in different ways.

---

<!-- /depth -->
## What you've learned

- Branded Types (L24) and Result pattern (L25) are immediately usable in Angular
- React benefits from generic components with correct variance (L22)
- State machines (L26) work identically in NgRx and useReducer
- tsconfig optimization (L29) has the best effort-to-benefit ratio

> 🧠 **Explain to yourself:** Why do Discriminated Unions work
> both as NgRx actions and as React reducer actions?
> What makes the pattern framework-independent?
> **Key points:** Discriminated Unions are pure TypeScript — no
> framework feature | exhaustive switch works everywhere |
> NgRx actions = Discriminated Union with type tag | useReducer
> actions = the same pattern | TypeScript enforces completeness

**Core concept to remember:** The best TypeScript patterns are
framework-agnostic. Branded Types, Result pattern, Discriminated
Unions, and DeepReadonly work equally well in Angular, React, Vue,
and without any framework.

---

> **Pause point** -- Framework integration mastered. The final
> section brings everything together.
>
> Continue with: [Section 05: Final Challenge](./05-abschluss-challenge.md)