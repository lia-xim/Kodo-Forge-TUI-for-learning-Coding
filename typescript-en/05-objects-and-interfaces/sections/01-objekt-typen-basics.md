# 01 -- Object Type Basics

> Estimated reading time: ~10 minutes

## What you'll learn here

- How TypeScript describes the "shape" of an object using an **Object Type Literal**
- Why this shape-checking exists at all -- and what it saves you from
- How nested objects are typed and where things quickly get unwieldy
- The fundamental difference between object types in TypeScript and classes in Java/C#
- When inline types make sense and when you should reach for an interface

---

## The Story Behind Object Types

Why do we even need types for objects? JavaScript has had objects for decades
-- and the world keeps turning without them.

> **Origin Story:** When TypeScript emerged at Microsoft in 2012, the biggest
> problem wasn't missing classes or modules -- it was **type-safe object structure**.
> JavaScript developers knew the pattern: you call an API, get an object back,
> and write `response.data.user.naem` (typo!). At runtime: `undefined`. Hours of
> debugging.
>
> Anders Hejlsberg (formerly chief architect of Turbo Pascal and C#) and his team
> wanted to solve exactly that: the compiler should know which properties an object
> has, what types they hold, and when you make a typo. That's the origin of
> Object Type Literals.

This sounds simple. But the consequences are far-reaching: a typed object is not
just a comment -- it's a **contract between the code author and the compiler**.

---

## Why Object Types? The Real Problem

Primitive types (`string`, `number`, `boolean`) describe single values. But real
data almost never comes alone -- it comes as **bundles of related values**.
A user has a name, an email address, and an age. An order has an ID, a customer,
and a list of items.

In JavaScript, these bundles are simply objects. TypeScript gives you the tools to
describe their **shape**.

Consider what happens without types:

```typescript
// Ohne Typen: Kein Schutz
function greetUser(user) {
  return `Hallo, ${user.nane}!`;  // Tippfehler! 'nane' statt 'name'
}
// Laufzeit-Ergebnis: "Hallo, undefined!" -- kein Fehler, nur falsches Verhalten
```

And with types:

```typescript
// Mit Typen: Sofortiger Fehler zur Compile-Zeit
function greetUser(user: { name: string }) {
  return `Hallo, ${user.nane}!`;
  //              ^^^^ FEHLER: Property 'nane' does not exist. Meintest du 'name'?
}
```

The compiler becomes the **first reader of your code** -- and it is incorruptible.

> **Analogy:** Think of a form. The form doesn't dictate WHAT you write in it, but
> it defines WHICH fields exist and what type each field expects (text, number, date).
> Whoever fills out the form must stick to its fields. That's exactly what an object
> type does: it's the form that objects must fill out.

---

## Object Type Literals -- The Syntax in Detail

The simplest way to describe the shape of an object is an
**Object Type Literal** -- you write the structure directly at the point where
the type is expected:

```typescript annotated
// Variable declaration with object type:
let user: { name: string; age: number } = {
//        ^^^^^^^^^^^^^^^^^^^^^^^^^^^ This is the TYPE (the shape/the template)
  name: "Max",
// ^^^^ Property 'name' with type string
  age: 30,
// ^^^ Property 'age' with type number
};
//  ^^^^^^^^^^^^^^^^^^^^^ This is the VALUE (the concrete data)
// TypeScript checks: Does the value match the shape?
// name: "Max" is a string -- matches 'name: string'  ✓
// age: 30 is a number -- matches 'age: number'       ✓
// Everything looks good.
```

The colon in `{ name: string; age: number }` separates the
**property name** from the **property type** -- not key from value.
This is a pure type annotation, not runtime code.

### What TypeScript Actually Checks

When you assign an object to a type-annotated identifier, TypeScript checks:

1. Are **all required properties present**?
2. Does each property have the **correct type**?
3. Are there **unknown extra properties** in a fresh literal? (We'll cover that in Section 04)

```typescript
// Fehlende Property: TypeScript meldet Fehler
let user: { name: string; age: number } = {
  name: "Max",
  // age fehlt! FEHLER: Property 'age' is missing
};

// Falscher Typ: TypeScript meldet Fehler
let user2: { name: string; age: number } = {
  name: "Max",
  age: "dreissig",  // FEHLER: Type 'string' is not assignable to type 'number'
};
```

---

## Nested Objects -- Deep Structures

Objects can contain other objects. The type description mirrors this:

```typescript
let order: {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  items: string[];
} = {
  id: 1,
  customer: { name: "Max", email: "max@test.de" },
  items: ["Buch", "Stift"],
};
```

TypeScript checks every level recursively. Write `customer: { name: 42 }` and you'll
get an error -- because `42` is not a `string`, deep inside the nested object.

> **Experiment:** Write the `order` type above in the TypeScript Playground.
>
> ```typescript
> let order: {
>   id: number;
>   customer: {
>     name: string;
>     email: string;
>   };
>   items: string[];
> } = {
>   id: 1,
>   customer: { name: "Max", email: "max@test.de" },
>   items: ["Buch", "Stift"],
> };
> ```
>
> Then try these variations and observe the error messages:
> 1. Change `items: ["Buch", "Stift"]` to `items: [1, 2]`
> 2. Change `customer: { name: "Max", email: ... }` to `customer: { name: 42, email: ... }`
> 3. Remove `email` from the `customer` object entirely
>
> Observe: TypeScript checks types **recursively** at every nesting level.
> Errors in `customer.name` are just as much errors as errors in `id`.

You can see: deep nesting quickly becomes unwieldy. The type expression is almost
longer than the value itself. That's exactly why **interfaces** and **type aliases**
exist -- they give these structures names. We'll get there in the next section.

> **Think about it:** Why is the type of the `items` property `string[]` and not
> `Array<string>`? Both are equivalent! `string[]` is syntactic sugar for
> `Array<string>`. In object types the shorter form is preferred -- but in Section 06
> (Index Signatures) you'll need the longer form too.
> Remember: same semantics, different spellings. TypeScript allows both.

---

## Self-Explanation Prompt

> 🧠 **Explain to yourself:** What is an Object Type Literal? Why does TypeScript
> catch a typo in `user.nane` when the type is `{ name: string }`? What exactly
> does TypeScript check -- and when?
>
> **Key points:** Object Type Literal = type description of an object's shape |
> Compiler reads the type and knows all valid property names | Access to unknown
> properties = compile-time error | Checking happens on assignment and on access
> -- not at runtime

---

## When Are Inline Object Types Useful?

| Situation | Inline type? |
|-----------|-------------|
| One-time use (e.g. local variable) | Yes |
| Function parameter with 1--2 properties | Yes |
| Same structure used in multiple places | No -- use an interface |
| Complex nested structure | No -- break it down |
| Exported / part of the public API | No -- use a named type |

> **Practical tip:** In Angular services and React components, you'll almost never
> see inline types. They appear most commonly in small helper functions or local
> variables. As soon as you write the same type twice, that's a clear signal:
> name it with an interface or type alias.

---

## Objects in TypeScript vs. Other Languages

If you come from Java, C#, or another nominally typed language, the following point
is crucial -- and it will shape your entire understanding of TypeScript:

```
  Java/C#: Nominal Typing                TypeScript: Structural Typing
  ────────────────────────                ────────────────────────────
  class User {                            // Kein "class" noetig fuer Typen!
    String name;                          let user: { name: string } = {
    int age;                                name: "Max"
  }                                       };

  User u = new User("Max", 30);           // TypeScript prueft die FORM,
  // u MUSS vom Typ User sein             // nicht den NAMEN des Typs
```

In TypeScript you describe **what an object HAS**, not **what an object IS**.
This is a fundamental difference that we'll explain in detail in Section 03
(Structural Typing).

> **Background:** Anders Hejlsberg, chief architect of TypeScript (and previously
> of C# and Delphi), made this decision deliberately. He knew nominal typing from
> C# extremely well -- and for TypeScript he explicitly chose against it. The reason:
> TypeScript must fit into existing JavaScript, and JavaScript has no class-based
> type checks. A `typeof` call only returns `"object"`. Had TypeScript enforced
> nominal types, a large portion of existing JavaScript code would have been
> untypeable. More on this in Section 03.

---

## Framework Reference: Object Types in Angular and React

Object types are the everyday building block in both frameworks:

```typescript
// Angular: Ein Service-Interface inline definieren (selten -- nur fuer einmalige Nutzung)
async function loadConfig(): Promise<{ apiUrl: string; timeout: number }> {
  const response = await fetch("/config.json");
  return response.json();
}

// React: Inline Props fuer eine einfache, einmalig genutzte Komponente
function WelcomeBanner({ name, role }: { name: string; role: string }) {
  return <h1>Willkommen, {name} ({role})!</h1>;
}
```

As soon as you need the same structure in multiple places -- e.g. `{ name: string; role: string }`
in five components -- you'll write an interface instead. That's the logical next step
we'll take in Section 02.

---

## What You've Learned

- **Object Type Literals** describe the "shape" of an object: `{ key: Type; ... }`
- The syntax `name: string` in a type context means "property `name` has type `string`"
- TypeScript checks **completeness** (are all required properties present?),
  **types** (do the value types match?), and **spelling** (no typos in property access)
- Checks happen at **compile time** -- not at runtime
- Nested structures are checked **recursively**, at every level
- For **one-time, simple** structures, inline types are appropriate
- For **reusable** structures, use **interfaces** (next section)
- TypeScript checks the **structure** of an object, not its class name
  (Structural Typing -- the most important difference from Java/C#)

---

> **Core Concept:** An Object Type Literal is a contract. Whoever signs the contract
> (assigns an object to an annotated identifier) must fulfill all its clauses.
> TypeScript is the incorruptible notary.

---

**Pause point:** You've understood the basics of Object Type Literals.
In the next section, we'll give these structures names -- with interfaces.

| [Back to Overview](../README.md) | [Next Section: Interfaces & Declaration -->](02-interfaces-deklaration.md) |