# Section 1: What Are Recursive Types?

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Typing Tree Structures](./02-baumstrukturen-typen.md)

---

## What you'll learn here

- What **self-referencing type definitions** are and why TypeScript allows them
- How to model **LinkedList** and **Tree** as recursive types
- Why every recursive type needs a **base case**
- The difference between **recursion and iteration** at the type level

---

## Recursion: The Oldest Idea in Computer Science
<!-- section:summary -->
Before we write the first line of TypeScript, we need to understand

<!-- depth:standard -->
Before we write the first line of TypeScript, we need to understand
where the idea of recursion comes from — because it's older than any
computer.

<!-- depth:vollstaendig -->
> **Background: Alonzo Church and the Lambda Calculus (1930s)**
>
> In the 1930s — before electronic computers existed —
> the mathematician **Alonzo Church** developed the lambda calculus.
> It was a formal system in which functions could call themselves.
> His student **Stephen Kleene** proved that recursive functions have
> exactly the same computational power as Alan Turing's
> Turing machine. That was a milestone: recursion is not just
> a programming trick — it is a **fundamental form of computation**.
>
> The most well-known recursive definition is probably the Fibonacci sequence:
>
> ```
> fib(0) = 0            ← Base case
> fib(1) = 1            ← Base case
> fib(n) = fib(n-1) + fib(n-2)  ← Self-reference
> ```
>
> This exact structure — **self-reference plus a base case** —
> is what we find again in TypeScript's recursive types.

---

<!-- /depth -->
## Your First Recursive Type: LinkedList
<!-- section:summary -->
A linked list is the simplest recursive data structure:

<!-- depth:standard -->
A linked list is the simplest recursive data structure:
each node points to the next node — which has the same type.

```typescript annotated
type LinkedList<T> = {
  value: T;
  // ^ The current value in this node
  next: LinkedList<T> | null;
  // ^ HERE is the recursion: next has the same type LinkedList<T>
  // ^ | null is the BASE CASE — the end of the list
};

// Create a list: 1 -> 2 -> 3 -> null
const list: LinkedList<number> = {
  value: 1,
  // ^ First node
  next: {
    value: 2,
    // ^ Second node
    next: {
      value: 3,
      // ^ Third node
      next: null,
      // ^ END — the base case
    },
  },
};
```

That is the entire magic: a type that **references itself**,
with a **condition for the end** (here: `| null`).

---

<!-- /depth -->
## Explain It to Yourself: Why Does This Work?
<!-- section:summary -->
The answer: the type references **itself** in its own

<!-- depth:standard -->
> **Explain it to yourself:**
>
> Why is `type LinkedList<T> = { value: T; next: LinkedList<T> | null }`
> a recursive type? What exactly is the base case, and why would
> the type not work without it?
>
> *Take 30 seconds. Formulate the answer in your own words.*

The answer: the type references **itself** in its own
definition (`next: LinkedList<T>`). The `| null` is the base case —
without it there would be no way to terminate the chain, and TypeScript
would report an "infinite type" error.

---

<!-- /depth -->
## Trees: The Next Level
<!-- section:summary -->
A tree is like a list, but each node can have **multiple children**

<!-- depth:standard -->
A tree is like a list, but each node can have **multiple children**
instead of just a single `next`:

```typescript annotated
type TreeNode<T> = {
  value: T;
  // ^ The value of this node
  children: TreeNode<T>[];
  // ^ RECURSION: An array of nodes of the same type
  // ^ The base case is an empty array: []
};

// A file tree:
const fileTree: TreeNode<string> = {
  value: "src",
  children: [
    {
      value: "components",
      children: [
        { value: "Button.tsx", children: [] },
        // ^ Leaf node: children is empty
        { value: "Modal.tsx", children: [] },
      ],
    },
    {
      value: "utils",
      children: [
        { value: "format.ts", children: [] },
      ],
    },
  ],
};
```

Notice the difference from LinkedList:
- **LinkedList:** `next: LinkedList<T> | null` — **one** successor or end
- **TreeNode:** `children: TreeNode<T>[]` — **any number** of successors, end = `[]`

---

<!-- /depth -->
## Think About It: What Happens Without a Base Case?
<!-- section:summary -->
Surprise: TypeScript **accepts** this type! Types are

<!-- depth:standard -->
> **Think about it:**
>
> What happens if you leave out the base case?
>
> ```typescript
> type Infinite<T> = {
>   value: T;
>   next: Infinite<T>;  // No | null!
> };
> ```
>
> Can TypeScript even process this type?
> And: could you ever create an object of this type?

Surprise: TypeScript **accepts** this type! Types are evaluated
**lazily** — the compiler only expands the type when you use it.
But you can **never create a finite object** of this type, because every
`next` requires another object. It's like a mirror reflecting into
a mirror — infinite, but useless in practice.

```typescript
// TypeScript accepts the type definition...
type Infinite<T> = { value: T; next: Infinite<T> };

// ...but you cannot create an object:
// const x: Infinite<number> = { value: 1, next: ??? };
//                                         ^ needs Infinite<number> again!
```

---

<!-- /depth -->
## Recursion vs Iteration at the Type Level
<!-- section:summary -->
In JavaScript you know the difference: a `while` loop (iterative)

<!-- depth:standard -->
In JavaScript you know the difference: a `while` loop (iterative)
vs a function that calls itself (recursive). At the type level this
distinction exists too:

```typescript annotated
// RECURSIVE: A type references itself
type Countdown<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc
    // ^ Base case: when Acc is as long as N, done
    : Countdown<N, [...Acc, unknown]>;
    // ^ Self-reference: calls itself with a larger Acc

// ITERATIVE (Mapped Types): Transforms key by key
type MakeOptional<T> = {
  [K in keyof T]?: T[K];
  // ^ No self-reference — iterates over the keys
};
```

The rule of thumb: **Mapped Types** are iterative (they loop over keys),
**Conditional Types with self-reference** are recursive.

---

<!-- /depth -->
## Experiment: Build Your Own LinkedList

> **Experiment:**
>
> Open a TypeScript file and try the following:
>
> ```typescript
> // 1. Define the LinkedList type
> type LinkedList<T> = {
>   value: T;
>   next: LinkedList<T> | null;
> };
>
> // 2. Create a list with 3 elements
> const numbers: LinkedList<number> = {
>   value: 10,
>   next: {
>     value: 20,
>     next: {
>       value: 30,
>       next: null,
>     },
>   },
> };
>
> // 3. Write a function that collects all values
> function toArray<T>(list: LinkedList<T>): T[] {
>   const result: T[] = [];
>   let current: LinkedList<T> | null = list;
>   while (current !== null) {
>     result.push(current.value);
>     current = current.next;
>   }
>   return result;
> }
>
> console.log(toArray(numbers)); // [10, 20, 30]
> ```
>
> Observe: the **type definition** is recursive, but the
> **traversal** can be iterative (while loop).

---

## Binary Search Tree: A Classic Example
<!-- section:summary -->
A binary search tree has exactly **two** possible children — left

<!-- depth:standard -->
A binary search tree has exactly **two** possible children — left
(smaller) and right (larger):

```typescript annotated
type BST<T> = {
  value: T;
  left: BST<T> | null;
  // ^ Left child: values that are SMALLER
  right: BST<T> | null;
  // ^ Right child: values that are LARGER
} | null;
// ^ The entire tree can be null (empty tree)

// Example:    5
//            /   \
//           3     7
//          / \   / \
//        null 4 6  null

const tree: BST<number> = {
  value: 5,
  left: {
    value: 3,
    left: null,
    right: { value: 4, left: null, right: null },
  },
  right: {
    value: 7,
    left: { value: 6, left: null, right: null },
    right: null,
  },
};
```

---

<!-- /depth -->
## Framework Connection: Recursion in Angular and React

> **In your Angular project** you've probably already used
> recursive structures without calling them that:
>
> ```typescript
> // Angular: Recursive menu structure
> interface MenuItem {
>   label: string;
>   route?: string;
>   children?: MenuItem[];  // ← Recursion!
> }
>
> // The template renders itself recursively:
> // <ng-container *ngFor="let item of items">
> //   <app-menu-item [item]="item"></app-menu-item>
> //   <!-- app-menu-item renders its children again as app-menu-item -->
> // </ng-container>
> ```
>
> **In React** the pattern is just as common:
>
> ```tsx
> // React: Recursive comment component
> interface Comment {
>   id: number;
>   text: string;
>   replies: Comment[];  // ← Recursion!
> }
>
> function CommentThread({ comment }: { comment: Comment }) {
>   return (
>     <div>
>       <p>{comment.text}</p>
>       {comment.replies.map(reply => (
>         <CommentThread key={reply.id} comment={reply} />
>         // ← Component renders ITSELF for replies
>       ))}
>     </div>
>   );
> }
> ```
>
> The types (`MenuItem`, `Comment`) are recursive — and the components
> follow that same recursive structure.

---

## When Are Types NOT Recursive?
<!-- section:summary -->
Not everything that looks nested is recursive. Here is the distinction:

<!-- depth:standard -->
Not everything that looks nested is recursive. Here is the distinction:

```typescript
// NOT recursive — nested, but no self-reference:
type Address = {
  street: string;
  city: string;
  country: { name: string; code: string };
};

// NOT recursive — generic, but no self-reference:
type Wrapper<T> = { value: T };

// RECURSIVE — references itself:
type NestedList<T> = T | NestedList<T>[];
//                       ^^^^^^^^^ Self-reference!

// RECURSIVE — indirect recursion (A → B → A):
type Expression = NumberLiteral | BinaryExpression;
type NumberLiteral = { type: "number"; value: number };
type BinaryExpression = {
  type: "binary";
  left: Expression;   // ← Back to Expression
  right: Expression;  // ← Back to Expression
  op: "+" | "-" | "*" | "/";
};
```

**Remember:** A type is recursive if it refers to itself — directly or indirectly.

---

<!-- /depth -->
## Summary

### What you learned

You've understood the **fundamentals of recursive types**:

- A recursive type **references itself** in its definition
- Every recursive type needs a **base case** (`| null`, `[]`, etc.)
- TypeScript evaluates types **lazily** — that's why self-reference works
- **LinkedList**, **Tree**, and **BST** are the classic examples
- **Mapped Types** are iterative, **Conditional Types with self-reference** are recursive

> **Core concept:** A recursive type is a type that references itself,
> with a base case that marks the end.
> The base case is the decisive difference between
> a useful type and an infinite loop.

---

> **Pause point** — You've mastered the fundamentals! In the next
> section we type real tree structures: JSON, DOM, ASTs, and
> nested menus.
>
> Continue: [Section 02 - Typing Tree Structures](./02-baumstrukturen-typen.md)