# Section 2: The Brand Technique

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - The Nominal Typing Problem](./01-das-nominal-typing-problem.md)
> Next section: [03 - Smart Constructors & Opaque Types](./03-smart-constructors-opaque-types.md)

---

## What you'll learn here

- How the **brand technique** works with intersection types
- Why `string & { readonly __brand: 'UserId' }` is nominally safe
- How to write **smart constructors** that assign brands
- The difference between a **compile-time brand** and runtime overhead

---

## The Idea: Making Structure Artificially Different
<!-- section:summary -->
The problem from section 01: `type UserId = string` is structurally identical

<!-- depth:standard -->
The problem from section 01: `type UserId = string` is structurally identical
to `string`. TypeScript cannot distinguish them.

The solution: We make the structure *artificially different* by adding a
unique "brand" property.

<!-- depth:vollstaendig -->
> **Background: Where does the brand technique come from?**
>
> The brand technique was developed in the TypeScript community as a
> workaround for the lack of nominal typing. It was popularized by
> projects like `ts-brand` (Charles Pick, 2019) and later by Microsoft's
> own code (e.g. in TypeScript's `src/compiler/types.ts`!).
>
> Interestingly, TypeScript itself uses this technique internally to
> protect node IDs, source file references, and other type-critical values.
> The TypeScript compiler source contains dozens of `{ readonly __brand: ... }`.
>
> This shows: even TypeScript experts need this technique — it's not a hack,
> but a recognized pattern in the TypeScript ecosystem.

---

<!-- /depth -->
## The Brand Technique in Detail
<!-- section:summary -->
### Why intersection (`&`) and not interface?

<!-- depth:standard -->
```typescript annotated
// Step 1: Define brand type as an intersection
type UserId = string & { readonly __brand: 'UserId' };
//            ^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//            Base     The "brand" — a unique property
//            (string) that TypeScript recognizes as a structural difference

// 'readonly': Prevents the brand property from being modified
// '__brand': Convention: __ = "internal" property (not for users)
// 'UserId': The name makes the brand unique

type OrderId = string & { readonly __brand: 'OrderId' };
//                                          ^^^^^^^^^ Different brand name!

// Now UserId and OrderId are STRUCTURALLY DIFFERENT:
// UserId  = string & { __brand: 'UserId' }
// OrderId = string & { __brand: 'OrderId' }
// TypeScript can no longer confuse them!
```

### Why intersection (`&`) and not interface?

```typescript annotated
// Option A: Intersection with string (common)
type UserId = string & { readonly __brand: 'UserId' };

// Option B: Interface (less common)
interface UserId {
  readonly __brand: 'UserId';
  // But: where does the actual string nature go?
  // Interfaces cannot directly "extends string"
}

// Option A is better:
// - Branded UserId BEHAVES like string (has .toUpperCase(), .length, etc.)
// - Wherever a string is expected, UserId can be passed
// - But: a plain string can NO LONGER be passed as UserId!
//   (Because a normal string has no __brand property)
```

> 🧠 **Explain to yourself:** Why can a `string` not be passed to a function
> that expects `UserId`, even though UserId is an intersection with
> `string`? What does intersection (`&`) mean for assignability?
>
> **Key points:** `A & B` means: "must have BOTH" | A normal `string`
> has no `__brand` property | Therefore: `string` is not assignable to `UserId` |
> But `UserId` is assignable to `string` (because it is string + more)

---

<!-- /depth -->
## The Complete Example

```typescript annotated
// 1. Define brand types
type UserId  = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

// 2. API functions use the brands
function getUser(id: UserId): string {
  return `User: ${id}`;
  // ^ 'id' can be used like a normal string!
  //   .toUpperCase(), .length, template literals — everything works.
}

function getOrder(id: OrderId): string {
  return `Order: ${id}`;
}

// 3. Plain strings no longer work:
const rawString = "user-123";

getUser(rawString);
// ^ COMPILE-ERROR: Argument of type 'string' is not assignable to
//   parameter of type 'UserId'. Type 'string' is not assignable to
//   type '{ readonly __brand: "UserId"; }'.
//   → TypeScript protects us!

// 4. Brands cannot be mixed up:
const orderId = "order-456" as OrderId; // (we'll explain the as-cast shortly)
getUser(orderId);
// ^ COMPILE-ERROR: Argument of type 'OrderId' is not assignable to
//   parameter of type 'UserId'. Types of property '__brand' are
//   incompatible. Type '"OrderId"' is not assignable to type '"UserId"'.
//   → Perfect: different brands = compile error!
```

---

## Smart Constructors: The Right Way to Cast
<!-- section:summary -->
One question remains: how do you actually create a `UserId` value?

<!-- depth:standard -->
One question remains: how do you actually create a `UserId` value?
We need **smart constructors** — functions that turn a `string`
into a validated `UserId`.

```typescript annotated
// Smart constructor variant 1: Simple cast (without validation)
function asUserId(value: string): UserId {
  return value as UserId;
  // ^ 'as UserId': An explicit type assertion (cast).
  //   This is the ONLY place where we use 'as'!
  //   We are "lying" to the compiler here — but deliberately and in a controlled way.
  //   Outside this function, nobody can accidentally cast.
}

// Smart constructor variant 2: With validation (recommended!)
function createUserId(value: string): UserId {
  if (!value.startsWith('user-')) {
    throw new Error(`Invalid UserId: "${value}"`);
    // ^ Loses the 'as' cast without performing validation
  }
  if (value.length < 10) {
    throw new Error(`UserId too short: "${value}"`);
  }
  return value as UserId;
  // ^ The cast is safe here: we have verified that the value is valid.
}

// Usage:
const userId = createUserId('user-abc123');
// userId: UserId — type-safe AND validated!

getUser(userId); // ✅ Works!
getOrder(userId); // ❌ COMPILE-ERROR — perfect!
```

<!-- depth:vollstaendig -->
> **Experiment:** Open `examples/01-brand-basics.ts` and try the following:
> 1. Create a `UserId` with `asUserId('user-123')`.
> 2. Try passing the same value directly (without cast) to `getUser()`.
> 3. Observe: what does TypeScript say? What is the exact error message?

---

<!-- /depth -->
## Restricting the `as`-Cast Problem
<!-- section:summary -->
A good design principle: `as Brand` should appear **only** in smart constructors

<!-- depth:standard -->
A good design principle: `as Brand` should appear **only** in smart constructors,
never in business code. To enforce this, we can take one of two approaches:

```typescript annotated
// Strategy 1: Module with private brand
// In userId.ts:
declare const __brand: unique symbol; // Secret symbol!
//            ^^^^^^^^^^^^ 'unique symbol' is even stronger:
//            Every 'unique symbol' is its own distinct type!

type UserId = string & { readonly [__brand]: 'UserId' };
//                              ^^^^^^^^^ Computed property with private symbol

// The 'unique symbol' can only be used as a key in THIS file.
// Other modules don't know __brand → they can't perform a cast!
export function createUserId(value: string): UserId {
  return value as UserId; // Only allowed here!
}
// Export only the function, not the symbol → perfect encapsulation!

// Strategy 2: Opaque types (next section)
```

> 💭 **Think about it:** If we allow `as UserId` everywhere in the code, we
> have lost part of the type safety. Why? What is the difference between
> an `as` cast in a smart constructor and an `as` cast in business code?
>
> **Answer:** In a smart constructor the cast is *documented and validated* —
> a single location that can be audited. `as` casts in business code are
> invisibly scattered and hard to audit. TypeScript itself says: "as" is
> a promise to the compiler ("trust me") — and promises should be centralized.

---

<!-- /depth -->
## Branded Types Behave Like Primitive Types
<!-- section:summary -->
An important advantage: branded types are still the base type!

<!-- depth:standard -->
An important advantage: branded types are still the base type!

```typescript annotated
type UserId = string & { readonly __brand: 'UserId' };

function createUserId(s: string): UserId {
  return s as UserId;
}

const id = createUserId('user-123');

// All string operations work:
console.log(id.toUpperCase());  // 'USER-123'
console.log(id.length);         // 8
console.log(`ID: ${id}`);       // 'ID: user-123'
console.log(id.startsWith('user-')); // true

// Can be passed as string (upcast, safe):
function logRaw(s: string): void { console.log(s); }
logRaw(id); // ✅ OK! UserId is a subtype of string.

// But string → UserId doesn't work (downcast, unsafe):
function logUserId(id: UserId): void { console.log(id); }
const rawStr = "user-456";
// logUserId(rawStr); // ❌ COMPILE-ERROR
```

<!-- depth:vollstaendig -->
> **In your Angular project:** You can use branded types directly in
> HttpClient calls:
>
> ```typescript
> type UserId = string & { readonly __brand: 'UserId' };
>
> @Injectable({ providedIn: 'root' })
> export class UserService {
>   constructor(private http: HttpClient) {}
>
>   getUser(id: UserId) {
>     // 'id' behaves exactly like string in the template literal:
>     return this.http.get<User>(`/api/users/${id}`);
>   }
>
>   deleteUser(id: UserId) {
>     return this.http.delete(`/api/users/${id}`);
>     // No casting needed! UserId is compatible with string in the template.
>   }
> }
>
> // And in React:
> function UserCard({ userId }: { userId: UserId }) {
>   const { data } = useQuery(['user', userId], () => fetchUser(userId));
>   // userId is compatible as a query key (string[]) and as an argument
>   return <div>{userId}</div>; // Works in JSX!
> }
> ```

---

<!-- /depth -->
## Zero Runtime Overhead
<!-- section:summary -->
A decisive advantage of the brand technique: **no runtime overhead**.

<!-- depth:standard -->
A decisive advantage of the brand technique: **no runtime overhead**.

The `__brand` property exists **only at compile time**. After compilation,
a `UserId` value is simply a normal JavaScript string:

```typescript
// TypeScript (compile time):
const id: UserId = createUserId('user-123');

// JavaScript after transpilation:
const id = 'user-123'; // Just a string!
// The __brand property does not exist!
```

This is the difference from a class-based solution:
```javascript
// A class solution would have runtime overhead:
class UserId { constructor(val) { this.value = val; } }
const id = new UserId('user-123'); // Object allocation!
```

---

<!-- /depth -->
## What you've learned

- **Brand technique**: `type UserId = string & { readonly __brand: 'UserId' }` makes types
  structurally different — without runtime overhead
- Plain `string` values are **no longer** compatible with `UserId` → compile error
- Different brands (`'UserId'` vs `'OrderId'`) are **not** compatible
- **Smart constructors** centralize `as` casts and can include validation
- Branded types behave fully like their base type (string operations, template literals)

> 🧠 **Explain to yourself:** Why can a plain `string` not be passed to a
> function that expects `UserId`, even though `UserId = string & {...}`?
> What does TypeScript check for intersection types?
>
> **Key points:** Intersection = must satisfy ALL parts | string alone
> has no `__brand` property | TypeScript: "You don't have all the parts" → error |
> Only through an `as` cast or smart constructor do you get a real `UserId`

**Core concept to remember:** Brand = an invisible property that does not exist
at runtime, but forces TypeScript at compile time to distinguish between types.

---

> **Pause point** — You now know the fundamental brand technique.
>
> Continue with: [Section 03: Smart Constructors & Opaque Types](./03-smart-constructors-opaque-types.md)