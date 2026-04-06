# Sektion 2: Structural Patterns — Schnittstellen formen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Creational Patterns](./01-creational-patterns.md)
> Naechste Sektion: [03 - Behavioral Patterns](./03-behavioral-patterns.md)

---

## Was du hier lernst

- Wie das **Adapter Pattern** inkompatible Schnittstellen verbindet — ohne Legacy-Code anzufassen
- Wie eine **Facade** Komplexitaet versteckt und eine klare API nach aussen gibt
- Wie TypeScripts eingebautes **Proxy-Objekt** mit Generics typsicher wird
- Warum Angular HTTP Interceptors ein klassisches Decorator/Proxy-Pattern sind

---

## Hintergrund: Das Problem der inkompatiblen Stecker

Stell dir vor, du bist Elektriker in Deutschland und bekommst einen britischen Stecker.
Drei eckige Pins statt zwei runde. Das Geraet ist perfekt — aber der Stecker passt nicht.
Du brauchst einen Adapter, nicht ein neues Geraet.

Genau dieses Problem loest das **Adapter Pattern** in Software. Der Ausloeser in der
Praxis: Du benutzt eine Drittanbieterbibliothek, die du nicht aendern kannst. Oder du
hast Legacy-Code, der ein anderes Interface hat als dein neuer Code erwartet.

Die GoF nannten es "Adapter" — in manchen Buechern heisst es auch "Wrapper". Der Name
beschreibt es perfekt: Du wickelst etwas ein, damit es nach aussen anders aussieht.

Das Adapter Pattern wurde in den 1990ern als wichtige Technik fuer C++ und Java
beschrieben — Sprachen ohne Duck Typing. In TypeScript ist es oft noch eleganter,
weil das strukturelle Typsystem viel weniger Boilerplate erfordert: Wenn deine Klasse
die richtigen Methoden hat, *ist* sie das Interface — egal wie sie heisst.

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen dem Aendern des
> Legacy-Codes direkt und dem Schreiben eines Adapters? Wann wuerdest du welchen Weg
> bevorzugen?
> **Kernpunkte:** Legacy-Code oft nicht aenderbar (3rd-Party, andere Teams) |
> Adapter schuetzt den bestehenden Code | Adapter ist testbar | Originalcode bleibt unveraendert

---

## Adapter Pattern — Legacy-Code bruecken

Du uebernimmst ein Projekt. Es gibt ein altes Payment-Gateway von 2015 — hartcodiert,
synchron, mit einer API die niemand mehr mag. Aber es funktioniert. Der neue Code
erwartet ein modernes, asynchrones Interface. Du kannst das alte System nicht anfassen.

```typescript annotated
// Altes Interface — Drittanbieter, unveraenderlich
interface LegacyPaymentGateway {
  chargeCard(amount: number, cardNumber: string): { success: boolean; transactionId: string };
  // ^ Synchron — blockiert, gibt direkt zurueck
  // ^ Mischt Betrag und Kartennummer — keine Struktur
}

// Neues Interface — was dein moderner Code erwartet
interface PaymentRequest {
  amount: number;
  cardToken: string;     // Kein raw cardNumber mehr — PCI-konform
  currency: 'EUR' | 'USD' | 'GBP';
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  timestamp: Date;       // Neues Feld — Legacy kennt es nicht
}

interface PaymentService {
  processPayment(payment: PaymentRequest): Promise<PaymentResult>;
  // ^ Asynchron — moderne API-Konvention
}

// Adapter — brueckt alt und neu, ohne Legacy-Code anzufassen
class LegacyPaymentAdapter implements PaymentService {
  constructor(private readonly legacy: LegacyPaymentGateway) {}
  // ^ Der Legacy-Code wird INJIZIERT — testbar und austauschbar

  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    // Uebersetzt neue Datenstruktur in alte API
    const result = this.legacy.chargeCard(payment.amount, payment.cardToken);
    // ^ Die Legacy-Methode wird synchron aufgerufen
    return {
      success: result.success,
      transactionId: result.transactionId,
      timestamp: new Date(),
      // ^ Timestamp wird vom Adapter hinzugefuegt — Legacy kennt es nicht
    };
  }
}

// Verwendung: Neuer Code sieht nur PaymentService — nie LegacyPaymentGateway
const legacyGateway: LegacyPaymentGateway = new OldPaymentSystem();
const paymentService: PaymentService = new LegacyPaymentAdapter(legacyGateway);
// ^ TypeScript prueft: LegacyPaymentAdapter muss PaymentService vollstaendig implementieren
await paymentService.processPayment({ amount: 99.99, cardToken: 'tok_xyz', currency: 'EUR' });
```

TypeScript macht das Pattern sicherer als in Java: Das strukturelle Typsystem bedeutet,
dass `LegacyPaymentAdapter implements PaymentService` sofort einen Compile-Fehler gibt
wenn eine Methode fehlt oder falsch typisiert ist. Keine Laufzeit-Ueberraschungen.

> 💭 **Denkfrage:** Wenn du zwei verschiedene Legacy-Systeme hast (OldPaymentGateway und
> ThirdPartyStripe) und beide adaptieren willst — brauchst du zwei Adapter-Klassen oder
> kannst du einen generischen Adapter schreiben?
>
> **Antwort:** Du brauchst zwei separate Adapter, weil jede Legacy-API eine andere
> Signatur hat. Aber beide implementieren `PaymentService` — dein neuer Code muss
> nicht wissen, welcher Adapter dahintersteckt. Das ist der Wert des Patterns.

---

## Facade Pattern — Komplexitaet hinter einer einfachen Tuer

Du hast einen Online-Shop. Eine Bestellung aufzugeben involviert intern: Warenkorb pruefen,
Zahlung verarbeiten, Lagerbestand aktualisieren, Benachrichtigung senden, Versand initiieren.
Fuenf Services, fuenf verschiedene APIs. Der Controller soll davon nichts wissen.

```typescript annotated
// Die einzelnen Services — intern komplex, viele Methoden
class CartService {
  validateCart(userId: string): Promise<Cart> { /* ... */ }
  clearCart(userId: string): Promise<void> { /* ... */ }
}

class PaymentService {
  processPayment(payment: PaymentRequest): Promise<PaymentResult> { /* ... */ }
  refund(transactionId: string): Promise<void> { /* ... */ }
}

class InventoryService {
  reserveItems(items: CartItem[]): Promise<Reservation> { /* ... */ }
  releaseReservation(reservationId: string): Promise<void> { /* ... */ }
}

class NotificationService {
  sendOrderConfirmation(userId: string, orderId: string): Promise<void> { /* ... */ }
}

class ShippingService {
  createShipment(order: Order): Promise<TrackingInfo> { /* ... */ }
}

// Facade: Eine einfache Tuer fuer eine komplexe Welt
class OrderFacade {
  constructor(
    private cart: CartService,
    private payment: PaymentService,
    private inventory: InventoryService,
    private notifications: NotificationService,
    private shipping: ShippingService,
  ) {}

  // Der Controller ruft NUR das auf — ein Aufruf, eine Absicht
  async placeOrder(userId: string, paymentInfo: PaymentRequest): Promise<OrderSummary> {
    // ^ Facade orchestriert intern alle Schritte in der richtigen Reihenfolge
    const cart = await this.cart.validateCart(userId);
    // ^ Schritt 1: Warenkorb pruefen — kann CartValidationError werfen
    const reservation = await this.inventory.reserveItems(cart.items);
    // ^ Schritt 2: Lager reservieren — vor Zahlung! Sonst zahlst du fuer nichts
    const paymentResult = await this.payment.processPayment(paymentInfo);
    // ^ Schritt 3: Zahlen — wenn das fehlschlaegt: reservation.releaseReservation()
    await this.cart.clearCart(userId);
    await this.notifications.sendOrderConfirmation(userId, paymentResult.transactionId);
    const tracking = await this.shipping.createShipment({ userId, cart, paymentResult });
    return { orderId: paymentResult.transactionId, tracking };
    // ^ Einfaches Ergebnis — Controller braucht keine Details
  }
}
```

> ⚡ **Angular-Bezug:** In deinen Angular-Projekten ist ein gutes Facade-Pattern ein
> `OrderFacade`-Service der in der Komponente injiziert wird:
>
> ```typescript
> @Injectable({ providedIn: 'root' })
> export class OrderFacade {
>   constructor(
>     private cartStore: CartStore,     // NgRx Store Slice
>     private orderApi: OrderApiService,
>     private router: Router,
>   ) {}
>
>   async checkout(): Promise<void> {
>     const cart = await firstValueFrom(this.cartStore.cart$);
>     const order = await this.orderApi.placeOrder(cart).toPromise();
>     this.cartStore.dispatch(clearCart());
>     this.router.navigate(['/order-confirmation', order.id]);
>   }
> }
>
> // Komponente ist jetzt duenn — keine Businesslogik:
> @Component({ /* ... */ })
> export class CheckoutComponent {
>   constructor(private facade: OrderFacade) {}
>   onCheckout() { this.facade.checkout(); }
> }
> ```

---

## Proxy Pattern — typsicher mit TypeScripts eingebautem Proxy

JavaScript hat seit ES2015 ein eingebautes `Proxy`-Objekt. TypeScript macht es mit
Generics typsicher. Das Proxy Pattern ist ideal fuer: Caching, Logging, Zugriffskontrolle,
Lazy Loading.

```typescript annotated
// Generische Proxy-Factory — funktioniert mit JEDEM Objekt-Typ
function createLoggingProxy<T extends object>(target: T, label: string): T {
  // ^ T extends object: primitive Typen (string, number) koennen nicht geproxied werden
  return new Proxy(target, {
    get(obj: T, key: string | symbol): unknown {
      // ^ key ist string | symbol (JavaScript-Property-Typen)
      const value = Reflect.get(obj, key);
      // ^ Reflect.get ist sicherer als obj[key] — behandelt Prototyp-Chain korrekt
      if (typeof value === 'function') {
        console.log(`[${label}] Methode aufgerufen: ${String(key)}`);
        // ^ String(key) weil key auch ein Symbol sein koennte
      }
      return value;
    },
    set(obj: T, key: string | symbol, value: unknown): boolean {
      console.log(`[${label}] Property gesetzt: ${String(key)} =`, value);
      return Reflect.set(obj, key, value);
      // ^ true zurueckgeben: Operation war erfolgreich
    },
  });
  // Rueckgabetyp ist T — der Proxy verhaelt sich identisch zum Original
  // TypeScript weiss nichts vom Proxy — fuer das Typsystem ist es ein T
}

// Caching-Proxy fuer teure API-Aufrufe:
function createCachingProxy<T extends object>(
  target: T,
  ttlMs: number = 60_000,
): T {
  const cache = new Map<string, { value: unknown; expiresAt: number }>();

  return new Proxy(target, {
    get(obj: T, key: string | symbol) {
      const fn = Reflect.get(obj, key);
      if (typeof fn !== 'function') return fn;

      return async (...args: unknown[]) => {
        const cacheKey = `${String(key)}:${JSON.stringify(args)}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() < cached.expiresAt) {
          console.log(`[Cache HIT] ${cacheKey}`);
          return cached.value;
        }
        const result = await fn.apply(obj, args);
        cache.set(cacheKey, { value: result, expiresAt: Date.now() + ttlMs });
        return result;
      };
    },
  });
}
```

> ⚡ **Angular HTTP Interceptors = Proxy Pattern:**
> Angular's `HttpInterceptor` ist ein klassisches Decorator/Proxy-Pattern.
> Der Interceptor setzt sich "vor" den echten HTTP-Call und kann die Request
> transformieren, Logging hinzufuegen oder Retry-Logik einbauen:
>
> ```typescript
> @Injectable()
> export class AuthInterceptor implements HttpInterceptor {
>   intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
>     // Wie ein Proxy: modifiziert den Request, leitet weiter
>     const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${this.token}` } });
>     return next.handle(authReq);
>   }
> }
> ```

---

## Experiment-Box: Typsicherer Logging-Proxy

Fuege diesen Code in den TypeScript Playground ein:

```typescript
interface UserService {
  getUser(id: string): Promise<{ name: string; email: string }>;
  updateUser(id: string, data: Partial<{ name: string; email: string }>): Promise<void>;
}

// Simulierte Implementierung:
const realUserService: UserService = {
  async getUser(id) {
    return { name: 'Max Mustermann', email: 'max@example.com' };
  },
  async updateUser(id, data) {
    console.log('Updating user:', id, data);
  },
};

function createLoggingProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, key: string | symbol) {
      const value = Reflect.get(obj, key);
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          console.log(`Calling ${String(key)} with:`, args);
          return (value as Function).apply(obj, args);
        };
      }
      return value;
    },
  });
}

const loggedService = createLoggingProxy(realUserService);
// loggedService hat denselben Typ wie UserService!
// TypeScript weiss: loggedService.getUser existiert
loggedService.getUser('123');  // Logged: "Calling getUser with: ['123']"

// Probiere: loggedService.nichtExistent('test')
// TypeScript meldet sofort: Property 'nichtExistent' does not exist on type 'UserService'
// Der Proxy schuetzt dich zur Compile-Zeit — nicht nur zur Laufzeit!
```

---

## Was du gelernt hast

- **Adapter** brueckt inkompatible Schnittstellen — TypeScripts strukturelles Typsystem
  macht den Adapter sicherer als in Java
- **Facade** versteckt Komplexitaet hinter einer einfachen API — ideal fuer Angular-Services
  die mehrere Stores und APIs orchestrieren
- **Proxy** gibt dir transparente Kontrolle ueber Objekt-Zugriffe — TypeScripts `Proxy<T>`
  mit Generics ist typsicher und leistungsstark
- HTTP Interceptors in Angular sind ein perfektes Beispiel fuer das Proxy/Decorator-Pattern
  in der Praxis

**Kernkonzept:** Structural Patterns aendern nicht *was* ein Objekt ist, sondern *wie*
es nach aussen aussieht oder erreichbar ist. TypeScripts strukturelles Typsystem macht
viele dieser Patterns leichtgewichtiger als in Java oder C++.

> 🧠 **Erklaere dir selbst:** Wann wuerdest du Adapter, wann Facade und wann Proxy
> einsetzen? Was ist das Leitmotiv jedes Patterns?
> **Kernpunkte:** Adapter = inkompatible Schnittstelle bruecken |
> Facade = Komplexitaet verstecken | Proxy = transparente Zugriffskontrolle

---

> **Pausenpunkt** — Du kennst jetzt die drei wichtigsten Structural Patterns und
> erkennst sie in Angular (DI, Interceptors, Facade-Services).
>
> Weiter geht es mit: [Sektion 03: Behavioral Patterns](./03-behavioral-patterns.md)
