# Section 6: When No Pattern — YAGNI and Pattern Overengineering

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - SOLID with TypeScript](./05-solid-mit-typescript.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- Why too many patterns are a **sign of bad design** — not good design
- What **YAGNI** (You Ain't Gonna Need It) concretely means and when it applies
- The **Rule of Three** — when you should actually abstract
- Signals that tell you: *now* I need a pattern

---

## Background: The Reaction to Overengineering

Something strange happened in software development in the late 1990s. The GoF book had
been published. Enterprise software exploded. And with it a new religion: patterns
for everything. Factories for factories. Abstract factories for abstract factories.
Strategy objects with a single implementation.

David Heinemeier Hansson (DHH), the creator of Ruby on Rails, watched this with
growing horror. In a legendary 2014 talk he spoke of "Test-Induced Design
Damage" — code so over-abstracted that it was optimized for machines
rather than people. He called the opposite problem "Primitive Obsession": string types for
email addresses, integer types for money amounts.

At the same time the Agile pioneers formulated the **YAGNI principle**: "You Ain't Gonna
Need It." Don't write code for requirements you don't have yet. Don't abstract
for flexibility you'll never use.

This isn't a call for bad code. It's a call for *genuinely* good code:
code that solves today's problems without inventing tomorrow's problems.

> 🧠 **Explain to yourself:** What is the difference between bad code that is simple
> and good code that is simple? How do you tell the difference?
> **Key points:** Good simple code is clear in its intent |
> Bad simple code doesn't fully solve the problem |
> Complexity that solves a problem is OK |
> Complexity that solves no problem is always bad

---

## Pattern Fetishism in Practice

Here is an example you may recognize from real projects. It's not
made up — this is what over-abstracted code actually looks like:

```typescript annotated
// OVERKILL: Design pattern orgy for a simple function
interface FormattingStrategy {
  execute(input: string): string;
}

interface Formatter<TInput, TOutput> {
  format(input: TInput): TOutput;
}

abstract class AbstractUserNameFormatter
  implements Formatter<UserName, FormattedUserName> {
  protected abstract strategy: FormattingStrategy;
  abstract format(name: UserName): FormattedUserName;
}

// Now we also need a factory...
interface FormatterFactory<T extends Formatter<unknown, unknown>> {
  create(): T;
}

class UserNameFormatterFactory implements FormatterFactory<AbstractUserNameFormatter> {
  constructor(
    @Inject(FORMATTING_STRATEGY_TOKEN) private readonly strategy: FormattingStrategy,
  ) {}
  create(): AbstractUserNameFormatter {
    return new ConcreteUserNameFormatter(this.strategy);
  }
}

// 6 classes, 3 interfaces, 2 abstract base classes...
// ...for this:
const formatUserName = (name: string): string => name.trim().toLowerCase();
// ^ One function. Three words. Solves the same problem.
```

The upper variant was actually written. In real projects. By experienced
developers who knew SOLID principles and wanted to apply them. The problem: they
prepared "potentially needed flexibility" for a function that
hasn't changed in three years and probably never will.

> 💭 **Think about it:** What three questions should you ask yourself before introducing a
> pattern? Think before reading on.
>
> **Answer:**
> 1. Have I written this code at least three times in nearly identical form (Rule of Three)?
> 2. Do I concretely need this flexibility today — or only theoretically?
> 3. Can I still explain this code in 2 minutes after the refactoring?

---

## The Rule of Three

Kent Beck formulated it first: The first time — write it directly. The second time —
write it again (notice the duplication). The third time — now abstract.

```typescript annotated
// First use: write it directly
async function getUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data;
}

// Second use: you notice the pattern
async function getOrder(id: string) {
  const response = await fetch(`/api/orders/${id}`);
  const data = await response.json();
  return data;
}

// Third use: NOW abstract — you know what actually repeats
async function fetchById<T>(endpoint: string, id: string): Promise<T> {
  const response = await fetch(`/api/${endpoint}/${id}`);
  // ^ T makes it generic: fetchById<User>('users', id)
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${endpoint}/${id}`);
  return response.json() as Promise<T>;
}

// Now getUser and getOrder can be written idiomatically:
const getUser = (id: string) => fetchById<User>('users', id);
const getOrder = (id: string) => fetchById<Order>('orders', id);
const getProduct = (id: string) => fetchById<Product>('products', id);
// ^ Third use confirms it: the abstraction was right

// Notice the pattern? fetchById is a factory function —
// but only justified at the THIRD use
```

---

## Signals: When Is a Pattern Worthwhile?

TypeScript gives you good hints about when an abstraction pays off:

```typescript annotated
// Signal 1: Three or more nearly identical implementations
// Before abstraction:
class EmailNotifier    { send(msg: Message): void { /* http fetch */ } }
class SMSNotifier      { send(msg: Message): void { /* twilio api */ } }
class PushNotifier     { send(msg: Message): void { /* firebase */ } }
// Three implementations, all have send(Message) -> time for an interface!
interface Notifier { send(message: Message): Promise<void>; }

// Signal 2: You need a test mock
// When you have to write for tests: jest.mock('../services/UserService')
// ... that's a sign: you need an interface and DI
// Not: you need jest.mock()!

// Signal 3: You're violating Open/Closed (ever more if-else or switch)
function handlePayment(type: string): void {
  if (type === 'stripe') { /* ... */ }
  else if (type === 'paypal') { /* ... */ }
  else if (type === 'klarna') { /* ... */ }
  // Fifth method? That's the Open/Closed warning signal
  // -> Now the Strategy Pattern is justified
}

// Signal 4: The compile errors show you the way
// When you add a new logger type and the compiler tells you:
// "switch is not exhaustive — missing case 'file'"
// ... then the compiler is working for you. The pattern pays off.
```

---

## TypeScript's Structural Type System: Composition Over Inheritance

One last important concept: TypeScript's structural type system makes composition
much more natural than in Java. Instead of inheritance hierarchies, you can compose types.

```typescript annotated
// Java mindset in TypeScript (AVOID):
abstract class Animal {
  abstract makeSound(): string;
  move(): string { return 'moving'; }
}
class Dog extends Animal {
  makeSound() { return 'Woof'; }
}
class Cat extends Animal {
  makeSound() { return 'Meow'; }
}
// What about a flying fish? extends Animal AND extends Fish?
// Java: Not possible. TypeScript: Also not with classes.

// TypeScript mindset: composition with interfaces and intersection
interface Swimmable   { swim(): void; }
interface Flyable     { fly(): void; }
interface SoundMaking { makeSound(): string; }

// Type aliases freely combine capabilities:
type Duck = Swimmable & Flyable & SoundMaking;
type FlyingFish = Swimmable & Flyable;

// Implementations with free functions (no class hierarchy needed):
const duckBehavior: Duck = {
  swim: () => console.log('splash'),
  fly:  () => console.log('flutter'),
  makeSound: () => 'Quack',
};
// ^ The structural type system checks: does the object have swim, fly, makeSound?
// No extends needed — that's duck typing with type safety

// When classes are actually useful:
// 1. You need constructor logic and instance state
// 2. You want private properties and methods
// 3. You're working with Angular DI (which expects classes)
// Everything else: interfaces + type aliases + object literals
```

> ⚡ **Angular and React connection:** In Angular you need classes for services,
> components and directives — the framework requires it. In React, classes are
> optional (since hooks) and are increasingly rarely used. TypeScript interfaces
> work excellently in both worlds for props types and service contracts.

---

## Experiment Box: Recognizing and Simplifying Pattern Overengineering

```typescript
// Task: Simplify this code without losing any functionality.
// How many patterns can you remove?

interface CurrencyFormatter {
  format(amount: number): string;
}

class EuroFormatterStrategy implements CurrencyFormatter {
  format(amount: number): string {
    return `${amount.toFixed(2)} EUR`;
  }
}

class USDFormatterStrategy implements CurrencyFormatter {
  format(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}

class FormatterFactory {
  static create(currency: 'EUR' | 'USD'): CurrencyFormatter {
    if (currency === 'EUR') return new EuroFormatterStrategy();
    if (currency === 'USD') return new USDFormatterStrategy();
    throw new Error('Unknown currency');
  }
}

class PriceDisplay {
  private formatter: CurrencyFormatter;
  constructor(currency: 'EUR' | 'USD') {
    this.formatter = FormatterFactory.create(currency);
  }
  display(amount: number): string {
    return this.formatter.format(amount);
  }
}

// Usage:
const display = new PriceDisplay('EUR');
display.display(99.99);  // "99.99 EUR"

// --- SIMPLIFIED (no loss of type safety): ---
const formatCurrency = (amount: number, currency: 'EUR' | 'USD'): string =>
  currency === 'EUR' ? `${amount.toFixed(2)} EUR` : `$${amount.toFixed(2)}`;

formatCurrency(99.99, 'EUR');  // "99.99 EUR"
// One function. 3 lines. Fully type-safe. No pattern.
// Extensible WHEN needed: just add cases.
// YAGNI: Wait until three currencies are needed — THEN Strategy Pattern.
```

---

## What you learned

- **Pattern overengineering** is a real problem — more abstractions mean more
  complexity, not less
- **YAGNI** (You Ain't Gonna Need It) means: write code for today's problems,
  not for possible future requirements
- **Rule of Three**: only abstract at the third nearly identical code block —
  not before
- **Signals for real patterns**: three implementations, test mock needed,
  Open/Closed violation, exhaustive compile errors
- TypeScript's structural type system often makes **composition** more elegant than
  inheritance hierarchies

**Core concept:** The best pattern is often no pattern. A clear function that solves a
concrete problem is more valuable than six classes preparing for an abstract problem.
Wait for the third case, then abstract — and not before.

> 🧠 **Explain to yourself:** You get an assignment: "Build an extensible
> logging system." How do you decide whether to immediately build a Strategy Pattern
> or start directly first?
> **Key points:** How many concrete logging targets exist today? |
> How likely are more? (Concrete, not speculative) |
> Could a simple function with switch be enough? |
> Rule of Three: only abstract at three implementations

---

> **Pause point** — That was the last section of this lesson. You've learned not only
> when to use patterns — but also when to leave them out. That is
> equally important.
>
> Time for the quiz! It tests all six sections.