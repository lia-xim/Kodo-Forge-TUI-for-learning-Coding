# Section 5: Parse, don't validate

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Runtime Validation as Protection](./04-runtime-validierung-als-schutz.md)
> Next section: [06 - Security Checklist and Code Review](./06-security-checkliste-und-review.md)

---

## What you'll learn here

- The design principle "Parse, don't validate" — one of the most influential
  TypeScript blog posts of the last 10 years
- Why **transformation instead of checking** is safer
- The "Parse at the boundary" rule: validation only at the system edge
- Connection to **Smart Constructors** (L24) and the **Result Pattern** (L25)

---

## Background: The blog post that sparked a rethink

In November 2019, Alexis King published a blog post titled
**"Parse, don't validate"**. King was a developer in the Haskell community at the time
— but the idea was so clearly articulated that it captured the entire TypeScript community.
The post went viral. Zod, Valibot, Effect — many of today's
TypeScript validation libraries can be traced directly back to this principle.

What was the central argument? King argued that "validation" as a concept
is fundamentally flawed. When you write a function `isValid(x: unknown): boolean`,
you're solving the wrong problem. You're checking whether something is valid —
but you're separating the knowledge ("it is valid") from the object itself. This knowledge
is lost as soon as you leave the if-block.

The alternative: **Parsing**. Not checking whether something is valid, but converting it
directly into a valid type. The result of parsing is either
a valid type or an error — no booleans, no separate states.

> **King's formulation:** "Make illegal states unrepresentable."
> Not: "Check whether the state is legal." But: "Ensure that
> illegal states cannot exist at all."

---

## Validate vs. Parse — the difference

Let's start with a concrete comparison:

```typescript annotated
// VALIDATE approach: truth and object are separated
function processOrder(data: unknown): void {
  if (typeof data !== 'object' || data === null) throw new Error('Not an object');
  if (!('id' in data))          throw new Error('id missing');
  if (!('items' in data))       throw new Error('items missing');
  if (!Array.isArray((data as any).items)) throw new Error('items not an array');
  // ^ We have PROVEN that data is an Order...
  const order = data as Order;
  // ^ ...but still have to cast! The knowledge is lost.
  //   TypeScript didn't "see" the checks — only the cast at the end.
  //   If someone later inserts code between the check and the cast: problem.
  processOrderSafely(order);
}

// PARSE approach: transformation produces a type-safe result
function parseOrder(data: unknown): Order {
  if (typeof data !== 'object' || data === null) {
    throw new ParseError('Expected: object', data);
  }
  const v = data as Record<string, unknown>;

  if (typeof v['id'] !== 'string' || v['id'].length === 0) {
    throw new ParseError('id: non-empty string expected', v['id']);
  }
  if (!Array.isArray(v['items']) || v['items'].length === 0) {
    throw new ParseError('items: non-empty array expected', v['items']);
  }

  // No cast at the end — we BUILD the Order from validated parts
  return {
    id: v['id'],           // TypeScript knows: string (after the check above)
    items: v['items'],     // TypeScript knows: unknown[] (after Array.isArray)
    // ^ Not ideal yet: items elements are unknown
    //   For that: recursive parsing of the array elements
  } as Order;
  // Note: This as is the only one in the system — all checks were performed
}
```

The crucial difference: In the parse approach, the result is either a
valid `Order` or a `ParseError`. There is no third state
"was somehow validated but I'm not sure".

---

## The Result Pattern as an elegant solution

In Lesson 25 you learned about the Result Pattern. Combined with the
parse approach, it yields the cleanest solution:

```typescript annotated
// The Result Pattern from L25:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}
function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Parser with Result: no throw, explicit error handling
class ParseError extends Error {
  constructor(
    public readonly field: string,
    public readonly message: string,
    public readonly received: unknown
  ) {
    super(`${field}: ${message} (received: ${JSON.stringify(received)})`);
    this.name = 'ParseError';
  }
}

function safeParseOrder(data: unknown): Result<Order, ParseError> {
  if (typeof data !== 'object' || data === null) {
    return err(new ParseError('root', 'Object expected', data));
    // ^ No throw — the caller decides how to handle errors
  }

  const v = data as Record<string, unknown>;

  if (typeof v['id'] !== 'string') {
    return err(new ParseError('id', 'string expected', v['id']));
  }
  if (!Array.isArray(v['items'])) {
    return err(new ParseError('items', 'Array expected', v['items']));
  }

  return ok({ id: v['id'], items: v['items'] } as Order);
  // ^ ok() signals: parsing successful, type is guaranteed
}

// Usage: The caller can explicitly handle the error case
const result = safeParseOrder(rawApiData);
if (result.ok) {
  processOrder(result.value);  // value is Order — guaranteed
} else {
  logger.warn('API response invalid', { error: result.error.message });
  // No try-catch needed — Result is a normal return value
}
```

---

## Smart Constructors — the connection to L24

In Lesson 24 (Branded Types) you learned about Smart Constructors.
This is a special case of the parse principle: instead of
validating a primitive type and then casting it, you parse it into a safe Branded Type:

```typescript annotated
// Branded Type for validated Email
type Email = string & { readonly _brand: 'Email' };

// Smart Constructor = Parser for Email
function parseEmail(raw: unknown): Result<Email, ParseError> {
  if (typeof raw !== 'string') {
    return err(new ParseError('email', 'string expected', raw));
  }
  if (!raw.includes('@') || raw.split('@').length !== 2) {
    return err(new ParseError('email', 'invalid email address', raw));
  }
  const [local, domain] = raw.split('@');
  if (local.length === 0 || !domain.includes('.')) {
    return err(new ParseError('email', 'invalid email address', raw));
  }
  return ok(raw as Email);
  // ^ as is safe: All invariants were checked.
  //   From now on Email carries the brand — you can't confuse it
  //   with an unvalidated string.
}

// In your system: Only Email (not string) is accepted
function sendWelcomeEmail(to: Email): Promise<void> {
  // to: Email — TypeScript knows: this string was validated
  return emailService.send(to, 'Welcome!');
}

// This makes the error visible:
const rawEmail = req.body.email;  // string — not validated
// sendWelcomeEmail(rawEmail);  // COMPILE ERROR! rawEmail is not Email
const emailResult = parseEmail(rawEmail);
if (emailResult.ok) {
  await sendWelcomeEmail(emailResult.value);  // Now OK!
}
```

The Branded Type makes it **impossible** to pass unvalidated data to functions
that expect validated data. The compiler enforces parsing.

---

## "Parse at the boundary" — the golden rule

The most important thing about the parse principle is: **When** do you parse?

```typescript annotated
// WRONG: Validation deep in the code
class OrderService {
  processOrder(order: Order): void {
    // order comes from a controller... which loaded it from the body...
    // Was it ever validated? Nobody knows.
    if (typeof order.id !== 'string') {
      // ^ Validation HERE is too late — order already had the type Order
      throw new Error('...');
    }
  }
}

// RIGHT: Parse directly at the system boundary (HTTP handler)
// The boundary is the only place that sees external data
@Controller('orders')
export class OrderController {
  @Post()
  async createOrder(@Body() body: unknown): Promise<OrderResponse> {
    // ^ body: unknown — no automatic trust!
    //   Angular/NestJS could use automatic validation with class-validator here,
    //   but we show the pattern explicitly:

    const parsed = safeParseOrder(body);
    if (!parsed.ok) {
      throw new BadRequestException(parsed.error.message);
      // ^ Error caught at the boundary — not in OrderService or deeper
    }

    // From here: parsed.value is Order — TypeScript knows it, we know it
    return this.orderService.processOrder(parsed.value);
    // ^ processOrder receives a real Order — no more validation needed
  }
}

// React equivalent: Parse in the API layer, not in components
async function fetchOrders(): Promise<Order[]> {
  const response = await fetch('/api/orders');
  const raw = await response.json();
  // Validation HERE — at the boundary between HTTP and the React world
  if (!Array.isArray(raw)) throw new ParseError('root', 'Array expected', raw);
  return raw.map(item => {
    const parsed = safeParseOrder(item);
    if (!parsed.ok) throw parsed.error;
    return parsed.value;
  });
  // React components receive Order[] — validated, type-safe
}
```

The rule: **Parse once, then trust.** If you validate again deep in the code,
you've either placed the boundary in the wrong spot or haven't trusted the parsing
enough.

---

## Experiment Box: Parse vs. Validate compared

```typescript
// Compare both approaches with this example.
// Change rawData and observe the behavior:

interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

// VALIDATE approach:
function validateConfig(raw: unknown): boolean {
  if (typeof raw !== 'object' || raw === null) return false;
  const v = raw as any;
  return typeof v.apiUrl === 'string' &&
         typeof v.timeout === 'number' &&
         typeof v.retries === 'number';
}

// Usage of the Validate approach:
const rawData: unknown = JSON.parse('{"apiUrl":"https://api.example.com","timeout":5000,"retries":3}');
if (validateConfig(rawData)) {
  const config = rawData as Config;
  // ^ as-cast despite "validation" — the knowledge has been lost!
  // What if we forget to call validateConfig?
  console.log(config.apiUrl);
}

// PARSE approach:
function parseConfig(raw: unknown): Config {
  if (typeof raw !== 'object' || raw === null) throw new Error('Not an object');
  const v = raw as Record<string, unknown>;
  if (typeof v['apiUrl'] !== 'string')   throw new Error('apiUrl: string expected');
  if (typeof v['timeout'] !== 'number')  throw new Error('timeout: number expected');
  if (typeof v['retries'] !== 'number')  throw new Error('retries: number expected');
  // No cast: TypeScript knows the types through the narrowing checks
  return { apiUrl: v['apiUrl'], timeout: v['timeout'], retries: v['retries'] };
}

// Usage of the Parse approach:
const config = parseConfig(rawData);
// ^ Either Config or Exception — no intermediate state
console.log(config.apiUrl);  // TypeScript: string — no cast, no doubt
```

Try it: What happens when you use `"timeout": "5000"` (string instead of number)
in the JSON? In the Validate approach: `validateConfig` returns `false`
and you might use the faulty value anyway. In the Parse approach:
exception with a clear error message "timeout: number expected".

---

## Angular connection: HTTP interceptors as the parse boundary

```typescript annotated
// In Angular: HTTP interceptor as the ideal parse boundary
// All HTTP responses pass through interceptors — perfect place for parsing

@Injectable()
export class ValidationInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          // event.body is 'any' — here is the boundary
          const parsed = this.parseResponse(req.url, event.body);
          // ^ Parse once, then all subscribers have type-safe data
          return event.clone({ body: parsed });
        }
        return event;
      }),
      catchError(error => {
        if (error instanceof ParseError) {
          // Parsing failed: log details, throw user-friendly error
          console.error('API response invalid:', error.message);
          return throwError(() => new Error('Unexpected server response'));
        }
        return throwError(() => error);
      })
    );
  }

  private parseResponse(url: string, body: unknown): unknown {
    // URL-based routing to specific parsers
    if (url.includes('/api/users')) return parseUserList(body);
    if (url.includes('/api/orders')) return parseOrderList(body);
    return body;  // Pass unknown endpoints through unchanged
  }
}
```

The interceptor is the perfect boundary: all HTTP responses pass through it.
Afterwards, all data in the Angular system is already validated and type-safe.

---

## What you've learned

- **"Parse, don't validate"** (Alexis King, 2019): Transform unsafe
  inputs directly into safe types — instead of managing truth values separately
- **Result Pattern** (`Result<T, E>`) makes parsing errors explicit without `throw`
- **Smart Constructors** (L24) are a special case: parse a primitive
  value into a Branded Type
- **"Parse at the boundary"**: Validation belongs at the system edge — API call,
  localStorage, URL parameters — never deeper in the code
- In Angular: HTTP interceptors are the ideal parse boundary

> 🧠 **Explain it to yourself:** What is the difference between a
> validate function that returns `boolean` and a parse function that
> returns `T` or an error? What is lost with the boolean?
>
> **Key points:** boolean separates knowledge ("valid") from the object | After the
> if-block the knowledge is lost — TypeScript needs a cast again |
> Parse functions embody the knowledge in the type system itself | "Valid
> user" is not a User + boolean — it is a User (and only a User)

**Core concept to remember:** "Parse, don't validate" is more than a
programming trick — it is a design philosophy. Build systems so that
invalid states cannot be expressed at all. Then no validation deep in the code
is needed, because the type itself carries the guarantee.

---

> **Pause point** — You've understood the deepest design principle of this lesson.
> The next section summarizes everything as a practical checklist
> for everyday use.
>
> Continue with: [Section 06: Security Checklist and Code Review](./06-security-checkliste-und-review.md)