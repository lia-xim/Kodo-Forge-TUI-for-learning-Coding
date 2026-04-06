# Sektion 5: Parse, don't validate

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Runtime-Validierung als Schutz](./04-runtime-validierung-als-schutz.md)
> Naechste Sektion: [06 - Security Checkliste und Code Review](./06-security-checkliste-und-review.md)

---

## Was du hier lernst

- Das Designprinzip "Parse, don't validate" — einer der einflussreichsten
  TypeScript-Blogposts der letzten 10 Jahre
- Warum **Transformation statt Pruefung** sicherer ist
- Die "Parse at the boundary"-Regel: Validierung nur am Systemrand
- Verbindung zu **Smart Constructors** (L24) und dem **Result-Pattern** (L25)

---

## Hintergrund: Der Blogpost, der ein Umdenken ausloeste

Im November 2019 veroeffentlichte Alexis King einen Blogpost mit dem Titel
**"Parse, don't validate"**. King war damals Entwicklerin in der Haskell-Community
— aber der Gedanke war so klar formuliert, dass er die gesamte TypeScript-Community
erfasste. Der Post wurde viral. Zod, Valibot, Effect — viele der heutigen
TypeScript-Validierungsbibliotheken lassen sich direkt auf dieses Prinzip
zurueckfuehren.

Was war die zentrale These? King argumentierte, dass "Validierung" als Konzept
grundlegend falsch ist. Wenn du eine Funktion `isValid(x: unknown): boolean`
schreibst, loest du das falsche Problem. Du pruefst, ob etwas gueltig ist —
aber du trennst das Wissen ("es ist gueltig") vom Objekt selbst. Dieses Wissen
geht verloren sobald du den if-Block verlaesst.

Die Alternative: **Parsen**. Nicht pruefen ob etwas gueltig ist, sondern es
direkt in einen gueltigen Typ umwandeln. Das Ergebnis des Parsens ist entweder
ein gueltiger Typ oder ein Fehler — keine booleans, keine getrennten Zustande.

> **Kings Formulierung:** "Make illegal states unrepresentable."
> Nicht: "Pruefe ob der Zustand legal ist." Sondern: "Stelle sicher, dass
> ilegale Zustaende gar nicht existieren koennen."

---

## Validate vs. Parse — der Unterschied

Beginnen wir mit einem konkreten Gegenueberstellung:

```typescript annotated
// VALIDATE-Ansatz: Wahrheit und Objekt sind getrennt
function processOrder(data: unknown): void {
  if (typeof data !== 'object' || data === null) throw new Error('Kein Objekt');
  if (!('id' in data))          throw new Error('id fehlt');
  if (!('items' in data))       throw new Error('items fehlt');
  if (!Array.isArray((data as any).items)) throw new Error('items kein Array');
  // ^ Wir haben BEWIESEN dass data ein Order ist...
  const order = data as Order;
  // ^ ...aber muessen trotzdem casten! Das Wissen ist verloren.
  //   TypeScript hat die Pruefungen nicht "gesehen" — nur den Cast am Ende.
  //   Wenn jemand spaeter Code zwischen Pruefung und Cast einschiebt: Problem.
  processOrderSafely(order);
}

// PARSE-Ansatz: Transformation erzeugt typsicheres Ergebnis
function parseOrder(data: unknown): Order {
  if (typeof data !== 'object' || data === null) {
    throw new ParseError('Erwartet: Objekt', data);
  }
  const v = data as Record<string, unknown>;

  if (typeof v['id'] !== 'string' || v['id'].length === 0) {
    throw new ParseError('id: nicht-leerer string erwartet', v['id']);
  }
  if (!Array.isArray(v['items']) || v['items'].length === 0) {
    throw new ParseError('items: nicht-leeres Array erwartet', v['items']);
  }

  // Kein Cast am Ende — wir BAUEN den Order aus validierten Teilen
  return {
    id: v['id'],           // TypeScript weiss: string (nach dem Check oben)
    items: v['items'],     // TypeScript weiss: unknown[] (nach Array.isArray)
    // ^ Noch nicht ideal: items-Elemente sind unbekannt
    //   Dafuer: rekursives Parsen der Array-Elemente
  } as Order;
  // Hinweis: Dieses as ist das einzige im System — alle Checks wurden gemacht
}
```

Der entscheidende Unterschied: Im Parse-Ansatz ist das Ergebnis entweder ein
gueltiger `Order` oder ein `ParseError`. Es gibt keinen dritten Zustand
"wurde irgendwie validiert aber ich bin mir nicht sicher".

---

## Das Result-Pattern als elegante Loesung

In Lektion 25 hast du das Result-Pattern kennengelernt. Kombiniert mit dem
Parse-Ansatz ergibt sich die sauberste Loesung:

```typescript annotated
// Das Result-Pattern aus L25:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}
function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Parser mit Result: kein throw, explizite Fehlerbehandlung
class ParseError extends Error {
  constructor(
    public readonly field: string,
    public readonly message: string,
    public readonly received: unknown
  ) {
    super(`${field}: ${message} (bekommen: ${JSON.stringify(received)})`);
    this.name = 'ParseError';
  }
}

function safeParseOrder(data: unknown): Result<Order, ParseError> {
  if (typeof data !== 'object' || data === null) {
    return err(new ParseError('root', 'Objekt erwartet', data));
    // ^ Kein throw — der Aufrufer entscheidet wie er mit Fehlern umgeht
  }

  const v = data as Record<string, unknown>;

  if (typeof v['id'] !== 'string') {
    return err(new ParseError('id', 'string erwartet', v['id']));
  }
  if (!Array.isArray(v['items'])) {
    return err(new ParseError('items', 'Array erwartet', v['items']));
  }

  return ok({ id: v['id'], items: v['items'] } as Order);
  // ^ ok() signalisiert: Parsing erfolgreich, Typ ist garantiert
}

// Verwendung: Der Aufrufer kann den Fehlerfall explizit behandeln
const result = safeParseOrder(rawApiData);
if (result.ok) {
  processOrder(result.value);  // value ist Order — garantiert
} else {
  logger.warn('API-Antwort ungueltig', { error: result.error.message });
  // Kein try-catch noetig — Result ist ein normaler Rueckgabewert
}
```

---

## Smart Constructors — die Verbindung zu L24

In Lektion 24 (Branded Types) hast du Smart Constructors kennengelernt.
Das ist ein Spezialfall des Parse-Prinzips: anstatt einen primitiven Typ zu
validieren und dann zu casten, parst du ihn in einen sicheren Branded Type:

```typescript annotated
// Branded Type fuer validierte Email
type Email = string & { readonly _brand: 'Email' };

// Smart Constructor = Parser fuer Email
function parseEmail(raw: unknown): Result<Email, ParseError> {
  if (typeof raw !== 'string') {
    return err(new ParseError('email', 'string erwartet', raw));
  }
  if (!raw.includes('@') || raw.split('@').length !== 2) {
    return err(new ParseError('email', 'ungueltige Email-Adresse', raw));
  }
  const [local, domain] = raw.split('@');
  if (local.length === 0 || !domain.includes('.')) {
    return err(new ParseError('email', 'ungueltige Email-Adresse', raw));
  }
  return ok(raw as Email);
  // ^ as ist sicher: Alle Invarianten wurden geprueft.
  //   Ab jetzt tragt Email den Brand — du kannst sie nicht mit einem
  //   unvalidierten string verwechseln.
}

// In deinem System: Nur Email (nicht string) wird akzeptiert
function sendWelcomeEmail(to: Email): Promise<void> {
  // to: Email — TypeScript weiss: dieser string wurde validiert
  return emailService.send(to, 'Willkommen!');
}

// Das macht den Fehler sichtbar:
const rawEmail = req.body.email;  // string — nicht validiert
// sendWelcomeEmail(rawEmail);  // COMPILE-FEHLER! rawEmail ist kein Email
const emailResult = parseEmail(rawEmail);
if (emailResult.ok) {
  await sendWelcomeEmail(emailResult.value);  // Jetzt OK!
}
```

Der Branded Type macht es **unmoeglich**, unvalidierte Daten an Funktionen zu
uebergeben die validierte Daten erwarten. Der Compiler erzwingt das Parsen.

---

## "Parse at the boundary" — die goldene Regel

Das Wichtigste am Parse-Prinzip ist: **Wann** parsst du?

```typescript annotated
// FALSCH: Validierung tief im Code
class OrderService {
  processOrder(order: Order): void {
    // order kommt aus einem Controller... der es aus dem Body geladen hat...
    // Wurde es jemals validiert? Weiss niemand.
    if (typeof order.id !== 'string') {
      // ^ Validierung HIER ist zu spaet — order hatte schon den Typ Order
      throw new Error('...');
    }
  }
}

// RICHTIG: Parse direkt an der Systemgrenze (HTTP-Handler)
// Die Grenze ist der einzige Ort der externe Daten sieht
@Controller('orders')
export class OrderController {
  @Post()
  async createOrder(@Body() body: unknown): Promise<OrderResponse> {
    // ^ body: unknown — kein automatisches Vertrauen!
    //   Angular/NestJS koennte hier automatic validation mit class-validator nutzen,
    //   aber wir zeigen das Muster explizit:

    const parsed = safeParseOrder(body);
    if (!parsed.ok) {
      throw new BadRequestException(parsed.error.message);
      // ^ Fehler an der Grenze abgefangen — nicht in OrderService oder tiefer
    }

    // Ab hier: parsed.value ist Order — TypeScript weiss es, wir wissen es
    return this.orderService.processOrder(parsed.value);
    // ^ processOrder bekommt einen echten Order — keine Validierung mehr noetig
  }
}

// React-Aequivalent: Parse in API-Schicht, nicht in Komponenten
async function fetchOrders(): Promise<Order[]> {
  const response = await fetch('/api/orders');
  const raw = await response.json();
  // Validierung HIER — an der Grenze zwischen HTTP und React-Welt
  if (!Array.isArray(raw)) throw new ParseError('root', 'Array erwartet', raw);
  return raw.map(item => {
    const parsed = safeParseOrder(item);
    if (!parsed.ok) throw parsed.error;
    return parsed.value;
  });
  // React-Komponenten bekommen Order[] — validiert, typsicher
}
```

Die Regel: **Einmal parsen, danach vertrauen.** Wenn du tief im Code erneut
validierst, hast du entweder die Grenze falsch gesetzt oder dem Parsen nicht
genug Vertrauen geschenkt.

---

## Experiment-Box: Parse vs. Validate im Vergleich

```typescript
// Vergleiche beide Ansaetze mit diesem Beispiel.
// Aendere rawData und beobachte das Verhalten:

interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

// VALIDATE-Ansatz:
function validateConfig(raw: unknown): boolean {
  if (typeof raw !== 'object' || raw === null) return false;
  const v = raw as any;
  return typeof v.apiUrl === 'string' &&
         typeof v.timeout === 'number' &&
         typeof v.retries === 'number';
}

// Verwendung des Validate-Ansatzes:
const rawData: unknown = JSON.parse('{"apiUrl":"https://api.example.com","timeout":5000,"retries":3}');
if (validateConfig(rawData)) {
  const config = rawData as Config;
  // ^ as-Cast trotz "Validierung" — das Wissen ist verloren gegangen!
  // Was wenn wir validateConfig vergessen aufzurufen?
  console.log(config.apiUrl);
}

// PARSE-Ansatz:
function parseConfig(raw: unknown): Config {
  if (typeof raw !== 'object' || raw === null) throw new Error('Kein Objekt');
  const v = raw as Record<string, unknown>;
  if (typeof v['apiUrl'] !== 'string')   throw new Error('apiUrl: string erwartet');
  if (typeof v['timeout'] !== 'number')  throw new Error('timeout: number erwartet');
  if (typeof v['retries'] !== 'number')  throw new Error('retries: number erwartet');
  // Kein Cast: TypeScript kennt die Typen durch die narrowing-Checks
  return { apiUrl: v['apiUrl'], timeout: v['timeout'], retries: v['retries'] };
}

// Verwendung des Parse-Ansatzes:
const config = parseConfig(rawData);
// ^ Entweder Config oder Exception — kein Zwischenzustand
console.log(config.apiUrl);  // TypeScript: string — kein Cast, kein Zweifel
```

Probiere: Was passiert wenn du `"timeout": "5000"` (string statt number)
im JSON verwendest? Im Validate-Ansatz: `validateConfig` gibt `false` zurueck
und du verwendest vielleicht den fehlerhaften Wert trotzdem. Im Parse-Ansatz:
Exception mit klarer Fehlermeldung "timeout: number erwartet".

---

## Angular-Bezug: HTTP-Interceptors als Parse-Grenze

```typescript annotated
// In Angular: HTTP-Interceptor als ideale Parse-Grenze
// Alle HTTP-Responses laufen durch Interceptors — perfekter Ort fuer Parsing

@Injectable()
export class ValidationInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          // Event.body ist 'any' — hier ist die Grenze
          const parsed = this.parseResponse(req.url, event.body);
          // ^ Einmal parsen, danach haben alle Subscriber typsichere Daten
          return event.clone({ body: parsed });
        }
        return event;
      }),
      catchError(error => {
        if (error instanceof ParseError) {
          // Parsing fehlgeschlagen: logge Details, wirf benutzerfreundlichen Fehler
          console.error('API-Antwort ungueltig:', error.message);
          return throwError(() => new Error('Unerwartete Server-Antwort'));
        }
        return throwError(() => error);
      })
    );
  }

  private parseResponse(url: string, body: unknown): unknown {
    // URL-basiertes Routing zu spezifischen Parsern
    if (url.includes('/api/users')) return parseUserList(body);
    if (url.includes('/api/orders')) return parseOrderList(body);
    return body;  // Unbekannte Endpoints unveraendert durchlassen
  }
}
```

Der Interceptor ist die perfekte Grenze: Alle HTTP-Antworten passieren ihn.
Danach sind alle Daten im Angular-System bereits validiert und typsicher.

---

## Was du gelernt hast

- **"Parse, don't validate"** (Alexis King, 2019): Transformiere unsichere
  Eingaben direkt in sichere Typen — statt Wahrheitswerte getrennt zu verwalten
- **Result-Pattern** (`Result<T, E>`) macht Parsing-Fehler explizit ohne `throw`
- **Smart Constructors** (L24) sind ein Spezialfall: Parse einen primitiven
  Wert in einen Branded Type
- **"Parse at the boundary"**: Validierung gehoert an den Systemrand — API-Aufruf,
  localStorage, URL-Parameter — niemals tiefer im Code
- In Angular: HTTP-Interceptors sind die ideale Parse-Grenze

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen einer
> Validate-Funktion die `boolean` zurueckgibt und einer Parse-Funktion
> die `T` oder einen Fehler zurueckgibt? Was geht beim boolean verloren?
>
> **Kernpunkte:** boolean trennt Wissen ("gueltig") vom Objekt | Nach dem
> if-Block ist das Wissen verloren — TypeScript braucht erneut einen Cast |
> Parse-Funktionen verkoerpern das Wissen im Typsystem selbst | "Gueltiger
> User" ist kein User + boolean — es ist ein User (und nur ein User)

**Kernkonzept zum Merken:** "Parse, don't validate" ist mehr als ein
Programmiertrick — es ist eine Designphilosophie. Baue Systeme so, dass
ungueltige Zustaende gar nicht ausgedrueckt werden koennen. Dann braucht
es keine Validierung tief im Code, weil der Typ selbst die Garantie tragt.

---

> **Pausenpunkt** — Du hast das tiefste Designprinzip dieser Lektion
> verstanden. Die naechste Sektion fasst alles als praktische Checkliste
> fuer den Alltag zusammen.
>
> Weiter geht es mit: [Sektion 06: Security Checkliste und Code Review](./06-security-checkliste-und-review.md)
