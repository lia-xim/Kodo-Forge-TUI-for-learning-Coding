# Section 3: Phantom Types

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - State Machine Pattern](./02-state-machine-pattern.md)
> Next section: [04 - Fluent API Pattern](./04-fluent-api-pattern.md)

---

## What you'll learn here

- What **Phantom Types** are and why they are "invisible" at runtime
- How Phantom Types prevent **semantic mix-ups**
- The relationship between Phantom Types and **Branded Types** (Lesson 24)
- How Phantom Types can carry **state information** in the type

---

## Background: The invisible type

> **Feature Origin Story: Phantom Types**
>
> The term "Phantom Type" originates from functional programming —
> specifically Haskell (around 2000). James Cheney and Ralf Hinze formally
> described the concept in their paper "First-Class Phantom Types" (2003).
>
> The idea: A type parameter that does not appear in the **value**, but
> exists in the **type**. It is a "phantom" — invisible at runtime,
> but visible to the compiler.
>
> In Haskell: `newtype Distance a = Distance Double` — the `a` never
> appears in the value (it is always a Double), but the type
> distinguishes `Distance Meters` from `Distance Miles`.
>
> TypeScript's structural type system makes Phantom Types slightly
> trickier than in Haskell — but with Branded Types (Lesson 24)
> we have already laid the foundation.

---

## The problem: Semantically different values with the same type

```typescript annotated
// Everything is "string" — but semantically completely different!
function sendEmail(to: string, subject: string, body: string): void {
  // What stops us from mixing up the parameters?
  // Nothing! Everything is string.
}

sendEmail(
  "Hello World",         // Oops! That's the subject, not the email
  "max@example.com",     // Oops! That's the address, not the subject
  "Welcome!"
);
// ^ TypeScript: "All good!" — Everything is string. No error.
// Runtime: Email goes to "Hello World" — that won't work.

// Same problem with numbers:
function transfer(amount: number, fromAccount: number, toAccount: number): void {
  // amount, fromAccount, toAccount — all number. Mix-ups possible!
}

transfer(12345678, 100, 87654321);
// ^ Is 12345678 the amount or the account number? Who knows?
```

> 💭 **Think about it:** You learned about Branded Types in Lesson 24.
> How do Branded Types and Phantom Types relate to each other?
>
> **Answer:** Branded Types ARE a form of Phantom Types in TypeScript!
> The `__brand` property only exists in the type, not at runtime.
> It is a "phantom" — it carries information the compiler uses,
> but which is gone at runtime (type erasure).

---

## Phantom Types in TypeScript
<!-- section:summary -->
In Haskell, a Phantom Type is simply an unused type parameter.

<!-- depth:standard -->
In Haskell, a Phantom Type is simply an unused type parameter.
In TypeScript we need a small trick, because the structural
type system would ignore unused parameters:

```typescript annotated
// Generic Phantom Type wrapper
type Phantom<BaseType, Tag> = BaseType & { readonly __phantom: Tag };
// ^ BaseType: The real runtime type (string, number)
// ^ Tag: The phantom type (exists ONLY in the type system)
// ^ __phantom: "anchor" so TypeScript doesn't optimize the tag away

// Define semantic types:
type Email = Phantom<string, "Email">;
type Subject = Phantom<string, "Subject">;
type Body = Phantom<string, "Body">;

// Type-safe function:
function sendEmail(to: Email, subject: Subject, body: Body): void {
  // Now the parameters CANNOT be mixed up!
}

// Create values with validation:
function validateEmail(raw: string): Email {
  if (!raw.includes("@")) throw new Error("Invalid email");
  return raw as Email;
}

const email = validateEmail("max@example.com");
const subject = "Hello" as Subject;
const body = "Welcome!" as Body;

sendEmail(email, subject, body); // OK
// sendEmail(subject, email, body); // COMPILE-ERROR!
// ^ Subject is not Email — the types are incompatible
```

> 🧠 **Explain it to yourself:** Why does the Phantom Type need the
> `__phantom` property? What would happen if we simply wrote
> `type Email = string & { tag: "Email" }`?
>
> **Key points:** Without __phantom TypeScript's structural type system
> would not distinguish the tags | `{ tag: "Email" }` and
> `{ tag: "Subject" }` are different types — that works |
> __phantom is a convention, the name doesn't matter | Important: readonly
> so nobody tries to change the value

---

<!-- /depth -->
## Phantom Types for states
<!-- section:summary -->
A powerful application: encoding the state of an object in the type,

<!-- depth:standard -->
A powerful application: encoding the state of an object in the type,
without storing it as a runtime value:

```typescript annotated
// States as Phantom Types (no runtime values!)
type Draft = { readonly __state: "draft" };
type Published = { readonly __state: "published" };
type Archived = { readonly __state: "archived" };

// Article with Phantom State
type Article<State> = {
  readonly __phantom: State;
  id: string;
  title: string;
  content: string;
};

// Functions that only accept certain states:
function publish(article: Article<Draft>): Article<Published> {
  // ^ Accepts ONLY Draft articles!
  console.log(`Publishing: ${article.title}`);
  return article as unknown as Article<Published>;
  // ^ Nothing changes at runtime — only the type changes
}

function archive(article: Article<Published>): Article<Archived> {
  // ^ Accepts ONLY Published articles!
  return article as unknown as Article<Archived>;
}

// Usage:
const draft: Article<Draft> = {
  id: "1", title: "TypeScript Patterns", content: "..."
} as Article<Draft>;

const published = publish(draft);     // OK: Draft -> Published
const archived = archive(published);  // OK: Published -> Archived

// archive(draft);  // COMPILE-ERROR! Draft is not Published
// publish(archived); // COMPILE-ERROR! Archived is not Draft
```

<!-- depth:vollstaendig -->
> **Experiment:** Think through a Phantom Type system for database records:
>
> ```typescript
> // A user that hasn't been saved yet has no ID:
> type Unsaved = { readonly __dbState: "unsaved" };
> type Saved = { readonly __dbState: "saved" };
>
> type DbEntity<T, State> = State extends Saved
>   ? T & { id: number; createdAt: Date }  // Saved: id + createdAt guaranteed
>   : T;                                    // Unsaved: just the data
>
> function save<T>(entity: DbEntity<T, Unsaved>): DbEntity<T, Saved> {
>   // Save to DB and add id + createdAt
>   return { ...entity, id: 1, createdAt: new Date() } as DbEntity<T, Saved>;
> }
>
> // Question: What happens if you call save() twice?
> // Answer: Compile error! DbEntity<T, Saved> is not DbEntity<T, Unsaved>
> ```

---

<!-- /depth -->
## Phantom Types vs. Branded Types vs. Newtype
<!-- section:summary -->
| Approach | Runtime overhead | Type safety | Complexity |

<!-- depth:standard -->
| Approach | Runtime overhead | Type safety | Complexity |
|---|---|---|---|
| Branded Types (L24) | None | High | Low |
| Phantom Types | None | Very high | Medium |
| Newtype (next lesson) | None | Highest | High |
| Wrapper classes | Yes (object) | High | Low |

> ⚡ **In React** you see Phantom-Type-like patterns when
> typing hooks:
>
> ```typescript
> // React.Ref<T> is a Phantom Type pattern:
> // T only appears in the type, not in the runtime value
> const inputRef = useRef<HTMLInputElement>(null);
> // inputRef.current is HTMLInputElement | null
> // T="HTMLInputElement" is a phantom — it only exists in the type
>
> // Similarly: React.Key is string | number
> // But React doesn't use it in a type-safe way internally —
> // a Phantom Type could distinguish "NumericKey" from "StringKey"
> ```

---

<!-- /depth -->
## What you've learned

- **Phantom Types** carry information in the type that does not exist at runtime (type erasure)
- They prevent **semantic mix-ups** (Email vs. Subject, Draft vs. Published)
- In TypeScript you need a `__phantom` property as an "anchor" due to the structural type system
- Phantom Types can encode **states** without runtime overhead
- **Branded Types** from Lesson 24 are a simple form of Phantom Types

> 🧠 **Explain it to yourself:** Why are Phantom Types particularly well suited
> for unit systems (meters vs. miles, EUR vs. USD)?
>
> **Key points:** At runtime both are just numbers | The type prevents mixing |
> NASA Mars Climate Orbiter: miles/meters mix-up cost
> 125 million dollars | Phantom Types would have prevented that

**Core concept to remember:** Phantom Types are type information without
runtime representation. They use TypeScript's type erasure as a feature:
The compiler checks, the runtime ignores.

---

> **Pause point** — Phantom Types are powerful but abstract.
> Next topic: Fluent APIs — beautiful, readable interfaces.
>
> Continue with: [Section 04: Fluent API Pattern](./04-fluent-api-pattern.md)