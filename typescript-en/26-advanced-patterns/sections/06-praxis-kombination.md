# Section 6: Practical Combination

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Newtype Pattern](./05-newtype-pattern.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- How to **combine multiple patterns** for a realistic use case
- A complete example: **type-safe HTTP client** with Builder, State Machine, and Newtypes
- How to recognize and avoid **over-engineering**
- When each pattern delivers the most value

---

## Background: Combining Patterns

> **Feature Origin Story: Pattern Languages**
>
> Christopher Alexander coined the concept of "Pattern Language" in 1977
> in the field of architecture: individual patterns are useful, but only
> their **combination** creates coherent solutions.
>
> The same holds true in software development. The Gang-of-Four book
> (1994) describes 23 patterns — but real software rarely uses a single
> pattern in isolation. A Builder can use State Machine transitions,
> Phantom Types can protect Newtypes, and Fluent APIs can bring them
> all together.
>
> The art lies in using **exactly as much** type safety as necessary —
> and no more. Over-engineering with patterns is just as harmful as
> under-engineering without them.

---

## Practical Example: Type-Safe HTTP Client
<!-- section:summary -->
We combine Builder + State Machine + Newtypes:

<!-- depth:standard -->
We combine Builder + State Machine + Newtypes:

```typescript annotated
// === Newtypes for HTTP concepts ===

declare const UrlBrand: unique symbol;
type SafeUrl = string & { readonly [UrlBrand]: "SafeUrl" };

function SafeUrl(raw: string): SafeUrl {
  try { new URL(raw); } catch { throw new Error(`Invalid URL: ${raw}`); }
  return raw as SafeUrl;
}

// === State Machine: Request phases ===

type RequestState =
  | { phase: "configure" }
  // ^ URL and method are being set
  | { phase: "headers" }
  // ^ Headers are being added
  | { phase: "body" }
  // ^ Request body is being set (POST/PUT only)
  | { phase: "ready" }
  // ^ Ready to send
  ;

// === Builder with State Machine ===

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ConfigureStep {
  url(url: SafeUrl): ConfigureStep;
  // ^ Must be called at least once
  method(m: HttpMethod): HeaderStep;
  // ^ Method sets the next step
}

interface HeaderStep {
  header(name: string, value: string): HeaderStep;
  // ^ Any number of headers
  body(data: unknown): ReadyStep;
  // ^ Set body (optional for GET/DELETE)
  send<T>(): Promise<T>;
  // ^ Send directly without body
}

interface ReadyStep {
  send<T>(): Promise<T>;
  // ^ Only sending is possible now
}
```

> 🧠 **Explain to yourself:** Why is `SafeUrl` a Newtype rather than
> just a `string`? What does it specifically prevent?
>
> **Key points:** Prevents invalid URLs in requests |
> Validation happens once at creation |
> Cannot accidentally be confused with other strings |
> Type-level documentation: "A validated URL is expected here"

---

<!-- /depth -->
## The Implementation

```typescript annotated
class HttpClientBuilder implements ConfigureStep, HeaderStep, ReadyStep {
  private _url?: SafeUrl;
  private _method: HttpMethod = "GET";
  private _headers: Record<string, string> = {};
  private _body?: unknown;

  url(url: SafeUrl): ConfigureStep {
    this._url = url;
    return this;
  }

  method(m: HttpMethod): HeaderStep {
    this._method = m;
    return this;
    // ^ Return type: HeaderStep — configure methods no longer visible
  }

  header(name: string, value: string): HeaderStep {
    this._headers[name] = value;
    return this;
  }

  body(data: unknown): ReadyStep {
    this._body = data;
    return this;
    // ^ Return type: ReadyStep — only send() is possible now
  }

  async send<T>(): Promise<T> {
    if (!this._url) throw new Error("URL not set");
    // Real implementation would use fetch():
    console.log(`${this._method} ${this._url}`);
    console.log("Headers:", this._headers);
    if (this._body) console.log("Body:", this._body);
    return {} as T; // Placeholder
  }
}

function http(): ConfigureStep {
  return new HttpClientBuilder();
}

// Usage — reads like natural language:
const response = await http()
  .url(SafeUrl("https://api.example.com/users"))
  .method("POST")
  .header("Content-Type", "application/json")
  .header("Authorization", "Bearer token123")
  .body({ name: "Max", email: "max@example.com" })
  .send<{ id: string }>();
```

> 💭 **Think about it:** This HTTP client combines three patterns
> (Newtype, State Machine, Builder). Could you use just one of them
> and still achieve good type safety?
>
> **Answer:** Yes — for most use cases a simple Builder OR a
> type-safe function with an options object is sufficient.
> The combination only pays off for **public APIs** used by many
> developers, or for **security-critical code** where mix-ups are costly.

---

## Anti-Pattern: Recognizing Over-Engineering

```typescript
// OVER-ENGINEERED — too many patterns for a simple problem:
type ValidatedEmail = Phantom<string, "ValidatedEmail">;
type FormState = StateMachine<"empty" | "partial" | "complete" | "submitted">;

class FormBuilder<
  Set extends string = never,
  State extends FormState = FormState<"empty">
> {
  // 200 lines of type gymnastics for a form with 3 fields...
}

// BETTER — simple and readable:
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

function submitContact(form: ContactForm): Result<void, ValidationError> {
  // Direct validation, clear types, no pattern needed
}
```

> **Experiment:** Evaluate these scenarios — which pattern would you choose?
>
> ```
> Scenario 1: Prevent mixing up User ID and Order ID
> → Branded Type (simple, completely sufficient)
>
> Scenario 2: Order process with 5 states
> → State Machine (Discriminated Union)
>
> Scenario 3: SQL query builder for a library
> → Fluent API with step interfaces
>
> Scenario 4: Calculating currency amounts (EUR, USD, CHF)
> → Newtype with its own operations
>
> Scenario 5: Config object with 3 required fields
> → Simple interface (NO pattern needed!)
> ```

---

## Decision Tree: Which Pattern When?

```
Do I need type safety beyond primitive types?
├── No → Simple interface/type alias is sufficient
└── Yes → What exactly?
    ├── Prevent mix-ups (IDs, units)?
    │   ├── Simple IDs → Branded Type
    │   └── Values with operations → Newtype
    ├── Modeling states?
    │   ├── Invisible (Draft/Published) → Phantom Type
    │   └── Visible (loading/error) → Discriminated Union
    ├── Step-by-step construction?
    │   ├── Enforce required fields → Builder
    │   └── Enforce ordering → Fluent API with steps
    └── Everything combined? → Combine sparingly!
```

> ⚡ **In your Angular project** I recommend this pragmatic approach:
>
> ```typescript
> // 1. Branded Types for entity IDs (introduce immediately):
> type UserId = string & { readonly __brand: "UserId" };
> type OrderId = string & { readonly __brand: "OrderId" };
>
> // 2. Discriminated Unions for state (with NgRx/Signals):
> type LoadState<T> =
>   | { status: "idle" }
>   | { status: "loading" }
>   | { status: "success"; data: T }
>   | { status: "error"; error: string };
>
> // 3. Builder only for complex configurations (rarely needed)
> // 4. Phantom Types for roles/permissions (when security is critical)
> ```
>
> In React:
>
> ```typescript
> // Same approach — Branded Types + Discriminated Unions cover
> // 90% of cases. Builder/Phantom/Newtype only when needed.
> ```

---

## Summary: All 5 Patterns at a Glance

| Pattern | Purpose | Runtime Cost | Complexity |
|---|---|---|---|
| Builder | Step-by-step construction, required fields | None | Medium |
| State Machine | States and transitions | None | Medium |
| Phantom Types | Invisible type information | None | Medium |
| Fluent API | Readable API with chaining | None | Medium-High |
| Newtype | Domain values with operations | None | Medium |

All 5 patterns have **zero runtime overhead** — they use
TypeScript's type erasure as a feature, not a limitation.

---

## What you've learned

- **Combining patterns** is powerful, but must be used with restraint
- A **type-safe HTTP client** shows how Builder, State Machine, and Newtypes work together
- **Over-engineering** can be recognized when type complexity exceeds business value
- The **pragmatic rule**: Branded Types + Discriminated Unions cover 90% of cases

> 🧠 **Explain to yourself:** When is it worth investing in a
> complex type pattern, and when is a simple interface better?
>
> **Key points:** Complex patterns pay off for: public APIs |
> security-critical code | frequently used abstractions |
> Simple interfaces are sufficient for: internal code | few parameters |
> prototypes | teams not familiar with all patterns

**Core concept to remember:** TypeScript's type system is Turing-complete —
you can model almost anything. But the art lies in **leaving things out**:
use exactly as much type safety as the use case demands.

---

> **End of lesson** — You have mastered 5 advanced TypeScript patterns.
> The next lesson covers Declaration Merging —
> how to extend third-party types.
>
> Continue with: [Lesson 27: Declaration Merging](../../27-declaration-merging/sections/01-interface-merging-basics.md)