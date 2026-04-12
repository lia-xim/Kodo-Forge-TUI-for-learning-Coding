# Section 1: What are Discriminated Unions?

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Pattern Matching](./02-pattern-matching.md)

---

## What you'll learn here

- Why regular union types aren't always enough
- What a **discriminator** (tag property) is
- How TypeScript automatically recognizes the correct type
- The three ingredients of a discriminated union

---

## The problem with regular unions

In lesson 11 you learned type narrowing: `typeof`, the `in` operator,
`instanceof`. That works well for simple cases. But what happens
when you have multiple object types that look similar?

```typescript annotated
// Two message types
type TextMessage = {
  content: string;
  timestamp: Date;
};

type ImageMessage = {
  imageUrl: string;
  width: number;
  height: number;
  timestamp: Date;
};

type Message = TextMessage | ImageMessage;

function displayMessage(msg: Message) {
  // How do we distinguish TextMessage from ImageMessage?
  // "content" in msg? Fragile — what if ImageMessage also gets content?
  // instanceof? Doesn't work — these aren't classes!
}
```

The `in` operator from L11 works here, but it's **fragile**: if
the types change, the logic breaks. There's a better way.

---

## The solution: A tag property

The idea is simple and powerful: **Give each type a property that uniquely
identifies it.**

```typescript annotated
type TextMessage = {
  kind: "text";       // <-- THIS is the discriminator (tag)
  content: string;
  timestamp: Date;
};

type ImageMessage = {
  kind: "image";      // <-- Different literal value = different type
  imageUrl: string;
  width: number;
  height: number;
  timestamp: Date;
};

type Message = TextMessage | ImageMessage;
```

The property `kind` is the **tag**. In each member of the union it has
a **different string literal type**. TypeScript recognizes this
and can automatically narrow:

```typescript annotated
function displayMessage(msg: Message) {
  if (msg.kind === "text") {
    // TypeScript knows here: msg is TextMessage
    console.log(msg.content);      // OK!
    // console.log(msg.imageUrl);  // Error — doesn't exist on TextMessage
  } else {
    // TypeScript knows here: msg is ImageMessage
    console.log(msg.imageUrl);     // OK!
    console.log(`${msg.width}x${msg.height}`);
  }
}
```

> **Explain to yourself:** Why does `msg.kind === "text"` work better than
> `"content" in msg`? What happens when a third message type is added?
> **Key points:** The discriminator is explicit and stable | "in" breaks when properties change | A new tag value is immediately unambiguous

---

## The three ingredients of a Discriminated Union

A Discriminated Union (also: **Tagged Union** or **Sum Type**) requires
exactly three things:

### 1. Common tag property

All members of the union must have a property with the same **name**
but different **literal values**:

```typescript annotated
type Circle = { shape: "circle"; radius: number };
type Rectangle = { shape: "rectangle"; width: number; height: number };
type Triangle = { shape: "triangle"; base: number; height: number };

// "shape" is the tag — each type has a unique value
```

### 2. Union type

The individual types are combined via union:

```typescript annotated
type Shape = Circle | Rectangle | Triangle;
// Shape is the Discriminated Union
```

### 3. Narrowing through the discriminator

TypeScript narrows the type automatically when you check the discriminator:

```typescript annotated
function area(shape: Shape): number {
  switch (shape.shape) {
    case "circle":
      // shape is Circle here
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      // shape is Rectangle here
      return shape.width * shape.height;
    case "triangle":
      // shape is Triangle here
      return (shape.base * shape.height) / 2;
  }
}
```

---

## Why is it called a "discriminator"?

The word comes from mathematics: a **discriminant** distinguishes
different cases. In the quadratic formula, `b^2 - 4ac` decides
whether the equation has zero, one, or two solutions.

In exactly the same way, the tag property decides which type in the union is present.
TypeScript uses the literal value as the **decision criterion**.

> **Terminology mapping:**
> - **Discriminated Union** = Tagged Union = Sum Type
> - **Discriminator** = Tag = the distinguishing property
> - **Variant** = a single member of the union

---

> 💭 **Food for thought:** Imagine you have a chat app with text messages, image messages, and voice messages. How many properties do you need to distinguish all three types using the `in` operator — and how many with a Discriminated Union?
>
> **Answer:** With `in` you check for specific properties like `imageUrl` or `audioDuration` — fragile, because properties can change at any time. With a Discriminated Union, **one** tag property `kind: "text" | "image" | "audio"` is sufficient — stable and self-documenting.

---

## Which values are valid as a discriminator?

The discriminator must be a **literal type**. That means:

```typescript annotated
// String literals (most common):
type A = { type: "a" };

// Number literals:
type B = { code: 200 };
type C = { code: 404 };

// Boolean literals:
type D = { success: true; data: string };
type E = { success: false; error: Error };

// NOT valid as a discriminator:
// type F = { type: string };    // Too broad — not a literal!
// type G = { type: number };    // Also too broad
```

> **Best Practice:** Use **string literals** as the discriminator.
> They are readable, unambiguous, and self-documenting.

---

## Multiple tag properties

TypeScript even supports **multiple discriminators simultaneously**:

```typescript annotated
type ApiResponse =
  | { status: "success"; code: 200; data: unknown }
  | { status: "success"; code: 201; data: unknown }
  | { status: "error"; code: 400; message: string }
  | { status: "error"; code: 500; message: string };

function handle(res: ApiResponse) {
  if (res.status === "error") {
    // res is now { status: "error"; code: 400 | 500; message: string }
    console.log(res.message);

    if (res.code === 500) {
      // res is now { status: "error"; code: 500; message: string }
      console.log("Server error!");
    }
  }
}
```

> **Experiment:** Try the following directly in the TypeScript Playground (typescriptlang.org/play):
>
> ```typescript
> type TextMessage = { kind: "text"; content: string };
> type ImageMessage = { kind: "image"; imageUrl: string; width: number };
> type Message = TextMessage | ImageMessage;
>
> function show(msg: Message) {
>   if (msg.kind === "text") {
>     console.log(msg.content);
>     // What happens when you type msg.imageUrl here?
>   }
> }
> ```
>
> Change `kind: "text"` to `kind: string` in `TextMessage`. What happens to the narrowing? Why?

---

**In your Angular project:** NgRx Actions are nothing more than Discriminated Unions — the `type` string is the discriminator. You've been using this all along without calling it that:

```typescript
// NgRx Actions — a Discriminated Union:
type UserAction =
  | { type: "[User] Load Users" }
  | { type: "[User] Load Users Success"; users: User[] }
  | { type: "[User] Load Users Failure"; error: string };

// The reducer uses switch/case on the discriminator:
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "[User] Load Users":
      return { ...state, loading: true };
    case "[User] Load Users Success":
      // action.users is safely available here!
      return { ...state, loading: false, users: action.users };
    case "[User] Load Users Failure":
      // action.error is safely available here!
      return { ...state, loading: false, error: action.error };
  }
}
```

NgRx popularized the pattern — now you understand the type theory behind it.

---

## What you've learned

- **Discriminated Unions** need three ingredients: a common tag property, a union type definition, and narrowing through the discriminator
- The **discriminator** must be a literal type (string, number, or boolean) — not the broad `string` type
- TypeScript **automatically** narrows the type when you check the discriminator — that's control flow analysis in action
- **String literals** as tags are best practice: readable, unambiguous, self-documenting
- You can **combine multiple discriminators** for even finer distinction

**Core concept:** A Discriminated Union makes the type of a variant explicitly visible in the value — the discriminator is the bridge between runtime checking and compile-time safety.

---

> **Break point:** You now know the basic principle. In the next section
> you'll learn how to cover **all cases** with switch/case — and have TypeScript
> warn you when you miss one.
>
> Next: [Section 02 - Pattern Matching](./02-pattern-matching.md)