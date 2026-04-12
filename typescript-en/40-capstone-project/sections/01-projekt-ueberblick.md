# Section 1: Project Overview — Type-Safe Full-Stack Architecture

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Domain Modeling](./02-domain-modeling.md)

---

## What you'll learn here

- The **capstone project**: A type-safe e-commerce API layer by layer
- Why **end-to-end type safety** is the holy grail
- The **architecture**: Domain → API → Business Logic → Frontend
- How **all 40 lessons** flow together in a single project

---

## Welcome to the Capstone

You've mastered 39 lessons of TypeScript. From primitive types (L02)
through generics (L13), branded types (L24), type-level programming (L37)
to best practices (L39) — and from type aliases (L08) and classes (L21) to
type-safe tests (L33) — you've been on a journey that has taken you from
"knows TypeScript" to "masters TypeScript".

In this final lesson we're building an end-to-end project that
**connects everything**. No new concepts — just the application of everything
you've learned.

> 💡 **Analogy:** Imagine you had 39 individual tools in a
> workshop — a precision hammer, a laser tape measure,
> a CNC milling machine. Each one impressive on its own.
> But only when you combine them to build a complete house
> does tool mastery become true craftsmanship. This capstone
> is your masterpiece — the moment where individual skills
> become a coherent whole.

> 📖 **Background: Why a capstone project?**
>
> In higher education didactics, the capstone project is the
> conclusion of a degree program: a project that connects all
> the skills learned and demonstrates that the learner can apply
> them independently. Benjamin Bloom described in his 1956
> taxonomy the highest level as "synthesis" — the ability to
> combine individual parts into a new whole. That's exactly
> what you're doing now. No longer "how does Conditional Types
> work" but "where do I use Conditional Types to make my
> project better".
>
> 🏗️ **Architecture backstory: Why e-commerce?**
>
> E-commerce wasn't chosen by accident. It's the domain that
> benefits most from type safety: monetary amounts must be
> correct, orders must not get lost, state transitions must
> be right. A single type error here can directly cost money —
> wrong prices, lost deliveries, duplicate charges. In real
> projects, a mid-sized company that migrated their shop API to
> TypeScript reduced error rates at layer boundaries by 73%.
> The investment in type safety paid for itself within three months.
>
> 💡 **Analogy:** An e-commerce architecture is like a
> traffic management system. The domain types are the roads and
> intersections. The API is the traffic light control. The business
> logic is the traffic rules. Without type safety, cars
> (data) would just drive anywhere — with type safety there
> are clear routes and red lights keep everything in order.

> ⚡ **Real-world example:** A well-known TypeScript e-commerce
> project is Medusa.js. Its entire architecture is based on
> the same principles you're learning here: branded types for
> entity IDs, discriminated unions for order status, generics
> for the repository pattern. When you read Medusa.js' source code
> you'll recognize everything — because you've now built it yourself.
> The difference: you know WHY every decision was made that way.

---

## The Project: TypeShop — Type-Safe E-Commerce Layers

We're not building a complete app but rather the **type architecture**
of an e-commerce system. Layer by layer:

```
┌─────────────────────────────────────────────────────┐
│  Section 2: Domain Modeling                         │
│  Branded Types + Discriminated Unions               │
│  UserId, ProductId, Money, OrderStatus              │
│  → L02, L07, L12, L24                               │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  Section 3: API Layer                               │
│  Type-safe REST + Validation                        │
│  Route Types, Request/Response, Error Handling      │
│  → L06, L13, L17, L25, L32, L37                    │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  Section 4: Business Logic                          │
│  Generics + Patterns                                │
│  Repository<T>, Result<T,E>, Event System           │
│  → L13, L14, L22, L25, L26                          │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  Section 5: Conclusion                              │
│  Recap + Self-Assessment                            │
│  40 Lessons in One Architecture                     │
│  → Everything                                       │
└─────────────────────────────────────────────────────┘
```

---

## The Architecture Principles

Our project follows three principles you know from the last lessons:

### 1. Defensive Shell, Offensive Core (L39)

```typescript annotated
// SHELL: API endpoint validates external input
async function handleCreateOrder(req: Request): Promise<Response> {
  const body: unknown = await req.json();  // unknown!
  const parsed = parseCreateOrderInput(body);  // Validation
  if (!parsed.ok) return errorResponse(parsed.error);
  // From here: parsed.value is type-safe
  const result = await orderService.create(parsed.value);
  return jsonResponse(result);
}

// CORE: Service trusts the type
class OrderService {
  async create(input: CreateOrderInput): Promise<Result<Order, OrderError>> {
    // No validation needed — the type guarantees correctness
    const orderId = OrderId.create();
    // ...
  }
}
```

### 2. Make Impossible States Impossible (L12, L26)

```typescript annotated
// Instead of boolean flags:
type OrderStatus =
  | { status: "draft"; items: CartItem[] }
  | { status: "pending"; items: CartItem[]; total: Money }
  | { status: "paid"; items: CartItem[]; total: Money; paymentId: PaymentId }
  | { status: "shipped"; items: CartItem[]; total: Money; paymentId: PaymentId; trackingId: string }
  | { status: "cancelled"; reason: string };
// ^ Each status has exactly the data it needs — no more, no less
```

### 3. Parse, Don't Validate (L24, L39)

```typescript annotated
// Instead of: validateEmail(s): boolean + s as Email
function parseEmail(raw: string): Result<Email, "invalid-email"> {
  if (!raw.includes("@")) return { ok: false, error: "invalid-email" };
  return { ok: true, value: raw as Email };
  // ^ The brand is assigned ONLY here — Smart Constructor
}
```

> 🧠 **Explain it to yourself:** How are these three principles
> connected? Why do you need all three — isn't one enough?
> **Key points:** Defensive shell protects the boundary | Make
> Impossible States Impossible models the core | Parse Don't
> Validate connects both: parse at the boundary → type-safe data in the core

---

## The Lesson-to-Feature Map

| Feature | Lessons Used |
|---------|-------------|
| Branded IDs (UserId, ProductId) | L02 (Primitives), L24 (Branded Types) |
| Money type (cents-based) | L24 (Branded), L02 (number) |
| OrderStatus (DU) | L07 (Union), L12 (Discriminated Unions) |
| Repository<T> | L13 (Generics), L14 (Generic Patterns), L22 (Advanced Generics) |
| Result<T,E> | L25 (Error Handling), L07 (Union) |
| API route types | L37 (Type-Level Programming), L06 (Functions) |
| Type Guards | L11 (Narrowing), L39 (Best Practices) |
| Event System | L17 (Conditional Types), L26 (Advanced Patterns) |
| Config types | L16 (Mapped Types), L29 (tsconfig) |
| Exhaustive Checks | L12 (DU), L39 (Best Practices) |
| type vs. interface (design decision) | L08 (Type Aliases vs. Interfaces) |
| OrderService as a class | L21 (Classes and OOP) |
| Testable architecture *(bonus)* | L33 (Testing TypeScript) |

> ⚡ **Framework reference:** This architecture transfers directly.
> In Angular the "shell" would consist of HTTP interceptors and route
> guards, the "core" of services. In React the shell would be in API
> route handlers (Next.js) or custom hooks, the core in utility
> functions and state logic. The type architecture is
> framework-agnostic — that's why you're learning it here without
> a framework.
>
> 💡 **Analogy:** Framework-agnostic type architecture is like
> the foundation of a house. Whether you build a timber-frame house
> (Angular), a modern glass house (React), or a wooden house
> (Next.js) on top of it — the foundation stays the same. A strong
> foundation with correct types supports any framework.

> 💭 **Think about it:** If you were to apply this project in your
> Angular project — where would you start? Which layer has the
> highest ROI?
>
> **Answer:** Domain modeling (branded IDs + discriminated unions).
> It's the simplest change with the greatest impact. You can
> introduce UserId and OrderId tomorrow without major refactoring
> of existing code. The API layer and business logic follow
> naturally afterward.

---

## Experiment: Your Own Architecture Sketch

Before we dive into the code, sketch the architecture of your
current project:

```
// Questions for your sketch:
// 1. Where does external data come in? (API responses, forms, URL params)
//    → Those are your system boundaries (defensive shell)
//
// 2. What entities do you have? (User, Order, Product, ...)
//    → That's your domain model (branded IDs, DUs)
//
// 3. What states do your entities have? (draft → active → archived)
//    → Those are your discriminated unions
//
// 4. What errors can occur? (not-found, unauthorized, validation)
//    → That's your error model (Result<T,E>)
//
// Draw the layers and mark where you currently use any/as.
// Those are the places that would benefit most from TypeScript.

// BONUS QUESTION: If you could set up your project from scratch —
// which 3 types would you equip with branded types first?
// Why those specifically? What would happen if you introduced them
// tomorrow without changing anything else?

// INLINE EXPERIMENT: Take an existing function from your
// code that has a boolean flag as a parameter:
//   function getUsers(active: boolean)
// Replace it with a discriminated union:
//   type UserFilter = { type: "active" } | { type: "inactive"; since: Date }
// How does the call site change? How does the implementation?
```

---

## What you've learned

- The **capstone project** connects all 40 lessons in an end-to-end architecture
- Three principles: **Defensive Shell**, **Make Impossible States Impossible**, **Parse Don't Validate**
- The **layers**: Domain → API → Business Logic → Frontend
- Every feature maps to concrete lessons — nothing is new, everything is application

> 🧠 **Explain it to yourself:** Why is a type-safe architecture
> more valuable than type-safe individual functions? What do you
> gain from end-to-end typing across all layers?
> **Key points:** Individual type-safe functions only protect locally |
> End-to-end typing protects BETWEEN layers | Most bugs occur at
> layer boundaries | End-to-end type safety eliminates these bugs
> at compile time

**Key concept to remember:** An architecture is only as type-safe as its weakest layer. A single `any` at a layer boundary makes the type safety of all other layers worthless.

> 💭 **Think about it:** Imagine a colleague asks you: "Is the
> effort for type safety really worth it?" What do you say?
> Formulate an answer that explains the business value —
> not just the technical benefits.
> **Key points:** Fewer production bugs = fewer hotfixes |
> Better developer experience = faster feature development |
> Self-documenting code = fewer meetings and follow-up questions |
> Compile-time checking = fewer QA cycles needed

> 💡 **Analogy:** End-to-end type safety is like a safety chain
> while mountain climbing. A single weak link (an `any`) breaks
> the entire chain. But when every link is strong, you can rely
> on each one — from the first carabiner (domain) to the last
> rope (frontend).

---

> **Pause point** — The architecture is set. Now we build the
> first layer: domain modeling.
>
> Continue with: [Section 02: Domain Modeling](./02-domain-modeling.md)