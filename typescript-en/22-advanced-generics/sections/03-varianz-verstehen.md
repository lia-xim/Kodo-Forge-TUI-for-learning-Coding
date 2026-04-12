# Section 3: Understanding Variance

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Higher-Order Types](./02-higher-order-types.md)
> Next section: [04 - in/out Modifier](./04-in-out-modifier.md)

---

## What you'll learn here

- What **covariance** is: The subtype relationship is preserved (Cat → Animal becomes Producer<Cat> → Producer<Animal>)
- What **contravariance** is: The subtype relationship is reversed (for function parameters)
- What **invariance** is: No subtype relationship — neither covariant nor contravariant
- Why **variance is the most important property** of generic types

---

## The fundamental question
<!-- section:summary -->
If `Cat` is a subtype of `Animal` (`Cat extends Animal`), what holds

<!-- depth:standard -->
If `Cat` is a subtype of `Animal` (`Cat extends Animal`), what holds
for containers that hold Cat or Animal?

```typescript
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// Cat extends Animal — that's clear.
// But:
// Is Array<Cat> a subtype of Array<Animal>?
// Is Promise<Cat> a subtype of Promise<Animal>?
// Is ((a: Cat) => void) a subtype of ((a: Animal) => void)?
```

The answer to these questions is **variance** — and it differs for
each question.

---

> 📖 **Background: Java's array covariance — a design flaw**
>
> In Java (since version 1.0, 1995) arrays are covariant: `String[]` is
> a subtype of `Object[]`. That sounds logical — an array of strings
> IS an array of objects, right?
>
> The problem shows up when writing:
> ```java
> String[] strings = new String[1];
> Object[] objects = strings;  // Allowed (covariant arrays)
> objects[0] = 42;             // Compiles! Object[] accepts Integer
> // RUNTIME: ArrayStoreException!
> ```
>
> The compiler says "OK", but at runtime it crashes. James Gosling
> (Java's creator) later admitted that covariant mutable arrays
> were a design flaw. He needed them at the time for generic sort()-
> and equals()-methods — Java didn't have generics in 1995 (not until 2004
> with Java 5).
>
> TypeScript learned from this mistake — at least partially. More on that
> in a moment.

---

<!-- /depth -->
## Covariance: The subtype direction is preserved
<!-- section:summary -->
**Covariance** means: If `Cat extends Animal`, then

<!-- depth:standard -->
**Covariance** means: If `Cat extends Animal`, then
`Container<Cat> extends Container<Animal>` also holds. The direction of the
subtype relationship stays the same.

```typescript annotated
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// A Producer GIVES things out — it is covariant.
interface Producer<T> {
  get(): T;
}
// ^^^ T only appears in OUTPUT position (return type).

declare const catProducer: Producer<Cat>;
const animalProducer: Producer<Animal> = catProducer; // OK!
// ^^^ Why? If I expect an animal and get a cat,
//     that's safe — a cat IS an animal.
//     Producer<Cat> "fits" into Producer<Animal>.

// The direction is preserved:
// Cat          extends Animal          → (subtype relationship)
// Producer<Cat> extends Producer<Animal> → (same direction = covariant)
```

**Rule of thumb:** A type is covariant in T when T only appears in
**output positions**: return types, readonly properties,
callback return values.

---

<!-- /depth -->
## Contravariance: The subtype direction is reversed
<!-- section:summary -->
**Contravariance** is the opposite: If `Cat extends Animal`, then

<!-- depth:standard -->
**Contravariance** is the opposite: If `Cat extends Animal`, then
`Handler<Animal> extends Handler<Cat>`. The direction **is reversed**.

```typescript annotated
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// A Consumer TAKES things in — it is contravariant.
type Handler<T> = (item: T) => void;

declare const animalHandler: Handler<Animal>;
const catHandler: Handler<Cat> = animalHandler; // OK!
// ^^^ Why? animalHandler can process ANY animal.
//     So it can also process cats.
//     Handler<Animal> "fits" into Handler<Cat>.

// BUT: The other direction is unsafe!
declare const catOnlyHandler: Handler<Cat>;
// const animalHandler2: Handler<Animal> = catOnlyHandler;
// ^^^ ERROR! catOnlyHandler expects .meow() — a dog doesn't have that!

// The direction is reversed:
// Cat             extends Animal             → (subtype relationship)
// Handler<Animal> extends Handler<Cat>       → (reversed direction = contravariant)
```

> 🧠 **Explain to yourself:** Why is an `Array<Cat>` NOT a safe
> `Array<Animal>` if you can **write** to the array?
>
> **Key points:** Reading is safe (take out a cat → expect an animal → OK) |
> Writing is unsafe (put in a dog → array expects a cat → CRASH) |
> Reading = Output = covariant | Writing = Input = contravariant |
> Both together = no safe subtyping possible

---

<!-- /depth -->
## Invariance: No direction
<!-- section:summary -->
**Invariance** arises when T appears in both input and output positions.

<!-- depth:standard -->
**Invariance** arises when T appears in both input and output positions.
Then there is no safe subtype relationship in either direction.

```typescript annotated
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// MutableBox reads AND writes T — invariant.
interface MutableBox<T> {
  get(): T;          // Output position → wants to be covariant
  set(value: T): void; // Input position → wants to be contravariant
}
// ^^^ Reading requires covariance, writing requires contravariance.
//     Both together = INVARIANT. No subtyping in either direction.

declare const catBox: MutableBox<Cat>;
// const animalBox: MutableBox<Animal> = catBox;
// ^^^ UNSAFE! Someone could call animalBox.set({ name: "Rex" }).
//     That writes a non-Cat object into a Cat box.

declare const animalBox: MutableBox<Animal>;
// const catBox2: MutableBox<Cat> = animalBox;
// ^^^ ALSO UNSAFE! catBox2.get() would return an Animal,
//     but we expect a Cat with .meow().
```

**Arrays are technically invariant** — they have `push` (input) and
index access (output). But TypeScript allows covariant assignment
out of pragmatism. This is a deliberate unsafety.

---

> 🤔 **Think about it:** Function parameters are contravariant. What does that
> mean concretely? If you have a function that expects `(a: Cat) => void`,
> why can you pass a `(a: Animal) => void`?
>
> Hint: Think about the Liskov Substitution Principle — a subtype must be
> usable everywhere the supertype is expected.

---

<!-- /depth -->
## The variance table
<!-- section:summary -->
Here is a summary of all variance kinds:

<!-- depth:standard -->
Here is a summary of all variance kinds:

```typescript annotated
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// COVARIANT (out): Subtype direction is preserved
// Cat extends Animal → Producer<Cat> extends Producer<Animal>
interface Producer<T> { get(): T; }

// CONTRAVARIANT (in): Subtype direction is reversed
// Cat extends Animal → Consumer<Animal> extends Consumer<Cat>
interface Consumer<T> { accept(item: T): void; }

// INVARIANT: No subtype relationship
// MutableBox<Cat> and MutableBox<Animal> are NOT assignable
interface MutableBox<T> { get(): T; set(value: T): void; }

// BIVARIANT: Both directions (unsafe, legacy)
// Only for method parameters WITHOUT strictFunctionTypes
// ^^^ Bivariant is almost always a bug. Enable strictFunctionTypes!
```

| Variance | Direction | When | Position of T |
|---|---|---|---|
| Covariant | preserved | Output only | Return value, readonly property |
| Contravariant | reversed | Input only | Parameter, callback parameter |
| Invariant | none | Input + Output | Mutable property, parameter + return |
| Bivariant | both | Legacy | Method params without strict |

---

> 🔬 **Experiment:** Test in your editor which assignments TypeScript
> allows and which it doesn't:
>
> ```typescript
> interface Animal { name: string; }
> interface Cat extends Animal { meow(): void; }
>
> // ReadonlyArray is covariant (output only):
> const cats: readonly Cat[] = [{ name: "Minka", meow() {} }];
> const animals: readonly Animal[] = cats; // OK or Error?
>
> // Regular Array (Input + Output):
> const cats2: Cat[] = [{ name: "Minka", meow() {} }];
> const animals2: Animal[] = cats2; // OK or Error?
>
> // Function (parameter is input):
> const fn1: (a: Animal) => void = (a) => console.log(a.name);
> const fn2: (c: Cat) => void = fn1; // OK or Error?
> ```
>
> Spoiler: ReadonlyArray is covariant (OK), regular arrays are allowed by TS
> (but technically unsafe), and the function is contravariant (OK).

---

<!-- /depth -->
## Why TypeScript "lies" about arrays
<!-- section:summary -->
TypeScript allows `Cat[] = Animal[]`-style assignments, even though arrays

<!-- depth:standard -->
TypeScript allows `Cat[] = Animal[]`-style assignments, even though arrays
should be invariant. Why?

```typescript annotated
const cats: Cat[] = [{ name: "Minka", meow() { console.log("Meow"); } }];
const animals: Animal[] = cats; // TypeScript: OK!
// ^^^ This is technically unsafe!

animals.push({ name: "Rex" }); // Just an Animal, not a Cat!
cats[1].meow(); // RUNTIME ERROR: meow is not a function
// ^^^ TypeScript lied here. Why?
```

The answer: **Pragmatism**. If arrays were strictly invariant, an enormous
amount of existing JavaScript code would no longer typecheck. Functions
like `Array.prototype.sort` or `Array.prototype.filter` would be barely
usable. TypeScript deliberately chooses unsafety here in favor of
usability.

`ReadonlyArray<T>`, on the other hand, is correctly covariant — you can't
write anything wrong into it when you can only read.

---

<!-- /depth -->
## The framework connection

> 🅰️ **Angular:** With `strictFunctionTypes` (part of `strict: true`)
> Angular enforces correct contravariance for function parameters.
> This means: An `EventEmitter<Cat>` cannot be directly assigned to an
> `EventEmitter<Animal>` when events flow in both directions. In older
> Angular versions (without strict) this was allowed — and led to bugs.
>
> ⚛️ **React:** `React.FC<Props>` is covariant in Props (Props appear
> only in the input position of renders, but the component itself "produces"
> JSX). Hooks like `useState<T>` create invariant state containers:
> you read AND write T.

---

## What you've learned

- **Covariance** (output): Subtype direction is preserved. `Producer<Cat> extends Producer<Animal>`.
  Applies when T is only given out.
- **Contravariance** (input): Subtype direction is reversed. `Handler<Animal> extends Handler<Cat>`.
  Applies when T is only taken in.
- **Invariance** (input + output): No subtype relationship. Mutable containers are invariant.
- **Java's array covariance** was a design flaw — TypeScript repeats it (out of pragmatism).
- `ReadonlyArray<T>` is correctly covariant, `Array<T>` is "unsafely covariant".

> **Core concept:** Variance describes how subtype relationships "flow" through generic
> types. Output position = covariant, input position = contravariant,
> both = invariant. Understanding this is essential for type-safe API design.

---

> ⏸️ **Break point:** Good moment for a short break.
> In the next section you'll learn the `in`/`out` modifiers (TS 4.7),
> which let you explicitly declare variance — instead of having TypeScript
> calculate it.
>
> **Continue:** [Section 04 - in/out Modifier →](./04-in-out-modifier.md)