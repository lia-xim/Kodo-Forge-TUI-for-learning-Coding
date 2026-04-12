# Cheatsheet: Classes & OOP in TypeScript

Quick reference for Lesson 21.

---

## Class Syntax

```typescript
class User {
  name: string;                   // Field declaration (required in TS)
  readonly id: number;            // Immutable after initialization

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }

  greet(): string {               // Method
    return `Hi, ${this.name}`;
  }
}
```

---

## Parameter Properties (Shorthand)

```typescript
// LONG:
class User {
  public name: string;
  private email: string;
  readonly id: number;
  constructor(name: string, email: string, id: number) {
    this.name = name; this.email = email; this.id = id;
  }
}

// SHORT (identical):
class User {
  constructor(
    public name: string,
    private email: string,
    readonly id: number
  ) {}
}
```

**Rule:** Modifier before the parameter = automatic field declaration + assignment.

---

## Access Modifiers

| Modifier | Class | Subclass | Outside | At Runtime? |
|---|---|---|---|---|
| `public` (default) | Yes | Yes | Yes | — |
| `private` | Yes | No | No | **Removed** (Type Erasure) |
| `protected` | Yes | Yes | No | **Removed** |
| `readonly` | Init | Read | Read | — |
| `#private` (ES2022) | Yes | No | No | **Preserved** (true encapsulation) |

### private vs #private

```typescript
class A {
  private tsPrivate = "accessible via (a as any).tsPrivate";
  #jsPrivate = "NOT accessible, even with as any";
}
```

---

## Inheritance (extends + super)

```typescript
class Animal {
  constructor(public name: string) {}
  speak(): string { return "..."; }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);    // MUST be the first statement!
  }
  override speak(): string { return "Woof!"; }
}
```

**super()** → Call the parent constructor
**super.method()** → Call a parent method
**override** → Explicit override (TS 4.3+, recommended with `noImplicitOverride`)

---

## Abstract Classes

```typescript
abstract class Shape {
  abstract area(): number;           // No body — subclass MUST implement
  describe(): string {                // Concrete code — is inherited
    return `Area: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private r: number) { super(); }
  override area(): number { return Math.PI * this.r ** 2; }
}

// new Shape();  // ERROR: Cannot create instance of abstract class
new Circle(5);   // OK
```

---

## implements (Interface Contract)

```typescript
interface Serializable { serialize(): string; }
interface Loggable { log(msg: string): void; }

class User implements Serializable, Loggable {
  serialize(): string { return JSON.stringify(this); }
  log(msg: string): void { console.log(msg); }
}
```

**Important:** `implements` does NOT inherit code! Structural check only.

---

## Static Members

```typescript
class MathUtils {
  static PI = 3.14159;
  static add(a: number, b: number): number { return a + b; }
}

MathUtils.PI;          // Access without 'new'
MathUtils.add(2, 3);   // 5
```

**this in static:** Refers to the CLASS, not an instance.

---

## Getter / Setter

```typescript
class Temp {
  private _celsius: number;
  constructor(c: number) { this._celsius = c; }

  get celsius(): number { return this._celsius; }
  set celsius(v: number) {
    if (v < -273.15) throw new Error("Too cold!");
    this._celsius = v;
  }
  get fahrenheit(): number { return this._celsius * 9/5 + 32; }
}
```

---

## Singleton Pattern

```typescript
class Config {
  private static instance: Config | null = null;
  private constructor(public readonly apiUrl: string) {}

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config("https://...");
    return Config.instance;
  }
}
```

---

## Factory Pattern

```typescript
class Color {
  private constructor(public r: number, public g: number, public b: number) {}
  static fromHex(hex: string): Color { /* parse + new */ }
  static fromRGB(r: number, g: number, b: number): Color { return new Color(r, g, b); }
}
```

---

## this Binding: Three Solutions

```typescript
class Timer {
  seconds = 0;

  // Problem: method loses this when used as a callback
  tick(): void { this.seconds++; }

  // Solution 1: Arrow field (copy per instance)
  tickSafe = (): void => { this.seconds++; };

  // Solution 2: bind() in constructor
  constructor() { this.tick = this.tick.bind(this); }

  // Solution 3: Arrow wrapper at call site
  start(): void { setInterval(() => this.tick(), 1000); }
}
```

---

## Mixins

```typescript
type Constructor<T = {}> = new (...args: any[]) => T;

function WithTimestamp<T extends Constructor>(Base: T) {
  return class extends Base {
    createdAt = new Date();
  };
}

const TimestampedUser = WithTimestamp(User);
```

---

## Class vs Interface vs Abstract Class

| Feature | Interface | Abstract Class | Class |
|---|---|---|---|
| Can contain code | No | **Yes** (abstract + concrete) | Yes |
| Instantiable | No | No | **Yes** |
| Multiple allowed | **Yes** (implements A, B) | No (extends 1) | No |
| Exists at runtime | No (Type Erasure) | **Yes** | **Yes** |
| instanceof | No | **Yes** | **Yes** |
| Access Modifiers | No | **Yes** | **Yes** |

---

## Decision Guide

| Situation | Recommendation |
|---|---|
| Structure / contract only | Interface |
| Shared code + enforced methods | Abstract Class |
| Finished, instantiable class | Class |
| Multiple sources of code | Mixins or Composition |
| Framework (Angular) | Classes with decorators |
| No this binding needed | Functions / Closures |