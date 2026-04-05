# Sektion 4: Framework-Integration — Angular und React

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Typ-Level-Programmierung](./03-typ-level-programmierung.md)
> Naechste Sektion: [05 - Abschluss-Challenge](./05-abschluss-challenge.md)

---

## Was du hier lernst

- Wie Phase-3-Konzepte in Angular-Projekten konkret eingesetzt werden
- Wie React-Projekte von denselben Patterns profitieren
- Welche Konzepte framework-uebergreifend gelten
- Konkrete Refactoring-Vorschlaege fuer dein Angular-Projekt

---

## Angular: Phase-3-Konzepte in der Praxis

### Branded Types fuer Angular Services (L24)

In deinem Angular-Projekt hast du vermutlich Services, die mit
verschiedenen IDs arbeiten. Ohne Branded Types sind alle IDs
austauschbar — ein gefaehrlicher Bug:

```typescript annotated
// VORHER — unsicher:
class OrderService {
  getOrder(orderId: string): Observable<Order> { /* ... */ }
  // ^ Jeder string wird akzeptiert — auch eine userId!
}

// NACHHER — mit Branded Types (L24):
type OrderId = string & { readonly __brand: 'OrderId' };
type CustomerId = string & { readonly __brand: 'CustomerId' };

class OrderService {
  getOrder(orderId: OrderId): Observable<Order> { /* ... */ }
  getCustomerOrders(customerId: CustomerId): Observable<Order[]> { /* ... */ }
}

// Verwendung:
const orderId = createOrderId('ord-123');   // OrderId
const customerId = createCustomerId('cust-456'); // CustomerId

this.orderService.getOrder(orderId);      // OK
// this.orderService.getOrder(customerId); // Fehler! CustomerId ≠ OrderId
```

> 📖 **Hintergrund: Warum IDs verwechseln ein echtes Problem ist**
>
> 2019 berichtete ein grosses E-Commerce-Unternehmen, dass ein Bug
> in der Bestellverarbeitung dazu fuehrte, dass Kunden-IDs als
> Bestell-IDs verwendet wurden — weil beide `string` waren. Der Bug
> blieb monatelang unentdeckt, weil die IDs aehnlich formatiert
> waren. Mit Branded Types waere der Fehler ein Compile-Fehler
> gewesen — sofort sichtbar, nicht nach Monaten.

### Result-Pattern fuer HTTP-Calls (L25)

```typescript annotated
// Angular Service mit Result-Pattern:
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
      // ^ Erfolg → Result.ok
      catchError(error => of(this.mapError(error)))
      // ^ HTTP-Fehler → typisierter HttpError
    );
  }

  private mapError(error: HttpErrorResponse): HttpResult<never> {
    if (error.status === 0) {
      return { ok: false, error: { kind: 'network', message: 'Keine Verbindung' } };
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

> 🧠 **Erklaere dir selbst:** Warum ist `HttpResult<never>` der
> Return-Typ von `mapError`? Was bedeutet `never` hier?
> **Kernpunkte:** never als T in Result<T,E> bedeutet: "kein Erfolg
> moeglich" | mapError gibt IMMER einen Fehler zurueck | never ist
> jedem Typ zuweisbar (Bottom Type aus L02!) | Deshalb ist
> HttpResult<never> zu HttpResult<User> zuweisbar

### Module Augmentation fuer Angular (L27)

```typescript annotated
// Angular-Router erweitern mit typisierten Data:
declare module '@angular/router' {
  interface Route {
    data?: {
      title?: string;
      roles?: ('admin' | 'user' | 'moderator')[];
      // ^ Typsicheres Role-System statt any
      breadcrumb?: string;
    };
  }
}
```

> 💭 **Denkfrage:** Welches Phase-3-Konzept wuerdest du zuerst
> in einem bestehenden Angular-Projekt einfuehren? Warum?
>
> **Ueberlegung:** Branded Types (L24) haben das beste
> Aufwand-Nutzen-Verhaeltnis: minimale Code-Aenderung, maximaler
> Sicherheitsgewinn. Du musst nur die Smart Constructors einmal
> schreiben und die Service-Signaturen anpassen.

---

## React: Phase-3-Konzepte in der Praxis

### Generische Components mit Varianz (L22)

```typescript annotated
// Ein generischer Select mit korrekter Varianz:
interface SelectProps<T> {
  items: readonly T[];
  // ^ readonly = kovariant: SelectProps<Dog> zuweisbar an SelectProps<Animal>
  onSelect: (item: T) => void;
  // ^ Callback = kontravariant fuer T in Parameter-Position
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

// Verwendung mit Branded Types:
type ProductId = string & { readonly __brand: 'ProductId' };
type Product = { id: ProductId; name: string; price: number };

<Select<Product>
  items={products}
  onSelect={(p) => navigate(`/products/${p.id}`)}
  // ^ p.id ist ProductId, nicht string!
  renderItem={(p) => `${p.name} — ${p.price}€`}
/>
```

### State Machine in React (L26)

```typescript annotated
// Zustandsmaschine fuer einen Checkout-Flow:
type CheckoutState =
  | { step: 'cart'; items: CartItem[] }
  | { step: 'address'; items: CartItem[]; address?: Address }
  | { step: 'payment'; items: CartItem[]; address: Address }
  | { step: 'confirmation'; orderId: OrderId };
  // ^ Jeder Schritt hat genau die Daten die er braucht
  // address ist in 'payment' PFLICHT, in 'address' OPTIONAL

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
        // ^ Nur von 'address' → 'payment' moeglich — mit Pflicht-Address!
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

> ⚡ **Praxis-Tipp:** Dieses Reducer-Pattern mit Discriminated
> Unions ist direkt mit NgRx in Angular einsetzbar. Die Actions
> sind Discriminated Unions (L12), der Reducer ist ein exhaustive
> Switch. In React mit useReducer ist es dasselbe Pattern.
> Der TypeScript-Compiler prueft in beiden Faellen, dass alle
> Zustandskombinationen behandelt werden.

---

## Framework-uebergreifende Patterns

Manche Phase-3-Konzepte sind framework-agnostisch:

### tsconfig-Optimierung (L29)

```typescript annotated
// Sofort in jedem Projekt einsetzbar:
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    // ^ Array-Zugriff gibt T | undefined — verhindert OOB-Fehler
    "verbatimModuleSyntax": true,
    // ^ Explizites import type — weniger Bundle-Size-Ueberraschungen
    "noImplicitOverride": true
    // ^ override-Keyword Pflicht bei Klassen-Vererbung
  }
}
```

### Utility Types mit Phase-3-Wissen (L23 + L16)

```typescript annotated
// DeepReadonly — funktioniert in Angular UND React:
type DeepReadonly<T> =
  T extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
  : T extends Function
    ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// In Angular: Immutable State fuer Services
// In React: Immutable Props fuer Components
// In beiden: Verhindert versehentliche Mutation
```

> 🔬 **Experiment:** Ueberlege fuer dein aktuelles Projekt: Welche
> drei Aenderungen aus Phase 3 haetten den groessten Impact?
>
> Vorschlaege zum Priorisieren:
>
> | Prioritaet | Aenderung | Aufwand | Impact |
> |------------|-----------|---------|--------|
> | 1 | tsconfig-Flags (L29) | 5 min | Sofort weniger Bugs |
> | 2 | Branded IDs (L24) | 1 Stunde | Keine ID-Verwechslung |
> | 3 | Result-Pattern (L25) | 2 Stunden | Explizite Fehlerbehandlung |
> | 4 | Module Augmentation (L27) | 30 min | Typsichere Route-Data |
> | 5 | State Machine (L26) | 4 Stunden | Keine ungueltigen Zustaende |

---

## Angular vs React: Wo liegen die Unterschiede?

| Konzept | Angular-Eigenheit | React-Eigenheit |
|---------|-------------------|-----------------|
| Decorators (L28) | Kernfeature (@Component etc.) | Nicht verwendet (Hooks statt Decorators) |
| DI + Classes (L21) | Zentral (Services, @Injectable) | Selten (Funktionen + Hooks dominieren) |
| State Machine (L26) | NgRx mit Actions/Reducers | useReducer oder Zustand/XState |
| Module Augmentation (L27) | Router-Data, HttpInterceptor | Global Window, Next.js Config |
| tsconfig (L29) | experimentalDecorators noetig | jsx: react-jsx noetig |

> 📖 **Hintergrund: Warum Angular auf Klassen setzt, React auf Funktionen**
>
> Angular wurde 2016 fuer Enterprise-Anwendungen designed — zu einer
> Zeit, als OOP und Dependency Injection der Standard waren. Klassen,
> Decorators und ein DI-Container waren die natuehrliche Wahl.
> React wechselte 2019 mit Hooks von Klassen zu Funktionen — weil
> Funktionen einfacher zu komponieren sind und weniger Boilerplate
> haben. Beide Ansaetze nutzen TypeScript's Typsystem voll aus —
> aber auf unterschiedliche Weise.

---

## Was du gelernt hast

- Branded Types (L24) und Result-Pattern (L25) sind in Angular sofort einsetzbar
- React profitiert von generischen Components mit korrekter Varianz (L22)
- State Machines (L26) funktionieren in NgRx und useReducer identisch
- tsconfig-Optimierung (L29) hat den besten Aufwand-Nutzen-Ratio

> 🧠 **Erklaere dir selbst:** Warum funktionieren Discriminated Unions
> sowohl als NgRx-Actions als auch als React-Reducer-Actions?
> Was macht das Pattern framework-unabhaengig?
> **Kernpunkte:** Discriminated Unions sind reines TypeScript — kein
> Framework-Feature | exhaustive switch funktioniert ueberall |
> NgRx Actions = Discriminated Union mit type-Tag | useReducer
> Actions = dasselbe Pattern | TypeScript erzwingt Vollstaendigkeit

**Kernkonzept zum Merken:** Die besten TypeScript-Patterns sind
framework-agnostisch. Branded Types, Result-Pattern, Discriminated
Unions und DeepReadonly funktionieren in Angular, React, Vue und
ohne Framework gleich gut.

---

> **Pausenpunkt** -- Framework-Integration gemeistert. Die letzte
> Sektion bringt alles zusammen.
>
> Weiter geht es mit: [Sektion 05: Abschluss-Challenge](./05-abschluss-challenge.md)
