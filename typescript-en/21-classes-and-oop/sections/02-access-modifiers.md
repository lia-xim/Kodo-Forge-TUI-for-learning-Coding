# Section 2: Access Modifiers

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Class Basics](./01-klassen-grundlagen.md)
> Next section: [03 - Inheritance and Abstract Classes](./03-vererbung-und-abstract.md)

---

## What you'll learn here

- The four access modifiers: **public**, **private**, **protected**, and **readonly**
- The fundamental difference between TypeScript's `private` and JavaScript's `#private`
- Why **type erasure** means `private` does **not exist** at runtime
- How to use access modifiers in practice to define APIs clearly

---

## The four access modifiers at a glance

<!-- section:summary -->
TypeScript offers `public` (default), `private`, `protected`, and `readonly` — compile-time modifiers for API definition that disappear at runtime via type erasure.
<!-- depth:standard -->
TypeScript provides four keywords to control access to class members.
If you come from Java or C#, you'll recognize much of this — but there's
one crucial difference you need to understand.

```typescript annotated
class BankAccount {
  public owner: string;
  // ^ public: Accessible from anywhere. This is the DEFAULT —
  //   if you write nothing, it's public.
  private balance: number;
  // ^ private: Only accessible within THIS class.
  //   WARNING: Compile-time only! (Type Erasure)
  protected accountType: string;
  // ^ protected: Within this class AND in subclasses.
  readonly iban: string;
  // ^ readonly: Cannot be changed after initialization.

  constructor(owner: string, iban: string, initialBalance: number = 0) {
    this.owner = owner;
    this.iban = iban;
    this.balance = initialBalance;
    this.accountType = "checking";
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.balance += amount;
    // ^ OK: private fields are accessible within the class.
  }

  getBalance(): number {
    return this.balance;
    // ^ Getter method: The safe way to query the balance.
  }
}

const account = new BankAccount("Max", "DE89...", 1000);
console.log(account.owner);    // OK: public
console.log(account.iban);     // OK: readonly (reading is fine)
// account.iban = "DE00...";   // ERROR: readonly after initialization
// console.log(account.balance); // ERROR: private
// account.accountType;        // ERROR: protected
```

| Modifier | Within the class | Subclasses | From outside |
|---|---|---|---|
| `public` | Yes | Yes | Yes |
| `private` | Yes | No | No |
| `protected` | Yes | Yes | No |
| `readonly` | Yes (init only) | Yes (read) | Yes (read) |

<!-- depth:vollstaendig -->
> **Analogy:** Access modifiers are like zones in a company building:
> `public` = reception (everyone can enter), `private` = CEO's office
> (key card required), `protected` = lab (employees + interns),
> `readonly` = notice board (look yes, change no).

<!-- /depth -->

---

## The big misconception: private is NOT truly private

<!-- section:summary -->
TypeScript's `private` only exists at compile time — at runtime anyone can access it via `(obj as any).field`; JavaScript's `#private` (ES2022) provides real runtime encapsulation.
<!-- depth:standard -->
Here comes the most important concept in this section — and it ties
directly to **type erasure** from Lesson 02:

> **TypeScript's `private` only exists at compile time.
> At runtime the field is completely accessible!**

```typescript annotated
class Secret {
  private password: string = "secret123";
}

const s = new Secret();
// s.password;          // Compile error: private
(s as any).password;    // "secret123" — WORKS!
// ^ Type Erasure: 'private' is gone at runtime.
//   With 'as any' you bypass the type system entirely.
```

<!-- depth:vollstaendig -->
> **Background: Java's influence and JavaScript's reality**
>
> TypeScript's access modifiers are inspired by **Java and C#** —
> no coincidence, since Anders Hejlsberg (TypeScript's creator) also
> invented C#. In Java, `private` is a hard restriction: the JVM prevents
> access at runtime (Reflection makes it possible, but the intent is clear).
>
> In TypeScript, however, `private` is a **gentleman's agreement**:
> the compiler warns you, but the generated JavaScript code has no
> `private` anymore. The field is a completely normal property.
>
> This design decision follows from TypeScript's core principle:
> **no runtime overhead**. TypeScript adds no code that enforces
> access control at runtime.

> **Explain to yourself:** Why is `private` in TypeScript NOT the same
> as `#private` in JavaScript? What happens to `private` after compiling?
> And what remains of `#private`?
>
> **Key points:** TypeScript `private` → removed (type erasure) |
> JavaScript `#private` → stays in the JS code | `#private` is real encapsulation |
> `private` is only a compiler directive

<!-- /depth -->

---

## JavaScript's true private: #private (ES2022)

<!-- section:summary -->
Since ES2022, JavaScript offers `#private` fields — real runtime encapsulation that cannot be bypassed even with `(obj as any)`.
<!-- depth:standard -->
Since ES2022, JavaScript has a **real** private syntax: the hash sign.
Unlike TypeScript's `private`, `#` persists at runtime:

```typescript annotated
class VaultAccount {
  #secret: string;
  // ^ #private: Exists at runtime as a true private field.
  //   Not even accessible with (obj as any)!

  constructor(secret: string) {
    this.#secret = secret;
  }

  reveal(): string {
    return this.#secret;
    // ^ Access only possible within the class
  }
}

const vault = new VaultAccount("top-secret");
// vault.#secret;           // Syntax error (at runtime too!)
// (vault as any).#secret;  // Syntax error — cannot be bypassed!
// (vault as any)["#secret"] // undefined — the name is not a normal key
console.log(vault.reveal());  // "top-secret"
```

### TypeScript private vs JavaScript #private

| Feature | `private` (TS) | `#private` (JS/TS) |
|---|---|---|
| Accessible with `as any`? | **Yes** | **No** |
| Exists at runtime? | **No** (type erasure) | **Yes** |
| Visible in `JSON.stringify`? | **Yes** | **No** |
| Visible in `for...in`? | **Yes** | **No** |
| Overridable by subclasses? | No (shadowing possible) | No |
| Visible with `Object.keys()`? | **Yes** | **No** |
| Performance? | Normal | Minimally slower |

<!-- depth:vollstaendig -->
> **Think about it:** If TypeScript types disappear at runtime (type erasure,
> Lesson 02), what does that mean for `private`? Is it even useful to use
> `private` if anyone can bypass it with `as any`?
>
> **Answer:** Yes! `private` is a **communication tool**. It tells other
> developers: "This field is an implementation detail. Don't use it."
> The compiler enforces this in your code. And anyone who writes `as any`
> knows they're breaking the rules — that's a conscious risk.
> In most projects, TypeScript's `private` is completely sufficient.

> **Analogy:** TypeScript `private` is a "please do not enter" sign —
> polite, but no lock. JavaScript `#private` is a door with a combination
> lock — no one gets in without the code.

<!-- /depth -->

---

## protected: For the family

<!-- section:summary -->
`protected` allows access within the class and in subclasses, but not from outside — ideal for internal values that need to be visible in inheritance hierarchies.
<!-- depth:standard -->
`protected` is the modifier that causes the most confusion.
It allows access **within the class and in all subclasses** —
but not from outside.

```typescript annotated
class Vehicle {
  protected speed: number = 0;
  // ^ protected: Subclasses can access this

  accelerate(amount: number): void {
    this.speed += amount;
  }
}

class Car extends Vehicle {
  turboBoost(): void {
    this.speed *= 2;
    // ^ OK! Car inherits from Vehicle, so 'protected' is accessible.
  }

  getSpeed(): number {
    return this.speed;
    // ^ OK! Access to protected within a subclass.
  }
}

const car = new Car();
car.accelerate(50);
car.turboBoost();
console.log(car.getSpeed()); // 100
// car.speed;  // ERROR: protected — not accessible from outside
```

<!-- depth:vollstaendig -->
> **Experiment:** Mark a field as `private` and still access it
> via `(obj as any).field`. Then mark the same field as `#field`
> (with hash) and try the same thing. What happens in both
> cases? This demonstrates the difference between compile-time protection
> and runtime protection.

> **Analogy:** `protected` is like a family secret — all
> family members (subclasses) know it, but outsiders don't.

<!-- /depth -->

---

## readonly: Set once, never change

<!-- section:summary -->
`readonly` prevents changes after initialization — combinable with other modifiers for immutable values like IDs and configurations.
<!-- depth:standard -->
`readonly` prevents a field from being changed after initialization.
This is especially useful for IDs, configurations, and other values
that should never change.

```typescript annotated
class Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
  readonly debug: boolean = false;
  // ^ Default value + readonly: Can only be overridden in the constructor.

  constructor(apiUrl: string, maxRetries: number = 3) {
    this.apiUrl = apiUrl;
    this.maxRetries = maxRetries;
    // ^ readonly may be set in the constructor.
  }

  updateUrl(newUrl: string): void {
    // this.apiUrl = newUrl;
    // ^ ERROR: Cannot assign to 'apiUrl' because it is a read-only property.
  }
}
```

You can combine `readonly` with other modifiers:

```typescript
class User {
  private readonly id: string;        // Readable only within the class, never changeable
  protected readonly role: string;    // Readable in subclasses, never changeable
  public readonly createdAt: Date;    // Readable from outside, never changeable

  constructor(id: string, role: string) {
    this.id = id;
    this.role = role;
    this.createdAt = new Date();
  }
}
```

<!-- /depth -->

---

## Getters and Setters: Controlled access

<!-- section:summary -->
Getters and setters using `get`/`set` syntax are methods that look like properties — ideal for validation on changes and computed values.
<!-- depth:standard -->
TypeScript supports **getters** and **setters** with the
`get`/`set` syntax. These are methods that look like properties —
ideal for validation or computed values:

```typescript annotated
class Temperature {
  private _celsius: number;
  // ^ Convention: Underscore for the private backing field

  constructor(celsius: number) {
    this._celsius = celsius;
  }

  get celsius(): number {
    return this._celsius;
    // ^ Getter: Read like a property (temp.celsius)
  }

  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Below absolute zero!");
    }
    this._celsius = value;
    // ^ Setter: Validation on every change
  }

  get fahrenheit(): number {
    return this._celsius * 9/5 + 32;
    // ^ Computed property: No separate field needed
  }
}

const temp = new Temperature(20);
console.log(temp.celsius);    // 20 (calls the getter)
console.log(temp.fahrenheit); // 68 (computed value)
temp.celsius = 100;           // OK (calls the setter)
// temp.celsius = -300;       // Error: Below absolute zero!
```

<!-- depth:vollstaendig -->
> **Analogy:** Getters/setters are like a concierge: you simply ask
> for room service (getter), and it's delivered — but they also check
> whether you're actually a hotel guest (setter validation).

> **Framework reference (Angular):** In Angular services you use
> `private` for internal logic and getters for the public API:
>
> ```typescript
> @Injectable({ providedIn: 'root' })
> class AuthService {
>   private token: string | null = null;
>   readonly isLoggedIn$ = new BehaviorSubject(false);
>
>   get currentUser(): User | null { ... }  // Computed value
>   set token(value: string) { ... }        // With validation
> }
> ```

<!-- /depth -->

---

## Summary: When to use which modifier?

| Situation | Modifier | Reason |
|---|---|---|
| API for external users | `public` (default) | Must be accessible |
| Internal implementation detail | `private` | Hidden from consumers |
| Template for subclasses | `protected` | Extensible, but not public |
| Immutable values | `readonly` | Protection from accidental changes |
| Real runtime encapsulation | `#private` | When `as any` protection is needed |

---

## What you've learned

- **public** is the default modifier — everything without a modifier is public
- **private** is a compile-time protection (type erasure!) — at runtime
  anyone can access it with `as any`
- **#private** (ES2022) is real runtime encapsulation — cannot be bypassed
- **protected** allows access in subclasses, but not from outside
- **readonly** prevents changes after initialization
- **Getters/setters** enable validation and computed properties

> **Explain to yourself:** When writing an Angular service, when would
> you use `private` and when `#private`? What are the pros and
> cons for unit testing?
>
> **Key points:** `private` is more test-friendly (testable with `as any`) |
> `#private` is safer but harder to test |
> In Angular projects, `private` is almost always sufficient |
> `#private` only for real security requirements

**Core concept to remember:** TypeScript's `private` is a promise,
not a fence. JavaScript's `#private` is a fence. Know which one you need.

---

> **Pause point** -- Good moment for a break. You now understand
> how access modifiers work and why `private` ≠ `#private`.
>
> Continue with: [Section 03: Inheritance and Abstract Classes](./03-vererbung-und-abstract.md)