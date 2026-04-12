# Section 5: SOLID with TypeScript

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Repository and Data Access](./04-repository-und-data-access.md)
> Next section: [06 - When No Pattern](./06-wann-kein-pattern.md)

---

## What you'll learn here

- What **SOLID** means — and why it can be expressed more precisely in TypeScript than in Java
- How TypeScript **automatically checks Liskov Substitution** when you use `implements`
- How Angular's Dependency Injection literally implements the "D" in SOLID
- Which SOLID principles are often misapplied — and when less is more

---

## Background: The five principles and their author

In 2002, Robert C. Martin ("Uncle Bob") compiled five design principles that he had
extracted from good (and bad) codebases over the preceding decades. The
acronym SOLID was coined by Michael Feathers, who formed it from Martin's principles.

The principles were formulated for a world without generics, without structural type systems, without
union types. Java and C++ were the target languages. This led to a
particular way of thinking: everything is a class, everything needs an interface, everything is
hierarchical.

In TypeScript, this is only partially true. TypeScript has structural typing — if your
class has the right methods, it *is* the interface, regardless of its name.
TypeScript has generics that enable the Open/Closed Principle often without inheritance
hierarchies. And TypeScript 5.5 has Inferred Type Predicates that make Liskov-compliant
filter operations more idiomatic.

The SOLID principles remain valuable. But in TypeScript, their
implementations often look different from the Java textbook.

> 🧠 **Explain to yourself:** What does "structural type system" mean in the context of
> SOLID? How does that change the way we design interfaces and classes?
> **Key points:** Structural = shape-based, not name-based |
> No explicit `implements` needed for duck typing |
> Interface Segregation becomes simpler |
> Liskov is automatically checked by the compiler

---

## S — Single Responsibility Principle

A class should have exactly one reason to change. In practice this means:
if you change a class because the business logic changes AND because the
database structure changes — then it has two responsibilities.

```typescript annotated
// BAD: A single UserService class does everything
class UserServiceDoesEverything {
  constructor(private db: Database, private emailClient: EmailClient) {}

  async login(email: string, password: string): Promise<User> {
    const user = await this.db.query('SELECT * FROM users WHERE email = ?', email);
    // ^ Direct database access inside the service class
    if (!this.verifyPassword(password, user.passwordHash)) throw new Error('Unauthorized');
    await this.emailClient.send(user.email, 'Welcome!');
    // ^ Email logic here too — five different reasons to change!
    return user;
  }
  // If the DB structure changes -> change this class
  // If email templates change -> change this class
  // If auth logic changes -> change this class
}

// BETTER: Separate classes with clear responsibilities
class UserAuthService {
  // ^ Responsibility: authentication (login, logout, resetPassword)
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly passwordHasher: PasswordHasher,
    // ^ Dependencies as interfaces — not as concrete classes (D!)
  ) {}

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AuthError('User not found');
    if (!await this.passwordHasher.verify(password, user.passwordHash)) {
      throw new AuthError('Wrong password');
    }
    return user;
    // NO email logic here — that is a different responsibility
  }
}

class UserNotificationService {
  // ^ Responsibility: notifications (sendWelcome, sendPasswordReset)
  constructor(private readonly emailClient: EmailClient) {}

  async sendWelcome(user: User): Promise<void> {
    await this.emailClient.send({
      to: user.email,
      subject: 'Welcome!',
      template: 'welcome',
      data: { name: user.name },
    });
  }
}
```

---

## O — Open/Closed Principle

Software entities should be open for extension, but closed for modification.
TypeScript generics make this more elegant than inheritance hierarchies.

```typescript annotated
// Discount hierarchy — extensible without changing existing code
interface DiscountStrategy {
  apply(originalPrice: number): number;
  readonly description: string;
}

class PercentageDiscount implements DiscountStrategy {
  readonly description: string;
  constructor(private readonly percent: number) {
    this.description = `${percent}% discount`;
  }
  apply(price: number): number {
    return price * (1 - this.percent / 100);
  }
}

class FixedAmountDiscount implements DiscountStrategy {
  readonly description: string;
  constructor(private readonly amount: number) {
    this.description = `$${amount} discount`;
  }
  apply(price: number): number {
    return Math.max(0, price - this.amount);
    // ^ Price cannot go negative
  }
}

// OrderCalculator is closed for modification — no matter how many discounts you add
class OrderCalculator {
  calculateTotal(items: CartItem[], discounts: DiscountStrategy[]): number {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return discounts.reduce((price, discount) => discount.apply(price), subtotal);
    // ^ reduce() over all discounts — a new discount only needs to implement DiscountStrategy
  }
}

// Adding a new discount — NO change in OrderCalculator!
class BuyTwoGetOneFreeDiscount implements DiscountStrategy {
  readonly description = 'Buy 2, get 1 free';
  apply(price: number): number { /* ... */ return price; }
}
// OrderCalculator.calculateTotal([...], [new BuyTwoGetOneFreeDiscount()])
// Works immediately — no if/switch, no change in the Calculator
```

---

## L — Liskov Substitution Principle

A subclass must be usable everywhere the base class is used —
**without the behavior changing unexpectedly**.

> **Important:** TypeScript checks with `implements` only the **structural
> compatibility** (all methods present with correct signatures).
> It does NOT check **behavioral correctness**:
> - Stronger preconditions in the subclass (e.g. "width must be > 0")
> - Weaker postconditions (e.g. "area() can return negative values")
> - Violation of invariants (e.g. "a Rectangle that changes its dimensions after an area() call")
>
> These Liskov violations are **runtime problems** that TypeScript CANNOT
> detect. The compiler gives you a false sense of security.

```typescript annotated
interface Shape {
  area(): number;
  perimeter(): number;
}

// CORRECT implementations — satisfy Liskov:
class Circle implements Shape {
  constructor(private readonly radius: number) {}
  area(): number { return Math.PI * this.radius ** 2; }
  perimeter(): number { return 2 * Math.PI * this.radius; }
}

class Rectangle implements Shape {
  constructor(private readonly width: number, private readonly height: number) {}
  area(): number { return this.width * this.height; }
  perimeter(): number { return 2 * (this.width + this.height); }
}

// This function works with ANY Shape:
function printShapeInfo(shape: Shape): void {
  console.log(`Area: ${shape.area().toFixed(2)}`);
  console.log(`Perimeter: ${shape.perimeter().toFixed(2)}`);
}
```

> **The classic Liskov example that TypeScript does NOT detect:**
> ```typescript
> interface Rectangle {
>   setWidth(w: number): void;
>   setHeight(h: number): void;
>   area(): number;
> }
>
> class Square implements Rectangle {
>   private side: number;
>   constructor(side: number) { this.side = side; }
>   setWidth(w: number) { this.side = w; }
>   setHeight(h: number) { this.side = h; } // Also changes width!
>   area(): number { return this.side ** 2; }
> }
> // TypeScript: NO ERROR — all signatures match.
> // Liskov violation: setWidth() implicitly changes height too!
> // A client that calls r.setWidth(5); r.setHeight(3); expects
> // area() === 15, but Square returns 9.
> ```
>
> **Rule of thumb:** `implements` only guarantees that the methods exist.
> That they *behave correctly* is your responsibility.

---

## I — Interface Segregation Principle

Many small, specific interfaces are better than one large "fat" interface.
Clients should not depend on methods they don't use.

```typescript annotated
// BAD: One giant interface — not all implementing classes need everything
interface UserOperations {
  read(): Promise<User>;
  write(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  exportToCsv(): string;        // Really? Every implementation must have this?
  sendNotification(): void;     // This doesn't belong here!
}

// BETTER: Segregated interfaces
interface Readable<T> { findById(id: string): Promise<T | null>; }
interface Writable<T> { save(entity: T): Promise<T>; }
interface Deletable    { delete(id: string): Promise<void>; }

// Combination only when necessary:
interface ReadWriteRepository<T> extends Readable<T>, Writable<T>, Deletable {}
// ^ Read-write-delete repository — only where both are needed

// Read-Only Repository: cache, read replica, reporting
interface ReadOnlyUserRepository extends Readable<User> {}
// This implementation needs NO save() or delete()!

// TypeScript allows intersections for flexible composition:
type AdminRepository = Repository<User> & { exportToCsv(): string };
// ^ Only admin services get exportToCsv — others work with Repository<User>
```

---

## D — Dependency Inversion Principle

High-level modules should not depend on low-level modules. Both should depend on
abstractions. Angular's DI system is the Dependency Inversion Principle
in action.

```typescript annotated
// BAD: Direct dependency on a concrete implementation
class ReportService {
  private readonly db = new PostgresDatabase();
  // ^ High-level (ReportService) depends on low-level (PostgresDatabase)
  // No mocking possible, no testing without a real DB, no swapping without code changes
}

// GOOD: Dependency on abstraction
interface Database {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

class ReportService {
  constructor(private readonly db: Database) {}
  // ^ Depends on the abstraction — can be PostgresDatabase, InMemoryDatabase, MockDatabase

  async generateMonthlyReport(month: number, year: number): Promise<Report> {
    const orders = await this.db.query<Order>(
      'SELECT * FROM orders WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?',
      [month, year],
    );
    return this.calculateReport(orders);
  }
}

// Angular makes DI idiomatic — the 'D' in SOLID as a framework feature:
const DATABASE_TOKEN = new InjectionToken<Database>('Database');

// In the module: convention over configuration
@NgModule({
  providers: [
    { provide: DATABASE_TOKEN, useClass: PostgresDatabase },
    // ^ In tests: useClass: InMemoryDatabase — NO code change in ReportService
  ],
})
class AppModule {}

@Injectable()
class ReportService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
  // ^ inject(DATABASE_TOKEN) instead of inject(PostgresDatabase) — abstraction, not concretion
}
```

> ⚡ **Angular connection:** `inject(DATABASE_TOKEN)` instead of `inject(PostgresDatabase)` is
> literally the D in SOLID. Angular's `InjectionToken` is the interface that
> separates high-level and low-level. In your unit tests you can simply register a different
> provider — without changing the service.

---

## Experiment Box: Spotting SOLID violations

```typescript
// Find all SOLID violations in this code:
class UserController {
  private readonly db = new MySQLConnection('localhost', 'user', 'password', 'myapp');

  async createUser(req: Request): Promise<Response> {
    const data = req.body;
    if (!data.email || !data.email.includes('@')) {
      return { status: 400, body: 'Invalid email' };
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    await this.db.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [data.email, passwordHash],
    );
    await fetch('https://email-service.example.com/send', {
      method: 'POST',
      body: JSON.stringify({ to: data.email, subject: 'Welcome!' }),
    });
    return { status: 201, body: 'Created' };
  }
}

// Answer: All 5 principles violated!
// S: Controller handles validation, hashing, DB access AND email sending
// O: New validation rules require changes to this code
// L: No interface, no substitutability
// I: No separate abstractions for reading/writing
// D: new MySQLConnection() directly in the controller — concrete implementation!
```

---

## What you've learned

- **S** — One class, one reason to change: separate auth, profile, notification
- **O** — Extensible without modification: Strategy Pattern as a TypeScript interface
- **L** — TypeScript checks Liskov automatically with `implements` — wrong signatures -> compile error
- **I** — Many small interfaces are better than one fat one: `Readable<T>`, `Writable<T>`, `Deletable`
- **D** — Angular's DI system *is* the D in SOLID: `InjectionToken` instead of a concrete class

**Core concept:** SOLID principles are not rules you follow blindly — they are
heuristics for the pain of changeability. When you ask yourself "Can I easily
test this?" and "Can I easily change this?" — you're on the right track.

> 🧠 **Explain to yourself:** Which SOLID principle is most strongly linked to testability?
> Why is testability a good indicator of SOLID compliance?
> **Key points:** D (Dependency Inversion) makes mocking possible |
> S (Single Responsibility) keeps tests small and focused |
> Hard to test = bad design signal |
> "If it's hard to test, it's hard to change"

---

> **Pause point** — SOLID is not a dogma, but a useful tool.
> TypeScript checks L automatically, Angular implements D literally.
>
> Continue with: [Section 06: When No Pattern](./06-wann-kein-pattern.md)