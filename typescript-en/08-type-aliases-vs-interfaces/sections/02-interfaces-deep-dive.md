# Section 2: Interfaces Deep Dive

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Type Aliases Deep Dive](./01-type-aliases-deep-dive.md)
> Next section: [03 - The Big Comparison](./03-der-grosse-vergleich.md)

---

## What you'll learn here

- Why **declaration merging** is a feature, not a bug
- How **extends chains** create an inheritance hierarchy for types
- What **implements** means and how classes fulfill interfaces
- When and why you would **reopen** an interface

---

## Interfaces: The Blueprint for Objects

While `type` is an all-purpose tool, `interface` has a clear focus: it describes
the **shape of an object**. Nothing more, nothing less.

```typescript annotated
interface User {
  name: string;
  age: number;
  email: string;
// ^ Three properties. That's all interface "wants" to do: describe object shapes.
}

const user: User = {
  name: "Max",
  age: 30,
  email: "max@example.com",
};
```

Up to this point, `type` and `interface` could be used interchangeably. The real
differences come next.

---

## Declaration Merging — the Killer Feature of interface

Declaration merging is the capability that `type` does NOT have and that makes
`interface` unique. You can declare an interface **multiple times** and TypeScript
**automatically merges** all declarations together:

```typescript annotated
interface Config {
  host: string;
  port: number;
}

// Later in the same scope or in another file:
interface Config {
  database: string;
// ^ No error! TypeScript merges the declarations together.
}

// Config now has ALL three properties:
const config: Config = {
  host: "localhost",
  port: 5432,
  database: "myapp",
// ^ All three are required, even though they were declared in two separate blocks.
};
```

> 📖 **Background: Why did TypeScript introduce declaration merging?**
>
> Declaration merging was introduced in 2012 to solve a very concrete problem:
> **type definitions for existing JavaScript libraries**.
>
> Imagine writing type definitions for jQuery. jQuery has a massive API —
> hundreds of methods. It would be impossible to write everything in a single
> interface. With declaration merging, different files or plugins can add their
> own methods to the jQuery interface.
>
> Express, Mongoose, and Prisma use the same principle today. When you extend
> `express.Request` with your own properties (e.g. `req.user`), you're using
> declaration merging — often without knowing it.

### Declaration Merging with type: Not possible!

```typescript
type Config = { host: string };
// type Config = { database: string };
// ^ Error: Duplicate identifier 'Config'.
// type does NOT allow double declaration!
```

This is the fundamental difference: `type` is a one-time definition.
`interface` is an **extensible** definition.

### In Practice: Extending the Express Request

The most common real-world example of declaration merging:

```typescript annotated
// In your express-app.d.ts:
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
// ^ Adds 'user' to the Express Request.
// Now EVERY req.user exists — without having to rewrite Express.
    }
  }
}

// In your middleware code:
// req.user = { id: "123", role: "admin" };
// TypeScript now knows about req.user!
```

> 🧠 **Explain to yourself:** Why is declaration merging so important for library
> authors? What would the alternative be if declaration merging didn't exist?
> **Key points:** Library defines base interface | User extends it |
> Alternative: generics or wrapper types (less ergonomic) | Module
> augmentation is based on declaration merging

---

## extends — Inheritance for Interfaces

Interfaces can **inherit** from other interfaces (or type aliases!):

```typescript annotated
interface HasId {
  id: string;
}

interface HasTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface User extends HasId, HasTimestamps {
// ^ User inherits from BOTH interfaces. Multiple inheritance is allowed!
  name: string;
  email: string;
}

// User now has: id, createdAt, updatedAt, name, email
const user: User = {
  id: "abc",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "Max",
  email: "max@example.com",
};
```

### extends with type

An interface can even inherit from a type alias — as long as the type alias
describes an object type:

```typescript annotated
type HasRole = {
  role: "admin" | "user" | "guest";
};

interface Employee extends HasRole {
// ^ Interface extends type alias — this works!
  name: string;
  department: string;
}
```

> 💭 **Think about it:** Can an interface inherit from a union type?
> e.g. `interface X extends string | number` — does that work?
>
> **Answer:** No! `extends` only works with object types (and classes).
> A union type is not a single object type. This is another case where
> `type` and `interface` behave differently.

---

## implements — Classes and Interfaces

The `implements` keyword connects the world of types with the world of
classes. It says: "This class MUST have all properties and methods
of this interface."

```typescript annotated
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

interface Loggable {
  log(message: string): void;
}

class UserModel implements Serializable, Loggable {
// ^ The class MUST implement serialize(), deserialize() and log().
// TypeScript checks this at compile time!

  constructor(public name: string, public age: number) {}

  serialize(): string {
    return JSON.stringify({ name: this.name, age: this.age });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.age = parsed.age;
  }

  log(message: string): void {
    console.log(`[UserModel] ${message}`);
  }
}
```

### implements with Type Aliases

Surprise: classes can also implement type aliases — but only if the type alias
describes an object type:

```typescript annotated
type Printable = {
  print(): void;
};

class Report implements Printable {
// ^ Works! As long as the type alias is an object type.
  print(): void {
    console.log("Report printed.");
  }
}

// BUT:
type StringOrNumber = string | number;
// class Bad implements StringOrNumber {}
// ^ Error! Cannot implement a union type.
```

> 📖 **Background: implements vs. extends in classes**
>
> `extends` on classes creates real JavaScript inheritance — the child class
> inherits the code of the parent class. `implements`, on the other hand, is a
> **pure compile-time concept** (type erasure!). It only checks whether the class
> has the correct shape. No code is inherited.
>
> In Java and C#, `implements` (for interfaces) vs. `extends` (for classes)
> is a strict separation. In TypeScript the boundary is blurrier, because
> the type system is structural.

---

## Reopening — Extending Interfaces Deliberately

"Reopening" is declaration merging in practice. Here are the most common use cases:

### 1. Extending Global Types

```typescript annotated
// Extend the Window object with a custom property:
interface Window {
  __APP_CONFIG__: {
    apiUrl: string;
    debug: boolean;
  };
}
// ^ Now TypeScript knows about window.__APP_CONFIG__!

// In your code:
// window.__APP_CONFIG__ = { apiUrl: "/api", debug: true };
```

### 2. Extending Library Types

```typescript annotated
// Extend the Prisma client with custom methods:
declare module '@prisma/client' {
  interface PrismaClient {
    $softDelete(model: string, id: string): Promise<void>;
  }
}
```

### 3. Typing Environment Variables

```typescript annotated
// Type process.env (Node.js):
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

// Now: process.env.DATABASE_URL is string (not string | undefined)
```

> ⚡ **Practical tip:** In Angular projects, reopening is especially useful
> for `@angular/core` extensions and custom service contracts.
> In Next.js projects, it's used for `next-auth` session extensions.

---

## What you've learned

- **Declaration merging** automatically combines multiple interface declarations
- **extends** enables inheritance chains (also with type aliases as the base)
- **implements** connects classes with interfaces (or type aliases)
- **Reopening** extends global and library types

> 🧠 **Explain to yourself:** When is declaration merging an advantage and when
> is it a risk? Imagine two team members declare the same interface in different
> files with conflicting properties — what happens?
> **Key points:** Advantage for libraries and global extensions | Risk when
> uncontrolled | Conflicts produce compile errors for same property names with
> different types | Team conventions matter

**Core concept to remember:** Interfaces are designed for **extensible object types**.
Declaration merging is not a bug — it's the main reason interfaces exist.

---

> **Pause point** — Good moment for a break. You now know the unique
> strengths of both sides.
>
> Continue with: [Section 03: The Big Comparison](./03-der-grosse-vergleich.md)